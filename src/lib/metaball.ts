// Gooey "metaball" bridge between two circles — the connective tissue of the
// Ready2Digital mark. Adapted from the classic algorithm (Hiroyuki Sato's
// Illustrator script, as popularised by varun.ca/metaballs). It returns the SVG
// path of the neck only; the circles are drawn separately. As the circles move
// apart the neck thins, stretches and finally snaps — which is exactly what the
// mark does when it decomposes and recomposes.

type V = [number, number];

const dist = (a: V, b: V) => Math.hypot(a[0] - b[0], a[1] - b[1]);
const ang = (a: V, b: V) => Math.atan2(a[1] - b[1], a[0] - b[0]);
const vec = (c: V, a: number, r: number): V => [c[0] + r * Math.cos(a), c[1] + r * Math.sin(a)];
const f = (n: number) => n.toFixed(2);
const p = (v: V) => `${f(v[0])} ${f(v[1])}`;

export function metaball(
  r1: number,
  r2: number,
  c1: V,
  c2: V,
  opts: { handle?: number; v?: number; reach?: number } = {},
): string {
  const handle = opts.handle ?? 2.4;
  const reach = opts.reach ?? 2.5;
  const d = dist(c1, c2);
  const maxDist = r1 + r2 * reach;
  if (r1 < 0.5 || r2 < 0.5 || d > maxDist || d <= Math.abs(r1 - r2)) return '';

  // Spread shrinks as the bridge stretches, so it visibly thins before snapping.
  const stretch = Math.max(0, Math.min(1, (d - (r1 + r2)) / (maxDist - (r1 + r2))));
  const v = (opts.v ?? 0.5) * (1 - 0.55 * stretch);

  let u1 = 0;
  let u2 = 0;
  if (d < r1 + r2) {
    u1 = Math.acos((r1 * r1 + d * d - r2 * r2) / (2 * r1 * d));
    u2 = Math.acos((r2 * r2 + d * d - r1 * r1) / (2 * r2 * d));
  }
  const between = ang(c2, c1);
  const maxSpread = Math.acos((r1 - r2) / d);
  const a1 = between + u1 + (maxSpread - u1) * v;
  const a2 = between - u1 - (maxSpread - u1) * v;
  const a3 = between + Math.PI - u2 - (Math.PI - u2 - maxSpread) * v;
  const a4 = between - Math.PI + u2 + (Math.PI - u2 - maxSpread) * v;
  const p1 = vec(c1, a1, r1);
  const p2 = vec(c1, a2, r1);
  const p3 = vec(c2, a3, r2);
  const p4 = vec(c2, a4, r2);

  const total = r1 + r2;
  const d2Base = Math.min(v * handle, dist(p1, p3) / total);
  const d2 = d2Base * Math.min(1, (d * 2) / total);
  const h1 = vec(p1, a1 - Math.PI / 2, r1 * d2);
  const h2 = vec(p2, a2 + Math.PI / 2, r1 * d2);
  const h3 = vec(p3, a3 + Math.PI / 2, r2 * d2);
  const h4 = vec(p4, a4 - Math.PI / 2, r2 * d2);

  return `M${p(p1)}C${p(h1)} ${p(h3)} ${p(p3)}L${p(p4)}C${p(h4)} ${p(h2)} ${p(p2)}Z`;
}
