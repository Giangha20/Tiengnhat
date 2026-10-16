'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/providers/AuthProvider';

export default function DangKyPage() {
  const { register } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const cleanName = name.trim();
    const cleanEmail = email.trim();

    if (!cleanName || cleanName.length < 2) {
      setErrorMsg('Vui lòng nhập họ và tên của bạn (tối thiểu 2 ký tự).');
      return;
    }

    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setErrorMsg('Vui lòng nhập địa chỉ email hợp lệ (ví dụ: tenban@gmail.com).');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Mật khẩu phải có tối thiểu 6 ký tự để đảm bảo bảo mật.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Mật khẩu nhập lại không khớp với mật khẩu đã nhập.');
      return;
    }

    setIsLoading(true);

    const res = await register(cleanName, cleanEmail, password);

    if (res.success) {
      setSuccessMsg('Tạo tài khoản thành công! Đang chuyển hướng vào trang chủ học tập...');
      // Chuyển hướng hard navigation để nạp đầy đủ cookies và session trên mọi thiết bị iOS & Web
      setTimeout(() => {
        window.location.href = '/';
      }, 300);
    } else {
      setIsLoading(false);
      setErrorMsg(res.error || 'Đăng ký thất bại. Vui lòng kiểm tra lại thông tin.');
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="max-w-md w-full space-y-6 bg-card border border-border p-6 sm:p-10 rounded-3xl shadow-xl relative overflow-hidden">
        {/* Glow decoration */}
        <div className="absolute top-0 right-0 w-44 h-44 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-36 h-36 bg-primary/5 rounded-full blur-2xl pointer-events-none" />

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2.5 text-primary font-bold text-lg mb-1">
            <span className="w-10 h-10 rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 text-white flex items-center justify-center font-black text-lg shadow-sm ja-text">
              日
            </span>
            <span className="text-foreground tracking-tight text-xl font-extrabold">NihongoMaster</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
            Tạo Tài Khoản Mới
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Đăng ký để mở khóa trang chủ và lưu trữ tiến độ học tập trên đám mây.
          </p>
        </div>

        {/* Switch Tabs (Đăng Nhập / Đăng Ký) */}
        <div className="grid grid-cols-2 p-1 bg-secondary rounded-2xl border border-border text-xs font-bold">
          <Link
            href="/dang-nhap"
            className="py-2.5 text-center rounded-xl text-muted-foreground hover:text-foreground transition-colors"
          >
            🔑 Đăng Nhập
          </Link>
          <span className="py-2.5 text-center rounded-xl bg-card text-foreground shadow-xs">
            ✨ Tạo Tài Khoản
          </span>
        </div>

        {/* Error / Success Notifications */}
        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-error/10 border border-error/30 text-error text-xs font-semibold flex items-center gap-2 animate-in fade-in">
            <span className="text-base flex-shrink-0">⚠️</span>
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3.5 rounded-xl bg-success/10 border border-success/30 text-success text-xs font-semibold flex items-center gap-2 animate-in fade-in">
            <span className="text-base flex-shrink-0">🎉</span>
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1" htmlFor="full-name">
              Họ và tên
            </label>
            <input
              id="full-name"
              type="text"
              required
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="VD: Nguyễn Văn An"
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-hidden focus:ring-2 focus:ring-primary/40 transition-all placeholder:text-muted-foreground/60"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1" htmlFor="email-address">
              Địa chỉ Email
            </label>
            <input
              id="email-address"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tenban@gmail.com"
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-hidden focus:ring-2 focus:ring-primary/40 transition-all placeholder:text-muted-foreground/60"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1" htmlFor="password-input">
              Mật khẩu (tối thiểu 6 ký tự)
            </label>
            <div className="relative">
              <input
                id="password-input"
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-hidden focus:ring-2 focus:ring-primary/40 transition-all pr-12 placeholder:text-muted-foreground/60"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground p-1 cursor-pointer"
                title={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1" htmlFor="confirm-password">
              Nhập lại mật khẩu
            </label>
            <input
              id="confirm-password"
              type={showPassword ? 'text' : 'password'}
              required
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-hidden focus:ring-2 focus:ring-primary/40 transition-all placeholder:text-muted-foreground/60"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 px-4 bg-primary text-primary-foreground font-bold text-sm rounded-xl hover:opacity-90 transition-all shadow-md shadow-primary/20 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2 mt-1"
          >
            {isLoading ? (
              <>
                <span className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                <span>Đang khởi tạo tài khoản & vào trang chủ...</span>
              </>
            ) : (
              <span>🚀 Tạo Tài Khoản & Vào Học Ngay</span>
            )}
          </button>
        </form>

        {/* Footer Link */}
        <div className="text-center pt-3 border-t border-border/60">
          <p className="text-xs text-muted-foreground">
            Đã có tài khoản?{' '}
            <Link href="/dang-nhap" className="font-bold text-primary hover:underline">
              Đăng nhập tại đây →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
