import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import react from "@astrojs/react";
import vercel from "@astrojs/vercel";

export default defineConfig({
  site: "https://metagames.games",
  output: "server",
  adapter: vercel({}),
  integrations: [
    tailwind(), 
    react({
      include: ['**/*.tsx', '**/react/*'],
    })
  ],
  vite: {
    ssr: {
      noExternal: ['astro-opengraph-images', '@resvg/resvg-js']
    },
    envPrefix: ['PUBLIC_', 'ROLLUP_SKIP_NATIVE'],
  }
});
