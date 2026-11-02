// Animated scenes for the case studies: the Athlon ecosystem, the AI agent at
// work inside the member portal and the CRM, and the membership/revenue
// dashboards. Like Mocks.tsx, every scene starts when it scrolls into view and
// loops while visible. All data shown is invented ("Dati di esempio").

import { useEffect, useRef, useState } from 'react';
import type { Extract } from '../cases';
import { Mark } from './Mark';
import { reducedMotion } from '../lib/env';

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

function Count({ to, on, dur = 1600, fmt }: { to: number; on: boolean; dur?: number; fmt?: (n: number) => string }) {
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!on) return;
    if (reducedMotion()) {
      setV(to);
      return;
    }
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

/** Steps 0..n-1 every `ms` while on; `hold` extra ms on the last step before looping. */
function useSteps(on: boolean, n: number, ms: number, hold = 0) {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (!on) {
      setI(0);
      return;
    }
    if (reducedMotion()) {
      setI(n - 1);
      return;
    }
    let step = 0;
    let id = 0;
    const tick = () => {
      step = (step + 1) % n;
      setI(step);
      id = window.setTimeout(tick, step === n - 1 ? ms + hold : ms);
    };
    id = window.setTimeout(tick, ms);
    return () => clearTimeout(id);
  }, [on, n, ms, hold]);
  return i;
}

const eur = (n: number) => `€ ${n.toLocaleString('it-IT', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

/* ------------------------------------------------------------------ */
/* Dashboard: memberships and revenue                                  */
/* ------------------------------------------------------------------ */
export function Dash({ x, on, sample }: { x: Extract & { kind: 'dash' }; on: boolean; sample: string }) {
  const W = 520;
  const H = 150;
  const max = Math.max(...x.revenue) * 1.12;
  const pts = x.revenue.map((v, i) => [(i / (x.revenue.length - 1)) * W, H - (v / max) * H] as const);
  const line = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join('');
  const area = `${line}L${W} ${H}L0 ${H}Z`;
  const mmax = Math.max(...x.members.new.map((v, i) => v + x.members.renewed[i]), ...x.members.lapsed);
  const total = x.mix.reduce((s, m) => s + m.v, 0);
  let acc = 0;
  const feedStep = useSteps(on, x.feed.length + 1, 1400);
  const live = x.feed.slice(0, Math.max(1, feedStep)).reverse();
  return (
    <div className="mk-browser">
      <div className="mk-browser__bar">
        <span className="mk-dots">
          <i />
          <i />
          <i />
        </span>
        <span className="mk-url">{x.url}</span>
        <span className="mk-sample">{sample}</span>
      </div>
      <div className="mk-browser__body">
        <div className="mk-tiles" style={{ ['--n' as string]: x.tiles.length }}>
          {x.tiles.map((t) => (
            <div key={t.l} className="mk-tile">
              <span className="mk-tile__l">{t.l}</span>
              <strong className="mk-tile__v">
                {t.eur ? <Count to={t.v} on={on} fmt={eur} /> : <Count to={t.v} on={on} />}
                {t.suf}
              </strong>
              {t.d && <span className="mk-tile__d">▲ {t.d}</span>}
            </div>
          ))}
        </div>
        <div className="dash-grid">
          <div className="mk-card dash-rev">
            <p className="mk-card__t">{x.legend.revenue}</p>
            <svg viewBox={`0 0 ${W} ${H + 4}`} className={`mk-area${on ? ' is-on' : ''}`} preserveAspectRatio="none">
              <defs>
                <linearGradient id="dashg" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0" stopColor="#FF6000" stopOpacity=".35" />
                  <stop offset="1" stopColor="#FF6000" stopOpacity="0" />
                </linearGradient>
              </defs>
              {[0.25, 0.5, 0.75].map((g) => (
                <line key={g} x1="0" x2={W} y1={H * g} y2={H * g} className="mk-grid" />
              ))}
              <path d={area} fill="url(#dashg)" className="mk-area__fill" />
              <path d={line} className="mk-area__line" pathLength={1} />
              {pts.map((p, i) => (
                <circle key={i} cx={p[0]} cy={p[1]} r="4" className="mk-area__dot" style={{ transitionDelay: `${0.4 + i * 0.08}s` }} />
              ))}
            </svg>
            <div className="dash-months">
              {x.months.map((m) => (
                <span key={m}>{m}</span>
              ))}
            </div>
          </div>
          <div className="mk-card dash-mix">
            <p className="mk-card__t">{x.legend.mix}</p>
            <div className="dash-donut">
              <svg viewBox="0 0 120 120">
                {x.mix.map((m, i) => {
                  const C = 2 * Math.PI * 44;
                  const len = (m.v / total) * C;
                  const off = acc;
                  acc += len;
                  return <circle key={m.l} cx="60" cy="60" r="44" className={`dash-donut__seg s${i}`} style={{ strokeDasharray: `${on ? len : 0} ${C}`, strokeDashoffset: -off, transitionDelay: `${0.3 + i * 0.15}s` }} />;
                })}
              </svg>
              <div className="dash-donut__c">
                <strong>
                  <Count to={total} on={on} />
                </strong>
                <span>{x.legend.active}</span>
              </div>
            </div>
            <ul className="dash-mix__list">
              {x.mix.map((m, i) => (
                <li key={m.l}>
                  <i className={`s${i}`} />
                  {m.l}
                  <b>{Math.round((m.v / total) * 100)}%</b>
                </li>
              ))}
            </ul>
          </div>
          <div className="mk-card dash-members">
            <div className="mk-legend">
              <span>
                <i className="a" />
                {x.legend.new}
              </span>
              <span>
                <i className="c" />
                {x.legend.renewed}
              </span>
              <span>
                <i className="b" />
                {x.legend.lapsed}
              </span>
            </div>
            <div className="mk-bars dash-bars">
              {x.months.map((m, i) => (
                <div key={m} className="mk-bars__col">
                  <div className="mk-bars__pair">
                    <div className="dash-stack">
                      <i className="c" style={{ height: on ? `${(x.members.renewed[i] / mmax) * 100}%` : 0, transitionDelay: `${i * 0.05}s` }} />
                      <i className="a" style={{ height: on ? `${(x.members.new[i] / mmax) * 100}%` : 0, transitionDelay: `${0.1 + i * 0.05}s` }} />
                    </div>
                    <i className="b" style={{ height: on ? `${(x.members.lapsed[i] / mmax) * 100}%` : 0, transitionDelay: `${0.2 + i * 0.05}s` }} />
                  </div>
                  <span>{m}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="mk-card dash-feed">
            <p className="mk-card__t">
              <i className="mk-live" /> {x.legend.feed}
            </p>
            <ul>
              {live.map((f, i) => (
                <li key={f.t + i} className={i === 0 ? 'is-new' : ''}>
                  <span className="mk-av">{f.t.slice(0, 1)}</span>
                  <div>
                    <strong>{f.t}</strong>
                    <span>{f.s}</span>
                  </div>
                  <b>{f.amt}</b>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Portal: the AI agent books a class                                   */
/* ------------------------------------------------------------------ */
function PhoneShell({ children, title }: { children: React.ReactNode; title: string }) {
  return (
    <div className="mk-phone-wrap">
      <div className="mk-phone">
        <div className="mk-phone__notch" />
        <div className="mk-phone__screen ag-screen">
          <div className="ag-head">
            <span className="ag-head__icon">
              <Mark size={12} dot="#fff" color="#fff" />
            </span>
            <div>
              <strong>{title}</strong>
              <span>
                <i className="mk-live" /> online
              </span>
            </div>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}

export function AgentBook({ x, on }: { x: Extract & { kind: 'agentBook' }; on: boolean }) {
  // 0 user asks · 1 agent typing · 2 agent proposes slot · 3 tap · 4 booked · 5 hold
  const s = useSteps(on, 6, 1500, 1800);
  return (
    <PhoneShell title={x.who}>
      <div className="ag-body">
        <p className="mk-msg mk-msg--me ag-msg">{x.ask}</p>
        {s === 1 && (
          <p className="mk-msg mk-typing">
            <i />
            <i />
            <i />
          </p>
        )}
        {s >= 2 && (
          <div className="mk-msg mk-msg--ai ag-msg ag-card-msg">
            <span className="mk-msg__tag">AI</span>
            {x.reply}
            <div className={`ag-slot${s >= 3 ? ' is-pressed' : ''}${s >= 4 ? ' is-booked' : ''}`}>
              <div>
                <strong>{x.slot.cls}</strong>
                <span>{x.slot.when}</span>
                <small>
                  {x.slot.where} · {x.slot.spots}
                </small>
              </div>
              <button type="button" tabIndex={-1}>
                {s >= 4 ? '✓ ' + x.booked : x.btn}
              </button>
            </div>
          </div>
        )}
        {s >= 4 && (
          <div className="ag-toast">
            <span className="ag-toast__ok">✓</span>
            <div>
              <strong>{x.booked}</strong>
              <span>{x.calendar}</span>
            </div>
          </div>
        )}
      </div>
      <div className="mk-app__tabs">
        {x.tabs.map((t, i) => (
          <span key={t} className={(s >= 4 ? i === 1 : i === 0) ? 'on' : ''}>
            {t}
          </span>
        ))}
      </div>
    </PhoneShell>
  );
}

/* ------------------------------------------------------------------ */
/* Portal: the AI agent adds a payment method                          */
/* ------------------------------------------------------------------ */
export function AgentPay({ x, on }: { x: Extract & { kind: 'agentPay' }; on: boolean }) {
  // 0 ask · 1 typing · 2 reply · 3 card form in · 4 typing number · 5 saved · 6 hold
  const s = useSteps(on, 7, 1400, 1800);
  const typed = s >= 4 ? x.card.num : '•••• •••• •••• ••••';
  return (
    <PhoneShell title={x.who}>
      <div className="ag-body">
        <p className="mk-msg mk-msg--me ag-msg">{x.ask}</p>
        {s === 1 && (
          <p className="mk-msg mk-typing">
            <i />
            <i />
            <i />
          </p>
        )}
        {s >= 2 && (
          <p className="mk-msg mk-msg--ai ag-msg">
            <span className="mk-msg__tag">AI</span>
            {x.reply}
          </p>
        )}
        {s >= 3 && (
          <div className={`ag-pay${s >= 5 ? ' is-saved' : ''}`}>
            <div className="ag-card">
              <span className="ag-card__chip" />
              <span className="ag-card__brand">{x.card.brand}</span>
              <strong className="ag-card__num">{typed}</strong>
              <span className="ag-card__row">
                <span>{x.card.holder}</span>
                <span>{x.card.exp}</span>
              </span>
            </div>
            <button type="button" tabIndex={-1} className="ag-pay__btn">
              {s >= 5 ? '✓ ' + x.saved : x.save}
            </button>
          </div>
        )}
        {s >= 5 && (
          <p className="mk-msg mk-msg--ai ag-msg">
            <span className="mk-msg__tag">AI</span>
            {x.done}
          </p>
        )}
      </div>
      <div className="mk-app__tabs">
        {x.tabs.map((t, i) => (
          <span key={t} className={(s >= 3 ? i === 2 : i === 0) ? 'on' : ''}>
            {t}
          </span>
        ))}
      </div>
    </PhoneShell>
  );
}

/* ------------------------------------------------------------------ */
/* CRM: the AI agent prepares the call                                 */
/* ------------------------------------------------------------------ */
function Typed({ text, on, speed = 18, delay = 0 }: { text: string; on: boolean; speed?: number; delay?: number }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!on) {
      setN(0);
      return;
    }
    if (reducedMotion()) {
      setN(text.length);
      return;
    }
    let i = 0;
    let id = 0;
    const start = window.setTimeout(() => {
      const tick = () => {
        i += 1;
        setN(i);
        if (i < text.length) id = window.setTimeout(tick, speed);
      };
      tick();
    }, delay);
    return () => {
      clearTimeout(start);
      clearTimeout(id);
    };
  }, [on, text, speed, delay]);
  return (
    <>
      {text.slice(0, n)}
      {n < text.length && <span className="ag-caret" />}
    </>
  );
}

export function AgentCall({ x, on, sample }: { x: Extract & { kind: 'agentCall' }; on: boolean; sample: string }) {
  const [cycle, setCycle] = useState(0);
  useEffect(() => {
    if (!on || reducedMotion()) return;
    const id = setInterval(() => setCycle((c) => c + 1), 16000);
    return () => clearInterval(id);
  }, [on]);
  const k = `${cycle}`;
  return (
    <div className="mk-browser">
      <div className="mk-browser__bar">
        <span className="mk-dots">
          <i />
          <i />
          <i />
        </span>
        <span className="mk-url">{x.url}</span>
        <span className="mk-sample">{sample}</span>
      </div>
      <div className="mk-browser__body ag-crm" key={k}>
        <div className="mk-card ag-contact">
          <div className="mk-person__head">
            <span className="mk-av mk-av--big">{x.contact.n.slice(0, 1)}</span>
            <div>
              <strong>{x.contact.n}</strong>
              <span>{x.contact.s}</span>
            </div>
          </div>
          <ol className="mk-tl ag-tl">
            {x.contact.events.map((e, i) => (
              <li key={i} style={{ opacity: on ? 1 : 0, transform: on ? 'none' : 'translateX(-16px)', transition: `opacity .5s ${0.2 + i * 0.15}s, transform .6s ${0.2 + i * 0.15}s` }}>
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
        <div className="mk-card ag-panel">
          <p className="ag-panel__t">
            <span className="mk-msg__tag">AI</span> {x.panelTitle}
          </p>
          <ul className="ag-points">
            {x.points.map((p, i) => (
              <li key={i}>
                <Typed text={p} on={on} delay={900 + i * 1700} />
              </li>
            ))}
          </ul>
          <p className="ag-panel__k">{x.goalLabel}</p>
          <p className="ag-panel__v">
            <Typed text={x.goal} on={on} delay={900 + x.points.length * 1700} />
          </p>
          <p className="ag-panel__k">{x.openingLabel}</p>
          <p className="ag-panel__v ag-panel__q">
            <Typed text={x.opening} on={on} delay={1800 + x.points.length * 1700} speed={14} />
          </p>
          <button type="button" tabIndex={-1} className={`ag-call${on ? ' is-ready' : ''}`} style={{ transitionDelay: `${3.2 + x.points.length * 1.7 + x.opening.length * 0.014}s` }}>
            ☎ {x.call}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* The Athlon ecosystem: site, CRM and app around one database        */
/* ------------------------------------------------------------------ */
export type EcosystemData = { kicker: string; title: string; text: string; nodes: { site: string; crm: string; app: string; db: string; gest: string }; flows: { t: string; path: 'site-db' | 'db-crm' | 'app-db' | 'db-gest' | 'crm-app' | 'gest-db' }[] };

const NODE: Record<string, [number, number]> = { site: [120, 120], crm: [640, 120], app: [380, 430], db: [380, 250], gest: [660, 350] };
const PATHS: Record<string, string> = {
  'site-db': 'M120 120 C 220 120, 290 190, 380 250',
  'db-crm': 'M380 250 C 470 190, 540 120, 640 120',
  'app-db': 'M380 430 C 380 370, 380 310, 380 250',
  'db-gest': 'M380 250 C 490 250, 570 310, 660 350',
  'gest-db': 'M660 350 C 570 310, 490 250, 380 250',
  'crm-app': 'M640 120 C 620 280, 540 410, 380 430',
};

export function Ecosystem({ e, lang }: { e: EcosystemData; lang: string }) {
  const [ref, on] = useInView<HTMLDivElement>(0.3);
  const step = useSteps(on, e.flows.length, 3200);
  const flow = e.flows[step];
  const active = new Set(flow.path.split('-'));
  const sub = {
    site: lang === 'it' ? 'Astro · assistente AI' : 'Astro · AI assistant',
    crm: 'Next.js',
    app: 'Expo · iOS · Android',
    db: 'Supabase · Postgres',
    gest: 'PerfectGym',
  };
  return (
    <div className="eco" ref={ref}>
      <svg viewBox="40 40 700 460" className="eco__svg" aria-hidden="true">
        <defs>
          <filter id="ecoglow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6" />
          </filter>
        </defs>
        {Object.entries(PATHS).map(([k, d]) => (
          <path key={k} d={d} className={`eco__link${flow.path === k || (flow.path === 'db-gest' && k === 'gest-db') ? ' is-on' : ''}`} />
        ))}
        {!reducedMotion() &&
          [0, 1, 2].map((i) => (
            <circle key={`${flow.path}-${i}-${step}`} r="8" className="eco__packet" filter="url(#ecoglow)">
              <animateMotion dur="2.2s" begin={`${i * 0.55}s`} repeatCount="indefinite" path={PATHS[flow.path]} />
            </circle>
          ))}
        {Object.entries(NODE).map(([k, [cx, cy]]) => (
          <g key={k} className={`eco__node eco__node--${k}${active.has(k) ? ' is-on' : ''}`} transform={`translate(${cx} ${cy})`}>
            <circle r={k === 'db' ? 74 : 62} className="eco__ring" />
            <circle r={k === 'db' ? 64 : 52} className="eco__disc" />
            <text y="-3" className="eco__label">
              {e.nodes[k as keyof typeof e.nodes]}
            </text>
            <text y="16" className="eco__sub">
              {sub[k as keyof typeof sub]}
            </text>
          </g>
        ))}
      </svg>
      <div className="eco__caption">
        {e.flows.map((f, i) => (
          <p key={i} className={i === step ? 'is-on' : ''}>
            <span className="eco__n">{String(i + 1).padStart(2, '0')}</span>
            {f.t}
          </p>
        ))}
      </div>
    </div>
  );
}
