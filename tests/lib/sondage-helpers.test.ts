import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  parseDistanceValues,
  buildDistanceOptions,
  getUpcomingSaturdayIso,
  getSaturdaySortieDetails,
} from '@/app/lib/sondage-helpers';
import * as calendarDb from '@/app/lib/firebase/calendar';
import * as saturdayRideDb from '@/app/lib/firebase/saturday-ride';
import * as tracesDb from '@/app/lib/firebase/traces';

describe('sondage-helpers', () => {
  describe('parseDistanceValues', () => {
    it('extracts two distances from a dash-separated string', () => {
      const result = parseDistanceValues('70-90');
      expect(result).toEqual([70, 90]);
    });

    it('extracts three distances and sorts them ascending', () => {
      const result = parseDistanceValues('105 - 65 - 85 km');
      expect(result).toEqual([65, 85, 105]);
    });

    it('deduplicates identical distance numbers', () => {
      const result = parseDistanceValues('75, 75, 90');
      expect(result).toEqual([75, 90]);
    });

    it('filters out values below 20km or above 350km', () => {
      const result = parseDistanceValues('5, 12, 70, 95, 450, 999');
      expect(result).toEqual([70, 95]);
    });

    it('returns an empty array for undefined, empty, or non-numeric strings', () => {
      expect(parseDistanceValues(undefined)).toEqual([]);
      expect(parseDistanceValues('')).toEqual([]);
      expect(parseDistanceValues('Sortie découverte sans distance fixe')).toEqual([]);
    });
  });

  describe('buildDistanceOptions', () => {
    it('builds two idiomatic options for 2 distances', () => {
      const options = buildDistanceOptions([70, 90]);
      expect(options).toEqual([
        'Parcours court (~70 km)',
        'Parcours long (~90 km)',
      ]);
    });

    it('builds three tiered options for 3 distances', () => {
      const options = buildDistanceOptions([65, 85, 110]);
      expect(options).toEqual([
        'Petit parcours (~65 km)',
        'Moyen parcours (~85 km)',
        'Grand parcours (~110 km)',
      ]);
    });

    it('builds numbered options when more than 3 distances', () => {
      const options = buildDistanceOptions([50, 70, 90, 120]);
      expect(options).toEqual([
        'Parcours ~50 km',
        'Parcours ~70 km',
        'Parcours ~90 km',
        'Parcours ~120 km',
      ]);
    });

    it('builds official + raccourcie option when only 1 distance', () => {
      const options = buildDistanceOptions([85]);
      expect(options).toEqual([
        'Parcours officiel (~85 km)',
        'Option raccourcie',
      ]);
    });

    it('falls back to splitting rawStr when numbers array is empty but raw text has parts', () => {
      const options = buildDistanceOptions([], 'Flèche Brabançonne / Option cool');
      expect(options.length).toBe(2);
      expect(options[0]).toBe('Flèche Brabançonne km');
      expect(options[1]).toBe('Option cool km');
    });

    it('returns standard defaults when no distance is specified', () => {
      const options = buildDistanceOptions([]);
      expect(options).toEqual([
        'Option courte (~70 km)',
        'Option moyenne (~90 km)',
        'Option longue (~115 km)',
      ]);
    });
  });

  describe('getUpcomingSaturdayIso', () => {
    it('returns a valid YYYY-MM-DD ISO date string', () => {
      const iso = getUpcomingSaturdayIso();
      expect(iso).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it('always falls on a Saturday', () => {
      const iso = getUpcomingSaturdayIso();
      const [y, m, d] = iso.split('-').map(Number);
      const date = new Date(y, m - 1, d);
      expect(date.getDay()).toBe(6); // 6 is Saturday
    });
  });

  describe('getSaturdaySortieDetails', () => {
    beforeEach(() => {
      vi.restoreAllMocks();
    });

    it('aggregates information from matching calendar event', async () => {
      vi.spyOn(calendarDb, 'getCalendarEvents').mockResolvedValue([
        {
          id: 'event-test-1',
          isoDate: '2026-04-18',
          location: 'Walhain',
          departure: '9h00',
          distances: '75-95',
          address: 'Place communale',
          remarks: 'Pause café à mi-parcours',
        } as any,
      ]);
      vi.spyOn(saturdayRideDb, 'getAllRides').mockResolvedValue([]);

      const details = await getSaturdaySortieDetails('2026-04-18');

      expect(details.found).toBe(true);
      expect(details.source).toBe('calendar');
      expect(details.location).toBe('Walhain');
      expect(details.departure).toBe('9h00');
      expect(details.distanceList).toEqual([75, 95]);
      expect(details.distanceOptions).toEqual([
        'Parcours court (~75 km)',
        'Parcours long (~95 km)',
      ]);
      expect(details.suggestedTitle).toContain('2026-04-18');
      expect(details.suggestedDescription).toContain('Walhain');
      expect(details.suggestedDescription).toContain('Pause café à mi-parcours');
    });

    it('aggregates information from SaturdayRide with candidate traces', async () => {
      vi.spyOn(calendarDb, 'getCalendarEvents').mockResolvedValue([]);
      vi.spyOn(saturdayRideDb, 'getAllRides').mockResolvedValue([
        {
          id: 'ride-test-1',
          date: '2026-04-25',
          candidateTraceIds: ['trace-1', 'trace-2'],
        } as any,
      ]);

      vi.spyOn(tracesDb, 'getTrace').mockImplementation(async (id) => {
        if (id === 'trace-1') {
          return { id: 'trace-1', name: 'Boucle Hesbignonne', distance: 78.4, elevation: 320 } as any;
        }
        return { id: 'trace-2', name: 'Grand Tour Namurois', distance: 104.2, elevation: 750 } as any;
      });

      const details = await getSaturdaySortieDetails('2026-04-25');

      expect(details.found).toBe(true);
      expect(details.source).toBe('saturday-ride');
      expect(details.distanceList).toEqual([78, 104]);
      expect(details.distanceOptions[0]).toBe('Boucle Hesbignonne (~78 km • 320m D+)');
      expect(details.distanceOptions[1]).toBe('Grand Tour Namurois (~104 km • 750m D+)');
    });

    it('handles dates with no events found gracefully', async () => {
      vi.spyOn(calendarDb, 'getCalendarEvents').mockResolvedValue([]);
      vi.spyOn(saturdayRideDb, 'getAllRides').mockResolvedValue([]);

      const details = await getSaturdaySortieDetails('2026-12-26');

      expect(details.found).toBe(false);
      expect(details.source).toBe('none');
      expect(details.location).toBe('Blanmont');
      expect(details.departure).toBe('8h30');
      expect(details.distanceOptions).toEqual([
        'Option courte (~70 km)',
        'Option moyenne (~90 km)',
        'Option longue (~115 km)',
      ]);
    });
  });
});
