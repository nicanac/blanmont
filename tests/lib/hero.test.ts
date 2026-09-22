import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  normalizeHeroSettings,
  getHeroSettings,
  updateHeroSettings,
  DEFAULT_HERO_SETTINGS,
} from '@/app/lib/firebase/hero';
import * as adminModule from '@/app/lib/firebase/admin';

// Mock client.isMockMode as false by default to test database path
vi.mock('@/app/lib/firebase/client', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/app/lib/firebase/client')>();
  return {
    ...actual,
    isMockMode: false,
  };
});

describe('Firebase Hero Service (app/lib/firebase/hero.ts)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('normalizeHeroSettings', () => {
    it('returns DEFAULT_HERO_SETTINGS when input is null, undefined or not an object', () => {
      expect(normalizeHeroSettings(null)).toEqual(DEFAULT_HERO_SETTINGS);
      expect(normalizeHeroSettings(undefined)).toEqual(DEFAULT_HERO_SETTINGS);
      expect(normalizeHeroSettings('not-an-object')).toEqual(DEFAULT_HERO_SETTINGS);
    });

    it('falls back to default slides when slides array is empty or contains invalid items', () => {
      const normalized = normalizeHeroSettings({
        badge: 'Mon Club',
        slides: [],
      });

      expect(normalized.badge).toBe('Mon Club');
      expect(normalized.slides).toEqual(DEFAULT_HERO_SETTINGS.slides);
    });

    it('sanitizes valid slides and pads cards if fewer than 4 are provided', () => {
      const customData = {
        badge: 'Peloton Test',
        slides: [
          {
            id: 'custom-1',
            url: 'https://example.com/slide.jpg',
            alt: 'Photo Test',
            position: 'top center',
          },
        ],
        cards: [
          {
            id: 'c1',
            label: 'Départ',
            value: '09h00',
            icon: 'calendar',
          },
        ],
      };

      const normalized = normalizeHeroSettings(customData);
      expect(normalized.badge).toBe('Peloton Test');
      expect(normalized.slides).toHaveLength(1);
      expect(normalized.slides[0].url).toBe('https://example.com/slide.jpg');
      expect(normalized.cards).toHaveLength(4); // Padded up to 4
      expect(normalized.cards[0].label).toBe('Départ');
      expect(normalized.cards[1].id).toBe(DEFAULT_HERO_SETTINGS.cards[1].id);
    });
  });

  describe('getHeroSettings', () => {
    it('fetches hero settings from Realtime Database and normalizes them', async () => {
      const mockSettings = {
        badge: 'Custom Badge',
        slides: [
          {
            id: 's-1',
            url: 'https://images.unsplash.com/photo-1',
            alt: 'Cycling',
            position: 'center',
          },
        ],
        cards: DEFAULT_HERO_SETTINGS.cards,
      };

      const onceMock = vi.fn().mockResolvedValue({
        exists: () => true,
        val: () => mockSettings,
      });
      const refMock = vi.fn().mockReturnValue({ once: onceMock });
      vi.spyOn(adminModule, 'getAdminDatabase').mockReturnValue({ ref: refMock } as any);

      const result = await getHeroSettings();
      expect(result.badge).toBe('Custom Badge');
      expect(refMock).toHaveBeenCalledWith('hero-settings');
    });

    it('returns DEFAULT_HERO_SETTINGS when snapshot does not exist', async () => {
      const onceMock = vi.fn().mockResolvedValue({
        exists: () => false,
        val: () => null,
      });
      const refMock = vi.fn().mockReturnValue({ once: onceMock });
      vi.spyOn(adminModule, 'getAdminDatabase').mockReturnValue({ ref: refMock } as any);

      const result = await getHeroSettings();
      expect(result).toEqual(DEFAULT_HERO_SETTINGS);
    });

    it('catches database errors and falls back to DEFAULT_HERO_SETTINGS', async () => {
      const refMock = vi.fn().mockReturnValue({
        once: vi.fn().mockRejectedValue(new Error('Firebase DB timeout')),
      });
      vi.spyOn(adminModule, 'getAdminDatabase').mockReturnValue({ ref: refMock } as any);

      const result = await getHeroSettings();
      expect(result).toEqual(DEFAULT_HERO_SETTINGS);
    });
  });

  describe('updateHeroSettings', () => {
    it('normalizes and sets hero settings in database', async () => {
      const setMock = vi.fn().mockResolvedValue(undefined);
      const refMock = vi.fn().mockReturnValue({ set: setMock });
      vi.spyOn(adminModule, 'getAdminDatabase').mockReturnValue({ ref: refMock } as any);

      const input = {
        ...DEFAULT_HERO_SETTINGS,
        badge: 'Updated Badge',
      };

      const updated = await updateHeroSettings(input);
      expect(updated.badge).toBe('Updated Badge');
      expect(refMock).toHaveBeenCalledWith('hero-settings');
      expect(setMock).toHaveBeenCalledWith(
        expect.objectContaining({
          badge: 'Updated Badge',
        })
      );
    });
  });
});
