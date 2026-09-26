import { motion } from 'framer-motion';
import { MessageSquare, Type, Clock, Sun } from 'lucide-react';
import { Section, ComparisonBar, StatCard } from './ui.jsx';

function formatMinutes(mins) {
  if (!mins || isNaN(mins)) return 'N/A';
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h}h ${m}m`;
}

export default function CoupleStats({ analytics }) {
  const { participants, totalMessages, totalWords, perAuthor, responseTimes, dayStarters } = analytics;

  const p1 = participants[0];
  const p2 = participants[1];
  const p1Data = perAuthor[p1] || {};
  const p2Data = perAuthor[p2] || {};

  const totalDayStarts = (dayStarters[p1] || 0) + (dayStarters[p2] || 0);
  const p1StartPct = totalDayStarts ? Math.round(((dayStarters[p1] || 0) / totalDayStarts) * 100) : 50;

  return (
    <Section
      id="couple-stats"
      title="Dinamómetros de pareja"
      subtitle="¿Quién habla más? ¿Quién responde antes?"
      icon={MessageSquare}
    >
      <div className="grid md:grid-cols-2 gap-6">
        {/* Message & Word comparison */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="blossom-card p-6"
        >
          <h3 className="font-display text-xl text-blossom-burgundy mb-5">¿Quién habla más?</h3>

          <ComparisonBar
            p1Name={p1}
            p1Value={p1Data.messageCount || 0}
            p2Name={p2}
            p2Value={p2Data.messageCount || 0}
            total={totalMessages}
            label="Mensajes enviados"
          />

          <div className="h-px bg-blossom-blush my-4" />

          <ComparisonBar
            p1Name={p1}
            p1Value={p1Data.wordCount || 0}
            p2Name={p2}
            p2Value={p2Data.wordCount || 0}
            total={(p1Data.wordCount || 0) + (p2Data.wordCount || 0)}
            label="Palabras escritas"
          />

          {/* Verdict */}
          <div className="mt-5 bg-blossom-petal/60 rounded-2xl px-4 py-3 text-center">
            {p1Data.messageCount > p2Data.messageCount ? (
              <p className="font-display italic text-blossom-wine text-sm">
                <strong>{p1}</strong> es quien más llena la conversación de amor 💕
              </p>
            ) : p2Data.messageCount > p1Data.messageCount ? (
              <p className="font-display italic text-blossom-wine text-sm">
                <strong>{p2}</strong> es quien más llena la conversación de amor 💕
              </p>
            ) : (
              <p className="font-display italic text-blossom-wine text-sm">
                ¡Perfectamente equilibrados! ✨
              </p>
            )}
          </div>
        </motion.div>

        {/* Response times */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="blossom-card p-6"
        >
          <h3 className="font-display text-xl text-blossom-burgundy mb-5">Tiempo de respuesta</h3>
          <p className="font-sans text-xs text-blossom-mauve mb-5">Mediana de respuesta (conversaciones bajo 3h)</p>

          {participants.map((p, i) => {
            const mins = responseTimes[p];
            const pct = mins ? Math.min(Math.round((mins / 60) * 100), 100) : 0;
            const color = i === 0 ? 'from-blossom-wine to-blossom-mauve' : 'from-blossom-peach to-blossom-apricot';

            return (
              <div key={p} className="mb-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-sans text-sm text-blossom-burgundy font-medium">{p}</span>
                  <span className="font-display text-xl text-blossom-wine font-semibold">
                    {formatMinutes(mins)}
                  </span>
                </div>
                <div className="h-2.5 rounded-full bg-blossom-blush overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${pct}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.2, delay: 0.3 + i * 0.2, ease: 'easeOut' }}
                    className={`h-full rounded-full bg-gradient-to-r ${color}`}
                  />
                </div>
              </div>
            );
          })}

          {/* Clock icon decoration */}
          <div className="flex items-center gap-2 mt-4 text-blossom-mauve/50">
            <Clock className="w-4 h-4" />
            <span className="font-sans text-xs">El tiempo más corto = más atención 🥰</span>
          </div>
        </motion.div>

        {/* Day starter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="blossom-card p-6 md:col-span-2"
        >
          <div className="flex items-center gap-2 mb-5">
            <Sun className="w-5 h-5 text-blossom-gold" />
            <h3 className="font-display text-xl text-blossom-burgundy">El iniciador del día</h3>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-6">
            {/* Visual comparison */}
            <div className="flex-1 w-full">
              <div className="flex h-12 rounded-2xl overflow-hidden shadow-inner">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: `${p1StartPct}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.5, ease: 'easeOut' }}
                  className="bg-gradient-to-r from-blossom-wine to-blossom-mauve flex items-center justify-center relative"
                >
                  {p1StartPct > 15 && (
                    <span className="font-sans text-white text-xs font-medium px-2 truncate">
                      {p1} · {p1StartPct}%
                    </span>
                  )}
                </motion.div>
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: `${100 - p1StartPct}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.5, ease: 'easeOut', delay: 0.1 }}
                  className="bg-gradient-to-r from-blossom-peach to-blossom-apricot flex items-center justify-center relative"
                >
                  {(100 - p1StartPct) > 15 && (
                    <span className="font-sans text-white text-xs font-medium px-2 truncate">
                      {p2} · {100 - p1StartPct}%
                    </span>
                  )}
                </motion.div>
              </div>
            </div>

            {/* Numbers */}
            <div className="flex gap-6">
              {participants.map((p, i) => (
                <div key={p} className="text-center">
                  <p className="font-display text-3xl font-bold text-blossom-wine">
                    {(dayStarters[p] || 0).toLocaleString('es-ES')}
                  </p>
                  <p className="font-sans text-xs text-blossom-mauve mt-0.5">{p}</p>
                  <p className="font-sans text-xs text-blossom-rose/70">días iniciados</p>
                </div>
              ))}
            </div>

            {/* Verdict */}
            <div className="bg-gradient-to-br from-blossom-gold/10 to-blossom-peach/10 border border-blossom-gold/30 rounded-2xl px-5 py-3 text-center">
              <p className="font-sans text-xs text-blossom-mauve mb-1">El sol de la relación</p>
              <p className="font-display text-lg text-blossom-wine font-semibold">
                {dayStarters[p1] >= dayStarters[p2] ? p1 : p2} ☀️
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </Section>
  );
}
