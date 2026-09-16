import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getStravaAuthUrl,
  exchangeToken,
  getStravaActivity,
  getActivityStreams,
  getStravaActivityPhotos,
} from '@/app/lib/strava';

describe('strava API client', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('getStravaAuthUrl', () => {
    it('generates a valid Strava OAuth URL with query params', () => {
      const redirectUri = 'https://blanmont.be/api/auth/strava/callback';
      const url = getStravaAuthUrl(redirectUri);

      expect(url).toContain('https://www.strava.com/oauth/authorize');
      expect(url).toContain(encodeURIComponent(redirectUri));
      expect(url).toContain('scope=activity%3Aread%2Cactivity%3Aread_all');
      expect(url).toContain('response_type=code');
    });
  });

  describe('exchangeToken', () => {
    it('exchanges authorization code for access tokens', async () => {
      const mockResponse = {
        access_token: 'test-strava-access-token',
        refresh_token: 'test-strava-refresh-token',
        expires_at: 1800000000,
        athlete: { id: 12345, firstname: 'Nicolas' },
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      } as any);

      const result = await exchangeToken('auth-code-123');
      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        'https://www.strava.com/oauth/token',
        expect.objectContaining({
          method: 'POST',
        })
      );
    });

    it('throws when Strava token exchange fails', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
      } as any);

      await expect(exchangeToken('invalid-code')).rejects.toThrow(/Failed to exchange Strava token/);
    });
  });

  describe('getStravaActivity', () => {
    it('fetches activity with Bearer authentication', async () => {
      const mockActivity = {
        id: 999888,
        name: 'Sortie des Bosses',
        distance: 72300,
        total_elevation_gain: 550,
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockActivity,
      } as any);

      const result = await getStravaActivity('999888', 'valid-token');
      expect(result).toEqual(mockActivity);
      expect(global.fetch).toHaveBeenCalledWith(
        'https://www.strava.com/api/v3/activities/999888',
        expect.objectContaining({
          headers: { Authorization: 'Bearer valid-token' },
        })
      );
    });
  });

  describe('getActivityStreams & getStravaActivityPhotos', () => {
    it('fetches activity stream data', async () => {
      const mockStreams = {
        latlng: { data: [[50.6, 4.6], [50.61, 4.62]] },
        altitude: { data: [110, 125] },
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockStreams,
      } as any);

      const result = await getActivityStreams('999888', 'valid-token');
      expect(result).toEqual(mockStreams);
    });

    it('fetches activity photos', async () => {
      const mockPhotos = [
        { urls: { '2048': 'https://photo.strava.com/large.jpg' } },
      ];

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockPhotos,
      } as any);

      const result = await getStravaActivityPhotos('999888', 'valid-token');
      expect(result).toEqual(mockPhotos);
    });
  });
});
