import { useEffect, useState } from 'react';

// A tiny router: the home page and one page per case study (/casi/<slug>).
// Paths are relative to Vite's BASE_URL so the same build works at the domain
// root (Vercel) and under /Ready-2-Digital-Website/ (GitHub Pages).

const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');

export type Route = { page: 'home' } | { page: 'case'; slug: string };

export function parse(pathname: string): Route {
  const rel = pathname.startsWith(BASE) ? pathname.slice(BASE.length) : pathname;
  const m = rel.match(/^\/casi\/([a-z0-9-]+)\/?$/);
  if (m) return { page: 'case', slug: m[1] };
  return { page: 'home' };
}

export const href = (path: string) => `${BASE}${path}`;

const listeners = new Set<() => void>();

export function navigate(path: string) {
  const url = href(path) + window.location.search;
  if (url !== window.location.pathname + window.location.search) window.history.pushState({}, '', url);
  listeners.forEach((l) => l());
}

export function useRoute(): Route {
  const [route, setRoute] = useState(() => parse(window.location.pathname));
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
