import { useState, useEffect, useRef } from 'react';

// ─── CountUp ──────────────────────────────────────────────────────────────────
export function CountUp({ end, duration = 1500, prefix = '', suffix = '', decimals = 0, className = '' }) {
  const [value, setValue] = useState(0);
  const frameRef = useRef(null);

  useEffect(() => {
    if (end === 0 || end === null || end === undefined) return;
    const start = 0;
    const startTime = performance.now();

    const update = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out-cubic
      const current = start + (end - start) * eased;
      setValue(parseFloat(current.toFixed(decimals)));
      if (progress < 1) frameRef.current = requestAnimationFrame(update);
    };

    frameRef.current = requestAnimationFrame(update);
    return () => cancelAnimationFrame(frameRef.current);
  }, [end, duration, decimals]);

  const formatted = decimals > 0
    ? value.toFixed(decimals)
    : Math.round(value).toLocaleString('es-CO');

  return (
    <span className={className}>
      {prefix}{formatted}{suffix}
    </span>
  );
}

// ─── StatCard ─────────────────────────────────────────────────────────────────
export function StatCard({ icon, label, value, sub, accent = 'wine', className = '' }) {
  const accentMap = {
    wine:   'rgba(200,35,96,0.16)',
    violet: 'rgba(144,96,255,0.16)',
    rose:   'rgba(240,64,128,0.16)',
    gold:   'rgba(240,168,0,0.16)',
  };
  const borderMap = {
    wine:   'rgba(200,35,96,0.3)',
    violet: 'rgba(144,96,255,0.3)',
    rose:   'rgba(240,64,128,0.3)',
    gold:   'rgba(240,168,0,0.3)',
  };
  const glowMap = {
    wine:   '0 10px 30px rgba(200,35,96,0.2)',
    violet: '0 10px 30px rgba(144,96,255,0.2)',
    rose:   '0 10px 30px rgba(240,64,128,0.2)',
    gold:   '0 10px 30px rgba(240,168,0,0.2)',
  };

  return (
    <div
      className={`relative rounded-3xl p-6 flex flex-col gap-3 transition-all duration-300 hover:-translate-y-1.5 ${className}`}
      style={{
        background: `linear-gradient(145deg, ${accentMap[accent] || accentMap.wine}, rgba(18, 14, 28, 0.85))`,
        border: `1px solid ${borderMap[accent] || borderMap.wine}`,
        boxShadow: glowMap[accent] || glowMap.wine,
        backdropFilter: 'blur(16px)',
      }}
    >
      <div className="flex items-center justify-between">
        <span className="text-3xl p-2.5 rounded-2xl bg-white/5 border border-white/10 shadow-inner">{icon}</span>
      </div>
      <div className="text-3xl sm:text-4xl md:text-5xl font-black text-white font-mono tracking-tight">{value}</div>
      <div className="text-sm font-bold text-white/90 uppercase tracking-widest">{label}</div>
      {sub && <div className="text-xs text-white/70 font-light mt-0.5">{sub}</div>}
    </div>
  );
}

// ─── Section ──────────────────────────────────────────────────────────────────
export function Section({ id, label, title, children, className = '' }) {
  return (
    <section id={id} className={`py-20 ${className}`}>
      <div className="mb-12">
        {label && <p className="section-label mb-3 inline-block">{label}</p>}
        {title && (
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight mt-2">
            {title}
          </h2>
        )}
        <div className="mt-5 h-1 w-24 shimmer-line rounded-full" />
      </div>
      {children}
    </section>
  );
}

// ─── ComparisonBar ────────────────────────────────────────────────────────────
export function ComparisonBar({ p1, p2, val1, val2, label, formatFn }) {
  const total = val1 + val2 || 1;
  const pct1  = Math.round((val1 / total) * 100);
  const pct2  = 100 - pct1;
  const fmt   = formatFn || ((v) => v.toLocaleString('es-CO'));

  return (
    <div className="space-y-3">
      {label && <p className="text-sm font-semibold text-white/80 uppercase tracking-wider">{label}</p>}
      <div className="flex items-center gap-3">
        <span className="text-base font-semibold text-white/90 w-28 truncate text-right">{p1}</span>
        <div className="flex-1 flex gap-1.5 items-center">
          <div
            className="h-3.5 rounded-l-full transition-all duration-1000 shadow-sm"
            style={{
              width: `${pct1}%`,
              background: 'linear-gradient(90deg, #880b3a, #c82360)',
            }}
          />
          <div
            className="h-3.5 rounded-r-full transition-all duration-1000 shadow-sm"
            style={{
              width: `${pct2}%`,
              background: 'linear-gradient(90deg, #6830e0, #9060ff)',
            }}
          />
        </div>
        <span className="text-base font-semibold text-white/90 w-28 truncate">{p2}</span>
      </div>
      <div className="flex justify-between text-xs sm:text-sm font-mono text-white/70">
        <span>{fmt(val1)} <strong className="text-rose-400">({pct1}%)</strong></span>
        <span><strong className="text-violet-400">({pct2}%)</strong> {fmt(val2)}</span>
      </div>
    </div>
  );
}

// ─── PolaroidMessage ──────────────────────────────────────────────────────────
export function PolaroidMessage({ msg, author, date, isSent, photo }) {
  const dateStr = date
    ? new Date(date).toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' })
    : '';

  return (
    <div className="relative flex flex-col gap-3 max-w-md mx-auto p-4 rounded-3xl bg-white/[0.04] border border-white/10 shadow-2xl backdrop-blur-xl">
      {photo && (
        <div className="w-full h-44 rounded-2xl overflow-hidden border border-white/15 mb-2 relative shadow-lg group">
          <img src={photo.src} alt={photo.alt} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
          <div className="absolute bottom-2.5 left-3 text-xs text-white font-medium px-3 py-1 rounded-full bg-black/50 backdrop-blur-md border border-white/20">
            {photo.tag}
          </div>
          {photo.location && (
            <div className="absolute top-2.5 right-3 text-[11px] text-white/90 font-medium px-2.5 py-0.5 rounded-full bg-wine-600/70 backdrop-blur-md">
              📍 {photo.location}
            </div>
          )}
        </div>
      )}
      <div className="text-xs font-mono text-white/60 text-center tracking-wider">{dateStr}</div>
      <div className={isSent ? 'flex justify-end' : 'flex justify-start'}>
        <div
          className="rounded-3xl px-6 py-4 text-base sm:text-lg leading-relaxed shadow-xl max-w-sm"
          style={
            isSent
              ? { background: 'linear-gradient(135deg, rgba(144,20,68,0.85), rgba(200,35,96,0.75))', border: '1px solid rgba(255,255,255,0.15)' }
              : { background: 'rgba(38,32,54,0.92)', border: '1px solid rgba(255,255,255,0.1)' }
          }
        >
          <p className="text-white font-medium italic font-serif">"{msg}"</p>
        </div>
      </div>
      <div className={`text-xs font-semibold uppercase tracking-wider text-rose-300 ${isSent ? 'text-right' : 'text-left'} px-3`}>
        {author}
      </div>
    </div>
  );
}

// ─── Loading shimmer ──────────────────────────────────────────────────────────
export function Shimmer({ className = '' }) {
  return (
    <div
      className={`rounded-2xl animate-pulse ${className}`}
      style={{ background: 'linear-gradient(90deg, rgba(255,255,255,0.04), rgba(255,255,255,0.08), rgba(255,255,255,0.04))' }}
    />
  );
}

// ─── Divider ──────────────────────────────────────────────────────────────────
export function Divider() {
  return (
    <div className="relative flex items-center py-4">
      <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(200,35,96,0.45), rgba(144,96,255,0.35), transparent)' }} />
    </div>
  );
}
