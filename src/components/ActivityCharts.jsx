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
      className="rounded-xl px-4 py-3 text-sm shadow-card"
      style={{ background: 'rgba(18,18,28,0.96)', border: '1px solid rgba(200,35,96,0.25)', backdropFilter: 'blur(12px)' }}
    >
      <p className="text-muted-soft text-xs mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} style={{ color: p.color }} className="font-mono font-medium">
          {p.name ?? p.dataKey}: {p.value?.toLocaleString('es-CO')}
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
    return `rgba(${r},${g},${b},${0.2 + intensity * 0.7})`;
  };

  const peakHour = hourlyData.reduce((a, b) => (b.count > a.count ? b : a), hourlyData[0]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-1.5">
        {hourlyData.map((d) => (
          <div key={d.hour} className="group relative">
            <motion.div
              className="w-8 h-8 md:w-9 md:h-9 rounded-lg heat-cell flex items-end justify-center pb-1"
              style={{ background: getColor(d.count) }}
              initial={{ scale: 0.7, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: d.hour * 0.02, duration: 0.4 }}
              whileHover={{ scale: 1.15 }}
            >
              <span className="text-[9px] text-white/40">{d.hour}</span>
            </motion.div>
            {/* Tooltip */}
            <div
              className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 rounded-lg text-xs whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-10"
              style={{ background: 'rgba(18,18,28,0.95)', border: '1px solid rgba(200,35,96,0.25)' }}
            >
              {d.label}: {d.count.toLocaleString('es-CO')} msgs
            </div>
          </div>
        ))}
      </div>
      <p className="text-xs text-muted">
        Hora más activa:{' '}
        <span style={{ color: '#e05c82' }}>{peakHour?.label} 🔥</span>
        {' '}con{' '}
        <span className="text-white/70">{peakHour?.count?.toLocaleString('es-CO')} mensajes</span>
      </p>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function ActivityCharts({ analytics }) {
  const { hourlyData, weeklyData, monthlyData, participants } = analytics;
  const [p1, p2 = '?'] = participants;
  const [activeTab, setActiveTab] = useState('monthly');

  const tabs = [
    { id: 'monthly', label: 'Evolución' },
    { id: 'hours',   label: 'Horas pico' },
    { id: 'week',    label: 'Días fav.' },
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
    <Section id="activity" label="Cronología y Hábitos" title="Nuestros ritmos de amor">
      <div className="glass-card p-6">
        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-xl mb-6 w-fit" style={{ background: 'rgba(255,255,255,0.04)' }}>
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className="relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
              style={{ color: activeTab === t.id ? '#fff' : 'rgba(255,255,255,0.45)' }}
            >
              {activeTab === t.id && (
                <motion.span
                  layoutId="chart-tab"
                  className="absolute inset-0 rounded-lg"
                  style={{ background: 'linear-gradient(135deg, rgba(136,11,58,0.6), rgba(200,35,96,0.4))' }}
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
            <p className="text-sm text-muted mb-4">Mensajes por mes a lo largo de nuestra relación</p>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={formattedMonthly} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradP1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#c82360" stopOpacity={0.6} />
                    <stop offset="95%" stopColor="#c82360" stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="gradP2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#9060ff" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="#9060ff" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis
                  dataKey="label"
                  tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }}
                  axisLine={false} tickLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<DarkTooltip />} />
                <Area
                  type="monotone" dataKey={p1} name={p1}
                  stroke="#c82360" strokeWidth={2} fill="url(#gradP1)"
                />
                <Area
                  type="monotone" dataKey={p2} name={p2}
                  stroke="#9060ff" strokeWidth={2} fill="url(#gradP2)"
                />
              </AreaChart>
            </ResponsiveContainer>
            <div className="flex gap-6 mt-3">
              <div className="flex items-center gap-2">
                <div className="w-3 h-0.5 rounded" style={{ background: '#c82360' }} />
                <span className="text-xs text-muted">{p1}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-0.5 rounded" style={{ background: '#9060ff' }} />
                <span className="text-xs text-muted">{p2}</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Hours heatmap */}
        {activeTab === 'hours' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
            <p className="text-sm text-muted mb-4">¿A qué hora del día hablamos más? (0h–23h)</p>
            <HourHeatmap hourlyData={hourlyData} p1={p1} p2={p2} />
          </motion.div>
        )}

        {/* Day of week */}
        {activeTab === 'week' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
            <p className="text-sm text-muted mb-4">
              El día favorito es{' '}
              <span style={{ color: '#e05c82' }}>{maxDay?.day}</span>{' '}
              con {maxDay?.count?.toLocaleString('es-CO')} mensajes 💬
            </p>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={weeklyData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor="#c82360" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#880b3a" stopOpacity={0.5} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="day" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<DarkTooltip />} />
                <Bar dataKey="count" name="Mensajes" fill="url(#barGrad)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        )}
      </div>
    </Section>
  );
}
