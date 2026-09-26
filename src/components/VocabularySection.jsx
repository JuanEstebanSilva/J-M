import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Smile } from 'lucide-react';
import { Section, CountUp } from './ui.jsx';

// ─── Love keyword grid ────────────────────────────────────────────────────────
function LoveKeywords({ loveWordsTotals, p1, p2 }) {
  const entries = Object.entries(loveWordsTotals)
    .filter(([, v]) => v.total > 0)
    .sort((a, b) => b[1].total - a[1].total);

  if (entries.length === 0) {
    return <p className="text-sm text-muted italic">No se encontraron palabras de cariño frecuentes.</p>;
  }

  const max = entries[0][1].total;

  return (
    <div className="space-y-3">
      {entries.map(([label, data], i) => {
        const pct = Math.round((data.total / max) * 100);
        return (
          <motion.div
            key={label}
            className="group"
            initial={{ opacity: 0, x: -16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.06, duration: 0.5 }}
          >
            <div className="flex items-center justify-between mb-1.5 gap-3">
              <span className="text-sm font-medium text-white/80 min-w-[70px]">{label}</span>
              <div className="flex-1 relative h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                <motion.div
                  className="absolute inset-y-0 left-0 rounded-full"
                  style={{ background: 'linear-gradient(90deg, #880b3a, #c82360, #f04080)' }}
                  initial={{ width: 0 }}
                  whileInView={{ width: `${pct}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.1, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}
                />
              </div>
              <div className="flex gap-3 min-w-[100px] text-right">
                <span className="text-xs text-muted">{p1}: <span style={{ color: '#e05c82' }}>{data[p1] || 0}</span></span>
                <span className="text-xs text-muted">{p2}: <span style={{ color: '#b090ff' }}>{data[p2] || 0}</span></span>
              </div>
              <span className="text-sm font-mono font-bold text-white/90 min-w-[32px] text-right">{data.total}</span>
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
    return <p className="text-xs text-muted italic">Sin emojis registrados.</p>;
  }

  const medals = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣'];

  return (
    <div className="space-y-2">
      <h4 className="text-xs uppercase tracking-wider text-muted mb-3">{name}</h4>
      {emojiTop.map(([emoji, count], i) => (
        <motion.div
          key={emoji}
          className="flex items-center gap-3"
          initial={{ opacity: 0, x: -10 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.08, duration: 0.4 }}
        >
          <span className="text-base w-5">{medals[i]}</span>
          <span className="text-2xl leading-none">{emoji}</span>
          <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
            <motion.div
              className="h-full rounded-full"
              style={{ background: color }}
              initial={{ width: 0 }}
              whileInView={{ width: `${Math.round((count / emojiTop[0][1]) * 100)}%` }}
              viewport={{ once: true }}
              transition={{ duration: 0.9, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>
          <span className="text-xs font-mono text-white/60 min-w-[36px] text-right">{count.toLocaleString('es-CO')}</span>
        </motion.div>
      ))}
    </div>
  );
}

// ─── Word cloud ───────────────────────────────────────────────────────────────
function WordCloud({ wordTop, color }) {
  if (!wordTop || wordTop.length === 0) {
    return <p className="text-xs text-muted italic">Sin palabras frecuentes.</p>;
  }
  const max = wordTop[0][1];
  const sizes = ['text-xs', 'text-sm', 'text-base', 'text-lg', 'text-xl', 'text-2xl'];

  return (
    <div className="flex flex-wrap gap-2 items-center">
      {wordTop.map(([word, count]) => {
        const norm = count / max;
        const sizeIdx = Math.min(Math.floor(norm * sizes.length), sizes.length - 1);
        const opacity = 0.4 + norm * 0.6;
        return (
          <motion.span
            key={word}
            className={`${sizes[sizeIdx]} font-medium cursor-default select-none`}
            style={{ color, opacity }}
            whileHover={{ scale: 1.15, opacity: 1 }}
            title={`${word}: ${count}x`}
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
  const [p1, p2 = '?'] = participants;
  const s1 = stats[p1];
  const s2 = stats[p2];
  const [wordTab, setWordTab] = useState(p1);

  const totalLove = Object.values(loveWordsTotals).reduce((sum, v) => sum + v.total, 0);

  return (
    <Section id="vocabulary" label="Amor en Palabras" title="Lo que nuestro chat dice de nosotros">
      <div className="space-y-5">
        {/* Love keywords */}
        <motion.div
          className="glass-card p-6"
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(200,35,96,0.12)' }}>
                <Heart size={17} style={{ color: '#e05c82' }} />
              </div>
              <div>
                <h3 className="font-display text-lg font-medium text-white/90">Contador de Cariño</h3>
                <p className="text-xs text-muted">Palabras de amor detectadas</p>
              </div>
            </div>
            <div className="text-right">
              <div className="font-display text-2xl font-bold gradient-text">
                <CountUp end={totalLove} duration={1400} />
              </div>
              <div className="text-xs text-muted">en total</div>
            </div>
          </div>
          <LoveKeywords loveWordsTotals={loveWordsTotals} p1={p1} p2={p2} />
        </motion.div>

        {/* Emoji podiums */}
        <motion.div
          className="glass-card p-6"
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(144,96,255,0.12)' }}>
              <Smile size={17} style={{ color: '#b090ff' }} />
            </div>
            <h3 className="font-display text-lg font-medium text-white/90">Podio de Emojis</h3>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <EmojiPodium emojiTop={s1?.emojiTop || []} name={p1} color="linear-gradient(135deg, #c82360, #f04080)" />
            <EmojiPodium emojiTop={s2?.emojiTop || []} name={p2} color="linear-gradient(135deg, #6830e0, #9060ff)" />
          </div>
        </motion.div>

        {/* Word clouds */}
        <motion.div
          className="glass-card p-6"
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.15 }}
        >
          <h3 className="font-display text-lg font-medium text-white/90 mb-2">Palabras más usadas</h3>
          <p className="text-xs text-muted mb-4">Términos más repetidos (sin stopwords en español)</p>

          {/* Tab switch */}
          <div className="flex gap-1 p-1 rounded-xl mb-5 w-fit" style={{ background: 'rgba(255,255,255,0.04)' }}>
            {[p1, p2].map((name) => (
              <button
                key={name}
                onClick={() => setWordTab(name)}
                className="relative px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 truncate max-w-[120px]"
                style={{ color: wordTab === name ? '#fff' : 'rgba(255,255,255,0.45)' }}
              >
                {wordTab === name && (
                  <motion.span
                    layoutId="word-tab"
                    className="absolute inset-0 rounded-lg"
                    style={{ background: wordTab === p1
                      ? 'linear-gradient(135deg, rgba(136,11,58,0.5), rgba(200,35,96,0.35))'
                      : 'linear-gradient(135deg, rgba(104,48,224,0.4), rgba(144,96,255,0.3))'
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
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35 }}
            >
              <WordCloud
                wordTop={wordTab === p1 ? (s1?.wordTop || []) : (s2?.wordTop || [])}
                color={wordTab === p1 ? '#e05c82' : '#b090ff'}
              />
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>
    </Section>
  );
}
