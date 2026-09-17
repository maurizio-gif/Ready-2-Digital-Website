// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  // GitHub Pages project site: https://maurizio-gif.github.io/Ready-2-Digital-Website/
  site: 'https://maurizio-gif.github.io',
  base: '/Ready-2-Digital-Website',
  integrations: [
    sitemap({
      // The root "/" is a redirect stub (see src/pages/index.astro), not a
      // real page — keep it out of the sitemap so crawlers land on /it/.
      filter: (page) => !page.endsWith('/Ready-2-Digital-Website/'),
    }),
  ],
});
