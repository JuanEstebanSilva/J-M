import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Maximize2, X, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Section } from './ui.jsx';
import { COUPLE_PHOTOS } from '../data/photos.js';

export default function MomentsGallery() {
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [likes, setLikes] = useState({ 1: 12, 2: 24, 3: 18, 4: 30 });
  const [floatingHearts, setFloatingHearts] = useState([]);

  const handleLike = (e, id) => {
    e.stopPropagation();
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

    // Occasional tiny confetti
    confetti({
      particleCount: 25,
      spread: 45,
      origin: { y: 0.8 },
      colors: ['#c82360', '#f04080', '#ffd0e0'],
      scalar: 0.8,
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
      title="Momentos que no cambiaría por nada"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {COUPLE_PHOTOS.map((photo, index) => {
          return (
            <motion.div
              key={photo.id}
              className="relative group cursor-pointer"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ y: -8, scale: 1.02 }}
              onClick={() => setSelectedPhoto({ ...photo, index })}
            >
              {/* Polaroid-style glass card */}
              <div
                className="relative rounded-2xl overflow-hidden glass-card p-3 flex flex-col transition-all duration-500 group-hover:border-rose-500/40 group-hover:shadow-glow-wine"
                style={{
                  transform: `rotate(${photo.rotation}deg)`,
                  transition: 'transform 0.4s ease, border-color 0.4s ease, box-shadow 0.4s ease',
                }}
              >
                {/* Photo frame container */}
                <div className="relative aspect-[3/4] w-full rounded-xl overflow-hidden bg-black/40">
                  <img
                    src={photo.src}
                    alt={photo.alt}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                  />

                  {/* Soft romantic gradient overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-40 group-hover:opacity-60 transition-opacity" />

                  {/* Category badge */}
                  <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-full text-[11px] font-medium text-white/90 bg-black/50 backdrop-blur-md border border-white/10">
                    {photo.tag}
                  </div>

                  {/* Expand icon on hover */}
                  <div className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-black/50 backdrop-blur-md border border-white/10 flex items-center justify-center text-white/80 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Maximize2 size={13} />
                  </div>

                  {/* Floating heart animations */}
                  {floatingHearts
                    .filter((h) => h.photoId === photo.id)
                    .map((h) => (
                      <motion.div
                        key={h.id}
                        className="absolute bottom-12 right-6 pointer-events-none text-2xl select-none"
                        initial={{ opacity: 1, y: 0, scale: 0.8 }}
                        animate={{ opacity: 0, y: -60, scale: 1.4 }}
                        transition={{ duration: 1.1, ease: 'easeOut' }}
                      >
                        ❤️
                      </motion.div>
                    ))}
                </div>

                {/* Card footer description */}
                <div className="pt-3 px-1 pb-1 flex flex-col gap-1">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="font-display text-base font-semibold text-white/90 truncate">
                      {photo.caption}
                    </h4>
                    {/* Love reaction button */}
                    <button
                      onClick={(e) => handleLike(e, photo.id)}
                      className="flex items-center gap-1 text-xs text-rose-300 hover:text-rose-200 transition-colors py-1 px-2 rounded-full hover:bg-white/5"
                      title="Dejar un te amo"
                      aria-label="Reaccionar con amor"
                    >
                      <Heart size={14} className="fill-rose-500 text-rose-500 group-hover:scale-110 transition-transform" />
                      <span className="font-mono text-[11px] font-medium">{likes[photo.id] || 0}</span>
                    </button>
                  </div>
                  <p className="text-xs text-muted-soft line-clamp-2 leading-relaxed">
                    {photo.subtitle}
                  </p>
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
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl p-4 sm:p-6"
            onClick={() => setSelectedPhoto(null)}
          >
            {/* Modal Dialog Content */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative max-w-2xl w-full max-h-[90vh] flex flex-col rounded-3xl overflow-hidden glass-card border border-rose-500/30 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Top controls */}
              <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-auto">
                <span className="px-3 py-1 rounded-full text-xs font-medium text-white/90 bg-black/60 backdrop-blur-md border border-white/10 flex items-center gap-1.5">
                  <Sparkles size={12} className="text-rose-400" />
                  {selectedPhoto.tag}
                </span>
                <button
                  onClick={() => setSelectedPhoto(null)}
                  className="w-9 h-9 rounded-full bg-black/60 backdrop-blur-md border border-white/10 flex items-center justify-center text-white/90 hover:bg-white/20 transition-colors"
                  aria-label="Cerrar foto"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Main Photo */}
              <div className="relative flex-1 min-h-[350px] sm:min-h-[460px] bg-black/50 flex items-center justify-center overflow-hidden">
                <img
                  src={selectedPhoto.src}
                  alt={selectedPhoto.alt}
                  className="max-h-[68vh] w-auto max-w-full object-contain rounded-xl select-none"
                />

                {/* Left navigation arrow */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const prevIdx = (selectedPhoto.index - 1 + COUPLE_PHOTOS.length) % COUPLE_PHOTOS.length;
                    setSelectedPhoto({ ...COUPLE_PHOTOS[prevIdx], index: prevIdx });
                  }}
                  className="absolute left-3 w-10 h-10 rounded-full bg-black/50 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all hover:scale-110 active:scale-95"
                  aria-label="Foto anterior"
                >
                  <ChevronLeft size={20} />
                </button>

                {/* Right navigation arrow */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const nextIdx = (selectedPhoto.index + 1) % COUPLE_PHOTOS.length;
                    setSelectedPhoto({ ...COUPLE_PHOTOS[nextIdx], index: nextIdx });
                  }}
                  className="absolute right-3 w-10 h-10 rounded-full bg-black/50 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all hover:scale-110 active:scale-95"
                  aria-label="Foto siguiente"
                >
                  <ChevronRight size={20} />
                </button>
              </div>

              {/* Caption and interactive reaction in modal */}
              <div className="p-4 sm:p-5 bg-night/90 backdrop-blur-md border-t border-white/10 flex items-center justify-between gap-4">
                <div>
                  <h3 className="font-display text-lg font-semibold text-white">
                    {selectedPhoto.caption}
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-soft mt-0.5">
                    {selectedPhoto.subtitle}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={(e) => handleLike(e, selectedPhoto.id)}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium text-white shadow-glow-wine transition-all hover:scale-105 active:scale-95"
                    style={{ background: 'linear-gradient(135deg, #880b3a, #c82360)' }}
                  >
                    <Heart size={14} className="fill-white" />
                    <span>{likes[selectedPhoto.id] || 0}</span>
                  </button>
                  <span className="font-mono text-xs text-white/50">
                    {selectedPhoto.index + 1} / {COUPLE_PHOTOS.length}
                  </span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Section>
  );
}
