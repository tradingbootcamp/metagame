import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import icon from "astro-icon";

import react from "@astrojs/react";

export default defineConfig({
  site: "https://RickiHeicklen.github.io",
  base: "/",
  integrations: [tailwind(), icon(), react({
    include: ['**/react/*'],
  })],
});
