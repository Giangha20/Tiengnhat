'use client';

import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import type { UserProgress, SRSItem, LearningStatus } from '@/types';
import {
  exportProgressToFile,
  importProgressFromFile,
  saveProgressOnline,
  loadProgressOnline,
  generateRandomSyncCode,
} from '@/lib/sync';
import { useAuth } from './AuthProvider';

const DEFAULT_PROGRESS: UserProgress = {
  totalWordsLearned: 0,
  totalKanjiLearned: 0,
  totalGrammarLearned: 0,
  hiraganaProgress: 0,
  katakanaProgress: 0,
  currentLevel: 'N5',
  currentStreak: 0,
  longestStreak: 0,
  totalStudyTime: 0,
  dailyGoal: 10,
  todayItemsLearned: 0,
  todayItemsReviewed: 0,
  todayCorrectRate: 0,
  lastStudyDate: null,
  exerciseResults: [],
  reviewQueue: [],
};

interface ProgressContextType {
  progress: UserProgress;
  updateProgress: (updates: Partial<UserProgress>) => void;
  markItemLearned: (itemId: string, itemType: SRSItem['itemType']) => void;
  recordReview: (itemId: string, itemType: SRSItem['itemType'], correct: boolean) => void;
  getItemStatus: (itemId: string, itemType: SRSItem['itemType']) => LearningStatus;
  resetProgress: () => void;
  isLoaded: boolean;
  isServerSyncing: boolean;
  // File & Online Sync methods
  exportToFile: () => { filename: string; sizeKb: number };
  importFromFile: (file: File) => Promise<{ success: boolean; error?: string }>;
  saveToCloud: (code: string) => Promise<{ success: boolean; message: string; updatedAt?: string }>;
  loadFromCloud: (code: string) => Promise<{ success: boolean; error?: string; updatedAt?: string }>;
  syncCode: string;
  setSyncCode: (code: string) => void;
  lastSyncedAt: string | null;
}

const ProgressContext = createContext<ProgressContextType>({
  progress: DEFAULT_PROGRESS,
  updateProgress: () => {},
  markItemLearned: () => {},
  recordReview: () => {},
  getItemStatus: () => 'new',
  resetProgress: () => {},
  isLoaded: false,
  isServerSyncing: false,
  exportToFile: () => ({ filename: '', sizeKb: 0 }),
  importFromFile: async () => ({ success: false }),
  saveToCloud: async () => ({ success: false, message: '' }),
  loadFromCloud: async () => ({ success: false }),
  syncCode: '',
  setSyncCode: () => {},
  lastSyncedAt: null,
});

export function useProgress() {
  return useContext(ProgressContext);
}

const STORAGE_KEY = 'nihongo-progress';
const SYNC_CODE_KEY = 'nihongo-sync-code';
const LAST_SYNC_KEY = 'nihongo-last-sync';

// Simple SRS algorithm based on SM-2
function calculateSRS(item: SRSItem, correct: boolean): SRSItem {
  const newItem = { ...item };

  if (correct) {
    newItem.correctCount += 1;
    newItem.repetitions += 1;

    if (newItem.repetitions === 1) {
      newItem.interval = 1;
    } else if (newItem.repetitions === 2) {
      newItem.interval = 3;
    } else {
      newItem.interval = Math.round(newItem.interval * newItem.easeFactor);
    }

    newItem.easeFactor = Math.max(
      1.3,
      newItem.easeFactor + (0.1 - (5 - 4) * (0.08 + (5 - 4) * 0.02))
    );

    if (newItem.repetitions >= 5 && newItem.correctCount / (newItem.correctCount + newItem.incorrectCount) > 0.8) {
      newItem.status = 'mastered';
    } else if (newItem.repetitions >= 2) {
      newItem.status = 'reviewing';
    } else {
      newItem.status = 'learning';
    }
  } else {
    newItem.incorrectCount += 1;
    newItem.repetitions = 0;
    newItem.interval = 1;
    newItem.easeFactor = Math.max(1.3, newItem.easeFactor - 0.2);
    newItem.status = 'learning';
  }

  const now = new Date();
  newItem.lastReviewedAt = now.toISOString();
  const nextReview = new Date(now);
  nextReview.setDate(nextReview.getDate() + newItem.interval);
  newItem.nextReviewAt = nextReview.toISOString();

  return newItem;
}

function isSameDay(date1: string, date2: string): boolean {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const { user, getAccountProgress, syncWithAccount } = useAuth();
  const [progress, setProgress] = useState<UserProgress>(DEFAULT_PROGRESS);
  const [syncCode, setSyncCodeState] = useState<string>('');
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isServerSyncing, setIsServerSyncing] = useState(false);
  const isFirstSyncDone = useRef(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as UserProgress;
        // Check if it's a new day - reset daily counters
        const today = new Date().toISOString();
        if (parsed.lastStudyDate && !isSameDay(parsed.lastStudyDate, today)) {
          parsed.todayItemsLearned = 0;
          parsed.todayItemsReviewed = 0;
          parsed.todayCorrectRate = 0;
        }
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setProgress(parsed);
      }

      // Load sync settings
      const savedCode = localStorage.getItem(SYNC_CODE_KEY);
      if (savedCode) {
        setSyncCodeState(savedCode);
      } else {
        const newCode = generateRandomSyncCode();
        setSyncCodeState(newCode);
        localStorage.setItem(SYNC_CODE_KEY, newCode);
      }

      const savedSyncTime = localStorage.getItem(LAST_SYNC_KEY);
      if (savedSyncTime) {
        setLastSyncedAt(savedSyncTime);
      }
    } catch {
      console.warn('Không thể đọc tiến độ từ localStorage. Sử dụng giá trị mặc định.');
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
      } catch {
        console.warn('Không thể lưu tiến độ vào localStorage.');
      }
    }
  }, [progress, isLoaded]);

  // Initial account sync when user logs in
  useEffect(() => {
    if (user && isLoaded && !isFirstSyncDone.current) {
      isFirstSyncDone.current = true;
      setIsServerSyncing(true);
      getAccountProgress()
        .then((cloudProgress) => {
          if (cloudProgress) {
            const cloudScore =
              (cloudProgress.totalWordsLearned || 0) +
              (cloudProgress.totalKanjiLearned || 0) +
              (cloudProgress.totalGrammarLearned || 0) +
              (cloudProgress.exerciseResults?.length || 0);

            const localScore =
              (progress.totalWordsLearned || 0) +
              (progress.totalKanjiLearned || 0) +
              (progress.totalGrammarLearned || 0) +
              (progress.exerciseResults?.length || 0);

            if (cloudScore >= localScore && cloudScore > 0) {
              setProgress(cloudProgress);
            } else {
              // Local has newer or more lessons completed -> push to server account
              syncWithAccount(progress);
            }
          } else {
            // First time login with this account -> save current progress to server
            syncWithAccount(progress);
          }
        })
        .finally(() => {
          setIsServerSyncing(false);
        });
    }

    if (!user) {
      isFirstSyncDone.current = false;
    }
  }, [user, isLoaded, getAccountProgress, syncWithAccount, progress]);

  // Real-time Debounced Auto-Sync to server (1.5s after user finishes learning an item or exercise)
  useEffect(() => {
    if (!isLoaded || !user) return;

    const timer = setTimeout(async () => {
      try {
        setIsServerSyncing(true);
        const res = await syncWithAccount(progress);
        if (res.success) {
          const now = new Date().toISOString();
          setLastSyncedAt(now);
          try {
            localStorage.setItem(LAST_SYNC_KEY, now);
          } catch {}
        }
      } catch (err) {
        console.warn('Lỗi tự động lưu bài học lên server:', err);
      } finally {
        setIsServerSyncing(false);
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [progress, user, isLoaded, syncWithAccount]);

  const updateProgress = useCallback((updates: Partial<UserProgress>) => {
    setProgress((prev) => ({ ...prev, ...updates }));
  }, []);

  const setSyncCode = useCallback((newCode: string) => {
    const clean = newCode.trim().toUpperCase();
    setSyncCodeState(clean);
    try {
      localStorage.setItem(SYNC_CODE_KEY, clean);
    } catch (e) {
      console.warn('Không thể lưu sync code:', e);
    }
  }, []);

  const exportToFile = useCallback(() => {
    return exportProgressToFile(progress);
  }, [progress]);

  const importFromFile = useCallback(async (file: File) => {
    const result = await importProgressFromFile(file);
    if (result.success && result.data) {
      setProgress(result.data);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(result.data));
      } catch (e) {
        console.warn('Lỗi ghi localStorage:', e);
      }
      return { success: true };
    }
    return { success: false, error: result.error || 'Dữ liệu không hợp lệ.' };
  }, []);

  const saveToCloud = useCallback(
    async (code: string) => {
      const targetCode = code.trim().toUpperCase() || syncCode;
      const res = await saveProgressOnline(targetCode, progress);
      if (res.success && res.updatedAt) {
        setLastSyncedAt(res.updatedAt);
        setSyncCode(targetCode);
        try {
          localStorage.setItem(LAST_SYNC_KEY, res.updatedAt);
        } catch (e) {
          console.warn('Lỗi lưu thời gian sync:', e);
        }
      }
      return res;
    },
    [progress, syncCode, setSyncCode]
  );

  const loadFromCloud = useCallback(
    async (code: string) => {
      const targetCode = code.trim().toUpperCase() || syncCode;
      const res = await loadProgressOnline(targetCode);
      if (res.success && res.data) {
        setProgress(res.data);
        setSyncCode(targetCode);
        if (res.updatedAt) {
          setLastSyncedAt(res.updatedAt);
          try {
            localStorage.setItem(LAST_SYNC_KEY, res.updatedAt);
          } catch (e) {
            console.warn('Lỗi lưu thời gian sync:', e);
          }
        }
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(res.data));
        } catch (e) {
          console.warn('Lỗi lưu tiến độ:', e);
        }
        return { success: true, updatedAt: res.updatedAt };
      }
      return { success: false, error: res.error || 'Không thể tải dữ liệu từ đám mây.' };
    },
    [syncCode, setSyncCode]
  );

  const markItemLearned = useCallback(
    (itemId: string, itemType: SRSItem['itemType']) => {
      setProgress((prev) => {
        const existingIndex = prev.reviewQueue.findIndex(
          (item) => item.itemId === itemId && item.itemType === itemType
        );

        if (existingIndex >= 0) {
          return prev;
        }

        const newItem: SRSItem = {
          itemId,
          itemType,
          status: 'learning',
          easeFactor: 2.5,
          interval: 1,
          repetitions: 0,
          correctCount: 0,
          incorrectCount: 0,
          lastReviewedAt: new Date().toISOString(),
          nextReviewAt: new Date(Date.now() + 86400000).toISOString(),
        };

        const updates: Partial<UserProgress> = {
          reviewQueue: [...prev.reviewQueue, newItem],
          todayItemsLearned: prev.todayItemsLearned + 1,
          lastStudyDate: new Date().toISOString(),
        };

        if (itemType === 'vocabulary') {
          updates.totalWordsLearned = prev.totalWordsLearned + 1;
        } else if (itemType === 'kanji') {
          updates.totalKanjiLearned = prev.totalKanjiLearned + 1;
        } else if (itemType === 'grammar') {
          updates.totalGrammarLearned = prev.totalGrammarLearned + 1;
        }

        return { ...prev, ...updates };
      });
    },
    []
  );

  const recordReview = useCallback(
    (itemId: string, itemType: SRSItem['itemType'], correct: boolean) => {
      setProgress((prev) => {
        const queueIndex = prev.reviewQueue.findIndex(
          (item) => item.itemId === itemId && item.itemType === itemType
        );

        const newQueue = [...prev.reviewQueue];

        if (queueIndex >= 0) {
          newQueue[queueIndex] = calculateSRS(newQueue[queueIndex], correct);
        } else {
          const newItem: SRSItem = {
            itemId,
            itemType,
            status: 'learning',
            easeFactor: 2.5,
            interval: 1,
            repetitions: 0,
            correctCount: 0,
            incorrectCount: 0,
            lastReviewedAt: null,
            nextReviewAt: null,
          };
          newQueue.push(calculateSRS(newItem, correct));
        }

        const todayReviewed = prev.todayItemsReviewed + 1;
        const todayCorrect = correct
          ? Math.round(
              ((prev.todayCorrectRate / 100) * prev.todayItemsReviewed + 1) /
                todayReviewed *
                100
            )
          : Math.round(
              ((prev.todayCorrectRate / 100) * prev.todayItemsReviewed) /
                todayReviewed *
                100
            );

        return {
          ...prev,
          reviewQueue: newQueue,
          todayItemsReviewed: todayReviewed,
          todayCorrectRate: todayCorrect,
          lastStudyDate: new Date().toISOString(),
        };
      });
    },
    []
  );

  const getItemStatus = useCallback(
    (itemId: string, itemType: SRSItem['itemType']): LearningStatus => {
      const item = progress.reviewQueue.find(
        (i) => i.itemId === itemId && i.itemType === itemType
      );
      return item?.status || 'new';
    },
    [progress.reviewQueue]
  );

  const resetProgress = useCallback(() => {
    setProgress(DEFAULT_PROGRESS);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return (
    <ProgressContext.Provider
      value={{
        progress,
        updateProgress,
        markItemLearned,
        recordReview,
        getItemStatus,
        resetProgress,
        isLoaded,
        isServerSyncing,
        exportToFile,
        importFromFile,
        saveToCloud,
        loadFromCloud,
        syncCode,
        setSyncCode,
        lastSyncedAt,
      }}
    >
      {children}
    </ProgressContext.Provider>
  );
}
