import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Shuffle, Calendar, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Section, PolaroidMessage } from './ui.jsx';
import { COUPLE_PHOTOS } from '../data/photos.js';
import { playHeartChime } from '../utils/romanticAudio.js';

function formatDate(date) {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('es-CO', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });
}

function formatDateShort(dateStr) {
  if (!dateStr) return '—';
  const [y, m, d] = dateStr.split('-');
  return new Date(Number(y), Number(m) - 1, Number(d))
    .toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function MemoriesSection({ analytics }) {
  const { busiestDay, busiestCount, msgPool, participants, monthlyData } = analytics;
  const [p1 = 'Juanes', p2 = 'Pau'] = participants;
  const [randomMsg, setRandomMsg]   = useState(null);
  const [msgIndex, setMsgIndex]     = useState(0);
  const [confettiFired, setConfettiFired] = useState(false);

  // Busiest month
  const busiestMonth = monthlyData?.reduce((a, b) => (b.total > a.total ? b : a), monthlyData[0]);

  const pickRandom = useCallback(() => {
    playHeartChime();
    if (!msgPool || msgPool.length === 0) return;
    const pool = msgPool.filter((m) => m !== randomMsg);
    const pick = pool[Math.floor(Math.random() * pool.length)];
    setRandomMsg(pick);
    setMsgIndex((i) => i + 1);

    confetti({
      particleCount: 30,
      spread: 50,
      origin: { y: 0.75 },
      colors: ['#c82360', '#9060ff', '#ffd966'],
      scalar: 0.8,
    });
  }, [msgPool, randomMsg]);

  const fireConfetti = () => {
    playHeartChime();
    if (confettiFired) return;
    setConfettiFired(true);
    confetti({
      particleCount: 100,
      spread: 80,
      origin: { y: 0.7 },
      colors: ['#c82360', '#9060ff', '#ffd966', '#ff80ad'],
    });
    setTimeout(() => setConfettiFired(false), 2500);
  };

  const isSent = randomMsg ? randomMsg.author === p1 : false;

  return (
    <Section id="memories" label="✦ Cápsula de Memorias ✦" title="Momentos que siempre recordaremos">
      <div className="grid md:grid-cols-2 gap-7">
        {/* Record day */}
        <motion.div
          className="glass-card p-7 sm:p-8 flex flex-col gap-6"
          initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.6 }}
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg border border-white/10" style={{ background: 'rgba(255,217,102,0.18)' }}>
              <Trophy size={24} className="text-yellow-400" />
            </div>
            <div>
              <h3 className="font-display text-2xl font-bold text-white">El Día Récord</h3>
              <p className="text-sm text-white/60">El día de mayor conexión en su historia</p>
            </div>
          </div>

          <button
            onClick={fireConfetti}
            className="relative rounded-3xl p-7 text-center cursor-pointer overflow-hidden transition-all duration-300 hover:-translate-y-1.5 group border border-yellow-500/30 shadow-2xl"
            style={{
              background: 'linear-gradient(135deg, rgba(136,11,58,0.4), rgba(200,35,96,0.25), rgba(104,48,224,0.25))',
            }}
          >
            <div className="flex justify-center mb-3">
              <span className="text-6xl animate-bounce">🏆</span>
            </div>
            <div className="font-display text-5xl sm:text-6xl font-black mb-1 gradient-text-gold">
              {busiestCount?.toLocaleString('es-CO')}
            </div>
            <div className="text-base font-semibold text-white/90">mensajes en solo 24 horas</div>
            <div className="mt-4 text-base font-bold text-rose-200 capitalize tracking-wide">
              📅 {formatDateShort(busiestDay)}
            </div>
            <div className="mt-2 text-xs font-semibold text-yellow-300 uppercase tracking-widest flex items-center justify-center gap-1">
              <Sparkles size={14} /> ¡Toca para celebrar!
            </div>
          </button>

          {/* Busiest month */}
          {busiestMonth && (
            <div
              className="rounded-2xl p-5 flex items-center justify-between border border-white/10 shadow-md"
              style={{ background: 'rgba(255,255,255,0.04)' }}
            >
              <div>
                <p className="text-sm text-white/60">Mes con más mensajes:</p>
                <p className="font-display text-xl font-bold text-white mt-0.5">
                  {busiestMonth.month}
                </p>
              </div>
              <div className="text-right">
                <span className="font-mono text-2xl font-bold text-violet-300">
                  {busiestMonth.total?.toLocaleString('es-CO')}
                </span>
                <p className="text-xs text-white/50">mensajes</p>
              </div>
            </div>
          )}
        </motion.div>

        {/* Random memory roulette */}
        <motion.div
          className="glass-card p-7 sm:p-8 flex flex-col gap-6"
          initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg border border-white/10" style={{ background: 'rgba(200,35,96,0.2)' }}>
                <Shuffle size={22} className="text-rose-400" />
              </div>
              <div>
                <h3 className="font-display text-2xl font-bold text-white">Ruleta de Recuerdos</h3>
                <p className="text-sm text-white/60">Un mensaje al azar de su chat</p>
              </div>
            </div>
            <button
              onClick={pickRandom}
              className="glow-btn text-sm font-bold py-2.5 px-5 shadow-glow-wine"
            >
              <Shuffle size={16} />
              <span>Girar</span>
            </button>
          </div>

          <div className="flex-1 flex flex-col justify-center min-h-[260px]">
            <AnimatePresence mode="wait">
              {randomMsg ? (
                <motion.div
                  key={msgIndex}
                  initial={{ opacity: 0, scale: 0.92, rotate: -2 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  exit={{ opacity: 0, scale: 0.92, rotate: 2 }}
                  transition={{ duration: 0.35, ease: 'easeOut' }}
                  className="py-2"
                >
                  <PolaroidMessage
                    msg={randomMsg.text}
                    author={randomMsg.author}
                    date={randomMsg.date}
                    isSent={isSent}
                    photo={COUPLE_PHOTOS[(msgIndex - 1) % COUPLE_PHOTOS.length]}
                  />
                </motion.div>
              ) : (
                <div className="flex flex-col items-center justify-center text-center py-10 gap-4">
                  <div className="w-20 h-20 rounded-full flex items-center justify-center text-3xl bg-white/[0.04] border border-white/10 shadow-inner">
                    🎲
                  </div>
                  <div>
                    <p className="text-lg font-bold text-white/90">Descubre un recuerdo</p>
                    <p className="text-sm text-white/60 mt-1 max-w-xs">
                      Toca "Girar" para viajar en el tiempo y revivir un mensaje auténtico de su historia.
                    </p>
                  </div>
                  <button
                    onClick={pickRandom}
                    className="glow-btn text-base font-bold py-3 px-8 mt-2"
                  >
                    🎲 Girar la Ruleta
                  </button>
                </div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </Section>
  );
}
