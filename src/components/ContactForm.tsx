// The contact form, one question at a time. The mark is the progress bar:
// every completed step lights one of its circles, and when two neighbouring
// circles are lit the gooey neck between them appears. Sending completes it.

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import gsap from 'gsap';
import type { Lang } from '../content';
import { CONTACT_ENDPOINT, COMPANY, form } from '../legal';
import { metaball } from '../lib/metaball';
import { MARK, NECKS, NECK_OPTS, R } from '../lib/mark';
import { href, pathFor } from '../router';

type Data = { nome: string; cognome: string; email: string; cellulare: string; azienda: string; needs: string[]; progetto: string; privacy: boolean; marketing: boolean };

const EMPTY: Data = { nome: '', cognome: '', email: '', cellulare: '', azienda: '', needs: [], progetto: '', privacy: false, marketing: false };
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE = /^\+?[\d\s().-]{6,20}$/;

function ProgressMark({ done, current, complete }: { done: number; current: number; complete: boolean }) {
  const necks = useMemo(() => NECKS.map(([a, b]) => metaball(R, R, MARK[a], MARK[b], NECK_OPTS)), []);
  const lit = (i: number) => complete || i < done;
  return (
    <svg className={`pmark${complete ? ' is-complete' : ''}`} viewBox="-136 -104 272 208" aria-hidden="true">
      {NECKS.map(([a, b], k) => (
        <path key={k} d={necks[k]} className={`pmark__neck${lit(a) && lit(b) ? ' is-on' : ''}`} />
      ))}
      {MARK.map(([x, y], i) => (
        <circle
          key={i}
          cx={x}
          cy={y}
          r={R}
          className={`pmark__c${lit(i) ? ' is-on' : ''}${!complete && i === current ? ' is-current' : ''}${i === 5 ? ' is-dot' : ''}`}
        />
      ))}
    </svg>
  );
}

export function ContactForm({ lang }: { lang: Lang }) {
  const t = form[lang];
  const [step, setStep] = useState(0);
  const [d, setD] = useState<Data>(EMPTY);
  const [err, setErr] = useState<Record<string, string>>({});
  const [state, setState] = useState<'form' | 'sending' | 'done'>('form');
  const [via, setVia] = useState<'mail' | 'post'>('mail');
  const body = useRef<HTMLDivElement>(null);
  const trap = useRef('');
  const dir = useRef(1);
  const last = t.q.length - 1;

  const set = <K extends keyof Data>(k: K, v: Data[K]) => {
    setD((x) => ({ ...x, [k]: v }));
    setErr((e) => ({ ...e, [k]: '' }));
  };

  // Each step slides in from the side it comes from, and focuses its first field.
  useLayoutEffect(() => {
    const el = body.current;
    if (!el) return;
    gsap.fromTo(el.children, { opacity: 0, x: 40 * dir.current }, { opacity: 1, x: 0, duration: 0.6, ease: 'expo.out', stagger: 0.05 });
    const first = el.querySelector<HTMLElement>('input:not([type=checkbox]), textarea');
    if (first && window.matchMedia('(pointer: fine)').matches) first.focus({ preventScroll: true });
  }, [step, state]);

  const check = (s: number) => {
    const e: Record<string, string> = {};
    if (s === 0) {
      if (!d.nome.trim()) e.nome = t.err.required;
      if (!d.cognome.trim()) e.cognome = t.err.required;
    }
    if (s === 1) {
      if (!EMAIL.test(d.email.trim())) e.email = d.email.trim() ? t.err.email : t.err.required;
      if (!PHONE.test(d.cellulare.trim())) e.cellulare = d.cellulare.trim() ? t.err.phone : t.err.required;
    }
    if (s === 4 && d.progetto.trim().length < 10) e.progetto = d.progetto.trim() ? t.err.short : t.err.required;
    if (s === 5 && !d.privacy) e.privacy = t.err.consent;
    setErr(e);
    if (Object.keys(e).length) {
      gsap.fromTo(body.current, { x: -8 }, { x: 0, duration: 0.5, ease: 'elastic.out(1, 0.3)' });
      return false;
    }
    return true;
  };

  const go = (to: number) => {
    dir.current = to > step ? 1 : -1;
    setErr({});
    setStep(to);
  };

  const submit = async () => {
    const payload = {
      nome: d.nome.trim(),
      cognome: d.cognome.trim(),
      email: d.email.trim(),
      cellulare: d.cellulare.trim(),
      azienda: d.azienda.trim(),
      interessi: d.needs,
      progetto: d.progetto.trim(),
      consenso_privacy: d.privacy,
      consenso_marketing: d.marketing,
      lingua: lang,
      inviato_il: new Date().toISOString(),
      // A field no person sees: if a bot fills it in, the server drops the request.
      ufficio_riferimento: trap.current,
    };
    if (CONTACT_ENDPOINT) {
      setState('sending');
      try {
        const r = await fetch(CONTACT_ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        if (r.ok) {
          setVia('post');
          setState('done');
          return;
        }
        // 404/405: nothing answers at this address (the local dev server, a static preview):
        // fall back to the visitor's mail app, below. Anything else is a real failure.
        if (r.status !== 404 && r.status !== 405) throw new Error(String(r.status));
      } catch {
        setState('form');
        setErr({ send: t.err.send });
        return;
      }
    }
    const lines = [
      `${t.f.nome}: ${payload.nome} ${payload.cognome}`,
      `${t.f.email}: ${payload.email}`,
      `${t.f.cellulare}: ${payload.cellulare}`,
      payload.azienda && `${t.f.azienda}: ${payload.azienda}`,
      payload.interessi.length > 0 && `${t.q[3]} ${payload.interessi.join(', ')}`,
      '',
      payload.progetto,
      '',
      `Privacy: ${lang === 'it' ? 'consenso dato' : 'consent given'} · Marketing: ${payload.consenso_marketing ? (lang === 'it' ? 'sì' : 'yes') : 'no'}`,
    ].filter((l) => l !== false && l !== undefined) as string[];
    window.location.href = `mailto:${COMPANY.email}?subject=${encodeURIComponent(`${t.subject} — ${payload.nome} ${payload.cognome}`)}&body=${encodeURIComponent(lines.join('\n'))}`;
    setVia('mail');
    setState('done');
  };

  const next = () => {
    if (!check(step)) return;
    if (step < last) go(step + 1);
    else submit();
  };

  useEffect(() => {
    if (state !== 'done' || !body.current) return;
    gsap.fromTo(body.current.children, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.8, ease: 'expo.out', stagger: 0.08, delay: 0.3 });
  }, [state]);

  const field = (k: 'nome' | 'cognome' | 'email' | 'cellulare' | 'azienda', type = 'text', auto?: string) => (
    <label className={`field${err[k] ? ' has-err' : ''}`}>
      <input
        type={type}
        placeholder=" "
        value={d[k]}
        autoComplete={auto}
        inputMode={k === 'cellulare' ? 'tel' : k === 'email' ? 'email' : undefined}
        onChange={(e) => set(k, e.target.value)}
        aria-invalid={!!err[k]}
      />
      <span>{t.f[k]}</span>
      {err[k] && <em className="field__err">{err[k]}</em>}
    </label>
  );

  if (state === 'done')
    return (
      <div className="cform cform--done">
        <ProgressMark done={6} current={6} complete />
        <div ref={body} className="cform__done">
          <h3>{t.done.title(d.nome.trim())}</h3>
          <p>{via === 'mail' ? t.done.mail : t.done.sent}</p>
          <button
            type="button"
            className="link"
            onClick={() => {
              setD(EMPTY);
              setStep(0);
              setState('form');
            }}
          >
            {t.done.again}
          </button>
        </div>
      </div>
    );

  return (
    <form
      className="cform"
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        next();
      }}
    >
      <input type="text" name="ufficio_riferimento" className="cform__trap" tabIndex={-1} autoComplete="off" aria-hidden="true" onChange={(e) => (trap.current = e.target.value)} />
      <div className="cform__top">
        <ProgressMark done={step} current={step} complete={false} />
        <ol className="cform__steps" aria-label="Steps">
          {t.steps.map((s, i) => (
            <li key={s} className={i < step ? 'is-done' : i === step ? 'is-current' : ''}>
              <button type="button" disabled={i > step} onClick={() => i < step && go(i)} aria-current={i === step ? 'step' : undefined}>
                {s}
              </button>
            </li>
          ))}
        </ol>
      </div>

      <div className="cform__body" ref={body} key={step}>
        <p className="cform__count">
          {String(step + 1).padStart(2, '0')} / {String(t.q.length).padStart(2, '0')}
        </p>
        <h3 className="cform__q">{t.q[step]}</h3>
        <p className="cform__hint">{t.hints[step]}</p>

        {step === 0 && (
          <div className="cform__row">
            {field('nome', 'text', 'given-name')}
            {field('cognome', 'text', 'family-name')}
          </div>
        )}
        {step === 1 && (
          <div className="cform__row">
            {field('email', 'email', 'email')}
            {field('cellulare', 'tel', 'tel')}
          </div>
        )}
        {step === 2 && <div className="cform__row cform__row--one">{field('azienda', 'text', 'organization')}</div>}
        {step === 3 && (
          <div className="cform__chips">
            {t.needs.map((n) => {
              const on = d.needs.includes(n);
              return (
                <button key={n} type="button" className={`chip${on ? ' is-on' : ''}`} aria-pressed={on} onClick={() => set('needs', on ? d.needs.filter((x) => x !== n) : [...d.needs, n])}>
                  <span className="chip__dot" />
                  {n}
                </button>
              );
            })}
          </div>
        )}
        {step === 4 && (
          <label className={`field${err.progetto ? ' has-err' : ''}`}>
            <textarea
              rows={5}
              placeholder=" "
              value={d.progetto}
              onChange={(e) => set('progetto', e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                  e.preventDefault();
                  next();
                }
              }}
              aria-invalid={!!err.progetto}
            />
            <span>{t.f.progetto}</span>
            <small className="field__count">{d.progetto.length}</small>
            {err.progetto && <em className="field__err">{err.progetto}</em>}
          </label>
        )}
        {step === 5 && (
          <div className="consents">
            <label className={`consent${err.privacy ? ' has-err' : ''}`}>
              <input type="checkbox" checked={d.privacy} onChange={(e) => set('privacy', e.target.checked)} />
              <span className="consent__box" aria-hidden="true" />
              <span className="consent__text">
                {t.privacy[0]}
                <a href={href(pathFor('privacy', lang))} target="_blank" rel="noopener">
                  {t.privacy[1]}
                </a>
                {t.privacy[2]} <b>({t.required})</b>
              </span>
            </label>
            {err.privacy && <em className="field__err">{err.privacy}</em>}
            <label className="consent">
              <input type="checkbox" checked={d.marketing} onChange={(e) => set('marketing', e.target.checked)} />
              <span className="consent__box" aria-hidden="true" />
              <span className="consent__text">{t.marketing}</span>
            </label>
          </div>
        )}
        {err.send && <p className="field__err">{err.send}</p>}
      </div>

      <div className="cform__nav">
        {step > 0 ? (
          <button type="button" className="cform__back" onClick={() => go(step - 1)}>
            ← {t.back}
          </button>
        ) : (
          <span />
        )}
        <div className="cform__go">
          <span className="cform__enter">{step === 4 ? '⌘/Ctrl + ↵' : t.enter}</span>
          <button type="submit" className="btn magnetic" disabled={state === 'sending'}>
            <span>{step === last ? (state === 'sending' ? t.sending : t.send) : t.next}</span>
            <span className="btn__arrow">→</span>
          </button>
        </div>
      </div>
    </form>
  );
}
