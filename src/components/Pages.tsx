import type { Copy, Lang } from '../content';
import { pages, NEXT, SERVICE_IDS } from '../pages';
import { Hero } from './Hero';
import { Antithesis, Contact, Manifesto, Method, Modular, Origin, Sectors, Services, Work } from './Sections';
import { Dots } from './Dots';
import { AccessControl, Integrations, Payments, TechStack } from './Tech';
import { Link, NextPage, PageHero } from './Nav';
import { privacyText } from '../legal';
import { AgentsTeaser } from './Agents';
import { TryAgent } from './Chat';

import { SocialLinks } from './Social';
import { FaqSection } from './Faq';

const asset = (p: string) => `${import.meta.env.BASE_URL}${p}`;

/* ------------------------------------------------------------------ */
/* Home                                                                */
/* ------------------------------------------------------------------ */
export function HomePage({ t, lang, ready }: { t: Copy; lang: Lang; ready: boolean }) {
  const p = pages[lang];
  const picks = [0, 1, 2];
  return (
    <>
      <Hero t={t} ready={ready} />
      <Manifesto t={t} />
      <Dots variant="gooey" lines={t.dots.a} />
      <Antithesis t={t} />

      <section className="section section--light teaser">
        <div className="container">
          <div className="teaser__head">
            <div>
              <p className="kicker" data-reveal>
                {p.teasers.solutions.kicker}
              </p>
              <h2 className="h-xl" data-split>
                {p.teasers.solutions.title}
              </h2>
            </div>
            <Link page="soluzioni" lang={lang} className="btn magnetic" data-reveal>
              <span>{p.teasers.solutions.more}</span>
              <span className="btn__arrow">→</span>
            </Link>
          </div>
          <div className="teaser__grid">
            {picks.map((i) => {
              const s = t.services.items[i];
              return (
                <Link key={s.t} page="soluzioni" lang={lang} hash={SERVICE_IDS[i]} className="teaser__card card-3d" data-card data-tilt="7">
                  <span className="svc__tag">{s.tag}</span>
                  <strong>{s.t}</strong>
                  <span>{s.d}</span>
                  <em>→</em>
                </Link>
              );
            })}
          </div>
          <div className="teaser__chips" data-reveal>
            {t.services.items.slice(3).map((s, k) => (
              <Link key={s.t} page="soluzioni" lang={lang} hash={SERVICE_IDS[k + 3]} className="chip">
                <span className="chip__dot" />
                {s.t}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <AgentsTeaser lang={lang} />
      <TryAgent lang={lang} />

      <section className="section teaser">
        <div className="container">
          <div className="teaser__head">
            <div>
              <p className="kicker" data-reveal>
                {p.teasers.work.kicker}
              </p>
              <h2 className="h-xl" data-split>
                {p.teasers.work.title}
              </h2>
            </div>
            <Link page="progetti" lang={lang} className="btn magnetic" data-reveal>
              <span>{p.teasers.work.more}</span>
              <span className="btn__arrow">→</span>
            </Link>
          </div>
        </div>
        <div className="work--dark">
          <Work t={t} lang={lang} head={false} only={3} />
        </div>
      </section>

      <Dots variant="converge" lines={t.dots.c} />

      <FaqSection kicker={p.faq.kicker} title={p.faq.title} items={p.faq.items} />

      <section className="section cta-band">
        <div className="container cta-band__inner">
          <h2 className="h-xl" data-split>
            {p.teasers.cta.title}
          </h2>
          <Link page="contatti" lang={lang} className="btn btn--big magnetic">
            <span>{p.teasers.cta.btn}</span>
            <span className="btn__arrow">→</span>
          </Link>
        </div>
      </section>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Inner pages                                                         */
/* ------------------------------------------------------------------ */
export function SolutionsPage({ t, lang }: { t: Copy; lang: Lang }) {
  const h = pages[lang].heroes.soluzioni;
  return (
    <>
      <PageHero kicker={h.kicker} title={h.title} sub={h.sub} />
      <Services t={t} head={false} lang={lang} />
      <Modular t={t} />
      <Dots variant="gooey" lines={t.dots.a} />
      <Sectors t={t} />
      <NextPage to={NEXT.soluzioni} lang={lang} />
    </>
  );
}

export function WorkPage({ t, lang }: { t: Copy; lang: Lang }) {
  const h = pages[lang].heroes.progetti;
  return (
    <>
      <PageHero kicker={h.kicker} title={h.title} sub={h.sub} />
      <Work t={t} lang={lang} head={false} />
      <Dots variant="neural" lines={t.dots.b} />
      <Origin t={t} lang={lang} />
      <NextPage to={NEXT.progetti} lang={lang} />
    </>
  );
}

export function MethodPage({ t, lang }: { t: Copy; lang: Lang }) {
  const h = pages[lang].heroes.metodo;
  return (
    <>
      <PageHero kicker={h.kicker} title={h.title} sub={h.sub} />
      <Method t={t} head={false} />
      <Dots variant="neural" lines={t.dots.b} />
      <Antithesis t={t} />
      <NextPage to={NEXT.metodo} lang={lang} />
    </>
  );
}

export function TechPage({ lang }: { lang: Lang }) {
  const p = pages[lang];
  const h = p.heroes.tecnologia;
  return (
    <>
      <PageHero kicker={h.kicker} title={h.title} sub={h.sub} />
      <TechStack lang={lang} head={false} />
      <Integrations lang={lang} />
      <Payments lang={lang} />
      <Dots variant="gooey" lines={lang === 'it' ? ['Ogni strato ha il suo ruolo.', 'Parlano tutti la stessa lingua.'] : ['Every layer has its role.', 'They all speak the same language.']} />
      <AccessControl lang={lang} />
      <section className="section compliance section--light">
        <div className="container">
          <div className="section__head">
            <p className="kicker" data-reveal>
              {p.compliance.kicker}
            </p>
            <h2 className="h-xl" data-split>
              {p.compliance.title}
            </h2>
          </div>
          <div className="compliance__grid">
            {p.compliance.items.map((c, i) => (
              <article key={c.t} className="compliance__item card-3d" data-card data-tilt="6">
                <span className="compliance__n">{String(i + 1).padStart(2, '0')}</span>
                <h3>{c.t}</h3>
                <p>{c.d}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <NextPage to={NEXT.tecnologia} lang={lang} />
    </>
  );
}

export function AboutPage({ t, lang }: { t: Copy; lang: Lang }) {
  const p = pages[lang];
  const h = p.heroes.chisiamo;
  const a = p.about;
  return (
    <>
      <PageHero kicker={h.kicker} title={h.title} sub={h.sub} />
      <section className="section founder">
        <div className="container founder__grid">
          <aside className="founder__aside">
            <div className="founder__photo" data-reveal data-tilt="4" data-lift="0">
              <img src={asset('images/maurizio-taruggi.jpg')} alt={a.photoAlt} loading="lazy" />
              <div className="founder__badge">
                <strong>{a.name}</strong>
                <span>{a.role}</span>
              </div>
            </div>
            <p className="founder__social" data-reveal>
              <SocialLinks lang={lang} only="founder" names />
            </p>
            <dl className="founder__facts" data-reveal>
              {a.facts.map((f) => (
                <div key={f.v}>
                  <dt>{f.v}</dt>
                  <dd>{f.l}</dd>
                </div>
              ))}
            </dl>
          </aside>
          <article className="story">
            <h2 className="story__title" data-split>
              {a.title}
            </h2>
            {a.paragraphs.map((para, i) => (
              <p key={i} className={i === 0 ? 'story__lead' : undefined} data-reveal>
                {para}
              </p>
            ))}
          </article>
        </div>
      </section>
      <section className="section cv">
        <div className="container">
          <p className="kicker" data-reveal>
            {a.cv.kicker}
          </p>
          <h2 className="h-xl cv__title" data-split>
            {a.cv.title}
          </h2>
          <div className="cv__cols">
            {[
              { h: a.cv.educationTitle, items: a.cv.education },
              { h: a.cv.experienceTitle, items: a.cv.experience },
            ].map((col) => (
              <div key={col.h} className="cv__col">
                <h3 data-reveal>{col.h}</h3>
                <ul className="cv__list">
                  {col.items.map((it) => (
                    <li key={it.y + it.t} data-reveal>
                      <span className="cv__y">{it.y}</span>
                      <span className="cv__t">{it.t}</span>
                      <span className="cv__w">{it.w}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="section lenses">
        <div className="container">
          <p className="kicker" data-reveal>
            {a.lensesTitle}
          </p>
          <div className="lenses__row">
            <svg className="lenses__line" viewBox="0 0 1000 20" preserveAspectRatio="none" aria-hidden="true">
              <path d="M0 10 H1000" />
            </svg>
            {a.lenses.map((l, i) => (
              <div key={l.t} className="lens" data-card style={{ ['--i' as string]: i }}>
                <span className="lens__dot" />
                <strong>{l.t}</strong>
                <span>{l.d}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
      <Dots variant="neural" lines={lang === 'it' ? ['Più sistemi,', 'una sola regia.'] : ['Many systems,', 'one conductor.']} />
      <section className="section vision section--light">
        <div className="container vision__grid">
          <div>
            <p className="kicker" data-reveal>
              {a.vision.kicker}
            </p>
            <h2 className="h-xl" data-split>
              {a.vision.title}
            </h2>
          </div>
          <div>
            <p className="vision__text" data-reveal>
              {a.vision.text}
            </p>
            <ul className="vision__points">
              {a.vision.points.map((v) => (
                <li key={v} data-reveal>
                  {v}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
      <Origin t={t} lang={lang} />
      <NextPage to={NEXT.chisiamo} lang={lang} />
    </>
  );
}

export function PrivacyPage({ lang }: { lang: Lang }) {
  const pv = privacyText(lang);
  return (
    <>
      <header className="page-hero page-hero--plain">
        <div className="container">
          <p className="kicker">{lang === 'it' ? 'Legale' : 'Legal'}</p>
          <h1 className="page-hero__title">{pv.title}</h1>
          <p className="page-hero__sub">{pv.intro}</p>
        </div>
      </header>
      <section className="section legal">
        <div className="container">
          <div className="legal__inner">
          <p className="legal__updated">{pv.updated}</p>
          {pv.sections.map((s) => (
            <section key={s.h}>
              <h2>{s.h}</h2>
              {s.p.map((x, i) => (
                <p key={i}>{x}</p>
              ))}
            </section>
          ))}
          </div>
        </div>
      </section>
    </>
  );
}

export function ContactPage({ t, lang }: { t: Copy; lang: Lang }) {
  const h = pages[lang].heroes.contatti;
  return (
    <>
      <PageHero kicker={h.kicker} title={h.title} sub={h.sub} />
      <Contact t={t} lang={lang} />
      <Dots variant="converge" lines={t.dots.c} />
    </>
  );
}
