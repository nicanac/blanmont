#!/usr/bin/env node
/**
 * Renders docs/manuel/src/manuel.html to docs/manuel/Manuel-back-office-Blanmont.pdf.
 *
 * Two passes, because Chromium has no target-counter(): pass 1 prints the PDF with an invisible
 * probe text "@@p:<id>@@" at every anchor, pdftotext (poppler) finds the page of each probe,
 * pass 2 writes those page numbers into every element carrying data-page-of="<id>" and prints again.
 * Probes are absolutely positioned, so filling the numbers in never moves the layout.
 *
 * Usage: node docs/manuel/scripts/render.mjs   (needs Playwright's Chromium and poppler-utils)
 */
import { chromium } from 'playwright';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import http from 'node:http';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Options: --only 10,11 (render only the parts whose file name starts with these prefixes)
//          --out <file.pdf> (default: docs/manuel/Manuel-back-office-Blanmont.pdf)
const arg = (name) => {
  const i = process.argv.indexOf(name);
  return i > 0 ? process.argv[i + 1] : undefined;
};
const only = arg('--only')?.split(',');
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const src = path.join(root, 'src', only ? `manuel-${only.join('-')}.html` : 'manuel.html');
const out = path.resolve(arg('--out') ?? path.join(root, 'Manuel-back-office-Blanmont.pdf'));

// Assemble the HTML from the template and the chapters in src/parts (file-name order).
const partsDir = path.join(root, 'src', 'parts');
const parts = readdirSync(partsDir)
  .filter((f) => f.endsWith('.html'))
  .filter((f) => !only || only.some((p) => f.startsWith(p)))
  .sort();
const template = readFileSync(path.join(root, 'src', 'template.html'), 'utf8');
writeFileSync(
  src,
  template.replace('<!-- @parts -->', parts.map((f) => `<!-- ${f} -->\n` + readFileSync(path.join(partsDir, f), 'utf8')).join('\n'))
);

// Served over http, not file://: Chromium refuses CSS mask images (the territory layers) from file URLs.
const repo = path.resolve(root, '..', '..');
const types = { '.html': 'text/html', '.css': 'text/css', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.jpg': 'image/jpeg', '.png': 'image/png' };
const server = http.createServer((req, res) => {
  const file = path.join(repo, decodeURIComponent(new URL(req.url, 'http://x').pathname));
  if (!file.startsWith(repo) || !existsSync(file)) {
    res.writeHead(404).end();
    return;
  }
  res.writeHead(200, { 'content-type': types[path.extname(file)] ?? 'application/octet-stream' });
  res.end(readFileSync(file));
});
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const url = `http://127.0.0.1:${server.address().port}/${path.relative(repo, src)}`;

const browser = await chromium.launch();
// deviceScaleFactor 2: the map bands are rasterised below at twice the printed size.
const page = await browser.newPage({ deviceScaleFactor: 2 });
await page.goto(url, { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);

// A chapter opener is a page of its own (named page `opener`, no top margin). When its introduction
// is longer than that page, move the overflowing blocks after the opener so they flow on normal pages
// (with margins and running header) instead of on a margin-less continuation page.
// Measured at the printed page width: 210 mm = 794 px; usable height 297 − 20 mm = 277 mm ≈ 1047 px.
await page.setViewportSize({ width: 794, height: 1123 });
await page.emulateMedia({ media: 'print' });
// The territory map is ten SVG masks; printed as vectors it weighs ~0.8 MB per chapter opener.
// Replace every map frame by a JPEG of itself (2x, after the layout is at print width).
await page.evaluate(() => document.fonts.ready);
const frames = await page.locator('.carte-frame').all();
for (const frame of frames) {
  const jpeg = await frame.screenshot({ type: 'jpeg', quality: 72 });
  await frame.evaluate((el, src) => {
    el.innerHTML = `<img src="${src}" alt="" style="display:block;width:100%;height:100%">`;
  }, 'data:image/jpeg;base64,' + jpeg.toString('base64'));
}

const moved = await page.evaluate(() => {
  const limit = (277 * 96) / 25.4 - 8;
  let count = 0;
  document.querySelectorAll('section.opener').forEach((opener) => {
    const body = opener.querySelector('.opener-body');
    if (!body) return;
    const rest = document.createElement('div');
    rest.className = 'opener-rest';
    while (opener.getBoundingClientRect().height > limit && body.lastElementChild) {
      rest.prepend(body.lastElementChild);
      count++;
    }
    if (rest.childElementCount) opener.after(rest);
  });
  return count;
});
if (moved) console.log(`Moved ${moved} block(s) from chapter openers to the following page.`);

// Chromium has no string-set(): give each chapter its own named page whose top-right margin box
// prints the chapter title. <article class="chapter" data-chapter="4 · Le sondage du week-end">.
await page.evaluate(() => {
  const css = [];
  document.querySelectorAll('article.chapter').forEach((el, i) => {
    const name = `chap${i + 1}`;
    el.style.page = name;
    const title = (el.dataset.chapter ?? '').replace(/["\\]/g, '');
    css.push(`@page ${name} { @top-right { content: "${title}"; } }`);
  });
  const style = document.createElement('style');
  style.textContent = css.join('\n');
  document.head.appendChild(style);
});

// Every element with an id that something points to gets a probe.
await page.evaluate(() => {
  const ids = new Set([...document.querySelectorAll('[data-page-of]')].map((el) => el.dataset.pageOf));
  for (const id of ids) {
    const target = document.getElementById(id);
    if (!target) {
      console.warn('missing anchor', id);
      continue;
    }
    const probe = document.createElement('span');
    probe.className = 'probe';
    probe.textContent = `@@p:${id}@@`;
    // An opener starts at the very top of a margin-less page, where a probe would be clipped:
    // put it in the chapter title instead.
    const host = target.matches('section.opener') ? (target.querySelector('.opener-title') ?? target) : target;
    // The probe sits at the top-left corner of its host, inside the host's box (a glyph above the
    // box would be clipped when the host starts a page): make the host its containing block.
    if (getComputedStyle(host).position === 'static') host.style.position = 'relative';
    host.prepend(probe);
  }
});

const pdfOptions = { preferCSSPageSize: true, printBackground: true, tagged: true, outline: true };

const tmp = mkdtempSync(path.join(tmpdir(), 'manuel-'));
const pass1 = path.join(tmp, 'pass1.pdf');
await page.pdf({ ...pdfOptions, path: pass1 });

// pdftotext separates pages with a form feed.
const text = execFileSync('pdftotext', ['-raw', pass1, '-'], { maxBuffer: 64 * 1024 * 1024 }).toString();
const pages = text.split('\f');
const pageOf = {};
pages.forEach((content, i) => {
  // Case-insensitive: a probe inside an upper-case heading may still be extracted in capitals.
  for (const m of content.matchAll(/@@p:([\w-]+)@@/gi)) {
    const id = m[1].toLowerCase();
    if (!(id in pageOf)) pageOf[id] = i + 1;
  }
});

const missing = await page.evaluate((map) => {
  const lost = [];
  for (const el of document.querySelectorAll('[data-page-of]')) {
    const n = map[el.dataset.pageOf.toLowerCase()];
    if (n) el.textContent = String(n);
    else lost.push(el.dataset.pageOf);
  }
  document.querySelectorAll('.probe').forEach((p) => p.remove());
  return [...new Set(lost)];
}, pageOf);
if (missing.length) console.warn('No page found for:', missing.join(', '));

await page.pdf({ ...pdfOptions, path: out });
await browser.close();
server.close();
if (!process.env.KEEP_PASS1) rmSync(tmp, { recursive: true, force: true }); else console.log("pass1:", pass1);

const info = execFileSync('pdfinfo', [out]).toString();
console.log(out);
console.log(info.split('\n').filter((l) => /^(Pages|File size)/.test(l)).join('\n'));
