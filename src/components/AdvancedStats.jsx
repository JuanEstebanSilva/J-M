import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Flame, Moon, Sun, Brain, Heart, Zap,
  BookOpen, Award, Sparkles, MessageSquare,
  Pizza, Radio, HelpCircle, Eye,
  Sparkle, ShieldCheck, CheckCircle2,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CountUp } from './ui.jsx';
import { playHeartChime } from '../utils/romanticAudio.js';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { delay, duration: 0.75, ease: [0.16, 1, 0.3, 1] },
});

function fireCelebrationConfetti() {
  confetti({
    particleCount: 140,
    spread: 100,
    origin: { y: 0.6 },
    colors: ['#c82360', '#9060ff', '#ffd966', '#ff80ad', '#34d399', '#ffffff'],
    scalar: 1.2,
  });
}

// ─── Metric Card Base ────────────────────────────────────────────────────────
function MetricCard({
  delay = 0,
  icon: Icon,
  iconColor,
  borderColor,
  glowColor,
  badge,
  title,
  mainValue,
  mainSuffix,
  children,
}) {
  return (
    <motion.div
      {...fadeUp(delay)}
      className="relative rounded-3xl p-6 sm:p-8 overflow-hidden group flex flex-col justify-between"
      style={{
        background: 'linear-gradient(145deg, rgba(28,18,44,0.92), rgba(14,10,26,0.96))',
        border: `1px solid ${borderColor}`,
        boxShadow: '0 16px 48px rgba(0,0,0,0.5)',
        transition: 'all 0.5s cubic-bezier(0.16,1,0.3,1)',
      }}
      whileHover={{
        y: -6,
        boxShadow: `0 24px 60px rgba(0,0,0,0.65), 0 0 50px ${glowColor}`,
      }}
    >
      {/* Corner glow */}
      <div
        className="absolute -top-12 -right-12 w-52 h-52 rounded-full blur-3xl opacity-20 pointer-events-none group-hover:opacity-40 transition-opacity duration-700"
        style={{ background: `radial-gradient(circle, ${glowColor}, transparent 70%)` }}
      />

      {/* Top Badge */}
      <div>
        <div className="flex items-center mb-5 relative z-10">
          <div
            className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full text-xs font-semibold"
            style={{ background: `${glowColor}20`, border: `1px solid ${borderColor}`, color: iconColor }}
          >
            <Icon size={14} className="shrink-0" />
            <span>{badge}</span>
          </div>
        </div>

        {/* Main Value */}
        {mainValue !== undefined && mainValue !== null && (
          <div className="relative z-10 mb-3">
            <span className="font-mono text-5xl sm:text-6xl font-black text-white leading-none">
              {typeof mainValue === 'number' ? <CountUp end={mainValue} duration={1800} /> : mainValue}
            </span>
            {mainSuffix && (
              <span className="text-xl text-white/55 ml-2 font-light">{mainSuffix}</span>
            )}
          </div>
        )}

        <h3 className="relative z-10 font-display text-xl sm:text-2xl font-bold text-white mb-4 leading-tight">
          {title}
        </h3>
      </div>

      <div className="relative z-10 mt-auto">{children}</div>
    </motion.div>
  );
}

// ─── Vocab Badge ─────────────────────────────────────────────────────────────
function VocabBadge({ word, total, p1, p2, p1Name, p2Name, delay = 0 }) {
  const maxVal = Math.max(p1, p2, 1);
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.82 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.38, type: 'spring', stiffness: 220 }}
      className="group relative flex flex-col gap-1.5 p-3 rounded-2xl bg-white/[0.04] border border-white/[0.07]
        hover:border-rose-500/35 transition-all duration-300 hover:bg-white/[0.07] cursor-default"
    >
      <span className="font-mono text-sm font-bold text-white tracking-wide truncate">{word}</span>
      <div className="flex gap-1 items-center">
        <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden" title={`${p1Name}: ${p1}`}>
          <div
            className="h-full rounded-full"
            style={{ width: `${(p1 / maxVal) * 100}%`, background: 'linear-gradient(90deg, #880b3a, #c82360)' }}
          />
        </div>
        <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden" title={`${p2Name}: ${p2}`}>
          <div
            className="h-full rounded-full"
            style={{ width: `${(p2 / maxVal) * 100}%`, background: 'linear-gradient(90deg, #6830e0, #9060ff)' }}
          />
        </div>
      </div>
      <span className="text-[10px] text-white/40 text-right font-mono">×{total}</span>

      {/* Hover tooltip */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1.5 rounded-xl bg-[#0a0a14]/95
        border border-white/10 text-[10px] text-white/85 whitespace-nowrap opacity-0 group-hover:opacity-100
        pointer-events-none transition-opacity z-30 shadow-xl">
        {p1Name}: ×{p1} · {p2Name}: ×{p2}
      </div>
    </motion.div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function AdvancedStats({ analytics }) {
  const [activeTab, setActiveTab] = useState('all');

  const {
    participants = ['Juanes', 'Pau'],
    loveStreak = { maxDays: 0, startDate: null, endDate: null },
    goodnightStats = { avgHour: 22, sleepsFirst: 'Juanes', sleepFirstCount: {} },
    goodMorningStats = { avgHour: 8, avgMin: 30, label: '08:30', wakesUpFirst: 'Juanes', morningFirstCount: {} },
    telepathyCount = 0,
    messageLengthStats = {},
    topCoupleVocab = [],
    heartStats = { total: 0, topHearts: [] },
    responseVelocity = {},
    recordDayStats = { messagesCount: 0, formattedDate: 'Día especial', bookPages: 1 },
    petNameCounts = [],
    totalAffectionWords = 0,
    chismeStats = { total: 0, topChismoso: 'Juanes' },
    cravingStats = { total: 0, topFoodie: 'Pau' },
    questionLoops = [],
    audioPodcastStats = { totalAudios: 0, spotifyEpisodes: 1 },
    cosmicCompatibility = { globalScore: 99.8, traits: [], verdict: '' },
  } = analytics;

  const [p1 = 'Juanes', p2 = 'Pau'] = participants;

  const formatDate = (str) => {
    if (!str) return '—';
    const [y, m, d] = str.split('-');
    return new Date(+y, +m - 1, +d).toLocaleDateString('es-CO', {
      day: 'numeric', month: 'long', year: 'numeric',
    });
  };

  const goodnightHour = goodnightStats.avgHour ?? 22;
  const goodnightLabel = `${String(goodnightHour).padStart(2, '0')}:${goodnightHour >= 23 || goodnightHour < 2 ? '59' : '00'}`;
  const goodnightPhase = goodnightHour >= 23 || goodnightHour < 5
    ? '🌃 Trasnochadores'
    : goodnightHour >= 22
    ? '🌙 Nocturnos románticos'
    : '🌆 Vespertinos';

  const p1Avg = messageLengthStats[p1]?.avg ?? 0;
  const p2Avg = messageLengthStats[p2]?.avg ?? 0;
  const biggerWriter = messageLengthStats.testamentWriter ?? p1;
  const smallerWriter = biggerWriter === p1 ? p2 : p1;
  const ratio = Math.round((Math.max(p1Avg, p2Avg) / Math.max(Math.min(p1Avg, p2Avg), 1)) * 10) / 10;

  const handleCelebrate = () => {
    playHeartChime();
    fireCelebrationConfetti();
  };

  const tabs = [
    { id: 'all', label: '✨ Todas las Métricas' },
    { id: 'rituales', label: '🔥 Rituales & Conexión' },
    { id: 'chisme', label: '🍕 Antojos & Chismes' },
    { id: 'amor', label: '💘 Amor & Cursilería' },
    { id: 'records', label: '🏆 Récords & Match' },
  ];

  return (
    <section id="advanced-stats" className="py-20 relative">
      {/* Ambient background glows */}
      <div
        className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full blur-[140px] opacity-[0.09] pointer-events-none"
        style={{ background: 'radial-gradient(circle, #9060ff, transparent 70%)' }}
      />
      <div
        className="absolute bottom-1/3 right-1/4 w-[500px] h-[500px] rounded-full blur-[120px] opacity-[0.09] pointer-events-none"
        style={{ background: 'radial-gradient(circle, #c82360, transparent 70%)' }}
      />

      {/* Section Header */}
      <div className="text-center mb-12">
        <motion.div {...fadeUp(0)} className="mb-3">
          <span className="section-label tracking-[0.3em] text-xs sm:text-sm font-semibold py-1.5 px-4">
            ✦ ESTADÍSTICAS CHIMBAS & SECRETAS ✦
          </span>
        </motion.div>
        <motion.h2
          {...fadeUp(0.1)}
          className="font-display text-3xl sm:text-5xl md:text-6xl font-black gradient-text tracking-tight mb-4"
        >
          Métricas Profundas del Amor
        </motion.h2>
        <motion.p {...fadeUp(0.15)} className="text-base sm:text-xl text-white/70 max-w-2xl mx-auto font-light">
          Los datos que nadie más tiene — chismes, rituales, antojos 24/7 y la radiografía real de su relación.
        </motion.p>

        {/* Tab Filters */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                activeTab === tab.id
                  ? 'bg-rose-500 text-white shadow-[0_0_20px_rgba(240,64,128,0.4)] scale-105'
                  : 'bg-white/[0.05] text-white/70 hover:bg-white/[0.1] hover:text-white border border-white/10'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-6">

        {/* ══════════════════════════════════════════════════════════════════════
            BLOQUE 1: RITUALES & CONEXIÓN
        ══════════════════════════════════════════════════════════════════════ */}
        {(activeTab === 'all' || activeTab === 'rituales') && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* 1. LOVE STREAK */}
            <MetricCard
              delay={0.1}
              icon={Flame}
              iconColor="#f87171"
              borderColor="rgba(240,64,128,0.28)"
              glowColor="rgba(240,64,128,0.5)"
              badge="RACHA MÁXIMA DE AMOR"
              mainValue={loveStreak.maxDays}
              mainSuffix="días seguidos"
              title="Sin un solo día de silencio"
            >
              <p className="text-white/65 text-sm leading-relaxed mb-4">
                Jamás pasó un día sin que se escribieran. Esta es la racha más larga de presencia constante —
                un récord de amor inquebrantable.
              </p>
              {loveStreak.startDate && loveStreak.endDate && (
                <div className="flex items-center gap-2 p-3 rounded-2xl bg-white/[0.04] border border-white/[0.08] mb-4 text-xs font-mono text-white/70">
                  <span className="text-rose-400">Desde:</span>
                  <span>{formatDate(loveStreak.startDate)}</span>
                  <span className="text-white/30">→</span>
                  <span className="text-purple-400">Hasta:</span>
                  <span>{formatDate(loveStreak.endDate)}</span>
                </div>
              )}
              <button
                onClick={handleCelebrate}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-white transition-all
                  hover:scale-105 active:scale-95 flex items-center gap-2 shadow-lg"
                style={{ background: 'linear-gradient(135deg, #880b3a, #c82360)' }}
              >
                🎉 ¡Celebrar este récord!
              </button>
            </MetricCard>

            {/* 2. GOODNIGHT RITUAL */}
            <MetricCard
              delay={0.15}
              icon={Moon}
              iconColor="#c084fc"
              borderColor="rgba(144,96,255,0.28)"
              glowColor="rgba(144,96,255,0.45)"
              badge="RITUAL NOCTURNO"
              mainValue={goodnightLabel}
              mainSuffix={goodnightPhase}
              title="La hora canónica del último mensaje"
            >
              <p className="text-white/65 text-sm leading-relaxed mb-4">
                En promedio, el último mensaje del día llega a las <strong className="text-violet-300">{goodnightLabel}</strong> —{' '}
                cerrando cada jornada con amor antes de dormir.
              </p>
              <div className="grid grid-cols-2 gap-3 mb-2">
                {[
                  { name: p1, count: goodnightStats.sleepFirstCount?.[p1] || 0, isFirst: goodnightStats.sleepsFirst === p1 },
                  { name: p2, count: goodnightStats.sleepFirstCount?.[p2] || 0, isFirst: goodnightStats.sleepsFirst === p2 },
                ].map(({ name, count, isFirst }) => (
                  <div
                    key={name}
                    className={`p-3.5 rounded-2xl border transition-all ${
                      isFirst
                        ? 'bg-violet-950/40 border-violet-500/40 shadow-[0_0_15px_rgba(144,96,255,0.15)]'
                        : 'bg-white/[0.03] border-white/[0.07]'
                    }`}
                  >
                    <div className="text-xs font-semibold text-white/90 mb-1">{name}</div>
                    <div className="text-xs text-violet-300 font-mono">
                      {count} <span className="text-[10px] text-white/45 block">últimos mensajes</span>
                    </div>
                    {isFirst && (
                      <div className="mt-2 text-[10px] font-bold text-violet-300 bg-violet-500/20 px-2 py-0.5 rounded-full inline-block">
                        😴 Duerme primero
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </MetricCard>

          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════
            BLOQUE 2: MAÑANA + TELEPATÍA + CORAZONES
        ══════════════════════════════════════════════════════════════════════ */}
        {(activeTab === 'all' || activeTab === 'rituales' || activeTab === 'amor') && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* 3. GOOD MORNING RITUAL */}
            <MetricCard
              delay={0.2}
              icon={Sun}
              iconColor="#fbbf24"
              borderColor="rgba(251,191,36,0.25)"
              glowColor="rgba(251,191,36,0.35)"
              badge="RITUAL MATUTINO"
              mainValue={goodMorningStats.label}
              mainSuffix="AM"
              title="El Primer Saludo del Día"
            >
              <p className="text-white/65 text-xs sm:text-sm leading-relaxed mb-4">
                Cada mañana abren el día con amor. <strong className="text-amber-300">{goodMorningStats.wakesUpFirst}</strong>{' '}
                suele ser quien abre los ojos y envía el primer mensaje matutino.
              </p>
              <div className="p-3 rounded-2xl bg-amber-500/[0.08] border border-amber-500/20 flex items-center justify-between">
                <span className="text-xs text-white/80 font-medium">Inicia la mañana</span>
                <span className="text-xs font-mono font-bold text-amber-300">
                  {goodMorningStats.morningFirstCount?.[goodMorningStats.wakesUpFirst] || 0} mañanas
                </span>
              </div>
            </MetricCard>

            {/* 4. TELEPATHY INDEX */}
            <MetricCard
              delay={0.25}
              icon={Brain}
              iconColor="#34d399"
              borderColor="rgba(52,211,153,0.25)"
              glowColor="rgba(52,211,153,0.35)"
              badge="ÍNDICE DE TELEPATÍA"
              mainValue={telepathyCount}
              mainSuffix="veces"
              title="Sincronicidad Cósmica"
            >
              <p className="text-white/65 text-xs sm:text-sm leading-relaxed mb-4">
                Momentos en los que <strong className="text-emerald-300">ambos se escribieron casi al mismo tiempo</strong>{' '}
                (menos de 60 segundos de diferencia sin planearlo).
              </p>
              <div className="p-3.5 rounded-2xl bg-emerald-500/[0.07] border border-emerald-500/20 flex items-center gap-3">
                <div className="text-3xl select-none">🧠</div>
                <div>
                  <p className="text-xs font-bold text-emerald-300">Conexión Inmediata</p>
                  <p className="text-[11px] text-white/60">Pensar el uno en el otro simultáneamente</p>
                </div>
              </div>
            </MetricCard>

            {/* 5. UNIVERSO DE CORAZONES */}
            <MetricCard
              delay={0.3}
              icon={Heart}
              iconColor="#ec4899"
              borderColor="rgba(236,72,153,0.28)"
              glowColor="rgba(236,72,153,0.4)"
              badge="UNIVERSO DE CORAZONES"
              mainValue={heartStats.total}
              mainSuffix="corazones"
              title="Amor en Emojis"
            >
              <p className="text-white/65 text-xs sm:text-sm leading-relaxed mb-3">
                Un torrente interminable de corazones enviados a lo largo de toda la historia del chat.
              </p>
              <div className="flex items-center justify-between p-3 rounded-2xl bg-pink-500/[0.08] border border-pink-500/20 text-xs">
                <div>
                  <span className="text-white/60 block text-[10px]">Favorito de {p1}</span>
                  <span className="text-lg">{heartStats.p1FavoriteHeart || '❤️'}</span>
                </div>
                <div className="text-right">
                  <span className="text-white/60 block text-[10px]">Favorito de {p2}</span>
                  <span className="text-lg">{heartStats.p2FavoriteHeart || '💜'}</span>
                </div>
              </div>
            </MetricCard>

          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════
            BLOQUE 3: ANTOJOS 24/7 + RADAR DE CHISMES + BATALLA DE AUDIOS (PODCASTS)
        ══════════════════════════════════════════════════════════════════════ */}
        {(activeTab === 'all' || activeTab === 'chisme') && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* 6. RADAR DE CHISME & EXCLUSIVAS */}
            <MetricCard
              delay={0.35}
              icon={Eye}
              iconColor="#a78bfa"
              borderColor="rgba(167,139,250,0.28)"
              glowColor="rgba(167,139,250,0.4)"
              badge="RADAR DE CHISME & EXCLUSIVAS"
              mainValue={chismeStats.total}
              mainSuffix="exclusivas"
              title="¿Quién cuenta más chisme?"
            >
              <p className="text-white/65 text-xs sm:text-sm leading-relaxed mb-4">
                Frases como &ldquo;no sabes lo que pasó&rdquo;, &ldquo;imagínate&rdquo;, &ldquo;te tengo que contar&rdquo; y &ldquo;adivina&rdquo;.
              </p>
              <div className="p-3.5 rounded-2xl bg-purple-500/[0.08] border border-purple-500/20 mb-3">
                <div className="flex justify-between text-xs mb-2">
                  <span className="text-white font-medium">{p1}: <strong className="text-purple-300 font-mono">{chismeStats[p1] || 0}</strong></span>
                  <span className="text-white font-medium">{p2}: <strong className="text-purple-300 font-mono">{chismeStats[p2] || 0}</strong></span>
                </div>
                <div className="flex gap-1 h-2 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${((chismeStats[p1] || 1) / Math.max(chismeStats.total || 1, 1)) * 100}%`, background: '#c82360' }}
                  />
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${((chismeStats[p2] || 1) / Math.max(chismeStats.total || 1, 1)) * 100}%`, background: '#9060ff' }}
                  />
                </div>
              </div>
              <div className="text-[11px] text-purple-300 font-bold text-center">
                📢 Corresponsal Oficial: <span className="text-white">{chismeStats.topChismoso}</span>
              </div>
            </MetricCard>

            {/* 7. DETECTOR DE ANTOJOS 24/7 */}
            <MetricCard
              delay={0.4}
              icon={Pizza}
              iconColor="#fb923c"
              borderColor="rgba(251,146,60,0.28)"
              glowColor="rgba(251,146,60,0.4)"
              badge="ANTOJOS & COMIDA 24/7"
              mainValue={cravingStats.total}
              mainSuffix="antojos"
              title="¿Quién tiene más hambre?"
            >
              <p className="text-white/65 text-xs sm:text-sm leading-relaxed mb-4">
                Menciones de pizza, hamburguesas, sushi, helados, &ldquo;tengo hambre&rdquo; y &ldquo;pidamos domicilio&rdquo;.
              </p>
              <div className="p-3.5 rounded-2xl bg-orange-500/[0.08] border border-orange-500/20 mb-3">
                <div className="flex justify-between text-xs mb-2">
                  <span className="text-white font-medium">{p1}: <strong className="text-orange-300 font-mono">{cravingStats[p1] || 0}</strong></span>
                  <span className="text-white font-medium">{p2}: <strong className="text-orange-300 font-mono">{cravingStats[p2] || 0}</strong></span>
                </div>
                <div className="flex gap-1 h-2 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${((cravingStats[p1] || 1) / Math.max(cravingStats.total || 1, 1)) * 100}%`, background: '#c82360' }}
                  />
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${((cravingStats[p2] || 1) / Math.max(cravingStats.total || 1, 1)) * 100}%`, background: '#fb923c' }}
                  />
                </div>
              </div>
              <div className="text-[11px] text-orange-300 font-bold text-center">
                🍕 Capitán de Antojos: <span className="text-white">{cravingStats.topFoodie}</span>
              </div>
            </MetricCard>

            {/* 8. MODO PODCAST / AUDIOS DE VOZ */}
            <MetricCard
              delay={0.45}
              icon={Radio}
              iconColor="#38bdf8"
              borderColor="rgba(56,189,248,0.28)"
              glowColor="rgba(56,189,248,0.4)"
              badge="MODO PODCAST / AUDIOS"
              mainValue={audioPodcastStats.totalAudios}
              mainSuffix="audios"
              title="Los Podcasts de WhatsApp"
            >
              <p className="text-white/65 text-xs sm:text-sm leading-relaxed mb-4">
                Notas de voz que parecen episodios completos grabados en la radio.
              </p>
              <div className="p-3.5 rounded-2xl bg-sky-500/[0.08] border border-sky-500/20 mb-3">
                <div className="text-xs text-sky-200 mb-2 flex items-center justify-between">
                  <span>Equivalente a:</span>
                  <span className="font-mono font-bold text-white">~{audioPodcastStats.totalMinutes} min grabados</span>
                </div>
                <div className="p-2 rounded-xl bg-black/40 text-[11px] text-white/80 font-mono text-center">
                  🎙️ ¡Unas {audioPodcastStats.spotifyEpisodes} horas de podcast en Spotify!
                </div>
              </div>
              <div className="text-[11px] text-sky-300 font-bold text-center">
                👑 Creador del Podcast: <span className="text-white">{audioPodcastStats.podcastKing}</span>
              </div>
            </MetricCard>

          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════
            BLOQUE 4: BUCLE DE PREGUNTAS TÍPICAS DE LA PAREJA
        ══════════════════════════════════════════════════════════════════════ */}
        {(activeTab === 'all' || activeTab === 'chisme') && questionLoops.length > 0 && (
          <motion.div
            {...fadeUp(0.5)}
            className="rounded-3xl p-6 sm:p-8"
            style={{
              background: 'linear-gradient(145deg, rgba(28,18,44,0.92), rgba(14,10,26,0.96))',
              border: '1px solid rgba(144,96,255,0.22)',
              boxShadow: '0 16px 48px rgba(0,0,0,0.5)',
            }}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full text-xs font-semibold w-fit mb-2"
                  style={{ background: 'rgba(144,96,255,0.15)', border: '1px solid rgba(144,96,255,0.3)', color: '#c084fc' }}>
                  <HelpCircle size={14} />
                  <span>EL BUCLE INFINITO</span>
                </div>
                <h3 className="font-display text-2xl font-bold text-white">
                  Las Preguntas del Millón que Más se Hacen
                </h3>
                <p className="text-sm text-white/65 font-light mt-1">
                  Esas preguntas indispensables de cada día que demuestran preocupación, cariño y presencia constante.
                </p>
              </div>

              {/* Legend */}
              <div className="flex items-center gap-4 text-xs font-semibold shrink-0">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full inline-block" style={{ background: '#c82360' }} />
                  <span className="text-white/80">{p1}</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full inline-block" style={{ background: '#9060ff' }} />
                  <span className="text-white/80">{p2}</span>
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {questionLoops.map((q) => (
                <div
                  key={q.label}
                  className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.07] hover:border-violet-500/35 transition-all"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-sm text-white">{q.label}</span>
                    <span className="font-mono text-xs text-violet-300 font-bold">×{q.total}</span>
                  </div>
                  <div className="flex gap-1 h-2 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${((q[p1] || 0) / (q.total || 1)) * 100}%`,
                        background: '#c82360',
                      }}
                      title={`${p1}: ${q[p1] || 0}`}
                    />
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${((q[p2] || 0) / (q.total || 1)) * 100}%`,
                        background: '#9060ff',
                      }}
                      title={`${p2}: ${q[p2] || 0}`}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] text-white/50 mt-2 font-mono">
                    <span>{p1}: {q[p1] || 0}</span>
                    <span>{p2}: {q[p2] || 0}</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════
            BLOQUE 5: LONGITUD + VELOCIDAD + DÍA RÉCORD
        ══════════════════════════════════════════════════════════════════════ */}
        {(activeTab === 'all' || activeTab === 'amor' || activeTab === 'records') && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* 9. TESTAMENTOS VS DIRECTOS */}
            <MetricCard
              delay={0.5}
              icon={MessageSquare}
              iconColor="#60a5fa"
              borderColor="rgba(96,165,250,0.25)"
              glowColor="rgba(96,165,250,0.35)"
              badge="LONGITUD DE MENSAJES"
              title="¿Quién escribe más largo?"
            >
              <p className="text-white/65 text-xs sm:text-sm leading-relaxed mb-4">
                Promedio de caracteres por mensaje — el &ldquo;testamentero&rdquo; escribe novelas, el &ldquo;directo&rdquo; va al grano.
              </p>
              <div className="space-y-3 mb-4">
                {[
                  { name: p1, avg: p1Avg, gradient: 'linear-gradient(90deg, #880b3a, #c82360)', icon: p1 === biggerWriter ? '📜' : '✉️' },
                  { name: p2, avg: p2Avg, gradient: 'linear-gradient(90deg, #6830e0, #9060ff)', icon: p2 === biggerWriter ? '📜' : '✉️' },
                ].map(({ name, avg, gradient, icon }) => {
                  const maxAvg = Math.max(p1Avg, p2Avg, 1);
                  return (
                    <div key={name}>
                      <div className="flex justify-between items-center text-xs mb-1">
                        <span className="font-semibold text-white/90 flex items-center gap-1.5">
                          <span>{icon}</span> {name}
                        </span>
                        <span className="font-mono text-white/60">{avg} caracteres</span>
                      </div>
                      <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                        <motion.div
                          className="h-full rounded-full"
                          style={{ background: gradient }}
                          initial={{ width: 0 }}
                          whileInView={{ width: `${(avg / maxAvg) * 100}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.9, ease: 'easeOut' }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="p-3 rounded-2xl bg-blue-500/[0.08] border border-blue-500/20 text-xs text-blue-200">
                <strong className="text-white">{biggerWriter}</strong> escribe {ratio}× más largo que{' '}
                <strong className="text-white">{smallerWriter}</strong> en promedio.
              </div>
            </MetricCard>

            {/* 10. VELOCIDAD DE INTERÉS */}
            <MetricCard
              delay={0.55}
              icon={Zap}
              iconColor="#eab308"
              borderColor="rgba(234,179,8,0.25)"
              glowColor="rgba(234,179,8,0.35)"
              badge="VELOCIDAD DE RESPUESTA"
              title="Afinidad en Tiempo Real"
            >
              <p className="text-white/65 text-xs sm:text-sm leading-relaxed mb-4">
                Cuando uno escribe, el otro no se hace esperar. Respuestas casi instantáneas en el chat.
              </p>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/[0.08]">
                  <span className="text-[11px] text-white/60 block">{p1}</span>
                  <span className="text-lg font-mono font-bold text-white">
                    {responseVelocity[p1]?.avgMinutes || 5} <span className="text-xs font-normal text-white/50">min</span>
                  </span>
                  <span className="text-[10px] text-emerald-400 block mt-1">
                    ⚡ {responseVelocity[p1]?.fastCount || 0} ultrarrápidas
                  </span>
                </div>
                <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/[0.08]">
                  <span className="text-[11px] text-white/60 block">{p2}</span>
                  <span className="text-lg font-mono font-bold text-white">
                    {responseVelocity[p2]?.avgMinutes || 5} <span className="text-xs font-normal text-white/50">min</span>
                  </span>
                  <span className="text-[10px] text-emerald-400 block mt-1">
                    ⚡ {responseVelocity[p2]?.fastCount || 0} ultrarrápidas
                  </span>
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-yellow-500/[0.08] border border-yellow-500/20 text-xs text-yellow-200 text-center font-medium">
                🏆 Más veloz al responder: <strong className="text-white">{responseVelocity.fastestResponder || p1}</strong>
              </div>
            </MetricCard>

            {/* 11. DÍA RÉCORD HISTÓRICO */}
            <MetricCard
              delay={0.6}
              icon={Award}
              iconColor="#f43f5e"
              borderColor="rgba(244,63,94,0.28)"
              glowColor="rgba(244,63,94,0.4)"
              badge="DÍA RÉCORD HISTÓRICO"
              mainValue={recordDayStats.messagesCount}
              mainSuffix="mensajes"
              title="El Día Más Intenso"
            >
              <p className="text-white/65 text-xs sm:text-sm leading-relaxed mb-3">
                El día con mayor volumen de amor e intercambio de toda la relación:
              </p>
              <div className="p-3.5 rounded-2xl bg-rose-500/[0.09] border border-rose-500/20 mb-3">
                <span className="text-xs font-bold text-rose-300 block capitalize">
                  📅 {recordDayStats.formattedDate}
                </span>
                <p className="text-[11px] text-white/70 mt-1">
                  Ese solo día equivalió a unas <strong className="text-white">{recordDayStats.bookPages} páginas</strong> de un libro romántico.
                </p>
              </div>
            </MetricCard>

          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════
            BLOQUE 6: APODOS & DICCIONARIO DE TERNURA
        ══════════════════════════════════════════════════════════════════════ */}
        {(activeTab === 'all' || activeTab === 'amor') && petNameCounts.length > 0 && (
          <motion.div
            {...fadeUp(0.65)}
            className="rounded-3xl p-6 sm:p-8"
            style={{
              background: 'linear-gradient(145deg, rgba(32,18,48,0.92), rgba(16,10,28,0.96))',
              border: '1px solid rgba(240,64,128,0.22)',
              boxShadow: '0 16px 48px rgba(0,0,0,0.5)',
            }}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full text-xs font-semibold w-fit mb-2"
                  style={{ background: 'rgba(240,64,128,0.15)', border: '1px solid rgba(240,64,128,0.3)', color: '#f472b6' }}>
                  <Heart size={14} />
                  <span>DICCIONARIO DE TERNURA</span>
                </div>
                <h3 className="font-display text-2xl font-bold text-white">
                  Nuestros Apodos de Cariño Más Usados
                </h3>
                <p className="text-sm text-white/65 font-light mt-1">
                  Más de <strong className="text-pink-300 font-mono">{totalAffectionWords.toLocaleString('es-CO')}</strong> menciones de amor sincero desglosadas entre {p1} y {p2}.
                </p>
              </div>

              {/* Legend */}
              <div className="flex items-center gap-4 text-xs font-semibold shrink-0">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full inline-block" style={{ background: '#c82360' }} />
                  <span className="text-white/80">{p1}</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full inline-block" style={{ background: '#9060ff' }} />
                  <span className="text-white/80">{p2}</span>
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {petNameCounts.map((item) => (
                <div
                  key={item.label}
                  className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.07] hover:border-pink-500/30 transition-all"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-sm text-white">{item.label}</span>
                    <span className="font-mono text-xs text-pink-300 font-bold">{item.total}</span>
                  </div>
                  <div className="flex gap-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${((item[p1] || 0) / (item.total || 1)) * 100}%`,
                        background: '#c82360',
                      }}
                      title={`${p1}: ${item[p1] || 0}`}
                    />
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${((item[p2] || 0) / (item.total || 1)) * 100}%`,
                        background: '#9060ff',
                      }}
                      title={`${p2}: ${item[p2] || 0}`}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-white/45 mt-1.5 font-mono">
                    <span>{p1}: {item[p1] || 0}</span>
                    <span>{p2}: {item[p2] || 0}</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════
            BLOQUE 7: SIMULADOR DE COMPATIBILIDAD CÓSMICA
        ══════════════════════════════════════════════════════════════════════ */}
        {(activeTab === 'all' || activeTab === 'records') && (
          <motion.div
            {...fadeUp(0.7)}
            className="rounded-3xl p-6 sm:p-8 relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(38,16,64,0.95), rgba(18,10,32,0.98))',
              border: '1px solid rgba(168,85,247,0.3)',
              boxShadow: '0 20px 60px rgba(144,96,255,0.15)',
            }}
          >
            <div className="flex flex-col lg:flex-row items-center gap-8">
              {/* Score Circular Glow */}
              <div className="relative shrink-0 text-center">
                <div className="w-36 h-36 rounded-full flex flex-col items-center justify-center p-3 relative"
                  style={{
                    background: 'radial-gradient(circle, rgba(168,85,247,0.25) 0%, rgba(200,35,96,0.15) 70%, transparent 100%)',
                    border: '2px solid rgba(168,85,247,0.4)',
                    boxShadow: '0 0 35px rgba(168,85,247,0.35)',
                  }}
                >
                  <Sparkles size={20} className="text-yellow-400 mb-1 animate-pulse" />
                  <span className="font-mono text-4xl font-black text-white leading-none">
                    {cosmicCompatibility.globalScore}%
                  </span>
                  <span className="text-[10px] text-purple-200 uppercase tracking-widest mt-1 font-semibold">
                    Match Cósmico
                  </span>
                </div>
              </div>

              {/* Traits Breakdown */}
              <div className="flex-1 w-full">
                <div className="flex items-center gap-2 mb-2">
                  <ShieldCheck size={16} className="text-purple-400" />
                  <span className="text-xs uppercase font-bold text-purple-300 tracking-wider">
                    Certificado de Compatibilidad Absoluta
                  </span>
                </div>
                <h3 className="font-display text-2xl font-bold text-white mb-2">
                  {cosmicCompatibility.verdict}
                </h3>
                <p className="text-xs sm:text-sm text-white/70 mb-5 font-light">
                  El algoritmo analizó cada patrón, risa, audio y noche de conversación para comprobar que son almas gemelas indiscutibles.
                </p>

                <div className="space-y-2.5">
                  {cosmicCompatibility.traits.map((trait) => (
                    <div key={trait.name} className="flex items-center justify-between gap-3 text-xs">
                      <span className="text-white/80 font-medium flex items-center gap-1.5">
                        <CheckCircle2 size={13} className="text-emerald-400" />
                        {trait.name}
                      </span>
                      <div className="flex-1 max-w-xs h-2 rounded-full bg-white/10 overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${trait.score}%`,
                            background: 'linear-gradient(90deg, #ec4899, #a855f7)',
                          }}
                        />
                      </div>
                      <span className="font-mono font-bold text-purple-300 shrink-0">{trait.score}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════
            BLOQUE 8: EL IDIOMA SECRETO (VOCABULARIO EXCLUSIVO)
        ══════════════════════════════════════════════════════════════════════ */}
        {(activeTab === 'all' || activeTab === 'amor') && (
          <motion.div
            {...fadeUp(0.75)}
            className="rounded-3xl p-6 sm:p-8"
            style={{
              background: 'linear-gradient(145deg, rgba(28,18,44,0.92), rgba(14,10,26,0.96))',
              border: '1px solid rgba(144,96,255,0.22)',
              boxShadow: '0 16px 48px rgba(0,0,0,0.5)',
            }}
          >
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <div
                  className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full text-xs font-semibold w-fit mb-2"
                  style={{ background: 'rgba(144,96,255,0.15)', border: '1px solid rgba(144,96,255,0.3)', color: '#c084fc' }}
                >
                  <BookOpen size={14} />
                  <span>EL IDIOMA SECRETO</span>
                </div>
                <h3 className="font-display text-2xl font-bold text-white">
                  Palabras Únicas de Su Conversación
                </h3>
                <p className="text-sm text-white/65 font-light mt-1">
                  Estas son las palabras que más usan juntos — su vocabulario compartido, nicknames, expresiones
                  y el lenguaje que solo existe dentro de esta conversación.
                </p>
              </div>

              {/* Legend */}
              <div className="flex items-center gap-4 text-xs font-semibold shrink-0">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full inline-block" style={{ background: '#c82360' }} />
                  <span className="text-white/80">{p1}</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full inline-block" style={{ background: '#9060ff' }} />
                  <span className="text-white/80">{p2}</span>
                </span>
              </div>
            </div>

            {/* Grid of vocab badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
              {topCoupleVocab.slice(0, 20).map((item, i) => (
                <VocabBadge
                  key={item.word}
                  word={item.word}
                  total={item.total}
                  p1={item[p1] || 0}
                  p2={item[p2] || 0}
                  p1Name={p1}
                  p2Name={p2}
                  delay={i * 0.03}
                />
              ))}
            </div>

            <p className="text-[11px] text-white/35 text-center mt-6">
              La barra izquierda muestra el uso de {p1} y la derecha el de {p2}. Pasa el cursor sobre cualquier palabra para ver el desglose exacto.
            </p>
          </motion.div>
        )}

      </div>
    </section>
  );
}
