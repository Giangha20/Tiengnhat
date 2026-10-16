import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import os from 'os';
import type { UserProgress } from '@/types';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
  currentLevel: string;
  avatar?: string;
  createdAt: string;
}

export interface StoredUser extends AuthUser {
  passwordHash: string;
}

export interface StoredSession {
  token: string;
  userId: string;
  createdAt: string;
  expiresAt: string;
}

interface JWTPayload {
  id: string;
  email: string;
  name: string;
  role: string;
  currentLevel: string;
  avatar?: string;
  createdAt: string;
  iat: number;
  exp: number;
}

interface AuthStorage {
  users: Map<string, StoredUser>; // email -> user
  usersById: Map<string, StoredUser>; // id -> user
  sessions: Map<string, StoredSession>; // token -> session
  progress: Map<string, { progress: UserProgress; updatedAt: string }>; // userId -> progress
}

declare global {
  var __nihongoAuth: AuthStorage | undefined;
}

// Secret key for cryptographic JWT signing and verification
const JWT_SECRET =
  process.env.AUTH_SECRET ||
  process.env.NEXTAUTH_SECRET ||
  'nihongo_master_secret_jwt_2026_super_secure_key_vn_jp';

// -----------------------------------------------------------------------------
// JWT Utility functions (RFC 7519 compliant, stateless & zero-dependency)
// -----------------------------------------------------------------------------
function base64UrlEncode(str: string): string {
  return Buffer.from(str)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  return Buffer.from(base64, 'base64').toString('utf-8');
}

export function createJWT(user: AuthUser, expiresInDays: number = 30): string {
  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const exp = now + expiresInDays * 24 * 60 * 60;

  const payload: JWTPayload = {
    id: user.id,
    email: user.email.toLowerCase(),
    name: user.name,
    role: user.role || 'USER',
    currentLevel: user.currentLevel || 'N5',
    avatar: user.avatar || '/images/avatars/sakura.png',
    createdAt: user.createdAt,
    iat: now,
    exp,
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const data = `${encodedHeader}.${encodedPayload}`;

  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(data)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  return `${data}.${signature}`;
}

export function verifyJWT(token: string): JWTPayload | null {
  try {
    if (!token || typeof token !== 'string') return null;
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [encodedHeader, encodedPayload, signature] = parts;
    const data = `${encodedHeader}.${encodedPayload}`;

    const expectedSignature = crypto
      .createHmac('sha256', JWT_SECRET)
      .update(data)
      .digest('base64')
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');

    if (signature !== expectedSignature) {
      return null;
    }

    const payload = JSON.parse(base64UrlDecode(encodedPayload)) as JWTPayload;
    const now = Math.floor(Date.now() / 1000);

    if (payload.exp && payload.exp < now) {
      return null; // Expired
    }

    return payload;
  } catch {
    return null;
  }
}

// -----------------------------------------------------------------------------
// Storage management (Multi-tier: Primary local data folder -> Fallback OS tmp)
// -----------------------------------------------------------------------------
function getStorageDirectory(): string {
  try {
    const projectDataDir = path.join(process.cwd(), 'data', 'auth');
    if (!fs.existsSync(projectDataDir)) {
      fs.mkdirSync(projectDataDir, { recursive: true });
    }
    return projectDataDir;
  } catch {
    return os.tmpdir();
  }
}

const getFilePath = (name: string) => path.join(getStorageDirectory(), `nihongo_${name}.json`);

function loadStorage(): AuthStorage {
  if (globalThis.__nihongoAuth) {
    return globalThis.__nihongoAuth;
  }

  const storage: AuthStorage = {
    users: new Map(),
    usersById: new Map(),
    sessions: new Map(),
    progress: new Map(),
  };

  try {
    const usersFile = getFilePath('users');
    if (fs.existsSync(usersFile)) {
      const data = JSON.parse(fs.readFileSync(usersFile, 'utf-8')) as StoredUser[];
      for (const u of data) {
        storage.users.set(u.email.toLowerCase(), u);
        storage.usersById.set(u.id, u);
      }
    }

    const sessionsFile = getFilePath('sessions');
    if (fs.existsSync(sessionsFile)) {
      const data = JSON.parse(fs.readFileSync(sessionsFile, 'utf-8')) as StoredSession[];
      for (const s of data) {
        if (new Date(s.expiresAt) > new Date()) {
          storage.sessions.set(s.token, s);
        }
      }
    }

    const progressFile = getFilePath('user_progress');
    if (fs.existsSync(progressFile)) {
      const data = JSON.parse(fs.readFileSync(progressFile, 'utf-8')) as Record<
        string,
        { progress: UserProgress; updatedAt: string }
      >;
      for (const [k, v] of Object.entries(data)) {
        storage.progress.set(k, v);
      }
    }
  } catch (err) {
    console.warn('Cảnh báo nạp bộ nhớ auth:', err);
  }

  globalThis.__nihongoAuth = storage;
  return storage;
}

function persistStorage(storage: AuthStorage) {
  try {
    const usersList = Array.from(storage.users.values());
    fs.writeFileSync(getFilePath('users'), JSON.stringify(usersList, null, 2), 'utf-8');

    const sessionsList = Array.from(storage.sessions.values()).filter(
      (s) => new Date(s.expiresAt) > new Date()
    );
    fs.writeFileSync(getFilePath('sessions'), JSON.stringify(sessionsList, null, 2), 'utf-8');

    const progressObj: Record<string, { progress: UserProgress; updatedAt: string }> = {};
    storage.progress.forEach((val, key) => {
      progressObj[key] = val;
    });
    fs.writeFileSync(getFilePath('user_progress'), JSON.stringify(progressObj, null, 2), 'utf-8');
  } catch (err) {
    console.warn('Cảnh báo ghi bộ nhớ auth ra đĩa:', err);
  }
}

// -----------------------------------------------------------------------------
// Authentication Functions
// -----------------------------------------------------------------------------

// 1. Find user by email
export async function findUserByEmail(email: string): Promise<StoredUser | null> {
  const storage = loadStorage();
  const user = storage.users.get(email.trim().toLowerCase());
  return user || null;
}

// 2. Find user by ID
export async function findUserById(id: string): Promise<StoredUser | null> {
  const storage = loadStorage();
  const user = storage.usersById.get(id);
  return user || null;
}

// 3. Register new user
export async function registerUser(
  name: string,
  email: string,
  password: string
): Promise<{ success: boolean; user?: AuthUser; token?: string; error?: string }> {
  const cleanEmail = email.trim().toLowerCase();
  const cleanName = name.trim();

  if (!cleanName || cleanName.length < 2) {
    return { success: false, error: 'Họ tên phải có ít nhất 2 ký tự.' };
  }

  if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
    return { success: false, error: 'Email không đúng định dạng hợp lệ.' };
  }

  if (!password || password.length < 6) {
    return { success: false, error: 'Mật khẩu phải có tối thiểu 6 ký tự để đảm bảo bảo mật.' };
  }

  const storage = loadStorage();
  if (storage.users.has(cleanEmail)) {
    return { success: false, error: 'Email này đã được sử dụng. Vui lòng đăng nhập hoặc chọn email khác.' };
  }

  const salt = bcrypt.genSaltSync(10);
  const passwordHash = bcrypt.hashSync(password, salt);

  const newUser: StoredUser = {
    id: `usr_${crypto.randomUUID().replace(/-/g, '').slice(0, 16)}`,
    email: cleanEmail,
    name: cleanName,
    role: 'USER',
    currentLevel: 'N5',
    avatar: '/images/avatars/sakura.png',
    passwordHash,
    createdAt: new Date().toISOString(),
  };

  storage.users.set(cleanEmail, newUser);
  storage.usersById.set(newUser.id, newUser);

  const { passwordHash: _, ...safeUser } = newUser;

  // Generate stateless cryptographic JWT token (valid for 30 days)
  const token = createJWT(safeUser, 30);
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

  storage.sessions.set(token, {
    token,
    userId: newUser.id,
    createdAt: new Date().toISOString(),
    expiresAt,
  });

  persistStorage(storage);

  return { success: true, user: safeUser, token };
}

// 4. Login user with registered credentials
export async function loginUser(
  email: string,
  password: string
): Promise<{ success: boolean; user?: AuthUser; token?: string; error?: string }> {
  const cleanEmail = email.trim().toLowerCase();
  const storage = loadStorage();

  let user = storage.users.get(cleanEmail);
  if (!user) {
    // Try reloading fresh users from disk
    try {
      const usersFile = getFilePath('users');
      if (fs.existsSync(usersFile)) {
        const data = JSON.parse(fs.readFileSync(usersFile, 'utf-8')) as StoredUser[];
        for (const u of data) {
          storage.users.set(u.email.toLowerCase(), u);
          storage.usersById.set(u.id, u);
        }
        user = storage.users.get(cleanEmail);
      }
    } catch {}
  }

  if (!user) {
    return {
      success: false,
      error: 'Tài khoản chưa được đăng ký trên hệ thống. Vui lòng bấm vào "Tạo tài khoản mới" bên dưới để đăng ký trước khi đăng nhập!',
    };
  }

  const isValidPassword = bcrypt.compareSync(password, user.passwordHash);
  if (!isValidPassword) {
    return { success: false, error: 'Mật khẩu không chính xác. Vui lòng thử lại.' };
  }

  const { passwordHash: _, ...safeUser } = user;

  // Generate stateless cryptographic JWT token
  const token = createJWT(safeUser, 30);
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

  storage.sessions.set(token, {
    token,
    userId: user.id,
    createdAt: new Date().toISOString(),
    expiresAt,
  });

  persistStorage(storage);

  return { success: true, user: safeUser, token };
}

// 5. Get user from token (validates JWT cryptographically, fallback to memory session)
export async function getUserFromSession(token: string): Promise<AuthUser | null> {
  if (!token) return null;

  // First verify JWT signature statelessly (works across ALL serverless lambdas)
  const jwtPayload = verifyJWT(token);
  if (jwtPayload) {
    const user: AuthUser = {
      id: jwtPayload.id,
      email: jwtPayload.email,
      name: jwtPayload.name,
      role: jwtPayload.role,
      currentLevel: jwtPayload.currentLevel,
      avatar: jwtPayload.avatar || '/images/avatars/sakura.png',
      createdAt: jwtPayload.createdAt,
    };

    // Ensure user exists in memory cache
    const storage = loadStorage();
    if (!storage.usersById.has(user.id)) {
      storage.usersById.set(user.id, { ...user, passwordHash: '' });
      storage.users.set(user.email, { ...user, passwordHash: '' });
    }

    return user;
  }

  // Fallback to stateful session store
  const storage = loadStorage();
  const session = storage.sessions.get(token);
  if (!session) return null;

  if (new Date(session.expiresAt) <= new Date()) {
    storage.sessions.delete(token);
    persistStorage(storage);
    return null;
  }

  const user = storage.usersById.get(session.userId);
  if (!user) return null;

  const { passwordHash: _, ...safeUser } = user;
  if (!safeUser.avatar) {
    safeUser.avatar = '/images/avatars/sakura.png';
  }
  return safeUser;
}

// 6. Logout / Remove session
export async function removeSession(token: string): Promise<boolean> {
  const storage = loadStorage();
  const deleted = storage.sessions.delete(token);
  if (deleted) {
    persistStorage(storage);
  }
  return true;
}

// 7. Save user progress to account on server
export async function saveAccountProgress(userId: string, progress: UserProgress): Promise<void> {
  const storage = loadStorage();
  storage.progress.set(userId, {
    progress,
    updatedAt: new Date().toISOString(),
  });
  persistStorage(storage);
}

// 8. Get user progress from account on server
export async function getAccountProgress(
  userId: string
): Promise<{ progress: UserProgress; updatedAt: string } | null> {
  const storage = loadStorage();
  return storage.progress.get(userId) || null;
}

// 9. Update user avatar
export async function updateUserAvatar(
  userId: string,
  avatar: string
): Promise<{ success: boolean; user?: AuthUser; token?: string; error?: string }> {
  const storage = loadStorage();
  const user = storage.usersById.get(userId);
  if (!user) {
    return { success: false, error: 'Không tìm thấy tài khoản người dùng.' };
  }

  user.avatar = avatar;
  storage.users.set(user.email, user);
  storage.usersById.set(user.id, user);

  const { passwordHash: _, ...safeUser } = user;
  const token = createJWT(safeUser, 30);
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

  storage.sessions.set(token, {
    token,
    userId: user.id,
    createdAt: new Date().toISOString(),
    expiresAt,
  });

  persistStorage(storage);
  return { success: true, user: safeUser, token };
}
