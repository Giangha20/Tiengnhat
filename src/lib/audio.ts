'use client';

/**
 * Tiện ích phát âm tiếng Nhật sử dụng Web Speech API.
 *
 * LƯU Ý QUAN TRỌNG:
 * - Đây là giọng đọc tổng hợp (TTS), KHÔNG phải giọng người bản ngữ.
 * - Chất lượng phát âm phụ thuộc vào trình duyệt và hệ điều hành.
 * - Pitch accent và ngữ điệu tự nhiên có thể không chính xác.
 * - Một số trình duyệt có thể không hỗ trợ giọng tiếng Nhật.
 */

interface SpeakOptions {
  text: string;
  rate?: number;
  pitch?: number;
  onEnd?: () => void;
  onError?: (error: string) => void;
}

let cachedVoices: SpeechSynthesisVoice[] = [];

function getJapaneseVoices(): SpeechSynthesisVoice[] {
  if (typeof window === 'undefined' || !window.speechSynthesis) {
    return [];
  }

  if (cachedVoices.length > 0) {
    return cachedVoices;
  }

  const voices = window.speechSynthesis.getVoices();
  cachedVoices = voices.filter(
    (v) => v.lang.startsWith('ja') || v.lang.startsWith('ja-JP')
  );
  return cachedVoices;
}

export function isAudioSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

export function hasJapaneseVoice(): boolean {
  return getJapaneseVoices().length > 0;
}

const AUDIO_SPEED_KEY = 'nihongo_audio_speed';

export function getDefaultAudioSpeed(): number {
  if (typeof window === 'undefined') return 0.75;
  try {
    const saved = localStorage.getItem(AUDIO_SPEED_KEY);
    if (saved) {
      const parsed = parseFloat(saved);
      if (!isNaN(parsed) && parsed >= 0.4 && parsed <= 1.5) {
        return parsed;
      }
    }
  } catch {
    // Ignore storage errors
  }
  return 0.75; // Default beginner-friendly clear tempo
}

export function setDefaultAudioSpeed(speed: number): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(AUDIO_SPEED_KEY, speed.toString());
    window.dispatchEvent(new CustomEvent('nihongo_audio_speed_changed', { detail: speed }));
  } catch {
    // Ignore
  }
}

export function speak({ text, rate, pitch = 1, onEnd, onError }: SpeakOptions): void {
  if (!isAudioSupported()) {
    onError?.('Trình duyệt không hỗ trợ Web Speech API. Vui lòng sử dụng Chrome, Edge hoặc Safari.');
    return;
  }

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  // If rate not explicitly specified, use user's saved reading speed preference (default 0.75x)
  const effectiveRate = typeof rate === 'number' ? rate : getDefaultAudioSpeed();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'ja-JP';
  utterance.rate = effectiveRate;
  utterance.pitch = pitch;

  const japaneseVoices = getJapaneseVoices();
  if (japaneseVoices.length > 0) {
    utterance.voice = japaneseVoices[0];
  }

  utterance.onend = () => onEnd?.();
  utterance.onerror = (event) => {
    if (event.error === 'canceled') return;
    onError?.(`Không thể phát âm thanh: ${event.error}. Trình duyệt có thể không có giọng tiếng Nhật.`);
  };

  window.speechSynthesis.speak(utterance);
}

export function stopSpeaking(): void {
  if (isAudioSupported()) {
    window.speechSynthesis.cancel();
  }
}

// Initialize voices when they become available
if (typeof window !== 'undefined' && window.speechSynthesis) {
  window.speechSynthesis.onvoiceschanged = () => {
    cachedVoices = [];
    getJapaneseVoices();
  };
}
