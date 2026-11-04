// The site's AI agent, on every page: a launcher in the corner and a chat panel.
// What it says, its rules and its knowledge are in src/assistant.ts; the answers
// come from /api/chat (api/chat.js → n8n → OpenRouter).
//
// The look is the brand's: the six circles of the mark are the agent's face (they
// breathe while it waits and run in sequence while it thinks), the panel is glass
// over the page with a slowly turning orange edge, and a new answer arrives word
// by word. Everything that moves stops with prefers-reduced-motion.
//
// The microphone uses the browser's own speech recognition (Web Speech API: Chrome,
// Edge, Safari on Mac and iPhone). Words appear in the field while you speak, and you
// send them yourself. Where the browser has no recognition the button is not shown.
//
// The conversation lives in sessionStorage: it survives moving between pages and a
// reload, and ends with the tab. Nothing is written to localStorage or cookies.
// Other parts of the site open the chat with openChat(), optionally with a question.

import { useCallback, useEffect, useRef, useState } from 'react';
import type { Lang } from '../content';
import { chatCopy } from '../assistant';
import { MARK, R } from '../lib/mark';
import { Mark } from './Mark';
import { href, navigate, parse, pathFor } from '../router';

type Link = { url: string; titolo: string };
type Msg = { ruolo: 'utente' | 'agente'; testo: string; link?: Link[]; azione?: 'contatti' | null; riassunto?: string | null; domande?: string[]; errore?: boolean };
type Saved = { sessione: string; messaggi: Msg[] };

const KEY = 'r2d:chat';
const DRAFT = 'r2d:progetto';
const TEASED = 'r2d:chat-teaser';
const ENDPOINT = `${import.meta.env.BASE_URL.replace(/\/$/, '')}/api/chat`;
const OPEN_EVENT = 'r2d:chat';

/** Opens the chat from anywhere on the site; with a question, it is sent right away. */
export function openChat(domanda?: string) {
  window.dispatchEvent(new CustomEvent(OPEN_EVENT, { detail: { domanda } }));
}

const newSession = () => (typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`);

function load(): Saved {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (raw) {
      const s = JSON.parse(raw) as Saved;
      if (s && typeof s.sessione === 'string' && Array.isArray(s.messaggi)) return s;
    }
  } catch {
    /* private mode, blocked storage: start empty */
  }
  return { sessione: newSession(), messaggi: [] };
}

function save(s: Saved) {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    /* nothing to do: the conversation still works for this page */
  }
}

/* ------------------------------------------------------------------ */
/* Speech recognition, where the browser has it                        */
/* ------------------------------------------------------------------ */

type Recognition = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((e: { resultIndex: number; results: ArrayLike<{ isFinal: boolean; 0: { transcript: string } }> }) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
};
type RecognitionCtor = new () => Recognition;

function recognitionCtor(): RecognitionCtor | null {
  if (typeof window === 'undefined') return null;
  const w = window as unknown as { SpeechRecognition?: RecognitionCtor; webkitSpeechRecognition?: RecognitionCtor };
  return w.SpeechRecognition || w.webkitSpeechRecognition || null;
}

/* ------------------------------------------------------------------ */
/* Pieces                                                              */
/* ------------------------------------------------------------------ */

/** The agent's face: the six circles of the mark. `state` decides how they move. */
function Face({ size = 40, state = 'idle' }: { size?: number; state?: 'idle' | 'thinking' }) {
  return (
    <svg className={`face face--${state}`} viewBox="-136 -104 272 208" width={(size * 272) / 208} height={size} aria-hidden="true">
      {MARK.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={R} className={i === 5 ? 'face__dot' : 'face__c'} style={{ animationDelay: `${i * 0.12}s`, transformOrigin: `${x}px ${y}px` }} />
      ))}
    </svg>
  );
}

/** **bold**, "- " lists and line breaks: the only formatting the agent is allowed. With `fresh`, words fade in one after the other. */
function Rich({ text, fresh }: { text: string; fresh?: boolean }) {
  let w = 0;
  const words = (s: string, k: string) =>
    s.split(/(\s+)/).map((part, i) => {
      if (!fresh || !part.trim()) return part;
      const d = Math.min(w++ * 0.022, 2.2);
      return (
        <span key={`${k}-w${i}`} className="w-in" style={{ animationDelay: `${d}s` }}>
          {part}
        </span>
      );
    });
  const inline = (s: string, k: string) =>
    s.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
      part.startsWith('**') && part.endsWith('**') ? <strong key={`${k}-${i}`}>{words(part.slice(2, -2), `${k}-${i}`)}</strong> : <span key={`${k}-${i}`}>{words(part, `${k}-${i}`)}</span>,
    );
  const blocks: React.ReactNode[] = [];
  let list: string[] = [];
  const flush = (k: number) => {
    if (!list.length) return;
    blocks.push(
      <ul key={`l${k}`}>
        {list.map((li, i) => (
          <li key={i}>{inline(li, `li${k}-${i}`)}</li>
        ))}
      </ul>,
    );
    list = [];
  };
  text.split('\n').forEach((line, i) => {
    const t = line.trim();
    if (/^[-•*]\s+/.test(t)) {
      list.push(t.replace(/^[-•*]\s+/, ''));
      return;
    }
    flush(i);
    if (t) blocks.push(<p key={`p${i}`}>{inline(t, `p${i}`)}</p>);
  });
  flush(-1);
  return <>{blocks}</>;
}

function go(url: string) {
  const [path, hash] = url.split('#');
  const here = parse(window.location.pathname);
  const there = parse(path);
  if (hash && here.page === there.page && here.lang === there.lang && here.slug === there.slug) {
    window.history.replaceState({}, '', `${href(path)}#${hash}`);
    window.dispatchEvent(new Event('r2d:hash'));
  } else navigate(url);
}

/* ------------------------------------------------------------------ */
/* The chat                                                            */
/* ------------------------------------------------------------------ */

export function Chat({ lang }: { lang: Lang }) {
  const t = chatCopy[lang];
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<Saved>({ sessione: '', messaggi: [] });
  const [draft, setDraft] = useState('');
  const [busy, setBusy] = useState(false);
  const [fresh, setFresh] = useState(-1);
  const [teaser, setTeaser] = useState(false);
  const [canTalk, setCanTalk] = useState(false);
  const [listening, setListening] = useState(false);
  const [micError, setMicError] = useState(false);
  const list = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLTextAreaElement>(null);
  const launcher = useRef<HTMLButtonElement>(null);
  const rec = useRef<Recognition | null>(null);
  const stateRef = useRef(state);
  stateRef.current = state;
  const busyRef = useRef(false);

  useEffect(() => {
    setState(load());
    setCanTalk(!!recognitionCtor());
  }, []);

  const update = useCallback((fn: (s: Saved) => Saved) => {
    setState((s) => {
      const n = fn(s);
      save(n);
      return n;
    });
  }, []);

  const stopListening = useCallback(() => {
    rec.current?.stop();
  }, []);

  const send = useCallback(
    async (text: string) => {
      const testo = text.trim().slice(0, 1200);
      if (!testo || busyRef.current) return;
      rec.current?.abort();
      busyRef.current = true;
      setBusy(true);
      setDraft('');
      const base = stateRef.current.sessione ? stateRef.current : load();
      const messaggi: Msg[] = [...base.messaggi, { ruolo: 'utente', testo }];
      update(() => ({ sessione: base.sessione, messaggi }));
      let reply: Msg;
      try {
        const r = await fetch(ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessione: base.sessione,
            lingua: lang,
            pagina: window.location.pathname + window.location.hash,
            messaggi: messaggi.filter((m) => !m.errore).map((m) => ({ ruolo: m.ruolo, testo: m.testo })),
          }),
        });
        const data = await r.json().catch(() => null);
        if (r.ok && data && typeof data.risposta === 'string' && data.risposta.trim()) {
          reply = {
            ruolo: 'agente',
            testo: data.risposta,
            link: Array.isArray(data.link) ? data.link.filter((l: Link) => l && typeof l.url === 'string' && l.url.startsWith('/')).slice(0, 2) : [],
            azione: data.azione === 'contatti' ? 'contatti' : null,
            riassunto: typeof data.riassunto === 'string' ? data.riassunto : null,
            domande: Array.isArray(data.domande) ? data.domande.filter((d: unknown) => typeof d === 'string').slice(0, 3) : [],
          };
        } else {
          reply = { ruolo: 'agente', testo: data && data.limite ? t.limit : t.error, azione: 'contatti', errore: true };
        }
      } catch {
        reply = { ruolo: 'agente', testo: t.error, azione: 'contatti', errore: true };
      }
      update((s) => {
        setFresh(s.messaggi.length);
        return { ...s, messaggi: [...s.messaggi, reply] };
      });
      busyRef.current = false;
      setBusy(false);
    },
    [lang, t, update],
  );

  const listen = () => {
    if (listening) return stopListening();
    const Ctor = recognitionCtor();
    if (!Ctor) return;
    setMicError(false);
    const r = new Ctor();
    r.lang = lang === 'en' ? 'en-US' : 'it-IT';
    r.interimResults = true;
    r.continuous = false;
    const before = draft.trim() ? `${draft.trim()} ` : '';
    r.onresult = (e) => {
      let said = '';
      for (let i = 0; i < e.results.length; i++) said += e.results[i][0].transcript;
      setDraft((before + said).slice(0, 1200));
    };
    r.onerror = (e) => {
      if (e.error === 'not-allowed' || e.error === 'service-not-allowed' || e.error === 'audio-capture') setMicError(true);
    };
    r.onend = () => {
      setListening(false);
      rec.current = null;
      input.current?.focus({ preventScroll: true });
    };
    rec.current = r;
    try {
      r.start();
      setListening(true);
    } catch {
      setMicError(true);
    }
  };

  // Opened from elsewhere on the page (openChat), or with ?chat=1 in the address.
  useEffect(() => {
    const onOpen = (e: Event) => {
      setOpen(true);
      const q = (e as CustomEvent<{ domanda?: string }>).detail?.domanda;
      if (q) setTimeout(() => send(q), 80);
    };
    window.addEventListener(OPEN_EVENT, onOpen);
    if (new URLSearchParams(window.location.search).get('chat') === '1') setOpen(true);
    return () => window.removeEventListener(OPEN_EVENT, onOpen);
  }, [send]);

  // Once per visit, a few seconds in, the launcher asks its question.
  useEffect(() => {
    let seen = false;
    try {
      seen = !!sessionStorage.getItem(TEASED);
    } catch {
      seen = true;
    }
    if (seen) return;
    const show = setTimeout(() => {
      setTeaser(true);
      try {
        sessionStorage.setItem(TEASED, '1');
      } catch {
        /* shown once on this page anyway */
      }
    }, 6000);
    const hide = setTimeout(() => setTeaser(false), 16000);
    return () => {
      clearTimeout(show);
      clearTimeout(hide);
    };
  }, []);

  // Focus the field when the panel opens, give it back to the launcher when it closes; Escape closes.
  useEffect(() => {
    document.documentElement.classList.toggle('chat-open', open);
    if (!open) {
      rec.current?.abort();
      return;
    }
    setTeaser(false);
    const tm = setTimeout(() => {
      if (window.matchMedia('(pointer: fine)').matches) input.current?.focus({ preventScroll: true });
    }, 260);
    const esc = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      setOpen(false);
      launcher.current?.focus();
    };
    window.addEventListener('keydown', esc);
    return () => {
      clearTimeout(tm);
      window.removeEventListener('keydown', esc);
    };
  }, [open]);

  // The newest message in view (the welcome screen starts from the top).
  useEffect(() => {
    const el = list.current;
    if (!el) return;
    if (!state.messaggi.length && !busy) el.scrollTo({ top: 0 });
    else el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }, [state.messaggi.length, busy, open]);

  useEffect(() => () => rec.current?.abort(), []);

  const reset = () => {
    update(() => ({ sessione: newSession(), messaggi: [] }));
    setFresh(-1);
    input.current?.focus();
  };

  const phone = () => window.matchMedia('(max-width: 640px)').matches;

  const toContact = (m: Msg) => {
    try {
      if (m.riassunto) sessionStorage.setItem(DRAFT, m.riassunto);
    } catch {
      /* the form just starts empty */
    }
    if (phone()) setOpen(false);
    navigate(pathFor('contatti', lang));
  };

  const follow = (url: string) => {
    if (phone()) setOpen(false);
    go(url);
  };

  const msgs = state.messaggi;
  const last = msgs[msgs.length - 1];

  return (
    <>
      <div className={`chat-dock${open ? ' is-hidden' : ''}`}>
        {teaser && (
          <button type="button" className="chat-teaser" onClick={() => setOpen(true)}>
            {t.teaser}
          </button>
        )}
        <button type="button" ref={launcher} className="chat-launch" onClick={() => setOpen(true)} aria-haspopup="dialog" aria-expanded={open} aria-controls="chat-panel">
          <span className="chat-launch__orb" aria-hidden="true">
            <Face size={20} />
          </span>
          <span className="chat-launch__label">{t.launcher}</span>
          <span className="chat-launch__short">{t.launcherShort}</span>
        </button>
      </div>

      <section id="chat-panel" className={`chat${open ? ' is-open' : ''}`} role="dialog" aria-modal="false" aria-label={t.title} inert={!open} data-lenis-prevent>
        <span className="chat__glow" aria-hidden="true" />
        <header className="chat__head">
          <span className="chat__avatar" aria-hidden="true">
            <Face size={18} state={busy ? 'thinking' : 'idle'} />
          </span>
          <div className="chat__who">
            <strong>{t.title}</strong>
            <span>
              <i className="chat__live" aria-hidden="true" />
              {busy ? `${t.thinking}…` : t.status}
            </span>
          </div>
          {msgs.length > 0 && (
            <button type="button" className="chat__icon" onClick={reset} title={t.reset} aria-label={t.reset}>
              <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                <path d="M4 12a8 8 0 1 0 2.4-5.7M4 4v4h4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          )}
          <button
            type="button"
            className="chat__icon"
            onClick={() => {
              setOpen(false);
              launcher.current?.focus();
            }}
            title={t.close}
            aria-label={t.close}
          >
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        </header>

        <div className="chat__list" ref={list} aria-live="polite">
          {msgs.length === 0 ? (
            <div className="chat__hello">
              <span className="chat__hello-face" aria-hidden="true">
                <Face size={54} />
              </span>
              <p className="chat__hello-title">{t.welcome}</p>
              <div className="chat__msg chat__msg--agente chat__msg--hello">
                <Rich text={t.greeting} />
              </div>
              <div className="chat__cards">
                {t.suggestions.map((s, i) => (
                  <button key={s} type="button" className="chat__card" onClick={() => send(s)} disabled={busy} style={{ animationDelay: `${0.25 + i * 0.07}s` }}>
                    <span>{s}</span>
                    <em aria-hidden="true">↗</em>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="chat__msg chat__msg--agente">
              <Rich text={t.greeting} />
            </div>
          )}
          {msgs.map((m, i) => (
            <div key={i} className={`chat__msg chat__msg--${m.ruolo}${m.errore ? ' is-error' : ''}`}>
              <Rich text={m.testo} fresh={m.ruolo === 'agente' && i === fresh} />
              {m.ruolo === 'agente' && ((m.link && m.link.length > 0) || m.azione === 'contatti') && (
                <div className="chat__actions">
                  {m.link?.map((l) => (
                    <a
                      key={l.url}
                      href={href(l.url)}
                      className="chat__link"
                      onClick={(e) => {
                        if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
                        e.preventDefault();
                        follow(l.url);
                      }}
                    >
                      {l.titolo} <span aria-hidden="true">→</span>
                    </a>
                  ))}
                  {m.azione === 'contatti' && (
                    <button type="button" className="chat__link chat__link--cta" onClick={() => toContact(m)}>
                      {t.contact} <span aria-hidden="true">→</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
          {busy && (
            <div className="chat__thinking" role="status">
              <Face size={22} state="thinking" />
              <span>{t.thinking}</span>
            </div>
          )}
          {!busy && last && last.ruolo === 'agente' && last.domande && last.domande.length > 0 && (
            <div className="chat__chips">
              {last.domande.map((s, i) => (
                <button key={s} type="button" className="chat__chip" onClick={() => send(s)} style={{ animationDelay: `${0.6 + i * 0.08}s` }}>
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>

        <form
          className={`chat__form${listening ? ' is-listening' : ''}`}
          onSubmit={(e) => {
            e.preventDefault();
            send(draft);
          }}
        >
          {listening && (
            <span className="chat__wave" aria-hidden="true">
              {Array.from({ length: 5 }, (_, i) => (
                <i key={i} style={{ animationDelay: `${i * 0.11}s` }} />
              ))}
            </span>
          )}
          <textarea
            ref={input}
            value={draft}
            rows={1}
            maxLength={1200}
            placeholder={listening ? t.mic.listening : t.placeholder}
            aria-label={t.placeholder}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
                e.preventDefault();
                send(draft);
              }
            }}
          />
          {canTalk && (
            <button type="button" className={`chat__mic${listening ? ' is-on' : ''}`} onClick={listen} aria-pressed={listening} aria-label={listening ? t.mic.stop : t.mic.start} title={listening ? t.mic.stop : t.mic.start}>
              <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                {listening ? (
                  <rect x="7" y="7" width="10" height="10" rx="2.5" fill="currentColor" />
                ) : (
                  <path d="M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3zM6 11a6 6 0 0 0 12 0M12 17v4M9 21h6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                )}
              </svg>
            </button>
          )}
          <button type="submit" className="chat__send" disabled={busy || !draft.trim()} aria-label={t.send}>
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
              <path d="M5 12h13M13 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </form>
        {micError && <p className="chat__mic-error">{t.mic.denied}</p>}
        <p className="chat__note">
          {t.note[0]}
          <a
            href={href(pathFor('privacy', lang))}
            onClick={(e) => {
              e.preventDefault();
              follow(pathFor('privacy', lang));
            }}
          >
            {t.note[1]}
          </a>
          {t.note[2]}
        </p>
      </section>
    </>
  );
}

/** A band that invites to try the agent: on the home page and on the AI agents page. */
export function TryAgent({ lang }: { lang: Lang }) {
  const t = chatCopy[lang].tryIt;
  const s = chatCopy[lang].suggestions;
  return (
    <section className="section try-agent">
      <div className="container try-agent__inner">
        <div>
          <p className="kicker" data-reveal>
            {t.kicker}
          </p>
          <h2 className="h-lg" data-split>
            {t.title}
          </h2>
          <p className="lead" data-reveal>
            {t.text}
          </p>
          <button type="button" className="btn magnetic" onClick={() => openChat()} data-reveal>
            <span>{t.btn}</span>
            <span className="btn__arrow">→</span>
          </button>
        </div>
        <div className="try-agent__stage" data-reveal>
          <span className="try-agent__face" aria-hidden="true">
            <Mark size={46} dot="#0D0D0D" color="#FF6000" />
          </span>
          <div className="try-agent__chips">
            {s.map((q) => (
              <button key={q} type="button" className="try-agent__chip" onClick={() => openChat(q)}>
                <span aria-hidden="true">›</span> {q}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
