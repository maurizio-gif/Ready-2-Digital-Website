# Ready2Digital — sito

Sito di Ready2Digital: una pagina sola, bilingue (IT/EN), costruita attorno al marchio
che si scompone e si ricompone.

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
- **Le pagine dei casi** (`/casi/athlon`, `/casi/ronchiverdi`, `/casi/tennis-club-ambrosiano`,
  `/casi/passion-fitness`): testi in `src/cases.ts`, schermate ricostruite e animate in
  `src/components/Mocks.tsx`. I numeri dentro le schermate sono **di esempio, anonimi** (la pagina
  lo dice); i numeri veri del progetto sono solo quelli di `metrics`. Il router è
  `src/router.ts`; Vercel riscrive `/casi/*` su `index.html`, GitHub Pages usa `404.html`.
- **«Come è fatto»** (`src/tech.ts`, `src/components/Tech.tsx`): in ogni pagina caso l'architettura
  a strati, i pezzi (Astro, Next.js, Expo, Supabase, Edge Functions, automazioni, AI) e i numeri
  presi dai repository; in home «Lo stack, spiegato semplice».
- **Gli intermezzi «connecting dots»** (`src/components/Dots.tsx`): puntini che si fondono come i
  cerchi del marchio, una rete neurale con i segnali, puntini che convergono nel marchio.
- **`public/demo/garden/`** resta servita com'era (`/demo/garden/`).

```
npm install
npm run dev      # sviluppo
npm run build    # produzione in dist/
```

Deploy: Vercel (root del dominio; `vercel.json` reindirizza i vecchi indirizzi `/it/…`
e `/en/…`) e GitHub Pages (`.github/workflows/deploy.yml`, con `BASE_PATH`).
