import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { startBackgroundMusic } from '../utils/romanticAudio.js';

const PETALS = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  char: ['🌸','✦','♥','🌺','✨','❀','🌷','⋆','💮'][i % 9],
  x: 5 + (i * 5.5) % 90,
  size: 14 + (i % 5) * 6,
  duration: 12 + (i % 7) * 3,
  delay: (i % 9) * 1.1,
  drift: (i % 2 === 0 ? 1 : -1) * (20 + (i % 4) * 10),
}));

export default function WelcomeScreen({ onDone }) {
  const handleEnter = () => {
    startBackgroundMusic('laDistancia');
    onDone();
  };

  useEffect(() => {
    const timer = setTimeout(() => onDone(), 5000);
    return () => clearTimeout(timer);
  }, [onDone]);

  return (
    <motion.div
      onClick={handleEnter}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden cursor-pointer select-none"
      style={{
        background: 'linear-gradient(160deg, #07050f 0%, #0d0718 40%, #110820 70%, #07050f 100%)',
      }}
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.04 }}
      transition={{ duration: 1, ease: [0.4, 0, 0.2, 1] }}
    >
      {/* Corner ambient glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute rounded-full"
          style={{
            top: '-20%', left: '-15%',
            width: 600, height: 600,
            background: 'radial-gradient(circle, rgba(107,28,63,0.3) 0%, transparent 65%)',
          }}
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.9, 0.5] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute rounded-full"
          style={{
            bottom: '-20%', right: '-15%',
            width: 500, height: 500,
            background: 'radial-gradient(circle, rgba(100,50,220,0.22) 0%, transparent 65%)',
          }}
          animate={{ scale: [1, 1.25, 1], opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
        />
        <motion.div
          className="absolute rounded-full"
          style={{
            top: '30%', right: '10%',
            width: 300, height: 300,
            background: 'radial-gradient(circle, rgba(201,169,110,0.08) 0%, transparent 65%)',
          }}
          animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        />
      </div>

      {/* Falling petals */}
      {PETALS.map((p) => (
        <motion.div
          key={p.id}
          className="absolute pointer-events-none"
          style={{
            left: `${p.x}%`,
            bottom: '-5%',
            fontSize: p.size,
            color: p.id % 3 === 0
              ? 'rgba(201,169,110,0.7)'
              : p.id % 2 === 0
              ? 'rgba(255,143,163,0.6)'
              : 'rgba(200,35,96,0.5)',
            filter: 'blur(0.3px)',
          }}
          animate={{
            y: [0, -(window.innerHeight * 1.2)],
            x: [0, p.drift, p.drift * 0.5, p.drift * -0.3, 0],
            rotate: [0, p.drift > 0 ? 180 : -180],
            opacity: [0, 0.8, 0.7, 0.4, 0],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: 'linear',
          }}
        >
          {p.char}
        </motion.div>
      ))}

      {/* Main content */}
      <div className="relative z-10 text-center px-8 flex flex-col items-center gap-8 max-w-2xl">

        {/* Spinning ring + Heart */}
        <motion.div
          className="relative"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.9, type: 'spring', stiffness: 180 }}
        >
          {/* Outer spinning conic ring */}
          <motion.div
            className="absolute -inset-4 rounded-full"
            style={{
              background: 'conic-gradient(from 0deg, rgba(107,28,63,0) 0%, rgba(200,35,96,0.7) 25%, rgba(201,169,110,0.8) 50%, rgba(139,92,246,0.5) 75%, rgba(107,28,63,0) 100%)',
              filter: 'blur(6px)',
            }}
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
          />
          {/* Heart container */}
          <motion.div
            className="relative w-24 h-24 rounded-full flex items-center justify-center text-5xl"
            style={{
              background: 'linear-gradient(135deg, #6B1C3F, #c82360, #9B6B9B)',
              boxShadow: '0 0 40px rgba(200,35,96,0.5), 0 0 80px rgba(107,28,63,0.3)',
            }}
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
          >
            ♥
          </motion.div>
        </motion.div>

        {/* Titles */}
        <motion.div
          className="flex flex-col items-center gap-3"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        >
          <span
            className="section-label"
            style={{ letterSpacing: '0.3em' }}
          >
            ✦ UN REGALO DE AMOR ✦
          </span>

          <h1
            className="font-display leading-none"
            style={{
              fontSize: 'clamp(3.5rem, 10vw, 6.5rem)',
              fontWeight: 700,
              background: 'linear-gradient(145deg, #fff8f0 0%, #FFD6E0 30%, #FF8FA3 60%, #C9A96E 85%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              textShadow: 'none',
              filter: 'drop-shadow(0 4px 24px rgba(200,35,96,0.3))',
            }}
          >
            Juanes &amp; Pau
          </h1>

          <p
            className="font-romantic text-2xl md:text-3xl"
            style={{ color: 'rgba(201,169,110,0.9)', letterSpacing: '0.02em' }}
          >
            Nuestra Historia de Amor
          </p>
        </motion.div>

        {/* Decorative rule */}
        <motion.div
          className="flex items-center gap-4 w-full max-w-xs"
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.8 }}
        >
          <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(201,169,110,0.6))' }} />
          <span style={{ color: 'rgba(201,169,110,0.8)', fontSize: '0.75rem' }}>♦</span>
          <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, rgba(201,169,110,0.6), transparent)' }} />
        </motion.div>

        {/* Subtitle */}
        <motion.p
          className="text-base text-white/70 font-light tracking-wide max-w-sm text-center leading-relaxed"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.8 }}
        >
          Cada mensaje, cada risa, cada momento — todo aquí, con amor.
        </motion.p>

        {/* CTA Button */}
        <motion.button
          onClick={(e) => { e.stopPropagation(); handleEnter(); }}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.3, duration: 0.7 }}
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.95 }}
          className="glow-btn text-base font-semibold px-10 py-4 mt-2 tracking-widest"
          style={{ letterSpacing: '0.12em', fontSize: '0.9rem' }}
        >
          <span>🎵</span>
          <span>ENTRAR CON MÚSICA</span>
          <span style={{ color: 'rgba(255,214,224,0.8)' }}>♥</span>
        </motion.button>

        <motion.p
          className="text-xs text-white/35 tracking-widest"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6 }}
        >
          o toca cualquier parte para comenzar
        </motion.p>
      </div>
    </motion.div>
  );
}
