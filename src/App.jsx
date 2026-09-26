import { useMemo, useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import rawChat from './data/_chat.txt?raw';
import { parseWhatsApp, computeAnalytics } from './utils/whatsappParser.js';

import WelcomeScreen    from './components/WelcomeScreen.jsx';
import Navbar           from './components/Navbar.jsx';
import HeroSection      from './components/HeroSection.jsx';
import CoupleStats      from './components/CoupleStats.jsx';
import ActivityCharts   from './components/ActivityCharts.jsx';
import VocabularySection from './components/VocabularySection.jsx';
import MemoriesSection  from './components/MemoriesSection.jsx';
import LoveWrapped      from './components/LoveWrapped.jsx';
import MomentsGallery   from './components/MomentsGallery.jsx';
import FloatingParticles from './components/FloatingParticles.jsx';
import AudioPlayerButton from './components/AudioPlayerButton.jsx';

// ─── Parse & compute analytics once (memoized) ───────────────────────────────
function useAnalytics() {
  return useMemo(() => {
    try {
      const messages = parseWhatsApp(rawChat);
      if (!messages || messages.length === 0) return { error: 'No se encontraron mensajes.' };
      const analytics = computeAnalytics(messages);
      if (!analytics) return { error: 'No se pudieron calcular las estadísticas.' };
      return { analytics };
    } catch (err) {
      return { error: err.message || 'Error al procesar el chat.' };
    }
  }, []);
}

// ─── Error screen ─────────────────────────────────────────────────────────────
function ErrorScreen({ message }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 px-4"
      style={{ background: '#08080d' }}
    >
      <div className="text-6xl animate-bounce">💔</div>
      <h1 className="font-display text-4xl text-white font-bold">Algo salió mal</h1>
      <p className="text-base text-rose-300 max-w-md text-center">{message}</p>
      <p className="text-sm text-white/60 max-w-md text-center">
        Asegúrate de que el archivo <code className="font-mono text-wine-400 bg-white/10 px-2 py-1 rounded">src/data/_chat.txt</code> existe y contiene el historial exportado de WhatsApp.
      </p>
    </div>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
function Dashboard({ analytics, onOpenWrapped }) {
  const [p1 = 'Juanes', p2 = 'Pau'] = analytics.participants;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
    >
      {/* Ambient background particles (hearts, stars, dust) */}
      <FloatingParticles />

      {/* Floating Audio Player Button */}
      <AudioPlayerButton />

      {/* Navbar */}
      <Navbar names={analytics.participants} onOpenWrapped={onOpenWrapped} />

      {/* Global ambient glows */}
      <div className="glow-overlay top-left"    aria-hidden="true" />
      <div className="glow-overlay top-right"   aria-hidden="true" />
      <div className="glow-overlay bottom-center" aria-hidden="true" />

      <main className="relative z-10">
        <HeroSection analytics={analytics} onOpenWrapped={onOpenWrapped} />

        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <MomentsGallery />

          <div className="h-1 my-8 opacity-40 shimmer-line rounded-full" />

          <CoupleStats      analytics={analytics} />

          <div className="h-1 my-8 opacity-40 shimmer-line rounded-full" />

          <ActivityCharts   analytics={analytics} />

          <div className="h-1 my-8 opacity-40 shimmer-line rounded-full" />

          <VocabularySection analytics={analytics} />

          <div className="h-1 my-8 opacity-40 shimmer-line rounded-full" />

          <MemoriesSection  analytics={analytics} />
        </div>

        {/* Footer */}
        <footer className="text-center py-20 px-4">
          <div className="h-1 mb-12 max-w-md mx-auto shimmer-line rounded-full opacity-50" />
          <motion.div
            className="text-4xl mb-4 select-none cursor-pointer"
            animate={{ scale: [1, 1.18, 1] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
          >
            💖
          </motion.div>
          <h3 className="font-display text-2xl sm:text-3xl font-bold gradient-text mb-2">
            {p1} &amp; {p2}
          </h3>
          <p className="font-display text-lg italic text-rose-300/90 max-w-md mx-auto">
            "Nuestra historia, escrita con amor en cada mensaje, siempre."
          </p>
          <p className="text-sm text-white/50 mt-4 font-mono">
            {analytics.totalMessages?.toLocaleString('es-CO')} mensajes · {analytics.daysTotal} días juntos · Para toda la vida ♾️
          </p>
        </footer>
      </main>
    </motion.div>
  );
}

// ─── App root ─────────────────────────────────────────────────────────────────
export default function App() {
  const { analytics, error } = useAnalytics();

  // Welcome screen: show for 2.8s then fade to dashboard
  const [showWelcome, setShowWelcome] = useState(true);
  const [showWrapped, setShowWrapped] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowWelcome(false), 2800);
    return () => clearTimeout(timer);
  }, []);

  if (error) return <ErrorScreen message={error} />;

  return (
    <div style={{ background: '#08080d', minHeight: '100vh' }}>
      <AnimatePresence mode="wait">
        {showWelcome && (
          <WelcomeScreen key="welcome" onDone={() => setShowWelcome(false)} />
        )}
      </AnimatePresence>

      {/* Dashboard rendered after welcome transition */}
      {analytics && !showWelcome && (
        <Dashboard
          analytics={analytics}
          onOpenWrapped={() => setShowWrapped(true)}
        />
      )}

      {/* Love Wrapped Stories Modal */}
      <AnimatePresence>
        {showWrapped && analytics && (
          <LoveWrapped
            analytics={analytics}
            onClose={() => setShowWrapped(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
