// Real screens of the projects, captured from the public sites and apps
// (public/images/real/<case>/). Desktop captures are 1600×1000 (16:10), phone
// captures 780×1328. Anything behind a login (CRM dashboards, the member app
// once signed in) is not here: those come from screenshots the client supplies.

import type { Lang } from './content';

export type RealShot = {
  src: string; // relative to images/real/
  kind: 'browser' | 'phone';
  url?: string; // shown in the browser bar
  t: string;
  d: string;
};

const it: Record<string, RealShot[]> = {
  athlon: [
    { src: 'athlon/d-site-home.webp', kind: 'browser', url: 'athlonroma.it', t: 'Il sito pubblico', d: 'La home di athlonroma.it: prova, iscrizione e l’assistente in un tocco.' },
    { src: 'athlon/m-app-accesso.webp', kind: 'phone', t: 'L’app del socio', d: 'Si entra con l’email, senza password: prenotazioni, workout, abbonamenti e pagamenti in un posto solo.' },
    { src: 'athlon/d-planning.webp', kind: 'browser', url: 'athlonroma.it/planning', t: 'Il planning della settimana', d: '165 lezioni, lette dal gestionale: le stesse che si prenotano dall’app.' },
    { src: 'athlon/m-app-guest-pass.webp', kind: 'phone', t: 'Il Guest Pass dall’app', d: 'Sette giorni di prova: email, consensi, e il link arriva da solo.' },
    { src: 'athlon/d-assistente.webp', kind: 'browser', url: 'athlonroma.it', t: 'L’assistente virtuale', d: 'Chiede l’email per riconoscere chi scrive e risponde con le voci del sito.' },
    { src: 'athlon/d-prova.webp', kind: 'browser', url: 'athlonroma.it/prova', t: 'La prova di 7 giorni', d: 'Il modulo del Guest Pass Premium: compilato dal sito, arriva nel CRM già deduplicato.' },
    { src: 'athlon/m-planning.webp', kind: 'phone', t: 'Il planning da telefono', d: 'Le lezioni della settimana con «Chatta con noi» sempre a portata di pollice.' },
    { src: 'athlon/d-abbonamenti.webp', kind: 'browser', url: 'athlonroma.it/abbonamenti', t: 'Abbonamenti e accessi', d: 'Iscrizione online immediata, sospensioni illimitate, accesso da app.' },
    { src: 'athlon/d-crm-login.webp', kind: 'browser', url: 'crm.athlonroma.it', t: 'L’ingresso del CRM', d: 'Il pannello dello staff: ruoli, permessi, timbrature, ticket. Dentro, i dati dei soci.' },
  ],
  ronchiverdi: [
    { src: 'ronchiverdi/d-site-home.webp', kind: 'browser', url: 'ronchiverdi.it', t: 'Il sito del club', d: 'Tennis, padel, nuoto, fitness e Young School: la home con «Prenota un tour».' },
    { src: 'ronchiverdi/m-planning.webp', kind: 'phone', t: 'Gli orari da telefono', d: 'Le aree ad accesso libero e i loro orari, in una carta per area.' },
    { src: 'ronchiverdi/d-planning.webp', kind: 'browser', url: 'ronchiverdi.it/planning', t: 'Tutti i planning', d: 'Orari e palinsesti di ogni area del club, stampabili in PDF.' },
    { src: 'ronchiverdi/d-planning-corsi.webp', kind: 'browser', url: 'ronchiverdi.it/planning', t: 'Il palinsesto dei corsi', d: 'Giorno per giorno, un tocco su una lezione apre la sua descrizione.' },
    { src: 'ronchiverdi/m-iscrizione.webp', kind: 'phone', t: 'L’iscrizione alla scuola nuoto', d: 'Quote, procedura e contatti: la richiesta arriva nel CRM come trattativa.' },
    { src: 'ronchiverdi/d-iscrizione.webp', kind: 'browser', url: 'ronchiverdi.it/attivita/scuola-nuoto/iscrizione', t: 'Le iscrizioni ai corsi', d: 'Una pagina per attività, con le modalità di iscrizione e il listino.' },
    { src: 'ronchiverdi/d-abbonamenti.webp', kind: 'browser', url: 'ronchiverdi.it/abbonamenti', t: 'Gli abbonamenti', d: 'Quattro combinazioni di attività, con la quota che si costruisce sull’età e sulla durata.' },
    { src: 'ronchiverdi/d-crm-login.webp', kind: 'browser', url: 'crm.ronchiverdi.it', t: 'L’ingresso del CRM', d: 'Trattative, agenda, impegni di oggi e i dati del gestionale, dietro il login dello staff.' },
  ],
  'passion-fitness': [
    { src: 'passion-fitness/d-site-home.webp', kind: 'browser', url: 'passionfitness.it', t: 'Il sito', d: 'La home: «Prova Passion Fitness» e «Sono già iscritto», che porta dove si prenota e si paga.' },
    { src: 'passion-fitness/m-orari.webp', kind: 'phone', t: 'Gli orari da telefono', d: 'I turni del Reformer Club, giorno per giorno.' },
    { src: 'passion-fitness/d-orari-reformer.webp', kind: 'browser', url: 'passionfitness.it/orari-corsi', t: 'Il planning del Reformer', d: 'Sette turni al giorno, pochi posti: il planning aggiornato dal sito.' },
    { src: 'passion-fitness/d-orari-energy.webp', kind: 'browser', url: 'passionfitness.it/orari-corsi', t: 'I corsi Energy', d: 'Hyrox, Met-Con, Pump: la sala ad alta intensità, dalle 7 alle 20:30.' },
    { src: 'passion-fitness/d-abbonamenti.webp', kind: 'browser', url: 'passionfitness.it/abbonamenti', t: 'Gli abbonamenti', d: 'Annuali, mensili o singolo accesso, con «Iscriviti online» che porta al checkout del gestionale.' },
    { src: 'passion-fitness/d-crm-login.webp', kind: 'browser', url: 'crm.passionfitness.it', t: 'L’ingresso del CRM', d: 'Lead, prove, rinnovi, debitori e la dashboard abbonamenti, dietro il login dello staff.' },
  ],
  'tennis-club-ambrosiano': [
    { src: 'tennis-club-ambrosiano/d-crm-login.webp', kind: 'browser', url: 'CRM TCA', t: 'L’ingresso del CRM', d: 'Persone, opportunità, agenda e task della segreteria, dietro il login.' },
  ],
};

const en: Record<string, RealShot[]> = {
  athlon: [
    { src: 'athlon/d-site-home.webp', kind: 'browser', url: 'athlonroma.it', t: 'The public website', d: 'The athlonroma.it home: trial, sign-up and the assistant one tap away.' },
    { src: 'athlon/m-app-accesso.webp', kind: 'phone', t: 'The member app', d: 'Sign in with your email, no password: bookings, workouts, memberships and payments in one place.' },
    { src: 'athlon/d-planning.webp', kind: 'browser', url: 'athlonroma.it/planning', t: 'The weekly timetable', d: '165 classes, read from the back office: the same ones you book from the app.' },
    { src: 'athlon/m-app-guest-pass.webp', kind: 'phone', t: 'The Guest Pass from the app', d: 'Seven days to try: email, consents, and the link arrives on its own.' },
    { src: 'athlon/d-assistente.webp', kind: 'browser', url: 'athlonroma.it', t: 'The virtual assistant', d: 'Asks for an email to recognise who’s writing, and answers with the website’s own content.' },
    { src: 'athlon/d-prova.webp', kind: 'browser', url: 'athlonroma.it/prova', t: 'The 7-day trial', d: 'The Premium Guest Pass form: filled in on the site, it lands in the CRM already de-duplicated.' },
    { src: 'athlon/m-planning.webp', kind: 'phone', t: 'The timetable on a phone', d: 'The week’s classes with “Chat with us” always within thumb’s reach.' },
    { src: 'athlon/d-abbonamenti.webp', kind: 'browser', url: 'athlonroma.it/abbonamenti', t: 'Memberships and access', d: 'Instant online sign-up, unlimited suspensions, access from the app.' },
    { src: 'athlon/d-crm-login.webp', kind: 'browser', url: 'crm.athlonroma.it', t: 'The CRM entrance', d: 'The staff panel: roles, permissions, time clock, tickets. Inside, the members’ data.' },
  ],
  ronchiverdi: [
    { src: 'ronchiverdi/d-site-home.webp', kind: 'browser', url: 'ronchiverdi.it', t: 'The club website', d: 'Tennis, padel, swimming, fitness and Young School: the home with “Book a tour”.' },
    { src: 'ronchiverdi/m-planning.webp', kind: 'phone', t: 'Opening hours on a phone', d: 'The free-access areas and their hours, one card per area.' },
    { src: 'ronchiverdi/d-planning.webp', kind: 'browser', url: 'ronchiverdi.it/planning', t: 'All the timetables', d: 'Hours and schedules for every area of the club, printable as PDF.' },
    { src: 'ronchiverdi/d-planning-corsi.webp', kind: 'browser', url: 'ronchiverdi.it/planning', t: 'The class schedule', d: 'Day by day; a tap on a class opens its description.' },
    { src: 'ronchiverdi/m-iscrizione.webp', kind: 'phone', t: 'Swim school enrolment', d: 'Fees, procedure and contacts: the request lands in the CRM as a deal.' },
    { src: 'ronchiverdi/d-iscrizione.webp', kind: 'browser', url: 'ronchiverdi.it/attivita/scuola-nuoto/iscrizione', t: 'Course enrolments', d: 'One page per activity, with how to enrol and the price list.' },
    { src: 'ronchiverdi/d-abbonamenti.webp', kind: 'browser', url: 'ronchiverdi.it/abbonamenti', t: 'Memberships', d: 'Four activity combinations, with a fee built on age and duration.' },
    { src: 'ronchiverdi/d-crm-login.webp', kind: 'browser', url: 'crm.ronchiverdi.it', t: 'The CRM entrance', d: 'Deals, calendar, today’s tasks and the back-office data, behind the staff login.' },
  ],
  'passion-fitness': [
    { src: 'passion-fitness/d-site-home.webp', kind: 'browser', url: 'passionfitness.it', t: 'The website', d: 'The home: “Try Passion Fitness” and “Already a member”, which leads to where you book and pay.' },
    { src: 'passion-fitness/m-orari.webp', kind: 'phone', t: 'Timetable on a phone', d: 'The Reformer Club slots, day by day.' },
    { src: 'passion-fitness/d-orari-reformer.webp', kind: 'browser', url: 'passionfitness.it/orari-corsi', t: 'The Reformer timetable', d: 'Seven slots a day, few places: the timetable kept up to date from the site.' },
    { src: 'passion-fitness/d-orari-energy.webp', kind: 'browser', url: 'passionfitness.it/orari-corsi', t: 'The Energy classes', d: 'Hyrox, Met-Con, Pump: the high-intensity room, 7 am to 8:30 pm.' },
    { src: 'passion-fitness/d-abbonamenti.webp', kind: 'browser', url: 'passionfitness.it/abbonamenti', t: 'Memberships', d: 'Annual, monthly or single access, with “Sign up online” leading to the back-office checkout.' },
    { src: 'passion-fitness/d-crm-login.webp', kind: 'browser', url: 'crm.passionfitness.it', t: 'The CRM entrance', d: 'Leads, trials, renewals, debtors and the membership dashboard, behind the staff login.' },
  ],
  'tennis-club-ambrosiano': [
    { src: 'tennis-club-ambrosiano/d-crm-login.webp', kind: 'browser', url: 'CRM TCA', t: 'The CRM entrance', d: 'People, opportunities, calendar and the office’s tasks, behind the login.' },
  ],
};

export const real: Record<Lang, Record<string, RealShot[]>> = { it, en };

export const realUi: Record<Lang, { kicker: string; title: string; sub: string; badge: string; open: string; close: string; prev: string; next: string }> = {
  it: { kicker: 'Dal vivo', title: 'Schermate reali.', sub: 'Il sito, l’app e gli strumenti così come li usano clienti e staff oggi. Tocca una schermata per ingrandirla.', badge: 'Schermata reale', open: 'Ingrandisci', close: 'Chiudi', prev: 'Precedente', next: 'Successiva' },
  en: { kicker: 'Live', title: 'Real screens.', sub: 'The website, the app and the tools as customers and staff use them today. Tap a screen to enlarge it.', badge: 'Real screen', open: 'Enlarge', close: 'Close', prev: 'Previous', next: 'Next' },
};
