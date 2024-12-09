import { defineConfig } from 'vite';

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