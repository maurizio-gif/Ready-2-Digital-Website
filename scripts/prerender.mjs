// Turns the single-page build into one real HTML file per address.
//
// Why: the app is client-rendered, so `dist/index.html` was an empty shell with
// the home page's title, served for every URL. Search engines that don't run
// JavaScript — and the crawlers behind AI assistants, which mostly don't — saw
// no content and one title for the whole site. This script renders the actual
// app, page by page, with the page's own head (src/seo.ts), and writes:
//
//   dist/index.html, dist/soluzioni/index.html, dist/en/ai-agents/index.html, …
//   dist/404.html        the shell, noindex (also GitHub Pages' fallback)
//   dist/sitemap.xml     every address, with its language alternates
//   dist/robots.txt, dist/llms.txt, dist/llms-full.txt
//
// The browser then starts the app over the rendered HTML, as before.
//
// Run by `npm run build`, after `vite build` (client) and
// `vite build --ssr src/entry-server.tsx --outDir dist-ssr`. It fails the build on
// any problem: shipping empty pages silently is worse than not shipping.

import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const root = resolve(import.meta.dirname, '..');
const dist = join(root, 'dist');
const ssr = join(root, 'dist-ssr');

const template = readFileSync(join(dist, 'index.html'), 'utf8');
const SEO = /<!--seo:start-->[\s\S]*?<!--seo:end-->/;
const ROOT = '<div id="root"></div>';
if (!SEO.test(template)) throw new Error('prerender: the seo markers are missing from dist/index.html');
if (!template.includes(ROOT)) throw new Error('prerender: <div id="root"></div> is missing from dist/index.html');

const mod = await import(pathToFileURL(join(ssr, 'entry-server.js')).href);

const page = ({ lang, head, body }) =>
  template
    .replace(/<html lang="[^"]*"/, `<html lang="${lang}"`)
    .replace(SEO, () => `${head}`)
    .replace(ROOT, () => `<div id="root">${body}</div>`);

const write = (file, content) => {
  const target = join(dist, file);
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, content);
};

// The 404 page first: it needs the untouched shell, and `/` overwrites index.html.
write('404.html', template.replace(SEO, () => mod.notFoundHead()));

const rendered = mod.prerenderAll();
for (const p of rendered) {
  if (!p.body.includes('<h1')) throw new Error(`prerender: ${p.path} rendered without an <h1>`);
  write(p.path === '/' ? 'index.html' : `${p.path.replace(/^\//, '')}/index.html`, page(p));
}

for (const [name, content] of Object.entries(mod.files())) write(name, content);

rmSync(ssr, { recursive: true, force: true });
console.log(`prerender: ${rendered.length} pages, sitemap.xml, robots.txt, llms.txt, llms-full.txt`);
