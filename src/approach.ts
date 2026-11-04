// How we work, in detail: the principles that came out of the projects we run in
// production (Athlon Club above all, then Ronchiverdi, Tennis Club Ambrosiano and
// Passion Fitness). The Method page says the six steps; this says the rules we
// keep inside each step, the ones a customer meets without seeing them.
//
// It is published in llms-full.txt and in /assistente.json, the knowledge base of
// the assistant on the site (src/assistant.ts): it is what lets the assistant
// answer «how do you work?» with something more than the six titles.
//
// Rule of this file: principles, not data. No client's internal numbers, systems
// keys, names of people other than ours, prices or contract terms. Where a
// principle comes from a real case, the case is named as the site already names
// it, and the numbers stay the ones of the case pages.

import type { Lang } from './content';

export type Principle = { t: string; d: string };

export type Approach = {
  title: string;
  lead: string;
  items: Principle[];
  start: { title: string; steps: string[] };
  limits: { title: string; items: string[] };
};

const it: Approach = {
  title: 'Come lavoriamo, in dettaglio',
  lead: 'Le regole che teniamo dentro ogni passo del metodo. Sono nate risolvendo problemi veri, nei progetti che usiamo ogni giorno in produzione.',
  items: [
    {
      t: 'Una fonte di verità per i dati',
      d: 'Il gestionale che l’azienda usa già resta al suo posto. I suoi dati si sincronizzano in un database nostro, e da lì leggono il CRM, l’app e il sito: le pagine sono veloci e funzionano anche quando il gestionale è lento o non risponde. Le scritture (prenotare, pagare, iscrivere) passano dal gestionale, e subito dopo si rilegge da lì per confermare.',
    },
    {
      t: 'Lo stesso conto, in un posto solo',
      d: 'Abbonamenti, pagamenti, prenotazioni di una persona si calcolano una volta sola, e il CRM dello staff e l’app del cliente leggono lo stesso calcolo. Se due schermate dicono due cose diverse sulla stessa persona, è un difetto da correggere, non un caso da spiegare.',
    },
    {
      t: 'Quello che il gestionale non sa, lo registriamo noi',
      d: 'Da dove arriva un contatto, da quale dispositivo è stata fatta una prenotazione, quale campagna ha portato un’iscrizione: lo scriviamo in un registro nostro. Quello che si deduce da altri dati si marca come dedotto, non si presenta come un fatto.',
    },
    {
      t: 'Un modulo non si blocca mai',
      d: 'Se un servizio esterno non risponde, la richiesta di una persona passa comunque e si riconcilia dopo: un contatto in più da sistemare costa meno di un contatto perso. E i dati che abbiamo già non si richiedono: chi è già cliente non ricopia nome e telefono.',
    },
    {
      t: 'Gli scarti si registrano come i successi',
      d: 'Ogni richiesta rifiutata, fallita o arrivata a metà lascia una riga con il motivo. Senza, quello che si perde non esiste per nessuno, e non si può né contare né correggere.',
    },
    {
      t: 'Agenti AI che rispondono da quello che è scritto',
      d: 'La conoscenza di un agente è generata dagli stessi dati del sito e del gestionale, non copiata a mano. Ogni informazione dice per chi vale, così non si applica al caso vicino. Le cifre si citano, non si calcolano; quando una cosa non c’è, l’agente lo dice invece di indovinare; reclami e casi personali passano a una persona.',
    },
    {
      t: 'Gli errori degli agenti diventano correzioni',
      d: 'Le conversazioni vere si rileggono. Ogni risposta sbagliata si riporta alla sua causa (un dato mancante, due informazioni ambigue, una regola che si allarga troppo) e si corregge lì, con un controllo che segnala se l’errore torna.',
    },
    {
      t: 'Bozza prima, invio dopo, dove l’errore costa',
      d: 'Quando una risposta automatica sbagliata farebbe danno (un’email a un cliente, un prezzo), l’agente prepara una bozza e una persona la rilegge e la manda. Dove l’errore costa una domanda in più, l’agente risponde da solo.',
    },
    {
      t: 'Privacy e sicurezza dentro il progetto',
      d: 'Consensi separati per scopo, dati sulla salute dietro un consenso esplicito, chiavi segrete solo sui server, database chiusi per impostazione predefinita, fornitori AI configurati per non conservare i dati, cookie e tracciamento solo dopo il consenso.',
    },
    {
      t: 'Interfacce per chi le usa davvero',
      d: 'Il cliente dal telefono, l’operatore al desk, il totem all’ingresso letto da un metro e mezzo, lo schermo in sala visto dal divano: ogni schermo si progetta e si prova nel suo formato, non solo su quello di chi sviluppa.',
    },
    {
      t: 'Si scrive quello che cambia',
      d: 'Le decisioni sono documentate accanto al codice, con il perché. Ogni cambiamento che lo staff vede ha la sua nota scritta in parole semplici (nei nostri CRM c’è una sezione «Aggiornamenti»), così nessuno scopre una novità sbagliando.',
    },
    {
      t: 'Le persone restano al centro',
      d: 'L’automazione toglie i passaggi ripetitivi; le decisioni, le eccezioni e il rapporto con il cliente restano alle persone. Restiamo accanto al team finché lo strumento non diventa abitudine.',
    },
  ],
  start: {
    title: 'Come si comincia',
    steps: [
      'Ci scrivi dal modulo della pagina Contatti, raccontando l’azienda e il problema che vuoi risolvere.',
      'Ti ricontattiamo per una prima conversazione: capiamo come arrivano oggi le richieste, chi le lavora e dove si perdono.',
      'Ti proponiamo da dove partire: spesso un pezzo solo (un agente, un CRM, un’integrazione) che si collega a quello che hai già, e poi il percorso per farlo crescere.',
    ],
  },
  limits: {
    title: 'Cosa l’assistente del sito non può dirti',
    items: [
      'Prezzi e tempi: dipendono dal progetto, e li diamo solo dopo aver capito cosa serve.',
      'Dati dei nostri clienti oltre a quelli pubblicati nelle pagine dei casi.',
      'Impegni o promesse: le proposte le fanno le persone del team.',
    ],
  },
};

const en: Approach = {
  title: 'How we work, in detail',
  lead: 'The rules we keep inside every step of the method. They came from solving real problems, in projects we run in production every day.',
  items: [
    {
      t: 'One source of truth for data',
      d: 'The management system a business already uses stays where it is. Its data is synced into a database of ours, and the CRM, the app and the website read from there: pages are fast and keep working when the management system is slow or down. Writes (booking, paying, signing up) go through the management system, and right after we read back from it to confirm.',
    },
    {
      t: 'The same figure, in one place only',
      d: 'A person’s memberships, payments and bookings are computed once, and the staff CRM and the customer app read the same computation. If two screens say two different things about the same person, it is a bug to fix, not a case to explain.',
    },
    {
      t: 'What the management system doesn’t know, we record',
      d: 'Where a lead comes from, which device a booking was made on, which campaign brought a sign-up: we write it in a log of ours. What is inferred from other data is marked as inferred, never presented as a fact.',
    },
    {
      t: 'A form never blocks',
      d: 'If an external service doesn’t answer, a person’s request still goes through and is reconciled later: one extra lead to tidy up costs less than a lost one. And we don’t ask again for data we already have: an existing customer doesn’t retype name and phone.',
    },
    {
      t: 'Rejections are logged like successes',
      d: 'Every request that is refused, fails or stops halfway leaves a row with its reason. Without it, what gets lost doesn’t exist for anyone, and can be neither counted nor fixed.',
    },
    {
      t: 'AI agents that answer from what is written',
      d: 'An agent’s knowledge is generated from the same data as the website and the management system, not copied by hand. Every piece of information says who it applies to, so it doesn’t spill onto the neighbouring case. Figures are quoted, not computed; when something isn’t there the agent says so instead of guessing; complaints and personal cases go to a person.',
    },
    {
      t: 'Agent mistakes become fixes',
      d: 'Real conversations are reread. Every wrong answer is traced to its cause (missing data, two ambiguous pieces of information, a rule that spreads too far) and fixed there, with a check that flags it if it comes back.',
    },
    {
      t: 'Draft first, send later, where a mistake is costly',
      d: 'When a wrong automatic reply would do harm (an email to a customer, a price), the agent prepares a draft and a person rereads and sends it. Where a mistake only costs one more question, the agent answers on its own.',
    },
    {
      t: 'Privacy and security built into the project',
      d: 'Separate consents for each purpose, health data behind explicit consent, secret keys only on servers, databases closed by default, AI providers set not to retain data, cookies and tracking only after consent.',
    },
    {
      t: 'Interfaces for the people who actually use them',
      d: 'The customer on a phone, the operator at the desk, the kiosk in the entrance read from a metre and a half, the screen in the lounge seen from the sofa: every screen is designed and tested in its own format, not only on the developer’s.',
    },
    {
      t: 'We write down what changes',
      d: 'Decisions are documented next to the code, with the reason why. Every change the staff can see gets its own note in plain words (our CRMs have an «Updates» section), so nobody discovers something new by making a mistake.',
    },
    {
      t: 'People stay at the centre',
      d: 'Automation removes the repetitive steps; decisions, exceptions and the relationship with the customer stay with people. We stay beside the team until the tool becomes a habit.',
    },
  ],
  start: {
    title: 'How to get started',
    steps: [
      'Write to us from the form on the Contact page, telling us about the company and the problem you want to solve.',
      'We get back to you for a first conversation: how requests arrive today, who handles them and where they get lost.',
      'We propose where to start: often a single piece (an agent, a CRM, an integration) connected to what you already have, and then the path to grow it.',
    ],
  },
  limits: {
    title: 'What the website assistant can’t tell you',
    items: [
      'Prices and timelines: they depend on the project, and we give them only after understanding what is needed.',
      'Data about our clients beyond what is published on the case pages.',
      'Commitments or promises: proposals are made by the people on the team.',
    ],
  },
};

export const approach: Record<Lang, Approach> = { it, en };

/** The same content as Markdown lines, for llms-full.txt and the assistant's knowledge base. */
export function approachMarkdown(lang: Lang): string[] {
  const a = approach[lang];
  return [
    `## ${a.title}`,
    '',
    a.lead,
    '',
    ...a.items.flatMap((p) => [`### ${p.t}`, '', p.d, '']),
    `### ${a.start.title}`,
    '',
    ...a.start.steps.map((s, i) => `${i + 1}. ${s}`),
    '',
    `### ${a.limits.title}`,
    '',
    ...a.limits.items.map((s) => `- ${s}`),
  ];
}
