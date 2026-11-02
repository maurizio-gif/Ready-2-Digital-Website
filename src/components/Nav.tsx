import { useEffect, useRef, type ReactNode } from 'react';
import gsap from 'gsap';
import type { Lang } from '../content';
import { metaball } from '../lib/metaball';
import { MARK, NECKS, NECK_OPTS, ORANGE, R, clamp, ease, lerp, range } from '../lib/mark';
import { href, navigate, pathFor, type Page } from '../router';
import { pages } from '../pages';

/** An internal link: real href for crawlers and new tabs, client-side navigation on click. */
export function Link({ page, lang, slug, hash, className, children, onClick, ...rest }: {
  page: Page;
  lang: Lang;
  slug?: string;
  hash?: string;
  className?: string;
  children: ReactNode;
  onClick?: () => void;
} & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href' | 'onClick'>) {
  const path = pathFor(page, lang, slug) + (hash ? `#${hash}` : '');
  return (
    <a
      {...rest}
      className={className}
      href={href(path)}
      onClick={(e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return;
        e.preventDefault();
        onClick?.();
        navigate(path);
      }}
    >
      {children}
    </a>
  );
}

/** The six circles of the mark flying in and joining, used in every page header. */
function MarkDots() {
  const svg = useRef<SVGSVGElement>(null);
  useEffect(() => {
    const root = svg.current!;
    const circles = Array.from(root.querySelectorAll<SVGCircleElement>('circle'));
    const necks = Array.from(root.querySelectorAll<SVGPathElement>('path'));
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const st = { k: reduced ? 1 : 0, t: 0 };
    const mouse = { x: 0, y: 0, on: false };
    const from = MARK.map((_, i) => {
      const a = i * 1.9 + 0.4;
      return [Math.cos(a) * 260, Math.sin(a) * 200] as [number, number];
    });
    const tw = gsap.to(st, { k: 1, duration: 2.4, ease: 'none', delay: 0.3 });
    const move = (e: PointerEvent) => {
      const b = root.getBoundingClientRect();
      mouse.x = ((e.clientX - b.left) / b.width) * 400 - 200;
      mouse.y = ((e.clientY - b.top) / b.height) * 300 - 150;
      mouse.on = true;
    };
    const leave = () => (mouse.on = false);
    const host = root.closest('.page-hero') as HTMLElement | null;
    host?.addEventListener('pointermove', move);
    host?.addEventListener('pointerleave', leave);
    const pos = MARK.map(([x, y]) => [x, y] as [number, number]);
    const tick = (_: number, dt: number) => {
      st.t += dt / 1000;
      MARK.forEach(([x, y], i) => {
        const ti = range(st.k, i === 5 ? 0.45 : i * 0.06, i === 5 ? 1 : 0.6 + i * 0.06);
        const e = i === 5 ? ease.outBack(ti) : ease.outElastic(ti);
        let tx = lerp(from[i][0], x, e) + Math.sin(st.t * 0.8 + i) * 3;
        let ty = lerp(i === 5 ? -220 : from[i][1], y, e) + Math.cos(st.t * 0.7 + i * 2) * 3;
        if (mouse.on) {
          const dx = tx - mouse.x;
          const dy = ty - mouse.y;
          const d = Math.hypot(dx, dy) || 1;
          const f = Math.exp(-(d * d) / 9000) * 34;
          tx += (dx / d) * f;
          ty += (dy / d) * f;
        }
        pos[i][0] += (tx - pos[i][0]) * 0.2;
        pos[i][1] += (ty - pos[i][1]) * 0.2;
        const r = R * ease.out(clamp(ti * 1.6));
        circles[i].setAttribute('cx', pos[i][0].toFixed(1));
        circles[i].setAttribute('cy', pos[i][1].toFixed(1));
        circles[i].setAttribute('r', r.toFixed(1));
      });
      NECKS.forEach(([a, b], k) => {
        necks[k].setAttribute('d', metaball(+circles[a].getAttribute('r')!, +circles[b].getAttribute('r')!, pos[a], pos[b], NECK_OPTS));
      });
    };
    gsap.ticker.add(tick);
    return () => {
      tw.kill();
      gsap.ticker.remove(tick);
      host?.removeEventListener('pointermove', move);
      host?.removeEventListener('pointerleave', leave);
    };
  }, []);
  return (
    <svg ref={svg} className="page-hero__mark" viewBox="-200 -150 400 300" aria-hidden="true">
      {NECKS.map((_, k) => (
        <path key={k} fill={ORANGE} />
      ))}
      {MARK.map((_, i) => (
        <circle key={i} r="0" fill={i === 5 ? '#F4F1EA' : ORANGE} />
      ))}
    </svg>
  );
}

export function PageHero({ kicker, title, sub, children }: { kicker: string; title: [string, string]; sub: string; children?: ReactNode }) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.reveal-line > span', { y: 0, yPercent: 110 }, { y: 0, yPercent: 0, duration: 1.3, ease: 'expo.out', stagger: 0.08, delay: 0.1 });
      gsap.fromTo('[data-fade]', { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 1, ease: 'power3.out', stagger: 0.1, delay: 0.45 });
    }, ref);
    return () => ctx.revert();
  }, [title]);
  return (
    <header className="page-hero" ref={ref}>
      <div className="container page-hero__grid">
        <div>
          <p className="kicker" data-fade>
            {kicker}
          </p>
          <h1 className="page-hero__title">
            {title.map((l, i) => (
              <span key={i} className="reveal-line">
                <span className={i === 1 ? 'accent' : undefined}>{l}</span>
              </span>
            ))}
          </h1>
          <p className="page-hero__sub" data-fade>
            {sub}
          </p>
          {children}
        </div>
        <MarkDots />
      </div>
    </header>
  );
}

/** "Continue → next page" at the bottom of every page. */
export function NextPage({ to, lang }: { to: Page; lang: Lang }) {
  const p = pages[lang];
  return (
    <section className="next-page">
      <Link page={to} lang={lang} className="next-page__link container">
        <span className="kicker">{p.next}</span>
        <strong>
          {p.nextLabels[to]} <span className="next-page__arrow">→</span>
        </strong>
      </Link>
    </section>
  );
}
