'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useProgress } from '@/components/providers/ProgressProvider';

interface ExamQuestion {
  id: string;
  section: 'vocab' | 'grammar' | 'reading';
  sectionName: string;
  question: string;
  questionReading?: string;
  passage?: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  points: number;
}

const MOCK_EXAM_QUESTIONS: ExamQuestion[] = [
  // Phần 1: Từ vựng & Chữ Hán (Gengo Chishiki - Moji/Goi)
  {
    id: "jlpt_01",
    section: "vocab",
    sectionName: "Kiến thức ngôn ngữ (Chữ Hán & Từ vựng)",
    question: "Chữ Hán gạch chân có cách đọc là gì?\nきのう【友達】とあいました。",
    questionReading: "kinou 【ともだち】 to aimashita.",
    options: ["ともだち", "ゆうだち", "どもだち", "ともたち"],
    correctAnswer: "ともだち",
    explanation: "友達 (Hữu Đạt = Bạn bè) có cách đọc chuẩn là ともだち (tomodachi).",
    points: 10
  },
  {
    id: "jlpt_02",
    section: "vocab",
    sectionName: "Kiến thức ngôn ngữ (Chữ Hán & Từ vựng)",
    question: "Chọn từ thích hợp điền vào chỗ trống:\nつくえの ___ に猫がいます。",
    questionReading: "tsukue no ___ ni neko ga imasu.",
    options: ["うえ", "まえ", "なか", "した"],
    correctAnswer: "うえ",
    explanation: "机の上 (tsukue no ue = Trên mặt bàn) có nghĩa phù hợp.",
    points: 10
  },
  {
    id: "jlpt_03",
    section: "vocab",
    sectionName: "Kiến thức ngôn ngữ (Chữ Hán & Từ vựng)",
    question: "Chữ Hán nào tương ứng với từ gạch chân:\n【あめ】がふっています。",
    questionReading: "ame ga futte imasu.",
    options: ["雨", "雪", "雲", "風"],
    correctAnswer: "雨",
    explanation: "雨 (Vũ = Mưa). Chữ 雪 là tuyết, 雲 là mây, 風 là gió.",
    points: 10
  },

  // Phần 2: Ngữ pháp (Bunpou)
  {
    id: "jlpt_04",
    section: "grammar",
    sectionName: "Ngữ pháp (Cú pháp & Chia từ)",
    question: "Điền trợ từ đúng:\nわたしは毎朝7時 ___ 起きます。",
    questionReading: "watashi wa maiasa shichiji ___ okimasu.",
    options: ["に", "で", "を", "へ"],
    correctAnswer: "に",
    explanation: "Mốc thời gian xác định có số (7 giờ) dùng trợ từ に.",
    points: 10
  },
  {
    id: "jlpt_05",
    section: "grammar",
    sectionName: "Ngữ pháp (Cú pháp & Chia từ)",
    question: "Chọn dạng đúng của động từ:\n図書館で大きな声で ___ ください。",
    questionReading: "toshokan de ookina koe de ___ kudasai.",
    options: ["話さないで", "話して", "話す", "話しません"],
    correctAnswer: "話さないで",
    explanation: "Ở thư viện không được nói to, dùng cấu trúc cấm chỉ/nhắc nhở lịch sự: V-ないで + ください.",
    points: 10
  },
  {
    id: "jlpt_06",
    section: "grammar",
    sectionName: "Ngữ pháp (Cú pháp & Chia từ)",
    question: "Chọn câu đúng:\nA: 「この料理は辛いですか。」\nB: 「いいえ、全然 ___ 。」",
    questionReading: "Kono ryouri wa karai desu ka. / Iie, zenzen ___ .",
    options: ["辛くないです", "辛いです", "辛いでした", "辛くないでした"],
    correctAnswer: "辛くないです",
    explanation: "全然 (hoàn toàn không) luôn đi với phủ định. Tính từ 辛い (karai - cay) phủ định là 辛くないです.",
    points: 10
  },

  // Phần 3: Đọc hiểu (Dokkai)
  {
    id: "jlpt_07",
    section: "reading",
    sectionName: "Đọc hiểu đoạn văn ngắn (Dokkai)",
    passage: "【Thông báo tại cửa hàng sách】\n毎月第1日曜日は、本が全品10%オフになります。\n営業時間は午前10時から午後8時までです。\nただし、雑誌と文房具は割引になりません。",
    question: "Theo đoạn thông báo, mặt hàng nào ĐƯỢC GIẢM GIÁ 10% vào Chủ nhật đầu tiên của tháng?",
    options: ["Sách thông thường (ngoại trừ tạp chí)", "Tạp chí (雑誌)", "Đồ dùng học tập, văn phòng phẩm (文房具)", "Tất cả mọi mặt hàng trong tiệm"],
    correctAnswer: "Sách thông thường (ngoại trừ tạp chí)",
    explanation: "Đoạn văn ghi: 本が全品10%オフ (Sách giảm 10%), và câu cuối ghi: ただし、雑誌と文房具は割引になりません (Tuy nhiên tạp chí và văn phòng phẩm không được giảm giá).",
    points: 20
  },
  {
    id: "jlpt_08",
    section: "reading",
    sectionName: "Đọc hiểu đoạn văn ngắn (Dokkai)",
    passage: "わたしはナムです。先週の日曜日、友達の田中さんと京都へ行きました。\n新幹線で行きました。京都で古いお寺を見ました。\nとても綺麗でした。昼ご飯はラーメンを食べました。とても楽しかったです。",
    question: "Anh Nam và anh Tanaka đã đến Kyoto bằng phương tiện gì?",
    options: ["Tàu siêu tốc Shinkansen (新幹線)", "Xe buýt (バス)", "Máy bay (飛行機)", "Đi bộ (歩いて)"],
    correctAnswer: "Tàu siêu tốc Shinkansen (新幹線)",
    explanation: "Trong bài đọc có câu rõ ràng: 新幹線で行きました (Chúng tôi đã đi bằng tàu Shinkansen).",
    points: 20
  }
];

export default function LuyenThiPage() {
  const { progress, updateProgress } = useProgress();
  const [examStarted, setExamStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 minutes test
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [examFinished, setExamFinished] = useState(false);

  // Timer countdown
  useEffect(() => {
    if (!examStarted || examFinished) return;

    if (timeLeft <= 0) {
      setExamFinished(true);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [examStarted, examFinished, timeLeft]);

  // Handle select answer
  const handleSelect = (qId: string, option: string) => {
    if (examFinished) return;
    setUserAnswers((prev) => ({ ...prev, [qId]: option }));
  };

  // Submit test
  const handleSubmitExam = () => {
    setExamFinished(true);

    // Calculate score
    let totalScore = 0;
    let correctNum = 0;
    MOCK_EXAM_QUESTIONS.forEach((q) => {
      if (userAnswers[q.id] === q.correctAnswer) {
        totalScore += q.points;
        correctNum++;
      }
    });

    // Save to test history
    const resultEntry = {
      exerciseId: `jlpt_mock_n5_${Date.now()}`,
      score: totalScore,
      totalQuestions: 100, // Total score scale out of 100
      completedAt: new Date().toISOString(),
    };

    updateProgress({
      exerciseResults: [...progress.exerciseResults, resultEntry],
    });
  };

  const startExam = () => {
    setExamStarted(true);
    setExamFinished(false);
    setUserAnswers({});
    setTimeLeft(15 * 60);
  };

  // Score calculations
  const totalPossibleScore = MOCK_EXAM_QUESTIONS.reduce((sum, q) => sum + q.points, 0);
  const userScore = MOCK_EXAM_QUESTIONS.reduce(
    (sum, q) => (userAnswers[q.id] === q.correctAnswer ? sum + q.points : sum),
    0
  );
  const isPassed = userScore >= totalPossibleScore * 0.6; // 60% passing benchmark

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <Link href="/" className="hover:text-primary transition-colors">Trang chủ</Link>
        <span>/</span>
        <span className="text-foreground font-medium">Luyện thi JLPT N5</span>
      </nav>

      {/* Header */}
      <div className="mb-8">
        <div className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-semibold mb-2">
          Mô phỏng kỳ thi • JLPT N5
        </div>
        <h1 className="text-3xl font-bold text-foreground">
          Đề Thi Thử Mô Phỏng JLPT N5
        </h1>
        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
          Đề thi trắc nghiệm bấm giờ bao gồm đầy đủ 3 phần thi: Chữ Hán - Từ vựng, Ngữ pháp, và Đọc hiểu theo định hướng cấu trúc JLPT chính thức.
        </p>
      </div>

      {/* Important Disclaimer Alert */}
      <div className="p-4 rounded-2xl border border-warning/30 bg-warning/5 text-xs text-muted-foreground mb-8 space-y-1.5">
        <div className="flex items-center gap-2 font-bold text-foreground">
          <span>⚠️</span> Nguyên tắc trung thực về kết quả thi JLPT:
        </div>
        <p>
          • Đây là <strong>đề thi mô phỏng tự biên soạn</strong> theo định hướng JLPT, không phải đề thi chính thức có bản quyền của Hiệp hội Hỗ trợ Giáo dục Quốc tế Nhật Bản (JEES).
        </p>
        <p>
          • Điểm số và thông báo đạt trên website <strong>hoàn toàn không tương đương hay cam kết việc bạn sẽ đỗ kỳ thi JLPT thật</strong>.
        </p>
      </div>

      {!examStarted ? (
        /* Intro Card */
        <div className="bg-card border border-border rounded-3xl p-6 sm:p-10 text-center space-y-6 shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary text-3xl font-bold flex items-center justify-center mx-auto">
            ⏱️
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-foreground">Quy Chế Bài Thi Mô Phỏng N5</h2>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Bài thi gồm <strong>{MOCK_EXAM_QUESTIONS.length} câu hỏi</strong> tổng hợp các kỹ năng, thời gian làm bài tối đa <strong>15 phút</strong>.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-left max-w-xl mx-auto">
            <div className="p-3 bg-secondary/50 rounded-xl border border-border">
              <span className="font-bold text-foreground block">Từ vựng & Kanji</span>
              <p className="text-muted-foreground mt-0.5">3 câu (30 điểm)</p>
            </div>
            <div className="p-3 bg-secondary/50 rounded-xl border border-border">
              <span className="font-bold text-foreground block">Ngữ pháp</span>
              <p className="text-muted-foreground mt-0.5">3 câu (30 điểm)</p>
            </div>
            <div className="p-3 bg-secondary/50 rounded-xl border border-border">
              <span className="font-bold text-foreground block">Đọc hiểu ngắn</span>
              <p className="text-muted-foreground mt-0.5">2 câu (40 điểm)</p>
            </div>
          </div>

          <button
            onClick={startExam}
            className="px-8 py-3 bg-primary text-primary-foreground font-bold rounded-xl text-base hover:opacity-90 transition-opacity shadow-lg"
          >
            Bắt đầu làm bài thi ngay
          </button>
        </div>
      ) : (
        /* Exam Arena */
        <div className="space-y-8">
          {/* Sticky Timer Bar */}
          <div className="sticky top-16 z-30 bg-card/95 backdrop-blur-sm border border-border rounded-2xl p-4 shadow-md flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Thời gian còn lại:</span>
              <span className={`font-mono text-lg font-bold ${timeLeft < 180 ? 'text-error animate-pulse' : 'text-primary'}`}>
                {formatTime(timeLeft)}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground hidden sm:inline">
                Đã trả lời: {Object.keys(userAnswers).length}/{MOCK_EXAM_QUESTIONS.length}
              </span>
              {!examFinished ? (
                <button
                  onClick={handleSubmitExam}
                  className="px-4 py-2 bg-primary text-primary-foreground text-xs font-bold rounded-xl hover:opacity-90 shadow"
                >
                  Nộp bài thi
                </button>
              ) : (
                <button
                  onClick={startExam}
                  className="px-4 py-2 bg-secondary text-foreground text-xs font-bold rounded-xl hover:bg-muted"
                >
                  Thi lại
                </button>
              )}
            </div>
          </div>

          {/* Exam Result Report if Finished */}
          {examFinished && (
            <div className="bg-card border-2 border-primary/30 rounded-3xl p-6 sm:p-8 space-y-6 shadow-md text-center">
              <span className="text-5xl">{isPassed ? '🎉' : '📖'}</span>
              <div>
                <h2 className="text-2xl font-bold text-foreground">
                  {isPassed ? 'Đạt Tiêu Chuẩn Mô Phỏng N5!' : 'Chưa Đạt Điểm Chuẩn (Cần Ôn Luyện Thêm)'}
                </h2>
                <p className="text-xs text-muted-foreground mt-1">
                  Điểm số của bạn: <strong className="text-xl text-primary">{userScore}</strong> / {totalPossibleScore} điểm
                </p>
              </div>

              <div className="p-4 bg-secondary/50 rounded-2xl border border-border text-xs text-muted-foreground max-w-md mx-auto">
                {isPassed
                  ? 'Chúc mừng bạn! Bạn đã nắm chắc phần lớn kiến thức N5 cơ bản. Hãy kéo xuống dưới để xem chi tiết giải thích đáp án.'
                  : 'Đừng nản lòng! Hãy ôn tập lại các điểm trợ từ và thể chia động từ chưa đúng ở phần giải thích bên dưới nhé.'}
              </div>
            </div>
          )}

          {/* Question List */}
          <div className="space-y-6">
            {MOCK_EXAM_QUESTIONS.map((q, idx) => {
              const selectedOpt = userAnswers[q.id];
              const isCorrect = selectedOpt === q.correctAnswer;

              return (
                <div
                  key={q.id}
                  className="bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-sm space-y-4"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-primary px-2.5 py-0.5 rounded-full bg-primary/10">
                      Câu {idx + 1} • {q.sectionName}
                    </span>
                    <span className="text-muted-foreground">{q.points} điểm</span>
                  </div>

                  {/* Passage if Dokkai */}
                  {q.passage && (
                    <div className="p-4 bg-secondary/40 rounded-2xl border border-border text-xs sm:text-sm leading-relaxed text-foreground whitespace-pre-line font-medium">
                      {q.passage}
                    </div>
                  )}

                  {/* Question prompt */}
                  <h3 className="ja-text text-base sm:text-lg font-bold text-foreground whitespace-pre-line">
                    {q.question}
                  </h3>

                  {/* Options */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    {q.options.map((opt, optIdx) => {
                      const isOptionSelected = selectedOpt === opt;

                      let style = 'border-border bg-background hover:border-primary/50';
                      if (examFinished) {
                        if (opt === q.correctAnswer) {
                          style = 'border-success bg-success/10 text-success font-bold';
                        } else if (isOptionSelected && !isCorrect) {
                          style = 'border-error bg-error/10 text-error';
                        } else {
                          style = 'border-border bg-background opacity-50';
                        }
                      } else if (isOptionSelected) {
                        style = 'border-primary bg-primary/10 text-primary font-bold ring-2 ring-primary/20';
                      }

                      return (
                        <button
                          key={opt}
                          disabled={examFinished}
                          onClick={() => handleSelect(q.id, opt)}
                          className={`p-3.5 rounded-2xl border text-left text-xs sm:text-sm transition-all flex items-center justify-between ${style}`}
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="w-5 h-5 rounded-full border border-border flex items-center justify-center text-[10px] font-bold text-muted-foreground">
                              {optIdx + 1}
                            </span>
                            <span className="ja-text">{opt}</span>
                          </div>

                          {examFinished && opt === q.correctAnswer && <span className="text-success font-bold">✓</span>}
                          {examFinished && isOptionSelected && !isCorrect && <span className="text-error font-bold">✕</span>}
                        </button>
                      );
                    })}
                  </div>

                  {/* Review Explanation after finished */}
                  {examFinished && (
                    <div className="p-3.5 rounded-xl bg-secondary/60 border border-border text-xs text-muted-foreground space-y-1">
                      <p className="font-bold text-foreground">
                        Đáp án đúng: <span className="text-success">{q.correctAnswer}</span>
                      </p>
                      <p className="leading-relaxed">{q.explanation}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
