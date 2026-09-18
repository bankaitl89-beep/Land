// Builds the hand-off: one folder to upload to the tracker, one folder to
// upload to a PHP host, a how-to, and the sources. Produces dist/ and
// prompta-landing.zip.
//
//   npm run static
//
// The landing is a single self-contained page — everything inlined except the
// fonts, the icon, the share cards, and config.js. That last one is the point:
// whoever deploys this changes the receiver's URL by editing one line, with no
// Node and no repository.
import { execSync } from "node:child_process";
import {
  readFileSync,
  writeFileSync,
  renameSync,
  existsSync,
  mkdirSync,
  cpSync,
  rmSync,
  statSync,
} from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const out = join(root, "out");
const dist = join(root, "dist");
const front = join(dist, "frontend");
const back = join(dist, "backend");

// The API route and the middleware are Node; neither survives a static export,
// and the landing does not need them — the receiver is a separate file now.
const parked = [
  [join(root, "app/api"), join(root, ".api-parked")],
  [join(root, "middleware.ts"), join(root, ".middleware-parked")],
];
for (const [from, to] of parked) if (existsSync(from)) renameSync(from, to);
try {
  rmSync(out, { recursive: true, force: true });
  execSync("next build", {
    stdio: "inherit",
    // PREVIEW=1 switches the language in the page instead of navigating, which
    // is what lets three languages live in one file.
    env: { ...process.env, NEXT_EXPORT: "1", NEXT_PUBLIC_PREVIEW: "1" },
  });
} finally {
  for (const [from, to] of parked) if (existsSync(to)) renameSync(to, from);
}

rmSync(dist, { recursive: true, force: true });
mkdirSync(front, { recursive: true });
mkdirSync(back, { recursive: true });

const asset = (src) =>
  readFileSync(join(out, decodeURIComponent(src.replace(/^\.?\//, ""))), "utf8");

let html = readFileSync(join(out, "en.html"), "utf8");

// --- inline the stylesheet and the scripts -------------------------------
html = html.replace(
  /<link[^>]+rel="stylesheet"[^>]+href="(\.\/_next\/[^"]+)"[^>]*\/?>/g,
  (_m, href) => `<style>${asset(href)}</style>`,
);
html = html.replace(
  /<script([^>]*)src="(\.\/_next\/[^"]+)"([^>]*)><\/script>/g,
  (_m, pre, src, post) =>
    `<script${`${pre} ${post}`.includes("async") ? " async" : ""}>${asset(src)}</script>`,
);
html = html.replace(/<link[^>]+rel="preload"[^>]+\.\/_next\/[^>]*\/?>/g, "");
// React's payload still names the stylesheet it would fetch; it is inlined.
html = html.replace(/\.\/_next\/static\/css\/[a-z0-9]+\.css/g, "data:text/css,");

// --- point the remaining files at the page's own folder ------------------
// so the landing works from any subdirectory a tracker puts it in
html = html.replaceAll("url(/fonts/", "url(fonts/");
html = html.replace(/\/icon\.svg(\?[a-z0-9]+)?/g, "icon.svg");
html = html.replace(/(?:https?:\/\/[^"']*)?\/og-(en|es|ru)\.png/g, "og-$1.png");

// --- config.js, loaded before the app ------------------------------------
html = html.replace(/<\/head>/i, '<script src="config.js"></script></head>');

html = html.replace(/�/g, "\\uFFFD");
writeFileSync(join(front, "index.html"), html);

const endpoint =
  process.env.NEXT_PUBLIC_LEAD_ENDPOINT || "https://ВАШ-ДОМЕН/lead.php";
writeFileSync(
  join(front, "config.js"),
  `// Куда форма отправляет заявку. Это единственное, что нужно поменять здесь.\n` +
    `// Адрес того самого lead.php из папки backend.\n` +
    `window.LEAD_ENDPOINT = ${JSON.stringify(endpoint)};\n`,
);

cpSync(join(root, "public/fonts"), join(front, "fonts"), { recursive: true });
cpSync(join(root, "app/icon.svg"), join(front, "icon.svg"));
for (const lang of ["en", "de", "es", "ru"]) {
  cpSync(join(root, `public/og-${lang}.png`), join(front, `og-${lang}.png`));
}

cpSync(join(root, "deploy"), back, {
  recursive: true,
  filter: (src) => !/lead\.config\.php$|leads\.log/.test(src),
});

// --- the sources, minus everything a build makes -------------------------
execSync(`git archive --format=tar HEAD | (cd ${JSON.stringify(dist)} && mkdir -p source && tar -x -C source)`);

cpSync(join(root, "DEPLOY.md"), join(dist, "DEPLOY.md"));

const zip = join(root, "prompta-landing.zip");
rmSync(zip, { force: true });
execSync(`cd ${JSON.stringify(dist)} && zip -qr ${JSON.stringify(zip)} .`);

const kb = (p) => (statSync(p).size / 1024).toFixed(0);
console.log(`\n  dist/frontend/index.html  ${kb(join(front, "index.html"))}KB`);
console.log(`  prompta-landing.zip       ${kb(zip)}KB`);
console.log(`  форма отправляет на:      ${endpoint}\n`);
