// The Athlon app demo account, shown on the Athlon case page (`/progetti/athlon#prova-app`).
// One account for everyone: whoever signs in resets what the previous visitor did
// (server side, APP-ATHLON note 314). The code is public on purpose: the demo is open,
// and the visitor leaves their email inside the app. If the code is renewed
// (`demo_invito_crea(..., 'demo@ready2digital.it')`), change it here.

import type { Lang } from './content';

export const DEMO_ANCHOR = 'prova-app';

export const demoAccount = {
  id: 'demo@ready2digital.it',
  code: '63986514',
  web: 'https://app.athlonroma.it',
  ios: 'https://apps.apple.com/it/app/athlon-club/id1584157295',
  android: 'https://play.google.com/store/apps/details?id=it.athlonroma.app',
};

export const demoUi: Record<
  Lang,
  {
    kicker: string;
    title: string;
    lead: string;
    idLabel: string;
    codeLabel: string;
    copy: string;
    copied: string;
    getTitle: string;
    web: string;
    webSub: string;
    ios: string;
    iosSub: string;
    android: string;
    androidSub: string;
    stepsTitle: string;
    steps: string[];
    scenariosTitle: string;
    scenarios: { t: string; d: string }[];
    notes: string[];
    heroLink: string;
    shotAlt: string;
    shotCaption: string;
  }
> = {
  it: {
    kicker: 'Prova l’app',
    title: 'Entra nell’app di Athlon.',
    lead: 'Un account di prova sull’app vera, quella che i soci usano ogni giorno. Scegli chi vuoi essere e guardala come un cliente del club, fino alla firma del contratto.',
    idLabel: 'ID',
    codeLabel: 'Codice',
    copy: 'Copia',
    copied: 'Copiato',
    getTitle: 'Dove provarla',
    web: 'Dal browser',
    webSub: 'app.athlonroma.it',
    ios: 'iPhone',
    iosSub: 'App Store · «Athlon Club»',
    android: 'Android',
    androidSub: 'Google Play · «Athlon Club»',
    stepsTitle: 'Come funziona',
    steps: [
      'Apri l’app dal browser o scaricala dallo store.',
      'Nella schermata d’accesso scrivi l’ID, tocca «Continua» e inserisci il codice.',
      'Lascia nome ed email: ti presentiamo il progetto in due righe.',
      'Scegli uno scenario ed entra. Dalla striscia «Account di prova» in alto lo cambi con «Cambia», o finisci con «Esci».',
    ],
    scenariosTitle: 'Cinque scenari',
    scenarios: [
      { t: 'Non ancora iscritto', d: 'Scegli un abbonamento e arrivi fino alla firma del contratto.' },
      { t: 'Iscritto con abbonamento attivo', d: 'Home, prenotazioni, Athlon Health System, documenti.' },
      { t: 'Genitore, figli senza abbonamento', d: 'Le sezioni Famiglia e Junior, l’iscrizione di un figlio.' },
      { t: 'Genitore, figlio con corso attivo', d: 'Junior, lezioni e pagamenti del bambino, i brevetti di nuoto.' },
      { t: 'Famiglia con abbonamenti attivi', d: 'Tutta l’app per una famiglia al completo.' },
    ],
    notes: [
      'Il pagamento si vede ma non parte: nessun addebito, mai.',
      'Quando cambi scenario o esci, tutto quello che hai fatto si cancella.',
      'L’account è uno per tutti: se qualcun altro entra mentre lo usi, la tua prova riparte da capo.',
    ],
    heroLink: 'Prova l’app',
    shotAlt: 'La Home dell’app Athlon Club: il saluto, gli avvisi del club, l’orario di oggi e le notifiche.',
    shotCaption: 'La Home dell’app. Dati di esempio: nella demo vedi quelli dello scenario che scegli.',
  },
  en: {
    kicker: 'Try the app',
    title: 'Step inside the Athlon app.',
    lead: 'A demo account on the real app, the one members use every day. Pick who you want to be and see it as a club customer would, all the way to signing the contract.',
    idLabel: 'ID',
    codeLabel: 'Code',
    copy: 'Copy',
    copied: 'Copied',
    getTitle: 'Where to try it',
    web: 'In the browser',
    webSub: 'app.athlonroma.it',
    ios: 'iPhone',
    iosSub: 'App Store · “Athlon Club”',
    android: 'Android',
    androidSub: 'Google Play · “Athlon Club”',
    stepsTitle: 'How it works',
    steps: [
      'Open the app in your browser or download it from the store.',
      'On the sign-in screen type the ID, tap “Continue” and enter the code.',
      'Leave your name and email: we introduce the project in a couple of lines.',
      'Pick a scenario and go in. The “Test account” strip at the top lets you switch with “Change”, or finish with “Leave”.',
    ],
    scenariosTitle: 'Five scenarios',
    scenarios: [
      { t: 'Not a member yet', d: 'Pick a membership and go as far as signing the contract.' },
      { t: 'Member with an active membership', d: 'Home, bookings, Athlon Health System, documents.' },
      { t: 'Parent, children with no membership', d: 'The Family and Junior sections, enrolling a child.' },
      { t: 'Parent, child with an active course', d: 'Junior, the child’s lessons and payments, swimming badges.' },
      { t: 'Family with active memberships', d: 'The whole app for a full family.' },
    ],
    notes: [
      'Payment is shown but never goes through: nothing is ever charged.',
      'When you change scenario or exit, everything you did is erased.',
      'One account for everyone: if someone else signs in while you use it, your session starts over.',
    ],
    heroLink: 'Try the app',
    shotAlt: 'The Athlon Club app home: the greeting, club notices, today’s opening hours and notifications.',
    shotCaption: 'The app home. Sample data: in the demo you see the scenario you pick.',
  },
};
