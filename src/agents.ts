// The AI agents page, in both languages: what an agent is, the four families we
// build (sales, support, data analysis, CRM), where they already run, how we
// work, the limits we put on them, and the FAQ — which is also published as
// FAQPage structured data (src/seo.ts), so every question here must be one a
// customer really asks and every answer one we can stand behind.
//
// Rule of this page: no invented numbers. Where it says "in production" it
// points at Athlon Club, whose case is on /progetti/athlon; anything else is
// written as what an agent *can* do, not as a result we have measured.

import type { Lang } from './content';

export type Family = {
  id: string;
  tag: string;
  t: string;
  promise: string;
  does: string[];
  links: string[];
  example: string;
};

export type Faq = { q: string; a: string };

type Compare = { tag: string; t: string; d: string; ex: string; hot?: boolean };

export type AgentsCopy = {
  jump: string;
  what: { kicker: string; title: string; lead: string; cols: Compare[]; note: string };
  data: {
    kicker: string;
    title: string;
    text: string;
    sources: { t: string; items: string[] };
    agent: { t: string; steps: string[] };
    outputs: { t: string; items: string[] };
    more: string;
  };
  families: { kicker: string; title: string; sub: string; links: string; example: string; items: Family[]; other: string; otherCta: string };
  proof: { kicker: string; title: string; text: string; items: string[]; cta: string };
  steps: { kicker: string; title: string; items: { t: string; d: string }[] };
  control: { kicker: string; title: string; items: { t: string; d: string }[]; gdpr: string };
  faq: { kicker: string; title: string; items: Faq[] };
  cta: { title: string; btn: string };
};

const it: AgentsCopy = {
  jump: 'Quattro famiglie di agenti',
  what: {
    kicker: 'Cos’è un agente AI',
    title: 'Non risponde soltanto. Lavora.',
    lead: 'Un agente AI è un software che legge i dati della tua azienda, capisce cosa sta succedendo, decide il passo successivo e lo esegue sui tuoi strumenti. Quando il caso non è suo, chiama una persona.',
    cols: [
      {
        tag: 'Automazione',
        t: 'Se succede X, fai Y',
        d: 'Regole fisse, perfette per i passaggi che non cambiano mai: una sincronizzazione, un promemoria, una fattura che parte da sola.',
        ex: 'Arriva un pagamento → il gestionale si aggiorna.',
      },
      {
        tag: 'Chatbot',
        t: 'Risponde alle domande',
        d: 'Conversa, ma di solito si ferma lì: non vede il tuo CRM e non agisce sui tuoi sistemi. Una risposta, non un lavoro fatto.',
        ex: 'Orari, prezzi, risposte già scritte.',
      },
      {
        tag: 'Agente AI',
        t: 'Ha un obiettivo e fa il lavoro',
        d: 'Legge il contesto, sceglie i passi, usa gli strumenti — CRM, email, WhatsApp, database — e passa la mano a una persona quando serve.',
        ex: 'Qualifica un contatto, lo registra nel CRM, fissa l’appuntamento e avvisa il commerciale.',
        hot: true,
      },
    ],
    note: 'Non sono alternative. Le automazioni fanno scorrere i dati; gli agenti prendono le decisioni che prima aspettavano una persona. Insieme, un processo gira da solo.',
  },
  data: {
    kicker: 'Dove ci sono dati',
    title: 'Ogni dato è lavoro in attesa.',
    text: 'Ogni azienda siede su dati che nessuno ha il tempo di leggere: contatti, conversazioni, contratti, ordini, tabelle, documenti. Un agente li legge tutti, ogni giorno, e fa quello che oggi aspetta che qualcuno trovi cinque minuti.',
    sources: { t: 'I tuoi dati', items: ['CRM', 'Gestionale · ERP', 'Database SQL', 'Email', 'WhatsApp', 'Sito e moduli', 'Fogli e documenti', 'E-commerce', 'Calendari'] },
    agent: { t: 'L’agente', steps: ['Legge', 'Capisce', 'Decide', 'Agisce', 'Passa la mano'] },
    outputs: {
      t: 'Il lavoro fatto',
      items: ['Contatto qualificato, appuntamento fissato', 'Richiesta risolta, o ticket già istruito', 'Report e avvisi che arrivano da soli', 'Scheda cliente aggiornata e pulita', 'Bozza di risposta pronta da rileggere'],
    },
    more: 'E dove i dati sono altri — amministrazione, contratti, magazzino, risorse umane — il principio è lo stesso: se c’è un processo che legge e scrive dati, c’è quasi sempre un agente che può aiutare.',
  },
  families: {
    kicker: 'Cosa costruiamo',
    title: 'Quattro agenti. Un solo obiettivo: meno lavoro che non serve.',
    sub: 'Ognuno può vivere da solo o lavorare con gli altri, sugli stessi dati e con le stesse regole.',
    links: 'Si collega a',
    example: 'Un esempio',
    items: [
      {
        id: 'vendita',
        tag: 'Vendita',
        t: 'Agenti di vendita',
        promise: 'Nessun contatto resta senza risposta. Nessun preventivo resta senza seguito.',
        does: [
          'Rispondono subito a chi scrive dal sito, da WhatsApp o da un modulo, a qualsiasi ora',
          'Qualificano il contatto con le domande giuste e lo registrano nel CRM, senza doppioni',
          'Propongono la prova, la visita o l’appuntamento e li mettono in agenda',
          'Fanno il follow-up su preventivi e richieste ferme, e riattivano i contatti dormienti',
          'Passano al commerciale il contatto caldo, con il contesto già riassunto',
        ],
        links: ['Sito', 'WhatsApp', 'CRM', 'Calendario', 'Email'],
        example: 'Un contatto scrive alle 23:10. L’agente risponde, capisce cosa cerca, propone due orari e crea la scheda nel CRM. Il mattino dopo il commerciale trova un appuntamento, non un messaggio da richiamare.',
      },
      {
        id: 'assistenza',
        tag: 'Assistenza',
        t: 'Agenti di assistenza',
        promise: 'Risposte giuste, dove le persone già scrivono.',
        does: [
          'Rispondono dalle informazioni della tua azienda, non da ciò che “sembra” giusto: se la risposta non c’è, lo dicono',
          'Gestiscono le richieste che tornano sempre: orari, prenotazioni, disdette, documenti, stato di una pratica',
          'Funzionano su sito, app e WhatsApp, in più lingue',
          'Aprono il ticket già compilato e passano alla persona giusta con la conversazione allegata',
          'Riconoscono una lamentela o un caso delicato e passano subito la mano a una persona',
        ],
        links: ['Sito', 'App', 'WhatsApp', 'Email', 'Ticket'],
        example: 'Un cliente chiede come disdire. L’agente controlla la regola, la spiega in due righe e indica dove farlo. Se il caso è personale, apre il ticket con tutto il contesto e avvisa il team.',
      },
      {
        id: 'analisi-dati',
        tag: 'Analisi dati',
        t: 'Agenti di analisi dati',
        promise: 'Fai la domanda. Il numero arriva con la sua spiegazione.',
        does: [
          'Interrogano il tuo database in linguaggio naturale: “quanti contatti sono diventati clienti questo mese, per canale?”',
          'Preparano ogni settimana il report che oggi qualcuno costruisce a mano, e lo mandano a chi serve',
          'Controllano i dati in continuo e avvisano quando qualcosa si scosta: un calo di conversioni, un incasso mancato, un doppione',
          'Riconciliano e riclassificano dati che arrivano da fonti diverse',
          'Spiegano cosa vedono e su quali numeri si basano, così nessuno deve fidarsi sulla parola',
        ],
        links: ['Database SQL', 'ERP', 'CRM', 'Fogli', 'Dashboard'],
        example: 'Ogni lunedì alle 8 arriva un messaggio: dove si è fermato il funnel, quali canali hanno reso, cosa è cambiato rispetto alla settimana scorsa. Con i dati veri e un link per scendere nel dettaglio.',
      },
      {
        id: 'crm',
        tag: 'CRM',
        t: 'Agenti di supporto al CRM',
        promise: 'Un CRM che si compila da solo e dice cosa fare dopo.',
        does: [
          'Aggiornano anagrafiche e pipeline da email, chiamate e messaggi: meno inserimento a mano',
          'Ripuliscono il database: doppioni, campi mancanti, schede da riunire',
          'Riassumono lo storico di un cliente prima di una telefonata o di una riunione',
          'Preparano la bozza di risposta a un’email: la rilegge una persona, e la invia lei',
          'Suggeriscono la prossima azione e ricordano scadenze, rinnovi e promesse fatte',
        ],
        links: ['CRM', 'Email', 'WhatsApp', 'Calendario', 'Ticket'],
        example: 'Entra un’email. L’agente riconosce chi scrive, ritrova la sua storia, scrive una bozza nel thread e la lascia lì. Nessuna risposta parte senza che una persona l’abbia vista.',
      },
    ],
    other: 'Non vedi il tuo caso? Dove c’è un processo che legge e scrive dati, un agente spesso può aiutare. Raccontaci il processo: ti diciamo se conviene.',
    otherCta: 'Parliamone',
  },
  proof: {
    kicker: 'In produzione',
    title: 'Già al lavoro, in un club vero.',
    text: 'Li abbiamo costruiti dentro Athlon Club, a Roma. Ogni agente è partito da un problema vissuto al banco e oggi lavora ogni giorno accanto al team.',
    items: [
      'Un assistente AI su sito e app risponde con le informazioni del club, rimanda al modulo giusto, e ogni richiesta arriva nel CRM già deduplicata.',
      'Un agente su WhatsApp risponde, propone la prova e passa la conversazione al desk quando serve una persona, nella casella condivisa del team.',
      'Le email in arrivo trovano una bozza di risposta già nel thread: una persona la rilegge e la invia lei.',
      'Le regole non si scavalcano: gli agenti non inventano, e davanti a una lamentela chiamano una persona.',
    ],
    cta: 'Leggi il caso Athlon',
  },
  steps: {
    kicker: 'Come lavoriamo',
    title: 'Un processo alla volta. Prima il risultato, poi la tecnologia.',
    items: [
      { t: 'Scegliamo un processo', d: 'Partiamo da un solo flusso: quello che costa più tempo o fa perdere più contatti. Misuriamo com’è oggi, per poter dire se funziona.' },
      { t: 'Colleghiamo i dati', d: 'API, database, webhook: l’agente legge dai tuoi sistemi e scrive solo dove gli abbiamo detto di scrivere. Il gestionale che hai si collega, non si sostituisce.' },
      { t: 'Lo addestriamo sul tuo contesto', d: 'Istruzioni, informazioni dell’azienda, regole e tono di voce. Lo proviamo su casi reali, anche quelli difficili, prima di metterlo davanti ai clienti.' },
      { t: 'Lo supervisioniamo', d: 'Un registro di ogni conversazione e di ogni azione, soglie oltre le quali decide una persona, e miglioramenti sui casi che non ha saputo risolvere.' },
    ],
  },
  control: {
    kicker: 'Controllo e sicurezza',
    title: 'Un agente utile è un agente con dei limiti.',
    items: [
      { t: 'Non inventa', d: 'Risponde dalle fonti che gli indichiamo. Se l’informazione non c’è, lo dice e passa a una persona.' },
      { t: 'Una persona nel giro', d: 'Le azioni a rischio — un rimborso, un contratto, un messaggio importante — aspettano l’approvazione di chi ne ha la responsabilità.' },
      { t: 'Permessi minimi', d: 'Sola lettura dove basta. Ogni agente può fare solo ciò che gli serve, sui soli dati che gli servono.' },
      { t: 'Tutto nel registro', d: 'Cosa ha letto, cosa ha deciso, cosa ha fatto. Si può rivedere, correggere e spiegare.' },
    ],
    gdpr: 'I dati personali sono trattati secondo il GDPR: consensi separati per scopo, solo i dati necessari, e modello e hosting scelti insieme a te in base a quanto i dati sono sensibili.',
  },
  faq: {
    kicker: 'Domande frequenti',
    title: 'Quello che ci chiedono sugli agenti AI.',
    items: [
      {
        q: 'Che cos’è un agente AI, e in cosa è diverso da un chatbot?',
        a: 'Un chatbot risponde alle domande. Un agente AI ha un obiettivo: legge i dati della tua azienda, decide il passo successivo e lo esegue sui tuoi strumenti — registra un contatto nel CRM, fissa un appuntamento, prepara un report — e passa la mano a una persona quando serve.',
      },
      {
        q: 'In cosa è diverso da un’automazione?',
        a: 'Un’automazione segue regole fisse: se succede X, fai Y. Funziona benissimo quando il processo non cambia. Un agente gestisce ciò che le regole non coprono: testi liberi, richieste sempre diverse, decisioni che richiedono contesto. Di solito li usiamo insieme: l’automazione fa scorrere i dati, l’agente decide.',
      },
      {
        q: 'Per quali processi conviene un agente AI?',
        a: 'Dove ci sono molti dati e un lavoro ripetitivo che richiede un po’ di giudizio: rispondere ai contatti e qualificarli, istruire le richieste di assistenza, aggiornare il CRM, preparare report, controllare i dati. Dove il processo è raro o ad alto rischio, partiamo con l’agente come assistente di una persona, non al suo posto.',
      },
      {
        q: 'Un agente AI può sbagliare? Come lo tenete sotto controllo?',
        a: 'Può, come una persona. Per questo lo progettiamo con dei limiti: risponde solo dalle fonti che gli indichiamo, se non sa lo dice, le azioni a rischio aspettano l’approvazione di una persona e tutto finisce in un registro che si può rivedere. Lo proviamo su casi reali prima di metterlo in produzione e lo miglioriamo sui casi che non risolve.',
      },
      {
        q: 'Funziona con il mio CRM o con il mio gestionale?',
        a: 'Quasi sempre sì. Ci colleghiamo tramite API, webhook o direttamente al database — anche un SQL Server su Windows — e non ti chiediamo di sostituire quello che usi. Se un sistema non ha interfacce, troviamo il modo più pulito di leggerne i dati.',
      },
      {
        q: 'I miei dati sono al sicuro? Come funziona con il GDPR?',
        a: 'I dati personali sono trattati secondo il GDPR: consensi separati per scopo, solo i dati necessari, permessi minimi per ogni agente e un registro di ciò che fa. Scegliamo con te modello e hosting in base a quanto i dati sono sensibili; i dati sulla salute si usano solo con un consenso esplicito.',
      },
      {
        q: 'Gli agenti AI sostituiscono le persone?',
        a: 'No. Tolgono il lavoro ripetitivo e lasciano alle persone quello in cui servono: la relazione, le eccezioni, le decisioni. Quando una situazione è delicata, l’agente passa la mano.',
      },
      {
        q: 'Quali modelli di intelligenza artificiale usate?',
        a: 'Scegliamo il modello in base al compito, al costo e alla sensibilità dei dati. Nei nostri progetti usiamo, ad esempio, i modelli Claude di Anthropic.',
      },
      {
        q: 'Da dove si comincia, e quanto costa?',
        a: 'Da un processo solo. Ascoltiamo come lavori, guardiamo i dati e ti diciamo, senza giri di parole, se un agente conviene e che risultato ci si può aspettare. Il costo dipende dal processo e dai sistemi da collegare: lo definiamo dopo l’audit, prima di scrivere codice.',
      },
    ],
  },
  cta: { title: 'Hai dati che aspettano di lavorare?', btn: 'Parliamone' },
};

const en: AgentsCopy = {
  jump: 'Four families of agents',
  what: {
    kicker: 'What an AI agent is',
    title: 'It doesn’t just answer. It works.',
    lead: 'An AI agent is software that reads your company’s data, understands what is going on, decides the next step and carries it out in your tools. When a case isn’t its to handle, it calls a person.',
    cols: [
      {
        tag: 'Automation',
        t: 'If X happens, do Y',
        d: 'Fixed rules, perfect for the steps that never change: a sync, a reminder, an invoice that goes out by itself.',
        ex: 'A payment arrives → the back office updates.',
      },
      {
        tag: 'Chatbot',
        t: 'Answers questions',
        d: 'It converses, but it usually stops there: it can’t see your CRM and doesn’t act on your systems. An answer, not a job done.',
        ex: 'Opening hours, prices, ready-made replies.',
      },
      {
        tag: 'AI agent',
        t: 'Has a goal and does the work',
        d: 'It reads the context, picks the steps, uses the tools — CRM, email, WhatsApp, databases — and hands over to a person when needed.',
        ex: 'Qualifies a lead, logs it in the CRM, books the appointment and alerts the salesperson.',
        hot: true,
      },
    ],
    note: 'They aren’t alternatives. Automations move the data; agents make the decisions that used to wait for a person. Together, a process runs by itself.',
  },
  data: {
    kicker: 'Where there’s data',
    title: 'Every piece of data is work waiting to happen.',
    text: 'Every company sits on data nobody has time to read: leads, conversations, contracts, orders, spreadsheets, documents. An agent reads all of it, every day, and does what today waits for someone to find five minutes.',
    sources: { t: 'Your data', items: ['CRM', 'ERP · Back office', 'SQL database', 'Email', 'WhatsApp', 'Website and forms', 'Spreadsheets and documents', 'E-commerce', 'Calendars'] },
    agent: { t: 'The agent', steps: ['Reads', 'Understands', 'Decides', 'Acts', 'Hands over'] },
    outputs: {
      t: 'The work, done',
      items: ['Lead qualified, appointment booked', 'Request solved, or ticket already prepared', 'Reports and alerts that arrive on their own', 'Customer record updated and clean', 'Draft reply ready to review'],
    },
    more: 'And where the data is something else — administration, contracts, stock, HR — the principle is the same: if a process reads and writes data, there is almost always an agent that can help.',
  },
  families: {
    kicker: 'What we build',
    title: 'Four agents. One goal: less work that doesn’t need doing.',
    sub: 'Each can live on its own or work with the others, on the same data and under the same rules.',
    links: 'Connects to',
    example: 'An example',
    items: [
      {
        id: 'vendita',
        tag: 'Sales',
        t: 'Sales agents',
        promise: 'No lead goes unanswered. No quote goes without follow-up.',
        does: [
          'Reply at once to anyone who writes from the website, WhatsApp or a form, at any hour',
          'Qualify the lead with the right questions and log it in the CRM, with no duplicates',
          'Offer the trial, the visit or the appointment and put it in the calendar',
          'Follow up on quotes and stalled requests, and reawaken dormant leads',
          'Hand the salesperson the hot lead, with the context already summarised',
        ],
        links: ['Website', 'WhatsApp', 'CRM', 'Calendar', 'Email'],
        example: 'A lead writes at 11:10 pm. The agent replies, understands what they want, offers two time slots and creates the record in the CRM. The next morning the salesperson finds an appointment, not a message to call back.',
      },
      {
        id: 'assistenza',
        tag: 'Support',
        t: 'Customer support agents',
        promise: 'The right answers, where people already write.',
        does: [
          'Answer from your company’s own information, not from what “sounds” right: if the answer isn’t there, they say so',
          'Handle the requests that keep coming back: opening hours, bookings, cancellations, documents, the status of a request',
          'Work on the website, in the app and on WhatsApp, in several languages',
          'Open the ticket already filled in and pass it to the right person with the conversation attached',
          'Recognise a complaint or a delicate case and hand over to a person straight away',
        ],
        links: ['Website', 'App', 'WhatsApp', 'Email', 'Tickets'],
        example: 'A customer asks how to cancel. The agent checks the rule, explains it in two lines and says where to do it. If the case is personal, it opens the ticket with all the context and alerts the team.',
      },
      {
        id: 'analisi-dati',
        tag: 'Data analysis',
        t: 'Data analysis agents',
        promise: 'Ask the question. The number comes with its explanation.',
        does: [
          'Query your database in plain language: “how many leads became customers this month, by channel?”',
          'Prepare, every week, the report someone builds by hand today, and send it to whoever needs it',
          'Watch the data continuously and warn when something drifts: a drop in conversions, a missed payment, a duplicate',
          'Reconcile and reclassify data that comes from different sources',
          'Explain what they see and which numbers it rests on, so nobody has to take it on trust',
        ],
        links: ['SQL database', 'ERP', 'CRM', 'Spreadsheets', 'Dashboards'],
        example: 'Every Monday at 8 a message arrives: where the funnel stalled, which channels paid off, what changed since last week. With the real data and a link to dig deeper.',
      },
      {
        id: 'crm',
        tag: 'CRM',
        t: 'CRM support agents',
        promise: 'A CRM that fills itself in and tells you what to do next.',
        does: [
          'Update records and pipeline from emails, calls and messages: less typing by hand',
          'Clean up the database: duplicates, missing fields, records to merge',
          'Summarise a customer’s history before a call or a meeting',
          'Prepare the draft reply to an email: a person reads it, and sends it',
          'Suggest the next action and remind you of deadlines, renewals and promises made',
        ],
        links: ['CRM', 'Email', 'WhatsApp', 'Calendar', 'Tickets'],
        example: 'An email comes in. The agent recognises the sender, finds their history, writes a draft in the thread and leaves it there. No reply goes out without a person having seen it.',
      },
    ],
    other: 'Don’t see your case? Wherever a process reads and writes data, an agent can often help. Tell us the process: we’ll tell you whether it’s worth it.',
    otherCta: 'Let’s talk',
  },
  proof: {
    kicker: 'In production',
    title: 'Already at work, in a real club.',
    text: 'We built them inside Athlon Club, in Rome. Each agent started from a problem lived at the front desk, and today works every day beside the team.',
    items: [
      'An AI assistant on the website and app answers with the club’s information, points to the right form, and every request lands in the CRM already de-duplicated.',
      'An agent on WhatsApp answers, offers the trial and hands the conversation to the desk when a person is needed, in the team’s shared inbox.',
      'Incoming emails find a draft reply already in the thread: a person reads it and sends it.',
      'The rules can’t be bypassed: the agents don’t make things up, and in front of a complaint they call a person.',
    ],
    cta: 'Read the Athlon case',
  },
  steps: {
    kicker: 'How we work',
    title: 'One process at a time. The result first, the technology second.',
    items: [
      { t: 'We pick one process', d: 'We start from a single flow: the one that costs the most time or loses the most leads. We measure how it is today, so we can say whether it works.' },
      { t: 'We connect the data', d: 'APIs, databases, webhooks: the agent reads from your systems and writes only where we told it to. The back office you have gets connected, not replaced.' },
      { t: 'We train it on your context', d: 'Instructions, company information, rules and tone of voice. We test it on real cases, the hard ones too, before putting it in front of customers.' },
      { t: 'We supervise it', d: 'A log of every conversation and every action, thresholds beyond which a person decides, and improvements on the cases it couldn’t solve.' },
    ],
  },
  control: {
    kicker: 'Control and safety',
    title: 'A useful agent is an agent with limits.',
    items: [
      { t: 'It doesn’t make things up', d: 'It answers from the sources we point it to. If the information isn’t there, it says so and hands over to a person.' },
      { t: 'A person in the loop', d: 'Risky actions — a refund, a contract, an important message — wait for the approval of whoever is responsible for them.' },
      { t: 'Minimum permissions', d: 'Read-only where that’s enough. Each agent can do only what it needs, on only the data it needs.' },
      { t: 'Everything in the log', d: 'What it read, what it decided, what it did. It can be reviewed, corrected and explained.' },
    ],
    gdpr: 'Personal data is handled under the GDPR: consent split by purpose, only the data that’s needed, and the model and hosting chosen with you according to how sensitive the data is.',
  },
  faq: {
    kicker: 'Frequently asked questions',
    title: 'What people ask us about AI agents.',
    items: [
      {
        q: 'What is an AI agent, and how is it different from a chatbot?',
        a: 'A chatbot answers questions. An AI agent has a goal: it reads your company’s data, decides the next step and carries it out in your tools — logs a lead in the CRM, books an appointment, prepares a report — and hands over to a person when needed.',
      },
      {
        q: 'How is it different from an automation?',
        a: 'An automation follows fixed rules: if X happens, do Y. It works very well when the process doesn’t change. An agent handles what rules don’t cover: free text, requests that are different every time, decisions that need context. We usually use them together: the automation moves the data, the agent decides.',
      },
      {
        q: 'Which processes is an AI agent worth it for?',
        a: 'Where there is a lot of data and repetitive work that still needs a bit of judgement: answering and qualifying leads, preparing support requests, updating the CRM, building reports, checking the data. Where the process is rare or high-risk, we start with the agent as a person’s assistant, not in their place.',
      },
      {
        q: 'Can an AI agent make mistakes? How do you keep it under control?',
        a: 'It can, like a person. That’s why we design it with limits: it answers only from the sources we point it to, it says so when it doesn’t know, risky actions wait for a person’s approval and everything goes into a log that can be reviewed. We test it on real cases before going live and improve it on the cases it doesn’t solve.',
      },
      {
        q: 'Does it work with my CRM or back-office software?',
        a: 'Almost always. We connect through APIs, webhooks or straight to the database — even a SQL Server on Windows — and we don’t ask you to replace what you use. If a system has no interfaces, we find the cleanest way to read its data.',
      },
      {
        q: 'Is my data safe? How does it work with the GDPR?',
        a: 'Personal data is handled under the GDPR: consent split by purpose, only the data that’s needed, minimum permissions for each agent and a log of what it does. We choose the model and hosting with you according to how sensitive the data is; health data is used only with explicit consent.',
      },
      {
        q: 'Do AI agents replace people?',
        a: 'No. They take away the repetitive work and leave people the part where they matter: the relationship, the exceptions, the decisions. When a situation is delicate, the agent hands over.',
      },
      {
        q: 'Which AI models do you use?',
        a: 'We pick the model by task, cost and how sensitive the data is. In our own projects we use, for example, Anthropic’s Claude models.',
      },
      {
        q: 'Where do we start, and what does it cost?',
        a: 'With a single process. We listen to how you work, look at the data and tell you, straight, whether an agent is worth it and what result to expect. The cost depends on the process and the systems to connect: we define it after the audit, before writing any code.',
      },
    ],
  },
  cta: { title: 'Got data waiting to go to work?', btn: 'Let’s talk' },
};

export const agents: Record<Lang, AgentsCopy> = { it, en };
