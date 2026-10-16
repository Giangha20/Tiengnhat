'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import exerciseDataRaw from '@/data/exercises/n5-exercises.json';
import { useProgress } from '@/components/providers/ProgressProvider';

interface Question {
  id: string;
  category: string;
  question: string;
  questionReading?: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  difficulty: string;
  image?: {
    src: string;
    alt: string;
    caption: string;
  };
}

interface UserAnswerState {
  selectedOption: string | null;
  isCorrect: boolean;
  isSubmitted: boolean;
}

export default function BaiTapPage() {
  const { progress, updateProgress } = useProgress();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [currentIdx, setCurrentIdx] = useState(0);

  // Flatten questions based on category filter
  const questions = useMemo(() => {
    let list: Question[] = [];
    exerciseDataRaw.categories.forEach((cat) => {
      if (selectedCategory === 'all' || cat.id === selectedCategory) {
        list = [...list, ...cat.questions];
      }
    });
    return list;
  }, [selectedCategory]);

  // Track answers for all questions
  const [answers, setAnswers] = useState<Record<string, UserAnswerState>>({});
  const [isTestFinished, setIsTestFinished] = useState(false);

  const currentQ = questions[currentIdx];
  const currentAnswer = currentQ ? answers[currentQ.id] : null;

  // Handle select option
  const handleSelectOption = (option: string) => {
    if (!currentQ || currentAnswer?.isSubmitted) return; // Prevent changing after submission

    setAnswers((prev) => ({
      ...prev,
      [currentQ.id]: {
        selectedOption: option,
        isCorrect: option === currentQ.correctAnswer,
        isSubmitted: false,
      },
    }));
  };

  // Submit answer for current question
  const handleSubmitCurrent = () => {
    if (!currentQ || !currentAnswer?.selectedOption || currentAnswer.isSubmitted) return;

    const isCorrect = currentAnswer.selectedOption === currentQ.correctAnswer;

    setAnswers((prev) => ({
      ...prev,
      [currentQ.id]: {
        ...prev[currentQ.id],
        isCorrect,
        isSubmitted: true,
      },
    }));

    // Update real progress stats
    const todayReviewed = progress.todayItemsReviewed + 1;
    const todayCorrect = isCorrect
      ? Math.round(((progress.todayCorrectRate / 100) * progress.todayItemsReviewed + 1) / todayReviewed * 100)
      : Math.round(((progress.todayCorrectRate / 100) * progress.todayItemsReviewed) / todayReviewed * 100);

    updateProgress({
      todayItemsReviewed: todayReviewed,
      todayCorrectRate: todayCorrect,
      lastStudyDate: new Date().toISOString(),
    });
  };

  // Finish full test
  const handleFinishTest = () => {
    setIsTestFinished(true);

    // Save test result
    const correctCount = Object.values(answers).filter((a) => a.isCorrect && a.isSubmitted).length;
    const newResult = {
      exerciseId: `practice_${selectedCategory}_${Date.now()}`,
      score: correctCount,
      totalQuestions: questions.length,
      completedAt: new Date().toISOString(),
    };

    updateProgress({
      exerciseResults: [...progress.exerciseResults, newResult],
    });
  };

  // Restart test
  const handleRestart = () => {
    setAnswers({});
    setCurrentIdx(0);
    setIsTestFinished(false);
  };

  // Score statistics
  const submittedCount = Object.values(answers).filter((a) => a.isSubmitted).length;
  const correctCount = Object.values(answers).filter((a) => a.isCorrect && a.isSubmitted).length;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <Link href="/" className="hover:text-primary transition-colors">Trang chủ</Link>
        <span>/</span>
        <span className="text-foreground font-medium">Bài tập thực hành N5</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-semibold mb-2">
            Thực hành • JLPT N5
          </div>
          <h1 className="text-3xl font-bold text-foreground">
            Ngân Hàng Bài Tập Tự Động Chấm Điểm
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Luyện tập trợ từ, chia động từ, chữ Hán và sắp xếp câu với lời giải thích chi tiết.
          </p>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => {
              setSelectedCategory('all');
              handleRestart();
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
              selectedCategory === 'all'
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-foreground hover:bg-muted'
            }`}
          >
            Tất cả
          </button>
          {exerciseDataRaw.categories.map((c) => (
            <button
              key={c.id}
              onClick={() => {
                setSelectedCategory(c.id);
                handleRestart();
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                selectedCategory === c.id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-foreground hover:bg-muted'
              }`}
            >
              {c.name.split(' (')[0]}
            </button>
          ))}
        </div>
      </div>

      {!isTestFinished && currentQ ? (
        <div className="space-y-6">
          {/* Progress Header */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              Câu hỏi <strong>{currentIdx + 1}</strong> / {questions.length}
            </span>
            <span>
              Đã làm: {submittedCount}/{questions.length} • Đúng: <strong className="text-success">{correctCount}</strong>
            </span>
          </div>

          <div className="progress-bar">
            <div
              className="progress-bar-fill"
              style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
            />
          </div>

          {/* Question Card */}
          <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-secondary text-muted-foreground">
                Độ khó: {currentQ.difficulty === 'easy' ? 'Cơ bản' : 'Trung bình'}
              </span>
              <span className="text-xs text-muted-foreground">
                Mã: {currentQ.id}
              </span>
            </div>

            {/* Question Text */}
            <div className="space-y-2">
              <h2 className="ja-text text-xl sm:text-2xl font-bold text-foreground whitespace-pre-line leading-relaxed">
                {currentQ.question}
              </h2>
              {currentQ.questionReading && (
                <p className="ja-text text-sm text-muted-foreground">
                  {currentQ.questionReading}
                </p>
              )}
            </div>

            {/* Real Context Photography */}
            {currentQ.image && (
              <div className="rounded-2xl overflow-hidden border border-border/80 bg-secondary/20 shadow-sm transition-all hover:border-primary/40">
                <div className="relative w-full h-48 sm:h-64 bg-muted/30 overflow-hidden group">
                  <img
                    src={currentQ.image.src}
                    alt={currentQ.image.alt}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {/* Real Photo Authenticity Badge */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md text-white text-[11px] font-medium shadow-md">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Ảnh thật • 実写</span>
                  </div>
                  <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-sm text-white/95 text-[10px] font-medium">
                    Ngữ cảnh thực tế
                  </div>
                </div>
                <div className="px-4 py-2.5 bg-card/90 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
                  <span className="font-medium text-foreground/90">{currentQ.image.caption}</span>
                  <span className="text-[11px] hidden sm:inline text-muted-foreground/80">Hình ảnh đúng với nội dung câu hỏi</span>
                </div>
              </div>
            )}

            {/* Options */}
            <div className="space-y-3 pt-2">
              {currentQ.options.map((opt, optIndex) => {
                const isSelected = currentAnswer?.selectedOption === opt;
                const isSubmitted = currentAnswer?.isSubmitted;
                const isCorrect = opt === currentQ.correctAnswer;

                let style = 'border-border bg-background hover:border-primary/50';
                if (isSubmitted) {
                  if (isCorrect) {
                    style = 'border-success bg-success/10 text-success font-semibold';
                  } else if (isSelected && !isCorrect) {
                    style = 'border-error bg-error/10 text-error';
                  } else {
                    style = 'border-border bg-background opacity-50';
                  }
                } else if (isSelected) {
                  style = 'border-primary bg-primary/5 ring-2 ring-primary/20';
                }

                return (
                  <button
                    key={opt}
                    disabled={isSubmitted}
                    onClick={() => handleSelectOption(opt)}
                    className={`w-full p-4 rounded-2xl border text-left text-sm transition-all flex items-center justify-between ${style}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full border border-border flex items-center justify-center text-xs font-semibold text-muted-foreground">
                        {String.fromCharCode(65 + optIndex)}
                      </span>
                      <span className="ja-text font-medium text-base">{opt}</span>
                    </div>

                    {isSubmitted && isCorrect && <span className="text-success font-bold text-lg">✓</span>}
                    {isSubmitted && isSelected && !isCorrect && <span className="text-error font-bold text-lg">✕</span>}
                  </button>
                );
              })}
            </div>

            {/* Explanation box after submit */}
            {currentAnswer?.isSubmitted && (
              <div
                className={`p-4 rounded-2xl border text-xs sm:text-sm leading-relaxed space-y-2 animate-in fade-in duration-200 ${
                  currentAnswer.isCorrect
                    ? 'border-success/30 bg-success/5'
                    : 'border-error/30 bg-error/5'
                }`}
              >
                <div className="flex items-center gap-2 font-bold">
                  {currentAnswer.isCorrect ? (
                    <span className="text-success">🎉 Chính xác!</span>
                  ) : (
                    <span className="text-error">
                      ❌ Chưa chính xác! Đáp án đúng: <strong>{currentQ.correctAnswer}</strong>
                    </span>
                  )}
                </div>
                <p className="text-muted-foreground">{currentQ.explanation}</p>
              </div>
            )}

            {/* Action buttons */}
            <div className="pt-4 border-t border-border flex items-center justify-between gap-3">
              <button
                disabled={currentIdx === 0}
                onClick={() => setCurrentIdx((prev) => prev - 1)}
                className="px-4 py-2 bg-secondary text-foreground rounded-xl text-xs font-semibold hover:bg-muted disabled:opacity-40"
              >
                ← Câu trước
              </button>

              {!currentAnswer?.isSubmitted ? (
                <button
                  disabled={!currentAnswer?.selectedOption}
                  onClick={handleSubmitCurrent}
                  className="px-6 py-2.5 bg-primary text-primary-foreground rounded-xl text-xs font-semibold hover:opacity-90 disabled:opacity-40 shadow"
                >
                  Kiểm tra đáp án
                </button>
              ) : currentIdx < questions.length - 1 ? (
                <button
                  onClick={() => setCurrentIdx((prev) => prev + 1)}
                  className="px-6 py-2.5 bg-primary text-primary-foreground rounded-xl text-xs font-semibold hover:opacity-90 shadow"
                >
                  Câu tiếp theo →
                </button>
              ) : (
                <button
                  onClick={handleFinishTest}
                  className="px-6 py-2.5 bg-success text-white rounded-xl text-xs font-semibold hover:opacity-90 shadow"
                >
                  Xem kết quả tổng kết 🏆
                </button>
              )}
            </div>
          </div>

          {/* Quick Jump Bar */}
          <div className="flex flex-wrap gap-2 justify-center pt-2">
            {questions.map((q, idx) => {
              const state = answers[q.id];
              let btnColor = 'bg-secondary text-muted-foreground border-border';
              if (state?.isSubmitted) {
                btnColor = state.isCorrect ? 'bg-success text-white' : 'bg-error text-white';
              } else if (state?.selectedOption) {
                btnColor = 'bg-primary/20 text-primary border-primary';
              }

              if (idx === currentIdx) {
                btnColor += ' ring-2 ring-primary';
              }

              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentIdx(idx)}
                  className={`w-8 h-8 rounded-lg text-xs font-semibold border transition-all flex items-center justify-center ${btnColor}`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        /* Result Summary Modal */
        <div className="bg-card border border-border rounded-3xl p-8 text-center space-y-6 shadow-sm">
          <p className="text-6xl">🏆</p>
          <h2 className="text-2xl font-bold text-foreground">Kết Quả Luyện Tập</h2>

          <div className="max-w-xs mx-auto p-4 bg-secondary/50 rounded-2xl border border-border space-y-2">
            <p className="text-4xl font-extrabold text-primary">
              {correctCount} / {questions.length}
            </p>
            <p className="text-xs text-muted-foreground">
              Tỷ lệ chính xác: <strong>{questions.length > 0 ? Math.round((correctCount / questions.length) * 100) : 0}%</strong>
            </p>
          </div>

          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            {correctCount === questions.length
              ? 'Xuất sắc! Bạn đã trả lời đúng 100% các câu hỏi trong phần này.'
              : 'Hãy xem lại những câu trả lời chưa đúng dưới đây để củng cố kiến thức.'}
          </p>

          <div className="flex justify-center gap-3 pt-2">
            <button
              onClick={handleRestart}
              className="px-6 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:opacity-90 shadow"
            >
              Làm lại bài này
            </button>
            <Link
              href="/thong-ke"
              className="px-6 py-2.5 bg-secondary text-foreground rounded-xl text-sm font-semibold hover:bg-muted"
            >
              Xem thống kê cá nhân
            </Link>
          </div>

          {/* Detailed Question Review List with Real Photos */}
          <div className="text-left space-y-4 pt-6 border-t border-border">
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <span>📸</span> Chi tiết câu hỏi & Minh họa thực tế ({questions.length} câu)
            </h3>
            <div className="space-y-3">
              {questions.map((q, idx) => {
                const ans = answers[q.id];
                const isCorrect = ans?.isCorrect;
                return (
                  <div
                    key={q.id}
                    className={`p-4 rounded-2xl border transition-all ${
                      isCorrect ? 'border-success/30 bg-success/5' : 'border-error/30 bg-error/5'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row gap-4 items-start">
                      {q.image && (
                        <div className="relative w-full sm:w-32 sm:h-24 h-40 rounded-xl overflow-hidden shrink-0 border border-border/70 bg-muted/40">
                          <img
                            src={q.image.src}
                            alt={q.image.alt}
                            className="w-full h-full object-cover"
                          />
                          <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/70 text-white text-[9px] font-medium">
                            実写
                          </span>
                        </div>
                      )}
                      <div className="flex-1 space-y-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-semibold text-muted-foreground">
                            Câu {idx + 1} • {q.id}
                          </span>
                          <span
                            className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                              isCorrect
                                ? 'bg-success/15 text-success'
                                : 'bg-error/15 text-error'
                            }`}
                          >
                            {isCorrect ? '✓ Trả lời đúng' : '✕ Chưa chính xác'}
                          </span>
                        </div>
                        <p className="ja-text text-sm font-bold text-foreground whitespace-pre-line leading-snug">
                          {q.question}
                        </p>
                        {q.image && (
                          <p className="text-xs text-primary/90 font-medium">
                            {q.image.caption}
                          </p>
                        )}
                        <div className="text-xs flex flex-wrap gap-x-4 gap-y-1 pt-1">
                          <span className="text-muted-foreground">
                            Bạn chọn: <strong className={isCorrect ? 'text-success' : 'text-error'}>{ans?.selectedOption || '(Chưa làm)'}</strong>
                          </span>
                          {!isCorrect && (
                            <span className="text-foreground">
                              Đáp án chuẩn: <strong className="text-success">{q.correctAnswer}</strong>
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground pt-1.5 border-t border-border/40">
                          💡 <strong>Giải thích:</strong> {q.explanation}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
