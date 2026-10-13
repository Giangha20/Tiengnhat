'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { speak } from '@/lib/audio';

interface SpeakingPhrase {
  id: string;
  category: string;
  japanese: string;
  reading: string;
  romaji: string;
  vietnamese: string;
  tips: string;
}

const SPEAKING_PHRASES: SpeakingPhrase[] = [
  {
    id: "spk_01",
    category: "Chào hỏi căn bản",
    japanese: "おはようございます。",
    reading: "おはようございます。",
    romaji: "Ohayou gozaimasu.",
    vietnamese: "Xin chào buổi sáng ạ.",
    tips: "Phát âm đều các nhịp mora, âm 'gozaimasu' hạ nhẹ giọng ở cuối, không thêm dấu sắc tiếng Việt."
  },
  {
    id: "spk_02",
    category: "Lần đầu gặp mặt",
    japanese: "はじめまして。どうぞよろしくおねがいします。",
    reading: "はじめまして。どうぞよろしくおねがいします。",
    romaji: "Hajimemashite. Douzo yoroshiku onegaishimasu.",
    vietnamese: "Rất vui được gặp bạn. Rất mong nhận được sự giúp đỡ.",
    tips: "Chú ý trường hợp 'douzo' kéo dài âm 'ou' đúng 2 nhịp. Chữ 'shi' trong 'shite' phát âm nhẹ nhàng."
  },
  {
    id: "spk_03",
    category: "Giao tiếp quán ăn",
    japanese: "すみません、お水をください。",
    reading: "すみません、おみずをください。",
    romaji: "Sumimasen, omizu o kudasai.",
    vietnamese: "Bạn ơi cho tôi xin nước lọc với ạ.",
    tips: "'Sumimasen' phát âm phẳng đều các nhịp, lên giọng nhẹ ở cuối để tạo sự chú ý lịch sự."
  },
  {
    id: "spk_04",
    category: "Cảm ơn & Tạm biệt",
    japanese: "どうもありがとうございます。",
    reading: "どうもありがとうございます。",
    romaji: "Doumo arigatou gozaimasu.",
    vietnamese: "Xin chân thành cảm ơn bạn rất nhiều.",
    tips: "'Arigatou' có trường hợp kéo dài ở âm 'tou'. Giữ tốc độ ổn định."
  }
];

export default function LuyenNoiPage() {
  const [activePhraseIdx, setActivePhraseIdx] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [micError, setMicError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const phrase = SPEAKING_PHRASES[activePhraseIdx];

  const handlePlaySample = () => {
    speak({
      text: phrase.japanese,
      rate: 0.8,
    });
  };

  // Start micro recording
  const startRecording = async () => {
    setMicError(null);
    setRecordedAudioUrl(null);
    audioChunksRef.current = [];

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setMicError('Trình duyệt của bạn không hỗ trợ ghi âm micro hoặc chưa được cấp quyền.');
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setRecordedAudioUrl(url);

        // Stop all tracks to release mic
        stream.getTracks().forEach((track) => track.stop());
      };

      recorder.start();
      setIsRecording(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setMicError(`Không thể truy cập micro: ${msg}. Vui lòng kiểm tra quyền truy cập micro trên trình duyệt.`);
      setIsRecording(false);
    }
  };

  // Stop micro recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <Link href="/" className="hover:text-primary transition-colors">Trang chủ</Link>
        <span>/</span>
        <span className="text-foreground font-medium">Luyện nói & phát âm</span>
      </nav>

      {/* Header */}
      <div className="mb-8">
        <div className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-semibold mb-2">
          Kỹ năng nói • Giao tiếp phản xạ
        </div>
        <h1 className="text-3xl font-bold text-foreground">
          Luyện Nói & Thu Âm Tự So Sánh
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Nghe câu phát âm chuẩn mẫu, tự thu âm giọng nói của bạn qua micro và phát lại để đối chiếu ngữ điệu.
        </p>
      </div>

      {/* Principle of Honesty Alert */}
      <div className="p-4 rounded-2xl border border-warning/30 bg-warning/5 text-xs text-muted-foreground mb-8 space-y-1">
        <p className="font-bold text-foreground">⚠️ Cam kết trung thực về việc chấm điểm giọng nói:</p>
        <p>
          Hệ thống <strong>không tạo điểm số phát âm ảo (như 95/100 hay 100%)</strong> vì trình duyệt không thể đánh giá chính xác độ chuẩn xác cao độ (pitch accent) như chuyên gia bản ngữ. 
          Website cung cấp công cụ thu âm thực tế để người học tự nghe lại và tự đánh giá sự tương đồng với âm mẫu.
        </p>
      </div>

      {/* Phrase Navigation */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
        {SPEAKING_PHRASES.map((p, idx) => (
          <button
            key={p.id}
            onClick={() => {
              setActivePhraseIdx(idx);
              setRecordedAudioUrl(null);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
              activePhraseIdx === idx
                ? 'bg-primary text-primary-foreground shadow'
                : 'bg-card border border-border text-foreground hover:bg-secondary'
            }`}
          >
            Câu {idx + 1}: {p.category}
          </button>
        ))}
      </div>

      {/* Main Speaking Practice Card */}
      <div className="bg-card border border-border rounded-3xl p-6 sm:p-10 space-y-8 shadow-sm">
        <div className="text-center space-y-3">
          <span className="text-xs font-semibold text-primary px-3 py-1 rounded-full bg-primary/10">
            {phrase.category}
          </span>
          <h2 className="ja-text text-3xl sm:text-4xl font-bold text-foreground mt-2">
            {phrase.japanese}
          </h2>
          <p className="ja-text text-base text-muted-foreground">{phrase.reading}</p>
          <p className="text-xs text-muted-foreground font-mono">{phrase.romaji}</p>
          <p className="text-sm font-semibold text-foreground pt-1">{phrase.vietnamese}</p>
        </div>

        {/* Tip Box */}
        <div className="p-4 bg-secondary/50 rounded-2xl border border-border text-xs text-muted-foreground space-y-1">
          <strong className="text-foreground flex items-center gap-1.5">
            <span>💡</span> Mẹo phát âm tự nhiên:
          </strong>
          <p>{phrase.tips}</p>
        </div>

        {/* Action Arena: Sample vs Your Voice */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          {/* Sample Audio */}
          <div className="p-5 bg-background rounded-2xl border border-border text-center space-y-3 flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-primary block mb-1">Âm mẫu tổng hợp</span>
              <p className="text-xs text-muted-foreground">Nghe mẫu phát âm tiếng Nhật</p>
            </div>
            <button
              onClick={handlePlaySample}
              className="w-full py-3 bg-secondary hover:bg-muted text-foreground font-bold rounded-xl text-xs transition-colors shadow-sm flex items-center justify-center gap-2"
            >
              <span>🔊</span> Nghe câu mẫu
            </button>
          </div>

          {/* Micro Recording */}
          <div className="p-5 bg-background rounded-2xl border border-border text-center space-y-3 flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-foreground block mb-1">Giọng nói của bạn</span>
              <p className="text-xs text-muted-foreground">Thu âm qua micro thiết bị</p>
            </div>

            {!isRecording ? (
              <button
                onClick={startRecording}
                className="w-full py-3 bg-primary text-primary-foreground font-bold rounded-xl text-xs hover:opacity-90 transition-opacity shadow flex items-center justify-center gap-2"
              >
                <span>🎙️</span> Bắt đầu ghi âm
              </button>
            ) : (
              <button
                onClick={stopRecording}
                className="w-full py-3 bg-error text-white font-bold rounded-xl text-xs hover:opacity-90 transition-opacity shadow animate-pulse flex items-center justify-center gap-2"
              >
                <span>⏹️</span> Dừng ghi âm
              </button>
            )}
          </div>
        </div>

        {micError && (
          <div className="p-3.5 bg-error/10 border border-error/20 rounded-xl text-xs text-error">
            {micError}
          </div>
        )}

        {/* Playback Recorded Voice */}
        {recordedAudioUrl && (
          <div className="p-4 bg-success/5 border border-success/20 rounded-2xl space-y-2 text-center animate-in fade-in">
            <span className="text-xs font-bold text-success block">
              ✓ Bản ghi âm của bạn đã sẵn sàng:
            </span>
            <audio controls src={recordedAudioUrl} className="w-full max-w-sm mx-auto h-10" />
            <p className="text-[11px] text-muted-foreground">
              Hãy nghe lại bản ghi và so sánh ngữ điệu, trường âm với câu mẫu phía trên.
            </p>
          </div>
        )}

        {/* Navigation bottom */}
        <div className="pt-4 border-t border-border flex justify-between items-center text-xs">
          <button
            disabled={activePhraseIdx === 0}
            onClick={() => setActivePhraseIdx((prev) => prev - 1)}
            className="px-4 py-2 bg-secondary text-foreground rounded-xl font-semibold hover:bg-muted disabled:opacity-40"
          >
            ← Câu trước
          </button>
          <button
            disabled={activePhraseIdx === SPEAKING_PHRASES.length - 1}
            onClick={() => setActivePhraseIdx((prev) => prev + 1)}
            className="px-4 py-2 bg-secondary text-foreground rounded-xl font-semibold hover:bg-muted disabled:opacity-40"
          >
            Câu tiếp theo →
          </button>
        </div>
      </div>
    </div>
  );
}
