import { motion } from 'framer-motion';
import { MessageCircle, Clock, Sunrise, Flame, Zap } from 'lucide-react';
import { Section, ComparisonBar, CountUp } from './ui.jsx';

function InfoCard({ icon: Icon, title, children, accent = 'wine' }) {
  const color = accent === 'violet' ? '#b088ff' : accent === 'rose' ? '#ff6699' : '#ff4477';
  return (
    <div
      className="glass-card p-7 flex flex-col gap-5 h-full"
      style={{ borderColor: `rgba(${accent === 'violet' ? '144,96,255' : '200,35,96'},0.22)` }}
    >
      <div className="flex items-center gap-3.5">
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg border border-white/10"
          style={{ background: `rgba(${accent === 'violet' ? '144,96,255' : '200,35,96'},0.2)` }}
        >
          <Icon size={22} style={{ color }} />
        </div>
        <h3 className="font-display text-xl sm:text-2xl font-bold text-white tracking-tight">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function ResponseBar({ name, minutes, maxMinutes, colorStart, colorEnd }) {
  const pct = maxMinutes > 0 ? Math.min((minutes / maxMinutes) * 100, 100) : 0;
  const label = minutes === null ? 'Sin datos' : minutes < 60 ? `${minutes} min` : `${(minutes / 60).toFixed(1)} h`;
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-base font-semibold text-white/90">{name}</span>
        <span className="text-base font-mono font-bold text-white tracking-tight">{label}</span>
      </div>
      <div className="bar-track h-3.5 shadow-inner">
        <motion.div
          className="bar-fill shadow-md"
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
  const { participants, stats, response, dayStarters, totalDays } = analytics;
  const [p1 = 'Juanes', p2 = 'Pau'] = participants;
  const s1 = stats[p1] || { messages: 0, words: 0 };
  const s2 = stats[p2] || { messages: 0, words: 0 };

  const totalStarters = (dayStarters[p1] || 0) + (dayStarters[p2] || 0) || 1;
  const starterPct1   = Math.round(((dayStarters[p1] || 0) / totalStarters) * 100);
  const starterPct2   = 100 - starterPct1;

  const maxResponse = Math.max(response[p1] || 0, response[p2] || 0) || 1;

  return (
    <Section id="couple" label="✦ Dinamómetros de la Pareja ✦" title="¿Cómo somos juntos cuando hablamos?">
      <div className="grid md:grid-cols-2 gap-7">
        {/* Messages & Words comparison */}
        <motion.div
          initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.6 }}
        >
          <InfoCard icon={MessageCircle} title="¿Quién habla más?">
            <div className="space-y-6">
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
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="rounded-2xl p-4 text-center shadow-lg" style={{ background: 'rgba(200,35,96,0.12)', border: '1px solid rgba(200,35,96,0.25)' }}>
                  <div className="text-2xl sm:text-3xl font-black font-mono" style={{ color: '#ff6699' }}>
                    <CountUp end={s1?.messages || 0} duration={1400} />
                  </div>
                  <div className="text-sm font-semibold text-white/90 mt-1 truncate">{p1}</div>
                  <div className="text-xs text-white/50">mensajes</div>
                </div>
                <div className="rounded-2xl p-4 text-center shadow-lg" style={{ background: 'rgba(144,96,255,0.12)', border: '1px solid rgba(144,96,255,0.25)' }}>
                  <div className="text-2xl sm:text-3xl font-black font-mono" style={{ color: '#b088ff' }}>
                    <CountUp end={s2?.messages || 0} duration={1400} />
                  </div>
                  <div className="text-sm font-semibold text-white/90 mt-1 truncate">{p2}</div>
                  <div className="text-xs text-white/50">mensajes</div>
                </div>
              </div>
            </div>
          </InfoCard>
        </motion.div>

        {/* Response times */}
        <motion.div
          initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.1 }}
        >
          <InfoCard icon={Clock} title="Tiempo de respuesta promedio" accent="violet">
            <div className="space-y-6">
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
              <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 text-xs sm:text-sm text-white/75 leading-relaxed">
                ⚡ Tiempo promedio calculado entre que uno recibe y responde el mensaje de su pareja. ¡Ambos responden súper rápido!
              </div>
            </div>
          </InfoCard>
        </motion.div>

        {/* Day starters */}
        <motion.div
          className="md:col-span-2"
          initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.15 }}
        >
          <InfoCard icon={Sunrise} title="¿Quién inicia los buenos días y las conversaciones?" accent="rose">
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-center gap-6">
                {/* Left side */}
                <div className="flex-1 text-center sm:text-right">
                  <div className="font-display text-4xl sm:text-5xl font-black gradient-text-rose">
                    {starterPct1}%
                  </div>
                  <div className="text-lg font-bold text-white mt-1 truncate">{p1}</div>
                  <div className="text-sm text-rose-300 font-mono font-medium">{dayStarters[p1] || 0} días iniciados</div>
                </div>

                {/* Bar */}
                <div className="flex-[2] w-full flex flex-col gap-2.5">
                  <div className="relative flex h-5 rounded-full overflow-hidden shadow-inner p-0.5" style={{ background: 'rgba(255,255,255,0.08)' }}>
                    <motion.div
                      className="h-full rounded-l-full shadow-md"
                      style={{ background: 'linear-gradient(90deg, #880b3a, #c82360, #ff4477)' }}
                      initial={{ width: 0 }}
                      whileInView={{ width: `${starterPct1}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
                    />
                    <motion.div
                      className="h-full rounded-r-full shadow-md"
                      style={{ background: 'linear-gradient(90deg, #6830e0, #9060ff, #b088ff)' }}
                      initial={{ width: 0 }}
                      whileInView={{ width: `${starterPct2}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
                    />
                  </div>
                  <div className="text-center text-xs sm:text-sm text-white/60 font-medium">
                    Analizado sobre un total de <strong className="text-white">{totalDays}</strong> días de conversación continua
                  </div>
                </div>

                {/* Right side */}
                <div className="flex-1 text-center sm:text-left">
                  <div className="font-display text-4xl sm:text-5xl font-black text-violet-300">
                    {starterPct2}%
                  </div>
                  <div className="text-lg font-bold text-white mt-1 truncate">{p2}</div>
                  <div className="text-sm text-violet-300 font-mono font-medium">{dayStarters[p2] || 0} días iniciados</div>
                </div>
              </div>

              <div
                className="rounded-2xl p-4 text-center text-base sm:text-lg font-medium shadow-md"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                {starterPct1 > starterPct2
                  ? <span>💌 <span className="font-bold text-rose-300">{p1}</span> es quien casi siempre da el primer paso en las mañanas.</span>
                  : starterPct2 > starterPct1
                  ? <span>💌 <span className="font-bold text-violet-300">{p2}</span> es quien casi siempre da el primer paso en las mañanas.</span>
                  : <span>¡Ambos inician el día con el mismo entusiasmo y amor! ⚖️💖</span>
                }
              </div>
            </div>
          </InfoCard>
        </motion.div>
      </div>
    </Section>
  );
}
