import { describe, it, expect } from 'vitest';
import {
  territory,
  getMapLabels,
  getRiverLabels,
  formatCoordinate,
  DEPARTURE_POINT,
  MAP_CREDITS,
} from '@/app/components/carte/territory';

describe('territory sheet data', () => {
  it('is centred on the club meeting point with a real relief range', () => {
    expect(territory.center.lat).toBeCloseTo(50.623, 2);
    expect(territory.center.lon).toBeCloseTo(4.642, 2);
    expect(territory.extentKm).toBe(32);
    expect(territory.elevation.max).toBeGreaterThan(territory.elevation.min);
  });

  it('letters curated places inside the sheet, filtered by priority', () => {
    const all = getMapLabels(3);
    const essentials = getMapLabels(1);
    expect(essentials.length).toBeLessThan(all.length);
    expect(essentials.every((l) => l.priority === 1)).toBe(true);
    const names = all.map((l) => l.name);
    expect(names).toContain('Chastre');
    expect(names).toContain('Gembloux');
    for (const label of all) {
      expect(label.x).toBeGreaterThan(0);
      expect(label.x).toBeLessThan(100);
      expect(label.y).toBeGreaterThan(0);
      expect(label.y).toBeLessThan(100);
    }
  });

  it('names rivers with their article', () => {
    const rivers = getRiverLabels().map((r) => r.name);
    expect(rivers).toContain('La Dyle');
    expect(rivers.every((name) => /^(La|L')/.test(name))).toBe(true);
  });

  it('formats sheet-margin coordinates', () => {
    expect(formatCoordinate(50.62302, 'lat')).toBe('50°37′23″ N');
    expect(formatCoordinate(4.64223, 'lon')).toBe('4°38′32″ E');
    expect(formatCoordinate(-0.5, 'lon')).toBe('0°30′00″ O');
  });

  it('describes the departure point and credits the map sources', () => {
    expect(DEPARTURE_POINT.clubName).toBe('Place de Blanmont');
    expect(DEPARTURE_POINT.osmUrl).toContain('openstreetmap.org');
    expect(MAP_CREDITS).toContain('OpenStreetMap');
  });
});
