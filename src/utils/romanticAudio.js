/**
 * Romantic Music Box & Chimes Synthesizer (Web Audio API)
 * 100% Client-Side, zero external mp3 files, instant load, zero delay.
 * Sweet, enchanting music box melody (Amélie / Studio Ghibli inspired romance).
 */

let audioCtx = null;
let bgmMasterGain = null;
let isPlayingBgm = false;
let sequenceTimeouts = [];
let loopIntervalId = null;

function getAudioContext() {
  if (!audioCtx && typeof window !== 'undefined') {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Plays a magical romantic bell chime (for heart clicks, reactions, celebrations)
 */
export function playHeartChime() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const freqs = [739.99, 932.33, 1108.73, 1479.98];

    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.04);

      gain.gain.setValueAtTime(0, now + idx * 0.04);
      gain.gain.linearRampToValueAtTime(0.08 / (idx + 1), now + idx * 0.04 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.04 + 0.9);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.04);
      osc.stop(now + idx * 0.04 + 1.0);
    });
  } catch {
    // Fail silently if audio blocked
  }
}

// ─── Musical frequencies dictionary ──────────────────────────────────────────
const FREQS = {
  'A2': 110.00, 'B2': 123.47, 'C3': 130.81, 'D3': 146.83, 'E3': 164.81, 'Fs3': 185.00, 'G3': 196.00,
  'A3': 220.00, 'B3': 246.94, 'C4': 261.63, 'D4': 293.66, 'E4': 329.63, 'Fs4': 369.99, 'G4': 392.00,
  'A4': 440.00, 'B4': 493.88, 'C5': 523.25, 'D5': 587.33, 'E5': 659.25, 'Fs5': 739.99, 'G5': 783.99,
  'A5': 880.00, 'B5': 987.77, 'C6': 1046.50
};

/**
 * Plays a single delicate music box note with pure fundamental + sweet metallic overtone
 */
function playMusicBoxNote(ctx, freq, startTime, duration = 1.4, volume = 0.065) {
  if (!ctx || !freq) return;

  // 1. Fundamental tone (warm pure sine)
  const osc1 = ctx.createOscillator();
  const gain1 = ctx.createGain();
  osc1.type = 'sine';
  osc1.frequency.setValueAtTime(freq, startTime);

  gain1.gain.setValueAtTime(0, startTime);
  gain1.gain.linearRampToValueAtTime(volume, startTime + 0.005);
  gain1.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

  // 2. Bell / Music-box tine overtone (approx 2.76x fundamental for metallic ping)
  const osc2 = ctx.createOscillator();
  const gain2 = ctx.createGain();
  osc2.type = 'sine';
  osc2.frequency.setValueAtTime(freq * 2.76, startTime);

  gain2.gain.setValueAtTime(0, startTime);
  gain2.gain.linearRampToValueAtTime(volume * 0.18, startTime + 0.003);
  gain2.gain.exponentialRampToValueAtTime(0.0001, startTime + Math.min(0.28, duration * 0.35));

  // Connect to master BGM gain
  const master = bgmMasterGain || ctx.destination;
  osc1.connect(gain1);
  gain1.connect(master);

  osc2.connect(gain2);
  gain2.connect(master);

  osc1.start(startTime);
  osc1.stop(startTime + duration + 0.05);

  osc2.start(startTime);
  osc2.stop(startTime + duration + 0.05);
}

/**
 * 27-second Romantic Music Box Melody in G Major / E Minor
 * Delicate, nostalgic, peaceful and deeply pleasant.
 */
const MELODY_SEQUENCE = [
  // Measure 1: G Major arpeggio
  { note: 'G3', t: 0, dur: 1.6, v: 0.07 },
  { note: 'B3', t: 0.32, dur: 1.3, v: 0.055 },
  { note: 'D4', t: 0.64, dur: 1.3, v: 0.06 },
  { note: 'G4', t: 0.96, dur: 1.3, v: 0.065 },
  { note: 'B4', t: 1.28, dur: 1.5, v: 0.075 },
  { note: 'D5', t: 1.60, dur: 1.6, v: 0.08 },

  // Measure 2: D/F# cadence
  { note: 'Fs3', t: 2.0, dur: 1.6, v: 0.065 },
  { note: 'A3', t: 2.32, dur: 1.3, v: 0.055 },
  { note: 'D4', t: 2.64, dur: 1.3, v: 0.06 },
  { note: 'Fs4', t: 2.96, dur: 1.3, v: 0.065 },
  { note: 'A4', t: 3.28, dur: 1.5, v: 0.075 },
  { note: 'D5', t: 3.60, dur: 1.6, v: 0.08 },

  // Measure 3: E Minor tenderness
  { note: 'E3', t: 4.0, dur: 1.6, v: 0.07 },
  { note: 'G3', t: 4.32, dur: 1.3, v: 0.055 },
  { note: 'B3', t: 4.64, dur: 1.3, v: 0.06 },
  { note: 'E4', t: 4.96, dur: 1.3, v: 0.065 },
  { note: 'G4', t: 5.28, dur: 1.5, v: 0.075 },
  { note: 'B4', t: 5.60, dur: 1.6, v: 0.08 },

  // Measure 4: B Minor depth
  { note: 'B2', t: 6.0, dur: 1.6, v: 0.065 },
  { note: 'Fs3', t: 6.32, dur: 1.3, v: 0.055 },
  { note: 'B3', t: 6.64, dur: 1.3, v: 0.06 },
  { note: 'D4', t: 6.96, dur: 1.3, v: 0.065 },
  { note: 'Fs4', t: 7.28, dur: 1.5, v: 0.07 },
  { note: 'B4', t: 7.60, dur: 1.6, v: 0.075 },

  // Measure 5: C Major warmth
  { note: 'C3', t: 8.0, dur: 1.6, v: 0.07 },
  { note: 'E3', t: 8.32, dur: 1.3, v: 0.055 },
  { note: 'G3', t: 8.64, dur: 1.3, v: 0.06 },
  { note: 'C4', t: 8.96, dur: 1.3, v: 0.065 },
  { note: 'E4', t: 9.28, dur: 1.5, v: 0.075 },
  { note: 'G4', t: 9.60, dur: 1.6, v: 0.08 },

  // Measure 6: G/B closeness
  { note: 'B2', t: 10.0, dur: 1.6, v: 0.065 },
  { note: 'D3', t: 10.32, dur: 1.3, v: 0.055 },
  { note: 'G3', t: 10.64, dur: 1.3, v: 0.06 },
  { note: 'B3', t: 10.96, dur: 1.3, v: 0.065 },
  { note: 'D4', t: 11.28, dur: 1.5, v: 0.07 },
  { note: 'G4', t: 11.60, dur: 1.6, v: 0.075 },

  // Measure 7: A Minor romance
  { note: 'A2', t: 12.0, dur: 1.6, v: 0.065 },
  { note: 'C3', t: 12.32, dur: 1.3, v: 0.055 },
  { note: 'E3', t: 12.64, dur: 1.3, v: 0.06 },
  { note: 'A3', t: 12.96, dur: 1.3, v: 0.065 },
  { note: 'C4', t: 13.28, dur: 1.5, v: 0.075 },
  { note: 'E4', t: 13.60, dur: 1.6, v: 0.08 },

  // Measure 8: D7 progression forward
  { note: 'D3', t: 14.0, dur: 1.6, v: 0.07 },
  { note: 'Fs3', t: 14.32, dur: 1.3, v: 0.055 },
  { note: 'A3', t: 14.64, dur: 1.3, v: 0.06 },
  { note: 'C4', t: 14.96, dur: 1.3, v: 0.065 },
  { note: 'Fs4', t: 15.28, dur: 1.5, v: 0.075 },
  { note: 'A4', t: 15.60, dur: 1.6, v: 0.08 },

  // Measure 9: Sparkle High Melody G5
  { note: 'G4', t: 16.0, dur: 1.3, v: 0.065 },
  { note: 'B4', t: 16.3, dur: 1.3, v: 0.07 },
  { note: 'D5', t: 16.6, dur: 1.5, v: 0.075 },
  { note: 'G5', t: 16.9, dur: 1.9, v: 0.085 },
  { note: 'Fs5', t: 17.35, dur: 1.3, v: 0.075 },
  { note: 'D5', t: 17.65, dur: 1.3, v: 0.07 },

  // Measure 10: Sparkle High Melody Em
  { note: 'E4', t: 18.0, dur: 1.3, v: 0.065 },
  { note: 'G4', t: 18.3, dur: 1.3, v: 0.07 },
  { note: 'B4', t: 18.6, dur: 1.5, v: 0.075 },
  { note: 'E5', t: 18.9, dur: 1.9, v: 0.085 },
  { note: 'G5', t: 19.35, dur: 1.4, v: 0.08 },
  { note: 'Fs5', t: 19.7, dur: 1.4, v: 0.075 },

  // Measure 11: Sparkle High Melody C5
  { note: 'C4', t: 20.1, dur: 1.3, v: 0.065 },
  { note: 'E4', t: 20.4, dur: 1.3, v: 0.07 },
  { note: 'G4', t: 20.7, dur: 1.5, v: 0.075 },
  { note: 'C5', t: 21.0, dur: 1.8, v: 0.08 },
  { note: 'E5', t: 21.4, dur: 1.4, v: 0.075 },
  { note: 'D5', t: 21.75, dur: 1.4, v: 0.07 },

  // Measure 12: Sweet Cadence return
  { note: 'D4', t: 22.15, dur: 1.3, v: 0.065 },
  { note: 'Fs4', t: 22.45, dur: 1.3, v: 0.07 },
  { note: 'A4', t: 22.75, dur: 1.4, v: 0.075 },
  { note: 'C5', t: 23.05, dur: 1.6, v: 0.08 },
  { note: 'B4', t: 23.45, dur: 1.4, v: 0.075 },
  { note: 'A4', t: 23.85, dur: 1.5, v: 0.07 },

  // Final measure: Pure, serene music box resolution chord
  { note: 'G3', t: 24.3, dur: 3.2, v: 0.06 },
  { note: 'B3', t: 24.4, dur: 3.2, v: 0.055 },
  { note: 'D4', t: 24.5, dur: 3.2, v: 0.06 },
  { note: 'G4', t: 24.6, dur: 3.5, v: 0.075 },
  { note: 'B4', t: 24.7, dur: 3.8, v: 0.08 },
  { note: 'G5', t: 25.1, dur: 4.0, v: 0.085 },
];

const LOOP_DURATION_SEC = 27.2;

function scheduleLoop() {
  if (!isPlayingBgm) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;

  MELODY_SEQUENCE.forEach((item) => {
    const freq = FREQS[item.note];
    if (freq) {
      playMusicBoxNote(ctx, freq, now + item.t, item.dur, item.v);
    }
  });
}

export function startBackgroundMusic() {
  const ctx = getAudioContext();
  if (!ctx) return false;

  if (isPlayingBgm) return true;
  isPlayingBgm = true;

  if (!bgmMasterGain) {
    bgmMasterGain = ctx.createGain();
    bgmMasterGain.gain.setValueAtTime(0.7, ctx.currentTime);
    bgmMasterGain.connect(ctx.destination);
  }

  // Play immediately
  scheduleLoop();

  // Schedule loop repeat seamlessly
  loopIntervalId = setInterval(() => {
    if (!isPlayingBgm) return;
    scheduleLoop();
  }, LOOP_DURATION_SEC * 1000);

  return true;
}

export function stopBackgroundMusic() {
  isPlayingBgm = false;
  if (loopIntervalId) {
    clearInterval(loopIntervalId);
    loopIntervalId = null;
  }
  return false;
}

export function toggleBackgroundMusic() {
  if (isPlayingBgm) {
    stopBackgroundMusic();
    return false;
  } else {
    return startBackgroundMusic();
  }
}

export function isMusicPlaying() {
  return isPlayingBgm;
}
