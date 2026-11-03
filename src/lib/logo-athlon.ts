// Il pittogramma di Athlon come due forme vettoriali, per animarlo (il tratto che si disegna, il
// riempimento, le due metà che si incastrano). È lo stesso file `src/features/lab/avvio/logo.ts` del
// pannello Athlon (PORTALE-ATHLON): ricavato da `pittogramma.png` (316 × 256, #FF6600) seguendo il
// contorno dell'alfa. Se il logo cambia, si rifà da capo da quel file.

export type Punto = readonly [number, number];

export const ATHLON_W = 316;
export const ATHLON_H = 256;

/** La forma in alto a destra e quella in basso a sinistra, ognuna col verso da cui arriva prima di incastrarsi. */
export const ATHLON_FORME: { id: 'destra' | 'sinistra'; punti: readonly Punto[]; da: Punto }[] = [
  {
    id: 'destra',
    da: [26, -20],
    punti: [
      [166.5, 0], [164.3, 2.5], [142, 50.5], [141.5, 52.5], [143.5, 55.5], [170.5, 55.8], [197.5, 44.8], [254.5, 44.8], [257, 46.5], [257, 49.5],
      [194.1, 183.5], [194, 187.5], [195.5, 189], [274.5, 188.9], [279.5, 177.5], [271, 159.5], [270, 154.5], [315.8, 56.5], [313.7, 49.5], [291.7, 2.5], [288.5, 0],
    ],
  },
  {
    id: 'sinistra',
    da: [-26, 20],
    punti: [
      [62.5, 67], [0.3, 198.5], [0.2, 201.5], [2.3, 206.5], [23.3, 251.5], [26.5, 256], [149.5, 256], [173.9, 205.5], [174.5, 203.5], [172.5, 200.5],
      [144.5, 200.3], [118.5, 211.2], [61.5, 211.2], [59, 209.5], [59, 206.5], [64, 195.5], [122.5, 70.5], [120.5, 67],
    ],
  },
];

export const percorso = (p: readonly Punto[]) => `M${p.map(([x, y]) => `${x} ${y}`).join(' L')} Z`;

const lato = (a: Punto, b: Punto) => Math.hypot(b[0] - a[0], b[1] - a[1]);

export function perimetro(p: readonly Punto[]): number {
  return p.reduce((somma, a, i) => somma + lato(a, p[(i + 1) % p.length]), 0);
}

/** Il punto a distanza `d` lungo il contorno: la punta della «penna». */
export function puntoSu(p: readonly Punto[], d: number): Punto {
  let resta = d;
  for (let i = 0; i < p.length; i++) {
    const a = p[i];
    const b = p[(i + 1) % p.length];
    const l = lato(a, b);
    if (resta <= l) return [a[0] + ((b[0] - a[0]) * resta) / (l || 1), a[1] + ((b[1] - a[1]) * resta) / (l || 1)];
    resta -= l;
  }
  return p[0];
}
