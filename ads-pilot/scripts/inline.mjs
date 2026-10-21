// Inline built JS and CSS into index.html so the static preview is a single file.
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const dir = process.argv[2];
const file = join(dir, 'index.html');
let html = readFileSync(file, 'utf8');

html = html.replace(/<script type="module" crossorigin src="\.\/([^"]+)"><\/script>/g, (_, src) => {
  const js = readFileSync(join(dir, src), 'utf8').replace(/<\/script/gi, '<\\/script');
  return `<script type="module">${js}</script>`;
});
html = html.replace(/<link rel="stylesheet" crossorigin href="\.\/([^"]+)">/g, (_, href) => `<style>${readFileSync(join(dir, href), 'utf8')}</style>`);

if (/src="\.\/assets|href="\.\/assets/.test(html)) throw new Error('Some assets were not inlined');
writeFileSync(join(dir, 'ads-pilot-preview.html'), html);
console.log(`Inlined → ${join(dir, 'ads-pilot-preview.html')} (${Math.round(html.length / 1024)} KB)`);
