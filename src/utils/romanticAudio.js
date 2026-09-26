/**
 * Romantic Audio Controller
 * Manages background music with soft ambient volume, smooth fade-in/fade-out,
 * seamless switching between "La Distancia" and "Tengo Ganas", and user gesture auto-unlock.
 */

import laDistanciaUrl from '../data/music/laDistancia.mp3';
import tengoGanasUrl from '../data/music/tengoGanas.mp3';

export const TRACKS = {
  laDistancia: {
    id: 'laDistancia',
    title: 'La Distancia',
    artist: 'Nuestra Melodía',
    url: laDistanciaUrl,
    description: 'La canción de fondo que acompaña cada recuerdo',
  },
  tengoGanas: {
    id: 'tengoGanas',
    title: 'Tengo Ganas',
    artist: 'Momento Especial',
    url: tengoGanasUrl,
    description: 'Una melodía para encender la complicidad',
  },
};

const DEFAULT_VOLUME = 0.28; // Suavecito y bajito de fondo como pidió el usuario

let currentTrackKey = 'laDistancia';
let audioElement = null;
let isPlaying = false;
let currentVolume = DEFAULT_VOLUME;
let listeners = new Set();
let unlockAttached = false;
let fadeInterval = null;

function notify() {
  const state = {
    isPlaying,
    currentTrack: TRACKS[currentTrackKey],
    volume: currentVolume,
  };
  listeners.forEach((cb) => {
    try {
      cb(state);
    } catch (e) {
      console.warn('Audio listener error:', e);
    }
  });
}

function getAudioElement() {
  if (typeof window === 'undefined') return null;

  if (!audioElement) {
    audioElement = new Audio();
    audioElement.loop = true;
    audioElement.volume = currentVolume;
    audioElement.src = TRACKS[currentTrackKey].url;

    audioElement.addEventListener('play', () => {
      isPlaying = true;
      notify();
    });

    audioElement.addEventListener('pause', () => {
      isPlaying = false;
      notify();
    });

    audioElement.addEventListener('ended', () => {
      isPlaying = false;
      notify();
    });

    audioElement.addEventListener('error', (e) => {
      console.warn('Audio error:', e);
      isPlaying = false;
      notify();
    });
  }
  return audioElement;
}

/**
 * Smoothly ramps audio volume to target
 */
function fadeTo(targetVolume, durationMs = 1200, onComplete) {
  const el = getAudioElement();
  if (!el) return;

  if (fadeInterval) {
    clearInterval(fadeInterval);
    fadeInterval = null;
  }

  const steps = 24;
  const stepTime = durationMs / steps;
  const startVolume = el.volume;
  const delta = (targetVolume - startVolume) / steps;
  let currentStep = 0;

  fadeInterval = setInterval(() => {
    currentStep++;
    const nextVol = Math.max(0, Math.min(1, startVolume + delta * currentStep));
    el.volume = nextVol;

    if (currentStep >= steps) {
      clearInterval(fadeInterval);
      fadeInterval = null;
      el.volume = Math.max(0, Math.min(1, targetVolume));
      if (onComplete) onComplete();
    }
  }, stepTime);
}

/**
 * Starts background music (defaults to 'laDistancia') with smooth fade-in
 */
export function startBackgroundMusic(trackKey) {
  const el = getAudioElement();
  if (!el) return Promise.resolve(false);

  if (trackKey && TRACKS[trackKey] && trackKey !== currentTrackKey) {
    currentTrackKey = trackKey;
    el.src = TRACKS[trackKey].url;
  }

  el.volume = 0.02; // Start very quiet for smooth fade-in

  const playPromise = el.play();
  if (playPromise !== undefined) {
    return playPromise
      .then(() => {
        isPlaying = true;
        fadeTo(currentVolume, 1500);
        notify();
        return true;
      })
      .catch((err) => {
        // Autoplay blocked by browser policy — attach one-time user interaction listener
        console.log('Autoplay deferred until first user interaction:', err.message);
        attachAutoUnlock();
        isPlaying = false;
        notify();
        return false;
      });
  }

  return Promise.resolve(true);
}

/**
 * Stops or pauses background music with quick fade-out
 */
export function stopBackgroundMusic() {
  const el = getAudioElement();
  if (!el) return false;

  fadeTo(0, 600, () => {
    el.pause();
    isPlaying = false;
    notify();
  });
  return false;
}

/**
 * Toggles background music
 */
export function toggleBackgroundMusic() {
  if (isPlaying) {
    stopBackgroundMusic();
    return false;
  } else {
    startBackgroundMusic(currentTrackKey);
    return true;
  }
}

/**
 * Switches to a specific track or toggles to next track
 */
export function switchTrack(trackKey) {
  const nextKey = trackKey || (currentTrackKey === 'laDistancia' ? 'tengoGanas' : 'laDistancia');
  if (!TRACKS[nextKey]) return;

  const el = getAudioElement();
  if (!el) return;

  if (isPlaying) {
    fadeTo(0, 600, () => {
      currentTrackKey = nextKey;
      el.src = TRACKS[nextKey].url;
      el.play()
        .then(() => {
          fadeTo(currentVolume, 1200);
          notify();
        })
        .catch((e) => console.warn('Play switch error:', e));
    });
  } else {
    currentTrackKey = nextKey;
    el.src = TRACKS[nextKey].url;
    notify();
  }
}

/**
 * Set master background music volume (0.0 to 1.0)
 */
export function setMusicVolume(vol) {
  currentVolume = Math.max(0, Math.min(1, vol));
  const el = getAudioElement();
  if (el) el.volume = currentVolume;
  notify();
}

export function getMusicVolume() {
  return currentVolume;
}

export function isMusicPlaying() {
  return isPlaying;
}

export function getCurrentTrack() {
  return TRACKS[currentTrackKey] || TRACKS.laDistancia;
}

/**
 * Subscribe to audio state changes
 */
export function subscribeToMusicState(callback) {
  listeners.add(callback);
  callback({
    isPlaying,
    currentTrack: TRACKS[currentTrackKey],
    volume: currentVolume,
  });
  return () => listeners.delete(callback);
}

/**
 * Attaches a one-time global click listener to unlock audio on first interaction
 */
export function attachAutoUnlock() {
  if (unlockAttached || typeof window === 'undefined') return;
  unlockAttached = true;

  const handleUnlock = () => {
    const el = getAudioElement();
    if (el && !isPlaying) {
      startBackgroundMusic();
    }
    window.removeEventListener('click', handleUnlock);
    window.removeEventListener('touchstart', handleUnlock);
    window.removeEventListener('keydown', handleUnlock);
  };

  window.addEventListener('click', handleUnlock, { once: true });
  window.addEventListener('touchstart', handleUnlock, { once: true });
  window.addEventListener('keydown', handleUnlock, { once: true });
}

// ─── Romantic Chimes (Web Audio API) for Reactions ───────────────────────────
let chimeCtx = null;

export function playHeartChime() {
  try {
    if (typeof window === 'undefined') return;
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;

    if (!chimeCtx) {
      chimeCtx = new AudioContextClass();
    }
    if (chimeCtx.state === 'suspended') {
      chimeCtx.resume();
    }

    const now = chimeCtx.currentTime;
    const freqs = [739.99, 932.33, 1108.73, 1479.98];

    freqs.forEach((freq, idx) => {
      const osc = chimeCtx.createOscillator();
      const gain = chimeCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.04);

      gain.gain.setValueAtTime(0, now + idx * 0.04);
      gain.gain.linearRampToValueAtTime(0.06 / (idx + 1), now + idx * 0.04 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.04 + 0.85);

      osc.connect(gain);
      gain.connect(chimeCtx.destination);

      osc.start(now + idx * 0.04);
      osc.stop(now + idx * 0.04 + 0.9);
    });
  } catch {
    // Fail silently if audio blocked
  }
}
