// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://systemeviral.com',
  integrations: [],

  build: {
      assets: '_assets',
  },

  server: {
      port: 4321,
      host: true,
  },

  vite: {
    plugins: [tailwindcss()],
  },
});