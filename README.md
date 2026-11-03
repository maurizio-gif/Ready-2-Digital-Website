# Ready2Digital — sito

Sito di Ready2Digital, bilingue, costruito attorno al marchio che si scompone e si ricompone.

**Pagine** (`src/router.ts`, composte in `src/components/Pages.tsx`):

| Pagina | Italiano | Inglese |
|---|---|---|
| Home | `/` | `/en` |
| Soluzioni | `/soluzioni` (ancore `#siti`, `#crm`…) | `/en/solutions` |
| Agenti AI | `/agenti-ai` (ancore `#vendita`, `#assistenza`, `#analisi-dati`, `#crm`, `#faq`) | `/en/ai-agents` |
| Progetti | `/progetti`, `/progetti/<caso>` | `/en/work`, `/en/work/<caso>` |
| Metodo | `/metodo` | `/en/method` |
| Tecnologia | `/tecnologia` | `/en/technology` |
| Chi siamo | `/chi-siamo` | `/en/about` |
| Contatti | `/contatti` | `/en/contact` |
| Privacy | `/privacy` | `/en/privacy` |

Il menu (con i pannelli di Soluzioni e Progetti), le intestazioni delle pagine e la pagina Chi siamo
stanno in `src/pages.ts`.

- **Stack:** Vite + React 19 + TypeScript, GSAP (ScrollTrigger) per le animazioni,
  Lenis per lo scroll fluido. Font serviti dal sito stesso (`@fontsource`): nessuna
  chiamata esterna e nessun cookie.
- **Il marchio è codice, non un'immagine:** `src/lib/mark.ts` contiene la geometria
  (sei cerchi su una griglia di 64, misurati dal PNG ufficiale) e `src/lib/metaball.ts`
  disegna i «colli» gommosi tra i cerchi. Quando i cerchi si allontanano il collo si
  assottiglia e si stacca: è quello che fa la scena d'apertura (`src/components/Hero.tsx`).
- **La scena d'apertura** è legata allo scroll in quattro atti: il marchio → i sistemi
  scollegati («Tanti strumenti») → il percorso unico → il marchio ricomposto («Ready»).
  Gira sul ticker di GSAP senza render di React a ogni frame e rispetta
  `prefers-reduced-motion`.
- **I testi** stanno tutti in `src/content.ts`, italiano e inglese. La lingua si sceglie
  dall'intestazione, da `?lang=en` o dalla lingua del browser.
- **Le pagine dei casi** (`/progetti/athlon`, `/progetti/ronchiverdi`, `/progetti/tennis-club-ambrosiano`,
  `/progetti/passion-fitness`; i vecchi `/casi/…` rimandano lì): testi in `src/cases.ts`, schermate ricostruite e animate in
  `src/components/Mocks.tsx`. I numeri dentro le schermate sono **di esempio, anonimi** (la pagina
  lo dice); i numeri veri del progetto sono solo quelli di `metrics`. Il router è
  `src/router.ts`. Ogni indirizzo ha il suo file HTML già pronto (vedi «SEO e prerender»).
- **«Dal vivo»** (`src/real.ts`, `src/components/RealScreens.tsx`, immagini in `public/images/real/<caso>/`):
  schermate reali catturate dai siti e dalle app pubbliche (desktop 1600×1000 webp, telefono 780×1328),
  in cornici di browser e telefono con ingrandimento. Quello che sta dietro login (cruscotti dei CRM,
  app da socio) non c'è: arriva da screenshot forniti dal cliente, da aggiungere nello stesso elenco.
- **«Come è fatto»** (`src/tech.ts`, `src/components/Tech.tsx`): in ogni pagina caso l'architettura
  a strati, i pezzi (Astro, Next.js, Expo, Supabase, Edge Functions, automazioni, AI) e i numeri
  presi dai repository; in home «Lo stack, spiegato semplice».
- **La pagina Agenti AI** (`src/agents.ts` per i testi, `src/components/Agents.tsx` per la pagina e per la
  fascia in home): cos'è un agente (contro automazione e chatbot), le quattro famiglie (vendita, assistenza,
  analisi dati, supporto al CRM), dove già lavorano (Athlon), come si lavora, i limiti, le FAQ. **Nessun numero
  inventato**: dove dice «in produzione» rimanda al caso Athlon; il resto è scritto come quello che un agente
  *può* fare, non come un risultato misurato. Le FAQ sono anche dati strutturati `FAQPage`.
- **Gli intermezzi «connecting dots»** (`src/components/Dots.tsx`): puntini che si fondono come i
  cerchi del marchio, una rete neurale con i segnali, puntini che convergono nel marchio.
- **`public/demo/garden/`** resta servita com'era (`/demo/garden/`).

```
npm install
npm run dev      # sviluppo
npm run build    # produzione in dist/ (client + prerender di ogni pagina)
```

## SEO e prerender

Il sito è una single-page app, ma **ogni indirizzo esce dal build come un HTML già compilato**, con il
suo titolo, la sua descrizione e il suo testo. Prima `dist/index.html` era una pagina vuota con il titolo
della home, servita per ogni URL: i motori che non eseguono JavaScript — e i crawler degli assistenti AI,
che quasi mai lo fanno — non vedevano niente.

`npm run build` fa tre cose, in ordine:

1. `vite build` — l'app per il browser, come prima.
2. `vite build --ssr src/entry-server.tsx --outDir dist-ssr` — la stessa app, per il server.
3. `node scripts/prerender.mjs` — la renderizza una volta per indirizzo e scrive `dist/<percorso>/index.html`
   (26 pagine: 13 per lingua), più `404.html` (noindex), `sitemap.xml`, `robots.txt` e `llms.txt`. **Fa fallire
   il build** se una pagina esce senza `<h1>`: pubblicare pagine vuote in silenzio è peggio che non pubblicare.

Il browser poi avvia l'app sopra l'HTML, come prima; la tendina di caricamento copre il passaggio.

- **Cosa c'è in ogni `<head>`** lo decide `src/seo.ts`, in un punto solo: titolo e descrizione (scritti a mano,
  non ricavati dalle intestazioni: quelle si leggono sulla pagina, queste in un elenco di risultati), canonical,
  `hreflang` (it, en, x-default), Open Graph, Twitter Card e dati strutturati JSON-LD (Organization, Person,
  WebSite, WebPage con briciole di pane; in più `Service` + `FAQPage` su Agenti AI e `Service` con il catalogo
  su Soluzioni). Lo stesso modulo aggiorna il `<head>` quando si naviga senza ricaricare (`applyHead`).
- **Il dominio** è `https://www.ready2digital.it` (`src/site.ts`). Anche le anteprime Vercel e GitHub Pages
  dichiarano quello come canonical, così non competono con il sito vero. Si cambia solo con `VITE_SITE_URL`.
- **Un indirizzo che non esiste** risponde 404 (la pagina `404.html`, `noindex`, senza canonical). Prima i
  rewrite di `vercel.json` rispondevano 200 anche a `/progetti/qualunque-cosa`, che mostrava la pagina Progetti.
- **Le immagini per le anteprime** (`public/images/og/`, 1200×630) si rifanno con `node scripts/og-images.mjs`
  (serve Playwright con Chromium): sono fuori dal build perché cambiano con i titoli, non a ogni deploy.
- **I redirect del vecchio sito WordPress** sono in `vercel.json` (301): le 19 pagine che aveva in indice
  puntano ciascuna all'equivalente nuovo, con o senza slash finale. Scattano solo quando il dominio punta a
  questo progetto.

### Aggiungere una pagina

Il build non può sapere da solo che una pagina esiste: va dichiarata in quattro posti, e se ne manca uno il
sito se ne accorge in modo diverso.

1. `src/router.ts` — il tipo `Page` e `PATHS` (percorso in italiano e in inglese). **Senza, la pagina non
   esiste nemmeno per il prerender.**
2. `src/seo.ts` — titolo e descrizione in `META` (italiano e inglese). Il compilatore avvisa se manca.
3. `src/App.tsx` — il `case` che sceglie il componente della pagina.
4. `src/pages.ts` — intestazione (`heroes`), etichetta «Continua» (`nextLabels`) e, se va nel menu, `menu.items`.

Poi `npm run build`: deve dire una pagina in più per lingua. Una cosa da non fare: scrivere in una pagina un
`<h1>` solo dentro un effetto o dopo un evento — il prerender non esegue né gli uni né gli altri, e il build
si ferma.

### Da fare quando il dominio passa a questo sito

Il dominio `www.ready2digital.it` serve ancora il vecchio sito WordPress. Al passaggio: collegare il dominio
al progetto Vercel e togliere il vecchio sito dall'indice con i redirect già pronti; inviare `sitemap.xml` in
Search Console (e in Bing Webmaster Tools); controllare che `robots.txt` risponda dal dominio nuovo.


Deploy: Vercel (root del dominio; `vercel.json` reindirizza i vecchi indirizzi `/it/…`
e `/en/…`) e GitHub Pages (`.github/workflows/deploy.yml`, con `BASE_PATH`).

## Modulo contatti e privacy

- Il modulo (`src/components/ContactForm.tsx`) chiede una cosa per volta: nome e cognome, email e
  cellulare, azienda, bisogni, progetto, consensi (privacy obbligatorio, marketing facoltativo).
  Il marchio fa da barra di avanzamento.
- **Dove arrivano le richieste:** con `CONTACT_ENDPOINT` vuoto (in `src/legal.ts`) il modulo apre il
  programma di posta con il messaggio pronto per info@ready2digital.it. Impostandolo su un webhook
  (per esempio n8n) il modulo invia la richiesta in JSON, consensi compresi.
- **Dati societari** (dalla visura del 14/01/2025) in `COMPANY` (`src/legal.ts`): li usano
  l'informativa e il footer.
- **Cookie:** il sito non installa cookie propri; il banner sarà CookieYes, da aggiungere con il suo
  script in `index.html` una volta attivo sul dominio.

## Contact form → email (SendGrid)

The form POSTs its JSON to `/api/contact` (`api/contact.js`, a Vercel serverless function), which sends the request by email through SendGrid. Nothing is stored. Environment variables, set in Vercel → Settings → Environment Variables (Production and Preview), then redeploy:

| Variable | What | Secret |
| --- | --- | --- |
| `SENDGRID_API_KEY` | SendGrid API key with the «Mail Send» permission | yes |
| `CONTACT_TO_EMAIL` | where the requests arrive | no |
| `CONTACT_FROM_EMAIL` | sender shown on the email; must be a sender verified in SendGrid (Single Sender or an authenticated domain). Optional: defaults to `CONTACT_TO_EMAIL` | no |

Without the function (local dev server, a static preview) the form falls back to the visitor's mail app. A hidden field (`ufficio_riferimento`) catches simple bots, and the function only accepts requests from its own origin.
