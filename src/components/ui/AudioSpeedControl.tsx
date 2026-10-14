'use client';

import React from 'react';
import { useUISettings } from '@/components/providers/UISettingsProvider';
import { speak } from '@/lib/audio';

const SPEED_PRESETS = [
  { value: 0.5, label: '0.5x', desc: 'Rất chậm (Từng âm)', icon: '🐢' },
  { value: 0.75, label: '0.75x', desc: 'Chậm (Người mới)', icon: '👂' },
  { value: 1.0, label: '1.0x', desc: 'Chuẩn (Bản xứ)', icon: '🎌' },
  { value: 1.25, label: '1.25x', desc: 'Nhanh (Phản xạ)', icon: '⚡' },
];

interface AudioSpeedControlProps {
  compact?: boolean;
  showTestButton?: boolean;
  className?: string;
}

export default function AudioSpeedControl({
  compact = false,
  showTestButton = true,
  className = '',
}: AudioSpeedControlProps) {
  const { settings, updateSettings, playTap } = useUISettings();
  const currentSpeed = settings.audioSpeed || 0.75;

  const handleSelectSpeed = (speed: number) => {
    playTap();
    updateSettings({ audioSpeed: speed });
  };

  const handleTestAudio = () => {
    speak({
      text: 'こんにちは、はじめまして。日本語の勉強を頑張りましょう！',
      rate: currentSpeed,
    });
  };

  if (compact) {
    return (
      <div className={`inline-flex items-center gap-1 bg-secondary/80 p-1 rounded-xl border border-border text-xs ${className}`}>
        <span className="text-[11px] text-muted-foreground px-1.5 font-medium">Tốc độ:</span>
        {SPEED_PRESETS.map((preset) => (
          <button
            key={preset.value}
            type="button"
            onClick={() => handleSelectSpeed(preset.value)}
            className={`px-2 py-0.5 rounded-lg font-mono font-bold transition-all cursor-pointer ${
              Math.abs(currentSpeed - preset.value) < 0.05
                ? 'bg-primary text-primary-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
            title={preset.desc}
          >
            {preset.label}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className={`bg-card border border-border rounded-2xl p-4 space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <span>🗣️</span>
            <span>Tốc độ đọc tiếng Nhật (Audio Speed)</span>
          </h4>
          <p className="text-xs text-muted-foreground mt-0.5">
            Người mới bắt đầu nên chọn <strong>0.75x</strong> hoặc <strong>0.5x</strong> để nghe tách bạch từng âm Mora.
          </p>
        </div>

        {showTestButton && (
          <button
            type="button"
            onClick={handleTestAudio}
            className="px-3 py-1.5 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary text-xs font-bold transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer"
            title="Nghe thử câu tiếng Nhật mẫu với tốc độ hiện tại"
          >
            <span>🔊</span>
            <span>Nghe thử</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {SPEED_PRESETS.map((preset) => {
          const isSelected = Math.abs(currentSpeed - preset.value) < 0.05;

          return (
            <button
              key={preset.value}
              type="button"
              onClick={() => handleSelectSpeed(preset.value)}
              className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center ${
                isSelected
                  ? 'border-primary bg-primary/10 text-primary font-bold shadow-xs'
                  : 'border-border bg-secondary/50 text-muted-foreground hover:text-foreground hover:bg-secondary'
              }`}
            >
              <div className="flex items-center gap-1 text-sm font-extrabold font-mono">
                <span>{preset.icon}</span>
                <span>{preset.label}</span>
              </div>
              <span className="text-[10px] mt-0.5 opacity-80">{preset.desc}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
