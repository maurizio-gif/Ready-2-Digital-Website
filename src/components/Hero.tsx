import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { Copy } from '../content';
import { metaball } from '../lib/metaball';
import { MARK, NECKS, NECK_OPTS, ORANGE, R, clamp, ease, lerp, mix, range } from '../lib/mark';

gsap.registerPlugin(ScrollTrigger);

type P = [number, number];

const LIGHT = '#F4F1EA';
const GREY = '#4A4A4A';
const CHAOS: [number, number][] = [
  [0, 4], [1, 3], [2, 5], [0, 2], [3, 5], [1, 4], [0, 5], [2, 3], [1, 5],
];
// Where each node sits when the systems are scattered, as a fraction of the stage area.
const SCATTER: P[] = [
  [0.14, 0.1], [0.02, 0.6], [0.4, 0.95], [0.9, 0.04], [0.56, 0.44], [0.97, 0.74],
];
const PACKETS = 5;

function layouts(W: number, H: number) {
  const mobile = W < 820;
  const area = mobile
    ? { x: W * 0.12, y: H * 0.13, w: W * 0.76, h: H * 0.44 }
    : { x: W * 0.46, y: H * 0.16, w: W * 0.46, h: H * 0.66 };
  const u = clamp(Math.min(W, H) / 900, 0.62, 1.25);

  // Opening pose: the mark, big, beside (desktop) or above (mobile) the headline.
  const s0 = mobile ? Math.min((W * 0.62) / 256, (H * 0.28) / 192) : Math.min((W * 0.36) / 256, (H * 0.5) / 192);
  const c0: P = mobile ? [W * 0.5, H * 0.27] : [W * 0.7, H * 0.47];
  // Closing pose: the mark again, centred in the stage area.
  const s3 = mobile ? Math.min((W * 0.56) / 256, (H * 0.3) / 192) : Math.min((W * 0.3) / 256, (H * 0.44) / 192);
  const c3: P = [area.x + area.w / 2, area.y + area.h / 2];

  const logo = (c: P, s: number) => MARK.map(([x, y]) => [c[0] + x * s, c[1] + y * s] as P);
  const scatter = SCATTER.map(([fx, fy]) => [area.x + (mobile ? 0.12 + fx * 0.76 : fx) * area.w, area.y + fy * area.h] as P);
  const pipe = MARK.map((_, i) =>
    mobile
      ? ([area.x + area.w * (i % 2 ? 0.62 : 0.38), area.y + (i / 5) * area.h] as P)
      : ([area.x + (i / 5) * area.w, area.y + area.h * (i % 2 ? 0.58 : 0.42)] as P),
  );
  return {
    mobile,
    start: logo(c0, s0),
    r0: R * s0,
    scatter,
    rS: 15 * u,
    pipe,
    rP: 17 * u,
    end: logo(c3, s3),
    r3: R * s3,
  };
}

export function Hero({ t, ready }: { t: Copy; ready: boolean }) {
  const section = useRef<HTMLElement>(null);
  const svg = useRef<SVGSVGElement>(null);
  const field = useRef<HTMLCanvasElement>(null);
  const labels = useRef<(HTMLDivElement | null)[]>([]);
  const stages = useRef<(HTMLDivElement | null)[]>([]);
  const intro = useRef<HTMLDivElement>(null);
  const hud = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  // The whole scene is drawn imperatively on GSAP's ticker: no React renders per frame.
  useEffect(() => {
    const el = section.current!;
    const root = svg.current!;
    const necks = Array.from(root.querySelectorAll<SVGPathElement>('.neck'));
    const nodes = Array.from(root.querySelectorAll<SVGCircleElement>('.node'));
    const halos = Array.from(root.querySelectorAll<SVGCircleElement>('.halo'));
    const chaos = Array.from(root.querySelectorAll<SVGLineElement>('.chaos'));
    const pipe = root.querySelector<SVGPathElement>('.pipe')!;
    const pipeGlow = root.querySelector<SVGPathElement>('.pipe-glow')!;
    const packets = Array.from(root.querySelectorAll<SVGCircleElement>('.packet'));
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let W = 0;
    let H = 0;
    let L = layouts(1, 1);
    const resize = () => {
      W = el.querySelector<HTMLElement>('.hero__sticky')!.clientWidth;
      H = window.innerHeight;
      root.setAttribute('viewBox', `0 0 ${W} ${H}`);
      L = layouts(W, H);
    };
    resize();
    window.addEventListener('resize', resize);

    const state = { p: 0, sp: 0, intro: reduced ? 1 : 0, time: 0 };
    const mouse = { x: -9999, y: -9999, on: false };
    const pos: P[] = L.start.map((p) => [...p] as P);
    const vel: P[] = L.start.map(() => [0, 0]);
    // Intro: each node arrives from somewhere off in the dark.
    const from: P[] = MARK.map((_, i) => {
      const a = (i / 6) * Math.PI * 2 + 0.6;
      return [Math.cos(a) * 1.4, Math.sin(a) * 1.4];
    });

    const st = ScrollTrigger.create({
      trigger: el,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => {
        state.p = self.progress;
      },
    });

    const onMove = (e: PointerEvent) => {
      const b = root.getBoundingClientRect();
      mouse.x = e.clientX - b.left;
      mouse.y = e.clientY - b.top;
      mouse.on = true;
    };
    const onLeave = () => {
      mouse.on = false;
    };
    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerleave', onLeave);

    const tick = (_t: number, dt: number) => {
      state.time += dt / 1000;
      state.sp += (state.p - state.sp) * 0.14;
      const p = state.sp;
      const f = clamp(dt / 16.67, 0.5, 3);

      let mean1 = 0;
      let mean2 = 0;
      let mean3 = 0;
      const rad: number[] = [];

      for (let i = 0; i < 6; i++) {
        const dl = i === 5 ? 0.06 : i * 0.012;
        const t1 = ease.inOut(range(p, 0.07 + i * 0.012, 0.27 + i * 0.012));
        const t2 = ease.inOut(range(p, 0.38 + i * 0.014, 0.55 + i * 0.014));
        const t3raw = range(p, 0.7 + dl, 0.86 + dl);
        const t3 = i === 5 ? ease.outBack(t3raw) : ease.inOut(t3raw);
        mean1 += t1 / 6;
        mean2 += t2 / 6;
        mean3 += t3raw / 6;

        // Leg by leg, with a sideways swirl so nodes travel on arcs, not rails.
        const leg = (a: P, b: P, t: number, k: number): P => {
          const dx = b[0] - a[0];
          const dy = b[1] - a[1];
          const sw = Math.sin(Math.PI * clamp(t)) * k * (i % 2 ? 1 : -1);
          return [lerp(a[0], b[0], t) - dy * sw, lerp(a[1], b[1], t) + dx * sw];
        };
        let tg: P = L.start[i];
        let r = L.r0;
        if (t1 > 0) {
          tg = leg(L.start[i], L.scatter[i], t1, 0.22);
          r = lerp(L.r0, L.rS, t1);
        }
        if (t2 > 0) {
          tg = leg(L.scatter[i], L.pipe[i], t2, 0.12);
          r = lerp(L.rS, L.rP, t2);
        }
        if (t3raw > 0) {
          tg = leg(L.pipe[i], L.end[i], t3, -0.16);
          r = lerp(L.rP, L.r3, ease.out(t3raw));
        }

        // Gentle life while scattered: each system drifts on its own.
        const drift = t1 * (1 - t2);
        tg = [tg[0] + Math.sin(state.time * 0.9 + i * 1.7) * 9 * drift, tg[1] + Math.cos(state.time * 0.7 + i) * 9 * drift];

        // Intro: the nodes fly in and the mark assembles itself.
        if (state.intro < 1) {
          const ti = range(state.intro, i === 5 ? 0.42 : i * 0.05, i === 5 ? 1 : 0.62 + i * 0.05);
          const e = i === 5 ? ease.outBack(ti) : ease.outElastic(ti);
          const sx = W / 2 + from[i][0] * W * 0.5;
          const sy = i === 5 ? -H * 0.2 : H / 2 + from[i][1] * H * 0.5;
          tg = [lerp(sx, tg[0], e), lerp(sy, tg[1], e)];
          r *= ease.out(Math.min(1, ti * 1.6));
        }

        // The pointer pushes the nodes aside; the necks stretch and snap back.
        if (mouse.on) {
          const dx = tg[0] - mouse.x;
          const dy = tg[1] - mouse.y;
          const d = Math.hypot(dx, dy) || 1;
          const reach = Math.max(r * 3.2, 90);
          const force = Math.exp(-(d * d) / (reach * reach)) * r * 0.9;
          tg = [tg[0] + (dx / d) * force, tg[1] + (dy / d) * force];
        }

        // Spring towards the target: everything moves with a little weight.
        vel[i][0] = (vel[i][0] + (tg[0] - pos[i][0]) * 0.16 * f) * Math.pow(0.7, f);
        vel[i][1] = (vel[i][1] + (tg[1] - pos[i][1]) * 0.16 * f) * Math.pow(0.7, f);
        pos[i][0] += vel[i][0] * f;
        pos[i][1] += vel[i][1] * f;
        rad[i] = Math.max(0, r);

        const grey = t1 * (1 - t2);
        const fill = i === 5 ? mix(LIGHT, GREY, grey) : mix(ORANGE, GREY, grey);
        const n = nodes[i];
        n.setAttribute('cx', pos[i][0].toFixed(2));
        n.setAttribute('cy', pos[i][1].toFixed(2));
        n.setAttribute('r', rad[i].toFixed(2));
        n.setAttribute('fill', fill);
        const h = halos[i];
        const pulse = 1 + 0.35 * ((state.time * 0.8 + i * 0.37) % 1);
        h.setAttribute('cx', pos[i][0].toFixed(2));
        h.setAttribute('cy', pos[i][1].toFixed(2));
        h.setAttribute('r', (rad[i] * pulse * 1.5).toFixed(2));
        h.setAttribute('opacity', (t2 * (1 - t3raw) * (1.35 - pulse) * 1.6).toFixed(3));

        const lab = labels.current[i];
        if (lab) {
          const o = clamp(t1 * 1.4 - 0.2) * (1 - clamp(t3raw * 2.2));
          // On phones the labels sit under the scattered nodes, then beside the path.
          const side = L.mobile && t2 > 0.5 ? (i % 2 ? 'right' : 'left') : L.mobile ? 'below' : i % 2 ? 'below' : 'above';
          const below = side === 'below' ? 1 : side === 'above' ? -1 : 0;
          const lx = side === 'right' ? pos[i][0] + rad[i] + 12 : side === 'left' ? pos[i][0] - rad[i] - 12 : pos[i][0];
          const ly = pos[i][1] + below * (rad[i] + (L.mobile ? 16 : 22));
          lab.style.opacity = o.toFixed(3);
          lab.style.transform = `translate3d(${lx.toFixed(1)}px, ${ly.toFixed(1)}px, 0)`;
          lab.dataset.side = side;
          lab.classList.toggle('is-on', t2 > 0.6);
        }
      }

      // Gooey necks: they only exist while two nodes of the mark are close.
      NECKS.forEach(([a, b], k) => {
        const d = metaball(rad[a], rad[b], pos[a], pos[b], NECK_OPTS);
        necks[k].setAttribute('d', d);
      });

      // The tangle: every system loosely wired to every other one.
      const chaosO = clamp(mean1 * 1.3 - 0.2) * (1 - mean2) * 0.55;
      chaos.forEach((ln, k) => {
        const [a, b] = CHAOS[k];
        ln.setAttribute('x1', pos[a][0].toFixed(1));
        ln.setAttribute('y1', pos[a][1].toFixed(1));
        ln.setAttribute('x2', pos[b][0].toFixed(1));
        ln.setAttribute('y2', pos[b][1].toFixed(1));
        ln.setAttribute('opacity', chaosO.toFixed(3));
        ln.style.strokeDashoffset = String((state.time * (k % 2 ? 14 : -11)) % 200);
      });

      // The single path: one smooth line through every node, with data flowing on it.
      const pipeO = clamp(mean2 * 1.6 - 0.5) * (1 - clamp(mean3 * 2.5));
      let d = `M${pos[0][0].toFixed(1)} ${pos[0][1].toFixed(1)}`;
      for (let i = 1; i < 6; i++) {
        const a = pos[i - 1];
        const b = pos[i];
        const mx = L.mobile ? a[0] : (a[0] + b[0]) / 2;
        const my = L.mobile ? (a[1] + b[1]) / 2 : a[1];
        const nx = L.mobile ? b[0] : (a[0] + b[0]) / 2;
        const ny = L.mobile ? (a[1] + b[1]) / 2 : b[1];
        d += `C${mx.toFixed(1)} ${my.toFixed(1)} ${nx.toFixed(1)} ${ny.toFixed(1)} ${b[0].toFixed(1)} ${b[1].toFixed(1)}`;
      }
      pipe.setAttribute('d', d);
      pipeGlow.setAttribute('d', d);
      pipe.setAttribute('opacity', pipeO.toFixed(3));
      pipeGlow.setAttribute('opacity', (pipeO * 0.5).toFixed(3));
      const drawn = clamp(mean2 * 1.8 - 0.6);
      const len = pipe.getTotalLength() || 1;
      pipe.style.strokeDasharray = `${len}`;
      pipe.style.strokeDashoffset = String(len * (1 - drawn));
      packets.forEach((pk, k) => {
        const u = (state.time * 0.16 + k / PACKETS) % 1;
        const pt = pipe.getPointAtLength(u * len * drawn);
        pk.setAttribute('cx', pt.x.toFixed(1));
        pk.setAttribute('cy', pt.y.toFixed(1));
        pk.setAttribute('opacity', (pipeO * Math.sin(Math.PI * u)).toFixed(3));
      });

      // Copy: the opening headline, then one caption per act.
      if (intro.current) {
        const o = 1 - range(p, 0.015, 0.09);
        intro.current.style.opacity = o.toFixed(3);
        intro.current.style.transform = `translate3d(0, ${(-60 * (1 - o)).toFixed(1)}px, 0)`;
        intro.current.style.visibility = o <= 0.001 ? 'hidden' : 'visible';
      }
      const windows: [number, number][] = [
        [0.12, 0.36],
        [0.44, 0.68],
        [0.78, 1.2],
      ];
      stages.current.forEach((s, k) => {
        if (!s) return;
        const [a, b] = windows[k];
        const o = range(p, a, a + 0.06) * (1 - range(p, b - 0.05, b));
        s.style.opacity = o.toFixed(3);
        s.style.transform = `translate3d(0, ${((1 - o) * (p < a + 0.06 ? 40 : -40)).toFixed(1)}px, 0)`;
        s.style.visibility = o <= 0.001 ? 'hidden' : 'visible';
      });
      if (hud.current) {
        hud.current.style.setProperty('--p', p.toFixed(4));
        const act = p < 0.4 ? (p < 0.1 ? 0 : 1) : p < 0.72 ? 2 : 3;
        hud.current.dataset.act = String(act);
      }
    };
    gsap.ticker.add(tick);

    // Start the intro once fonts are in and the page is ready.
    const play = () => {
      if (started.current || reduced) return;
      started.current = true;
      gsap.to(state, { intro: 1, duration: 3.1, ease: 'none', delay: 0.15 });
    };
    (el as HTMLElement & { __play?: () => void }).__play = play;

    return () => {
      gsap.ticker.remove(tick);
      st.kill();
      window.removeEventListener('resize', resize);
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerleave', onLeave);
    };
  }, []);

  useEffect(() => {
    if (!ready) return;
    (section.current as (HTMLElement & { __play?: () => void }) | null)?.__play?.();
    const lines = intro.current?.querySelectorAll('.reveal-line > span');
    const fades = intro.current?.querySelectorAll('.hero__fade');
    if (lines && fades) {
      gsap.fromTo(lines, { y: 0, yPercent: 110 }, { y: 0, yPercent: 0, duration: 1.3, ease: 'expo.out', stagger: 0.09, delay: 0.9 });
      gsap.fromTo(fades, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 1, ease: 'power3.out', stagger: 0.12, delay: 1.4 });
    }
  }, [ready]);

  // Ambient field: a quiet constellation of data points behind the mark.
  useEffect(() => {
    const cv = field.current!;
    const ctx = cv.getContext('2d')!;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let w = 0;
    let h = 0;
    let dpr = 1;
    let pts: { x: number; y: number; vx: number; vy: number }[] = [];
    let visible = true;
    const mouse = { x: -999, y: -999 };
    const setup = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = cv.clientWidth;
      h = cv.clientHeight;
      cv.width = w * dpr;
      cv.height = h * dpr;
      const n = Math.round(clamp((w * h) / 22000, 24, 80));
      pts = Array.from({ length: n }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
      }));
    };
    setup();
    window.addEventListener('resize', setup);
    const move = (e: PointerEvent) => {
      const b = cv.getBoundingClientRect();
      mouse.x = e.clientX - b.left;
      mouse.y = e.clientY - b.top;
    };
    window.addEventListener('pointermove', move);
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(cv);
    const draw = () => {
      if (!visible) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      for (const p of pts) {
        if (!reduced) {
          p.x += p.vx;
          p.y += p.vy;
        }
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
      }
      const max = 130;
      for (let i = 0; i < pts.length; i++) {
        const a = pts[i];
        const dm = Math.hypot(a.x - mouse.x, a.y - mouse.y);
        const glow = Math.max(0, 1 - dm / 220);
        ctx.fillStyle = glow > 0 ? `rgba(255,96,0,${0.25 + glow * 0.6})` : 'rgba(244,241,234,0.22)';
        ctx.beginPath();
        ctx.arc(a.x, a.y, 1.3 + glow * 1.4, 0, Math.PI * 2);
        ctx.fill();
        for (let j = i + 1; j < pts.length; j++) {
          const b = pts[j];
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < max) {
            const g = Math.max(glow, Math.max(0, 1 - Math.hypot(b.x - mouse.x, b.y - mouse.y) / 220));
            ctx.strokeStyle = g > 0 ? `rgba(255,96,0,${(1 - d / max) * 0.35 * g})` : `rgba(244,241,234,${(1 - d / max) * 0.06})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }
    };
    gsap.ticker.add(draw);
    return () => {
      gsap.ticker.remove(draw);
      window.removeEventListener('resize', setup);
      window.removeEventListener('pointermove', move);
      io.disconnect();
    };
  }, []);

  return (
    <section id="top" className="hero" ref={section}>
      <div className="hero__sticky">
        <canvas className="hero__field" ref={field} aria-hidden="true" />
        <svg className="hero__svg" ref={svg} aria-hidden="true">
          <defs>
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="8" />
            </filter>
          </defs>
          {CHAOS.map((_, k) => (
            <line key={k} className="chaos" stroke="#8A8A8A" strokeWidth="1.2" strokeDasharray="3 7" opacity="0" />
          ))}
          <path className="pipe-glow" fill="none" stroke={ORANGE} strokeWidth="10" filter="url(#glow)" opacity="0" />
          <path className="pipe" fill="none" stroke={ORANGE} strokeWidth="2.5" strokeLinecap="round" opacity="0" />
          {MARK.map((_, i) => (
            <circle key={`h${i}`} className="halo" fill="none" stroke={ORANGE} strokeWidth="1.5" opacity="0" />
          ))}
          {NECKS.map((_, k) => (
            <path key={`n${k}`} className="neck" fill={ORANGE} />
          ))}
          {MARK.map((_, i) => (
            <circle key={`c${i}`} className="node" r="0" />
          ))}
          {Array.from({ length: PACKETS }, (_, k) => (
            <circle key={`p${k}`} className="packet" r="4" fill={LIGHT} opacity="0" />
          ))}
        </svg>

        {t.hero.nodes.map((n, i) => (
          <div key={i} className="node-label" ref={(e) => void (labels.current[i] = e)} aria-hidden="true">
            <span className="node-label__i">{String(i + 1).padStart(2, '0')}</span>
            {n}
          </div>
        ))}

        <div className="hero__intro container" ref={intro}>
          <p className="eyebrow hero__fade">{t.hero.eyebrow}</p>
          <h1 className="hero__title">
            {t.hero.title.map((l, i) => (
              <span key={i} className="reveal-line">
                <span className={i === 2 ? 'accent' : undefined}>{l}</span>
              </span>
            ))}
          </h1>
          <p className="hero__sub hero__fade">{t.hero.sub}</p>
          <div className="hero__cue hero__fade">
            <span className="hero__cue-line" />
            {t.hero.scroll}
          </div>
        </div>

        <div className="hero__stages container">
          {t.hero.stages.map((s, k) => (
            <div key={k} className="stage" ref={(e) => void (stages.current[k] = e)}>
              <p className="stage__kicker">{s.kicker}</p>
              <h2 className="stage__title">{s.title}</h2>
              <p className="stage__text">{s.text}</p>
            </div>
          ))}
        </div>

        <div className="hero__hud" ref={hud} aria-hidden="true">
          <span className="hud__bar">
            <span />
          </span>
          <span className="hud__acts">
            {[0, 1, 2, 3].map((a) => (
              <i key={a} data-a={a} />
            ))}
          </span>
        </div>
      </div>
    </section>
  );
}
