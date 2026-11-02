import { useMemo } from 'react';
import { metaball } from '../lib/metaball';
import { DARK, MARK, NECKS, NECK_OPTS, ORANGE, R } from '../lib/mark';

/** Static Ready2Digital mark, drawn from the same geometry the animations use. */
export function Mark({ size = 40, dot = DARK, color = ORANGE, className }: { size?: number; dot?: string; color?: string; className?: string }) {
  const necks = useMemo(
    () => NECKS.map(([a, b]) => metaball(R, R, MARK[a], MARK[b], NECK_OPTS)).join(''),
    [],
  );
  return (
    <svg className={className} viewBox="-128 -96 256 192" width={(size * 256) / 192} height={size} aria-hidden="true">
      <path d={necks} fill={color} />
      {MARK.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={R} fill={i === 5 ? dot : color} />
      ))}
    </svg>
  );
}
