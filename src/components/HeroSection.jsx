import { useRef } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, FileText, Image, Calendar, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { CountUp, StatCard } from './ui.jsx';
import { COUPLE_PHOTOS } from '../data/photos.js';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.7, ease: [0.16, 1, 0.3, 1] },
});

function formatDate(date) {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('es-CO', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
}

export default function HeroSection({ analytics, onOpenWrapped }) {
  const { participants, firstDate, lastDate, daysTotal, totalMessages, totalWords, totalMediaAll } = analytics;
  const [p1, p2 = '?'] = participants;
  const firedRef = useRef(false);

  const handleConfetti = () => {
    if (firedRef.current) return;
    firedRef.current = true;
    confetti({
      particleCount: 120,
      spread: 90,
      origin: { y: 0.55 },
      colors: ['#c82360', '#9060ff', '#f04080', '#ffd966', '#ff80ad'],
      shapes: ['circle', 'square'],
      scalar: 1.1,
    });
    setTimeout(() => confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 }, colors: ['#c82360', '#fff', '#9060ff'] }), 600);
    setTimeout(() => { firedRef.current = false; }, 3000);
  };

  return (
    <section
      id="hero"
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-20 pb-16 px-4"
    >
      {/* Background mesh */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(at 20% 80%, rgba(136,11,58,0.25) 0%, transparent 50%),
            radial-gradient(at 80% 20%, rgba(104,48,224,0.2) 0%, transparent 50%),
            radial-gradient(at 60% 60%, rgba(200,35,96,0.08) 0%, transparent 40%),
            #0a0a0f
          `,
        }}
      />

      {/* Stars/particles bg */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 40 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: 1 + Math.random() * 2,
              height: 1 + Math.random() * 2,
              background: i % 3 === 0 ? 'rgba(200,35,96,0.6)' : i % 3 === 1 ? 'rgba(144,96,255,0.5)' : 'rgba(255,255,255,0.3)',
            }}
            animate={{ opacity: [0.2, 1, 0.2] }}
            transition={{ duration: 2 + Math.random() * 4, repeat: Infinity, delay: Math.random() * 3, ease: 'easeInOut' }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-5xl w-full mx-auto text-center">
        {/* Names */}
        <motion.div {...fadeUp(0)} className="flex flex-col items-center gap-4 mb-10">
          {/* Couple Portrait Avatar Frame */}
          {COUPLE_PHOTOS[1] && (
            <motion.div
              className="relative cursor-pointer group mb-1"
              onClick={() => document.getElementById('moments')?.scrollIntoView({ behavior: 'smooth' })}
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.96 }}
              title="Ver nuestra galería de fotos"
            >
              <div
                className="absolute -inset-1 rounded-full blur-md opacity-70 group-hover:opacity-100 transition-opacity"
                style={{ background: 'conic-gradient(from 0deg, #880b3a, #c82360, #9060ff, #f04080, #880b3a)' }}
              />
              <div className="relative w-24 h-24 md:w-28 md:h-28 rounded-full overflow-hidden border-2 border-white/50 shadow-glow-wine">
                <img
                  src={COUPLE_PHOTOS[1].src}
                  alt="Juan & Pareja"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
              </div>
              <div
                className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full flex items-center justify-center text-sm shadow-md border border-white/20 select-none"
                style={{ background: 'linear-gradient(135deg, #880b3a, #c82360)' }}
              >
                ♥
              </div>
            </motion.div>
          )}

          <span className="section-label tracking-[0.3em]">✦ nuestra historia ✦</span>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <motion.span
              className="font-display text-5xl md:text-7xl font-semibold"
              style={{
                background: 'linear-gradient(135deg, #fff 0%, #ffd0e0 100%)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              }}
              animate={{ opacity: [0.85, 1, 0.85] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            >
              {p1}
            </motion.span>
            <motion.div
              className="flex items-center justify-center"
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
            >
              <span
                className="text-4xl md:text-5xl select-none cursor-pointer"
                style={{ filter: 'drop-shadow(0 0 12px rgba(200,35,96,0.6))' }}
                onClick={handleConfetti}
                title="¡Haz clic! 🎉"
              >
                ♥
              </span>
            </motion.div>
            <motion.span
              className="font-display text-5xl md:text-7xl font-semibold"
              style={{
                background: 'linear-gradient(135deg, #c0a0ff 0%, #fff 100%)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              }}
              animate={{ opacity: [0.85, 1, 0.85] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
            >
              {p2}
            </motion.span>
          </div>
          <p className="text-sm text-muted-soft font-light">
            Desde{' '}
            <span style={{ color: '#e05c82' }}>{formatDate(firstDate)}</span>
            {' '}hasta{' '}
            <span style={{ color: '#9060ff' }}>{formatDate(lastDate)}</span>
          </p>
        </motion.div>

        {/* Days counter circle */}
        <motion.div {...fadeUp(0.15)} className="flex justify-center mb-12">
          <button
            onClick={handleConfetti}
            className="relative group"
            aria-label="Celebrar nuestro amor"
          >
            {/* Outer glow ring */}
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{ background: 'conic-gradient(from 0deg, #880b3a, #c82360, #9060ff, #6830e0, #880b3a)', padding: 2 }}
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            >
              <div className="w-full h-full rounded-full" style={{ background: '#0a0a0f' }} />
            </motion.div>

            <div
              className="relative w-52 h-52 md:w-64 md:h-64 rounded-full flex flex-col items-center justify-center gap-1 m-1"
              style={{
                background: 'radial-gradient(circle at 35% 35%, rgba(136,11,58,0.35), rgba(10,10,15,0.9))',
                border: '1px solid rgba(200,35,96,0.15)',
              }}
            >
              <span className="text-xs text-muted uppercase tracking-widest">llevamos juntos</span>
              <CountUp
                end={daysTotal}
                duration={1800}
                className="font-display text-6xl md:text-7xl font-bold gradient-text"
              />
              <span className="text-sm text-muted-soft">días</span>
              <span className="text-xs text-muted mt-1">Haz clic 🎉</span>
            </div>
          </button>
        </motion.div>

        {/* Love Wrapped launch button */}
        {onOpenWrapped && (
          <motion.div {...fadeUp(0.2)} className="flex justify-center -mt-6 mb-12">
            <button
              onClick={onOpenWrapped}
              className="group relative px-6 py-3 rounded-full text-sm font-medium text-white flex items-center gap-2.5 transition-all duration-300 hover:scale-105 active:scale-95 shadow-glow-wine border border-rose-500/40 overflow-hidden"
              style={{ background: 'linear-gradient(135deg, #880b3a 0%, #c82360 50%, #9060ff 100%)' }}
            >
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <Sparkles size={16} className="text-rose-200 animate-spin-slow" />
              <span className="tracking-wide font-medium">✦ Ver Nuestro Love Wrapped ✦</span>
              <span className="text-rose-200 group-hover:translate-x-1 transition-transform">→</span>
            </button>
          </motion.div>
        )}

        {/* Quick stat cards */}
        <motion.div {...fadeUp(0.25)} className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <StatCard
            icon={<MessageCircle size={20} style={{ color: '#e05c82' }} />}
            label="Mensajes"
            value={<CountUp end={totalMessages} duration={1500} />}
            sub="enviados en total"
            accent="wine"
          />
          <StatCard
            icon={<FileText size={20} style={{ color: '#9060ff' }} />}
            label="Palabras"
            value={<CountUp end={totalWords} duration={1700} />}
            sub="palabras escritas"
            accent="violet"
          />
          <StatCard
            icon={<Image size={20} style={{ color: '#f04080' }} />}
            label="Fotos & Audios"
            value={<CountUp end={totalMediaAll} duration={1400} />}
            sub="archivos compartidos"
            accent="rose"
          />
          <StatCard
            icon={<Calendar size={20} style={{ color: '#f0a800' }} />}
            label="Días juntos"
            value={<CountUp end={daysTotal} duration={1600} />}
            sub="de historia compartida"
            accent="gold"
          />
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1"
        animate={{ y: [0, 8, 0], opacity: [0.4, 0.9, 0.4] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      >
        <span className="text-xs text-muted tracking-wider">Desliza</span>
        <div className="w-px h-8" style={{ background: 'linear-gradient(180deg, rgba(200,35,96,0.6), transparent)' }} />
      </motion.div>
    </section>
  );
}
