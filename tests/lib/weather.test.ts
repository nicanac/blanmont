import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getWindCardinal,
  getWeatherConditionInfo,
  parseHour,
  getRideWeather,
} from '@/app/lib/weather';

describe('weather utils', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('getWindCardinal', () => {
    it('accurately identifies primary compass directions', () => {
      expect(getWindCardinal(0)).toEqual({ cardinal: 'N', name: 'Nord' });
      expect(getWindCardinal(90)).toEqual({ cardinal: 'E', name: 'Est' });
      expect(getWindCardinal(180)).toEqual({ cardinal: 'S', name: 'Sud' });
      expect(getWindCardinal(270)).toEqual({ cardinal: 'O', name: 'Ouest' });
    });

    it('identifies intercardinal directions', () => {
      expect(getWindCardinal(45)).toEqual({ cardinal: 'NE', name: 'Nord-Est' });
      expect(getWindCardinal(135)).toEqual({ cardinal: 'SE', name: 'Sud-Est' });
      expect(getWindCardinal(225)).toEqual({ cardinal: 'SO', name: 'Sud-Ouest' });
      expect(getWindCardinal(315)).toEqual({ cardinal: 'NO', name: 'Nord-Ouest' });
    });

    it('normalizes degrees outside 0-360 range and handles negative values', () => {
      expect(getWindCardinal(360)).toEqual({ cardinal: 'N', name: 'Nord' });
      expect(getWindCardinal(450)).toEqual({ cardinal: 'E', name: 'Est' });
      expect(getWindCardinal(-90)).toEqual({ cardinal: 'O', name: 'Ouest' });
    });
  });

  describe('getWeatherConditionInfo', () => {
    it('maps standard WMO weather codes to French text and icons', () => {
      expect(getWeatherConditionInfo(0)).toEqual({ condition: 'Ciel dégagé', icon: '☀️' });
      expect(getWeatherConditionInfo(3)).toEqual({ condition: 'Couvert', icon: '☁️' });
      expect(getWeatherConditionInfo(61)).toEqual({ condition: 'Pluie modérée', icon: '🌧️' });
      expect(getWeatherConditionInfo(71)).toEqual({ condition: 'Chutes de neige', icon: '❄️' });
      expect(getWeatherConditionInfo(95)).toEqual({ condition: 'Risque d\'orage', icon: '⛈️' });
    });

    it('falls back to default condition for unrecognized weather codes', () => {
      expect(getWeatherConditionInfo(999)).toEqual({ condition: 'Variable', icon: '⛅' });
    });
  });

  describe('parseHour', () => {
    it('extracts the integer hour from standard French departure formats', () => {
      expect(parseHour('8h30')).toBe(8);
      expect(parseHour('09:00')).toBe(9);
      expect(parseHour('13h')).toBe(13);
      expect(parseHour('14h15')).toBe(14);
    });

    it('defaults to 9 AM when string is missing or invalid', () => {
      expect(parseHour('')).toBe(9);
      expect(parseHour(undefined)).toBe(9);
      expect(parseHour('matin')).toBe(9);
    });
  });

  describe('getRideWeather', () => {
    it('returns null if isoDate is missing or empty', async () => {
      const result = await getRideWeather('');
      expect(result).toBeNull();
    });

    it('returns unavailable forecast if date is in the past or > 14 days ahead', async () => {
      // 30 days in past
      const pastDate = '2020-01-01';
      const result = await getRideWeather(pastDate);
      expect(result).not.toBeNull();
      expect(result?.isAvailable).toBe(false);
      expect(result?.condition).toBe('Prévisions non disponibles');
    });

    it('fetches hourly forecast from Open-Meteo for valid target date within range', async () => {
      const targetDate = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      const mockData = {
        hourly: {
          time: [`${targetDate}T08:00`, `${targetDate}T09:00`, `${targetDate}T10:00`],
          weathercode: [1, 2, 3],
          temperature_2m: [16.2, 18.5, 20.1],
          windspeed_10m: [12.4, 15.0, 14.1],
          winddirection_10m: [45, 90, 180],
          precipitation_probability: [5, 10, 15],
        },
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockData,
      } as any);

      const weather = await getRideWeather(targetDate, '9h00');

      expect(weather).not.toBeNull();
      expect(weather?.isAvailable).toBe(true);
      expect(weather?.temperature).toBe(19); // Math.round(18.5)
      expect(weather?.windCardinal).toBe('E'); // 90 deg
      expect(weather?.precipitationProb).toBe(10);
      expect(weather?.condition).toBe('Éclaircies');
    });

    it('falls back to daily forecast if hourly timestamp is not matched', async () => {
      const targetDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      const mockData = {
        hourly: {
          time: [],
          weathercode: [],
        },
        daily: {
          time: [targetDate],
          weathercode: [0],
          temperature_2m_max: [22.4],
          temperature_2m_min: [12.1],
          windspeed_10m_max: [18.2],
          winddirection_10m_dominant: [225],
          precipitation_probability_max: [20],
        },
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockData,
      } as any);

      const weather = await getRideWeather(targetDate, '14h');

      expect(weather).not.toBeNull();
      expect(weather?.isAvailable).toBe(true);
      expect(weather?.temperature).toBe(22);
      expect(weather?.windCardinal).toBe('SO');
      expect(weather?.condition).toBe('Ciel dégagé');
    });

    it('handles HTTP error responses from Open-Meteo', async () => {
      const targetDate = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
      } as any);

      const weather = await getRideWeather(targetDate);
      expect(weather).toBeNull();
    });

    it('catches network exceptions and returns null', async () => {
      const targetDate = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      global.fetch = vi.fn().mockRejectedValue(new Error('Network offline'));

      const weather = await getRideWeather(targetDate);
      expect(weather).toBeNull();
    });
  });
});
