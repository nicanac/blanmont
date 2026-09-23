#!/usr/bin/env node
/**
 * Generates the "Feuille de Blanmont" territory map layers used across the site.
 *
 * Sources (fetched once, output committed to the repo):
 *  - Relief: AWS Terrain Tiles (Terrarium encoding, zoom 12), contoured locally (marching squares).
 *  - Hydrography, roads, railway, woods, place names: OpenStreetMap via the Overpass API (ODbL).
 *
 * Outputs:
 *  - public/carte/*.svg        one stroke/fill layer per map ink, used as CSS masks so each layer
 *                              can be tinted by the design tokens (light + night modes).
 *  - app/data/territory.json   place labels (percent positions), extent, elevation range, credits.
 *
 * Usage: node scripts/generate-territory-map.mjs [--refresh]
 *   Raw downloads are cached in scripts/.cache/ (gitignored) unless --refresh is passed.
 */
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CACHE_DIR = path.join(ROOT, 'scripts', '.cache');
const OUT_SVG_DIR = path.join(ROOT, 'public', 'carte');
const OUT_JSON = path.join(ROOT, 'app', 'data', 'territory.json');
const REFRESH = process.argv.includes('--refresh');
const USER_AGENT = 'cc-blanmont-site/1.0 (territory map generator)';

// Departure point of the club: Place de la Féchère, Blanmont (OSM way 72140041).
const CENTER = { lat: 50.62302, lon: 4.64223, name: 'Place de la Féchère' };
const HALF_KM = 16; // map covers 32 km x 32 km
const GRID_STEP_KM = 0.2;
const UNIT_M = 10; // SVG user unit = 10 m
const CONTOUR_INTERVAL = 5;
const INDEX_EVERY = 25;

const KM_PER_DEG_LAT = 110.574;
const KM_PER_DEG_LON = 111.32 * Math.cos((CENTER.lat * Math.PI) / 180);
const HALF_UNITS = (HALF_KM * 1000) / UNIT_M;
const SIZE_UNITS = HALF_UNITS * 2;

const bbox = {
  south: CENTER.lat - HALF_KM / KM_PER_DEG_LAT,
  north: CENTER.lat + HALF_KM / KM_PER_DEG_LAT,
  west: CENTER.lon - HALF_KM / KM_PER_DEG_LON,
  east: CENTER.lon + HALF_KM / KM_PER_DEG_LON,
};

/** Project lat/lon to SVG units (origin top-left of the square map). */
function project(lat, lon) {
  const xKm = (lon - CENTER.lon) * KM_PER_DEG_LON;
  const yKm = (CENTER.lat - lat) * KM_PER_DEG_LAT;
  return [(xKm * 1000) / UNIT_M + HALF_UNITS, (yKm * 1000) / UNIT_M + HALF_UNITS];
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function readCache(name) {
  const file = path.join(CACHE_DIR, name);
  if (!REFRESH && fs.existsSync(file)) return JSON.parse(fs.readFileSync(file, 'utf8'));
  return null;
}

function writeCache(name, data) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
  fs.writeFileSync(path.join(CACHE_DIR, name), JSON.stringify(data));
}

// ── Elevation grid (AWS Terrain Tiles, Terrarium encoding) ───────────────────
const TILE_ZOOM = 12;

function decodePng(buffer) {
  const sig = buffer.subarray(0, 8).toString('hex');
  if (sig !== '89504e470d0a1a0a') throw new Error('Not a PNG');
  let offset = 8;
  let width = 0,
    height = 0,
    colorType = 0,
    bitDepth = 0,
    interlace = 0;
  const idat = [];
  while (offset < buffer.length) {
    const length = buffer.readUInt32BE(offset);
    const type = buffer.subarray(offset + 4, offset + 8).toString('ascii');
    const data = buffer.subarray(offset + 8, offset + 8 + length);
    if (type === 'IHDR') {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      bitDepth = data[8];
      colorType = data[9];
      interlace = data[12];
    } else if (type === 'IDAT') {
      idat.push(data);
    } else if (type === 'IEND') {
      break;
    }
    offset += 12 + length;
  }
  if (bitDepth !== 8 || interlace !== 0 || (colorType !== 2 && colorType !== 6)) {
    throw new Error(
      `Unsupported PNG (depth ${bitDepth}, color ${colorType}, interlace ${interlace})`
    );
  }
  const bpp = colorType === 6 ? 4 : 3;
  const raw = zlib.inflateSync(Buffer.concat(idat));
  const stride = width * bpp;
  const out = Buffer.alloc(stride * height);
  for (let y = 0; y < height; y++) {
    const filter = raw[y * (stride + 1)];
    const line = raw.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1));
    const prev = y > 0 ? out.subarray((y - 1) * stride, y * stride) : null;
    const cur = out.subarray(y * stride, (y + 1) * stride);
    for (let x = 0; x < stride; x++) {
      const a = x >= bpp ? cur[x - bpp] : 0;
      const b = prev ? prev[x] : 0;
      const c = prev && x >= bpp ? prev[x - bpp] : 0;
      let v = line[x];
      if (filter === 1) v += a;
      else if (filter === 2) v += b;
      else if (filter === 3) v += (a + b) >> 1;
      else if (filter === 4) {
        const p = a + b - c;
        const pa = Math.abs(p - a),
          pb = Math.abs(p - b),
          pc = Math.abs(p - c);
        v += pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
      }
      cur[x] = v & 0xff;
    }
  }
  const elevation = new Float32Array(width * height);
  for (let k = 0; k < width * height; k++) {
    const r = out[k * bpp],
      g = out[k * bpp + 1],
      bl = out[k * bpp + 2];
    elevation[k] = r * 256 + g + bl / 256 - 32768;
  }
  return { width, height, elevation };
}

const lonToTileX = (lon) => ((lon + 180) / 360) * 2 ** TILE_ZOOM;
const latToTileY = (lat) => {
  const r = (lat * Math.PI) / 180;
  return ((1 - Math.log(Math.tan(r) + 1 / Math.cos(r)) / Math.PI) / 2) * 2 ** TILE_ZOOM;
};

async function fetchElevationGrid() {
  const cached = readCache('elevation-terrarium.json');
  if (cached) return cached;

  const x0 = Math.floor(lonToTileX(bbox.west)),
    x1 = Math.floor(lonToTileX(bbox.east));
  const y0 = Math.floor(latToTileY(bbox.north)),
    y1 = Math.floor(latToTileY(bbox.south));
  const tiles = new Map();
  for (let ty = y0; ty <= y1; ty++) {
    for (let tx = x0; tx <= x1; tx++) {
      const cacheFile = path.join(CACHE_DIR, `terrarium-${TILE_ZOOM}-${tx}-${ty}.png`);
      let buf;
      if (!REFRESH && fs.existsSync(cacheFile)) {
        buf = fs.readFileSync(cacheFile);
      } else {
        const url = `https://s3.amazonaws.com/elevation-tiles-prod/terrarium/${TILE_ZOOM}/${tx}/${ty}.png`;
        const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
        if (!res.ok) throw new Error(`Tile ${tx}/${ty} failed: ${res.status}`);
        buf = Buffer.from(await res.arrayBuffer());
        fs.mkdirSync(CACHE_DIR, { recursive: true });
        fs.writeFileSync(cacheFile, buf);
      }
      tiles.set(`${tx},${ty}`, decodePng(buf));
      process.stdout.write(`\r  terrain tiles ${tiles.size}/${(x1 - x0 + 1) * (y1 - y0 + 1)}`);
    }
  }
  process.stdout.write('\n');

  const sample = (lat, lon) => {
    const gx = lonToTileX(lon) * 256;
    const gy = latToTileY(lat) * 256;
    const px = Math.floor(gx - 0.5),
      py = Math.floor(gy - 0.5);
    const fx = gx - 0.5 - px,
      fy = gy - 0.5 - py;
    const at = (X, Y) => {
      const tile = tiles.get(`${Math.floor(X / 256)},${Math.floor(Y / 256)}`);
      if (!tile) return 0;
      return tile.elevation[(Y % 256) * tile.width + (X % 256)];
    };
    const v00 = at(px, py),
      v10 = at(px + 1, py),
      v01 = at(px, py + 1),
      v11 = at(px + 1, py + 1);
    return v00 * (1 - fx) * (1 - fy) + v10 * fx * (1 - fy) + v01 * (1 - fx) * fy + v11 * fx * fy;
  };

  const n = Math.round((HALF_KM * 2) / GRID_STEP_KM) + 1;
  const values = [];
  for (let j = 0; j < n; j++) {
    for (let i = 0; i < n; i++) {
      const xKm = -HALF_KM + i * GRID_STEP_KM;
      const yKm = -HALF_KM + j * GRID_STEP_KM;
      values.push(
        +sample(CENTER.lat - yKm / KM_PER_DEG_LAT, CENTER.lon + xKm / KM_PER_DEG_LON).toFixed(1)
      );
    }
  }
  const grid = { n, stepKm: GRID_STEP_KM, values };
  writeCache('elevation-terrarium.json', grid);
  return grid;
}

// ── Marching squares ────────────────────────────────────────────────────────
function contourLines(grid, level) {
  const { n, values } = grid;
  const v = (i, j) => values[j * n + i];
  const segments = [];
  const interp = (a, b, va, vb) => (va === vb ? 0.5 : (level - va) / (vb - va));

  for (let j = 0; j < n - 1; j++) {
    for (let i = 0; i < n - 1; i++) {
      const tl = v(i, j),
        tr = v(i + 1, j),
        br = v(i + 1, j + 1),
        bl = v(i, j + 1);
      let idx = 0;
      if (tl >= level) idx |= 8;
      if (tr >= level) idx |= 4;
      if (br >= level) idx |= 2;
      if (bl >= level) idx |= 1;
      if (idx === 0 || idx === 15) continue;

      const top = [i + interp(0, 1, tl, tr), j];
      const right = [i + 1, j + interp(0, 1, tr, br)];
      const bottom = [i + interp(0, 1, bl, br), j + 1];
      const left = [i, j + interp(0, 1, tl, bl)];
      const center = (tl + tr + br + bl) / 4;

      switch (idx) {
        case 1:
        case 14:
          segments.push([left, bottom]);
          break;
        case 2:
        case 13:
          segments.push([bottom, right]);
          break;
        case 3:
        case 12:
          segments.push([left, right]);
          break;
        case 4:
        case 11:
          segments.push([top, right]);
          break;
        case 6:
        case 9:
          segments.push([top, bottom]);
          break;
        case 7:
        case 8:
          segments.push([left, top]);
          break;
        case 5:
          if (center >= level) {
            segments.push([left, top]);
            segments.push([bottom, right]);
          } else {
            segments.push([left, bottom]);
            segments.push([top, right]);
          }
          break;
        case 10:
          if (center >= level) {
            segments.push([top, right]);
            segments.push([left, bottom]);
          } else {
            segments.push([left, top]);
            segments.push([bottom, right]);
          }
          break;
        default:
          break;
      }
    }
  }
  return stitch(segments);
}

function stitch(segments) {
  const key = (p) => `${p[0].toFixed(4)},${p[1].toFixed(4)}`;
  const byPoint = new Map();
  segments.forEach((s, idx) => {
    for (const p of s) {
      const k = key(p);
      if (!byPoint.has(k)) byPoint.set(k, []);
      byPoint.get(k).push(idx);
    }
  });
  const used = new Array(segments.length).fill(false);
  const lines = [];
  for (let s = 0; s < segments.length; s++) {
    if (used[s]) continue;
    used[s] = true;
    const line = [segments[s][0], segments[s][1]];
    const extend = (atEnd) => {
      for (;;) {
        const tip = atEnd ? line[line.length - 1] : line[0];
        const next = (byPoint.get(key(tip)) || []).find((idx) => !used[idx]);
        if (next === undefined) return;
        used[next] = true;
        const [a, b] = segments[next];
        const other = key(a) === key(tip) ? b : a;
        if (atEnd) line.push(other);
        else line.unshift(other);
      }
    };
    extend(true);
    extend(false);
    lines.push(line);
  }
  return lines;
}

function chaikin(points, iterations = 2) {
  let pts = points;
  const closed =
    pts.length > 3 && pts[0][0] === pts[pts.length - 1][0] && pts[0][1] === pts[pts.length - 1][1];
  for (let it = 0; it < iterations; it++) {
    const out = closed ? [] : [pts[0]];
    for (let k = 0; k < pts.length - 1; k++) {
      const [x0, y0] = pts[k];
      const [x1, y1] = pts[k + 1];
      out.push([0.75 * x0 + 0.25 * x1, 0.75 * y0 + 0.25 * y1]);
      out.push([0.25 * x0 + 0.75 * x1, 0.25 * y0 + 0.75 * y1]);
    }
    if (closed) out.push(out[0]);
    else out.push(pts[pts.length - 1]);
    pts = out;
  }
  return pts;
}

function simplify(points, tolerance) {
  if (points.length < 3) return points;
  const sqTol = tolerance * tolerance;
  const sqSegDist = (p, a, b) => {
    let [x, y] = a;
    let dx = b[0] - x,
      dy = b[1] - y;
    if (dx !== 0 || dy !== 0) {
      const t = ((p[0] - x) * dx + (p[1] - y) * dy) / (dx * dx + dy * dy);
      if (t > 1) {
        x = b[0];
        y = b[1];
      } else if (t > 0) {
        x += dx * t;
        y += dy * t;
      }
    }
    dx = p[0] - x;
    dy = p[1] - y;
    return dx * dx + dy * dy;
  };
  const keep = new Uint8Array(points.length);
  keep[0] = keep[points.length - 1] = 1;
  const stack = [[0, points.length - 1]];
  while (stack.length) {
    const [first, last] = stack.pop();
    let maxSq = 0,
      index = -1;
    for (let k = first + 1; k < last; k++) {
      const d = sqSegDist(points[k], points[first], points[last]);
      if (d > maxSq) {
        index = k;
        maxSq = d;
      }
    }
    if (maxSq > sqTol && index > 0) {
      keep[index] = 1;
      stack.push([first, index], [index, last]);
    }
  }
  return points.filter((_, k) => keep[k]);
}

function toPath(lines, { tolerance = 1.5, minLength = 0 } = {}) {
  const parts = [];
  for (const raw of lines) {
    const pts = simplify(raw, tolerance);
    if (pts.length < 2) continue;
    if (minLength) {
      let len = 0;
      for (let k = 1; k < pts.length; k++)
        len += Math.hypot(pts[k][0] - pts[k - 1][0], pts[k][1] - pts[k - 1][1]);
      if (len < minLength) continue;
    }
    let d = `M${Math.round(pts[0][0])} ${Math.round(pts[0][1])}`;
    let px = Math.round(pts[0][0]),
      py = Math.round(pts[0][1]);
    for (let k = 1; k < pts.length; k++) {
      const x = Math.round(pts[k][0]),
        y = Math.round(pts[k][1]);
      if (x === px && y === py) continue;
      d += `l${x - px} ${y - py}`;
      px = x;
      py = y;
    }
    parts.push(d);
  }
  return parts.join('');
}

// ── Overpass ────────────────────────────────────────────────────────────────
async function overpass(name, body) {
  const cached = readCache(`${name}.json`);
  if (cached) return cached;
  const b = `${bbox.south.toFixed(5)},${bbox.west.toFixed(5)},${bbox.north.toFixed(5)},${bbox.east.toFixed(5)}`;
  const query = `[out:json][timeout:120];(${body.replaceAll('{{bbox}}', b)});out geom;`;
  const endpoints = [
    'https://overpass-api.de/api/interpreter',
    'https://overpass.kumi.systems/api/interpreter',
    'https://maps.mail.ru/osm/tools/overpass/api/interpreter',
  ];
  for (let attempt = 1; attempt <= 9; attempt++) {
    const endpoint = endpoints[(attempt - 1) % endpoints.length];
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'User-Agent': USER_AGENT, 'Content-Type': 'application/x-www-form-urlencoded' },
      body: 'data=' + encodeURIComponent(query),
    }).catch(() => null);
    if (res?.ok) {
      const json = await res.json();
      writeCache(`${name}.json`, json);
      console.log(`  overpass ${name}: ${json.elements.length} elements`);
      return json;
    }
    console.log(
      `  overpass ${name} failed (${res?.status ?? 'network'}) on ${new URL(endpoint).host}, retry ${attempt}`
    );
    await sleep(4000 * Math.ceil(attempt / endpoints.length));
  }
  throw new Error(`Overpass query ${name} failed`);
}

function wayLines(elements, filter = () => true) {
  return elements
    .filter((e) => e.type === 'way' && e.geometry && filter(e))
    .map((e) => e.geometry.map((g) => project(g.lat, g.lon)));
}

function clipToMap(lines) {
  // Keep lines that intersect the square; points outside are kept so strokes run off the edge.
  const pad = 200;
  return lines.filter((l) =>
    l.some(([x, y]) => x > -pad && y > -pad && x < SIZE_UNITS + pad && y < SIZE_UNITS + pad)
  );
}

const PROVENANCE = `<!-- Provenance: generated by scripts/generate-territory-map.mjs, ${HALF_KM * 2} km square centred on ${CENTER.name} (${CENTER.lat}, ${CENTER.lon}). Relief: AWS Terrain Tiles (Mapzen, SRTM / EU-DEM). Hydrography, roads, rail, woods: (c) OpenStreetMap contributors, ODbL. -->`;

function svgDoc(content) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${SIZE_UNITS} ${SIZE_UNITS}" preserveAspectRatio="xMidYMid slice">${PROVENANCE}${content}</svg>\n`;
}

function strokeLayer(d, width, extra = '') {
  return svgDoc(
    `<path d="${d}" fill="none" stroke="#000" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke"${extra}/>`
  );
}

function writeSvg(name, content) {
  fs.mkdirSync(OUT_SVG_DIR, { recursive: true });
  const file = path.join(OUT_SVG_DIR, name);
  fs.writeFileSync(file, content);
  console.log(`  wrote public/carte/${name} (${(content.length / 1024).toFixed(1)} KB)`);
}

async function main() {
  console.log('Feuille de Blanmont — territory map generator');
  console.log(
    `  bbox ${bbox.south.toFixed(4)},${bbox.west.toFixed(4)} → ${bbox.north.toFixed(4)},${bbox.east.toFixed(4)}`
  );

  // Relief
  const grid = await fetchElevationGrid();
  const min = Math.min(...grid.values),
    max = Math.max(...grid.values);
  const scale = (grid.stepKm * 1000) / UNIT_M;
  const toUnits = (lines) => lines.map((l) => l.map(([i, j]) => [i * scale, j * scale]));
  const minorLines = [],
    indexLines = [];
  for (
    let level = Math.ceil(min / CONTOUR_INTERVAL) * CONTOUR_INTERVAL;
    level <= max;
    level += CONTOUR_INTERVAL
  ) {
    const lines = toUnits(contourLines(grid, level)).map((l) => chaikin(l, 2));
    (level % INDEX_EVERY === 0 ? indexLines : minorLines).push(...lines);
  }
  writeSvg('relief.svg', strokeLayer(toPath(minorLines, { tolerance: 1.2, minLength: 40 }), 1));
  writeSvg(
    'relief-index.svg',
    strokeLayer(toPath(indexLines, { tolerance: 1.2, minLength: 40 }), 1.6)
  );

  // OSM layers
  const water = await overpass('water', 'way["waterway"~"^(river|stream|canal)$"]({{bbox}});');
  const lakes = await overpass('lakes', 'way["natural"="water"]({{bbox}});');
  const roads = await overpass(
    'roads',
    'way["highway"~"^(motorway|trunk|primary|secondary|tertiary)$"]({{bbox}});'
  );
  const rail = await overpass('rail', 'way["railway"="rail"]({{bbox}});');
  const woods = await overpass(
    'woods',
    'way["landuse"="forest"]({{bbox}});way["natural"="wood"]({{bbox}});'
  );
  const places = await overpass(
    'places',
    'node["place"~"^(town|village|hamlet)$"]({{bbox}});node["railway"="station"]({{bbox}});'
  );

  const rivers = clipToMap(
    wayLines(water.elements, (e) => e.tags?.waterway !== 'stream' || Boolean(e.tags?.name))
  );
  writeSvg('water.svg', strokeLayer(toPath(rivers, { tolerance: 1.5, minLength: 30 }), 1.3));
  const lakeRings = clipToMap(wayLines(lakes.elements));
  writeSvg(
    'lakes.svg',
    svgDoc(`<path d="${toPath(lakeRings, { tolerance: 1.5, minLength: 20 })}" fill="#000"/>`)
  );

  const byClass = (cls) =>
    clipToMap(wayLines(roads.elements, (e) => cls.includes(e.tags?.highway)));
  writeSvg(
    'roads-major.svg',
    strokeLayer(toPath(byClass(['motorway', 'trunk']), { tolerance: 2 }), 3.2)
  );
  writeSvg('roads-primary.svg', strokeLayer(toPath(byClass(['primary']), { tolerance: 2 }), 2.2));
  writeSvg(
    'roads-secondary.svg',
    strokeLayer(toPath(byClass(['secondary']), { tolerance: 2 }), 1.7)
  );
  writeSvg('roads-tertiary.svg', strokeLayer(toPath(byClass(['tertiary']), { tolerance: 2 }), 1.1));
  const railLines = clipToMap(wayLines(rail.elements, (e) => !e.tags?.service));
  writeSvg(
    'rail.svg',
    strokeLayer(toPath(railLines, { tolerance: 2 }), 1.4, ' stroke-dasharray="6 5"')
  );
  const woodRings = clipToMap(wayLines(woods.elements));
  writeSvg(
    'woods.svg',
    svgDoc(
      `<path d="${toPath(woodRings, { tolerance: 2.5, minLength: 60 })}" fill="#000" fill-rule="evenodd"/>`
    )
  );

  // Labels
  const labelPlaces = places.elements
    .filter((e) => e.type === 'node' && e.tags?.name)
    .map((e) => {
      const [x, y] = project(e.lat, e.lon);
      return {
        name: e.tags['name:fr'] || e.tags.name,
        kind: e.tags.railway === 'station' ? 'station' : e.tags.place,
        x: +((x / SIZE_UNITS) * 100).toFixed(2),
        y: +((y / SIZE_UNITS) * 100).toFixed(2),
        population: Number(e.tags.population) || undefined,
      };
    })
    .filter((p) => p.x > 1 && p.x < 99 && p.y > 1 && p.y < 99);

  const riverNames = [];
  const seen = new Set();
  for (const e of water.elements) {
    const name = e.tags?.name;
    if (!name || seen.has(name) || e.tags.waterway === 'stream' || !e.geometry) continue;
    const mid = e.geometry[Math.floor(e.geometry.length / 2)];
    const [x, y] = project(mid.lat, mid.lon);
    if (x < 0 || y < 0 || x > SIZE_UNITS || y > SIZE_UNITS) continue;
    seen.add(name);
    riverNames.push({
      name,
      x: +((x / SIZE_UNITS) * 100).toFixed(2),
      y: +((y / SIZE_UNITS) * 100).toFixed(2),
    });
  }

  const data = {
    generatedAt: new Date().toISOString(),
    center: CENTER,
    extentKm: HALF_KM * 2,
    bbox,
    elevation: {
      min: Math.round(min),
      max: Math.round(max),
      interval: CONTOUR_INTERVAL,
      indexEvery: INDEX_EVERY,
    },
    places: labelPlaces,
    rivers: riverNames,
    credits: {
      relief: 'Relief : AWS Terrain Tiles (Mapzen, SRTM / EU-DEM)',
      data: 'Hydrographie, routes et lieux : © contributeurs OpenStreetMap (ODbL)',
    },
  };
  fs.mkdirSync(path.dirname(OUT_JSON), { recursive: true });
  fs.writeFileSync(OUT_JSON, JSON.stringify(data, null, 2) + '\n');
  console.log(
    `  wrote app/data/territory.json (${labelPlaces.length} places, ${riverNames.length} rivers, relief ${Math.round(min)}–${Math.round(max)} m)`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
