import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import react from "@astrojs/react";
import vercel from "@astrojs/vercel/serverless";

export default defineConfig({
  site: "https://metagames.games",
  output: "server",
  adapter: vercel(),
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
    define: {
      'process.env.AIRTABLE_PAT': JSON.stringify(process.env.AIRTABLE_PAT),
      'process.env.AIRTABLE_BASE_ID': JSON.stringify(process.env.AIRTABLE_BASE_ID),
      'process.env.AIRTABLE_TABLE_NAME': JSON.stringify(process.env.AIRTABLE_TABLE_NAME),
      'process.env.STRIPE_SECRET_KEY': JSON.stringify(process.env.STRIPE_SECRET_KEY),
      'process.env.PUBLIC_STRIPE_PUBLISHABLE_KEY': JSON.stringify(process.env.PUBLIC_STRIPE_PUBLISHABLE_KEY),
    }
  }
});
