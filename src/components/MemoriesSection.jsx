import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Hourglass, RefreshCw, Trophy } from 'lucide-react';
import { Section, PolaroidMessage } from './ui.jsx';

export default function MemoriesSection({ analytics }) {
  const { busiestDay, allMessages, randomMessage: getRandomMsg } = analytics;
  const [currentMessage, setCurrentMessage] = useState(() => getRandomMsg());

  const shuffle = useCallback(() => {
    setCurrentMessage(getRandomMsg());
  }, [getRandomMsg]);

  const busiestDate = busiestDay?.date?.toLocaleDateString('es-ES', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });

  // Find the most active month
  const monthlyByVolume = analytics.monthlyTimeline?.sort((a, b) => b.total - a.total)?.[0];

  return (
    <Section
      id="memories"
      title="Cápsula del tiempo"
      subtitle="Los momentos más especiales de vuestra historia"
      icon={Hourglass}
    >
      <div className="space-y-6">
        {/* Record day */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="blossom-card p-6 md:p-8"
        >
          <div className="flex flex-col md:flex-row items-center gap-6">
            {/* Trophy */}
            <motion.div
              animate={{ rotate: [-5, 5, -5] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="flex-shrink-0 w-24 h-24 rounded-full bg-gradient-to-br from-blossom-gold to-blossom-apricot flex items-center justify-center shadow-blossom-lg"
            >
              <Trophy className="w-12 h-12 text-white" />
            </motion.div>

            <div className="text-center md:text-left flex-1">
              <p className="label-text mb-1">🏆 Récord histórico de mensajes</p>
              <h3 className="font-display text-2xl md:text-3xl text-blossom-plum font-bold mb-1 capitalize">
                {busiestDate}
              </h3>
              <p className="font-sans text-blossom-mauve text-sm mb-3">
                En ese día especial intercambiaron…
              </p>
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blossom-wine to-blossom-burgundy text-white px-6 py-3 rounded-2xl shadow-blossom">
                <span className="font-display text-4xl font-bold">{busiestDay?.count?.toLocaleString('es-ES')}</span>
                <span className="font-sans text-white/80 text-sm">mensajes</span>
              </div>
            </div>

            {/* Preview messages from that day */}
            {busiestDay?.messages?.length > 0 && (
              <div className="flex-shrink-0 bg-blossom-petal/60 rounded-2xl p-4 max-w-xs w-full">
                <p className="label-text mb-3 text-center">Preview de ese día</p>
                <div className="space-y-2">
                  {busiestDay.messages.slice(0, 3).map((text, i) => (
                    <div key={i} className="bg-white/70 rounded-xl px-3 py-2">
                      <p className="font-sans text-xs text-blossom-burgundy line-clamp-2">{text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Most active month */}
        {monthlyByVolume && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="blossom-card p-6"
          >
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <p className="label-text mb-1">📅 Mes más activo de toda la historia</p>
                <h3 className="font-display text-2xl text-blossom-plum font-bold capitalize">
                  {monthlyByVolume.label}
                </h3>
                <p className="font-sans text-sm text-blossom-mauve mt-1">
                  {monthlyByVolume.total?.toLocaleString('es-ES')} mensajes ese mes
                </p>
              </div>
              <div className="flex gap-4">
                {analytics.participants.map((p, i) => (
                  <div key={p} className="text-center">
                    <p className={`font-display text-2xl font-bold ${i === 0 ? 'text-blossom-wine' : 'text-blossom-apricot'}`}>
                      {(monthlyByVolume[p] || 0).toLocaleString('es-ES')}
                    </p>
                    <p className="font-sans text-xs text-blossom-mauve">{p}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Random message polaroid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="blossom-card p-6 md:p-8"
        >
          <div className="text-center mb-6">
            <h3 className="font-display text-2xl text-blossom-burgundy mb-1">
              ✉️ Mensaje aleatorio de vuestra historia
            </h3>
            <p className="font-sans text-sm text-blossom-mauve">Haz clic en la tarjeta para ver otro</p>
          </div>

          <AnimatePresence mode="wait">
            <PolaroidMessage
              key={currentMessage?.text?.slice(0, 30)}
              message={currentMessage}
              onShuffle={shuffle}
            />
          </AnimatePresence>

          <div className="flex justify-center mt-6">
            <button
              onClick={shuffle}
              className="wine-btn flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Otro recuerdo
            </button>
          </div>
        </motion.div>
      </div>
    </Section>
  );
}
