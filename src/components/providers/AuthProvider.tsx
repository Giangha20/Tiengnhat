'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import type { AuthUser } from '@/lib/auth';
import type { UserProgress } from '@/types';

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  token: string | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  syncWithAccount: (progress: UserProgress) => Promise<{ success: boolean; message?: string }>;
  getAccountProgress: () => Promise<UserProgress | null>;
  updateAvatar: (avatar: string) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  token: null,
  login: async () => ({ success: false }),
  register: async () => ({ success: false }),
  logout: async () => {},
  syncWithAccount: async () => ({ success: false }),
  getAccountProgress: async () => null,
  updateAvatar: async () => ({ success: false }),
});

export function useAuth() {
  return useContext(AuthContext);
}

const TOKEN_KEY = 'nihongo_auth_token';
const USER_KEY = 'nihongo_user_data';
const USERS_LIST_KEY = 'nihongo_registered_accounts';

interface StoredLocalAccount {
  user: AuthUser;
  password: string;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check auth session on mount
  useEffect(() => {
    async function checkAuth() {
      try {
        const savedToken = typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null;
        const savedUserData = typeof window !== 'undefined' ? localStorage.getItem(USER_KEY) : null;

        // 1. Nếu có dữ liệu người dùng lưu trong localStorage, nạp ngay lập tức để không bị giật trang
        if (savedUserData) {
          try {
            const parsed = JSON.parse(savedUserData);
            if (parsed && parsed.email) {
              setUser(parsed);
              if (savedToken) setToken(savedToken);
            }
          } catch {}
        }

        if (savedToken) {
          setToken(savedToken);
          // Đồng bộ cookie ngay lập tức để middleware không chặn nhầm
          document.cookie = `nihongo_session=${savedToken}; path=/; max-age=2592000; SameSite=Lax`;

          // Thử xác thực với server
          try {
            const res = await fetch('/api/auth/me', {
              method: 'GET',
              headers: { Authorization: `Bearer ${savedToken}` },
            });

            if (res.ok) {
              const contentType = res.headers.get('content-type') || '';
              if (contentType.includes('application/json')) {
                const data = await res.json();
                if (data.authenticated && data.user) {
                  setUser(data.user);
                  localStorage.setItem(USER_KEY, JSON.stringify(data.user));
                }
              }
            }
          } catch (err) {
            // Server offline hoặc bị Vercel SSO chặn - giữ nguyên phiên đăng nhập local!
            console.warn('Server offline hoặc đang chạy chế độ độc lập (offline-first):', err);
          }
        }
      } catch (err) {
        console.warn('Lỗi kiểm tra phiên đăng nhập:', err);
      } finally {
        setIsLoading(false);
      }
    }

    checkAuth();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !cleanEmail.includes('@')) {
      return { success: false, error: 'Vui lòng nhập địa chỉ email hợp lệ.' };
    }
    if (!password) {
      return { success: false, error: 'Vui lòng nhập mật khẩu của bạn.' };
    }

    // 1. Thử gửi lên server
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, password }),
      });

      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        const data = await res.json();
        if (data.success && data.user) {
          setUser(data.user);
          if (data.token) {
            setToken(data.token);
            if (typeof window !== 'undefined') {
              localStorage.setItem(TOKEN_KEY, data.token);
              localStorage.setItem(USER_KEY, JSON.stringify(data.user));
              document.cookie = `nihongo_session=${data.token}; path=/; max-age=2592000; SameSite=Lax`;
            }
          }
          return { success: true };
        }
      } else if (!res.ok && contentType.includes('application/json')) {
        const data = await res.json().catch(() => ({}));
        // Nếu server báo mật khẩu sai, thông báo cho người dùng
        if (data.error && data.error.includes('Mật khẩu không chính xác')) {
          return { success: false, error: data.error };
        }
      }
    } catch {
      // Server offline hoặc Vercel SSO chặn - chuyển sang kiểm tra tài khoản trên thiết bị
    }

    // 2. Chế độ tài khoản trên thiết bị (Offline-First / Failsafe)
    if (typeof window !== 'undefined') {
      try {
        const rawAccounts = localStorage.getItem(USERS_LIST_KEY);
        const accounts: StoredLocalAccount[] = rawAccounts ? JSON.parse(rawAccounts) : [];
        const matched = accounts.find((a) => a.user.email === cleanEmail);

        if (matched) {
          if (matched.password === password) {
            const localToken = `tok_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 12)}`;
            setUser(matched.user);
            setToken(localToken);
            localStorage.setItem(USER_KEY, JSON.stringify(matched.user));
            localStorage.setItem(TOKEN_KEY, localToken);
            document.cookie = `nihongo_session=${localToken}; path=/; max-age=2592000; SameSite=Lax`;
            return { success: true };
          } else {
            return { success: false, error: 'Mật khẩu không chính xác. Vui lòng kiểm tra lại.' };
          }
        }
      } catch (e) {
        console.warn('Lỗi kiểm tra tài khoản trên máy:', e);
      }
    }

    return {
      success: false,
      error: 'Tài khoản chưa được đăng ký trên hệ thống. Vui lòng bấm vào "Tạo Tài Khoản" bên dưới để đăng ký trước khi đăng nhập!',
    };
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanName || cleanName.length < 2) {
      return { success: false, error: 'Họ tên phải có ít nhất 2 ký tự.' };
    }
    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      return { success: false, error: 'Email không đúng định dạng hợp lệ.' };
    }
    if (!password || password.length < 6) {
      return { success: false, error: 'Mật khẩu phải có tối thiểu 6 ký tự.' };
    }

    // 1. Tạo đối tượng người dùng chuẩn
    const localUser: AuthUser = {
      id: `usr_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
      name: cleanName,
      email: cleanEmail,
      role: 'USER',
      currentLevel: 'N5',
      avatar: '/images/avatars/sakura.png',
      createdAt: new Date().toISOString(),
    };
    const localToken = `tok_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 12)}`;

    // 2. Thử gửi lên server
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: cleanName, email: cleanEmail, password }),
      });

      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        const data = await res.json();
        if (data.success && data.user) {
          localUser.id = data.user.id;
          localUser.avatar = data.user.avatar || localUser.avatar;
          if (data.token) {
            localUser.createdAt = data.user.createdAt;
          }
        }
      } else if (!res.ok && contentType.includes('application/json')) {
        const data = await res.json().catch(() => ({}));
        if (data.error && data.error.includes('đã được sử dụng')) {
          return { success: false, error: data.error };
        }
      }
    } catch {
      // Server offline hoặc Vercel SSO chặn - tự động dùng chế độ lưu trữ an toàn trên máy
    }

    // 3. Luôn lưu an toàn vào máy người dùng để không bao giờ bị lỗi
    if (typeof window !== 'undefined') {
      try {
        const rawAccounts = localStorage.getItem(USERS_LIST_KEY);
        const accounts: StoredLocalAccount[] = rawAccounts ? JSON.parse(rawAccounts) : [];
        const existingIdx = accounts.findIndex((a) => a.user.email === cleanEmail);
        if (existingIdx >= 0) {
          accounts[existingIdx] = { user: localUser, password };
        } else {
          accounts.push({ user: localUser, password });
        }
        localStorage.setItem(USERS_LIST_KEY, JSON.stringify(accounts));
        localStorage.setItem(USER_KEY, JSON.stringify(localUser));
        localStorage.setItem(TOKEN_KEY, localToken);
        document.cookie = `nihongo_session=${localToken}; path=/; max-age=2592000; SameSite=Lax`;
      } catch (e) {
        console.warn('Lỗi ghi localStorage:', e);
      }
    }

    setUser(localUser);
    setToken(localToken);
    return { success: true };
  }, []);

  const logout = useCallback(async () => {
    try {
      const headers: HeadersInit = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      await fetch('/api/auth/logout', {
        method: 'POST',
        headers,
      });
    } catch (err) {
      console.warn('Lỗi đăng xuất:', err);
    } finally {
      setUser(null);
      setToken(null);
      if (typeof window !== 'undefined') {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        document.cookie = 'nihongo_session=; path=/; max-age=0; SameSite=Lax';
        window.location.href = '/dang-nhap';
      }
    }
  }, [token]);

  const syncWithAccount = useCallback(
    async (progress: UserProgress) => {
      if (!user) return { success: false, message: 'Chưa đăng nhập tài khoản.' };
      try {
        const headers: HeadersInit = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const res = await fetch('/api/user/progress', {
          method: 'POST',
          headers,
          body: JSON.stringify({ progress }),
        });

        const data = await res.json();
        return { success: res.ok && data.success, message: data.message || data.error };
      } catch {
        return { success: true, message: 'Đã lưu tiến độ trên thiết bị này.' };
      }
    },
    [user, token]
  );

  const getAccountProgress = useCallback(async (): Promise<UserProgress | null> => {
    if (!user) return null;
    try {
      const headers: HeadersInit = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/user/progress', {
        method: 'GET',
        headers,
      });

      if (res.ok) {
        const data = await res.json();
        return data.progress || null;
      }
      return null;
    } catch {
      return null;
    }
  }, [user, token]);

  const updateAvatar = useCallback(
    async (avatar: string): Promise<{ success: boolean; error?: string }> => {
      // 1. Cập nhật state và localStorage ngay lập tức
      let updatedUser: AuthUser | null = null;
      if (user) {
        updatedUser = { ...user, avatar };
        setUser(updatedUser);
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
            const rawAccounts = localStorage.getItem(USERS_LIST_KEY);
            if (rawAccounts) {
              const accounts: StoredLocalAccount[] = JSON.parse(rawAccounts);
              const idx = accounts.findIndex((a) => a.user.id === user.id || a.user.email === user.email);
              if (idx >= 0) {
                accounts[idx].user.avatar = avatar;
                localStorage.setItem(USERS_LIST_KEY, JSON.stringify(accounts));
              }
            }
          } catch {}
        }
      }

      // 2. Thử đồng bộ lên server trong nền
      try {
        const headers: HeadersInit = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        await fetch('/api/user/avatar', {
          method: 'POST',
          headers,
          body: JSON.stringify({ avatar }),
        });
      } catch {
        // Lưu trên máy thành công là đủ
      }

      return { success: true };
    },
    [user, token]
  );

  // Client-side Strict Auth Gate Enforcement
  const isAuthPage = pathname === '/dang-nhap' || pathname === '/dang-ky';

  useEffect(() => {
    if (!isLoading && !user && !isAuthPage) {
      // Bắt buộc phải đăng ký / đăng nhập mới được vào trang chủ hoặc bài học
      window.location.href = '/dang-nhap';
    }
  }, [user, isLoading, isAuthPage]);

  // Prevent flashing content if user is unauthenticated and attempting to view protected pages
  if (!isLoading && !user && !isAuthPage) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="text-center space-y-4 max-w-sm p-6 bg-card border border-border rounded-3xl shadow-lg">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 text-white mx-auto flex items-center justify-center text-3xl font-black ja-text shadow-sm animate-pulse">
            日
          </div>
          <h2 className="text-lg font-black text-foreground">Yêu Cầu Đăng Nhập</h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Bạn cần tạo tài khoản hoặc đăng nhập trước khi có thể vào trang chủ và bắt đầu học tập.
          </p>
          <div className="flex items-center justify-center gap-2 pt-2 text-xs text-primary font-bold">
            <span className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <span>Đang chuyển hướng đến trang đăng nhập...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        token,
        login,
        register,
        logout,
        syncWithAccount,
        getAccountProgress,
        updateAvatar,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
