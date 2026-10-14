'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import Link from 'next/link';
import type { KanaCharacter } from '@/types';
import rawKatakanaData from '@/data/katakana.json';
import { speak, isAudioSupported } from '@/lib/audio';
import { useProgress } from '@/components/providers/ProgressProvider';

interface KatakanaGroup {
  id: string;
  name: string;
  description: string;
  characters: KanaCharacter[];
}

interface KatakanaData {
  metadata: {
    title: string;
    description: string;
    verificationStatus: string;
    sources: string[];
    lastUpdated: string;
  };
  groups: KatakanaGroup[];
}

const katakanaData = rawKatakanaData as unknown as KatakanaData;

type CategoryTab = 'all' | 'basic' | 'dakuten' | 'combo';

const BASIC_GROUP_IDS = [
  'vowels',
  'k-row',
  's-row',
  't-row',
  'n-row',
  'h-row',
  'm-row',
  'y-row',
  'r-row',
  'w-n-row',
];

const DAKUTEN_GROUP_IDS = ['g-row', 'z-row', 'd-row', 'b-row', 'p-row'];

const COMBO_GROUP_IDS = ['ya-combos', 'yu-combos', 'yo-combos'];

// Pairs often confused by learners
const CONFUSING_PAIRS = [
  {
    char1: 'シ',
    romaji1: 'shi',
    hiragana1: 'し',
    char2: 'ツ',
    romaji2: 'tsu',
    hiragana2: 'つ',
    distinction: 'シ (shi) các nét nghiêng vuốt từ DƯỚI lên; ツ (tsu) các nét nghiêng vuốt từ TRÊN xuống.',
  },
  {
    char1: 'ソ',
    romaji1: 'so',
    hiragana1: 'そ',
    char2: 'ン',
    romaji2: 'n',
    hiragana2: 'ん',
    distinction: 'ソ (so) nét dài vuốt từ TRÊN xuống dưới; ン (n) nét dài vuốt từ DƯỚI xiên lên trên.',
  },
  {
    char1: 'ク',
    romaji1: 'ku',
    hiragana1: 'く',
    char2: 'ワ',
    romaji2: 'wa',
    hiragana2: 'わ',
    distinction: 'ク (ku) nét phẩy đầu tiên vuốt chéo sang trái; ワ (wa) nét sổ thẳng đứng ở bên trái.',
  },
  {
    char1: 'コ',
    romaji1: 'ko',
    hiragana1: 'こ',
    char2: 'ユ',
    romaji2: 'yu',
    hiragana2: 'ゆ',
    distinction: 'コ (ko) hình chữ U nằm ngang mở sang trái; ユ (yu) nét thẳng nối dài hơn ra phía trước.',
  },
];

export default function KatakanaPage() {
  const { progress, markItemLearned, getItemStatus, updateProgress } = useProgress();

  // Navigation and filter states
  const [activeTab, setActiveTab] = useState<CategoryTab>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showHiraganaEquiv, setShowHiraganaEquiv] = useState(true);
  const [showRomaji, setShowRomaji] = useState(true);
  const [autoPlayAudio, setAutoPlayAudio] = useState(false);

  // Selected character for detailed modal
  const [selectedCharacter, setSelectedCharacter] = useState<KanaCharacter | null>(null);

  // Audio playing indicator
  const [playingChar, setPlayingChar] = useState<string | null>(null);
  const [audioError, setAudioError] = useState<string | null>(null);

  // Quick Quiz State
  const [quizActive, setQuizActive] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<
    {
      target: KanaCharacter;
      options: string[];
      answer: string;
      questionType: 'hiragana' | 'romaji';
      userSelected: string | null;
    }[]
  >([]);
  const [quizScore, setQuizScore] = useState<number | null>(null);

  // Flatten all characters
  const allCharacters = useMemo(() => {
    return katakanaData.groups.flatMap((g) => g.characters);
  }, []);

  // Filter groups according to activeTab and search
  const visibleGroups = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return katakanaData.groups
      .filter((group) => {
        if (activeTab === 'basic') return BASIC_GROUP_IDS.includes(group.id);
        if (activeTab === 'dakuten') return DAKUTEN_GROUP_IDS.includes(group.id);
        if (activeTab === 'combo') return COMBO_GROUP_IDS.includes(group.id);
        return true;
      })
      .map((group) => {
        if (!query) return group;

        const filteredChars = group.characters.filter((c) => {
          const matchChar = c.character.toLowerCase().includes(query);
          const matchRomaji = c.romaji.toLowerCase().includes(query);
          const matchHira = c.hiraganaEquivalent?.toLowerCase().includes(query) ?? false;
          const matchExampleWord = c.exampleWord.toLowerCase().includes(query);
          const matchMeaning = c.exampleMeaning.toLowerCase().includes(query);
          return matchChar || matchRomaji || matchHira || matchExampleWord || matchMeaning;
        });

        return {
          ...group,
          characters: filteredChars,
        };
      })
      .filter((group) => group.characters.length > 0);
  }, [activeTab, searchQuery]);

  // Total learned count for Katakana
  const learnedCount = useMemo(() => {
    return allCharacters.filter((c) => getItemStatus(c.character, 'katakana') !== 'new').length;
  }, [allCharacters, getItemStatus]);

  const progressPercent = Math.min(100, Math.round((learnedCount / allCharacters.length) * 100));

  // Keep progress context updated with katakana progress
  useEffect(() => {
    if (progress.katakanaProgress !== progressPercent) {
      updateProgress({ katakanaProgress: progressPercent });
    }
  }, [progressPercent, progress.katakanaProgress, updateProgress]);

  // Audio handler
  const playSound = useCallback((charText: string) => {
    setAudioError(null);
    if (!isAudioSupported()) {
      setAudioError('Trình duyệt không hỗ trợ phát âm thanh tổng hợp.');
      return;
    }
    setPlayingChar(charText);
    speak({
      text: charText,
      rate: 0.85,
      pitch: 1.0,
      onEnd: () => setPlayingChar(null),
      onError: (err) => {
        setAudioError(err);
        setPlayingChar(null);
      },
    });
  }, []);

  // Handle character click: open modal + optional auto-play
  const handleCharClick = (char: KanaCharacter) => {
    setSelectedCharacter(char);
    if (autoPlayAudio) {
      playSound(char.character);
    }
  };

  // Toggle character learned status
  const handleToggleLearned = useCallback(
    (charText: string) => {
      const isLearned = getItemStatus(charText, 'katakana') !== 'new';
      if (!isLearned) {
        markItemLearned(charText, 'katakana');
      } else {
        const newQueue = progress.reviewQueue.filter(
          (item) => !(item.itemId === charText && item.itemType === 'katakana')
        );
        updateProgress({ reviewQueue: newQueue });
      }
    },
    [getItemStatus, markItemLearned, progress.reviewQueue, updateProgress]
  );

  // Modal Next / Previous character navigation
  const handleNavigateModal = (direction: 'prev' | 'next') => {
    if (!selectedCharacter) return;
    const currentIndex = allCharacters.findIndex((c) => c.character === selectedCharacter.character);
    if (currentIndex === -1) return;

    let nextIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;
    if (nextIndex < 0) nextIndex = allCharacters.length - 1;
    if (nextIndex >= allCharacters.length) nextIndex = 0;

    const nextChar = allCharacters[nextIndex];
    setSelectedCharacter(nextChar);
    if (autoPlayAudio) {
      playSound(nextChar.character);
    }
  };

  // Start quick quiz
  const startQuiz = () => {
    // Pick 5 random characters
    const shuffled = [...allCharacters].sort(() => 0.5 - Math.random()).slice(0, 5);

    const generated = shuffled.map((target) => {
      const questionType: 'hiragana' | 'romaji' = Math.random() > 0.5 ? 'hiragana' : 'romaji';
      const answer = questionType === 'hiragana' ? (target.hiraganaEquivalent || target.romaji) : target.romaji;

      // Generate 3 wrong options
      const otherChars = allCharacters.filter((c) => c.character !== target.character);
      const wrong = otherChars
        .sort(() => 0.5 - Math.random())
        .slice(0, 3)
        .map((c) => (questionType === 'hiragana' ? (c.hiraganaEquivalent || c.romaji) : c.romaji));

      const options = [answer, ...wrong].sort(() => 0.5 - Math.random());

      return {
        target,
        options,
        answer,
        questionType,
        userSelected: null,
      };
    });

    setQuizQuestions(generated);
    setQuizScore(null);
    setQuizActive(true);
  };

  const handleQuizAnswer = (qIndex: number, option: string) => {
    if (quizQuestions[qIndex].userSelected !== null) return; // already answered

    const updated = [...quizQuestions];
    updated[qIndex].userSelected = option;
    setQuizQuestions(updated);

    // If target answered correctly, mark learned if not already
    if (option === updated[qIndex].answer) {
      markItemLearned(updated[qIndex].target.character, 'katakana');
    }

    // Check if all answered
    const allAnswered = updated.every((q) => q.userSelected !== null);
    if (allAnswered) {
      const correctCount = updated.filter((q) => q.userSelected === q.answer).length;
      setQuizScore(correctCount);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Breadcrumb & Navigation */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <Link href="/" className="hover:text-foreground">
          Trang chủ
        </Link>
        <span>/</span>
        <span className="text-foreground">Nhập môn</span>
        <span>/</span>
        <span className="text-foreground font-semibold">Katakana</span>
      </nav>

      {/* Header Section */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                Nhập môn sơ cấp
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-muted-foreground border border-border">
                {katakanaData.metadata.verificationStatus === 'verified' ? '✓ Đã kiểm duyệt' : 'Đã biên soạn'}
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground flex items-center gap-3">
              <span>{katakanaData.metadata.title}</span>
              <span className="ja-text text-2xl sm:text-3xl text-primary font-medium">片仮名</span>
            </h1>

            <p className="mt-2 text-base text-muted-foreground max-w-2xl">
              {katakanaData.metadata.description}. Katakana dùng để phiên âm từ mượn tiếng nước ngoài, tên riêng quốc tế, từ tượng thanh và tạo điểm nhấn trong câu.
            </p>
          </div>

          {/* Progress Box */}
          <div className="bg-card border border-border rounded-xl p-5 min-w-[280px] shadow-sm">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-muted-foreground font-medium">Tiến độ bảng Katakana</span>
              <span className="font-bold text-foreground">
                {learnedCount} / {allCharacters.length} chữ ({progressPercent}%)
              </span>
            </div>

            <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
              <div
                className="bg-primary h-3 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
              <span>Mục tiêu: 104 ký tự</span>
              <button
                onClick={startQuiz}
                className="text-primary hover:underline font-medium flex items-center gap-1"
              >
                <span>⚡ Kiểm tra trí nhớ</span>
              </button>
            </div>
          </div>
        </div>

        {/* Audio Error Alert if any */}
        {audioError && (
          <div className="mt-4 p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-error/30 text-error text-sm flex items-center justify-between">
            <span>⚠️ {audioError}</span>
            <button
              onClick={() => setAudioError(null)}
              className="text-xs underline hover:opacity-80 ml-2"
            >
              Đóng
            </button>
          </div>
        )}
      </div>

      {/* Quick Navigation Links */}
      <div className="mb-8 flex flex-wrap gap-2.5">
        <Link
          href="/nhap-mon/hiragana"
          className="px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium bg-card border border-border hover:bg-secondary transition-colors text-foreground flex items-center gap-1.5"
        >
          <span>← Bảng chữ cái Hiragana (平仮名)</span>
        </Link>
        <span className="px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold bg-primary text-primary-foreground">
          Bảng Katakana (Hiện tại)
        </span>
        <button
          onClick={startQuiz}
          className="px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium bg-secondary hover:bg-secondary/80 border border-border transition-colors text-foreground flex items-center gap-1"
        >
          <span>🎯 Trắc nghiệm Katakana</span>
        </button>
      </div>

      {/* Quiz Modal / Box if Active */}
      {quizActive && (
        <div className="mb-8 bg-card border-2 border-primary/40 rounded-xl p-5 sm:p-6 shadow-md animate-fadeIn">
          <div className="flex items-center justify-between mb-4 border-b border-border pb-3">
            <div>
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <span>🎯 Luyện phản xạ Katakana (5 câu hỏi ngẫu nhiên)</span>
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Nhìn chữ Katakana và chọn chữ Hiragana hoặc Romaji tương ứng.
              </p>
            </div>
            <button
              onClick={() => setQuizActive(false)}
              className="p-1 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground text-sm"
              title="Đóng trắc nghiệm"
            >
              ✕ Đóng
            </button>
          </div>

          <div className="space-y-6">
            {quizQuestions.map((q, idx) => {
              const isAnswered = q.userSelected !== null;
              return (
                <div key={idx} className="bg-secondary/40 p-4 rounded-xl border border-border/70">
                  <div className="flex items-center justify-between gap-4 mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-card border border-border text-muted-foreground">
                        Câu {idx + 1}/5
                      </span>
                      <span className="text-sm font-medium text-foreground">
                        Chữ Katakana sau tương ứng với{' '}
                        {q.questionType === 'hiragana' ? (
                          <strong className="text-primary">Hiragana</strong>
                        ) : (
                          <strong className="text-primary">Romaji</strong>
                        )}{' '}
                        nào?
                      </span>
                    </div>

                    <button
                      onClick={() => playSound(q.target.character)}
                      className="p-1.5 rounded-full hover:bg-card border border-border text-primary"
                      title="Nghe phát âm"
                    >
                      🔊
                    </button>
                  </div>

                  <div className="text-center my-3">
                    <span className="ja-text text-5xl font-bold text-foreground inline-block px-6 py-2 rounded-xl bg-card border border-border shadow-sm">
                      {q.target.character}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-3">
                    {q.options.map((opt, oIdx) => {
                      let optionClass = 'quiz-option text-center font-medium ';
                      if (isAnswered) {
                        if (opt === q.answer) {
                          optionClass += 'correct font-bold text-success';
                        } else if (opt === q.userSelected) {
                          optionClass += 'incorrect text-error';
                        }
                      } else {
                        optionClass += 'hover:border-primary';
                      }

                      return (
                        <button
                          key={oIdx}
                          disabled={isAnswered}
                          onClick={() => handleQuizAnswer(idx, opt)}
                          className={optionClass}
                        >
                          <span className={q.questionType === 'hiragana' ? 'ja-text text-xl' : 'font-mono text-base'}>
                            {opt}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {isAnswered && (
                    <div className="mt-2.5 pt-2 border-t border-border/50 text-xs flex items-center justify-between">
                      <span className={q.userSelected === q.answer ? 'text-success font-medium' : 'text-error font-medium'}>
                        {q.userSelected === q.answer ? '✓ Chính xác!' : `✕ Chưa đúng! Đáp án đúng là: ${q.answer}`}
                      </span>
                      <span className="text-muted-foreground font-mono">
                        Katakana: {q.target.character} • Hiragana: {q.target.hiraganaEquivalent} • Romaji: {q.target.romaji}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {quizScore !== null && (
            <div className="mt-6 pt-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 bg-card p-4 rounded-xl">
              <div>
                <span className="text-base font-bold text-foreground">
                  Kết quả: {quizScore} / 5 câu đúng ({Math.round((quizScore / 5) * 100)}%)
                </span>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {quizScore === 5
                    ? 'Xuất sắc! Bạn đã nắm rất chắc các chữ Katakana này.'
                    : 'Rất tốt! Tiếp tục luyện tập để ghi nhớ trọn vẹn 104 ký tự.'}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={startQuiz}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
                >
                  Làm đề ngẫu nhiên khác
                </button>
                <button
                  onClick={() => setQuizActive(false)}
                  className="px-4 py-2 bg-secondary text-foreground border border-border rounded-lg text-sm font-medium hover:bg-secondary/80 transition-colors"
                >
                  Đóng
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Search and Filters Controls */}
      <div className="space-y-4 mb-8">
        {/* Search Bar */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo Katakana (ア), Hiragana tương đương (あ), Romaji (a, ka), hoặc ví dụ (kem, bánh...)"
            className="w-full pl-11 pr-10 py-3 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-sm"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-muted-foreground hover:text-foreground"
              title="Xóa tìm kiếm"
            >
              ✕
            </button>
          )}
        </div>

        {/* Category Pills and Display Toggles */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-1">
          {/* Category Filter Pills */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors border ${
                activeTab === 'all'
                  ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                  : 'bg-card text-foreground border-border hover:bg-secondary'
              }`}
            >
              Tất cả (104)
            </button>
            <button
              onClick={() => setActiveTab('basic')}
              className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors border ${
                activeTab === 'basic'
                  ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                  : 'bg-card text-foreground border-border hover:bg-secondary'
              }`}
            >
              Cơ bản (46 chữ)
            </button>
            <button
              onClick={() => setActiveTab('dakuten')}
              className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors border ${
                activeTab === 'dakuten'
                  ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                  : 'bg-card text-foreground border-border hover:bg-secondary'
              }`}
            >
              Âm đục & Bán đục (25 chữ)
            </button>
            <button
              onClick={() => setActiveTab('combo')}
              className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors border ${
                activeTab === 'combo'
                  ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                  : 'bg-card text-foreground border-border hover:bg-secondary'
              }`}
            >
              Âm ghép (33 chữ)
            </button>
          </div>

          {/* Study Toggles: Show Hiragana, Show Romaji, Auto Sound */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs">
            {/* Show Hiragana Equivalent Toggle */}
            <button
              onClick={() => setShowHiraganaEquiv(!showHiraganaEquiv)}
              className={`px-3 py-1.5 rounded-lg border font-medium transition-colors flex items-center gap-1.5 ${
                showHiraganaEquiv
                  ? 'bg-primary/10 border-primary/30 text-primary'
                  : 'bg-card border-border text-muted-foreground'
              }`}
              title="Bật/tắt hiển thị chữ Hiragana tương đương"
            >
              <span>{showHiraganaEquiv ? '✓' : '○'}</span>
              <span>Hiragana tương đương</span>
            </button>

            {/* Show Romaji Toggle */}
            <button
              onClick={() => setShowRomaji(!showRomaji)}
              className={`px-3 py-1.5 rounded-lg border font-medium transition-colors flex items-center gap-1.5 ${
                showRomaji
                  ? 'bg-primary/10 border-primary/30 text-primary'
                  : 'bg-card border-border text-muted-foreground'
              }`}
              title="Bật/tắt hiển thị phiên âm Romaji"
            >
              <span>{showRomaji ? '✓' : '○'}</span>
              <span>Romaji</span>
            </button>

            {/* Auto Audio on click */}
            <button
              onClick={() => setAutoPlayAudio(!autoPlayAudio)}
              className={`px-3 py-1.5 rounded-lg border font-medium transition-colors flex items-center gap-1.5 ${
                autoPlayAudio
                  ? 'bg-primary/10 border-primary/30 text-primary'
                  : 'bg-card border-border text-muted-foreground'
              }`}
              title="Tự động phát âm thanh khi bấm vào ký tự"
            >
              <span>{autoPlayAudio ? '🔊' : '🔈'}</span>
              <span>Tự động phát âm</span>
            </button>
          </div>
        </div>
      </div>

      {/* Kana Groups Display */}
      {visibleGroups.length === 0 ? (
        <div className="text-center py-16 bg-card border border-border rounded-xl">
          <p className="text-4xl mb-3">🔍</p>
          <h3 className="text-lg font-semibold text-foreground">Không tìm thấy chữ Katakana phù hợp</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
            Không có ký tự nào khớp với &quot;{searchQuery}&quot;. Vui lòng thử tìm kiếm khác hoặc chọn tab &quot;Tất cả&quot;.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setActiveTab('all');
            }}
            className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Xem lại tất cả bảng chữ cái
          </button>
        </div>
      ) : (
        <div className="space-y-10">
          {visibleGroups.map((group) => (
            <section
              key={group.id}
              className="bg-card border border-border rounded-xl p-4 sm:p-6 shadow-sm"
            >
              {/* Group Header */}
              <div className="mb-4 pb-3 border-b border-border flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-foreground flex items-center gap-2">
                    <span>{group.name}</span>
                    <span className="text-xs font-normal text-muted-foreground">
                      ({group.characters.length} ký tự)
                    </span>
                  </h2>
                  {group.description && (
                    <p className="text-xs text-muted-foreground mt-1 max-w-3xl">
                      {group.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Characters Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-3">
                {group.characters.map((char) => {
                  const isLearned = getItemStatus(char.character, 'katakana') !== 'new';
                  const isCurrentlyPlaying = playingChar === char.character;

                  return (
                    <div
                      key={char.character}
                      onClick={() => handleCharClick(char)}
                      className={`relative group bg-secondary/50 hover:bg-secondary border rounded-xl p-3 sm:p-4 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-between min-h-[140px] select-none ${
                        isLearned
                          ? 'border-success/40 shadow-sm bg-success/5'
                          : 'border-border hover:border-primary/50 hover:shadow-md'
                      }`}
                    >
                      {/* Top row: Learned indicator + Audio button */}
                      <div className="w-full flex items-center justify-between text-xs mb-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleLearned(char.character);
                          }}
                          className={`p-1 rounded transition-colors ${
                            isLearned
                              ? 'text-success hover:text-success/70'
                              : 'text-muted-foreground/50 hover:text-foreground'
                          }`}
                          title={isLearned ? 'Đã thuộc (Bấm để hủy)' : 'Đánh dấu đã thuộc'}
                          aria-label={isLearned ? 'Đã thuộc' : 'Đánh dấu đã thuộc'}
                        >
                          {isLearned ? '✓' : '○'}
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            playSound(char.character);
                          }}
                          className={`p-1 rounded hover:bg-card transition-colors ${
                            isCurrentlyPlaying ? 'text-primary scale-125' : 'text-muted-foreground hover:text-primary'
                          }`}
                          title="Nghe phát âm"
                          aria-label={`Nghe phát âm ${char.character}`}
                        >
                          🔊
                        </button>
                      </div>

                      {/* Main Katakana Character */}
                      <div className="ja-text kana-char text-3xl sm:text-4xl font-bold text-foreground group-hover:text-primary transition-colors my-1">
                        {char.character}
                      </div>

                      {/* Sub row: Hiragana Equivalent & Romaji */}
                      <div className="w-full flex flex-col items-center gap-1 mt-1">
                        {/* Hiragana Equivalent (explicitly required) */}
                        {showHiraganaEquiv && char.hiraganaEquivalent && (
                          <div className="flex items-center gap-1">
                            <span className="text-[11px] text-muted-foreground">Hira:</span>
                            <span className="ja-text text-xs sm:text-sm font-semibold text-primary px-1.5 py-0.2 rounded bg-card border border-border/80">
                              {char.hiraganaEquivalent}
                            </span>
                          </div>
                        )}

                        {/* Romaji */}
                        {showRomaji && (
                          <span className="font-mono text-xs text-muted-foreground romaji-text">
                            {char.romaji}
                          </span>
                        )}
                      </div>

                      {/* Hover hint */}
                      <div className="mt-2 text-[10px] text-muted-foreground/70 opacity-0 group-hover:opacity-100 transition-opacity">
                        Bấm để xem chi tiết
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}

      {/* Confusing Pairs Comparison Section */}
      <div className="mt-12 bg-card border border-border rounded-xl p-5 sm:p-6 shadow-sm">
        <h2 className="text-xl font-bold text-foreground mb-2 flex items-center gap-2">
          <span>⚠️ Các cặp chữ Katakana dễ gây nhầm lẫn nhất</span>
        </h2>
        <p className="text-xs sm:text-sm text-muted-foreground mb-6">
          Katakana có nhiều nét thẳng tương tự nhau. Bảng dưới đây giúp người học phân biệt các nét viết và chiều vuốt bút của các cặp chữ thường gặp nhất.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {CONFUSING_PAIRS.map((pair, idx) => (
            <div
              key={idx}
              className="bg-secondary/40 p-4 rounded-xl border border-border/80 flex flex-col justify-between"
            >
              <div className="flex items-center justify-around py-3 border-b border-border/60">
                {/* Char 1 */}
                <div className="text-center">
                  <div className="ja-text text-4xl font-bold text-foreground">{pair.char1}</div>
                  <div className="text-xs font-mono text-primary font-bold mt-1">{pair.romaji1}</div>
                  <div className="ja-text text-xs text-muted-foreground">Hira: {pair.hiragana1}</div>
                  <button
                    onClick={() => playSound(pair.char1)}
                    className="text-xs mt-1 text-primary hover:underline"
                  >
                    🔊 Nghe
                  </button>
                </div>

                <div className="text-muted-foreground font-bold text-lg">vs</div>

                {/* Char 2 */}
                <div className="text-center">
                  <div className="ja-text text-4xl font-bold text-foreground">{pair.char2}</div>
                  <div className="text-xs font-mono text-primary font-bold mt-1">{pair.romaji2}</div>
                  <div className="ja-text text-xs text-muted-foreground">Hira: {pair.hiragana2}</div>
                  <button
                    onClick={() => playSound(pair.char2)}
                    className="text-xs mt-1 text-primary hover:underline"
                  >
                    🔊 Nghe
                  </button>
                </div>
              </div>

              <div className="mt-3 text-xs text-foreground bg-card/70 p-2.5 rounded-lg border border-border/50 leading-relaxed">
                <strong className="text-primary font-semibold">Mẹo ghi nhớ: </strong>
                {pair.distinction}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Katakana Spelling Rules Section */}
      <div className="mt-8 bg-card border border-border rounded-xl p-5 sm:p-6 shadow-sm">
        <h2 className="text-xl font-bold text-foreground mb-3 flex items-center gap-2">
          <span>📖 3 Quy tắc chính tả đặc biệt trong Katakana</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs sm:text-sm">
          <div className="bg-secondary/40 p-4 rounded-xl border border-border space-y-2">
            <h3 className="font-bold text-foreground text-sm flex items-center gap-1.5">
              <span>1. Trường âm (Dấu gạch ー)</span>
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              Katakana biểu thị âm dài bằng một dấu gạch ngang duy nhất (ー), bất kể nguyên âm là a, i, u, e hay o.
            </p>
            <div className="bg-card p-2 rounded-lg border border-border/60 text-xs">
              <div><strong>コーヒー</strong> (kōhī): cà phê</div>
              <div className="mt-0.5"><strong>ケーキ</strong> (kēki): bánh ngọt</div>
            </div>
          </div>

          <div className="bg-secondary/40 p-4 rounded-xl border border-border space-y-2">
            <h3 className="font-bold text-foreground text-sm flex items-center gap-1.5">
              <span>2. Âm ngắt (Chữ ッ nhỏ)</span>
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              Biểu thị sự ngắt nhịp nhẹ bằng chữ ッ viết nhỏ cỡ 1/4 chữ thông thường, gấp đôi phụ âm đứng liền sau.
            </p>
            <div className="bg-card p-2 rounded-lg border border-border/60 text-xs">
              <div><strong>ベッド</strong> (beddo): cái giường</div>
              <div className="mt-0.5"><strong>サッカー</strong> (sakkā): bóng đá</div>
            </div>
          </div>

          <div className="bg-secondary/40 p-4 rounded-xl border border-border space-y-2">
            <h3 className="font-bold text-foreground text-sm flex items-center gap-1.5">
              <span>3. Âm ghép (Yōon ャ, ュ, ョ)</span>
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              Kết hợp chữ hàng [I] với chữ ャ, ュ, ョ viết nhỏ để tạo thành một âm tiết duy nhất.
            </p>
            <div className="bg-card p-2 rounded-lg border border-border/60 text-xs">
              <div><strong>シャツ</strong> (shatsu): áo sơ mi</div>
              <div className="mt-0.5"><strong>ジュース</strong> (jūsu): nước trái cây</div>
            </div>
          </div>
        </div>
      </div>

      {/* Character Details Modal */}
      {selectedCharacter && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn"
          onClick={() => setSelectedCharacter(null)}
        >
          <div
            className="bg-card border border-border rounded-2xl max-w-lg w-full p-6 shadow-2xl relative space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                  Katakana
                </span>
                <span className="text-xs text-muted-foreground">
                  Số nét: <strong>{selectedCharacter.strokeCount}</strong> nét
                </span>
              </div>

              <button
                onClick={() => setSelectedCharacter(null)}
                className="p-1 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground text-base"
                title="Đóng (Esc)"
              >
                ✕
              </button>
            </div>

            {/* Huge Character & Audio */}
            <div className="flex flex-col sm:flex-row items-center justify-around gap-4 text-center sm:text-left py-2">
              <div>
                <div className="ja-text text-7xl font-bold text-foreground leading-none">
                  {selectedCharacter.character}
                </div>
                <div className="mt-2 flex items-center justify-center sm:justify-start gap-2">
                  <span className="font-mono text-xl font-bold text-primary">
                    /{selectedCharacter.romaji}/
                  </span>
                  <button
                    onClick={() => playSound(selectedCharacter.character)}
                    className="p-1.5 rounded-full bg-secondary hover:bg-primary/10 text-primary border border-border transition-colors"
                    title="Nghe phát âm"
                  >
                    🔊
                  </button>
                </div>
              </div>

              {/* Hiragana Equivalent Comparison Card */}
              <div className="bg-secondary/60 p-4 rounded-xl border border-border text-center min-w-[170px]">
                <div className="text-xs text-muted-foreground font-medium mb-1">
                  Hiragana tương đương:
                </div>
                <div className="ja-text text-4xl font-bold text-primary">
                  {selectedCharacter.hiraganaEquivalent || '—'}
                </div>
                <div className="text-[11px] text-muted-foreground mt-1">
                  Cùng cách đọc: /{selectedCharacter.romaji}/
                </div>
              </div>
            </div>

            {/* Pronunciation Guide */}
            {selectedCharacter.pronunciationGuideVi && (
              <div className="bg-secondary/40 p-3.5 rounded-xl border border-border/70 text-xs sm:text-sm">
                <div className="font-semibold text-foreground mb-1 flex items-center gap-1.5">
                  <span>🗣️ Hướng dẫn phát âm chuẩn:</span>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  {selectedCharacter.pronunciationGuideVi}
                </p>
              </div>
            )}

            {/* Example Word */}
            {selectedCharacter.exampleWord && (
              <div className="bg-card p-3.5 rounded-xl border border-border space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Từ ví dụ thực tế:
                  </span>
                  <button
                    onClick={() => playSound(selectedCharacter.exampleWord)}
                    className="text-xs text-primary font-medium hover:underline flex items-center gap-1"
                  >
                    🔊 Nghe từ ví dụ
                  </button>
                </div>

                <div className="flex items-baseline justify-between gap-2">
                  <span className="ja-text text-2xl font-bold text-foreground">
                    {selectedCharacter.exampleWord}
                  </span>
                  <span className="text-xs font-mono text-muted-foreground">
                    {selectedCharacter.exampleReading}
                  </span>
                </div>

                <div className="text-xs sm:text-sm text-foreground font-medium pt-1 border-t border-border/50">
                  👉 Nghĩa tiếng Việt: <strong>{selectedCharacter.exampleMeaning}</strong>
                </div>
              </div>
            )}

            {/* Modal Actions */}
            <div className="pt-2 border-t border-border flex items-center justify-between gap-2">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleNavigateModal('prev')}
                  className="px-3 py-1.5 rounded-lg border border-border bg-card hover:bg-secondary text-xs font-medium text-foreground transition-colors"
                >
                  ← Chữ trước
                </button>
                <button
                  onClick={() => handleNavigateModal('next')}
                  className="px-3 py-1.5 rounded-lg border border-border bg-card hover:bg-secondary text-xs font-medium text-foreground transition-colors"
                >
                  Chữ sau →
                </button>
              </div>

              <button
                onClick={() => handleToggleLearned(selectedCharacter.character)}
                className={`px-4 py-2 rounded-lg text-xs font-semibold border transition-colors flex items-center gap-1.5 ${
                  getItemStatus(selectedCharacter.character, 'katakana') !== 'new'
                    ? 'bg-success text-white border-success'
                    : 'bg-primary text-primary-foreground border-primary hover:opacity-90'
                }`}
              >
                {getItemStatus(selectedCharacter.character, 'katakana') !== 'new' ? (
                  <>
                    <span>✓ Đã thuộc</span>
                    <span className="text-[10px] opacity-80">(Bấm để bỏ lưu)</span>
                  </>
                ) : (
                  <span>+ Đánh dấu đã thuộc</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
