// The cookie banner: one line and two small buttons, in the bottom-left corner. The
// site has one kind of optional cookie: its own statistics (src/lib/analytics.ts). The
// two choices weigh the same and the choice can be changed from «Cookie preferences»
// in the footer, as the Garante's guidelines on cookies (10 June 2021) ask; the
// details (which cookies, the link to contact requests) are in the privacy notice.
//
// Rendered only in the browser: the prerendered HTML has no banner, so it never
// shows to crawlers and never flashes on a page where the choice is already made.

import { useEffect, useState } from 'react';
import type { Lang } from '../content';
import { getConsent, onOpenConsent, setConsent } from '../lib/analytics';
import { Link } from './Nav';

const text = {
  it: {
    body: 'Statistiche nostre, senza Google né pubblicità: solo se accetti.',
    more: 'Informativa',
    accept: 'Accetta',
    reject: 'Rifiuta',
    label: 'Cookie',
  },
  en: {
    body: 'Our own statistics, no Google, no ads: only if you accept.',
    more: 'Privacy notice',
    accept: 'Accept',
    reject: 'Reject',
    label: 'Cookies',
  },
};

export function CookieBanner({ lang }: { lang: Lang }) {
  const t = text[lang];
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (getConsent() === null) setOpen(true);
    return onOpenConsent(() => setOpen(true));
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('cookiebar-open', open);
    return () => document.documentElement.classList.remove('cookiebar-open');
  }, [open]);

  if (!open) return null;

  const choose = (c: 'si' | 'no') => {
    setConsent(c);
    setOpen(false);
  };

  return (
    <div className="cookiebar" role="dialog" aria-label={t.label} aria-describedby="cookiebar-body">
      <p className="cookiebar__body" id="cookiebar-body">
        {t.body}{' '}
        <Link page="privacy" lang={lang}>
          {t.more}
        </Link>
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
