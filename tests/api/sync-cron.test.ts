import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET as getSyncLeaderboard, POST as postSyncLeaderboard } from '@/app/api/cron/sync-leaderboard/route';
import * as firebaseRoot from '@/app/lib/firebase';

describe('Synchronization Cron Endpoints', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
    vi.stubEnv(
      'LEADERBOARD_SHEET_CSV_URL',
      'https://docs.google.com/spreadsheets/d/example-sheet-id/export?format=csv&gid=0'
    );
  });

  describe('GET & POST /api/cron/sync-leaderboard', () => {
    it('returns 500 without fetching when LEADERBOARD_SHEET_CSV_URL is missing', async () => {
      vi.stubEnv('LEADERBOARD_SHEET_CSV_URL', '');
      global.fetch = vi.fn();

      const res = await getSyncLeaderboard();
      expect(res.status).toBe(500);
      expect((await res.json()).error).toContain('LEADERBOARD_SHEET_CSV_URL');
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('rejects requests without the cron bearer token when CRON_SECRET is set', async () => {
      vi.stubEnv('CRON_SECRET', 'example_cron_secret_for_tests_only');
      global.fetch = vi.fn();

      const res = await getSyncLeaderboard(new Request('http://localhost:3000/api/cron/sync-leaderboard'));
      expect(res.status).toBe(401);
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('returns 500 when Google Sheet CSV fetch fails', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
      } as any);

      const res = await getSyncLeaderboard();
      expect(res.status).toBe(500);
      const data = await res.json();
      expect(data.error).toContain('Failed to fetch CSV');
    });

    it('returns 400 when CSV content is empty or invalid', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        text: async () => 'SingleHeaderLineOnly\n',
      } as any);

      const res = await getSyncLeaderboard();
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toMatch(/CSV file is empty or invalid/);
    });

    it('processes CSV rows, updates attendance and leaderboard carres, and returns 200', async () => {
      const mockCsv = [
        'groupe,prénom,Nom,∑,16/05,23/05',
        'A,Julien,Cycliste,2,1,2',
      ].join('\n');

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        text: async () => mockCsv,
      } as any);

      vi.spyOn(firebaseRoot, 'getCalendarEvents').mockResolvedValue([
        {
          id: 'ev-16mai',
          isoDate: '2026-05-16',
          location: 'Blanmont',
        } as any,
      ]);

      vi.spyOn(firebaseRoot, 'getLeaderboardEntries').mockResolvedValue([
        {
          id: 'lb-1',
          name: 'Julien Cycliste',
          group: 'A',
          rides: 1,
          dates: ['16/05/2026'],
        } as any,
      ]);

      vi.spyOn(firebaseRoot, 'setEventAttendance').mockResolvedValue({ success: true } as any);
      vi.spyOn(firebaseRoot, 'updateLeaderboardEntry').mockResolvedValue({ success: true } as any);
      vi.spyOn(firebaseRoot, 'createCalendarEvent').mockResolvedValue({ success: true, id: 'ev-23mai' } as any);

      const res = await getSyncLeaderboard();
      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.message).toContain('Firebase leaderboard sync complete');
      expect(data.stats).toBeDefined();

      // Also verify POST handler delegates to GET
      const postRes = await postSyncLeaderboard();
      expect(postRes.status).toBe(200);
    });
  });
});
