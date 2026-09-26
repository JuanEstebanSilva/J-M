import { useState, useCallback, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Heart, Sparkles, RotateCcw } from 'lucide-react';
import DropZone from './components/DropZone.jsx';
import Navbar from './components/Navbar.jsx';
import HeroSection from './components/HeroSection.jsx';
import CoupleStats from './components/CoupleStats.jsx';
import ActivityCharts from './components/ActivityCharts.jsx';
import VocabularySection from './components/VocabularySection.jsx';
import MemoriesSection from './components/MemoriesSection.jsx';
import LoveWrapped from './components/LoveWrapped.jsx';
import { parseWhatsAppChat, computeAnalytics } from './utils/whatsappParser.js';

function LoadingScreen() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        className="w-16 h-16 rounded-full border-4 border-blossom-blush border-t-blossom-wine mb-6"
      />
      <p className="font-display italic text-xl text-blossom-mauve">
        Analizando vuestra historia… 💕
      </p>
    </div>
  );
}

function ErrorScreen({ message, onReset }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="blossom-card p-10 text-center max-w-md">
        <div className="text-5xl mb-4">😔</div>
        <h2 className="font-display text-2xl text-blossom-burgundy mb-3">
          No pudimos procesar el archivo
        </h2>
        <p className="font-sans text-blossom-mauve text-sm mb-6 leading-relaxed">{message}</p>
        <button onClick={onReset} className="wine-btn flex items-center gap-2 mx-auto">
          <RotateCcw className="w-4 h-4" />
          Intentar de nuevo
        </button>
      </div>
    </div>
  );
}

export default function App() {
  const [rawText, setRawText] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [wrappedOpen, setWrappedOpen] = useState(false);

  const handleFileLoad = useCallback((text) => {
    setIsProcessing(true);
    setError(null);

    // Use setTimeout to allow UI to update before heavy parsing
    setTimeout(() => {
      try {
        const messages = parseWhatsAppChat(text);

        if (messages.length < 10) {
          setError(
            `Solo se detectaron ${messages.length} mensajes. Asegúrate de que el archivo sea un export de WhatsApp (.txt) con el formato correcto.`
          );
          setIsProcessing(false);
          return;
        }

        const result = computeAnalytics(messages);

        if (!result || !result.participants?.length) {
          setError('No se pudieron detectar participantes. Verifica que el chat tenga al menos dos personas.');
          setIsProcessing(false);
          return;
        }

        setAnalytics(result);
        setRawText(text);
      } catch (err) {
        console.error('Parse error:', err);
        setError('Error inesperado al procesar el archivo: ' + err.message);
      } finally {
        setIsProcessing(false);
      }
    }, 100);
  }, []);

  const handleReset = useCallback(() => {
    setRawText(null);
    setAnalytics(null);
    setError(null);
    setWrappedOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Show drop zone
  if (!analytics && !isProcessing && !error) {
    return <DropZone onFileLoad={handleFileLoad} />;
  }

  if (isProcessing) return <LoadingScreen />;

  if (error) return <ErrorScreen message={error} onReset={handleReset} />;

  return (
    <div className="min-h-screen">
      <Navbar
        onWrappedOpen={() => setWrappedOpen(true)}
        onReset={handleReset}
      />

      {/* Main dashboard */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-24 pb-20">
        <section id="hero" className="mb-16">
          <HeroSection analytics={analytics} />
        </section>

        <CoupleStats analytics={analytics} />
        <ActivityCharts analytics={analytics} />
        <VocabularySection analytics={analytics} />
        <MemoriesSection analytics={analytics} />
      </main>

      {/* Footer */}
      <footer className="border-t border-blossom-blush/50 bg-white/40 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Heart className="w-4 h-4 text-blossom-wine" fill="#8B3A52" />
            <span className="font-display italic text-blossom-mauve text-sm">
              Hecho con amor, procesado con privacidad
            </span>
          </div>
          <p className="font-sans text-xs text-blossom-rose/70">
            Ningún dato abandona tu navegador · Love Wrapped
          </p>
          <button
            onClick={handleReset}
            className="mt-4 font-sans text-xs text-blossom-mauve/60 hover:text-blossom-wine transition-colors flex items-center gap-1 mx-auto"
          >
            <RotateCcw className="w-3 h-3" />
            Cargar otro chat
          </button>
        </div>
      </footer>

      {/* Floating Love Wrapped button */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1, type: 'spring', stiffness: 200 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setWrappedOpen(true)}
        className="fixed bottom-6 right-6 z-30 wine-btn flex items-center gap-2 shadow-blossom-lg"
      >
        <Sparkles className="w-4 h-4" />
        <span className="hidden sm:inline">Love Wrapped</span>
        <span className="sm:hidden">✨</span>
      </motion.button>

      {/* Love Wrapped Modal */}
      <AnimatePresence>
        {wrappedOpen && (
          <LoveWrapped
            analytics={analytics}
            onClose={() => setWrappedOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
