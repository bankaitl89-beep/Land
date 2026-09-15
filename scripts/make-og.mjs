// Renders the share cards in public/og-<lang>.png, at 1200x630, in the page's
// own type and colours. Run by hand after the headline, the price or the
// palette changes — the PNGs are committed, so nothing here runs at build or
// at request time and the project keeps its zero runtime dependencies:
//
//   npm run build && npx next start -p 3000 &
//   npx playwright@latest ... node scripts/make-og.mjs
//
// It loads the running site first so the @font-face URLs resolve against a
// real origin; served from about:blank they are blocked and the card silently
// falls back to a system serif.
import { chromium } from "playwright";
import { writeFileSync } from "node:fs";

const COPY = {
  en: { line: ["Learn to hand AI", "the work you are still", "doing by hand."], tag: "Six parts · homework on your own work · reviewed by a teacher" },
  es: { line: ["Aprenda a pasarle a la IA", "el trabajo que sigue", "haciendo a mano."], tag: "Seis partes · tareas sobre su trabajo · corregidas por una profesora" },
  ru: { line: ["Научитесь поручать ИИ", "то, что вы до сих пор", "делаете руками."], tag: "Шесть частей · задания на вашей работе · разбор преподавателем" },
};

const page = (c) => `<!doctype html><meta charset=utf8>
<style>
@font-face{font-family:Unbounded;src:url(/fonts/unbounded-600-800-latin.woff2) format("woff2");font-weight:600 800;unicode-range:U+0000-00FF,U+0131,U+0152-0153,U+2000-206F,U+20AC,U+2122,U+2212}
@font-face{font-family:Unbounded;src:url(/fonts/unbounded-600-800-cyrillic.woff2) format("woff2");font-weight:600 800;unicode-range:U+0301,U+0400-045F,U+0490-0491,U+04B0-04B1,U+2116}
@font-face{font-family:Manrope;src:url(/fonts/manrope-400-700-latin.woff2) format("woff2");font-weight:400 700;unicode-range:U+0000-00FF,U+0131,U+0152-0153,U+2000-206F,U+20AC,U+2122,U+2212}
@font-face{font-family:Manrope;src:url(/fonts/manrope-400-700-cyrillic.woff2) format("woff2");font-weight:400 700;unicode-range:U+0301,U+0400-045F,U+0490-0491,U+04B0-04B1,U+2116}
*{margin:0;box-sizing:border-box}
body{width:1200px;height:630px;background:
  radial-gradient(70% 90% at 88% 10%, rgba(143,176,232,.10), transparent 60%),
  radial-gradient(70% 100% at 4% 104%, rgba(255,106,61,.16), transparent 62%),
  linear-gradient(180deg,#0a0c12,#06070b);
  color:#f1f2f5;font-family:Manrope,sans-serif;display:flex;flex-direction:column;
  justify-content:space-between;padding:64px 70px;position:relative;overflow:hidden}
.top{display:flex;align-items:center;gap:14px}
.wm{font-family:Unbounded;font-weight:800;font-size:27px;letter-spacing:-.03em}
h1{font-family:Unbounded;font-weight:700;font-size:58px;line-height:1.16;letter-spacing:-.045em}
h1 em{font-style:normal;color:#ff6a3d}
.bot{display:flex;align-items:flex-end;justify-content:space-between;gap:30px}
.tag{font-size:21px;line-height:1.5;color:#a3a9b4;max-width:34ch}
.price{display:flex;align-items:baseline;gap:14px;flex:none}
.now{font-family:Unbounded;font-weight:800;font-size:60px;letter-spacing:-.045em;line-height:1}
.was{font-family:Unbounded;font-weight:600;font-size:27px;color:#a8aeb9;text-decoration:line-through;text-decoration-color:#ff6a3d}
svg{width:46px;height:46px;flex:none}
</style>
<div class=top>
  <svg viewBox="0 0 26 26" fill="none">
    <g stroke="#8FB0E8" stroke-width="1.5" stroke-linecap="round" opacity=".85">
      <path d="M8.4 5.6 13.4 5.6"/><path d="M13.4 5.6 18.6 9.6"/>
      <path d="M18.6 9.6 13.4 13.6"/><path d="M13.4 13.6 8.4 13.6"/>
    </g>
    <g fill="#8FB0E8"><circle cx="13.4" cy="5.6" r="2.2"/><circle cx="18.6" cy="9.6" r="2.2"/><circle cx="13.4" cy="13.6" r="2.2"/></g>
    <rect x="5.6" y="4" width="3.2" height="18" rx="1.1" fill="#FF6A3D"/>
  </svg>
  <span class=wm>Prompta aut perire</span>
</div>
<h1>${c.line[0]}<br>${c.line[1]}<br><em>${c.line[2]}</em></h1>
<div class=bot>
  <div class=tag>${c.tag}</div>
  <div class=price><span class=was>$299</span><span class=now>$150</span></div>
</div>`;

const b = await chromium.launch(
  process.env.CHROME ? { executablePath: process.env.CHROME } : {},
);
for (const [lang, c] of Object.entries(COPY)) {
  const p = await b.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
  // load from the site's own origin, or the @font-face URLs never resolve
  await p.goto("http://localhost:3000/" + lang, { waitUntil: "networkidle" });
  await p.setContent(page(c), { waitUntil: "networkidle" });
  await p.evaluate(() => document.fonts.ready);
  await p.waitForTimeout(600);
  const buf = await p.screenshot({ type: "png" });
  writeFileSync(`public/og-${lang}.png`, buf);
  console.log(`og-${lang}.png`, (buf.length / 1024).toFixed(0) + "KB");
  await p.close();
}
await b.close();
