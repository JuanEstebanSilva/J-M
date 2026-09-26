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
    wine:   'rgba(200,35,96,0.12)',
    violet: 'rgba(144,96,255,0.12)',
    rose:   'rgba(240,64,128,0.12)',
    gold:   'rgba(240,168,0,0.12)',
  };
  const borderMap = {
    wine:   'rgba(200,35,96,0.2)',
    violet: 'rgba(144,96,255,0.2)',
    rose:   'rgba(240,64,128,0.2)',
    gold:   'rgba(240,168,0,0.2)',
  };

  return (
    <div
      className={`relative rounded-2xl p-5 flex flex-col gap-2 transition-all duration-300 hover:-translate-y-1 ${className}`}
      style={{
        background: accentMap[accent] || accentMap.wine,
        border: `1px solid ${borderMap[accent] || borderMap.wine}`,
        backdropFilter: 'blur(12px)',
      }}
    >
      <div className="flex items-center justify-between">
        <span className="text-2xl">{icon}</span>
      </div>
      <div className="text-2xl font-bold text-white font-mono">{value}</div>
      <div className="text-xs font-medium text-muted-soft uppercase tracking-wider">{label}</div>
      {sub && <div className="text-xs text-muted mt-0.5">{sub}</div>}
    </div>
  );
}

// ─── Section ──────────────────────────────────────────────────────────────────
export function Section({ id, label, title, children, className = '' }) {
  return (
    <section id={id} className={`py-16 ${className}`}>
      <div className="mb-10">
        {label && <p className="section-label mb-2">{label}</p>}
        {title && (
          <h2 className="font-display text-3xl md:text-4xl font-semibold text-white/90">
            {title}
          </h2>
        )}
        <div className="mt-4 h-px w-16 shimmer-line rounded-full" />
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
    <div className="space-y-2">
      {label && <p className="text-xs text-muted-soft uppercase tracking-wider">{label}</p>}
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-white/80 w-24 truncate text-right">{p1}</span>
        <div className="flex-1 flex gap-1 items-center">
          <div
            className="h-2.5 rounded-l-full transition-all duration-1000"
            style={{
              width: `${pct1}%`,
              background: 'linear-gradient(90deg, #880b3a, #c82360)',
            }}
          />
          <div
            className="h-2.5 rounded-r-full transition-all duration-1000"
            style={{
              width: `${pct2}%`,
              background: 'linear-gradient(90deg, #6830e0, #9060ff)',
            }}
          />
        </div>
        <span className="text-sm font-medium text-white/80 w-24 truncate">{p2}</span>
      </div>
      <div className="flex justify-between text-xs text-muted">
        <span>{fmt(val1)} <span className="text-white/30">({pct1}%)</span></span>
        <span className="text-white/30">{fmt(val2)} ({pct2}%)</span>
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
    <div className="flex flex-col gap-2 max-w-sm mx-auto">
      {photo && (
        <div className="w-full h-32 rounded-xl overflow-hidden border border-white/10 mb-1 relative shadow-md">
          <img src={photo.src} alt={photo.alt} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <div className="absolute bottom-1.5 left-2 text-[10px] text-white/80 font-medium px-2 py-0.5 rounded-full bg-black/40 backdrop-blur-sm">
            {photo.tag}
          </div>
        </div>
      )}
      <div className="text-xs text-muted text-center mb-0.5">{dateStr}</div>
      <div className={isSent ? 'flex justify-end' : 'flex justify-start'}>
        <div
          className="rounded-2xl px-5 py-4 text-sm leading-relaxed shadow-card max-w-xs"
          style={
            isSent
              ? { background: 'linear-gradient(135deg, rgba(136,11,58,0.55), rgba(200,35,96,0.45))', border: '1px solid rgba(200,35,96,0.25)' }
              : { background: 'rgba(37,37,53,0.8)', border: '1px solid rgba(255,255,255,0.06)' }
          }
        >
          <p className="text-white/90">{msg}</p>
        </div>
      </div>
      <div className={`text-xs text-muted ${isSent ? 'text-right' : 'text-left'} px-2`}>
        {author}
      </div>
    </div>
  );
}

// ─── Loading shimmer ──────────────────────────────────────────────────────────
export function Shimmer({ className = '' }) {
  return (
    <div
      className={`rounded-xl animate-pulse ${className}`}
      style={{ background: 'linear-gradient(90deg, rgba(255,255,255,0.04), rgba(255,255,255,0.08), rgba(255,255,255,0.04))' }}
    />
  );
}

// ─── Divider ──────────────────────────────────────────────────────────────────
export function Divider() {
  return (
    <div className="relative flex items-center py-2">
      <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(200,35,96,0.3), rgba(144,96,255,0.2), transparent)' }} />
    </div>
  );
}
