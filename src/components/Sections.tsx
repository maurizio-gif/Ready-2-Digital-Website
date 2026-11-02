import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CONTACT_EMAIL, type Copy } from '../content';
import { Mark } from './Mark';

gsap.registerPlugin(ScrollTrigger);

const asset = (p: string) => `${import.meta.env.BASE_URL}${p}`;

/* ------------------------------------------------------------------ */
/* Manifesto: the words light up one by one as you scroll through it. */
/* ------------------------------------------------------------------ */
export function Manifesto({ t }: { t: Copy }) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const words = ref.current!.querySelectorAll('.mw');
    const ctx = gsap.context(() => {
      gsap.fromTo(
        words,
        { opacity: 0.12 },
        {
          opacity: 1,
          stagger: 0.05,
          ease: 'none',
          scrollTrigger: { trigger: ref.current, start: 'top 70%', end: 'bottom 60%', scrub: true },
        },
      );
    }, ref);
    return () => ctx.revert();
  }, [t]);
  const words = t.manifesto.text.split(' ');
  const hot = new Set(['standard.', 'off-the-shelf', 'semplificare', 'blindare', 'simplify', 'lock', 'usano.', 'use']);
  return (
    <section className="manifesto section" ref={ref} id="approccio">
      <div className="container">
        <p className="kicker" data-reveal>
          {t.manifesto.kicker}
        </p>
        <p className="manifesto__text">
          {words.map((w, i) => (
            <span key={i} className={`mw${hot.has(w) ? ' mw--hot' : ''}`}>
              {w}{' '}
            </span>
          ))}
        </p>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Standard vs only one: a split you can drag.                         */
/* ------------------------------------------------------------------ */
export function Antithesis({ t }: { t: Copy }) {
  const wrap = useRef<HTMLDivElement>(null);
  const [split, setSplit] = useState(50);
  const dragging = useRef(false);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Scroll sweeps the divider from "standard" to "only one".
      const o = { v: 96 };
      gsap.to(o, {
        v: 4,
        ease: 'none',
        scrollTrigger: { trigger: wrap.current, start: 'top 70%', end: 'bottom 45%', scrub: 0.6 },
        onUpdate: () => {
          if (!dragging.current) setSplit(o.v);
        },
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  const setFrom = (x: number) => {
    const b = wrap.current!.getBoundingClientRect();
    setSplit(Math.min(96, Math.max(4, ((x - b.left) / b.width) * 100)));
  };

  return (
    <section className="anti section" ref={ref}>
      <div className="container">
        <p className="kicker" data-reveal>
          {t.antithesis.kicker}
        </p>
        <h2 className="h-xl anti__title" data-split>
          {t.antithesis.title.map((w, i) => (
            <span key={i} className={i === 2 ? 'accent' : i === 1 ? 'muted' : undefined}>
              {w}{' '}
            </span>
          ))}
        </h2>
        <div
          className="anti__split"
          ref={wrap}
          style={{ ['--split' as string]: `${split}%` }}
          onPointerDown={(e) => {
            dragging.current = true;
            (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
            setFrom(e.clientX);
          }}
          onPointerMove={(e) => dragging.current && setFrom(e.clientX)}
          onPointerUp={() => (dragging.current = false)}
          onPointerCancel={() => (dragging.current = false)}
        >
          <div className="anti__side anti__side--std">
            <p className="anti__label">{t.antithesis.standardLabel}</p>
            <ul>
              {t.antithesis.standard.map((s) => (
                <li key={s}>
                  <span className="x">×</span>
                  {s}
                </li>
              ))}
            </ul>
          </div>
          <div className="anti__side anti__side--one" aria-hidden={split > 95}>
            <p className="anti__label">{t.antithesis.oneLabel}</p>
            <ul>
              {t.antithesis.one.map((s) => (
                <li key={s}>
                  <span className="ok" />
                  {s}
                </li>
              ))}
            </ul>
          </div>
          <div className="anti__handle" role="slider" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(split)} tabIndex={0}
            aria-label={`${t.antithesis.standardLabel} / ${t.antithesis.oneLabel}`}
            onKeyDown={(e) => {
              if (e.key === 'ArrowLeft') setSplit((s) => Math.max(4, s - 5));
              if (e.key === 'ArrowRight') setSplit((s) => Math.min(96, s + 5));
            }}>
            <span>‹ ›</span>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Services: cards with a spotlight that follows the pointer.          */
/* ------------------------------------------------------------------ */
const ICONS: string[] = [
  'M4 6h16v12H4z M4 10h16', // web
  'M8 3h8v18H8z M11 18h2', // mobile
  'M5 18c0-3 3-5 7-5s7 2 7 5 M12 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6', // crm
  'M4 5h16v4H4z M4 11h16v4H4z M4 17h16v2H4z', // erp
  'M4 19V9 M10 19V5 M16 19v-7 M22 19H2', // dashboard
  'M5 12h5l2-4 2 8 2-4h3', // automation
  'M7 7a3 3 0 1 0 0 .01 M17 17a3 3 0 1 0 0 .01 M9 9l6 6 M17 7h.01 M7 17h.01', // integrations
  'M7 3h10v14H7z M10 21h4 M12 17v4 M10 8h4', // kiosk
  'M4 12a8 8 0 1 0 16 0 8 8 0 0 0-16 0 M9 10h.01 M15 10h.01 M9 15c2 1.5 4 1.5 6 0', // ai
  'M12 3l7 3v6c0 4-3 7-7 9-4-2-7-5-7-9V6z M9 12l2 2 4-4', // privacy
];

export function Services({ t }: { t: Copy }) {
  return (
    <section className="services section section--light" id="servizi">
      <div className="container">
        <div className="section__head">
          <p className="kicker" data-reveal>
            {t.services.kicker}
          </p>
          <h2 className="h-xl" data-split>
            {t.services.title}
          </h2>
          <p className="lead" data-reveal>
            {t.services.sub}
          </p>
        </div>
        <div className="svc-grid">
          {t.services.items.map((s, i) => (
            <article
              key={s.t}
              className="svc"
              data-card
              onPointerMove={(e) => {
                const b = e.currentTarget.getBoundingClientRect();
                const x = e.clientX - b.left;
                const y = e.clientY - b.top;
                e.currentTarget.style.setProperty('--mx', `${x}px`);
                e.currentTarget.style.setProperty('--my', `${y}px`);
                e.currentTarget.style.setProperty('--rx', `${((y / b.height) - 0.5) * -8}deg`);
                e.currentTarget.style.setProperty('--ry', `${((x / b.width) - 0.5) * 8}deg`);
              }}
              onPointerLeave={(e) => {
                e.currentTarget.style.setProperty('--rx', '0deg');
                e.currentTarget.style.setProperty('--ry', '0deg');
              }}
            >
              <div className="svc__top">
                <svg viewBox="0 0 24 24" className="svc__icon" aria-hidden="true">
                  <path d={ICONS[i]} />
                </svg>
                <span className="svc__tag">{s.tag}</span>
              </div>
              <h3 className="svc__title">{s.t}</h3>
              <p className="svc__text">{s.d}</p>
              <span className="svc__n">{String(i + 1).padStart(2, '0')}</span>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Modular: switch our modules on around the client's own software.    */
/* ------------------------------------------------------------------ */
export function Modular({ t }: { t: Copy }) {
  const [on, setOn] = useState<boolean[]>(() => t.modular.modules.map((_, i) => i === 0 || i === 3 || i === 5));
  const n = on.filter(Boolean).length;
  const count = t.modular.modules.length;
  return (
    <section className="modular section" id="modulare">
      <div className="container modular__grid">
        <div className="modular__copy">
          <p className="kicker" data-reveal>
            {t.modular.kicker}
          </p>
          <h2 className="h-xl" data-split>
            {t.modular.title}
          </h2>
          <p className="lead" data-reveal>
            {t.modular.sub}
          </p>
          <p className="modular__hint" data-reveal>
            {t.modular.hint}
          </p>
          <div className="chips" data-reveal>
            {t.modular.modules.map((m, i) => (
              <button
                key={m}
                type="button"
                className={`chip${on[i] ? ' is-on' : ''}`}
                aria-pressed={on[i]}
                onClick={() => setOn((s) => s.map((v, k) => (k === i ? !v : v)))}
              >
                <span className="chip__dot" />
                {m}
              </button>
            ))}
          </div>
        </div>
        <div className="orbit" data-reveal aria-hidden="true">
          <svg viewBox="-300 -300 600 600" className="orbit__svg">
            <circle r="250" className="orbit__ring" />
            <circle r="170" className="orbit__ring orbit__ring--in" />
            {t.modular.modules.map((_, i) => {
              const a = (i / count) * Math.PI * 2 - Math.PI / 2;
              const x = Math.cos(a) * 230;
              const y = Math.sin(a) * 230;
              return (
                <g key={i} className={`orbit__mod${on[i] ? ' is-on' : ''}`}>
                  <line x1={x * 0.42} y1={y * 0.42} x2={x} y2={y} className="orbit__link" />
                  <line x1={x * 0.42} y1={y * 0.42} x2={x} y2={y} className="orbit__flow" />
                  <circle cx={x} cy={y} r="16" className="orbit__node" />
                </g>
              );
            })}
            <circle r="112" className="orbit__core" />
          </svg>
          <div className="orbit__labels">
            {t.modular.modules.map((m, i) => {
              const a = (i / count) * Math.PI * 2 - Math.PI / 2;
              return (
                <span
                  key={m}
                  className={`orbit__label${on[i] ? ' is-on' : ''}`}
                  style={{ left: `${50 + Math.cos(a) * 38.3}%`, top: `${50 + Math.sin(a) * 38.3}%`, ['--dx' as string]: Math.cos(a) > 0.2 ? '1' : Math.cos(a) < -0.2 ? '-1' : '0', ['--dy' as string]: Math.sin(a) > 0.2 ? '1' : Math.sin(a) < -0.2 ? '-1' : '0' }}
                >
                  {m}
                </span>
              );
            })}
          </div>
          <div className="orbit__center">
            <strong>{t.modular.core}</strong>
            <span>{t.modular.coreSub}</span>
            <em>{t.modular.connected(n)}</em>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Method: a horizontal track pinned while you scroll.                 */
/* ------------------------------------------------------------------ */
export function Method({ t }: { t: Copy }) {
  const ref = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const mm = gsap.matchMedia();
    mm.add('(min-width: 900px) and (prefers-reduced-motion: no-preference)', () => {
      const el = track.current!;
      const dist = () => el.scrollWidth - window.innerWidth + 48;
      const tw = gsap.to(el, {
        x: () => -dist(),
        ease: 'none',
        scrollTrigger: {
          trigger: ref.current,
          start: 'top top',
          end: () => `+=${dist()}`,
          pin: true,
          scrub: 0.8,
          invalidateOnRefresh: true,
          onUpdate: (s) => ref.current!.style.setProperty('--mp', s.progress.toFixed(4)),
        },
      });
      return () => tw.kill();
    });
    return () => mm.revert();
  }, []);
  return (
    <section className="method section" id="metodo" ref={ref}>
      <div className="container method__head">
        <p className="kicker" data-reveal>
          {t.method.kicker}
        </p>
        <h2 className="h-xl" data-split>
          {t.method.title}
        </h2>
      </div>
      <div className="method__rail" aria-hidden="true">
        <span className="method__rail-fill" />
        <span className="method__rail-dot" />
      </div>
      <div className="method__track" ref={track}>
        {t.method.steps.map((s, i) => (
          <article key={s.t} className="step">
            <span className="step__n">{String(i + 1).padStart(2, '0')}</span>
            <h3 className="step__title">{s.t}</h3>
            <p className="step__text">{s.d}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Origin: Athlon, with numbers that count up.                         */
/* ------------------------------------------------------------------ */
export function Origin({ t, lang }: { t: Copy; lang: string }) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const ctx = gsap.context(() => {
      ref.current!.querySelectorAll<HTMLElement>('[data-count]').forEach((el) => {
        const end = Number(el.dataset.count);
        const o = { v: 0 };
        gsap.to(o, {
          v: end,
          duration: 2.2,
          ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 85%', once: true },
          onUpdate: () => {
            el.textContent = Math.round(o.v).toLocaleString(lang === 'it' ? 'it-IT' : 'en-GB');
          },
        });
      });
      gsap.to('.origin__img img', {
        yPercent: 12,
        ease: 'none',
        scrollTrigger: { trigger: ref.current, start: 'top bottom', end: 'bottom top', scrub: true },
      });
    }, ref);
    return () => ctx.revert();
  }, [lang]);
  return (
    <section className="origin section" ref={ref}>
      <div className="container origin__grid">
        <div className="origin__img" data-reveal>
          <img src={asset('images/work/athlon.jpg')} alt="Athlon Club, Roma" loading="lazy" />
        </div>
        <div>
          <p className="kicker" data-reveal>
            {t.origin.kicker}
          </p>
          <h2 className="h-xl" data-split>
            {t.origin.title}
          </h2>
          <p className="lead" data-reveal>
            {t.origin.text}
          </p>
        </div>
      </div>
      <div className="container">
        <div className="metrics">
          {t.origin.metrics.map((m) => (
            <div key={m.l} className="metric" data-reveal>
              <p className="metric__v">
                <span data-count={m.v}>0</span>
                {m.s}
              </p>
              <p className="metric__l">{m.l}</p>
              <p className="metric__n">{m.n}</p>
            </div>
          ))}
        </div>
        <ul className="built" data-reveal>
          {t.origin.built.map((b) => (
            <li key={b}>{b}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Work                                                                */
/* ------------------------------------------------------------------ */
export function Work({ t }: { t: Copy }) {
  return (
    <section className="work section section--light" id="progetti">
      <div className="container">
        <div className="section__head">
          <p className="kicker" data-reveal>
            {t.work.kicker}
          </p>
          <h2 className="h-xl" data-split>
            {t.work.title}
          </h2>
        </div>
        <div className="work-grid">
          {t.work.items.map((w, i) => (
            <article key={w.c} className={`case${w.img ? ' case--img' : ''}${i < 3 ? ' case--big' : ''}`} data-card>
              {w.img && (
                <div className="case__media">
                  <img src={asset(w.img)} alt="" loading="lazy" />
                </div>
              )}
              <div className="case__body">
                <div className="case__head">
                  {w.logo ? <img className="case__logo" src={asset(w.logo)} alt="" loading="lazy" /> : <span className="case__mono">{w.c.slice(0, 1)}</span>}
                  <div>
                    <h3 className="case__client">{w.c}</h3>
                    <p className="case__sector">{w.s}</p>
                  </div>
                </div>
                <p className="case__title">{w.t}</p>
                <p className="case__metric">
                  <strong>{w.m}</strong> {w.ml}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Sectors + stack marquees                                            */
/* ------------------------------------------------------------------ */
export function Sectors({ t }: { t: Copy }) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to('.marquee--a .marquee__inner', {
        xPercent: -25,
        ease: 'none',
        scrollTrigger: { trigger: ref.current, start: 'top bottom', end: 'bottom top', scrub: 0.5 },
      });
      gsap.fromTo(
        '.marquee--b .marquee__inner',
        { xPercent: -25 },
        { xPercent: 0, ease: 'none', scrollTrigger: { trigger: ref.current, start: 'top bottom', end: 'bottom top', scrub: 0.5 } },
      );
    }, ref);
    return () => ctx.revert();
  }, []);
  const row = (items: string[]) => [...items, ...items, ...items, ...items];
  return (
    <section className="sectors section" ref={ref}>
      <div className="container">
        <p className="kicker" data-reveal>
          {t.sectors.kicker}
        </p>
        <h2 className="h-lg" data-split>
          {t.sectors.title}
        </h2>
      </div>
      <div className="marquee marquee--a" aria-hidden="true">
        <div className="marquee__inner">
          {row(t.sectors.list).map((s, i) => (
            <span key={i} className="marquee__item">
              {s}
              <Mark size={22} dot="#F4F1EA" />
            </span>
          ))}
        </div>
      </div>
      <div className="marquee marquee--b" aria-hidden="true">
        <div className="marquee__inner">
          {row(t.stack).map((s, i) => (
            <span key={i} className="marquee__item marquee__item--sm">
              {s}
            </span>
          ))}
        </div>
      </div>
      <p className="sr-only">{t.sectors.list.join(', ')}. {t.stack.join(', ')}.</p>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Contact                                                             */
/* ------------------------------------------------------------------ */
export function Contact({ t }: { t: Copy }) {
  const btn = useRef<HTMLButtonElement>(null);
  const [f, setF] = useState({ name: '', company: '', email: '', message: '' });
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const body = `${f.message}\n\n— ${f.name}${f.company ? `, ${f.company}` : ''}\n${f.email}`;
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(t.contact.mailSubject)}&body=${encodeURIComponent(body)}`;
  };
  return (
    <section className="contact section" id="contatti">
      <div className="container contact__grid">
        <div>
          <p className="kicker" data-reveal>
            {t.contact.kicker}
          </p>
          <h2 className="contact__title" data-split>
            <span>{t.contact.title[0]}</span> <span className="accent">{t.contact.title[1]}</span>
          </h2>
          <p className="lead" data-reveal>
            {t.contact.sub}
          </p>
          <p className="contact__mail" data-reveal>
            {t.contact.or}{' '}
            <a href={`mailto:${CONTACT_EMAIL}`} className="link">
              {CONTACT_EMAIL}
            </a>
          </p>
        </div>
        <form className="form" onSubmit={submit} data-reveal>
          {(['name', 'company', 'email'] as const).map((k) => (
            <label key={k} className="field">
              <input
                type={k === 'email' ? 'email' : 'text'}
                required={k !== 'company'}
                placeholder=" "
                value={f[k]}
                onChange={(e) => setF({ ...f, [k]: e.target.value })}
                autoComplete={k === 'name' ? 'name' : k === 'email' ? 'email' : 'organization'}
              />
              <span>{t.contact[k]}</span>
            </label>
          ))}
          <label className="field">
            <textarea required rows={4} placeholder=" " value={f.message} onChange={(e) => setF({ ...f, message: e.target.value })} />
            <span>{t.contact.message}</span>
          </label>
          <button
            ref={btn}
            className="btn btn--big magnetic"
            type="submit"
          >
            <span>{t.contact.send}</span>
            <span className="btn__arrow">→</span>
          </button>
        </form>
      </div>
    </section>
  );
}
