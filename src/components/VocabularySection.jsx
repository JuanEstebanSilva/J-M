import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Smile, MessageSquare, Award } from 'lucide-react';
import { Section, CountUp } from './ui.jsx';

// ─── Love keyword grid ────────────────────────────────────────────────────────
function LoveKeywords({ loveWordsTotals, p1, p2 }) {
  const entries = Object.entries(loveWordsTotals)
    .filter(([, v]) => v.total > 0)
    .sort((a, b) => b[1].total - a[1].total);

  if (entries.length === 0) {
    return <p className="text-base text-white/60 italic">No se encontraron palabras de cariño frecuentes.</p>;
  }

  const max = entries[0][1].total;

  return (
    <div className="space-y-4">
      {entries.map(([label, data], i) => {
        const pct = Math.round((data.total / max) * 100);
        return (
          <motion.div
            key={label}
            className="group"
            initial={{ opacity: 0, x: -16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05, duration: 0.5 }}
          >
            <div className="flex items-center justify-between mb-2 gap-4">
              <span className="text-base sm:text-lg font-bold text-white/95 min-w-[90px]">{label}</span>
              <div className="flex-1 relative h-3 rounded-full overflow-hidden shadow-inner" style={{ background: 'rgba(255,255,255,0.08)' }}>
                <motion.div
                  className="absolute inset-y-0 left-0 rounded-full shadow-md"
                  style={{ background: 'linear-gradient(90deg, #880b3a, #c82360, #ff5599)' }}
                  initial={{ width: 0 }}
                  whileInView={{ width: `${pct}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.1, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
                />
              </div>
              <div className="flex gap-4 min-w-[130px] text-right font-medium">
                <span className="text-sm text-white/70">{p1}: <span className="text-rose-400 font-bold">{data[p1] || 0}</span></span>
                <span className="text-sm text-white/70">{p2}: <span className="text-violet-400 font-bold">{data[p2] || 0}</span></span>
              </div>
              <span className="text-base sm:text-lg font-mono font-black text-white min-w-[40px] text-right">{data.total}</span>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

// ─── Emoji podium ─────────────────────────────────────────────────────────────
function EmojiPodium({ emojiTop, name, color }) {
  if (!emojiTop || emojiTop.length === 0) {
    return <p className="text-sm text-white/60 italic">Sin emojis registrados.</p>;
  }

  const medals = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣'];

  return (
    <div className="space-y-4">
      <h4 className="text-sm uppercase tracking-widest font-bold text-white/80 mb-4">{name}</h4>
      {emojiTop.map(([emoji, count], i) => (
        <motion.div
          key={emoji}
          className="flex items-center gap-4"
          initial={{ opacity: 0, x: -10 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.08, duration: 0.4 }}
        >
          <span className="text-xl w-6 select-none">{medals[i]}</span>
          <span className="text-3xl sm:text-4xl leading-none select-none filter drop-shadow">{emoji}</span>
          <div className="flex-1 h-3 rounded-full overflow-hidden shadow-inner" style={{ background: 'rgba(255,255,255,0.08)' }}>
            <motion.div
              className="h-full rounded-full shadow-md"
              style={{ background: color }}
              initial={{ width: 0 }}
              whileInView={{ width: `${Math.round((count / emojiTop[0][1]) * 100)}%` }}
              viewport={{ once: true }}
              transition={{ duration: 0.9, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>
          <span className="text-sm font-mono font-bold text-white/80 min-w-[45px] text-right">{count.toLocaleString('es-CO')}</span>
        </motion.div>
      ))}
    </div>
  );
}

// ─── Word cloud ───────────────────────────────────────────────────────────────
function WordCloud({ wordTop, color }) {
  if (!wordTop || wordTop.length === 0) {
    return <p className="text-sm text-white/60 italic">Sin palabras frecuentes.</p>;
  }
  const max = wordTop[0][1];
  const sizes = ['text-sm', 'text-base', 'text-lg', 'text-xl', 'text-2xl', 'text-3xl'];

  return (
    <div className="flex flex-wrap gap-3.5 items-center py-2">
      {wordTop.map(([word, count]) => {
        const norm = count / max;
        const sizeIdx = Math.min(Math.floor(norm * sizes.length), sizes.length - 1);
        const opacity = 0.55 + norm * 0.45;
        return (
          <motion.span
            key={word}
            className={`${sizes[sizeIdx]} font-bold cursor-default select-none px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/5 shadow-sm transition-all`}
            style={{ color, opacity }}
            whileHover={{ scale: 1.15, opacity: 1, backgroundColor: 'rgba(255,255,255,0.1)' }}
            title={`${word}: ${count} veces`}
          >
            {word}
          </motion.span>
        );
      })}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function VocabularySection({ analytics }) {
  const { participants, stats, loveWordsTotals } = analytics;
  const [p1 = 'Juanes', p2 = 'Pau'] = participants;
  const s1 = stats[p1] || {};
  const s2 = stats[p2] || {};
  const [wordTab, setWordTab] = useState(p1);

  const totalLove = Object.values(loveWordsTotals).reduce((sum, v) => sum + v.total, 0);

  return (
    <Section id="vocabulary" label="✦ Amor en Palabras ✦" title="Lo que nuestro chat dice de nosotros">
      <div className="space-y-7">
        {/* Love keywords */}
        <motion.div
          className="glass-card p-7 sm:p-8"
          initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.6 }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4 pb-4 border-b border-white/10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg border border-white/10" style={{ background: 'rgba(200,35,96,0.2)' }}>
                <Heart size={22} className="text-rose-400 fill-rose-500/40" />
              </div>
              <div>
                <h3 className="font-display text-2xl font-bold text-white">Contador de Cariño</h3>
                <p className="text-sm text-white/60">Palabras y expresiones de amor detectadas</p>
              </div>
            </div>
            <div className="text-left sm:text-right">
              <div className="font-display text-3xl sm:text-4xl font-black gradient-text">
                <CountUp end={totalLove} duration={1600} />
              </div>
              <div className="text-xs uppercase tracking-wider font-semibold text-rose-300">expresiones de amor</div>
            </div>
          </div>
          <LoveKeywords loveWordsTotals={loveWordsTotals} p1={p1} p2={p2} />
        </motion.div>

        {/* Emoji podiums */}
        <motion.div
          className="glass-card p-7 sm:p-8"
          initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="flex items-center gap-4 mb-7 pb-4 border-b border-white/10">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg border border-white/10" style={{ background: 'rgba(144,96,255,0.2)' }}>
              <Smile size={22} className="text-violet-400" />
            </div>
            <div>
              <h3 className="font-display text-2xl font-bold text-white">Podio de Emojis Favoritos</h3>
              <p className="text-sm text-white/60">Las reacciones más auténticas de cada uno</p>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-10">
            <EmojiPodium emojiTop={s1?.emojiTop || []} name={p1} color="linear-gradient(135deg, #c82360, #ff5599)" />
            <EmojiPodium emojiTop={s2?.emojiTop || []} name={p2} color="linear-gradient(135deg, #6830e0, #9060ff)" />
          </div>
        </motion.div>

        {/* Word clouds */}
        <motion.div
          className="glass-card p-7 sm:p-8"
          initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.15 }}
        >
          <div className="flex items-center gap-4 mb-3">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg border border-white/10" style={{ background: 'rgba(255,217,102,0.15)' }}>
              <MessageSquare size={22} className="text-yellow-400" />
            </div>
            <div>
              <h3 className="font-display text-2xl font-bold text-white">Palabras más repetidas</h3>
              <p className="text-sm text-white/60">El vocabulario único y característico de sus conversaciones</p>
            </div>
          </div>

          {/* Tab switch */}
          <div className="flex gap-2 p-1.5 rounded-2xl my-6 w-fit border border-white/10" style={{ background: 'rgba(255,255,255,0.04)' }}>
            {[p1, p2].map((name) => (
              <button
                key={name}
                onClick={() => setWordTab(name)}
                className="relative px-6 py-2 rounded-xl text-base font-bold transition-all duration-200"
                style={{ color: wordTab === name ? '#fff' : 'rgba(255,255,255,0.5)' }}
              >
                {wordTab === name && (
                  <motion.span
                    layoutId="word-tab"
                    className="absolute inset-0 rounded-xl shadow-md"
                    style={{ background: wordTab === p1
                      ? 'linear-gradient(135deg, #880b3a, #c82360)'
                      : 'linear-gradient(135deg, #6830e0, #9060ff)'
                    }}
                    transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                  />
                )}
                <span className="relative">{name}</span>
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={wordTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.35 }}
            >
              <WordCloud
                wordTop={wordTab === p1 ? (s1?.wordTop || []) : (s2?.wordTop || [])}
                color={wordTab === p1 ? '#ff77aa' : '#c0a0ff'}
              />
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>
    </Section>
  );
}
