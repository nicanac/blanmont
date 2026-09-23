import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

describe('Design System & AI Agent Alignment Integrity', () => {
  const rootDir = path.resolve(__dirname, '..');

  it('DESIGN.md contains valid YAML frontmatter and La Feuille de Blanmont North Star', () => {
    const designMdPath = path.join(rootDir, 'DESIGN.md');
    expect(fs.existsSync(designMdPath)).toBe(true);
    const content = fs.readFileSync(designMdPath, 'utf8');

    expect(content).toContain('name: CC Saint-Martin Blanmont');
    expect(content).toContain('paper: "#fbfbf8"');
    expect(content).toContain('night: "#0d1013"');
    expect(content).toContain('brand: "#d63535"');
    expect(content).toContain('bistre: "#b0703b"');
    expect(content).toContain('hydro: "#1f6fbf"');
    expect(content).toContain('vert: "#2e7d45"');
    expect(content).toContain('fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"');
    expect(content).toContain('**Creative North Star: "La Feuille de Blanmont — Carte IGN"**');
  });

  it('.impeccable/design.json conforms to schemaVersion 2 and matches the visual system', () => {
    const designJsonPath = path.join(rootDir, '.impeccable', 'design.json');
    expect(fs.existsSync(designJsonPath)).toBe(true);
    const data = JSON.parse(fs.readFileSync(designJsonPath, 'utf8'));

    expect(data.schemaVersion).toBe(2);
    expect(data.narrative.northStar).toBe('La Feuille de Blanmont — Carte IGN');
    expect(data.extensions.colorMeta.brand.canonical).toBe('#d63535');
    expect(data.extensions.colorMeta.paper.canonical).toBe('#fbfbf8');
    expect(data.extensions.colorMeta.night.canonical).toBe('#0d1013');
    expect(data.extensions.colorMeta.bistre.canonical).toBe('#b0703b');
    expect(data.extensions.colorMeta.hydro.canonical).toBe('#1f6fbf');
    expect(data.extensions.colorMeta.vert.canonical).toBe('#2e7d45');
    expect(Array.isArray(data.components)).toBe(true);
    expect(data.components.length).toBeGreaterThanOrEqual(8);
  });

  it('PRODUCT.md aesthetic is aligned with La Feuille de Blanmont — Carte IGN', () => {
    const productMdPath = path.join(rootDir, 'PRODUCT.md');
    expect(fs.existsSync(productMdPath)).toBe(true);
    const content = fs.readFileSync(productMdPath, 'utf8');

    expect(content).toContain('La Feuille de Blanmont — Carte IGN');
    expect(content).not.toContain('Ciseco');
  });

  it('All AI agent instructions mandate La Feuille de Blanmont Carte IGN', () => {
    const agentFiles = ['AGENTS.md', 'GEMINI.md', 'CLAUDE.md', '.cursorrules', '.windsurfrules'];
    for (const file of agentFiles) {
      const filePath = path.join(rootDir, file);
      expect(fs.existsSync(filePath), `File ${file} should exist`).toBe(true);
      const content = fs.readFileSync(filePath, 'utf8');
      expect(content).toContain('La Feuille de Blanmont — Carte IGN');
      expect(content).toContain('Archivo');
      expect(content).toContain('SheetHeader');
    }
  });

  it('app/globals.css defines the semantic tokens for La Feuille de Blanmont', () => {
    const globalsCssPath = path.join(rootDir, 'app', 'globals.css');
    expect(fs.existsSync(globalsCssPath)).toBe(true);
    const content = fs.readFileSync(globalsCssPath, 'utf8');

    expect(content).toContain('--color-paper: #fbfbf8;');
    expect(content).toContain('--color-night: #0d1013;');
    expect(content).toContain('--color-brand: #d63535;');
    expect(content).toContain('--color-bistre: #b0703b;');
    expect(content).toContain('--color-hydro: #1f6fbf;');
    expect(content).toContain('--color-vert: #2e7d45;');
    expect(content).toContain('--font-archivo');
  });

  it('Production app code does not use legacy Poppins font', () => {
    const appDir = path.join(rootDir, 'app');
    function checkDir(dir: string) {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          checkDir(fullPath);
        } else if (/\.(tsx|ts|jsx|js|css)$/.test(entry.name)) {
          const fileContent = fs.readFileSync(fullPath, 'utf8');
          expect(fileContent).not.toContain('font-poppins');
          expect(fileContent).not.toContain('Poppins');
        }
      }
    }
    checkDir(appDir);
  });
});
