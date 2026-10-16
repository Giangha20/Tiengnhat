// ===== Core Data Types =====

export type VerificationStatus = 'verified' | 'reviewed' | 'draft' | 'unverified';

export type JLPTLevel = 'N5' | 'N4' | 'N3' | 'N2' | 'N1';

export type LearningStatus = 'new' | 'learning' | 'reviewing' | 'mastered';

// ===== Kana Types =====

export interface KanaCharacter {
  character: string;
  romaji: string;
  pronunciationGuideVi: string;
  strokeCount: number;
  exampleWord: string;
  exampleReading: string;
  exampleMeaning: string;
  group: string;
  order: number;
  verificationStatus: VerificationStatus;
  hiraganaEquivalent?: string; // For katakana only
}

export interface KanaGroup {
  name: string;
  nameJa: string;
  type: 'basic' | 'dakuten' | 'handakuten' | 'combo';
  characters: KanaCharacter[];
}

export interface KanaData {
  metadata: {
    title: string;
    description: string;
    verificationStatus: VerificationStatus;
    sources: string[];
    lastUpdated: string;
  };
  groups: KanaGroup[];
}

// ===== Vocabulary Types =====

export interface VocabularyWord {
  id: string;
  word: string;
  kanji: string | null;
  reading: string;
  romaji: string;
  meaning: string;
  wordType: string;
  usage: string;
  exampleJa: string;
  exampleReading: string;
  exampleRomaji: string;
  exampleVi: string;
  notes: string;
  synonyms: string[];
  antonyms: string[];
  relatedWords?: string[];
  level: JLPTLevel;
  verificationStatus: VerificationStatus;
}

export interface VocabularyTopic {
  id: string;
  name: string;
  nameJa: string;
  words: VocabularyWord[];
}

export interface VocabularyData {
  metadata: {
    level: JLPTLevel;
    title: string;
    description: string;
    totalWords: number;
    verificationStatus: VerificationStatus;
    sources: string[];
    lastUpdated: string;
  };
  topics: VocabularyTopic[];
}

// ===== Grammar Types =====

export interface GrammarExample {
  japanese: string;
  reading: string;
  romaji: string;
  vietnamese: string;
  explanation: string;
}

export interface GrammarExercise {
  id: string;
  type: 'multiple_choice' | 'fill_blank' | 'reorder' | 'translate';
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
}

export interface GrammarPoint {
  id: string;
  name: string;
  nameVi: string;
  level: JLPTLevel;
  formula: string;
  meaning: string;
  usage: string;
  conjugation: string;
  examples: GrammarExample[];
  commonMistakes: string[];
  comparisonWith: string[];
  exercises: GrammarExercise[];
  order: number;
  verificationStatus: VerificationStatus;
}

export interface GrammarData {
  metadata: {
    level: JLPTLevel;
    title: string;
    description: string;
    totalPoints: number;
    verificationStatus: VerificationStatus;
    sources: string[];
    lastUpdated: string;
  };
  grammarPoints: GrammarPoint[];
}

// ===== Kanji Types =====

export interface KanjiCharacter {
  id: string;
  character: string;
  onReading: string[];
  kunReading: string[];
  meaning: string;
  radical: string;
  strokeCount: number;
  level: JLPTLevel;
  compounds: {
    word: string;
    reading: string;
    meaning: string;
  }[];
  exampleSentences: {
    japanese: string;
    reading: string;
    vietnamese: string;
  }[];
  similarKanji: string[];
  verificationStatus: VerificationStatus;
}

// ===== Flashcard Types =====

export interface FlashcardItem {
  id: string;
  front: string;
  back: string;
  frontLabel?: string;
  backLabel?: string;
  reading?: string;
  romaji?: string;
  example?: string;
  exampleMeaning?: string;
  type: 'vocabulary' | 'kanji' | 'grammar' | 'hiragana' | 'katakana';
  level?: JLPTLevel;
  topic?: string;
}

// ===== Exercise Types =====

export type ExerciseType =
  | 'multiple_choice'
  | 'fill_blank'
  | 'matching'
  | 'listening'
  | 'reorder'
  | 'conjugation'
  | 'reading_comprehension'
  | 'find_error'
  | 'writing';

export interface ExerciseQuestion {
  id: string;
  type: ExerciseType;
  question: string;
  questionJa?: string;
  options?: string[];
  correctAnswer: string | string[];
  explanation: string;
  explanationJa?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  points: number;
  audioUrl?: string;
}

export interface Exercise {
  id: string;
  title: string;
  titleJa?: string;
  description: string;
  level: JLPTLevel;
  topic: string;
  type: ExerciseType;
  questions: ExerciseQuestion[];
  passingScore: number;
  timeLimit?: number; // in seconds
  verificationStatus: VerificationStatus;
}

// ===== SRS (Spaced Repetition) Types =====

export interface SRSItem {
  itemId: string;
  itemType: 'vocabulary' | 'kanji' | 'grammar' | 'hiragana' | 'katakana';
  status: LearningStatus;
  easeFactor: number; // Default 2.5
  interval: number; // Days until next review
  repetitions: number;
  correctCount: number;
  incorrectCount: number;
  lastReviewedAt: string | null;
  nextReviewAt: string | null;
}

// ===== User Progress Types =====

export interface UserProgress {
  totalWordsLearned: number;
  totalKanjiLearned: number;
  totalGrammarLearned: number;
  hiraganaProgress: number; // 0-100
  katakanaProgress: number; // 0-100
  currentLevel: JLPTLevel;
  avatar?: string;
  currentStreak: number;
  longestStreak: number;
  totalStudyTime: number; // minutes
  dailyGoal: number; // items per day
  todayItemsLearned: number;
  todayItemsReviewed: number;
  todayCorrectRate: number; // 0-100
  lastStudyDate: string | null;
  exerciseResults: {
    exerciseId: string;
    score: number;
    totalQuestions: number;
    completedAt: string;
  }[];
  reviewQueue: SRSItem[];
}

// ===== Study Session =====

export interface StudySession {
  id: string;
  type: 'lesson' | 'review' | 'exercise' | 'flashcard' | 'test';
  startedAt: string;
  endedAt?: string;
  itemsStudied: number;
  correctAnswers: number;
  totalQuestions: number;
}

// ===== Navigation =====

export interface NavItem {
  label: string;
  labelJa?: string;
  href: string;
  icon?: string;
  children?: NavItem[];
  badge?: string;
  isNew?: boolean;
}

// ===== Theme =====

export type Theme = 'light' | 'dark' | 'system';

// ===== Audio =====

export interface AudioState {
  isSupported: boolean;
  hasJapaneseVoice: boolean;
  isPlaying: boolean;
  error: string | null;
}
