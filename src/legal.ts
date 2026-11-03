// Company details, the contact form's wording and the privacy notice.
//
// COMPANY: fill in the registered office, VAT number and PEC. The privacy
// notice only shows the fields that are filled in.
//
// CONTACT_ENDPOINT: where the form POSTs the request as JSON. On Vercel it is the
// function in api/contact.js, which sends the email through SendGrid (the keys and
// addresses are environment variables: see the comment at the top of that file).
// Where nothing answers at that address (the local dev server, a static preview)
// the form falls back to the visitor's mail app with the message ready. Empty
// means always the mail app. Nothing is stored by the site.

import type { Lang } from './content';

// From the company registry extract (visura camerale, 14/01/2025).
export const COMPANY = {
  name: 'Ready 2 Digital S.r.l.',
  address: 'Via Giuseppe De Nittis 4, 00125 Roma (RM)',
  vat: '16573891005',
  rea: 'RM-1664181',
  pec: 'ready2digital@pec.it',
  email: 'info@ready2digital.it',
};

export const CONTACT_ENDPOINT = '/api/contact';

export const PRIVACY_UPDATED = '2 novembre 2026';

type Form = {
  steps: string[];
  q: string[];
  hints: string[];
  f: { nome: string; cognome: string; email: string; cellulare: string; azienda: string; progetto: string };
  needs: string[];
  privacy: [string, string, string];
  marketing: string;
  required: string;
  next: string;
  back: string;
  send: string;
  sending: string;
  enter: string;
  err: { required: string; email: string; phone: string; short: string; consent: string; send: string };
  done: { title: (n: string) => string; mail: string; sent: string; again: string };
  subject: string;
};

export const form: Record<Lang, Form> = {
  it: {
    steps: ['Tu', 'Contatti', 'Azienda', 'Bisogni', 'Progetto', 'Consensi'],
    q: ['Come ti chiami?', 'Come ti ricontattiamo?', 'Per quale azienda?', 'Di cosa hai bisogno?', 'Parlaci del tuo progetto.', 'Ultimo passo.'],
    hints: [
      'Partiamo dalle presentazioni.',
      'Usiamo questi dati solo per risponderti.',
      'Lascia vuoto se è un progetto personale.',
      'Scegli quello che ti interessa, anche più di una cosa. O salta.',
      'Il processo che oggi ti fa perdere tempo, gli strumenti che usi, cosa vorresti ottenere.',
      'Leggi l’informativa e scegli i consensi.',
    ],
    f: { nome: 'Nome', cognome: 'Cognome', email: 'Email', cellulare: 'Cellulare', azienda: 'Nome dell’azienda', progetto: 'Il tuo progetto' },
    needs: ['Sito web', 'E-commerce', 'App iOS e Android', 'CRM', 'Gestionale / ERP', 'Dashboard', 'Automazioni', 'Integrazioni', 'Totem', 'AI', 'Consulenza', 'Non lo so ancora'],
    privacy: ['Ho letto l’', 'informativa privacy', ' e acconsento al trattamento dei miei dati per ricevere una risposta alla mia richiesta.'],
    marketing: 'Acconsento a ricevere comunicazioni commerciali e novità da Ready 2 Digital via email o telefono. Facoltativo, revocabile in ogni momento.',
    required: 'obbligatorio',
    next: 'Avanti',
    back: 'Indietro',
    send: 'Invia la richiesta',
    sending: 'Invio…',
    enter: 'oppure premi Invio ↵',
    err: {
      required: 'Questo campo serve.',
      email: 'Controlla l’indirizzo email.',
      phone: 'Controlla il numero di cellulare.',
      short: 'Raccontaci qualcosa in più (almeno qualche parola).',
      consent: 'Per inviare la richiesta serve il consenso all’informativa.',
      send: 'Non siamo riusciti a inviare la richiesta. Riprova, o scrivici a info@ready2digital.it.',
    },
    done: {
      title: (n) => `Grazie, ${n}.`,
      mail: 'Si è aperto il tuo programma di posta con il messaggio già pronto: premi Invia lì e la richiesta arriva a noi.',
      sent: 'La tua richiesta è arrivata. Ti rispondiamo al più presto.',
      again: 'Scrivi un’altra richiesta',
    },
    subject: 'Nuovo progetto dal sito',
  },
  en: {
    steps: ['You', 'Contact', 'Company', 'Needs', 'Project', 'Consent'],
    q: ['What’s your name?', 'How do we reach you?', 'Which company?', 'What do you need?', 'Tell us about your project.', 'Last step.'],
    hints: [
      'Let’s start with introductions.',
      'We only use these to reply to you.',
      'Leave it blank if it’s a personal project.',
      'Pick what interests you, more than one is fine. Or skip.',
      'The process that wastes your time today, the tools you use, what you’d like to achieve.',
      'Read the privacy notice and choose your consents.',
    ],
    f: { nome: 'First name', cognome: 'Last name', email: 'Email', cellulare: 'Mobile', azienda: 'Company name', progetto: 'Your project' },
    needs: ['Website', 'E-commerce', 'iOS & Android app', 'CRM', 'Back office / ERP', 'Dashboard', 'Automation', 'Integrations', 'Kiosk', 'AI', 'Consulting', 'Not sure yet'],
    privacy: ['I have read the ', 'privacy notice', ' and consent to my data being processed to receive a reply to my request.'],
    marketing: 'I agree to receive commercial communications and news from Ready 2 Digital by email or phone. Optional, can be withdrawn at any time.',
    required: 'required',
    next: 'Next',
    back: 'Back',
    send: 'Send request',
    sending: 'Sending…',
    enter: 'or press Enter ↵',
    err: {
      required: 'This field is needed.',
      email: 'Please check the email address.',
      phone: 'Please check the mobile number.',
      short: 'Tell us a little more (a few words at least).',
      consent: 'To send the request we need your consent to the privacy notice.',
      send: 'We couldn’t send your request. Try again, or write to info@ready2digital.it.',
    },
    done: {
      title: (n) => `Thank you, ${n}.`,
      mail: 'Your mail app has opened with the message ready: press Send there and the request reaches us.',
      sent: 'Your request has arrived. We’ll get back to you soon.',
      again: 'Write another request',
    },
    subject: 'New project from the website',
  },
};

/* ------------------------------------------------------------------ */
/* Privacy notice (art. 13 GDPR)                                       */
/* ------------------------------------------------------------------ */
type Section = { h: string; p: string[] };

function controller(lang: Lang) {
  const c = COMPANY;
  const parts = [c.name];
  if (c.address) parts.push(lang === 'it' ? `sede legale in ${c.address}` : `registered office at ${c.address}`);
  if (c.vat) parts.push(lang === 'it' ? `P.IVA e C.F. ${c.vat}` : `VAT and tax code ${c.vat}`);
  if (c.rea) parts.push(`REA ${c.rea}`);
  parts.push(`email ${c.email}`);
  if (c.pec) parts.push(`PEC ${c.pec}`);
  return parts.join(', ');
}

export function privacyText(lang: Lang): { title: string; intro: string; updated: string; sections: Section[] } {
  if (lang === 'en')
    return {
      title: 'Privacy notice',
      intro: 'How Ready 2 Digital processes the personal data of people who visit this website and contact us, under Article 13 of Regulation (EU) 2016/679 (GDPR).',
      updated: 'Last updated: 2 November 2026',
      sections: [
        { h: '1. Data controller', p: [`${controller('en')}.`] },
        {
          h: '2. What data we process',
          p: [
            'Data you give us through the contact form or by email: first and last name, email address, mobile number, company name, the services you’re interested in and the description of your project.',
            'Browsing data: the technical information any website receives in order to work (e.g. IP address, browser type, pages requested), used only to deliver the site and keep it secure.',
            'Cookies: see the cookie section below.',
          ],
        },
        {
          h: '3. Why, and on what legal basis',
          p: [
            'a) To reply to your request and, where relevant, prepare a proposal. Legal basis: steps taken at your request prior to entering into a contract (art. 6(1)(b) GDPR). Providing the data marked as required is necessary to reply; without it we cannot handle the request.',
            'b) Only if you tick the optional box: to send you commercial communications and news about our services, by email or phone. Legal basis: your consent (art. 6(1)(a) GDPR), which you can withdraw at any time without affecting the lawfulness of processing carried out before withdrawal. Refusing has no effect on your request.',
            'c) To meet legal obligations and, where necessary, to protect our rights. Legal basis: art. 6(1)(c) and (f) GDPR.',
          ],
        },
        {
          h: '4. How long we keep the data',
          p: [
            'Request data: for as long as needed to handle it and, if no business relationship follows, no longer than 24 months from the last contact.',
            'Marketing data: until you withdraw consent, and in any case no longer than 24 months from the last contact.',
            'Browsing data: for the time strictly needed for technical and security purposes.',
          ],
        },
        {
          h: '5. Who receives the data',
          p: [
            'The data is processed by Ready 2 Digital staff and by providers that help us run the site and our communications (hosting, email, and any tools to manage requests), appointed as processors under art. 28 GDPR. It is not disclosed to the public or sold.',
          ],
        },
        {
          h: '6. Transfers outside the European Union',
          p: [
            'Some providers may process data outside the European Economic Area (for example in the United States). In that case the transfer takes place only with the safeguards required by the GDPR, such as an adequacy decision of the European Commission (including the EU-US Data Privacy Framework) or standard contractual clauses.',
          ],
        },
        {
          h: '7. Your rights',
          p: [
            'You can ask at any time for access to your data, its rectification or erasure, restriction of processing, data portability, and you can object to processing (arts. 15–22 GDPR). You can withdraw your marketing consent at any time. Just write to ' + COMPANY.email + '.',
            'You also have the right to lodge a complaint with the Italian Data Protection Authority (Garante per la protezione dei dati personali, www.garanteprivacy.it).',
          ],
        },
        {
          h: '8. Cookies',
          p: [
            'The site uses technical cookies needed for it to work and, only with your consent, any further cookies described in the cookie banner. You can review and change your choices at any time from the banner’s preferences.',
          ],
        },
        { h: '9. Changes', p: ['We may update this notice. The current version is always on this page, with its date.'] },
      ],
    };
  return {
    title: 'Informativa privacy',
    intro: 'Come Ready 2 Digital tratta i dati personali di chi visita questo sito e ci contatta, ai sensi dell’articolo 13 del Regolamento (UE) 2016/679 (GDPR).',
    updated: `Ultimo aggiornamento: ${PRIVACY_UPDATED}`,
    sections: [
      { h: '1. Titolare del trattamento', p: [`${controller('it')}.`] },
      {
        h: '2. Quali dati trattiamo',
        p: [
          'Dati che ci fornisci con il modulo di contatto o via email: nome, cognome, indirizzo email, numero di cellulare, nome dell’azienda, i servizi che ti interessano e la descrizione del tuo progetto.',
          'Dati di navigazione: le informazioni tecniche che ogni sito riceve per funzionare (ad esempio indirizzo IP, tipo di browser, pagine richieste), usate solo per erogare il sito e mantenerlo sicuro.',
          'Cookie: vedi la sezione dedicata più sotto.',
        ],
      },
      {
        h: '3. Perché li trattiamo e su quale base',
        p: [
          'a) Per rispondere alla tua richiesta e, se serve, preparare una proposta. Base giuridica: misure precontrattuali adottate su tua richiesta (art. 6.1.b GDPR). Il conferimento dei dati indicati come obbligatori è necessario per risponderti: senza, non possiamo gestire la richiesta.',
          'b) Solo se spunti la casella facoltativa: per inviarti comunicazioni commerciali e novità sui nostri servizi, via email o telefono. Base giuridica: il tuo consenso (art. 6.1.a GDPR), che puoi revocare in qualsiasi momento senza pregiudicare il trattamento fatto prima della revoca. Il rifiuto non ha alcuna conseguenza sulla tua richiesta.',
          'c) Per adempiere a obblighi di legge e, se necessario, per tutelare i nostri diritti. Base giuridica: art. 6.1.c e 6.1.f GDPR.',
        ],
      },
      {
        h: '4. Per quanto tempo li conserviamo',
        p: [
          'Dati della richiesta: per il tempo necessario a gestirla e, se non nasce un rapporto commerciale, non oltre 24 mesi dall’ultimo contatto.',
          'Dati per il marketing: fino alla revoca del consenso, e comunque non oltre 24 mesi dall’ultimo contatto.',
          'Dati di navigazione: per il tempo strettamente necessario a fini tecnici e di sicurezza.',
        ],
      },
      {
        h: '5. A chi li comunichiamo',
        p: [
          'I dati sono trattati dal personale di Ready 2 Digital e da fornitori che ci aiutano a far funzionare il sito e le comunicazioni (hosting, posta elettronica, eventuali strumenti di gestione delle richieste), nominati responsabili del trattamento ai sensi dell’art. 28 GDPR. Non sono diffusi né ceduti a terzi.',
        ],
      },
      {
        h: '6. Trasferimenti fuori dall’Unione europea',
        p: [
          'Alcuni fornitori possono trattare dati fuori dallo Spazio economico europeo (per esempio negli Stati Uniti). In quel caso il trasferimento avviene solo con le garanzie previste dal GDPR, come una decisione di adeguatezza della Commissione europea (compreso l’EU-US Data Privacy Framework) o le clausole contrattuali standard.',
        ],
      },
      {
        h: '7. I tuoi diritti',
        p: [
          'Puoi chiedere in ogni momento l’accesso ai tuoi dati, la rettifica o la cancellazione, la limitazione del trattamento, la portabilità, e puoi opporti al trattamento (artt. 15–22 GDPR). Puoi revocare in qualsiasi momento il consenso al marketing. Basta scrivere a ' + COMPANY.email + '.',
          'Hai inoltre il diritto di proporre reclamo al Garante per la protezione dei dati personali (www.garanteprivacy.it).',
        ],
      },
      {
        h: '8. Cookie',
        p: [
          'Il sito usa cookie tecnici necessari al suo funzionamento e, solo con il tuo consenso, gli eventuali ulteriori cookie descritti nel banner dei cookie. Puoi rivedere e modificare le tue scelte in qualsiasi momento dalle preferenze del banner.',
        ],
      },
      { h: '9. Modifiche', p: ['Possiamo aggiornare questa informativa. La versione in vigore è sempre in questa pagina, con la sua data.'] },
    ],
  };
}
