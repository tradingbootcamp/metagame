import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import icon from "astro-icon";

import react from "@astrojs/react";

export default defineConfig({
  site: "https://metagames.games",
  integrations: [tailwind(), icon(), react({
    include: ['**/react/*'],
  })],
});
