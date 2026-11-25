#!/usr/bin/env node
// Builds every app icon from one source: the Heart Line drawn as a single stroke
// (stub → heart contour → pulse across the shoulders → stub), constructed geometry,
// route red on map paper. Run: `node scripts/build-app-icons.mjs` (needs `sharp`, already a Next dependency).
//
// Outputs
//   app/favicon.ico                      16/32/48 px, favicon cut (no stubs, stroke weighted per size)
//   app/icon.svg                         vector favicon cut (Next emits <link rel="icon" type="image/svg+xml">)
//   app/apple-icon.png                   180 px sheet tile (iOS home screen, opaque)
//   public/icons/icon-192.png|512.png    sheet tile, manifest purpose "any"
//   public/icons/icon-maskable-512.png   full-bleed paper, mark inside the 80% safe zone
//   design-system/assets/Logos/heart-line-app-icon.svg   master tile (vector)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

// Inks from design-system/tokens.json.
const RED = '#e03e3e'; // brand-vif: the Heart Line is always brand-vif
const INK = '#16181b';
const PAPER = '#fbfbf8';
const NEATLINE = '#c9ccc4';

// 256 grid. Heart: two r=52 lobes centred (82,98) and (174,98), tangents meeting at (128,214);
// shoulders (outer tangent points) at y=135.56, which is also the pulse baseline.
const LOOP =
  'A52 52 0 1 1 128 73.75 A52 52 0 1 1 209.96 135.56 L128 214 L46.04 135.56 ' +
  'H90 L104 116 L122 170 L140 102 L154 135.56';
const withStubs = `M16 135.56 H46.04 ${LOOP} H240`;
const favCut = `M46.04 135.56 ${LOOP} H209.96`;

const stroke = (d, w) =>
  `<path d="${d}" fill="none" stroke="${RED}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;

/** Favicon cut: no stubs, tight viewBox so the heart fills the tab. */
const faviconSvg = (w) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="10 28 236 236">${stroke(favCut, w)}</svg>`;

/**
 * Sheet tile: map paper, hairline neatline and corner ticks (inset 28 so an iOS/Android
 * corner mask never clips the ticks), mark with stubs centred inside.
 */
const tileSvg = ({ frame = true, scale = 0.62 } = {}) => {
  const i = 28.5;
  const o = 256 - i;
  const t = 14; // corner tick length
  const ticks = [
    [i, i, 1, 1],
    [o, i, -1, 1],
    [i, o, 1, -1],
    [o, o, -1, -1],
  ]
    .map(([x, y, dx, dy]) => `<path d="M${x} ${y + dy * t}V${y}H${x + dx * t}" fill="none" stroke="${INK}" stroke-width="3"/>`)
    .join('');
  const neat = frame
    ? `<rect x="${i}" y="${i}" width="${o - i}" height="${o - i}" fill="none" stroke="${NEATLINE}" stroke-width="1.5"/>${ticks}`
    : '';
  // Mark centred on the heart's optical centre (128,140), not the canvas centre.
  const mark = `<g transform="translate(128 128) scale(${scale}) translate(-128 -140)">${stroke(withStubs, 20)}</g>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"><title>CC Saint-Martin Blanmont — Heart Line</title><rect width="256" height="256" fill="${PAPER}"/>${neat}${mark}</svg>`;
};

const render = (svg, size, { opaque = false } = {}) => {
  let img = sharp(Buffer.from(svg), { density: 600 }).resize(size, size);
  if (opaque) img = img.flatten({ background: PAPER });
  return img.png({ compressionLevel: 9 }).toBuffer();
};

/** ICO container holding PNG entries (supported by every current browser). */
const ico = (pngs) => {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(pngs.length, 4);
  const dir = Buffer.alloc(16 * pngs.length);
  let offset = 6 + dir.length;
  pngs.forEach(({ size, data }, n) => {
    const e = n * 16;
    dir.writeUInt8(size >= 256 ? 0 : size, e);
    dir.writeUInt8(size >= 256 ? 0 : size, e + 1);
    dir.writeUInt8(0, e + 2);
    dir.writeUInt8(0, e + 3);
    dir.writeUInt16LE(1, e + 4);
    dir.writeUInt16LE(32, e + 6);
    dir.writeUInt32LE(data.length, e + 8);
    dir.writeUInt32LE(offset, e + 12);
    offset += data.length;
  });
  return Buffer.concat([header, dir, ...pngs.map((p) => p.data)]);
};

const write = (rel, data) => {
  const file = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, data);
  console.log(`wrote ${rel} (${data.length} B)`);
};

// Heavier stroke at the smallest sizes so the line survives the pixel grid.
const favStroke = (size) => (size <= 16 ? 26 : size <= 32 ? 24 : 22);

const icoEntries = [];
for (const size of [16, 32, 48]) icoEntries.push({ size, data: await render(faviconSvg(favStroke(size)), size) });
write('app/favicon.ico', ico(icoEntries));
write('app/icon.svg', Buffer.from(faviconSvg(24)));

const tile = tileSvg();
write('app/apple-icon.png', await render(tile, 180, { opaque: true }));
write('public/icons/icon-192.png', await render(tile, 192, { opaque: true }));
write('public/icons/icon-512.png', await render(tile, 512, { opaque: true }));
// Maskable: no frame (the mask would cut it), mark kept well inside the 80% safe circle.
write('public/icons/icon-maskable-512.png', await render(tileSvg({ frame: false, scale: 0.5 }), 512, { opaque: true }));
write('design-system/assets/Logos/heart-line-app-icon.svg', Buffer.from(tile));
