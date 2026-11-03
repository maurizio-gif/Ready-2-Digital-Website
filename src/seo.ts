// Everything a search engine, a social network or an AI assistant reads about a
// page before (or without) running the app: title, description, canonical,
// language alternates, Open Graph, structured data — plus the sitemap, robots.txt
// and llms.txt that tell crawlers what exists.
//
// One module, two users: the prerender (scripts/prerender.mjs) writes these into
// each page's HTML at build time, and the app (App.tsx) re-applies them when the
// reader moves between pages without a reload. Plain data in, plain strings out:
// nothing here touches the DOM except `applyHead`, which only runs in the browser.

import { copy, type Lang } from './content';
import { pages, SERVICE_IDS } from './pages';
import { cases } from './cases';
import { agents } from './agents';
import { COMPANY, SOCIAL, privacyText } from './legal';
import { PATHS, pathFor, type Page, type Route } from './router';
import { OG, SITE_URL, abs } from './site';

const LANGS: Lang[] = ['it', 'en'];
const LOCALE: Record<Lang, string> = { it: 'it_IT', en: 'en_US' };
const IN_LANGUAGE: Record<Lang, string> = { it: 'it-IT', en: 'en' };

const ID = {
  org: `${SITE_URL}/#organization`,
  site: `${SITE_URL}/#website`,
  founder: `${SITE_URL}/#founder`,
};

/* ------------------------------------------------------------------ */
/* Titles and descriptions                                             */
/* ------------------------------------------------------------------ */

// Written by hand, not derived from the page headers: a header is designed to be
// read on the page ("Prima il processo. Poi il codice."), a title and a snippet
// are read in a list of ten results next to the competition, and have to say what
// the page is about and for whom. Titles stay near 60 characters, descriptions
// under 160, so search engines show them whole.
type Meta = { title: string; description: string };

const META: Record<Lang, Record<Exclude<Page, 'caso' | 'privacy'>, Meta>> = {
  it: {
    home: { title: copy.it.meta.title, description: copy.it.meta.description },
    soluzioni: {
      title: 'Automazioni, AI, CRM, ERP e app su misura | Ready2Digital',
      description: 'Dieci soluzioni che sappiamo costruire: siti, app iOS e Android, CRM, ERP, dashboard, automazione dei processi, integrazioni API, totem e agenti AI. Una alla volta o tutte insieme.',
    },
    agenti: {
      title: 'Agenti AI per aziende: vendita, assistenza, dati | Ready2Digital',
      description: 'Agenti AI su misura per vendita, assistenza, analisi dati e CRM: leggono i tuoi dati, agiscono sui tuoi strumenti e passano la mano a una persona quando serve.',
    },
    progetti: {
      title: 'Progetti: CRM, app, automazioni e AI in produzione | Ready2Digital',
      description: 'Casi reali di sistemi digitali usati ogni giorno: Athlon Club, Tennis Club Ambrosiano, Ronchiverdi, Passion Fitness. CRM, app, automazioni e agenti AI, con schermate e tecnica.',
    },
    metodo: {
      title: 'Metodo: prima il processo, poi il codice | Ready2Digital',
      description: 'Come lavoriamo: ascolto e audit, processo, database, UX e UI, sviluppo e adozione. Sei passi per automazioni e software che le persone usano davvero.',
    },
    tecnologia: {
      title: 'Tecnologia: stack, integrazioni e AI spiegati semplice | Ready2Digital',
      description: 'Supabase, Next.js, Astro, Expo, n8n e modelli di intelligenza artificiale: cosa usiamo, perché, e come lo colleghiamo ai sistemi che hai già. Senza gergo.',
    },
    chisiamo: {
      title: 'Chi siamo: Maurizio Taruggi e Ready2Digital',
      description: 'Ready 2 Digital nasce dall’esperienza di chi dirige un club ogni giorno dal 2010. Strategia digitale, software su misura, automazioni e AI per aziende e centri sportivi.',
    },
    contatti: {
      title: 'Contatti: raccontaci il tuo processo | Ready2Digital',
      description: 'Scrivici il processo che oggi ti fa perdere tempo: ti diciamo, senza giri di parole, se e come possiamo semplificarlo con automazioni, software o agenti AI.',
    },
  },
  en: {
    home: { title: copy.en.meta.title, description: copy.en.meta.description },
    soluzioni: {
      title: 'Automation, AI, CRM, ERP and custom apps | Ready2Digital',
      description: 'Ten solutions we know how to build: websites, iOS and Android apps, CRM, ERP, dashboards, process automation, API integrations, kiosks and AI agents. One at a time or all together.',
    },
    agenti: {
      title: 'AI agents for business: sales, support, data | Ready2Digital',
      description: 'Custom AI agents for sales, customer support, data analysis and CRM: they read your data, act in your tools and hand over to a person when needed.',
    },
    progetti: {
      title: 'Work: CRM, apps, automation and AI in production | Ready2Digital',
      description: 'Real digital systems used every day: Athlon Club, Tennis Club Ambrosiano, Ronchiverdi, Passion Fitness. CRM, apps, automation and AI agents, with screens and technology.',
    },
    metodo: {
      title: 'Method: process first, code second | Ready2Digital',
      description: 'How we work: listening and audit, process, database, UX and UI, build and adoption. Six steps to automation and software people actually use.',
    },
    tecnologia: {
      title: 'Technology: stack, integrations and AI, explained | Ready2Digital',
      description: 'Supabase, Next.js, Astro, Expo, n8n and AI models: what we use, why, and how we connect it to the systems you already have. No jargon.',
    },
    chisiamo: {
      title: 'About: Maurizio Taruggi and Ready2Digital',
      description: 'Ready 2 Digital grows out of the experience of someone who has run a club every day since 2010. Digital strategy, custom software, automation and AI for businesses and sports centres.',
    },
    contatti: {
      title: 'Contact: tell us about your process | Ready2Digital',
      description: 'Tell us about the process that wastes your time today: we’ll tell you, straight, whether and how we can simplify it with automation, software or AI agents.',
    },
  },
};

/* ------------------------------------------------------------------ */
/* Routes                                                              */
/* ------------------------------------------------------------------ */

/** Every address of the site, in both languages: one entry per page of the sitemap. */
export function allRoutes(): Route[] {
  const out: Route[] = [];
  for (const lang of LANGS) {
    for (const page of Object.keys(PATHS) as (keyof typeof PATHS)[]) out.push({ page, lang });
    for (const c of cases[lang]) out.push({ page: 'caso', lang, slug: c.slug });
  }
  return out;
}

/** The same page in the other language (cases keep the same slug in both). */
function alternatesOf(route: Route): { hreflang: string; href: string }[] {
  const list = LANGS.map((lang) => ({ hreflang: lang, href: abs(pathFor(route.page, lang, route.slug)) }));
  return [...list, { hreflang: 'x-default', href: abs(pathFor(route.page, 'it', route.slug)) }];
}

/* ------------------------------------------------------------------ */
/* Structured data (schema.org, JSON-LD)                               */
/* ------------------------------------------------------------------ */

const KNOWS_ABOUT = [
  'Automazione dei processi aziendali',
  'Intelligenza artificiale',
  'Agenti AI',
  'Assistenti virtuali',
  'CRM',
  'ERP',
  'App iOS',
  'App Android',
  'Integrazioni API',
  'SQL Server',
  'GDPR',
  'Totem e kiosk',
  'E-commerce',
];

function organization(lang: Lang) {
  return {
    '@type': 'Organization',
    '@id': ID.org,
    name: 'Ready2Digital',
    legalName: COMPANY.name,
    url: abs('/'),
    logo: { '@type': 'ImageObject', url: abs('/images/logo_ready2digital.png'), width: 993, height: 192 },
    image: abs(OG.default),
    sameAs: [SOCIAL.company],
    vatID: `IT${COMPANY.vat}`,
    foundingDate: '2022',
    description:
      lang === 'it'
        ? 'Agenzia digitale: automazione dei processi, agenti di intelligenza artificiale, CRM, ERP, app, siti e integrazioni su misura.'
        : 'Digital agency: process automation, AI agents, CRM, ERP, apps, websites and custom integrations.',
    address: { '@type': 'PostalAddress', streetAddress: COMPANY.street, postalCode: COMPANY.zip, addressLocality: COMPANY.city, addressRegion: COMPANY.province, addressCountry: 'IT' },
    founder: { '@id': ID.founder },
    areaServed: { '@type': 'Country', name: 'Italia' },
    knowsAbout: KNOWS_ABOUT,
  };
}

function founder(lang: Lang) {
  const a = pages[lang].about;
  return {
    '@type': 'Person',
    '@id': ID.founder,
    name: a.name,
    jobTitle: a.role,
    image: abs('/images/maurizio-taruggi.jpg'),
    sameAs: [SOCIAL.founder],
    worksFor: { '@id': ID.org },
  };
}

function website() {
  return { '@type': 'WebSite', '@id': ID.site, url: abs('/'), name: 'Ready2Digital', publisher: { '@id': ID.org }, inLanguage: LANGS.map((l) => IN_LANGUAGE[l]) };
}

function breadcrumb(route: Route, title: string) {
  const home = pages[route.lang].nextLabels.home;
  const items: { name: string; url: string }[] = [{ name: home, url: abs(pathFor('home', route.lang)) }];
  if (route.page === 'caso') items.push({ name: pages[route.lang].nextLabels.progetti, url: abs(pathFor('progetti', route.lang)) });
  if (route.page !== 'home') items.push({ name: title, url: abs(pathFor(route.page, route.lang, route.slug)) });
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, item: it.url })),
  };
}

/** The ten services as one catalogue: what search engines read as "what do they sell". */
function servicesCatalog(lang: Lang) {
  const t = copy[lang];
  return {
    '@type': 'Service',
    '@id': `${abs(pathFor('soluzioni', lang))}#services`,
    name: lang === 'it' ? 'Soluzioni digitali su misura' : 'Custom digital solutions',
    serviceType: lang === 'it' ? 'Sviluppo software, automazione dei processi e intelligenza artificiale' : 'Software development, process automation and artificial intelligence',
    provider: { '@id': ID.org },
    areaServed: { '@type': 'Country', name: 'Italia' },
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: t.services.title,
      itemListElement: t.services.items.map((s, i) => ({
        '@type': 'Offer',
        itemOffered: { '@type': 'Service', '@id': `${abs(pathFor('soluzioni', lang))}#${SERVICE_IDS[i]}`, name: s.t, description: s.d },
      })),
    },
  };
}

/** The AI agents service, one offer per family, and the FAQ as FAQPage. */
function agentsGraph(lang: Lang) {
  const a = agents[lang];
  const url = abs(pathFor('agenti', lang));
  return [
    {
      '@type': 'Service',
      '@id': `${url}#service`,
      name: lang === 'it' ? 'Agenti AI su misura' : 'Custom AI agents',
      serviceType: lang === 'it' ? 'Sviluppo di agenti di intelligenza artificiale e automazione dei processi' : 'AI agent development and process automation',
      description: META[lang].agenti.description,
      provider: { '@id': ID.org },
      areaServed: { '@type': 'Country', name: 'Italia' },
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: a.families.title,
        itemListElement: a.families.items.map((f) => ({
          '@type': 'Offer',
          itemOffered: { '@type': 'Service', '@id': `${url}#${f.id}`, name: f.t, description: f.promise },
        })),
      },
    },
    {
      '@type': 'FAQPage',
      '@id': `${url}#faq`,
      inLanguage: IN_LANGUAGE[lang],
      mainEntity: a.faq.items.map((q) => ({ '@type': 'Question', name: q.q, acceptedAnswer: { '@type': 'Answer', text: q.a } })),
    },
  ];
}

/* ------------------------------------------------------------------ */
/* The head of a page                                                  */
/* ------------------------------------------------------------------ */

export type Seo = {
  lang: Lang;
  title: string;
  description: string;
  url: string;
  image: string;
  imageAlt: string;
  alternates: { hreflang: string; href: string }[];
  noindex: boolean;
  jsonld: object;
};

/**
 * Search results cut a description at about 160 characters. Longer texts (the case
 * introductions are reused as descriptions) end at the last whole sentence that
 * fits, or at a word with an ellipsis, rather than wherever the engine decides.
 */
function snippet(text: string, max = 158): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const stop = Math.max(cut.lastIndexOf('. '), cut.lastIndexOf('? '), cut.lastIndexOf('! '));
  if (stop > 70) return cut.slice(0, stop + 1);
  return `${cut.slice(0, cut.lastIndexOf(' ')).replace(/[,;:—-]$/, '')}…`;
}

export function seoFor(route: Route): Seo {
  const { lang } = route;
  let meta: Meta;
  let image = OG.default;
  let webPageType = 'WebPage';
  const extra: object[] = [];

  if (route.page === 'caso') {
    const c = cases[lang].find((x) => x.slug === route.slug);
    meta = c
      ? { title: `${c.client} — ${lang === 'it' ? 'Progetto' : 'Case study'} | Ready2Digital`, description: c.intro }
      : META[lang].progetti;
  } else if (route.page === 'privacy') {
    const pv = privacyText(lang);
    meta = { title: `${pv.title} | Ready2Digital`, description: pv.intro };
  } else {
    meta = META[lang][route.page];
  }

  if (route.page === 'agenti') {
    image = OG.agenti;
    extra.push(...agentsGraph(lang));
  }
  if (route.page === 'soluzioni') extra.push(servicesCatalog(lang));
  if (route.page === 'chisiamo') webPageType = 'AboutPage';
  if (route.page === 'contatti') webPageType = 'ContactPage';
  if (route.page === 'progetti') webPageType = 'CollectionPage';

  const url = abs(pathFor(route.page, lang, route.slug));
  // The short name of the section for the breadcrumb ("Soluzioni"), not the long SEO title.
  const crumbTitle =
    route.page === 'caso' ? (cases[lang].find((x) => x.slug === route.slug)?.client ?? meta.title) : route.page === 'privacy' ? privacyText(lang).title : (pages[lang].heroes[route.page]?.kicker ?? meta.title);

  const webPage = {
    '@type': webPageType,
    '@id': `${url}#webpage`,
    url,
    name: meta.title,
    description: snippet(meta.description),
    inLanguage: IN_LANGUAGE[lang],
    isPartOf: { '@id': ID.site },
    about: { '@id': ID.org },
    primaryImageOfPage: { '@type': 'ImageObject', url: abs(image) },
    breadcrumb: breadcrumb(route, crumbTitle),
    ...(route.page === 'chisiamo' ? { mainEntity: { '@id': ID.founder } } : {}),
  };

  return {
    lang,
    title: meta.title,
    description: snippet(meta.description),
    url,
    image: abs(image),
    imageAlt: lang === 'it' ? 'Ready2Digital — automazioni, agenti AI e software su misura' : 'Ready2Digital — automation, AI agents and custom software',
    alternates: alternatesOf(route),
    noindex: false,
    jsonld: { '@context': 'https://schema.org', '@graph': [organization(lang), founder(lang), website(), webPage, ...extra] },
  };
}

/**
 * The head of a page that doesn't exist (the 404): not to be indexed, and with no
 * canonical or alternates, since there is no page for them to point at.
 */
export function shellSeo(): Seo {
  const s = seoFor({ page: 'home', lang: 'it' });
  return { ...s, alternates: [], noindex: true };
}

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
// A "</script>" inside the data would end the tag early; "<" is legal JSON when escaped.
const json = (o: object) => JSON.stringify(o).replace(/</g, '\\u003c');

/** The head tags for the prerendered HTML of a page. */
export function headTags(seo: Seo): string {
  const lines = [
    `<title>${esc(seo.title)}</title>`,
    `<meta name="description" content="${esc(seo.description)}" />`,
    seo.noindex ? '<meta name="robots" content="noindex, follow" />' : '<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />',
    ...(seo.noindex ? [] : [`<link rel="canonical" href="${esc(seo.url)}" />`]),
    ...seo.alternates.map((a) => `<link rel="alternate" hreflang="${a.hreflang}" href="${esc(a.href)}" />`),
    '<meta property="og:type" content="website" />',
    '<meta property="og:site_name" content="Ready2Digital" />',
    `<meta property="og:locale" content="${LOCALE[seo.lang]}" />`,
    ...LANGS.filter((l) => l !== seo.lang).map((l) => `<meta property="og:locale:alternate" content="${LOCALE[l]}" />`),
    `<meta property="og:title" content="${esc(seo.title)}" />`,
    `<meta property="og:description" content="${esc(seo.description)}" />`,
    `<meta property="og:url" content="${esc(seo.url)}" />`,
    `<meta property="og:image" content="${esc(seo.image)}" />`,
    '<meta property="og:image:width" content="1200" />',
    '<meta property="og:image:height" content="630" />',
    `<meta property="og:image:alt" content="${esc(seo.imageAlt)}" />`,
    '<meta name="twitter:card" content="summary_large_image" />',
    `<meta name="twitter:title" content="${esc(seo.title)}" />`,
    `<meta name="twitter:description" content="${esc(seo.description)}" />`,
    `<meta name="twitter:image" content="${esc(seo.image)}" />`,
    `<script type="application/ld+json">${json(seo.jsonld)}</script>`,
  ];
  return lines.join('\n    ');
}

/** Browser only: the same tags, applied to the page already on screen when the reader navigates. */
export function applyHead(seo: Seo) {
  const head = document.head;
  document.title = seo.title;
  document.documentElement.lang = seo.lang;
  const meta = (attr: 'name' | 'property', key: string, content: string) => {
    let el = head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute(attr, key);
      head.appendChild(el);
    }
    el.setAttribute('content', content);
  };
  meta('name', 'description', seo.description);
  meta('name', 'robots', seo.noindex ? 'noindex, follow' : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');
  meta('property', 'og:locale', LOCALE[seo.lang]);
  meta('property', 'og:title', seo.title);
  meta('property', 'og:description', seo.description);
  meta('property', 'og:url', seo.url);
  meta('property', 'og:image', seo.image);
  meta('property', 'og:image:alt', seo.imageAlt);
  meta('name', 'twitter:title', seo.title);
  meta('name', 'twitter:description', seo.description);
  meta('name', 'twitter:image', seo.image);

  let canon = head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (seo.noindex) canon?.remove();
  else {
    if (!canon) {
      canon = document.createElement('link');
      canon.rel = 'canonical';
      head.appendChild(canon);
    }
    canon.href = seo.url;
  }

  head.querySelectorAll('link[rel="alternate"][hreflang]').forEach((n) => n.remove());
  for (const a of seo.alternates) {
    const l = document.createElement('link');
    l.rel = 'alternate';
    l.hreflang = a.hreflang;
    l.href = a.href;
    head.appendChild(l);
  }

  let ld = head.querySelector<HTMLScriptElement>('script[type="application/ld+json"]');
  if (!ld) {
    ld = document.createElement('script');
    ld.type = 'application/ld+json';
    head.appendChild(ld);
  }
  ld.textContent = json(seo.jsonld);
}

/* ------------------------------------------------------------------ */
/* sitemap.xml, robots.txt, llms.txt                                   */
/* ------------------------------------------------------------------ */

export function sitemapXml(): string {
  const url = (route: Route) => {
    const alts = alternatesOf(route)
      .map((a) => `    <xhtml:link rel="alternate" hreflang="${a.hreflang}" href="${esc(a.href)}" />`)
      .join('\n');
    return `  <url>\n    <loc>${esc(abs(pathFor(route.page, route.lang, route.slug)))}</loc>\n${alts}\n  </url>`;
  };
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${allRoutes().map(url).join('\n')}\n</urlset>\n`;
}

export function robotsTxt(): string {
  // Everything is public and meant to be found, by search engines and by AI
  // assistants alike: no rule to write, only the way to the sitemap.
  return `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`;
}

/** llms.txt: a plain map of the site for AI assistants (llmstxt.org). */
export function llmsTxt(): string {
  const line = (page: Page, desc: string) => `- [${pages.it.heroes[page].kicker}](${abs(pathFor(page, 'it'))}): ${desc}`;
  return [
    '# Ready2Digital',
    '',
    '> Ready 2 Digital S.r.l. è un’agenzia digitale di Roma. Progetta e costruisce automazioni dei processi, agenti di intelligenza artificiale (vendita, assistenza, analisi dati, supporto al CRM), CRM, ERP, app iOS e Android, siti e integrazioni su misura, collegandoli ai sistemi che l’azienda ha già. Il metodo è nato in Athlon Club, un club sportivo di Roma digitalizzato dall’interno.',
    '',
    '## Servizi',
    '',
    line('agenti', META.it.agenti.description),
    line('soluzioni', META.it.soluzioni.description),
    line('tecnologia', META.it.tecnologia.description),
    '',
    '## Casi e metodo',
    '',
    line('progetti', META.it.progetti.description),
    ...cases.it.map((c) => `- [${c.client}](${abs(pathFor('caso', 'it', c.slug))}): ${c.title}`),
    line('metodo', META.it.metodo.description),
    '',
    '## Azienda',
    '',
    line('chisiamo', META.it.chisiamo.description),
    line('contatti', META.it.contatti.description),
    '',
    '## English',
    '',
    `- [AI agents](${abs(pathFor('agenti', 'en'))}): ${META.en.agenti.description}`,
    `- [Solutions](${abs(pathFor('soluzioni', 'en'))}): ${META.en.soluzioni.description}`,
    `- [Work](${abs(pathFor('progetti', 'en'))}): ${META.en.progetti.description}`,
    `- [Contact](${abs(pathFor('contatti', 'en'))}): ${META.en.contatti.description}`,
    '',
    '## Contatti',
    '',
    `- LinkedIn: ${SOCIAL.company}`,
    `- LinkedIn (Maurizio Taruggi): ${SOCIAL.founder}`,
    `- Sede: ${COMPANY.address}`,
    `- P.IVA: ${COMPANY.vat}`,
    '',
  ].join('\n');
}
