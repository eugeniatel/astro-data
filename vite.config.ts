// vite.config.ts
import { defineConfig } from 'vite';

export default defineConfig({
  base: '/astro-data/',
  optimizeDeps: {
    exclude: ['swisseph-wasm'],
  },
  server: {
    fs: {
      allow: ['..'],
    },
  },
  assetsInclude: ['**/*.data'],
});
