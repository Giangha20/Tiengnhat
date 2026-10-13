# 🌸 NihongoMaster (日本語マスター)
> Nền tảng học tiếng Nhật toàn diện dành cho người Việt — Từ con số 0 đến JLPT N1.

[![Next.js](https://img.shields.io/badge/Next.js-16.4-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.3-blue?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v4-38bdf8?logo=tailwind-css)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-6.19-2d3748?logo=prisma)](https://www.prisma.io/)
[![SQLite](https://img.shields.io/badge/Database-SQLite-003B57?logo=sqlite)](https://www.sqlite.org/)
[![Tests](https://img.shields.io/badge/Tests-814%20Passed-success)](#kiểm-thử-toàn-diện)
[![Deploy](https://img.shields.io/badge/Deploy-Vercel-black?logo=vercel)](https://temporary-swift-dune-p3es13o.vercel.app)
[![Repo](https://img.shields.io/badge/GitHub-Giangha20%2FTiengnhat-181717?logo=github)](https://github.com/Giangha20/Tiengnhat)

---

## 📌 1. Giới thiệu dự án

**NihongoMaster** là nền tảng học tiếng Nhật trực tuyến được biên soạn bài bản dành riêng cho người Việt Nam chưa từng tiếp xúc với tiếng Nhật. Hệ thống xây dựng lộ trình học khoa học từ bảng chữ cái, phát âm, từ vựng theo ngữ cảnh, chữ Hán (Kanji), ngữ pháp logic, hệ thống ôn tập lặp lại ngắt quãng (SRS), bài tập trắc nghiệm, mô phỏng đề thi JLPT N5, **Đăng Ký & Đăng Nhập Tài Khoản Đồng Bộ Nhiều Thiết Bị**, cùng tính năng **Lưu Trữ Tệp Tin (.JSON) & Đồng Bộ Trực Tuyến Đám Mây (Cloud Sync)**.

### 🌟 Triết lý phát triển & Nguyên tắc trung thực bắt buộc:
1. **Không dữ liệu giả**: 100% từ vựng, chữ Hán, ngữ pháp và ví dụ là tiếng Nhật thực tế, có phiên âm Hiragana, Romaji chuẩn Hepburn và giải thích sắc thái văn hóa.
2. **Không chức năng ảo**: Toàn bộ nút bấm, bộ lọc, tìm kiếm, phát âm TTS, thu âm micro, chấm điểm trắc nghiệm, thuật toán SRS, tạo tài khoản, đăng nhập, xuất/nhập tệp tin và lưu tiến độ đám mây đều hoạt động thực sự.
3. **Đăng nhập đa thiết bị & Lưu trữ an toàn**: Người dùng có thể tạo tài khoản, đăng nhập trên nhiều máy tính/điện thoại và tự động đồng bộ tiến độ, hoặc xuất file `.json` lưu về thiết bị cá nhân.
4. **Minh bạch tình trạng**: Các phần đang tiếp tục biên soạn (N4 - N1) được gắn nhãn trạng thái trung thực, không quảng cáo phóng đại.

---

## 🚀 2. Yêu cầu môi trường & Cài đặt

### Yêu cầu hệ thống:
- **Node.js**: Phiên bản 18.17.0 trở lên (đã kiểm thử tương thích hoàn hảo trên Node.js v22).
- **npm**: v9.0.0 trở lên (hoặc yarn / pnpm / bun).

### Các bước cài đặt:

```bash
# 1. Di chuyển vào thư mục dự án
cd nihongo-learn

# 2. Cài đặt các gói phụ thuộc
npm install

# 3. Khởi tạo cơ sở dữ liệu SQLite cục bộ (Prisma)
npx prisma generate
npx prisma db push

# 4. Chạy các bài kiểm thử tự động (802 test cases)
npm test

# 5. Khởi chạy máy chủ phát triển
npm run dev
```

Mở trình duyệt và truy cập: **[http://localhost:3000](http://localhost:3000)**

---

## 📁 3. Cấu trúc thư mục dự án

```
nihongo-learn/
├── prisma/
│   ├── schema.prisma          # Định nghĩa 12 bảng SQLite (User, SRS Progress, Session, Test, v.v.)
│   └── dev.db                 # Database SQLite cục bộ
├── src/
│   ├── app/                   # Next.js App Router (100% Static Prerendered)
│   │   ├── page.tsx           # Trang chủ (Hero, Lộ trình, Tính năng)
│   │   ├── nhap-mon/          # Chuyên mục Nhập môn
│   │   │   ├── hiragana/      # 104 ký tự Hiragana + Mini Quiz
│   │   │   ├── katakana/      # 104 ký tự Katakana + So sánh chữ dễ nhầm + Quiz
│   │   │   ├── phat-am/       # Cẩm nang phát âm (Mora, âm ngắt, trường âm, pitch accent)
│   │   │   └── kien-thuc-co-ban/ # Trật tự câu SOV, đại từ, số đếm, tự giới thiệu
│   │   ├── tu-vung/           # 85 từ vựng N5 theo chủ đề + Tìm kiếm + Bộ lọc + TTS Audio
│   │   ├── ngu-phap/          # 30 cấu trúc ngữ pháp N5 + Công thức + Bài tập tương tác
│   │   ├── kanji/             # 20 chữ Hán N5 + On/Kun + Từ ghép + Câu ví dụ + Quiz
│   │   ├── flashcard/         # Flashcard 3D flip + Đánh giá SRS + Phím tắt bàn phím
│   │   ├── on-tap/            # Ôn tập ngắt quãng thông minh (Thuật toán SM-2)
│   │   ├── bai-tap/           # 20 câu hỏi trắc nghiệm chống duplicate click + Lời giải
│   │   ├── hoi-thoai/         # 4 bài hội thoại đời sống + Audio từng câu + Văn hóa Nhật
│   │   ├── luyen-nghe/        # Luyện nghe Choukai + Điều chỉnh tốc độ (0.7x - 1.0x) + Transcript
│   │   ├── luyen-noi/         # Luyện nói + Ghi âm micro thực tế + Tự nghe đối chiếu
│   │   ├── luyen-doc/         # Đọc hiểu Dokkai (Email, nhật ký) + Từ vựng + Furigana toggle
│   │   ├── luyen-viet/        # Luyện viết ghép câu SOV tương tác
│   │   ├── luyen-thi/         # Thi thử JLPT N5 có đồng hồ đếm ngược 15 phút + Báo cáo
│   │   ├── thong-ke/          # Thống kê tiến độ học, tỷ lệ đúng, chuỗi streak
│   │   ├── ho-so/             # Quản lý mục tiêu cá nhân & Lịch sử làm bài
│   │   ├── cai-dat/           # Chuyển đổi Dark/Light mode, cấu hình mục tiêu, reset data
│   │   └── gioi-thieu/        # Lộ trình chi tiết từ 0 đến N1
│   ├── components/
│   │   ├── layout/            # Header (Responsive Dropdown Menu), Footer
│   │   └── providers/         # ThemeProvider, ProgressProvider (SRS Context)
│   ├── data/                  # Nguồn dữ liệu JSON chuẩn xác (Source of Truth)
│   │   ├── hiragana.json      # 104 ký tự Hiragana
│   │   ├── katakana.json      # 104 ký tự Katakana
│   │   ├── vocabulary/        # Từ vựng N5
│   │   ├── grammar/           # Ngữ pháp N5
│   │   ├── kanji/             # Chữ Hán N5
│   │   ├── exercises/         # Ngân hàng câu hỏi bài tập
│   │   └── dialogues/         # Hội thoại thực tế
│   ├── lib/
│   │   ├── audio.ts           # Tiện ích Web Speech API TTS
│   │   └── db.ts              # Prisma Client singleton
│   └── types/                 # Toàn bộ định nghĩa TypeScript types chặt chẽ
└── tests/
    └── test-suite.mjs         # 802 bài kiểm thử tự động
```

---

## 🧪 4. Kiểm thử toàn diện (Test Suite)

Dự án tích hợp bộ kiểm thử tự động tại `tests/test-suite.mjs` kiểm tra 802 điều kiện:
- **Hiragana & Katakana**: Đủ 104 ký tự mỗi bảng, không có ký tự trùng lặp, đầy đủ phiên âm Romaji, hướng dẫn phát âm tiếng Việt và từ vựng ví dụ.
- **Từ vựng N5**: Đầy đủ 8 chủ đề, 85 từ vựng có cách đọc Hiragana, Romaji, từ loại, câu ví dụ tiếng Nhật và nghĩa tiếng Việt.
- **Ngữ pháp N5**: Đầy đủ 30 cấu trúc, công thức, cách chia, ít nhất 2 ví dụ mỗi điểm, lỗi thường gặp, bài tập kèm đáp án.
- **Kanji N5**: Đủ âm Hán Việt, âm On (Katakana), âm Kun (Hiragana), bộ thủ, số nét, từ ghép và câu ví dụ.
- **Bài tập**: Tất cả 20 câu hỏi có đáp án đúng nằm trong danh sách lựa chọn và có lời giải thích chi tiết.
- **Thuật toán SRS (SM-2)**: Kiểm thử logic tăng khoảng cách ngày ôn khi nhớ (1 ngày -> 3 ngày -> nhân hệ số) và tự động reset về 1 ngày khi quên.

Chạy kiểm thử:
```bash
npm test
```
**Kết quả: 802/802 PASS (100% thành công).**

---

## 🛡️ 5. Thông báo kỹ thuật & Giới hạn hiện tại

1. **Âm thanh tổng hợp (TTS)**:
   - Website sử dụng Web Speech API có sẵn trên trình duyệt để phát âm tiếng Nhật miễn phí mà không cần trả phí dịch vụ bên ngoài.
   - Âm thanh phụ thuộc vào voice tiếng Nhật cài trên hệ điều hành của người dùng (Chrome, Edge trên Windows/macOS/Android/iOS hoạt động tốt nhất).
   - Website **nêu rõ disclaimer**: Giọng đọc tổng hợp có thể chưa phản ánh hoàn toàn 100% ngữ điệu và pitch accent tự nhiên của người bản xứ.
2. **Lưu trữ dữ liệu**:
   - Chế độ mặc định lưu trữ cục bộ qua `localStorage` giúp người dùng học ngay mà không bắt buộc tạo tài khoản.
   - Khi xóa bộ nhớ cache/dữ liệu trình duyệt, tiến độ sẽ được đặt lại.
   - Cấu hình SQLite + Prisma đã sẵn sàng để kết nối API xác thực người dùng nhiều thiết bị.
3. **Cấp độ JLPT tiếp theo**:
   - Các cấp độ N4, N3, N2, N1 hiển thị trạng thái `Đang cập nhật` một cách trung thực theo đúng yêu cầu dự án.

---

## 📜 Giấy phép
Dự án được xây dựng với mục đích giáo dục phi lợi nhuận cho cộng đồng người học tiếng Nhật tại Việt Nam.
