import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, BarChart2, Clock, Sparkles, Menu, X, Image as ImageIcon } from 'lucide-react';

const NAV_ITEMS = [
  { href: '#hero',       label: 'Inicio',     icon: Heart },
  { href: '#moments',    label: 'Momentos',   icon: ImageIcon },
  { href: '#couple',     label: 'Dinamómetros', icon: BarChart2 },
  { href: '#activity',   label: 'Hábitos',    icon: Clock },
  { href: '#vocabulary', label: 'Palabras',   icon: Sparkles },
  { href: '#memories',   label: 'Memorias',   icon: Heart },
];

export default function Navbar({ names, onOpenWrapped }) {
  const [scrolled, setScrolled]  = useState(false);
  const [menuOpen, setMenuOpen]  = useState(false);
  const [active, setActive]      = useState('hero');

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 40);
      // Update active section
      const sections = NAV_ITEMS.map((n) => n.href.slice(1));
      for (const id of [...sections].reverse()) {
        const el = document.getElementById(id);
        if (el && window.scrollY >= el.offsetTop - 120) {
          setActive(id);
          break;
        }
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleNav = (href) => {
    setMenuOpen(false);
    const id = href.slice(1);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const title = names?.length >= 2 ? `${names[0]} & ${names[1]}` : 'Juanes & Pau';

  return (
    <>
      <motion.nav
        className="fixed top-0 left-0 right-0 z-40 transition-all duration-500"
        style={
          scrolled
            ? { background: 'rgba(10,10,15,0.85)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.05)' }
            : { background: 'transparent' }
        }
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ delay: 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <button
            onClick={() => handleNav('#hero')}
            className="flex items-center gap-2.5 group"
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-sm transition-all duration-300 group-hover:shadow-glow-wine"
              style={{ background: 'linear-gradient(135deg, #880b3a, #c82360)' }}
            >
              ♥
            </div>
            <span
              className="font-display text-sm font-medium hidden sm:block"
              style={{ color: 'rgba(255,255,255,0.8)' }}
            >
              {title}
            </span>
          </button>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map(({ href, label }) => {
              const id = href.slice(1);
              const isActive = active === id;
              return (
                <button
                  key={href}
                  onClick={() => handleNav(href)}
                  className="relative px-3.5 py-1.5 text-sm rounded-full transition-all duration-200"
                  style={{ color: isActive ? '#fff' : 'rgba(255,255,255,0.55)' }}
                >
                  {isActive && (
                    <motion.span
                      layoutId="nav-pill"
                      className="absolute inset-0 rounded-full"
                      style={{ background: 'rgba(200,35,96,0.15)', border: '1px solid rgba(200,35,96,0.2)' }}
                      transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                    />
                  )}
                  <span className="relative">{label}</span>
                </button>
              );
            })}

            {/* Love Wrapped CTA */}
            {onOpenWrapped && (
              <button
                onClick={onOpenWrapped}
                className="ml-3 px-4 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 text-white transition-all duration-300 shadow-glow-wine hover:scale-105 active:scale-95 border border-rose-500/30"
                style={{ background: 'linear-gradient(135deg, #880b3a, #c82360)' }}
              >
                <Sparkles size={13} className="text-rose-200 animate-spin-slow" />
                <span>✦ Ver Wrapped ✦</span>
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-2">
            {onOpenWrapped && (
              <button
                onClick={onOpenWrapped}
                className="px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 text-white border border-rose-500/30"
                style={{ background: 'linear-gradient(135deg, #880b3a, #c82360)' }}
              >
                <Sparkles size={12} className="text-rose-200" />
                <span>Wrapped</span>
              </button>
            )}
            <button
              className="p-2 rounded-xl transition-colors"
              style={{ color: 'rgba(255,255,255,0.7)' }}
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Menú"
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile drawer */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="fixed inset-0 z-30 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setMenuOpen(false)} />
            <motion.div
              className="absolute right-0 top-0 bottom-0 w-64 flex flex-col pt-20 px-4 gap-2"
              style={{ background: 'rgba(18,18,28,0.97)', borderLeft: '1px solid rgba(255,255,255,0.06)' }}
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
                <button
                  key={href}
                  onClick={() => handleNav(href)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-left transition-all duration-200 hover:bg-white/5"
                  style={{ color: active === href.slice(1) ? '#e05c82' : 'rgba(255,255,255,0.7)' }}
                >
                  <Icon size={16} />
                  {label}
                </button>
              ))}

              {onOpenWrapped && (
                <button
                  onClick={() => { setMenuOpen(false); onOpenWrapped(); }}
                  className="flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl text-sm font-medium text-white transition-all duration-200 mt-3 shadow-glow-wine border border-rose-500/30"
                  style={{ background: 'linear-gradient(135deg, #880b3a, #c82360)' }}
                >
                  <Sparkles size={16} className="text-rose-200" />
                  <span>✦ Ver Love Wrapped ✦</span>
                </button>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
