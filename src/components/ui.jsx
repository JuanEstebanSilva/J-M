import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

/**
 * Animated counter that counts up from 0 to the target value.
 */
export function CountUp({ to, duration = 1500, prefix = '', suffix = '', decimals = 0, className = '' }) {
  const [count, setCount] = useState(0);
  const frameRef = useRef(null);
  const startTimeRef = useRef(null);

  useEffect(() => {
    if (typeof to !== 'number') return;

    const animate = (timestamp) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const progress = Math.min((timestamp - startTimeRef.current) / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * to));

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      } else {
        setCount(to);
      }
    };

    frameRef.current = requestAnimationFrame(animate);
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      startTimeRef.current = null;
    };
  }, [to, duration]);

  const formatted = decimals > 0
    ? count.toFixed(decimals)
    : count.toLocaleString('es-ES');

  return (
    <span className={className}>
      {prefix}{formatted}{suffix}
    </span>
  );
}

/**
 * Stat card with animated number, label and icon.
 */
export function StatCard({ icon: Icon, label, value, suffix = '', prefix = '', color = 'wine', delay = 0, children }) {
  const colorMap = {
    wine: 'from-blossom-wine to-blossom-burgundy',
    peach: 'from-blossom-apricot to-blossom-peach',
    mauve: 'from-blossom-mauve to-blossom-rose',
    sage: 'from-blossom-sage to-emerald-400',
    gold: 'from-blossom-gold to-yellow-400',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="blossom-card p-6 relative overflow-hidden group"
    >
      {/* Background decoration */}
      <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-blossom-rose/10 group-hover:bg-blossom-rose/20 transition-all duration-500" />

      <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br ${colorMap[color]} mb-4 shadow-blossom`}>
        {Icon && <Icon className="w-5 h-5 text-white" />}
      </div>

      <div className="stat-number mb-1">
        {typeof value === 'number' ? (
          <CountUp to={value} prefix={prefix} suffix={suffix} />
        ) : (
          <span>{prefix}{value}{suffix}</span>
        )}
      </div>

      <div className="label-text">{label}</div>

      {children && <div className="mt-3">{children}</div>}
    </motion.div>
  );
}

/**
 * Section wrapper with title and optional subtitle.
 */
export function Section({ title, subtitle, icon: Icon, children, id, className = '' }) {
  return (
    <section id={id} className={`mb-16 ${className}`}>
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="flex items-center gap-3 mb-8"
      >
        {Icon && (
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blossom-wine to-blossom-burgundy flex items-center justify-center shadow-blossom flex-shrink-0">
            <Icon className="w-5 h-5 text-white" />
          </div>
        )}
        <div>
          <h2 className="section-title leading-tight">{title}</h2>
          {subtitle && <p className="font-sans text-sm text-blossom-mauve mt-0.5">{subtitle}</p>}
        </div>
      </motion.div>
      {children}
    </section>
  );
}

/**
 * Comparison bar for two participants.
 */
export function ComparisonBar({ p1Name, p1Value, p2Name, p2Value, total, label, formatValue }) {
  const p1Pct = Math.round((p1Value / total) * 100);
  const p2Pct = 100 - p1Pct;
  const fmt = formatValue || ((v) => v.toLocaleString('es-ES'));

  return (
    <div className="mb-4">
      {label && <p className="label-text mb-2">{label}</p>}
      <div className="flex items-center gap-2 mb-1.5">
        <span className="font-sans text-xs text-blossom-burgundy font-medium w-24 truncate">{p1Name}</span>
        <div className="flex-1 h-3 rounded-full bg-blossom-blush overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            whileInView={{ width: `${p1Pct}%` }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
            className="h-full rounded-full bg-gradient-to-r from-blossom-wine to-blossom-mauve"
          />
        </div>
        <span className="font-mono text-xs text-blossom-wine font-medium w-20 text-right">{p1Pct}% · {fmt(p1Value)}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="font-sans text-xs text-blossom-burgundy font-medium w-24 truncate">{p2Name}</span>
        <div className="flex-1 h-3 rounded-full bg-blossom-blush overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            whileInView={{ width: `${p2Pct}%` }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: 'easeOut', delay: 0.4 }}
            className="h-full rounded-full bg-gradient-to-r from-blossom-peach to-blossom-apricot"
          />
        </div>
        <span className="font-mono text-xs text-blossom-apricot font-medium w-20 text-right">{p2Pct}% · {fmt(p2Value)}</span>
      </div>
    </div>
  );
}

/**
 * Polaroid-style message card.
 */
export function PolaroidMessage({ message, onShuffle }) {
  if (!message) return null;

  const dateStr = message.date?.toLocaleDateString('es-ES', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  return (
    <motion.div
      key={message.text.slice(0, 20)}
      initial={{ opacity: 0, scale: 0.9, rotate: -2 }}
      animate={{ opacity: 1, scale: 1, rotate: -1 }}
      exit={{ opacity: 0, scale: 0.9, rotate: 2 }}
      whileHover={{ rotate: 0, scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      className="relative bg-white shadow-blossom-lg rounded-sm p-5 pb-12 mx-auto max-w-sm cursor-pointer"
      style={{
        filter: 'drop-shadow(0 8px 24px rgba(139, 58, 82, 0.15))',
        transformOrigin: 'center bottom',
      }}
      onClick={onShuffle}
    >
      {/* Photo area (top) */}
      <div className="w-full h-2 bg-gradient-to-r from-blossom-rose/20 to-blossom-peach/20 rounded-sm mb-4" />

      {/* Message */}
      <blockquote className="font-display italic text-blossom-plum text-lg leading-relaxed min-h-[5rem] flex items-center">
        "{message.text.length > 200 ? message.text.slice(0, 200) + '…' : message.text}"
      </blockquote>

      {/* Footer */}
      <div className="absolute bottom-3 left-5 right-5 flex items-center justify-between">
        <p className="font-sans text-xs text-blossom-mauve font-medium">{message.author}</p>
        <p className="font-mono text-xs text-blossom-rose/70">{dateStr}</p>
      </div>

      {/* Tape decoration */}
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-12 h-5 bg-blossom-blush/80 rounded-sm opacity-70" />
    </motion.div>
  );
}
