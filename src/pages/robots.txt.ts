import type { APIRoute } from 'astro';

// Generated rather than a static file in public/ so the sitemap URL follows
// the host the build targets (Vercel root vs. GitHub Pages subdirectory).
export const GET: APIRoute = ({ site }) => {
  const sitemapURL = new URL(`${import.meta.env.BASE_URL.replace(/\/$/, '')}/sitemap-index.xml`, site);
  return new Response(`User-agent: *\nAllow: /\n\nSitemap: ${sitemapURL.href}\n`, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
