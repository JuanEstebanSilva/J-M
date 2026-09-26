import { motion } from 'framer-motion';
import { MessageCircle, Volume2, Clock, Sunrise } from 'lucide-react';
import { Section, ComparisonBar, CountUp } from './ui.jsx';

function InfoCard({ icon: Icon, title, children, accent = 'wine' }) {
  const color = accent === 'violet' ? '#9060ff' : accent === 'rose' ? '#f04080' : '#c82360';
  return (
    <div
      className="glass-card p-6 flex flex-col gap-4"
      style={{ borderColor: `rgba(${accent === 'violet' ? '144,96,255' : '200,35,96'},0.12)` }}
    >
      <div className="flex items-center gap-3">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: `rgba(${accent === 'violet' ? '144,96,255' : '200,35,96'},0.12)` }}
        >
          <Icon size={17} style={{ color }} />
        </div>
        <h3 className="font-display text-lg font-medium text-white/90">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function ResponseBar({ name, minutes, maxMinutes, colorStart, colorEnd }) {
  const pct = maxMinutes > 0 ? Math.min((minutes / maxMinutes) * 100, 100) : 0;
  const label = minutes === null ? 'Sin datos' : minutes < 60 ? `${minutes} min` : `${(minutes / 60).toFixed(1)} h`;
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center">
        <span className="text-sm text-white/70">{name}</span>
        <span className="text-sm font-mono font-medium text-white/90">{label}</span>
      </div>
      <div className="bar-track">
        <motion.div
          className="bar-fill"
          style={{ background: `linear-gradient(90deg, ${colorStart}, ${colorEnd})` }}
          initial={{ width: 0 }}
          whileInView={{ width: `${pct}%` }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>
    </div>
  );
}

export default function CoupleStats({ analytics }) {
  const { participants, stats, response, dayStarters, totalDays, totalMessages } = analytics;
  const [p1, p2 = '?'] = participants;
  const s1 = stats[p1];
  const s2 = stats[p2] || { messages: 0, words: 0 };

  const totalStarters = (dayStarters[p1] || 0) + (dayStarters[p2] || 0) || 1;
  const starterPct1   = Math.round(((dayStarters[p1] || 0) / totalStarters) * 100);
  const starterPct2   = 100 - starterPct1;

  const maxResponse = Math.max(response[p1] || 0, response[p2] || 0) || 1;

  return (
    <Section id="couple" label="Dinamómetros de la Pareja" title="¿Cómo somos juntos?">
      <div className="grid md:grid-cols-2 gap-5">
        {/* Messages comparison */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.6 }}
        >
          <InfoCard icon={MessageCircle} title="¿Quién habla más?">
            <div className="space-y-5">
              <ComparisonBar
                p1={p1} p2={p2}
                val1={s1?.messages || 0} val2={s2?.messages || 0}
                label="Mensajes enviados"
              />
              <ComparisonBar
                p1={p1} p2={p2}
                val1={s1?.words || 0} val2={s2?.words || 0}
                label="Palabras escritas"
              />
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="rounded-xl p-3 text-center" style={{ background: 'rgba(200,35,96,0.08)', border: '1px solid rgba(200,35,96,0.12)' }}>
                  <div className="text-xl font-bold font-mono" style={{ color: '#e05c82' }}>
                    <CountUp end={s1?.messages || 0} duration={1200} />
                  </div>
                  <div className="text-xs text-muted mt-0.5 truncate">{p1}</div>
                </div>
                <div className="rounded-xl p-3 text-center" style={{ background: 'rgba(144,96,255,0.08)', border: '1px solid rgba(144,96,255,0.12)' }}>
                  <div className="text-xl font-bold font-mono" style={{ color: '#b090ff' }}>
                    <CountUp end={s2?.messages || 0} duration={1200} />
                  </div>
                  <div className="text-xs text-muted mt-0.5 truncate">{p2}</div>
                </div>
              </div>
            </div>
          </InfoCard>
        </motion.div>

        {/* Response times */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.1 }}
        >
          <InfoCard icon={Clock} title="Tiempo de respuesta promedio" accent="violet">
            <div className="space-y-4">
              <ResponseBar
                name={p1}
                minutes={response[p1]}
                maxMinutes={maxResponse}
                colorStart="#880b3a"
                colorEnd="#c82360"
              />
              <ResponseBar
                name={p2}
                minutes={response[p2]}
                maxMinutes={maxResponse}
                colorStart="#6830e0"
                colorEnd="#9060ff"
              />
              <p className="text-xs text-muted pt-1">
                Tiempo promedio entre recibir y responder un mensaje (máx. 12h).
              </p>
            </div>
          </InfoCard>
        </motion.div>

        {/* Day starters */}
        <motion.div
          className="md:col-span-2"
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.15 }}
        >
          <InfoCard icon={Sunrise} title="¿Quién inicia la conversación?" accent="rose">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                {/* Left side */}
                <div className="flex-1 text-right">
                  <div className="font-display text-3xl font-semibold" style={{ color: '#e05c82' }}>
                    {starterPct1}%
                  </div>
                  <div className="text-sm text-muted-soft truncate">{p1}</div>
                  <div className="text-xs text-muted">{dayStarters[p1] || 0} días</div>
                </div>

                {/* Bar */}
                <div className="flex-[2] flex flex-col gap-2">
                  <div className="relative flex h-3 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                    <motion.div
                      className="h-full"
                      style={{ background: 'linear-gradient(90deg, #880b3a, #c82360)' }}
                      initial={{ width: 0 }}
                      whileInView={{ width: `${starterPct1}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
                    />
                    <motion.div
                      className="h-full"
                      style={{ background: 'linear-gradient(90deg, #6830e0, #9060ff)' }}
                      initial={{ width: 0 }}
                      whileInView={{ width: `${starterPct2}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
                    />
                  </div>
                  <div className="text-center text-xs text-muted">
                    Sobre {totalDays} días de conversación
                  </div>
                </div>

                {/* Right side */}
                <div className="flex-1">
                  <div className="font-display text-3xl font-semibold" style={{ color: '#b090ff' }}>
                    {starterPct2}%
                  </div>
                  <div className="text-sm text-muted-soft truncate">{p2}</div>
                  <div className="text-xs text-muted">{dayStarters[p2] || 0} días</div>
                </div>
              </div>

              <div
                className="rounded-xl p-3 text-center text-sm"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}
              >
                {starterPct1 > starterPct2
                  ? <span><span style={{ color: '#e05c82' }}>{p1}</span> suele dar el primer paso 💌</span>
                  : starterPct2 > starterPct1
                  ? <span><span style={{ color: '#b090ff' }}>{p2}</span> suele dar el primer paso 💌</span>
                  : <span>¡Inician la conversación de forma equilibrada! ⚖️</span>
                }
              </div>
            </div>
          </InfoCard>
        </motion.div>
      </div>
    </Section>
  );
}
