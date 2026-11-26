import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

/**
 * Static check: every exported function of every 'use server' file under app/admin and every HTTP handler
 * under app/api/admin calls a guard, directly or through a function of the same file that does.
 */
const ROOT = path.resolve(import.meta.dirname, '../..');
const GUARD = /\b(requireSectionAccess|requireAdminSession|requireOwnerSession|verifySectionRequest|verifyAdminRequest|verifyOwnerRequest)\(/;
const HTTP = new Set(['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS']);
// Any session may ask what it can open: it returns only the caller's own access.
const OPEN = new Set(['app/admin/acces/actions.ts#getMyAdminAccessAction']);

function walk(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const full = path.join(dir, e.name);
    return e.isDirectory() ? walk(full) : /\.tsx?$/.test(e.name) ? [full] : [];
  });
}

const stripComments = (src: string): string => src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

/** Exported functions of a file that reach a guard. */
function unguardedExports(source: string): string[] {
  const src = stripComments(source);
  const decls = [...src.matchAll(/^(export\s+)?(?:async\s+)?function\s+(\w+)/gm)];
  const fns = decls.map((m, i) => ({
    name: m[2],
    exported: Boolean(m[1]),
    body: src.slice(m.index! + m[0].length, decls[i + 1]?.index ?? src.length),
  }));
  const guarded = new Set<string>();
  let grew = true;
  while (grew) {
    grew = false;
    for (const fn of fns) {
      if (guarded.has(fn.name)) continue;
      const callsGuarded = [...guarded].some((g) => new RegExp(`\\b${g}\\(`).test(fn.body));
      if (GUARD.test(fn.body) || callsGuarded) {
        guarded.add(fn.name);
        grew = true;
      }
    }
  }
  return fns.filter((f) => f.exported && !guarded.has(f.name)).map((f) => f.name);
}

const rel = (f: string) => path.relative(ROOT, f).split(path.sep).join('/');
const serverActionFiles = walk(path.join(ROOT, 'app/admin')).filter((f) =>
  /^\s*['"]use server['"]/.test(fs.readFileSync(f, 'utf8'))
);
const routeFiles = walk(path.join(ROOT, 'app/api/admin')).filter((f) => /route\.tsx?$/.test(f));

describe('admin entry points are guarded', () => {
  it('finds the files to check', () => {
    expect(serverActionFiles.map(rel)).toContain('app/admin/commandes/actions.ts');
    expect(serverActionFiles.map(rel)).toContain('app/admin/acces/actions.ts');
    expect(routeFiles.length).toBeGreaterThanOrEqual(18);
  });

  it.each(serverActionFiles.map(rel))('every exported server action of %s calls a guard', (file) => {
    const missing = unguardedExports(fs.readFileSync(path.join(ROOT, file), 'utf8')).filter(
      (name) => !OPEN.has(`${file}#${name}`)
    );
    expect(missing).toEqual([]);
  });

  it.each(routeFiles.map(rel))('every handler of %s calls a guard', (file) => {
    const source = fs.readFileSync(path.join(ROOT, file), 'utf8');
    // Handlers must be function declarations so the check above can see them.
    expect(source).not.toMatch(/^export\s+const\s+(GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS)\b/m);
    const handlers = [...source.matchAll(/^export\s+(?:async\s+)?function\s+(\w+)/gm)].map((m) => m[1]);
    expect(handlers.some((h) => HTTP.has(h))).toBe(true);
    expect(unguardedExports(source)).toEqual([]);
  });
});
