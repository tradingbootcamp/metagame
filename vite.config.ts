import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
  optimizeDeps: {
    exclude: ["@resvg/resvg-js"],
  },
  build: {
    commonjsOptions: {
      ignore: ["@resvg/resvg-js"],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
