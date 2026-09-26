/**
 * Romantic Audio Synthesizer (Web Audio API)
 * 100% Client-Side, zero external mp3 files, instant load, zero delay.
 */

let audioCtx = null;
let bgmGainNode = null;
let isPlayingBgm = false;
let bgmIntervalId = null;

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
    // Chime notes: F#5, A#5, C#6 (warm romantic major chord)
    const freqs = [739.99, 932.33, 1108.73, 1479.98];

    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.04);

      // Sweet bell envelope
      gain.gain.setValueAtTime(0, now + idx * 0.04);
      gain.gain.linearRampToValueAtTime(0.08 / (idx + 1), now + idx * 0.04 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.04 + 0.9);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.04);
      osc.stop(now + idx * 0.04 + 1.0);
    });
  } catch (e) {
    // Fail silently if audio blocked
  }
}

/**
 * Romantic Lo-Fi Dreamy Ambient chord progression
 * Chords: Emaj9 -> C#m9 -> Amaj9 -> Badd11
 */
const CHORDS = [
  // Emaj9 (E3, G#3, B3, D#4, F#4)
  [164.81, 207.65, 246.94, 311.13, 369.99],
  // C#m9 (C#3, E3, G#3, B3, D#4)
  [138.59, 164.81, 207.65, 246.94, 311.13],
  // Amaj9 (A2, C#3, E3, G#3, B3)
  [110.00, 138.59, 164.81, 207.65, 246.94],
  // Badd11 (B2, D#3, F#3, A3, E4)
  [123.47, 155.56, 185.00, 220.00, 329.63],
];

let chordIndex = 0;

function playAmbientPad(chordNotes, duration = 4.2) {
  const ctx = getAudioContext();
  if (!ctx || !isPlayingBgm) return;

  const now = ctx.currentTime;

  chordNotes.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const noteGain = ctx.createGain();

    // Warm Rhodes/piano pad style
    osc.type = i === 0 ? 'sine' : 'triangle';
    osc.frequency.setValueAtTime(freq, now);

    // Subtle warm lowpass filter
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(450 + i * 120, now);
    filter.Q.setValueAtTime(1.5, now);

    // Slow atmospheric attack and release
    noteGain.gain.setValueAtTime(0, now);
    noteGain.gain.linearRampToValueAtTime(0.025, now + 1.2);
    noteGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(filter);
    filter.connect(noteGain);
    noteGain.connect(bgmGainNode || ctx.destination);

    osc.start(now);
    osc.stop(now + duration + 0.1);
  });
}

export function startBackgroundMusic() {
  const ctx = getAudioContext();
  if (!ctx) return false;

  if (isPlayingBgm) return true;
  isPlayingBgm = true;

  if (!bgmGainNode) {
    bgmGainNode = ctx.createGain();
    bgmGainNode.gain.setValueAtTime(0.6, ctx.currentTime);
    bgmGainNode.connect(ctx.destination);
  }

  // Play immediately
  playAmbientPad(CHORDS[chordIndex]);
  chordIndex = (chordIndex + 1) % CHORDS.length;

  bgmIntervalId = setInterval(() => {
    if (!isPlayingBgm) return;
    playAmbientPad(CHORDS[chordIndex]);
    chordIndex = (chordIndex + 1) % CHORDS.length;
  }, 4500);

  return true;
}

export function stopBackgroundMusic() {
  isPlayingBgm = false;
  if (bgmIntervalId) {
    clearInterval(bgmIntervalId);
    bgmIntervalId = null;
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
