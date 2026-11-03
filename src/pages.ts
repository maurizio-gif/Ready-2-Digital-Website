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
      { page: 'agenti' as Page, label: 'Agenti AI' },
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
    agenti: {
      kicker: 'Agenti AI e automazioni',
      title: ['Dove ci sono dati,', 'un agente lavora.'],
      sub: 'Agenti di intelligenza artificiale su misura: leggono i tuoi dati, agiscono sui tuoi strumenti e passano la mano a una persona quando serve. Per vendere, assistere, capire i numeri e tenere in ordine il CRM.',
    },
    progetti: { kicker: 'Progetti', title: ['Ogni progetto,', 'un percorso diverso.'], sub: 'Club sportivi, palestre, circoli, amministrazione. Quattro casi raccontati per intero, con le schermate e la tecnica; gli altri in breve.' },
    metodo: { kicker: 'Metodo', title: ['Prima il processo.', 'Poi il codice.'], sub: 'Sei passi, sempre gli stessi. Perché la tecnologia funziona solo se nasce da come lavora davvero l’azienda, e se le persone la adottano.' },
    tecnologia: { kicker: 'Tecnologia', title: ['Lo stack,', 'spiegato semplice.'], sub: 'Cosa usiamo, perché, e come lo colleghiamo a quello che hai già. Senza gergo, per chi decide.' },
    chisiamo: { kicker: 'Chi siamo', title: ['Imprenditore, manager,', 'consulente, partner.'], sub: 'Ready 2 Digital nasce da chi guida un’azienda del settore ogni giorno. È da lì che guardiamo ogni progetto.' },
    contatti: { kicker: 'Contatti', title: ['Raccontaci', 'il tuo processo.'], sub: 'Quello che oggi ti fa perdere tempo. Ti diciamo, senza giri di parole, se e come possiamo semplificarlo.' },
  } as Record<string, Hero>,
  teasers: {
    solutions: { kicker: 'Soluzioni', title: 'Un pezzo o tutto il sistema.', more: 'Tutte le soluzioni' },
    work: { kicker: 'Progetti', title: 'Fatto, in produzione, usato ogni giorno.', more: 'Tutti i progetti' },
    agents: {
      kicker: 'Agenti AI e automazioni',
      title: 'Dove ci sono dati, un agente lavora.',
      text: 'Leggono i tuoi dati, agiscono sui tuoi strumenti e passano la mano a una persona quando serve. Non sono chatbot: fanno il lavoro.',
      more: 'Scopri gli agenti AI',
      cards: [
        { id: 'vendita', tag: 'Vendita', t: 'Rispondono e qualificano', d: 'Ogni contatto riceve risposta subito, a ogni ora, e arriva nel CRM già pronto.' },
        { id: 'assistenza', tag: 'Assistenza', t: 'Risolvono e passano la mano', d: 'Sito, app e WhatsApp: rispondono dalle tue informazioni e chiamano una persona quando serve.' },
        { id: 'analisi-dati', tag: 'Analisi dati', t: 'Fanno parlare i numeri', d: 'Report che arrivano da soli e avvisi quando qualcosa si scosta.' },
        { id: 'crm', tag: 'CRM', t: 'Tengono in ordine il CRM', d: 'Schede aggiornate, bozze di risposta, la prossima azione già indicata.' },
      ],
    },
    servicesMore: 'Scopri gli agenti AI',
    cta: { title: 'Hai un processo da semplificare?', btn: 'Parliamone' },
  },
  next: 'Continua',
  nextLabels: {
    home: 'Home',
    soluzioni: 'Le soluzioni',
    agenti: 'Gli agenti AI',
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
    title: 'Dalla gestione di un club alla tecnologia che lo fa funzionare',
    paragraphs: [
      'Ready 2 Digital nasce dall’esperienza di Maurizio Taruggi, che da oltre quindici anni lavora all’interno del settore fitness e sportivo. Non lo osserva da fuori. Dal 2010 è titolare e CEO di Athlon Club Roma, uno storico centro sportivo attivo dal 1973. È qui che ha imparato cosa significhi guidare una struttura ogni giorno: organizzare il lavoro, gestire il personale, tenere sotto controllo i conti, definire le strategie commerciali e costruire una relazione duratura con chi frequenta il club. Conosce il peso delle decisioni, la responsabilità di un investimento e la distanza che a volte separa un buon progetto dal suo funzionamento reale.',
      'Proprio dentro Athlon ha avviato un percorso di digitalizzazione che ha toccato marketing, vendite, iscrizioni, prenotazioni, pagamenti e organizzazione operativa. Più che adottare strumenti nuovi, si trattava di capire come ciascun processo potesse diventare più semplice, più controllabile e più vicino alle esigenze di chi lo utilizza. Da questa esperienza è nata una competenza particolare: tenere insieme la visione manageriale e la comprensione dei sistemi tecnologici, sapendo che una piattaforma è utile solo quando si inserisce davvero nel modo di lavorare di un’azienda.',
      'Nel 2022 Maurizio ha fondato Ready 2 Digital Srl per mettere questa esperienza al servizio di altre imprese del settore. L’attività di agenzia comprende strategia digitale, siti web, campagne pubblicitarie, acquisizione di contatti e sviluppo dei percorsi commerciali. Il punto di partenza però non è mai la comunicazione fine a sé stessa: è la capacità dell’azienda di accogliere i contatti, seguirli e trasformarli in clienti. Marketing e vendite vengono letti come parti dello stesso processo.',
      'Accanto all’agenzia c’è il lavoro di consulenza: analizzare i processi, individuare le inefficienze, scegliere gli strumenti più adatti e affiancare i team nel cambiamento. È una consulenza che nasce dalla conoscenza diretta del lavoro nei club. Per questo tiene insieme organizzazione, sostenibilità economica, esperienza dell’utente e tecnologia, senza separare ciò che nella realtà di una struttura procede insieme.',
      'Il suo percorso ha incluso anche l’esperienza sul campo con i gestionali del settore. Per tre anni ha commercializzato in Italia il software gestionale Perfect Gym, occupandosi di implementazione, formazione e supporto. Si è occupato inoltre, per tre anni, della formazione e dell’onboarding delle app eGym in Italia, in collaborazione con Matrix. Dal 2025 c’è anche una partnership commerciale con ABC Fitness / Glofox. Sono esperienze che hanno dato una conoscenza profonda dei software gestionali e di ciò che serve davvero a club molto diversi tra loro.',
      'Questa conoscenza, unita alla passione manageriale e imprenditoriale, ha reso possibile il passo successivo: sviluppare sistemi end-to-end, fatti di software, CRM, applicazioni e automazioni, che possono affiancarsi al sistema già presente in azienda oppure sostituirlo, in parte o del tutto. Senza il disagio di adottare una nuova tecnologia, che è il limite principale di qualsiasi SaaS. Oggi Ready 2 Digital riunisce esperienza di gestione, competenze di agenzia, consulenza e sviluppo tecnologico.',
      'Il filo che lega tutto è la capacità di guardare ogni progetto da più prospettive: quella dell’imprenditore che investe, del manager che organizza, del consulente che analizza e del partner che accompagna l’implementazione. Ne derivano un modo di lavorare concreto e trasparente, linguaggi chiari e un’attenzione costante ai risultati che contano per chi guida un’azienda.',
    ],
    facts: [
      { v: '1973', l: 'Athlon Club Roma, attivo da' },
      { v: '2010', l: 'Titolare e CEO di Athlon' },
      { v: '2022', l: 'Nasce Ready 2 Digital Srl' },
    ],
    cv: {
      kicker: 'Curriculum',
      title: 'Formazione ed esperienza',
      educationTitle: 'Formazione',
      education: [
        { y: '2009', t: 'Laurea magistrale in Economia e Gestione delle Imprese', w: 'LUISS' },
        { y: '2009', t: 'Master in International Marketing', w: 'European School of Economics · New York City, Manhattan' },
        { y: '2012', t: 'Certificazione di Direttore Sportivo', w: 'FIN · Federazione Italiana Nuoto' },
        { y: '2014', t: 'Master in Management dello Sport', w: 'LUISS · CONI' },
      ],
      experienceTitle: 'Esperienza',
      experience: [
        { y: 'Dal 2010', t: 'Titolare e CEO', w: 'Athlon Club Roma' },
        { y: 'Dal 2022', t: 'Fondatore', w: 'Ready 2 Digital Srl' },
        { y: '3 anni', t: 'Commercializzazione di Perfect Gym in Italia', w: 'Implementazione, formazione e supporto' },
        { y: '3 anni', t: 'Formazione e onboarding delle app eGym in Italia', w: 'In collaborazione con Matrix' },
        { y: 'Dal 2025', t: 'Partnership commerciale', w: 'ABC Fitness / Glofox' },
      ],
    },
    lensesTitle: 'Un progetto, quattro prospettive',
    lenses: [
      { t: 'Imprenditore', d: 'che investe' },
      { t: 'Manager', d: 'che organizza' },
      { t: 'Consulente', d: 'che analizza' },
      { t: 'Partner', d: 'che accompagna' },
    ],
    vision: {
      kicker: 'La visione',
      title: 'Non vendiamo strumenti. Orchestriamo sistemi.',
      text: 'La differenza non è la tecnologia, che oggi è alla portata di molti. È la visione aziendale con cui la si usa: sapere quale processo semplificare, dove passa il dato, chi lo deve vedere e chi lo deve usare. Per questo Ready 2 Digital lavora da orchestratore: sceglie e collega più sistemi — sito, app, CRM, gestionale, pagamenti, automazioni, AI — in un percorso unico, con uno stack tecnologico scelto per durare.',
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
      { page: 'agenti', label: 'AI agents' },
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
    agenti: {
      kicker: 'AI agents and automation',
      title: ['Where there’s data,', 'an agent works.'],
      sub: 'Custom AI agents: they read your data, act in your tools and hand over to a person when needed. To sell, support, make sense of the numbers and keep the CRM in order.',
    },
    progetti: { kicker: 'Work', title: ['Every project,', 'a different path.'], sub: 'Sports clubs, gyms, tennis clubs, administration. Four cases told in full, with screens and technology; the others in brief.' },
    metodo: { kicker: 'Method', title: ['Process first.', 'Code second.'], sub: 'Six steps, always the same. Because technology only works if it grows out of how the company really works, and if people adopt it.' },
    tecnologia: { kicker: 'Technology', title: ['The stack,', 'explained simply.'], sub: 'What we use, why, and how we connect it to what you already have. No jargon, for the people who decide.' },
    chisiamo: { kicker: 'About', title: ['Entrepreneur, manager,', 'consultant, partner.'], sub: 'Ready 2 Digital comes from someone who runs a business in this industry every day. That’s where we look at every project from.' },
    contatti: { kicker: 'Contact', title: ['Tell us about', 'your process.'], sub: 'The one that wastes your time today. We’ll tell you, straight, whether and how we can simplify it.' },
  },
  teasers: {
    solutions: { kicker: 'Solutions', title: 'One piece or the whole system.', more: 'All solutions' },
    work: { kicker: 'Work', title: 'Built, in production, used every day.', more: 'All work' },
    agents: {
      kicker: 'AI agents and automation',
      title: 'Where there’s data, an agent works.',
      text: 'They read your data, act in your tools and hand over to a person when needed. Not chatbots: they do the work.',
      more: 'Discover AI agents',
      cards: [
        { id: 'vendita', tag: 'Sales', t: 'They reply and qualify', d: 'Every lead gets an answer at once, at any hour, and reaches the CRM ready to work.' },
        { id: 'assistenza', tag: 'Support', t: 'They solve and hand over', d: 'Website, app and WhatsApp: they answer from your information and call a person when needed.' },
        { id: 'analisi-dati', tag: 'Data analysis', t: 'They make numbers talk', d: 'Reports that arrive on their own, and alerts when something drifts.' },
        { id: 'crm', tag: 'CRM', t: 'They keep the CRM in order', d: 'Records kept current, draft replies, the next action already pointed out.' },
      ],
    },
    servicesMore: 'Discover AI agents',
    cta: { title: 'Got a process to simplify?', btn: 'Let’s talk' },
  },
  next: 'Next',
  nextLabels: {
    home: 'Home',
    soluzioni: 'Solutions',
    agenti: 'AI agents',
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
    title: 'From running a club to the technology that makes it work',
    paragraphs: [
      'Ready 2 Digital grows out of the experience of Maurizio Taruggi, who has worked inside the fitness and sports industry for more than fifteen years. He doesn’t watch it from the outside. Since 2010 he has been owner and CEO of Athlon Club Roma, a long-standing sports centre open since 1973. That is where he learned what it means to run a facility every day: organising the work, managing staff, keeping the accounts under control, setting the commercial strategy and building a lasting relationship with the people who use the club. He knows the weight of decisions, the responsibility of an investment, and the gap that can separate a good plan from how it actually works.',
      'Inside Athlon he led a digital transformation that touched marketing, sales, sign-ups, bookings, payments and day-to-day operations. More than adopting new tools, it meant understanding how each process could become simpler, easier to control and closer to the needs of the people using it. That experience produced a particular skill: holding together a manager’s view and an understanding of technology systems, knowing that a platform is only useful when it truly fits the way a business works.',
      'In 2022 Maurizio founded Ready 2 Digital Srl to put this experience at the service of other businesses in the sector. The agency work covers digital strategy, websites, advertising campaigns, lead generation and the design of sales journeys. The starting point, though, is never communication for its own sake: it is a company’s ability to welcome leads, follow them up and turn them into customers. Marketing and sales are read as parts of the same process.',
      'Alongside the agency there is consulting: analysing processes, spotting inefficiencies, choosing the right tools and supporting teams through change. It is consulting that comes from first-hand knowledge of how clubs work. That is why it keeps organisation, financial sustainability, user experience and technology together, without separating what in a real facility moves as one.',
      'His path has also included hands-on experience with the industry’s management software. For three years he commercialised the Perfect Gym management software in Italy, handling implementation, training and support. He also spent three years on the training and onboarding of the eGym apps in Italy, in collaboration with Matrix. Since 2025 there has also been a commercial partnership with ABC Fitness / Glofox. These experiences gave him a deep knowledge of management software and of what very different clubs really need.',
      'That knowledge, combined with a managerial and entrepreneurial passion, made the next step possible: building end-to-end systems — software, CRMs, apps and automations — that can sit alongside the system a business already has, or replace it, partly or entirely. Without the disruption of adopting a new technology, which is the main limit of any SaaS. Today Ready 2 Digital combines management experience, agency skills, consulting and technology development.',
      'The thread running through it all is the ability to look at every project from several perspectives: that of the entrepreneur who invests, the manager who organises, the consultant who analyses and the partner who supports the implementation. The result is a way of working that is concrete and transparent, clear in its language and constantly focused on the results that matter to the people running a business.',
    ],
    facts: [
      { v: '1973', l: 'Athlon Club Roma, open since' },
      { v: '2010', l: 'Owner and CEO of Athlon' },
      { v: '2022', l: 'Ready 2 Digital Srl is founded' },
    ],
    cv: {
      kicker: 'Curriculum',
      title: 'Education and experience',
      educationTitle: 'Education',
      education: [
        { y: '2009', t: 'Master’s degree in Economics and Business Management', w: 'LUISS' },
        { y: '2009', t: 'Master in International Marketing', w: 'European School of Economics · New York City, Manhattan' },
        { y: '2012', t: 'Sports Director certification', w: 'FIN · Italian Swimming Federation' },
        { y: '2014', t: 'Master in Sports Management', w: 'LUISS · CONI' },
      ],
      experienceTitle: 'Experience',
      experience: [
        { y: 'Since 2010', t: 'Owner and CEO', w: 'Athlon Club Roma' },
        { y: 'Since 2022', t: 'Founder', w: 'Ready 2 Digital Srl' },
        { y: '3 years', t: 'Commercialising Perfect Gym in Italy', w: 'Implementation, training and support' },
        { y: '3 years', t: 'Training and onboarding of the eGym apps in Italy', w: 'In collaboration with Matrix' },
        { y: 'Since 2025', t: 'Commercial partnership', w: 'ABC Fitness / Glofox' },
      ],
    },
    lensesTitle: 'One project, four perspectives',
    lenses: [
      { t: 'Entrepreneur', d: 'who invests' },
      { t: 'Manager', d: 'who organises' },
      { t: 'Consultant', d: 'who analyses' },
      { t: 'Partner', d: 'who supports' },
    ],
    vision: {
      kicker: 'The vision',
      title: 'We don’t sell tools. We orchestrate systems.',
      text: 'The difference isn’t the technology, which today is within many people’s reach. It’s the business vision behind how it’s used: knowing which process to simplify, where the data flows, who needs to see it and who needs to use it. That’s why Ready 2 Digital works as an orchestrator: it chooses and connects several systems — website, app, CRM, back office, payments, automation, AI — into one path, on a technology stack chosen to last.',
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
  soluzioni: 'agenti',
  agenti: 'progetti',
  progetti: 'metodo',
  metodo: 'tecnologia',
  tecnologia: 'chisiamo',
  chisiamo: 'contatti',
  caso: 'progetti',
};
