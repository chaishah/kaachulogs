import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // Use relative paths so app works on GitHub Pages subpaths
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
});
