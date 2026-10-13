import Link from 'next/link';

const FOOTER_LINKS = [
  {
    title: 'Học tiếng Nhật',
    links: [
      { label: 'Hiragana', href: '/nhap-mon/hiragana' },
      { label: 'Katakana', href: '/nhap-mon/katakana' },
      { label: 'Từ vựng', href: '/tu-vung' },
      { label: 'Ngữ pháp', href: '/ngu-phap' },
      { label: 'Kanji', href: '/kanji' },
    ],
  },
  {
    title: 'Luyện tập',
    links: [
      { label: 'Flashcard', href: '/flashcard' },
      { label: 'Bài tập', href: '/bai-tap' },
      { label: 'Ôn tập', href: '/on-tap' },
      { label: 'Luyện thi JLPT', href: '/luyen-thi' },
    ],
  },
  {
    title: 'Về website',
    links: [
      { label: 'Lộ trình học', href: '/gioi-thieu' },
      { label: 'Nguồn tham khảo', href: '/nguon-tham-khao' },
      { label: 'Chính sách bảo mật', href: '/bao-mat' },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="bg-card border-t border-border mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 sm:col-span-3 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 text-lg font-bold text-primary">
              <span className="ja-text text-2xl">日</span>
              NihongoMaster
            </Link>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
              Nền tảng học tiếng Nhật miễn phí dành cho người Việt. 
              Từ con số 0 đến JLPT N1.
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              ⚠️ Nội dung đang được xây dựng và cập nhật. 
              Một số phần chưa được người bản ngữ xác minh.
            </p>
          </div>

          {/* Links */}
          {FOOTER_LINKS.map((group) => (
            <div key={group.title}>
              <h3 className="font-semibold text-sm text-foreground mb-3">{group.title}</h3>
              <ul className="space-y-2">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-8 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground text-center sm:text-left">
            © 2026 NihongoMaster. 
            Dự án học tiếng Nhật mã nguồn mở.
          </p>
          <p className="text-xs text-muted-foreground text-center sm:text-right">
            Nội dung biên soạn theo định hướng JLPT, dựa trên tài liệu tham khảo.
            <br className="sm:hidden" />
            {' '}Không phải danh sách chính thức của JLPT.
          </p>
        </div>
      </div>
    </footer>
  );
}
