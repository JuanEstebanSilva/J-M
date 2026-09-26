import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  assetsInclude: ['**/*.txt'],
  server: {
    watch: {
      ignored: ['**/node_modules/**', '**/.git/**'],
    },
  },
  build: {
    chunkSizeWarningLimit: 2000,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor:   ['react', 'react-dom'],
          motion:   ['framer-motion'],
          charts:   ['recharts'],
          icons:    ['lucide-react'],
        },
      },
    },
  },

});
