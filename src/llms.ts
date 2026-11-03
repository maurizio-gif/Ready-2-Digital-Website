// What AI assistants read about the site, as plain text (llmstxt.org):
//
//   /llms.txt        a short map: who we are, and a link with one line for every page
//   /llms-full.txt   the whole content of the site as one Markdown document, in both
//                    languages, so an assistant can answer from a single fetch instead of
//                    crawling twenty-six pages
//
// Everything here is read from the same data the pages are built from (content.ts, pages.ts,
// cases.ts, agents.ts, legal.ts): there is no second copy of the facts to keep in step.

import { copy, type Lang } from './content';
import { pages } from './pages';
import { cases } from './cases';
import { agents } from './agents';
import { COMPANY, SOCIAL } from './legal';
import { pathFor, type Page } from './router';
import { SITE_URL, abs } from './site';
import { META } from './seo';

const ORDER: Exclude<Page, 'caso' | 'home' | 'privacy'>[] = ['agenti', 'soluzioni', 'tecnologia', 'progetti', 'metodo', 'chisiamo', 'contatti'];

const L = {
  it: {
    summary:
      'Ready 2 Digital S.r.l. è un’agenzia digitale di Roma. Progetta e costruisce automazioni dei processi, agenti di intelligenza artificiale (vendita, assistenza, analisi dati, supporto al CRM), CRM, ERP, app iOS e Android, siti e integrazioni su misura, collegandoli ai sistemi che l’azienda ha già. Il metodo è nato in Athlon Club, un club sportivo di Roma digitalizzato dall’interno.',
    facts: 'Fatti in breve',
    f: { name: 'Ragione sociale', brand: 'Marchio', office: 'Sede legale', founded: 'Fondata nel', founder: 'Fondatore', vat: 'Partita IVA', rea: 'REA', pec: 'PEC', site: 'Sito', langs: 'Lingue del sito', contact: 'Come contattarci' },
    langs: 'italiano (/), inglese (/en)',
    contact: 'dal modulo nella pagina Contatti, oppure su LinkedIn',
    pagesH: 'Pagine',
    caseH: 'Casi',
    optional: 'Opzionale',
    full: 'Tutti i contenuti del sito in un unico file, in italiano e in inglese',
    map: 'Mappa del sito con tutte le pagine e le versioni linguistiche',
    privacy: 'Informativa privacy',
    other: 'English version',
    solutions: 'Soluzioni',
    agentsH: 'Agenti AI',
    method: 'Metodo',
    tech: 'Tecnologia e conformità',
    stack: 'Strumenti e sistemi con cui lavoriamo',
    work: 'Progetti',
    about: 'Chi siamo',
    faq: 'Domande frequenti',
    cvEdu: 'Formazione',
    cvExp: 'Esperienza',
    challenge: 'La sfida',
    approach: 'L’approccio',
    built: 'Cosa è stato costruito',
    results: 'Numeri',
    stackOf: 'Tecnologie',
    does: 'Cosa fa',
    example: 'Esempio',
    contactH: 'Contatti',
  },
  en: {
    summary:
      'Ready 2 Digital S.r.l. is a digital agency based in Rome. It designs and builds process automation, AI agents (sales, support, data analysis, CRM support), CRM, ERP, iOS and Android apps, websites and custom integrations, connecting them to the systems a business already has. The method was born at Athlon Club, a sports club in Rome digitised from the inside.',
    facts: 'Key facts',
    f: { name: 'Legal name', brand: 'Brand', office: 'Registered office', founded: 'Founded in', founder: 'Founder', vat: 'VAT number', rea: 'REA', pec: 'PEC', site: 'Website', langs: 'Site languages', contact: 'How to reach us' },
    langs: 'Italian (/), English (/en)',
    contact: 'through the form on the Contact page, or on LinkedIn',
    pagesH: 'Pages',
    caseH: 'Cases',
    optional: 'Optional',
    full: 'All the content of the site in one file, in Italian and English',
    map: 'Sitemap with every page and language version',
    privacy: 'Privacy notice',
    other: 'Versione italiana',
    solutions: 'Solutions',
    agentsH: 'AI agents',
    method: 'Method',
    tech: 'Technology and compliance',
    stack: 'Tools and systems we work with',
    work: 'Work',
    about: 'About',
    faq: 'Frequently asked questions',
    cvEdu: 'Education',
    cvExp: 'Experience',
    challenge: 'The challenge',
    approach: 'The approach',
    built: 'What was built',
    results: 'Numbers',
    stackOf: 'Technology',
    does: 'What it does',
    example: 'Example',
    contactH: 'Contact',
  },
} as const;

const link = (name: string, url: string, note?: string) => `- [${name}](${url})${note ? `: ${note}` : ''}`;

function facts(lang: Lang): string[] {
  const l = L[lang];
  const a = pages[lang].about;
  return [
    `- ${l.f.name}: ${COMPANY.name}`,
    `- ${l.f.brand}: Ready2Digital`,
    `- ${l.f.office}: ${COMPANY.address}`,
    `- ${l.f.founded}: 2022`,
    `- ${l.f.founder}: ${a.name} (${SOCIAL.founder})`,
    `- ${l.f.vat}: ${COMPANY.vat}`,
    `- ${l.f.rea}: ${COMPANY.rea}`,
    `- ${l.f.pec}: ${COMPANY.pec}`,
    `- ${l.f.site}: ${SITE_URL}/`,
    `- LinkedIn: ${SOCIAL.company}`,
    `- ${l.f.langs}: ${l.langs}`,
    `- ${l.f.contact}: ${l.contact}`,
  ];
}

/** llms.txt: the short map. */
export function llmsTxt(): string {
  const out: string[] = ['# Ready2Digital', '', `> ${L.it.summary}`, '', `${L.en.summary}`, '', `## ${L.it.facts}`, '', ...facts('it'), ''];
  for (const lang of ['it', 'en'] as const) {
    const l = L[lang];
    out.push(`## ${lang === 'it' ? 'Italiano' : 'English'}: ${l.pagesH}`, '');
    out.push(link(lang === 'it' ? 'Home' : 'Home', abs(pathFor('home', lang)), META[lang].home.description));
    for (const page of ORDER) {
      out.push(link(pages[lang].heroes[page].kicker, abs(pathFor(page, lang)), META[lang][page].description));
    }
    out.push('', `## ${lang === 'it' ? 'Italiano' : 'English'}: ${l.caseH}`, '');
    for (const c of cases[lang]) out.push(link(c.client, abs(pathFor('caso', lang, c.slug)), c.title));
    out.push('');
  }
  out.push(
    `## ${L.it.optional}`,
    '',
    link('llms-full.txt', abs('/llms-full.txt'), `${L.it.full} / ${L.en.full}`),
    link('sitemap.xml', abs('/sitemap.xml'), L.it.map),
    link(L.it.privacy, abs(pathFor('privacy', 'it'))),
    link('LinkedIn', SOCIAL.company),
    link('LinkedIn (Maurizio Taruggi)', SOCIAL.founder),
    '',
  );
  return out.join('\n');
}

/** One language of llms-full.txt. */
function fullFor(lang: Lang): string[] {
  const l = L[lang];
  const t = copy[lang];
  const p = pages[lang];
  const ag = agents[lang];
  const a = p.about;
  const out: string[] = [];
  const h2 = (s: string) => out.push('', `## ${s}`, '');

  out.push(`# Ready2Digital (${lang === 'it' ? 'italiano' : 'English'})`, '', `> ${l.summary}`);
  h2(l.facts);
  out.push(...facts(lang));

  h2(l.solutions);
  out.push(t.services.sub, '');
  t.services.items.forEach((s) => out.push(`### ${s.t}`, '', s.d, ''));

  h2(l.agentsH);
  out.push(ag.what.lead, '');
  ag.families.items.forEach((f) => {
    out.push(`### ${f.t}`, '', f.promise, '');
    if (f.does.length) out.push(`${l.does}:`, ...f.does.map((d) => `- ${d}`), '');
    if (f.example) out.push(`${l.example}: ${f.example}`, '');
  });

  h2(l.method);
  out.push(t.method.title, '');
  t.method.steps.forEach((s, i) => out.push(`${i + 1}. **${s.t}**: ${s.d}`));

  h2(l.tech);
  p.compliance.items.forEach((c) => out.push(`- **${c.t}**: ${c.d}`));
  out.push('', `${l.stack}: ${t.stack.join(', ')}.`);

  h2(l.work);
  cases[lang].forEach((c) => {
    out.push(`### ${c.client}: ${c.sector}`, '', `**${c.title}**`, '', c.intro, '');
    out.push(`**${l.challenge}.** ${c.challenge}`, '', `**${l.approach}.** ${c.approach}`, '');
    if (c.built.length) out.push(`${l.built}:`, ...c.built.map((b) => `- ${b}`), '');
    if (c.metrics.length) out.push(`${l.results}:`, ...c.metrics.map((m) => `- ${m.v} ${m.l}`), '');
    if (c.stack.length) out.push(`${l.stackOf}: ${c.stack.join(', ')}.`, '');
    out.push(`${abs(pathFor('caso', lang, c.slug))}`, '');
  });

  h2(l.about);
  out.push(`### ${a.name}, ${a.role}`, '', `**${a.title}**`, '');
  a.paragraphs.forEach((para) => out.push(para, ''));
  out.push(`#### ${a.cv.educationTitle}`, '', ...a.cv.education.map((e) => `- ${e.y}: ${e.t}, ${e.w}`), '');
  out.push(`#### ${a.cv.experienceTitle}`, '', ...a.cv.experience.map((e) => `- ${e.y}: ${e.t}, ${e.w}`), '');
  out.push(`### ${a.vision.title}`, '', a.vision.text, '', ...a.vision.points.map((v) => `- ${v}`));

  h2(l.faq);
  [...p.faq.items, ...ag.faq.items].forEach((q) => out.push(`**${q.q}**`, '', q.a, ''));

  h2(l.contactH);
  out.push(`${p.heroes.contatti.sub}`, '', link(p.heroes.contatti.kicker, abs(pathFor('contatti', lang))), link('LinkedIn', SOCIAL.company), link(a.name, SOCIAL.founder), '');
  return out;
}

/** llms-full.txt: the whole content of the site, Italian first, then English. */
export function llmsFullTxt(): string {
  return [...fullFor('it'), '', '---', '', ...fullFor('en'), ''].join('\n');
}
