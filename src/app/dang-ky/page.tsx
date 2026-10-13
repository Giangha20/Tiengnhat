'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';

export default function DangKyPage() {
  const router = useRouter();
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

    if (!name.trim()) {
      setErrorMsg('Vui lòng nhập họ và tên của bạn.');
      return;
    }

    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Vui lòng nhập địa chỉ email hợp lệ.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Mật khẩu phải có tối thiểu 6 ký tự.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Mật khẩu nhập lại không khớp.');
      return;
    }

    setIsLoading(true);

    const res = await register(name, email, password);
    setIsLoading(false);

    if (res.success) {
      setSuccessMsg('Tạo tài khoản thành công! Đang chuyển hướng đến trang học tập...');
      setTimeout(() => {
        router.push('/ho-so');
      }, 1500);
    } else {
      setErrorMsg(res.error || 'Đăng ký thất bại. Vui lòng kiểm tra lại thông tin.');
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-md w-full space-y-8 bg-card border border-border p-8 sm:p-10 rounded-3xl shadow-lg relative overflow-hidden">
        {/* Glow decoration */}
        <div className="absolute top-0 right-0 w-36 h-36 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2 text-primary font-bold text-lg mb-2">
            <span className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm ja-text">
              日
            </span>
            <span className="text-foreground tracking-tight">NihongoMaster</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            Tạo Tài Khoản Mới
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Lưu trữ tiến độ và học tập đồng bộ trên nhiều thiết bị (máy tính, điện thoại, tablet).
          </p>
        </div>

        {/* Benefits banner */}
        <div className="bg-primary/5 border border-primary/20 rounded-2xl p-3.5 text-xs text-foreground space-y-1.5">
          <p className="font-semibold text-primary flex items-center gap-1.5">
            <span>✨</span> Lợi ích của tài khoản NihongoMaster:
          </p>
          <ul className="text-muted-foreground space-y-1 pl-4 list-disc text-[11px]">
            <li>Đăng nhập nhiều máy, tiến độ tự động cập nhật liên tục</li>
            <li>Lưu trữ toàn bộ thẻ Flashcard SRS và điểm thi JLPT</li>
            <li>Hoàn toàn miễn phí 100%, không quảng cáo làm phiền</li>
          </ul>
        </div>

        {/* Error / Success Notifications */}
        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-error/10 border border-error/30 text-error text-xs font-semibold flex items-center gap-2">
            <span>⚠️</span>
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3.5 rounded-xl bg-success/10 border border-success/30 text-success text-xs font-semibold flex items-center gap-2">
            <span>🎉</span>
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5" htmlFor="full-name">
              Họ và tên
            </label>
            <input
              id="full-name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="VD: Nguyễn Văn An"
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-hidden focus:ring-2 focus:ring-primary/40 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5" htmlFor="email-address">
              Địa chỉ Email
            </label>
            <input
              id="email-address"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tenban@gmail.com"
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-hidden focus:ring-2 focus:ring-primary/40 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5" htmlFor="password-input">
              Mật khẩu (tối thiểu 6 ký tự)
            </label>
            <div className="relative">
              <input
                id="password-input"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-hidden focus:ring-2 focus:ring-primary/40 transition-all pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground p-1"
                title={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5" htmlFor="confirm-password">
              Nhập lại mật khẩu
            </label>
            <input
              id="confirm-password"
              type={showPassword ? 'text' : 'password'}
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-hidden focus:ring-2 focus:ring-primary/40 transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 bg-primary text-primary-foreground font-bold text-sm rounded-xl hover:opacity-90 transition-all shadow-md shadow-primary/20 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2 mt-2"
          >
            {isLoading ? (
              <>
                <span className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                <span>Đang khởi tạo tài khoản...</span>
              </>
            ) : (
              <span>🚀 Tạo Tài Khoản Ngay</span>
            )}
          </button>
        </form>

        {/* Footer Link */}
        <div className="text-center pt-2 border-t border-border/60">
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
