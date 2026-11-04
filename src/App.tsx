import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { copy, type Copy, type Lang } from './content';
import { Mark } from './components/Mark';
import { ClientLogo, hasLogo } from './components/Logos';
import { SocialLinks } from './components/Social';
import { CasePage } from './components/CasePage';
import { AboutPage, ContactPage, HomePage, MethodPage, PrivacyPage, SolutionsPage, TechPage, WorkPage } from './components/Pages';
import { AgentsPage } from './components/Agents';
import { Chat } from './components/Chat';
import { COMPANY } from './legal';
import { applyHead, seoFor, shellSeo } from './seo';
import { Link } from './components/Nav';
import { cases } from './cases';
import { pages, SERVICE_IDS } from './pages';
import { href, navigate, pathFor, setNavigateHook, useRoute, type Page, type Route } from './router';
import { isTouch } from './lib/env';

gsap.registerPlugin(ScrollTrigger);

// On phones the address bar shows and hides while you scroll, and every time the
// viewport height changes. Without this, ScrollTrigger would refresh on each of
// those changes and the scrubbed sections would jump under the finger.
ScrollTrigger.config({ ignoreMobileResize: true });

let lenis: Lenis | null = null;
// While we scroll the page ourselves (anchors, "back to top") the header stays
// in view: it should not hide as if the reader were scrolling down.
let autoScrollUntil = 0;
const scrollTo = (target: string | number) => {
  autoScrollUntil = performance.now() + 1700;
  if (lenis) lenis.scrollTo(target, { duration: 1.6 });
  else if (typeof target === 'number') window.scrollTo({ top: target, behavior: 'smooth' });
  else document.querySelector(target)?.scrollIntoView({ behavior: 'smooth' });
};
const scrollToEl = (el: HTMLElement) => {
  autoScrollUntil = performance.now() + 1400;
  if (lenis) lenis.scrollTo(el, { offset: -96, duration: 1.2 });
  else {
    const top = el.getBoundingClientRect().top + window.scrollY - 96;
    window.scrollTo({ top, behavior: 'smooth' });
  }
};

export default function App({ ssrPath }: { ssrPath?: string }) {
  const route = useRoute(ssrPath);
  const lang: Lang = route.lang;
  const t = copy[lang];
  const [ready, setReady] = useState(false);
  const [menu, setMenu] = useState(false);
  const wipe = useRef<HTMLDivElement>(null);
  const kase = route.page === 'caso' ? cases[lang].find((c) => c.slug === route.slug) : undefined;
  const routeKey = `${lang}-${route.page}-${route.slug ?? ''}`;

  // Title, description, canonical, language alternates and structured data follow
  // the page when the reader moves around without a reload. The first load already
  // has them in the HTML (scripts/prerender.mjs).
  useEffect(() => {
    applyHead(route.notFound ? shellSeo() : seoFor(route));
  }, [route]);

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

  // Page transition: the curtain closes, the page changes, the curtain opens.
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setNavigateHook((go) => {
      setMenu(false);
      const el = wipe.current;
      if (!el || reduced) return go();
      el.classList.remove('is-out');
      el.classList.add('is-in');
      setTimeout(() => {
        go();
        setTimeout(() => {
          el.classList.remove('is-in');
          el.classList.add('is-out');
        }, 120);
      }, 520);
    });
    return () => setNavigateHook(null);
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

  // A new page starts at the top, or at the section named in the address.
  useEffect(() => {
    setMenu(false);
    lenis?.scrollTo(0, { immediate: true, force: true });
    window.scrollTo(0, 0);
    const id = decodeURIComponent(window.location.hash.slice(1));
    const tm = setTimeout(() => {
      ScrollTrigger.refresh();
      const el = id ? document.getElementById(id) : null;
      if (!el) return;
      scrollToEl(el);
    }, 450);
    return () => clearTimeout(tm);
  }, [routeKey]);

  // Same page, new #section (e.g. a service picked from the menu while on Solutions).
  useEffect(() => {
    const onHash = () => {
      const el = document.getElementById(decodeURIComponent(window.location.hash.slice(1)));
      if (el) scrollToEl(el);
    };
    window.addEventListener('r2d:hash', onHash);
    return () => window.removeEventListener('r2d:hash', onHash);
  }, []);

  // Generic reveals for every section, re-armed on every page. On touch screens
  // they are shorter and start earlier: a flick of the thumb moves a whole screen,
  // and the content must already be there when the eye lands on it.
  useEffect(() => {
    const touch = isTouch();
    const k = touch ? 0.65 : 1;
    const start = touch ? 'top 96%' : 'top 88%';
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('main [data-reveal]').forEach((el) => {
        gsap.fromTo(el, { opacity: 0, y: 40 * k }, { opacity: 1, y: 0, duration: 1.1 * k, ease: 'power3.out', scrollTrigger: { trigger: el, start, once: true } });
      });
      gsap.utils.toArray<HTMLElement>('main [data-split]').forEach((el) => {
        gsap.fromTo(el, { clipPath: 'inset(0 0 100% 0)', y: 60 * k }, { clipPath: 'inset(0 0 -20% 0)', y: 0, duration: 1.3 * k, ease: 'expo.out', scrollTrigger: { trigger: el, start, once: true } });
      });
      gsap.utils.toArray<HTMLElement>('main [data-card]').forEach((el, i) => {
        gsap.fromTo(el, { opacity: 0, y: 70 * k, scale: 0.96 }, { opacity: 1, y: 0, scale: 1, duration: 1.1 * k, ease: 'expo.out', delay: touch ? 0 : (i % 3) * 0.08, scrollTrigger: { trigger: el, start: touch ? 'top 98%' : 'top 92%', once: true } });
      });
    });
    const tm = setTimeout(() => ScrollTrigger.refresh(), 300);
    return () => {
      clearTimeout(tm);
      ctx.revert();
    };
  }, [routeKey]);

  // Cards tilt towards the pointer, with their inner layers lifted a little:
  // the same hook for every [data-tilt] on the page, pointer devices only.
  useEffect(() => {
    if (!window.matchMedia('(pointer: fine)').matches || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const live = new Map<HTMLElement, { rx: (v: number) => void; ry: (v: number) => void; y: (v: number) => void }>();
    const get = (el: HTMLElement) => {
      let q = live.get(el);
      if (!q) {
        q = {
          rx: gsap.quickTo(el, 'rotationX', { duration: 0.6, ease: 'power3' }),
          ry: gsap.quickTo(el, 'rotationY', { duration: 0.6, ease: 'power3' }),
          y: gsap.quickTo(el, 'y', { duration: 0.6, ease: 'power3' }),
        };
        gsap.set(el, { transformPerspective: 1100 });
        live.set(el, q);
      }
      return q;
    };
    const move = (e: PointerEvent) => {
      const el = (e.target as HTMLElement).closest<HTMLElement>('[data-tilt]');
      if (!el) return;
      const b = el.getBoundingClientRect();
      const x = (e.clientX - b.left) / b.width;
      const y = (e.clientY - b.top) / b.height;
      const amp = Number(el.dataset.tilt) || 6;
      const q = get(el);
      q.rx((0.5 - y) * amp);
      q.ry((x - 0.5) * amp);
      q.y(el.dataset.lift === '0' ? 0 : -6);
      el.style.setProperty('--mx', `${(x * 100).toFixed(1)}%`);
      el.style.setProperty('--my', `${(y * 100).toFixed(1)}%`);
    };
    const out = (e: PointerEvent) => {
      const el = (e.target as HTMLElement).closest<HTMLElement>('[data-tilt]');
      if (!el || (e.relatedTarget && el.contains(e.relatedTarget as Node))) return;
      const q = get(el);
      q.rx(0);
      q.ry(0);
      q.y(0);
    };
    document.addEventListener('pointermove', move, { passive: true });
    document.addEventListener('pointerout', out, { passive: true });
    return () => {
      document.removeEventListener('pointermove', move);
      document.removeEventListener('pointerout', out);
      live.clear();
    };
  }, [routeKey]);

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

  // With the phone menu open the page behind must not move: Lenis stops, and the
  // page itself stops scrolling (the menu scrolls on its own when it is taller than the screen).
  useEffect(() => {
    if (menu) lenis?.stop();
    else lenis?.start();
    document.documentElement.classList.toggle('menu-open', menu);
    return () => document.documentElement.classList.remove('menu-open');
  }, [menu]);

  let page: React.ReactNode;
  switch (route.page) {
    case 'soluzioni':
      page = <SolutionsPage t={t} lang={lang} />;
      break;
    case 'agenti':
      page = <AgentsPage lang={lang} />;
      break;
    case 'progetti':
      page = <WorkPage t={t} lang={lang} />;
      break;
    case 'metodo':
      page = <MethodPage t={t} lang={lang} />;
      break;
    case 'tecnologia':
      page = <TechPage lang={lang} />;
      break;
    case 'chisiamo':
      page = <AboutPage t={t} lang={lang} />;
      break;
    case 'contatti':
      page = <ContactPage t={t} lang={lang} />;
      break;
    case 'privacy':
      page = <PrivacyPage lang={lang} />;
      break;
    case 'caso':
      page = kase ? <CasePage c={kase} lang={lang} /> : <WorkPage t={t} lang={lang} />;
      break;
    default:
      page = <HomePage t={t} lang={lang} ready={ready} />;
  }

  return (
    <>
      <Curtain ready={ready} />
      <div className="wipe" ref={wipe} aria-hidden="true">
        <Mark size={44} dot="#0D0D0D" color="#FFFFFF" />
      </div>
      <Cursor />
      <Header t={t} route={route} menu={menu} setMenu={setMenu} />
      <main key={routeKey}>{page}</main>
      <Footer t={t} lang={lang} />
      <Chat lang={lang} page={route.page} routeKey={routeKey} />
    </>
  );
}

function Footer({ t, lang }: { t: Copy; lang: Lang }) {
  const p = pages[lang];
  return (
    <footer className="footer">
      <div className="container footer__inner">
        <div className="footer__brand">
          <Mark size={34} dot="#F4F1EA" />
          <div>
            <p className="footer__name">Ready2Digital</p>
            <p className="footer__tag">{t.footer.tagline}</p>
          </div>
        </div>
        <nav className="footer__nav" aria-label="Footer">
          {p.menu.items.map((m) => (
            <Link key={m.page} page={m.page} lang={lang}>
              {m.label}
            </Link>
          ))}
          <Link page="contatti" lang={lang}>
            {p.menu.contact}
          </Link>
        </nav>
        <div className="footer__links">
          <SocialLinks lang={lang} names />
          <Link page="privacy" lang={lang}>
            {t.footer.privacy}
          </Link>
          <button type="button" onClick={() => scrollTo(0)}>
            {t.footer.top} ↑
          </button>
        </div>
      </div>
      <div className="container footer__bottom">
        <p>
          © {new Date().getFullYear()} {COMPANY.name} · {COMPANY.address} · P.IVA {COMPANY.vat} · REA {COMPANY.rea} · PEC{' '}
          <a href={`mailto:${COMPANY.pec}`}>{COMPANY.pec}</a>. {t.footer.rights}
        </p>
      </div>
      <p className="footer__giant" aria-hidden="true">
        Ready2Digital
      </p>
    </footer>
  );
}

function Header({ t, route, menu, setMenu }: { t: Copy; route: Route; menu: boolean; setMenu: (b: boolean) => void }) {
  const ref = useRef<HTMLElement>(null);
  const lang = route.lang;
  const p = pages[lang];
  const [open, setOpen] = useState<Page | null>(null);
  const closeTimer = useRef<number>(0);
  const burger = useRef<HTMLButtonElement>(null);
  const menuOpen = useRef(menu);
  menuOpen.current = menu;

  useEffect(() => {
    let last = 0;
    const st = ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate: (s) => {
        const y = s.scroll();
        const d = y - last;
        // A clear movement decides, not the jitter of a finger or a rubber-band
        // bounce; while the page scrolls itself the header stays where it is.
        if (Math.abs(d) > 8 && performance.now() > autoScrollUntil) {
          ref.current?.classList.toggle('is-hidden', d > 0 && y > 300);
          last = y;
        } else if (Math.abs(d) > 8) last = y;
        if (y < 300) ref.current?.classList.remove('is-hidden');
        ref.current?.classList.toggle('is-solid', y > 60);
      },
    });
    return () => st.kill();
  }, []);
  useEffect(() => setOpen(null), [route]);
  // Quando si apre il menu dei progetti, i loghi dei clienti si compongono (vedi components/Logos.tsx).
  useEffect(() => {
    if (open !== 'progetti') return;
    document.querySelectorAll('.mega__case').forEach((el) => el.dispatchEvent(new Event('logo:play')));
  }, [open]);
  // Escape closes the mega panels and the phone menu (and hands the focus back to the burger).
  useEffect(() => {
    const esc = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      setOpen(null);
      if (menuOpen.current) {
        setMenu(false);
        burger.current?.focus();
      }
    };
    window.addEventListener('keydown', esc);
    return () => window.removeEventListener('keydown', esc);
  }, [setMenu]);
  // Turning the phone or tablet sideways can cross the breakpoint where the burger
  // disappears: the full-screen menu must not stay behind with no button to close it.
  useEffect(() => {
    const wide = window.matchMedia('(min-width: 1101px)');
    const close = () => wide.matches && setMenu(false);
    wide.addEventListener('change', close);
    return () => wide.removeEventListener('change', close);
  }, [setMenu]);

  const other: Lang = lang === 'it' ? 'en' : 'it';
  const active = route.page === 'caso' ? 'progetti' : route.page;
  const menuItems = [{ page: 'home' as Page, label: 'Home' }, ...p.menu.items, { page: 'contatti' as Page, label: p.menu.contact }];
  const hover =(pg: Page | null) => {
    window.clearTimeout(closeTimer.current);
    if (pg) setOpen(pg);
    else closeTimer.current = window.setTimeout(() => setOpen(null), 160);
  };
  const goService = (i: number) => {
    setOpen(null);
    if (route.page === 'soluzioni') {
      window.history.replaceState({}, '', `#${SERVICE_IDS[i]}`);
      window.dispatchEvent(new Event('r2d:hash'));
    } else navigate(`${pathFor('soluzioni', lang)}#${SERVICE_IDS[i]}`);
  };

  return (
    <>
      <header className={`header${menu ? ' is-menu' : ''}${open ? ' is-open' : ''}`} ref={ref} onPointerLeave={() => hover(null)}>
        <div className="container header__inner">
          <Link page="home" lang={lang} className="brand" aria-label="Ready2Digital">
            {/* The full logo (mark plus wordmark) on every screen size. */}
            <img className="brand__logo" src={`${import.meta.env.BASE_URL}images/logo_ready2digital_dark.png`} alt="Ready2Digital" width="993" height="192" />
          </Link>
          <nav className="nav" aria-label="Main">
            {p.menu.items.map((m) => {
              const drop = m.page === 'soluzioni' || m.page === 'progetti';
              return (
                <div key={m.page} className="nav__item" onPointerEnter={() => hover(drop ? m.page : null)}>
                  <Link page={m.page} lang={lang} className={active === m.page ? 'is-active' : undefined} aria-haspopup={drop || undefined} aria-expanded={drop ? open === m.page : undefined}>
                    {m.label}
                    {drop && <span className="nav__caret">▾</span>}
                  </Link>
                </div>
              );
            })}
          </nav>
          <div className="header__right">
            <Link page={route.page} slug={route.slug} lang={other} className="lang" aria-label={other === 'en' ? 'English' : 'Italiano'} hrefLang={other}>
              <span className={lang === 'it' ? 'on' : ''}>IT</span>
              <span className={lang === 'en' ? 'on' : ''}>EN</span>
            </Link>
            <Link page="contatti" lang={lang} className="btn btn--sm magnetic header__cta">
              {t.nav.cta}
            </Link>
            <button type="button" className="burger" ref={burger} aria-expanded={menu} aria-controls="menu" aria-label={menu ? t.nav.close : t.nav.menu} onClick={() => setMenu(!menu)}>
              <span />
              <span />
            </button>
          </div>
        </div>

        <div className={`mega${open === 'soluzioni' ? ' is-open' : ''}`} onPointerEnter={() => hover('soluzioni')}>
          <div className="container mega__inner">
            {p.menu.groups.map((g) => (
              <div key={g.t} className="mega__col">
                <p className="mega__k">{g.t}</p>
                {g.ids.map((i) => (
                  <a
                    key={i}
                    href={href(`${pathFor('soluzioni', lang)}#${SERVICE_IDS[i]}`)}
                    className="mega__link"
                    tabIndex={open === 'soluzioni' ? 0 : -1}
                    onClick={(e) => {
                      e.preventDefault();
                      goService(i);
                    }}
                  >
                    <strong>{t.services.items[i].t}</strong>
                    <span>{t.services.items[i].d}</span>
                  </a>
                ))}
              </div>
            ))}
            <Link page="soluzioni" lang={lang} className="mega__all" tabIndex={open === 'soluzioni' ? 0 : -1}>
              {p.menu.allSolutions} →
            </Link>
          </div>
        </div>
        <div className={`mega${open === 'progetti' ? ' is-open' : ''}`} onPointerEnter={() => hover('progetti')}>
          <div className="container mega__inner mega__inner--work">
            {cases[lang].map((c) => (
              <Link key={c.slug} page="caso" slug={c.slug} lang={lang} className="mega__case" tabIndex={open === 'progetti' ? 0 : -1} data-logo-host>
                <span className={`mega__logo${hasLogo(c.client) ? ' mega__logo--live' : ''}`}>{hasLogo(c.client) ? <ClientLogo client={c.client} /> : c.logo ? <img src={`${import.meta.env.BASE_URL}${c.logo}`} alt="" /> : c.client[0]}</span>
                <strong>{c.client}</strong>
                <span>{c.sector}</span>
              </Link>
            ))}
            <div className="mega__aside">
              <p>{p.menu.workBlurb}</p>
              <Link page="progetti" lang={lang} className="mega__all" tabIndex={open === 'progetti' ? 0 : -1}>
                {p.menu.allWork} →
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* `inert` while closed: hidden from screen readers and out of the tab order, no tabIndex juggling. */}
      <div id="menu" className={`menu${menu ? ' is-open' : ''}`} inert={!menu} data-lenis-prevent>
        <nav className="container menu__nav" aria-label="Menu">
          {menuItems.map((n, i) => (
            <div key={n.page}>
              {/* onClick: tapping the page you are already on does not change the route, so the menu would stay open. */}
              <Link
                page={n.page}
                lang={lang}
                onClick={() => setMenu(false)}
                aria-current={active === n.page ? 'page' : undefined}
                style={{ transitionDelay: menu ? `${0.08 + i * 0.05}s` : '0s' }}
                className={active === n.page ? 'is-active' : undefined}
              >
                <small>{String(i + 1).padStart(2, '0')}</small>
                {n.label}
              </Link>
            </div>
          ))}
        </nav>
        {/* The header's "Parliamone" button is hidden on phones: it lives here instead, with the LinkedIn links. */}
        <div className="container menu__foot" style={{ transitionDelay: menu ? `${0.08 + menuItems.length * 0.05}s` : '0s' }}>
          <Link page="contatti" lang={lang} onClick={() => setMenu(false)} className="btn btn--big menu__cta">
            {t.nav.cta}
            <span className="btn__arrow">→</span>
          </Link>
          <SocialLinks lang={lang} names />
        </div>
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
