import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET as getSyncElevation } from '@/app/api/cron/sync-elevation/route';
import { GET as getSyncLeaderboard, POST as postSyncLeaderboard } from '@/app/api/cron/sync-leaderboard/route';
import * as firebaseRoot from '@/app/lib/firebase';

describe('Synchronization Cron Endpoints', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('GET /api/cron/sync-elevation', () => {
    it('returns 500 when NOTION_TOKEN is not configured', async () => {
      const origToken = process.env.NOTION_TOKEN;
      const origKey = process.env.NOTION_KEY;
      delete process.env.NOTION_TOKEN;
      delete process.env.NOTION_KEY;

      try {
        const req = new Request('http://localhost:3000/api/cron/sync-elevation');
        const res = await getSyncElevation(req);

        expect(res.status).toBe(500);
        const data = await res.json();
        expect(data.error).toBe('Missing NOTION_TOKEN');
      } finally {
        if (origToken) process.env.NOTION_TOKEN = origToken;
        if (origKey) process.env.NOTION_KEY = origKey;
      }
    });
  });

  describe('GET & POST /api/cron/sync-leaderboard', () => {
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
