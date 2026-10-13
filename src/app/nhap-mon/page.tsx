'use client';

import Link from 'next/link';
import { useProgress } from '@/components/providers/ProgressProvider';

const SECTIONS = [
  {
    id: 'hiragana',
    title: 'Bảng chữ cái Hiragana',
    titleJa: '平仮名',
    description:
      'Bảng chữ cái mềm quan trọng nhất trong tiếng Nhật. Nền tảng bắt buộc để học ngữ pháp, từ vựng và Kanji.',
    href: '/nhap-mon/hiragana',
    iconChar: 'あ',
    badge: '104 ký tự đầy đủ',
    color: 'text-primary',
    bgBadge: 'bg-primary/10 text-primary',
    type: 'hiragana',
  },
  {
    id: 'katakana',
    title: 'Bảng chữ cái Katakana',
    titleJa: '片仮名',
    description:
      'Bảng chữ cái cứng dùng để viết từ mượn nước ngoài, tên người nước ngoài, thuật ngữ khoa học và từ tượng thanh.',
    href: '/nhap-mon/katakana',
    iconChar: 'ア',
    badge: '104 ký tự tương đương',
    color: 'text-info',
    bgBadge: 'bg-info/10 text-info',
    type: 'katakana',
  },
  {
    id: 'phat-am',
    title: 'Quy tắc phát âm & Ngữ điệu',
    titleJa: '発音とアクセント',
    description:
      'Luyện phát âm chuẩn ngay từ đầu: trường âm, âm ngắt (sokuon), âm mũi, biến âm và ngữ điệu Pitch Accent chuẩn Tokyo.',
    href: '/nhap-mon/phat-am',
    iconChar: '🗣️',
    badge: '5 quy tắc cốt lõi',
    color: 'text-success',
    bgBadge: 'bg-success/10 text-success',
    type: 'pronunciation',
  },
  {
    id: 'kien-thuc-co-ban',
    title: 'Kiến thức đầu tiên',
    titleJa: '最初の基礎知識',
    description:
      'Các câu chào hỏi thông dụng hàng ngày (Aisatsu), cách đếm số từ 1 đến 100, đại từ nhân xưng và cấu trúc câu cơ bản.',
    href: '/nhap-mon/kien-thuc-co-ban',
    iconChar: '🎌',
    badge: 'Chào hỏi & Số đếm',
    color: 'text-warning',
    bgBadge: 'bg-warning/10 text-warning',
    type: 'basics',
  },
];

const ROADMAP_STEPS = [
  {
    step: '01',
    title: 'Hiragana',
    description: 'Nắm vững 46 chữ cái cơ bản và các biến âm (đục, ghép).',
    link: '/nhap-mon/hiragana',
  },
  {
    step: '02',
    title: 'Katakana',
    description: 'Học cách nhận diện các từ mượn tiếng Anh thường gặp.',
    link: '/nhap-mon/katakana',
  },
  {
    step: '03',
    title: 'Quy tắc phát âm',
    description: 'Hiểu trường âm và âm ngắt để nói đúng chuẩn bản ngữ.',
    link: '/nhap-mon/phat-am',
  },
  {
    step: '04',
    title: 'Chào hỏi & Số đếm',
    description: 'Áp dụng vào những câu giao tiếp đầu tiên trong đời sống.',
    link: '/nhap-mon/kien-thuc-co-ban',
  },
];

export default function NhapMonPage() {
  const { progress } = useProgress();

  // Progress mapping
  const getProgressValue = (type: string): number => {
    switch (type) {
      case 'hiragana':
        return progress.hiraganaProgress || 0;
      case 'katakana':
        return progress.katakanaProgress || 0;
      case 'pronunciation':
        // If user already completed 50% hiragana, consider started
        return progress.hiraganaProgress > 50 ? 50 : progress.hiraganaProgress > 10 ? 25 : 0;
      case 'basics':
        return progress.hiraganaProgress > 80 && progress.katakanaProgress > 50 ? 60 : 0;
      default:
        return 0;
    }
  };

  return (
    <div className="min-h-screen py-8 sm:py-12 bg-background text-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground" aria-label="Đường dẫn">
          <Link href="/" className="hover:text-primary transition-colors">
            Trang chủ
          </Link>
          <span>/</span>
          <span className="text-foreground font-medium">Nhập môn tiếng Nhật</span>
        </nav>

        {/* Hero Section */}
        <header className="space-y-4 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary">
            <span>Khởi đầu từ con số 0</span>
            <span>•</span>
            <span>Dành cho người Việt Nam</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            Nhập Môn Tiếng Nhật <span className="ja-text text-primary font-normal">（入門）</span>
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
            Hành trình chinh phục tiếng Nhật bắt đầu từ việc nắm vững hai bảng chữ cái Hiragana, Katakana, quy tắc phát âm tự nhiên và các mẫu câu chào hỏi đầu tiên.
          </p>
        </header>

        {/* 4 Main Learning Modules */}
        <section aria-labelledby="modules-heading" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 id="modules-heading" className="text-2xl font-bold tracking-tight">
              Nội dung học chính
            </h2>
            <span className="text-xs text-muted-foreground">
              4 chuyên đề nhập môn
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {SECTIONS.map((section) => {
              const currentProgress = getProgressValue(section.type);

              return (
                <div
                  key={section.id}
                  className="bg-card border border-border rounded-xl p-6 shadow-sm hover:border-primary/50 transition-all flex flex-col justify-between group"
                >
                  <div className="space-y-4">
                    {/* Top Row: Character Icon & Badges */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="w-14 h-14 rounded-xl bg-secondary border border-border flex items-center justify-center text-2xl font-bold select-none group-hover:scale-105 transition-transform">
                        <span className="ja-text text-foreground">{section.iconChar}</span>
                      </div>

                      <div className="flex flex-col items-end gap-1">
                        <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${section.bgBadge}`}>
                          {section.badge}
                        </span>
                        <span className="text-xs text-muted-foreground font-mono">
                          Tiến độ: {currentProgress}%
                        </span>
                      </div>
                    </div>

                    {/* Section Titles */}
                    <div>
                      <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors flex items-center gap-2">
                        <span>{section.title}</span>
                        <span className="ja-text text-sm font-normal text-muted-foreground">
                          （{section.titleJa}）
                        </span>
                      </h3>
                      <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                        {section.description}
                      </p>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1 pt-1">
                      <div className="progress-bar w-full">
                        <div
                          className="progress-bar-fill transition-all duration-500"
                          style={{ width: `${currentProgress}%` }}
                          role="progressbar"
                          aria-valuenow={currentProgress}
                          aria-valuemin={0}
                          aria-valuemax={100}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Action Link Button */}
                  <div className="pt-6 mt-4 border-t border-border/60 flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {currentProgress === 100
                        ? '✓ Đã hoàn thành'
                        : currentProgress > 0
                        ? 'Đang học dở dang'
                        : 'Chưa bắt đầu'}
                    </span>
                    <Link
                      href={section.href}
                      className="bg-primary text-primary-foreground rounded-lg px-4 py-2 text-sm font-semibold hover:opacity-90 active:scale-95 transition-all inline-flex items-center gap-1.5"
                    >
                      <span>{currentProgress > 0 ? 'Tiếp tục học' : 'Bắt đầu học'}</span>
                      <span aria-hidden="true">→</span>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Step-by-Step Learning Roadmap */}
        <section aria-labelledby="roadmap-heading" className="bg-card border border-border rounded-xl p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="space-y-1">
            <h2 id="roadmap-heading" className="text-2xl font-bold tracking-tight">
              Lộ trình học nhập môn đề xuất
            </h2>
            <p className="text-sm text-muted-foreground">
              Trình tự các bước giúp bạn tiếp thu tiếng Nhật tự nhiên, không bị quá tải.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
            {ROADMAP_STEPS.map((stepItem, index) => (
              <Link
                key={stepItem.step}
                href={stepItem.link}
                className="p-4 rounded-xl bg-secondary/50 border border-border hover:border-primary hover:bg-secondary transition-all group flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-extrabold text-primary font-mono">
                      {stepItem.step}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Bước {index + 1}
                    </span>
                  </div>
                  <h3 className="font-bold text-foreground group-hover:text-primary transition-colors">
                    {stepItem.title}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {stepItem.description}
                  </p>
                </div>
                <div className="pt-3 text-xs font-semibold text-primary inline-flex items-center gap-1">
                  <span>Học ngay</span>
                  <span aria-hidden="true">→</span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Study Tips for Vietnamese Learners */}
        <section aria-labelledby="tips-heading" className="bg-secondary/40 border border-border rounded-xl p-6 sm:p-8 space-y-4">
          <h2 id="tips-heading" className="text-lg font-bold flex items-center gap-2">
            <span>💡 Lời khuyên học bảng chữ cái cho người Việt</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
            <div className="p-4 rounded-lg bg-card border border-border space-y-1.5">
              <h3 className="font-semibold text-foreground">1. Kết hợp nhìn - nghe - viết</h3>
              <p className="text-xs leading-relaxed">
                Đừng chỉ nhìn mặt chữ. Hãy nghe phát âm audio, nhẩm theo thành tiếng và viết đúng số nét để ghi nhớ vào cơ bắp não bộ.
              </p>
            </div>
            <div className="p-4 rounded-lg bg-card border border-border space-y-1.5">
              <h3 className="font-semibold text-foreground">2. Tránh nhầm lẫn chữ tương tự</h3>
              <p className="text-xs leading-relaxed">
                Các cặp chữ Hiragana dễ nhầm như: あ - お, さ - き, は - ほ, わ - れ - ね. Hãy phân biệt rõ từng nét móc và vòng tròn.
              </p>
            </div>
            <div className="p-4 rounded-lg bg-card border border-border space-y-1.5">
              <h3 className="font-semibold text-foreground">3. Mỗi ngày 15 - 20 phút</h3>
              <p className="text-xs leading-relaxed">
                Học 2 hàng mỗi ngày (khoảng 10 chữ). Tận dụng tính năng trắc nghiệm phản xạ ở cuối bài để tự kiểm tra trước khi chuyển bài mới.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
