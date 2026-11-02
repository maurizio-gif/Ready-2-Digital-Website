// Server entry, used only at build time by scripts/prerender.mjs: it renders
// the real app to HTML for every address, so that crawlers (and people on a
// slow connection) get the page's content without running any JavaScript.
// The script only writes files; what goes in them is decided here.

import { renderToString } from 'react-dom/server';
import App from './App';
import { allRoutes, headTags, llmsTxt, robotsTxt, seoFor, shellSeo, sitemapXml } from './seo';
import { pathFor } from './router';

function render(path: string): string {
  return renderToString(<App ssrPath={path} />);
}

/** One entry per address of the site: its path, language, head tags and body. */
export function prerenderAll() {
  return allRoutes().map((route) => {
    const path = pathFor(route.page, route.lang, route.slug);
    return { path, lang: route.lang, head: headTags(seoFor(route)), body: render(path) };
  });
}

/** The head of the 404 page: the shell with nothing to say, and not to be indexed. */
export const notFoundHead = () => headTags(shellSeo());

export const files = () => ({ 'sitemap.xml': sitemapXml(), 'robots.txt': robotsTxt(), 'llms.txt': llmsTxt() });
