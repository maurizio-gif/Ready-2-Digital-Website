// LinkedIn links: the company page and Maurizio Taruggi's profile (URLs in legal.ts).

import type { Lang } from '../content';
import { SOCIAL } from '../legal';

const LABEL: Record<Lang, { company: string; founder: string; on: string }> = {
  it: { company: 'Ready 2 Digital', founder: 'Maurizio Taruggi', on: 'su LinkedIn' },
  en: { company: 'Ready 2 Digital', founder: 'Maurizio Taruggi', on: 'on LinkedIn' },
};

/** The LinkedIn "in" glyph. */
export function LinkedInIcon({ size = 18 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-hidden="true">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 1 1 0-4.125 2.062 2.062 0 0 1 0 4.125zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

/**
 * One or both LinkedIn links as round icon buttons. With `names` each icon carries the name next to it
 * (where there is room); without, it is the icon alone, named for screen readers and in the tooltip.
 */
export function SocialLinks({ lang, only, names = false, className = '' }: { lang: Lang; only?: 'company' | 'founder'; names?: boolean; className?: string }) {
  const l = LABEL[lang];
  const items = (['company', 'founder'] as const).filter((k) => !only || only === k);
  return (
    <span className={`social ${className}`.trim()}>
      {items.map((k) => (
        <a key={k} className={`social__link${names ? ' has-name' : ''}`} href={SOCIAL[k]} target="_blank" rel="noopener noreferrer" aria-label={`${l[k]} ${l.on}`} title={`${l[k]} ${l.on}`}>
          <span className="social__icon">
            <LinkedInIcon />
          </span>
          {names && <span className="social__name">{l[k]}</span>}
        </a>
      ))}
    </span>
  );
}
