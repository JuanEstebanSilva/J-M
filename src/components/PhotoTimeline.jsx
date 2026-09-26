import { useState, useEffect, useRef, useCallback } from 'react';
import {
  motion, AnimatePresence,
  useMotionValue, useTransform, useSpring,
} from 'framer-motion';
import {
  Heart, X, ChevronLeft, ChevronRight,
  Maximize2, Sparkles, MapPin, Camera,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { COUPLE_PHOTOS } from '../data/photos.js';
import { playHeartChime } from '../utils/romanticAudio.js';

/* ─── helpers ──────────────────────────────────────────────────────────────── */
const INIT_LIKES = Object.fromEntries(COUPLE_PHOTOS.map((p) => [p.id, 50 + p.id * 7]));

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 32 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { delay, duration: 0.75, ease: [0.16, 1, 0.3, 1] },
});

/* ─── 3-D tilt card ─────────────────────────────────────────────────────────── */
function TiltCard({ photo, index, onClick, likes, onLike, floatingHearts }) {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [8, -8]), { stiffness: 280, damping: 30 });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-8, 8]), { stiffness: 280, damping: 30 });

  const handleMouse = useCallback((e) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  }, [x, y]);

  const handleLeave = useCallback(() => {
    x.set(0);
    y.set(0);
  }, [x, y]);

  /* Masonry sizing: alternating heights */
  const isLarge = index === 0 || index === 3;
  const aspectClass = isLarge ? 'aspect-[3/4]' : 'aspect-[4/5]';

  return (
    <motion.div
      {...fadeUp(index * 0.1)}
      ref={ref}
      className={`relative group cursor-pointer ${isLarge ? 'row-span-2' : ''}`}
      onMouseMove={handleMouse}
      onMouseLeave={handleLeave}
      onClick={() => onClick({ ...photo, index })}
      style={{ perspective: 1000 }}
    >
      <motion.div
        style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
        className="relative rounded-3xl overflow-hidden shadow-2xl border border-white/[0.08]
          group-hover:border-rose-500/40 transition-colors duration-500"
      >
        {/* ── Photo ─────────────────────────────────────────────────── */}
        <div className={`relative ${aspectClass} overflow-hidden`}>
          <motion.img
            src={photo.src}
            alt={photo.alt}
            className="w-full h-full object-cover"
            loading={index < 2 ? 'eager' : 'lazy'}
            whileHover={{ scale: 1.07 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          />

          {/* Vignette */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent" />

          {/* Top-left badge */}
          <div className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold
            text-white bg-black/60 backdrop-blur-md border border-white/20">
            {photo.tag}
          </div>

          {/* Expand icon */}
          <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/55
            backdrop-blur-md border border-white/20 flex items-center justify-center
            text-white opacity-0 group-hover:opacity-100 transition-all group-hover:scale-110">
            <Maximize2 size={13} />
          </div>

          {/* Floating hearts */}
          {floatingHearts
            .filter((h) => h.photoId === photo.id)
            .map((h) => (
              <motion.div
                key={h.id}
                className="absolute bottom-14 right-5 pointer-events-none text-3xl select-none"
                initial={{ opacity: 1, y: 0, scale: 0.7 }}
                animate={{ opacity: 0, y: -90, scale: 1.8 }}
                transition={{ duration: 1.1, ease: 'easeOut' }}
              >
                💖
              </motion.div>
            ))}

          {/* Bottom caption */}
          <div className="absolute bottom-0 left-0 right-0 p-4 flex flex-col gap-1">
            <div className="flex items-end justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h3 className="font-display text-white text-base sm:text-lg font-bold leading-tight truncate">
                  {photo.caption}
                </h3>
                <p className="text-white/65 text-xs leading-snug line-clamp-1 font-light mt-0.5">
                  {photo.subtitle}
                </p>
              </div>

              {/* Like button */}
              <button
                onClick={(e) => { e.stopPropagation(); onLike(e, photo.id); }}
                className="shrink-0 flex items-center gap-1.5 text-xs text-rose-300
                  hover:text-white transition-all py-1.5 px-3 rounded-full
                  bg-rose-500/20 hover:bg-rose-500/40 border border-rose-500/30
                  backdrop-blur-sm active:scale-90"
                aria-label="Reaccionar con amor"
              >
                <Heart size={13} className="fill-rose-500 text-rose-500" />
                <span className="font-mono font-bold">{likes[photo.id] || 0}</span>
              </button>
            </div>

            {photo.location && (
              <div className="flex items-center gap-1 text-[11px] text-rose-300/80 font-medium">
                <MapPin size={10} />
                <span>{photo.location}</span>
              </div>
            )}
          </div>
        </div>

        {/* 3-D shine layer */}
        <motion.div
          className="absolute inset-0 pointer-events-none rounded-3xl"
          style={{
            background: useTransform(
              [x, y],
              ([lx, ly]) =>
                `radial-gradient(circle at ${(lx + 0.5) * 100}% ${(ly + 0.5) * 100}%, rgba(255,255,255,0.12) 0%, transparent 65%)`,
            ),
          }}
        />
      </motion.div>
    </motion.div>
  );
}

/* ─── Immersive Lightbox ──────────────────────────────────────────────────── */
function Lightbox({ photo, likes, onLike, onClose, onNext, onPrev, total }) {
  if (!photo) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/95
        backdrop-blur-3xl p-4 sm:p-8"
      onClick={onClose}
    >
      {/* Ambient color glow based on photo order */}
      <div
        className="absolute inset-0 pointer-events-none opacity-30"
        style={{
          background: `radial-gradient(ellipse at 50% 80%, rgba(200,35,96,0.3), transparent 65%)`,
        }}
      />

      <motion.div
        initial={{ scale: 0.88, opacity: 0, y: 24 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.88, opacity: 0, y: 24 }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        className="relative w-full max-w-4xl flex flex-col lg:flex-row rounded-3xl overflow-hidden
          border border-white/10 shadow-2xl"
        style={{ background: 'rgba(12,8,22,0.97)', maxHeight: '92vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Left: photo ─────────────────────── */}
        <div className="relative flex-1 min-h-[55vw] lg:min-h-0 bg-black flex items-center justify-center overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.img
              key={photo.id}
              src={photo.src}
              alt={photo.alt}
              className="max-h-[65vh] lg:max-h-[82vh] w-auto max-w-full object-contain select-none"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.35 }}
            />
          </AnimatePresence>

          {/* Nav arrows */}
          {[
            { dir: 'prev', icon: ChevronLeft, pos: 'left-3', action: onPrev },
            { dir: 'next', icon: ChevronRight, pos: 'right-3', action: onNext },
          ].map(({ dir, icon: Icon, pos, action }) => (
            <button
              key={dir}
              onClick={(e) => { e.stopPropagation(); action(); }}
              className={`absolute ${pos} top-1/2 -translate-y-1/2 w-11 h-11 rounded-full
                bg-black/60 backdrop-blur-md border border-white/20 flex items-center
                justify-center text-white hover:bg-white/20 transition-all hover:scale-110
                active:scale-90 shadow-xl`}
              aria-label={dir}
            >
              <Icon size={22} />
            </button>
          ))}

          {/* Counter pill */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full
            bg-black/70 backdrop-blur-md border border-white/15 text-xs text-white/70 font-mono">
            {photo.index + 1} / {total}
          </div>
        </div>

        {/* ── Right: info panel ───────────────── */}
        <div className="w-full lg:w-72 p-6 flex flex-col gap-5 border-t lg:border-t-0 lg:border-l border-white/[0.08]
          overflow-y-auto" style={{ background: 'rgba(18,12,30,0.98)' }}>
          {/* Close + tag */}
          <div className="flex items-start justify-between gap-3">
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold
              text-white bg-white/[0.08] border border-white/15">
              <Sparkles size={12} className="text-yellow-400" />
              {photo.tag}
            </span>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-white/[0.06] border border-white/15 flex
                items-center justify-center text-white hover:bg-white/15 transition-all
                hover:scale-105 active:scale-90 shrink-0"
              aria-label="Cerrar"
            >
              <X size={18} />
            </button>
          </div>

          {/* Caption */}
          <div>
            <AnimatePresence mode="wait">
              <motion.h3
                key={`caption-${photo.id}`}
                className="font-display text-2xl font-bold text-white leading-tight"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3 }}
              >
                {photo.caption}
              </motion.h3>
            </AnimatePresence>
            <p className="text-sm text-white/60 font-light mt-2 leading-relaxed">
              {photo.subtitle}
            </p>
            {photo.location && (
              <div className="flex items-center gap-1.5 mt-2 text-xs text-rose-300 font-medium">
                <MapPin size={12} />
                {photo.location}
              </div>
            )}
          </div>

          {/* Story */}
          {photo.story && (
            <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/[0.08]">
              <p className="text-sm text-white/80 italic font-serif leading-relaxed">
                &ldquo;{photo.story}&rdquo;
              </p>
            </div>
          )}

          {/* Alt description */}
          <div className="p-3 rounded-2xl bg-rose-500/[0.07] border border-rose-500/15">
            <div className="flex items-center gap-2 mb-1.5">
              <Camera size={13} className="text-rose-400" />
              <span className="text-xs font-semibold text-rose-300">El momento</span>
            </div>
            <p className="text-xs text-white/70 leading-relaxed">{photo.alt}</p>
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Love button */}
          <button
            onClick={(e) => onLike(e, photo.id)}
            className="w-full py-3 rounded-2xl font-semibold text-sm text-white
              transition-all hover:scale-[1.02] active:scale-95 hover:brightness-110
              flex items-center justify-center gap-2 shadow-lg"
            style={{ background: 'linear-gradient(135deg, #880b3a, #c82360, #f04080)' }}
          >
            <Heart size={16} className="fill-white" />
            <span>{likes[photo.id] || 0} Te amos</span>
          </button>

          <p className="text-[10px] text-white/35 text-center tracking-wider">
            Flechas ← → para navegar · Esc para cerrar
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ─── Main Export ─────────────────────────────────────────────────────────── */
export default function PhotoTimeline() {
  const [selected, setSelected] = useState(null);
  const [likes, setLikes] = useState(INIT_LIKES);
  const [floatingHearts, setFloatingHearts] = useState([]);

  const handleLike = useCallback((e, id) => {
    e?.stopPropagation?.();
    playHeartChime();
    setLikes((prev) => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
    const heart = { id: Date.now() + Math.random(), photoId: id };
    setFloatingHearts((prev) => [...prev, heart]);
    setTimeout(() => setFloatingHearts((prev) => prev.filter((h) => h.id !== heart.id)), 1300);
    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.72 },
      colors: ['#c82360', '#f04080', '#ffd966', '#ff80ad', '#9060ff'],
      scalar: 0.9,
    });
  }, []);

  const navigate = useCallback((dir) => {
    setSelected((prev) => {
      if (!prev) return null;
      const next = (prev.index + dir + COUPLE_PHOTOS.length) % COUPLE_PHOTOS.length;
      return { ...COUPLE_PHOTOS[next], index: next };
    });
  }, []);

  /* Keyboard navigation */
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') setSelected(null);
    if (e.key === 'ArrowRight') navigate(1);
    if (e.key === 'ArrowLeft') navigate(-1);
  }, [navigate]);

  // attach/detach key listener
  useEffect(() => {
    if (selected) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [selected, handleKeyDown]);

  return (
    <section id="gallery" className="py-20 relative">
      {/* Ambient glows */}
      <div className="absolute top-1/3 -left-32 w-96 h-96 rounded-full blur-[120px] opacity-[0.07]
        pointer-events-none"
        style={{ background: 'radial-gradient(circle, #c82360, transparent 70%)' }} />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 rounded-full blur-[120px] opacity-[0.07]
        pointer-events-none"
        style={{ background: 'radial-gradient(circle, #9060ff, transparent 70%)' }} />

      {/* ── Section header ──────────────────── */}
      <div className="text-center mb-14">
        <motion.div {...fadeUp(0)} className="mb-3">
          <span className="section-label tracking-[0.3em] text-xs sm:text-sm font-semibold py-1.5 px-4">
            ✦ GALERIA DE RECUERDOS ✦
          </span>
        </motion.div>
        <motion.h2
          {...fadeUp(0.08)}
          className="font-display text-3xl sm:text-5xl md:text-6xl font-black gradient-text tracking-tight mb-4"
        >
          Momentos que no cambiaría por nada
        </motion.h2>
        <motion.p {...fadeUp(0.14)} className="text-base sm:text-xl text-white/65 max-w-2xl mx-auto font-light">
          Cada foto guarda una historia. Pasa el cursor para vivirla.
        </motion.p>
      </div>

      {/* ── Masonry grid ────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {COUPLE_PHOTOS.map((photo, index) => (
          <TiltCard
            key={photo.id}
            photo={photo}
            index={index}
            onClick={setSelected}
            likes={likes}
            onLike={handleLike}
            floatingHearts={floatingHearts}
          />
        ))}
      </div>

      {/* ── Filmstrip thumbnails ─────────────── */}
      <motion.div
        {...fadeUp(0.4)}
        className="mt-10 flex justify-center"
      >
        <div className="flex items-center gap-2 p-2 rounded-2xl border border-white/[0.08]"
          style={{ background: 'rgba(18,12,30,0.7)', backdropFilter: 'blur(16px)' }}>
          {COUPLE_PHOTOS.map((photo, i) => (
            <button
              key={photo.id}
              onClick={() => setSelected({ ...photo, index: i })}
              className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden
                border-2 transition-all duration-300 hover:scale-105
                ${selected?.id === photo.id
                  ? 'border-rose-500 shadow-lg shadow-rose-500/30 scale-105'
                  : 'border-white/15 hover:border-rose-400/40'}`}
              aria-label={photo.caption}
            >
              <img
                src={photo.src}
                alt={photo.alt}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      </motion.div>

      {/* ── Lightbox ─────────────────────────── */}
      <AnimatePresence>
        {selected && (
          <Lightbox
            photo={selected}
            likes={likes}
            onLike={handleLike}
            onClose={() => setSelected(null)}
            onNext={() => navigate(1)}
            onPrev={() => navigate(-1)}
            total={COUPLE_PHOTOS.length}
          />
        )}
      </AnimatePresence>
    </section>
  );
}
