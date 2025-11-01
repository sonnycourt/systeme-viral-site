// @ts-check
import { defineConfig } from 'astro/config';
import compress from 'astro-compress';

// https://astro.build/config
export default defineConfig({
  site: 'https://systemeviral.com',
  integrations: [
    // Compression automatique (gzip/brotli)
    compress({
      css: true,
      html: true,
      js: true,
      img: true,
      svg: true,
    })
  ],

  build: {
    assets: '_assets',
  },

  // Optimisations de performance
  vite: {
    build: {
      // Minification agressive
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true,
        },
      },
    },
    server: {
      headers: {
        'Content-Security-Policy':
          "default-src * 'unsafe-inline' 'unsafe-eval' data: blob: https://connect.facebook.net https://www.facebook.com;",
      },
    },
  },

  server: {
    port: 5500,
    host: true,
  },
});