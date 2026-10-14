// Web Audio API procedural sound synthesizer (0 external dependencies, 0ms latency)

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

// 1. Soft UI Tap Sound (woodblock / subtle button press)
export function playTapSound() {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    const now = ctx.currentTime;
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(300, now + 0.05);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.05);
  } catch (e) {
    // Ignore audio playback errors
  }
}

// 2. Card Flip Sound (soft swoosh for flashcards)
export function playFlipSound() {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(240, now);
    osc.frequency.exponentialRampToValueAtTime(420, now + 0.08);

    gain.gain.setValueAtTime(0.06, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.09);
  } catch (e) {
    // Ignore
  }
}

// 3. Correct Answer Chime (harmonious double-bell)
export function playCorrectSound() {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    const notes = [659.25, 880, 1046.5]; // E5, A5, C6 (major triad)

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);

      gain.gain.setValueAtTime(0.09, now + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.35);
    });
  } catch (e) {
    // Ignore
  }
}

// 4. Incorrect Answer Cue (gentle low marimba, not buzzing/harsh)
export function playIncorrectSound() {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(140, now + 0.18);

    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.18);
  } catch (e) {
    // Ignore
  }
}

// 5. Level Up / Streak Milestone / Test Completion Fanfare
export function playCelebrationSound() {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    const chord = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6

    chord.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.09);

      gain.gain.setValueAtTime(0.12, now + idx * 0.09);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.09 + 0.5);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.09);
      osc.stop(now + idx * 0.09 + 0.5);
    });
  } catch (e) {
    // Ignore
  }
}

// 6. Mechanical Keyboard Keycap Click (Procedural Switch Audio)
export function playMechanicalKeyClick(switchType: 'blue' | 'red' | 'brown' = 'blue') {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;

    if (switchType === 'blue') {
      // Blue Switch: High-frequency click snap + casing bottom out
      const clickOsc = ctx.createOscillator();
      const clickGain = ctx.createGain();
      clickOsc.type = 'triangle';
      clickOsc.frequency.setValueAtTime(2200, now);
      clickOsc.frequency.exponentialRampToValueAtTime(800, now + 0.015);
      clickGain.gain.setValueAtTime(0.12, now);
      clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);
      clickOsc.connect(clickGain);
      clickGain.connect(ctx.destination);
      clickOsc.start(now);
      clickOsc.stop(now + 0.02);

      // Bottom-out thud
      const thudOsc = ctx.createOscillator();
      const thudGain = ctx.createGain();
      thudOsc.type = 'sine';
      thudOsc.frequency.setValueAtTime(320, now + 0.008);
      thudOsc.frequency.exponentialRampToValueAtTime(140, now + 0.035);
      thudGain.gain.setValueAtTime(0.08, now + 0.008);
      thudGain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);
      thudOsc.connect(thudGain);
      thudGain.connect(ctx.destination);
      thudOsc.start(now + 0.008);
      thudOsc.stop(now + 0.035);
    } else if (switchType === 'red') {
      // Red Switch: Linear smooth dampened bottom-out
      const thudOsc = ctx.createOscillator();
      const thudGain = ctx.createGain();
      thudOsc.type = 'sine';
      thudOsc.frequency.setValueAtTime(260, now);
      thudOsc.frequency.exponentialRampToValueAtTime(120, now + 0.03);
      thudGain.gain.setValueAtTime(0.09, now);
      thudGain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
      thudOsc.connect(thudGain);
      thudGain.connect(ctx.destination);
      thudOsc.start(now);
      thudOsc.stop(now + 0.03);
    } else {
      // Brown Switch: Gentle tactile bump + subtle bottom out
      const bumpOsc = ctx.createOscillator();
      const bumpGain = ctx.createGain();
      bumpOsc.type = 'sine';
      bumpOsc.frequency.setValueAtTime(650, now);
      bumpOsc.frequency.exponentialRampToValueAtTime(300, now + 0.02);
      bumpGain.gain.setValueAtTime(0.07, now);
      bumpGain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);
      bumpOsc.connect(bumpGain);
      bumpGain.connect(ctx.destination);
      bumpOsc.start(now);
      bumpOsc.stop(now + 0.02);
    }
  } catch (e) {
    // Ignore audio error
  }
}

// 7. Typing Error Thud
export function playTypingErrorSound() {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(160, now);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.08);
    gain.gain.setValueAtTime(0.07, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.08);
  } catch (e) {
    // Ignore
  }
}

// 8. Combo Streak Musical Ping
export function playComboBurstSound(combo: number) {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    const pentatonic = [440, 493.88, 554.37, 659.25, 739.99, 880, 987.77, 1108.73];
    const pitchIndex = Math.min(Math.floor((combo - 1) / 3), pentatonic.length - 1);
    const freq = pentatonic[pitchIndex];

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);
    gain.gain.setValueAtTime(0.09, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.16);
  } catch (e) {
    // Ignore
  }
}
