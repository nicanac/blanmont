import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { gunzipSync } from 'node:zlib';

const saved: { name: string; data: Buffer }[] = [];
const deleted: string[] = [];
let existing: string[] = [];

vi.mock('@/app/lib/firebase/admin', () => ({
  isAdminConfigured: () => true,
  getAdminApp: () => ({}),
  getAdminDatabase: () => ({
    ref: () => ({ once: async () => ({ val: () => ({ traces: { t1: { name: 'Boucle' } } }) }) }),
  }),
}));

vi.mock('firebase-admin/storage', () => ({
  getStorage: () => ({
    bucket: () => ({
      file: (name: string) => ({
        save: async (data: Buffer) => {
          saved.push({ name, data });
        },
        delete: async () => {
          deleted.push(name);
        },
      }),
      getFiles: async () => [[...existing, ...saved.map((s) => s.name)].map((name) => ({ name }))],
    }),
  }),
}));

import { GET, backupFileName, expiredBackups } from '@/app/api/cron/backup-db/route';

describe('backup-db helpers', () => {
  it('names files by UTC date', () => {
    expect(backupFileName(new Date('2026-11-25T23:30:00Z'))).toBe('backups/rtdb-2026-11-25.json.gz');
  });

  it('selects only backups older than the retention window', () => {
    const now = new Date('2026-11-25T03:00:00Z');
    const names = [
      'backups/rtdb-2026-10-25.json.gz', // exactly 31 days → expired
      'backups/rtdb-2026-10-26.json.gz', // 30 days → kept
      'backups/rtdb-2026-11-24.json.gz',
      'backups/other.txt',
    ];
    expect(expiredBackups(names, now, 30)).toEqual(['backups/rtdb-2026-10-25.json.gz']);
  });
});

describe('GET /api/cron/backup-db', () => {
  beforeEach(() => {
    saved.length = 0;
    deleted.length = 0;
    existing = ['backups/rtdb-2020-01-01.json.gz'];
    vi.stubEnv('CRON_SECRET', '');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('writes a gzipped JSON export and prunes expired copies', async () => {
    const res = await GET(new Request('http://localhost/api/cron/backup-db'));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(saved).toHaveLength(1);
    expect(saved[0].name).toMatch(/^backups\/rtdb-\d{4}-\d{2}-\d{2}\.json\.gz$/);
    expect(JSON.parse(gunzipSync(saved[0].data).toString('utf8'))).toEqual({
      traces: { t1: { name: 'Boucle' } },
    });
    expect(deleted).toEqual(['backups/rtdb-2020-01-01.json.gz']);
    expect(data.deleted).toEqual(['backups/rtdb-2020-01-01.json.gz']);
  });

  it('requires the cron bearer token when CRON_SECRET is set', async () => {
    vi.stubEnv('CRON_SECRET', 'example_cron_secret_for_tests_only');
    const res = await GET(new Request('http://localhost/api/cron/backup-db'));
    expect(res.status).toBe(401);
    expect(saved).toHaveLength(0);
  });
});
