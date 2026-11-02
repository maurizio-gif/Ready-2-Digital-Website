// Rebuilt screen extracts for the case studies. Every component starts its
// animation when it scrolls into view, and loops gently while visible.

import { useEffect, useRef, useState, type ReactNode } from 'react';
import type { Extract } from '../cases';
import { Mark } from './Mark';

function useInView<T extends Element>(threshold = 0.35) {
  const ref = useRef<T>(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setOn(e.isIntersecting), { threshold });
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return [ref, on] as const;
}

/** Counts up to `to` once `on` turns true. */
function Count({ to, on, dur = 1600, fmt }: { to: number; on: boolean; dur?: number; fmt?: (n: number) => string }) {
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!on) return;
    let raf = 0;
    const t0 = performance.now();
    const step = (t: number) => {
      const k = Math.min(1, (t - t0) / dur);
      setV(to * (1 - Math.pow(1 - k, 3)));
      if (k < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [on, to, dur]);
  return <>{fmt ? fmt(v) : Math.round(v).toLocaleString('it-IT')}</>;
}

/** A step counter that ticks 0..n-1 every `ms` while `on`, looping. */
function useTicker(on: boolean, n: number, ms: number) {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (!on) {
      setI(0);
      return;
    }
    const id = setInterval(() => setI((x) => (x + 1) % n), ms);
    return () => clearInterval(id);
  }, [on, n, ms]);
  return i;
}

function Browser({ url, sample, children }: { url: string; sample: string; children: ReactNode }) {
  return (
    <div className="mk-browser">
      <div className="mk-browser__bar">
        <span className="mk-dots">
          <i />
          <i />
          <i />
        </span>
        <span className="mk-url">{url}</span>
        <span className="mk-sample">{sample}</span>
      </div>
      <div className="mk-browser__body">{children}</div>
    </div>
  );
}

function Tiles({ tiles, on }: { tiles: { l: string; v: number; suf?: string; d?: string }[]; on: boolean }) {
  return (
    <div className="mk-tiles" style={{ ['--n' as string]: tiles.length }}>
      {tiles.map((t) => (
        <div key={t.l} className="mk-tile">
          <span className="mk-tile__l">{t.l}</span>
          <strong className="mk-tile__v">
            <Count to={t.v} on={on} />
            {t.suf}
          </strong>
          {t.d && <span className="mk-tile__d">▲ {t.d}</span>}
        </div>
      ))}
    </div>
  );
}

/* KPI dashboard with an area chart and a funnel ------------------------- */
function Kpi({ x, on, sample }: { x: Extract & { kind: 'kpi' }; on: boolean; sample: string }) {
  const W = 520;
  const H = 170;
  const max = Math.max(...x.series) * 1.1;
  const pts = x.series.map((v, i) => [(i / (x.series.length - 1)) * W, H - (v / max) * H] as const);
  const line = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join('');
  const area = `${line}L${W} ${H}L0 ${H}Z`;
  return (
    <Browser url={x.url} sample={sample}>
      <Tiles tiles={x.tiles} on={on} />
      <div className="mk-kpi">
        <div className="mk-card">
          <p className="mk-card__t">{x.seriesLabel}</p>
          <svg viewBox={`0 0 ${W} ${H + 4}`} className={`mk-area${on ? ' is-on' : ''}`} preserveAspectRatio="none">
            <defs>
              <linearGradient id="mkg" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0" stopColor="#FF6000" stopOpacity=".35" />
                <stop offset="1" stopColor="#FF6000" stopOpacity="0" />
              </linearGradient>
            </defs>
            {[0.25, 0.5, 0.75].map((g) => (
              <line key={g} x1="0" x2={W} y1={H * g} y2={H * g} className="mk-grid" />
            ))}
            <path d={area} fill="url(#mkg)" className="mk-area__fill" />
            <path d={line} className="mk-area__line" pathLength={1} />
            {pts.map((p, i) => (
              <circle key={i} cx={p[0]} cy={p[1]} r="4" className="mk-area__dot" style={{ transitionDelay: `${0.4 + i * 0.09}s` }} />
            ))}
          </svg>
        </div>
        <div className="mk-card">
          <p className="mk-card__t">Funnel</p>
          <div className="mk-funnel">
            {x.funnel.map((f, i) => (
              <div key={f.l} className="mk-funnel__row">
                <span>{f.l}</span>
                <span className="mk-funnel__bar">
                  <i style={{ width: on ? `${f.v}%` : '0%', transitionDelay: `${0.3 + i * 0.15}s` }} />
                </span>
                <b>{f.v}%</b>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Browser>
  );
}

/* Phone app --------------------------------------------------------------- */
function Phone({ x, on }: { x: Extract & { kind: 'phone' }; on: boolean }) {
  const score = 78;
  const C = 2 * Math.PI * 52;
  return (
    <div className="mk-phone-wrap">
      <div className="mk-phone">
        <div className="mk-phone__notch" />
        <div className="mk-phone__screen">
          <div className="mk-app__head">
            <div>
              <p className="mk-app__hello">{x.hello}</p>
              <p className="mk-app__sub">Athlon Club</p>
            </div>
            <span className="mk-app__avatar">G</span>
          </div>
          <div className="mk-app__score">
            <svg viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="52" className="mk-ring__bg" />
              <circle cx="60" cy="60" r="52" className="mk-ring" style={{ strokeDasharray: C, strokeDashoffset: on ? C * (1 - score / 100) : C }} />
            </svg>
            <div className="mk-app__score-v">
              <strong>
                <Count to={score} on={on} />
              </strong>
              <span>{x.score}</span>
            </div>
            <div className="mk-app__pillars">
              {['Train', 'Food', 'Recover'].map((p, i) => (
                <span key={p}>
                  <i style={{ width: on ? `${[82, 64, 88][i]}%` : 0, transitionDelay: `${0.5 + i * 0.15}s` }} />
                  {p}
                </span>
              ))}
            </div>
          </div>
          <div className="mk-app__card">
            <p className="mk-app__k">{x.next}</p>
            <p className="mk-app__class">{x.nextClass}</p>
            <p className="mk-app__when">{x.nextWhen}</p>
          </div>
          <div className="mk-app__badge">
            <span className="mk-qr" />
            {x.badge}
          </div>
          <div className="mk-app__tabs">
            {x.tabs.map((t, i) => (
              <span key={t} className={i === 0 ? 'on' : ''}>
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* Failed payments resolving one by one ------------------------------------ */
function Resolve({ x, on, sample }: { x: Extract & { kind: 'resolve' }; on: boolean; sample: string }) {
  const [done, setDone] = useState(0);
  useEffect(() => {
    if (!on) return;
    setDone(0);
    let k = 0;
    const id = setInterval(() => {
      k += 1;
      setDone(k);
      if (k >= x.rows.length) clearInterval(id);
    }, 900);
    return () => clearInterval(id);
  }, [on, x.rows.length]);
  const amt = x.rows.slice(0, done).reduce((s, r) => s + parseFloat(r.amt.replace(/[^\d,.]/g, '').replace(',', '.')), 0);
  return (
    <Browser url={x.url} sample={sample}>
      <div className="mk-recovered">
        <span>{x.counter}</span>
        <strong>€ {amt.toFixed(2).replace('.', ',')}</strong>
        <span className="mk-recovered__bar">
          <i style={{ width: `${(done / x.rows.length) * 100}%` }} />
        </span>
      </div>
      <table className="mk-table">
        <thead>
          <tr>
            {x.head.map((h) => (
              <th key={h}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {x.rows.map((r, i) => (
            <tr key={i} className={i < done ? 'is-done' : ''}>
              <td>
                <span className="mk-av">{r.n.slice(0, 1)}</span>
                {r.n}
              </td>
              <td>{r.what}</td>
              <td>{r.amt}</td>
              <td>
                <span className="mk-chip">{i < done ? x.to : x.from}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Browser>
  );
}

/* WhatsApp chat typing in sequence --------------------------------------- */
function Chat({ x, on }: { x: Extract & { kind: 'chat' }; on: boolean }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!on) return;
    setN(0);
    let k = 0;
    const id = setInterval(() => {
      k += 1;
      setN(k);
      if (k > x.msgs.length + 3) {
        k = 0;
        setN(0);
      }
    }, 1500);
    return () => clearInterval(id);
  }, [on, x.msgs.length]);
  return (
    <div className="mk-chat">
      <div className="mk-chat__head">
        <span className="mk-chat__icon">
          <Mark size={14} dot="#fff" color="#fff" />
        </span>
        <div>
          <strong>{x.who}</strong>
          <span>
            <i className="mk-live" /> {x.status}
          </span>
        </div>
      </div>
      <div className="mk-chat__body">
        {x.msgs.slice(0, n).map((m, i) => (
          <p key={i} className={`mk-msg${m.me ? ' mk-msg--me' : ''}${m.ai ? ' mk-msg--ai' : ''}${m.team ? ' mk-msg--team' : ''}`}>
            {m.ai && <span className="mk-msg__tag">AI</span>}
            {m.t}
          </p>
        ))}
        {n < x.msgs.length && n > 0 && (
          <p className={`mk-msg mk-typing${x.msgs[n]?.me ? ' mk-msg--me' : ''}`}>
            <i />
            <i />
            <i />
          </p>
        )}
      </div>
    </div>
  );
}

/* Kiosk ------------------------------------------------------------------- */
function Kiosk({ x, on }: { x: Extract & { kind: 'kiosk' }; on: boolean }) {
  const step = useTicker(on, 3, 2200);
  return (
    <div className="mk-kiosk-wrap">
      <div className="mk-kiosk">
        <div className="mk-kiosk__screen">
          <div className="mk-kiosk__top">
            <Mark size={16} dot="#fff" />
            <div className="mk-steps">
              {x.steps.map((s, i) => (
                <span key={s} className={i <= step ? 'on' : ''}>
                  <b>{i + 1}</b>
                  {s}
                </span>
              ))}
            </div>
          </div>
          <div className="mk-kiosk__stage" data-step={step}>
            <div className="mk-kiosk__plan">
              <span>{x.plan}</span>
              <strong>{x.price}</strong>
            </div>
            <div className="mk-kiosk__qr">
              <span className="mk-qr mk-qr--big" />
              <p>{x.qr}</p>
            </div>
            <div className="mk-kiosk__sign">
              <svg viewBox="0 0 200 60">
                <path d="M10 40c20-30 30 10 45-5s15-25 30 0 20 10 35-10 25 5 40 0 20-10 30-5" pathLength={1} />
              </svg>
              <span className="mk-kiosk__ok">✓</span>
            </div>
          </div>
        </div>
        <div className="mk-kiosk__stand" />
      </div>
    </div>
  );
}

/* Unassigned deals alert -------------------------------------------------- */
function Alert({ x, on, sample }: { x: Extract & { kind: 'alert' }; on: boolean; sample: string }) {
  const taken = useTicker(on, x.rows.length + 2, 1500);
  const [sec, setSec] = useState(0);
  useEffect(() => {
    if (!on) return;
    const id = setInterval(() => setSec((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [on]);
  return (
    <Browser url={x.url} sample={sample}>
      <div className="mk-alert__banner">
        <i className="mk-live mk-live--red" />
        {x.rows.length - Math.min(taken, x.rows.length)} · {x.title}
      </div>
      <div className="mk-alert__list">
        {x.rows.map((r, i) => {
          const t = i < taken;
          return (
            <div key={r.n} className={`mk-alert__row${t ? ' is-taken' : ''}`}>
              <div>
                <strong>{r.n}</strong>
                <span>
                  {r.ch} · {x.ago} {3 + i * 2}:{String((sec + i * 17) % 60).padStart(2, '0')}
                </span>
              </div>
              <button type="button" tabIndex={-1}>
                {t ? `✓ ${x.taken}` : x.take}
              </button>
            </div>
          );
        })}
      </div>
    </Browser>
  );
}

/* Data flow between systems ------------------------------------------------ */
function Flow({ x, on }: { x: Extract & { kind: 'flow' }; on: boolean }) {
  return (
    <div className={`mk-flow${on ? ' is-on' : ''}`}>
      <div className="mk-flow__nodes">
        {x.nodes.map((n, i) => (
          <div key={n.t} className="mk-flow__node" style={{ transitionDelay: `${i * 0.18}s` }}>
            <span className="mk-flow__dot">{String(i + 1).padStart(2, '0')}</span>
            <strong>{n.t}</strong>
            <small>{n.s}</small>
            {i < x.nodes.length - 1 && (
              <span className="mk-flow__pipe">
                <i />
                <i />
                <i />
              </span>
            )}
          </div>
        ))}
      </div>
      <p className="mk-flow__count">
        <strong>
          <Count to={x.count} on={on} dur={2600} />
        </strong>{' '}
        {x.counter}
      </p>
    </div>
  );
}

/* Agenda ------------------------------------------------------------------ */
function Agenda({ x, on, sample }: { x: Extract & { kind: 'agenda' }; on: boolean; sample: string }) {
  const k = useTicker(on, x.items.length + 1, 1300);
  return (
    <Browser url={x.url} sample={sample}>
      <div className="mk-agenda">
        {x.items.map((it, i) => (
          <div key={it.h} className={`mk-agenda__row${i < k ? ' is-done' : ''}`} style={{ transitionDelay: `${i * 0.1}s` }}>
            <span className="mk-agenda__h">{it.h}</span>
            <span className="mk-agenda__bar" />
            <div>
              <strong>{it.t}</strong>
              <span>{it.s}</span>
            </div>
            <span className="mk-agenda__tag">{it.tag}</span>
            <span className="mk-agenda__ok">✓ {x.done}</span>
          </div>
        ))}
      </div>
    </Browser>
  );
}

/* De-duplication: three records become one -------------------------------- */
function Merge({ x, on }: { x: Extract & { kind: 'merge' }; on: boolean }) {
  const phase = useTicker(on, 4, 1800); // 0 apart, 1 lines, 2 merged, 3 hold
  return (
    <div className={`mk-merge${on ? ' is-on' : ''}`} data-phase={phase}>
      <svg className="mk-merge__lines" viewBox="0 0 600 400" preserveAspectRatio="none" aria-hidden="true">
        {[60, 200, 340].map((y) => (
          <path key={y} d={`M190 ${y} C 300 ${y}, 300 200, 410 200`} pathLength={1} />
        ))}
      </svg>
      <div className="mk-merge__src">
        {x.records.map((r, i) => (
          <div key={r.src} className="mk-rec" style={{ ['--i' as string]: i }}>
            <span className="mk-rec__src">{r.src}</span>
            {r.f.map((f, k) => (
              <span key={k} className={f === '—' ? 'mk-rec__f is-empty' : 'mk-rec__f'}>
                {f}
              </span>
            ))}
          </div>
        ))}
      </div>
      <div className="mk-rec mk-rec--merged">
        <span className="mk-rec__src">
          {x.merged.src} <em>✓ {x.label}</em>
        </span>
        {x.merged.f.map((f, k) => (
          <span key={k} className="mk-rec__f">
            {f}
          </span>
        ))}
      </div>
    </div>
  );
}

/* Person timeline ---------------------------------------------------------- */
function Timeline({ x, on, sample }: { x: Extract & { kind: 'timeline' }; on: boolean; sample: string }) {
  return (
    <Browser url={x.url} sample={sample}>
      <div className={`mk-person${on ? ' is-on' : ''}`}>
        <div className="mk-person__head">
          <span className="mk-av mk-av--big">{x.person.slice(0, 1)}</span>
          <div>
            <strong>{x.person}</strong>
            <span>{x.meta}</span>
          </div>
        </div>
        <ol className="mk-tl">
          {x.events.map((e, i) => (
            <li key={i} style={{ transitionDelay: `${0.2 + i * 0.18}s` }}>
              <span className="mk-tl__d">{e.d}</span>
              <span className="mk-tl__dot" />
              <div>
                <strong>{e.t}</strong>
                <span>{e.s}</span>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </Browser>
  );
}

/* Bars: two series per month ---------------------------------------------- */
function Bars({ x, on, sample }: { x: Extract & { kind: 'bars' }; on: boolean; sample: string }) {
  const max = Math.max(...x.a, ...x.b);
  return (
    <Browser url={x.url} sample={sample}>
      <Tiles tiles={x.tiles} on={on} />
      <div className="mk-card">
        <div className="mk-legend">
          <span>
            <i className="a" />
            {x.legend[0]}
          </span>
          <span>
            <i className="b" />
            {x.legend[1]}
          </span>
        </div>
        <div className="mk-bars">
          {x.months.map((m, i) => (
            <div key={m} className="mk-bars__col">
              <div className="mk-bars__pair">
                <i className="a" style={{ height: on ? `${(x.a[i] / max) * 100}%` : '0%', transitionDelay: `${i * 0.05}s` }} />
                <i className="b" style={{ height: on ? `${(x.b[i] / max) * 100}%` : '0%', transitionDelay: `${0.1 + i * 0.05}s` }} />
              </div>
              <span>{m}</span>
            </div>
          ))}
        </div>
      </div>
    </Browser>
  );
}

/* Mirror download counter -------------------------------------------------- */
function Mirror({ x, on }: { x: Extract & { kind: 'mirror' }; on: boolean }) {
  const max = Math.max(...x.tables.map((t) => t.rows));
  return (
    <div className={`mk-mirror${on ? ' is-on' : ''}`}>
      <div className="mk-mirror__total">
        <strong>
          <Count to={x.total} on={on} dur={3200} />
        </strong>
        <span>{x.totalLabel}</span>
        <small>{x.time}</small>
      </div>
      <div className="mk-mirror__tables">
        {x.tables.map((t, i) => (
          <div key={t.n} className="mk-mirror__row">
            <span>{t.n}</span>
            <span className="mk-mirror__bar">
              <i style={{ width: on ? `${Math.max(4, (t.rows / max) * 100)}%` : '0%', transitionDelay: `${0.2 + i * 0.2}s` }} />
            </span>
            <b>
              <Count to={t.rows} on={on} dur={2400 + i * 200} />
            </b>
          </div>
        ))}
      </div>
    </div>
  );
}

/* Page weight ------------------------------------------------------------- */
function Weight({ x, on }: { x: Extract & { kind: 'weight' }; on: boolean }) {
  const f = (n: number) => `${n.toFixed(2).replace('.', ',')} MB`;
  return (
    <div className={`mk-weight${on ? ' is-on' : ''}`}>
      {[
        [x.before, x.beforeV],
        [x.after, x.afterV],
      ].map(([l, v], i) => (
        <div key={String(l)} className={`mk-weight__row${i ? ' is-after' : ''}`}>
          <span>{l}</span>
          <span className="mk-weight__bar">
            <i style={{ width: on ? `${((v as number) / x.beforeV) * 100}%` : '0%' }} />
          </span>
          <b>
            <Count to={v as number} on={on} dur={1800} fmt={f} />
          </b>
        </div>
      ))}
    </div>
  );
}

export function ExtractView({ x, sample }: { x: Extract; sample: string }) {
  const [ref, on] = useInView<HTMLDivElement>();
  let body: ReactNode = null;
  switch (x.kind) {
    case 'kpi':
      body = <Kpi x={x} on={on} sample={sample} />;
      break;
    case 'phone':
      body = <Phone x={x} on={on} />;
      break;
    case 'resolve':
      body = <Resolve x={x} on={on} sample={sample} />;
      break;
    case 'chat':
      body = <Chat x={x} on={on} />;
      break;
    case 'kiosk':
      body = <Kiosk x={x} on={on} />;
      break;
    case 'alert':
      body = <Alert x={x} on={on} sample={sample} />;
      break;
    case 'flow':
      body = <Flow x={x} on={on} />;
      break;
    case 'agenda':
      body = <Agenda x={x} on={on} sample={sample} />;
      break;
    case 'merge':
      body = <Merge x={x} on={on} />;
      break;
    case 'timeline':
      body = <Timeline x={x} on={on} sample={sample} />;
      break;
    case 'bars':
      body = <Bars x={x} on={on} sample={sample} />;
      break;
    case 'mirror':
      body = <Mirror x={x} on={on} />;
      break;
    case 'weight':
      body = <Weight x={x} on={on} />;
      break;
  }
  return (
    <div className={`mk mk--${x.kind}`} ref={ref}>
      {body}
    </div>
  );
}
