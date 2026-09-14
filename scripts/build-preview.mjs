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
  rmSync,
} from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const LANGS = ["en", "es", "ru"];

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
    env: { ...process.env, NEXT_EXPORT: "1" },
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

for (const lang of LANGS) {
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

  // The Artifact host serves no root-relative paths, so the language switch
  // points at sibling files instead of the production "/en" style routes.
  for (const l of LANGS) {
    html = html.replaceAll(`href="/${l}"`, `href="./${fileFor(l)}"`);
  }

  // The host supplies <!doctype>/<html>/<head>/<body>; ship a fragment.
  const head = html.match(/<head[^>]*>([\s\S]*?)<\/head>/)?.[1] ?? "";
  const body = html.match(/<body[^>]*>([\s\S]*?)<\/body>/)?.[1] ?? "";

  const fragment = `${head}\n${body}`
    .replace(/<meta charSet="[^"]*"\/?>/gi, "")
    .replace(/<meta name="viewport"[^>]*\/?>/gi, "")
    .replace(/<title>[\s\S]*?<\/title>/i, "<title>Prompta Aut Perire</title>")
    // Next's minified URI decoder carries literal U+FFFD inside JS string
    // literals; write them as escapes so the file stays clean UTF-8.
    .replace(/�/g, "\\uFFFD");

  const dest = join(previewDir, fileFor(lang));
  writeFileSync(dest, fragment);
  console.log(`preview: ${fileFor(lang)} (${(fragment.length / 1024).toFixed(0)} KB)`);
}
