import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Nhập Môn Tiếng Nhật - NihongoMaster',
  description:
    'Bắt đầu học tiếng Nhật từ con số 0: Bảng chữ cái Hiragana, Katakana, quy tắc phát âm chuẩn và kiến thức nền tảng.',
};

export default function NhapMonLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
