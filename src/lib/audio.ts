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

export function speak({ text, rate = 0.8, pitch = 1, onEnd, onError }: SpeakOptions): void {
  if (!isAudioSupported()) {
    onError?.('Trình duyệt không hỗ trợ Web Speech API. Vui lòng sử dụng Chrome, Edge hoặc Safari.');
    return;
  }

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'ja-JP';
  utterance.rate = rate;
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
