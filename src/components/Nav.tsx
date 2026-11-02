import { useEffect, useRef, type ReactNode } from 'react';
import gsap from 'gsap';
import type { Lang } from '../content';
import { metaball } from '../lib/metaball';
import { MARK, NECKS, NECK_OPTS, ORANGE, R, clamp, ease, lerp, range } from '../lib/mark';
import { href, navigate, pathFor, type Page } from '../router';
import { pages } from '../pages';
import { finePointer, reducedMotion } from '../lib/env';

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
    const circles = Array.from(root.querySelectorAll<SVGCircleElement>('.pm-node'));
    const shades = Array.from(root.querySelectorAll<SVGCircleElement>('.pm-shade'));
    const necks = Array.from(root.querySelectorAll<SVGPathElement>('.pm-neck'));
    const neckShades = Array.from(root.querySelectorAll<SVGPathElement>('.pm-neck-shade'));
    const grad = root.querySelector<SVGRadialGradientElement>('.pm-sphere')!;
    const reduced = reducedMotion();
    // The whole mark leans towards the pointer, and the light moves with it.
    const tilt = finePointer() && !reduced ? { rx: gsap.quickTo(root, 'rotationX', { duration: 1, ease: 'power3' }), ry: gsap.quickTo(root, 'rotationY', { duration: 1, ease: 'power3' }) } : null;
    if (tilt) gsap.set(root, { transformPerspective: 1200, transformOrigin: '50% 50%' });
    const light = { x: 0.36, y: 0.3, tx: 0.36, ty: 0.3 };
    const st = { k: reduced ? 1 : 0, t: 0 };
    const mouse = { x: 0, y: 0, on: false };
    const from = MARK.map((_, i) => {
      const a = i * 1.9 + 0.4;
      return [Math.cos(a) * 260, Math.sin(a) * 200] as [number, number];
    });
    const tw = gsap.to(st, { k: 1, duration: 2.4, ease: 'none', delay: 0.3 });
    const move = (e: PointerEvent) => {
      const b = root.getBoundingClientRect();
      const nx = (e.clientX - b.left) / b.width - 0.5;
      const ny = (e.clientY - b.top) / b.height - 0.5;
      mouse.x = nx * 400;
      mouse.y = ny * 300;
      mouse.on = true;
      light.tx = 0.36 + nx * 0.3;
      light.ty = 0.3 + ny * 0.3;
      if (tilt) {
        tilt.rx(-ny * 10);
        tilt.ry(nx * 12);
      }
    };
    const leave = () => {
      mouse.on = false;
      light.tx = 0.36;
      light.ty = 0.3;
      if (tilt) {
        tilt.rx(0);
        tilt.ry(0);
      }
    };
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
        for (const c of [circles[i], shades[i]]) {
          c.setAttribute('cx', pos[i][0].toFixed(1));
          c.setAttribute('cy', pos[i][1].toFixed(1));
          c.setAttribute('r', r.toFixed(1));
        }
      });
      light.x += (light.tx - light.x) * 0.08;
      light.y += (light.ty - light.y) * 0.08;
      grad.setAttribute('cx', light.x.toFixed(3));
      grad.setAttribute('cy', light.y.toFixed(3));
      grad.setAttribute('fx', light.x.toFixed(3));
      grad.setAttribute('fy', light.y.toFixed(3));
      NECKS.forEach(([a, b], k) => {
        const d = metaball(+circles[a].getAttribute('r')!, +circles[b].getAttribute('r')!, pos[a], pos[b], NECK_OPTS);
        necks[k].setAttribute('d', d);
        neckShades[k].setAttribute('d', d);
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
      <defs>
        <radialGradient id="pm-sphere" className="pm-sphere" cx="0.36" cy="0.3" fx="0.36" fy="0.3" r="0.78">
          <stop offset="0" stopColor="#fff" stopOpacity="0.62" />
          <stop offset="0.26" stopColor="#fff" stopOpacity="0.16" />
          <stop offset="0.52" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.46" />
        </radialGradient>
        <linearGradient id="pm-neck" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.16" />
          <stop offset="0.5" stopColor="#000" stopOpacity="0.02" />
          <stop offset="1" stopColor="#000" stopOpacity="0.36" />
        </linearGradient>
        <radialGradient id="pm-floor" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor={ORANGE} stopOpacity="0.28" />
          <stop offset="1" stopColor={ORANGE} stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx="0" cy="118" rx="190" ry="34" fill="url(#pm-floor)" />
      {NECKS.map((_, k) => (
        <path key={k} className="pm-neck" fill={ORANGE} />
      ))}
      {NECKS.map((_, k) => (
        <path key={`s${k}`} className="pm-neck-shade" fill="url(#pm-neck)" />
      ))}
      {MARK.map((_, i) => (
        <circle key={i} className="pm-node" r="0" fill={i === 5 ? '#F4F1EA' : ORANGE} />
      ))}
      {MARK.map((_, i) => (
        <circle key={`s${i}`} className="pm-shade" r="0" fill="url(#pm-sphere)" />
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
                {' '}
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
