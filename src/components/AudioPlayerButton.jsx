import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Music, Play, Pause, SkipForward, Volume2, VolumeX, Sparkles, Disc } from 'lucide-react';
import {
  toggleBackgroundMusic,
  switchTrack,
  subscribeToMusicState,
  playHeartChime,
  setMusicVolume,
  getMusicVolume,
} from '../utils/romanticAudio.js';

export default function AudioPlayerButton() {
  const [audioState, setAudioState] = useState({
    isPlaying: false,
    currentTrack: { id: 'laDistancia', title: 'La Distancia', artist: 'Nuestra Melodía' },
    volume: 0.28,
  });
  const [expanded, setExpanded] = useState(false);
  const [hintVisible, setHintVisible] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToMusicState((state) => {
      setAudioState(state);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setHintVisible(false), 9000);
    return () => clearTimeout(timer);
  }, []);

  const handleToggle = (e) => {
    e.stopPropagation();
    playHeartChime();
    toggleBackgroundMusic();
    setHintVisible(false);
  };

  const handleSwitch = (e) => {
    e.stopPropagation();
    playHeartChime();
    switchTrack();
  };

  const isLaDistancia = audioState.currentTrack.id === 'laDistancia';

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3">
      {/* Floating gentle hint */}
      <AnimatePresence>
        {hintVisible && !audioState.isPlaying && (
          <motion.div
            initial={{ opacity: 0, x: 20, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs text-white/90 shadow-2xl border border-rose-500/30"
            style={{
              background: 'linear-gradient(135deg, rgba(28,14,38,0.96), rgba(16,10,24,0.92))',
              backdropFilter: 'blur(16px)',
            }}
          >
            <Sparkles size={14} className="text-pink-400 animate-spin" />
            <span>Escucha <strong>La Distancia</strong> de fondo 🎶</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Music Player Capsule */}
      <motion.div
        className="relative flex items-center rounded-full border shadow-2xl transition-all"
        style={{
          background: audioState.isPlaying
            ? 'linear-gradient(135deg, rgba(38,16,50,0.92), rgba(20,12,32,0.95))'
            : 'linear-gradient(135deg, rgba(26,16,36,0.85), rgba(14,10,22,0.85))',
          borderColor: audioState.isPlaying ? 'rgba(240,64,128,0.45)' : 'rgba(255,255,255,0.15)',
          boxShadow: audioState.isPlaying
            ? '0 12px 35px rgba(200,35,96,0.35), 0 0 25px rgba(144,96,255,0.2)'
            : '0 8px 25px rgba(0,0,0,0.4)',
          backdropFilter: 'blur(20px)',
        }}
        whileHover={{ scale: 1.03 }}
      >
        {/* Vinyl / Disc icon with spinning animation */}
        <button
          onClick={handleToggle}
          className="flex items-center gap-2.5 pl-3.5 pr-2.5 py-2.5 text-white transition-all group"
          title={audioState.isPlaying ? 'Pausar música' : 'Reproducir música de fondo'}
        >
          <div className="relative w-7 h-7 flex items-center justify-center">
            <Disc
              size={22}
              className={`text-rose-400 transition-transform duration-700 ${
                audioState.isPlaying ? 'animate-[spin_4s_linear_infinite]' : 'group-hover:rotate-45'
              }`}
            />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className="w-1.5 h-1.5 rounded-full bg-white" />
            </div>
          </div>

          <div className="flex flex-col text-left">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-white tracking-wide">
                {audioState.currentTrack.title}
              </span>
              {audioState.isPlaying && (
                <div className="flex items-end gap-0.5 h-3">
                  <span className="w-0.5 bg-rose-400 rounded-full animate-bounce h-2" style={{ animationDelay: '0ms' }} />
                  <span className="w-0.5 bg-rose-400 rounded-full animate-bounce h-3" style={{ animationDelay: '150ms' }} />
                  <span className="w-0.5 bg-rose-400 rounded-full animate-bounce h-1.5" style={{ animationDelay: '300ms' }} />
                </div>
              )}
            </div>
            <span className="text-[10px] text-white/50 font-light -mt-0.5">
              {audioState.isPlaying ? 'Música suave de fondo' : 'Pausado'}
            </span>
          </div>
        </button>

        {/* Play / Pause button */}
        <button
          onClick={handleToggle}
          className="w-8 h-8 rounded-full flex items-center justify-center text-white bg-white/10 hover:bg-rose-500/30 transition-all hover:scale-105 active:scale-95 mx-1"
          aria-label={audioState.isPlaying ? 'Pausar' : 'Reproducir'}
        >
          {audioState.isPlaying ? <Pause size={13} className="fill-white" /> : <Play size={13} className="fill-white ml-0.5" />}
        </button>

        {/* Track switch button (La Distancia <-> Tengo Ganas) */}
        <button
          onClick={handleSwitch}
          className="flex items-center gap-1 pl-2 pr-3.5 py-2 text-[11px] text-white/60 hover:text-white transition-colors group/next"
          title={`Cambiar a: ${isLaDistancia ? 'Tengo Ganas' : 'La Distancia'}`}
        >
          <SkipForward size={13} className="text-rose-400/80 group-hover/next:scale-110 group-hover/next:text-rose-300 transition-all" />
          <span className="hidden md:inline font-mono text-[10px] text-white/50 group-hover/next:text-white/80">
            {isLaDistancia ? 'Tengo Ganas' : 'La Distancia'}
          </span>
        </button>
      </motion.div>
    </div>
  );
}
