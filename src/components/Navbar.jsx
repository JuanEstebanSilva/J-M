import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Menu, X } from 'lucide-react';

const NAV_ITEMS = [
  { href: '#hero', label: 'Portada' },
  { href: '#couple-stats', label: 'Pareja' },
  { href: '#activity', label: 'Actividad' },
  { href: '#vocabulary', label: 'Vocabulario' },
  { href: '#memories', label: 'Memorias' },
];

export default function Navbar({ onWrappedOpen, onReset }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const scrollTo = (href) => {
    setMobileOpen(false);
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <>
      <motion.nav
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className={`
          fixed top-0 left-0 right-0 z-40 transition-all duration-300
          ${scrolled
            ? 'bg-white/80 backdrop-blur-xl shadow-blossom border-b border-blossom-blush/50'
            : 'bg-transparent'
          }
        `}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <button onClick={onReset} className="flex items-center gap-2 group">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-8 h-8 rounded-full bg-gradient-to-br from-blossom-rose to-blossom-wine flex items-center justify-center shadow-blossom"
            >
              <Heart className="w-4 h-4 text-white" fill="white" />
            </motion.div>
            <span className="font-display text-lg text-blossom-wine font-semibold group-hover:text-blossom-burgundy transition-colors">
              Love Wrapped
            </span>
          </button>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map(item => (
              <button
                key={item.href}
                onClick={() => scrollTo(item.href)}
                className="font-sans text-sm text-blossom-mauve hover:text-blossom-wine px-3 py-2 rounded-full hover:bg-blossom-blush/50 transition-all duration-200"
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* CTA */}
          <div className="flex items-center gap-2">
            <button
              onClick={onWrappedOpen}
              className="wine-btn text-sm py-2 px-4 flex items-center gap-1.5 hidden sm:flex"
            >
              <span>✨</span>
              Love Wrapped
            </button>
            <button
              onClick={() => setMobileOpen(o => !o)}
              className="md:hidden w-9 h-9 rounded-full bg-blossom-blush/60 flex items-center justify-center text-blossom-wine hover:bg-blossom-blush transition-colors"
            >
              {mobileOpen ? <X className="w-4.5 h-4.5" size={18} /> : <Menu className="w-4.5 h-4.5" size={18} />}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.25 }}
            className="fixed top-16 left-0 right-0 z-30 bg-white/95 backdrop-blur-xl shadow-blossom-lg border-b border-blossom-blush/50 px-4 py-4"
          >
            <div className="flex flex-col gap-1">
              {NAV_ITEMS.map(item => (
                <button
                  key={item.href}
                  onClick={() => scrollTo(item.href)}
                  className="font-sans text-base text-blossom-mauve hover:text-blossom-wine text-left px-4 py-3 rounded-xl hover:bg-blossom-petal transition-all"
                >
                  {item.label}
                </button>
              ))}
              <div className="h-px bg-blossom-blush my-2" />
              <button
                onClick={() => { setMobileOpen(false); onWrappedOpen(); }}
                className="wine-btn text-sm py-2.5 text-center"
              >
                ✨ Ver Love Wrapped
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
