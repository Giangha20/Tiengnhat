'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from '@/components/providers/ThemeProvider';
import { useAuth } from '@/components/providers/AuthProvider';

interface SubNavItem {
  label: string;
  href: string;
  description?: string;
  icon?: string;
}

interface NavItem {
  label: string;
  href: string;
  children?: SubNavItem[];
}

const NAV_ITEMS: NavItem[] = [
  {
    label: 'Nhập môn',
    href: '/nhap-mon',
    children: [
      { label: 'Bảng Hiragana (104 chữ)', href: '/nhap-mon/hiragana', icon: 'あ' },
      { label: 'Bảng Katakana (104 chữ)', href: '/nhap-mon/katakana', icon: 'ア' },
      { label: 'Quy tắc phát âm & Pitch Accent', href: '/nhap-mon/phat-am', icon: '🗣️' },
      { label: 'Kiến thức đầu tiên & SOV', href: '/nhap-mon/kien-thuc-co-ban', icon: '🎌' },
    ],
  },
  {
    label: 'Từ vựng N5',
    href: '/tu-vung',
  },
  {
    label: 'Ngữ pháp N5',
    href: '/ngu-phap',
  },
  {
    label: 'Kanji N5',
    href: '/kanji',
  },
  {
    label: 'Luyện tập',
    href: '/flashcard',
    children: [
      { label: 'Flashcard từ vựng', href: '/flashcard', icon: '🃏' },
      { label: 'Luyện gõ tiếng Nhật', href: '/luyen-go', icon: '⌨️' },
      { label: 'Ôn tập ngắt quãng (SM-2)', href: '/on-tap', icon: '🔄' },
      { label: 'Bài tập trắc nghiệm', href: '/bai-tap', icon: '✍️' },
      { label: 'Luyện đọc hiểu Dokkai', href: '/luyen-doc', icon: '📑' },
      { label: 'Luyện viết ghép câu', href: '/luyen-viet', icon: '✏️' },
    ],
  },
  {
    label: 'Giao tiếp',
    href: '/hoi-thoai',
    children: [
      { label: 'Hội thoại đời sống thực tế', href: '/hoi-thoai', icon: '💬' },
      { label: 'Luyện nghe Choukai (Có tốc độ)', href: '/luyen-nghe', icon: '🎧' },
      { label: 'Luyện nói & Thu âm micro', href: '/luyen-noi', icon: '🎙️' },
    ],
  },
  {
    label: 'Thi thử JLPT',
    href: '/luyen-thi',
  },
];

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [mobileExpanded, setMobileExpanded] = useState<Record<string, boolean>>({});
  const pathname = usePathname();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { user, isAuthenticated, logout } = useAuth();
  const navRef = useRef<HTMLDivElement | null>(null);

  const isActive = (href: string) =>
    pathname === href || (href !== '/' && pathname?.startsWith(href));

  // Toggle mobile accordion
  const toggleMobileExpand = (href: string) => {
    setMobileExpanded((prev) => ({
      ...prev,
      [href]: !prev[href],
    }));
  };

  // Click outside listener for desktop dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close dropdown on route change
  useEffect(() => {
    setOpenDropdown(null);
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const toggleTheme = () => {
    if (resolvedTheme === 'dark') {
      setTheme('light');
    } else {
      setTheme('dark');
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-md border-b border-border shadow-xs transition-colors">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2" ref={navRef}>
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 text-base sm:text-xl font-bold text-primary hover:opacity-90 transition-opacity select-none shrink-0"
          >
            <span className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 text-white flex items-center justify-center font-bold text-base sm:text-lg ja-text shadow-sm shadow-primary/30">
              日
            </span>
            <span className="font-extrabold tracking-tight text-foreground flex items-center gap-1">
              <span>Nihongo<span className="text-primary">Master</span></span>
              <span className="hidden sm:inline-block text-[9px] uppercase font-black px-1.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                PRO
              </span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1" role="navigation" aria-label="Menu chính">
            {NAV_ITEMS.map((item) => {
              const hasChildren = Boolean(item.children && item.children.length > 0);
              const isItemActive = isActive(item.href);
              const isOpen = openDropdown === item.href;

              return (
                <div
                  key={item.href}
                  className="relative group py-2"
                  onMouseEnter={() => hasChildren && setOpenDropdown(item.href)}
                  onMouseLeave={() => hasChildren && setOpenDropdown(null)}
                >
                  <div className="flex items-center">
                    <Link
                      href={item.href}
                      onClick={() => !hasChildren && setOpenDropdown(null)}
                      className={`
                        px-3.5 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-1.5 select-none
                        ${
                          isItemActive
                            ? 'bg-primary/10 text-primary font-bold'
                            : 'text-foreground/90 hover:bg-secondary hover:text-foreground'
                        }
                      `}
                      aria-current={isItemActive ? 'page' : undefined}
                    >
                      <span>{item.label}</span>
                      {hasChildren && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setOpenDropdown(isOpen ? null : item.href);
                          }}
                          className="p-0.5 hover:bg-background/40 rounded transition-transform"
                          aria-label={`Mở danh mục con của ${item.label}`}
                        >
                          <svg
                            className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180 text-primary' : 'text-muted-foreground'}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                      )}
                    </Link>
                  </div>

                  {/* Desktop Dropdown Menu with Seamless Hover Bridge */}
                  {hasChildren && isOpen && (
                    <div className="absolute top-full left-0 pt-2 z-50 w-64 animate-in fade-in slide-in-from-top-1 duration-150">
                      <div className="bg-card rounded-2xl shadow-xl border border-border p-2 space-y-1 backdrop-blur-md">
                        {item.children?.map((child) => {
                          const isChildActive = pathname === child.href;

                          return (
                            <Link
                              key={child.href}
                              href={child.href}
                              onClick={() => setOpenDropdown(null)}
                              className={`
                                flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors
                                ${
                                  isChildActive
                                    ? 'bg-primary text-primary-foreground shadow-xs'
                                    : 'text-foreground hover:bg-secondary hover:text-primary'
                                }
                              `}
                            >
                              {child.icon && (
                                <span className="w-6 h-6 rounded-lg bg-secondary/80 flex items-center justify-center text-xs ja-text flex-shrink-0">
                                  {child.icon}
                                </span>
                              )}
                              <span>{child.label}</span>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* Right side actions */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 sm:p-2.5 rounded-xl border border-border bg-card hover:bg-secondary text-foreground transition-all shadow-2xs cursor-pointer flex items-center justify-center shrink-0"
              aria-label={resolvedTheme === 'dark' ? 'Chuyển sang chế độ sáng' : 'Chuyển sang chế độ tối'}
              title={resolvedTheme === 'dark' ? 'Chuyển sang giao diện Sáng' : 'Chuyển sang giao diện Tối'}
            >
              {resolvedTheme === 'dark' ? (
                <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              ) : (
                <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                  />
                </svg>
              )}
            </button>

            {/* Quick UI Settings */}
            <Link
              href="/cai-dat"
              className="hidden sm:flex p-2.5 rounded-xl border border-border bg-card hover:bg-secondary text-foreground transition-all shadow-2xs items-center justify-center group cursor-pointer shrink-0"
              aria-label="Cài đặt giao diện & hệ thống"
              title="Cài đặt giao diện Điện thoại, PC & Âm thanh"
            >
              <svg
                className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-transform group-hover:rotate-45"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </Link>

            {/* Auth Actions (Login / Register / User Avatar) */}
            {isAuthenticated && user ? (
              <Link
                href="/ho-so"
                className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl border border-primary/30 bg-primary/10 hover:bg-primary/20 text-foreground transition-all text-xs font-bold shrink-0"
                title="Hồ sơ học tập của bạn"
              >
                <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[10px] font-black">
                  {user.name.charAt(0).toUpperCase()}
                </span>
                <span className="hidden sm:inline max-w-[90px] truncate">{user.name}</span>
              </Link>
            ) : (
              <div className="flex items-center gap-1.5 shrink-0">
                <Link
                  href="/dang-nhap"
                  className="px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold bg-primary/10 text-primary hover:bg-primary/20 transition-all flex items-center gap-1"
                >
                  <span>🔑</span>
                  <span className="hidden sm:inline">Đăng nhập</span>
                </Link>
                <Link
                  href="/dang-ky"
                  className="hidden sm:flex px-3 py-1.5 rounded-xl text-xs font-bold bg-primary text-primary-foreground hover:opacity-90 transition-all shadow-xs items-center gap-1"
                >
                  <span>Tạo tài khoản</span>
                </Link>
              </div>
            )}

            {/* Mobile menu hamburger toggle button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 sm:p-2.5 rounded-xl border border-border bg-card hover:bg-secondary text-foreground transition-all cursor-pointer flex items-center justify-center shrink-0"
              aria-label={isMobileMenuOpen ? 'Đóng menu' : 'Mở menu'}
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? (
                <svg className="w-5 h-5 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer with Accordion Sub-items */}
      {isMobileMenuOpen && (
        <nav
          className="lg:hidden border-t border-border bg-card shadow-2xl max-h-[82vh] overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200"
          role="navigation"
          aria-label="Menu di động"
        >
          <div className="max-w-7xl mx-auto px-4 py-4 space-y-2">
            {/* Mobile Auth Status Box */}
            <div className="p-3.5 rounded-2xl bg-secondary/60 border border-border mb-3">
              {isAuthenticated && user ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                    <div>
                      <p className="text-xs font-bold text-foreground">{user.name}</p>
                      <p className="text-[10px] text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      logout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="text-[11px] font-bold text-error hover:underline px-2.5 py-1 rounded-lg bg-error/10 cursor-pointer"
                  >
                    Đăng xuất
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href="/dang-nhap"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="py-2.5 text-center text-xs font-bold rounded-xl border border-border bg-card text-foreground hover:bg-secondary"
                  >
                    🔑 Đăng nhập
                  </Link>
                  <Link
                    href="/dang-ky"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="py-2.5 text-center text-xs font-bold rounded-xl bg-primary text-primary-foreground shadow-xs hover:opacity-90"
                  >
                    🚀 Tạo tài khoản
                  </Link>
                </div>
              )}
            </div>
            {NAV_ITEMS.map((item) => {
              const hasChildren = Boolean(item.children && item.children.length > 0);
              const isExpanded = mobileExpanded[item.href] ?? true; // Default expanded for ease of access

              return (
                <div key={item.href} className="border border-border/60 rounded-2xl overflow-hidden bg-background/50">
                  <div className="flex items-center justify-between p-2">
                    <Link
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`
                        flex-1 px-3 py-2 rounded-xl text-sm font-bold transition-colors
                        ${isActive(item.href) ? 'text-primary' : 'text-foreground'}
                      `}
                    >
                      {item.label}
                    </Link>

                    {hasChildren && (
                      <button
                        type="button"
                        onClick={() => toggleMobileExpand(item.href)}
                        className="p-2 rounded-lg hover:bg-secondary text-muted-foreground"
                        aria-label="Mở rộng mục con"
                      >
                        <svg
                          className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180 text-primary' : ''}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    )}
                  </div>

                  {/* Mobile Sub-items */}
                  {hasChildren && isExpanded && (
                    <div className="bg-card border-t border-border/40 p-2 space-y-1">
                      {item.children?.map((child) => {
                        const isChildActive = pathname === child.href;

                        return (
                          <Link
                            key={child.href}
                            href={child.href}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className={`
                              flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors
                              ${
                                isChildActive
                                  ? 'bg-primary text-primary-foreground'
                                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                              }
                            `}
                          >
                            {child.icon && (
                              <span className="text-xs ja-text">{child.icon}</span>
                            )}
                            <span>{child.label}</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Quick profile links on mobile */}
            <div className="border-t border-border pt-3 mt-3 grid grid-cols-3 gap-2">
              <Link
                href="/ho-so"
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2.5 rounded-xl border border-border bg-background text-center text-xs font-semibold text-foreground hover:bg-secondary flex flex-col items-center gap-1"
              >
                <span>👤</span>
                <span>Hồ sơ</span>
              </Link>
              <Link
                href="/thong-ke"
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2.5 rounded-xl border border-border bg-background text-center text-xs font-semibold text-foreground hover:bg-secondary flex flex-col items-center gap-1"
              >
                <span>📊</span>
                <span>Thống kê</span>
              </Link>
              <Link
                href="/cai-dat"
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2.5 rounded-xl border border-border bg-background text-center text-xs font-semibold text-foreground hover:bg-secondary flex flex-col items-center gap-1"
              >
                <span>⚙️</span>
                <span>Cài đặt</span>
              </Link>
            </div>
          </div>
        </nav>
      )}
    </header>
  );
}
