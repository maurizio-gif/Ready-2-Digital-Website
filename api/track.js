// The site's own statistics, instead of Google Analytics: the browser
// (src/lib/analytics.ts) sends here every page view, a few events (chat, contact)
// and the time spent on a page when it is left; this function adds what only the
// server knows (country from Vercel, device and browser from the user agent) and
// writes it in Supabase through the database function public.traccia
// (supabase/migrations/…_statistiche_sito.sql).
//
// What is never stored: the IP address, the full user agent. Without the visitor's
// consent to analytics cookies the browser sends no visitor or session id, and the
// page view is counted anonymously.
//
// Environment variables (Vercel → Settings → Environment Variables):
//   SUPABASE_URL                 https://<ref>.supabase.co
//   SUPABASE_SERVICE_ROLE_KEY    the service_role key (or a sb_secret_… key). Secret.
//
// Without them the function answers 204 and does nothing: the site never breaks for statistics.

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const BOT = /bot|crawl|spider|slurp|preview|fetch|headless|lighthouse|pingdom|monitor|curl|wget|python|axios|node-fetch|go-http/i;
const EVENTS = new Set(['chat_aperta', 'chat_messaggio', 'chat_contatti', 'contatto_inviato', 'cta']);

const clean = (v, max) => (typeof v === 'string' ? v.replace(/[\r\n\t]/g, ' ').trim().slice(0, max) : '');
const uuid = (v) => (typeof v === 'string' && UUID.test(v) ? v.toLowerCase() : null);

function sameOrigin(req) {
  const origin = req.headers.origin;
  // sendBeacon always sends Origin on cross-site requests; a same-site beacon may omit it.
  if (!origin) {
    const ref = req.headers.referer;
    if (!ref) return false;
    try {
      return new URL(ref).host === req.headers.host;
    } catch {
      return false;
    }
  }
  try {
    return new URL(origin).host === req.headers.host;
  } catch {
    return false;
  }
}

function device(ua) {
  const tablet = /iPad|Tablet|PlayBook|Silk|(Android(?!.*Mobile))/i.test(ua);
  const mobile = !tablet && /Mobi|iPhone|iPod|Android|Windows Phone/i.test(ua);
  const browser = /Edg\//.test(ua)
    ? 'Edge'
    : /OPR\/|Opera/.test(ua)
      ? 'Opera'
      : /SamsungBrowser/.test(ua)
        ? 'Samsung Internet'
        : /Firefox\/|FxiOS/.test(ua)
          ? 'Firefox'
          : /Chrome\/|CriOS/.test(ua)
            ? 'Chrome'
            : /Safari\//.test(ua)
              ? 'Safari'
              : 'Altro';
  const sistema = /iPhone|iPad|iPod/.test(ua)
    ? 'iOS'
    : /Android/.test(ua)
      ? 'Android'
      : /Windows/.test(ua)
        ? 'Windows'
        : /Mac OS X|Macintosh/.test(ua)
          ? 'macOS'
          : /CrOS/.test(ua)
            ? 'ChromeOS'
            : /Linux/.test(ua)
              ? 'Linux'
              : 'Altro';
  return { dispositivo: tablet ? 'tablet' : mobile ? 'mobile' : 'desktop', browser, sistema };
}

const header = (req, k) => {
  const v = req.headers[k];
  if (!v) return null;
  try {
    return decodeURIComponent(String(v)).slice(0, 80);
  } catch {
    return String(v).slice(0, 80);
  }
};

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end();
  }
  if (!sameOrigin(req)) return res.status(403).end();

  const ua = String(req.headers['user-agent'] || '');
  if (!ua || BOT.test(ua)) return res.status(204).end();

  const body = typeof req.body === 'string' ? safeParse(req.body) : req.body;
  if (!body || typeof body !== 'object') return res.status(400).end();

  const tipo = body.tipo === 'evento' || body.tipo === 'uscita' ? body.tipo : 'pagina';
  const id = uuid(body.id);
  if (!id) return res.status(400).end();
  const nome = tipo === 'evento' ? clean(body.nome, 60) : null;
  if (tipo === 'evento' && !EVENTS.has(nome)) return res.status(400).end();

  // Both ids or neither: an id alone means nothing.
  let visitatore = uuid(body.visitatore);
  let sessione = uuid(body.sessione);
  if (!visitatore || !sessione) visitatore = sessione = null;

  const nuova = body.sessione_nuova && typeof body.sessione_nuova === 'object' ? body.sessione_nuova : {};
  const dati = {};
  if (body.dati && typeof body.dati === 'object') {
    for (const [k, v] of Object.entries(body.dati).slice(0, 8)) {
      if (typeof v === 'string') dati[clean(k, 30)] = clean(v, 120);
      else if (typeof v === 'number' || typeof v === 'boolean') dati[clean(k, 30)] = v;
    }
  }

  const payload = {
    tipo,
    id,
    visitatore,
    sessione,
    nome,
    sostituisce: tipo === 'pagina' && visitatore ? uuid(body.sostituisce) : null,
    percorso: clean(body.percorso, 300) || '/',
    titolo: clean(body.titolo, 200) || null,
    lingua_sito: body.lingua_sito === 'en' ? 'en' : 'it',
    durata_ms: Number.isFinite(body.durata_ms) ? Math.round(body.durata_ms) : null,
    dati: Object.keys(dati).length ? dati : null,
    sessione_nuova: {
      referrer: clean(nuova.referrer, 500) || null,
      sorgente: clean(nuova.sorgente, 120) || null,
      mezzo: clean(nuova.mezzo, 60) || null,
      campagna: clean(nuova.campagna, 200) || null,
      utm_term: clean(nuova.utm_term, 200) || null,
      utm_content: clean(nuova.utm_content, 200) || null,
      click_id: clean(nuova.click_id, 40) || null,
      lingua_browser: clean(nuova.lingua_browser, 20) || null,
      schermo: clean(nuova.schermo, 20) || null,
    },
    paese: header(req, 'x-vercel-ip-country'),
    regione: header(req, 'x-vercel-ip-country-region'),
    citta: header(req, 'x-vercel-ip-city'),
    ...device(ua),
  };

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return res.status(204).end();

  try {
    const r = await fetch(`${url.replace(/\/$/, '')}/rest/v1/rpc/traccia`, {
      method: 'POST',
      headers: supabaseHeaders(key),
      body: JSON.stringify({ p: payload }),
      signal: AbortSignal.timeout(8000),
    });
    if (!r.ok) console.error('track: Supabase answered', r.status, (await r.text()).slice(0, 300));
  } catch (e) {
    console.error('track: Supabase unreachable', e && e.message);
  }
  return res.status(204).end();
}

// A legacy service_role key is a JWT and goes in both headers; a new sb_secret_… key only in apikey.
function supabaseHeaders(key) {
  const h = { apikey: key, 'Content-Type': 'application/json' };
  if (key.startsWith('eyJ')) h.Authorization = `Bearer ${key}`;
  return h;
}

function safeParse(s) {
  try {
    return JSON.parse(s);
  } catch {
    return null;
  }
}
