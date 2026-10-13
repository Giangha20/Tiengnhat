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

interface AuthStorage {
  users: Map<string, StoredUser>; // email -> user
  usersById: Map<string, StoredUser>; // id -> user
  sessions: Map<string, StoredSession>; // token -> session
  progress: Map<string, { progress: UserProgress; updatedAt: string }>; // userId -> progress
}

declare global {
  var __nihongoAuth: AuthStorage | undefined;
}

const getFilePath = (name: string) => path.join(os.tmpdir(), `nihongo_${name}.json`);

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

// 3. Register user
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
    passwordHash,
    createdAt: new Date().toISOString(),
  };

  storage.users.set(cleanEmail, newUser);
  storage.usersById.set(newUser.id, newUser);

  // Generate session token (valid for 30 days)
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
  storage.sessions.set(token, {
    token,
    userId: newUser.id,
    createdAt: new Date().toISOString(),
    expiresAt,
  });

  persistStorage(storage);

  const { passwordHash: _, ...safeUser } = newUser;
  return { success: true, user: safeUser, token };
}

// 4. Login user
export async function loginUser(
  email: string,
  password: string
): Promise<{ success: boolean; user?: AuthUser; token?: string; error?: string }> {
  const cleanEmail = email.trim().toLowerCase();
  const storage = loadStorage();

  const user = storage.users.get(cleanEmail);
  if (!user) {
    return { success: false, error: 'Tài khoản không tồn tại. Vui lòng kiểm tra email hoặc đăng ký tài khoản mới.' };
  }

  const isValidPassword = bcrypt.compareSync(password, user.passwordHash);
  if (!isValidPassword) {
    return { success: false, error: 'Mật khẩu không chính xác. Vui lòng thử lại.' };
  }

  // Create session token
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
  storage.sessions.set(token, {
    token,
    userId: user.id,
    createdAt: new Date().toISOString(),
    expiresAt,
  });

  persistStorage(storage);

  const { passwordHash: _, ...safeUser } = user;
  return { success: true, user: safeUser, token };
}

// 5. Get user from session token
export async function getUserFromSession(token: string): Promise<AuthUser | null> {
  if (!token) return null;
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
  return safeUser;
}

// 6. Logout
export async function removeSession(token: string): Promise<boolean> {
  const storage = loadStorage();
  const deleted = storage.sessions.delete(token);
  if (deleted) {
    persistStorage(storage);
  }
  return deleted;
}

// 7. Save user progress to account
export async function saveAccountProgress(userId: string, progress: UserProgress): Promise<void> {
  const storage = loadStorage();
  storage.progress.set(userId, {
    progress,
    updatedAt: new Date().toISOString(),
  });
  persistStorage(storage);
}

// 8. Get user progress from account
export async function getAccountProgress(
  userId: string
): Promise<{ progress: UserProgress; updatedAt: string } | null> {
  const storage = loadStorage();
  return storage.progress.get(userId) || null;
}
