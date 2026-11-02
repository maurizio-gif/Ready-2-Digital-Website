// Copy that belongs to the multi-page structure: the menu, the page headers,
// the home teasers, the "next page" links and the About page.

import type { Lang } from './content';
import type { Page } from './router';

/** Anchors for the ten services, in the order of content.services.items. */
export const SERVICE_IDS = ['siti', 'app', 'crm', 'erp', 'dashboard', 'automazioni', 'integrazioni', 'totem', 'ai', 'privacy'];

type Hero = { kicker: string; title: [string, string]; sub: string };

const it = {
  menu: {
    items: [
      { page: 'soluzioni' as Page, label: 'Soluzioni' },
      { page: 'progetti' as Page, label: 'Progetti' },
      { page: 'metodo' as Page, label: 'Metodo' },
      { page: 'tecnologia' as Page, label: 'Tecnologia' },
      { page: 'chisiamo' as Page, label: 'Chi siamo' },
    ],
    groups: [
      { t: 'Per i tuoi clienti', ids: [0, 1, 7] },
      { t: 'Per chi lavora', ids: [2, 3, 4] },
      { t: 'Dietro le quinte', ids: [5, 6, 8, 9] },
    ],
    allSolutions: 'Tutte le soluzioni',
    allWork: 'Tutti i progetti',
    workBlurb: 'Quattro casi aperti: cosa abbiamo costruito, come, e le schermate.',
    contact: 'Contatti',
  },
  heroes: {
    soluzioni: { kicker: 'Soluzioni', title: ['Dal sito all’ERP.', 'Dalla app al totem.'], sub: 'Dieci cose che sappiamo costruire. Ognuna può vivere da sola o diventare parte dello stesso percorso, accanto al software che hai già.' },
    progetti: { kicker: 'Progetti', title: ['Ogni progetto,', 'un percorso diverso.'], sub: 'Club sportivi, palestre, circoli, amministrazione. Quattro casi raccontati per intero, con le schermate e la tecnica; gli altri in breve.' },
    metodo: { kicker: 'Metodo', title: ['Prima il processo.', 'Poi il codice.'], sub: 'Sei passi, sempre gli stessi. Perché la tecnologia funziona solo se nasce da come lavora davvero l’azienda, e se le persone la adottano.' },
    tecnologia: { kicker: 'Tecnologia', title: ['Lo stack,', 'spiegato semplice.'], sub: 'Cosa usiamo, perché, e come lo colleghiamo a quello che hai già. Senza gergo, per chi decide.' },
    chisiamo: { kicker: 'Chi siamo', title: ['Un’azienda che', 'orchestra sistemi.'], sub: 'Ready2Digital nasce da chi gestisce un’azienda ogni giorno, non da chi vende software. È questa la differenza.' },
    contatti: { kicker: 'Contatti', title: ['Raccontaci', 'il tuo processo.'], sub: 'Quello che oggi ti fa perdere tempo. Ti diciamo, senza giri di parole, se e come possiamo semplificarlo.' },
  } as Record<string, Hero>,
  teasers: {
    solutions: { kicker: 'Soluzioni', title: 'Un pezzo o tutto il sistema.', more: 'Tutte le soluzioni' },
    work: { kicker: 'Progetti', title: 'Fatto, in produzione, usato ogni giorno.', more: 'Tutti i progetti' },
    cta: { title: 'Hai un processo da semplificare?', btn: 'Parliamone' },
  },
  next: 'Continua',
  nextLabels: {
    home: 'Home',
    soluzioni: 'Le soluzioni',
    progetti: 'I progetti',
    metodo: 'Il metodo',
    tecnologia: 'La tecnologia',
    chisiamo: 'Chi siamo',
    contatti: 'Parliamone',
  } as Record<string, string>,
  compliance: {
    kicker: 'Privacy e conformità',
    title: 'Blindato dal primo giorno.',
    items: [
      { t: 'Certificazione degli store', d: 'App pubblicate su App Store e Google Play secondo le loro regole: permessi spiegati, dati dichiarati, account eliminabile dall’app.' },
      { t: 'GDPR by design', d: 'Consensi separati per scopo, versionati, e revocabili. I dati sulla salute si usano solo dietro un consenso esplicito.' },
      { t: 'Accessi per ruolo', d: 'Ogni operatore vede quello che il suo ruolo gli permette, con regole scritte nel database e un registro di chi fa cosa.' },
      { t: 'File privati', d: 'Certificati, documenti e video stanno in archivi privati e si aprono solo con link firmati e temporanei.' },
    ],
  },
  about: {
    name: 'Maurizio Taruggi',
    role: 'Fondatore',
    photoAlt: 'Maurizio Taruggi',
    intro: 'Ready2Digital è l’azienda di Maurizio Taruggi: un manager che ha imparato il digitale gestendo un’azienda, non vendendolo.',
    chapters: [
      { k: 'La formazione', t: 'Economia, management, marketing.', d: 'Una formazione in ambito economico e manageriale, poi un Master in International Marketing. Il punto di partenza è sempre stato lo stesso: i numeri di un’azienda, e le persone che li fanno.' },
      { k: 'Il club', t: 'Dirigere, non consigliare.', d: 'Anni alla guida diretta di un club sportivo: personale, soci, incassi, fornitori, turni, reclami. È lì che si capisce quanto costa un processo che non funziona, e quanto poco serve uno strumento che nessuno usa.' },
      { k: 'La svolta', t: 'Il Covid, e il digitale come visione.', d: 'Con le chiusure, il digitale smette di essere un accessorio e diventa l’unico modo di restare in contatto con i clienti e tenere in piedi l’azienda. Da necessità diventa visione: digitalizzare l’intero processo, non un pezzo alla volta.' },
      { k: 'L’accelerazione', t: 'L’intelligenza artificiale.', d: 'Negli ultimi anni l’AI cambia la velocità con cui si costruisce e quello che un sistema sa fare: assistenti che rispondono ai clienti, automazioni che leggono i dati, software su misura in tempi che prima erano impensabili.' },
    ],
    vision: {
      kicker: 'La visione',
      title: 'Non vendiamo strumenti. Orchestriamo sistemi.',
      text: 'La differenza non è la tecnologia, che oggi è alla portata di molti. È la visione aziendale con cui la si usa: sapere quale processo semplificare, dove passa il dato, chi lo deve vedere e chi lo deve usare. Per questo Ready2Digital lavora da orchestratore: sceglie e collega più sistemi — sito, app, CRM, gestionale, pagamenti, automazioni, AI — in un percorso unico, con uno stack tecnologico scelto per durare.',
      points: [
        'Si parte dai numeri e dal processo, non dal software',
        'Ogni sistema ha il suo ruolo, e parlano tutti la stessa lingua',
        'Il gestionale che c’è si collega, non si butta',
        'L’AI dove fa risparmiare tempo vero, non per moda',
      ],
    },
  },
};

const en: typeof it = {
  menu: {
    items: [
      { page: 'soluzioni', label: 'Solutions' },
      { page: 'progetti', label: 'Work' },
      { page: 'metodo', label: 'Method' },
      { page: 'tecnologia', label: 'Technology' },
      { page: 'chisiamo', label: 'About' },
    ],
    groups: [
      { t: 'For your customers', ids: [0, 1, 7] },
      { t: 'For your team', ids: [2, 3, 4] },
      { t: 'Behind the scenes', ids: [5, 6, 8, 9] },
    ],
    allSolutions: 'All solutions',
    allWork: 'All work',
    workBlurb: 'Four open cases: what we built, how, and the screens.',
    contact: 'Contact',
  },
  heroes: {
    soluzioni: { kicker: 'Solutions', title: ['From website to ERP.', 'From app to kiosk.'], sub: 'Ten things we know how to build. Each can live on its own or become part of the same path, alongside the software you already have.' },
    progetti: { kicker: 'Work', title: ['Every project,', 'a different path.'], sub: 'Sports clubs, gyms, tennis clubs, administration. Four cases told in full, with screens and technology; the others in brief.' },
    metodo: { kicker: 'Method', title: ['Process first.', 'Code second.'], sub: 'Six steps, always the same. Because technology only works if it grows out of how the company really works, and if people adopt it.' },
    tecnologia: { kicker: 'Technology', title: ['The stack,', 'explained simply.'], sub: 'What we use, why, and how we connect it to what you already have. No jargon, for the people who decide.' },
    chisiamo: { kicker: 'About', title: ['A company that', 'orchestrates systems.'], sub: 'Ready2Digital comes from someone who runs a business every day, not from someone who sells software. That’s the difference.' },
    contatti: { kicker: 'Contact', title: ['Tell us about', 'your process.'], sub: 'The one that wastes your time today. We’ll tell you, straight, whether and how we can simplify it.' },
  },
  teasers: {
    solutions: { kicker: 'Solutions', title: 'One piece or the whole system.', more: 'All solutions' },
    work: { kicker: 'Work', title: 'Built, in production, used every day.', more: 'All work' },
    cta: { title: 'Got a process to simplify?', btn: 'Let’s talk' },
  },
  next: 'Next',
  nextLabels: {
    home: 'Home',
    soluzioni: 'Solutions',
    progetti: 'Work',
    metodo: 'The method',
    tecnologia: 'Technology',
    chisiamo: 'About us',
    contatti: 'Let’s talk',
  },
  compliance: {
    kicker: 'Privacy and compliance',
    title: 'Locked down from day one.',
    items: [
      { t: 'Store certification', d: 'Apps published on the App Store and Google Play by their rules: permissions explained, data declared, account deletable from the app.' },
      { t: 'GDPR by design', d: 'Consent split by purpose, versioned and revocable. Health data is used only with explicit consent.' },
      { t: 'Role-based access', d: 'Each operator sees what their role allows, with rules written in the database and a log of who did what.' },
      { t: 'Private files', d: 'Certificates, documents and videos live in private storage and open only through signed, temporary links.' },
    ],
  },
  about: {
    name: 'Maurizio Taruggi',
    role: 'Founder',
    photoAlt: 'Maurizio Taruggi',
    intro: 'Ready2Digital is Maurizio Taruggi’s company: a manager who learned digital by running a business, not by selling it.',
    chapters: [
      { k: 'Education', t: 'Economics, management, marketing.', d: 'A background in economics and management, then a Master’s in International Marketing. The starting point has always been the same: a company’s numbers, and the people who make them.' },
      { k: 'The club', t: 'Running it, not advising.', d: 'Years running a sports club first-hand: staff, members, revenue, suppliers, shifts, complaints. That’s where you learn what a broken process costs, and how little a tool nobody uses is worth.' },
      { k: 'The turning point', t: 'Covid, and digital as a vision.', d: 'With lockdowns, digital stops being an extra and becomes the only way to stay in touch with customers and keep the business standing. From necessity it becomes a vision: digitise the whole process, not one piece at a time.' },
      { k: 'The acceleration', t: 'Artificial intelligence.', d: 'In recent years AI has changed how fast software gets built and what a system can do: assistants that answer customers, automations that read data, custom software in timeframes that used to be unthinkable.' },
    ],
    vision: {
      kicker: 'The vision',
      title: 'We don’t sell tools. We orchestrate systems.',
      text: 'The difference isn’t the technology, which today is within many people’s reach. It’s the business vision behind how it’s used: knowing which process to simplify, where the data flows, who needs to see it and who needs to use it. That’s why Ready2Digital works as an orchestrator: it chooses and connects several systems — website, app, CRM, back office, payments, automation, AI — into one path, on a technology stack chosen to last.',
      points: [
        'We start from the numbers and the process, not the software',
        'Every system has its role, and they all speak the same language',
        'The back office you have gets connected, not thrown away',
        'AI where it saves real time, not because it’s trendy',
      ],
    },
  },
};

export const pages: Record<Lang, typeof it> = { it, en };

/** The page each page points to at the bottom. */
export const NEXT: Record<string, Page> = {
  home: 'soluzioni',
  soluzioni: 'progetti',
  progetti: 'metodo',
  metodo: 'tecnologia',
  tecnologia: 'chisiamo',
  chisiamo: 'contatti',
  caso: 'progetti',
};
