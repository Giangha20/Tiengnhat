'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUISettings } from '@/components/providers/UISettingsProvider';

interface NavDockItem {
  label: string;
  href: string;
  icon: string | React.ReactNode;
  badge?: string;
}

const DOCK_ITEMS: NavDockItem[] = [
  {
    label: 'Trang chủ',
    href: '/',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
        />
      </svg>
    ),
  },
  {
    label: 'Từ vựng',
    href: '/tu-vung',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
        />
      </svg>
    ),
  },
  {
    label: 'Kanji',
    href: '/kanji',
    icon: <span className="ja-text font-bold text-base leading-none">漢</span>,
  },
  {
    label: 'Ngữ pháp',
    href: '/ngu-phap',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
    ),
  },
  {
    label: 'Luyện tập',
    href: '/flashcard',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
        />
      </svg>
    ),
  },
  {
    label: 'Hồ sơ',
    href: '/ho-so',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
        />
      </svg>
    ),
  },
];

export default function BottomNav() {
  const pathname = usePathname();
  const { settings, playTap } = useUISettings();

  if (!settings.bottomNavEnabled || pathname === '/dang-nhap' || pathname === '/dang-ky') return null;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 bg-card/95 backdrop-blur-xl border-t border-border shadow-[0_-4px_20px_rgba(0,0,0,0.06)] lg:hidden pb-[max(env(safe-area-inset-bottom),0.5rem)] pt-1.5 transition-transform"
      aria-label="Thanh điều hướng nhanh cho điện thoại"
    >
      <div className="max-w-md mx-auto px-2 flex items-center justify-around">
        {DOCK_ITEMS.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={playTap}
              className={`
                flex flex-col items-center justify-center py-1 px-2 rounded-2xl transition-all duration-200 relative select-none
                ${
                  isActive
                    ? 'text-primary scale-105 font-bold'
                    : 'text-muted-foreground hover:text-foreground active:scale-95'
                }
              `}
            >
              {/* Active pill background aura */}
              {isActive && (
                <span className="absolute inset-0 bg-primary/10 rounded-2xl -z-10 animate-in fade-in zoom-in-95 duration-150" />
              )}

              <span className="relative flex items-center justify-center h-6">
                {item.icon}
              </span>

              <span className="text-[10px] tracking-tight mt-0.5 whitespace-nowrap">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
