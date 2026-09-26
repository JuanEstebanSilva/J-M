import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Smile } from 'lucide-react';
import { Section, CountUp } from './ui.jsx';

function WordCloud({ words }) {
  if (!words?.length) return null;

  const max = words[0]?.count || 1;

  return (
    <div className="flex flex-wrap gap-2 justify-center py-4">
      {words.slice(0, 50).map(({ key, count }, i) => {
        const size = 0.7 + (count / max) * 1.3;
        const opacity = 0.5 + (count / max) * 0.5;
        const colors = [
          'text-blossom-plum', 'text-blossom-wine', 'text-blossom-mauve',
          'text-blossom-burgundy', 'text-blossom-apricot',
        ];
        const color = colors[i % colors.length];

        return (
          <motion.span
            key={key}
            initial={{ opacity: 0, scale: 0 }}
            whileInView={{ opacity, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.02, type: 'spring', stiffness: 200 }}
            whileHover={{ scale: 1.2, opacity: 1 }}
            title={`${count} veces`}
            className={`font-display font-medium cursor-default transition-all ${color}`}
            style={{ fontSize: `${size}rem` }}
          >
            {key}
          </motion.span>
        );
      })}
    </div>
  );
}

function EmojiPodium({ topEmojis, name }) {
  if (!topEmojis?.length) return null;

  const medals = ['🥇', '🥈', '🥉', '4', '5'];
  const heights = ['h-24', 'h-16', 'h-12', 'h-10', 'h-8'];

  return (
    <div>
      <p className="label-text mb-4 text-center">{name}</p>
      <div className="flex items-end justify-center gap-3 mb-3">
        {topEmojis.slice(0, 5).map(({ key: emoji, count }, i) => (
          <motion.div
            key={emoji}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, type: 'spring', stiffness: 200 }}
            whileHover={{ scale: 1.1 }}
            className="flex flex-col items-center gap-1"
          >
            <span className="font-mono text-xs text-blossom-mauve">{count}×</span>
            <div
              className={`${heights[i]} w-12 md:w-14 rounded-t-2xl flex items-end justify-center pb-2 bg-gradient-to-b from-blossom-blush/60 to-blossom-rose/30 border border-white/60 shadow-card`}
            >
              <span className="text-2xl">{emoji}</span>
            </div>
            <span className="text-sm">{medals[i]}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function LoveKeywordCard({ label, count, delay }) {
  const isHigh = count > 50;
  const isMedium = count > 10;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay, type: 'spring', stiffness: 200 }}
      whileHover={{ scale: 1.05, y: -2 }}
      className={`
        blossom-card p-4 text-center relative overflow-hidden
        ${isHigh ? 'border border-blossom-wine/30' : ''}
      `}
    >
      {isHigh && (
        <div className="absolute -top-3 -right-3 text-3xl opacity-20 rotate-12 pointer-events-none">❤️</div>
      )}
      <div className="font-display text-3xl font-bold text-blossom-wine mb-1">
        <CountUp to={count} duration={1500} />
      </div>
      <div className="font-sans text-sm text-blossom-mauve">"{label}"</div>
      {isHigh && (
        <div className="mt-2 flex justify-center">
          {Array.from({ length: Math.min(5, Math.floor(count / 20)) }).map((_, i) => (
            <span key={i} className="text-xs">❤️</span>
          ))}
        </div>
      )}
    </motion.div>
  );
}

export default function VocabularySection({ analytics }) {
  const { participants, perAuthor, wordCloud, loveKeywords } = analytics;
  const [activeTab, setActiveTab] = useState(participants[0]);

  const currentData = perAuthor[activeTab] || {};

  return (
    <Section
      id="vocabulary"
      title="Vocabulario y afecto"
      subtitle="Las palabras que construyen vuestra historia"
      icon={Heart}
    >
      <div className="space-y-6">
        {/* Love keywords grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="blossom-card p-6"
        >
          <h3 className="font-display text-xl text-blossom-burgundy mb-2">💌 Contador de amor</h3>
          <p className="font-sans text-sm text-blossom-mauve mb-5">Cuántas veces lo dijeron entre los dos</p>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {Object.entries(loveKeywords)
              .sort(([, a], [, b]) => b - a)
              .map(([label, count], i) => (
                <LoveKeywordCard
                  key={label}
                  label={label}
                  count={count}
                  delay={i * 0.06}
                />
              ))}
          </div>
        </motion.div>

        {/* Top emojis */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="blossom-card p-6"
        >
          <div className="flex items-center gap-2 mb-6">
            <Smile className="w-5 h-5 text-blossom-gold" />
            <h3 className="font-display text-xl text-blossom-burgundy">Top emojis por persona</h3>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {participants.map(p => (
              <EmojiPodium
                key={p}
                name={p}
                topEmojis={perAuthor[p]?.topEmojis}
              />
            ))}
          </div>
        </motion.div>

        {/* Word cloud */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="blossom-card p-6"
        >
          <h3 className="font-display text-xl text-blossom-burgundy mb-2">☁️ Nube de palabras</h3>
          <p className="font-sans text-sm text-blossom-mauve mb-2">Términos más repetidos (sin stopwords)</p>

          {/* Tab selector */}
          <div className="flex gap-2 mb-5">
            {['Ambos', ...participants].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`
                  font-sans text-sm px-4 py-2 rounded-full transition-all duration-200
                  ${activeTab === tab
                    ? 'bg-gradient-to-r from-blossom-wine to-blossom-burgundy text-white shadow-blossom'
                    : 'bg-blossom-blush/50 text-blossom-mauve hover:bg-blossom-blush'
                  }
                `}
              >
                {tab}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <WordCloud
                words={activeTab === 'Ambos'
                  ? wordCloud
                  : perAuthor[activeTab]?.topWords
                }
              />
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>
    </Section>
  );
}
