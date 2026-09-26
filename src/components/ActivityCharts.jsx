import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid,
} from 'recharts';
import { Section } from './ui.jsx';

// ─── Tooltip custom ───────────────────────────────────────────────────────────
const DarkTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="rounded-2xl px-5 py-3.5 text-sm shadow-2xl border border-rose-500/30"
      style={{ background: 'rgba(20, 16, 32, 0.96)', backdropFilter: 'blur(16px)' }}
    >
      <p className="text-white/80 font-bold mb-1.5 text-xs tracking-wider uppercase">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} style={{ color: p.color }} className="font-mono font-bold text-base">
          {p.name ?? p.dataKey}: {p.value?.toLocaleString('es-CO')} mensajes
        </p>
      ))}
    </div>
  );
};

// ─── 24h Heatmap ──────────────────────────────────────────────────────────────
function HourHeatmap({ hourlyData, p1, p2 }) {
  const max = Math.max(...hourlyData.map((d) => d.count), 1);

  const getColor = (count) => {
    const intensity = count / max;
    if (intensity === 0) return 'rgba(255,255,255,0.03)';
    const r = Math.round(136 + (200 - 136) * intensity);
    const g = Math.round(11 + (35 - 11) * intensity);
    const b = Math.round(58 + (96 - 58) * intensity);
    return `rgba(${r},${g},${b},${0.25 + intensity * 0.75})`;
  };

  const peakHour = hourlyData.reduce((a, b) => (b.count > a.count ? b : a), hourlyData[0]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
        {hourlyData.map((d) => (
          <div key={d.hour} className="group relative">
            <motion.div
              className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl heat-cell flex items-end justify-center pb-1.5 border border-white/5 shadow-md cursor-pointer"
              style={{ background: getColor(d.count) }}
              initial={{ scale: 0.7, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: d.hour * 0.02, duration: 0.4 }}
              whileHover={{ scale: 1.25, zIndex: 10 }}
            >
              <span className="text-[10px] font-mono font-bold text-white/70">{d.hour}h</span>
            </motion.div>
            {/* Tooltip */}
            <div
              className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-20 shadow-xl border border-rose-500/30"
              style={{ background: 'rgba(20, 16, 32, 0.98)' }}
            >
              {d.label}: <span className="text-rose-400 font-mono font-bold">{d.count.toLocaleString('es-CO')}</span> msgs
            </div>
          </div>
        ))}
      </div>
      <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 text-sm sm:text-base text-white/80">
        🔥 Hora cumbre de conexión:{' '}
        <strong className="text-rose-400 font-bold">{peakHour?.label}</strong>
        {' '}con un total de{' '}
        <strong className="text-white font-mono">{peakHour?.count?.toLocaleString('es-CO')} mensajes</strong>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function ActivityCharts({ analytics }) {
  const { hourlyData, weeklyData, monthlyData, participants } = analytics;
  const [p1 = 'Juanes', p2 = 'Pau'] = participants;
  const [activeTab, setActiveTab] = useState('monthly');

  const tabs = [
    { id: 'monthly', label: 'Evolución Mensual' },
    { id: 'hours',   label: 'Horas Pico (24h)' },
    { id: 'week',    label: 'Días Favoritos' },
  ];

  // Format month label
  const formattedMonthly = monthlyData.map((d) => {
    const [y, m] = d.month.split('-');
    const date = new Date(Number(y), Number(m) - 1, 1);
    return {
      ...d,
      label: date.toLocaleDateString('es-CO', { month: 'short', year: '2-digit' }),
    };
  });

  const maxDay = weeklyData.reduce((a, b) => (b.count > a.count ? b : a), weeklyData[0]);

  return (
    <Section id="activity" label="✦ Cronología y Hábitos ✦" title="Nuestros ritmos y momentos especiales">
      <div className="glass-card p-7 sm:p-8">
        {/* Tabs */}
        <div className="flex gap-2 p-1.5 rounded-2xl mb-8 w-fit border border-white/10" style={{ background: 'rgba(255,255,255,0.04)' }}>
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className="relative px-5 py-2.5 rounded-xl text-sm sm:text-base font-bold transition-all duration-200"
              style={{ color: activeTab === t.id ? '#fff' : 'rgba(255,255,255,0.5)' }}
            >
              {activeTab === t.id && (
                <motion.span
                  layoutId="chart-tab"
                  className="absolute inset-0 rounded-xl shadow-lg"
                  style={{ background: 'linear-gradient(135deg, #880b3a, #c82360)' }}
                  transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                />
              )}
              <span className="relative">{t.label}</span>
            </button>
          ))}
        </div>

        {/* Monthly area chart */}
        {activeTab === 'monthly' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
            <p className="text-base text-white/70 font-light mb-6">
              Evolución continua de mensajes intercambiados a lo largo de los meses
            </p>
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={formattedMonthly} margin={{ top: 10, right: 10, left: -5, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradP1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#c82360" stopOpacity={0.65} />
                    <stop offset="95%" stopColor="#c82360" stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="gradP2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#9060ff" stopOpacity={0.55} />
                    <stop offset="95%" stopColor="#9060ff" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis
                  dataKey="label"
                  tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 13, fontWeight: 500 }}
                  axisLine={false} tickLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip content={<DarkTooltip />} />
                <Area
                  type="monotone" dataKey={p1} name={p1}
                  stroke="#ff5588" strokeWidth={3} fill="url(#gradP1)"
                />
                <Area
                  type="monotone" dataKey={p2} name={p2}
                  stroke="#a070ff" strokeWidth={3} fill="url(#gradP2)"
                />
              </AreaChart>
            </ResponsiveContainer>
            <div className="flex gap-8 mt-5 pt-3 border-t border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-4 h-1.5 rounded-full" style={{ background: '#ff5588' }} />
                <span className="text-sm font-semibold text-white/90">{p1}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-4 h-1.5 rounded-full" style={{ background: '#a070ff' }} />
                <span className="text-sm font-semibold text-white/90">{p2}</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Hours heatmap */}
        {activeTab === 'hours' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
            <p className="text-base text-white/70 font-light mb-6">¿A qué horas del día se envían más mensajes?</p>
            <HourHeatmap hourlyData={hourlyData} p1={p1} p2={p2} />
          </motion.div>
        )}

        {/* Day of week */}
        {activeTab === 'week' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
            <p className="text-base text-white/70 font-light mb-6">
              El día más activo de la semana es el{' '}
              <strong className="text-rose-400 font-bold">{maxDay?.day}</strong>{' '}
              con <strong className="text-white font-mono">{maxDay?.count?.toLocaleString('es-CO')} mensajes</strong>
            </p>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={weeklyData} margin={{ top: 10, right: 10, left: -5, bottom: 0 }}>
                <defs>
                  <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor="#ff5588" stopOpacity={0.95} />
                    <stop offset="100%" stopColor="#880b3a" stopOpacity={0.6} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis dataKey="day" tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: 600 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip content={<DarkTooltip />} />
                <Bar dataKey="count" name="Mensajes" fill="url(#barGrad)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        )}
      </div>
    </Section>
  );
}
