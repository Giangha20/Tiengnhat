'use client';

import { useState } from 'react';
import Link from 'next/link';

interface ReadingArticle {
  id: string;
  title: string;
  type: string;
  level: string;
  contentJa: string;
  contentReading: string;
  contentVi: string;
  vocabList: { word: string; reading: string; meaning: string }[];
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

const READING_ARTICLES: ReadingArticle[] = [
  {
    id: "read_01",
    title: "Email xin nghỉ phép vì bị sốt",
    type: "Email công việc / trường học",
    level: "N5",
    contentJa: "山田先生、おはようございます。留学生のナムです。\n今朝から熱が38度あって、頭も痛いです。\n申し訳ありませんが、今日の授業を休ませてください。\n病院へ行ってから、また連絡します。\nよろしくお願いいたします。",
    contentReading: "やまだせんせい、おはようございます。りゅうがくせいの ナムです。\nけさから ねつが さんじゅうはちど あって、あたまも いたいです。\nもうしわけ ありませんが、きょうの じゅぎょうを やすませて ください。\nびょういんへ いってから、また れんらくします。\nよろしく おねがいいたします。",
    contentVi: "Kính gửi thầy Yamada, em chào thầy ạ. Em là du học sinh Nam.\nTừ sáng nay em bị sốt 38 độ và đầu cũng rất đau ạ.\nEm rất xin lỗi nhưng xin thầy cho phép em được nghỉ buổi học hôm nay ạ.\nSau khi đi bệnh viện về, em sẽ liên lạc lại với thầy ạ.\nEm xin chân thành cảm ơn thầy.",
    vocabList: [
      { word: "熱", reading: "ねつ", meaning: "Cơn sốt" },
      { word: "頭が痛い", reading: "あたまがいたい", meaning: "Đau đầu" },
      { word: "申し訳ありません", reading: "もうしわけありません", meaning: "Rất xin lỗi (kính ngữ)" },
      { word: "休む", reading: "やすむ", meaning: "Nghỉ ngơi / Nghỉ học" },
      { word: "連絡する", reading: "れんらくする", meaning: "Liên lạc, thông báo" }
    ],
    question: "Vì sao bạn Nam xin phép nghỉ học hôm nay?",
    options: ["Vì bị sốt 38 độ và đau đầu", "Vì phải đi làm thêm", "Vì trời mưa to không đi được", "Vì bạn Nam về nước thăm gia đình"],
    correctAnswer: "Vì bị sốt 38 độ và đau đầu",
    explanation: "Trong email Nam viết rõ: 今朝から熱が38度あって、頭も痛いです (Từ sáng nay bị sốt 38 độ và đầu cũng đau)."
  },
  {
    id: "read_02",
    title: "Nhật ký một ngày chủ nhật",
    type: "Đoạn văn sinh hoạt đời sống",
    level: "N5",
    contentJa: "昨日は日曜日でした。天気がとてもよかったです。\n午前中は部屋の掃除をして、洗濯をしました。\n午後から友達と駅の近くのカフェへ行きました。\n美味しいケーキを食べて、たくさん話しました。\nとても楽しい一日でした。",
    contentReading: "きのうは にちようびでした。てんきが とても よかったです。\nごぜんちゅうは へやの そうじをして、せんたくを しました。\nごごから ともだちと えきの ちかくの カフェへ いきました。\nおいしい ケーキを たべて、たくさん はなしました。\nとても たのしい いちにちでした。",
    contentVi: "Hôm qua là ngày Chủ nhật. Thời tiết đã rất đẹp.\nBuổi sáng tôi dọn dẹp phòng và giặt quần áo.\nBuổi chiều tôi cùng bạn bè đến một quán cà phê gần nhà ga.\nChúng tôi đã ăn bánh ngọt ngon và trò chuyện rất nhiều.\nĐó là một ngày thực sự rất vui vẻ.",
    vocabList: [
      { word: "天気", reading: "てんき", meaning: "Thời tiết" },
      { word: "掃除", reading: "そうじ", meaning: "Dọn dẹp, vệ sinh" },
      { word: "洗濯", reading: "せんたく", meaning: "Giặt giũ quần áo" },
      { word: "近く", reading: "ちかく", meaning: "Gần đó, lân cận" },
      { word: "楽しい", reading: "たのしい", meaning: "Vui vẻ" }
    ],
    question: "Tác giả đã làm việc gì vào buổi chiều Chủ nhật?",
    options: ["Đi uống cà phê và ăn bánh ngọt với bạn", "Dọn dẹp phòng và giặt đồ", "Ở nhà ngủ cả ngày", "Đi học tiếng Nhật ở trường"],
    correctAnswer: "Đi uống cà phê và ăn bánh ngọt với bạn",
    explanation: "Đoạn văn ghi: 午後から友達と駅の近くのカフェへ行きました。美味しいケーキを食べて... (Buổi chiều đi cafe gần ga và ăn bánh ngọt ngon cùng bạn)."
  }
];

export default function LuyenDocPage() {
  const [activeArticleId, setActiveArticleId] = useState(READING_ARTICLES[0].id);
  const [showFurigana, setShowFurigana] = useState(false);
  const [showTranslation, setShowTranslation] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);

  const article = READING_ARTICLES.find((a) => a.id === activeArticleId) || READING_ARTICLES[0];

  const switchArticle = (id: string) => {
    setActiveArticleId(id);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setShowTranslation(false);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <Link href="/" className="hover:text-primary transition-colors">Trang chủ</Link>
        <span>/</span>
        <span className="text-foreground font-medium">Luyện đọc (Dokkai)</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-semibold mb-2">
            Kỹ năng đọc • JLPT N5
          </div>
          <h1 className="text-3xl font-bold text-foreground">
            Luyện Đọc Hiểu Tiếng Nhật
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Đọc hiểu các văn bản ứng dụng thực tế: Email xin phép, thông báo, nhật ký hàng ngày.
          </p>
        </div>

        {/* Global Controls */}
        <div className="flex gap-2 text-xs">
          <button
            onClick={() => setShowFurigana(!showFurigana)}
            className={`px-3 py-1.5 rounded-lg border font-medium ${
              showFurigana ? 'bg-primary/10 border-primary text-primary' : 'bg-card border-border text-muted-foreground'
            }`}
          >
            {showFurigana ? 'Ẩn Furigana' : 'Hiện Furigana'}
          </button>
          <button
            onClick={() => setShowTranslation(!showTranslation)}
            className={`px-3 py-1.5 rounded-lg border font-medium ${
              showTranslation ? 'bg-primary/10 border-primary text-primary' : 'bg-card border-border text-muted-foreground'
            }`}
          >
            {showTranslation ? 'Ẩn bản dịch' : 'Hiện bản dịch'}
          </button>
        </div>
      </div>

      {/* Article Selector */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
        {READING_ARTICLES.map((a) => (
          <button
            key={a.id}
            onClick={() => switchArticle(a.id)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
              activeArticleId === a.id
                ? 'bg-primary text-primary-foreground shadow'
                : 'bg-card border border-border text-foreground hover:bg-secondary'
            }`}
          >
            {a.title}
          </button>
        ))}
      </div>

      {/* Main Reading Card */}
      <div className="bg-card border border-border rounded-3xl p-6 sm:p-10 space-y-8 shadow-sm">
        <div>
          <span className="text-xs font-semibold text-primary px-2.5 py-0.5 rounded-full bg-primary/10">
            {article.type} • {article.level}
          </span>
          <h2 className="text-2xl font-bold text-foreground mt-2">{article.title}</h2>
        </div>

        {/* Text Container */}
        <div className="p-6 bg-background rounded-2xl border border-border space-y-4">
          <p className="ja-text text-base sm:text-lg font-medium text-foreground whitespace-pre-line leading-relaxed">
            {showFurigana ? article.contentReading : article.contentJa}
          </p>

          {showTranslation && (
            <div className="pt-4 border-t border-border text-xs sm:text-sm text-muted-foreground whitespace-pre-line leading-relaxed animate-in fade-in">
              <strong className="text-foreground block mb-1">Bản dịch tiếng Việt:</strong>
              {article.contentVi}
            </div>
          )}
        </div>

        {/* Vocabulary in Passage */}
        <div>
          <h3 className="font-bold text-sm text-foreground mb-3 flex items-center gap-2">
            <span>📖</span> Từ vựng quan trọng trong bài đọc:
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {article.vocabList.map((v) => (
              <div key={v.word} className="p-3 bg-secondary/50 rounded-xl border border-border flex items-center justify-between">
                <div>
                  <span className="ja-text font-bold text-sm text-foreground mr-1.5">{v.word}</span>
                  <span className="ja-text text-muted-foreground">({v.reading})</span>
                </div>
                <span className="text-muted-foreground font-medium">{v.meaning}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Comprehension Question */}
        <div className="pt-4 border-t border-border space-y-4">
          <h3 className="font-bold text-base text-foreground flex items-center gap-2">
            <span>❓</span> Câu hỏi đọc hiểu: {article.question}
          </h3>

          <div className="space-y-2.5">
            {article.options.map((opt) => {
              const isSelected = selectedAnswer === opt;
              const isCorrect = opt === article.correctAnswer;

              let style = 'border-border bg-background hover:border-primary/50';
              if (isAnswered) {
                if (isCorrect) {
                  style = 'border-success bg-success/10 text-success font-bold';
                } else if (isSelected && !isCorrect) {
                  style = 'border-error bg-error/10 text-error';
                } else {
                  style = 'border-border bg-background opacity-50';
                }
              }

              return (
                <button
                  key={opt}
                  disabled={isAnswered}
                  onClick={() => {
                    setSelectedAnswer(opt);
                    setIsAnswered(true);
                  }}
                  className={`w-full p-3.5 rounded-2xl border text-left text-sm transition-all flex items-center justify-between ${style}`}
                >
                  <span>{opt}</span>
                  {isAnswered && isCorrect && <span className="text-success font-bold">✓</span>}
                  {isAnswered && isSelected && !isCorrect && <span className="text-error font-bold">✕</span>}
                </button>
              );
            })}
          </div>

          {isAnswered && (
            <div className="p-4 rounded-2xl bg-secondary/50 border border-border text-xs leading-relaxed space-y-1 animate-in fade-in">
              <span className="font-bold text-foreground">Giải thích đáp án:</span>
              <p className="text-muted-foreground">{article.explanation}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
