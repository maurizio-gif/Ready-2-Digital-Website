// Where the site lives, for everything that has to be an absolute address:
// canonical links, hreflang, Open Graph, the sitemap and structured data.
//
// The site is a static build that can be served from several places (the
// production domain, Vercel previews, GitHub Pages). All of them declare the
// production domain as canonical, so a preview never competes with the real
// site in search results. Override with VITE_SITE_URL only for a real move.

export const SITE_URL = ((import.meta.env.VITE_SITE_URL as string | undefined) || 'https://www.ready2digital.it').replace(/\/+$/, '');

/** Social preview images, 1200×630, in public/images/og/. */
export const OG = {
  default: '/images/og/ready2digital.jpg',
  agenti: '/images/og/agenti-ai.jpg',
};

export const abs = (path: string) => `${SITE_URL}${path === '/' ? '/' : path}`;
