// Builds a single self-contained HTML file of the landing page.
// Used for design review only — the API route is excluded, so the form
// is inert in the preview. Production still ships the server build.
import { execSync } from "node:child_process";
import { readFileSync, writeFileSync, renameSync, existsSync, mkdirSync, rmSync } from "node:fs";
import { join, dirname } from "node:path";

const root = process.cwd();
const api = join(root, "app/api");
const parked = join(root, ".api-parked");

if (existsSync(api)) renameSync(api, parked);
try {
  rmSync(join(root, "out"), { recursive: true, force: true });
  execSync("next build", { stdio: "inherit", env: { ...process.env, NEXT_EXPORT: "1" } });
} finally {
  if (existsSync(parked)) renameSync(parked, api);
}

const outDir = join(root, "out");
let html = readFileSync(join(outDir, "index.html"), "utf8");

const asset = (src) => readFileSync(join(outDir, src.replace(/^\.?\//, "")), "utf8");

// inline stylesheets
html = html.replace(
  /<link[^>]+rel="stylesheet"[^>]+href="(\.\/_next\/[^"]+)"[^>]*\/?>/g,
  (_m, href) => `<style>${asset(href)}</style>`
);

// inline scripts, keeping document order
html = html.replace(
  /<script([^>]*)src="(\.\/_next\/[^"]+)"([^>]*)><\/script>/g,
  (_m, pre, src, post) => {
    const attrs = `${pre} ${post}`.includes("async") ? " async" : "";
    return `<script${attrs}>${asset(src)}</script>`;
  }
);

// drop preload hints that point at files we just inlined
html = html.replace(/<link[^>]+rel="preload"[^>]+\.\/_next\/[^>]*\/?>/g, "");

// The Artifact host supplies its own <!doctype>/<html>/<head>/<body>, so the
// preview ships as a fragment: everything the exported <head> and <body> held.
const head = html.match(/<head[^>]*>([\s\S]*?)<\/head>/)?.[1] ?? "";
const body = html.match(/<body[^>]*>([\s\S]*?)<\/body>/)?.[1] ?? "";

let fragment = `${head}\n${body}`
  .replace(/<meta charSet="[^"]*"\/?>/gi, "")
  .replace(/<meta name="viewport"[^>]*\/?>/gi, "")
  .replace(/<title>[\s\S]*?<\/title>/i, "<title>Prompta Aut Perire</title>")
  // Next's minified URI decoder carries literal U+FFFD inside JS string
  // literals; write them as escapes so the file stays clean UTF-8.
  .replace(/\uFFFD/g, "\\uFFFD");

const dest = join(root, "preview/index.html");
mkdirSync(dirname(dest), { recursive: true });
writeFileSync(dest, fragment);
console.log(`preview written: ${dest} (${(fragment.length / 1024).toFixed(0)} KB)`);
