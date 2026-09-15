// Builds self-contained HTML files of the landing page, one per language,
// for design review in an Artifact. The API route and middleware are left
// out, so the form is inert and "/" does no language redirect here — the
// production build on a server keeps both.
import { execSync } from "node:child_process";
import {
  readFileSync,
  writeFileSync,
  renameSync,
  existsSync,
  mkdirSync,
  cpSync,
  rmSync,
} from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const LANGS = ["en", "es", "ru"];
const PREVIEW_LANGS = ["en"];

// Preview file names: English is the entry page, the others sit beside it.
const fileFor = (lang) => (lang === "en" ? "index.html" : `${lang}.html`);

const parked = [
  [join(root, "app/api"), join(root, ".api-parked")],
  [join(root, "middleware.ts"), join(root, ".middleware-parked")],
];

for (const [from, to] of parked) if (existsSync(from)) renameSync(from, to);
try {
  rmSync(join(root, "out"), { recursive: true, force: true });
  execSync("next build", {
    stdio: "inherit",
    env: { ...process.env, NEXT_EXPORT: "1", NEXT_PUBLIC_PREVIEW: "1" },
  });
} finally {
  for (const [from, to] of parked) if (existsSync(to)) renameSync(to, from);
}

const outDir = join(root, "out");
const previewDir = join(root, "preview");
rmSync(previewDir, { recursive: true, force: true });
mkdirSync(previewDir, { recursive: true });

// Chunk URLs are percent-encoded (the [lang] segment); the files are not.
const asset = (src) =>
  readFileSync(join(outDir, decodeURIComponent(src.replace(/^\.?\//, ""))), "utf8");

for (const lang of PREVIEW_LANGS) {
  let html = readFileSync(join(outDir, `${lang}.html`), "utf8");

  html = html.replace(
    /<link[^>]+rel="stylesheet"[^>]+href="(\.\/_next\/[^"]+)"[^>]*\/?>/g,
    (_m, href) => `<style>${asset(href)}</style>`,
  );

  html = html.replace(
    /<script([^>]*)src="(\.\/_next\/[^"]+)"([^>]*)><\/script>/g,
    (_m, pre, src, post) => {
      const attrs = `${pre} ${post}`.includes("async") ? " async" : "";
      return `<script${attrs}>${asset(src)}</script>`;
    },
  );

  // preload hints point at files that are now inlined
  html = html.replace(/<link[^>]+rel="preload"[^>]+\.\/_next\/[^>]*\/?>/g, "");

  // The Artifact host serves no root-relative paths, so the self-hosted
  // fonts are addressed relative to the page instead of from the site root.
  // The files themselves are copied next to the page below and published
  // alongside it — without them the page falls back to system faces and the
  // review shows type the real site never uses.
  html = html.replaceAll("url(/fonts/", "url(fonts/");

  // The stylesheet is inlined above, but React's own payload still lists it
  // and re-requests it at runtime. Point that copy at an empty inline sheet
  // so the page does not chase a file that is not there.
  html = html.replace(
    /\.\/_next\/static\/css\/[a-z0-9]+\.css/g,
    "data:text/css,",
  );

  // The favicon is served from the site root, which the Artifact host has no
  // concept of; the artifact carries its own. React injects it from its own
  // payload rather than from a <link> in the markup, so the path is replaced
  // wherever it appears.
  html = html.replace(/<link[^>]+rel="icon"[^>]*\/?>/g, "");
  html = html.replace(
    /\/icon\.svg(\?[a-z0-9]+)?/g,
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'/%3E",
  );

  // The host supplies <!doctype>/<html>/<head>/<body>; ship a fragment.
  const head = html.match(/<head[^>]*>([\s\S]*?)<\/head>/)?.[1] ?? "";
  const body = html.match(/<body[^>]*>([\s\S]*?)<\/body>/)?.[1] ?? "";

  // The title has to lead: only the first 8KB of the file is scanned for it,
  // and the inlined stylesheet alone is bigger than that.
  const fragment = `<title>Prompta Aut Perire</title>\n${head}\n${body}`
    .replace(/<meta charSet="[^"]*"\/?>/gi, "")
    .replace(/<meta name="viewport"[^>]*\/?>/gi, "")
    .replace(/<title>[\s\S]*?<\/title>/i, "<title>Prompta Aut Perire</title>")
    .replace(/(<title>Prompta Aut Perire<\/title>[\s\S]*?)<title>[\s\S]*?<\/title>/i, "$1")
    // Next's minified URI decoder carries literal U+FFFD inside JS string
    // literals; write them as escapes so the file stays clean UTF-8.
    .replace(/�/g, "\\uFFFD");

  const dest = join(previewDir, fileFor(lang));
  writeFileSync(dest, fragment);
  console.log(`preview: ${fileFor(lang)} (${(fragment.length / 1024).toFixed(0)} KB)`);
}

cpSync(join(root, "public/fonts"), join(previewDir, "fonts"), { recursive: true });
console.log("preview: fonts copied next to the page");
