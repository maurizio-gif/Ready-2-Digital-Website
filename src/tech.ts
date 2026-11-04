// "How it's built": the technical side of each case, and the stack explained
// for the home page. Facts and counts come from the project repositories
// (package.json, supabase/functions, supabase/migrations, cron schedules).

import type { Lang } from './content';

export type Tech = {
  intro: string;
  layers: { name: string; items: string[] }[];
  parts: { t: string; role: string; d: string }[];
  numbers: { v: string; l: string }[];
};

type Ui = { kicker: string; title: string; layers: string; parts: string; numbers: string };

const it: Record<string, Tech> = {
  athlon: {
    intro:
      'Tre applicazioni, un database solo. Il sito, il CRM dello staff e l’app dei soci sono progetti separati, ognuno con la tecnologia giusta per chi lo usa, ma leggono e scrivono sullo stesso Postgres su Supabase. Il gestionale PerfectGym viene copiato lì dentro e tenuto aggiornato: le pagine leggono dalla copia, al gestionale si scrive solo per prenotare, pagare, iscrivere.',
    layers: [
      { name: 'Interfacce', items: ['Sito · Astro', 'CRM staff · Next.js + React', 'App soci · Expo + React Native', 'Totem · modalità kiosk dell’app', 'WhatsApp'] },
      { name: 'Logica', items: ['77 Edge Functions · TypeScript', 'Funzioni SQL condivise', 'API routes Next.js', 'Job programmati · pg_cron + Vercel Cron'] },
      { name: 'Dati', items: ['Postgres su Supabase', 'Auth', 'Storage privato', 'Row Level Security', 'Copia del gestionale'] },
      { name: 'Sistemi esterni', items: ['PerfectGym API', 'Adyen', 'GoCardless (SEPA)', 'WhatsApp Cloud API', 'Claude · Anthropic', 'Apple Salute · Health Connect', 'Web Push'] },
    ],
    parts: [
      { t: 'Astro', role: 'Il sito pubblico', d: 'Pagine HTML generate in anticipo e CSS per componente: arrivano già pronte, si indicizzano bene e si aprono subito. Il JavaScript c’è solo dove serve davvero, come i moduli e l’assistente.' },
      { t: 'Next.js + React', role: 'Il CRM dello staff', d: 'Le pagine si compongono sul server con i dati già dentro; React gestisce le parti interattive. Un middleware controlla sessione e permessi a ogni richiesta, i ruoli decidono quali sezioni si vedono. Ospitato su Vercel.' },
      { t: 'Expo + React Native', role: 'L’app dei soci', d: 'Un solo codice TypeScript per iOS, Android e web. Con Expo Router ogni file è una schermata e anche un deep link. Moduli nativi per HealthKit, Health Connect, notifiche, fotocamera e file; build e aggiornamenti con EAS.' },
      { t: 'Supabase · Postgres', role: 'Il cuore', d: 'Database, autenticazione, file e regole di accesso riga per riga. Lo schema vive in 483 migrazioni versionate: ogni modifica è codice, si rivede e si ripete. Le letture importanti sono funzioni SQL: CRM e app chiamano la stessa, quindi dicono la stessa cosa.' },
      { t: 'Edge Functions', role: 'La logica e i collegamenti', d: '77 funzioni TypeScript vicine al database. L’app parla con loro, mai direttamente con il gestionale: prenotare, pagare, sincronizzare, ricevere i webhook di pagamenti e WhatsApp.' },
      { t: 'La copia del gestionale', role: 'Veloce e indipendente', d: 'Webhook di PerfectGym e sincronizzazioni programmate copiano contratti, pagamenti, prenotazioni e accessi. Una lettura costa millisecondi e funziona anche quando il gestionale è lento o fermo.' },
      { t: 'Automazioni', role: 'Quello che succede da solo', d: '23 job nel database e 11 su Vercel: promemoria delle prenotazioni ogni 5 minuti, avvisi del certificato in scadenza, email dopo le prime visite, stato dei soci, cruscotti aggiornati, pagamenti falliti.' },
      { t: 'AI', role: 'Assistente e WhatsApp', d: 'L’assistente dell’app e l’agente WhatsApp usano un modello Claude, con le informazioni del club come contesto. Non inventano: rimandano al modulo giusto o passano a una persona.' },
    ],
    numbers: [
      { v: '77', l: 'Edge Functions' },
      { v: '483', l: 'Migrazioni del database' },
      { v: '34', l: 'Job programmati' },
      { v: '3', l: 'Piattaforme da un codice: iOS, Android, web' },
    ],
  },
  ronchiverdi: {
    intro:
      'Un sito statico con un editor per la segreteria, un CRM in Next.js e un ponte verso il gestionale che gira dentro il club, sul suo server Windows. Nessuno strumento esistente è stato sostituito: è stato collegato.',
    layers: [
      { name: 'Interfacce', items: ['Sito · Astro + TinaCMS', 'CRM · Next.js + React', 'App installabile (PWA)', 'Notifiche push'] },
      { name: 'Logica', items: ['API routes + Vercel Cron', 'Edge Functions · tesseramenti, voucher, email', 'Script PowerShell sul server'] },
      { name: 'Dati', items: ['Postgres su Supabase', 'Anagrafica unica', 'Abbonamenti dal gestionale'] },
      { name: 'Sistemi esterni', items: ['SQL Server del gestionale', 'Email', 'Tesseramenti sportivi'] },
    ],
    parts: [
      { t: 'Astro + TinaCMS', role: 'Il sito', d: 'Sito statico: HTML pronto, CSS leggero, contenuti in file Markdown che la segreteria modifica da un editor visuale senza toccare il codice. Ogni modifica è salvata nella storia del progetto.' },
      { t: 'Next.js', role: 'Il CRM', d: 'Pagine composte sul server con i dati già pronti. Si installa su telefono e tablet come un’app, con la sua icona e le notifiche push.' },
      { t: 'PowerShell + SQL Server', role: 'Il ponte con il gestionale', d: 'Uno script pianificato con l’Utilità di pianificazione di Windows, sullo stesso server del gestionale. Legge con un utente SQL in sola lettura e manda le novità a Supabase in HTTPS, solo in uscita: niente VPN, nessuna porta aperta. Se lo rilanci non crea doppioni.' },
      { t: 'Supabase · Postgres', role: 'Un’anagrafica sola', d: 'Le richieste del sito, le trattative e le vendite del gestionale si agganciano alla stessa persona. Lo schema è in 123 script SQL versionati.' },
      { t: 'Automazioni', role: 'Quello che succede da solo', d: 'Promemoria degli appuntamenti ogni 5 minuti, report direzionale serale, tesseramenti e voucher per la visita medica generati senza intervento.' },
    ],
    numbers: [
      { v: '0', l: 'Porte aperte sul server del club' },
      { v: 'R/O', l: 'Utente SQL in sola lettura' },
      { v: '5 min', l: 'Ciclo dei promemoria' },
      { v: '123', l: 'Script SQL versionati' },
    ],
  },
  'tennis-club-ambrosiano': {
    intro:
      'Il sito resta statico e velocissimo; la segreteria lavora su un CRM separato con login e dati dal vivo. Due progetti, un database: è il database a tenere insieme le persone.',
    layers: [
      { name: 'Interfacce', items: ['Sito · Astro + TinaCMS', 'CRM segreteria · Next.js + React', 'Notifiche push'] },
      { name: 'Logica', items: ['n8n · flussi dai moduli', 'Normalizzazione e deduplica', 'Edge Functions · sync gestionale', 'Vercel Cron'] },
      { name: 'Dati', items: ['Postgres su Supabase', 'Persone · opportunità · eventi', 'Row Level Security'] },
      { name: 'Sistemi esterni', items: ['PerfectGym API', 'Email', 'Storico del CRM precedente'] },
    ],
    parts: [
      { t: 'Astro', role: 'Il sito', d: 'Generato in anticipo: nessun server da mantenere, pagine HTML pronte, CSS essenziale. I contenuti si aggiornano da un editor visuale.' },
      { t: 'Perché due applicazioni', role: 'Sito e CRM separati', d: 'Il sito è statico, il CRM ha bisogno di login e di dati aggiornati al secondo. Tenerli separati, sullo stesso database, lascia il sito semplice e il CRM libero di crescere.' },
      { t: 'Deduplica', role: 'Una riga per persona', d: 'Regole su nome, email e telefono normalizzati decidono quando due righe sono la stessa persona. Le richieste restano tante, la persona è una; le opportunità appartengono alla persona.' },
      { t: 'n8n', role: 'Le automazioni', d: 'I moduli del sito passano da flussi n8n che li normalizzano e li scrivono nelle tabelle giuste, senza nessuno in mezzo.' },
      { t: 'Supabase + RLS', role: 'Chi vede cosa', d: 'Le regole di accesso stanno nel database, riga per riga: ogni operatore vede quello che il suo ruolo gli permette, qualunque pagina usi.' },
    ],
    numbers: [
      { v: '1', l: 'Database per sito e CRM' },
      { v: '353', l: 'Eventi storici importati' },
      { v: '192', l: 'Doppioni riconosciuti' },
      { v: '18', l: 'Migrazioni del database' },
    ],
  },
  'passion-fitness': {
    intro:
      'Il gestionale copiato dentro Supabase, un CRM in Next.js costruito sopra, e un sito Astro che rimanda a dove si prenota e si paga davvero. Lo stesso impianto nato per Athlon, portato qui.',
    layers: [
      { name: 'Interfacce', items: ['Sito · Astro + MDX', 'CRM staff · Next.js + React', 'Moduli del sito · Lead Ads Meta'] },
      { name: 'Logica', items: ['Edge Functions · sync, webhook, lead', 'Funzioni SQL dei numeri', 'n8n · referral'] },
      { name: 'Dati', items: ['Postgres su Supabase (Londra)', 'Copia del gestionale · 119 entità', 'CRM · lead, prove, rinnovi, ticket'] },
      { name: 'Sistemi esterni', items: ['PerfectGym API', 'Airtable (migrato)', 'Meta Lead Ads'] },
    ],
    parts: [
      { t: 'Astro + MDX', role: 'Il sito', d: 'Blog e pagine dei corsi scritti in MDX, immagini ottimizzate al momento della build: la home è passata da 45,49 MB a 4,93 MB.' },
      { t: 'La copia del gestionale', role: 'Tutto PerfectGym, in casa', d: 'Le Edge Functions scaricano l’API di PerfectGym entità per entità, con un cursore: se si interrompe, riparte da dove era. I webhook tengono il dato fresco. Primo download: 1,4 milioni di righe in 24 minuti.' },
      { t: 'Le regole nel database', role: 'Numeri che non cambiano a seconda di chi li guarda', d: 'Cos’è un abbonamento, un rinnovo, una prova: definito una volta in funzioni SQL. Dashboard e CRM leggono le stesse regole.' },
      { t: 'Da Airtable al CRM', role: 'Migrazione senza fermo', d: 'Il CRM su Airtable è stato portato nel database e, per tutto il passaggio, tenuto sincronizzato in automatico: nessun giorno di stop per lo staff.' },
      { t: 'Lead automatici', role: 'Nessuno ricopia', d: 'Moduli del sito e Lead Ads di Meta entrano nel CRM con il consulente assegnato, e l’anagrafica nasce anche su PerfectGym.' },
    ],
    numbers: [
      { v: '10', l: 'Edge Functions' },
      { v: '78', l: 'Migrazioni del database' },
      { v: '119', l: 'Entità sincronizzate' },
      { v: '1,4 mln', l: 'Righe nel primo download' },
    ],
  },
};

const en: Record<string, Tech> = {
  athlon: {
    intro:
      'Three applications, one database. The website, the staff CRM and the member app are separate projects, each with the right technology for its users, but they all read and write the same Postgres on Supabase. The PerfectGym back office is copied in there and kept up to date: pages read from the copy, and the back office is written to only to book, pay or sign up.',
    layers: [
      { name: 'Interfaces', items: ['Website · Astro', 'Staff CRM · Next.js + React', 'Member app · Expo + React Native', 'Kiosk · the app’s kiosk mode', 'WhatsApp'] },
      { name: 'Logic', items: ['77 Edge Functions · TypeScript', 'Shared SQL functions', 'Next.js API routes', 'Scheduled jobs · pg_cron + Vercel Cron'] },
      { name: 'Data', items: ['Postgres on Supabase', 'Auth', 'Private storage', 'Row Level Security', 'Back-office copy'] },
      { name: 'External systems', items: ['PerfectGym API', 'Adyen', 'GoCardless (SEPA)', 'WhatsApp Cloud API', 'Claude · Anthropic', 'Apple Health · Health Connect', 'Web Push'] },
    ],
    parts: [
      { t: 'Astro', role: 'The public website', d: 'HTML pages generated ahead of time and per-component CSS: they arrive ready, index well and open instantly. JavaScript only where it’s really needed, like forms and the assistant.' },
      { t: 'Next.js + React', role: 'The staff CRM', d: 'Pages are assembled on the server with the data already in; React handles the interactive parts. A middleware checks session and permissions on every request, and roles decide which sections show. Hosted on Vercel.' },
      { t: 'Expo + React Native', role: 'The member app', d: 'One TypeScript codebase for iOS, Android and web. With Expo Router every file is a screen and a deep link. Native modules for HealthKit, Health Connect, notifications, camera and files; builds and updates with EAS.' },
      { t: 'Supabase · Postgres', role: 'The core', d: 'Database, authentication, files and row-level access rules. The schema lives in 483 versioned migrations: every change is code, reviewable and repeatable. Key reads are SQL functions: CRM and app call the same one, so they say the same thing.' },
      { t: 'Edge Functions', role: 'Logic and connections', d: '77 TypeScript functions running next to the database. The app talks to them, never straight to the back office: booking, paying, syncing, receiving payment and WhatsApp webhooks.' },
      { t: 'The back-office copy', role: 'Fast and independent', d: 'PerfectGym webhooks and scheduled syncs copy contracts, payments, bookings and check-ins. A read takes milliseconds and works even when the back office is slow or down.' },
      { t: 'Automation', role: 'What happens on its own', d: '23 jobs in the database and 11 on Vercel: booking reminders every 5 minutes, expiring medical-certificate alerts, emails after the first visits, member status, refreshed dashboards, failed payments.' },
      { t: 'AI', role: 'Assistant and WhatsApp', d: 'The app assistant and the WhatsApp agent use a Claude model with the club’s information as context. They don’t make things up: they point to the right form or hand over to a person.' },
    ],
    numbers: [
      { v: '77', l: 'Edge Functions' },
      { v: '483', l: 'Database migrations' },
      { v: '34', l: 'Scheduled jobs' },
      { v: '3', l: 'Platforms from one codebase: iOS, Android, web' },
    ],
  },
  ronchiverdi: {
    intro:
      'A static website with an editor for the office, a Next.js CRM and a bridge to the back office that runs inside the club, on its Windows server. No existing tool was replaced: it was connected.',
    layers: [
      { name: 'Interfaces', items: ['Website · Astro + TinaCMS', 'CRM · Next.js + React', 'Installable app (PWA)', 'Push notifications'] },
      { name: 'Logic', items: ['API routes + Vercel Cron', 'Edge Functions · memberships, vouchers, email', 'PowerShell script on the server'] },
      { name: 'Data', items: ['Postgres on Supabase', 'Single customer record', 'Memberships from the back office'] },
      { name: 'External systems', items: ['Back-office SQL Server', 'Email', 'Sports federation memberships'] },
    ],
    parts: [
      { t: 'Astro + TinaCMS', role: 'The website', d: 'Static site: ready HTML, light CSS, content in Markdown files the office edits from a visual editor without touching code. Every change is saved in the project history.' },
      { t: 'Next.js', role: 'The CRM', d: 'Pages assembled on the server with the data ready. It installs on phones and tablets like an app, with its own icon and push notifications.' },
      { t: 'PowerShell + SQL Server', role: 'The bridge to the back office', d: 'A script scheduled with Windows Task Scheduler, on the back office’s own server. It reads with a read-only SQL user and sends what’s new to Supabase over outbound HTTPS only: no VPN, no open ports. Re-run it and it creates no duplicates.' },
      { t: 'Supabase · Postgres', role: 'One customer record', d: 'Website requests, deals and back-office sales all attach to the same person. The schema lives in 123 versioned SQL scripts.' },
      { t: 'Automation', role: 'What happens on its own', d: 'Appointment reminders every 5 minutes, an evening management report, federation memberships and medical-check vouchers generated without anyone stepping in.' },
    ],
    numbers: [
      { v: '0', l: 'Open ports on the club’s server' },
      { v: 'R/O', l: 'Read-only SQL user' },
      { v: '5 min', l: 'Reminder cycle' },
      { v: '123', l: 'Versioned SQL scripts' },
    ],
  },
  'tennis-club-ambrosiano': {
    intro:
      'The website stays static and very fast; the office works in a separate CRM with logins and live data. Two projects, one database: it’s the database that holds the people together.',
    layers: [
      { name: 'Interfaces', items: ['Website · Astro + TinaCMS', 'Office CRM · Next.js + React', 'Push notifications'] },
      { name: 'Logic', items: ['n8n · form flows', 'Normalisation and de-duplication', 'Edge Functions · back-office sync', 'Vercel Cron'] },
      { name: 'Data', items: ['Postgres on Supabase', 'People · opportunities · events', 'Row Level Security'] },
      { name: 'External systems', items: ['PerfectGym API', 'Email', 'Previous CRM archive'] },
    ],
    parts: [
      { t: 'Astro', role: 'The website', d: 'Generated ahead of time: no server to maintain, ready HTML pages, minimal CSS. Content is updated from a visual editor.' },
      { t: 'Why two applications', role: 'Website and CRM apart', d: 'The website is static; the CRM needs logins and data that’s current to the second. Keeping them apart, on the same database, keeps the website simple and leaves the CRM free to grow.' },
      { t: 'De-duplication', role: 'One row per person', d: 'Rules on normalised name, email and phone decide when two rows are the same person. Requests stay many, the person is one; opportunities belong to the person.' },
      { t: 'n8n', role: 'Automation', d: 'Website forms go through n8n flows that normalise them and write them to the right tables, with nobody in between.' },
      { t: 'Supabase + RLS', role: 'Who sees what', d: 'Access rules live in the database, row by row: every operator sees what their role allows, whatever page they use.' },
    ],
    numbers: [
      { v: '1', l: 'Database for website and CRM' },
      { v: '353', l: 'Past events imported' },
      { v: '192', l: 'Duplicates recognised' },
      { v: '18', l: 'Database migrations' },
    ],
  },
  'passion-fitness': {
    intro:
      'The back office copied into Supabase, a Next.js CRM built on top, and an Astro website pointing to where people actually book and pay. The same setup born for Athlon, brought here.',
    layers: [
      { name: 'Interfaces', items: ['Website · Astro + MDX', 'Staff CRM · Next.js + React', 'Website forms · Meta Lead Ads'] },
      { name: 'Logic', items: ['Edge Functions · sync, webhooks, leads', 'SQL functions for the numbers', 'n8n · referrals'] },
      { name: 'Data', items: ['Postgres on Supabase (London)', 'Back-office copy · 119 entities', 'CRM · leads, trials, renewals, tickets'] },
      { name: 'External systems', items: ['PerfectGym API', 'Airtable (migrated)', 'Meta Lead Ads'] },
    ],
    parts: [
      { t: 'Astro + MDX', role: 'The website', d: 'Blog and course pages written in MDX, images optimised at build time: the home page went from 45.49 MB to 4.93 MB.' },
      { t: 'The back-office copy', role: 'All of PerfectGym, in-house', d: 'Edge Functions download the PerfectGym API entity by entity with a cursor: if interrupted, they resume where they stopped. Webhooks keep the data fresh. First download: 1.4 million rows in 24 minutes.' },
      { t: 'Rules in the database', role: 'Numbers that don’t depend on who looks', d: 'What a membership, a renewal or a trial is: defined once, in SQL functions. Dashboard and CRM read the same rules.' },
      { t: 'From Airtable to the CRM', role: 'Migration without downtime', d: 'The Airtable CRM was moved into the database and kept automatically in sync throughout the switch: not a single day of downtime for staff.' },
      { t: 'Automatic leads', role: 'Nobody retypes', d: 'Website forms and Meta Lead Ads land in the CRM with a consultant assigned, and the customer record is created in PerfectGym too.' },
    ],
    numbers: [
      { v: '10', l: 'Edge Functions' },
      { v: '78', l: 'Database migrations' },
      { v: '119', l: 'Entities kept in sync' },
      { v: '1.4M', l: 'Rows in the first download' },
    ],
  },
};

export const tech: Record<Lang, Record<string, Tech>> = { it, en };

export const techUi: Record<Lang, Ui> = {
  it: { kicker: 'Come è fatto', title: 'Sotto il cofano.', layers: 'L’architettura, a strati', parts: 'I pezzi, uno per uno', numbers: 'In numeri' },
  en: { kicker: 'How it’s built', title: 'Under the hood.', layers: 'The architecture, layer by layer', parts: 'The pieces, one by one', numbers: 'In numbers' },
};

/* The stack explained simply, for the home page. */
export const stack: Record<Lang, { kicker: string; title: string; sub: string; layers: { name: string; d: string; items: { t: string; d: string }[] }[] }> = {
  it: {
    kicker: 'Come costruiamo',
    title: 'Lo stack, spiegato semplice.',
    sub: 'Ogni progetto è fatto a strati. Scegliamo la tecnologia di ogni strato in base a chi la userà, e li colleghiamo in modo che dicano tutti la stessa cosa.',
    layers: [
      {
        name: 'Interfacce',
        d: 'Quello che vedono clienti e operatori',
        items: [
          { t: 'HTML e CSS', d: 'La struttura e lo stile di ogni pagina. Puliti e leggeri: la velocità comincia qui.' },
          { t: 'Astro', d: 'Per i siti: pagine generate in anticipo, pronte da servire, ottime per Google.' },
          { t: 'React', d: 'I componenti interattivi: moduli, calendari, grafici, chat.' },
          { t: 'Next.js', d: 'Per CRM e gestionali: pagine dal server, login, ruoli e permessi.' },
          { t: 'React Native + Expo', d: 'Un codice solo per le app iOS, Android e web, pubblicate sugli store.' },
        ],
      },
      {
        name: 'Logica',
        d: 'Le regole del tuo processo',
        items: [
          { t: 'Edge Functions', d: 'Piccole funzioni TypeScript vicino al database: prenotare, pagare, sincronizzare.' },
          { t: 'Funzioni SQL', d: 'Le regole dei numeri scritte una volta: CRM, app e report leggono le stesse.' },
          { t: 'Automazioni', d: 'Job programmati, webhook e flussi n8n: le cose che devono succedere da sole.' },
          { t: 'AI', d: 'Assistenti con modelli Claude, che rispondono con le tue informazioni e passano la palla al team.' },
        ],
      },
      {
        name: 'Dati',
        d: 'Una fonte di verità',
        items: [
          { t: 'Supabase · Postgres', d: 'Database, accessi, file e regole di sicurezza riga per riga.' },
          { t: 'Migrazioni versionate', d: 'Ogni modifica al database è codice: si rivede, si ripete, si torna indietro.' },
          { t: 'Copia del gestionale', d: 'I dati del tuo software copiati e sempre aggiornati: letture istantanee.' },
        ],
      },
      {
        name: 'Integrazioni',
        d: 'Quello che hai già',
        items: [
          { t: 'API REST e webhook', d: 'Gestionali, pagamenti, WhatsApp, Meta, email: ci parliamo direttamente.' },
          { t: 'SQL Server', d: 'Anche il database su un server Windows in sede, in sola lettura, senza VPN.' },
          { t: 'Pagamenti', d: 'Stripe, Adyen, GoCardless: carte, SEPA, link per pagare.' },
          { t: 'Controllo accessi', d: 'Il telefono come tessera: pass in Apple Wallet e Google Wallet, lettori VTAP di Dot Origin.' },
        ],
      },
    ],
  },
  en: {
    kicker: 'How we build',
    title: 'The stack, explained simply.',
    sub: 'Every project is built in layers. We choose each layer’s technology for the people who will use it, and connect them so they all say the same thing.',
    layers: [
      {
        name: 'Interfaces',
        d: 'What customers and staff see',
        items: [
          { t: 'HTML & CSS', d: 'The structure and style of every page. Clean and light: speed starts here.' },
          { t: 'Astro', d: 'For websites: pages generated ahead of time, ready to serve, great for Google.' },
          { t: 'React', d: 'Interactive components: forms, calendars, charts, chat.' },
          { t: 'Next.js', d: 'For CRMs and back offices: server-rendered pages, logins, roles and permissions.' },
          { t: 'React Native + Expo', d: 'One codebase for iOS, Android and web apps, published on the stores.' },
        ],
      },
      {
        name: 'Logic',
        d: 'Your process’s rules',
        items: [
          { t: 'Edge Functions', d: 'Small TypeScript functions next to the database: booking, paying, syncing.' },
          { t: 'SQL functions', d: 'The rules behind the numbers, written once: CRM, app and reports read the same ones.' },
          { t: 'Automation', d: 'Scheduled jobs, webhooks and n8n flows: the things that must happen on their own.' },
          { t: 'AI', d: 'Assistants built on Claude models that answer with your information and hand over to your team.' },
        ],
      },
      {
        name: 'Data',
        d: 'One source of truth',
        items: [
          { t: 'Supabase · Postgres', d: 'Database, logins, files and row-level security rules.' },
          { t: 'Versioned migrations', d: 'Every database change is code: reviewed, repeatable, reversible.' },
          { t: 'Back-office copy', d: 'Your software’s data copied and always up to date: instant reads.' },
        ],
      },
      {
        name: 'Integrations',
        d: 'What you already have',
        items: [
          { t: 'REST APIs & webhooks', d: 'Back offices, payments, WhatsApp, Meta, email: we talk to them directly.' },
          { t: 'SQL Server', d: 'Even an on-site database on a Windows server, read-only, no VPN.' },
          { t: 'Payments', d: 'Stripe, Adyen, GoCardless: cards, SEPA, pay-by-link.' },
          { t: 'Access control', d: 'The phone as a badge: Apple Wallet and Google Wallet passes, Dot Origin VTAP readers.' },
        ],
      },
    ],
  },
};

/* Access control with a pass in the phone's Wallet: a section of the Technology page. */
export type Access = {
  kicker: string;
  title: string;
  lead: string;
  /** Alt text of the two partner images (public/images/partners). */
  partners: { dot: string; vtap: string };
  /** The chain, left to right: pass, reader, system, gate. */
  chain: { t: string; d: string }[];
  how: string;
  steps: { t: string; role: string; d: string }[];
  note: string;
};

export const access: Record<Lang, Access> = {
  it: {
    kicker: 'Controllo accessi',
    title: 'Il telefono al posto del badge.',
    lead: 'Un pass salvato in Apple Wallet o Google Wallet, un lettore accanto alla porta: avvicini il telefono e il varco si apre. Lavoriamo con Dot Origin, che produce i lettori VTAP compatibili con entrambi i Wallet, e siamo partner per l’emissione dei pass virtuali.',
    partners: { dot: 'Dot Origin', vtap: 'Lettore VTAP di Dot Origin' },
    chain: [
      { t: 'Il pass', d: 'Nel Wallet dello smartphone' },
      { t: 'Il lettore', d: 'VTAP di Dot Origin' },
      { t: 'Il sistema', d: 'Decide chi può entrare' },
      { t: 'Il varco', d: 'Porta, tornello, check-in' },
    ],
    how: 'Come funziona un pass sul tuo smartphone',
    steps: [
      {
        t: 'Lo salvi',
        role: 'Un tocco, nessuna app',
        d: 'Dopo l’iscrizione o l’acquisto emettiamo il tuo pass personale e te lo mandiamo con un link o un QR code. Tocchi «Aggiungi al Wallet»: si salva in Apple Wallet su iPhone o in Google Wallet su Android, accanto alle tue carte. Dentro c’è un identificativo firmato da chi lo emette, custodito dal telefono.',
      },
      {
        t: 'Lo avvicini',
        role: 'Pochi centimetri, via NFC',
        d: 'Lettore e telefono si parlano con la stessa tecnologia dei pagamenti contactless, e al telefono non serve la connessione. Di solito non devi aprire nulla: il pass lo presenta il telefono. A seconda di come lo configuriamo, può bastare il telefono bloccato oppure può chiedere Face ID, impronta o codice.',
      },
      {
        t: 'Il sistema decide',
        role: 'La regola sta nel sistema, non nel pass',
        d: 'Il lettore passa l’identificativo al sistema di controllo accessi: i VTAP si collegano ai controllori di porte e tornelli già in uso (Wiegand, OSDP/RS-485, USB). Il sistema verifica che l’abbonamento sia valido, l’orario, la prenotazione, e apre il varco o registra il check-in.',
      },
      {
        t: 'Resta aggiornato',
        role: 'Niente tessere da ritirare',
        d: 'Quando l’abbonamento si rinnova, scade o cambia, il pass si aggiorna o si revoca da remoto, direttamente sul telefono, senza ritirare né stampare nulla. Se il telefono si perde, basta disattivare quel pass.',
      },
    ],
    note: 'Apple Wallet, Google Wallet e VTAP sono marchi dei rispettivi proprietari.',
  },
  en: {
    kicker: 'Access control',
    title: 'Your phone instead of a badge.',
    lead: 'A pass saved in Apple Wallet or Google Wallet, a reader next to the door: hold your phone up and the gate opens. We work with Dot Origin, which makes the VTAP readers compatible with both Wallets, and we are a partner for issuing the virtual passes.',
    partners: { dot: 'Dot Origin', vtap: 'Dot Origin VTAP reader' },
    chain: [
      { t: 'The pass', d: 'In the phone’s Wallet' },
      { t: 'The reader', d: 'Dot Origin VTAP' },
      { t: 'The system', d: 'Decides who gets in' },
      { t: 'The gate', d: 'Door, turnstile, check-in' },
    ],
    how: 'How a pass on your smartphone works',
    steps: [
      {
        t: 'You save it',
        role: 'One tap, no app',
        d: 'After you sign up or buy, we issue your personal pass and send it with a link or QR code. Tap “Add to Wallet”: it is saved in Apple Wallet on iPhone or Google Wallet on Android, next to your cards. Inside is an identifier signed by whoever issues it, kept safe by the phone.',
      },
      {
        t: 'You hold it up',
        role: 'A few centimetres, over NFC',
        d: 'Reader and phone talk using the same technology as contactless payments, and the phone needs no connection. Usually you open nothing: the phone presents the pass itself. Depending on how we configure it, a locked phone may be enough, or it may ask for Face ID, a fingerprint or a passcode.',
      },
      {
        t: 'The system decides',
        role: 'The rule lives in the system, not in the pass',
        d: 'The reader passes the identifier to the access control system: VTAP readers connect to the door and turnstile controllers already in use (Wiegand, OSDP/RS-485, USB). The system checks the membership is valid, the time and the booking, then opens the gate or logs the check-in.',
      },
      {
        t: 'It stays up to date',
        role: 'No cards to collect',
        d: 'When a membership renews, expires or changes, the pass is updated or revoked remotely, right on the phone, with nothing to collect or print. If a phone is lost, that pass is simply switched off.',
      },
    ],
    note: 'Apple Wallet, Google Wallet and VTAP are trademarks of their respective owners.',
  },
};

/* The systems we connect to, with the way we connect: a section of the Technology page. */
export type Integration = {
  id: string;
  name: string;
  /** Who it belongs to, one line under the name. */
  by?: Record<Lang, string>;
  via: 'api' | 'sql';
  /** The official logo file in public/images/partners. Without one the tile shows the initial. */
  logo?: { src: string; w: number; h: number; /** The logo already spells the name. */ wordmark?: boolean; /** Drawn for a light ground (dark ink): shown on a light plate. */ onLight?: boolean };
};

export const integrationList: Integration[] = [
  { id: 'perfectgym', name: 'PerfectGym', by: { it: 'Parte di Sport Alliance', en: 'Part of Sport Alliance' }, via: 'api', logo: { src: 'images/partners/perfectgym.svg', w: 515, h: 472 } },
  { id: 'abc-glofox', name: 'ABC Glofox', by: { it: 'Gruppo ABC Fitness', en: 'ABC Fitness group' }, via: 'api', logo: { src: 'images/partners/abc-glofox.png', w: 507, h: 160, wordmark: true, onLight: true } },
  { id: 'sportrick', name: 'SportRick', by: { it: 'Prodotto Zucchetti', en: 'A Zucchetti product' }, via: 'api', logo: { src: 'images/partners/sportrick-white.svg', w: 305, h: 61, wordmark: true } },
  { id: 'gymnasium', name: 'InforYou Gymnasium', by: { it: 'TeamSystem', en: 'TeamSystem' }, via: 'sql', logo: { src: 'images/partners/teamsystem.png', w: 120, h: 120 } },
  { id: 'technogym', name: 'Technogym', by: { it: 'Anche Technogym App', en: 'Technogym App too' }, via: 'api', logo: { src: 'images/partners/technogym.png', w: 372, h: 103, wordmark: true } },
];

export const integrations: Record<Lang, { kicker: string; title: string; lead: string; via: { api: string; sql: string }; note: string }> = {
  it: {
    kicker: 'Sistemi che integriamo',
    title: 'Il software che hai già, collegato.',
    lead: 'Non serve cambiare gestionale: ci colleghiamo a quello che usi e i dati arrivano nello stesso posto. Con la maggior parte di questi sistemi passiamo dalle loro API; con InforYou Gymnasium la connessione la facciamo dal server SQL.',
    via: { api: 'Via API', sql: 'Da server SQL' },
    note: 'Marchi e loghi appartengono ai rispettivi proprietari.',
  },
  en: {
    kicker: 'Systems we integrate',
    title: 'The software you already have, connected.',
    lead: 'No need to change your back office: we connect to what you use and the data lands in the same place. With most of these systems we go through their APIs; with InforYou Gymnasium the connection is made from the SQL server.',
    via: { api: 'Via API', sql: 'From the SQL server' },
    note: 'Brands and logos belong to their respective owners.',
  },
};
