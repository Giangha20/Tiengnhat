'use client';

import { useState } from 'react';
import Link from 'next/link';
import dialogueDataRaw from '@/data/dialogues/n5-dialogues.json';
import { speak } from '@/lib/audio';

interface DialogueLine {
  speaker: string;
  japanese: string;
  reading: string;
  romaji: string;
  vietnamese: string;
}

interface Dialogue {
  id: string;
  title: string;
  titleJa: string;
  situation: string;
  characters: string[];
  lines: DialogueLine[];
  culturalNotes: string;
}

export default function HoiThoaiPage() {
  const dialogues = dialogueDataRaw.dialogues as Dialogue[];
  const [activeDialogueId, setActiveDialogueId] = useState<string>(dialogues[0].id);
  const [showTranslations, setShowTranslations] = useState<boolean>(true);
  const [showRomaji, setShowRomaji] = useState<boolean>(true);
  const [playingLineIdx, setPlayingLineIdx] = useState<number | null>(null);

  const activeDialogue = dialogues.find((d) => d.id === activeDialogueId) || dialogues[0];

  const playLine = (text: string, idx: number) => {
    setPlayingLineIdx(idx);
    speak({
      text,
      onEnd: () => setPlayingLineIdx(null),
      onError: () => setPlayingLineIdx(null),
    });
  };

  const playAllLines = () => {
    let current = 0;
    const playNext = () => {
      if (current >= activeDialogue.lines.length) {
        setPlayingLineIdx(null);
        return;
      }
      setPlayingLineIdx(current);
      speak({
        text: activeDialogue.lines[current].japanese,
        onEnd: () => {
          current++;
          setTimeout(playNext, 600); // pause between speakers
        },
        onError: () => setPlayingLineIdx(null),
      });
    };
    playNext();
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <Link href="/" className="hover:text-primary transition-colors">Trang chủ</Link>
        <span>/</span>
        <span className="text-foreground font-medium">Hội thoại thực tế</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-semibold mb-2">
            Giao tiếp • JLPT N5
          </div>
          <h1 className="text-3xl font-bold text-foreground">
            Hội Thoại Tiếng Nhật Thực Tế
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Luyện nghe, nói và phản xạ theo từng ngữ cảnh văn hóa Nhật Bản trong đời sống.
          </p>
        </div>

        {/* Global toggles */}
        <div className="flex items-center gap-2 self-start sm:self-auto text-xs">
          <button
            onClick={() => setShowTranslations(!showTranslations)}
            className={`px-3 py-1.5 rounded-lg border font-medium transition-colors ${
              showTranslations ? 'bg-primary/10 border-primary text-primary' : 'bg-card border-border text-muted-foreground'
            }`}
          >
            {showTranslations ? 'Ẩn dịch nghĩa' : 'Hiện dịch nghĩa'}
          </button>
          <button
            onClick={() => setShowRomaji(!showRomaji)}
            className={`px-3 py-1.5 rounded-lg border font-medium transition-colors ${
              showRomaji ? 'bg-primary/10 border-primary text-primary' : 'bg-card border-border text-muted-foreground'
            }`}
          >
            {showRomaji ? 'Ẩn Romaji' : 'Hiện Romaji'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Topics */}
        <div className="lg:col-span-1 space-y-2">
          <span className="text-xs font-semibold text-muted-foreground block mb-1">
            Chọn chủ đề hội thoại:
          </span>
          {dialogues.map((d) => (
            <button
              key={d.id}
              onClick={() => {
                setActiveDialogueId(d.id);
                setPlayingLineIdx(null);
              }}
              className={`w-full text-left p-3.5 rounded-xl border text-xs sm:text-sm transition-all ${
                activeDialogueId === d.id
                  ? 'border-primary bg-primary/5 text-primary font-bold shadow-sm'
                  : 'border-border bg-card text-foreground hover:border-primary/40'
              }`}
            >
              <p className="ja-text text-xs text-muted-foreground">{d.titleJa}</p>
              <p className="mt-0.5">{d.title}</p>
            </button>
          ))}
        </div>

        {/* Main Dialogue Content */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
            {/* Dialogue Title & Situation */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
              <div>
                <span className="ja-text text-sm font-semibold text-primary">{activeDialogue.titleJa}</span>
                <h2 className="text-xl font-bold text-foreground mt-0.5">{activeDialogue.title}</h2>
                <p className="text-xs text-muted-foreground mt-1">
                  <strong>Bối cảnh:</strong> {activeDialogue.situation}
                </p>
              </div>

              <button
                onClick={playAllLines}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-xl text-xs font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-1.5 whitespace-nowrap shadow"
              >
                <span>▶️</span> Phát toàn bộ hội thoại
              </button>
            </div>

            {/* Conversation Flow */}
            <div className="space-y-4">
              {activeDialogue.lines.map((line, idx) => {
                const isPlaying = playingLineIdx === idx;
                const isSpeakerA = line.speaker === activeDialogue.characters[0];

                return (
                  <div
                    key={idx}
                    className={`flex gap-3 ${isSpeakerA ? 'flex-row' : 'flex-row-reverse'}`}
                  >
                    {/* Avatar Badge */}
                    <div className="w-9 h-9 rounded-full bg-secondary border border-border flex items-center justify-center text-xs font-bold text-primary flex-shrink-0">
                      {line.speaker.slice(0, 2)}
                    </div>

                    {/* Chat Bubble */}
                    <div
                      className={`max-w-[85%] rounded-2xl p-4 space-y-1.5 text-sm transition-all ${
                        isPlaying
                          ? 'ring-2 ring-primary bg-primary/10 border-primary'
                          : isSpeakerA
                          ? 'bg-background border border-border'
                          : 'bg-secondary/60 border border-border'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-[11px] font-bold text-muted-foreground">
                          {line.speaker}
                        </span>
                        <button
                          onClick={() => playLine(line.japanese, idx)}
                          className="text-xs px-2 py-0.5 bg-card hover:bg-muted border border-border rounded-md font-medium"
                          title="Nghe câu này"
                        >
                          🔊 {isPlaying ? 'Đang phát...' : 'Nghe'}
                        </button>
                      </div>

                      <p className="ja-text text-base sm:text-lg font-bold text-foreground">
                        {line.japanese}
                      </p>

                      {line.reading !== line.japanese && (
                        <p className="ja-text text-xs text-muted-foreground">
                          {line.reading}
                        </p>
                      )}

                      {showRomaji && (
                        <p className="text-xs text-muted-foreground font-mono">
                          {line.romaji}
                        </p>
                      )}

                      {showTranslations && (
                        <p className="text-xs text-foreground font-medium pt-1 border-t border-border/50">
                          {line.vietnamese}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Cultural notes */}
            {activeDialogue.culturalNotes && (
              <div className="mt-6 p-4 rounded-2xl bg-warning/5 border border-warning/20 text-xs text-muted-foreground space-y-1">
                <span className="font-bold text-foreground flex items-center gap-1.5">
                  <span>🎎</span> Lưu ý văn hóa & phép lịch sự Nhật Bản:
                </span>
                <p className="leading-relaxed">{activeDialogue.culturalNotes}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
