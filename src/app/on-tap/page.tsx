'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useProgress } from '@/components/providers/ProgressProvider';
import n5VocabRaw from '@/data/vocabulary/n5-vocabulary.json';
import n5KanjiRaw from '@/data/kanji/n5-kanji.json';
import { speak } from '@/lib/audio';

interface VocabItem {
  id: string;
  word: string;
  reading: string;
  meaning: string;
  exampleJa: string;
  exampleVi: string;
}

interface KanjiItem {
  id: string;
  character: string;
  sinoVietnamese: string;
  meaning: string;
  onReading: string[];
  kunReading: string[];
}

export default function OnTapPage() {
  const { progress, recordReview, isLoaded } = useProgress();
  const [filterType, setFilterType] = useState<'all' | 'vocabulary' | 'kanji'>('all');
  const [isFlipped, setIsFlipped] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Flatten vocabularies
  const allVocabMap = useMemo(() => {
    const map = new Map<string, VocabItem>();
    n5VocabRaw.topics.forEach((t) => {
      t.words.forEach((w) => {
        map.set(w.id, {
          id: w.id,
          word: w.word,
          reading: w.reading,
          meaning: w.meaning,
          exampleJa: w.exampleJa,
          exampleVi: w.exampleVi,
        });
      });
    });
    return map;
  }, []);

  // Kanji map
  const allKanjiMap = useMemo(() => {
    const map = new Map<string, KanjiItem>();
    n5KanjiRaw.kanji.forEach((k) => {
      map.set(k.id, {
        id: k.id,
        character: k.character,
        sinoVietnamese: k.sinoVietnamese,
        meaning: k.meaning,
        onReading: k.onReading,
        kunReading: k.kunReading,
      });
    });
    return map;
  }, []);

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Items due for review or in queue
  const dueItems = useMemo(() => {
    if (!mounted) return [];
    const now = new Date();

    return progress.reviewQueue.filter((item) => {
      if (filterType !== 'all' && item.itemType !== filterType) {
        return false;
      }

      // If nextReviewAt is null or past now, it's due
      if (!item.nextReviewAt) return true;
      return new Date(item.nextReviewAt) <= now;
    });
  }, [progress.reviewQueue, filterType, mounted]);

  const currentItem = dueItems[currentIndex];

  const handleRate = (correct: boolean) => {
    if (!currentItem) return;

    recordReview(currentItem.itemId, currentItem.itemType, correct);
    setIsFlipped(false);

    if (currentIndex < dueItems.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setCurrentIndex(0);
    }
  };

  const playSound = (text: string) => {
    speak({ text });
  };

  if (!isLoaded || !mounted) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center text-muted-foreground">
        Đang tải hàng đợi ôn tập...
      </div>
    );
  }

  // Get content details of current item
  let frontText = '';
  let subFront = '';
  let backText = '';
  let extraBack = '';

  if (currentItem) {
    if (currentItem.itemType === 'vocabulary') {
      const v = allVocabMap.get(currentItem.itemId);
      if (v) {
        frontText = v.word;
        subFront = v.reading !== v.word ? v.reading : '';
        backText = v.meaning;
        extraBack = v.exampleJa ? `${v.exampleJa} (${v.exampleVi})` : '';
      } else {
        frontText = currentItem.itemId;
        backText = 'Từ vựng N5';
      }
    } else if (currentItem.itemType === 'kanji') {
      const k = allKanjiMap.get(currentItem.itemId);
      if (k) {
        frontText = k.character;
        subFront = `${k.sinoVietnamese}`;
        backText = k.meaning;
        extraBack = `On: ${k.onReading.join(', ')} | Kun: ${k.kunReading.join(', ')}`;
      } else {
        frontText = currentItem.itemId;
        backText = 'Chữ Hán';
      }
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <Link href="/" className="hover:text-primary transition-colors">Trang chủ</Link>
        <span>/</span>
        <span className="text-foreground font-medium">Ôn tập ngắt quãng (SRS)</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-semibold mb-2">
            Thuật toán SM-2 • Spaced Repetition
          </div>
          <h1 className="text-3xl font-bold text-foreground">
            Ôn Tập Thông Minh
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Lặp lại ngắt quãng dựa trên khoa học thần kinh trí nhớ: ôn lại ngay trước khi bạn chuẩn bị quên.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex gap-2">
          {(['all', 'vocabulary', 'kanji'] as const).map((type) => (
            <button
              key={type}
              onClick={() => {
                setFilterType(type);
                setCurrentIndex(0);
                setIsFlipped(false);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                filterType === type
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-foreground hover:bg-muted'
              }`}
            >
              {type === 'all' ? 'Tất cả' : type === 'vocabulary' ? 'Từ vựng' : 'Kanji'}
            </button>
          ))}
        </div>
      </div>

      {/* Main Review Arena */}
      {dueItems.length === 0 ? (
        <div className="text-center py-20 bg-card rounded-2xl border border-border p-6 space-y-4">
          <p className="text-5xl">🎉</p>
          <h2 className="text-2xl font-bold text-foreground">
            Không có mục nào cần ôn tập lúc này!
          </h2>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            {progress.reviewQueue.length === 0
              ? 'Bạn chưa học từ vựng hay Kanji nào. Hãy vào trang Từ vựng hoặc Kanji để bắt đầu học và thêm vào danh sách ôn.'
              : 'Tuyệt vời! Bạn đã hoàn thành tất cả các thẻ đến hạn hôm nay. Hãy quay lại vào ngày mai theo lịch giãn cách.'}
          </p>
          <div className="pt-2 flex justify-center gap-3">
            <Link
              href="/tu-vung"
              className="px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:opacity-90"
            >
              Học từ vựng mới
            </Link>
            <Link
              href="/kanji"
              className="px-5 py-2.5 bg-secondary text-foreground rounded-xl text-sm font-semibold hover:bg-muted"
            >
              Học Kanji
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Progress Header */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              Thẻ <strong>{currentIndex + 1}</strong> / {dueItems.length} cần ôn
            </span>
            <span>
              Độ nhớ (Ease Factor): {currentItem?.easeFactor.toFixed(2)} • Khoảng cách: {currentItem?.interval} ngày
            </span>
          </div>

          <div className="progress-bar">
            <div
              className="progress-bar-fill"
              style={{ width: `${((currentIndex + 1) / dueItems.length) * 100}%` }}
            />
          </div>

          {/* Flashcard Area */}
          <div
            onClick={() => setIsFlipped(!isFlipped)}
            className="w-full min-h-[320px] sm:min-h-[380px] bg-card border-2 border-border hover:border-primary/40 rounded-3xl p-8 cursor-pointer shadow-lg transition-all flex flex-col items-center justify-center text-center relative select-none"
          >
            <span className="absolute top-4 right-4 text-xs font-semibold px-2.5 py-1 rounded-full bg-secondary text-muted-foreground">
              {currentItem?.itemType === 'vocabulary' ? 'Từ vựng' : 'Kanji'} • Lần ôn #{currentItem?.repetitions}
            </span>

            {!isFlipped ? (
              // Front side
              <div className="space-y-4">
                <span className="ja-text text-6xl sm:text-7xl font-bold text-foreground block">
                  {frontText}
                </span>
                {subFront && (
                  <p className="ja-text text-lg text-primary font-medium">{subFront}</p>
                )}
                <p className="text-xs text-muted-foreground mt-4">
                  (Nhấp chuột hoặc chạm màn hình để xem nghĩa)
                </p>
              </div>
            ) : (
              // Back side
              <div className="space-y-4 animate-in fade-in duration-200">
                <span className="ja-text text-4xl sm:text-5xl font-bold text-primary block">
                  {frontText}
                </span>
                <p className="text-2xl font-bold text-foreground">{backText}</p>
                {extraBack && (
                  <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed mt-2 bg-secondary/50 p-3 rounded-xl border border-border">
                    {extraBack}
                  </p>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    playSound(frontText);
                  }}
                  className="px-3 py-1.5 bg-secondary hover:bg-muted text-foreground text-xs rounded-xl font-medium inline-flex items-center gap-1.5"
                >
                  🔊 Nghe phát âm
                </button>
              </div>
            )}
          </div>

          {/* Rating Action Controls */}
          {isFlipped ? (
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => handleRate(false)}
                className="py-3 px-4 rounded-xl border-2 border-error/30 bg-error/10 hover:bg-error/20 text-error font-bold text-sm transition-all flex flex-col items-center justify-center"
              >
                <span>Chưa nhớ / Quên</span>
                <span className="text-[11px] font-normal opacity-80 mt-0.5">Ôn lại ngay ngày mai</span>
              </button>

              <button
                onClick={() => handleRate(true)}
                className="py-3 px-4 rounded-xl border-2 border-success/30 bg-success/10 hover:bg-success/20 text-success font-bold text-sm transition-all flex flex-col items-center justify-center"
              >
                <span>Đã nhớ tốt</span>
                <span className="text-[11px] font-normal opacity-80 mt-0.5">Giãn cách thêm {Math.max(1, Math.round((currentItem?.interval || 1) * (currentItem?.easeFactor || 2.5)))} ngày</span>
              </button>
            </div>
          ) : (
            <div className="text-center">
              <button
                onClick={() => setIsFlipped(true)}
                className="px-8 py-3 bg-primary text-primary-foreground font-semibold rounded-xl text-sm shadow hover:opacity-90"
              >
                Lật thẻ xem đáp án
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
