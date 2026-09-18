// Shared UI strings only — navigation, footer, buttons, form labels, and
// other chrome that repeats identically across pages. Page prose (hero
// copy, case study narrative, etc.) is NOT translated from here: it's
// written directly in each locale's page file, because a real translation
// desk writes English copy in English, it doesn't map Italian sentences
// through a dictionary.
import type { Locale } from './routes';

export const ui = {
  it: {
    nav: {
      solutions: 'Soluzioni',
      method: 'Metodo',
      work: 'Progetti',
      technology: 'Tecnologia',
      about: 'Chi Siamo',
      contact: 'Contatti',
    },
    cta: {
      primary: 'Parliamo del tuo progetto',
      secondary: 'Scopri come lavoriamo',
      seeProject: 'Scopri il progetto',
      seeMethod: 'Scopri il metodo',
      allProjects: 'Tutti i progetti',
      nextCase: 'Progetto successivo',
      backToWork: 'Torna ai progetti',
    },
    footer: {
      tagline: 'Prima i processi. Poi il software.',
      nav: 'Naviga',
      company: 'Azienda',
      legal: 'Legale',
      privacy: 'Privacy',
      cookiePolicy: 'Cookie Policy',
      rights: 'Tutti i diritti riservati.',
    },
    lang: {
      switchTo: 'English',
      current: 'Italiano',
    },
    themeToggle: {
      label: 'Cambia tema',
      toLight: 'Passa al tema chiaro',
      toDark: 'Passa al tema scuro',
    },
    misc: {
      skipToContent: 'Vai al contenuto',
      readingTime: 'min di lettura',
      client: 'Cliente',
      sector: 'Settore',
      year: 'Anno',
      services: 'Ambiti del progetto',
      results: 'Risultati',
      technologyUsed: 'Tecnologia',
      notFoundTitle: 'Pagina non trovata',
      notFoundBody: 'Il contenuto che cerchi non esiste o è stato spostato.',
      notFoundCta: 'Torna alla home',
    },
  },
  en: {
    nav: {
      solutions: 'Solutions',
      method: 'Method',
      work: 'Work',
      technology: 'Technology',
      about: 'About',
      contact: 'Contact',
    },
    cta: {
      primary: 'Tell us about your project',
      secondary: 'See how we work',
      seeProject: 'See the project',
      seeMethod: 'See our method',
      allProjects: 'All projects',
      nextCase: 'Next project',
      backToWork: 'Back to work',
    },
    footer: {
      tagline: 'Processes first. Software second.',
      nav: 'Navigate',
      company: 'Company',
      legal: 'Legal',
      privacy: 'Privacy',
      cookiePolicy: 'Cookie Policy',
      rights: 'All rights reserved.',
    },
    lang: {
      switchTo: 'Italiano',
      current: 'English',
    },
    themeToggle: {
      label: 'Switch theme',
      toLight: 'Switch to light theme',
      toDark: 'Switch to dark theme',
    },
    misc: {
      skipToContent: 'Skip to content',
      readingTime: 'min read',
      client: 'Client',
      sector: 'Sector',
      year: 'Year',
      services: 'Project scope',
      results: 'Results',
      technologyUsed: 'Technology',
      notFoundTitle: 'Page not found',
      notFoundBody: "The content you're looking for doesn't exist or has moved.",
      notFoundCta: 'Back to home',
    },
  },
} as const;

export function t(locale: Locale) {
  return ui[locale];
}
