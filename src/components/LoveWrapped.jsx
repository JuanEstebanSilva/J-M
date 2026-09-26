import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Heart, Pause, Play, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { COUPLE_PHOTOS } from '../data/photos.js';

const SLIDE_DURATION = 5500; // ms per slide

function ProgressBar({ total, current, isPlaying, duration }) {
  return (
    <div className="flex gap-1.5 w-full">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className="flex-1 h-1 rounded-full bg-white/20 overflow-hidden">
          {i < current && (
            <div className="h-full w-full bg-gradient-to-r from-wine-400 to-rose-400 rounded-full" />
          )}
          {i === current && isPlaying && (
            <motion.div
              className="h-full bg-gradient-to-r from-wine-400 to-rose-400 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ duration: duration / 1000, ease: 'linear' }}
            />
          )}
          {i === current && !isPlaying && (
            <div className="h-full bg-wine-400 rounded-full" style={{ width: '50%' }} />
          )}
        </div>
      ))}
    </div>
  );
}

function buildSlides(analytics) {
  const {
    participants = [],
    totalMessages = 0,
    totalWords = 0,
    daysTotal = 0,
    anniversaryDate,
    daysTogetherAnniversary,
    yearsTogether,
    callsStats,
    mediaBreakdown,
    laughterStats,
    stats = {},
    busiestDay = null,
    busiestCount = 0,
    loveWordsTotals = {},
    weeklyData = [],
    hourlyData = [],
    peakHour: givenPeakHour,
  } = analytics;

  const p1 = participants[0] || 'Uno';
  const p2 = participants[1] || 'El otro';
  const s1 = stats[p1] || { messages: 0, words: 0, emojiTop: [] };
  const s2 = stats[p2] || { messages: 0, words: 0, emojiTop: [] };

  const p1Count = s1.messages || 0;
  const p2Count = s2.messages || 0;
  const totalCount = p1Count + p2Count || 1;
  const p1Pct = Math.round((p1Count / totalCount) * 100);
  const p2Pct = 100 - p1Pct;

  const biggestSender = p1Count >= p2Count ? p1 : p2;
  const peakHour = givenPeakHour ?? 21;
  const peakDayObj = [...(weeklyData || [])].sort((a, b) => b.count - a.count)[0];
  const peakDay = peakDayObj?.day || 'Domingo';

  // Love words sorted
  const sortedLove = Object.entries(loveWordsTotals || {})
    .filter(([, data]) => (data?.total || 0) > 0)
    .sort(([, a], [, b]) => b.total - a.total);
  const topLove = sortedLove[0] || ['Amor', { total: 0 }];

  // Busiest date formatted
  let busiestDateStr = 'Un día especial';
  if (busiestDay) {
    const parts = busiestDay.split('-');
    if (parts.length === 3) {
      const bDate = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
      busiestDateStr = bDate.toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' });
    }
  }

  const daysCount = daysTogetherAnniversary || 2402;
  const yearsCount = yearsTogether || '6.5';

  return [
    // Slide 1: Opening
    {
      id: 'opening',
      bg: 'from-[#2a0418] via-[#150520] to-[#0a0a0f]',
      content: (
        <div className="flex flex-col items-center justify-center h-full text-center px-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
            className="relative w-28 h-28 rounded-full overflow-hidden border-2 border-rose-400/60 shadow-glow-wine mb-4 mx-auto"
          >
            <img src={COUPLE_PHOTOS[3]?.src || COUPLE_PHOTOS[0]?.src} alt="Nosotros" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
            <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-rose-600 flex items-center justify-center text-xs text-white">
              ♥
            </div>
          </motion.div>
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="section-label tracking-[0.3em] text-xs mb-2 text-rose-300"
          >
            ✦ NUESTRO LOVE WRAPPED ✦
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="font-display text-3xl sm:text-4xl text-white font-bold mb-1 leading-tight"
          >
            Nuestra Historia
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="font-display italic text-xl text-wine-400 mb-6"
          >
            en cada mensaje
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="flex items-center gap-3 px-5 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md"
          >
            <span className="font-medium text-white/90 text-sm">{p1}</span>
            <span className="text-rose-500 animate-pulse text-xs">♥</span>
            <span className="font-medium text-white/90 text-sm">{p2}</span>
          </motion.div>
        </div>
      ),
    },

    // Slide 2: Days together (True anniversary: 28 Feb 2020)
    {
      id: 'days',
      bg: 'from-[#350820] via-[#1c0628] to-[#0a0a0f]',
      content: (
        <div className="flex flex-col items-center justify-center h-full text-center px-8">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-xs uppercase tracking-widest text-muted-soft mb-4"
          >
            ✦ NUESTRA TRAYECTORIA DE NOVIOS ✦
          </motion.p>
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 150, delay: 0.3 }}
            className="font-display text-8xl font-bold gradient-text leading-none mb-2"
          >
            {daysCount.toLocaleString('es-CO')}
          </motion.div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="font-display italic text-3xl text-rose-300 mb-6"
          >
            días de novios 🌹
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-white/10 backdrop-blur-md rounded-2xl px-5 py-3 border border-white/10 max-w-xs"
          >
            <p className="text-white/90 text-sm font-medium">
              Desde el <span className="font-bold text-rose-300">28 de febrero de 2020</span>
            </p>
            <p className="text-amber-300 text-xs mt-1 font-semibold">
              ✨ Más de {yearsCount} años construyendo nuestra vida
            </p>
          </motion.div>
        </div>
      ),
    },

    // Slide 2.5: Calls & Media Superpowers
    {
      id: 'calls-media',
      bg: 'from-[#1d0628] via-[#240822] to-[#0a0a0f]',
      content: (
        <div className="flex flex-col items-center justify-center h-full text-center px-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.2 }}
            className="text-5xl mb-2"
          >
            📞
          </motion.div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-xs uppercase tracking-widest text-muted-soft mb-1"
          >
            Maratón en Llamadas
          </motion.p>
          <motion.div
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.4 }}
            className="font-display text-6xl font-bold gradient-text-gold leading-none mb-1"
          >
            {callsStats?.totalMinutes ? Math.round(callsStats.totalMinutes / 60) : 164} hrs
          </motion.div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="font-display italic text-base text-rose-300 mb-5"
          >
            {(callsStats?.totalMinutes || 9860).toLocaleString('es-CO')} minutos escuchándonos 💕
          </motion.p>

          <div className="grid grid-cols-2 gap-3 w-full max-w-xs text-left">
            <div className="p-3 rounded-2xl bg-white/5 border border-rose-500/20">
              <span className="text-sm block text-white/80">👑 Stickers</span>
              <p className="text-xs font-semibold text-rose-300">Pau</p>
              <p className="text-xl font-mono font-bold text-white">1,220</p>
            </div>
            <div className="p-3 rounded-2xl bg-white/5 border border-violet-500/20">
              <span className="text-sm block text-white/80">📸 Fotos</span>
              <p className="text-xs font-semibold text-violet-300">Juanes</p>
              <p className="text-xl font-mono font-bold text-white">957</p>
            </div>
          </div>
        </div>
      ),
    },

    // Slide 3: Total messages
    {
      id: 'messages',
      bg: 'from-[#18002e] via-[#200424] to-[#0a0a0f]',
      content: (
        <div className="flex flex-col items-center justify-center h-full text-center px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-6xl mb-5"
          >
            💌
          </motion.div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-xs uppercase tracking-widest text-muted-soft mb-2"
          >
            Se han dedicado
          </motion.p>
          <motion.div
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 120, delay: 0.4 }}
            className="font-display text-7xl font-bold text-white leading-none mb-2"
          >
            {totalMessages.toLocaleString('es-CO')}
          </motion.div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="font-display italic text-2xl text-wine-400 mb-6"
          >
            mensajes compartidos
          </motion.p>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-white/60 text-sm max-w-xs"
          >
            Y más de <span className="text-violet-300 font-mono font-medium">{totalWords.toLocaleString('es-CO')}</span> palabras escritas con el corazón
          </motion.p>
        </div>
      ),
    },

    // Slide 4: Who talks more
    {
      id: 'talker',
      bg: 'from-[#26051d] via-[#140824] to-[#0a0a0f]',
      content: (
        <div className="flex flex-col items-center justify-center h-full text-center px-8">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-xs uppercase tracking-widest text-muted-soft mb-8"
          >
            ¿Quién escribe más?
          </motion.p>

          <div className="flex items-end justify-center gap-6 mb-8 w-full max-w-xs">
            {/* P1 */}
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: `${p1Pct * 1.8}px`, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.8, ease: 'easeOut' }}
              className="flex-1 flex flex-col items-center justify-end"
            >
              {p1 === biggestSender && <span className="text-2xl mb-1">👑</span>}
              <div
                className="w-full rounded-2xl flex flex-col items-center justify-end p-3"
                style={{
                  height: `${Math.max(p1Pct * 1.8, 60)}px`,
                  background: 'linear-gradient(180deg, rgba(200,35,96,0.6) 0%, rgba(136,11,58,0.8) 100%)',
                  border: '1px solid rgba(200,35,96,0.4)',
                }}
              >
                <span className="font-display text-2xl font-bold text-white">{p1Pct}%</span>
                <span className="text-xs text-white/80 truncate max-w-full">{p1}</span>
              </div>
            </motion.div>

            {/* P2 */}
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: `${p2Pct * 1.8}px`, opacity: 1 }}
              transition={{ delay: 0.45, duration: 0.8, ease: 'easeOut' }}
              className="flex-1 flex flex-col items-center justify-end"
            >
              {p2 === biggestSender && <span className="text-2xl mb-1">👑</span>}
              <div
                className="w-full rounded-2xl flex flex-col items-center justify-end p-3"
                style={{
                  height: `${Math.max(p2Pct * 1.8, 60)}px`,
                  background: 'linear-gradient(180deg, rgba(144,96,255,0.6) 0%, rgba(104,48,224,0.8) 100%)',
                  border: '1px solid rgba(144,96,255,0.4)',
                }}
              >
                <span className="font-display text-2xl font-bold text-white">{p2Pct}%</span>
                <span className="text-xs text-white/80 truncate max-w-full">{p2}</span>
              </div>
            </motion.div>
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="font-display italic text-white/90 text-xl"
          >
            {biggestSender} lleva la delantera en mensajes 💬
          </motion.p>
        </div>
      ),
    },

    // Slide 5: Love keywords
    {
      id: 'love-words',
      bg: 'from-[#380620] via-[#1a041e] to-[#0a0a0f]',
      content: (
        <div className="flex flex-col items-center justify-center h-full text-center px-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
            className="text-6xl mb-4"
          >
            💖
          </motion.div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-xs uppercase tracking-widest text-muted-soft mb-2"
          >
            Palabra de amor favorita
          </motion.p>
          <motion.div
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.4 }}
            className="font-display text-7xl font-bold text-white mb-1"
          >
            {(topLove[1]?.total || 0).toLocaleString('es-CO')}
          </motion.div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="font-display italic text-2xl text-rose-300 mb-6"
          >
            veces "{topLove[0]}"
          </motion.p>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="flex flex-wrap justify-center gap-2 max-w-xs"
          >
            {sortedLove.slice(0, 6).map(([label, data]) => (
              <span
                key={label}
                className="bg-white/10 border border-white/10 rounded-full px-3 py-1 text-xs text-white/90"
              >
                "{label}" <span className="text-wine-400 font-mono">×{data.total}</span>
              </span>
            ))}
          </motion.div>
        </div>
      ),
    },

    // Slide 6: Peak time
    {
      id: 'peak-time',
      bg: 'from-[#100624] via-[#180320] to-[#0a0a0f]',
      content: (
        <div className="flex flex-col items-center justify-center h-full text-center px-8">
          <motion.div
            initial={{ rotate: -30, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="text-6xl mb-4"
          >
            {peakHour >= 22 || peakHour < 6 ? '🌙' : peakHour < 12 ? '🌅' : peakHour < 18 ? '☀️' : '🌆'}
          </motion.div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-xs uppercase tracking-widest text-muted-soft mb-3"
          >
            Su hora mágica de conexión
          </motion.p>
          <motion.div
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 150, delay: 0.4 }}
            className="font-display text-7xl font-bold text-white mb-2"
          >
            {String(peakHour).padStart(2, '0')}:00
          </motion.div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="font-display italic text-2xl text-violet-300 mb-6"
          >
            El momento de mayor complicidad ✨
          </motion.p>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-white/60 text-xs"
          >
            Y los días <span className="text-white/90 font-medium">{peakDay}</span> son cuando más hablan de la semana
          </motion.p>
        </div>
      ),
    },

    // Slide 7: Record day
    {
      id: 'record-day',
      bg: 'from-[#2c1200] via-[#24081c] to-[#0a0a0f]',
      content: (
        <div className="flex flex-col items-center justify-center h-full text-center px-8">
          {COUPLE_PHOTOS[3] && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="relative w-36 h-24 rounded-2xl overflow-hidden border border-white/20 shadow-lg mb-3"
            >
              <img src={COUPLE_PHOTOS[3].src} alt="Récord" className="w-full h-full object-cover" />
              <div className="absolute top-1.5 left-2 px-2 py-0.5 rounded-full text-[10px] font-medium bg-black/60 text-gold-300 backdrop-blur-md">
                Aventuras 🏔️
              </div>
            </motion.div>
          )}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-xs uppercase tracking-widest text-gold-400 mb-1"
          >
            Su récord absoluto
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-sm text-white/80 font-medium mb-3 capitalize"
          >
            {busiestDateStr}
          </motion.p>
          <motion.div
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 120, delay: 0.5 }}
            className="font-display text-7xl font-bold text-gold-300 mb-2"
          >
            {busiestCount?.toLocaleString('es-CO')}
          </motion.div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="font-display italic text-xl text-white/90"
          >
            mensajes en tan solo 24 horas 🔥
          </motion.p>
        </div>
      ),
    },

    // Slide 8: Top emojis
    {
      id: 'emojis',
      bg: 'from-[#20072e] via-[#180420] to-[#0a0a0f]',
      content: (
        <div className="flex flex-col items-center justify-center h-full text-center px-8">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-xs uppercase tracking-widest text-muted-soft mb-6"
          >
            Sus emojis predilectos
          </motion.p>
          <div className="flex flex-col gap-6 w-full max-w-xs">
            {participants.map((p, pi) => (
              <motion.div
                key={p}
                initial={{ opacity: 0, x: pi === 0 ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + pi * 0.2 }}
                className="bg-white/5 border border-white/10 rounded-2xl p-3"
              >
                <p className="text-xs text-muted-soft mb-2 font-medium">{p}</p>
                <div className="flex justify-center gap-3">
                  {(stats[p]?.emojiTop || []).slice(0, 5).map(([emoji, count], i) => (
                    <motion.div
                      key={emoji}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.4 + pi * 0.2 + i * 0.08, type: 'spring' }}
                      className="flex flex-col items-center"
                    >
                      <span className="text-2xl mb-0.5">{emoji}</span>
                      <span className="font-mono text-[10px] text-white/40">{count}</span>
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
      bg: 'from-[#36081e] via-[#1c0422] to-[#0a0a0f]',
      content: (
        <div className="flex flex-col items-center justify-center h-full text-center px-8">
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-3xl overflow-hidden border-2 border-rose-400/70 shadow-glow-wine mb-4 mx-auto"
          >
            <img src={COUPLE_PHOTOS[1]?.src || COUPLE_PHOTOS[2]?.src} alt="Nuestro Amor" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
            <motion.div
              className="absolute inset-0 flex items-center justify-center text-3xl select-none"
              animate={{ scale: [1, 1.25, 1] }}
              transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
            >
              ♥
            </motion.div>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="font-display text-2xl sm:text-3xl text-white font-bold mb-1"
          >
            Y la historia continúa…
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="font-display italic text-base sm:text-lg text-rose-300 mb-6"
          >
            cada día, en cada mensaje
          </motion.p>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8 }}
            className="flex items-center gap-3 px-5 py-2.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-md"
          >
            <span className="font-display text-lg font-semibold text-white">{p1}</span>
            <Heart className="w-4 h-4 text-rose-500 fill-rose-500 animate-pulse" />
            <span className="font-display text-lg font-semibold text-white">{p2}</span>
          </motion.div>
        </div>
      ),
      onEnter: () => {
        confetti({
          particleCount: 150,
          spread: 100,
          origin: { y: 0.6 },
          colors: ['#c82360', '#9060ff', '#f04080', '#ffd966', '#ff80ad'],
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md px-4"
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.92, opacity: 0 }}
        className="relative w-full max-w-sm h-[85vh] max-h-[720px] rounded-3xl overflow-hidden shadow-2xl border border-white/10"
        style={{ userSelect: 'none' }}
      >
        {/* Background gradient */}
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

        {/* Ambient glow dots */}
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-rose-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-violet-500/10 blur-3xl pointer-events-none" />

        {/* Top Progress & Controls */}
        <div className="absolute top-0 left-0 right-0 z-20 px-4 pt-4">
          <ProgressBar
            total={slides.length}
            current={current}
            isPlaying={isPlaying}
            duration={SLIDE_DURATION}
          />
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-2">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs shadow-glow-wine"
                style={{ background: 'linear-gradient(135deg, #880b3a, #c82360)' }}
              >
                ♥
              </div>
              <span className="font-display text-white text-sm font-medium tracking-wide">
                Love Wrapped
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsPlaying(p => !p)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                aria-label={isPlaying ? 'Pausar' : 'Reproducir'}
              >
                {isPlaying
                  ? <Pause className="w-3.5 h-3.5 text-white" />
                  : <Play className="w-3.5 h-3.5 text-white" />
                }
              </button>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                aria-label="Cerrar"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>
        </div>

        {/* Slide Content */}
        <div className="absolute inset-0 z-10 pt-20 pb-16">
          <AnimatePresence mode="wait">
            <motion.div
              key={slide.id}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="h-full"
            >
              {slide.content}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Invisible tap targets (left 35% prev, right 35% next) */}
        <button
          className="absolute left-0 top-16 bottom-14 w-1/3 z-20 opacity-0 cursor-pointer"
          onClick={prev}
          aria-label="Anterior"
        />
        <button
          className="absolute right-0 top-16 bottom-14 w-1/3 z-20 opacity-0 cursor-pointer"
          onClick={next}
          aria-label="Siguiente"
        />

        {/* Bottom Nav arrows & Counter */}
        <div className="absolute bottom-4 left-0 right-0 z-20 flex items-center justify-center gap-6">
          <button
            onClick={prev}
            disabled={current === 0}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-20 flex items-center justify-center transition-all"
            aria-label="Anterior diapositiva"
          >
            <ChevronLeft className="w-4 h-4 text-white" />
          </button>
          <span className="font-mono text-white/50 text-xs">
            {current + 1} / {slides.length}
          </span>
          <button
            onClick={next}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all"
            aria-label="Siguiente diapositiva"
          >
            <ChevronRight className="w-4 h-4 text-white" />
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
