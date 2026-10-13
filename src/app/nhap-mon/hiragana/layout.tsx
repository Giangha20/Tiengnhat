import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Bảng Chữ Cái Hiragana Đầy Đủ & Chi Tiết - Học & Luyện Tập',
  description:
    'Học bảng chữ cái Hiragana 104 ký tự đầy đủ: cách đọc, phát âm audio chuẩn, số nét viết, từ vựng ví dụ và bài tập trắc nghiệm romaji.',
};

export default function HiraganaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
