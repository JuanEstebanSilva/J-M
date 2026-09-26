import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const ROMANTIC_SYMBOLS = ['♥', '💖', '💕', '✦', '✨', '🤍', '🌸', '★'];

export default function FloatingParticles() {
  const [particles, setParticles] = useState([]);
  const [ambientHearts, setAmbientHearts] = useState([]);

  useEffect(() => {
    // Generate soft drifting romantic particles
    const items = Array.from({ length: 36 }).map((_, i) => ({
      id: i,
      char: ROMANTIC_SYMBOLS[i % ROMANTIC_SYMBOLS.length],
      x: Math.random() * 100, // percentage
      y: Math.random() * 100,
      size: Math.random() * 16 + 12,
      duration: Math.random() * 18 + 16, // gentle 16s - 34s float
      delay: Math.random() * 10,
      opacity: Math.random() * 0.32 + 0.12,
      color:
        i % 4 === 0
          ? '#ffd966'
          : i % 3 === 0
          ? '#f472b6'
          : i % 2 === 0
          ? '#fb7185'
          : '#c084fc',
    }));
    setParticles(items);

    // Deep background glowing heart silhouettes
    const bgHearts = Array.from({ length: 12 }).map((_, i) => ({
      id: `bg-${i}`,
      x: (i * 8.3 + Math.random() * 5) % 100,
      y: (i * 9 + Math.random() * 10) % 100,
      size: Math.random() * 60 + 40,
      duration: Math.random() * 12 + 10,
      delay: i * 0.8,
      opacity: Math.random() * 0.08 + 0.03,
    }));
    setAmbientHearts(bgHearts);
  }, []);

  return (
    <div
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none"
      aria-hidden="true"
    >
      {/* Deepest ambient romantic SVG hearts */}
      {ambientHearts.map((h) => (
        <motion.div
          key={h.id}
          className="absolute"
          style={{
            left: `${h.x}%`,
            top: `${h.y}%`,
            width: `${h.size}px`,
            height: `${h.size}px`,
            opacity: h.opacity,
          }}
          animate={{
            y: ['0px', '-40px', '0px'],
            scale: [1, 1.15, 1],
            rotate: [0, 8, -8, 0],
          }}
          transition={{
            duration: h.duration,
            delay: h.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <svg viewBox="0 0 24 24" fill="url(#heart-grad)" className="w-full h-full drop-shadow-[0_0_20px_rgba(244,114,182,0.3)]">
            <defs>
              <linearGradient id="heart-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#a855f7" stopOpacity="0.8" />
              </linearGradient>
            </defs>
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </motion.div>
      ))}

      {/* Floating romantic sparkles and hearts rising upwards */}
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute select-none"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            fontSize: `${p.size}px`,
            color: p.color,
            textShadow: `0 0 14px ${p.color}`,
          }}
          animate={{
            y: ['0vh', '-50vh', '-100vh'],
            x: [`${p.x}%`, `${(p.x + (p.id % 2 === 0 ? 6 : -6)) % 100}%`, `${p.x}%`],
            opacity: [0, p.opacity, p.opacity * 0.8, 0],
            scale: [0.8, 1.2, 0.9],
            rotate: [0, p.id % 2 === 0 ? 180 : -180],
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
