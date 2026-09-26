import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Heart, Pause, Play } from 'lucide-react';
import confetti from 'canvas-confetti';

const SLIDE_DURATION = 5000; // ms per slide

function ProgressBar({ total, current, isPlaying, duration }) {
  return (
    <div className="flex gap-1 w-full">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className="flex-1 h-1 rounded-full bg-white/30 overflow-hidden">
          {i < current && (
            <div className="h-full w-full bg-white/80 rounded-full" />
          )}
          {i === current && isPlaying && (
            <motion.div
              className="h-full bg-white/80 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ duration: duration / 1000, ease: 'linear' }}
            />
          )}
          {i === current && !isPlaying && (
            <div className="h-full bg-white/60 rounded-full" style={{ width: '50%' }} />
          )}
        </div>
      ))}
    </div>
  );
}

function buildSlides(analytics) {
  const {
    participants, totalMessages, totalWords, daysTogether,
    perAuthor, busiestDay, loveKeywords, dayOfWeekActivity,
    hourlyActivity, monthlyTimeline,
  } = analytics;

  const p1 = participants[0];
  const p2 = participants[1];
  const p1Data = perAuthor[p1] || {};
  const p2Data = perAuthor[p2] || {};

  const biggestsender = p1Data.messageCount >= p2Data.messageCount ? p1 : p2;
  const peakHour = hourlyActivity.indexOf(Math.max(...hourlyActivity));
  const peakDay = [...dayOfWeekActivity].sort((a, b) => b.count - a.count)[0]?.day;
  const topLove = Object.entries(loveKeywords).sort(([, a], [, b]) => b - a)[0];
  const peakMonth = monthlyTimeline.sort((a, b) => b.total - a.total)[0];
  const p1TopEmoji = p1Data.topEmojis?.[0]?.key || '❤️';
  const p2TopEmoji = p2Data.topEmojis?.[0]?.key || '🥰';
  const busiestDate = busiestDay?.date?.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
  const years = Math.floor(daysTogether / 365);

  return [
    // Slide 1: Opening
    {
      id: 'opening',
      bg: 'from-blossom-plum via-blossom-burgundy to-blossom-wine',
      content: (
        <div className="flex flex-col items-center justify-center h-full text-center px-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
            className="text-8xl mb-6"
          >
            ❤️
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="font-display text-5xl text-white font-bold mb-4 leading-tight"
          >
            Nuestro año
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="font-display italic text-3xl text-white/80 mb-6"
          >
            en mensajes
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="flex items-center gap-3 text-white/60 font-sans text-lg"
          >
            <span>{p1}</span>
            <span className="text-blossom-rose">🌸</span>
            <span>{p2}</span>
          </motion.div>
        </div>
      ),
    },
    // Slide 2: Days together
    {
      id: 'days',
      bg: 'from-blossom-wine via-blossom-mauve to-blossom-rose',
      content: (
        <div className="flex flex-col items-center justify-center h-full text-center px-8">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="font-sans text-white/70 text-sm uppercase tracking-widest mb-4"
          >
            Llevan juntos
          </motion.p>
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 150, delay: 0.3 }}
            className="font-display text-9xl font-bold text-white leading-none mb-2"
          >
            {daysTogether.toLocaleString('es-ES')}
          </motion.div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="font-display italic text-4xl text-white/80 mb-6"
          >
            días 🌹
          </motion.p>
          {years > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="bg-white/20 backdrop-blur-sm rounded-2xl px-6 py-3"
            >
              <p className="font-sans text-white text-base">
                {years} año{years > 1 ? 's' : ''} de historia juntos
              </p>
            </motion.div>
          )}
        </div>
      ),
    },
    // Slide 3: Total messages
    {
      id: 'messages',
      bg: 'from-blossom-burgundy to-blossom-plum',
      content: (
        <div className="flex flex-col items-center justify-center h-full text-center px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-6xl mb-6"
          >
            💌
          </motion.div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="font-sans text-white/70 text-sm uppercase tracking-widest mb-2"
          >
            Se enviaron
          </motion.p>
          <motion.div
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 120, delay: 0.4 }}
            className="font-display text-8xl font-bold text-white leading-none mb-2"
          >
            {totalMessages.toLocaleString('es-ES')}
          </motion.div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="font-display italic text-3xl text-blossom-rose mb-6"
          >
            mensajes
          </motion.p>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="font-sans text-white/50 text-base"
          >
            y {totalWords.toLocaleString('es-ES')} palabras de amor
          </motion.p>
        </div>
      ),
    },
    // Slide 4: Who talks more
    {
      id: 'talker',
      bg: 'from-blossom-mauve via-blossom-rose to-blossom-peach',
      content: (
        <div className="flex flex-col items-center justify-center h-full text-center px-8">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="font-sans text-white/70 text-sm uppercase tracking-widest mb-8"
          >
            El más hablador
          </motion.p>

          <div className="flex items-end justify-center gap-8 mb-8 w-full max-w-xs">
            {participants.map((p, i) => {
              const count = perAuthor[p]?.messageCount || 0;
              const max = Math.max(p1Data.messageCount, p2Data.messageCount);
              const heightPct = 30 + Math.round((count / max) * 70);
              const isWinner = p === biggestsender;
              return (
                <motion.div
                  key={p}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: `${heightPct * 1.5}px`, opacity: 1 }}
                  transition={{ delay: 0.3 + i * 0.15, duration: 0.8, ease: 'easeOut' }}
                  className="flex flex-col items-center justify-end"
                >
                  {isWinner && (
                    <span className="text-3xl mb-2">👑</span>
                  )}
                  <div
                    className={`w-20 rounded-t-2xl flex items-end justify-center pb-3 ${
                      isWinner
                        ? 'bg-white/40 border-2 border-white/60'
                        : 'bg-white/20'
                    }`}
                    style={{ height: `${heightPct * 1.5}px` }}
                  >
                    <div className="text-center">
                      <p className="font-display text-2xl font-bold text-white">
                        {perAuthor[p]?.percentage}%
                      </p>
                      <p className="font-sans text-white/80 text-xs">{p}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="font-display italic text-white text-2xl"
          >
            {biggestsender} llena la conversación 💬
          </motion.p>
        </div>
      ),
    },
    // Slide 5: Love keywords
    {
      id: 'love-words',
      bg: 'from-blossom-plum via-blossom-wine to-blossom-burgundy',
      content: (
        <div className="flex flex-col items-center justify-center h-full text-center px-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
            className="text-7xl mb-6"
          >
            {topLove?.[0] || '❤️'}
          </motion.div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="font-sans text-white/70 text-sm uppercase tracking-widest mb-2"
          >
            Dijeron
          </motion.p>
          <motion.div
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.4 }}
            className="font-display text-8xl font-bold text-white mb-2"
          >
            {(topLove?.[1] || 0).toLocaleString('es-ES')}
          </motion.div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="font-display italic text-2xl text-blossom-rose mb-8"
          >
            veces "{topLove?.[0]}"
          </motion.p>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="flex flex-wrap justify-center gap-3"
          >
            {Object.entries(loveKeywords)
              .filter(([, v]) => v > 0)
              .sort(([, a], [, b]) => b - a)
              .slice(0, 6)
              .map(([label, count]) => (
                <span key={label} className="bg-white/20 rounded-full px-4 py-2 font-sans text-white text-sm">
                  "{label}" × {count}
                </span>
              ))
            }
          </motion.div>
        </div>
      ),
    },
    // Slide 6: Peak time
    {
      id: 'peak-time',
      bg: 'from-blossom-burgundy via-blossom-plum to-[#1a0a14]',
      content: (
        <div className="flex flex-col items-center justify-center h-full text-center px-8">
          <motion.div
            initial={{ rotate: -30, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="text-7xl mb-6"
          >
            {peakHour >= 22 || peakHour < 6 ? '🌙' : peakHour < 12 ? '🌅' : peakHour < 18 ? '☀️' : '🌆'}
          </motion.div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="font-sans text-white/70 text-sm uppercase tracking-widest mb-4"
          >
            Su hora favorita
          </motion.p>
          <motion.div
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 150, delay: 0.4 }}
            className="font-display text-8xl font-bold text-white mb-2"
          >
            {String(peakHour).padStart(2, '0')}:00
          </motion.div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="font-display italic text-2xl text-blossom-rose mb-8"
          >
            El pico nocturno 💕
          </motion.p>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="font-sans text-white/60 text-sm"
          >
            Los {peakDay} son su día más activo de la semana
          </motion.p>
        </div>
      ),
    },
    // Slide 7: Record day
    {
      id: 'record-day',
      bg: 'from-blossom-apricot via-blossom-peach to-blossom-rose',
      content: (
        <div className="flex flex-col items-center justify-center h-full text-center px-8">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-7xl mb-6"
          >
            🏆
          </motion.div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="font-sans text-white/80 text-sm uppercase tracking-widest mb-2"
          >
            Su día récord
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="font-display text-2xl text-white font-semibold mb-4 capitalize"
          >
            {busiestDate}
          </motion.p>
          <motion.div
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 120, delay: 0.5 }}
            className="font-display text-8xl font-bold text-white mb-2"
          >
            {busiestDay?.count?.toLocaleString('es-ES')}
          </motion.div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="font-display italic text-2xl text-white/80"
          >
            mensajes en un solo día 🔥
          </motion.p>
        </div>
      ),
    },
    // Slide 8: Top emojis
    {
      id: 'emojis',
      bg: 'from-blossom-wine to-blossom-plum',
      content: (
        <div className="flex flex-col items-center justify-center h-full text-center px-8">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="font-sans text-white/70 text-sm uppercase tracking-widest mb-8"
          >
            Sus emojis favoritos
          </motion.p>
          <div className="flex flex-col gap-8 w-full max-w-xs">
            {participants.map((p, pi) => (
              <motion.div
                key={p}
                initial={{ opacity: 0, x: pi === 0 ? -30 : 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + pi * 0.2 }}
              >
                <p className="font-sans text-white/60 text-xs mb-3">{p}</p>
                <div className="flex justify-center gap-3">
                  {(perAuthor[p]?.topEmojis || []).slice(0, 5).map(({ key: emoji, count }, i) => (
                    <motion.div
                      key={emoji}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.4 + pi * 0.2 + i * 0.08, type: 'spring' }}
                      className="flex flex-col items-center"
                    >
                      <span className="text-4xl mb-1">{emoji}</span>
                      <span className="font-mono text-xs text-white/50">{count}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      ),
    },
    // Slide 9: Closing
    {
      id: 'closing',
      bg: 'from-blossom-plum via-blossom-burgundy to-blossom-wine',
      content: (
        <div className="flex flex-col items-center justify-center h-full text-center px-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.2, 1] }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-8xl mb-6 heartbeat inline-block"
          >
            💕
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="font-display text-4xl text-white font-bold mb-3"
          >
            Y la historia continúa…
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="font-display italic text-xl text-white/70 mb-8"
          >
            mensaje por mensaje
          </motion.p>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.9 }}
            className="flex items-center gap-3 text-white/60"
          >
            <span className="font-display text-2xl font-semibold text-white">{p1}</span>
            <Heart className="w-5 h-5 text-blossom-rose" fill="#E8B4B8" />
            <span className="font-display text-2xl font-semibold text-white">{p2}</span>
          </motion.div>
        </div>
      ),
      onEnter: () => {
        confetti({
          particleCount: 150,
          spread: 100,
          origin: { y: 0.6 },
          colors: ['#E8B4B8', '#C07B8E', '#8B3A52', '#F0A896', '#D4A853'],
        });
      },
    },
  ];
}

export default function LoveWrapped({ analytics, onClose }) {
  const slides = buildSlides(analytics);
  const [current, setCurrent] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const timerRef = useRef(null);

  const goTo = useCallback((index) => {
    const clamped = Math.max(0, Math.min(index, slides.length - 1));
    setCurrent(clamped);
    const slide = slides[clamped];
    if (slide?.onEnter) slide.onEnter();
  }, [slides]);

  const next = useCallback(() => {
    if (current < slides.length - 1) {
      goTo(current + 1);
    } else {
      onClose();
    }
  }, [current, slides.length, goTo, onClose]);

  const prev = useCallback(() => {
    goTo(current - 1);
  }, [current, goTo]);

  useEffect(() => {
    if (!isPlaying) {
      clearTimeout(timerRef.current);
      return;
    }
    timerRef.current = setTimeout(next, SLIDE_DURATION);
    return () => clearTimeout(timerRef.current);
  }, [current, isPlaying, next]);

  // Keyboard navigation
  useEffect(() => {
    const handle = (e) => {
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'Escape') onClose();
      if (e.key === ' ') setIsPlaying(p => !p);
    };
    window.addEventListener('keydown', handle);
    return () => window.removeEventListener('keydown', handle);
  }, [next, prev, onClose]);

  const slide = slides[current];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="relative w-full max-w-sm h-[85vh] max-h-[700px] rounded-3xl overflow-hidden shadow-2xl"
        style={{ userSelect: 'none' }}
      >
        {/* Gradient background */}
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className={`absolute inset-0 bg-gradient-to-b ${slide.bg}`}
          />
        </AnimatePresence>

        {/* Decorative circles */}
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-white/5 translate-y-1/2 -translate-x-1/2 pointer-events-none" />

        {/* Top UI */}
        <div className="absolute top-0 left-0 right-0 z-20 px-4 pt-4">
          <ProgressBar
            total={slides.length}
            current={current}
            isPlaying={isPlaying}
            duration={SLIDE_DURATION}
          />
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-blossom-wine flex items-center justify-center">
                <Heart className="w-3.5 h-3.5 text-white" fill="white" />
              </div>
              <span className="font-display text-white text-sm font-medium">Love Wrapped</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsPlaying(p => !p)}
                className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
              >
                {isPlaying
                  ? <Pause className="w-3.5 h-3.5 text-white" />
                  : <Play className="w-3.5 h-3.5 text-white" />
                }
              </button>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>
        </div>

        {/* Slide content */}
        <div className="absolute inset-0 z-10 pt-20 pb-16">
          <AnimatePresence mode="wait">
            <motion.div
              key={slide.id}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.35 }}
              className="h-full"
            >
              {slide.content}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation touch zones */}
        <button
          className="absolute left-0 top-16 bottom-12 w-1/3 z-20 opacity-0"
          onClick={prev}
          aria-label="Anterior"
        />
        <button
          className="absolute right-0 top-16 bottom-12 w-1/3 z-20 opacity-0"
          onClick={next}
          aria-label="Siguiente"
        />

        {/* Visible nav arrows */}
        <div className="absolute bottom-4 left-0 right-0 z-20 flex items-center justify-center gap-6">
          <button
            onClick={prev}
            disabled={current === 0}
            className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 disabled:opacity-30 flex items-center justify-center transition-all"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
          <span className="font-mono text-white/50 text-xs">
            {current + 1} / {slides.length}
          </span>
          <button
            onClick={next}
            className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-all"
          >
            <ChevronRight className="w-5 h-5 text-white" />
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
