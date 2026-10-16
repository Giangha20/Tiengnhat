'use client';

import { useState } from 'react';
import Link from 'next/link';
import { speak } from '@/lib/audio';
import { useUISettings } from '@/components/providers/UISettingsProvider';

const KANA_PREVIEW = [
  { char: 'あ', romaji: 'a', vi: 'a', tip: 'Nguyên âm cơ bản' },
  { char: 'い', romaji: 'i', vi: 'i', tip: 'Cười tươi khi đọc' },
  { char: 'う', romaji: 'u', vi: 'u/ư', tip: 'Môi hơi hé, nhẹ' },
  { char: 'え', romaji: 'e', vi: 'ê/e', tip: 'Mở miệng tự nhiên' },
  { char: 'お', romaji: 'o', vi: 'ô/o', tip: 'Tròn môi vừa phải' },
];

const BENTO_FEATURES = [
  {
    icon: '🔤',
    badge: 'Khởi đầu vững chắc',
    badgeColor: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    title: 'Bảng Chữ Cái Kana & Phát Âm Chuẩn',
    description: '104 chữ Hiragana & 104 chữ Katakana trọn vẹn. Nắm rõ âm ghép, trường âm, âm ngắt và cao độ Pitch Accent chuẩn Tokyo.',
    href: '/nhap-mon/hiragana',
    colSpan: 'lg:col-span-8',
    highlight: 'Học 3 ngày nhớ trọn bảng chữ cái',
    actionText: 'Bắt đầu học Kana',
    accentGradient: 'from-emerald-500/10 via-transparent to-transparent',
  },
  {
    icon: '📸',
    badge: '100% Ảnh Thật',
    badgeColor: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
    title: 'Ngân Hàng Bài Tập Ảnh Thật',
    description: '20+ câu hỏi trợ từ, động từ và đọc hiểu gắn liền với ảnh chụp thực tế tại Nhật Bản (núi Phú Sĩ, ga tàu, washoku, ramen).',
    href: '/bai-tap',
    colSpan: 'lg:col-span-4',
    highlight: 'Nhớ từ vựng qua hình ảnh đời thực',
    actionText: 'Làm bài tập ngay',
    accentGradient: 'from-rose-500/10 via-transparent to-transparent',
  },
  {
    icon: '⌨️',
    badge: '🔥 Siêu Hot',
    badgeColor: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    title: 'Luyện Gõ Phím Cơ Romaji IME',
    description: 'Rèn luyện phản xạ ngón tay gõ Romaji ra Hiragana. Tùy chọn âm thanh switch cơ học (Blue/Red/Brown) và thử thách tốc độ 60 giây.',
    href: '/luyen-go',
    colSpan: 'lg:col-span-4',
    highlight: 'Tốc độ phản xạ gõ chuẩn xác',
    actionText: 'Vào phòng luyện gõ',
    accentGradient: 'from-amber-500/10 via-transparent to-transparent',
  },
  {
    icon: '漢',
    badge: 'Độc quyền người Việt',
    badgeColor: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    title: 'Hán Tự Kanji Theo Âm Hán-Việt',
    description: 'Tận dụng 70% từ vựng tiếng Nhật tương đồng với âm Hán-Việt. Nhớ mặt chữ, số nét và từ ghép thông dụng cực kỳ dễ hiểu.',
    href: '/kanji',
    colSpan: 'lg:col-span-4',
    highlight: 'Học 1 biết 10 qua âm Hán-Việt',
    actionText: 'Khám phá Kanji N5',
    accentGradient: 'from-blue-500/10 via-transparent to-transparent',
  },
  {
    icon: '🃏',
    badge: 'Thuật toán SM-2',
    badgeColor: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
    title: 'Flashcard Thông Minh & Ôn Tập SRS',
    description: 'Hệ thống lặp lại ngắt quãng khoa học giúp đẩy từ vựng vào trí nhớ dài hạn. Không bao giờ sợ học trước quên sau.',
    href: '/flashcard',
    colSpan: 'lg:col-span-4',
    highlight: 'Ghi nhớ vĩnh viễn không quên',
    actionText: 'Lật thẻ ôn tập',
    accentGradient: 'from-purple-500/10 via-transparent to-transparent',
  },
  {
    icon: '🏆',
    badge: 'Mô phỏng kỳ thi',
    badgeColor: 'bg-red-500/10 text-red-500 border-red-500/20',
    title: 'Đề Thi Thử Bấm Giờ JLPT N5',
    description: 'Đề thi trắc nghiệm bấm giờ 15 phút bao gồm Chữ Hán, Ngữ pháp và Đọc hiểu Dokkai. Tự động chấm điểm và giải thích tức thì.',
    href: '/luyen-thi',
    colSpan: 'lg:col-span-6',
    highlight: 'Tự tin vượt qua kỳ thi N5',
    actionText: 'Thử sức làm bài thi',
    accentGradient: 'from-red-500/10 via-transparent to-transparent',
  },
  {
    icon: '💬',
    badge: 'Giao tiếp đời sống',
    badgeColor: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20',
    title: 'Hội Thoại Thực Tế & Luyện Nghe',
    description: 'Hội thoại tại cửa hàng tiện lợi Konbini, quán Ramen, nhà ga Tokyo kèm thanh điều chỉnh tốc độ phát âm chậm 0.5x – 0.75x cho người mới.',
    href: '/hoi-thoai',
    colSpan: 'lg:col-span-6',
    highlight: 'Tự tin giao tiếp khi đặt chân đến Nhật',
    actionText: 'Nghe hội thoại thực tế',
    accentGradient: 'from-indigo-500/10 via-transparent to-transparent',
  },
];

const QUICK_STATS = [
  { value: '104 + 104', label: 'Ký tự Kana đầy đủ', icon: '🔤' },
  { value: '100% Thật', label: 'Ảnh chụp đời thực', icon: '📸' },
  { value: '0.75x', label: 'Tốc độ đọc cho người mới', icon: '🔊' },
  { value: '30 Cấu Trúc', label: 'Ngữ pháp N5 cốt lõi', icon: '📝' },
];

export default function HomePage() {
  const [playingChar, setPlayingChar] = useState<string | null>(null);
  const { playTap } = useUISettings();

  const playChar = (char: string) => {
    playTap();
    setPlayingChar(char);
    speak({
      text: char,
      onEnd: () => setPlayingChar(null),
      onError: () => setPlayingChar(null),
    });
  };

  return (
    <div className="space-y-12 sm:space-y-20 pb-12 w-full max-w-full overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-8 pb-12 sm:pt-16 sm:pb-20 border-b border-border/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Content (7 cols) */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              {/* Trust Badge with Live Pulse */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-primary/20 bg-card/90 backdrop-blur-md shadow-xs text-[11px] sm:text-xs font-semibold text-primary max-w-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                <span className="font-bold truncate">🌸 Tiếng Nhật N5 thực tế cho người Việt</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-2xl sm:text-4xl lg:text-6xl font-black tracking-tight text-foreground leading-tight break-words">
                Chinh Phục Tiếng Nhật
                <br className="hidden sm:inline" />{' '}
                <span className="bg-gradient-to-r from-red-600 via-rose-500 to-amber-600 bg-clip-text text-transparent ja-text inline-block">
                  Tự Nhiên & Dễ Hiểu
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-sm sm:text-lg text-muted-foreground leading-relaxed max-w-xl mx-auto lg:mx-0">
                Lộ trình học bài bản: nắm trọn bảng chữ cái sau 3 ngày, phản xạ gõ phím cơ Romaji, bài tập có <strong>100% ảnh chụp thật</strong> tại Nhật Bản và phát âm chuẩn nhịp bản xứ.
              </p>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3">
                <Link
                  href="/nhap-mon/hiragana"
                  onClick={playTap}
                  className="w-full sm:w-auto px-7 py-3.5 bg-primary text-primary-foreground rounded-2xl font-bold text-sm sm:text-base hover:opacity-95 shadow-md shadow-primary/25 transition-all hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 select-none cursor-pointer"
                >
                  <span>🚀 Bắt đầu học Hiragana ngay</span>
                </Link>
                <Link
                  href="/luyen-go"
                  onClick={playTap}
                  className="w-full sm:w-auto px-6 py-3.5 bg-card border border-border text-foreground rounded-2xl font-bold text-sm sm:text-base hover:bg-secondary hover:border-primary/40 transition-all flex items-center justify-center gap-2 select-none cursor-pointer"
                >
                  <span>⌨️ Luyện gõ Romaji</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-500 font-black">
                    HOT
                  </span>
                </Link>
              </div>

              {/* Quick Stat Capsule Row */}
              <div className="pt-4 grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-w-xl mx-auto lg:mx-0 border-t border-border/50">
                {QUICK_STATS.map((s) => (
                  <div
                    key={s.label}
                    className="p-2.5 rounded-xl bg-card/60 border border-border/50 text-center"
                  >
                    <span className="text-xs">{s.icon}</span>
                    <p className="text-sm sm:text-base font-black text-foreground mt-0.5">{s.value}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Interactive Showcase Widget (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-card/95 backdrop-blur-md border border-border/80 rounded-3xl p-5 sm:p-6 shadow-md space-y-5">
                {/* Header widget */}
                <div className="flex items-center justify-between pb-3 border-b border-border/50">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span className="text-xs font-bold text-foreground">Trải Nghiệm Thử Phát Âm Chuẩn</span>
                  </div>
                  <span className="text-[11px] text-primary font-bold">5 Nguyên âm</span>
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed">
                  Chạm vào từng ký tự để nghe phát âm giọng bản xứ với tốc độ chuẩn:
                </p>

                {/* 5 Vowel Cards */}
                <div className="grid grid-cols-5 gap-2">
                  {KANA_PREVIEW.map((k) => (
                    <button
                      key={k.char}
                      onClick={() => playChar(k.char)}
                      className={`py-3 px-1 rounded-2xl border flex flex-col items-center justify-center transition-all cursor-pointer ${
                        playingChar === k.char
                          ? 'border-primary bg-primary text-primary-foreground scale-105 shadow-md'
                          : 'border-border/80 bg-background text-foreground hover:border-primary/50 hover:bg-secondary active:scale-95'
                      }`}
                      title={k.tip}
                    >
                      <span className="ja-text text-2xl font-black">{k.char}</span>
                      <span className="text-[11px] font-mono font-bold mt-1 opacity-75">{k.romaji}</span>
                    </button>
                  ))}
                </div>

                {/* Live Real Context Showcase Banner */}
                <div className="p-3.5 rounded-2xl bg-secondary/50 border border-border/60 flex items-center gap-3">
                  <span className="text-2xl shrink-0">🍱</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-foreground truncate">
                      Ngân hàng bài tập có ảnh thật
                    </p>
                    <p className="text-[11px] text-muted-foreground truncate">
                      Mỗi câu hỏi đều có ảnh chụp phong cảnh, đời sống thực tế
                    </p>
                  </div>
                  <Link
                    href="/bai-tap"
                    className="text-xs font-bold text-primary hover:underline shrink-0"
                  >
                    Xem →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bento Grid Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-primary/10 text-primary uppercase tracking-wider inline-block">
            Chương Trình Học Toàn Diện
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-foreground">
            Trang Bị Mọi Kỹ Năng Đời Sống Thực Tế
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Học tiếng Nhật không nhàm chán, không máy móc. Từng bài tập đều có ngữ cảnh minh họa chân thực.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {BENTO_FEATURES.map((feat) => (
            <Link
              key={feat.title}
              href={feat.href}
              onClick={playTap}
              className={`${feat.colSpan} group relative bg-card/90 backdrop-blur-md border border-border/80 hover:border-primary/50 p-6 sm:p-7 rounded-3xl transition-all duration-300 hover:-translate-y-1 hover:shadow-lg flex flex-col justify-between overflow-hidden cursor-pointer`}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                    {feat.icon}
                  </span>
                  <span className={`text-[11px] font-bold px-3 py-1 rounded-full border ${feat.badgeColor}`}>
                    {feat.badge}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <h3 className="text-lg sm:text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                    {feat.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    {feat.description}
                  </p>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-border/50 flex items-center justify-between text-xs">
                <span className="text-muted-foreground font-medium">{feat.highlight}</span>
                <span className="font-bold text-primary flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  <span>{feat.actionText}</span>
                  <span>→</span>
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 rounded-3xl p-8 sm:p-12 text-center text-white shadow-xl space-y-4">
          <span className="ja-text text-3xl opacity-50 block">一歩一歩、前へ</span>
          <h2 className="text-2xl sm:text-4xl font-black tracking-tight">
            Bắt Đầu Hành Trình Chinh Phục Tiếng Nhật Ngay Hôm Nay
          </h2>
          <p className="text-xs sm:text-sm text-white/90 max-w-xl mx-auto leading-relaxed">
            Dành 15 phút mỗi ngày với NihongoMaster để tự tin giao tiếp, đọc hiểu và đỗ kỳ thi JLPT N5.
          </p>
          <div className="pt-2">
            <Link
              href="/nhap-mon/hiragana"
              onClick={playTap}
              className="inline-block px-8 py-3.5 bg-white text-red-600 rounded-2xl font-black text-sm sm:text-base hover:bg-white/95 transition-all shadow-lg hover:scale-105 active:scale-95 cursor-pointer"
            >
              Học bảng chữ cái Hiragana miễn phí →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
