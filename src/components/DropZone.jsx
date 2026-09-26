import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Upload, FileText, Sparkles, Lock, ArrowRight } from 'lucide-react';

export default function DropZone({ onFileLoad }) {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);

  const handleFile = useCallback((file) => {
    if (!file) return;
    if (!file.name.endsWith('.txt')) {
      setError('Por favor selecciona un archivo .txt exportado de WhatsApp');
      return;
    }
    setError(null);
    setIsLoading(true);
    setProgress(0);

    const reader = new FileReader();
    reader.onprogress = (e) => {
      if (e.lengthComputable) {
        setProgress(Math.round((e.loaded / e.total) * 100));
      }
    };
    reader.onload = (e) => {
      setProgress(100);
      setTimeout(() => {
        onFileLoad(e.target.result);
        setIsLoading(false);
      }, 600);
    };
    reader.onerror = () => {
      setError('Error al leer el archivo. Intenta de nuevo.');
      setIsLoading(false);
    };
    reader.readAsText(file, 'UTF-8');
  }, [onFileLoad]);

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleFile(file);
  }, [handleFile]);

  const onDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => setIsDragging(false);

  const onInputChange = (e) => {
    handleFile(e.target.files[0]);
  };

  // Floating petals data
  const petals = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    emoji: ['🌸', '🌺', '💮', '🏵️', '🌼'][i % 5],
    x: Math.random() * 100,
    delay: Math.random() * 8,
    duration: 6 + Math.random() * 8,
    size: 0.8 + Math.random() * 1.2,
  }));

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden px-4">
      {/* Animated background petals */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {petals.map(p => (
          <motion.div
            key={p.id}
            className="absolute text-2xl select-none"
            style={{ left: `${p.x}%`, bottom: '-60px', fontSize: `${p.size}rem` }}
            animate={{
              y: [0, -window.innerHeight - 100],
              rotate: [0, 360],
              opacity: [0, 0.7, 0.7, 0],
            }}
            transition={{
              duration: p.duration,
              delay: p.delay,
              repeat: Infinity,
              ease: 'linear',
            }}
          >
            {p.emoji}
          </motion.div>
        ))}
      </div>

      {/* Decorative blobs */}
      <div className="fixed top-0 left-0 w-96 h-96 rounded-full bg-blossom-rose/20 blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="fixed bottom-0 right-0 w-96 h-96 rounded-full bg-blossom-peach/25 blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none" />
      <div className="fixed top-1/2 right-0 w-64 h-64 rounded-full bg-blossom-mauve/10 blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-xl"
      >
        {/* Header */}
        <div className="text-center mb-10">
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-blossom-rose to-blossom-wine shadow-blossom-lg mb-6"
          >
            <Heart className="w-10 h-10 text-white" fill="white" />
          </motion.div>

          <h1 className="font-display text-5xl md:text-6xl text-blossom-plum mb-3 leading-tight">
            Love <span className="italic text-gradient-wine">Wrapped</span>
          </h1>
          <p className="font-sans text-blossom-mauve text-lg font-light max-w-sm mx-auto leading-relaxed">
            Transforma tu historia de WhatsApp en una experiencia visual única e íntima
          </p>
        </div>

        {/* Drop Zone */}
        <AnimatePresence mode="wait">
          {!isLoading ? (
            <motion.div
              key="dropzone"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onDrop={onDrop}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onClick={() => inputRef.current?.click()}
              className={`
                relative cursor-pointer rounded-3xl p-10 text-center transition-all duration-300
                border-2 border-dashed
                ${isDragging
                  ? 'border-blossom-wine bg-blossom-rose/20 scale-102 shadow-blossom-lg'
                  : 'border-blossom-rose/50 bg-white/60 backdrop-blur-sm shadow-glass hover:shadow-blossom-lg hover:border-blossom-mauve hover:bg-white/80'
                }
              `}
            >
              <input
                ref={inputRef}
                type="file"
                accept=".txt"
                className="hidden"
                onChange={onInputChange}
              />

              <motion.div
                animate={isDragging ? { scale: 1.2, rotate: 15 } : { scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 300 }}
                className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blossom-blush to-blossom-rose mb-5"
              >
                {isDragging
                  ? <Sparkles className="w-8 h-8 text-blossom-wine" />
                  : <Upload className="w-8 h-8 text-blossom-wine" />
                }
              </motion.div>

              <h2 className="font-display text-2xl text-blossom-burgundy mb-2">
                {isDragging ? '¡Suéltalo aquí! 💕' : 'Sube tu conversación'}
              </h2>
              <p className="font-sans text-blossom-mauve text-sm mb-1">
                Arrastra tu <code className="bg-blossom-blush px-2 py-0.5 rounded-lg text-blossom-wine font-mono text-xs">_chat.txt</code> aquí
              </p>
              <p className="font-sans text-blossom-rose text-xs">o haz clic para seleccionarlo</p>

              <div className="mt-6 flex items-center justify-center gap-2 text-xs text-blossom-mauve/70">
                <FileText className="w-3.5 h-3.5" />
                <span>Exportar de WhatsApp → Más opciones → Exportar chat → Sin archivos</span>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="loading"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="rounded-3xl p-10 text-center bg-white/70 backdrop-blur-sm shadow-glass border border-white/60"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                className="inline-flex items-center justify-center w-16 h-16 rounded-full border-4 border-blossom-rose border-t-blossom-wine mb-5"
              />
              <h2 className="font-display text-2xl text-blossom-burgundy mb-2">
                Leyendo tu historia…
              </h2>
              <p className="font-sans text-blossom-mauve text-sm mb-4">
                Procesando mensajes con amor 💕
              </p>
              <div className="w-full bg-blossom-blush rounded-full h-2 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  className="h-full bg-gradient-to-r from-blossom-rose to-blossom-wine rounded-full"
                  transition={{ duration: 0.3 }}
                />
              </div>
              <p className="font-mono text-xs text-blossom-mauve mt-2">{progress}%</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-4 text-center text-sm text-red-500 bg-red-50/80 backdrop-blur-sm rounded-2xl px-4 py-3"
            >
              ⚠️ {error}
            </motion.p>
          )}
        </AnimatePresence>

        {/* Privacy notice */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 flex items-start gap-3 bg-white/50 backdrop-blur-sm rounded-2xl px-5 py-4 border border-white/60"
        >
          <Lock className="w-5 h-5 text-blossom-sage mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-sans text-xs text-blossom-mauve font-medium mb-0.5">100% Privado</p>
            <p className="font-sans text-xs text-blossom-mauve/70 leading-relaxed">
              Tu conversación nunca sale de tu navegador. Todo el procesamiento es local — ningún dato se envía a ningún servidor.
            </p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
