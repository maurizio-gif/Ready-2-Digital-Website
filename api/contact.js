// Contact form → email, through SendGrid. A Vercel serverless function: the form
// (src/components/ContactForm.tsx) POSTs its JSON here and the request lands in
// the owner's inbox.
//
// Environment variables (Vercel → Settings → Environment Variables):
//   SENDGRID_API_KEY     the SendGrid API key (needs the «Mail Send» permission). Secret.
//   CONTACT_TO_EMAIL     where the requests arrive.
//   CONTACT_FROM_EMAIL   the sender shown on the email. It must be a sender verified
//                        in SendGrid (a Single Sender or an authenticated domain).
//                        Optional: when missing, CONTACT_TO_EMAIL is used.
//
// Nothing is stored here: the message goes to SendGrid and that is all.

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const clean = (v, max) => (typeof v === 'string' ? v.replace(/\r/g, '').trim().slice(0, max) : '');
const oneLine = (v) => v.replace(/\s+/g, ' ').trim();
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function sameOrigin(req) {
  const origin = req.headers.origin;
  if (!origin) return true; // not a browser fetch (curl, a server): the other checks still apply
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
    return res.status(405).json({ error: 'method_not_allowed' });
  }
  if (!sameOrigin(req)) return res.status(403).json({ error: 'forbidden' });

  const body = typeof req.body === 'string' ? safeParse(req.body) : req.body;
  if (!body || typeof body !== 'object') return res.status(400).json({ error: 'bad_request' });

  // A field no person ever sees: if it is filled in, a bot did it. Answer "ok" and send nothing.
  if (clean(body.ufficio_riferimento, 200)) return res.status(200).json({ ok: true });

  const nome = clean(body.nome, 80);
  const cognome = clean(body.cognome, 80);
  const email = clean(body.email, 254);
  const cellulare = clean(body.cellulare, 30);
  const azienda = clean(body.azienda, 120);
  const progetto = clean(body.progetto, 4000);
  const lingua = body.lingua === 'en' ? 'en' : 'it';
  const interessi = Array.isArray(body.interessi) ? body.interessi.slice(0, 12).map((x) => clean(x, 60)).filter(Boolean) : [];
  const marketing = body.consenso_marketing === true;

  if (!nome || !cognome || !EMAIL.test(email) || !cellulare || progetto.length < 10 || body.consenso_privacy !== true) {
    return res.status(400).json({ error: 'invalid' });
  }

  const key = process.env.SENDGRID_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL;
  const from = process.env.CONTACT_FROM_EMAIL || to;
  if (!key || !to || !from) {
    console.error('contact: SENDGRID_API_KEY / CONTACT_TO_EMAIL not set');
    return res.status(500).json({ error: 'not_configured' });
  }

  const quando = new Date().toLocaleString('it-IT', { timeZone: 'Europe/Rome', dateStyle: 'long', timeStyle: 'short' });
  const rows = [
    ['Nome', `${nome} ${cognome}`],
    ['Email', email],
    ['Cellulare', cellulare],
    ['Azienda', azienda || '—'],
    ['Interessi', interessi.length ? interessi.join(', ') : '—'],
    ['Lingua del sito', lingua === 'en' ? 'inglese' : 'italiano'],
    ['Consenso privacy', 'dato'],
    ['Consenso marketing', marketing ? 'sì' : 'no'],
    ['Ricevuto il', quando],
  ];
  const text = [...rows.map(([k, v]) => `${k}: ${v}`), '', 'Progetto:', progetto].join('\n');
  const html =
    `<div style="font-family:Arial,sans-serif;font-size:15px;color:#111;line-height:1.5">` +
    `<h2 style="margin:0 0 12px">Nuovo contatto dal sito</h2>` +
    `<table style="border-collapse:collapse">` +
    rows.map(([k, v]) => `<tr><td style="padding:3px 16px 3px 0;color:#666">${esc(k)}</td><td style="padding:3px 0"><b>${esc(v)}</b></td></tr>`).join('') +
    `</table><h3 style="margin:20px 0 6px">Progetto</h3>` +
    `<p style="white-space:pre-wrap;margin:0">${esc(progetto)}</p></div>`;

  let r;
  try {
    r = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: to }] }],
        from: { email: from, name: 'Ready 2 Digital · sito' },
        reply_to: { email, name: oneLine(`${nome} ${cognome}`) },
        subject: oneLine(`Nuovo contatto dal sito: ${nome} ${cognome}${azienda ? ` (${azienda})` : ''}`),
        content: [
          { type: 'text/plain', value: text },
          { type: 'text/html', value: html },
        ],
      }),
    });
  } catch (e) {
    console.error('contact: SendGrid unreachable', e && e.message);
    return res.status(502).json({ error: 'send_failed' });
  }
  if (!r.ok) {
    // The key is never logged: only what SendGrid answered (e.g. «The from address does not match a verified Sender Identity»).
    console.error('contact: SendGrid answered', r.status, (await r.text()).slice(0, 500));
    return res.status(502).json({ error: 'send_failed' });
  }
  return res.status(200).json({ ok: true });
}

function safeParse(s) {
  try {
    return JSON.parse(s);
  } catch {
    return null;
  }
}
