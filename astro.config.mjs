// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// The same source deploys to two hosts with different URL layouts:
// - Vercel serves the site at the domain root (https://r2d-bice.vercel.app/).
//   Vercel sets VERCEL=1 and VERCEL_PROJECT_PRODUCTION_URL during its builds.
// - GitHub Pages serves it as a project site under a subdirectory
//   (https://maurizio-gif.github.io/Ready-2-Digital-Website/).
// SITE_URL / BASE_PATH override both, e.g. once a custom domain is attached.
const onVercel = Boolean(process.env.VERCEL);

const site =
  process.env.SITE_URL ??
  (onVercel && process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : 'https://maurizio-gif.github.io');

const base = process.env.BASE_PATH ?? (onVercel ? '/' : '/Ready-2-Digital-Website');

// Absolute URL of the root redirect stub (see src/pages/index.astro).
const rootURL = new URL(base.endsWith('/') ? base : `${base}/`, site).href;

// https://astro.build/config
export default defineConfig({
  site,
  base,
  integrations: [
    sitemap({
      // The root is a redirect stub, not a real page — keep it out of the
      // sitemap so crawlers land on /it/.
      filter: (page) => page !== rootURL,
    }),
  ],
});
