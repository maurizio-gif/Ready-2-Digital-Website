// The four case-study pages. Facts come from the projects themselves; the
// screens shown as "extracts" are rebuilt with sample, anonymised data (names,
// amounts and counts inside the mock screens are illustrative, and the page says
// so). Real figures are only the ones in `metrics`.

import type { Lang } from './content';

export type Extract =
  | { kind: 'kpi'; title: string; text: string; url: string; tiles: { l: string; v: number; suf?: string; d?: string }[]; series: number[]; seriesLabel: string; funnel: { l: string; v: number }[] }
  | { kind: 'phone'; title: string; text: string; hello: string; score: string; next: string; nextClass: string; nextWhen: string; badge: string; tabs: string[] }
  | { kind: 'resolve'; title: string; text: string; url: string; head: string[]; rows: { n: string; what: string; amt: string }[]; from: string; to: string; counter: string }
  | { kind: 'chat'; title: string; text: string; who: string; status: string; msgs: { me?: boolean; ai?: boolean; team?: boolean; t: string }[] }
  | { kind: 'kiosk'; title: string; text: string; steps: string[]; plan: string; price: string; qr: string }
  | { kind: 'alert'; title: string; text: string; url: string; rows: { n: string; ch: string }[]; take: string; taken: string; ago: string }
  | { kind: 'flow'; title: string; text: string; nodes: { t: string; s: string }[]; counter: string; count: number }
  | { kind: 'agenda'; title: string; text: string; url: string; items: { h: string; t: string; s: string; tag: string }[]; done: string }
  | { kind: 'merge'; title: string; text: string; records: { src: string; f: string[] }[]; merged: { src: string; f: string[] }; label: string }
  | { kind: 'timeline'; title: string; text: string; url: string; person: string; meta: string; events: { d: string; t: string; s: string }[] }
  | { kind: 'bars'; title: string; text: string; url: string; tiles: { l: string; v: number; suf?: string; d?: string }[]; months: string[]; a: number[]; b: number[]; legend: [string, string] }
  | { kind: 'mirror'; title: string; text: string; tables: { n: string; rows: number }[]; totalLabel: string; total: number; time: string }
  | { kind: 'weight'; title: string; text: string; before: string; after: string; beforeV: number; afterV: number };

export type Case = {
  slug: string;
  client: string;
  sector: string;
  logo: string;
  img: string;
  title: string;
  intro: string;
  challenge: string;
  approach: string;
  built: string[];
  metrics: { v: string; l: string }[];
  stack: string[];
  extracts: Extract[];
  dots: [string, string];
};

const MONTHS_IT = ['Nov', 'Dic', 'Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott'];
const MONTHS_EN = ['Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'];

const it: Case[] = [
  {
    slug: 'athlon',
    client: 'Athlon Club 4.0',
    sector: 'Club sportivo multi-attività · Roma',
    logo: 'images/work/logos/athlon-mark.svg',
    img: 'images/work/athlon.jpg',
    title: 'Un club del 1973, digitalizzato dall’interno.',
    intro: 'Nuoto, fitness, ghiaccio e oltre cinquant’anni di storia a Roma Nord. Athlon è il posto dove il metodo Ready2Digital è nato: ogni strumento è stato prima un problema vissuto al banco, poi un software.',
    challenge: 'Iscrizioni su carta, richieste sparse fra reception, telefono e WhatsApp, un gestionale che non parlava con nient’altro. Ogni nuovo canale aggiungeva un pezzo d’informazione che nessuno ricomponeva: nessuno poteva dire con certezza chi fosse un’opportunità e chi un cliente già sistemato.',
    approach: 'Il gestionale è rimasto. Lo copiamo, sincronizzato, in un database nostro e sopra costruiamo tutto il resto: sito, CRM, app, automazioni leggono la stessa fonte e dicono la stessa cosa sulla stessa persona. Sul gestionale si scrive solo quando serve davvero: prenotare, pagare, iscrivere.',
    built: [
      'Sito con assistente AI: ogni richiesta arriva nel CRM, già deduplicata',
      'CRM con ruoli, permessi, timbrature, ticket e registro operatori',
      'App clienti iOS e Android: prenotazioni, pagamenti, Junior, badge nel wallet',
      'Athlon Health System con Apple Salute e Health Connect',
      'WhatsApp Cloud API con agente AI e casella condivisa del desk',
      'Pagamenti con carta e SEPA, billing run, pagamenti falliti con link per pagare',
      'Totem in sede per la vendita assistita e il check-in',
      'Newsletter tracciate, notifiche push, registro giornaliero per la direzione',
    ],
    metrics: [
      { v: '570', l: 'Lead unici al mese' },
      { v: '2.281', l: 'Lead in quattro mesi' },
      { v: '400', l: 'Nuovi contratti nello stesso periodo' },
      { v: '100%', l: 'Iscrizioni digitali, firma compresa' },
    ],
    stack: ['Next.js', 'Expo', 'Supabase', 'PerfectGym API', 'WhatsApp Cloud API', 'Adyen', 'GoCardless', 'n8n', 'Web Push'],
    dots: ['Ogni canale è un punto.', 'Il CRM li collega in una persona sola.'],
    extracts: [
      {
        kind: 'kpi',
        title: 'Il cruscotto della direzione',
        text: 'Lead, prove, contratti e incassi letti dallo stesso database dell’app e del sito. La direzione guarda un numero solo, ed è lo stesso che vede il desk.',
        url: 'crm.club.it/dashboard',
        tiles: [
          { l: 'Lead questo mese', v: 571, d: '+18%' },
          { l: 'Prove attive', v: 84, d: '+9%' },
          { l: 'Nuovi contratti', v: 103, d: '+12%' },
          { l: 'Conversione', v: 31, suf: '%', d: '+3 pt' },
        ],
        series: [42, 55, 48, 61, 70, 66, 79, 88, 84, 97, 112, 128],
        seriesLabel: 'Lead per settimana',
        funnel: [
          { l: 'Lead', v: 100 },
          { l: 'Contattati', v: 78 },
          { l: 'Prova', v: 46 },
          { l: 'Iscritti', v: 31 },
        ],
      },
      {
        kind: 'phone',
        title: 'L’app del socio',
        text: 'Prenota le lezioni, paga, entra col badge nel wallet e segue il suo Athlon Health Score. Una web app oggi, la stessa base di codice per App Store e Google Play.',
        hello: 'Ciao Giulia',
        score: 'Health Score',
        next: 'La tua prossima lezione',
        nextClass: 'Acquagym',
        nextWhen: 'Domani · 18:30 · Vasca 2',
        badge: 'Badge di accesso',
        tabs: ['Home', 'Calendario', 'Allenamento', 'Profilo'],
      },
      {
        kind: 'resolve',
        title: 'Pagamenti falliti, risolti',
        text: 'Quando un addebito non passa, parte l’email giusta con il link per pagare o per cambiare carta. Il desk vede solo quello che resta da fare.',
        url: 'crm.club.it/pagamenti-falliti',
        head: ['Socio', 'Quota', 'Importo', 'Stato'],
        rows: [
          { n: 'M. R.', what: 'Quota ottobre', amt: '€ 69,00' },
          { n: 'L. B.', what: 'Quota ottobre', amt: '€ 89,00' },
          { n: 'F. C.', what: 'Corso nuoto', amt: '€ 120,00' },
          { n: 'A. G.', what: 'Quota ottobre', amt: '€ 69,00' },
          { n: 'S. P.', what: 'Carta scaduta', amt: '€ 79,00' },
        ],
        from: 'Non riuscito',
        to: 'Pagato dal link',
        counter: 'Recuperati',
      },
      {
        kind: 'chat',
        title: 'WhatsApp, con un agente AI',
        text: 'Risponde con le informazioni del sito, porta al modulo giusto e passa la conversazione al desk quando serve una persona. Lo storico resta nella scheda del cliente.',
        who: 'Desk · WhatsApp',
        status: 'agente AI attivo',
        msgs: [
          { me: true, t: 'Ciao, avete corsi di nuoto per adulti la sera?' },
          { ai: true, t: 'Sì! Il lunedì e il giovedì alle 20:00. Vuoi provare una lezione gratuita? Ti lascio il modulo.' },
          { me: true, t: 'Perfetto, e per mia figlia di 8 anni?' },
          { ai: true, t: 'Per i bambini ci sono i corsi Junior: ti passo a un collega per i turni liberi.' },
          { team: true, t: 'Ciao, sono Marco del desk: martedì 17:00 c’è posto 👍' },
        ],
      },
      {
        kind: 'kiosk',
        title: 'Il totem in sede',
        text: 'La vendita assistita sul pannello del club: si sceglie l’abbonamento, si continua sul telefono con un QR, si firma e si paga. L’operatore segue, non digita.',
        steps: ['Scegli', 'I tuoi dati', 'Firma e paga'],
        plan: 'Open annuale',
        price: '€ 59 / mese',
        qr: 'Continua sul telefono',
      },
    ],
  },
  {
    slug: 'ronchiverdi',
    client: 'Ronchiverdi Sport Club',
    sector: 'Sport club · nuoto, tennis, padel, fitness',
    logo: 'images/work/logos/ronchiverdi-mark.png',
    img: 'images/work/ronchiverdi.jpg',
    title: 'Prima abbiamo studiato l’azienda. Poi abbiamo scritto il software.',
    intro: 'Un club con un gestionale storico su un server Windows, e nessun altro strumento digitale. Il caso in cui si vede meglio il metodo: la priorità non era scegliere un software, era capire come lavora davvero il club.',
    challenge: 'Comunicazioni su WhatsApp e al telefono, crediti e rinnovi seguiti a memoria, reclami che non lasciavano traccia. Il gestionale c’era, ma i suoi dati restavano chiusi dentro un database SQL Server in sede.',
    approach: 'Un audit vero prima di qualunque riga di codice. Poi sito e CRM disegnati su quella mappa, e il gestionale collegato così com’è: uno script sul server stesso legge SQL Server con un utente in sola lettura e manda i dati al CRM. Nessuna VPN, nessun cambio di gestionale.',
    built: [
      'Sito con richieste e prenotazione appuntamenti, con promemoria automatico',
      'CRM commerciale: trattative, agenda condivisa, impegni di oggi',
      'Avviso in tempo reale quando una trattativa non è presa in carico',
      'Sincronizzazione dal gestionale (SQL Server su Windows), idempotente',
      'Abbonamenti: attivi, scadenze, rinnovi, andamento; accessi e incassato',
      'Voucher per la visita medica e tesseramenti automatici',
      'Timbratura, messaggi interni con conferma di lettura e notifiche push',
      'Installabile come app su telefono e tablet',
    ],
    metrics: [
      { v: '0', l: 'VPN o cambi di gestionale' },
      { v: '1', l: 'Anagrafica per persona, dal sito al gestionale' },
      { v: 'Live', l: 'Avviso sulle trattative senza titolare' },
      { v: 'R/O', l: 'Accesso al database in sola lettura' },
    ],
    stack: ['Astro', 'TinaCMS', 'Next.js', 'Supabase', 'SQL Server', 'PowerShell', 'Web Push'],
    dots: ['Il dato c’era già.', 'Bastava collegarlo.'],
    extracts: [
      {
        kind: 'alert',
        title: 'Nessuna trattativa resta senza titolare',
        text: 'Una richiesta arriva dal sito e nessuno la prende? Il CRM lo dice subito, a tutti i commerciali. Un tocco e la trattativa ha un titolare.',
        url: 'crm.club.it/dashboard',
        rows: [
          { n: 'Richiesta Family', ch: 'Sito' },
          { n: 'Tennis adulti', ch: 'Telefono' },
          { n: 'Young School', ch: 'Email' },
          { n: 'Abbonamento Club', ch: 'WhatsApp' },
        ],
        take: 'Prendi in carico',
        taken: 'In gestione',
        ago: 'da',
      },
      {
        kind: 'flow',
        title: 'Dal gestionale al CRM, senza VPN',
        text: 'Uno script schedulato sul server del club legge il database del gestionale in sola lettura e manda solo le novità. Si può rieseguire quando si vuole: non crea doppioni.',
        nodes: [
          { t: 'SQL Server', s: 'Server Windows in sede' },
          { t: 'Script schedulato', s: 'Sola lettura' },
          { t: 'Database cloud', s: 'Anagrafica unica' },
          { t: 'CRM', s: 'Abbonamenti e scadenze' },
        ],
        counter: 'vendite sincronizzate',
        count: 12480,
      },
      {
        kind: 'agenda',
        title: 'Gli impegni di oggi',
        text: 'Appuntamenti in sede e telefonate di tutto il club, le cose da fare solo le proprie. Ogni impegno si chiude sul posto: eseguito, riprogrammato, annullato.',
        url: 'crm.club.it/agenda',
        items: [
          { h: '09:30', t: 'Visita al club', s: 'Famiglia B. · dal sito', tag: 'In sede' },
          { h: '11:00', t: 'Richiamare', s: 'Rinnovo tennis · R. M.', tag: 'Telefono' },
          { h: '15:00', t: 'Prova padel', s: 'G. L. + 3 amici', tag: 'In sede' },
          { h: '17:30', t: 'Young School', s: 'Iscrizione · 2 bambini', tag: 'In sede' },
        ],
        done: 'Promemoria inviato',
      },
      {
        kind: 'bars',
        title: 'L’andamento degli abbonamenti',
        text: 'Nuovi e non rinnovati, mese per mese, letti dal gestionale. La direzione vede dove si perde un cliente prima che diventi un problema.',
        url: 'crm.club.it/abbonamenti/andamento',
        tiles: [
          { l: 'Attivi oggi', v: 1240, d: '+6%' },
          { l: 'In scadenza (30 gg)', v: 96 },
          { l: 'Rinnovati', v: 78, suf: '%' },
        ],
        months: MONTHS_IT,
        a: [42, 38, 66, 58, 52, 47, 44, 39, 30, 22, 74, 61],
        b: [28, 31, 25, 30, 34, 29, 33, 41, 38, 26, 22, 27],
        legend: ['Nuovi', 'Non rinnovati'],
      },
    ],
  },
  {
    slug: 'tennis-club-ambrosiano',
    client: 'Tennis Club Ambrosiano',
    sector: 'Circolo sportivo · Milano',
    logo: 'images/work/logos/tca-mark.png',
    img: 'images/work/tca.jpg',
    title: 'Un’unica anagrafica al posto di sistemi scollegati.',
    intro: 'Iscrizioni, scuola tennis, summer camp ed eventi: una segreteria che riceveva richieste da sito, email e telefono, e ricostruiva a mano chi fosse chi.',
    challenge: 'Il sito era separato dalla segreteria: i moduli arrivavano via email, la stessa persona compariva più volte con dati leggermente diversi, lo storico del sistema precedente non era mai entrato in quello nuovo. Nessuno poteva dire quante persone frequentassero davvero il circolo.',
    approach: 'Prima la mappa: da dove arrivano i dati di una persona e su quali campi si può dire con sicurezza che due righe sono la stessa persona. Poi un sito statico veloce e un CRM che condividono lo stesso database. L’operatore non collega niente: ci pensa il sistema.',
    built: [
      'Sito pubblico veloce con CMS per la segreteria',
      'Normalizzazione e deduplica delle richieste: una riga per persona',
      'Import dello storico eventi dal sistema precedente',
      'CRM di segreteria: persone, opportunità, agenda condivisa, task',
      'Scuola tennis, summer camp e iscrizioni agli eventi',
      'Pipeline «Invita un amico», newsletter, notifiche',
      'Sincronizzazione con il gestionale del circolo',
    ],
    metrics: [
      { v: '353', l: 'Eventi storici importati' },
      { v: '220', l: 'Anagrafiche unificate' },
      { v: '192', l: 'Moduli deduplicati' },
      { v: '1', l: 'Fonte di verità per sito e segreteria' },
    ],
    stack: ['Astro', 'TinaCMS', 'Next.js', 'Supabase', 'PerfectGym API', 'Vercel Cron'],
    dots: ['Tre richieste, tre nomi diversi.', 'Una persona sola.'],
    extracts: [
      {
        kind: 'merge',
        title: 'La stessa persona, una volta sola',
        text: 'Un modulo del sito, un’iscrizione alla scuola tennis, un contatto dello storico: tre righe, una persona. Il sistema le riconosce e le unisce, l’operatore lo vede già fatto.',
        records: [
          { src: 'Modulo sito', f: ['Luca Verdi', 'luca.verdi@…', '—'] },
          { src: 'Scuola tennis', f: ['VERDI LUCA', '—', '+39 347 …12'] },
          { src: 'Storico', f: ['L. Verdi', 'luca.verdi@…', '347 …12'] },
        ],
        merged: { src: 'Anagrafica unica', f: ['Luca Verdi', 'luca.verdi@…', '+39 347 …12'] },
        label: 'Unificati',
      },
      {
        kind: 'timeline',
        title: 'La scheda della persona',
        text: 'Tutto quello che è successo con una persona, in ordine: richieste, iscrizioni, eventi, chi l’ha seguita. La segreteria risponde senza cercare in tre posti.',
        url: 'crm.circolo.it/persone/…',
        person: 'Luca Verdi',
        meta: 'Socio · Famiglia Verdi (3) · Scuola tennis',
        events: [
          { d: 'Ott', t: 'Iscrizione evento', s: 'Torneo sociale di doppio' },
          { d: 'Lug', t: 'Summer camp', s: 'Figlio · 2 settimane' },
          { d: 'Mag', t: 'Invita un amico', s: 'Ha invitato 2 persone' },
          { d: 'Set', t: 'Scuola tennis', s: 'Corso adulti · martedì' },
          { d: '2023', t: 'Primo contatto', s: 'Dallo storico importato' },
        ],
      },
      {
        kind: 'bars',
        title: 'Da dove arrivano le persone',
        text: 'Richieste junior e adulti, mese per mese, dopo la deduplica: finalmente numeri di persone, non di moduli.',
        url: 'crm.circolo.it/analytics',
        tiles: [
          { l: 'Persone uniche', v: 220 },
          { l: 'Doppioni evitati', v: 192 },
          { l: 'Eventi nello storico', v: 353 },
        ],
        months: MONTHS_IT,
        a: [12, 9, 14, 18, 22, 30, 41, 26, 15, 34, 21, 16],
        b: [8, 6, 10, 11, 14, 17, 12, 7, 6, 19, 13, 10],
        legend: ['Junior', 'Adulti'],
      },
    ],
  },
  {
    slug: 'passion-fitness',
    client: 'Passion Fitness',
    sector: 'Palestra',
    logo: 'images/work/logos/passion-mark.svg',
    img: '',
    title: 'Il gestionale copiato in casa, e un CRM costruito sopra.',
    intro: 'Prima il sito: veloce, collegato a dove il cliente prenota e paga davvero. Poi il passo grande: tutto il gestionale della palestra copiato in un database nostro, sempre aggiornato, e il CRM migrato da Airtable lì sopra.',
    challenge: 'Il CRM viveva su Airtable, il gestionale da un’altra parte: due verità sugli stessi clienti, dati ricopiati, report fatti a mano. E un sito che pesava 45 MB al primo caricamento.',
    approach: 'Il gestionale non si tocca: lo copiamo. Un download iniziale e poi aggiornamenti continui via webhook e job programmati. Sopra, un CRM su misura: i lead dei moduli e di Meta entrano dritti, nascono anche sul gestionale, e ogni numero della dashboard ha una regola scritta.',
    built: [
      'Sito con blog, prenotazioni e checkout collegati al gestionale',
      'Copia completa del gestionale, aggiornata da webhook e job programmati',
      'CRM migrato da Airtable: lead, prove, rinnovi, debitori, task, riunioni',
      'Lead dei moduli del sito e di Meta dritti nel CRM e nel gestionale',
      'Dashboard abbonamenti: attivi, nuovi, scaduti, retention, durata',
      'Ticket, ruoli e permessi, e una pagina «Aggiornamenti» per lo staff',
    ],
    metrics: [
      { v: '1,4 mln', l: 'Righe copiate dal gestionale' },
      { v: '119', l: 'Entità sincronizzate' },
      { v: '24 min', l: 'Per il primo download completo' },
      { v: '−89%', l: 'Peso della home page' },
    ],
    stack: ['Astro', 'Next.js', 'Supabase', 'PerfectGym API', 'Meta Lead Ads', 'n8n', 'pg_cron'],
    dots: ['Due verità sugli stessi clienti.', 'Ora ce n’è una.'],
    extracts: [
      {
        kind: 'bars',
        title: 'La dashboard abbonamenti',
        text: 'Attivi oggi contro un anno fa, nuovi e scaduti non rinnovati negli ultimi mesi. Le regole stanno nel database, non nel foglio di qualcuno: abbonamento, rinnovo, prova sono definiti una volta.',
        url: 'crm.palestra.it/abbonamenti',
        tiles: [
          { l: 'Attivi oggi', v: 1530, d: '+14% su un anno fa' },
          { l: 'Prove → abbonati', v: 34, suf: '%' },
          { l: 'Retention a 12 mesi', v: 61, suf: '%' },
        ],
        months: MONTHS_IT,
        a: [88, 72, 140, 118, 102, 95, 80, 64, 70, 58, 132, 110],
        b: [52, 60, 58, 66, 61, 59, 64, 72, 75, 69, 55, 58],
        legend: ['Nuovi', 'Scaduti non rinnovati'],
      },
      {
        kind: 'mirror',
        title: 'Il gestionale, in casa',
        text: 'Il primo download: tutte le tabelle del gestionale copiate in 24 minuti. Da lì in poi si aggiorna da solo, e ogni pagina del CRM legge in un istante invece di chiedere al gestionale.',
        tables: [
          { n: 'Accessi al club', rows: 359000 },
          { n: 'Prenotazioni lezioni', rows: 185000 },
          { n: 'Contratti', rows: 21400 },
          { n: 'Pagamenti', rows: 96800 },
          { n: 'Persone', rows: 18900 },
        ],
        totalLabel: 'righe copiate',
        total: 1400000,
        time: '119 entità · 24 minuti · zero errori',
      },
      {
        kind: 'flow',
        title: 'Il lead da Meta al gestionale',
        text: 'Chi compila un modulo su Instagram o sul sito entra nel CRM con il consulente già assegnato, e nasce anche sul gestionale. Nessuno ricopia niente.',
        nodes: [
          { t: 'Meta · Sito', s: 'Moduli e Lead Ads' },
          { t: 'CRM', s: 'Lead con consulente' },
          { t: 'Gestionale', s: 'Anagrafica creata' },
          { t: 'Prova', s: 'Prenotata e seguita' },
        ],
        counter: 'lead entrati da soli',
        count: 3260,
      },
      {
        kind: 'weight',
        title: 'Un sito che pesa un decimo',
        text: 'Immagini e caricamento trattati come un requisito, non come un dettaglio da sistemare dopo.',
        before: 'Prima',
        after: 'Dopo',
        beforeV: 45.49,
        afterV: 4.93,
      },
    ],
  },
];

const en: Case[] = [
  {
    ...it[0],
    sector: 'Multi-sport club · Rome',
    title: 'A club founded in 1973, digitised from the inside.',
    intro: 'Swimming, fitness, ice and over fifty years of history in north Rome. Athlon is where the Ready2Digital method was born: every tool was first a problem lived at the front desk, then software.',
    challenge: 'Paper sign-ups, requests scattered across reception, phone and WhatsApp, a back office that talked to nothing else. Every new channel added a piece of information nobody pieced together: nobody could say for sure who was a lead and who was already a customer.',
    approach: 'The back office stayed. We copy it, in sync, into our own database and build everything else on top: website, CRM, app and automations read the same source and say the same thing about the same person. We write to the back office only when it truly matters: booking, paying, signing up.',
    built: [
      'Website with an AI assistant: every request lands in the CRM, already de-duplicated',
      'CRM with roles, permissions, time clock, tickets and operator log',
      'iOS and Android member app: bookings, payments, Junior, wallet badge',
      'Athlon Health System with Apple Health and Health Connect',
      'WhatsApp Cloud API with an AI agent and a shared desk inbox',
      'Card and SEPA payments, billing run, failed payments with pay-by-link',
      'On-site kiosk for assisted sales and check-in',
      'Tracked newsletters, push notifications, a daily log for management',
    ],
    metrics: [
      { v: '570', l: 'Unique leads a month' },
      { v: '2,281', l: 'Leads in four months' },
      { v: '400', l: 'New contracts in the same period' },
      { v: '100%', l: 'Digital sign-ups, signature included' },
    ],
    dots: ['Every channel is a dot.', 'The CRM joins them into one person.'],
    extracts: [
      { ...(it[0].extracts[0] as Extract & { kind: 'kpi' }), title: 'The management dashboard', text: 'Leads, trials, contracts and revenue read from the same database as the app and website. Management looks at one number, and it’s the same one the desk sees.', tiles: [{ l: 'Leads this month', v: 571, d: '+18%' }, { l: 'Active trials', v: 84, d: '+9%' }, { l: 'New contracts', v: 103, d: '+12%' }, { l: 'Conversion', v: 31, suf: '%', d: '+3 pt' }], seriesLabel: 'Leads per week', funnel: [{ l: 'Leads', v: 100 }, { l: 'Contacted', v: 78 }, { l: 'Trial', v: 46 }, { l: 'Joined', v: 31 }] },
      { ...(it[0].extracts[1] as Extract & { kind: 'phone' }), title: 'The member app', text: 'Book classes, pay, get in with the wallet badge and follow the Athlon Health Score. A web app today, the same codebase for the App Store and Google Play.', hello: 'Hi Giulia', next: 'Your next class', nextClass: 'Aqua gym', nextWhen: 'Tomorrow · 6:30 pm · Pool 2', badge: 'Access badge', tabs: ['Home', 'Calendar', 'Training', 'Profile'] },
      { ...(it[0].extracts[2] as Extract & { kind: 'resolve' }), title: 'Failed payments, solved', text: 'When a charge fails, the right email goes out with a link to pay or to change card. The desk only sees what’s left to do.', head: ['Member', 'Fee', 'Amount', 'Status'], rows: [{ n: 'M. R.', what: 'October fee', amt: '€69.00' }, { n: 'L. B.', what: 'October fee', amt: '€89.00' }, { n: 'F. C.', what: 'Swim course', amt: '€120.00' }, { n: 'A. G.', what: 'October fee', amt: '€69.00' }, { n: 'S. P.', what: 'Card expired', amt: '€79.00' }], from: 'Failed', to: 'Paid by link', counter: 'Recovered' },
      { ...(it[0].extracts[3] as Extract & { kind: 'chat' }), title: 'WhatsApp, with an AI agent', text: 'It answers with the website’s information, points to the right form and hands the conversation to the desk when a person is needed. The history stays in the customer record.', status: 'AI agent on', msgs: [{ me: true, t: 'Hi, do you have adult swim classes in the evening?' }, { ai: true, t: 'Yes! Mondays and Thursdays at 8 pm. Fancy a free trial class? Here’s the form.' }, { me: true, t: 'Great, and for my 8-year-old daughter?' }, { ai: true, t: 'Kids have the Junior courses: I’ll pass you to a colleague for free slots.' }, { team: true, t: 'Hi, Marco from the desk here: Tuesday 5 pm has a spot 👍' }] },
      { ...(it[0].extracts[4] as Extract & { kind: 'kiosk' }), title: 'The on-site kiosk', text: 'Assisted sales on the club’s panel: pick a membership, continue on your phone with a QR code, sign and pay. Staff guide, they don’t type.', steps: ['Choose', 'Your details', 'Sign & pay'], plan: 'Open annual', price: '€59 / month', qr: 'Continue on your phone' },
    ],
  },
  {
    ...it[1],
    sector: 'Sport club · swimming, tennis, padel, fitness',
    title: 'First we studied the company. Then we wrote the software.',
    intro: 'A club with a long-standing back office on a Windows server, and no other digital tool. The case that best shows the method: the priority wasn’t choosing software, it was understanding how the club really works.',
    challenge: 'Communication over WhatsApp and the phone, credits and renewals tracked from memory, complaints that left no trace. The back office existed, but its data stayed locked in an on-site SQL Server database.',
    approach: 'A real audit before any code. Then a website and CRM designed on that map, and the back office connected as it is: a script on the server itself reads SQL Server with a read-only user and sends the data to the CRM. No VPN, no change of back office.',
    built: [
      'Website with enquiries and appointment booking, with automatic reminders',
      'Sales CRM: deals, shared calendar, today’s tasks',
      'Real-time alert when nobody has taken a deal',
      'Idempotent sync from the back office (SQL Server on Windows)',
      'Memberships: active, expiring, renewals, trends; access and revenue',
      'Medical check vouchers and automatic federation memberships',
      'Time clock, internal messages with read receipts and push notifications',
      'Installable as an app on phones and tablets',
    ],
    metrics: [
      { v: '0', l: 'VPNs or back-office changes' },
      { v: '1', l: 'Record per person, from website to back office' },
      { v: 'Live', l: 'Alert on unassigned deals' },
      { v: 'R/O', l: 'Read-only database access' },
    ],
    dots: ['The data was already there.', 'It just needed connecting.'],
    extracts: [
      { ...(it[1].extracts[0] as Extract & { kind: 'alert' }), title: 'No deal is left without an owner', text: 'A request arrives from the website and nobody takes it? The CRM says so right away, to every salesperson. One tap and the deal has an owner.', rows: [{ n: 'Family enquiry', ch: 'Website' }, { n: 'Adult tennis', ch: 'Phone' }, { n: 'Young School', ch: 'Email' }, { n: 'Club membership', ch: 'WhatsApp' }], take: 'Take it', taken: 'In progress', ago: 'for' },
      { ...(it[1].extracts[1] as Extract & { kind: 'flow' }), title: 'From back office to CRM, no VPN', text: 'A scheduled script on the club’s server reads the back-office database read-only and sends only what’s new. It can be re-run any time: it never creates duplicates.', nodes: [{ t: 'SQL Server', s: 'On-site Windows server' }, { t: 'Scheduled script', s: 'Read-only' }, { t: 'Cloud database', s: 'One customer record' }, { t: 'CRM', s: 'Memberships & renewals' }], counter: 'sales synced' },
      { ...(it[1].extracts[2] as Extract & { kind: 'agenda' }), title: 'Today’s tasks', text: 'Everyone’s on-site and phone appointments, but only your own to-dos. Every task is closed on the spot: done, rescheduled, cancelled.', items: [{ h: '09:30', t: 'Club visit', s: 'B. family · from website', tag: 'On site' }, { h: '11:00', t: 'Call back', s: 'Tennis renewal · R. M.', tag: 'Phone' }, { h: '15:00', t: 'Padel trial', s: 'G. L. + 3 friends', tag: 'On site' }, { h: '17:30', t: 'Young School', s: 'Sign-up · 2 kids', tag: 'On site' }], done: 'Reminder sent' },
      { ...(it[1].extracts[3] as Extract & { kind: 'bars' }), title: 'Membership trends', text: 'New and lapsed, month by month, read from the back office. Management sees where customers are lost before it becomes a problem.', tiles: [{ l: 'Active today', v: 1240, d: '+6%' }, { l: 'Expiring (30 days)', v: 96 }, { l: 'Renewed', v: 78, suf: '%' }], months: MONTHS_EN, legend: ['New', 'Lapsed'] },
    ],
  },
  {
    ...it[2],
    sector: 'Sports club · Milan',
    title: 'One customer record instead of disconnected systems.',
    intro: 'Sign-ups, tennis school, summer camp and events: an office receiving requests from website, email and phone, rebuilding by hand who was who.',
    challenge: 'The website was separate from the office: forms arrived by email, the same person appeared several times with slightly different data, and the history in the previous system had never made it into the new one. Nobody could say how many people really used the club.',
    approach: 'First the map: where a person’s data comes from, and which fields reliably say two rows are the same person. Then a fast static website and a CRM sharing the same database. Staff don’t link anything: the system does.',
    built: [
      'Fast public website with a CMS for the office',
      'Request normalisation and de-duplication: one row per person',
      'Import of past events from the previous system',
      'Office CRM: people, opportunities, shared calendar, tasks',
      'Tennis school, summer camp and event sign-ups',
      '“Invite a friend” pipeline, newsletter, notifications',
      'Sync with the club’s back office',
    ],
    metrics: [
      { v: '353', l: 'Past events imported' },
      { v: '220', l: 'Customer records unified' },
      { v: '192', l: 'Forms de-duplicated' },
      { v: '1', l: 'Source of truth for website and office' },
    ],
    dots: ['Three requests, three different names.', 'One person.'],
    extracts: [
      { ...(it[2].extracts[0] as Extract & { kind: 'merge' }), title: 'The same person, only once', text: 'A website form, a tennis-school sign-up, a contact from the archive: three rows, one person. The system recognises and merges them; staff see it already done.', records: [{ src: 'Website form', f: ['Luca Verdi', 'luca.verdi@…', '—'] }, { src: 'Tennis school', f: ['VERDI LUCA', '—', '+39 347 …12'] }, { src: 'Archive', f: ['L. Verdi', 'luca.verdi@…', '347 …12'] }], merged: { src: 'Single record', f: ['Luca Verdi', 'luca.verdi@…', '+39 347 …12'] }, label: 'Merged' },
      { ...(it[2].extracts[1] as Extract & { kind: 'timeline' }), title: 'The person’s record', text: 'Everything that happened with a person, in order: requests, sign-ups, events, who followed up. The office answers without searching three places.', meta: 'Member · Verdi family (3) · Tennis school', events: [{ d: 'Oct', t: 'Event sign-up', s: 'Club doubles tournament' }, { d: 'Jul', t: 'Summer camp', s: 'Son · 2 weeks' }, { d: 'May', t: 'Invite a friend', s: 'Invited 2 people' }, { d: 'Sep', t: 'Tennis school', s: 'Adult course · Tuesday' }, { d: '2023', t: 'First contact', s: 'From the imported archive' }] },
      { ...(it[2].extracts[2] as Extract & { kind: 'bars' }), title: 'Where people come from', text: 'Junior and adult requests, month by month, after de-duplication: finally people, not forms.', tiles: [{ l: 'Unique people', v: 220 }, { l: 'Duplicates avoided', v: 192 }, { l: 'Events in the archive', v: 353 }], months: MONTHS_EN, legend: ['Junior', 'Adults'] },
    ],
  },
  {
    ...it[3],
    sector: 'Gym',
    title: 'The back office copied in-house, and a CRM built on top.',
    intro: 'First the website: fast, wired to where customers actually book and pay. Then the big step: the gym’s entire back office copied into our own database, always up to date, and the CRM moved from Airtable on top of it.',
    challenge: 'The CRM lived on Airtable, the back office somewhere else: two truths about the same customers, data retyped, reports built by hand. And a website weighing 45 MB on first load.',
    approach: 'The back office isn’t touched: we copy it. One initial download, then continuous updates via webhooks and scheduled jobs. On top, a custom CRM: leads from forms and Meta flow straight in, are created in the back office too, and every dashboard number has a written rule.',
    built: [
      'Website with blog, bookings and checkout wired to the back office',
      'Full copy of the back office, updated by webhooks and scheduled jobs',
      'CRM moved from Airtable: leads, trials, renewals, debtors, tasks, meetings',
      'Website and Meta form leads straight into CRM and back office',
      'Membership dashboard: active, new, lapsed, retention, duration',
      'Tickets, roles and permissions, and an “Updates” page for staff',
    ],
    metrics: [
      { v: '1.4M', l: 'Rows copied from the back office' },
      { v: '119', l: 'Entities kept in sync' },
      { v: '24 min', l: 'For the first full download' },
      { v: '−89%', l: 'Home page weight' },
    ],
    dots: ['Two truths about the same customers.', 'Now there’s one.'],
    extracts: [
      { ...(it[3].extracts[0] as Extract & { kind: 'bars' }), title: 'The membership dashboard', text: 'Active today versus a year ago, new and lapsed over recent months. The rules live in the database, not in someone’s spreadsheet: membership, renewal and trial are defined once.', tiles: [{ l: 'Active today', v: 1530, d: '+14% vs last year' }, { l: 'Trials → members', v: 34, suf: '%' }, { l: '12-month retention', v: 61, suf: '%' }], months: MONTHS_EN, legend: ['New', 'Lapsed'] },
      { ...(it[3].extracts[1] as Extract & { kind: 'mirror' }), title: 'The back office, in-house', text: 'The first download: every back-office table copied in 24 minutes. From then on it updates itself, and every CRM page reads instantly instead of asking the back office.', tables: [{ n: 'Club check-ins', rows: 359000 }, { n: 'Class bookings', rows: 185000 }, { n: 'Contracts', rows: 21400 }, { n: 'Payments', rows: 96800 }, { n: 'People', rows: 18900 }], totalLabel: 'rows copied', time: '119 entities · 24 minutes · zero errors' },
      { ...(it[3].extracts[2] as Extract & { kind: 'flow' }), title: 'From Meta lead to back office', text: 'Whoever fills a form on Instagram or the website lands in the CRM with a consultant already assigned, and is created in the back office too. Nobody retypes anything.', nodes: [{ t: 'Meta · Website', s: 'Forms and Lead Ads' }, { t: 'CRM', s: 'Lead with consultant' }, { t: 'Back office', s: 'Record created' }, { t: 'Trial', s: 'Booked and followed' }], counter: 'leads in on their own' },
      { ...(it[3].extracts[3] as Extract & { kind: 'weight' }), title: 'A website at a tenth of the weight', text: 'Images and loading treated as a requirement, not a detail to fix later.', before: 'Before', after: 'After' },
    ],
  },
];

export const cases: Record<Lang, Case[]> = { it, en };

export const caseUi = {
  it: {
    back: 'Tutti i progetti',
    challenge: 'La sfida',
    approach: 'L’approccio',
    built: 'Cosa abbiamo costruito',
    results: 'I numeri',
    extracts: 'Dentro il progetto',
    extractsSub: 'Estratti delle schermate, ricostruiti con dati di esempio anonimizzati.',
    sample: 'Dati di esempio',
    stack: 'Tecnologie',
    next: 'Prossimo caso',
    cta: 'Hai un processo simile?',
    ctaBtn: 'Parliamone',
    open: 'Guarda il caso',
  },
  en: {
    back: 'All projects',
    challenge: 'The challenge',
    approach: 'The approach',
    built: 'What we built',
    results: 'The numbers',
    extracts: 'Inside the project',
    extractsSub: 'Screen extracts, rebuilt with anonymised sample data.',
    sample: 'Sample data',
    stack: 'Technology',
    next: 'Next case',
    cta: 'Got a similar process?',
    ctaBtn: 'Let’s talk',
    open: 'See the case',
  },
};
