import type { Lang } from '../content';
import { stack, tech, techUi } from '../tech';

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
