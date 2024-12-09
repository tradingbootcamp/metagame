import { defineConfig } from 'vite';
import astro from '@astrojs/astro';

export default defineConfig({
  optimizeDeps: {
    exclude: ['@resvg/resvg-js']
  },
  build: {
    commonjsOptions: {
      ignore: ['@resvg/resvg-js']
    }
  }
}); 