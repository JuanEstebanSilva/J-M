import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Shuffle, Calendar } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Section, PolaroidMessage } from './ui.jsx';
import { COUPLE_PHOTOS } from '../data/photos.js';

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
  const { busiestDay, busiestCount, msgPool, participants, monthlyData, dailyMap } = analytics;
  const [p1, p2 = '?'] = participants;
  const [randomMsg, setRandomMsg]   = useState(null);
  const [msgIndex, setMsgIndex]     = useState(0);
  const [confettiFired, setConfettiFired] = useState(false);

  // Busiest month
  const busiestMonth = monthlyData?.reduce((a, b) => (b.total > a.total ? b : a), monthlyData[0]);

  const pickRandom = useCallback(() => {
    if (!msgPool || msgPool.length === 0) return;
    const pool = msgPool.filter((m) => m !== randomMsg);
    const pick = pool[Math.floor(Math.random() * pool.length)];
    setRandomMsg(pick);
    setMsgIndex((i) => i + 1);
  }, [msgPool, randomMsg]);

  const fireConfetti = () => {
    if (confettiFired) return;
    setConfettiFired(true);
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.7 },
      colors: ['#c82360', '#9060ff', '#ffd966', '#ff80ad'],
    });
    setTimeout(() => setConfettiFired(false), 3000);
  };

  const isSent = randomMsg ? randomMsg.author === p1 : false;

  return (
    <Section id="memories" label="Cápsula de Memorias" title="Momentos que siempre recordaremos">
      <div className="grid md:grid-cols-2 gap-5">
        {/* Record day */}
        <motion.div
          className="glass-card p-6 flex flex-col gap-4"
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.6 }}
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(240,168,0,0.12)' }}>
              <Trophy size={17} style={{ color: '#f0c030' }} />
            </div>
            <h3 className="font-display text-lg font-medium text-white/90">El Día Récord</h3>
          </div>

          <button
            onClick={fireConfetti}
            className="relative rounded-2xl p-5 text-center cursor-pointer overflow-hidden transition-all duration-300 hover:-translate-y-1 group"
            style={{
              background: 'linear-gradient(135deg, rgba(136,11,58,0.3), rgba(200,35,96,0.2), rgba(104,48,224,0.15))',
              border: '1px solid rgba(200,35,96,0.2)',
            }}
          >
            {/* Shimmer on hover */}
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style={{ background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.04) 50%, transparent 60%)' }}
            />
            <div className="flex justify-center mb-3">
              <span className="text-5xl">🏆</span>
            </div>
            <div className="font-display text-4xl font-bold mb-1" style={{ color: '#f0c030' }}>
              {busiestCount?.toLocaleString('es-CO')}
            </div>
            <div className="text-sm text-white/60">mensajes en un solo día</div>
            <div className="mt-3 text-sm font-medium" style={{ color: 'rgba(255,255,255,0.8)' }}>
              {formatDateShort(busiestDay)}
            </div>
            <div className="mt-2 text-xs text-muted">Haz clic para celebrar 🎉</div>
          </button>

          {/* Busiest month */}
          {busiestMonth && (
            <div
              className="rounded-xl p-4 flex items-center justify-between"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}
            >
              <div className="flex items-center gap-3">
                <Calendar size={16} style={{ color: '#9060ff' }} />
                <div>
                  <div className="text-xs text-muted">Mes más activo</div>
                  <div className="text-sm font-medium text-white/80">
                    {(() => {
                      const [y, m] = busiestMonth.month.split('-');
                      return new Date(Number(y), Number(m) - 1, 1)
                        .toLocaleDateString('es-CO', { month: 'long', year: 'numeric' });
                    })()}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold font-mono" style={{ color: '#9060ff' }}>
                  {busiestMonth.total?.toLocaleString('es-CO')}
                </div>
                <div className="text-xs text-muted">mensajes</div>
              </div>
            </div>
          )}
        </motion.div>

        {/* Random memory */}
        <motion.div
          className="glass-card p-6 flex flex-col gap-4"
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(200,35,96,0.12)' }}>
                <Shuffle size={17} style={{ color: '#e05c82' }} />
              </div>
              <h3 className="font-display text-lg font-medium text-white/90">Ruleta de Recuerdos</h3>
            </div>
          </div>

          {/* Random message display */}
          <div
            className="flex-1 rounded-2xl p-5 min-h-[160px] flex flex-col justify-center"
            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}
          >
            <AnimatePresence mode="wait">
              {randomMsg ? (
                <motion.div
                  key={msgIndex}
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  transition={{ duration: 0.4 }}
                >
                  <PolaroidMessage
                    msg={randomMsg.text}
                    author={randomMsg.author}
                    date={randomMsg.date}
                    isSent={isSent}
                    photo={COUPLE_PHOTOS[msgIndex % COUPLE_PHOTOS.length]}
                  />
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center flex flex-col items-center gap-3 py-2"
                >
                  {COUPLE_PHOTOS[2] && (
                    <div className="w-20 h-20 rounded-2xl overflow-hidden border border-white/10 shadow-md">
                      <img src={COUPLE_PHOTOS[2].src} alt="Memorias" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <p className="text-xs sm:text-sm text-muted italic">
                    Haz clic en el botón para revivir<br />un mensaje aleatorio de nuestra historia
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button
            onClick={pickRandom}
            className="glow-btn w-full flex items-center justify-center gap-2"
          >
            <span className="text-lg">♥</span>
            {randomMsg ? 'Recordar otro momento' : 'Recordar un momento'}
          </button>

          {msgPool && (
            <p className="text-xs text-muted text-center">
              {msgPool.length.toLocaleString('es-CO')} mensajes en el baúl de recuerdos
            </p>
          )}
        </motion.div>
      </div>
    </Section>
  );
}
