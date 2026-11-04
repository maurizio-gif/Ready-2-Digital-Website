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
// Leaving the home page for another page, the chat opens by itself after three seconds,
// once per visit (on a phone only the launcher's question appears); while closed, the
// launcher waves every few seconds to draw the eye.
//
// The speaker reads answers aloud with the browser's own speech synthesis (speechSynthesis): a button
// on every answer, a switch in the header that reads every new answer, and an answer to a dictated
// question is read by itself, so one can talk to the agent without looking at the screen. Nothing
// leaves the browser for it. Where there is no synthesis, the buttons are not shown.
//
// The conversation lives in sessionStorage: it survives moving between pages and a
// reload, and ends with the tab. Nothing is written to localStorage or cookies.
// Other parts of the site open the chat with openChat(), optionally with a question.
//
// The chat is a pure conversation: answers carry no links to the site's pages, only suggested
// replies to tap (and, when the visitor wants it, the hand-over to the team).

import { useCallback, useEffect, useRef, useState } from 'react';
import type { Lang } from '../content';
import { chatCopy } from '../assistant';
import { MARK, R } from '../lib/mark';
import { Mark } from './Mark';
import { href, navigate, parse, pathFor, type Page } from '../router';

type Link = { url: string; titolo: string };
type Msg = { ruolo: 'utente' | 'agente'; testo: string; link?: Link[]; azione?: 'contatti' | null; riassunto?: string | null; domande?: string[]; errore?: boolean };
type Saved = { sessione: string; messaggi: Msg[] };

const KEY = 'r2d:chat';
const DRAFT = 'r2d:progetto';
const TEASED = 'r2d:chat-teaser';
const AUTO = 'r2d:chat-auto'; // set once the chat has opened by itself, or the visitor has opened or closed it: no automatic opening after that
// Pages where the chat never opens by itself: the contact form and the privacy notice need the whole screen.
const NO_AUTO: Page[] = ['home', 'contatti', 'privacy'];
const AUTO_DELAY = 3000;
const VOICE = 'r2d:chat-voce'; // the «read every answer aloud» switch, for this visit

const flag = (k: string) => {
  try {
    return !!sessionStorage.getItem(k);
  } catch {
    return true; // no storage: behave as if it had already happened, never nag
  }
};
const setFlag = (k: string) => {
  try {
    sessionStorage.setItem(k, '1');
  } catch {
    /* nothing to remember */
  }
};
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
/* Speech synthesis: reading answers aloud                             */
/* ------------------------------------------------------------------ */

const synth = () => (typeof window !== 'undefined' && 'speechSynthesis' in window ? window.speechSynthesis : null);

/** The answer as it should be heard: no asterisks, list items as sentences. */
const spoken = (text: string) =>
  text
    .replace(/\*\*/g, '')
    .split('\n')
    .map((l) => l.trim().replace(/^[-•*]\s+/, ''))
    .filter(Boolean)
    .map((l) => (/[.!?:;]$/.test(l) ? l : `${l}.`))
    .join(' ');

/** The best voice for the language: a natural or online one if the system has it. */
function voiceFor(lang: Lang): SpeechSynthesisVoice | null {
  const s = synth();
  if (!s) return null;
  const code = lang === 'en' ? 'en' : 'it';
  const all = s.getVoices().filter((v) => v.lang.toLowerCase().startsWith(code));
  const score = (v: SpeechSynthesisVoice) => (/natural|neural|premium|enhanced|google|online/i.test(v.name) ? 2 : 0) + (v.localService ? 0 : 1) + (lang === 'en' && /en-(gb|us)/i.test(v.lang) ? 1 : 0);
  return all.sort((a, b) => score(b) - score(a))[0] || null;
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

/**
 * A suggested reply is something the VISITOR would send. A question addressed to the visitor
 * («Quanti lead ti arrivano?», «What tools do you use?») is the agent's own question: tapped, it
 * would be asked back to the agent and the conversation would loop. Those are dropped.
 */
const TO_VISITOR = /\b(ti|tu|tuo|tua|tuoi|tue|te|hai|sei|puoi|vuoi|usi|usate|fai|gestisci|avete|siete|vi|vostro|vostra|you|your|yours)\b/i;
function asVisitor(d: unknown): d is string {
  if (typeof d !== 'string') return false;
  const s = d.trim();
  return !!s && s.length <= 60 && !(s.endsWith('?') && TO_VISITOR.test(s));
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

export function Chat({ lang, page, routeKey }: { lang: Lang; page: Page; routeKey: string }) {
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
  const [canSpeak, setCanSpeak] = useState(false);
  const [speaking, setSpeaking] = useState<number | null>(null);
  const [autoVoice, setAutoVoice] = useState(false);
  const dictated = useRef(false); // the text in the field came from the microphone
  const list = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLTextAreaElement>(null);
  const launcher = useRef<HTMLButtonElement>(null);
  const rec = useRef<Recognition | null>(null);
  const stateRef = useRef(state);
  stateRef.current = state;
  const busyRef = useRef(false);
  const openRef = useRef(open);
  openRef.current = open;
  const autoVoiceRef = useRef(false);
  const auto = useRef(false); // the panel was opened by the site, not by the visitor: don't take the focus
  const lastPage = useRef<Page | null>(null);
  autoVoiceRef.current = autoVoice;

  useEffect(() => {
    setState(load());
    setCanTalk(!!recognitionCtor());
    const sy = synth();
    if (sy) {
      setCanSpeak(true);
      sy.getVoices(); // voices load late in Chrome: asking once starts the loading
      try {
        setAutoVoice(sessionStorage.getItem(VOICE) === '1');
      } catch {
        /* off by default */
      }
    }
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

  const stopSpeaking = useCallback(() => {
    synth()?.cancel();
    setSpeaking(null);
  }, []);

  // Read one answer aloud. Chrome cuts long utterances after about fifteen seconds,
  // so the text goes in sentence by sentence.
  const speak = useCallback(
    (i: number, text: string) => {
      const sy = synth();
      if (!sy) return;
      sy.cancel();
      const parts = spoken(text).match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [];
      if (!parts.length) return;
      const voice = voiceFor(lang);
      setSpeaking(i);
      parts.forEach((part, k) => {
        const u = new SpeechSynthesisUtterance(part.trim());
        u.lang = lang === 'en' ? 'en-US' : 'it-IT';
        if (voice) u.voice = voice;
        u.rate = 1.03;
        if (k === parts.length - 1) u.onend = () => setSpeaking((x) => (x === i ? null : x));
        u.onerror = () => setSpeaking((x) => (x === i ? null : x));
        sy.speak(u);
      });
    },
    [lang],
  );

  const toggleVoice = () => {
    const next = !autoVoice;
    setAutoVoice(next);
    try {
      sessionStorage.setItem(VOICE, next ? '1' : '0');
    } catch {
      /* the switch still works on this page */
    }
    if (!next) stopSpeaking();
  };

  const send = useCallback(
    async (text: string) => {
      const testo = text.trim().slice(0, 1200);
      if (!testo || busyRef.current) return;
      rec.current?.abort();
      synth()?.cancel();
      setSpeaking(null);
      const wasDictated = dictated.current;
      dictated.current = false;
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
            domande: Array.isArray(data.domande) ? data.domande.filter(asVisitor).slice(0, 2) : [],
          };
        } else {
          reply = { ruolo: 'agente', testo: data && data.limite ? t.limit : t.error, azione: 'contatti', errore: true };
        }
      } catch {
        reply = { ruolo: 'agente', testo: t.error, azione: 'contatti', errore: true };
      }
      const at = (stateRef.current.messaggi || []).length;
      update((s) => {
        setFresh(s.messaggi.length);
        return { ...s, messaggi: [...s.messaggi, reply] };
      });
      if (!reply.errore && (autoVoiceRef.current || wasDictated)) speak(at, reply.testo);
      busyRef.current = false;
      setBusy(false);
    },
    [lang, t, update, speak],
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
      dictated.current = true;
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
      setFlag(AUTO);
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
    if (flag(TEASED)) return;
    const show = setTimeout(() => {
      setTeaser(true);
      setFlag(TEASED);
    }, 6000);
    const hide = setTimeout(() => setTeaser(false), 16000);
    return () => {
      clearTimeout(show);
      clearTimeout(hide);
    };
  }, []);

  // From the home page to another page: after three seconds there, the chat opens by itself, once per visit.
  // Not if the visitor has already opened or closed it, not over the contact form, and on a phone (where the
  // panel would take the whole screen) only the launcher's question appears.
  useEffect(() => {
    const from = lastPage.current;
    lastPage.current = page;
    if (from !== 'home' || NO_AUTO.includes(page) || flag(AUTO)) return;
    const tm = setTimeout(() => {
      if (openRef.current || flag(AUTO) || stateRef.current.messaggi.length) return;
      setFlag(AUTO);
      if (window.matchMedia('(max-width: 640px)').matches) {
        setTeaser(true);
        setTimeout(() => setTeaser(false), 12000);
        return;
      }
      auto.current = true;
      setOpen(true);
    }, AUTO_DELAY);
    return () => clearTimeout(tm);
  }, [routeKey, page]);

  // Focus the field when the panel opens, give it back to the launcher when it closes; Escape closes.
  useEffect(() => {
    document.documentElement.classList.toggle('chat-open', open);
    if (!open) {
      rec.current?.abort();
      synth()?.cancel();
      setSpeaking(null);
      return;
    }
    setTeaser(false);
    const tm = setTimeout(() => {
      if (!auto.current && window.matchMedia('(pointer: fine)').matches) input.current?.focus({ preventScroll: true });
      auto.current = false;
    }, 260);
    const esc = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      setFlag(AUTO);
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

  useEffect(
    () => () => {
      rec.current?.abort();
      synth()?.cancel();
    },
    [],
  );

  const reset = () => {
    stopSpeaking();
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
          <button
            type="button"
            className="chat-teaser"
            onClick={() => {
              setFlag(AUTO);
              setOpen(true);
            }}
          >
            {t.teaser}
          </button>
        )}
        <button
          type="button"
          ref={launcher}
          className="chat-launch"
          onClick={() => {
            setFlag(AUTO);
            setOpen(true);
          }}
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-controls="chat-panel"
        >
          <span className="chat-launch__orb" aria-hidden="true">
            <Face size={20} />
          </span>
          <span className="chat-launch__label">{t.launcher}</span>
          <span className="chat-launch__short">{t.launcherShort}</span>
        </button>
      </div>

      <section id="chat-panel" className={`chat${open ? ' is-open' : ''}`} role="dialog" aria-modal="false" aria-label={`${t.launcherShort} ${t.title}`} inert={!open} data-lenis-prevent>
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
          {canSpeak && (
            <button
              type="button"
              className={`chat__icon chat__icon--voice${autoVoice ? ' is-on' : ''}`}
              onClick={toggleVoice}
              aria-pressed={autoVoice}
              title={autoVoice ? t.voice.autoOn : t.voice.autoOff}
              aria-label={autoVoice ? t.voice.autoOn : t.voice.autoOff}
            >
              <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                <path d="M4 9v6h4l5 4V5L8 9H4z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
                {autoVoice ? (
                  <path d="M16 9a4 4 0 0 1 0 6M18.5 6.5a7.5 7.5 0 0 1 0 11" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                ) : (
                  <path d="M17 10l4 4M21 10l-4 4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                )}
              </svg>
            </button>
          )}
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
              setFlag(AUTO);
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
              {canSpeak && m.ruolo === 'agente' && !m.errore && (
                <button
                  type="button"
                  className={`chat__speak${speaking === i ? ' is-on' : ''}`}
                  onClick={() => (speaking === i ? stopSpeaking() : speak(i, m.testo))}
                  aria-pressed={speaking === i}
                  aria-label={speaking === i ? t.voice.stop : t.voice.read}
                  title={speaking === i ? t.voice.stop : t.voice.read}
                >
                  {speaking === i ? (
                    <span className="chat__speak-bars" aria-hidden="true">
                      <i />
                      <i />
                      <i />
                      <i />
                    </span>
                  ) : (
                    <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true">
                      <path d="M4 9v6h4l5 4V5L8 9H4z M16 9a4 4 0 0 1 0 6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round" />
                    </svg>
                  )}
                </button>
              )}
              {/* Pure conversation: no links to the site's pages, even if the workflow sent some. The only
                  button is the hand-over to the team, which opens the contact form with the summary. */}
              {m.ruolo === 'agente' && m.azione === 'contatti' && (
                <div className="chat__actions">
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
            onChange={(e) => {
              setDraft(e.target.value);
              if (!e.target.value.trim()) dictated.current = false;
            }}
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
