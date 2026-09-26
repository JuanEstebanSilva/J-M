import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Disc,
  ListMusic,
  X,
  Volume2,
  VolumeX,
  Sparkles,
  Heart,
} from 'lucide-react';
import {
  toggleBackgroundMusic,
  switchTrack,
  playNextTrack,
  playPreviousTrack,
  subscribeToMusicState,
  playHeartChime,
  PLAYLIST,
} from '../utils/romanticAudio.js';

export default function AudioPlayerButton() {
  const [audioState, setAudioState] = useState({
    isPlaying: false,
    currentTrack: PLAYLIST[0],
    currentIndex: 0,
    totalTracks: PLAYLIST.length,
    playlist: PLAYLIST,
    volume: 0.28,
  });
  const [showPlaylist, setShowPlaylist] = useState(false);
  const [hintVisible, setHintVisible] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToMusicState((state) => {
      setAudioState(state);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setHintVisible(false), 8000);
    return () => clearTimeout(timer);
  }, []);

  const handleToggle = (e) => {
    e.stopPropagation();
    playHeartChime();
    toggleBackgroundMusic();
    setHintVisible(false);
  };

  const handleNext = (e) => {
    e.stopPropagation();
    playHeartChime();
    playNextTrack();
  };

  const handlePrev = (e) => {
    e.stopPropagation();
    playHeartChime();
    playPreviousTrack();
  };

  const handleSelectTrack = (trackId) => {
    playHeartChime();
    switchTrack(trackId);
    setShowPlaylist(false);
  };

  const current = audioState.currentTrack || PLAYLIST[0];
  const currentIndex = audioState.currentIndex >= 0 ? audioState.currentIndex : 0;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {/* Floating gentle hint */}
      <AnimatePresence>
        {hintVisible && !audioState.isPlaying && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs text-white/95 shadow-2xl border border-rose-500/30"
            style={{
              background: 'linear-gradient(135deg, rgba(28,14,38,0.96), rgba(16,10,24,0.92))',
              backdropFilter: 'blur(16px)',
            }}
          >
            <Sparkles size={14} className="text-pink-400 animate-spin" />
            <span>
              Música de fondo: <strong>{current.title} - {current.artist}</strong> 🎶
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Playlist Drawer Modal */}
      <AnimatePresence>
        {showPlaylist && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="w-80 max-w-[90vw] rounded-3xl p-4 shadow-2xl border border-rose-500/30 overflow-hidden mb-2"
            style={{
              background: 'linear-gradient(145deg, rgba(32, 16, 44, 0.98), rgba(18, 10, 26, 0.98))',
              backdropFilter: 'blur(24px)',
              boxShadow: '0 20px 50px rgba(0,0,0,0.7), 0 0 30px rgba(240,64,128,0.2)',
            }}
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-2">
              <div className="flex items-center gap-2">
                <ListMusic size={16} className="text-rose-400" />
                <span className="text-xs font-bold text-white tracking-wide uppercase">
                  Nuestra Playlist ({PLAYLIST.length} canciones)
                </span>
              </div>
              <button
                onClick={() => setShowPlaylist(false)}
                className="text-white/60 hover:text-white p-1 rounded-full hover:bg-white/10"
                aria-label="Cerrar playlist"
              >
                <X size={14} />
              </button>
            </div>

            <p className="text-[11px] text-white/50 mb-3 font-light">
              Reproducción continua activa: al terminar una canción sigue la siguiente automáticamente.
            </p>

            <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1 scrollbar-thin">
              {PLAYLIST.map((track, idx) => {
                const isSelected = track.id === current.id;
                return (
                  <button
                    key={track.id}
                    onClick={() => handleSelectTrack(track.id)}
                    className={`w-full flex items-center justify-between p-2.5 rounded-2xl text-left transition-all group ${
                      isSelected
                        ? 'bg-rose-500/25 border border-rose-400/50 text-white'
                        : 'hover:bg-white/[0.06] text-white/75 hover:text-white border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 pr-2">
                      <span className="font-mono text-[10px] text-white/40 w-4 text-center">
                        {idx + 1}
                      </span>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold truncate group-hover:text-rose-300 transition-colors">
                          {track.title}
                        </p>
                        <p className="text-[10px] text-white/50 truncate">
                          {track.artist}
                        </p>
                      </div>
                    </div>

                    <div className="flex-shrink-0 flex items-center gap-1.5">
                      {isSelected && audioState.isPlaying ? (
                        <div className="flex items-end gap-0.5 h-3">
                          <span className="w-0.5 bg-rose-400 rounded-full animate-bounce h-2" style={{ animationDelay: '0ms' }} />
                          <span className="w-0.5 bg-rose-400 rounded-full animate-bounce h-3" style={{ animationDelay: '150ms' }} />
                          <span className="w-0.5 bg-rose-400 rounded-full animate-bounce h-1.5" style={{ animationDelay: '300ms' }} />
                        </div>
                      ) : (
                        <span className="text-[10px] text-white/30 group-hover:text-rose-300">
                          ▶
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Floating Capsule Player */}
      <motion.div
        className="relative flex items-center gap-1 sm:gap-2 px-3 py-2 rounded-full border shadow-2xl transition-all"
        style={{
          background: audioState.isPlaying
            ? 'linear-gradient(135deg, rgba(38,16,50,0.95), rgba(20,12,32,0.97))'
            : 'linear-gradient(135deg, rgba(26,16,36,0.92), rgba(14,10,22,0.92))',
          borderColor: audioState.isPlaying ? 'rgba(240,64,128,0.5)' : 'rgba(255,255,255,0.18)',
          boxShadow: audioState.isPlaying
            ? '0 12px 35px rgba(200,35,96,0.38), 0 0 25px rgba(144,96,255,0.25)'
            : '0 8px 25px rgba(0,0,0,0.5)',
          backdropFilter: 'blur(20px)',
        }}
        whileHover={{ scale: 1.02 }}
      >
        {/* Vinyl / Disc icon with spinning animation */}
        <button
          onClick={handleToggle}
          className="flex items-center gap-2 text-white transition-all group"
          title={audioState.isPlaying ? 'Pausar música' : 'Reproducir música de fondo'}
        >
          <div className="relative w-8 h-8 flex items-center justify-center flex-shrink-0">
            <Disc
              size={26}
              className={`text-rose-400 transition-transform duration-700 ${
                audioState.isPlaying ? 'animate-[spin_4s_linear_infinite]' : 'group-hover:rotate-45'
              }`}
            />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className="w-2 h-2 rounded-full bg-white shadow-[0_0_6px_#fff]" />
            </div>
          </div>

          {/* Song - Artist Display as requested by the user */}
          <div className="flex flex-col text-left max-w-[150px] sm:max-w-[210px] min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-white tracking-wide truncate">
                {current.title}
              </span>
              <span className="text-[10px] text-white/50">-</span>
              <span className="text-[11px] text-pink-300/90 truncate font-medium">
                {current.artist}
              </span>
            </div>
            <div className="flex items-center gap-2 -mt-0.5">
              <span className="text-[10px] text-white/50 font-light truncate">
                {audioState.isPlaying ? 'Música de fondo' : 'Pausado'} · {currentIndex + 1}/{PLAYLIST.length}
              </span>
              {audioState.isPlaying && (
                <div className="flex items-end gap-0.5 h-2.5">
                  <span className="w-0.5 bg-rose-400 rounded-full animate-bounce h-2" style={{ animationDelay: '0ms' }} />
                  <span className="w-0.5 bg-rose-400 rounded-full animate-bounce h-2.5" style={{ animationDelay: '150ms' }} />
                  <span className="w-0.5 bg-rose-400 rounded-full animate-bounce h-1.5" style={{ animationDelay: '300ms' }} />
                </div>
              )}
            </div>
          </div>
        </button>

        {/* Previous Track button */}
        <button
          onClick={handlePrev}
          className="p-1.5 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-all active:scale-95"
          title="Canción anterior"
          aria-label="Canción anterior"
        >
          <SkipBack size={13} />
        </button>

        {/* Play / Pause button */}
        <button
          onClick={handleToggle}
          className="w-8 h-8 rounded-full flex items-center justify-center text-white bg-gradient-to-r from-rose-500 to-pink-500 hover:brightness-110 shadow-lg shadow-rose-500/30 transition-all hover:scale-105 active:scale-95 flex-shrink-0"
          aria-label={audioState.isPlaying ? 'Pausar' : 'Reproducir'}
        >
          {audioState.isPlaying ? (
            <Pause size={13} className="fill-white" />
          ) : (
            <Play size={13} className="fill-white ml-0.5" />
          )}
        </button>

        {/* Next Track button */}
        <button
          onClick={handleNext}
          className="p-1.5 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-all active:scale-95"
          title="Siguiente canción"
          aria-label="Siguiente canción"
        >
          <SkipForward size={13} />
        </button>

        {/* Open Playlist Drawer button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowPlaylist((prev) => !prev);
          }}
          className={`p-1.5 rounded-full transition-all ${
            showPlaylist
              ? 'bg-rose-500 text-white'
              : 'text-white/70 hover:text-white hover:bg-white/10'
          }`}
          title="Ver playlist de canciones"
          aria-label="Ver playlist"
        >
          <ListMusic size={14} />
        </button>
      </motion.div>
    </div>
  );
}
