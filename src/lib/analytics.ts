// The site's own statistics (no Google Analytics): page views, sessions, a few events,
// sent to /api/track (api/track.js → Supabase, function public.traccia).
//
// Consent decides what is sent:
//   - accepted: a visitor id (cookie r2d_vid, 13 months) and a session id (cookie r2d_sid,
//     ends after 30 minutes without activity, like Google Analytics). Sessions, sources,
//     time on page, and the link to the contact request once the visitor fills in the form.
//   - refused, or not chosen yet: the page view only, with no id and no cookie, so the
//     traffic totals are still right. Nothing that tells one visitor from another.
// The choice itself lives in the cookie r2d_consenso (technical, 6 months): after that
// the banner asks again, as the Garante's guidelines want.
//
// The ids are random, never derived from the browser or the IP.

import type { Lang } from '../content';

const ENDPOINT = `${import.meta.env.BASE_URL.replace(/\/$/, '')}/api/track`;
const C_CONSENT = 'r2d_consenso';
const C_VISITOR = 'r2d_vid';
const C_SESSION = 'r2d_sid';
const CONSENT_VERSION = '1';
const DAY = 86400;
const SESSION_TTL = 30 * 60; // seconds of inactivity that close a session
const VISITOR_TTL = 395 * DAY; // 13 months
const CONSENT_TTL = 182 * DAY; // 6 months

export type Consent = 'si' | 'no' | null;
const CONSENT_EVENT = 'r2d:consenso';
const OPEN_BANNER_EVENT = 'r2d:consenso-apri';

/* ------------------------------------------------------------------ */
/* Cookies                                                             */
/* ------------------------------------------------------------------ */

function readCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const m = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return m ? decodeURIComponent(m[1]) : null;
}

function writeCookie(name: string, value: string, maxAge: number) {
  const secure = location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${name}=${encodeURIComponent(value)}; Max-Age=${maxAge}; Path=/; SameSite=Lax${secure}`;
}

const dropCookie = (name: string) => writeCookie(name, '', 0);

const uuid = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : '10000000-1000-4000-8000-100000000000'.replace(/[018]/g, (c) => (Number(c) ^ (Math.random() * 16) >> (Number(c) / 4)).toString(16));

/* ------------------------------------------------------------------ */
/* Consent                                                             */
/* ------------------------------------------------------------------ */

export function getConsent(): Consent {
  const v = readCookie(C_CONSENT);
  if (!v) return null;
  const [ver, choice] = v.split(':');
  if (ver !== CONSENT_VERSION) return null;
  return choice === 'si' ? 'si' : choice === 'no' ? 'no' : null;
}

export function setConsent(choice: 'si' | 'no') {
  const before = getConsent();
  writeCookie(C_CONSENT, `${CONSENT_VERSION}:${choice}`, CONSENT_TTL);
  if (choice === 'no') {
    dropCookie(C_VISITOR);
    dropCookie(C_SESSION);
  }
  window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: choice }));
  // Accepted now, on a page already counted anonymously: from here on, the visit is a session.
  if (choice === 'si' && before !== 'si' && lastPage) pageview(lastPage.path, lastPage.lang, true);
}

export function onConsent(fn: (c: Consent) => void) {
  const h = () => fn(getConsent());
  window.addEventListener(CONSENT_EVENT, h);
  return () => window.removeEventListener(CONSENT_EVENT, h);
}

/** Reopens the banner (the «Cookie preferences» link in the footer). */
export const openConsent = () => window.dispatchEvent(new Event(OPEN_BANNER_EVENT));
export function onOpenConsent(fn: () => void) {
  window.addEventListener(OPEN_BANNER_EVENT, fn);
  return () => window.removeEventListener(OPEN_BANNER_EVENT, fn);
}

/* ------------------------------------------------------------------ */
/* Visitor and session                                                 */
/* ------------------------------------------------------------------ */

type Ids = { visitatore: string; sessione: string; nuova: boolean };

/** The ids, only with consent. Touching them extends the session by 30 minutes. */
function ids(): Ids | null {
  if (getConsent() !== 'si') return null;
  let visitatore = readCookie(C_VISITOR);
  if (!visitatore) visitatore = uuid();
  writeCookie(C_VISITOR, visitatore, VISITOR_TTL);
  let sessione = readCookie(C_SESSION);
  const nuova = !sessione;
  if (!sessione) sessione = uuid();
  writeCookie(C_SESSION, sessione, SESSION_TTL);
  return { visitatore, sessione, nuova };
}

/** For the contact form: the ids to link the request to the visits, or nothing without consent. */
export function currentIds(): { visitatore: string; sessione: string } | null {
  if (typeof document === 'undefined' || getConsent() !== 'si') return null;
  const visitatore = readCookie(C_VISITOR);
  const sessione = readCookie(C_SESSION);
  return visitatore && sessione ? { visitatore, sessione } : null;
}

/* ------------------------------------------------------------------ */
/* Where the visit comes from                                          */
/* ------------------------------------------------------------------ */

const SOCIAL = /(^|\.)(facebook|fb|instagram|linkedin|lnkd|t|twitter|x|youtube|tiktok|pinterest|reddit|threads)\.(com|co|in|net)$/i;
const SEARCH = /(^|\.)(google|bing|duckduckgo|yahoo|ecosia|qwant|yandex|baidu|startpage|brave)\./i;
const AI = /(^|\.)(chatgpt|openai|perplexity|claude|gemini|copilot)\./i;

function source() {
  const q = new URLSearchParams(location.search);
  const utm = (k: string) => q.get(`utm_${k}`)?.slice(0, 200) || undefined;
  const click = q.get('gclid') ? 'gclid' : q.get('fbclid') ? 'fbclid' : q.get('msclkid') ? 'msclkid' : undefined;
  let refHost = '';
  try {
    const r = document.referrer ? new URL(document.referrer) : null;
    if (r && r.host !== location.host) refHost = r.hostname.replace(/^www\./, '');
  } catch {
    /* no referrer */
  }
  let sorgente = utm('source');
  let mezzo = utm('medium');
  if (!sorgente) {
    if (click === 'gclid') [sorgente, mezzo] = ['google', 'cpc'];
    else if (click === 'msclkid') [sorgente, mezzo] = ['bing', 'cpc'];
    else if (click === 'fbclid') [sorgente, mezzo] = [refHost || 'facebook', 'social'];
    else if (refHost) {
      sorgente = refHost;
      mezzo = SEARCH.test(refHost) ? 'organico' : SOCIAL.test(refHost) ? 'social' : AI.test(refHost) ? 'ai' : 'referral';
    } else [sorgente, mezzo] = ['diretto', 'nessuno'];
  }
  return {
    referrer: refHost ? document.referrer.split('?')[0].slice(0, 500) : undefined,
    sorgente,
    mezzo: mezzo || 'referral',
    campagna: utm('campaign'),
    utm_term: utm('term'),
    utm_content: utm('content'),
    click_id: click,
    lingua_browser: navigator.language,
    schermo: `${screen.width}x${screen.height}`,
  };
}

/* ------------------------------------------------------------------ */
/* Sending                                                             */
/* ------------------------------------------------------------------ */

function send(body: Record<string, unknown>, leaving = false) {
  const json = JSON.stringify(body);
  try {
    if (leaving && navigator.sendBeacon) {
      if (navigator.sendBeacon(ENDPOINT, new Blob([json], { type: 'application/json' }))) return;
    }
    fetch(ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: json, keepalive: true }).catch(() => {});
  } catch {
    /* statistics never break the page */
  }
}

// The page on screen: its event id, so that leaving it can send the time spent on it.
let current: { id: string; visible: number; since: number | null; ids: Ids | null } | null = null;
let lastPage: { path: string; lang: Lang; at: number } | null = null;
let firstAnonymous = true;

function leave() {
  if (!current) return;
  const c = current;
  current = null;
  const ms = c.visible + (c.since !== null ? performance.now() - c.since : 0);
  if (ms < 500) return;
  send({ tipo: 'uscita', id: c.id, visitatore: c.ids?.visitatore, sessione: c.ids?.sessione, durata_ms: Math.round(ms) }, true);
}

/** One page view. The app calls it at every change of page. */
export function pageview(path: string, lang: Lang, afterConsent = false) {
  if (typeof window === 'undefined') return;
  // The same page twice in a row within a second (React's StrictMode in development, a double render): once.
  if (!afterConsent && lastPage && lastPage.path === path && performance.now() - lastPage.at < 1000) return;
  // Accepted on a page already counted anonymously: that view is replaced, not counted twice.
  const replaces = afterConsent && current && !current.ids ? current.id : undefined;
  if (afterConsent) current = null;
  else leave();
  lastPage = { path, lang, at: performance.now() };
  const id = uuid();
  const i = ids();
  const body: Record<string, unknown> = {
    tipo: 'pagina',
    id,
    visitatore: i?.visitatore,
    sessione: i?.sessione,
    sostituisce: replaces,
    percorso: path,
    titolo: document.title,
    lingua_sito: lang,
  };
  // The source goes with the first page of a session (or, anonymously, with the first page of the visit).
  if (i?.nuova || (!i && firstAnonymous)) body.sessione_nuova = i ? source() : { sorgente: source().sorgente };
  if (!i) firstAnonymous = false;
  send(body);
  current = { id, visible: 0, since: document.visibilityState === 'visible' ? performance.now() : null, ids: i };
}

/** An event worth counting (only with consent: without it, events are not sent at all). */
export function track(nome: 'chat_aperta' | 'chat_messaggio' | 'chat_contatti' | 'contatto_inviato' | 'cta', dati?: Record<string, string | number | boolean>) {
  if (typeof window === 'undefined') return;
  const i = ids();
  if (!i) return;
  send({ tipo: 'evento', id: uuid(), nome, visitatore: i.visitatore, sessione: i.sessione, percorso: location.pathname + location.hash, lingua_sito: lastPage?.lang, dati });
}

// Time on page counts only while the page is visible; leaving the tab or closing it sends it.
if (typeof window !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    if (!current) return;
    if (document.visibilityState === 'hidden') {
      if (current.since !== null) current.visible += performance.now() - current.since;
      current.since = null;
      // Sent now, because a hidden tab may never come back; a later return keeps counting.
      const c = current;
      if (c.visible >= 500) send({ tipo: 'uscita', id: c.id, visitatore: c.ids?.visitatore, sessione: c.ids?.sessione, durata_ms: Math.round(c.visible) }, true);
    } else {
      current.since = performance.now();
      if (current.ids) ids(); // back after a while: the session goes on, or a new one starts with the next page
    }
  });
  window.addEventListener('pagehide', leave);
}
