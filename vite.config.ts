import { resolve } from 'path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  resolve: {
    alias: [{ find: '@', replacement: resolve(__dirname, './src') }],
  },
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
  base: '/collage-poem/',
});
