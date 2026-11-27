import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  fetchStravaActivityAction,
  importStravaTraceAction,
  deleteTraceAction,
} from '@/app/import/strava/actions';
import { fetchGarminActivityAction, importGpxTraceAction } from '@/app/import/garmin/actions';
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

  describe('importGpxTraceAction (#254: GPX import writes to Firebase, not Notion)', () => {
    const gpxTrace = {
      name: 'NordEst_Tirlemont_105km',
      distance: 104.5,
      elevation: 796,
      direction: 'North',
      surface: 'Road',
      rating: '⭐⭐⭐',
      description: '',
      polyline: '_p~iF~ps|U_ulLnnqC_mqNvxq`@',
    };

    it('requires admin session', async () => {
      vi.spyOn(sessionModule, 'requireAdminSession').mockRejectedValue(new Error('Unauthorized'));
      const create = vi.spyOn(firebaseRoot, 'createTrace');

      await expect(importGpxTraceAction(gpxTrace)).rejects.toThrow('Unauthorized');
      expect(create).not.toHaveBeenCalled();
    });

    it('creates the trace in Firebase without a Strava connection', async () => {
      vi.spyOn(sessionModule, 'requireAdminSession').mockResolvedValue({ id: 'admin-1', isAdmin: true } as any);
      // No strava_access_token cookie: the GPX import must not depend on it.
      vi.mocked(cookies).mockResolvedValue({ get: vi.fn().mockReturnValue(undefined) } as any);
      const create = vi
        .spyOn(firebaseRoot, 'createTrace')
        .mockResolvedValue({ success: true, id: 'trace_1764260000000' } as any);

      const result = await importGpxTraceAction(gpxTrace);

      expect(result).toEqual({ success: true, traceId: 'trace_1764260000000' });
      expect(create).toHaveBeenCalledWith({
        name: 'NordEst_Tirlemont_105km',
        distance: 104.5,
        elevation: 796,
        direction: 'North',
        surface: 'Road',
        rating: '⭐⭐⭐',
        description: '',
        polyline: '_p~iF~ps|U_ulLnnqC_mqNvxq`@',
        mapUrl: undefined,
      });
    });

    it('keeps the link of a URL import as the map link', async () => {
      vi.spyOn(sessionModule, 'requireAdminSession').mockResolvedValue({ id: 'admin-1', isAdmin: true } as any);
      const create = vi
        .spyOn(firebaseRoot, 'createTrace')
        .mockResolvedValue({ success: true, id: 'trace_2' } as any);

      await importGpxTraceAction({
        ...gpxTrace,
        polyline: undefined,
        mapUrl: 'https://connect.garmin.com/modern/activity/123456789',
      });

      expect(create).toHaveBeenCalledWith(
        expect.objectContaining({
          polyline: undefined,
          mapUrl: 'https://connect.garmin.com/modern/activity/123456789',
        })
      );
    });

    it('refuses an invalid trace with a French message and writes nothing', async () => {
      vi.spyOn(sessionModule, 'requireAdminSession').mockResolvedValue({ id: 'admin-1', isAdmin: true } as any);
      const create = vi.spyOn(firebaseRoot, 'createTrace');

      const result = await importGpxTraceAction({ ...gpxTrace, name: '  ', distance: 0 });

      expect(result.success).toBe(false);
      expect(!result.success && result.error).toContain('Le nom du parcours est requis.');
      expect(!result.success && result.error).toContain('La distance doit être supérieure à 0 km.');
      expect(create).not.toHaveBeenCalled();
    });

    it('returns a fixed message when the database write fails', async () => {
      vi.spyOn(sessionModule, 'requireAdminSession').mockResolvedValue({ id: 'admin-1', isAdmin: true } as any);
      vi.spyOn(firebaseRoot, 'createTrace').mockResolvedValue({
        success: false,
        error: 'Error: PERMISSION_DENIED',
      } as any);

      const result = await importGpxTraceAction(gpxTrace);

      expect(result).toEqual({
        success: false,
        error: 'Le parcours n’a pas pu être enregistré. Réessayez.',
      });
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
