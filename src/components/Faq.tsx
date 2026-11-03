// Frequently asked questions, as native <details>: every answer is in the HTML even when
// closed, so people, search engines and AI assistants all read the same text. The same
// questions go to the page's structured data (FAQPage, in seo.ts) and to llms-full.txt.

type Item = { q: string; a: string };

export function FaqSection({ kicker, title, items, id = 'faq' }: { kicker: string; title: string; items: Item[]; id?: string }) {
  return (
    <section className="section section--light agents-faq" id={id}>
      <div className="container agents-faq__grid">
        <div className="agents-faq__head">
          <p className="kicker" data-reveal>
            {kicker}
          </p>
          <h2 className="h-lg agents-h2" data-split>
            {title}
          </h2>
        </div>
        <div className="agents-faq__list">
          {items.map((q, i) => (
            <details key={q.q} className="agents-faq__item" open={i === 0} data-reveal>
              <summary>{q.q}</summary>
              <p>{q.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
