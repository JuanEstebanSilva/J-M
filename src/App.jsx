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
      style={{ background: '#0a0a0f' }}
    >
      <div className="text-5xl">💔</div>
      <h1 className="font-display text-3xl text-white/90">Algo salió mal</h1>
      <p className="text-sm text-muted max-w-md text-center">{message}</p>
      <p className="text-xs text-muted/60 max-w-md text-center">
        Asegúrate de que el archivo <code className="font-mono text-wine-400 bg-white/5 px-1.5 py-0.5 rounded">src/data/_chat.txt</code> existe y contiene el historial exportado de WhatsApp.
      </p>
    </div>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
function Dashboard({ analytics, onOpenWrapped }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
    >
      <Navbar names={analytics.participants} onOpenWrapped={onOpenWrapped} />

      {/* Global ambient glows */}
      <div className="glow-overlay top-left"    aria-hidden="true" />
      <div className="glow-overlay top-right"   aria-hidden="true" />
      <div className="glow-overlay bottom-center" aria-hidden="true" />

      <main className="relative z-10">
        <HeroSection analytics={analytics} onOpenWrapped={onOpenWrapped} />

        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <MomentsGallery />

          <div className="h-px my-4 opacity-30" style={{ background: 'linear-gradient(90deg, transparent, rgba(200,35,96,0.4), rgba(144,96,255,0.3), transparent)' }} />

          <CoupleStats      analytics={analytics} />

          <div className="h-px my-4 opacity-30" style={{ background: 'linear-gradient(90deg, transparent, rgba(200,35,96,0.4), rgba(144,96,255,0.3), transparent)' }} />

          <ActivityCharts   analytics={analytics} />

          <div className="h-px my-4 opacity-30" style={{ background: 'linear-gradient(90deg, transparent, rgba(144,96,255,0.3), rgba(200,35,96,0.4), transparent)' }} />

          <VocabularySection analytics={analytics} />

          <div className="h-px my-4 opacity-30" style={{ background: 'linear-gradient(90deg, transparent, rgba(200,35,96,0.4), rgba(144,96,255,0.3), transparent)' }} />

          <MemoriesSection  analytics={analytics} />
        </div>

        {/* Footer */}
        <footer className="text-center py-16 px-4">
          <div className="h-px mb-10 max-w-xs mx-auto" style={{ background: 'linear-gradient(90deg, transparent, rgba(200,35,96,0.3), transparent)' }} />
          <motion.div
            className="text-3xl mb-3 select-none"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
          >
            ♥
          </motion.div>
          <p className="font-display text-lg italic" style={{ color: 'rgba(200,35,96,0.7)' }}>
            Nuestra historia, siempre.
          </p>
          <p className="text-xs text-muted mt-3">
            {analytics.participants[0]} &amp; {analytics.participants[1] || '?'} · {analytics.daysTotal} días juntos
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
    <div style={{ background: '#0a0a0f', minHeight: '100vh' }}>
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
