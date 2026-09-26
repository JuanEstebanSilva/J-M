import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const HEARTS = ['♥', '♡', '✨', '✦', '💖', '⭐'];

export default function FloatingParticles() {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    // Generate random romantic floating particles
    const items = Array.from({ length: 22 }).map((_, i) => ({
      id: i,
      char: HEARTS[i % HEARTS.length],
      x: Math.random() * 100, // percentage
      y: Math.random() * 100,
      size: Math.random() * 18 + 12,
      duration: Math.random() * 14 + 16, // 16s - 30s float
      delay: Math.random() * 8,
      opacity: Math.random() * 0.28 + 0.08,
      color: i % 3 === 0 ? '#ffd966' : i % 2 === 0 ? '#f04080' : '#9060ff',
    }));
    setParticles(items);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
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
          }}
          animate={{
            y: ['0vh', '-60vh', '-120vh'],
            x: [`${p.x}%`, `${(p.x + (p.id % 2 === 0 ? 8 : -8)) % 100}%`, `${p.x}%`],
            opacity: [0, p.opacity, p.opacity, 0],
            rotate: [0, p.id % 2 === 0 ? 360 : -360],
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
