'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import kanjiDataRaw from '@/data/kanji/n5-kanji.json';
import { useProgress } from '@/components/providers/ProgressProvider';
import { speak } from '@/lib/audio';

interface Compound {
  word: string;
  reading: string;
  meaning: string;
}

interface ExampleSentence {
  japanese: string;
  reading: string;
  vietnamese: string;
}

interface KanjiItem {
  id: string;
  character: string;
  sinoVietnamese: string;
  meaning: string;
  onReading: string[];
  kunReading: string[];
  radical: string;
  strokeCount: number;
  level: string;
  compounds: Compound[];
  exampleSentences: ExampleSentence[];
  similarKanji: string[];
  verificationStatus: string;
}

export default function KanjiPage() {
  const kanjiList = kanjiDataRaw.kanji as KanjiItem[];
  const { progress, markItemLearned, getItemStatus } = useProgress();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedKanji, setSelectedKanji] = useState<KanjiItem | null>(null);
  const [strokeFilter, setStrokeFilter] = useState<number | 'all'>('all');
  const [quizQuestion, setQuizQuestion] = useState<{
    kanji: KanjiItem;
    options: string[];
    correct: string;
    answered: string | null;
  } | null>(null);

  // Filtered Kanji list
  const filteredKanji = useMemo(() => {
    return kanjiList.filter((k) => {
      const matchQuery =
        k.character.includes(searchQuery.trim()) ||
        k.sinoVietnamese.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
        k.meaning.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
        k.onReading.some((r) => r.includes(searchQuery.trim())) ||
        k.kunReading.some((r) => r.includes(searchQuery.trim()));

      const matchStroke = strokeFilter === 'all' || k.strokeCount === strokeFilter;

      return matchQuery && matchStroke;
    });
  }, [kanjiList, searchQuery, strokeFilter]);

  // Stroke counts available
  const availableStrokes = useMemo(() => {
    const counts = new Set(kanjiList.map((k) => k.strokeCount));
    return Array.from(counts).sort((a, b) => a - b);
  }, [kanjiList]);

  // Start quick quiz
  const startQuiz = () => {
    if (kanjiList.length < 4) return;
    const randomKanji = kanjiList[Math.floor(Math.random() * kanjiList.length)];
    const wrongOptions = kanjiList
      .filter((k) => k.id !== randomKanji.id)
      .sort(() => 0.5 - Math.random())
      .slice(0, 3)
      .map((k) => `${k.sinoVietnamese} (${k.meaning})`);

    const correctOption = `${randomKanji.sinoVietnamese} (${randomKanji.meaning})`;
    const options = [...wrongOptions, correctOption].sort(() => 0.5 - Math.random());

    setQuizQuestion({
      kanji: randomKanji,
      options,
      correct: correctOption,
      answered: null,
    });
  };

  const playSound = (text: string) => {
    speak({ text });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <Link href="/" className="hover:text-primary transition-colors">Trang chủ</Link>
        <span>/</span>
        <span className="text-foreground font-medium">Kanji N5</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-semibold mb-2">
            Chữ Hán • JLPT N5
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
            Học Chữ Hán (Kanji) Cho Người Việt
          </h1>
          <p className="mt-2 text-muted-foreground max-w-2xl text-sm leading-relaxed">
            Học chữ Hán qua âm Hán-Việt là lợi thế cực lớn của người Việt Nam. Hiểu rõ quy luật âm On (Âm Hán), âm Kun (Âm thuần Nhật), bộ thủ và các từ ghép thực tế.
          </p>
        </div>

        {/* Quick Quiz Trigger */}
        <button
          onClick={startQuiz}
          className="px-5 py-2.5 bg-primary text-primary-foreground font-medium rounded-xl hover:opacity-90 transition-opacity shadow text-sm flex items-center justify-center gap-2 self-start md:self-auto"
        >
          🎯 Thử thách nhận diện Kanji
        </button>
      </div>

      {/* Verification Notice */}
      <div className="p-4 rounded-xl border border-border bg-card mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded bg-success/10 text-success font-semibold">Đã xác minh</span>
          <span className="text-muted-foreground">
            Dữ liệu bao gồm {kanjiList.length} chữ Hán N5 cơ bản kèm từ ghép và câu ứng dụng thực tế.
          </span>
        </div>
        <span className="text-muted-foreground italic">
          *Hoạt ảnh thứ tự nét viết đang được chuẩn bị tích hợp SVG chuẩn.
        </span>
      </div>

      {/* Search & Filters */}
      <div className="bg-card rounded-2xl border border-border p-4 sm:p-6 mb-8 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Tìm theo chữ Hán (日), âm Hán Việt (NHẬT), nghĩa (mặt trời) hoặc âm On/Kun..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2.5 pl-10 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <svg
              className="w-4 h-4 text-muted-foreground absolute left-3.5 top-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-xs text-muted-foreground hover:text-foreground px-1.5 py-0.5"
              >
                ✕
              </button>
            )}
          </div>

          {/* Stroke count filter */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            <span className="text-xs text-muted-foreground whitespace-nowrap">Số nét:</span>
            <button
              onClick={() => setStrokeFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                strokeFilter === 'all'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-foreground hover:bg-muted'
              }`}
            >
              Tất cả
            </button>
            {availableStrokes.map((s) => (
              <button
                key={s}
                onClick={() => setStrokeFilter(s)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                  strokeFilter === s
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-foreground hover:bg-muted'
                }`}
              >
                {s} nét
              </button>
            ))}
          </div>
        </div>

        <div className="text-xs text-muted-foreground">
          Hiển thị <strong>{filteredKanji.length}</strong> / {kanjiList.length} chữ Hán
        </div>
      </div>

      {/* Kanji Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {filteredKanji.map((kanji) => {
          const status = getItemStatus(kanji.id, 'kanji');
          const isMastered = status === 'mastered';
          const isLearning = status === 'learning' || status === 'reviewing';

          return (
            <div
              key={kanji.id}
              onClick={() => setSelectedKanji(kanji)}
              className="group relative bg-card border border-border hover:border-primary rounded-2xl p-4 cursor-pointer transition-all hover:shadow-md flex flex-col justify-between"
            >
              {/* Top tags */}
              <div className="flex items-center justify-between text-[11px] mb-2">
                <span className="font-bold text-primary">{kanji.sinoVietnamese}</span>
                <span className="text-muted-foreground">{kanji.strokeCount} nét</span>
              </div>

              {/* Character display */}
              <div className="text-center py-2">
                <span className="ja-text text-5xl font-bold text-foreground group-hover:text-primary transition-colors">
                  {kanji.character}
                </span>
                <p className="text-xs text-muted-foreground mt-2 font-medium line-clamp-1">
                  {kanji.meaning}
                </p>
              </div>

              {/* On/Kun quick view */}
              <div className="mt-3 pt-2 border-t border-border text-[11px] space-y-1 text-muted-foreground">
                <div className="truncate">
                  <span className="font-semibold text-foreground">On:</span> {kanji.onReading.join(', ')}
                </div>
                <div className="truncate">
                  <span className="font-semibold text-foreground">Kun:</span> {kanji.kunReading.join(', ')}
                </div>
              </div>

              {/* Learning status badge */}
              <div className="mt-2 text-right">
                {isMastered && (
                  <span className="text-[10px] bg-success/10 text-success px-1.5 py-0.5 rounded font-medium">
                    ✓ Đã thuộc
                  </span>
                )}
                {isLearning && (
                  <span className="text-[10px] bg-warning/10 text-warning px-1.5 py-0.5 rounded font-medium">
                    Đang học
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredKanji.length === 0 && (
        <div className="text-center py-16 bg-card rounded-2xl border border-border">
          <p className="text-3xl mb-2">🔍</p>
          <h3 className="text-base font-semibold text-foreground">Không tìm thấy chữ Hán phù hợp</h3>
          <p className="text-xs text-muted-foreground mt-1">Vui lòng thử tìm với từ khóa hoặc số nét khác.</p>
        </div>
      )}

      {/* Kanji Detail Modal */}
      {selectedKanji && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSelectedKanji(null)}
        >
          <div
            className="bg-card border border-border rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl space-y-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <span className="ja-text text-6xl font-bold text-primary bg-primary/5 w-20 h-20 rounded-2xl flex items-center justify-center border border-primary/20">
                  {selectedKanji.character}
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-foreground">
                      {selectedKanji.sinoVietnamese}
                    </span>
                    <button
                      onClick={() => playSound(selectedKanji.character)}
                      className="p-1.5 rounded-lg bg-secondary hover:bg-muted text-sm"
                      title="Nghe phát âm"
                    >
                      🔊
                    </button>
                  </div>
                  <p className="text-sm font-medium text-muted-foreground mt-0.5">
                    Nghĩa: {selectedKanji.meaning}
                  </p>
                  <div className="flex gap-2 text-xs text-muted-foreground mt-2">
                    <span className="bg-secondary px-2 py-0.5 rounded font-mono">
                      Bộ thủ: {selectedKanji.radical}
                    </span>
                    <span className="bg-secondary px-2 py-0.5 rounded font-mono">
                      {selectedKanji.strokeCount} nét
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedKanji(null)}
                className="text-muted-foreground hover:text-foreground text-xl p-1"
              >
                ✕
              </button>
            </div>

            {/* Readings */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div className="p-3 bg-background rounded-xl border border-border">
                <span className="text-xs font-bold text-primary block mb-1">
                  Âm On (Katakana - Âm Hán Nhật):
                </span>
                <p className="ja-text font-bold text-base text-foreground">
                  {selectedKanji.onReading.join('、 ')}
                </p>
                <p className="text-[11px] text-muted-foreground mt-1">Thường dùng khi ghép từ với Kanji khác.</p>
              </div>

              <div className="p-3 bg-background rounded-xl border border-border">
                <span className="text-xs font-bold text-info block mb-1">
                  Âm Kun (Hiragana - Âm thuần Nhật):
                </span>
                <p className="ja-text font-bold text-base text-foreground">
                  {selectedKanji.kunReading.join('、 ')}
                </p>
                <p className="text-[11px] text-muted-foreground mt-1">Thường dùng khi Kanji đứng độc lập.</p>
              </div>
            </div>

            {/* Compounds */}
            <div>
              <h3 className="font-bold text-sm text-foreground mb-3 flex items-center gap-2">
                <span>📚</span> Từ ghép thường gặp trong đời sống & JLPT:
              </h3>
              <div className="space-y-2">
                {selectedKanji.compounds.map((c) => (
                  <div
                    key={c.word}
                    className="p-3 bg-background rounded-xl border border-border flex items-center justify-between text-sm"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="ja-text font-bold text-base text-foreground">{c.word}</span>
                        <span className="ja-text text-xs text-muted-foreground">({c.reading})</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{c.meaning}</p>
                    </div>
                    <button
                      onClick={() => playSound(c.word)}
                      className="text-xs px-2.5 py-1 bg-secondary hover:bg-muted rounded-lg font-medium"
                    >
                      🔊
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Example sentence */}
            {selectedKanji.exampleSentences.length > 0 && (
              <div>
                <h3 className="font-bold text-sm text-foreground mb-2 flex items-center gap-2">
                  <span>💬</span> Câu ví dụ:
                </h3>
                {selectedKanji.exampleSentences.map((ex, i) => (
                  <div key={i} className="p-3 bg-secondary/40 rounded-xl border border-border text-xs space-y-1">
                    <p className="ja-text font-semibold text-sm text-foreground">{ex.japanese}</p>
                    <p className="ja-text text-muted-foreground">{ex.reading}</p>
                    <p className="text-foreground">{ex.vietnamese}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Actions */}
            <div className="pt-2 border-t border-border flex justify-between items-center">
              <button
                onClick={() => {
                  markItemLearned(selectedKanji.id, 'kanji');
                }}
                className="px-4 py-2 bg-success text-white rounded-xl text-xs font-semibold hover:opacity-90 transition-opacity"
              >
                ✓ Đánh dấu đã học
              </button>
              <button
                onClick={() => setSelectedKanji(null)}
                className="px-4 py-2 bg-secondary text-foreground rounded-xl text-xs font-semibold hover:bg-muted"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quiz Modal */}
      {quizQuestion && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setQuizQuestion(null)}
        >
          <div
            className="bg-card border border-border rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-6 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <span className="text-xs font-semibold text-primary uppercase">Thử thách nhận diện Kanji</span>
              <p className="text-xs text-muted-foreground mt-1">Chữ Hán này có nghĩa và âm Hán Việt là gì?</p>
            </div>

            <div className="py-4">
              <span className="ja-text text-7xl font-bold text-foreground">
                {quizQuestion.kanji.character}
              </span>
            </div>

            <div className="space-y-2 text-left">
              {quizQuestion.options.map((opt) => {
                const isSelected = quizQuestion.answered === opt;
                const isCorrect = opt === quizQuestion.correct;
                const hasAnswered = quizQuestion.answered !== null;

                let btnStyle = 'border-border bg-background hover:border-primary';
                if (hasAnswered) {
                  if (isCorrect) {
                    btnStyle = 'border-success bg-success/10 text-success font-semibold';
                  } else if (isSelected) {
                    btnStyle = 'border-error bg-error/10 text-error';
                  }
                }

                return (
                  <button
                    key={opt}
                    disabled={hasAnswered}
                    onClick={() => {
                      setQuizQuestion((prev) => (prev ? { ...prev, answered: opt } : null));
                      if (opt === quizQuestion.correct) {
                        markItemLearned(quizQuestion.kanji.id, 'kanji');
                      }
                    }}
                    className={`w-full p-3 rounded-xl border text-sm text-foreground transition-all flex items-center justify-between ${btnStyle}`}
                  >
                    <span>{opt}</span>
                    {hasAnswered && isCorrect && <span>✓</span>}
                    {hasAnswered && isSelected && !isCorrect && <span>✕</span>}
                  </button>
                );
              })}
            </div>

            {quizQuestion.answered && (
              <div className="pt-2 flex gap-2">
                <button
                  onClick={startQuiz}
                  className="flex-1 py-2.5 bg-primary text-primary-foreground rounded-xl text-xs font-semibold hover:opacity-90"
                >
                  Câu tiếp theo →
                </button>
                <button
                  onClick={() => setQuizQuestion(null)}
                  className="px-4 py-2.5 bg-secondary text-foreground rounded-xl text-xs font-semibold"
                >
                  Dừng
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
