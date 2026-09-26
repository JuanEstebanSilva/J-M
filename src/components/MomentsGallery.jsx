import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Maximize2, X, ChevronLeft, ChevronRight, Sparkles, MapPin } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Section } from './ui.jsx';
import { COUPLE_PHOTOS } from '../data/photos.js';
import { playHeartChime } from '../utils/romanticAudio.js';

export default function MomentsGallery() {
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [likes, setLikes] = useState(() => Object.fromEntries(COUPLE_PHOTOS.map((p) => [p.id, 50 + (p.id * 7) % 45])));
  const [floatingHearts, setFloatingHearts] = useState([]);

  const handleLike = (e, id) => {
    e.stopPropagation();
    playHeartChime();
    setLikes((prev) => ({ ...prev, [id]: (prev[id] || 0) + 1 }));

    // Add floating heart
    const newHeart = {
      id: Date.now() + Math.random(),
      photoId: id,
    };
    setFloatingHearts((prev) => [...prev, newHeart]);
    setTimeout(() => {
      setFloatingHearts((prev) => prev.filter((h) => h.id !== newHeart.id));
    }, 1200);

    // Cute mini confetti burst
    confetti({
      particleCount: 35,
      spread: 55,
      origin: { y: 0.75 },
      colors: ['#c82360', '#f04080', '#ffd966', '#ff80ad'],
      scalar: 0.9,
    });
  };

  // Keyboard controls for lightbox
  useEffect(() => {
    if (!selectedPhoto) return;
    const handleKey = (e) => {
      if (e.key === 'Escape') setSelectedPhoto(null);
      if (e.key === 'ArrowRight') {
        const nextIdx = (selectedPhoto.index + 1) % COUPLE_PHOTOS.length;
        setSelectedPhoto({ ...COUPLE_PHOTOS[nextIdx], index: nextIdx });
      }
      if (e.key === 'ArrowLeft') {
        const prevIdx = (selectedPhoto.index - 1 + COUPLE_PHOTOS.length) % COUPLE_PHOTOS.length;
        setSelectedPhoto({ ...COUPLE_PHOTOS[prevIdx], index: prevIdx });
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [selectedPhoto]);

  return (
    <Section
      id="moments"
      label="✦ Nuestra Galería de Recuerdos ✦"
      title="Momentos que no cambiaría por nada en el mundo"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {COUPLE_PHOTOS.map((photo, index) => {
          return (
            <motion.div
              key={photo.id}
              className="relative group cursor-pointer"
              initial={{ opacity: 0, y: 35 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.12, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ y: -10, scale: 1.03 }}
              onClick={() => setSelectedPhoto({ ...photo, index })}
            >
              {/* Polaroid-style realistic photo card with tape */}
              <div
                className="relative rounded-3xl overflow-visible p-4 flex flex-col transition-all duration-500 shadow-2xl border border-white/10 group-hover:border-rose-400/50"
                style={{
                  background: 'linear-gradient(145deg, rgba(32, 24, 44, 0.95), rgba(18, 14, 26, 0.95))',
                  backdropFilter: 'blur(20px)',
                  transform: `rotate(${photo.rotation}deg)`,
                  boxShadow: '0 16px 40px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.1)',
                }}
              >
                {/* Vintage Washi Tape Top Decoration */}
                <div className="washi-tape" />

                {/* Photo frame container */}
                <div className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden bg-black/60 shadow-inner">
                  <img
                    src={photo.src}
                    alt={photo.alt}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-108"
                    loading="lazy"
                  />

                  {/* Romantic gradient vignette */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

                  {/* Category badge */}
                  <div className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold text-white bg-black/60 backdrop-blur-md border border-white/20 shadow-md">
                    {photo.tag}
                  </div>

                  {/* Expand icon on hover */}
                  <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 backdrop-blur-md border border-white/20 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all group-hover:scale-110 shadow-md">
                    <Maximize2 size={14} />
                  </div>

                  {/* Floating heart animations */}
                  {floatingHearts
                    .filter((h) => h.photoId === photo.id)
                    .map((h) => (
                      <motion.div
                        key={h.id}
                        className="absolute bottom-12 right-6 pointer-events-none text-3xl select-none"
                        initial={{ opacity: 1, y: 0, scale: 0.8 }}
                        animate={{ opacity: 0, y: -80, scale: 1.6 }}
                        transition={{ duration: 1.1, ease: 'easeOut' }}
                      >
                        💖
                      </motion.div>
                    ))}
                </div>

                {/* Card footer description with larger typography */}
                <div className="pt-4 px-1 pb-1 flex flex-col gap-2">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="font-display text-lg font-bold text-white tracking-tight truncate">
                      {photo.caption}
                    </h4>

                    {/* Love reaction button */}
                    <button
                      onClick={(e) => handleLike(e, photo.id)}
                      className="flex items-center gap-1.5 text-xs text-rose-300 hover:text-white transition-all py-1.5 px-3 rounded-full bg-rose-500/15 hover:bg-rose-500/30 border border-rose-500/30 active:scale-90"
                      title="Dejar un te amo"
                      aria-label="Reaccionar con amor"
                    >
                      <Heart size={14} className="fill-rose-500 text-rose-500 group-hover:scale-125 transition-transform" />
                      <span className="font-mono text-xs font-bold">{likes[photo.id] || 0}</span>
                    </button>
                  </div>

                  <p className="text-xs sm:text-sm text-white/75 line-clamp-2 leading-relaxed font-light">
                    {photo.subtitle}
                  </p>

                  {photo.location && (
                    <div className="flex items-center gap-1 text-[11px] text-rose-300/80 font-medium">
                      <MapPin size={11} className="text-rose-400" />
                      <span>{photo.location}</span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Fullscreen Lightbox Modal */}
      <AnimatePresence>
        {selectedPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/92 backdrop-blur-2xl p-4 sm:p-6"
            onClick={() => setSelectedPhoto(null)}
          >
            {/* Modal Dialog Content */}
            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 26, stiffness: 320 }}
              className="relative max-w-3xl w-full max-h-[92vh] flex flex-col rounded-3xl overflow-hidden glass-card border border-rose-500/40 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Top controls */}
              <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-auto">
                <span className="px-3.5 py-1.5 rounded-full text-xs font-semibold text-white bg-black/70 backdrop-blur-md border border-white/20 flex items-center gap-1.5 shadow-lg">
                  <Sparkles size={14} className="text-yellow-400" />
                  {selectedPhoto.tag}
                </span>
                <button
                  onClick={() => setSelectedPhoto(null)}
                  className="w-10 h-10 rounded-full bg-black/70 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all hover:scale-105 active:scale-95 shadow-lg"
                  aria-label="Cerrar foto"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Main Photo Area */}
              <div className="relative flex-1 min-h-[380px] sm:min-h-[500px] bg-black/70 flex items-center justify-center overflow-hidden p-2">
                <img
                  src={selectedPhoto.src}
                  alt={selectedPhoto.alt}
                  className="max-h-[66vh] w-auto max-w-full object-contain rounded-2xl select-none shadow-2xl"
                />

                {/* Left navigation arrow */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const prevIdx = (selectedPhoto.index - 1 + COUPLE_PHOTOS.length) % COUPLE_PHOTOS.length;
                    setSelectedPhoto({ ...COUPLE_PHOTOS[prevIdx], index: prevIdx });
                  }}
                  className="absolute left-4 w-12 h-12 rounded-full bg-black/60 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white/25 transition-all hover:scale-110 active:scale-95 shadow-xl"
                  aria-label="Foto anterior"
                >
                  <ChevronLeft size={24} />
                </button>

                {/* Right navigation arrow */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const nextIdx = (selectedPhoto.index + 1) % COUPLE_PHOTOS.length;
                    setSelectedPhoto({ ...COUPLE_PHOTOS[nextIdx], index: nextIdx });
                  }}
                  className="absolute right-4 w-12 h-12 rounded-full bg-black/60 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white/25 transition-all hover:scale-110 active:scale-95 shadow-xl"
                  aria-label="Foto siguiente"
                >
                  <ChevronRight size={24} />
                </button>
              </div>

              {/* Caption and interactive story in modal */}
              <div className="p-6 bg-night/95 backdrop-blur-xl border-t border-white/10 flex flex-col gap-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="font-display text-2xl font-bold text-white">
                      {selectedPhoto.caption}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      {selectedPhoto.location && (
                        <span className="text-xs text-rose-300 font-medium flex items-center gap-1">
                          <MapPin size={12} />
                          {selectedPhoto.location}
                        </span>
                      )}
                      <span className="text-white/40 text-xs">·</span>
                      <span className="text-xs text-white/60 font-light">
                        {selectedPhoto.subtitle}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <button
                      onClick={(e) => handleLike(e, selectedPhoto.id)}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold text-white shadow-glow-wine transition-all hover:scale-105 active:scale-95"
                      style={{ background: 'linear-gradient(135deg, #880b3a, #c82360, #9060ff)' }}
                    >
                      <Heart size={16} className="fill-white" />
                      <span>{likes[selectedPhoto.id] || 0} Te amo</span>
                    </button>
                    <span className="font-mono text-sm text-white/60 font-medium">
                      {selectedPhoto.index + 1} de {COUPLE_PHOTOS.length}
                    </span>
                  </div>
                </div>

                {/* Extended heartfelt story */}
                {selectedPhoto.story && (
                  <p className="text-sm sm:text-base text-white/90 italic font-serif leading-relaxed pt-2 border-t border-white/10">
                    "{selectedPhoto.story}"
                  </p>
                )}

                <p className="text-[11px] text-white/40 text-center tracking-wider pt-1">
                  Usa las flechas ← y → del teclado para navegar · Esc para cerrar
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Section>
  );
}
