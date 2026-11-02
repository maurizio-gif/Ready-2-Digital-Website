import type { Lang } from '../content';
import { agents } from '../agents';
import { pages, NEXT } from '../pages';
import { Link, NextPage, PageHero } from './Nav';

// Line icons for the four families, drawn on the same 24-unit grid as the
// service icons in Sections.tsx.
const ICONS: Record<string, string> = {
  vendita: 'M3 17l6-6 4 4 8-8 M15 7h6v6',
  assistenza: 'M4 5h16v11H9l-5 4V5z M8 9h8 M8 12h5',
  'analisi-dati': 'M5 20v-7 M12 20V5 M19 20v-10 M3 20h18',
  crm: 'M16 8a4 4 0 1 0-8 0 4 4 0 0 0 8 0 M4 21c0-4 3.6-6 8-6s8 2 8 6',
};

/** An anchor inside the page: smooth scroll under the header, through the same hook the menu uses. */
function jump(id: string) {
  window.history.replaceState({}, '', `#${id}`);
  window.dispatchEvent(new Event('r2d:hash'));
}

/* ------------------------------------------------------------------ */
/* Home: a band that points at the page                                */
/* ------------------------------------------------------------------ */
export function AgentsTeaser({ lang }: { lang: Lang }) {
  const tz = pages[lang].teasers.agents;
  return (
    <section className="section teaser agents-teaser">
      <div className="container">
        <div className="teaser__head">
          <div>
            <p className="kicker" data-reveal>
              {tz.kicker}
            </p>
            <h2 className="h-xl" data-split>
              {tz.title}
            </h2>
          </div>
          <Link page="agenti" lang={lang} className="btn magnetic" data-reveal>
            <span>{tz.more}</span>
            <span className="btn__arrow">→</span>
          </Link>
        </div>
        <p className="lead agents-teaser__lead" data-reveal>
          {tz.text}
        </p>
        <div className="teaser__grid agents-teaser__grid">
          {tz.cards.map((c) => (
            <Link key={c.id} page="agenti" lang={lang} hash={c.id} className="teaser__card card-3d" data-card data-tilt="7">
              <span className="svc__tag">{c.tag}</span>
              <strong>{c.t}</strong>
              <span>{c.d}</span>
              <em>→</em>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* The page                                                            */
/* ------------------------------------------------------------------ */
export function AgentsPage({ lang }: { lang: Lang }) {
  const h = pages[lang].heroes.agenti;
  const a = agents[lang];
  return (
    <>
      <PageHero kicker={h.kicker} title={h.title} sub={h.sub}>
        <div className="agents-jump" data-fade>
          <p className="agents-jump__label">{a.jump}</p>
          <div className="chips">
            {a.families.items.map((f) => (
              <a
                key={f.id}
                href={`#${f.id}`}
                className="chip"
                onClick={(e) => {
                  e.preventDefault();
                  jump(f.id);
                }}
              >
                <span className="chip__dot" />
                {f.tag}
              </a>
            ))}
          </div>
        </div>
      </PageHero>

      {/* What an agent is, against the two things people confuse it with. */}
      <section className="section section--light agents-what">
        <div className="container">
          <div className="section__head">
            <p className="kicker" data-reveal>
              {a.what.kicker}
            </p>
            <h2 className="h-lg agents-h2" data-split>
              {a.what.title}
            </h2>
            <p className="lead" data-reveal>
              {a.what.lead}
            </p>
          </div>
          <div className="agents-compare">
            {a.what.cols.map((c) => (
              <article key={c.tag} className={`agents-compare__card card-3d${c.hot ? ' is-hot' : ''}`} data-card data-tilt="6">
                <span className="svc__tag">{c.tag}</span>
                <h3>{c.t}</h3>
                <p>{c.d}</p>
                <p className="agents-compare__ex">
                  <span aria-hidden="true">→</span> {c.ex}
                </p>
              </article>
            ))}
          </div>
          <p className="agents-note" data-reveal>
            {a.what.note}
          </p>
        </div>
      </section>

      {/* Wherever there is data: sources, the agent, the work done. */}
      <section className="section agents-flow">
        <div className="container">
          <div className="section__head">
            <p className="kicker" data-reveal>
              {a.data.kicker}
            </p>
            <h2 className="h-lg agents-h2" data-split>
              {a.data.title}
            </h2>
            <p className="lead" data-reveal>
              {a.data.text}
            </p>
          </div>
          <div className="agents-flow__grid" data-reveal>
            <div className="agents-flow__col">
              <p className="agents-flow__k">{a.data.sources.t}</p>
              <ul className="agents-flow__chips">
                {a.data.sources.items.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </div>
            <div className="agents-flow__col agents-flow__col--agent">
              <p className="agents-flow__k">{a.data.agent.t}</p>
              <ol className="agents-flow__steps">
                {a.data.agent.steps.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ol>
            </div>
            <div className="agents-flow__col">
              <p className="agents-flow__k">{a.data.outputs.t}</p>
              <ul className="agents-flow__out">
                {a.data.outputs.items.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </div>
          </div>
          <p className="agents-flow__more" data-reveal>
            {a.data.more}
          </p>
        </div>
      </section>

      {/* The four families. */}
      <section className="section section--light agents-families">
        <div className="container">
          <div className="section__head">
            <p className="kicker" data-reveal>
              {a.families.kicker}
            </p>
            <h2 className="h-lg agents-h2" data-split>
              {a.families.title}
            </h2>
            <p className="lead" data-reveal>
              {a.families.sub}
            </p>
          </div>
          <div className="agents-grid">
            {a.families.items.map((f) => (
              <article key={f.id} id={f.id} className="agent-card card-3d" data-card data-tilt="5">
                <div className="svc__top">
                  <svg viewBox="0 0 24 24" className="svc__icon" aria-hidden="true">
                    <path d={ICONS[f.id]} />
                  </svg>
                  <span className="svc__tag">{f.tag}</span>
                </div>
                <h3 className="agent-card__title">{f.t}</h3>
                <p className="agent-card__promise">{f.promise}</p>
                <ul className="agent-card__does">
                  {f.does.map((d) => (
                    <li key={d}>{d}</li>
                  ))}
                </ul>
                <div className="agent-card__links">
                  <span>{a.families.links}</span>
                  <ul>
                    {f.links.map((l) => (
                      <li key={l}>{l}</li>
                    ))}
                  </ul>
                </div>
                <p className="agent-card__example">
                  <strong>{a.families.example}</strong>
                  {f.example}
                </p>
              </article>
            ))}
          </div>
          <div className="agents-other" data-reveal>
            <p>{a.families.other}</p>
            <Link page="contatti" lang={lang} className="btn magnetic">
              <span>{a.families.otherCta}</span>
              <span className="btn__arrow">→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Where they already run. */}
      <section className="section agents-proof">
        <div className="container vision__grid">
          <div>
            <p className="kicker" data-reveal>
              {a.proof.kicker}
            </p>
            <h2 className="h-lg agents-h2" data-split>
              {a.proof.title}
            </h2>
            <p className="lead" data-reveal>
              {a.proof.text}
            </p>
            <Link page="caso" slug="athlon" lang={lang} className="btn magnetic agents-proof__btn" data-reveal>
              <span>{a.proof.cta}</span>
              <span className="btn__arrow">→</span>
            </Link>
          </div>
          <ul className="vision__points">
            {a.proof.items.map((v) => (
              <li key={v} data-reveal>
                {v}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* How we work. */}
      <section className="section section--light compliance agents-steps">
        <div className="container">
          <div className="section__head">
            <p className="kicker" data-reveal>
              {a.steps.kicker}
            </p>
            <h2 className="h-lg agents-h2" data-split>
              {a.steps.title}
            </h2>
          </div>
          <ol className="compliance__grid agents-steps__grid">
            {a.steps.items.map((s, i) => (
              <li key={s.t} className="compliance__item card-3d" data-card data-tilt="6">
                <span className="compliance__n">{String(i + 1).padStart(2, '0')}</span>
                <h3>{s.t}</h3>
                <p>{s.d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* The limits we put on them. */}
      <section className="section agents-control">
        <div className="container">
          <div className="section__head">
            <p className="kicker" data-reveal>
              {a.control.kicker}
            </p>
            <h2 className="h-lg agents-h2" data-split>
              {a.control.title}
            </h2>
          </div>
          <ul className="agents-control__grid">
            {a.control.items.map((c) => (
              <li key={c.t} className="agents-control__item card-3d" data-card data-tilt="6">
                <h3>{c.t}</h3>
                <p>{c.d}</p>
              </li>
            ))}
          </ul>
          <p className="agents-control__gdpr" data-reveal>
            {a.control.gdpr}
          </p>
        </div>
      </section>

      {/* FAQ: native <details>, so every answer is in the HTML even when closed. */}
      <section className="section section--light agents-faq" id="faq">
        <div className="container agents-faq__grid">
          <div className="agents-faq__head">
            <p className="kicker" data-reveal>
              {a.faq.kicker}
            </p>
            <h2 className="h-lg agents-h2" data-split>
              {a.faq.title}
            </h2>
          </div>
          <div className="agents-faq__list">
            {a.faq.items.map((q, i) => (
              <details key={q.q} className="agents-faq__item" open={i === 0} data-reveal>
                <summary>{q.q}</summary>
                <p>{q.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="section cta-band">
        <div className="container cta-band__inner">
          <h2 className="h-xl" data-split>
            {a.cta.title}
          </h2>
          <Link page="contatti" lang={lang} className="btn btn--big magnetic">
            <span>{a.cta.btn}</span>
            <span className="btn__arrow">→</span>
          </Link>
        </div>
      </section>

      <NextPage to={NEXT.agenti} lang={lang} />
    </>
  );
}
