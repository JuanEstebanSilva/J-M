import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Music, Volume2, VolumeX, Sparkles } from 'lucide-react';
import { toggleBackgroundMusic, isMusicPlaying, playHeartChime } from '../utils/romanticAudio.js';

export default function AudioPlayerButton() {
  const [playing, setPlaying] = useState(false);
  const [hintVisible, setHintVisible] = useState(true);

  const handleToggle = () => {
    playHeartChime();
    const state = toggleBackgroundMusic();
    setPlaying(state);
    setHintVisible(false);
  };

  useEffect(() => {
    const timer = setTimeout(() => setHintVisible(false), 8000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3">
      {/* Floating hint tooltip */}
      <AnimatePresence>
        {hintVisible && !playing && (
          <motion.div
            initial={{ opacity: 0, x: 20, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs text-white/90 shadow-xl border border-wine-500/30"
            style={{
              background: 'linear-gradient(135deg, rgba(26,16,36,0.95), rgba(18,10,24,0.9))',
              backdropFilter: 'blur(12px)',
            }}
          >
            <Sparkles size={14} className="text-yellow-400 animate-spin" />
            <span>Dale play a nuestra melodía</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Music button */}
      <motion.button
        onClick={handleToggle}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.95 }}
        className="group relative flex items-center gap-2.5 px-4 py-3 rounded-full text-sm font-medium text-white transition-all shadow-glow-wine border"
        style={{
          background: playing
            ? 'linear-gradient(135deg, rgba(136,11,58,0.9), rgba(200,35,96,0.85), rgba(144,96,255,0.85))'
            : 'linear-gradient(135deg, rgba(30,20,45,0.85), rgba(18,12,30,0.85))',
          borderColor: playing ? 'rgba(255,255,255,0.3)' : 'rgba(200,35,96,0.3)',
          backdropFilter: 'blur(16px)',
        }}
        title={playing ? 'Pausar melodía' : 'Reproducir melodía romántica'}
      >
        {playing ? (
          <>
            <div className="flex items-end gap-0.5 h-4">
              <span className="w-1 bg-white rounded-full animate-bounce h-2" style={{ animationDelay: '0ms' }} />
              <span className="w-1 bg-white rounded-full animate-bounce h-4" style={{ animationDelay: '150ms' }} />
              <span className="w-1 bg-white rounded-full animate-bounce h-3" style={{ animationDelay: '300ms' }} />
              <span className="w-1 bg-white rounded-full animate-bounce h-4" style={{ animationDelay: '75ms' }} />
            </div>
            <span className="text-xs tracking-wide">Melodía Activa</span>
          </>
        ) : (
          <>
            <Music size={16} className="text-wine-300 group-hover:scale-110 transition-transform" />
            <span className="text-xs text-white/80 group-hover:text-white transition-colors">Melodía 🎵</span>
          </>
        )}
      </motion.button>
    </div>
  );
}
