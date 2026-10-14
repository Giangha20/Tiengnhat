'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import Link from 'next/link';
import typingDataRaw from '@/data/typing/typing-lessons.json';
import { useProgress } from '@/components/providers/ProgressProvider';
import { speak } from '@/lib/audio';
import AudioSpeedControl from '@/components/ui/AudioSpeedControl';
import {
  playMechanicalKeyClick,
  playTypingErrorSound,
  playComboBurstSound,
  playCelebrationSound,
  playCorrectSound,
  playTapSound,
} from '@/lib/sound';

interface TypingItem {
  id: string;
  japanese: string;
  hiragana: string;
  romaji: string;
  alternatives?: string[];
  meaning: string;
}

interface TypingLesson {
  id: string;
  name: string;
  description: string;
  icon: string;
  items: TypingItem[];
}

const LESSONS: TypingLesson[] = typingDataRaw.lessons;

// Keyboard rows for the visual keyboard
const KEYBOARD_ROWS = [
  ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
  ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
  ['z', 'x', 'c', 'v', 'b', 'n', 'm'],
];

type SwitchSoundType = 'blue' | 'red' | 'brown' | 'mute';

export default function LuyenGoPage() {
  const { markItemLearned } = useProgress();

  // Mode & Lesson Selection
  const [activeLessonId, setActiveLessonId] = useState<string>('n5_words');
  const [isSpeedRunMode, setIsSpeedRunMode] = useState<boolean>(false);
  const [switchType, setSwitchType] = useState<SwitchSoundType>('blue');

  // Speed run timer state
  const [timeLeft, setTimeLeft] = useState<number>(60);
  const [isSpeedRunActive, setIsSpeedRunActive] = useState<boolean>(false);
  const [isSpeedRunFinished, setIsSpeedRunFinished] = useState<boolean>(false);

  // Active items pool
  const currentItems = useMemo(() => {
    if (isSpeedRunMode) {
      // Aggregate all items and shuffle
      const all: TypingItem[] = [];
      LESSONS.forEach((l) => all.push(...l.items));
      return [...all].sort(() => 0.5 - Math.random());
    }
    const found = LESSONS.find((l) => l.id === activeLessonId);
    return found ? found.items : LESSONS[0].items;
  }, [activeLessonId, isSpeedRunMode]);

  // Current word index and typing cursor state
  const [itemIndex, setItemIndex] = useState<number>(0);
  const currentItem: TypingItem = currentItems[itemIndex % currentItems.length] || currentItems[0];

  // Active target romaji string (handles primary and alternatives)
  const [activeRomaji, setActiveRomaji] = useState<string>(currentItem ? currentItem.romaji.toLowerCase() : 'a');
  const [charCursor, setCharCursor] = useState<number>(0);

  // Stats
  const [totalKeystrokes, setTotalKeystrokes] = useState<number>(0);
  const [correctKeystrokes, setCorrectKeystrokes] = useState<number>(0);
  const [combo, setCombo] = useState<number>(0);
  const [maxCombo, setMaxCombo] = useState<number>(0);
  const [completedWordsCount, setCompletedWordsCount] = useState<number>(0);
  const [startTime, setStartTime] = useState<number | null>(null);

  // Visual key animation states
  const [pressedKeys, setPressedKeys] = useState<{ [key: string]: boolean }>({});
  const [errorFlash, setErrorFlash] = useState<boolean>(false);
  const [wordCompleteFlash, setWordCompleteFlash] = useState<boolean>(false);

  // Hidden input for mobile keyboard support
  const hiddenInputRef = useRef<HTMLInputElement>(null);

  // Update target romaji whenever current word changes
  useEffect(() => {
    if (currentItem) {
      setActiveRomaji(currentItem.romaji.toLowerCase());
      setCharCursor(0);
    }
  }, [currentItem]);

  // Speed run timer effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isSpeedRunActive && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsSpeedRunActive(false);
            setIsSpeedRunFinished(true);
            playCelebrationSound();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isSpeedRunActive, timeLeft]);

  // Computed WPM & Accuracy
  const accuracy = totalKeystrokes > 0 ? Math.round((correctKeystrokes / totalKeystrokes) * 100) : 100;
  const elapsedMinutes = startTime ? Math.max((Date.now() - startTime) / 60000, 0.05) : 0.05;
  const wpm = startTime ? Math.round(correctKeystrokes / 5 / elapsedMinutes) : 0;
  const cpm = startTime ? Math.round(correctKeystrokes / elapsedMinutes) : 0;

  // Expected next character
  const expectedChar = activeRomaji[charCursor]?.toLowerCase() || '';

  // Keystroke handler
  const handleKeyInput = useCallback(
    (inputKey: string) => {
      const key = inputKey.toLowerCase();

      // Only handle single alphabetic letters
      if (!/^[a-z]$/.test(key)) return;

      // Start timer on first keystroke
      if (!startTime) {
        setStartTime(Date.now());
        if (isSpeedRunMode && !isSpeedRunActive) {
          setIsSpeedRunActive(true);
        }
      }

      setTotalKeystrokes((prev) => prev + 1);

      // Trigger keycap press animation
      setPressedKeys((prev) => ({ ...prev, [key]: true }));
      setTimeout(() => {
        setPressedKeys((prev) => ({ ...prev, [key]: false }));
      }, 100);

      // Check if typed key matches expected character
      if (key === expectedChar) {
        // Sound
        if (switchType !== 'mute') {
          playMechanicalKeyClick(switchType);
        }

        const newCorrect = correctKeystrokes + 1;
        setCorrectKeystrokes(newCorrect);

        const newCombo = combo + 1;
        setCombo(newCombo);
        if (newCombo > maxCombo) setMaxCombo(newCombo);

        if (newCombo % 5 === 0 && switchType !== 'mute') {
          playComboBurstSound(newCombo);
        }

        const nextCursor = charCursor + 1;

        // Check if word is completed
        if (nextCursor >= activeRomaji.length) {
          // Word completed!
          setWordCompleteFlash(true);
          setCompletedWordsCount((prev) => prev + 1);
          if (switchType !== 'mute') {
            playCorrectSound();
          }

          markItemLearned(currentItem.id, 'vocabulary');

          setTimeout(() => {
            setWordCompleteFlash(false);
            setItemIndex((prev) => prev + 1);
          }, 150);
        } else {
          setCharCursor(nextCursor);
        }
      } else {
        // Check if there is an alternative spelling matching this prefix
        let matchedAlternative = false;
        if (currentItem.alternatives && currentItem.alternatives.length > 0) {
          for (const alt of currentItem.alternatives) {
            const altLower = alt.toLowerCase();
            const typedPrefix = activeRomaji.slice(0, charCursor) + key;
            if (altLower.startsWith(typedPrefix)) {
              // Found alternative spelling! Switch active target to this alternative
              setActiveRomaji(altLower);
              matchedAlternative = true;
              if (switchType !== 'mute') {
                playMechanicalKeyClick(switchType);
              }
              setCorrectKeystrokes((prev) => prev + 1);
              setCharCursor(charCursor + 1);
              break;
            }
          }
        }

        if (!matchedAlternative) {
          // Mistake
          if (switchType !== 'mute') {
            playTypingErrorSound();
          }
          setCombo(0);
          setErrorFlash(true);
          setTimeout(() => setErrorFlash(false), 200);
        }
      }
    },
    [
      expectedChar,
      startTime,
      isSpeedRunMode,
      isSpeedRunActive,
      switchType,
      correctKeystrokes,
      combo,
      maxCombo,
      charCursor,
      activeRomaji,
      currentItem,
      markItemLearned,
    ]
  );

  // Global physical keyboard listener for PC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if focus is inside normal input/textarea outside typing dojo
      if (
        document.activeElement?.tagName === 'INPUT' &&
        document.activeElement !== hiddenInputRef.current
      ) {
        return;
      }
      if (document.activeElement?.tagName === 'TEXTAREA') {
        return;
      }

      if (e.key === ' ' || e.key === 'Backspace' || e.key === 'Tab') {
        // Prevent accidental browser scrolling when practicing
        if (e.key === ' ') e.preventDefault();
      }

      if (/^[a-zA-Z]$/.test(e.key)) {
        e.preventDefault();
        handleKeyInput(e.key);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyInput]);

  // Restart Speed Run
  const restartSpeedRun = () => {
    playTapSound();
    setTimeLeft(60);
    setIsSpeedRunActive(false);
    setIsSpeedRunFinished(false);
    setItemIndex(0);
    setCharCursor(0);
    setTotalKeystrokes(0);
    setCorrectKeystrokes(0);
    setCombo(0);
    setMaxCombo(0);
    setCompletedWordsCount(0);
    setStartTime(null);
  };

  // Change mode
  const selectLesson = (lessonId: string) => {
    playTapSound();
    setActiveLessonId(lessonId);
    setIsSpeedRunMode(false);
    setIsSpeedRunActive(false);
    setIsSpeedRunFinished(false);
    setItemIndex(0);
    setCharCursor(0);
    setCombo(0);
  };

  const startSpeedRunMode = () => {
    playTapSound();
    setIsSpeedRunMode(true);
    restartSpeedRun();
  };

  // Calculate Ninja Rank for Speed Challenge
  const getNinjaRank = () => {
    if (wpm >= 65 && accuracy >= 95) return { title: '🥇 Đại Sư Tốc Gõ', color: 'text-amber-500' };
    if (wpm >= 45 && accuracy >= 90) return { title: '🥈 Kiếm Sĩ Thành Thạo', color: 'text-primary' };
    if (wpm >= 28 && accuracy >= 85) return { title: '🥉 Võ Sinh Kana', color: 'text-blue-500' };
    return { title: '🌱 Người Mới Bắt Đầu', color: 'text-muted-foreground' };
  };

  return (
    <div className="min-h-screen bg-subtle-mesh pb-24 lg:pb-12 pt-6 sm:pt-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
          <Link href="/" className="hover:text-primary transition-colors">Trang chủ</Link>
          <span>/</span>
          <span className="text-foreground font-medium">Luyện gõ tiếng Nhật</span>
        </nav>

        {/* Clean Header & Switch Selector */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="hanko-stamp">タイピング</span>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary">
                Luyện Phản Xạ Romaji IME
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
              Luyện Gõ Tiếng Nhật
            </h1>
            <p className="mt-2 text-sm text-muted-foreground max-w-2xl leading-relaxed">
              Rèn luyện phản xạ gõ Romaji IME tiếng Nhật với bàn phím trực quan, âm thanh switch tùy chọn và phản hồi tức thì trên cả máy tính lẫn điện thoại.
            </p>
          </div>

          {/* Controls: Audio Speed & Switch Profile */}
          <div className="flex flex-wrap items-center gap-2.5 self-start md:self-auto">
            <AudioSpeedControl compact={true} showTestButton={false} />

            {/* Switch Sound Profile Selector */}
            <div className="flex items-center gap-1.5 bg-card border border-border p-1 rounded-xl shadow-xs">
              <span className="text-[11px] font-medium text-muted-foreground px-1.5">Phím:</span>
              {(['blue', 'red', 'brown', 'mute'] as SwitchSoundType[]).map((type) => {
                const label =
                  type === 'blue'
                    ? 'Blue'
                    : type === 'red'
                    ? 'Red'
                    : type === 'brown'
                    ? 'Brown'
                    : 'Tắt';
                return (
                  <button
                    key={type}
                    onClick={() => {
                      setSwitchType(type);
                      if (type !== 'mute') playMechanicalKeyClick(type);
                    }}
                    className={`px-2 py-0.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      switchType === type
                        ? 'bg-primary text-primary-foreground shadow-xs'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Lesson Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {LESSONS.map((l) => (
            <button
              key={l.id}
              onClick={() => selectLesson(l.id)}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
                !isSpeedRunMode && activeLessonId === l.id
                  ? 'btn-tactile bg-primary text-primary-foreground'
                  : 'btn-tactile-secondary bg-card text-muted-foreground hover:text-foreground'
              }`}
            >
              <span className="ja-text font-bold">{l.icon}</span>
              <span>{l.name}</span>
            </button>
          ))}

          {/* 60s Speed Run Mode Button */}
          <button
            onClick={startSpeedRunMode}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
              isSpeedRunMode
                ? 'btn-tactile bg-amber-500 text-white'
                : 'btn-tactile-secondary bg-card text-amber-500 hover:bg-amber-500/10'
            }`}
          >
            <span>⚡</span>
            <span>Đua Tốc Độ 60s</span>
          </button>
        </div>

        {/* Real-time Performance HUD */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-card border border-border rounded-2xl p-3.5 sm:p-4 text-center card-craft">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase">Tốc độ WPM</span>
            <div className="text-2xl sm:text-3xl font-extrabold text-foreground mt-1 font-mono">
              {wpm}
            </div>
            <span className="text-[10px] text-muted-foreground">{cpm} ký tự/phút</span>
          </div>

          <div className="bg-card border border-border rounded-2xl p-3.5 sm:p-4 text-center card-craft">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase">Độ chính xác</span>
            <div
              className={`text-2xl sm:text-3xl font-extrabold mt-1 font-mono ${
                accuracy >= 90 ? 'text-success' : accuracy >= 75 ? 'text-warning' : 'text-error'
              }`}
            >
              {accuracy}%
            </div>
            <span className="text-[10px] text-muted-foreground">{correctKeystrokes}/{totalKeystrokes} phím</span>
          </div>

          <div className="bg-card border border-border rounded-2xl p-3.5 sm:p-4 text-center card-craft">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase">Chuỗi Combo</span>
            <div className="text-2xl sm:text-3xl font-extrabold text-primary mt-1 font-mono flex items-center justify-center gap-1">
              <span>{combo}</span>
              {combo >= 5 && <span className="text-base animate-bounce">🔥</span>}
            </div>
            <span className="text-[10px] text-muted-foreground">Kỷ lục: {maxCombo}</span>
          </div>

          <div className="bg-card border border-border rounded-2xl p-3.5 sm:p-4 text-center card-craft">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase">
              {isSpeedRunMode ? 'Thời gian còn lại' : 'Đã hoàn thành'}
            </span>
            <div
              className={`text-2xl sm:text-3xl font-extrabold mt-1 font-mono ${
                isSpeedRunMode && timeLeft <= 10 ? 'text-error animate-pulse' : 'text-foreground'
              }`}
            >
              {isSpeedRunMode ? `${timeLeft}s` : completedWordsCount}
            </div>
            <span className="text-[10px] text-muted-foreground">
              {isSpeedRunMode ? 'Đếm ngược 60s' : `Từ thứ ${itemIndex + 1}`}
            </span>
          </div>
        </div>

        {/* CLEAN MODERN TARGET PROMPT CARD */}
        <div className="flex justify-center py-2">
          <div
            className={`
              stage-card-clean w-full max-w-2xl bg-card rounded-2xl sm:rounded-3xl border p-6 sm:p-8 text-center relative overflow-hidden transition-all duration-150
              ${errorFlash ? 'border-error shadow-[0_0_20px_rgba(239,68,68,0.25)] animate-shake' : 'border-border'}
              ${wordCompleteFlash ? 'border-success shadow-[0_0_20px_rgba(34,197,94,0.25)] scale-[1.01]' : ''}
            `}
          >
            {/* Top row: Word level + Native Pronounce button */}
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
              <span className="px-2.5 py-1 rounded-full bg-secondary font-medium">
                {isSpeedRunMode ? '⚡ Thử thách tốc độ' : `Bài học: ${currentItem?.japanese}`}
              </span>
              <button
                onClick={() => speak({ text: currentItem.japanese })}
                className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-secondary hover:bg-muted text-foreground transition-colors cursor-pointer"
                title="Nghe phát âm chuẩn"
              >
                <span>🔊</span>
                <span>Nghe</span>
              </button>
            </div>

            {/* Main Japanese Display (Kanji / Hiragana) */}
            <div className="py-2">
              <h2 className="ja-text text-5xl sm:text-6xl font-black text-foreground tracking-wide">
                {currentItem?.japanese}
              </h2>
              {currentItem?.hiragana !== currentItem?.japanese && (
                <p className="ja-text text-sm sm:text-base text-primary/90 mt-1 font-semibold">
                  （{currentItem?.hiragana}）
                </p>
              )}
            </div>

            {/* Target Romaji String with Character-by-Character Highlighting */}
            <div className="mt-4 py-3 px-5 rounded-2xl bg-secondary/60 border border-border inline-flex items-center gap-0.5 font-mono text-2xl sm:text-3xl font-bold tracking-wider">
              {activeRomaji.split('').map((char, idx) => {
                const isCompleted = idx < charCursor;
                const isCurrent = idx === charCursor;

                return (
                  <span
                    key={idx}
                    className={`
                      relative px-1 transition-all duration-100 rounded
                      ${isCompleted ? 'text-success font-black' : ''}
                      ${isCurrent ? 'text-primary underline decoration-primary decoration-4 underline-offset-4 animate-pulse' : ''}
                      ${idx > charCursor ? 'text-muted-foreground/40' : ''}
                    `}
                  >
                    {char}
                  </span>
                );
              })}
            </div>

            {/* Meaning in Vietnamese */}
            <p className="mt-4 text-sm sm:text-base text-muted-foreground font-medium">
              👉 {currentItem?.meaning}
            </p>

            {/* Mobile Touch Input Trigger (Invisible native input for phone keyboard) */}
            <div className="mt-5 block sm:hidden">
              <input
                ref={hiddenInputRef}
                type="text"
                autoCapitalize="none"
                autoComplete="off"
                autoCorrect="off"
                spellCheck="false"
                placeholder="Chạm vào đây để gõ trên điện thoại..."
                className="w-full text-center py-2.5 px-4 rounded-xl border border-primary/40 bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary shadow-inner"
                onChange={(e) => {
                  const val = e.target.value;
                  if (val.length > 0) {
                    const lastChar = val[val.length - 1];
                    handleKeyInput(lastChar);
                    e.target.value = '';
                  }
                }}
              />
            </div>
          </div>
        </div>

        {/* MODERN FLAT ON-SCREEN KEYBOARD (PC & MOBILE) */}
        <div className="max-w-3xl mx-auto space-y-2 select-none pt-2">
          <div className="text-center text-xs text-muted-foreground mb-1">
            <span>⌨️ Phím phát sáng là phím cần gõ tiếp theo (Hỗ trợ chạm trên điện thoại & gõ phím trực tiếp trên máy tính)</span>
          </div>

          {KEYBOARD_ROWS.map((row, rIdx) => (
            <div key={rIdx} className="flex justify-center gap-1.5 sm:gap-2">
              {row.map((key) => {
                const isTarget = key === expectedChar;
                const isPressed = Boolean(pressedKeys[key]);

                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleKeyInput(key)}
                    className={`
                      keycap-flat w-8 h-12 sm:w-14 sm:h-14 font-mono font-bold text-sm sm:text-base flex flex-col items-center justify-between py-1 sm:py-1.5 cursor-pointer
                      ${isTarget ? 'target-key font-black' : 'text-foreground'}
                      ${isPressed ? 'pressed' : ''}
                    `}
                    aria-label={`Phím ${key.toUpperCase()}`}
                  >
                    <span className="text-[10px] text-muted-foreground/60 leading-none self-start pl-1 sm:pl-1.5">
                      •
                    </span>
                    <span className="text-sm sm:text-lg uppercase leading-none font-extrabold">
                      {key}
                    </span>
                    <span className="text-[9px] text-muted-foreground/40 leading-none">
                      {key === 'f' || key === 'j' ? '—' : ''}
                    </span>
                  </button>
                );
              })}
            </div>
          ))}

          {/* Spacebar Row */}
          <div className="flex justify-center gap-2 pt-1">
            <button
              type="button"
              onClick={() => {
                if (hiddenInputRef.current) hiddenInputRef.current.focus();
              }}
              className="keycap-flat w-48 sm:w-72 h-10 sm:h-12 text-xs font-semibold text-muted-foreground flex items-center justify-center cursor-pointer"
            >
              SPACE (Khoảng trắng)
            </button>
          </div>
        </div>

        {/* Speed Run Finished Results Modal */}
        {isSpeedRunFinished && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-card border border-border rounded-2xl max-w-md w-full p-6 sm:p-8 text-center space-y-6 shadow-2xl animate-in fade-in zoom-in-95">
              <div className="w-16 h-16 rounded-full bg-amber-500/10 text-amber-500 text-3xl flex items-center justify-center mx-auto">
                ⚡
              </div>

              <div>
                <h3 className="text-2xl font-extrabold text-foreground">Hoàn Thành Đua Tốc Độ!</h3>
                <p className="text-xs text-muted-foreground mt-1">Kết quả kiểm tra tốc độ gõ tiếng Nhật 60 giây</p>
              </div>

              <div className="p-4 rounded-xl bg-secondary/50 border border-border space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Tốc độ gõ (WPM):</span>
                  <span className="font-mono font-bold text-foreground text-lg">{wpm} WPM</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Ký tự/phút (CPM):</span>
                  <span className="font-mono font-bold text-foreground">{cpm} CPM</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Độ chính xác:</span>
                  <span className="font-mono font-bold text-success">{accuracy}%</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Số từ hoàn thành:</span>
                  <span className="font-mono font-bold text-foreground">{completedWordsCount} từ</span>
                </div>
                <div className="flex justify-between items-center text-sm pt-2 border-t border-border/60">
                  <span className="text-muted-foreground">Danh hiệu đạt được:</span>
                  <span className={`font-bold ${getNinjaRank().color}`}>{getNinjaRank().title}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={restartSpeedRun}
                  className="flex-1 py-3 bg-primary text-primary-foreground font-bold rounded-xl btn-tactile text-sm cursor-pointer"
                >
                  🔄 Thử lại ngay
                </button>
                <button
                  onClick={() => setIsSpeedRunFinished(false)}
                  className="px-5 py-3 bg-secondary text-foreground font-semibold rounded-xl hover:bg-muted text-sm cursor-pointer"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
