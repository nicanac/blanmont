#!/usr/bin/env node
/**
 * Antigravity PostToolUse Hook.
 *
 * Runs after file modifications (write_to_file, replace_file_content):
 * 1. Invokes Graft's post-edit hook to keep the codebase graph up to date.
 * 2. Runs Impeccable's per-edit check to warm the session cache.
 * 3. Returns `{}` to Antigravity.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { spawnSync } from 'node:child_process';

const __filename = fileURLToPath(import.meta.url);
const SCRIPT_DIR = path.dirname(__filename);
const REPO_ROOT = path.resolve(SCRIPT_DIR, '..', '..');
const SESSION_FILE = path.join(SCRIPT_DIR, '.session_edits.json');

async function main() {
  try {
    // 1. Graft post-edit update
    const graftHelper = path.join(REPO_ROOT, '.claude', 'helpers', 'graft-hooks.cjs');
    if (fs.existsSync(graftHelper)) {
      spawnSync(process.execPath, [graftHelper, 'post-edit'], {
        cwd: REPO_ROOT,
        env: { ...process.env, CLAUDE_PROJECT_DIR: REPO_ROOT },
        stdio: 'ignore',
      });
    }

    // 2. Impeccable per-edit check on recorded session files
    const hookLibPath = path.join(REPO_ROOT, '.agents', 'skills', 'impeccable', 'scripts', 'hook-lib.mjs');
    if (fs.existsSync(hookLibPath) && fs.existsSync(SESSION_FILE)) {
      try {
        const touchedFiles = JSON.parse(fs.readFileSync(SESSION_FILE, 'utf-8'));
        if (Array.isArray(touchedFiles) && touchedFiles.length > 0) {
          const { runHook } = await import(pathToFileURL(hookLibPath).href);
          const lastFile = touchedFiles[touchedFiles.length - 1];
          await runHook({
            stdinJson: JSON.stringify({
              hook_event_name: 'PostToolUse',
              tool_name: 'Edit',
              tool_input: { file_path: lastFile },
              cwd: REPO_ROOT,
            }),
            env: { ...process.env, CLAUDE_PROJECT_DIR: REPO_ROOT },
            cwd: REPO_ROOT,
          });
        }
      } catch {
        // Non-blocking
      }
    }
  } catch {
    // Non-blocking
  }

  // Antigravity contract for PostToolUse expects empty JSON
  process.stdout.write('{}');
}

main().catch(() => {
  process.stdout.write('{}');
});
