// vite.config.ts
import { defineConfig } from 'vite';
import { copyFileSync, mkdirSync, existsSync } from 'fs';
import { resolve } from 'path';

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
  plugins: [
    {
      name: 'copy-swisseph-data',
      closeBundle() {
        // The swisseph-wasm browser loader uses: new URL('../wasm/' + path, import.meta.url)
        // After bundling, import.meta.url points to /assets/index-XXX.js
        // So it resolves to /wasm/swisseph.data and /wasm/swisseph.wasm
        const wasmDir = resolve(__dirname, 'dist/wasm');
        if (!existsSync(wasmDir)) mkdirSync(wasmDir, { recursive: true });

        const dataFile = resolve(__dirname, 'node_modules/swisseph-wasm/wasm/swisseph.data');
        const wasmFile = resolve(__dirname, 'node_modules/swisseph-wasm/wasm/swisseph.wasm');

        if (existsSync(dataFile)) {
          copyFileSync(dataFile, resolve(wasmDir, 'swisseph.data'));
          console.log('Copied swisseph.data to dist/wasm/');
        }
        if (existsSync(wasmFile)) {
          copyFileSync(wasmFile, resolve(wasmDir, 'swisseph.wasm'));
          console.log('Copied swisseph.wasm to dist/wasm/');
        }
      },
    },
  ],
});
