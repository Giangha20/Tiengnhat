'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import vocabDataRaw from '@/data/vocabulary/n5-vocabulary.json';
import type {
  VocabularyData,
  VocabularyWord,
  LearningStatus,
} from '@/types';
import { speak } from '@/lib/audio';
import { useProgress } from '@/components/providers/ProgressProvider';

const vocabData = vocabDataRaw as unknown as VocabularyData;

interface CardItem extends VocabularyWord {
  topicName: string;
  topicId: string;
}

type StatusFilter = 'all' | 'new' | 'learning' | 'reviewing' | 'mastered';

export default function FlashcardPage() {
  const { getItemStatus, recordReview, progress } = useProgress();

  // Flatten all words with topic information
  const allCards = useMemo<CardItem[]>(() => {
    const list: CardItem[] = [];
    if (!vocabData?.topics) return list;

    for (const topic of vocabData.topics) {
      for (const word of topic.words) {
        list.push({
          ...word,
          topicName: topic.name,
          topicId: topic.id,
        });
      }
    }
    return list;
  }, []);

  // Filter states
  const [selectedTopicId, setSelectedTopicId] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<StatusFilter>('all');

  // Deck state
  const [shuffledIndices, setShuffledIndices] = useState<number[] | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [ratingFeedback, setRatingFeedback] = useState<'forgot' | 'hard' | 'remembered' | null>(null);

  // Filter cards based on topic & learning status
  const filteredCards = useMemo(() => {
    return allCards.filter((card) => {
      // Filter by topic
      if (selectedTopicId !== 'all' && card.topicId !== selectedTopicId) {
        return false;
      }

      // Filter by learning status
      if (selectedStatus !== 'all') {
        const status = getItemStatus(card.id, 'vocabulary');
        if (selectedStatus === 'new' && status !== 'new') return false;
        if (selectedStatus === 'learning' && status !== 'learning') return false;
        if (selectedStatus === 'reviewing' && status !== 'reviewing') return false;
        if (selectedStatus === 'mastered' && status !== 'mastered') return false;
      }

      return true;
    });
  }, [allCards, selectedTopicId, selectedStatus, getItemStatus]);

  const totalCards = filteredCards.length;
  const safeIndex = totalCards > 0 ? currentIndex % totalCards : 0;
  const currentCardIndex = shuffledIndices ? (shuffledIndices[safeIndex] ?? safeIndex) : safeIndex;
  const currentCard: CardItem | undefined = filteredCards[currentCardIndex];

  const handleTopicChange = (topicId: string) => {
    setSelectedTopicId(topicId);
    setCurrentIndex(0);
    setIsFlipped(false);
    setShuffledIndices(null);
  };

  const handleStatusChange = (status: StatusFilter) => {
    setSelectedStatus(status);
    setCurrentIndex(0);
    setIsFlipped(false);
    setShuffledIndices(null);
  };

  // Flip card
  const handleFlip = useCallback(() => {
    setIsFlipped((prev) => !prev);
  }, []);

  // Navigation handlers
  const handleNext = useCallback(() => {
    if (totalCards === 0) return;
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % totalCards);
  }, [totalCards]);

  const handlePrev = useCallback(() => {
    if (totalCards === 0) return;
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + totalCards) % totalCards);
  }, [totalCards]);

  // Audio speech
  const handlePlayAudio = useCallback(
    (textToSpeak?: string) => {
      const text = textToSpeak || currentCard?.word;
      if (!text) return;

      setIsPlayingAudio(true);
      speak({
        text,
        rate: 0.8,
        onEnd: () => setIsPlayingAudio(false),
        onError: () => setIsPlayingAudio(false),
      });
    },
    [currentCard]
  );

  // Shuffle deck
  const handleShuffle = useCallback(() => {
    if (totalCards <= 1) return;
    setIsFlipped(false);
    const indices = [...Array(totalCards).keys()];
    // Fisher-Yates shuffle
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    setShuffledIndices(indices);
    setCurrentIndex(0);
  }, [totalCards]);

  // SRS Rating
  const handleRating = useCallback(
    (rating: 'forgot' | 'hard' | 'remembered') => {
      if (!currentCard) return;

      setRatingFeedback(rating);

      // SM-2 mapping: 'forgot' -> false, 'hard' -> false, 'remembered' -> true
      const isCorrect = rating === 'remembered';
      recordReview(currentCard.id, 'vocabulary', isCorrect);

      // Brief feedback, then advance to next card
      setTimeout(() => {
        setRatingFeedback(null);
        setIsFlipped(false);
        if (totalCards > 0) {
          setCurrentIndex((prev) => (prev + 1) % totalCards);
        }
      }, 350);
    },
    [currentCard, recordReview, totalCards]
  );

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target?.tagName === 'INPUT' ||
        target?.tagName === 'TEXTAREA' ||
        target?.tagName === 'SELECT'
      ) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        handleFlip();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      } else if (e.key === '1') {
        e.preventDefault();
        handleRating('forgot');
      } else if (e.key === '2') {
        e.preventDefault();
        handleRating('hard');
      } else if (e.key === '3') {
        e.preventDefault();
        handleRating('remembered');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleFlip, handlePrev, handleNext, handleRating]);

  // Calculate learning stats for the badges
  const currentStatus: LearningStatus = currentCard
    ? getItemStatus(currentCard.id, 'vocabulary')
    : 'new';

  const getStatusLabel = (status: LearningStatus) => {
    switch (status) {
      case 'mastered':
        return { label: 'Đã thuộc', class: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/30' };
      case 'reviewing':
        return { label: 'Đang ôn tập', class: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30' };
      case 'learning':
        return { label: 'Đang học', class: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/30' };
      default:
        return { label: 'Từ mới', class: 'bg-secondary text-muted-foreground border-border' };
    }
  };

  const progressPercent = totalCards > 0 ? Math.round(((currentIndex + 1) / totalCards) * 100) : 0;

  return (
    <div className="min-h-screen bg-background py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
            <span>🗂️ Flashcard Từ vựng JLPT N5</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
            Thẻ ghi nhớ từ vựng
          </h1>
          <p className="text-sm text-muted-foreground max-w-xl mx-auto">
            Luyện tập ghi nhớ từ vựng với phương pháp lặp lại ngắt quãng (Spaced Repetition). Hỗ trợ phím tắt và phát âm chuẩn.
          </p>
        </div>

        {/* Filter Controls Bar */}
        <div className="bg-card border border-border rounded-xl p-4 sm:p-5 shadow-sm space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Topic Filter */}
            <div>
              <label htmlFor="topic-select" className="block text-xs font-semibold text-muted-foreground mb-1.5">
                Chủ đề từ vựng:
              </label>
              <select
                id="topic-select"
                value={selectedTopicId}
                onChange={(e) => handleTopicChange(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all">Tất cả chủ đề ({allCards.length} từ)</option>
                {vocabData.topics.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.nameJa}) - {t.words.length} từ
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label htmlFor="status-select" className="block text-xs font-semibold text-muted-foreground mb-1.5">
                Trạng thái ghi nhớ:
              </label>
              <select
                id="status-select"
                value={selectedStatus}
                onChange={(e) => handleStatusChange(e.target.value as StatusFilter)}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="new">Từ mới (chưa học)</option>
                <option value="learning">Đang học</option>
                <option value="reviewing">Cần ôn tập</option>
                <option value="mastered">Đã thuộc</option>
              </select>
            </div>
          </div>

          {/* Quick Deck Info & Actions */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-border text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-foreground">
                Tổng số thẻ: {totalCards}
              </span>
              <span>•</span>
              <span>Đã ôn hôm nay: {progress.todayItemsReviewed}</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleShuffle}
                disabled={totalCards <= 1}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-secondary hover:bg-muted text-foreground transition-colors disabled:opacity-50 text-xs font-medium"
                title="Xáo trộn thứ tự các thẻ"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Xáo trộn
              </button>
            </div>
          </div>
        </div>

        {/* Progress Bar & Counter */}
        {totalCards > 0 && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
              <span>Tiến độ học</span>
              <span className="text-foreground font-mono">
                Thẻ {currentIndex + 1} / {totalCards} ({progressPercent}%)
              </span>
            </div>
            <div className="progress-bar">
              <div
                className="progress-bar-fill"
                style={{ width: `${progressPercent}%` }}
                role="progressbar"
                aria-valuenow={progressPercent}
                aria-valuemin={0}
                aria-valuemax={100}
              />
            </div>
          </div>
        )}

        {/* Empty State */}
        {totalCards === 0 ? (
          <div className="bg-card border border-border rounded-2xl p-12 text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-secondary flex items-center justify-center text-3xl">
              📭
            </div>
            <h3 className="text-lg font-bold text-foreground">Không có thẻ nào trong bộ lọc này</h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              Không tìm thấy từ vựng nào phù hợp với chủ đề hoặc trạng thái đã chọn. Vui lòng chọn bộ lọc khác.
            </p>
            <button
              type="button"
              onClick={() => {
                handleTopicChange('all');
                handleStatusChange('all');
              }}
              className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-opacity"
            >
              Xem tất cả từ vựng
            </button>
          </div>
        ) : (
          /* Main Flashcard Container */
          <div className="space-y-6">
            <div className="relative">
              {/* Flashcard Component */}
              <div
                className={`flashcard max-w-lg mx-auto w-full min-h-[340px] sm:min-h-[420px] h-[360px] sm:h-[430px] cursor-pointer select-none transition-transform duration-200 ${
                  isFlipped ? 'flipped' : ''
                } ${
                  ratingFeedback === 'remembered'
                    ? 'ring-4 ring-green-500/50 rounded-2xl'
                    : ratingFeedback === 'forgot'
                    ? 'ring-4 ring-red-500/50 rounded-2xl'
                    : ratingFeedback === 'hard'
                    ? 'ring-4 ring-yellow-500/50 rounded-2xl'
                    : ''
                }`}
                onClick={handleFlip}
                role="button"
                tabIndex={0}
                aria-label="Nhấp để lật thẻ"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleFlip();
                  }
                }}
              >
                <div className="flashcard-inner">
                  {/* FRONT FACE */}
                  <div className="flashcard-front relative flex flex-col justify-between p-6 sm:p-8 bg-card border border-border rounded-2xl shadow-md">
                    {/* Top tags */}
                    <div className="w-full flex items-center justify-between text-xs">
                      <span className="px-2.5 py-1 rounded-full bg-secondary font-medium text-muted-foreground">
                        📁 {currentCard?.topicName}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className={`px-2 py-0.5 rounded-full border text-[11px] font-medium ${getStatusLabel(currentStatus).class}`}>
                          {getStatusLabel(currentStatus).label}
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold text-[11px]">
                          {currentCard?.level}
                        </span>
                      </div>
                    </div>

                    {/* Center: Word and Reading */}
                    <div className="flex-1 flex flex-col items-center justify-center text-center my-4 space-y-3">
                      {/* Reading (Furigana / Kana) */}
                      <div className="text-base sm:text-lg font-medium text-primary ja-text">
                        {currentCard?.reading}
                      </div>

                      {/* Main Word */}
                      <div className="ja-text text-4xl sm:text-5xl font-bold text-foreground tracking-wide">
                        {currentCard?.word}
                      </div>

                      {/* Romaji */}
                      <div className="text-xs sm:text-sm text-muted-foreground font-mono">
                        {currentCard?.romaji}
                      </div>
                    </div>

                    {/* Bottom audio button & Hint */}
                    <div className="w-full flex items-center justify-between pt-2 border-t border-border/50 text-xs text-muted-foreground">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePlayAudio(currentCard?.word);
                        }}
                        className={`
                          p-2 rounded-lg border transition-colors flex items-center gap-1.5 text-xs font-medium
                          ${
                            isPlayingAudio
                              ? 'bg-primary text-primary-foreground border-primary'
                              : 'bg-secondary text-foreground hover:bg-muted border-border'
                          }
                        `}
                        title="Nghe phát âm từ này"
                        aria-label="Nghe phát âm"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                        </svg>
                        <span>Phát âm</span>
                      </button>

                      <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                        🔄 Bấm thẻ hoặc <kbd className="px-1.5 py-0.5 rounded bg-secondary border border-border font-mono text-[10px]">Space</kbd> để lật
                      </span>
                    </div>
                  </div>

                  {/* BACK FACE */}
                  <div className="flashcard-back relative flex flex-col justify-between p-6 sm:p-8 bg-card border border-border rounded-2xl shadow-md overflow-y-auto">
                    {/* Top tags */}
                    <div className="w-full flex items-center justify-between text-xs">
                      <span className="px-2.5 py-1 rounded-full bg-secondary font-medium text-foreground">
                        {currentCard?.wordType || 'Từ vựng'}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Mặt sau (Ý nghĩa)
                      </span>
                    </div>

                    {/* Center: Meaning & Example */}
                    <div className="flex-1 flex flex-col items-center justify-center text-center my-3 space-y-3 w-full">
                      {/* Vietnamese Meaning */}
                      <div className="text-2xl sm:text-3xl font-extrabold text-foreground">
                        {currentCard?.meaning}
                      </div>

                      {/* Usage / Notes if available */}
                      {currentCard?.usage && (
                        <p className="text-xs text-muted-foreground italic max-w-sm">
                          {currentCard.usage}
                        </p>
                      )}

                      {/* Example Sentence Box */}
                      {currentCard?.exampleJa && (
                        <div className="w-full bg-secondary/70 border border-border rounded-xl p-3 text-left space-y-1.5 mt-2">
                          <div className="flex items-start justify-between gap-2">
                            <div className="ja-text text-sm sm:text-base font-semibold text-foreground">
                              {currentCard.exampleJa}
                            </div>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handlePlayAudio(currentCard.exampleJa);
                              }}
                              className="p-1 rounded text-muted-foreground hover:text-foreground flex-shrink-0"
                              title="Nghe câu ví dụ"
                              aria-label="Nghe câu ví dụ"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                              </svg>
                            </button>
                          </div>
                          {currentCard.exampleReading && (
                            <div className="text-[11px] text-muted-foreground font-mono">
                              {currentCard.exampleReading}
                            </div>
                          )}
                          <div className="text-xs text-foreground font-medium pt-0.5 border-t border-border/50">
                            👉 {currentCard.exampleVi}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Bottom back footer */}
                    <div className="w-full text-center pt-2 border-t border-border/50 text-[11px] text-muted-foreground">
                      Nhấp để lật lại mặt trước • Đánh giá ghi nhớ bên dưới
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation & Controls */}
            <div className="max-w-lg mx-auto flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={handlePrev}
                className="flex-1 py-2.5 px-3 rounded-lg border border-border bg-card hover:bg-secondary text-foreground text-sm font-medium transition-colors flex items-center justify-center gap-1"
                title="Thẻ trước (Phím Mũi tên Trái)"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span>Trước</span>
              </button>

              <button
                type="button"
                onClick={handleFlip}
                className="py-2.5 px-5 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-1.5 shadow-sm"
              >
                <span>🔄 Lật thẻ</span>
              </button>

              <button
                type="button"
                onClick={handleNext}
                className="flex-1 py-2.5 px-3 rounded-lg border border-border bg-card hover:bg-secondary text-foreground text-sm font-medium transition-colors flex items-center justify-center gap-1"
                title="Thẻ tiếp theo (Phím Mũi tên Phải)"
              >
                <span>Tiếp</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* SRS Review Buttons */}
            <div className="max-w-lg mx-auto bg-card border border-border rounded-xl p-4 space-y-2">
              <div className="text-xs font-semibold text-center text-muted-foreground uppercase tracking-wider">
                Đánh giá mức độ ghi nhớ (Spaced Repetition)
              </div>
              <div className="grid grid-cols-3 gap-2">
                {/* 1: Forgot */}
                <button
                  type="button"
                  onClick={() => handleRating('forgot')}
                  className="py-3 px-2 rounded-lg border border-red-300 dark:border-red-900/60 bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 font-semibold text-xs sm:text-sm transition-all flex flex-col items-center justify-center gap-0.5 active:scale-95"
                  title="Nhấn phím 1"
                >
                  <span>Chưa nhớ</span>
                  <span className="text-[10px] font-normal opacity-75">(Phím 1)</span>
                </button>

                {/* 2: Hard */}
                <button
                  type="button"
                  onClick={() => handleRating('hard')}
                  className="py-3 px-2 rounded-lg border border-yellow-300 dark:border-yellow-900/60 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 font-semibold text-xs sm:text-sm transition-all flex flex-col items-center justify-center gap-0.5 active:scale-95"
                  title="Nhấn phím 2"
                >
                  <span>Khó</span>
                  <span className="text-[10px] font-normal opacity-75">(Phím 2)</span>
                </button>

                {/* 3: Remembered */}
                <button
                  type="button"
                  onClick={() => handleRating('remembered')}
                  className="py-3 px-2 rounded-lg border border-green-300 dark:border-green-900/60 bg-green-500/10 hover:bg-green-500/20 text-green-700 dark:text-green-400 font-semibold text-xs sm:text-sm transition-all flex flex-col items-center justify-center gap-0.5 active:scale-95"
                  title="Nhấn phím 3"
                >
                  <span>Nhớ rồi</span>
                  <span className="text-[10px] font-normal opacity-75">(Phím 3)</span>
                </button>
              </div>
            </div>

            {/* Keyboard Shortcuts Hint Bar */}
            <div className="max-w-lg mx-auto text-center">
              <div className="inline-flex flex-wrap items-center justify-center gap-3 text-[11px] text-muted-foreground bg-secondary/50 px-4 py-2 rounded-full border border-border">
                <span>⌨️ Phím tắt:</span>
                <span><kbd className="px-1.5 py-0.5 rounded bg-card border border-border font-mono text-[10px]">Space</kbd> Lật</span>
                <span><kbd className="px-1.5 py-0.5 rounded bg-card border border-border font-mono text-[10px]">← / →</kbd> Trước / Sau</span>
                <span><kbd className="px-1.5 py-0.5 rounded bg-card border border-border font-mono text-[10px]">1</kbd> Chưa nhớ</span>
                <span><kbd className="px-1.5 py-0.5 rounded bg-card border border-border font-mono text-[10px]">2</kbd> Khó</span>
                <span><kbd className="px-1.5 py-0.5 rounded bg-card border border-border font-mono text-[10px]">3</kbd> Nhớ rồi</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
