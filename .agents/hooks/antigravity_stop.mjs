#!/usr/bin/env node
/**
 * Antigravity Stop Hook.
 *
 * Runs when the agent attempts to conclude its turn:
 * 1. Checks if any modified UI files have unaddressed design issues via Impeccable.
 * 2. If issues are found, returns `{"decision": "continue", "reason": "..."}` to keep
 *    the loop alive so the agent can resolve them.
 * 3. Runs Graft's stop cleanup hook.
 * 4. If clean, returns `{"decision": "stop"}`.
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
  let blockingReason = null;

  try {
    // 1. Run Impeccable deep pass on session edits
    const hookLibPath = path.join(REPO_ROOT, '.agents', 'skills', 'impeccable', 'scripts', 'hook-lib.mjs');
    if (fs.existsSync(hookLibPath) && fs.existsSync(SESSION_FILE)) {
      try {
        const { runStopHook } = await import(pathToFileURL(hookLibPath).href);
        const res = await runStopHook({
          stdinJson: JSON.stringify({
            hook_event_name: 'Stop',
            cwd: REPO_ROOT,
          }),
          env: {
            ...process.env,
            CLAUDE_PROJECT_DIR: REPO_ROOT,
            IMPECCABLE_HOOK_HARNESS: 'codex', // Harness that produces { decision: 'block', reason: text }
          },
          cwd: REPO_ROOT,
        });

        if (res && res.stdout) {
          try {
            const parsed = JSON.parse(res.stdout);
            if (parsed.reason && parsed.decision === 'block') {
              blockingReason = parsed.reason;
            }
          } catch {
            // Non-JSON stdout fallback
          }
        }
      } catch {
        // Non-blocking on internal error
      }
    }

    // 2. Graft stop hook
    const graftHelper = path.join(REPO_ROOT, '.claude', 'helpers', 'graft-hooks.cjs');
    if (fs.existsSync(graftHelper)) {
      spawnSync(process.execPath, [graftHelper, 'stop'], {
        cwd: REPO_ROOT,
        env: { ...process.env, CLAUDE_PROJECT_DIR: REPO_ROOT },
        stdio: 'ignore',
      });
    }
  } catch {
    // Non-blocking
  }

  // If there are blocking design issues, tell Antigravity to continue the loop
  if (blockingReason) {
    process.stdout.write(JSON.stringify({
      decision: 'continue',
      reason: blockingReason,
    }));
    return;
  }

  // Clean up session edits file
  try {
    if (fs.existsSync(SESSION_FILE)) {
      fs.unlinkSync(SESSION_FILE);
    }
  } catch {
    // Ignore cleanup error
  }

  // Allow stopping
  process.stdout.write(JSON.stringify({ decision: 'stop' }));
}

main().catch(() => {
  process.stdout.write(JSON.stringify({ decision: 'stop' }));
});
