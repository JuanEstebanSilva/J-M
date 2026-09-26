/**
 * Romantic Audio Controller
 * Manages background music with soft ambient volume, smooth fade-in/fade-out,
 * seamless playlist auto-queueing (next song plays automatically on track end),
 * and user gesture auto-unlock.
 */

import algoContigoUrl from '../data/music/Algo Contigo - Los panchos.mp3';
import enfermedadDeTiUrl from '../data/music/Enfermedad De Ti - Andres Cepeda.mp3';
import entreMiVidaYLaTuyaUrl from '../data/music/Entre mi vida y la tuya -Fonseca.mp3';
import laDistanciaUrl from '../data/music/La Distancia - Manuel Medrano.mp3';
import siTeAcuerdasDeMiUrl from '../data/music/Si te Acuerdas de Mi -Fonseca.mp3';
import tengoGanasUrl from '../data/music/Tengo Ganas - Andres Cepeda.mp3';
import unaYOtraVezUrl from '../data/music/Una y Otra Vez - Manuel Medrano .mp3';

export const PLAYLIST = [
  {
    id: 'laDistancia',
    title: 'La Distancia',
    artist: 'Manuel Medrano',
    url: laDistanciaUrl,
    filename: 'La Distancia - Manuel Medrano.mp3',
  },
  {
    id: 'tengoGanas',
    title: 'Tengo Ganas',
    artist: 'Andrés Cepeda',
    url: tengoGanasUrl,
    filename: 'Tengo Ganas - Andres Cepeda.mp3',
  },
  {
    id: 'algoContigo',
    title: 'Algo Contigo',
    artist: 'Los Panchos',
    url: algoContigoUrl,
    filename: 'Algo Contigo - Los panchos.mp3',
  },
  {
    id: 'entreMiVida',
    title: 'Entre mi vida y la tuya',
    artist: 'Fonseca',
    url: entreMiVidaYLaTuyaUrl,
    filename: 'Entre mi vida y la tuya -Fonseca.mp3',
  },
  {
    id: 'enfermedadDeTi',
    title: 'Enfermedad De Ti',
    artist: 'Andrés Cepeda',
    url: enfermedadDeTiUrl,
    filename: 'Enfermedad De Ti - Andres Cepeda.mp3',
  },
  {
    id: 'siTeAcuerdas',
    title: 'Si te Acuerdas de Mi',
    artist: 'Fonseca',
    url: siTeAcuerdasDeMiUrl,
    filename: 'Si te Acuerdas de Mi -Fonseca.mp3',
  },
  {
    id: 'unaYOtraVez',
    title: 'Una y Otra Vez',
    artist: 'Manuel Medrano',
    url: unaYOtraVezUrl,
    filename: 'Una y Otra Vez - Manuel Medrano .mp3',
  },
];

export const TRACKS = Object.fromEntries(PLAYLIST.map((t) => [t.id, t]));

const DEFAULT_VOLUME = 0.28; // Suave y envolvente de fondo

let currentTrackKey = 'laDistancia';
let audioElement = null;
let isPlaying = false;
let currentVolume = DEFAULT_VOLUME;
let listeners = new Set();
let unlockAttached = false;
let fadeInterval = null;

function notify() {
  const currentTrack = TRACKS[currentTrackKey] || PLAYLIST[0];
  const currentIndex = PLAYLIST.findIndex((t) => t.id === currentTrack.id);
  const state = {
    isPlaying,
    currentTrack,
    currentIndex: currentIndex >= 0 ? currentIndex : 0,
    totalTracks: PLAYLIST.length,
    playlist: PLAYLIST,
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
    audioElement.loop = false; // Continuously moves to next song when finished!
    audioElement.volume = currentVolume;
    audioElement.src = (TRACKS[currentTrackKey] || PLAYLIST[0]).url;

    audioElement.addEventListener('play', () => {
      isPlaying = true;
      notify();
    });

    audioElement.addEventListener('pause', () => {
      isPlaying = false;
      notify();
    });

    // Auto-advance to next song seamlessly as requested by the user
    audioElement.addEventListener('ended', () => {
      playNextTrack();
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
 * Starts background music with smooth fade-in
 */
export function startBackgroundMusic(trackKey) {
  const el = getAudioElement();
  if (!el) return Promise.resolve(false);

  if (trackKey && TRACKS[trackKey] && trackKey !== currentTrackKey) {
    currentTrackKey = trackKey;
    el.src = TRACKS[trackKey].url;
  }

  el.volume = 0.03; // Start quiet for smooth fade-in

  const playPromise = el.play();
  if (playPromise !== undefined) {
    return playPromise
      .then(() => {
        isPlaying = true;
        fadeTo(currentVolume, 1400);
        notify();
        return true;
      })
      .catch((err) => {
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

  fadeTo(0, 500, () => {
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
 * Advances to next track in playlist (or loops to start)
 */
export function playNextTrack() {
  const currentIndex = PLAYLIST.findIndex((t) => t.id === currentTrackKey);
  const nextIndex = (currentIndex + 1) % PLAYLIST.length;
  const nextTrack = PLAYLIST[nextIndex];
  return switchTrack(nextTrack.id);
}

/**
 * Moves to previous track in playlist
 */
export function playPreviousTrack() {
  const currentIndex = PLAYLIST.findIndex((t) => t.id === currentTrackKey);
  const prevIndex = (currentIndex - 1 + PLAYLIST.length) % PLAYLIST.length;
  const prevTrack = PLAYLIST[prevIndex];
  return switchTrack(prevTrack.id);
}

/**
 * Switches to a specific track
 */
export function switchTrack(trackKey) {
  const nextKey = trackKey || PLAYLIST[(PLAYLIST.findIndex((t) => t.id === currentTrackKey) + 1) % PLAYLIST.length]?.id;
  if (!TRACKS[nextKey]) return;

  const el = getAudioElement();
  if (!el) return;

  currentTrackKey = nextKey;
  el.src = TRACKS[nextKey].url;

  if (isPlaying) {
    el.play()
      .then(() => {
        fadeTo(currentVolume, 1000);
        notify();
      })
      .catch((e) => console.warn('Play switch error:', e));
  } else {
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
  return TRACKS[currentTrackKey] || PLAYLIST[0];
}

/**
 * Subscribe to audio state changes
 */
export function subscribeToMusicState(callback) {
  listeners.add(callback);
  callback({
    isPlaying,
    currentTrack: TRACKS[currentTrackKey] || PLAYLIST[0],
    currentIndex: PLAYLIST.findIndex((t) => t.id === currentTrackKey),
    totalTracks: PLAYLIST.length,
    playlist: PLAYLIST,
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
