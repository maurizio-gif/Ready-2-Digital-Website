import type { Lang } from '../content';
import { access, integrationList, integrations, paymentList, payments, stack, tech, techUi } from '../tech';

/** Layers stacked top to bottom, with data dots flowing between them. */
function LayerStack({ layers, rich }: { layers: { name: string; d?: string; items: (string | { t: string; d: string })[] }[]; rich?: boolean }) {
  return (
    <div className={`layers${rich ? ' layers--rich' : ''}`}>
      {layers.map((l, i) => (
        <div key={l.name} className="layer" data-reveal style={{ ['--i' as string]: i, ['--n' as string]: layers.length }}>
          <div className="layer__head">
            <span className="layer__n">{String(i + 1).padStart(2, '0')}</span>
            <div>
              <strong>{l.name}</strong>
              {l.d && <span>{l.d}</span>}
            </div>
          </div>
          <div className="layer__items">
            {l.items.map((it) =>
              typeof it === 'string' ? (
                <span key={it} className="layer__chip">
                  {it}
                </span>
              ) : (
                <div key={it.t} className="layer__card">
                  <strong>{it.t}</strong>
                  <span>{it.d}</span>
                </div>
              ),
            )}
          </div>
          {i < layers.length - 1 && (
            <span className="layer__pipe" aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

/** Home: the stack explained for a business owner. */
export function TechStack({ lang, head = true }: { lang: Lang; head?: boolean }) {
  const s = stack[lang];
  return (
    <section className="section tech" id="tecnologia">
      <div className="container">
        {head && (
          <div className="section__head">
            <p className="kicker" data-reveal>
              {s.kicker}
            </p>
            <h2 className="h-xl" data-split>
              {s.title}
            </h2>
            <p className="lead" data-reveal>
              {s.sub}
            </p>
          </div>
        )}
        <LayerStack layers={s.layers} rich />
      </div>
    </section>
  );
}

/** Technology page: the systems we connect to, with their logos and the way we connect (API or SQL server). */
export function Integrations({ lang }: { lang: Lang }) {
  const c = integrations[lang];
  return (
    <section className="section tech systems" id="integrazioni">
      <div className="container">
        <div className="section__head">
          <p className="kicker" data-reveal>
            {c.kicker}
          </p>
          <h2 className="h-xl" data-split>
            {c.title}
          </h2>
          <p className="lead" data-reveal>
            {c.lead}
          </p>
        </div>
        <ul className="systems__grid">
          {integrationList.map((s) => (
            <li key={s.id} className="sys card-3d" data-card data-tilt="6">
              <span className={`sys__mark${s.logo ? '' : ' sys__mark--initial'}${s.logo?.onLight ? ' sys__mark--plate' : ''}`}>
                {s.logo ? (
                  <img src={`${import.meta.env.BASE_URL}${s.logo.src}`} alt={s.logo.wordmark ? s.name : ''} width={s.logo.w} height={s.logo.h} loading="lazy" className={s.logo.wordmark ? 'is-wordmark' : undefined} />
                ) : (
                  <span aria-hidden="true">{s.name[0]}</span>
                )}
              </span>
              {!s.logo?.wordmark && <strong className="sys__name">{s.name}</strong>}
              {s.by && <span className="sys__by">{s.by[lang]}</span>}
              <span className={`sys__via sys__via--${s.via}`}>{c.via[s.via]}</span>
            </li>
          ))}
        </ul>
        <p className="access__note" data-reveal>
          {c.note}
        </p>
      </div>
    </section>
  );
}

/** Technology page: the payment providers we are fully integrated with, and how deep the integration goes. */
export function Payments({ lang }: { lang: Lang }) {
  const c = payments[lang];
  return (
    <section className="section tech pay" id="pagamenti">
      <div className="container">
        <div className="section__head">
          <p className="kicker" data-reveal>
            {c.kicker}
          </p>
          <h2 className="h-xl" data-split>
            {c.title}
          </h2>
          <p className="lead" data-reveal>
            {c.lead}
          </p>
        </div>
        <ul className="systems__grid">
          {paymentList.map((s) => (
            <li key={s.id} className="sys card-3d" data-card data-tilt="6">
              <span className="sys__mark">
                <img src={`${import.meta.env.BASE_URL}${s.logo.src}`} alt={s.name} width={s.logo.w} height={s.logo.h} loading="lazy" className={`is-wordmark pay__logo--${s.id}`} />
              </span>
              <span className="sys__by">{s.what[lang]}</span>
              <span className="sys__via">{c.badge}</span>
            </li>
          ))}
        </ul>
        <p className="tech__sub" data-reveal>
          {c.how}
        </p>
        <div className="parts">
          {c.levels.map((s, i) => (
            <article key={s.t} className="part card-3d" data-card data-tilt="6">
              <span className="part__n">{String(i + 1).padStart(2, '0')}</span>
              <h3 className="part__t">{s.t}</h3>
              <p className="part__role">{s.role}</p>
              <p className="part__d">{s.d}</p>
            </article>
          ))}
        </div>
        <p className="access__note" data-reveal>
          {c.note}
        </p>
      </div>
    </section>
  );
}

/** Technology page: access control with a pass in the phone's Wallet, and how that pass works. */
export function AccessControl({ lang }: { lang: Lang }) {
  const a = access[lang];
  return (
    <section className="section tech access" id="controllo-accessi">
      <div className="container">
        <div className="section__head">
          <p className="kicker" data-reveal>
            {a.kicker}
          </p>
          <h2 className="h-xl" data-split>
            {a.title}
          </h2>
          <p className="lead" data-reveal>
            {a.lead}
          </p>
        </div>
        <div className="access__partners" data-reveal>
          <span className="access__logo">
            <img src={`${import.meta.env.BASE_URL}images/partners/dot-origin-logo.svg`} alt={a.partners.dot} width="593" height="93" loading="lazy" />
          </span>
          <span className="access__logo access__logo--vtap">
            <img src={`${import.meta.env.BASE_URL}images/partners/vtap-reader.png`} alt={a.partners.vtap} width="225" height="400" loading="lazy" />
          </span>
        </div>
        <ol className="access__chain" data-reveal>
          {a.chain.map((c, i) => (
            <li key={c.t} className="access__node">
              <strong>{c.t}</strong>
              <span>{c.d}</span>
              {i < a.chain.length - 1 && (
                <i className="access__arrow" aria-hidden="true">
                  →
                </i>
              )}
            </li>
          ))}
        </ol>
        <p className="tech__sub" data-reveal>
          {a.how}
        </p>
        <div className="parts">
          {a.steps.map((s, i) => (
            <article key={s.t} className="part card-3d" data-card data-tilt="6">
              <span className="part__n">{String(i + 1).padStart(2, '0')}</span>
              <h3 className="part__t">{s.t}</h3>
              <p className="part__role">{s.role}</p>
              <p className="part__d">{s.d}</p>
            </article>
          ))}
        </div>
        <p className="access__note" data-reveal>
          {a.note}
        </p>
      </div>
    </section>
  );
}

/** Case page: how this project is built. */
export function CaseTech({ slug, lang }: { slug: string; lang: Lang }) {
  const t = tech[lang][slug];
  const ui = techUi[lang];
  if (!t) return null;
  return (
    <section className="section tech tech--case">
      <div className="container">
        <div className="section__head">
          <p className="kicker" data-reveal>
            {ui.kicker}
          </p>
          <h2 className="h-xl" data-split>
            {ui.title}
          </h2>
          <p className="lead" data-reveal>
            {t.intro}
          </p>
        </div>
        <p className="tech__sub" data-reveal>
          {ui.layers}
        </p>
        <LayerStack layers={t.layers} />
        <p className="tech__sub" data-reveal>
          {ui.parts}
        </p>
        <div className="parts">
          {t.parts.map((p, i) => (
            <article key={p.t} className="part card-3d" data-card data-tilt="6">
              <span className="part__n">{String(i + 1).padStart(2, '0')}</span>
              <h3 className="part__t">{p.t}</h3>
              <p className="part__role">{p.role}</p>
              <p className="part__d">{p.d}</p>
            </article>
          ))}
        </div>
        <p className="tech__sub" data-reveal>
          {ui.numbers}
        </p>
        <div className="tech__numbers" data-reveal>
          {t.numbers.map((n) => (
            <div key={n.l}>
              <strong>{n.v}</strong>
              <span>{n.l}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
