// Geometry of the Ready2Digital mark, measured from the official PNG
// (192 px tall): six circles of radius 32 on a 64 px grid, joined by gooey
// necks. Coordinates are relative to the mark's centre (the PNG's (128, 96)).
//
//   A0 .  .  B3          two "<" chevrons made of nodes
//  A1 .  B4  .           and a dark dot where the second chevron
//   A2 .  .  D5          would have ended — the last step, the client.

export const R = 32;

export const MARK: [number, number][] = [
  [-32, -64], // A top
  [-96, 0], // A middle
  [-32, 64], // A bottom
  [96, -64], // B top
  [32, 0], // B middle
  [96, 64], // dark dot
];

/** Pairs joined by a neck in the mark. */
export const NECKS: [number, number][] = [
  [0, 1],
  [1, 2],
  [3, 4],
];

/** Metaball options that reproduce the neck of the official mark. */
export const NECK_OPTS = { v: 0.72, handle: 1.6, reach: 3.2 };

export const ORANGE = '#FF6000';
export const DARK = '#2B2B2B';

export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const range = (v: number, a: number, b: number) => clamp((v - a) / (b - a));
export const ease = {
  inOut: (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  out: (t: number) => 1 - Math.pow(1 - t, 3),
  outBack: (t: number) => {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  },
  outElastic: (t: number) => {
    if (t === 0 || t === 1) return t;
    return Math.pow(2, -9 * t) * Math.sin((t * 10 - 0.75) * ((2 * Math.PI) / 3.2)) + 1;
  },
};

/** Mixes two #rrggbb colours. */
export function mix(a: string, b: string, t: number) {
  const pa = parseInt(a.slice(1), 16);
  const pb = parseInt(b.slice(1), 16);
  const ch = (s: number) =>
    Math.round(lerp((pa >> s) & 255, (pb >> s) & 255, t))
      .toString(16)
      .padStart(2, '0');
  return `#${ch(16)}${ch(8)}${ch(0)}`;
}
