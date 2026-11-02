// Real screens of a project: a masonry of device frames (browser windows and
// phones) with the actual captures, each opening in a lightbox.

import { useCallback, useEffect, useState } from 'react';
import type { Lang } from '../content';
import { real, realUi, type RealShot } from '../real';

const img = (p: string) => `${import.meta.env.BASE_URL}images/real/${p}`;
const finePointer = () => typeof window !== 'undefined' && window.matchMedia('(pointer: fine)').matches;

function Frame({ s, badge, onOpen, i }: { s: RealShot; badge: string; onOpen: () => void; i: number }) {
  const tilt = finePointer() ? '5' : undefined;
  if (s.kind === 'phone')
    return (
      <button type="button" className="rs rs--phone card-3d" data-card data-tilt={tilt} data-lift="0" onClick={onOpen} style={{ ['--i' as string]: i }}>
        <span className="rs__badge">{badge}</span>
        <span className="rs-phone">
          <span className="rs-phone__notch" />
          <img src={img(s.src)} alt={s.t} loading="lazy" width="780" height="1328" />
        </span>
        <span className="rs__cap">
          <strong>{s.t}</strong>
          <span>{s.d}</span>
        </span>
      </button>
    );
  return (
    <button type="button" className="rs rs--browser card-3d" data-card data-tilt={tilt} data-lift="0" onClick={onOpen} style={{ ['--i' as string]: i }}>
      <span className="rs__badge">{badge}</span>
      <span className="rs-browser">
        <span className="rs-browser__bar">
          <span className="mk-dots">
            <i />
            <i />
            <i />
          </span>
          <span className="rs-browser__url">{s.url}</span>
        </span>
        <img src={img(s.src)} alt={s.t} loading="lazy" width="1600" height="1000" />
      </span>
      <span className="rs__cap">
        <strong>{s.t}</strong>
        <span>{s.d}</span>
      </span>
    </button>
  );
}

export function RealScreens({ slug, lang }: { slug: string; lang: Lang }) {
  const shots = real[lang][slug] ?? [];
  const ui = realUi[lang];
  const [open, setOpen] = useState<number | null>(null);

  const step = useCallback((d: number) => setOpen((o) => (o === null ? o : (o + d + shots.length) % shots.length)), [shots.length]);

  useEffect(() => {
    if (open === null) return;
    const key = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(null);
      if (e.key === 'ArrowRight') step(1);
      if (e.key === 'ArrowLeft') step(-1);
    };
    window.addEventListener('keydown', key);
    document.documentElement.classList.add('has-lightbox');
    return () => {
      window.removeEventListener('keydown', key);
      document.documentElement.classList.remove('has-lightbox');
    };
  }, [open, step]);

  if (!shots.length) return null;
  const cur = open !== null ? shots[open] : null;

  return (
    <section className="section real">
      <div className="container">
        <div className="section__head">
          <p className="kicker" data-reveal>
            {ui.kicker}
          </p>
          <h2 className="h-xl" data-split>
            {ui.title}
          </h2>
          <p className="lead" data-reveal>
            {ui.sub}
          </p>
        </div>
        <div className="real__grid">
          {shots.map((s, i) => (
            <Frame key={s.src} s={s} badge={ui.badge} i={i} onOpen={() => setOpen(i)} />
          ))}
        </div>
      </div>

      {cur && (
        <div className="lightbox" role="dialog" aria-modal="true" aria-label={cur.t} onClick={() => setOpen(null)} data-lenis-prevent>
          <button type="button" className="lightbox__close" aria-label={ui.close} onClick={() => setOpen(null)}>
            ×
          </button>
          {shots.length > 1 && (
            <>
              <button type="button" className="lightbox__nav lightbox__nav--prev" aria-label={ui.prev} onClick={(e) => { e.stopPropagation(); step(-1); }}>
                ‹
              </button>
              <button type="button" className="lightbox__nav lightbox__nav--next" aria-label={ui.next} onClick={(e) => { e.stopPropagation(); step(1); }}>
                ›
              </button>
            </>
          )}
          <figure className={`lightbox__fig${cur.kind === 'phone' ? ' lightbox__fig--phone' : ''}`} onClick={(e) => e.stopPropagation()}>
            <img src={img(cur.src)} alt={cur.t} />
            <figcaption>
              <strong>{cur.t}</strong>
              <span>{cur.d}</span>
              <small>
                {open! + 1} / {shots.length}
              </small>
            </figcaption>
          </figure>
        </div>
      )}
    </section>
  );
}
