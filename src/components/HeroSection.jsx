import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Heart, MessageCircle, BookOpen, Calendar } from 'lucide-react';
import { CountUp } from './ui.jsx';
import confetti from 'canvas-confetti';

export default function HeroSection({ analytics }) {
  const { participants, totalMessages, totalWords, daysTogether, firstMessage, lastMessage } = analytics;
  const hasConfettiRef = useRef(false);

  useEffect(() => {
    if (hasConfettiRef.current) return;
    hasConfettiRef.current = true;

    // Heart confetti burst
    const end = Date.now() + 1500;
    const colors = ['#E8B4B8', '#C07B8E', '#8B3A52', '#F0A896', '#D4A853'];

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors,
        shapes: ['circle'],
        scalar: 0.8,
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors,
        shapes: ['circle'],
        scalar: 0.8,
      });
      if (Date.now() < end) requestAnimationFrame(frame);
    };
    setTimeout(frame, 300);
  }, []);

  const firstDateStr = firstMessage?.date?.toLocaleDateString('es-ES', {
    day: 'numeric', month: 'long', year: 'numeric'
  });
  const lastDateStr = lastMessage?.date?.toLocaleDateString('es-ES', {
    day: 'numeric', month: 'long', year: 'numeric'
  });

  const years = Math.floor(daysTogether / 365);
  const months = Math.floor((daysTogether % 365) / 30);

  return (
    <div className="relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-72 h-72 rounded-full bg-blossom-rose/20 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-blossom-peach/20 blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10"
      >
        {/* Main hero card */}
        <div className="blossom-card p-8 md:p-12 mb-8 relative overflow-hidden">
          {/* Inner decoration */}
          <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-gradient-to-bl from-blossom-blush/40 to-transparent pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full bg-gradient-to-tr from-blossom-rose/20 to-transparent pointer-events-none" />

          <div className="relative z-10 text-center">
            {/* Hearts icon */}
            <motion.div
              className="heartbeat inline-flex mb-6"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
            >
              <span className="text-5xl">❤️</span>
            </motion.div>

            {/* Names */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="flex items-center justify-center gap-4 mb-6 flex-wrap"
            >
              <span className="font-display text-3xl md:text-4xl text-blossom-wine font-semibold">
                {participants[0]}
              </span>
              <span className="text-3xl">🌸</span>
              <span className="font-display text-3xl md:text-4xl text-blossom-burgundy font-semibold">
                {participants[1]}
              </span>
            </motion.div>

            {/* Title */}
            <h1 className="font-display text-4xl md:text-6xl text-blossom-plum font-bold mb-2 leading-tight">
              Nuestra <span className="italic text-gradient-blossom">Historia</span>
            </h1>
            <p className="font-sans text-blossom-mauve text-lg mb-8">
              {firstDateStr} — {lastDateStr}
            </p>

            {/* Days counter — big impact */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, type: 'spring', stiffness: 150 }}
              className="inline-flex flex-col items-center justify-center w-52 h-52 rounded-full bg-gradient-to-br from-blossom-wine to-blossom-plum shadow-blossom-lg mx-auto mb-8"
            >
              <span className="font-display text-6xl font-bold text-white leading-none">
                <CountUp to={daysTogether} duration={2000} />
              </span>
              <span className="font-sans text-white/80 text-sm mt-1 tracking-widest uppercase">días</span>
              {(years > 0 || months > 0) && (
                <span className="font-sans text-white/60 text-xs mt-1">
                  {years > 0 ? `${years} año${years > 1 ? 's' : ''}` : ''}
                  {years > 0 && months > 0 ? ' y ' : ''}
                  {months > 0 ? `${months} mes${months > 1 ? 'es' : ''}` : ''}
                </span>
              )}
            </motion.div>
          </div>
        </div>

        {/* Quick stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              icon: MessageCircle,
              label: 'Mensajes',
              value: totalMessages,
              color: 'from-blossom-wine to-blossom-burgundy',
              delay: 0.1,
            },
            {
              icon: BookOpen,
              label: 'Palabras',
              value: totalWords,
              color: 'from-blossom-apricot to-blossom-peach',
              delay: 0.2,
            },
            {
              icon: Calendar,
              label: 'Años juntos',
              value: years || '< 1',
              color: 'from-blossom-mauve to-blossom-rose',
              isText: true,
              delay: 0.3,
            },
            {
              icon: Heart,
              label: 'Por día aprox.',
              value: Math.round(totalMessages / Math.max(daysTogether, 1)),
              suffix: ' msgs',
              color: 'from-blossom-gold to-yellow-400',
              delay: 0.4,
            },
          ].map(({ icon: Icon, label, value, color, delay, isText, suffix }) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay, duration: 0.5 }}
              whileHover={{ y: -4 }}
              className="blossom-card p-5 text-center"
            >
              <div className={`inline-flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br ${color} mb-3 shadow-blossom`}>
                <Icon className="w-4.5 h-4.5 text-white" size={18} />
              </div>
              <div className="stat-number text-3xl mb-0.5">
                {isText ? value : <CountUp to={typeof value === 'number' ? value : 0} duration={1800} suffix={suffix || ''} />}
              </div>
              <p className="label-text text-xs">{label}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
