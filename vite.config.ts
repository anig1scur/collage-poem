import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          fabric: ['fabric'],
        },
      },
    },
  },

plugins: [react()],
});
