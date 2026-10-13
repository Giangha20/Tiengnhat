'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useProgress } from '@/components/providers/ProgressProvider';

interface SentencePuzzle {
  id: string;
  vietnamese: string;
  chunks: string[];
  correctOrder: string[];
  explanation: string;
}

const SENTENCE_PUZZLES: SentencePuzzle[] = [
  {
    id: "puz_01",
    vietnamese: "Tôi ăn cơm ở nhà hàng cùng với bạn.",
    chunks: ["友達と", "わたしは", "レストランで", "ご飯を", "食べます"],
    correctOrder: ["わたしは", "友達と", "レストランで", "ご飯を", "食べます"],
    explanation: "Trật tự tự nhiên: [Chủ ngữ: わたしは] + [Đối tượng cùng làm: 友達と] + [Địa điểm: レストランで] + [Tân ngữ: ご飯を] + [Động từ cuối câu: 食べます]."
  },
  {
    id: "puz_02",
    vietnamese: "Hôm qua tôi đã đọc sách ở thư viện.",
    chunks: ["読みました", "本を", "図書館で", "きのう"],
    correctOrder: ["きのう", "図書館で", "本を", "読みました"],
    explanation: "Trật tự: [Thời gian: きのう] + [Địa điểm: 図書館で] + [Tân ngữ: 本を] + [Động từ quá khứ: 読みました]."
  },
  {
    id: "puz_03",
    vietnamese: "Xin vui lòng không chụp ảnh ở đây.",
    chunks: ["撮らないでください", "ここで", "写真を"],
    correctOrder: ["ここで", "写真を", "撮らないでください"],
    explanation: "Cấu trúc cấm/nhắc nhở: [Nơi chốn: ここで] + [Tân ngữ: 写真を] + [V-ないでください: 撮らないでください]."
  }
];

export default function LuyenVietPage() {
  const { progress, updateProgress } = useProgress();
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedChunks, setSelectedChunks] = useState<string[]>([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const currentPuzzle = SENTENCE_PUZZLES[currentIdx];

  const handleAddChunk = (chunk: string) => {
    if (isSubmitted) return;
    setSelectedChunks((prev) => [...prev, chunk]);
  };

  const handleRemoveChunk = (index: number) => {
    if (isSubmitted) return;
    setSelectedChunks((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCheckAnswer = () => {
    if (selectedChunks.length !== currentPuzzle.chunks.length) return;

    const correct = selectedChunks.join('') === currentPuzzle.correctOrder.join('');
    setIsCorrect(correct);
    setIsSubmitted(true);

    if (correct) {
      updateProgress({
        todayItemsLearned: progress.todayItemsLearned + 1,
        totalWordsLearned: progress.totalWordsLearned + 1,
      });
    }
  };

  const handleReset = () => {
    setSelectedChunks([]);
    setIsSubmitted(false);
    setIsCorrect(false);
  };

  const handleNext = () => {
    if (currentIdx < SENTENCE_PUZZLES.length - 1) {
      setCurrentIdx((prev) => prev + 1);
      handleReset();
    }
  };

  const availableChunks = currentPuzzle.chunks.filter((chunk) => {
    const timesInPuzzle = currentPuzzle.chunks.filter((c) => c === chunk).length;
    const timesSelected = selectedChunks.filter((c) => c === chunk).length;
    return timesSelected < timesInPuzzle;
  });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <Link href="/" className="hover:text-primary transition-colors">Trang chủ</Link>
        <span>/</span>
        <span className="text-foreground font-medium">Luyện viết & sắp xếp câu</span>
      </nav>

      {/* Header */}
      <div className="mb-8">
        <div className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-semibold mb-2">
          Kỹ năng viết • Cú pháp SOV
        </div>
        <h1 className="text-3xl font-bold text-foreground">
          Luyện Viết & Sắp Xếp Trật Tự Câu
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Lắp ráp các mảnh từ vựng và trợ từ theo trật tự câu tiếng Nhật chuẩn xác.
        </p>
      </div>

      {/* Main Interactive Card */}
      <div className="bg-card border border-border rounded-3xl p-6 sm:p-10 space-y-8 shadow-sm">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="font-semibold text-primary px-3 py-1 rounded-full bg-primary/10">
            Câu {currentIdx + 1} / {SENTENCE_PUZZLES.length}
          </span>
          <span>Sắp xếp câu chuẩn ngữ pháp</span>
        </div>

        {/* Vietnamese Meaning Prompt */}
        <div className="p-4 bg-secondary/50 rounded-2xl border border-border text-center space-y-1">
          <span className="text-xs text-muted-foreground">Hãy ghép câu mang nghĩa:</span>
          <p className="text-lg sm:text-xl font-bold text-foreground">
            &ldquo;{currentPuzzle.vietnamese}&rdquo;
          </p>
        </div>

        {/* Selected Answer Dropzone */}
        <div className="space-y-2">
          <span className="text-xs text-muted-foreground block">
            Câu bạn đã ghép (Bấm vào từ để gỡ bỏ):
          </span>
          <div className="min-h-[70px] p-3 rounded-2xl border-2 border-dashed border-border bg-background flex flex-wrap items-center gap-2">
            {selectedChunks.length === 0 ? (
              <span className="text-xs text-muted-foreground italic px-2">
                Chạm vào các từ bên dưới theo đúng thứ tự...
              </span>
            ) : (
              selectedChunks.map((chunk, idx) => (
                <button
                  key={idx}
                  disabled={isSubmitted}
                  onClick={() => handleRemoveChunk(idx)}
                  className="ja-text px-4 py-2 bg-primary text-primary-foreground font-bold text-base rounded-xl hover:opacity-90 transition-opacity flex items-center gap-1 shadow-sm"
                >
                  <span>{chunk}</span>
                  {!isSubmitted && <span className="text-xs opacity-70">✕</span>}
                </button>
              ))
            )}
          </div>
        </div>

        {/* Available Chunks Pool */}
        <div className="space-y-2">
          <span className="text-xs text-muted-foreground block">Các từ khả dụng:</span>
          <div className="flex flex-wrap gap-2.5">
            {availableChunks.map((chunk, idx) => (
              <button
                key={idx}
                disabled={isSubmitted}
                onClick={() => handleAddChunk(chunk)}
                className="ja-text px-4 py-2.5 bg-secondary hover:bg-muted border border-border text-foreground font-bold text-base rounded-xl transition-all hover:scale-105 shadow-sm active:scale-95"
              >
                {chunk}
              </button>
            ))}
          </div>
        </div>

        {/* Feedback on Submit */}
        {isSubmitted && (
          <div
            className={`p-4 rounded-2xl border text-xs sm:text-sm leading-relaxed space-y-1.5 animate-in fade-in ${
              isCorrect ? 'border-success/30 bg-success/5 text-success' : 'border-error/30 bg-error/5 text-error'
            }`}
          >
            <p className="font-bold">
              {isCorrect ? '🎉 Hoàn toàn chính xác!' : '❌ Chưa chính xác!'}
            </p>
            <p className="text-foreground">
              Đáp án chuẩn: <strong className="ja-text text-base">{currentPuzzle.correctOrder.join(' ')}</strong>
            </p>
            <p className="text-muted-foreground pt-1">{currentPuzzle.explanation}</p>
          </div>
        )}

        {/* Actions */}
        <div className="pt-4 border-t border-border flex items-center justify-between">
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-secondary text-foreground rounded-xl text-xs font-semibold hover:bg-muted"
          >
            Làm lại câu này
          </button>

          {!isSubmitted ? (
            <button
              disabled={selectedChunks.length !== currentPuzzle.chunks.length}
              onClick={handleCheckAnswer}
              className="px-6 py-2.5 bg-primary text-primary-foreground rounded-xl text-xs font-semibold hover:opacity-90 disabled:opacity-40 shadow"
            >
              Kiểm tra câu
            </button>
          ) : currentIdx < SENTENCE_PUZZLES.length - 1 ? (
            <button
              onClick={handleNext}
              className="px-6 py-2.5 bg-primary text-primary-foreground rounded-xl text-xs font-semibold hover:opacity-90 shadow"
            >
              Câu tiếp theo →
            </button>
          ) : (
            <span className="text-xs font-bold text-success">
              ✓ Đã hoàn thành tất cả câu luyện tập!
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
