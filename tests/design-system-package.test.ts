import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

/**
 * Keeps the tool-agnostic design-system/ package (mirrored on claude.ai as the
 * "Blanmont Carte IGN" Design System artifact) in lockstep with app/globals.css,
 * which stays the code source of truth.
 */

type ColorValue = string | Record<string, string>;
interface Token {
  name: string;
  value: ColorValue;
  usage?: string;
}

const rootDir = path.resolve(__dirname, '..');
const dsDir = path.join(rootDir, 'design-system');
const css = fs.readFileSync(path.join(rootDir, 'app', 'globals.css'), 'utf8');
const tokens = JSON.parse(fs.readFileSync(path.join(dsDir, 'tokens.json'), 'utf8'));
const colorTokens: Token[] = tokens.color.tokens;
const byName = new Map(colorTokens.map((t) => [t.name, t]));

/** Declarations `--<prefix><name>: <value>;` inside the first block opened by `selector {`. */
function declarations(selector: string, prefix: string): Map<string, string> {
  const start = css.indexOf(`${selector} {`);
  expect(start, `${selector} block missing in globals.css`).toBeGreaterThanOrEqual(0);
  const block = css.slice(start, css.indexOf('\n}', start));
  const out = new Map<string, string>();
  const re = new RegExp(`--${prefix}([a-z0-9-]+):\\s*([^;]+);`, 'g');
  for (const m of block.matchAll(re)) out.set(m[1], m[2].trim());
  return out;
}

/** `rgb(31 111 191 / 0.16)` and `rgba(31, 111, 191, 0.16)` compare equal. */
function normalize(value: string): string {
  const rgb = /^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)(?:\s*[,/]\s*([\d.]+))?\s*\)$/.exec(value);
  if (!rgb) return value.toLowerCase();
  return `rgba(${rgb[1]},${rgb[2]},${rgb[3]},${rgb[4] ?? '1'})`;
}

function themeValue(token: Token, theme: 'light' | 'dark'): string {
  return typeof token.value === 'string' ? token.value : (token.value[theme] ?? token.value.light);
}

describe('design-system/ package', () => {
  it('declares a light and a dark theme, light first', () => {
    expect(tokens.color.themes.map((t: { id: string }) => t.id)).toEqual(['light', 'dark']);
  });

  it('carries every @theme colour of globals.css with the same value', () => {
    const theme = declarations('@theme', 'color-');
    expect(theme.size).toBeGreaterThan(30);
    for (const [name, value] of theme) {
      const token = byName.get(name);
      expect(token, `--color-${name} missing from tokens.json`).toBeDefined();
      expect(normalize(themeValue(token!, 'light')), `--color-${name}`).toBe(normalize(value));
    }
  });

  it('carries the map inks with their day (:root) and night (.dark) values', () => {
    const day = declarations(':root', 'map-');
    const night = declarations('.dark', 'map-');
    expect(day.size).toBeGreaterThan(10);
    for (const [name, value] of day) {
      const token = byName.get(`map-${name}`);
      expect(token, `--map-${name} missing from tokens.json`).toBeDefined();
      expect(normalize(themeValue(token!, 'light')), `--map-${name} (day)`).toBe(normalize(value));
      expect(normalize(themeValue(token!, 'dark')), `--map-${name} (night)`).toBe(normalize(night.get(name)!));
    }
  });

  it('keeps radii in step with globals.css', () => {
    const radii = declarations('@theme', 'radius-');
    const dsRadii = new Map<string, string>(
      tokens.radius.tokens.map((t: Token) => [t.name, t.value as string])
    );
    for (const [name, value] of radii) {
      expect(dsRadii.get(`radius-${name}`), `--radius-${name}`).toBe(value);
    }
  });

  it('resolves every colour alias to an existing token and gives every token a usage note', () => {
    for (const token of colorTokens) {
      expect(token.usage, `${token.name} has no usage note`).toBeTruthy();
      const values = typeof token.value === 'string' ? [token.value] : Object.values(token.value);
      for (const v of values) {
        const alias = /^\{(.+)\}$/.exec(v);
        if (alias) expect(byName.has(alias[1]), `${token.name} → {${alias[1]}}`).toBe(true);
        else expect(v).toMatch(/^(#[0-9a-f]{3,8}|rgba?\([^)]*\))$/);
      }
    }
  });

  it('documents and previews every component, pointing at source files that exist', () => {
    const componentsDir = path.join(dsDir, 'components');
    const names = fs
      .readdirSync(componentsDir, { withFileTypes: true })
      .filter((e) => e.isDirectory())
      .map((e) => e.name);
    expect(names).toEqual(expect.arrayContaining(['Button', 'Badge', 'SheetHeader', 'EmptyState', 'Cover']));

    for (const name of names) {
      const preview = fs.readFileSync(path.join(componentsDir, name, 'preview.html'), 'utf8');
      expect(preview.split('\n')[0], `${name}/preview.html marker`).toMatch(/^<!-- @dsCard /);
      if (name === 'Cover') continue; // the cover stays a bare preview
      const readme = fs.readFileSync(path.join(componentsDir, name, 'README.md'), 'utf8');
      expect(readme.startsWith(`# ${name}\n`), `${name}/README.md heading`).toBe(true);
      for (const m of readme.matchAll(/`(app\/[^`\s]+\.(?:tsx|ts|css))`/g)) {
        expect(fs.existsSync(path.join(rootDir, m[1])), `${name} cites missing ${m[1]}`).toBe(true);
      }
    }
  });

  it('is the entry point every agent instruction file points to', () => {
    for (const file of ['AGENTS.md', 'CLAUDE.md', '.cursorrules', '.windsurfrules']) {
      const content = fs.readFileSync(path.join(rootDir, file), 'utf8');
      expect(content, file).toContain('design-system/README.md');
    }
  });
});
