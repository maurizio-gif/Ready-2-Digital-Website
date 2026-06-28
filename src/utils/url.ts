// Prefix root-absolute internal paths with Astro's configured base path
// so links and assets work when the site is served from a subdirectory
// (e.g. GitHub Pages project site /Ready-2-Digital-Website/).
// Anchors (#...), external URLs, and mailto: are returned unchanged.
const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');

export function withBase(path: string): string {
  if (!path.startsWith('/')) return path;
  return `${BASE}${path}`;
}
