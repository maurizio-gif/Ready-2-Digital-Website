import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { copy, CONTACT_EMAIL, type Lang } from './content';
import { Hero } from './components/Hero';
import { Antithesis, Contact, Manifesto, Method, Modular, Origin, Sectors, Services, Work } from './components/Sections';
import { Mark } from './components/Mark';
import { CasePage } from './components/CasePage';
import { Dots } from './components/Dots';
import { TechStack } from './components/Tech';
import { cases } from './cases';
import { navigate, useRoute } from './router';

gsap.registerPlugin(ScrollTrigger);

let lenis: Lenis | null = null;
const scrollTo = (target: string | number) => {
  if (lenis) lenis.scrollTo(target, { duration: 1.6 });
  else if (typeof target === 'number') window.scrollTo({ top: target, behavior: 'smooth' });
  else document.querySelector(target)?.scrollIntoView({ behavior: 'smooth' });
};

function initialLang(): Lang {
  const q = new URLSearchParams(window.location.search).get('lang');
  if (q === 'en' || q === 'it') return q;
  try {
    const s = localStorage.getItem('r2d-lang');
    if (s === 'en' || s === 'it') return s;
  } catch {
    /* storage unavailable */
  }
  return navigator.language?.toLowerCase().startsWith('it') ? 'it' : 'en';
}

export default function App() {
  const [lang, setLang] = useState<Lang>(initialLang);
  const [ready, setReady] = useState(false);
  const [menu, setMenu] = useState(false);
  const [privacy, setPrivacy] = useState(false);
  const t = copy[lang];
  const route = useRoute();
  const kase = route.page === 'case' ? cases[lang].find((c) => c.slug === route.slug) : undefined;
  const routeKey = kase ? kase.slug : 'home';
  const pending = useRef<string | null>(null);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.title = kase ? `${kase.client} — ${lang === 'it' ? 'Caso' : 'Case study'} · Ready2Digital` : t.meta.title;
    document.querySelector('meta[name="description"]')?.setAttribute('content', kase ? kase.intro : t.meta.description);
    try {
      localStorage.setItem('r2d-lang', lang);
    } catch {
      /* ignore */
    }
  }, [lang, t, kase]);

  // A new page starts at the top, or at the section it was asked to show.
  useEffect(() => {
    const id = pending.current;
    pending.current = null;
    lenis?.scrollTo(0, { immediate: true, force: true });
    window.scrollTo(0, 0);
    ScrollTrigger.refresh();
    // Wait for the new page's pins and reveals to settle, then jump there.
    if (id)
      setTimeout(() => {
        ScrollTrigger.refresh();
        const el = document.getElementById(id);
        if (!el) return;
        if (lenis) lenis.scrollTo(el, { immediate: true, force: true });
        else el.scrollIntoView();
      }, 500);
  }, [routeKey]);

  // Smooth scrolling, driven by GSAP's ticker so everything shares one clock.
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!reduced) {
      lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 1 });
      lenis.on('scroll', ScrollTrigger.update);
      const raf = (time: number) => lenis?.raf(time * 1000);
      gsap.ticker.add(raf);
      gsap.ticker.lagSmoothing(0);
      return () => {
        gsap.ticker.remove(raf);
        lenis?.destroy();
        lenis = null;
      };
    }
  }, []);

  // Wait for the fonts, then lift the curtain.
  useEffect(() => {
    let done = false;
    const go = () => {
      if (done) return;
      done = true;
      document.documentElement.classList.add('is-ready');
      setReady(true);
      ScrollTrigger.refresh();
    };
    document.fonts?.ready.then(go);
    const tm = setTimeout(go, 1800);
    return () => clearTimeout(tm);
  }, []);

  // Generic reveals for every section, re-armed when the language changes.
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('main [data-reveal]').forEach((el) => {
        gsap.fromTo(
          el,
          { opacity: 0, y: 40 },
          { opacity: 1, y: 0, duration: 1.1, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 88%', once: true } },
        );
      });
      gsap.utils.toArray<HTMLElement>('main [data-split]').forEach((el) => {
        gsap.fromTo(
          el,
          { clipPath: 'inset(0 0 100% 0)', y: 60 },
          { clipPath: 'inset(0 0 -20% 0)', y: 0, duration: 1.3, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 88%', once: true } },
        );
      });
      gsap.utils.toArray<HTMLElement>('main [data-card]').forEach((el, i) => {
        gsap.fromTo(
          el,
          { opacity: 0, y: 70, scale: 0.96 },
          { opacity: 1, y: 0, scale: 1, duration: 1.1, ease: 'expo.out', delay: (i % 3) * 0.08, scrollTrigger: { trigger: el, start: 'top 92%', once: true } },
        );
      });
    });
    const tm = setTimeout(() => ScrollTrigger.refresh(), 300);
    return () => {
      clearTimeout(tm);
      ctx.revert();
    };
  }, [lang, routeKey]);

  // Magnetic buttons.
  useEffect(() => {
    if (!window.matchMedia('(pointer: fine)').matches) return;
    const move = (e: PointerEvent) => {
      const el = (e.target as HTMLElement).closest<HTMLElement>('.magnetic');
      document.querySelectorAll<HTMLElement>('.magnetic').forEach((m) => {
        if (m !== el) gsap.to(m, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1, 0.4)' });
      });
      if (!el) return;
      const b = el.getBoundingClientRect();
      gsap.to(el, { x: (e.clientX - b.left - b.width / 2) * 0.3, y: (e.clientY - b.top - b.height / 2) * 0.4, duration: 0.4, ease: 'power3.out' });
    };
    window.addEventListener('pointermove', move);
    return () => window.removeEventListener('pointermove', move);
  }, []);

  useEffect(() => {
    if (menu || privacy) lenis?.stop();
    else lenis?.start();
  }, [menu, privacy]);

  const go = (id: string) => {
    setMenu(false);
    if (kase) {
      pending.current = id === 'top' ? null : id;
      navigate('/');
    } else scrollTo(`#${id}`);
  };

  return (
    <>
      <Curtain ready={ready} />
      <Cursor />
      <Header t={t} lang={lang} setLang={setLang} menu={menu} setMenu={setMenu} go={go} />
      {kase ? (
        <main key={`${lang}-${routeKey}`}>
          <CasePage c={kase} lang={lang} onContact={() => go('contatti')} />
        </main>
      ) : (
        <main key={`${lang}-home`}>
          <Hero t={t} ready={ready} />
          <Manifesto t={t} />
          <Dots variant="gooey" lines={t.dots.a} />
          <Antithesis t={t} />
          <Services t={t} />
          <TechStack lang={lang} />
          <Modular t={t} />
          <Dots variant="neural" lines={t.dots.b} />
          <Method t={t} />
          <Origin t={t} lang={lang} />
          <Work t={t} lang={lang} />
          <Sectors t={t} />
          <Dots variant="converge" lines={t.dots.c} />
          <Contact t={t} />
        </main>
      )}
      <footer className="footer">
        <div className="container footer__inner">
          <div className="footer__brand">
            <Mark size={34} dot="#F4F1EA" />
            <div>
              <p className="footer__name">Ready2Digital</p>
              <p className="footer__tag">{t.footer.tagline}</p>
            </div>
          </div>
          <div className="footer__links">
            <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
            <button type="button" onClick={() => setPrivacy(true)}>
              {t.footer.privacy}
            </button>
            <button type="button" onClick={() => scrollTo(0)}>
              {t.footer.top} ↑
            </button>
          </div>
        </div>
        <div className="container footer__bottom">
          <p>
            © {new Date().getFullYear()} Ready2Digital. {t.footer.rights}
          </p>
        </div>
        <p className="footer__giant" aria-hidden="true">
          Ready2Digital
        </p>
      </footer>
      {privacy && (
        <div className="dialog" role="dialog" aria-modal="true" aria-label={t.privacy.title} onClick={() => setPrivacy(false)}>
          <div className="dialog__box" onClick={(e) => e.stopPropagation()} data-lenis-prevent>
            <h2>{t.privacy.title}</h2>
            {t.privacy.body.map(([h, p]) => (
              <div key={h}>
                <h3>{h}</h3>
                <p>{p}</p>
              </div>
            ))}
            <button className="btn" type="button" onClick={() => setPrivacy(false)} autoFocus>
              {t.privacy.close}
            </button>
          </div>
        </div>
      )}
    </>
  );
}

function Header({
  t,
  lang,
  setLang,
  menu,
  setMenu,
  go,
}: {
  t: (typeof copy)['it'];
  lang: Lang;
  setLang: (l: Lang) => void;
  menu: boolean;
  setMenu: (b: boolean) => void;
  go: (id: string) => void;
}) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    let last = 0;
    const st = ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate: (s) => {
        const y = s.scroll();
        ref.current?.classList.toggle('is-hidden', y > last && y > 300);
        ref.current?.classList.toggle('is-solid', y > window.innerHeight * 0.5);
        last = y;
      },
    });
    return () => st.kill();
  }, []);
  const other: Lang = lang === 'it' ? 'en' : 'it';
  return (
    <>
      <header className={`header${menu ? ' is-menu' : ''}`} ref={ref}>
        <div className="container header__inner">
          <a
            className="brand"
            href="#top"
            onClick={(e) => {
              e.preventDefault();
              go('top');
            }}
            aria-label="Ready2Digital"
          >
            <Mark size={26} dot="#F4F1EA" />
            <span className="brand__name">
              Ready<span className="accent">2</span>Digital
            </span>
          </a>
          <nav className="nav" aria-label="Main">
            {t.nav.items.map((n) => (
              <a
                key={n.id}
                href={`#${n.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  go(n.id);
                }}
              >
                {n.label}
              </a>
            ))}
          </nav>
          <div className="header__right">
            <button type="button" className="lang" onClick={() => setLang(other)} aria-label={other === 'en' ? 'English' : 'Italiano'}>
              <span className={lang === 'it' ? 'on' : ''}>IT</span>
              <span className={lang === 'en' ? 'on' : ''}>EN</span>
            </button>
            <a
              className="btn btn--sm magnetic header__cta"
              href="#contatti"
              onClick={(e) => {
                e.preventDefault();
                go('contatti');
              }}
            >
              {t.nav.cta}
            </a>
            <button type="button" className="burger" aria-expanded={menu} aria-label={menu ? t.nav.close : t.nav.menu} onClick={() => setMenu(!menu)}>
              <span />
              <span />
            </button>
          </div>
        </div>
      </header>
      <div className={`menu${menu ? ' is-open' : ''}`} aria-hidden={!menu}>
        <nav className="container menu__nav">
          {[...t.nav.items, { id: 'contatti', label: t.nav.cta }].map((n, i) => (
            <a
              key={n.id}
              href={`#${n.id}`}
              tabIndex={menu ? 0 : -1}
              style={{ transitionDelay: menu ? `${0.08 + i * 0.05}s` : '0s' }}
              onClick={(e) => {
                e.preventDefault();
                go(n.id);
              }}
            >
              <small>{String(i + 1).padStart(2, '0')}</small>
              {n.label}
            </a>
          ))}
        </nav>
      </div>
    </>
  );
}

function Curtain({ ready }: { ready: boolean }) {
  return (
    <div className={`curtain${ready ? ' is-up' : ''}`} aria-hidden="true">
      <span className="curtain__dot" />
    </div>
  );
}

function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!window.matchMedia('(pointer: fine)').matches) return;
    document.documentElement.classList.add('has-cursor');
    const xd = gsap.quickTo(dot.current, 'x', { duration: 0.12, ease: 'power3' });
    const yd = gsap.quickTo(dot.current, 'y', { duration: 0.12, ease: 'power3' });
    const xr = gsap.quickTo(ring.current, 'x', { duration: 0.55, ease: 'power3' });
    const yr = gsap.quickTo(ring.current, 'y', { duration: 0.55, ease: 'power3' });
    const move = (e: PointerEvent) => {
      document.documentElement.classList.add('cursor-moved');
      xd(e.clientX);
      yd(e.clientY);
      xr(e.clientX);
      yr(e.clientY);
      const hot = (e.target as HTMLElement).closest('a, button, [role="slider"], input, textarea, .svc, .case');
      ring.current?.classList.toggle('is-hot', !!hot);
    };
    const down = () => ring.current?.classList.add('is-down');
    const up = () => ring.current?.classList.remove('is-down');
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerdown', down);
    window.addEventListener('pointerup', up);
    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerdown', down);
      window.removeEventListener('pointerup', up);
      document.documentElement.classList.remove('has-cursor');
    };
  }, []);
  return (
    <>
      <div className="cursor-ring" ref={ring} aria-hidden="true" />
      <div className="cursor-dot" ref={dot} aria-hidden="true" />
    </>
  );
}
