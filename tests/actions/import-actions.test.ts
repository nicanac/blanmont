import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  fetchStravaActivityAction,
  importStravaTraceAction,
  deleteTraceAction,
} from '@/app/import/strava/actions';
import { fetchGarminActivityAction } from '@/app/import/garmin/actions';
import * as sessionModule from '@/app/lib/auth/session';
import * as stravaLib from '@/app/lib/strava';
import * as firebaseRoot from '@/app/lib/firebase';
import { cookies } from 'next/headers';

vi.mock('next/headers', () => ({
  cookies: vi.fn(),
}));

describe('Activity Import Server Actions (Strava & Garmin)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('fetchStravaActivityAction', () => {
    it('returns error when url is invalid', async () => {
      const result = await fetchStravaActivityAction('https://example.com/bad-url');
      expect(result.error).toBeDefined();
    });

    it('returns error when strava_access_token cookie is missing', async () => {
      vi.mocked(cookies).mockResolvedValue({
        get: vi.fn().mockReturnValue(undefined),
      } as any);

      const result = await fetchStravaActivityAction('https://www.strava.com/activities/12345678');
      expect(result.error).toMatch(/Not authenticated with Strava/i);
    });

    it('fetches activity when token exists', async () => {
      vi.mocked(cookies).mockResolvedValue({
        get: vi.fn().mockReturnValue({ value: 'valid-token' }),
      } as any);

      const mockActivity = { id: 12345678, name: 'Morning Ride' };
      vi.spyOn(stravaLib, 'getStravaActivity').mockResolvedValue(mockActivity as any);

      const result = await fetchStravaActivityAction('https://www.strava.com/activities/12345678');
      expect(result.success).toBe(true);
      expect(result.activity).toEqual(mockActivity);
    });
  });

  describe('importStravaTraceAction', () => {
    it('requires admin session', async () => {
      vi.spyOn(sessionModule, 'requireAdminSession').mockRejectedValue(new Error('Unauthorized'));

      await expect(
        importStravaTraceAction({
          id: 12345,
          name: 'Test Trace',
          distance: 70000,
        })
      ).rejects.toThrow('Unauthorized');
    });

    it('creates trace with converted distance and photos', async () => {
      vi.spyOn(sessionModule, 'requireAdminSession').mockResolvedValue({ id: 'admin-1', isAdmin: true } as any);
      vi.mocked(cookies).mockResolvedValue({
        get: vi.fn().mockReturnValue({ value: 'valid-token' }),
      } as any);

      vi.spyOn(stravaLib, 'getStravaActivityPhotos').mockResolvedValue([]);
      vi.spyOn(firebaseRoot, 'createTrace').mockResolvedValue({ success: true, id: 'trace-new-1' } as any);

      const result = await importStravaTraceAction({
        id: 12345,
        name: 'Tour des Collines',
        distance: 82000,
        total_elevation_gain: 710,
      });

      expect(result.success).toBe(true);
      expect(firebaseRoot.createTrace).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Tour des Collines',
          distance: 82, // 82000 / 1000
          elevation: 710,
        })
      );
    });
  });

  describe('deleteTraceAction', () => {
    it('requires admin session and deletes trace', async () => {
      vi.spyOn(sessionModule, 'requireAdminSession').mockResolvedValue({ id: 'admin-1', isAdmin: true } as any);
      vi.spyOn(firebaseRoot, 'deleteTrace').mockResolvedValue({ success: true } as any);

      const result = await deleteTraceAction('trace-to-del');
      expect(result.success).toBe(true);
      expect(firebaseRoot.deleteTrace).toHaveBeenCalledWith('trace-to-del');
    });
  });

  describe('fetchGarminActivityAction', () => {
    it('returns error when Garmin URL is invalid', async () => {
      const result = await fetchGarminActivityAction('https://google.com');
      expect(result.error).toBeDefined();
    });

    it('returns activity metadata when Garmin page title is scraped', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        text: async () => '<html><head><title>Sortie Brabant Wallon | Garmin Connect</title></head><body></body></html>',
      } as any);

      const result = await fetchGarminActivityAction('https://connect.garmin.com/modern/activity/123456789');
      expect(result.activity).toBeDefined();
      expect(result.activity?.name).toBe('Sortie Brabant Wallon');
      expect(result.activity?.id).toBe('123456789');
    });
  });
});
