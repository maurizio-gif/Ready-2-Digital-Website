// "Connecting dots" interludes: graphic pauses between sections that say what
// Ready2Digital does without words — points that find each other and join,
// fluidly, the way the circles of the mark do.
//
//  gooey     drifting dots that merge with metaball necks when they meet; the
//            pointer is a dot too, and scrolling gathers them together
//  neural    a layered network with signals running through it, lighting the
//            nodes they reach; scrolling wires it up layer by layer
//  converge  a cloud of dots that, as you scroll, settles into the mark

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { metaball } from '../lib/metaball';
import { MARK, NECKS, NECK_OPTS, R, clamp, ease, lerp, range } from '../lib/mark';
import { finePointer, isTouch, reducedMotion } from '../lib/env';

gsap.registerPlugin(ScrollTrigger);

export type DotsVariant = 'gooey' | 'neural' | 'converge';

const SVGNS = 'http://www.w3.org/2000/svg';
let uid = 0;
const ORANGE = '#FF6000';
const LIGHT = '#F4F1EA';

function el<K extends keyof SVGElementTagNameMap>(tag: K, attrs: Record<string, string | number>, parent: Element) {
  const e = document.createElementNS(SVGNS, tag);
  for (const k in attrs) e.setAttribute(k, String(attrs[k]));
  parent.appendChild(e);
  return e;
}

// Deterministic pseudo-random, so the pattern is the same on every visit.
function rng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export function Dots({ variant, lines, light = false }: { variant: DotsVariant; lines?: [string, string]; light?: boolean }) {
  const wrap = useRef<HTMLElement>(null);
  const svg = useRef<SVGSVGElement>(null);
  const text = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = svg.current!;
    const host = wrap.current!;
    const reduced = reducedMotion();
    const touch = isTouch();
    let W = 0;
    let H = 0;
    let visible = false;
    const state = { p: 0, sp: 0, t: 0 };
    const mouse = { x: -9999, y: -9999, on: false };
    // Depth: the pointer tilts the whole scene a little, and scrolling turns it.
    const fine = finePointer() && !reduced;
    const tilt = fine ? { rx: gsap.quickTo(root, 'rotationX', { duration: 1.2, ease: 'power3' }), ry: gsap.quickTo(root, 'rotationY', { duration: 1.2, ease: 'power3' }) } : null;
    if (tilt) gsap.set(root, { transformPerspective: 1400, transformOrigin: '50% 50%' });
    let draw: (dt: number) => void = () => {};
    const shadeDefs = () => {
      const id = `dots-sphere-${++uid}`;
      const defs = el('defs', {}, root);
      const g = el('radialGradient', { id, cx: 0.36, cy: 0.3, fx: 0.36, fy: 0.3, r: 0.78 }, defs);
      el('stop', { offset: 0, 'stop-color': '#fff', 'stop-opacity': light ? 0.5 : 0.55 }, g);
      el('stop', { offset: 0.28, 'stop-color': '#fff', 'stop-opacity': 0.12 }, g);
      el('stop', { offset: 0.55, 'stop-color': '#000', 'stop-opacity': 0 }, g);
      el('stop', { offset: 1, 'stop-color': '#000', 'stop-opacity': light ? 0.3 : 0.5 }, g);
      return `url(#${id})`;
    };

    const build = () => {
      while (root.firstChild) root.removeChild(root.firstChild);
      W = host.clientWidth;
      H = host.clientHeight;
      root.setAttribute('viewBox', `0 0 ${W} ${H}`);
      const rand = rng(variant === 'gooey' ? 7 : variant === 'neural' ? 13 : 29);
      const mobile = W < 720;

      if (variant === 'gooey') {
        const shade = shadeDefs();
        const N = mobile ? 16 : 30;
        const dots = Array.from({ length: N }, (_, i) => {
          const r = 5 + rand() * (mobile ? 11 : 17);
          return {
            x: rand() * W,
            y: rand() * H,
            vx: (rand() - 0.5) * 0.4,
            vy: (rand() - 0.5) * 0.4,
            r,
            // the big ones are near: they slide more than the small ones as you scroll
            depth: (r - 5) / (mobile ? 11 : 17),
            hot: i % 4 === 0,
            // where the dot goes when the band gathers (a loose cluster)
            gx: W / 2 + (rand() - 0.5) * Math.min(W, 900) * 0.5,
            gy: H / 2 + (rand() - 0.5) * H * 0.42,
          };
        });
        const gNecks = el('g', {}, root);
        const necks: SVGPathElement[] = [];
        const circles = dots.map((d) => el('circle', { r: d.r, fill: d.hot ? ORANGE : light ? '#1A1A1A' : '#3A3A3A' }, root));
        const cursor = el('circle', { r: 0, fill: ORANGE }, root);
        const shades = dots.map((d) => el('circle', { r: d.r, fill: shade, opacity: 0.35 + d.depth * 0.65 }, root));
        draw = (dt) => {
          const f = clamp(dt / 16.67, 0.5, 3);
          const g = ease.inOut(range(state.sp, 0.25, 0.65)) * 0.55;
          const slide = (state.sp - 0.5) * (reduced ? 0 : 90);
          for (const d of dots) {
            if (!reduced) {
              d.x += d.vx * f;
              d.y += d.vy * f;
            }
            if (d.x < -20 || d.x > W + 20) d.vx *= -1;
            if (d.y < -20 || d.y > H + 20) d.vy *= -1;
            if (mouse.on) {
              const dx = mouse.x - d.x;
              const dy = mouse.y - d.y;
              const dist = Math.hypot(dx, dy) || 1;
              if (dist < 220) {
                d.x += (dx / dist) * 0.6 * f;
                d.y += (dy / dist) * 0.6 * f;
              }
            }
          }
          let k = 0;
          const pos = dots.map((d) => [lerp(d.x, d.gx, g), lerp(d.y, d.gy, g) + slide * (d.depth - 0.5) * (1 - g)] as [number, number]);
          pos.forEach((p, i) => {
            for (const c of [circles[i], shades[i]]) {
              c.setAttribute('cx', p[0].toFixed(1));
              c.setAttribute('cy', p[1].toFixed(1));
            }
          });
          const all = mouse.on ? [...pos, [mouse.x, mouse.y] as [number, number]] : pos;
          const rads = mouse.on ? [...dots.map((d) => d.r), 14] : dots.map((d) => d.r);
          for (let i = 0; i < all.length; i++) {
            for (let j = i + 1; j < all.length; j++) {
              const dx = all[i][0] - all[j][0];
              const dy = all[i][1] - all[j][1];
              if (Math.abs(dx) > 120 || Math.abs(dy) > 120) continue;
              const d = metaball(rads[i], rads[j], all[i], all[j], { v: 0.5, handle: 2.4, reach: 2.6 });
              if (!d) continue;
              let p = necks[k];
              if (!p) {
                p = el('path', {}, gNecks);
                necks.push(p);
              }
              const hot = (i < dots.length && dots[i].hot) || (j < dots.length && dots[j].hot) || j === dots.length;
              p.setAttribute('d', d);
              p.setAttribute('fill', hot ? ORANGE : light ? '#1A1A1A' : '#3A3A3A');
              k++;
            }
          }
          for (let i = k; i < necks.length; i++) necks[i].setAttribute('d', '');
          cursor.setAttribute('cx', String(mouse.x));
          cursor.setAttribute('cy', String(mouse.y));
          cursor.setAttribute('r', mouse.on ? '14' : '0');
        };
      }

      if (variant === 'neural') {
        const layers = mobile ? [3, 5, 5, 2] : [4, 7, 7, 5, 2];
        const padX = W * (mobile ? 0.1 : 0.12);
        const nodes = layers.map((n, li) =>
          Array.from({ length: n }, (_, k) => ({
            x: padX + (li / (layers.length - 1)) * (W - padX * 2),
            y: H * 0.6 + (k - (n - 1) / 2) * Math.min((H * 0.66) / (n + 1), mobile ? 46 : 62),
            heat: 0,
            li,
          })),
        );
        const edges: { a: { x: number; y: number }; b: { x: number; y: number; heat: number }; li: number; line: SVGLineElement }[] = [];
        const gE = el('g', {}, root);
        for (let li = 0; li < layers.length - 1; li++)
          for (const a of nodes[li])
            for (const b of nodes[li + 1])
              edges.push({ a, b, li, line: el('line', { x1: a.x, y1: a.y, x2: b.x, y2: b.y, stroke: light ? '#0D0D0D' : LIGHT, 'stroke-width': 1 }, gE) });
        const gN = el('g', {}, root);
        const circ = nodes.flat().map((n) => ({ n, c: el('circle', { cx: n.x, cy: n.y, r: 0, fill: light ? '#1A1A1A' : '#3A3A3A' }, gN), h: el('circle', { cx: n.x, cy: n.y, r: 0, fill: 'none', stroke: ORANGE, 'stroke-width': 1.5 }, gN) }));
        const gS = el('g', {}, root);
        type Sig = { path: { x: number; y: number; heat: number }[]; t: number; c: SVGCircleElement };
        const sigs: Sig[] = [];
        const spawn = () => {
          const path = [nodes[0][Math.floor(rand() * nodes[0].length)] as { x: number; y: number; heat: number }];
          for (let li = 1; li < layers.length; li++) path.push(nodes[li][Math.floor(rand() * nodes[li].length)]);
          sigs.push({ path, t: 0, c: el('circle', { r: 4, fill: ORANGE }, gS) });
        };
        let acc = 0;
        draw = (dt) => {
          const reveal = range(state.sp, 0.05, 0.4);
          if (!tilt && !reduced) root.style.transform = `perspective(1400px) rotateX(${((state.sp - 0.5) * -10).toFixed(2)}deg)`;
          const shown = reveal * (layers.length - 1);
          edges.forEach((e) => {
            const o = clamp(shown - e.li) * 0.12;
            e.line.setAttribute('opacity', o.toFixed(3));
          });
          circ.forEach(({ n, c, h }) => {
            const s = clamp(shown + 1 - n.li);
            n.heat = Math.max(0, n.heat - dt / 900);
            c.setAttribute('r', ((mobile ? 6 : 8) * s + n.heat * 4).toFixed(2));
            c.setAttribute('fill', n.heat > 0.05 ? ORANGE : light ? '#1A1A1A' : '#3A3A3A');
            h.setAttribute('r', ((mobile ? 6 : 8) + (1 - n.heat) * 18).toFixed(2));
            h.setAttribute('opacity', (n.heat * 0.8).toFixed(3));
          });
          if (!reduced && reveal > 0.95) {
            acc += dt;
            if (acc > 260 && sigs.length < 14) {
              acc = 0;
              spawn();
            }
          }
          for (let i = sigs.length - 1; i >= 0; i--) {
            const s = sigs[i];
            s.t += dt / 520;
            const seg = Math.floor(s.t);
            if (seg >= s.path.length - 1) {
              s.path[s.path.length - 1].heat = 1;
              s.c.remove();
              sigs.splice(i, 1);
              continue;
            }
            const a = s.path[seg];
            const b = s.path[seg + 1];
            const u = ease.inOut(s.t - seg);
            if (s.t - seg < 0.05) a.heat = 1;
            s.c.setAttribute('cx', lerp(a.x, b.x, u).toFixed(1));
            s.c.setAttribute('cy', lerp(a.y, b.y, u).toFixed(1));
          }
        };
      }

      if (variant === 'converge') {
        const N = mobile ? 70 : 140;
        const s = Math.min((W * (mobile ? 0.5 : 0.22)) / 256, (H * 0.5) / 192);
        const cx = W / 2;
        const cy = H / 2;
        const dots = Array.from({ length: N }, (_, i) => {
          // target: a point inside one of the six circles of the mark
          const c = MARK[i % 6];
          const a = rand() * Math.PI * 2;
          const rr = Math.sqrt(rand()) * R * 0.8;
          const depth = rand();
          return {
            x: rand() * W,
            y: rand() * H,
            tx: cx + (c[0] + Math.cos(a) * rr) * s,
            ty: cy + (c[1] + Math.sin(a) * rr) * s,
            // near dots are bigger and slide more with the scroll while they travel
            r: 1.2 + depth * 3.4,
            depth,
            ph: rand() * Math.PI * 2,
            dot: i % 6 === 5,
            d: rand() * 0.25,
          };
        });
        const gL = el('g', {}, root);
        const lines = Array.from({ length: N }, () => el('line', { stroke: ORANGE, 'stroke-width': 0.8, opacity: 0 }, gL));
        const circles = dots.map((d) => el('circle', { r: d.r, fill: d.dot ? LIGHT : ORANGE, opacity: 0.45 + d.depth * 0.55 }, root));
        const shade = shadeDefs();
        const gM = el('g', { opacity: 0 }, root);
        const necks = NECKS.map(() => el('path', { fill: ORANGE }, gM));
        const neckD = NECKS.map(([a, b]) => metaball(R * s, R * s, [cx + MARK[a][0] * s, cy + MARK[a][1] * s], [cx + MARK[b][0] * s, cy + MARK[b][1] * s], NECK_OPTS));
        necks.forEach((n, k) => n.setAttribute('d', neckD[k]));
        NECKS.forEach((_, k) => el('path', { d: neckD[k], fill: shade, opacity: 0.5 }, gM));
        MARK.forEach(([x, y], i) => el('circle', { cx: cx + x * s, cy: cy + y * s, r: R * s, fill: i === 5 ? (light ? '#1A1A1A' : LIGHT) : ORANGE }, gM));
        MARK.forEach(([x, y]) => el('circle', { cx: cx + x * s, cy: cy + y * s, r: R * s, fill: shade }, gM));
        draw = () => {
          const slide = reduced ? 0 : (state.sp - 0.5) * 140;
          const pos = dots.map((d) => {
            const k = ease.inOut(range(state.sp, 0.08 + d.d * 0.6, 0.38 + d.d * 0.4));
            const wob = reduced ? 0 : (1 - k) * 10;
            return [lerp(d.x, d.tx, k) + Math.sin(state.t * 0.8 + d.ph) * wob, lerp(d.y, d.ty, k) + Math.cos(state.t * 0.7 + d.ph) * wob + slide * (d.depth - 0.5) * (1 - k), k] as const;
          });
          pos.forEach((p, i) => {
            circles[i].setAttribute('cx', p[0].toFixed(1));
            circles[i].setAttribute('cy', p[1].toFixed(1));
            // each dot reaches for its nearest neighbour in the list while travelling
            const q = pos[(i + 1) % N];
            const near = Math.hypot(p[0] - q[0], p[1] - q[1]) < 140;
            lines[i].setAttribute('x1', p[0].toFixed(1));
            lines[i].setAttribute('y1', p[1].toFixed(1));
            lines[i].setAttribute('x2', q[0].toFixed(1));
            lines[i].setAttribute('y2', q[1].toFixed(1));
            lines[i].setAttribute('opacity', near ? (0.35 * Math.sin(Math.PI * p[2])).toFixed(3) : '0');
          });
          const m = range(state.sp, 0.46, 0.56);
          gM.setAttribute('opacity', m.toFixed(3));
          circles.forEach((c, i) => c.setAttribute('opacity', ((1 - m) * (0.45 + dots[i].depth * 0.55)).toFixed(3)));
        };
      }
    };
    build();
    // A new layout only when the width changes: the height of the band follows
    // the viewport, and on phones that moves with the address bar.
    const ro = new ResizeObserver(() => {
      if (host.clientWidth !== W) build();
    });
    ro.observe(host);

    const st = ScrollTrigger.create({
      trigger: host,
      start: 'top bottom',
      end: 'bottom top',
      onUpdate: (s) => (state.p = s.progress),
    });
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting), { rootMargin: '100px' });
    io.observe(host);
    const onMove = (e: PointerEvent) => {
      const b = host.getBoundingClientRect();
      mouse.x = e.clientX - b.left;
      mouse.y = e.clientY - b.top;
      mouse.on = true;
      if (tilt) {
        tilt.rx((0.5 - mouse.y / H) * 6);
        tilt.ry((mouse.x / W - 0.5) * 8);
      }
    };
    const onLeave = () => {
      mouse.on = false;
      if (tilt) {
        tilt.rx(0);
        tilt.ry(0);
      }
    };
    host.addEventListener('pointermove', onMove);
    host.addEventListener('pointerleave', onLeave);

    const tick = (_t: number, dt: number) => {
      if (!visible) return;
      state.t += dt / 1000;
      state.sp += (state.p - state.sp) * 0.12;
      draw(dt);
      if (text.current) {
        // On phones the words come early and stay: a flick must not skip them.
        const o = touch ? range(state.sp, 0.16, 0.28) : range(state.sp, 0.28, 0.42) * (1 - range(state.sp, 0.78, 0.92));
        text.current.style.setProperty('--o', o.toFixed(3));
      }
    };
    gsap.ticker.add(tick);
    return () => {
      gsap.ticker.remove(tick);
      st.kill();
      io.disconnect();
      ro.disconnect();
      host.removeEventListener('pointermove', onMove);
      host.removeEventListener('pointerleave', onLeave);
    };
  }, [variant, light]);

  return (
    <section className={`dots dots--${variant}${light ? ' dots--light' : ''}`} ref={wrap} aria-hidden={!lines}>
      <svg ref={svg} className="dots__svg" aria-hidden="true" />
      {lines && (
        <div className="dots__text container" ref={text}>
          <p>{lines[0]}</p>
          <p className="accent">{lines[1]}</p>
        </div>
      )}
    </section>
  );
}
