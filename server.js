require("dotenv").config();

const express = require("express");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const admin = require("firebase-admin");


const app = express();
const PORT = Number(process.env.PORT || 3000);

app.use(express.json({ limit: "100kb" }));

/* =========================
   PROTECT PRIVATE FILES BEFORE STATIC SERVING
   ========================= */
app.use((req, res, next) => {
    const requestPath = String(req.path || "").toLowerCase();
    const forbiddenExact = new Set([
        "/.env",
        "/serviceaccountkey.json",
        "/firebase-service-account.json"
    ]);

    if (
        forbiddenExact.has(requestPath) ||
        requestPath.startsWith("/secrets/") ||
        requestPath.includes("firebase-adminsdk") ||
        requestPath.split("/").some(part => part.startsWith("."))
    ) {
        return res.status(404).send("Not found");
    }

    next();
});

app.use(express.static(__dirname, {
    dotfiles: "deny",
    index: "index.html",
    fallthrough: true
}));

/* =========================
   FIREBASE ADMIN
   ========================= */

function findServiceAccount() {
    const candidates = [
        path.join(__dirname, "secrets", "firebase-service-account.json"),
        path.join(__dirname, "firebase-service-account.json"),
        ...fs.readdirSync(__dirname)
            .filter(name =>
                name.toLowerCase().includes("firebase-adminsdk") &&
                name.toLowerCase().endsWith(".json")
            )
            .map(name => path.join(__dirname, name))
    ];

    for (const file of candidates) {
        if (fs.existsSync(file)) return file;
    }
    return null;
}

let firebaseReady = false;
let firebaseAuth = null;

try {
    const serviceAccountFile = findServiceAccount();

    if (serviceAccountFile) {
        const serviceAccount = JSON.parse(
            fs.readFileSync(serviceAccountFile, "utf8")
        );

        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });

        firebaseAuth = admin.auth();
        firebaseReady = true;

        console.log("✅ Firebase Admin: OK");
        console.log(`   Key: ${path.relative(__dirname, serviceAccountFile)}`);
    } else {
        console.log("⚠️ Firebase Admin: CHƯA CẤU HÌNH");
        console.log("   Đặt file Firebase Admin JSON vào thư mục secrets/");
    }
} catch (error) {
    console.error("❌ Firebase Admin lỗi:", error.message);
}

/* =========================
   SMTP
   ========================= */

let transporter = null;
let smtpReady = false;

if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT || 587),
        secure: String(process.env.SMTP_SECURE).toLowerCase() === "true",
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        },
        connectionTimeout: 15000,
        greetingTimeout: 15000,
        socketTimeout: 20000
    });

    transporter.verify()
        .then(() => {
            smtpReady = true;
            console.log("✅ SMTP: OK");
        })
        .catch(error => {
            console.error("❌ SMTP verify thất bại:", error.message);
        });
} else {
    console.log("⚠️ SMTP: CHƯA CẤU HÌNH");
}


/* =========================
   OTP STORAGE
   ========================= */

const otpStore = new Map();
const OTP_TTL_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 5;
const RESEND_COOLDOWN_MS = 60 * 1000;

function normalizeEmail(email) {
    return String(email || "").trim().toLowerCase();
}

function hashOtp(otp) {
    return crypto
        .createHash("sha256")
        .update(String(otp))
        .digest("hex");
}

function makeOtp() {
    return String(crypto.randomInt(0, 1000000)).padStart(6, "0");
}

function cleanupOtpStore() {
    const now = Date.now();
    for (const [email, item] of otpStore.entries()) {
        if (item.expiresAt <= now) otpStore.delete(email);
    }
}

setInterval(cleanupOtpStore, 60 * 1000).unref();

/* =========================
   HEALTH
   ========================= */

app.get("/api/health", (req, res) => {
    res.json({
        success: true,
        firebaseAdmin: firebaseReady,
        smtp: smtpReady,
        port: PORT
    });
});

/* =========================
   REQUEST OTP
   ========================= */

app.post("/api/request-password-otp", async (req, res) => {
    const email = normalizeEmail(req.body.email);

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({
            error: "Email không hợp lệ."
        });
    }

    if (!firebaseReady) {
        return res.status(503).json({
            error: "Server chưa cấu hình Firebase Admin. Hãy đặt file Firebase Admin JSON vào thư mục secrets."
        });
    }

    if (!transporter) {
        return res.status(503).json({
            error: "Server chưa cấu hình Gmail SMTP."
        });
    }

    const previous = otpStore.get(email);
    if (previous && Date.now() - previous.createdAt < RESEND_COOLDOWN_MS) {
        const wait = Math.ceil(
            (RESEND_COOLDOWN_MS - (Date.now() - previous.createdAt)) / 1000
        );
        return res.status(429).json({
            error: `Vui lòng chờ ${wait} giây rồi gửi lại mã OTP.`
        });
    }

    // Do not reveal whether an account exists.
    try {
        await firebaseAuth.getUserByEmail(email);
    } catch (error) {
        if (error.code === "auth/user-not-found") {
            return res.json({
                success: true,
                message: "Nếu email đã đăng ký, mã OTP sẽ được gửi đến email đó."
            });
        }

        console.error("❌ Firebase getUserByEmail:", error.message);
        return res.status(500).json({
            error: "Không thể kiểm tra tài khoản Firebase."
        });
    }

    const otp = makeOtp();

    otpStore.set(email, {
        otpHash: hashOtp(otp),
        createdAt: Date.now(),
        expiresAt: Date.now() + OTP_TTL_MS,
        attempts: 0
    });

    const from = process.env.SMTP_FROM || process.env.SMTP_USER;

    try {
        await transporter.sendMail({
            from,
            to: email,
            subject: "Mã OTP đổi mật khẩu - Tiếng Trung Giang Hà",
            text:
`Xin chào,

Mã OTP để đổi mật khẩu tài khoản Tiếng Trung Giang Hà của bạn là: ${otp}

Mã có hiệu lực trong 10 phút.
Không chia sẻ mã này cho người khác.

Nếu bạn không yêu cầu đổi mật khẩu, hãy bỏ qua email này.`,
            html: `
                <div style="font-family:Arial,sans-serif;line-height:1.6">
                    <h2>Đổi mật khẩu - Tiếng Trung Giang Hà</h2>
                    <p>Mã OTP của bạn là:</p>
                    <div style="font-size:32px;font-weight:bold;letter-spacing:8px">${otp}</div>
                    <p>Mã có hiệu lực trong <b>10 phút</b>.</p>
                    <p>Không chia sẻ mã OTP cho người khác.</p>
                </div>
            `
        });

        console.log(`📧 OTP đã gửi tới ${email}`);

        return res.json({
            success: true,
            message: "Mã OTP đã được gửi. Hãy kiểm tra email."
        });
    } catch (error) {
        otpStore.delete(email);
        console.error("❌ Gửi OTP thất bại:", error.message);

        return res.status(500).json({
            error: "Không thể gửi OTP. Hãy kiểm tra cấu hình Gmail SMTP."
        });
    }
});

/* =========================
   RESET PASSWORD WITH OTP
   ========================= */

app.post("/api/reset-password-with-otp", async (req, res) => {
    const email = normalizeEmail(req.body.email);
    const otp = String(req.body.otp || "").trim();
    const newPassword = String(req.body.newPassword || "");

    if (!email || !otp || !newPassword) {
        return res.status(400).json({
            error: "Vui lòng nhập đầy đủ email, OTP và mật khẩu mới."
        });
    }

    if (!/^\d{6}$/.test(otp)) {
        return res.status(400).json({
            error: "OTP phải gồm đúng 6 chữ số."
        });
    }

    if (newPassword.length < 6) {
        return res.status(400).json({
            error: "Mật khẩu mới phải có ít nhất 6 ký tự."
        });
    }

    if (!firebaseReady) {
        return res.status(503).json({
            error: "Firebase Admin chưa được cấu hình."
        });
    }

    const item = otpStore.get(email);

    if (!item) {
        return res.status(400).json({
            error: "OTP không tồn tại hoặc đã hết hạn. Hãy yêu cầu mã mới."
        });
    }

    if (Date.now() > item.expiresAt) {
        otpStore.delete(email);
        return res.status(400).json({
            error: "OTP đã hết hạn. Hãy yêu cầu mã mới."
        });
    }

    if (item.attempts >= MAX_ATTEMPTS) {
        otpStore.delete(email);
        return res.status(429).json({
            error: "Bạn đã nhập sai OTP quá nhiều lần. Hãy yêu cầu mã mới."
        });
    }

    if (hashOtp(otp) !== item.otpHash) {
        item.attempts += 1;
        return res.status(400).json({
            error: `OTP không đúng. Còn ${Math.max(0, MAX_ATTEMPTS - item.attempts)} lần thử.`
        });
    }

    try {
        const user = await firebaseAuth.getUserByEmail(email);

        await firebaseAuth.updateUser(user.uid, {
            password: newPassword
        });

        otpStore.delete(email);

        console.log(`🔐 Đổi mật khẩu thành công: ${email}`);

        return res.json({
            success: true,
            message: "Đổi mật khẩu thành công. Bạn có thể đăng nhập bằng mật khẩu mới."
        });
    } catch (error) {
        console.error("❌ Đổi mật khẩu thất bại:", error.message);

        return res.status(500).json({
            error: "Không thể đổi mật khẩu Firebase."
        });
    }
});

app.listen(PORT, () => {
    console.log("");
    console.log("==============================================");
    console.log("      HSK + FIREBASE + OTP SERVER");
    console.log("==============================================");
    console.log(`✅ Server: http://localhost:${PORT}`);
    console.log(`✅ Health: http://localhost:${PORT}/api/health`);
    console.log("==============================================");
});
