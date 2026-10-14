'use client';

import { useState } from 'react';
import Link from 'next/link';
import { speak } from '@/lib/audio';
import { useUISettings } from '@/components/providers/UISettingsProvider';

const KANA_PREVIEW = [
  { char: 'あ', romaji: 'a', vi: 'a' },
  { char: 'い', romaji: 'i', vi: 'i' },
  { char: 'う', romaji: 'u', vi: 'u/ư' },
  { char: 'え', romaji: 'e', vi: 'ê/e' },
  { char: 'お', romaji: 'o', vi: 'ô/o' },
];

const FEATURES = [
  {
    icon: '🔤',
    kanjiBg: '仮',
    title: 'Bắt đầu từ con số 0',
    description: 'Học trọn vẹn 104 chữ Hiragana & 104 chữ Katakana, quy tắc trường âm, âm ngắt, âm ghép và phát âm chuẩn xác.',
    href: '/nhap-mon/hiragana',
    badge: 'Nhập môn',
    color: 'border-red-500/20 hover:border-red-500/50 bg-gradient-to-br from-red-500/5 to-transparent',
  },
  {
    icon: '📖',
    kanjiBg: '語',
    title: 'Từ vựng N5 theo ngữ cảnh',
    description: 'Hơn 85 từ vựng thực tế chia theo 8 chủ đề đời sống, có phiên âm Furigana, ví dụ mẫu, audio và giải thích sắc thái.',
    href: '/tu-vung',
    badge: '8 Chủ đề',
    color: 'border-blue-500/20 hover:border-blue-500/50 bg-gradient-to-br from-blue-500/5 to-transparent',
  },
  {
    icon: '📝',
    kanjiBg: '文',
    title: 'Ngữ pháp 30 cấu trúc chuẩn',
    description: 'Công thức rõ ràng, phân biệt trợ từ は vs が, cách chia động từ các nhóm, thể て, thể ない, thể たい có bài tập tương tác.',
    href: '/ngu-phap',
    badge: '30 Cấu trúc',
    color: 'border-green-500/20 hover:border-green-500/50 bg-gradient-to-br from-green-500/5 to-transparent',
  },
  {
    icon: '漢',
    kanjiBg: '字',
    title: 'Chữ Hán Kanji cho người Việt',
    description: 'Tận dụng triệt để lợi thế âm Hán-Việt, phân biệt âm On và âm Kun, bộ thủ, số nét, từ ghép thông dụng.',
    href: '/kanji',
    badge: 'Hán Việt',
    color: 'border-amber-500/20 hover:border-amber-500/50 bg-gradient-to-br from-amber-500/5 to-transparent',
  },
  {
    icon: '🃏',
    kanjiBg: '記',
    title: 'Flashcard lật thẻ & Ôn tập SRS',
    description: 'Lật thẻ học từ vựng nhanh chóng, ứng dụng thuật toán lặp lại ngắt quãng SM-2 giúp ghi nhớ sâu vào tiềm thức mà không bị quên.',
    href: '/flashcard',
    badge: 'Thuật toán SM-2',
    color: 'border-purple-500/20 hover:border-purple-500/50 bg-gradient-to-br from-purple-500/5 to-transparent',
  },
  {
    icon: '✍️',
    kanjiBg: '試',
    title: 'Bài tập & Thi thử JLPT N5',
    description: 'Đề thi trắc nghiệm bấm giờ 15 phút, câu hỏi trợ từ, ghép câu SOV, kiểm tra đọc hiểu có chấm điểm và giải thích tức thì.',
    href: '/luyen-thi',
    badge: 'Bấm giờ',
    color: 'border-rose-500/20 hover:border-rose-500/50 bg-gradient-to-br from-rose-500/5 to-transparent',
  },
];

const SKILL_MODULES = [
  {
    title: 'Hội thoại đời sống',
    desc: '4 kịch bản thực tế: Chào hỏi, Konbini, Quán Ramen, Hỏi đường ở ga Tokyo.',
    href: '/hoi-thoai',
    icon: '💬',
    tag: 'Giao tiếp',
  },
  {
    title: 'Luyện nghe Choukai',
    desc: 'Điều chỉnh tốc độ 0.7x đến 1.0x, câu hỏi kiểm tra, kèm bản chép lời transcript.',
    href: '/luyen-nghe',
    icon: '🎧',
    tag: 'Luyện nghe',
  },
  {
    title: 'Luyện nói & Micro',
    desc: 'Thu âm giọng nói qua micro thiết bị, nghe lại đối chiếu với phát âm chuẩn.',
    href: '/luyen-noi',
    icon: '🎙️',
    tag: 'Luyện phát âm',
  },
  {
    title: 'Luyện đọc Dokkai',
    desc: 'Đọc hiểu email công việc, thông báo cửa hàng, nhật ký có bật/tắt Furigana.',
    href: '/luyen-doc',
    icon: '📑',
    tag: 'Đọc hiểu',
  },
  {
    title: 'Luyện viết ghép câu',
    desc: 'Bài tập tương tác sắp xếp các mảnh từ vựng theo trật tự cú pháp SOV.',
    href: '/luyen-viet',
    icon: '✏️',
    tag: 'Ghép câu',
  },
  {
    title: 'Luyện gõ tiếng Nhật',
    desc: 'Luyện phản xạ gõ Romaji IME với bàn phím trực quan, âm thanh switch tùy chọn và thử thách tốc độ 60s.',
    href: '/luyen-go',
    icon: '⌨️',
    tag: 'Luyện gõ',
  },
  {
    title: 'Thống kê & Hồ sơ',
    desc: 'Theo dõi chuỗi ngày Streak, tỷ lệ trả lời đúng và thiết lập mục tiêu học mỗi ngày.',
    href: '/thong-ke',
    icon: '📊',
    tag: 'Tiến độ',
  },
];

const LEVELS = [
  {
    level: 'Nhập môn',
    label: 'Trước N5 • Nền tảng',
    description: 'Hiragana, Katakana, phát âm chuẩn, cấu trúc câu SOV đầu tiên',
    status: 'available' as const,
    color: 'text-primary border-primary/30 bg-primary/5',
  },
  {
    level: 'JLPT N5',
    label: 'Sơ cấp nền tảng',
    description: '85+ từ vựng, 30 cấu trúc ngữ pháp, 20 Kanji, hội thoại đời sống',
    status: 'available' as const,
    color: 'text-success border-success/30 bg-success/5',
  },
  {
    level: 'JLPT N4',
    label: 'Sơ cấp nâng cao',
    description: 'Mở rộng thể bị động, sai khiến, kính ngữ và đọc hiểu trung cấp',
    status: 'coming_soon' as const,
    color: 'text-muted-foreground border-border bg-card/40',
  },
  {
    level: 'JLPT N3',
    label: 'Trung cấp giao tiếp',
    description: 'Giao tiếp trôi chảy thường ngày, đọc báo chí và văn bản xã hội',
    status: 'coming_soon' as const,
    color: 'text-muted-foreground border-border bg-card/40',
  },
  {
    level: 'JLPT N2',
    label: 'Trung cao cấp',
    description: 'Đọc hiểu sâu, làm việc tại doanh nghiệp Nhật Bản chuyên nghiệp',
    status: 'coming_soon' as const,
    color: 'text-muted-foreground border-border bg-card/40',
  },
  {
    level: 'JLPT N1',
    label: 'Cao cấp toàn diện',
    description: 'Thành thạo tiếng Nhật học thuật, văn bản chuyên ngành và nghị luận',
    status: 'coming_soon' as const,
    color: 'text-muted-foreground border-border bg-card/40',
  },
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
    <div className="space-y-16 sm:space-y-24">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-16 sm:pt-20 sm:pb-24 border-b border-border bg-gradient-to-b from-primary/5 via-background to-background bg-subtle-mesh">
        {/* Decorative Watermark Japanese Characters */}
        <div className="absolute top-6 left-6 text-8xl font-black text-foreground/[0.03] ja-text select-none pointer-events-none hidden md:block">
          日本語
        </div>
        <div className="absolute bottom-6 right-6 text-9xl font-black text-primary/[0.04] ja-text select-none pointer-events-none hidden md:block">
          夢
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            {/* Pill Badge with Hanko Seal */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/20 bg-card shadow-sm text-xs font-semibold text-primary">
              <span className="hanko-stamp">正統</span>
              <span>🌸 Nền tảng học tiếng Nhật 100% chuẩn xác & trung thực</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-foreground leading-[1.15]">
              Học Tiếng Nhật Toàn Diện
              <br />
              <span className="bg-gradient-to-r from-primary via-red-600 to-rose-500 bg-clip-text text-transparent ja-text">
                Từ Con Số 0 Đến JLPT N1
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              Được thiết kế tỉ mỉ cho người Việt: nắm vững bảng chữ cái, ngữ pháp logic, phát âm chuẩn nhịp Mora, flashcard thông minh và đề thi thử bấm giờ.
            </p>

            {/* CTA Buttons with Tactile Mechanical Feel */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3.5">
              <Link
                href="/nhap-mon/hiragana"
                onClick={playTap}
                className="btn-tactile w-full sm:w-auto px-8 py-4 bg-primary text-primary-foreground rounded-2xl font-bold text-base hover:opacity-95 flex items-center justify-center gap-2 select-none"
              >
                <span>🚀 Bắt đầu học Hiragana ngay</span>
              </Link>
              <Link
                href="/gioi-thieu"
                onClick={playTap}
                className="btn-tactile-secondary w-full sm:w-auto px-7 py-4 bg-card border border-border text-foreground rounded-2xl font-bold text-base hover:bg-secondary select-none"
              >
                Xem lộ trình chi tiết
              </Link>
            </div>

            {/* Quick Interactive Kana Preview Banner */}
            <div className="pt-6">
              <span className="text-xs font-semibold text-muted-foreground block mb-3">
                Thử chạm để nghe phát âm ngay 5 nguyên âm cốt lõi:
              </span>
              <div className="inline-flex flex-wrap items-center justify-center gap-2.5 p-2 bg-card border border-border rounded-2xl shadow-sm">
                {KANA_PREVIEW.map((k) => (
                  <button
                    key={k.char}
                    onClick={() => playChar(k.char)}
                    className={`w-12 h-14 rounded-xl border flex flex-col items-center justify-center transition-all cursor-pointer ${
                      playingChar === k.char
                        ? 'border-primary bg-primary text-primary-foreground scale-105 shadow-md'
                        : 'border-border bg-background text-foreground hover:border-primary/50 hover:bg-secondary active:scale-95'
                    }`}
                  >
                    <span className="ja-text text-xl font-bold">{k.char}</span>
                    <span className="text-[10px] opacity-70 font-mono">{k.romaji}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Fast Stats Row */}
            <div className="pt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto border-t border-border/60">
              <div>
                <p className="text-2xl font-black text-primary">104 + 104</p>
                <p className="text-xs text-muted-foreground mt-0.5">Ký tự Kana đầy đủ</p>
              </div>
              <div>
                <p className="text-2xl font-black text-primary">85+</p>
                <p className="text-xs text-muted-foreground mt-0.5">Từ vựng N5 ngữ cảnh</p>
              </div>
              <div>
                <p className="text-2xl font-black text-primary">30</p>
                <p className="text-xs text-muted-foreground mt-0.5">Cấu trúc ngữ pháp N5</p>
              </div>
              <div>
                <p className="text-2xl font-black text-primary">100%</p>
                <p className="text-xs text-muted-foreground mt-0.5">Dữ liệu thật, không fake</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Features Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold text-primary tracking-widest uppercase block mb-1">
            Chương Trình Học Toàn Diện
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground">
            Trang Bị Đầy Đủ Mọi Kỹ Năng Tiếng Nhật
          </h2>
          <p className="text-sm text-muted-foreground mt-2">
            Không học vẹt máy móc. Từng bài học đều giải thích bản chất vì sao câu nói mang ý nghĩa đó.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={playTap}
              className={`card-craft group relative p-7 rounded-3xl border ${item.color} overflow-hidden flex flex-col justify-between`}
            >
              {/* Background Kanji Watermark */}
              <span className="absolute -right-2 -bottom-4 text-7xl font-black text-foreground/[0.03] group-hover:text-primary/[0.06] transition-colors ja-text select-none pointer-events-none">
                {item.kanjiBg}
              </span>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-4xl">{item.icon}</span>
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-secondary text-foreground border border-border">
                    {item.badge}
                  </span>
                </div>

                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>

              <div className="pt-4 flex items-center text-xs font-bold text-primary gap-1 group-hover:gap-2 transition-all">
                <span>Vào học phần này</span>
                <span>→</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Practical Skill Modules */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-card border border-border rounded-3xl p-8 sm:p-12 shadow-sm space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border pb-6">
            <div>
              <span className="text-xs font-bold text-primary tracking-widest uppercase block mb-1">
                Ứng Dụng Thực Chiến
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground">
                6 Công Cụ Luyện Kỹ Năng Đời Sống
              </h2>
            </div>
            <p className="text-xs text-muted-foreground max-w-sm">
              Tích hợp ghi âm micro, nghe audio điều chỉnh tốc độ, và lắp ghép cú pháp tương tác.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {SKILL_MODULES.map((m) => (
              <Link
                key={m.href}
                href={m.href}
                onClick={playTap}
                className="card-craft p-5 rounded-2xl border border-border bg-background hover:border-primary/50 hover:bg-secondary/40 space-y-2 group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-2xl">{m.icon}</span>
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary">
                    {m.tag}
                  </span>
                </div>
                <h4 className="font-bold text-base text-foreground group-hover:text-primary transition-colors">
                  {m.title}
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {m.desc}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Learning Roadmap Overview */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-bold text-primary tracking-widest uppercase block mb-1">
            Lộ Trình Từng Bước
          </span>
          <h2 className="text-3xl font-extrabold text-foreground">
            5 Cấp Độ JLPT & Giai Đoạn Nhập Môn
          </h2>
          <p className="text-sm text-muted-foreground mt-2">
            Minh bạch trạng thái: Hoàn thiện vững chắc từng bước thay vì hứa hẹn dữ liệu ảo.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {LEVELS.map((lvl, idx) => (
            <div
              key={lvl.level}
              className={`p-6 rounded-2xl border ${lvl.color} flex flex-col justify-between space-y-4`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-black text-lg text-foreground">{lvl.level}</span>
                  <span className="text-xs font-mono font-bold opacity-60">#{idx + 1}</span>
                </div>
                <h4 className="font-bold text-sm text-foreground">{lvl.label}</h4>
                <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                  {lvl.description}
                </p>
              </div>

              <div className="pt-2 border-t border-border/40 flex items-center justify-between text-xs">
                {lvl.status === 'available' ? (
                  <span className="font-bold text-success flex items-center gap-1">
                    <span>✓</span> Đã có bài học & bài tập
                  </span>
                ) : (
                  <span className="font-medium text-warning flex items-center gap-1">
                    <span>⏳</span> Đang biên soạn
                  </span>
                )}

                {lvl.status === 'available' && (
                  <Link
                    href={lvl.level === 'Nhập môn' ? '/nhap-mon' : '/tu-vung'}
                    className="font-bold text-primary hover:underline"
                  >
                    Vào học →
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="bg-gradient-to-r from-red-600 via-primary to-rose-600 rounded-3xl p-8 sm:p-14 text-center text-white shadow-2xl relative overflow-hidden">
          <div className="relative z-10 max-w-2xl mx-auto space-y-4">
            <span className="ja-text text-4xl block opacity-40">一歩一歩、前へ</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Bắt Đầu Hành Trình Chinh Phục Tiếng Nhật Ngay Hôm Nay
            </h2>
            <p className="text-sm sm:text-base text-white/90 leading-relaxed">
              Không cần chuẩn bị trước kiến thức. Chỉ cần dành 15 phút mỗi ngày với NihongoMaster.
            </p>
            <div className="pt-2">
              <Link
                href="/nhap-mon/hiragana"
                className="inline-block px-9 py-4 bg-white text-primary rounded-2xl font-extrabold text-base hover:bg-white/90 transition-all shadow-xl hover:scale-105 active:scale-95"
              >
                Học bảng chữ cái Hiragana miễn phí →
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
