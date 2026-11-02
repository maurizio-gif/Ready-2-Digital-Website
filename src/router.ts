import { useEffect, useState } from 'react';
import type { Lang } from './content';

// Pages and their addresses in each language. Italian lives at the root,
// English under /en with English slugs. Paths are relative to Vite's BASE_URL,
// so the same build works at the domain root (Vercel) and under
// /Ready-2-Digital-Website/ (GitHub Pages).

export type Page = 'home' | 'soluzioni' | 'progetti' | 'metodo' | 'tecnologia' | 'chisiamo' | 'contatti' | 'caso';

export const PATHS: Record<Exclude<Page, 'caso'>, Record<Lang, string>> = {
  home: { it: '/', en: '/en' },
  soluzioni: { it: '/soluzioni', en: '/en/solutions' },
  progetti: { it: '/progetti', en: '/en/work' },
  metodo: { it: '/metodo', en: '/en/method' },
  tecnologia: { it: '/tecnologia', en: '/en/technology' },
  chisiamo: { it: '/chi-siamo', en: '/en/about' },
  contatti: { it: '/contatti', en: '/en/contact' },
};

export type Route = { page: Page; lang: Lang; slug?: string };

const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');

export function pathFor(page: Page, lang: Lang, slug?: string) {
  if (page === 'caso') return `${PATHS.progetti[lang]}/${slug}`;
  return PATHS[page][lang];
}

export const href = (path: string) => `${BASE}${path === '/' ? '/' : path}`;

export function parse(pathname: string): Route {
  let rel = pathname.startsWith(BASE) ? pathname.slice(BASE.length) : pathname;
  rel = rel.replace(/\/+$/, '') || '/';
  for (const lang of ['it', 'en'] as Lang[]) {
    for (const page of Object.keys(PATHS) as (keyof typeof PATHS)[]) {
      if (PATHS[page][lang] === rel) return { page, lang };
    }
    const m = rel.match(new RegExp(`^${PATHS.progetti[lang]}/([a-z0-9-]+)$`));
    if (m) return { page: 'caso', lang, slug: m[1] };
  }
  return { page: 'home', lang: rel.startsWith('/en') ? 'en' : 'it' };
}

/** Addresses from earlier versions of the site, rewritten in place. */
function legacy(): string | null {
  const { pathname, search, hash } = window.location;
  const rel = pathname.startsWith(BASE) ? pathname.slice(BASE.length) : pathname;
  const en = new URLSearchParams(search).get('lang') === 'en';
  const lang: Lang = en ? 'en' : 'it';
  const c = rel.match(/^\/casi\/([a-z0-9-]+)\/?$/);
  if (c) return href(pathFor('caso', lang, c[1])) + hash;
  if (en && !rel.startsWith('/en')) {
    const r = parse(pathname);
    return href(pathFor(r.page, 'en', r.slug)) + hash;
  }
  if (search.includes('lang=')) return href(rel) + hash;
  return null;
}

const listeners = new Set<() => void>();
let beforeNavigate: ((go: () => void) => void) | null = null;

/** Lets the app run a page transition around every navigation. */
export function setNavigateHook(fn: ((go: () => void) => void) | null) {
  beforeNavigate = fn;
}

export function navigate(path: string) {
  const go = () => {
    const url = href(path);
    if (url !== window.location.pathname + window.location.hash) window.history.pushState({}, '', url);
    listeners.forEach((l) => l());
  };
  const target = parse(path.split('#')[0]);
  const here = parse(window.location.pathname);
  const samePage = target.page === here.page && target.lang === here.lang && target.slug === here.slug;
  if (beforeNavigate && !samePage) beforeNavigate(go);
  else go();
}

export function useRoute(): Route {
  const [route, setRoute] = useState<Route>(() => {
    const fix = legacy();
    if (fix) window.history.replaceState({}, '', fix);
    return parse(window.location.pathname);
  });
  useEffect(() => {
    const update = () => setRoute(parse(window.location.pathname));
    listeners.add(update);
    window.addEventListener('popstate', update);
    return () => {
      listeners.delete(update);
      window.removeEventListener('popstate', update);
    };
  }, []);
  return route;
}
