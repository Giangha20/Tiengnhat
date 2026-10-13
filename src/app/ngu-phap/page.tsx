'use client';

import { useState, useMemo } from 'react';
import grammarDataRaw from '@/data/grammar/n5-grammar.json';
import type {
  GrammarData,
  GrammarPoint,
  GrammarExample,
  GrammarExercise,
  JLPTLevel,
} from '@/types';
import { speak } from '@/lib/audio';
import { useProgress } from '@/components/providers/ProgressProvider';

const grammarData = grammarDataRaw as unknown as GrammarData;

const LEVELS: { id: 'ALL' | JLPTLevel; label: string; count?: number; active: boolean }[] = [
  { id: 'ALL', label: 'Tất cả', active: true },
  { id: 'N5', label: 'N5 Cơ bản', active: true },
  { id: 'N4', label: 'N4 (Sắp ra mắt)', active: false },
  { id: 'N3', label: 'N3 (Sắp ra mắt)', active: false },
  { id: 'N2', label: 'N2 (Sắp ra mắt)', active: false },
  { id: 'N1', label: 'N1 (Sắp ra mắt)', active: false },
];

export default function GrammarPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<'ALL' | JLPTLevel>('ALL');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set(['n5_gp_001']));
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);

  // Exercise states: exerciseId -> { selectedOption?: string; fillInput?: string; isSubmitted: boolean; isCorrect: boolean }
  const [exerciseStates, setExerciseStates] = useState<
    Record<
      string,
      {
        selectedOption?: string;
        fillInput?: string;
        isSubmitted: boolean;
        isCorrect: boolean;
      }
    >
  >({});

  const { getItemStatus, markItemLearned } = useProgress();

  // Filter grammar points
  const filteredGrammarPoints = useMemo<GrammarPoint[]>(() => {
    return grammarData.grammarPoints
      .filter((gp: GrammarPoint) => {
        // Level filter
        if (selectedLevel !== 'ALL' && gp.level !== selectedLevel) {
          return false;
        }

        // Search filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchName = gp.name.toLowerCase().includes(q);
          const matchNameVi = gp.nameVi.toLowerCase().includes(q);
          const matchFormula = gp.formula.toLowerCase().includes(q);
          const matchMeaning = gp.meaning.toLowerCase().includes(q);
          const matchUsage = gp.usage.toLowerCase().includes(q);
          return matchName || matchNameVi || matchFormula || matchMeaning || matchUsage;
        }

        return true;
      })
      .sort((a, b) => a.order - b.order);
  }, [searchQuery, selectedLevel]);

  // Expand / collapse all
  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const expandAll = () => {
    setExpandedIds(new Set(filteredGrammarPoints.map((gp) => gp.id)));
  };

  const collapseAll = () => {
    setExpandedIds(new Set());
  };

  // Audio speech
  const handlePlayAudio = (id: string, text: string) => {
    setPlayingAudioId(id);
    speak({
      text,
      rate: 0.85,
      onEnd: () => setPlayingAudioId(null),
      onError: () => setPlayingAudioId(null),
    });
  };

  // Multiple choice answer click
  const handleSelectOption = (exercise: GrammarExercise, option: string) => {
    const isCorrect = option.trim() === exercise.correctAnswer.trim();
    setExerciseStates((prev) => ({
      ...prev,
      [exercise.id]: {
        selectedOption: option,
        isSubmitted: true,
        isCorrect,
      },
    }));
  };

  // Fill in blank check
  const handleCheckFillBlank = (exercise: GrammarExercise) => {
    const current = exerciseStates[exercise.id];
    const answer = (current?.fillInput || '').trim();
    if (!answer) return;

    const isCorrect =
      answer.toLowerCase() === exercise.correctAnswer.trim().toLowerCase();

    setExerciseStates((prev) => ({
      ...prev,
      [exercise.id]: {
        ...prev[exercise.id],
        isSubmitted: true,
        isCorrect,
      },
    }));
  };

  // Reset an exercise
  const handleResetExercise = (exerciseId: string) => {
    setExerciseStates((prev) => {
      const next = { ...prev };
      delete next[exerciseId];
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Page Header */}
        <div className="border-b border-border pb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                  JLPT N5
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20">
                  ✓ Dữ liệu chuẩn xác đã duyệt
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
                Ngữ pháp tiếng Nhật N5
              </h1>
              <p className="mt-2 text-base text-muted-foreground">
                Tổng hợp {grammarData.grammarPoints.length} cấu trúc ngữ pháp chuẩn theo giáo trình Minna no Nihongo & Genki. Có giải thích chi tiết, ví dụ đọc âm và bài tập tương tác.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={expandAll}
                className="px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg border border-border bg-card hover:bg-secondary text-foreground transition-colors"
              >
                Mở tất cả
              </button>
              <button
                type="button"
                onClick={collapseAll}
                className="px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg border border-border bg-card hover:bg-secondary text-foreground transition-colors"
              >
                Thu gọn
              </button>
            </div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-card border border-border rounded-xl p-4 sm:p-5 shadow-sm space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            {/* Search Input */}
            <div className="md:col-span-8 relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm ngữ pháp theo tên (〜は), ý nghĩa (khẳng định), hoặc công thức..."
                className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground"
                  aria-label="Xóa tìm kiếm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            {/* Level Quick Select */}
            <div className="md:col-span-4 flex items-center justify-between sm:justify-end gap-2">
              <span className="text-xs text-muted-foreground">Hiển thị:</span>
              <span className="text-sm font-semibold text-foreground">
                {filteredGrammarPoints.length} / {grammarData.grammarPoints.length} bài
              </span>
            </div>
          </div>

          {/* Level Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 scrollbar-none">
            {LEVELS.map((lvl) => {
              const isSelected = selectedLevel === lvl.id;
              return (
                <button
                  key={lvl.id}
                  type="button"
                  disabled={!lvl.active}
                  onClick={() => lvl.active && setSelectedLevel(lvl.id)}
                  className={`
                    px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition-colors
                    ${
                      isSelected
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : lvl.active
                        ? 'bg-secondary text-secondary-foreground hover:bg-muted'
                        : 'bg-muted/40 text-muted-foreground cursor-not-allowed opacity-60'
                    }
                  `}
                >
                  {lvl.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Results List */}
        {filteredGrammarPoints.length === 0 ? (
          <div className="text-center py-16 bg-card rounded-xl border border-border">
            <svg
              className="w-12 h-12 mx-auto text-muted-foreground mb-3 opacity-60"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-lg font-medium text-foreground">Không tìm thấy ngữ pháp phù hợp</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Thử tìm kiếm với từ khóa khác hoặc xóa bộ lọc.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedLevel('ALL');
              }}
              className="mt-4 px-4 py-2 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
            >
              Xóa bộ lọc
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredGrammarPoints.map((point) => {
              const isExpanded = expandedIds.has(point.id);
              const status = getItemStatus(point.id, 'grammar');
              const isLearned = status === 'mastered' || status === 'reviewing' || status === 'learning';

              return (
                <article
                  key={point.id}
                  id={point.id}
                  className="bg-card border border-border rounded-xl shadow-sm hover:border-primary/40 transition-all overflow-hidden"
                >
                  {/* Card Header (Accordion trigger) */}
                  <div
                    onClick={() => toggleExpand(point.id)}
                    className="p-4 sm:p-5 cursor-pointer select-none flex items-start sm:items-center justify-between gap-3 bg-card hover:bg-secondary/40 transition-colors"
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        toggleExpand(point.id);
                      }
                    }}
                    aria-expanded={isExpanded}
                    aria-controls={`content-${point.id}`}
                  >
                    <div className="flex items-start sm:items-center gap-3 flex-1 min-w-0">
                      {/* Order Badge */}
                      <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary/10 text-primary font-bold text-sm flex items-center justify-center">
                        #{point.order}
                      </span>

                      {/* Title & Formula Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="ja-text text-xl font-bold text-primary hover:underline">
                            {point.name}
                          </h2>
                          <span className="text-sm text-muted-foreground font-normal">
                            — {point.nameVi}
                          </span>
                        </div>

                        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
                          <span className="font-mono bg-secondary text-foreground px-2 py-0.5 rounded border border-border">
                            {point.formula}
                          </span>
                          <span className="px-2 py-0.5 rounded font-semibold bg-primary/10 text-primary">
                            {point.level}
                          </span>
                          {point.verificationStatus === 'verified' && (
                            <span className="px-2 py-0.5 rounded bg-green-500/10 text-green-600 dark:text-green-400 font-medium">
                              ✓ Đã xác thực
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right side: Learning status & Chevron */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          markItemLearned(point.id, 'grammar');
                        }}
                        title={isLearned ? 'Đã ghi nhận học cấu trúc này' : 'Đánh dấu đã học'}
                        className={`
                          px-2.5 py-1 rounded-md text-xs font-medium border transition-colors hidden sm:inline-flex items-center gap-1
                          ${
                            isLearned
                              ? 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/30'
                              : 'bg-secondary text-muted-foreground border-border hover:text-foreground'
                          }
                        `}
                      >
                        {isLearned ? '✓ Đã học' : '+ Đánh dấu đã học'}
                      </button>

                      <div
                        className={`p-1.5 rounded-lg text-muted-foreground hover:text-foreground transition-transform duration-200 ${
                          isExpanded ? 'rotate-180' : ''
                        }`}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Card Content (Expandable) */}
                  {isExpanded && (
                    <div
                      id={`content-${point.id}`}
                      className="border-t border-border px-4 sm:px-6 py-6 space-y-6 bg-card"
                    >
                      {/* 1. Formula & Meaning Summary */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-secondary/70 border border-border rounded-lg p-4">
                          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                            📐 Cấu trúc ngữ pháp
                          </div>
                          <div className="text-base font-semibold font-mono text-primary">
                            {point.formula}
                          </div>
                          <div className="mt-2 text-xs text-muted-foreground">
                            {point.conjugation}
                          </div>
                        </div>

                        <div className="bg-secondary/70 border border-border rounded-lg p-4">
                          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                            💡 Ý nghĩa cốt lõi
                          </div>
                          <div className="text-sm text-foreground font-medium leading-relaxed">
                            {point.meaning}
                          </div>
                        </div>
                      </div>

                      {/* 2. Detailed Usage */}
                      <div>
                        <h3 className="text-sm font-bold uppercase tracking-wider text-foreground mb-2 flex items-center gap-1.5">
                          <span>📖 Cách dùng chi tiết</span>
                        </h3>
                        <p className="text-sm text-foreground/90 leading-relaxed bg-background p-4 rounded-lg border border-border">
                          {point.usage}
                        </p>
                      </div>

                      {/* 3. Examples */}
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-sm font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                            <span>💬 Ví dụ minh họa ({point.examples.length})</span>
                          </h3>
                          <span className="text-xs text-muted-foreground">
                            Bấm biểu tượng loa để nghe phát âm
                          </span>
                        </div>

                        <div className="space-y-3">
                          {point.examples.map((example: GrammarExample, idx) => (
                            <div
                              key={idx}
                              className="p-3.5 sm:p-4 rounded-lg border border-border bg-background hover:border-primary/30 transition-colors"
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="space-y-1 flex-1">
                                  {/* Japanese text */}
                                  <div className="ja-text text-lg font-medium text-foreground">
                                    {example.japanese}
                                  </div>

                                  {/* Reading & Romaji */}
                                  <div className="text-xs text-muted-foreground font-mono">
                                    <span className="text-primary font-sans">{example.reading}</span>
                                    <span className="mx-2">•</span>
                                    <span>{example.romaji}</span>
                                  </div>

                                  {/* Vietnamese meaning */}
                                  <div className="text-sm text-foreground font-semibold pt-1">
                                    👉 {example.vietnamese}
                                  </div>

                                  {/* Explanation */}
                                  {example.explanation && (
                                    <div className="text-xs text-muted-foreground italic pt-0.5">
                                      * {example.explanation}
                                    </div>
                                  )}
                                </div>

                                {/* Audio button */}
                                <button
                                  type="button"
                                  onClick={() =>
                                    handlePlayAudio(
                                      `${point.id}_ex_${idx}`,
                                      example.japanese
                                    )
                                  }
                                  className={`
                                    p-2 rounded-lg border transition-colors flex-shrink-0
                                    ${
                                      playingAudioId === `${point.id}_ex_${idx}`
                                        ? 'bg-primary text-primary-foreground border-primary'
                                        : 'bg-card text-muted-foreground hover:text-primary hover:bg-secondary border-border'
                                    }
                                  `}
                                  title="Phát âm câu ví dụ"
                                  aria-label="Phát âm câu ví dụ"
                                >
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                                    />
                                  </svg>
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* 4. Common Mistakes & Comparisons */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Common Mistakes */}
                        {point.commonMistakes.length > 0 && (
                          <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-4">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-red-600 dark:text-red-400 mb-2 flex items-center gap-1.5">
                              <span>⚠️ Lỗi người học hay mắc</span>
                            </h4>
                            <ul className="text-xs text-foreground/90 space-y-1.5 list-disc list-inside">
                              {point.commonMistakes.map((mistake, mIdx) => (
                                <li key={mIdx} className="leading-relaxed">
                                  {mistake}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Comparisons */}
                        {point.comparisonWith.length > 0 && (
                          <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg p-4">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-2 flex items-center gap-1.5">
                              <span>🔍 Phân biệt & So sánh</span>
                            </h4>
                            <ul className="text-xs text-foreground/90 space-y-1.5 list-disc list-inside">
                              {point.comparisonWith.map((comp, cIdx) => (
                                <li key={cIdx} className="leading-relaxed">
                                  {comp}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>

                      {/* 5. Interactive Exercises */}
                      {point.exercises && point.exercises.length > 0 && (
                        <div className="pt-2 border-t border-border">
                          <h3 className="text-sm font-bold uppercase tracking-wider text-foreground mb-3 flex items-center gap-1.5">
                            <span>✏️ Bài tập tương tác củng cố ({point.exercises.length})</span>
                          </h3>

                          <div className="space-y-4">
                            {point.exercises.map((exercise, eIdx) => {
                              const state = exerciseStates[exercise.id] || {
                                isSubmitted: false,
                                isCorrect: false,
                              };

                              return (
                                <div
                                  key={exercise.id}
                                  className="p-4 rounded-lg border border-border bg-background space-y-3"
                                >
                                  <div className="flex items-start justify-between gap-2">
                                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-secondary text-muted-foreground">
                                      Câu {eIdx + 1}: {exercise.type === 'multiple_choice' ? 'Trắc nghiệm' : 'Điền vào chỗ trống'}
                                    </span>

                                    {state.isSubmitted && (
                                      <button
                                        type="button"
                                        onClick={() => handleResetExercise(exercise.id)}
                                        className="text-xs text-primary hover:underline"
                                      >
                                        Làm lại
                                      </button>
                                    )}
                                  </div>

                                  <div className="text-sm font-medium text-foreground">
                                    {exercise.question}
                                  </div>

                                  {/* Multiple Choice Options */}
                                  {exercise.type === 'multiple_choice' && exercise.options && (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                                      {exercise.options.map((option, optIdx) => {
                                        const isSelected = state.selectedOption === option;
                                        const isThisCorrect = option.trim() === exercise.correctAnswer.trim();

                                        let btnClass = 'border-border bg-card hover:bg-secondary text-foreground';
                                        if (state.isSubmitted) {
                                          if (isThisCorrect) {
                                            btnClass = 'border-green-500 bg-green-500/10 text-green-700 dark:text-green-300 font-semibold';
                                          } else if (isSelected) {
                                            btnClass = 'border-red-500 bg-red-500/10 text-red-700 dark:text-red-300';
                                          } else {
                                            btnClass = 'border-border bg-card text-muted-foreground opacity-60';
                                          }
                                        }

                                        return (
                                          <button
                                            key={optIdx}
                                            type="button"
                                            disabled={state.isSubmitted}
                                            onClick={() => handleSelectOption(exercise, option)}
                                            className={`
                                              w-full text-left p-3 rounded-lg border text-sm transition-all flex items-center justify-between
                                              ${btnClass}
                                            `}
                                          >
                                            <span className="ja-text">{option}</span>
                                            {state.isSubmitted && isThisCorrect && (
                                              <span className="text-green-600 font-bold text-xs">✓ Đúng</span>
                                            )}
                                            {state.isSubmitted && isSelected && !isThisCorrect && (
                                              <span className="text-red-600 font-bold text-xs">✗ Sai</span>
                                            )}
                                          </button>
                                        );
                                      })}
                                    </div>
                                  )}

                                  {/* Fill in blank Input */}
                                  {exercise.type === 'fill_blank' && (
                                    <div className="space-y-2 pt-1">
                                      <div className="flex items-center gap-2">
                                        <input
                                          type="text"
                                          disabled={state.isSubmitted}
                                          value={state.fillInput || ''}
                                          onChange={(e) =>
                                            setExerciseStates((prev) => ({
                                              ...prev,
                                              [exercise.id]: {
                                                ...prev[exercise.id],
                                                fillInput: e.target.value,
                                              },
                                            }))
                                          }
                                          onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !state.isSubmitted) {
                                              e.preventDefault();
                                              handleCheckFillBlank(exercise);
                                            }
                                          }}
                                          placeholder="Nhập câu trả lời..."
                                          className="flex-1 px-3 py-2 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                        />
                                        <button
                                          type="button"
                                          disabled={state.isSubmitted || !(state.fillInput || '').trim()}
                                          onClick={() => handleCheckFillBlank(exercise)}
                                          className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
                                        >
                                          Kiểm tra
                                        </button>
                                      </div>
                                    </div>
                                  )}

                                  {/* Feedback & Explanation */}
                                  {state.isSubmitted && (
                                    <div
                                      className={`p-3 rounded-lg border text-xs sm:text-sm space-y-1 ${
                                        state.isCorrect
                                          ? 'bg-green-500/10 border-green-500/30 text-green-800 dark:text-green-200'
                                          : 'bg-red-500/10 border-red-500/30 text-red-800 dark:text-red-200'
                                      }`}
                                    >
                                      <div className="font-semibold flex items-center gap-1.5">
                                        {state.isCorrect ? '🎉 Chính xác!' : '❌ Chưa chính xác!'}
                                        <span>Đáp án đúng: <span className="underline font-bold ja-text">{exercise.correctAnswer}</span></span>
                                      </div>
                                      <p className="opacity-90 text-xs">{exercise.explanation}</p>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Mobile mark as learned button */}
                      <div className="pt-2 sm:hidden flex justify-end">
                        <button
                          type="button"
                          onClick={() => markItemLearned(point.id, 'grammar')}
                          className={`
                            w-full py-2 px-3 rounded-lg text-xs font-semibold border transition-colors
                            ${
                              isLearned
                                ? 'bg-green-500/10 text-green-600 border-green-500/30'
                                : 'bg-primary text-primary-foreground border-transparent'
                            }
                          `}
                        >
                          {isLearned ? '✓ Đã ghi nhận học ngữ pháp này' : 'Đánh dấu đã học'}
                        </button>
                      </div>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
