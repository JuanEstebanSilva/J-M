import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    watch: {
      // Ignore .txt files and the src/data directory so Vite doesn't
      // try to watch the large _chat.txt export file (causes EBUSY on Windows)
      ignored: ['**/*.txt', '**/src/data/**'],
    },
  },
  build: {
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
          'vendor-motion': ['framer-motion'],
          'vendor-charts': ['recharts'],
          'vendor-ui': ['lucide-react', 'canvas-confetti'],
        },
      },
    },
  },
})
