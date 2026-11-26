import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

const updateMock = vi.fn().mockResolvedValue(undefined);
let tracesData: Record<string, unknown> = {};

vi.mock('@/app/lib/firebase/admin', () => ({
  isAdminConfigured: () => true,
  getAdminDatabase: () => ({
    ref: (path: string) => ({
      once: async () => ({ val: () => (path === 'traces' ? tracesData : null) }),
      update: (data: unknown) => updateMock(path, data),
    }),
  }),
}));

vi.mock('next/cache', () => ({ revalidatePath: vi.fn(), revalidateTag: vi.fn() }));

import {
  GET,
  extractElevation,
  isKomootUrl,
  needsElevation,
  ELEVATION_BATCH_SIZE,
} from '@/app/api/cron/sync-elevation/route';

const KOMOOT = 'https://www.komoot.com/tour/123';

describe('sync-elevation helpers', () => {
  it('recognises Komoot URLs only', () => {
    expect(isKomootUrl(KOMOOT)).toBe(true);
    expect(isKomootUrl('https://www.komoot.fr/tour/968833009')).toBe(true);
    expect(isKomootUrl('https://evilkomoot.com/tour/1')).toBe(false);
    expect(isKomootUrl('http://www.komoot.com/tour/1')).toBe(false);
    expect(isKomootUrl(undefined)).toBe(false);
  });

  it('flags missing, zero or invalid elevation', () => {
    expect(needsElevation(undefined)).toBe(true);
    expect(needsElevation(null)).toBe(true);
    expect(needsElevation(0)).toBe(true);
    expect(needsElevation('abc')).toBe(true);
    expect(needsElevation(476)).toBe(false);
    expect(needsElevation('476')).toBe(false);
  });

  it('extracts elevation_up from plain and escaped JSON', () => {
    expect(extractElevation('{"elevation_up":475.6}')).toBe(476);
    expect(extractElevation('kmtBoot("{\\"elevation_up\\":812.2}")')).toBe(812);
    expect(extractElevation('<html>no data</html>')).toBeNull();
  });
});

describe('GET /api/cron/sync-elevation', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['setTimeout'] });
    updateMock.mockClear();
    vi.stubEnv('CRON_SECRET', '');
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  async function run(request = new Request('http://localhost/api/cron/sync-elevation')) {
    const pending = GET(request);
    await vi.runAllTimersAsync();
    return pending;
  }

  it('updates only Komoot traces with no elevation, in Firebase', async () => {
    tracesData = {
      a: { mapUrl: KOMOOT, elevation: 0 },
      b: { mapUrl: KOMOOT, elevation: 600 },
      c: { mapUrl: 'https://maps.google.com/x', elevation: 0 },
    };
    global.fetch = vi.fn().mockResolvedValue({ ok: true, text: async () => '"elevation_up":321.4' } as Response);

    const res = await run();
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data).toMatchObject({ total: 3, missing: 1, updated: 1, failed: 0, remaining: 0 });
    expect(updateMock).toHaveBeenCalledTimes(1);
    expect(updateMock).toHaveBeenCalledWith('traces/a', expect.objectContaining({ elevation: 321 }));
  });

  it('counts failures when Komoot has no elevation and limits the batch size', async () => {
    tracesData = Object.fromEntries(
      Array.from({ length: ELEVATION_BATCH_SIZE + 5 }, (_, i) => [`t${i}`, { mapUrl: KOMOOT }])
    );
    global.fetch = vi.fn().mockResolvedValue({ ok: true, text: async () => 'nothing' } as Response);

    const data = await (await run()).json();
    expect(data.processed).toBe(ELEVATION_BATCH_SIZE);
    expect(data.failed).toBe(ELEVATION_BATCH_SIZE);
    expect(updateMock).not.toHaveBeenCalled();
  });

  it('requires the cron bearer token when CRON_SECRET is set', async () => {
    vi.stubEnv('CRON_SECRET', 'example_cron_secret_for_tests_only');
    global.fetch = vi.fn();
    const res = await GET(new Request('http://localhost/api/cron/sync-elevation'));
    expect(res.status).toBe(401);
    expect(global.fetch).not.toHaveBeenCalled();
  });
});
