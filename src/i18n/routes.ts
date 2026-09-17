// Central map of every corporate page to its two locale URLs. This is the
// single source of truth for the language switcher and for hreflang
// alternates — pages never hardcode the other locale's path.
//
// Case study pages are the one exception: their alternate URL depends on
// the content collection entry (matched by `caseId`, not by this table),
// so they resolve it themselves via `getWorkAlternateUrl` in `utils.ts`.

export const locales = ['it', 'en'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'it';

type RouteKey =
  | 'home'
  | 'solutions'
  | 'method'
  | 'work'
  | 'technology'
  | 'about'
  | 'contact'
  | 'privacy'
  | 'cookiePolicy';

export const routes: Record<RouteKey, Record<Locale, string>> = {
  home: { it: '/it/', en: '/en/' },
  solutions: { it: '/it/soluzioni/', en: '/en/solutions/' },
  method: { it: '/it/metodo/', en: '/en/method/' },
  work: { it: '/it/progetti/', en: '/en/work/' },
  technology: { it: '/it/tecnologia/', en: '/en/technology/' },
  about: { it: '/it/chi-siamo/', en: '/en/about/' },
  contact: { it: '/it/contatti/', en: '/en/contact/' },
  privacy: { it: '/it/privacy/', en: '/en/privacy/' },
  cookiePolicy: { it: '/it/cookie-policy/', en: '/en/cookie-policy/' },
};

export function routeFor(key: RouteKey, locale: Locale): string {
  return routes[key][locale];
}

export function otherLocale(locale: Locale): Locale {
  return locale === 'it' ? 'en' : 'it';
}
