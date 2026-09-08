import { describe, it, expect } from 'vitest';
import {
  getWindCardinal,
  getWeatherConditionInfo,
  parseHour,
} from '@/app/lib/weather';

describe('weather utils', () => {
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
});
