import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PhoneCall,
  Sparkles,
  Smile,
  Moon,
  Sun,
  Camera,
  Mic,
  Video,
  Heart,
  Clock,
  Award,
  Flame,
  MessageCircle,
  Coffee,
  Mail,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { CountUp } from './ui.jsx';
import { playHeartChime } from '../utils/romanticAudio.js';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { delay, duration: 0.7, ease: [0.16, 1, 0.3, 1] },
});

export default function DeepAnalyticsSection({ analytics }) {
  const {
    participants = ['Juanes', 'Pau'],
    callsStats = {
      totalCalls: 772,
      answeredCalls: 482,
      missedCalls: 290,
      totalMinutes: 9860,
      byAuthor: { Juanes: { calls: 212, minutes: 4639 }, Pau: { calls: 270, minutes: 5221 } },
    },
    mediaBreakdown = {
      Juanes: { stickers: 403, photos: 957, audios: 312, videos: 79, total: 1751 },
      Pau: { stickers: 1220, photos: 582, audios: 113, videos: 124, total: 2039 },
    },
    laughterStats = { Juanes: 314, Pau: 284, total: 598 },
    timeOfDayStats = {
      nightOwls: { Juanes: 191, Pau: 185, total: 376 },
      earlyBirds: { Juanes: 3093, Pau: 2660, total: 5753 },
      daytime: { Juanes: 6929, Pau: 6106, total: 13035 },
      evening: { Juanes: 3531, Pau: 2661, total: 6192 },
    },
    loveLetters = [],
    daysTogetherAnniversary = 2402,
    yearsTogether = '6.5',
  } = analytics;

  const [p1 = 'Juanes', p2 = 'Pau'] = participants;
  const [selectedLetter, setSelectedLetter] = useState(null);

  const callHours = Math.round(callsStats.totalMinutes / 60);
  const p1CallHours = Math.round((callsStats.byAuthor?.[p1]?.minutes || 0) / 60);
  const p2CallHours = Math.round((callsStats.byAuthor?.[p2]?.minutes || 0) / 60);

  const p1Stickers = mediaBreakdown[p1]?.stickers || 403;
  const p2Stickers = mediaBreakdown[p2]?.stickers || 1220;
  const totalStickers = p1Stickers + p2Stickers;
  const p2StickerPct = Math.round((p2Stickers / totalStickers) * 100);

  const p1Photos = mediaBreakdown[p1]?.photos || 957;
  const p2Photos = mediaBreakdown[p2]?.photos || 582;
  const totalPhotos = p1Photos + p2Photos;
  const p1PhotoPct = Math.round((p1Photos / totalPhotos) * 100);

  const p1Audios = mediaBreakdown[p1]?.audios || 312;
  const p2Audios = mediaBreakdown[p2]?.audios || 113;

  return (
    <section id="deep-analytics" className="py-20 relative">
      {/* Background glow highlights */}
      <div
        className="absolute top-1/3 left-1/4 w-96 h-96 rounded-full pointer-events-none blur-3xl opacity-15"
        style={{ background: 'radial-gradient(circle, #f04080, transparent 70%)' }}
      />
      <div
        className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full pointer-events-none blur-3xl opacity-15"
        style={{ background: 'radial-gradient(circle, #ffd966, transparent 70%)' }}
      />

      {/* Section Header */}
      <div className="text-center mb-16">
        <motion.div {...fadeUp(0)} className="mb-3">
          <span className="section-label tracking-[0.3em] text-xs sm:text-sm font-semibold py-1.5 px-4">
            ✦ RADIOGRAFÍA DE NUESTRO AMOR ✦
          </span>
        </motion.div>
        <motion.h2
          {...fadeUp(0.1)}
          className="font-display text-3xl sm:text-5xl md:text-6xl font-black gradient-text tracking-tight mb-4"
        >
          Estadísticas Profundas &amp; Curiosidades
        </motion.h2>
        <motion.p
          {...fadeUp(0.15)}
          className="text-base sm:text-xl text-white/70 max-w-2xl mx-auto font-light"
        >
          Los números secretos detrás de cada llamada, risa, desvelo y recuerdo en nuestra historia.
        </motion.p>
      </div>

      <div className="space-y-12">
        {/* ─── 1. EL MARATÓN DE LLAMADAS ─────────────────────────────────── */}
        <motion.div
          {...fadeUp(0.2)}
          className="glass-panel p-6 sm:p-10 rounded-3xl border border-white/10 relative overflow-hidden shadow-2xl"
          style={{ background: 'linear-gradient(135deg, rgba(32, 12, 42, 0.75), rgba(15, 8, 26, 0.85))' }}
        >
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="max-w-xl text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs sm:text-sm font-semibold mb-4">
                <PhoneCall size={16} className="text-rose-400 animate-pulse" />
                <span>RÉCORD DE CONEXIÓN A DISTANCIA</span>
              </div>
              <h3 className="font-display text-2xl sm:text-4xl font-bold text-white mb-3">
                {callHours} Horas en Llamadas
              </h3>
              <p className="text-sm sm:text-base text-white/75 leading-relaxed mb-6">
                Hemos compartido <strong className="text-rose-300 font-semibold">{callsStats.totalMinutes.toLocaleString('es-CO')} minutos</strong> en {callsStats.answeredCalls} llamadas contestadas (más {callsStats.missedCalls} intentos de buscar al otro). ¡Eso equivale a casi <strong className="text-amber-300 font-semibold">7 días enteros ininterrumpidos</strong> con el teléfono al oído!
              </p>

              {/* Author breakdown bars */}
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs sm:text-sm font-medium mb-1">
                    <span className="text-white/80">{p2} ({p2CallHours}h · {callsStats.byAuthor?.[p2]?.calls || 270} llamadas)</span>
                    <span className="text-rose-400 font-mono">53%</span>
                  </div>
                  <div className="w-full h-3 rounded-full bg-white/5 overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: 'linear-gradient(90deg, #c82360, #f04080)' }}
                      initial={{ width: 0 }}
                      whileInView={{ width: '53%' }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.2, ease: 'easeOut' }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs sm:text-sm font-medium mb-1">
                    <span className="text-white/80">{p1} ({p1CallHours}h · {callsStats.byAuthor?.[p1]?.calls || 212} llamadas)</span>
                    <span className="text-violet-400 font-mono">47%</span>
                  </div>
                  <div className="w-full h-3 rounded-full bg-white/5 overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: 'linear-gradient(90deg, #6830e0, #9060ff)' }}
                      initial={{ width: 0 }}
                      whileInView={{ width: '47%' }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.2, ease: 'easeOut', delay: 0.15 }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Quick KPI Cards */}
            <div className="grid grid-cols-2 gap-4 w-full lg:w-auto">
              <div className="p-5 rounded-2xl bg-white/[0.04] border border-white/5 text-center min-w-[140px]">
                <Clock size={28} className="mx-auto text-amber-300 mb-2" />
                <span className="font-mono text-3xl sm:text-4xl font-black text-white block">
                  <CountUp end={callsStats.answeredCalls} duration={1500} />
                </span>
                <span className="text-xs text-white/60 font-semibold uppercase mt-1 block">Llamadas Respondidas</span>
              </div>

              <div className="p-5 rounded-2xl bg-white/[0.04] border border-white/5 text-center min-w-[140px]">
                <Heart size={28} className="mx-auto text-rose-400 mb-2 animate-pulse" />
                <span className="font-mono text-3xl sm:text-4xl font-black gradient-text-rose block">
                  <CountUp end={callsStats.missedCalls} duration={1600} />
                </span>
                <span className="text-xs text-white/60 font-semibold uppercase mt-1 block">Intentos / Extrañadas</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ─── 2. ROLES DE LA RELACIÓN (STICKERS, FOTOS, AUDIOS) ─────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Card: Reina de los stickers */}
          <motion.div
            {...fadeUp(0.1)}
            className="glass-panel p-6 rounded-3xl border border-rose-500/20 relative group hover:border-rose-500/50 transition-colors"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-3xl">👑</span>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-300">
                {p2StickerPct}% del total
              </span>
            </div>
            <h4 className="font-display text-lg font-bold text-white mb-1">
              Reina de los Stickers
            </h4>
            <p className="text-xs text-rose-300/80 mb-3">{p2}</p>
            <div className="font-mono text-4xl font-black text-white mb-2">
              <CountUp end={p2Stickers} duration={1600} />
            </div>
            <p className="text-xs text-white/60">
              stickers enviados vs {p1Stickers} de {p1}. ¡La reina indiscutible de las reacciones gráficas!
            </p>
          </motion.div>

          {/* Card: Fotógrafo Oficial */}
          <motion.div
            {...fadeUp(0.15)}
            className="glass-panel p-6 rounded-3xl border border-violet-500/20 relative group hover:border-violet-500/50 transition-colors"
          >
            <div className="flex items-center justify-between mb-4">
              <Camera size={28} className="text-violet-400" />
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-violet-500/20 text-violet-300">
                {p1PhotoPct}% de fotos
              </span>
            </div>
            <h4 className="font-display text-lg font-bold text-white mb-1">
              El Fotógrafo Oficial
            </h4>
            <p className="text-xs text-violet-300/80 mb-3">{p1}</p>
            <div className="font-mono text-4xl font-black text-white mb-2">
              <CountUp end={p1Photos} duration={1600} />
            </div>
            <p className="text-xs text-white/60">
              fotos e imágenes enviadas para compartir cada momento del día vs {p2Photos} de {p2}.
            </p>
          </motion.div>

          {/* Card: El Rey de los Audios */}
          <motion.div
            {...fadeUp(0.2)}
            className="glass-panel p-6 rounded-3xl border border-amber-500/20 relative group hover:border-amber-500/50 transition-colors"
          >
            <div className="flex items-center justify-between mb-4">
              <Mic size={28} className="text-amber-300" />
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300">
                {Math.round((p1Audios / (p1Audios + p2Audios)) * 100)}% audios
              </span>
            </div>
            <h4 className="font-display text-lg font-bold text-white mb-1">
              La Voz del Cariño
            </h4>
            <p className="text-xs text-amber-300/80 mb-3">{p1}</p>
            <div className="font-mono text-4xl font-black text-white mb-2">
              <CountUp end={p1Audios} duration={1600} />
            </div>
            <p className="text-xs text-white/60">
              notas de voz enviadas con historias, risas y pensamientos vs {p2Audios} de {p2}.
            </p>
          </motion.div>

          {/* Card: Directora de Videos */}
          <motion.div
            {...fadeUp(0.25)}
            className="glass-panel p-6 rounded-3xl border border-pink-500/20 relative group hover:border-pink-500/50 transition-colors"
          >
            <div className="flex items-center justify-between mb-4">
              <Video size={28} className="text-pink-400" />
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-pink-500/20 text-pink-300">
                {Math.round((mediaBreakdown[p2]?.videos / ((mediaBreakdown[p2]?.videos || 0) + (mediaBreakdown[p1]?.videos || 0))) * 100)}% videos
              </span>
            </div>
            <h4 className="font-display text-lg font-bold text-white mb-1">
              Directora de Momentos
            </h4>
            <p className="text-xs text-pink-300/80 mb-3">{p2}</p>
            <div className="font-mono text-4xl font-black text-white mb-2">
              <CountUp end={mediaBreakdown[p2]?.videos || 124} duration={1600} />
            </div>
            <p className="text-xs text-white/60">
              videos capturados de salidas, comidas y momentos inolvidables juntos.
            </p>
          </motion.div>
        </div>

        {/* ─── 3. RHYTHM OF LOVE & BARÓMETRO DE RISAS ────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Madrugadores vs Desvelados */}
          <motion.div
            {...fadeUp(0.2)}
            className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10"
          >
            <div className="flex items-center gap-3 mb-6">
              <Sun size={24} className="text-amber-300" />
              <h3 className="font-display text-xl sm:text-2xl font-bold text-white">
                Ritmo de Vida: Desvelos &amp; Madrugadas
              </h3>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Coffee size={18} className="text-amber-400" />
                    <span className="text-sm font-semibold text-white">Modo Madrugadores (06:00 – 10:00)</span>
                  </div>
                  <span className="font-mono text-lg font-bold text-amber-300">
                    {timeOfDayStats.earlyBirds.total.toLocaleString('es-CO')} msgs
                  </span>
                </div>
                <p className="text-xs text-white/60">
                  {p1} ({timeOfDayStats.earlyBirds[p1]?.toLocaleString('es-CO')}) y {p2} ({timeOfDayStats.earlyBirds[p2]?.toLocaleString('es-CO')}) despertando con un "Buenos días mi amor".
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Moon size={18} className="text-violet-400" />
                    <span className="text-sm font-semibold text-white">Modo Desvelo (00:00 – 06:00)</span>
                  </div>
                  <span className="font-mono text-lg font-bold text-violet-300">
                    {timeOfDayStats.nightOwls.total.toLocaleString('es-CO')} msgs
                  </span>
                </div>
                <p className="text-xs text-white/60">
                  {timeOfDayStats.nightOwls.total} mensajes enviados en horas silenciosas de la noche cuando nadie más existe en el mundo.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Flame size={18} className="text-rose-400" />
                    <span className="text-sm font-semibold text-white">Tarde &amp; Noche (10:00 – 23:59)</span>
                  </div>
                  <span className="font-mono text-lg font-bold text-rose-300">
                    {(timeOfDayStats.daytime.total + timeOfDayStats.evening.total).toLocaleString('es-CO')} msgs
                  </span>
                </div>
                <p className="text-xs text-white/60">
                  Compañía constante durante todo el transcurso del día, estudio y trabajo.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Barómetro de Risas */}
          <motion.div
            {...fadeUp(0.25)}
            className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Smile size={24} className="text-yellow-400" />
                <h3 className="font-display text-xl sm:text-2xl font-bold text-white">
                  El Barómetro de Risas &amp; Alegría
                </h3>
              </div>
              <p className="text-sm text-white/70 mb-6">
                En este historial se han contado más de <strong className="text-yellow-300 font-semibold">{laughterStats.total} ataques de risa</strong> y carcajadas explícitas (jajaja, jeje, 😂, 🤣, xd).
              </p>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-4 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 text-center">
                  <span className="text-2xl mb-1 block">🤣</span>
                  <span className="text-xs text-yellow-300 font-semibold">{p1}</span>
                  <span className="font-mono text-3xl font-black text-white block mt-1">
                    {laughterStats[p1]}
                  </span>
                  <span className="text-[10px] text-white/60">momentos de risa</span>
                </div>

                <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-center">
                  <span className="text-2xl mb-1 block">😂</span>
                  <span className="text-xs text-rose-300 font-semibold">{p2}</span>
                  <span className="font-mono text-3xl font-black text-white block mt-1">
                    {laughterStats[p2]}
                  </span>
                  <span className="text-[10px] text-white/60">momentos de risa</span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/5 text-center">
              <p className="text-xs sm:text-sm text-white/80 italic font-display">
                "La risa compartida es la distancia más corta entre dos corazones enamorados."
              </p>
            </div>
          </motion.div>
        </div>

        {/* ─── 4. NUESTRAS CARTAS MÁS EMOTIVAS ──────────────────────────── */}
        {loveLetters.length > 0 && (
          <motion.div
            {...fadeUp(0.3)}
            className="glass-panel p-6 sm:p-10 rounded-3xl border border-white/10"
          >
            <div className="flex items-center gap-3 mb-4">
              <Mail size={24} className="text-rose-400" />
              <div>
                <h3 className="font-display text-2xl sm:text-3xl font-bold text-white">
                  Nuestras Cartas Más Profundas
                </h3>
                <p className="text-xs sm:text-sm text-white/60 mt-0.5">
                  Los mensajes más largos, sinceros e inolvidables que nos hemos escrito.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-6">
              {loveLetters.slice(0, 4).map((letter, idx) => {
                const isSelected = selectedLetter === idx;
                const isP1 = letter.author === p1;

                return (
                  <motion.div
                    key={idx}
                    className="p-5 rounded-2xl border transition-all cursor-pointer relative"
                    style={{
                      background: isP1
                        ? 'linear-gradient(135deg, rgba(35, 15, 50, 0.6), rgba(20, 10, 35, 0.7))'
                        : 'linear-gradient(135deg, rgba(45, 10, 30, 0.6), rgba(25, 8, 20, 0.7))',
                      borderColor: isP1 ? 'rgba(144, 96, 255, 0.3)' : 'rgba(240, 64, 128, 0.3)',
                    }}
                    onClick={() => {
                      playHeartChime();
                      setSelectedLetter(isSelected ? null : idx);
                    }}
                    whileHover={{ scale: 1.01 }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2.5 h-2.5 rounded-full ${isP1 ? 'bg-violet-400' : 'bg-rose-400'}`}
                        />
                        <span className="font-bold text-sm text-white">{letter.author}</span>
                      </div>
                      <span className="text-xs text-white/50">{letter.dateStr}</span>
                    </div>

                    <p className="text-xs sm:text-sm text-white/80 leading-relaxed italic mb-3 font-serif">
                      "{isSelected ? letter.text : letter.text.slice(0, 190) + '...'}"
                    </p>

                    <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[11px] text-white/50">
                      <span>{letter.length.toLocaleString('es-CO')} caracteres · {letter.words} palabras</span>
                      <span className="text-rose-300 font-semibold flex items-center gap-1">
                        {isSelected ? 'Ver menos' : 'Leer completa'}
                        {isSelected ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}
