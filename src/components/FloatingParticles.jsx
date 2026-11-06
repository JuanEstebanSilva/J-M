import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const SYMBOLS = ['♥', '💖', '🌸', '✦', '✨', '🤍', '🌺', '★', '❀', '🌷', '♡', '⋆'];

export default function FloatingParticles() {
  const [particles, setParticles] = useState([]);
  const [ambientHearts, setAmbientHearts] = useState([]);
  const [dustParticles, setDustParticles] = useState([]);

  useEffect(() => {
    const items = Array.from({ length: 50 }).map((_, i) => ({
      id: i,
      char: SYMBOLS[i % SYMBOLS.length],
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 18 + 10,
      duration: Math.random() * 22 + 18,
      delay: Math.random() * 12,
      opacity: Math.random() * 0.28 + 0.08,
      color:
        i % 5 === 0 ? 'rgba(201,169,110,0.75)' :
        i % 4 === 0 ? 'rgba(255,143,163,0.65)' :
        i % 3 === 0 ? 'rgba(255,180,200,0.6)'  :
        i % 2 === 0 ? 'rgba(200,35,96,0.55)'   :
                      'rgba(180,120,255,0.5)',
      drift: (i % 2 === 0 ? 1 : -1) * (8 + (i % 5) * 4),
    }));
    setParticles(items);

    const bgHearts = Array.from({ length: 14 }).map((_, i) => ({
      id: `bg-${i}`,
      x: (i * 7.5 + Math.random() * 4) % 100,
      y: (i * 8 + Math.random() * 8) % 100,
      size: Math.random() * 80 + 50,
      duration: Math.random() * 14 + 12,
      delay: i * 0.7,
      opacity: Math.random() * 0.065 + 0.02,
    }));
    setAmbientHearts(bgHearts);

    const dust = Array.from({ length: 24 }).map((_, i) => ({
      id: `dust-${i}`,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2.5 + 1,
      duration: Math.random() * 8 + 6,
      delay: Math.random() * 8,
    }));
    setDustParticles(dust);
  }, []);

  return (
    <div
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none"
      aria-hidden="true"
    >
      {/* Ambient heart silhouettes */}
      {ambientHearts.map((h) => (
        <motion.div
          key={h.id}
          className="absolute"
          style={{ left: `${h.x}%`, top: `${h.y}%`, width: `${h.size}px`, height: `${h.size}px`, opacity: h.opacity }}
          animate={{ y: ['0px', '-50px', '0px'], scale: [1, 1.12, 1], rotate: [0, 6, -6, 0] }}
          transition={{ duration: h.duration, delay: h.delay, repeat: Infinity, ease: 'easeInOut' }}
        >
          <svg viewBox="0 0 24 24" className="w-full h-full">
            <defs>
              <linearGradient id={`hg-${h.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#c82360" stopOpacity="0.9" />
                <stop offset="50%" stopColor="#C9A96E" stopOpacity="0.7" />
                <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.8" />
              </linearGradient>
            </defs>
            <path fill={`url(#hg-${h.id})`} d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </motion.div>
      ))}

      {/* Gold dust sparkles */}
      {dustParticles.map((d) => (
        <motion.div
          key={d.id}
          className="absolute rounded-full"
          style={{
            left: `${d.x}%`,
            top: `${d.y}%`,
            width: d.size,
            height: d.size,
            background: 'radial-gradient(circle, rgba(201,169,110,0.9) 0%, transparent 70%)',
            boxShadow: '0 0 4px rgba(201,169,110,0.6)',
          }}
          animate={{ opacity: [0, 1, 0], scale: [0.5, 1.5, 0.5] }}
          transition={{ duration: d.duration, delay: d.delay, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}

      {/* Floating romantic particles */}
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute select-none"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            fontSize: `${p.size}px`,
            color: p.color,
            textShadow: `0 0 12px ${p.color}`,
            filter: 'blur(0.2px)',
          }}
          animate={{
            y: ['0vh', '-55vh', '-110vh'],
            x: [`0px`, `${p.drift}px`, `${-p.drift * 0.5}px`, `0px`],
            opacity: [0, p.opacity, p.opacity * 0.9, p.opacity * 0.5, 0],
            scale: [0.7, 1.15, 0.9, 0.7],
            rotate: [0, p.id % 2 === 0 ? 90 : -90],
          }}
          transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: 'linear' }}
        >
          {p.char}
        </motion.div>
      ))}
    </div>
  );
}
