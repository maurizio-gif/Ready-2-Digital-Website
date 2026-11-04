// The site's AI agent: the chat (src/components/Chat.tsx) POSTs here, and this
// function passes the conversation to the n8n workflow «R2D CHAT SITO», which
// calls the model and answers. The agent's rules and knowledge are not here and
// not in n8n either: they are /assistente.json, built from src/assistant.ts.
//
// Why a function in between, instead of the browser calling n8n:
//   - the webhook's key stays on the server (the page would publish it);
//   - only requests from this site's pages get through, cut to a known size;
//   - n8n receives the visitor's IP to apply its rate limits, and nothing else
//     about the visitor (no cookies: the site has none of its own).
//
// Environment variables (Vercel → Settings → Environment Variables):
//   CHAT_WEBHOOK_URL   the production URL of the workflow's webhook.
//   CHAT_WEBHOOK_KEY   the key the workflow checks (header x-r2d-chiave). Secret.
//
// Without them the function answers 503 and the chat shows its error message,
// which points to the contact form: the site never breaks because of the agent.

const MAX_TURNS = 12; // what the model sees of the conversation, last message included
const MAX_CHARS = 1200; // per message

const clean = (v, max) => (typeof v === 'string' ? v.replace(/\r/g, '').trim().slice(0, max) : '');

function sameOrigin(req) {
  const origin = req.headers.origin;
  if (!origin) return false; // only the chat, from a browser, talks to the agent
  try {
    return new URL(origin).host === req.headers.host;
  } catch {
    return false;
  }
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ errore: 'metodo' });
  }
  if (!sameOrigin(req)) return res.status(403).json({ errore: 'origine' });

  const body = typeof req.body === 'string' ? safeParse(req.body) : req.body;
  if (!body || typeof body !== 'object' || !Array.isArray(body.messaggi)) return res.status(400).json({ errore: 'richiesta' });

  const messaggi = body.messaggi
    .slice(-MAX_TURNS)
    .map((m) => ({ ruolo: m && m.ruolo === 'agente' ? 'agente' : 'utente', testo: clean(m && m.testo, MAX_CHARS) }))
    .filter((m) => m.testo);
  if (!messaggi.length || messaggi[messaggi.length - 1].ruolo !== 'utente') return res.status(400).json({ errore: 'richiesta' });

  const url = process.env.CHAT_WEBHOOK_URL;
  const key = process.env.CHAT_WEBHOOK_KEY;
  if (!url || !key) {
    console.error('chat: CHAT_WEBHOOK_URL / CHAT_WEBHOOK_KEY not set');
    return res.status(503).json({ errore: 'non_configurato' });
  }

  const ip = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim() || String(req.headers['x-real-ip'] || '');
  const payload = {
    sessione: clean(body.sessione, 64).replace(/[^a-zA-Z0-9-]/g, ''),
    lingua: body.lingua === 'en' ? 'en' : 'it',
    pagina: clean(body.pagina, 200),
    messaggi,
    ip,
  };

  let r;
  try {
    r = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-r2d-chiave': key },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(45000),
    });
  } catch (e) {
    console.error('chat: n8n unreachable', e && e.message);
    return res.status(502).json({ errore: 'agente' });
  }
  const data = await r.json().catch(() => null);
  if (!r.ok || !data || typeof data !== 'object') {
    console.error('chat: n8n answered', r.status);
    return res.status(502).json({ errore: 'agente' });
  }
  return res.status(200).json(data);
}

function safeParse(s) {
  try {
    return JSON.parse(s);
  } catch {
    return null;
  }
}
