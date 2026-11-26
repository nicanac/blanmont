import { describe, it, expect, afterEach, vi } from 'vitest';
import { createHash } from 'node:crypto';
import { decryptToken, encryptToken, getFeedbackToken, getTokenStatus } from '@/app/lib/feedback/token-store';

const key = createHash('sha256').update('k1').digest();
const otherKey = createHash('sha256').update('k2').digest();

describe('feedback token store', () => {
  afterEach(() => vi.unstubAllEnvs());

  it('round-trips a token and never stores it in clear', () => {
    const stored = encryptToken('github_pat_secret123456789012', key);
    expect(JSON.stringify(stored)).not.toContain('secret123');
    expect(decryptToken(stored, key)).toBe('github_pat_secret123456789012');
  });

  it('uses a fresh iv each time', () => {
    expect(encryptToken('github_pat_secret123456789012', key).iv).not.toBe(encryptToken('github_pat_secret123456789012', key).iv);
  });

  it('rejects a tampered payload and a different key', () => {
    const stored = encryptToken('github_pat_secret123456789012', key);
    const flipped = { ...stored, data: Buffer.from('x' + Buffer.from(stored.data, 'base64').toString('latin1').slice(1), 'latin1').toString('base64') };
    expect(decryptToken(flipped, key)).toBeNull();
    expect(decryptToken(stored, otherKey)).toBeNull();
  });

  it('prefers the environment variable and only reports its last 4 characters', async () => {
    vi.stubEnv('GITHUB_FEEDBACK_TOKEN', 'ghp_from_environment_1234');
    expect(await getFeedbackToken()).toBe('ghp_from_environment_1234');
    expect(await getTokenStatus()).toEqual({ source: 'env', last4: '1234' });
  });

  it('reports no token when nothing is configured', async () => {
    vi.stubEnv('GITHUB_FEEDBACK_TOKEN', '');
    expect(await getTokenStatus()).toEqual({ source: 'none' });
  });
});
