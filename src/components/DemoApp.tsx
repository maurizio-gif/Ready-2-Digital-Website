// "Try the app": the Athlon app demo account, on the Athlon case page.
// ID and code with a copy button, where to open the app (browser, App Store,
// Google Play), how the demo works and its five scenarios. Texts in `src/demo.ts`.

import { useState } from 'react';
import type { Lang } from '../content';
import { DEMO_ANCHOR, demoAccount, demoUi } from '../demo';

function copyText(t: string): Promise<void> {
  if (navigator.clipboard?.writeText) return navigator.clipboard.writeText(t);
  return new Promise((ok, ko) => {
    const a = document.createElement('textarea');
    a.value = t;
    a.setAttribute('readonly', '');
    a.style.position = 'fixed';
    a.style.opacity = '0';
    document.body.appendChild(a);
    a.select();
    const done = document.execCommand('copy');
    a.remove();
    if (done) ok();
    else ko(new Error('copy'));
  });
}

function Credential({ label, value, copy, copied }: { label: string; value: string; copy: string; copied: string }) {
  const [ok, setOk] = useState(false);
  const onCopy = () =>
    copyText(value)
      .then(() => {
        setOk(true);
        setTimeout(() => setOk(false), 1800);
      })
      .catch(() => undefined);
  return (
    <div className="demo-cred">
      <span className="demo-cred__label">{label}</span>
      <code className="demo-cred__value">{value}</code>
      <button type="button" className="demo-cred__copy" onClick={onCopy} aria-label={`${copy} ${label}`}>
        {ok ? copied : copy}
      </button>
      <span className="sr-only" aria-live="polite">
        {ok ? copied : ''}
      </span>
    </div>
  );
}

export function DemoApp({ lang }: { lang: Lang }) {
  const ui = demoUi[lang];
  const stores = [
    { href: demoAccount.web, t: ui.web, s: ui.webSub, icon: '◎' },
    { href: demoAccount.ios, t: ui.ios, s: ui.iosSub, icon: '' },
    { href: demoAccount.android, t: ui.android, s: ui.androidSub, icon: '▶' },
  ];
  return (
    <section className="section section--light demo-app" id={DEMO_ANCHOR}>
      <div className="container">
        <div className="demo-app__head">
          <div>
            <p className="kicker" data-reveal>
              {ui.kicker}
            </p>
            <h2 className="h-lg" data-split>
              {ui.title}
            </h2>
            <p className="lead" data-reveal>
              {ui.lead}
            </p>
          </div>
          <figure className="demo-shot" data-reveal>
            <span className="rs-browser">
              <span className="rs-browser__bar">
                <span className="mk-dots">
                  <i />
                  <i />
                  <i />
                </span>
                <span className="rs-browser__url">app.athlonroma.it</span>
              </span>
              <img src={`${import.meta.env.BASE_URL}images/real/athlon/app-portale-d-home.webp`} alt={ui.shotAlt} loading="lazy" width="1600" height="1000" />
            </span>
            <figcaption>{ui.shotCaption}</figcaption>
          </figure>
        </div>

        <div className="demo-app__grid">
          <div className="demo-card" data-reveal>
            <Credential label={ui.idLabel} value={demoAccount.id} copy={ui.copy} copied={ui.copied} />
            <Credential label={ui.codeLabel} value={demoAccount.code} copy={ui.copy} copied={ui.copied} />
            <p className="demo-card__title">{ui.getTitle}</p>
            <div className="demo-stores">
              {stores.map((s) => (
                <a key={s.href} className="demo-store" href={s.href} target="_blank" rel="noopener noreferrer">
                  <span className="demo-store__icon" aria-hidden="true">
                    {s.icon || <AppleGlyph />}
                  </span>
                  <span className="demo-store__txt">
                    <strong>{s.t}</strong>
                    <span>{s.s}</span>
                  </span>
                  <i aria-hidden="true">↗</i>
                </a>
              ))}
            </div>
          </div>

          <div className="demo-how" data-reveal>
            <p className="demo-card__title">{ui.stepsTitle}</p>
            <ol className="demo-steps">
              {ui.steps.map((s, i) => (
                <li key={s}>
                  <span>{String(i + 1).padStart(2, '0')}</span>
                  {s}
                </li>
              ))}
            </ol>
            <p className="demo-card__title">{ui.scenariosTitle}</p>
            <ul className="demo-scenarios">
              {ui.scenarios.map((s) => (
                <li key={s.t}>
                  <strong>{s.t}</strong>
                  <span>{s.d}</span>
                </li>
              ))}
            </ul>
            <ul className="demo-notes">
              {ui.notes.map((n) => (
                <li key={n}>{n}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

function AppleGlyph() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
      <path d="M16.37 12.6c-.02-2.2 1.8-3.26 1.88-3.31-1.03-1.5-2.62-1.7-3.18-1.73-1.35-.14-2.64.8-3.33.8-.69 0-1.74-.78-2.86-.76-1.47.02-2.83.86-3.59 2.17-1.53 2.66-.39 6.6 1.1 8.75.73 1.05 1.6 2.24 2.73 2.2 1.1-.05 1.51-.71 2.84-.71 1.32 0 1.7.71 2.86.69 1.18-.02 1.93-1.07 2.65-2.13.84-1.22 1.18-2.4 1.2-2.46-.03-.01-2.3-.88-2.32-3.51zM14.2 6.13c.6-.73 1.01-1.75.9-2.76-.87.04-1.92.58-2.54 1.31-.56.64-1.05 1.67-.92 2.66.97.07 1.96-.49 2.56-1.21z" />
    </svg>
  );
}
