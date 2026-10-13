'use client';

import { useState } from 'react';
import Link from 'next/link';
import { speak } from '@/lib/audio';

interface ListeningLesson {
  id: string;
  title: string;
  situation: string;
  audioText: string;
  transcriptJa: string;
  transcriptReading: string;
  transcriptVi: string;
  notes: string[];
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

const LISTENING_LESSONS: ListeningLesson[] = [
  {
    id: "listen_01",
    title: "Bài 1: Cuộc hẹn cuối tuần",
    situation: "Hai người bạn đang bàn về kế hoạch đi chơi vào ngày Chủ nhật.",
    audioText: "あした、いっしょに映画を見に行きませんか。ええ、いいですね。何時に会いましょうか。10時に駅の前で会いましょう。",
    transcriptJa: "A:「あした、いっしょに映画を見に行きませんか。」\nB:「ええ、いいですね。何時に会いましょうか。」\nA:「10時に駅の前で会いましょう。」",
    transcriptReading: "A:「あした、いっしょに えいがを みに いきませんか。」\nB:「ええ、いいですね。なんじに あいましょうか。」\nA:「じゅうじに えきの まえで あいましょう。」",
    transcriptVi: "A: Ngày mai bạn có muốn cùng đi xem phim không?\nB: Được đấy, hay quá. Mấy giờ chúng ta gặp nhau nhỉ?\nA: Gặp nhau lúc 10 giờ ở trước nhà ga nhé.",
    notes: [
      "～ませんか: Lời mời rủ lịch sự (Bạn có muốn... cùng không?).",
      "～ましょう: Lời đề nghị cùng làm gì (Chúng ta hãy làm... nhé)."
    ],
    question: "Hai người hẹn gặp nhau vào lúc mấy giờ và ở địa điểm nào?",
    options: ["10 giờ ở trước nhà ga", "9 giờ ở rạp chiếu phim", "10 giờ ở trong thư viện", "11 giờ ở công viên"],
    correctAnswer: "10 giờ ở trước nhà ga",
    explanation: "Nhân vật A nói rõ ràng: 10時に駅の前で会いましょう (Gặp nhau lúc 10 giờ ở trước nhà ga)."
  },
  {
    id: "listen_02",
    title: "Bài 2: Thông báo tại siêu thị",
    situation: "Thông báo phát thanh thông tin đóng cửa của siêu thị.",
    audioText: "お客様にお知らせいたします。本日の営業時間は午後9時までとなっております。あと10分で閉店いたします。",
    transcriptJa: "「お客様にお知らせいたします。本日の営業時間は午後9時までとなっております。あと10分で閉店いたします。」",
    transcriptReading: "「おきゃくさまに おしらせいたします。ほんじつの えいぎょうじかんは ごごくじまでと なっております。あとじゅっぷんで へいてんいたします。」",
    transcriptVi: "Kính báo quý khách hàng. Giờ mở cửa hôm nay của siêu thị đến 9 giờ tối. Siêu thị sẽ đóng cửa sau 10 phút nữa.",
    notes: [
      "お客様 (Okyakusama): Quý khách hàng (Kính ngữ).",
      "閉店 (Heiten): Đóng cửa ngừng bán."
    ],
    question: "Siêu thị sẽ đóng cửa sau bao nhiêu phút nữa?",
    options: ["10 phút", "15 phút", "20 phút", "30 phút"],
    correctAnswer: "10 phút",
    explanation: "Đoạn thông báo có câu: あと10分で閉店いたします (Sau 10 phút nữa sẽ đóng cửa)."
  }
];

export default function LuyenNghePage() {
  const [activeLessonId, setActiveLessonId] = useState(LISTENING_LESSONS[0].id);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(0.8);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
  const [showTranslation, setShowTranslation] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);

  const lesson = LISTENING_LESSONS.find((l) => l.id === activeLessonId) || LISTENING_LESSONS[0];

  const handlePlayAudio = () => {
    setIsPlaying(true);
    speak({
      text: lesson.audioText,
      rate: playbackSpeed,
      onEnd: () => setIsPlaying(false),
      onError: () => setIsPlaying(false),
    });
  };

  const handleSelectOption = (opt: string) => {
    if (isAnswered) return;
    setSelectedOption(opt);
    setIsAnswered(true);
  };

  const switchLesson = (id: string) => {
    setActiveLessonId(id);
    setSelectedOption(null);
    setIsAnswered(false);
    setShowTranscript(false);
    setShowTranslation(false);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <Link href="/" className="hover:text-primary transition-colors">Trang chủ</Link>
        <span>/</span>
        <span className="text-foreground font-medium">Luyện nghe (Choukai)</span>
      </nav>

      {/* Header */}
      <div className="mb-8">
        <div className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-semibold mb-2">
          Kỹ năng nghe • JLPT N5
        </div>
        <h1 className="text-3xl font-bold text-foreground">
          Luyện Nghe Hiểu Tiếng Nhật
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Rèn luyện phản xạ đôi tai với bài nghe hội thoại đời sống, thông báo công cộng và câu hỏi kiểm tra.
        </p>
      </div>

      {/* TTS Disclaimer */}
      <div className="p-4 rounded-2xl border border-warning/30 bg-warning/5 text-xs text-muted-foreground mb-8">
        <p className="font-bold text-foreground">⚠️ Lưu ý về nguồn âm thanh:</p>
        <p className="mt-0.5">
          Âm thanh phát bài nghe sử dụng công nghệ Web Speech API (tổng hợp giọng đọc TTS). 
          Đây không phải giọng thu âm người bản ngữ thật nên ngữ điệu có thể mang tính chất tham khảo.
        </p>
      </div>

      {/* Lesson Selector */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
        {LISTENING_LESSONS.map((l) => (
          <button
            key={l.id}
            onClick={() => switchLesson(l.id)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
              activeLessonId === l.id
                ? 'bg-primary text-primary-foreground shadow'
                : 'bg-card border border-border text-foreground hover:bg-secondary'
            }`}
          >
            {l.title}
          </button>
        ))}
      </div>

      {/* Main Audio Player Card */}
      <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
        <div>
          <span className="text-xs text-primary font-bold">{lesson.situation}</span>
          <h2 className="text-xl font-bold text-foreground mt-1">{lesson.title}</h2>
        </div>

        {/* Audio Controls */}
        <div className="p-4 bg-secondary/50 rounded-2xl border border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <button
            onClick={handlePlayAudio}
            className={`px-6 py-3 rounded-2xl font-bold text-sm text-white transition-all shadow flex items-center gap-2 ${
              isPlaying ? 'bg-warning animate-pulse' : 'bg-primary hover:opacity-90'
            }`}
          >
            <span>{isPlaying ? '⏸️ Đang phát âm thanh...' : '▶️ Bấm để nghe bài'}</span>
          </button>

          {/* Speed settings */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-muted-foreground font-medium">Tốc độ:</span>
            {[
              { val: 0.65, label: '0.7x (Chậm)' },
              { val: 0.8, label: 'Chuẩn N5' },
              { val: 1.0, label: 'Tự nhiên (1.0x)' },
            ].map((s) => (
              <button
                key={s.val}
                onClick={() => setPlaybackSpeed(s.val)}
                className={`px-2.5 py-1.5 rounded-lg border font-medium ${
                  playbackSpeed === s.val
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-card text-foreground hover:bg-muted'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Question Area */}
        <div className="space-y-4 pt-2">
          <h3 className="font-bold text-base text-foreground flex items-center gap-2">
            <span>❓</span> {lesson.question}
          </h3>

          <div className="space-y-2.5">
            {lesson.options.map((opt) => {
              const isSelected = selectedOption === opt;
              const isCorrect = opt === lesson.correctAnswer;

              let style = 'border-border bg-background hover:border-primary/50';
              if (isAnswered) {
                if (isCorrect) {
                  style = 'border-success bg-success/10 text-success font-bold';
                } else if (isSelected && !isCorrect) {
                  style = 'border-error bg-error/10 text-error';
                } else {
                  style = 'border-border bg-background opacity-50';
                }
              }

              return (
                <button
                  key={opt}
                  disabled={isAnswered}
                  onClick={() => handleSelectOption(opt)}
                  className={`w-full p-3.5 rounded-2xl border text-left text-sm transition-all flex items-center justify-between ${style}`}
                >
                  <span>{opt}</span>
                  {isAnswered && isCorrect && <span className="text-success font-bold">✓</span>}
                  {isAnswered && isSelected && !isCorrect && <span className="text-error font-bold">✕</span>}
                </button>
              );
            })}
          </div>

          {/* Explanation after answer */}
          {isAnswered && (
            <div className="p-4 rounded-2xl bg-secondary/50 border border-border text-xs leading-relaxed space-y-1 animate-in fade-in">
              <span className="font-bold text-foreground">Lời giải chi tiết:</span>
              <p className="text-muted-foreground">{lesson.explanation}</p>
            </div>
          )}
        </div>

        {/* Transcript Toggles */}
        <div className="pt-4 border-t border-border flex flex-wrap gap-2 text-xs">
          <button
            onClick={() => setShowTranscript(!showTranscript)}
            className="px-3 py-1.5 bg-secondary text-foreground rounded-lg hover:bg-muted font-medium"
          >
            {showTranscript ? 'Ẩn bản chép lời (Transcript)' : 'Xem bản chép lời (Transcript)'}
          </button>
          <button
            onClick={() => setShowTranslation(!showTranslation)}
            className="px-3 py-1.5 bg-secondary text-foreground rounded-lg hover:bg-muted font-medium"
          >
            {showTranslation ? 'Ẩn dịch nghĩa tiếng Việt' : 'Xem dịch nghĩa tiếng Việt'}
          </button>
        </div>

        {/* Transcript Display */}
        {showTranscript && (
          <div className="p-4 rounded-2xl bg-secondary/30 border border-border space-y-3 text-xs animate-in fade-in">
            <span className="font-bold text-foreground block">Bản chép lời tiếng Nhật:</span>
            <p className="ja-text text-sm font-semibold text-foreground whitespace-pre-line leading-relaxed">
              {lesson.transcriptJa}
            </p>
            <p className="ja-text text-xs text-muted-foreground whitespace-pre-line">
              {lesson.transcriptReading}
            </p>
          </div>
        )}

        {/* Translation Display */}
        {showTranslation && (
          <div className="p-4 rounded-2xl bg-secondary/30 border border-border space-y-1 text-xs animate-in fade-in">
            <span className="font-bold text-foreground block">Bản dịch tiếng Việt:</span>
            <p className="text-muted-foreground whitespace-pre-line leading-relaxed">
              {lesson.transcriptVi}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
