// The cookie banner. The site has one kind of optional cookie: its own statistics
// (src/lib/analytics.ts). The two choices weigh the same, closing with the × means
// «no», and the choice can be changed from «Cookie preferences» in the footer — as
// the Garante's guidelines on cookies (10 June 2021) ask.
//
// Rendered only in the browser: the prerendered HTML has no banner, so it never
// shows to crawlers and never flashes on a page where the choice is already made.

import { useEffect, useRef, useState } from 'react';
import type { Lang } from '../content';
import { getConsent, onOpenConsent, setConsent } from '../lib/analytics';
import { Link } from './Nav';

const text = {
  it: {
    title: 'Cookie',
    body: 'Usiamo cookie tecnici per far funzionare il sito e, solo se accetti, cookie statistici nostri (niente Google, niente pubblicità) per capire quali pagine servono e da dove arrivano le visite. Se poi ci scrivi dal modulo, colleghiamo la tua richiesta alle visite di questo browser.',
    more: 'Informativa',
    accept: 'Accetta',
    reject: 'Rifiuta',
    close: 'Chiudi senza accettare',
  },
  en: {
    title: 'Cookies',
    body: 'We use technical cookies to run the site and, only if you accept, our own statistics cookies (no Google, no advertising) to understand which pages help and where visits come from. If you then write to us through the form, we link your request to this browser’s visits.',
    more: 'Privacy notice',
    accept: 'Accept',
    reject: 'Reject',
    close: 'Close without accepting',
  },
};

export function CookieBanner({ lang }: { lang: Lang }) {
  const t = text[lang];
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (getConsent() === null) setOpen(true);
    return onOpenConsent(() => setOpen(true));
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('cookiebar-open', open);
    if (open) box.current?.focus({ preventScroll: true });
    return () => document.documentElement.classList.remove('cookiebar-open');
  }, [open]);

  if (!open) return null;

  const choose = (c: 'si' | 'no') => {
    setConsent(c);
    setOpen(false);
  };

  return (
    <div className="cookiebar" role="dialog" aria-labelledby="consent-title" aria-describedby="consent-body" tabIndex={-1} ref={box}>
      <button type="button" className="cookiebar__x" aria-label={t.close} onClick={() => choose('no')}>
        ×
      </button>
      <p className="cookiebar__title" id="consent-title">
        {t.title}
      </p>
      <p className="cookiebar__body" id="consent-body">
        {t.body}{' '}
        <Link page="privacy" lang={lang}>
          {t.more}
        </Link>
        .
      </p>
      <div className="cookiebar__actions">
        <button type="button" className="cookiebar__btn" onClick={() => choose('no')}>
          {t.reject}
        </button>
        <button type="button" className="cookiebar__btn cookiebar__btn--yes" onClick={() => choose('si')}>
          {t.accept}
        </button>
      </div>
    </div>
  );
}
