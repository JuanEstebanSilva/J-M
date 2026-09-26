import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, Sparkles, Music } from 'lucide-react';
import { startBackgroundMusic } from '../utils/romanticAudio.js';

const PARTICLES = Array.from({ length: 14 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: 2 + Math.random() * 4,
  delay: Math.random() * 3,
  duration: 3 + Math.random() * 4,
}));

const HEARTS = ['♡', '♥', '💕', '✦', '⋆', '✨'];

export default function WelcomeScreen({ onDone }) {
  const handleEnter = () => {
    // Start La Distancia softly upon entering
    startBackgroundMusic('laDistancia');
    onDone();
  };

  // Fallback timer if user doesn't click
  useEffect(() => {
    const timer = setTimeout(() => {
      onDone();
    }, 4500);
    return () => clearTimeout(timer);
  }, [onDone]);

  return (
    <motion.div
      onClick={handleEnter}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden cursor-pointer"
      style={{ background: 'linear-gradient(135deg, #0a0a0f 0%, #0f0a14 40%, #14091a 70%, #0a0a0f 100%)' }}
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.03 }}
      transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
    >
      {/* Ambient background glows */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          className="absolute rounded-full"
          style={{
            top: '10%', left: '15%',
            width: 500, height: 500,
            background: 'radial-gradient(circle, rgba(136,11,58,0.25) 0%, transparent 65%)',
          }}
          animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute rounded-full"
          style={{
            bottom: '10%', right: '10%',
            width: 400, height: 400,
            background: 'radial-gradient(circle, rgba(104,48,224,0.2) 0%, transparent 65%)',
          }}
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        />
      </div>

      {/* Floating particles */}
      {PARTICLES.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full pointer-events-none"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            background: p.id % 2 === 0
              ? 'rgba(200,35,96,0.5)'
              : 'rgba(144,96,255,0.4)',
          }}
          animate={{ y: [-20, 20, -20], opacity: [0, 0.8, 0] }}
          transition={{ duration: p.duration, repeat: Infinity, delay: p.delay, ease: 'easeInOut' }}
        />
      ))}

      {/* Floating heart symbols */}
      {HEARTS.map((h, i) => (
        <motion.span
          key={i}
          className="absolute text-lg select-none pointer-events-none"
          style={{
            left: `${12 + i * 14}%`,
            color: i % 2 === 0 ? 'rgba(200,35,96,0.35)' : 'rgba(144,96,255,0.3)',
          }}
          animate={{ y: [-40, 40], opacity: [0, 0.6, 0] }}
          transition={{ duration: 4 + i * 0.5, repeat: Infinity, delay: i * 0.4, ease: 'easeInOut' }}
        />
      ))}

      {/* Main content */}
      <div className="relative z-10 text-center px-8 flex flex-col items-center gap-6">
        {/* Glowing Heart Icon */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.7, type: 'spring', stiffness: 200 }}
        >
          <motion.div
            className="w-20 h-20 rounded-full flex items-center justify-center text-4xl shadow-glow-wine"
            style={{ background: 'linear-gradient(135deg, #880b3a, #c82360, #9060ff)' }}
            animate={{ scale: [1, 1.08, 1] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
          >
            ♥
          </motion.div>
        </motion.div>

        {/* Title */}
        <motion.div
          className="flex flex-col items-center gap-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="section-label text-sm tracking-[0.3em]">✦ UN REGALO DE AMOR ✦</p>
          <h1
            className="font-display text-5xl md:text-7xl font-bold leading-tight"
            style={{
              background: 'linear-gradient(135deg, #fff 0%, #ffd0e0 40%, #c0a0ff 80%, #fff 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Juanes &amp; Pau
          </h1>
          <h2
            className="font-display text-2xl md:text-3xl font-light italic"
            style={{ color: 'rgba(240,64,128,0.9)' }}
          >
            Nuestra Historia en Datos ✨
          </h2>
        </motion.div>

        {/* Decorative line */}
        <motion.div
          className="h-1 w-56 mx-auto rounded-full"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(200,35,96,0.8), rgba(144,96,255,0.6), transparent)' }}
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.9 }}
        />

        {/* Subtitle */}
        <motion.p
          className="text-base text-white/80 font-light tracking-wide max-w-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.85, duration: 0.8 }}
        >
          Cargando cada momento, risa y recuerdo juntos…
        </motion.p>

        {/* Enter Button with sound icon */}
        <motion.button
          onClick={(e) => {
            e.stopPropagation();
            handleEnter();
          }}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 0.6 }}
          whileHover={{ scale: 1.06, boxShadow: '0 0 35px rgba(200,35,96,0.5)' }}
          whileTap={{ scale: 0.95 }}
          className="px-8 py-3.5 rounded-full font-semibold text-sm text-white flex items-center gap-2.5 shadow-2xl transition-all border border-white/20 mt-2"
          style={{ background: 'linear-gradient(135deg, #880b3a, #c82360, #9060ff)' }}
        >
          <Music size={15} className="text-pink-300 animate-pulse" />
          <span>Entrar a Nuestra Historia</span>
          <Heart size={14} className="fill-white text-white" />
        </motion.button>

        <p className="text-[11px] text-white/40 tracking-wider">
          Toca en cualquier parte para comenzar con música de fondo 🎶
        </p>
      </div>
    </motion.div>
  );
}
