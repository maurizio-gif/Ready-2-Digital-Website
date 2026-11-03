import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { caseUi, cases, type Case } from '../cases';
import type { Lang } from '../content';
import { Dots, type DotsVariant } from './Dots';
import { ExtractView } from './Mocks';
import { Mark } from './Mark';
import { CaseTech } from './Tech';
import { Link } from './Nav';
import { ClientLogo, hasLogo } from './Logos';
import { RealScreens } from './RealScreens';
import { Ecosystem } from './Scenes';

gsap.registerPlugin(ScrollTrigger);

const asset = (p: string) => `${import.meta.env.BASE_URL}${p}`;
const VARIANTS: DotsVariant[] = ['gooey', 'neural', 'converge'];

export function CasePage({ c, lang }: { c: Case; lang: Lang }) {
  const ui = caseUi[lang];
  const list = cases[lang];
  const idx = list.findIndex((x) => x.slug === c.slug);
  const next = list[(idx + 1) % list.length];
  const hero = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.case-hero .reveal-line > span', { y: 0, yPercent: 110 }, { y: 0, yPercent: 0, duration: 1.3, ease: 'expo.out', stagger: 0.08, delay: 0.15 });
      gsap.fromTo('.case-hero [data-fade]', { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 1, ease: 'power3.out', stagger: 0.1, delay: 0.5 });
      gsap.to('.case-hero__img img', { yPercent: 14, ease: 'none', scrollTrigger: { trigger: hero.current, start: 'top top', end: 'bottom top', scrub: true } });
    }, hero);
    return () => ctx.revert();
  }, [c.slug]);

  // Split the title into two lines at its natural break for the reveal.
  const words = c.title.split(' ');
  const half = Math.ceil(words.length / 2);
  const titleLines = [words.slice(0, half).join(' '), words.slice(half).join(' ')];

  return (
    <article className="case-page">
      <header className="case-hero" ref={hero}>
        {c.img && (
          <div className="case-hero__img">
            <img src={asset(c.img)} alt="" />
          </div>
        )}
        <div className="container case-hero__inner">
          <Link page="progetti" lang={lang} className="case-back" data-fade>
            ← {ui.back}
          </Link>
          <div className="case-hero__client" data-fade data-logo-host>
            {hasLogo(c.client) ? <ClientLogo client={c.client} size="hero" /> : c.logo ? <img src={asset(c.logo)} alt="" /> : <span className="case__mono">{c.client.slice(0, 1)}</span>}
            <div>
              <strong>{c.client}</strong>
              <span>{c.sector}</span>
            </div>
          </div>
          <h1 className="case-hero__title">
            {titleLines.map((l, i) => (
              <span key={i} className="reveal-line">
                <span className={i === 1 ? 'accent' : undefined}>{l}</span>
                {' '}
              </span>
            ))}
          </h1>
          <p className="case-hero__intro" data-fade>
            {c.intro}
          </p>
          <div className="case-metrics" data-fade>
            {c.metrics.map((m) => (
              <div key={m.l}>
                <strong>{m.v}</strong>
                <span>{m.l}</span>
              </div>
            ))}
          </div>
        </div>
      </header>

      <section className="section case-story">
        <div className="container case-story__grid">
          <div>
            <p className="kicker" data-reveal>
              {ui.challenge}
            </p>
            <p className="case-story__p" data-reveal>
              {c.challenge}
            </p>
          </div>
          <div>
            <p className="kicker" data-reveal>
              {ui.approach}
            </p>
            <p className="case-story__p" data-reveal>
              {c.approach}
            </p>
          </div>
        </div>
      </section>

      {c.ecosystem && (
        <section className="section eco-section">
          <div className="container">
            <div className="section__head">
              <p className="kicker" data-reveal>
                {c.ecosystem.kicker}
              </p>
              <h2 className="h-xl" data-split>
                {c.ecosystem.title}
              </h2>
              <p className="lead" data-reveal>
                {c.ecosystem.text}
              </p>
            </div>
            <div data-reveal>
              <Ecosystem e={c.ecosystem} lang={lang} />
            </div>
          </div>
        </section>
      )}

      <RealScreens slug={c.slug} lang={lang} />

      <Dots variant="gooey" lines={c.dots} />

      <section className="section case-extracts">
        <div className="container">
          <div className="section__head">
            <p className="kicker" data-reveal>
              {ui.extracts}
            </p>
            <h2 className="h-xl" data-split>
              {c.client}
            </h2>
            <p className="lead" data-reveal>
              {ui.extractsSub}
            </p>
          </div>
        </div>
        {c.extracts.map((x, i) => (
          <div key={x.title}>
            <div className={`container extract${i % 2 ? ' extract--flip' : ''}`}>
              <div className="extract__copy">
                <span className="extract__n">{String(i + 1).padStart(2, '0')}</span>
                <h3 className="extract__title" data-split>
                  {x.title}
                </h3>
                <p className="extract__text" data-reveal>
                  {x.text}
                </p>
              </div>
              <div className="extract__view" data-reveal>
                <ExtractView x={x} sample={ui.sample} flip={i % 2 === 1} />
              </div>
            </div>
            {i === 1 && c.extracts.length > 3 && <Dots variant={VARIANTS[(idx + 1) % 3]} />}
          </div>
        ))}
      </section>

      <section className="section case-built section--light">
        <div className="container case-built__grid">
          <div>
            <p className="kicker" data-reveal>
              {ui.built}
            </p>
            <ul className="case-built__list">
              {c.built.map((b, i) => (
                <li key={b} data-reveal>
                  <span>{String(i + 1).padStart(2, '0')}</span>
                  {b}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="kicker" data-reveal>
              {ui.stack}
            </p>
            <div className="case-stack" data-reveal>
              {c.stack.map((s) => (
                <span key={s}>{s}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <CaseTech slug={c.slug} lang={lang} />

      <Dots variant="converge" />

      <section className="section case-next">
        <div className="container case-next__grid">
          <div>
            <p className="kicker">{ui.cta}</p>
            <Link page="contatti" lang={lang} className="btn btn--big magnetic">
              <span>{ui.ctaBtn}</span>
              <span className="btn__arrow">→</span>
            </Link>
          </div>
          <Link page="caso" slug={next.slug} lang={lang} className="case-next__link">
            <span className="kicker">{ui.next}</span>
            <strong>{next.client}</strong>
            <span className="case-next__t">{next.title}</span>
            <Mark size={28} dot="#F4F1EA" />
          </Link>
        </div>
      </section>
    </article>
  );
}
