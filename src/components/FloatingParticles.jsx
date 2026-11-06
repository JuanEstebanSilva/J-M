import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const SYMBOLS = ['♥', '💖', '🌸', '✦', '✨', '🤍', '★', '🌷'];

export default function FloatingParticles() {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    // Detect mobile or small screens to further optimize particle count
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    const count = isMobile ? 12 : 22;

    const items = Array.from({ length: count }).map((_, i) => ({
      id: i,
      char: SYMBOLS[i % SYMBOLS.length],
      x: Math.round(Math.random() * 95),
      size: isMobile ? Math.random() * 8 + 10 : Math.random() * 12 + 12,
      duration: Math.random() * 16 + 18,
      delay: Math.random() * 8,
      opacity: Math.random() * 0.25 + 0.1,
      color:
        i % 4 === 0 ? 'rgba(201,169,110,0.75)' :
        i % 3 === 0 ? 'rgba(255,143,163,0.7)' :
        i % 2 === 0 ? 'rgba(200,35,96,0.6)' :
                      'rgba(180,120,255,0.6)',
      drift: (i % 2 === 0 ? 1 : -1) * (12 + (i % 4) * 6),
    }));
    setParticles(items);
  }, []);

  return (
    <div
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none"
      aria-hidden="true"
    >
      {/* 2-3 Ambient soft SVG heart glows */}
      <div className="absolute top-1/4 left-5 w-36 h-36 md:w-56 md:h-56 opacity-[0.04] pointer-events-none">
        <svg viewBox="0 0 24 24" className="w-full h-full fill-rose-500">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
      </div>

      <div className="absolute bottom-1/3 right-5 w-40 h-40 md:w-64 md:h-64 opacity-[0.04] pointer-events-none">
        <svg viewBox="0 0 24 24" className="w-full h-full fill-amber-500">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
      </div>

      {/* Floating romantic symbols rendered with GPU transforms only */}
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute select-none will-change-transform"
          style={{
            left: `${p.x}%`,
            bottom: '-10%',
            fontSize: `${p.size}px`,
            color: p.color,
          }}
          animate={{
            y: ['0vh', '-115vh'],
            x: [0, p.drift, -p.drift * 0.5, 0],
            opacity: [0, p.opacity, p.opacity, 0],
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
    </div>
  );
}
