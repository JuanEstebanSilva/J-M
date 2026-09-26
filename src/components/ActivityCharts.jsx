import { motion } from 'framer-motion';
import { Activity } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid, Area, AreaChart, Cell,
} from 'recharts';
import { Section } from './ui.jsx';

const WINE = '#8B3A52';
const MAUVE = '#C07B8E';
const PEACH = '#F0A896';
const APRICOT = '#EE8B6F';
const BLUSH = '#E8B4B8';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white/95 backdrop-blur-sm shadow-blossom rounded-2xl px-4 py-3 border border-blossom-blush">
      <p className="font-sans text-xs text-blossom-mauve mb-1">{label}</p>
      {payload.map((entry) => (
        <p key={entry.dataKey} className="font-display text-base font-semibold" style={{ color: entry.color }}>
          {entry.value?.toLocaleString('es-ES')} mensajes
        </p>
      ))}
    </div>
  );
};

function HeatmapHour({ hourlyActivity }) {
  const max = Math.max(...hourlyActivity);

  const periods = [
    { label: 'Madrugada', range: [0, 6], emoji: '🌙' },
    { label: 'Mañana', range: [6, 12], emoji: '🌅' },
    { label: 'Tarde', range: [12, 18], emoji: '☀️' },
    { label: 'Noche', range: [18, 24], emoji: '🌆' },
  ];

  const peakHour = hourlyActivity.indexOf(max);
  const peakPeriod = periods.find(p => peakHour >= p.range[0] && peakHour < p.range[1]);

  return (
    <div>
      <div className="flex gap-1 mb-4 flex-wrap">
        {hourlyActivity.map((count, hour) => {
          const intensity = max > 0 ? count / max : 0;
          const alpha = 0.1 + intensity * 0.9;
          const isPeak = count === max;

          return (
            <motion.div
              key={hour}
              initial={{ scale: 0, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: hour * 0.025, duration: 0.3 }}
              whileHover={{ scale: 1.3 }}
              title={`${hour}:00 — ${count} mensajes`}
              className={`relative flex flex-col items-center rounded-xl cursor-pointer group transition-all duration-200`}
              style={{ width: 'calc(100%/24 - 4px)' }}
            >
              <div
                className="w-full rounded-xl transition-all duration-200"
                style={{
                  height: `${40 + intensity * 60}px`,
                  backgroundColor: `rgba(139, 58, 82, ${alpha})`,
                  boxShadow: isPeak ? `0 0 12px rgba(139, 58, 82, 0.5)` : 'none',
                  border: isPeak ? '2px solid #8B3A52' : '2px solid transparent',
                }}
              />
              <span className="font-mono text-xs text-blossom-mauve/50 mt-1 group-hover:text-blossom-wine transition-colors">
                {hour}
              </span>
            </motion.div>
          );
        })}
      </div>

      {/* Peak info */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.8 }}
        className="bg-gradient-to-r from-blossom-wine/10 to-blossom-mauve/10 rounded-2xl px-5 py-3 flex items-center justify-between"
      >
        <div>
          <p className="font-sans text-xs text-blossom-mauve">Pico de actividad</p>
          <p className="font-display text-lg text-blossom-wine font-semibold">
            {peakPeriod?.emoji} {String(peakHour).padStart(2, '0')}:00 — {peakPeriod?.label}
          </p>
        </div>
        <div className="text-right">
          <p className="font-sans text-xs text-blossom-mauve">Mensajes en esa hora</p>
          <p className="font-display text-2xl text-blossom-wine font-bold">
            {max.toLocaleString('es-ES')}
          </p>
        </div>
      </motion.div>
    </div>
  );
}

export default function ActivityCharts({ analytics }) {
  const { hourlyActivity, dayOfWeekActivity, monthlyTimeline, participants } = analytics;

  const maxDow = Math.max(...dayOfWeekActivity.map(d => d.count));

  return (
    <Section
      id="activity"
      title="Cronobiología del amor"
      subtitle="A qué horas y días late más fuerte la conversación"
      icon={Activity}
    >
      <div className="space-y-6">
        {/* Hourly heatmap */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="blossom-card p-6"
        >
          <h3 className="font-display text-xl text-blossom-burgundy mb-4">
            🌸 Heatmap horario — ¿A qué hora conversan más?
          </h3>
          <HeatmapHour hourlyActivity={hourlyActivity} />
        </motion.div>

        {/* Days of week */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="blossom-card p-6"
        >
          <h3 className="font-display text-xl text-blossom-burgundy mb-5">
            📅 Días de la semana — ¿Cuál es el más activo?
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={dayOfWeekActivity} barSize={32}>
              <XAxis
                dataKey="day"
                tick={{ fontFamily: 'DM Sans', fontSize: 12, fill: '#C07B8E' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis hide />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                {dayOfWeekActivity.map((entry, index) => (
                  <Cell
                    key={index}
                    fill={entry.count === maxDow
                      ? `url(#peakGradient)`
                      : `rgba(192, 123, 142, ${0.3 + (entry.count / maxDow) * 0.7})`
                    }
                  />
                ))}
              </Bar>
              <defs>
                <linearGradient id="peakGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={WINE} />
                  <stop offset="100%" stopColor={MAUVE} />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>

          <div className="mt-3 text-center">
            {(() => {
              const peak = dayOfWeekActivity.find(d => d.count === maxDow);
              return (
                <p className="font-display italic text-blossom-mauve text-sm">
                  ✨ El <strong className="text-blossom-wine">{peak?.day}</strong> es vuestro día favorito para conectar
                </p>
              );
            })()}
          </div>
        </motion.div>

        {/* Monthly timeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="blossom-card p-6"
        >
          <h3 className="font-display text-xl text-blossom-burgundy mb-5">
            📈 Línea de tiempo — Evolución mes a mes
          </h3>

          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={monthlyTimeline} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
              <defs>
                <linearGradient id="gradP1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={WINE} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={WINE} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradP2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={PEACH} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={PEACH} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradTotal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={MAUVE} stopOpacity={0.2} />
                  <stop offset="95%" stopColor={MAUVE} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={`${BLUSH}40`} />
              <XAxis
                dataKey="label"
                tick={{ fontFamily: 'DM Mono', fontSize: 10, fill: '#C07B8E' }}
                axisLine={false}
                tickLine={false}
                interval={Math.floor(monthlyTimeline.length / 8)}
              />
              <YAxis
                tick={{ fontFamily: 'DM Mono', fontSize: 10, fill: '#C07B8E' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey={participants[0]}
                stroke={WINE}
                strokeWidth={2}
                fill="url(#gradP1)"
                dot={false}
                activeDot={{ r: 5, fill: WINE }}
              />
              <Area
                type="monotone"
                dataKey={participants[1]}
                stroke={APRICOT}
                strokeWidth={2}
                fill="url(#gradP2)"
                dot={false}
                activeDot={{ r: 5, fill: APRICOT }}
              />
            </AreaChart>
          </ResponsiveContainer>

          {/* Legend */}
          <div className="flex gap-6 justify-center mt-3">
            {participants.map((p, i) => (
              <div key={p} className="flex items-center gap-2">
                <div
                  className="w-4 h-1.5 rounded-full"
                  style={{ backgroundColor: i === 0 ? WINE : APRICOT }}
                />
                <span className="font-sans text-xs text-blossom-mauve">{p}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </Section>
  );
}
