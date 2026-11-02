// Social preview images (1200×630) for public/images/og/.
//
// Not part of `npm run build`: the images change when the headlines do, not on every
// deploy, and the build shouldn't need a browser. Re-run by hand after editing the
// cards below:
//
//   node scripts/og-images.mjs        (needs Playwright with Chromium installed)
//
// Fonts and the mark come from the repo itself, so the result matches the site.

import { createRequire } from 'node:module';
import { mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const { chromium } = createRequire(import.meta.url)('playwright');

const root = resolve(import.meta.dirname, '..');
const out = join(root, 'public/images/og');
const font = (pkg, file) => pathToFileURL(join(root, 'node_modules', pkg, 'files', file)).href;
const mark = readFileSync(join(root, 'public/favicon.svg'), 'utf8');

const CARDS = [
  {
    file: 'ready2digital.jpg',
    kicker: 'Agenzia digitale · Roma',
    lines: ['Automazioni,', 'agenti AI e software', 'su misura.'],
    size: 84,
    accent: 1,
    foot: 'CRM · ERP · App · Integrazioni',
  },
  {
    file: 'agenti-ai.jpg',
    kicker: 'Agenti AI e automazioni',
    lines: ['Dove ci sono dati,', 'un agente lavora.'],
    size: 92,
    accent: 1,
    foot: 'Vendita · Assistenza · Analisi dati · CRM',
  },
];

const html = (c) => `<!doctype html><meta charset="utf-8"><style>
@font-face{font-family:B;font-weight:800;src:url(${font('@fontsource/barlow-condensed', 'barlow-condensed-latin-800-normal.woff2')})}
@font-face{font-family:B;font-weight:700;src:url(${font('@fontsource/barlow-condensed', 'barlow-condensed-latin-700-normal.woff2')})}
@font-face{font-family:M;src:url(${font('@fontsource-variable/jetbrains-mono', 'jetbrains-mono-latin-wght-normal.woff2')})}
@font-face{font-family:I;src:url(${font('@fontsource-variable/inter', 'inter-latin-wght-normal.woff2')})}
*{box-sizing:border-box;margin:0}
body{width:1200px;height:630px;overflow:hidden;background:radial-gradient(70% 90% at 88% 25%,#2a1a0f 0%,#0d0d0d 62%);color:#f4f1ea;font-family:I;position:relative}
.k{position:absolute;left:72px;top:72px;font:500 20px M;letter-spacing:.14em;text-transform:uppercase;color:#ff6000;display:flex;align-items:center;gap:16px}
.k i{width:12px;height:12px;border-radius:50%;background:#ff6000}
h1{position:absolute;left:72px;top:150px;width:720px;font:800 ${c.size}px/0.92 B;text-transform:uppercase;letter-spacing:-.01em}
h1 span{display:block}
h1 .a{color:#ff6000}
.m{position:absolute;right:64px;top:110px;width:340px;height:340px}
.m svg{width:100%;height:100%;overflow:visible}
.f{position:absolute;left:72px;bottom:64px;right:72px;display:flex;justify-content:space-between;align-items:flex-end}
.w{font:800 40px B;text-transform:uppercase;letter-spacing:.02em}
.w b{color:#ff6000;font-weight:800}
.t{font:400 18px M;letter-spacing:.06em;text-transform:uppercase;color:rgba(244,241,234,.6)}
</style>
<div class="k"><i></i>${c.kicker}</div>
<h1>${c.lines.map((l, i) => `<span class="${i === c.accent ? 'a' : ''}">${l}</span>`).join('')}</h1>
<div class="m">${mark}</div>
<div class="f"><div class="w">Ready<b>2</b>Digital</div><div class="t">${c.foot}</div></div>`;

mkdirSync(out, { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
const tmp = join(root, 'node_modules/.og-card.html');
for (const c of CARDS) {
  writeFileSync(tmp, html(c));
  await page.goto(pathToFileURL(tmp).href);
  await page.evaluate(() => document.fonts.ready);
  const file = join(out, c.file);
  await page.screenshot({ path: file, type: 'jpeg', quality: 86 });
  console.log(c.file, Math.round(statSync(file).size / 1024), 'kB');
}
await browser.close();
