import { describe, it, expect } from 'vitest';
import { spawnSync } from 'node:child_process';
import path from 'node:path';

describe('Antigravity Lifecycle Hooks', () => {
  const repoRoot = path.resolve(__dirname, '..', '..');
  const guardsScript = path.join(repoRoot, '.agents', 'hooks', 'antigravity_guards.py');
  const postToolScript = path.join(repoRoot, '.agents', 'hooks', 'antigravity_post_tool.mjs');
  const stopScript = path.join(repoRoot, '.agents', 'hooks', 'antigravity_stop.mjs');

  const runGuard = (payload: unknown) => {
    const res = spawnSync('python', [guardsScript], {
      input: JSON.stringify(payload),
      encoding: 'utf-8',
      cwd: repoRoot,
    });
    return JSON.parse(res.stdout || '{}');
  };

  describe('PreToolUse Security Guards (antigravity_guards.py)', () => {
    it('blocks reading or leaking secret files via run_command', () => {
      const res = runGuard({
        toolCall: {
          name: 'run_command',
          args: { CommandLine: 'cat .env' },
        },
      });
      expect(res.decision).toBe('deny');
      expect(res.reason).toContain('secret');
    });

    it('blocks viewing secret files via view_file', () => {
      const res = runGuard({
        toolCall: {
          name: 'view_file',
          args: { AbsolutePath: path.join(repoRoot, '.env.local') },
        },
      });
      expect(res.decision).toBe('deny');
      expect(res.reason).toContain('secret');
    });

    it('blocks direct pushes to protected branches', () => {
      const res = runGuard({
        toolCall: {
          name: 'run_command',
          args: { CommandLine: 'git push origin master' },
        },
      });
      expect(res.decision).toBe('deny');
      expect(res.reason).toContain('protected branch');
    });

    it('blocks deleting root directory', () => {
      const res = runGuard({
        toolCall: {
          name: 'run_command',
          args: { CommandLine: 'rm -rf /' },
        },
      });
      expect(res.decision).toBe('deny');
      expect(res.reason).toContain('Blocked: rm target');
    });

    it('blocks writing hardcoded credentials in files', () => {
      const realKeyPrefix = 'sk-ant-';
      const realKeySuffix = 'api03-abcdef123456789012345678';
      const res = runGuard({
        toolCall: {
          name: 'write_to_file',
          args: {
            TargetFile: path.join(repoRoot, 'app', 'config.ts'),
            CodeContent: `const KEY = "${realKeyPrefix}${realKeySuffix}";`,
          },
        },
      });
      expect(res.decision).toBe('deny');
      expect(res.reason).toContain('guard-key-literals');
    });

    it('allows safe shell commands', () => {
      const res = runGuard({
        toolCall: {
          name: 'run_command',
          args: { CommandLine: 'npm test' },
        },
      });
      expect(res.decision).toBe('allow');
    });

    it('allows safe file views', () => {
      const res = runGuard({
        toolCall: {
          name: 'view_file',
          args: { AbsolutePath: path.join(repoRoot, 'package.json') },
        },
      });
      expect(res.decision).toBe('allow');
    });
  });

  describe('PostToolUse Hook (antigravity_post_tool.mjs)', () => {
    it('returns empty JSON conforming to Antigravity PostToolUse contract', () => {
      const res = spawnSync('node', [postToolScript], {
        input: JSON.stringify({ stepIdx: 1 }),
        encoding: 'utf-8',
        cwd: repoRoot,
      });
      expect(res.status).toBe(0);
      expect(JSON.parse(res.stdout || '{}')).toEqual({});
    });
  });

  describe('Stop Hook (antigravity_stop.mjs)', () => {
    it('returns valid decision conforming to Antigravity Stop contract', () => {
      const res = spawnSync('node', [stopScript], {
        input: JSON.stringify({ executionNum: 1 }),
        encoding: 'utf-8',
        cwd: repoRoot,
      });
      expect(res.status).toBe(0);
      const parsed = JSON.parse(res.stdout || '{}');
      expect(['stop', 'continue']).toContain(parsed.decision);
    });
  });
});
