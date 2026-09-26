import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, FileText, Image, Calendar, Sparkles, Clock, Heart } from 'lucide-react';
import confetti from 'canvas-confetti';
import { CountUp, StatCard } from './ui.jsx';
import { COUPLE_PHOTOS } from '../data/photos.js';
import { playHeartChime } from '../utils/romanticAudio.js';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 28 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.8, ease: [0.16, 1, 0.3, 1] },
});

function formatDate(date) {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('es-CO', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
}

export default function HeroSection({ analytics, onOpenWrapped }) {
  const { participants, firstDate, lastDate, daysTotal, totalMessages, totalWords, totalMediaAll } = analytics;
  const [p1 = 'Juanes', p2 = 'Pau'] = participants;
  const firedRef = useRef(false);

  // Live love stopwatch
  const [elapsed, setElapsed] = useState({ days: daysTotal || 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    if (!firstDate) return;
    const startDate = new Date(firstDate).getTime();

    const updateTimer = () => {
      const now = Date.now();
      const diff = Math.max(0, now - startDate);
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);
      setElapsed({ days, hours, minutes, seconds });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [firstDate, daysTotal]);

  const handleConfetti = () => {
    playHeartChime();
    if (firedRef.current) return;
    firedRef.current = true;
    confetti({
      particleCount: 140,
      spread: 100,
      origin: { y: 0.55 },
      colors: ['#c82360', '#9060ff', '#f04080', '#ffd966', '#ff80ad'],
      shapes: ['circle', 'square'],
      scalar: 1.15,
    });
    setTimeout(() => {
      confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 }, colors: ['#c82360', '#fff', '#9060ff'] });
    }, 450);
    setTimeout(() => { firedRef.current = false; }, 2500);
  };

  return (
    <section
      id="hero"
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-24 pb-20 px-4"
    >
      {/* Background radiant mesh */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(at 20% 75%, rgba(160, 16, 75, 0.32) 0%, transparent 55%),
            radial-gradient(at 80% 25%, rgba(120, 60, 240, 0.25) 0%, transparent 55%),
            radial-gradient(at 50% 50%, rgba(200, 35, 96, 0.12) 0%, transparent 50%),
            #08080d
          `,
        }}
      />

      {/* Twinkling romantic stars */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 45 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: 1.5 + Math.random() * 2.5,
              height: 1.5 + Math.random() * 2.5,
              background: i % 3 === 0 ? 'rgba(255,217,102,0.8)' : i % 2 === 0 ? 'rgba(240,64,128,0.7)' : 'rgba(144,96,255,0.7)',
              boxShadow: '0 0 6px rgba(255,255,255,0.8)',
            }}
            animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1.2, 0.8] }}
            transition={{ duration: 2.5 + Math.random() * 3.5, repeat: Infinity, delay: Math.random() * 3, ease: 'easeInOut' }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-5xl w-full mx-auto text-center flex flex-col items-center">
        {/* Couple Portrait Avatar Frame */}
        {COUPLE_PHOTOS[1] && (
          <motion.div
            {...fadeUp(0)}
            className="relative cursor-pointer group mb-5"
            onClick={() => document.getElementById('moments')?.scrollIntoView({ behavior: 'smooth' })}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            title="Ver nuestra galería de fotos"
          >
            <div
              className="absolute -inset-1.5 rounded-full blur-lg opacity-75 group-hover:opacity-100 transition-opacity"
              style={{ background: 'conic-gradient(from 0deg, #880b3a, #c82360, #ffd966, #9060ff, #f04080, #880b3a)' }}
            />
            <div className="relative w-28 h-28 md:w-32 md:h-32 rounded-full overflow-hidden border-2 border-white/60 shadow-2xl">
              <img
                src={COUPLE_PHOTOS[1].src}
                alt="Juanes & Pau"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
            </div>
            <div
              className="absolute -bottom-1 -right-1 w-9 h-9 rounded-full flex items-center justify-center text-base shadow-lg border-2 border-white/40 select-none"
              style={{ background: 'linear-gradient(135deg, #880b3a, #c82360)' }}
            >
              ❤️
            </div>
          </motion.div>
        )}

        {/* Section Pill */}
        <motion.div {...fadeUp(0.05)} className="mb-4">
          <span className="section-label text-xs sm:text-sm tracking-[0.3em] font-semibold py-1.5 px-4 shadow-lg">
            ✦ NUESTRA HISTORIA DE AMOR ✦
          </span>
        </motion.div>

        {/* Large Names: Juanes & Pau */}
        <motion.div {...fadeUp(0.1)} className="flex flex-wrap items-center justify-center gap-3 sm:gap-5 mb-4">
          <motion.span
            className="font-display text-5xl sm:text-7xl md:text-8xl font-black tracking-tight"
            style={{
              background: 'linear-gradient(135deg, #ffffff 10%, #ffd0e0 60%, #c82360 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              filter: 'drop-shadow(0 4px 20px rgba(200,35,96,0.35))',
            }}
          >
            {p1}
          </motion.span>

          <motion.div
            className="flex items-center justify-center cursor-pointer select-none"
            whileHover={{ scale: 1.25, rotate: 10 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleConfetti}
            title="¡Toca para celebrar nuestro amor! 🎉"
          >
            <span
              className="text-4xl sm:text-5xl md:text-6xl text-rose-500"
              style={{ filter: 'drop-shadow(0 0 16px rgba(240,64,128,0.8))' }}
            >
              ♥
            </span>
          </motion.div>

          <motion.span
            className="font-display text-5xl sm:text-7xl md:text-8xl font-black tracking-tight"
            style={{
              background: 'linear-gradient(135deg, #ffffff 10%, #f0c0ff 60%, #9060ff 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              filter: 'drop-shadow(0 4px 20px rgba(144,96,255,0.35))',
            }}
          >
            {p2}
          </motion.span>
        </motion.div>

        {/* Date span */}
        <motion.p {...fadeUp(0.15)} className="text-base sm:text-lg text-white/70 font-light mb-8 max-w-xl">
          Escribiendo nuestra historia desde el{' '}
          <strong className="text-rose-300 font-semibold">{formatDate(firstDate)}</strong>{' '}
          hasta el{' '}
          <strong className="text-violet-300 font-semibold">{formatDate(lastDate)}</strong>
        </motion.p>

        {/* Live Love Stopwatch */}
        <motion.div
          {...fadeUp(0.2)}
          className="mb-10 w-full max-w-2xl px-4 py-4 rounded-3xl border border-white/10 shadow-2xl backdrop-blur-2xl"
          style={{ background: 'linear-gradient(135deg, rgba(30, 20, 45, 0.7), rgba(15, 10, 25, 0.8))' }}
        >
          <div className="flex items-center justify-center gap-2 mb-3 text-xs sm:text-sm font-semibold tracking-widest uppercase text-rose-300">
            <Clock size={16} className="text-rose-400 animate-pulse" />
            <span>Tiempo exacto amándonos</span>
          </div>

          <div className="grid grid-cols-4 gap-2 sm:gap-4 text-center">
            <div className="p-2 sm:p-3 rounded-2xl bg-white/[0.04] border border-white/5">
              <span className="font-mono text-2xl sm:text-4xl md:text-5xl font-black gradient-text-rose block">
                {elapsed.days}
              </span>
              <span className="text-[11px] sm:text-xs text-white/60 uppercase font-semibold">Días</span>
            </div>

            <div className="p-2 sm:p-3 rounded-2xl bg-white/[0.04] border border-white/5">
              <span className="font-mono text-2xl sm:text-4xl md:text-5xl font-black text-white block">
                {String(elapsed.hours).padStart(2, '0')}
              </span>
              <span className="text-[11px] sm:text-xs text-white/60 uppercase font-semibold">Horas</span>
            </div>

            <div className="p-2 sm:p-3 rounded-2xl bg-white/[0.04] border border-white/5">
              <span className="font-mono text-2xl sm:text-4xl md:text-5xl font-black text-white block">
                {String(elapsed.minutes).padStart(2, '0')}
              </span>
              <span className="text-[11px] sm:text-xs text-white/60 uppercase font-semibold">Minutos</span>
            </div>

            <div className="p-2 sm:p-3 rounded-2xl bg-white/[0.04] border border-white/5">
              <span className="font-mono text-2xl sm:text-4xl md:text-5xl font-black gradient-text-gold block">
                {String(elapsed.seconds).padStart(2, '0')}
              </span>
              <span className="text-[11px] sm:text-xs text-white/60 uppercase font-semibold">Segundos</span>
            </div>
          </div>
        </motion.div>

        {/* Love Wrapped Launch Button */}
        {onOpenWrapped && (
          <motion.div {...fadeUp(0.25)} className="mb-12">
            <motion.button
              onClick={() => {
                playHeartChime();
                onOpenWrapped();
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="glow-btn group text-base sm:text-lg font-bold px-8 sm:px-10 py-4"
            >
              <Sparkles size={20} className="text-yellow-300 animate-spin-slow" />
              <span>✦ Ver Nuestro Love Wrapped ✦</span>
              <span className="text-rose-200 group-hover:translate-x-1.5 transition-transform">→</span>
            </motion.button>
          </motion.div>
        )}

        {/* 4 Quick Stat Summary Cards with Bigger Numbers */}
        <motion.div {...fadeUp(0.3)} className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-5 w-full">
          <StatCard
            icon={<MessageCircle size={24} style={{ color: '#ff6699' }} />}
            label="Mensajes"
            value={<CountUp end={totalMessages} duration={1600} />}
            sub="enviados con amor"
            accent="wine"
          />
          <StatCard
            icon={<FileText size={24} style={{ color: '#b088ff' }} />}
            label="Palabras"
            value={<CountUp end={totalWords} duration={1800} />}
            sub="palabras escritas"
            accent="violet"
          />
          <StatCard
            icon={<Image size={24} style={{ color: '#ff5599' }} />}
            label="Recuerdos"
            value={<CountUp end={totalMediaAll} duration={1500} />}
            sub="fotos, stickers y audios"
            accent="rose"
          />
          <StatCard
            icon={<Calendar size={24} style={{ color: '#ffd966' }} />}
            label="Días juntos"
            value={<CountUp end={daysTotal} duration={1700} />}
            sub="de complicidad total"
            accent="gold"
          />
        </motion.div>
      </div>

      {/* Downward scroll indicator */}
      <motion.div
        className="mt-14 flex flex-col items-center gap-1 cursor-pointer opacity-70 hover:opacity-100 transition-opacity"
        onClick={() => document.getElementById('moments')?.scrollIntoView({ behavior: 'smooth' })}
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      >
        <span className="text-xs text-white/60 tracking-widest uppercase font-semibold">Desliza para ver más</span>
        <div className="w-0.5 h-10 rounded-full" style={{ background: 'linear-gradient(180deg, #c82360, transparent)' }} />
      </motion.div>
    </section>
  );
}
