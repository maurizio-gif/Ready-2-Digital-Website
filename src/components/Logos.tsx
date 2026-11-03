// I loghi dei clienti, quelli veri, animati: ognuno si compone davanti agli occhi, una volta quando
// entra nello schermo e di nuovo al passaggio del mouse sulla carta che lo ospita (`[data-logo-host]`,
// o un evento `logo:play` mandato dal menu quando si apre).
//
// Due sono le animazioni che i clienti già conoscono, portate qui dal loro codice:
//   - Athlon: l'avvio del pannello (`src/features/lab/avvio/Avvio.tsx` di PORTALE-ATHLON): il
//     pittogramma si disegna con una punta luminosa, le due metà arrivano da lati opposti e si
//     incastrano, il fuoco sale a riempirle, un riflesso le attraversa e il logo respira una volta.
//   - Ronchiverdi: l'avvio del CRM (`lib/avvio-disegno.ts` di APP-RONCHIVERDI): la pallina da tennis
//     gira su se stessa e, girando, si cuce; si ferma di fronte, nella posizione del logo; nella
//     versione grande arriva anche la scritta.
// Gli altri due seguono la stessa grammatica: TCA si scrive da sinistra a destra con la punta della
// penna; Passion disegna la cornice col tratto, poi le lettere arrivano una per una e «FITNESS CLUB»
// si batte a macchina.
//
// **Tutto è una funzione pura del tempo** `t` (ms dall'inizio): un solo orologio
// (requestAnimationFrame) scrive `t` e ogni elemento si calcola da lì. Con «riduci movimento» non si
// muove niente: si vede il logo finito.

import { useEffect, useId, useRef, useState, type RefObject } from 'react';
import { reducedMotion } from '../lib/env';
import { ATHLON_FORME, ATHLON_H, ATHLON_W, percorso, perimetro, puntoSu } from '../lib/logo-athlon';
import { RV_CUCITURA, RV_SCRITTA, RV_SPESSORE, RV_SPORT_CLUB } from '../lib/logo-ronchiverdi';
import { PASSION_FRAME, PASSION_I, PASSION_LETTERS, PASSION_VB } from '../lib/logo-passion';

export type LogoKey = 'athlon' | 'ronchiverdi' | 'tca' | 'passion';

/** Il logo di ogni cliente, dal nome con cui compare nelle carte e nei casi. */
export const LOGO_OF: Record<string, LogoKey> = {
  'Athlon Club 4.0': 'athlon',
  'Ronchiverdi Sport Club': 'ronchiverdi',
  Ronchiverdi: 'ronchiverdi',
  'Tennis Club Ambrosiano': 'tca',
  'Passion Fitness': 'passion',
};

const asset = (p: string) => `${import.meta.env.BASE_URL}${p}`;

// ───────────────────────────────────────────────────────────── il tempo

const limita = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
/** Quanto è avanzato un movimento che parte a `inizio` e dura `durata`: da 0 a 1. */
const fase = (t: number, inizio: number, durata: number) => limita((t - inizio) / durata);
/** Parte veloce e rallenta (ease-out cubico). */
const rallenta = (x: number) => 1 - Math.pow(1 - x, 3);
/** Più netto di `rallenta`: per le cose che «scattano». */
const scatta = (x: number) => 1 - Math.pow(1 - x, 5);
/** Supera il traguardo e torna indietro (ease-out-back): le cose che si incastrano. */
const rimbalzo = (x: number) => {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
};
/** Parte piano, accelera e rallenta (ease-in-out cubico). */
const dolce = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
/** Un picco attorno a `centro`, largo `larghezza` ms: da 0 a 1 e di nuovo a 0. */
const impulso = (t: number, centro: number, larghezza: number) => Math.exp(-Math.pow((t - centro) / larghezza, 2));

/**
 * L'orologio di un logo: parte quando il logo entra nello schermo, riparte al passaggio del mouse
 * sull'elemento che lo ospita (`[data-logo-host]`) o a un evento `logo:play`. Con «riduci movimento»
 * sta fermo alla fine.
 */
function useLogoClock(ref: RefObject<HTMLElement | null>, duration: number): number {
  const [t, setT] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (reducedMotion()) {
      setT(duration);
      return;
    }
    let raf = 0;
    let start = 0;
    let playing = false;
    const tick = (now: number) => {
      const ms = now - start;
      setT(Math.min(ms, duration));
      if (ms < duration) raf = requestAnimationFrame(tick);
      else playing = false;
    };
    const play = () => {
      if (playing) return;
      playing = true;
      start = performance.now();
      raf = requestAnimationFrame(tick);
    };
    const io = new IntersectionObserver(
      (es) => {
        if (es.some((e) => e.isIntersecting)) {
          play();
          io.disconnect();
        }
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    const host = (el.closest('[data-logo-host]') as HTMLElement | null) ?? el;
    host.addEventListener('mouseenter', play);
    host.addEventListener('logo:play', play);
    return () => {
      io.disconnect();
      host.removeEventListener('mouseenter', play);
      host.removeEventListener('logo:play', play);
      cancelAnimationFrame(raf);
    };
  }, [ref, duration]);
  return t;
}

// ───────────────────────────────────────────────────────────── Athlon

const ATH_L = ATHLON_FORME.map((f) => perimetro(f.punti));
const ATH_D = ATHLON_FORME.map((f) => percorso(f.punti));
const ATH_T = 2200;
const ATH_SCATTO = 1100;
const FUOCO = ['#FFB070', '#FF8A2B', '#FF5701', '#E84300'] as const;

function Athlon({ t, big }: { t: number; big: boolean }) {
  const id = useId().replace(/:/g, '');
  const W = ATHLON_W;
  const H = ATHLON_H;
  const pad = 36;
  const volo = rimbalzo(fase(t, 480, 600));
  const riempimento = rallenta(fase(t, 720, 450));
  const respiro = 1 + 0.035 * impulso(t, 1650, 190);
  const scala = respiro * (0.92 + 0.08 * rallenta(fase(t, 0, 800)));
  const anello = fase(t, ATH_SCATTO, 900);
  const alone = 0.5 * rallenta(fase(t, 600, 800)) * (1 + 0.5 * impulso(t, ATH_SCATTO, 220));
  const tratto = big ? 5 : 9;
  return (
    <svg viewBox={`${-pad} ${-pad} ${W + 2 * pad} ${H + 2 * pad}`} className="logo__svg" aria-hidden="true">
      <defs>
        <linearGradient id={`${id}-fuoco`} x1="0" y1="0" x2={W} y2={H} gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={FUOCO[1]} />
          <stop offset="0.55" stopColor={FUOCO[2]} />
          <stop offset="1" stopColor={FUOCO[3]} />
        </linearGradient>
        <linearGradient id={`${id}-tratto`} x1="0" y1="0" x2={W} y2={H} gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#FF8A2B" />
          <stop offset="1" stopColor="#D83C00" />
        </linearGradient>
        <linearGradient id={`${id}-lama`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#FFFFFF" stopOpacity="0" />
          <stop offset="0.5" stopColor="#FFFFFF" stopOpacity="0.75" />
          <stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>
        <radialGradient id={`${id}-alone`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#FF6000" stopOpacity="0.35" />
          <stop offset="1" stopColor="#FF6000" stopOpacity="0" />
        </radialGradient>
        <clipPath id={`${id}-forme`}>
          {ATH_D.map((d, i) => (
            <path key={ATHLON_FORME[i].id} d={d} />
          ))}
        </clipPath>
      </defs>
      <rect x={-pad} y={-pad} width={W + 2 * pad} height={H + 2 * pad} fill={`url(#${id}-alone)`} opacity={alone} />
      {anello > 0 && anello < 1 ? (
        <circle cx={W / 2} cy={H / 2} r={W * 0.4 * (0.75 + 0.7 * scatta(anello))} fill="none" stroke="#FF6000" strokeWidth={(1.6 * (1 - anello) + 0.4) * (big ? 1 : 2)} opacity={0.6 * Math.pow(1 - anello, 1.6)} />
      ) : null}
      <g transform={`translate(${W / 2} ${H / 2}) scale(${scala}) translate(${-W / 2} ${-H / 2})`}>
        {ATHLON_FORME.map((f, i) => {
          const inizio = i === 0 ? 0 : 180;
          const disegno = rallenta(fase(t, inizio, 950));
          const L = ATH_L[i];
          const dx = f.da[0] * (1 - volo);
          const dy = f.da[1] * (1 - volo);
          const punta = puntoSu(f.punti, disegno * L);
          const penna = disegno > 0.005 && disegno < 0.995;
          return (
            <g key={f.id} transform={`translate(${dx} ${dy})`}>
              <path d={ATH_D[i]} fill={`url(#${id}-fuoco)`} fillOpacity={riempimento} />
              <path
                d={ATH_D[i]}
                fill="none"
                stroke={`url(#${id}-tratto)`}
                strokeWidth={tratto}
                strokeLinejoin="round"
                strokeLinecap="round"
                strokeDasharray={`${L} ${L}`}
                strokeDashoffset={L * (1 - disegno)}
                opacity={disegno > 0.002 ? 1 - rallenta(fase(t, 1050, 500)) : 0}
              />
              {penna ? (
                <>
                  <circle cx={punta[0]} cy={punta[1]} r={big ? 16 : 24} fill="#FF8A2B" opacity={0.3} />
                  <circle cx={punta[0]} cy={punta[1]} r={big ? 7 : 11} fill="#FF6000" opacity={0.8} />
                  <circle cx={punta[0]} cy={punta[1]} r={big ? 3.2 : 5} fill="#FFFFFF" />
                </>
              ) : null}
            </g>
          );
        })}
        <g clipPath={`url(#${id}-forme)`}>
          <rect x={-160 + 600 * rallenta(fase(t, 1250, 700))} y={-30} width={90} height={H + 60} fill={`url(#${id}-lama)`} transform="skewX(-22)" opacity={fase(t, 1250, 80) * (1 - fase(t, 1800, 160))} />
        </g>
      </g>
    </svg>
  );
}

// ───────────────────────────────────────────────────────────── Ronchiverdi

type P3 = { u: number; v: number; z: number };
type Ruotato = { x: number; v: number; z: number };

const CHAMPAGNE_CHIARO = '#f1e8d0';
const CHAMPAGNE_MEDIO = '#d4c49b';
const CHAMPAGNE_SCURO = '#a89a76';
const SOLCO = '#16140f';

function suSfera(p: readonly [number, number]): P3 {
  const r = Math.hypot(p[0], p[1]);
  const u = r > 1 ? p[0] / r : p[0];
  const v = r > 1 ? p[1] / r : p[1];
  return { u, v, z: Math.sqrt(Math.max(0, 1 - u * u - v * v)) };
}
const RV_DAVANTI = RV_CUCITURA.map(suSfera);
const RV_DIETRO = RV_DAVANTI.map((p) => ({ u: -p.u, v: p.v, z: -p.z }));
const RV_FELTRO = (() => {
  let seme = 20261029;
  const caso = () => {
    seme = (seme * 1664525 + 1013904223) >>> 0;
    return seme / 4294967296;
  };
  return Array.from({ length: 240 }, () => {
    const z = caso() * 2 - 1;
    const a = caso() * Math.PI * 2;
    const r = Math.sqrt(1 - z * z);
    return { u: r * Math.cos(a), v: z, z: r * Math.sin(a), raggio: 0.012 + caso() * 0.014, chiaro: caso() > 0.5 };
  });
})();

/** Le tappe della pallina (ms). Nella versione grande, dopo la pallina arrivano le scritte. */
const RV = { giraDa: 100, giraA: 1850, cuciturDa: 320, cuciturA: 1500, assestaDa: 1400, assestaA: 2000, scatto: 1850, riflessoDa: 1950, riflessoA: 2600, scrittaDa: 1950, scrittaA: 2800, sportClubDa: 2600, sportClubA: 3050 };
const RV_T_TILE = 2650;
const RV_T_LOCKUP = 3300;
const RV_GIRI = 2;

const ruota = (p: P3, teta: number): Ruotato => {
  const c = Math.cos(teta);
  const s = Math.sin(teta);
  return { x: p.u * c + p.z * s, v: p.v, z: -p.u * s + p.z * c };
};
const angoloPallina = (t: number) => RV_GIRI * 2 * Math.PI * (1 - Math.pow(1 - fase(t, RV.giraDa, RV.giraA - RV.giraDa), 2.6));
const cucituraDisegnata = (t: number) => dolce(fase(t, RV.cuciturDa, RV.cuciturA - RV.cuciturDa));

function pallina(ctx: CanvasRenderingContext2D, cx: number, cy: number, R: number, t: number) {
  const teta = angoloPallina(t);
  const p = cucituraDisegnata(t);
  const feltro = 1 - fase(t, RV.assestaDa, 650);
  const rilievo = 0.55 + 0.45 * feltro;

  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, R, 0, Math.PI * 2);
  ctx.clip();

  // Il metallo spazzolato: un gradiente conico, che ruota pianissimo.
  if (typeof ctx.createConicGradient === 'function') {
    const g = ctx.createConicGradient(0.5 - teta * 0.04, cx, cy);
    const toni = [CHAMPAGNE_CHIARO, CHAMPAGNE_SCURO, CHAMPAGNE_CHIARO, CHAMPAGNE_MEDIO, CHAMPAGNE_SCURO, CHAMPAGNE_CHIARO, CHAMPAGNE_MEDIO, CHAMPAGNE_SCURO];
    toni.forEach((c, i) => g.addColorStop(i / toni.length, c));
    g.addColorStop(1, toni[0]);
    ctx.fillStyle = g;
  } else {
    const g = ctx.createRadialGradient(cx - R * 0.3, cy - R * 0.3, R * 0.1, cx, cy, R);
    g.addColorStop(0, CHAMPAGNE_CHIARO);
    g.addColorStop(1, CHAMPAGNE_SCURO);
    ctx.fillStyle = g;
  }
  ctx.beginPath();
  ctx.arc(cx, cy, R, 0, Math.PI * 2);
  ctx.fill();

  // Il feltro: puntini sulla sfera, che girano con lei.
  if (feltro > 0.01) {
    for (const f of RV_FELTRO) {
      const q = ruota(f, teta);
      if (q.z < 0.04) continue;
      ctx.fillStyle = f.chiaro ? `rgba(255, 252, 240, ${0.28 * feltro * q.z})` : `rgba(70, 58, 34, ${0.22 * feltro * q.z})`;
      ctx.beginPath();
      ctx.arc(cx + q.x * R, cy + q.v * R, f.raggio * R * (0.5 + 0.5 * q.z), 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Le cuciture: davanti e dietro, prima il filo chiaro poi il solco scuro.
  if (p > 0) {
    const N = RV_DAVANTI.length;
    const limite = Math.min(1, p) * (N - 1);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    for (const copia of [RV_DIETRO, RV_DAVANTI]) {
      const P = copia.map((q) => ruota(q, teta));
      for (const passata of ['luce', 'solco'] as const) {
        for (let i = 0; i < N - 1 && i < limite; i++) {
          let a = P[i];
          let b = P[i + 1];
          if (limite - i < 1) b = { x: a.x + (b.x - a.x) * (limite - i), v: a.v + (b.v - a.v) * (limite - i), z: a.z + (b.z - a.z) * (limite - i) };
          if (a.z <= 0 && b.z <= 0) continue;
          if (a.z <= 0) a = { x: a.x + (b.x - a.x) * (-a.z / (b.z - a.z)), v: a.v + (b.v - a.v) * (-a.z / (b.z - a.z)), z: 0 };
          else if (b.z <= 0) b = { x: a.x + (b.x - a.x) * (a.z / (a.z - b.z)), v: a.v + (b.v - a.v) * (a.z / (a.z - b.z)), z: 0 };
          const scorcio = Math.pow(Math.max((a.z + b.z) / 2, 0.1), 0.65);
          const spessore = RV_SPESSORE * R * scorcio;
          ctx.beginPath();
          if (passata === 'luce') {
            ctx.strokeStyle = 'rgba(255, 250, 235, 0.42)';
            ctx.lineWidth = spessore + R * 0.028;
            ctx.moveTo(cx + a.x * R + R * 0.012, cy + a.v * R + R * 0.014);
            ctx.lineTo(cx + b.x * R + R * 0.012, cy + b.v * R + R * 0.014);
          } else {
            ctx.strokeStyle = SOLCO;
            ctx.lineWidth = spessore;
            ctx.moveTo(cx + a.x * R, cy + a.v * R);
            ctx.lineTo(cx + b.x * R, cy + b.v * R);
          }
          ctx.stroke();
        }
      }
    }
  }

  // La luce, ferma in alto a sinistra: la sfera gira, la luce no.
  const luce = ctx.createRadialGradient(cx - R * 0.38, cy - R * 0.42, 0, cx - R * 0.38, cy - R * 0.42, R * 1.05);
  luce.addColorStop(0, `rgba(255, 252, 240, ${0.5 * rilievo})`);
  luce.addColorStop(0.5, `rgba(255, 252, 240, ${0.1 * rilievo})`);
  luce.addColorStop(1, 'rgba(255, 252, 240, 0)');
  ctx.fillStyle = luce;
  ctx.fillRect(cx - R, cy - R, R * 2, R * 2);
  const bordo = ctx.createRadialGradient(cx, cy, R * 0.6, cx, cy, R);
  bordo.addColorStop(0, 'rgba(12, 10, 6, 0)');
  bordo.addColorStop(1, `rgba(12, 10, 6, ${0.5 * rilievo})`);
  ctx.fillStyle = bordo;
  ctx.fillRect(cx - R, cy - R, R * 2, R * 2);

  // La punta luminosa della «penna» che cuce.
  if (p > 0.003 && p < 0.997) {
    const N = RV_DAVANTI.length;
    const x = Math.min(1, p) * (N - 1);
    const i = Math.floor(x);
    const f = x - i;
    for (const copia of [RV_DAVANTI, RV_DIETRO]) {
      const a = ruota(copia[i], teta);
      const b = ruota(copia[Math.min(i + 1, N - 1)], teta);
      const q = { x: a.x + (b.x - a.x) * f, v: a.v + (b.v - a.v) * f, z: a.z + (b.z - a.z) * f };
      if (q.z < 0.12) continue;
      const px = cx + q.x * R;
      const py = cy + q.v * R;
      const g = ctx.createRadialGradient(px, py, 0, px, py, R * 0.2);
      g.addColorStop(0, 'rgba(255, 244, 214, 0.95)');
      g.addColorStop(0.25, 'rgba(240, 214, 150, 0.45)');
      g.addColorStop(1, 'rgba(240, 214, 150, 0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(px, py, R * 0.2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Il riflesso: un passaggio lento sulla pallina ferma.
  const r = fase(t, RV.riflessoDa, RV.riflessoA - RV.riflessoDa);
  if (r > 0 && r < 1) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(-0.5);
    const x = (-1.7 + 3.4 * rallenta(r)) * R;
    const g = ctx.createLinearGradient(x - R * 0.3, 0, x + R * 0.3, 0);
    g.addColorStop(0, 'rgba(255, 255, 255, 0)');
    g.addColorStop(0.5, `rgba(255, 255, 255, ${0.5 * Math.sin(Math.PI * r)})`);
    g.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = g;
    ctx.fillRect(x - R * 0.3, -R * 2, R * 0.6, R * 4);
    ctx.restore();
  }
  ctx.restore();

  ctx.strokeStyle = 'rgba(255, 250, 235, 0.22)';
  ctx.lineWidth = Math.max(1, R * 0.012);
  ctx.beginPath();
  ctx.arc(cx, cy, R - ctx.lineWidth / 2, 0, Math.PI * 2);
  ctx.stroke();
}

type Scritte = { scritta: HTMLCanvasElement; sportClub: HTMLCanvasElement; maschera: HTMLCanvasElement };

/** Una scritta bianca con trasparenza, tinta di champagne. */
function tinta(img: HTMLImageElement): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = img.width;
  c.height = img.height;
  const g = c.getContext('2d')!;
  g.drawImage(img, 0, 0);
  g.globalCompositeOperation = 'source-in';
  const grad = g.createLinearGradient(0, 0, 0, c.height);
  grad.addColorStop(0, CHAMPAGNE_CHIARO);
  grad.addColorStop(1, CHAMPAGNE_MEDIO);
  g.fillStyle = grad;
  g.fillRect(0, 0, c.width, c.height);
  return c;
}

const carica = (src: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(src));
    img.src = src;
  });

let scritteCache: Promise<Scritte> | null = null;
function scritte(): Promise<Scritte> {
  scritteCache ??= Promise.all([carica(asset('images/work/logos/ronchiverdi-scritta.png')), carica(asset('images/work/logos/ronchiverdi-sportclub.png'))]).then(([a, b]) => ({ scritta: tinta(a), sportClub: tinta(b), maschera: document.createElement('canvas') }));
  return scritteCache;
}

/** La scritta che si scrive da sinistra a destra, con il bordo morbido e una luce sulla punta. */
function scrittaScritta(ctx: CanvasRenderingContext2D, ris: Scritte, x0: number, y0: number, w: number, h: number, t: number) {
  const pr = dolce(fase(t, RV.scrittaDa, RV.scrittaA - RV.scrittaDa));
  if (pr <= 0) return;
  const src = ris.scritta;
  const m = ris.maschera;
  if (m.width !== src.width || m.height !== src.height) {
    m.width = src.width;
    m.height = src.height;
  }
  const g = m.getContext('2d')!;
  g.globalCompositeOperation = 'source-over';
  g.clearRect(0, 0, m.width, m.height);
  g.drawImage(src, 0, 0);
  const morbido = m.width * 0.12;
  const bordo = (m.width + morbido) * pr;
  g.globalCompositeOperation = 'destination-in';
  const mask = g.createLinearGradient(bordo - morbido, 0, bordo, 0);
  mask.addColorStop(0, 'rgba(0,0,0,1)');
  mask.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = mask;
  g.fillRect(0, 0, m.width, m.height);
  g.globalCompositeOperation = 'source-over';
  ctx.drawImage(m, x0, y0, w, h);
  if (pr < 0.97) {
    const px = Math.min(x0 + (bordo / m.width) * w - (morbido / m.width) * w * 0.35, x0 + w);
    const py = y0 + h * 0.5;
    const intensita = Math.pow(Math.sin(Math.PI * Math.min(pr / 0.97, 1)), 0.7);
    const raggio = h * 0.38;
    const gl = ctx.createRadialGradient(px, py, 0, px, py, raggio);
    gl.addColorStop(0, `rgba(255, 244, 214, ${0.34 * intensita})`);
    gl.addColorStop(0.45, `rgba(240, 214, 150, ${0.1 * intensita})`);
    gl.addColorStop(1, 'rgba(240, 214, 150, 0)');
    ctx.fillStyle = gl;
    ctx.fillRect(px - raggio, py - raggio, raggio * 2, raggio * 2);
  }
}

function disegnaRonchiverdi(ctx: CanvasRenderingContext2D, t: number, W: number, H: number, lockup: boolean, ris: Scritte | null) {
  ctx.clearRect(0, 0, W, H);
  let cx = W / 2;
  let cy = H / 2;
  let Rp = Math.min(W, H) * 0.43;
  let R = Rp;
  let cxFinale = cx;
  let cyFinale = cy;
  if (lockup) {
    // Il logo finito (pallina e scritte) sta al centro; all'inizio la pallina è grande e al centro.
    const larghezzaLogo = RV_SCRITTA[2] - RV_SCRITTA[0];
    const altezzaLogo = RV_SPORT_CLUB[3] + 1;
    R = Math.min((W * 0.86) / larghezzaLogo, (H * 0.86) / altezzaLogo);
    cxFinale = W / 2 - (R * (RV_SCRITTA[0] + RV_SCRITTA[2])) / 2;
    cyFinale = H / 2 - (R * (altezzaLogo - 2)) / 2;
    const Riniziale = Math.min(R * 1.55, Math.min(W, H) * 0.4);
    const a = rallenta(fase(t, RV.assestaDa, RV.assestaA - RV.assestaDa));
    cx = W / 2 + (cxFinale - W / 2) * a;
    cy = H / 2 + (cyFinale - H / 2) * a;
    Rp = Riniziale + (R - Riniziale) * a;
  }

  // L'alone caldo dietro la pallina, che si accende allo scatto.
  const alone = (0.45 + 0.55 * rallenta(fase(t, 0, 900))) * (1 + 0.5 * impulso(t, RV.scatto, 260));
  const gAlone = ctx.createRadialGradient(cx, cy, 0, cx, cy, Rp * 2.6);
  gAlone.addColorStop(0, `rgba(214, 186, 120, ${0.3 * Math.min(1.4, alone)})`);
  gAlone.addColorStop(0.45, `rgba(190, 160, 96, ${0.08 * Math.min(1.4, alone)})`);
  gAlone.addColorStop(1, 'rgba(190, 160, 96, 0)');
  ctx.fillStyle = gAlone;
  ctx.fillRect(0, 0, W, H);

  const comparsa = rallenta(fase(t, 60, 520));
  if (comparsa > 0) {
    ctx.save();
    ctx.globalAlpha = comparsa;
    pallina(ctx, cx, cy, Rp * (0.82 + 0.18 * comparsa), t);
    ctx.restore();
  }

  const anello = fase(t, RV.scatto, 900);
  if (anello > 0 && anello < 1) {
    ctx.strokeStyle = `rgba(232, 214, 168, ${0.5 * Math.pow(1 - anello, 1.6)})`;
    ctx.lineWidth = 1.4 * (1 - anello) + 0.4;
    ctx.beginPath();
    ctx.arc(cx, cy, Rp * (1.04 + 0.5 * scatta(anello)), 0, Math.PI * 2);
    ctx.stroke();
  }

  if (lockup && ris && t >= RV.scrittaDa) {
    const x0 = cxFinale + R * RV_SCRITTA[0];
    const y0 = cyFinale + R * RV_SCRITTA[1];
    scrittaScritta(ctx, ris, x0, y0, R * (RV_SCRITTA[2] - RV_SCRITTA[0]), R * (RV_SCRITTA[3] - RV_SCRITTA[1]), t);
    const s = rallenta(fase(t, RV.sportClubDa, RV.sportClubA - RV.sportClubDa));
    if (s > 0) {
      ctx.save();
      ctx.globalAlpha = s;
      ctx.drawImage(ris.sportClub, cxFinale + R * RV_SPORT_CLUB[0], cyFinale + R * RV_SPORT_CLUB[1] + R * 0.14 * (1 - s), R * (RV_SPORT_CLUB[2] - RV_SPORT_CLUB[0]), R * (RV_SPORT_CLUB[3] - RV_SPORT_CLUB[1]));
      ctx.restore();
    }
  }
}

function Ronchiverdi({ t, lockup }: { t: number; lockup: boolean }) {
  const cv = useRef<HTMLCanvasElement>(null);
  const [ris, setRis] = useState<Scritte | null>(null);
  useEffect(() => {
    if (!lockup) return;
    let vivo = true;
    scritte().then((r) => vivo && setRis(r)).catch(() => {});
    return () => {
      vivo = false;
    };
  }, [lockup]);
  useEffect(() => {
    const c = cv.current;
    const ctx = c?.getContext('2d');
    if (!c || !ctx) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const W = c.clientWidth;
    const H = c.clientHeight;
    if (!W || !H) return;
    if (c.width !== Math.round(W * dpr) || c.height !== Math.round(H * dpr)) {
      c.width = Math.round(W * dpr);
      c.height = Math.round(H * dpr);
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    disegnaRonchiverdi(ctx, t, W, H, lockup, ris);
  }, [t, lockup, ris]);
  return <canvas ref={cv} className="logo__canvas" aria-hidden="true" />;
}

// ───────────────────────────────────────────────────────────── TCA

const TCA_T = 1900;

function Tca({ t }: { t: number }) {
  const id = useId().replace(/:/g, '');
  const W = 205;
  const H = 85;
  const morbido = 44;
  const pr = dolce(fase(t, 60, 1050));
  const bordo = (W + morbido) * pr;
  const intensita = Math.pow(Math.sin(Math.PI * Math.min(pr / 0.97, 1)), 0.7);
  const px = Math.min(bordo - morbido * 0.35, W);
  const assesta = rimbalzo(fase(t, 1150, 500));
  const scala = 0.96 + 0.04 * assesta;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="logo__svg" aria-hidden="true">
      <defs>
        <linearGradient id={`${id}-m`} x1={bordo - morbido} x2={bordo} y1="0" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#fff" />
          <stop offset="1" stopColor="#000" />
        </linearGradient>
        <mask id={`${id}-mask`}>
          <rect x="0" y="0" width={W} height={H} fill={`url(#${id}-m)`} />
        </mask>
        <radialGradient id={`${id}-penna`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#ffd9d9" stopOpacity={0.9 * intensita} />
          <stop offset="0.35" stopColor="#c81e1e" stopOpacity={0.35 * intensita} />
          <stop offset="1" stopColor="#c81e1e" stopOpacity="0" />
        </radialGradient>
      </defs>
      <g transform={`translate(${W / 2} ${H / 2}) scale(${scala}) translate(${-W / 2} ${-H / 2})`}>
        <image href={asset('images/work/logos/tca-mark.png')} x="0" y="0" width={W} height={H} mask={`url(#${id}-mask)`} />
      </g>
      {pr > 0.01 && pr < 0.97 ? <circle cx={px} cy={H / 2} r={H * 0.42} fill={`url(#${id}-penna)`} /> : null}
    </svg>
  );
}

// ───────────────────────────────────────────────────────────── Passion

const PASSION_T = 2600;
const FITNESS = 'FITNESS CLUB';

function Passion({ t }: { t: number }) {
  const [VW, VH] = PASSION_VB;
  const cornice = dolce(fase(t, 0, 1100));
  const pieno = rallenta(fase(t, 850, 450));
  const lettere = [...PASSION_LETTERS.map((l) => ({ k: l.id, d: l.d })), { k: 'I', d: '' }];
  const ordine = ['A', 'S1', 'S2', 'I', 'O', 'N'];
  const quanto = (k: string) => rallenta(fase(t, 950 + ordine.indexOf(k) * 110, 380));
  const battute = Math.floor(fase(t, 1650, 650) * FITNESS.length);
  const marchio = rallenta(fase(t, 2250, 250));
  return (
    <svg viewBox={`0 0 ${VW} ${VH}`} className="logo__svg" aria-hidden="true">
      <path d={PASSION_FRAME} fill="#fff" fillOpacity={pieno} stroke="#fff" strokeWidth={cornice < 1 ? 3 : 0} strokeLinejoin="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - cornice} />
      {lettere.map((l) => {
        const q = quanto(l.k);
        const tr = `translate(0 ${16 * (1 - q)})`;
        if (l.k === 'I')
          return (
            <g key={l.k} opacity={q} transform={tr}>
              {PASSION_I.map((r, i) => (
                <rect key={i} x={r[0]} y={r[1]} width={r[2]} height={r[3]} fill="#fff" />
              ))}
            </g>
          );
        return <path key={l.k} d={l.d} fill="#fff" opacity={q} transform={tr} />;
      })}
      <text x="167.04" y="215.05" fill="#fff" fontFamily="'Barlow Condensed', 'Arial Narrow', sans-serif" fontWeight={700} fontSize={24} letterSpacing="0.3em">
        {FITNESS.slice(0, battute)}
      </text>
      <text x="452.94" y="103.7" fill="#fff" fontFamily="Inter, Arial, sans-serif" fontSize={40} opacity={marchio}>
        ®
      </text>
    </svg>
  );
}

// ───────────────────────────────────────────────────────────── il logo

const DURATA: Record<LogoKey, number> = { athlon: ATH_T, ronchiverdi: RV_T_TILE, tca: TCA_T, passion: PASSION_T };

type Props = {
  /** Il nome del cliente, com'è nelle carte e nei casi. */
  client: string;
  /** `tile`: la tessera piccola delle carte e del menu; `hero`: la versione grande in testa al caso. */
  size?: 'tile' | 'hero';
  className?: string;
};

/** Il logo vero del cliente, animato. Non c'è per chi non ha un logo in `LOGO_OF`. */
export function ClientLogo({ client, size = 'tile', className = '' }: Props) {
  const key = LOGO_OF[client];
  const ref = useRef<HTMLSpanElement>(null);
  const lockup = key === 'ronchiverdi' && size === 'hero';
  const t = useLogoClock(ref, key ? (lockup ? RV_T_LOCKUP : DURATA[key]) : 0);
  if (!key) return null;
  return (
    <span ref={ref} className={`logo logo--${key} logo--${size}${lockup ? ' logo--lockup' : ''} ${className}`.trim()} aria-hidden="true">
      {key === 'athlon' && <Athlon t={t} big={size === 'hero'} />}
      {key === 'ronchiverdi' && <Ronchiverdi t={t} lockup={lockup} />}
      {key === 'tca' && <Tca t={t} />}
      {key === 'passion' && <Passion t={t} />}
    </span>
  );
}

export const hasLogo = (client: string) => client in LOGO_OF;
