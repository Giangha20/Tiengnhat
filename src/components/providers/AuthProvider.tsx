'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
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
});

export function useAuth() {
  return useContext(AuthContext);
}

const TOKEN_KEY = 'nihongo_auth_token';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check auth session on mount
  useEffect(() => {
    async function checkAuth() {
      try {
        const savedToken = typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null;
        if (savedToken) {
          setToken(savedToken);
        }

        const headers: HeadersInit = {};
        if (savedToken) {
          headers['Authorization'] = `Bearer ${savedToken}`;
        }

        const res = await fetch('/api/auth/me', {
          method: 'GET',
          headers,
        });

        if (res.ok) {
          const data = await res.json();
          if (data.authenticated && data.user) {
            setUser(data.user);
          } else {
            setUser(null);
            if (savedToken) localStorage.removeItem(TOKEN_KEY);
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
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setUser(data.user);
        if (data.token) {
          setToken(data.token);
          localStorage.setItem(TOKEN_KEY, data.token);
        }
        return { success: true };
      }
      return { success: false, error: data.error || 'Đăng nhập không thành công.' };
    } catch (err) {
      return { success: false, error: `Lỗi kết nối máy chủ: ${err instanceof Error ? err.message : 'Thử lại sau'}` };
    }
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setUser(data.user);
        if (data.token) {
          setToken(data.token);
          localStorage.setItem(TOKEN_KEY, data.token);
        }
        return { success: true };
      }
      return { success: false, error: data.error || 'Đăng ký không thành công.' };
    } catch (err) {
      return { success: false, error: `Lỗi kết nối máy chủ: ${err instanceof Error ? err.message : 'Thử lại sau'}` };
    }
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
      } catch (err) {
        return { success: false, message: 'Không thể đồng bộ vào tài khoản.' };
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
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
