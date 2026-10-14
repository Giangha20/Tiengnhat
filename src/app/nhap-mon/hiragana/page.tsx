'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import Link from 'next/link';
import rawHiraganaData from '@/data/hiragana.json';
import type { KanaData, KanaGroup, KanaCharacter } from '@/types';
import { useProgress } from '@/components/providers/ProgressProvider';
import { speak } from '@/lib/audio';

// Cast and normalize hiragana data with typed groups
const hiraganaData: KanaData = {
  metadata: {
    title: rawHiraganaData.metadata.title,
    description: rawHiraganaData.metadata.description,
    verificationStatus: rawHiraganaData.metadata.verificationStatus as KanaData['metadata']['verificationStatus'],
    sources: rawHiraganaData.metadata.sources,
    lastUpdated: rawHiraganaData.metadata.lastUpdated,
  },
  groups: rawHiraganaData.groups.map((g) => {
    let type: KanaGroup['type'] = 'basic';
    if (g.name.includes('Âm đục')) {
      type = 'dakuten';
    } else if (g.name.includes('Âm bán đục')) {
      type = 'handakuten';
    } else if (g.name.includes('Âm ghép')) {
      type = 'combo';
    }

    return {
      name: g.name,
      nameJa: g.nameJa,
      type,
      characters: g.characters as KanaCharacter[],
    };
  }),
};

type TabFilter = 'all' | 'basic' | 'dakuten' | 'handakuten' | 'combo';

interface QuizState {
  currentChar: KanaCharacter;
  options: string[];
  selectedOption: string | null;
  isAnswered: boolean;
  isCorrect: boolean | null;
  score: number;
  total: number;
  streak: number;
}

export default function HiraganaPage() {
  const { progress, markItemLearned, getItemStatus, recordReview, updateProgress } = useProgress();

  const [activeTab, setActiveTab] = useState<TabFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedChar, setSelectedChar] = useState<KanaCharacter | null>(null);
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);

  // Flatten all characters for reference and quiz
  const allCharacters = useMemo<KanaCharacter[]>(() => {
    return hiraganaData.groups.flatMap((g) => g.characters);
  }, []);

  // Filter groups according to tab and search query
  const filteredGroups = useMemo<KanaGroup[]>(() => {
    const query = searchQuery.trim().toLowerCase();

    return hiraganaData.groups
      .filter((group) => {
        if (activeTab === 'all') return true;
        return group.type === activeTab;
      })
      .map((group) => {
        if (!query) return group;
        const matchingChars = group.characters.filter(
          (c) =>
            c.character.includes(query) ||
            c.romaji.toLowerCase().includes(query) ||
            c.exampleWord.includes(query) ||
            c.exampleMeaning.toLowerCase().includes(query)
        );
        return {
          ...group,
          characters: matchingChars,
        };
      })
      .filter((group) => group.characters.length > 0);
  }, [activeTab, searchQuery]);

  // Total visible characters in current view
  const currentViewCharacters = useMemo<KanaCharacter[]>(() => {
    return filteredGroups.flatMap((g) => g.characters);
  }, [filteredGroups]);

  // Progress calculations
  const totalCharactersCount = allCharacters.length;
  const learnedCount = useMemo(() => {
    return allCharacters.filter((c) => getItemStatus(c.character, 'hiragana') !== 'new').length;
  }, [allCharacters, getItemStatus]);

  const masteredCount = useMemo(() => {
    return allCharacters.filter((c) => getItemStatus(c.character, 'hiragana') === 'mastered').length;
  }, [allCharacters, getItemStatus]);

  const learningCount = useMemo(() => {
    return allCharacters.filter((c) => {
      const status = getItemStatus(c.character, 'hiragana');
      return status === 'learning' || status === 'reviewing';
    }).length;
  }, [allCharacters, getItemStatus]);

  const progressPercentage = Math.round((learnedCount / totalCharactersCount) * 100);

  // Sync hiraganaProgress with ProgressProvider
  useEffect(() => {
    if (progress.hiraganaProgress !== progressPercentage) {
      updateProgress({ hiraganaProgress: progressPercentage });
    }
  }, [progressPercentage, progress.hiraganaProgress, updateProgress]);

  // Audio playback handler
  const handlePlayAudio = useCallback((text: string, id: string) => {
    setPlayingAudio(id);
    speak({
      text,
      rate: 0.85,
      pitch: 1.0,
      onEnd: () => setPlayingAudio(null),
      onError: () => setPlayingAudio(null),
    });
  }, []);

  // Modal navigation
  const handleSelectCharIndex = useCallback(
    (offset: number) => {
      if (!selectedChar) return;
      const list = currentViewCharacters.length > 0 ? currentViewCharacters : allCharacters;
      const currentIndex = list.findIndex((c) => c.character === selectedChar.character);
      if (currentIndex === -1) return;
      const newIndex = (currentIndex + offset + list.length) % list.length;
      setSelectedChar(list[newIndex]);
    },
    [selectedChar, currentViewCharacters, allCharacters]
  );

  // Keyboard navigation for modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedChar) return;
      if (e.key === 'Escape') {
        setSelectedChar(null);
      } else if (e.key === 'ArrowLeft') {
        handleSelectCharIndex(-1);
      } else if (e.key === 'ArrowRight') {
        handleSelectCharIndex(1);
      } else if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        handlePlayAudio(selectedChar.character, `modal-${selectedChar.character}`);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedChar, handleSelectCharIndex, handlePlayAudio]);

  // ========== QUIZ MODE LOGIC ==========
  const generateQuizQuestion = useCallback(
    (excludeChar?: string): { char: KanaCharacter; options: string[] } => {
      // Pick characters from current view if enough, otherwise from allCharacters
      const pool = currentViewCharacters.length >= 4 ? currentViewCharacters : allCharacters;
      const availablePool = excludeChar ? pool.filter((c) => c.character !== excludeChar) : pool;
      const char = availablePool[Math.floor(Math.random() * availablePool.length)] || pool[0];

      // Generate 3 wrong options with distinct romaji
      const wrongOptions: string[] = [];
      const romajiPool = allCharacters
        .map((c) => c.romaji)
        .filter((r) => r !== char.romaji);

      // Shuffle and pick 3 distinct wrong romajis
      const shuffledRomajis = [...new Set(romajiPool)].sort(() => Math.random() - 0.5);
      for (const r of shuffledRomajis) {
        if (wrongOptions.length < 3) {
          wrongOptions.push(r);
        } else {
          break;
        }
      }

      // Combine with correct answer and shuffle
      const options = [char.romaji, ...wrongOptions].sort(() => Math.random() - 0.5);

      return { char, options };
    },
    [currentViewCharacters, allCharacters]
  );

  const [quizState, setQuizState] = useState<QuizState>({
    currentChar: allCharacters[0],
    options: ['a', 'i', 'u', 'e'],
    selectedOption: null,
    isAnswered: false,
    isCorrect: null,
    score: 0,
    total: 0,
    streak: 0,
  });

  // Randomize initial quiz question on client mount
  useEffect(() => {
    const initial = generateQuizQuestion();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setQuizState((prev) => ({
      ...prev,
      currentChar: initial.char,
      options: initial.options,
    }));
  }, [generateQuizQuestion]);

  // Handle Quiz Option Selection
  const handleSelectQuizOption = (option: string) => {
    // Avoid double-clicking
    if (quizState.isAnswered) return;

    const isCorrect = option === quizState.currentChar.romaji;

    setQuizState((prev) => ({
      ...prev,
      selectedOption: option,
      isAnswered: true,
      isCorrect,
      score: isCorrect ? prev.score + 1 : prev.score,
      total: prev.total + 1,
      streak: isCorrect ? prev.streak + 1 : 0,
    }));

    // Record review to progress
    recordReview(quizState.currentChar.character, 'hiragana', isCorrect);

    if (isCorrect) {
      markItemLearned(quizState.currentChar.character, 'hiragana');
    }

    // Play character pronunciation on answer
    handlePlayAudio(quizState.currentChar.character, `quiz-${quizState.currentChar.character}`);
  };

  // Move to next quiz question
  const handleNextQuizQuestion = () => {
    const nextQ = generateQuizQuestion(quizState.currentChar.character);
    setQuizState((prev) => ({
      ...prev,
      currentChar: nextQ.char,
      options: nextQ.options,
      selectedOption: null,
      isAnswered: false,
      isCorrect: null,
    }));
  };

  // Reset quiz score
  const handleResetQuiz = () => {
    const nextQ = generateQuizQuestion();
    setQuizState({
      currentChar: nextQ.char,
      options: nextQ.options,
      selectedOption: null,
      isAnswered: false,
      isCorrect: null,
      score: 0,
      total: 0,
      streak: 0,
    });
  };

  // Tab counters
  const tabCounts = useMemo(() => {
    const counts = {
      all: allCharacters.length,
      basic: 0,
      dakuten: 0,
      handakuten: 0,
      combo: 0,
    };
    hiraganaData.groups.forEach((g) => {
      counts[g.type] += g.characters.length;
    });
    return counts;
  }, [allCharacters]);

  return (
    <div className="min-h-screen py-8 sm:py-12 bg-background text-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Breadcrumb & Navigation */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground" aria-label="Đường dẫn">
          <Link href="/" className="hover:text-primary transition-colors">
            Trang chủ
          </Link>
          <span>/</span>
          <Link href="/nhap-mon" className="hover:text-primary transition-colors">
            Nhập môn
          </Link>
          <span>/</span>
          <span className="text-foreground font-medium">Bảng chữ cái Hiragana</span>
        </nav>

        {/* Page Header */}
        <header className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary mb-2">
                <span>Nền tảng N5</span>
                <span>•</span>
                <span>{hiraganaData.metadata.verificationStatus === 'verified' ? '✓ Đã kiểm định JF Standard' : 'Đang biên tập'}</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                Bảng Chữ Cái Hiragana <span className="ja-text text-primary font-normal">（ひらがな）</span>
              </h1>
              <p className="mt-2 text-muted-foreground max-w-3xl leading-relaxed">
                {hiraganaData.metadata.description}. Hiragana là bảng chữ cái mềm đầu tiên người học tiếng Nhật cần nắm vững. Hãy nhấn vào từng chữ để xem cách phát âm, số nét và từ vựng ví dụ.
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-3">
              <a
                href="#quiz-section"
                className="bg-primary text-primary-foreground rounded-lg px-4 py-2 text-sm font-semibold hover:opacity-90 transition-opacity flex items-center gap-2 shadow-sm"
              >
                <span>🎯 Luyện trắc nghiệm</span>
              </a>
              <Link
                href="/nhap-mon/katakana"
                className="bg-secondary text-secondary-foreground rounded-lg px-4 py-2 text-sm font-semibold hover:bg-muted transition-colors flex items-center gap-2"
              >
                <span>Katakana →</span>
              </Link>
            </div>
          </div>
        </header>

        {/* Progress Overview Card */}
        <section aria-labelledby="progress-overview-heading" className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-border">
            <div>
              <h2 id="progress-overview-heading" className="text-lg font-bold flex items-center gap-2">
                <span>📊 Tiến độ học Hiragana</span>
                <span className="text-xs font-normal text-muted-foreground px-2 py-0.5 rounded-full bg-secondary">
                  Tự động lưu
                </span>
              </h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                Đã học {learnedCount} trên tổng số {totalCharactersCount} chữ ({progressPercentage}%)
              </p>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="text-right">
                <span className="text-xs text-muted-foreground block">Thành thạo</span>
                <span className="font-bold text-success">{masteredCount} chữ</span>
              </div>
              <div className="h-8 w-px bg-border" />
              <div className="text-right">
                <span className="text-xs text-muted-foreground block">Đang học / Ôn</span>
                <span className="font-bold text-warning">{learningCount} chữ</span>
              </div>
              <div className="h-8 w-px bg-border" />
              <div className="text-right">
                <span className="text-xs text-muted-foreground block">Chưa học</span>
                <span className="font-bold text-muted-foreground">{totalCharactersCount - learnedCount} chữ</span>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4 space-y-1.5">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Mức độ hoàn thành</span>
              <span className="font-semibold text-primary">{progressPercentage}%</span>
            </div>
            <div className="progress-bar w-full">
              <div
                className="progress-bar-fill transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
                role="progressbar"
                aria-valuenow={progressPercentage}
                aria-valuemin={0}
                aria-valuemax={100}
              />
            </div>
          </div>
        </section>

        {/* Filter Tabs and Search Bar */}
        <section aria-label="Bộ lọc và tìm kiếm" className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
              <button
                type="button"
                onClick={() => setActiveTab('all')}
                className={`
                  px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer
                  ${
                    activeTab === 'all'
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'bg-secondary text-secondary-foreground hover:bg-muted'
                  }
                `}
              >
                <span>Tất cả</span>
                <span className="text-xs px-1.5 py-0.5 rounded-full bg-background/20 font-bold">
                  {tabCounts.all}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('basic')}
                className={`
                  px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer
                  ${
                    activeTab === 'basic'
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'bg-secondary text-secondary-foreground hover:bg-muted'
                  }
                `}
              >
                <span>Cơ bản (Seion)</span>
                <span className="text-xs px-1.5 py-0.5 rounded-full bg-background/20 font-bold">
                  {tabCounts.basic}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('dakuten')}
                className={`
                  px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer
                  ${
                    activeTab === 'dakuten'
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'bg-secondary text-secondary-foreground hover:bg-muted'
                  }
                `}
              >
                <span>Âm đục (Dakuten)</span>
                <span className="text-xs px-1.5 py-0.5 rounded-full bg-background/20 font-bold">
                  {tabCounts.dakuten}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('handakuten')}
                className={`
                  px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer
                  ${
                    activeTab === 'handakuten'
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'bg-secondary text-secondary-foreground hover:bg-muted'
                  }
                `}
              >
                <span>Âm bán đục (Handakuten)</span>
                <span className="text-xs px-1.5 py-0.5 rounded-full bg-background/20 font-bold">
                  {tabCounts.handakuten}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('combo')}
                className={`
                  px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer
                  ${
                    activeTab === 'combo'
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'bg-secondary text-secondary-foreground hover:bg-muted'
                  }
                `}
              >
                <span>Âm ghép (Yōon)</span>
                <span className="text-xs px-1.5 py-0.5 rounded-full bg-background/20 font-bold">
                  {tabCounts.combo}
                </span>
              </button>
            </div>

            {/* Search Input */}
            <div className="relative min-w-[240px] max-w-sm">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm chữ, romaji, ví dụ..."
                className="w-full pl-9 pr-4 py-2 text-sm bg-card border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <span className="absolute left-3 top-2.5 text-muted-foreground text-sm" aria-hidden="true">
                🔍
              </span>
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2.5 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                  aria-label="Xóa ô tìm kiếm"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Quick Guide Banner */}
          <div className="p-3 bg-secondary/60 border border-border/60 rounded-lg text-xs text-muted-foreground flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span>💡 Mẹo:</span>
              <span>Nhấn vào chữ bất kỳ để mở bảng chi tiết cách viết, phát âm và từ vựng mẫu. Nhấn biểu tượng loa để nghe nhanh.</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-success inline-block" /> Đã học
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-border inline-block" /> Chưa học
              </span>
            </div>
          </div>
        </section>

        {/* Hiragana Character Groups */}
        <section aria-label="Bảng ký tự Hiragana" className="space-y-8">
          {filteredGroups.length === 0 ? (
            <div className="text-center py-16 bg-card border border-border rounded-xl">
              <p className="text-lg font-medium text-foreground">Không tìm thấy ký tự phù hợp</p>
              <p className="text-sm text-muted-foreground mt-1">Thử đổi từ khóa tìm kiếm hoặc chuyển sang tab khác.</p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setActiveTab('all');
                }}
                className="mt-4 bg-secondary text-secondary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-muted cursor-pointer"
              >
                Hiển thị tất cả
              </button>
            </div>
          ) : (
            filteredGroups.map((group) => (
              <div key={group.name} className="space-y-3">
                {/* Group Header */}
                <div className="flex items-center justify-between pb-2 border-b border-border/70">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-foreground">
                      {group.name}
                    </h3>
                    <span className="ja-text text-sm font-medium text-muted-foreground">
                      （{group.nameJa}）
                    </span>
                  </div>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
                    {group.characters.length} chữ
                  </span>
                </div>

                {/* Character Grid */}
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 sm:gap-4">
                  {group.characters.map((char) => {
                    const status = getItemStatus(char.character, 'hiragana');
                    const isLearned = status !== 'new';
                    const isPlaying = playingAudio === `grid-${char.character}`;

                    return (
                      <div
                        key={char.character}
                        className={`
                          relative group flex flex-col items-center justify-between p-3 rounded-xl border transition-all cursor-pointer select-none
                          ${
                            isLearned
                              ? 'bg-card border-success/40 hover:border-success shadow-xs'
                              : 'bg-card border-border hover:border-primary shadow-xs'
                          }
                          hover:-translate-y-0.5 hover:shadow-md
                        `}
                        onClick={() => setSelectedChar(char)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            setSelectedChar(char);
                          }
                        }}
                        aria-label={`Xem chi tiết chữ ${char.character}, phiên âm ${char.romaji}`}
                      >
                        {/* Status Pin */}
                        <div className="w-full flex items-center justify-between text-xs">
                          <span className="text-[11px] font-mono text-muted-foreground font-semibold">
                            #{char.order}
                          </span>
                          {isLearned && (
                            <span
                              className="text-success font-bold text-xs"
                              title="Đã học"
                              aria-label="Đã học"
                            >
                              ✓
                            </span>
                          )}
                        </div>

                        {/* Kana Character */}
                        <div className="py-2 flex items-center justify-center">
                          <span
                            className={`
                              ja-text kana-char text-3xl sm:text-4xl font-normal transition-colors
                              ${isLearned ? 'text-foreground' : 'text-foreground'}
                              group-hover:text-primary
                            `}
                          >
                            {char.character}
                          </span>
                        </div>

                        {/* Romaji & Quick Sound */}
                        <div className="w-full flex items-center justify-between pt-1 border-t border-border/40 text-xs">
                          <span className="font-mono font-medium text-muted-foreground group-hover:text-primary transition-colors romaji-text">
                            {char.romaji}
                          </span>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePlayAudio(char.character, `grid-${char.character}`);
                            }}
                            className={`
                              p-1 rounded-md text-muted-foreground hover:text-primary hover:bg-secondary transition-colors cursor-pointer
                              ${isPlaying ? 'text-primary scale-110' : ''}
                            `}
                            title="Nghe phát âm"
                            aria-label={`Phát âm chữ ${char.character}`}
                          >
                            🔊
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </section>

        {/* ========== CHARACTER DETAIL MODAL ========== */}
        {selectedChar && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setSelectedChar(null)}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-char-title"
          >
            <div
              className="bg-card border border-border rounded-2xl w-full max-w-lg p-6 sm:p-8 shadow-2xl relative space-y-6 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={() => setSelectedChar(null)}
                className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-secondary transition-colors cursor-pointer"
                aria-label="Đóng bảng chi tiết"
              >
                ✕
              </button>

              {/* Navigation Arrows for Modal */}
              <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
                <button
                  type="button"
                  onClick={() => handleSelectCharIndex(-1)}
                  className="flex items-center gap-1 hover:text-foreground transition-colors px-2 py-1 rounded bg-secondary cursor-pointer"
                  title="Chữ trước đó (Phím mũi tên trái)"
                >
                  ← Trước
                </button>
                <span className="font-mono">
                  Thứ tự #{selectedChar.order} / {allCharacters.length}
                </span>
                <button
                  type="button"
                  onClick={() => handleSelectCharIndex(1)}
                  className="flex items-center gap-1 hover:text-foreground transition-colors px-2 py-1 rounded bg-secondary cursor-pointer"
                  title="Chữ tiếp theo (Phím mũi tên phải)"
                >
                  Sau →
                </button>
              </div>

              {/* Character Presentation */}
              <div className="text-center space-y-3">
                <div className="inline-block p-4 rounded-2xl bg-secondary/50 border border-border">
                  <span
                    id="modal-char-title"
                    className="ja-text text-7xl sm:text-8xl font-normal text-foreground block leading-none"
                  >
                    {selectedChar.character}
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="text-2xl font-bold font-mono text-primary tracking-wide">
                    {selectedChar.romaji}
                  </div>
                  <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                    <span>Số nét viết: <strong>{selectedChar.strokeCount} nét</strong></span>
                    <span>•</span>
                    <span className="text-success font-medium">✓ Đã kiểm định</span>
                  </div>
                </div>

                {/* Primary Audio Button */}
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => handlePlayAudio(selectedChar.character, `modal-${selectedChar.character}`)}
                    className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-semibold px-5 py-2.5 rounded-xl shadow-sm hover:opacity-90 active:scale-95 transition-all cursor-pointer"
                    aria-label={`Nghe phát âm chữ ${selectedChar.character}`}
                  >
                    <span className="text-base">🔊</span>
                    <span>Phát âm (Nghe)</span>
                  </button>
                </div>
              </div>

              {/* Pronunciation Guide (Vietnamese) */}
              <div className="p-4 rounded-xl bg-secondary/60 border border-border space-y-1.5">
                <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <span>💡 Hướng dẫn phát âm cho người Việt</span>
                </div>
                <p className="text-sm text-foreground leading-relaxed">
                  {selectedChar.pronunciationGuideVi}
                </p>
              </div>

              {/* Example Word */}
              <div className="p-4 rounded-xl bg-card border border-border space-y-2">
                <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Từ vựng ví dụ
                </div>
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="ja-text text-2xl font-bold text-foreground">
                        {selectedChar.exampleWord}
                      </span>
                      <span className="text-xs font-mono text-primary font-semibold">
                        ({selectedChar.exampleReading})
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      Ý nghĩa: <strong className="text-foreground">{selectedChar.exampleMeaning}</strong>
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handlePlayAudio(selectedChar.exampleWord, `example-${selectedChar.character}`)}
                    className="p-2.5 rounded-lg bg-secondary hover:bg-muted text-foreground transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-medium"
                    title="Nghe từ vựng ví dụ"
                    aria-label={`Nghe từ ví dụ ${selectedChar.exampleWord}`}
                  >
                    <span>🔊</span>
                    <span className="hidden sm:inline">Nghe từ</span>
                  </button>
                </div>
              </div>

              {/* Mark as Learned Toggle */}
              <div className="pt-2 flex items-center justify-between border-t border-border">
                <div className="text-xs text-muted-foreground">
                  Trạng thái: {' '}
                  {getItemStatus(selectedChar.character, 'hiragana') !== 'new' ? (
                    <strong className="text-success font-semibold">Đã thuộc</strong>
                  ) : (
                    <span className="text-muted-foreground">Chưa học</span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    markItemLearned(selectedChar.character, 'hiragana');
                  }}
                  className={`
                    px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer flex items-center gap-2
                    ${
                      getItemStatus(selectedChar.character, 'hiragana') !== 'new'
                        ? 'bg-success/15 text-success border border-success/30 hover:bg-success/20'
                        : 'bg-primary text-primary-foreground hover:opacity-90'
                    }
                  `}
                >
                  {getItemStatus(selectedChar.character, 'hiragana') !== 'new' ? (
                    <>
                      <span>✓</span>
                      <span>Đã đánh dấu đã học</span>
                    </>
                  ) : (
                    <>
                      <span>+</span>
                      <span>Đánh dấu đã học</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========== QUIZ SECTION ========== */}
        <section
          id="quiz-section"
          aria-labelledby="quiz-heading"
          className="bg-card border border-border rounded-xl p-6 sm:p-8 space-y-6 shadow-sm mt-12"
        >
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-border">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary/10 text-primary mb-1">
                <span>🎯 Luyện tập phản xạ</span>
              </div>
              <h2 id="quiz-heading" className="text-2xl font-bold tracking-tight">
                Trắc Nghiệm Nhận Diện Hiragana
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Nhìn ký tự Hiragana và chọn cách đọc Romaji tương ứng. Luyện tập đều đặn để phản xạ nhanh.
              </p>
            </div>

            {/* Score Tracker */}
            <div className="flex items-center gap-3 bg-secondary/70 p-3 rounded-xl border border-border">
              <div className="text-center px-2">
                <span className="text-[11px] text-muted-foreground block font-medium">Đã làm</span>
                <span className="text-base font-bold text-foreground">{quizState.total}</span>
              </div>
              <div className="h-6 w-px bg-border" />
              <div className="text-center px-2">
                <span className="text-[11px] text-muted-foreground block font-medium">Đúng</span>
                <span className="text-base font-bold text-success">{quizState.score}</span>
              </div>
              <div className="h-6 w-px bg-border" />
              <div className="text-center px-2">
                <span className="text-[11px] text-muted-foreground block font-medium">Chuỗi 🔥</span>
                <span className="text-base font-bold text-warning">{quizState.streak}</span>
              </div>
              <div className="h-6 w-px bg-border" />
              <button
                type="button"
                onClick={handleResetQuiz}
                className="text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded hover:bg-background transition-colors cursor-pointer"
                title="Đặt lại điểm số"
                aria-label="Làm lại từ đầu"
              >
                🔄 Đặt lại
              </button>
            </div>
          </div>

          {/* Quiz Card */}
          <div className="max-w-xl mx-auto space-y-6 text-center">
            {/* Question Display */}
            <div className="p-8 rounded-2xl bg-secondary/30 border border-border space-y-3">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                Ký tự này đọc là gì?
              </span>

              <div className="ja-text text-7xl sm:text-8xl font-normal text-foreground leading-none">
                {quizState.currentChar.character}
              </div>

              {/* Sound prompt */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() =>
                    handlePlayAudio(quizState.currentChar.character, `quiz-${quizState.currentChar.character}`)
                  }
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-card border border-border text-xs font-medium text-foreground hover:border-primary transition-colors cursor-pointer"
                  aria-label="Nghe âm của câu hỏi"
                >
                  <span>🔊</span>
                  <span>Nghe âm</span>
                </button>
              </div>
            </div>

            {/* 4 Options Grid */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4" role="radiogroup" aria-label="Các lựa chọn Romaji">
              {quizState.options.map((option) => {
                const isSelected = quizState.selectedOption === option;
                const isTarget = option === quizState.currentChar.romaji;

                let optionClass = 'quiz-option';
                if (quizState.isAnswered) {
                  if (isTarget) {
                    optionClass += ' correct';
                  } else if (isSelected && !quizState.isCorrect) {
                    optionClass += ' incorrect';
                  }
                } else if (isSelected) {
                  optionClass += ' selected';
                }

                return (
                  <button
                    key={option}
                    type="button"
                    disabled={quizState.isAnswered}
                    onClick={() => handleSelectQuizOption(option)}
                    className={`
                      ${optionClass}
                      py-3.5 px-4 text-lg font-mono font-bold tracking-wider transition-all select-none
                      ${!quizState.isAnswered ? 'cursor-pointer hover:scale-[1.02] active:scale-95' : 'cursor-default'}
                    `}
                    aria-label={`Đáp án ${option}`}
                  >
                    {option}
                  </button>
                );
              })}
            </div>

            {/* Immediate Feedback Banner */}
            {quizState.isAnswered && (
              <div
                className={`
                  p-4 rounded-xl border space-y-2 text-left animate-in fade-in duration-200
                  ${
                    quizState.isCorrect
                      ? 'bg-success/10 border-success/30 text-success'
                      : 'bg-error/10 border-error/30 text-error'
                  }
                `}
                role="alert"
              >
                <div className="flex items-center justify-between font-bold text-sm">
                  <div className="flex items-center gap-2">
                    <span>{quizState.isCorrect ? '🎉 Chính xác!' : '❌ Chưa chính xác!'}</span>
                    <span className="text-foreground font-normal">
                      Chữ <strong className="ja-text text-base">{quizState.currentChar.character}</strong> phiên âm là{' '}
                      <strong className="font-mono text-base text-primary">{quizState.currentChar.romaji}</strong>
                    </span>
                  </div>
                </div>

                <p className="text-xs text-foreground/80 leading-relaxed">
                  {quizState.currentChar.pronunciationGuideVi}
                </p>

                <div className="pt-1 text-xs text-muted-foreground border-t border-border/40">
                  Từ ví dụ: <span className="ja-text font-semibold text-foreground">{quizState.currentChar.exampleWord}</span>{' '}
                  ({quizState.currentChar.exampleReading}) — {quizState.currentChar.exampleMeaning}
                </div>
              </div>
            )}

            {/* Next Question Action */}
            {quizState.isAnswered && (
              <div className="pt-2 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={handleNextQuizQuestion}
                  className="bg-primary text-primary-foreground font-bold px-6 py-2.5 rounded-xl shadow-md hover:opacity-90 active:scale-95 transition-all cursor-pointer flex items-center gap-2"
                >
                  <span>Câu tiếp theo →</span>
                </button>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
