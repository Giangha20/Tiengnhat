import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Lộ trình học tiếng Nhật',
  description: 'Lộ trình học tiếng Nhật từ cơ bản đến nâng cao, theo định hướng JLPT N5 đến N1.',
};

const ROADMAP = [
  {
    phase: 'Giai đoạn 1',
    title: 'Nhập môn - Nền tảng',
    duration: '2-4 tuần',
    icon: '🌱',
    status: 'available' as const,
    items: [
      { text: 'Học bảng chữ Hiragana (46 ký tự cơ bản + đặc biệt)', href: '/nhap-mon/hiragana' },
      { text: 'Học bảng chữ Katakana (46 ký tự cơ bản + đặc biệt)', href: '/nhap-mon/katakana' },
      { text: 'Nắm vững phát âm tiếng Nhật', href: '/nhap-mon/phat-am' },
      { text: 'Kiến thức cơ bản đầu tiên: chào hỏi, số đếm, tự giới thiệu', href: '/nhap-mon/kien-thuc-co-ban' },
    ],
  },
  {
    phase: 'Giai đoạn 2',
    title: 'N5 - Sơ cấp nền tảng',
    duration: '3-6 tháng',
    icon: '📗',
    status: 'available' as const,
    items: [
      { text: 'Từ vựng N5 (~800 từ theo định hướng)', href: '/tu-vung' },
      { text: 'Ngữ pháp N5 (~30 cấu trúc cơ bản)', href: '/ngu-phap' },
      { text: 'Kanji N5 (~100 chữ)', href: '/kanji' },
      { text: 'Luyện nghe cơ bản', href: '/luyen-nghe' },
      { text: 'Hội thoại đơn giản', href: '/hoi-thoai' },
    ],
  },
  {
    phase: 'Giai đoạn 3',
    title: 'N4 - Sơ cấp nâng cao',
    duration: '3-6 tháng',
    icon: '📘',
    status: 'coming_soon' as const,
    items: [
      { text: 'Từ vựng N4 (~1500 từ tích lũy)' },
      { text: 'Ngữ pháp N4 (~50 cấu trúc thêm)' },
      { text: 'Kanji N4 (~300 chữ tích lũy)' },
      { text: 'Đọc đoạn văn ngắn' },
      { text: 'Luyện thi mô phỏng N4' },
    ],
  },
  {
    phase: 'Giai đoạn 4',
    title: 'N3 - Trung cấp',
    duration: '6-12 tháng',
    icon: '📙',
    status: 'coming_soon' as const,
    items: [
      { text: 'Từ vựng N3 (~3000 từ tích lũy)' },
      { text: 'Ngữ pháp N3 (nâng cao)' },
      { text: 'Kanji N3 (~600 chữ tích lũy)' },
      { text: 'Đọc email, tin nhắn, bài viết' },
      { text: 'Nghe hiểu hội thoại tự nhiên' },
    ],
  },
  {
    phase: 'Giai đoạn 5',
    title: 'N2 - Trung cao cấp',
    duration: '6-12 tháng',
    icon: '📕',
    status: 'coming_soon' as const,
    items: [
      { text: 'Từ vựng N2 (~6000 từ tích lũy)' },
      { text: 'Ngữ pháp N2' },
      { text: 'Kanji N2 (~1000 chữ tích lũy)' },
      { text: 'Đọc báo, tài liệu' },
      { text: 'Giao tiếp trong công việc' },
    ],
  },
  {
    phase: 'Giai đoạn 6',
    title: 'N1 - Cao cấp',
    duration: '12+ tháng',
    icon: '📓',
    status: 'coming_soon' as const,
    items: [
      { text: 'Từ vựng N1 (~10000 từ tích lũy)' },
      { text: 'Ngữ pháp N1' },
      { text: 'Kanji N1 (~2000 chữ tích lũy)' },
      { text: 'Đọc hiểu mọi loại văn bản' },
      { text: 'Sử dụng kính ngữ thành thạo' },
    ],
  },
];

export default function GioiThieuPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
        Lộ trình học tiếng Nhật
      </h1>
      <p className="mt-3 text-lg text-muted-foreground">
        Lộ trình được thiết kế cho người Việt Nam, từ chưa biết gì đến trình độ cao cấp.
        Nội dung theo định hướng JLPT nhưng không phải danh sách chính thức.
      </p>

      <div className="mt-8 space-y-8">
        {ROADMAP.map((phase, index) => (
          <div
            key={phase.phase}
            className={`relative pl-8 border-l-2 ${
              phase.status === 'available' ? 'border-primary' : 'border-border'
            }`}
          >
            {/* Timeline dot */}
            <div
              className={`absolute -left-3 top-0 w-6 h-6 rounded-full flex items-center justify-center text-sm ${
                phase.status === 'available'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {index + 1}
            </div>

            <div className="bg-card rounded-xl border border-border p-6">
              <div className="flex items-start justify-between flex-wrap gap-2">
                <div>
                  <span className="text-sm text-muted-foreground">{phase.phase}</span>
                  <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                    <span>{phase.icon}</span>
                    {phase.title}
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">⏱️ {phase.duration}</span>
                  {phase.status === 'available' ? (
                    <span className="text-xs bg-success/10 text-success px-2 py-1 rounded-full font-medium">
                      ✅ Có nội dung
                    </span>
                  ) : (
                    <span className="text-xs bg-warning/10 text-warning px-2 py-1 rounded-full font-medium">
                      ⏳ Đang cập nhật
                    </span>
                  )}
                </div>
              </div>

              <ul className="mt-4 space-y-2">
                {phase.items.map((item) => (
                  <li key={item.text} className="flex items-start gap-2 text-sm">
                    <span className="text-muted-foreground mt-0.5">•</span>
                    {'href' in item && item.href ? (
                      <Link
                        href={item.href}
                        className="text-foreground hover:text-primary transition-colors underline-offset-2 hover:underline"
                      >
                        {item.text}
                      </Link>
                    ) : (
                      <span className="text-muted-foreground">{item.text}</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 p-6 bg-card rounded-xl border border-border">
        <h3 className="font-semibold text-foreground">📌 Lưu ý quan trọng</h3>
        <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
          <li>• Thời gian ước tính dựa trên việc học 30-60 phút mỗi ngày.</li>
          <li>• Số lượng từ vựng và Kanji là con số tham khảo, không phải danh sách chính thức của JLPT.</li>
          <li>• Tốc độ tiến bộ phụ thuộc vào mỗi người. Không nên so sánh với người khác.</li>
          <li>• Nội dung đang được xây dựng dần. Một số giai đoạn chưa có đầy đủ bài học.</li>
          <li>• Điểm luyện tập trên website không tương đương điểm thi JLPT chính thức.</li>
        </ul>
      </div>
    </div>
  );
}
