import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";

import react from "@astrojs/react";

export default defineConfig({
  site: "https://metagames.games",
  integrations: [
    tailwind(), 
    react({
      include: ['**/react/*'],
    })
  ],
  vite: {
    ssr: {
      noExternal: ['astro-opengraph-images', '@resvg/resvg-js']
    }
  }
});
