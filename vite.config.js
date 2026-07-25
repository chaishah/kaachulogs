import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // GitHub Pages path resolution: /kaachulogs/
  base: process.env.NODE_ENV === 'production' ? '/kaachulogs/' : '/',
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
});
