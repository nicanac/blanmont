#!/usr/bin/env node
/**
 * Runs every chapter capture script in scripts/capture/ one after the other.
 * Needs the dev server on MANUEL_BASE_URL (default http://localhost:3000), the seeded emulator
 * and the same SESSION_SECRET as the server (see README.md).
 */
import { execFileSync } from 'node:child_process';
import { readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), 'capture');
for (const file of readdirSync(dir).filter((f) => f.endsWith('.mjs')).sort()) {
  console.log(`\n▸ ${file}`);
  execFileSync(process.execPath, [path.join(dir, file)], { stdio: 'inherit' });
}
