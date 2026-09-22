import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getCalendarEvents,
  createCalendarEvent,
  updateCalendarEvent,
  deleteCalendarEvent,
  getNextScheduledRide,
} from '@/app/lib/firebase/calendar';
import * as adminModule from '@/app/lib/firebase/admin';
import { CalendarEvent } from '@/app/types';

vi.mock('@/app/lib/firebase/client', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/app/lib/firebase/client')>();
  return {
    ...actual,
    isMockMode: false,
    useNotionFallback: false,
    getFirebaseDatabase: vi.fn(),
    ref: vi.fn((db, path) => ({ db, path })),
    get: vi.fn(),
    set: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
    snapshotToArray: vi.fn((snap) => {
      const arr: any[] = [];
      snap.forEach((child: any) => {
        arr.push({ id: child.key, ...child.val() });
      });
      return arr;
    }),
  };
});

describe('Firebase Calendar Service (app/lib/firebase/calendar.ts)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('getCalendarEvents', () => {
    it('fetches calendar events on server side and sorts chronologically', async () => {
      const mockItems = [
        { key: 'ev-2', val: () => ({ isoDate: '2026-06-15', location: 'Blanmont' }) },
        { key: 'ev-1', val: () => ({ isoDate: '2026-05-10', location: 'Villers' }) },
      ];

      const snapshot = {
        exists: () => true,
        forEach: (cb: (item: any) => void) => mockItems.forEach(cb),
      };

      const onceMock = vi.fn().mockResolvedValue(snapshot);
      const refMock = vi.fn().mockReturnValue({ once: onceMock });
      vi.spyOn(adminModule, 'getAdminDatabase').mockReturnValue({ ref: refMock } as any);

      const events = await getCalendarEvents();
      expect(events).toHaveLength(2);
      expect(events[0].id).toBe('ev-1');
      expect(events[1].id).toBe('ev-2');
    });

    it('returns empty array when snapshot does not exist', async () => {
      const snapshot = { exists: () => false };
      const onceMock = vi.fn().mockResolvedValue(snapshot);
      const refMock = vi.fn().mockReturnValue({ once: onceMock });
      vi.spyOn(adminModule, 'getAdminDatabase').mockReturnValue({ ref: refMock } as any);

      const events = await getCalendarEvents();
      expect(events).toEqual([]);
    });

    it('catches error and returns empty array on failure', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      vi.spyOn(adminModule, 'getAdminDatabase').mockImplementation(() => {
        throw new Error('DB Error');
      });

      const events = await getCalendarEvents();
      expect(events).toEqual([]);
      expect(consoleSpy).toHaveBeenCalled();
    });
  });

  describe('createCalendarEvent', () => {
    it('saves a new event using admin database on server side', async () => {
      const setMock = vi.fn().mockResolvedValue(undefined);
      const refMock = vi.fn().mockReturnValue({ set: setMock });
      vi.spyOn(adminModule, 'getAdminDatabase').mockReturnValue({ ref: refMock } as any);

      const result = await createCalendarEvent({
        isoDate: '2026-07-20',
        title: 'Sortie d’été',
        location: 'Place de Blanmont',
        departure: '8h30',
      });

      expect(result.success).toBe(true);
      expect(result.id).toMatch(/^event_/);
      expect(setMock).toHaveBeenCalled();
      const payload = setMock.mock.calls[0][0];
      expect(payload.isoDate).toBe('2026-07-20');
      expect(payload.createdAt).toBeDefined();
    });

    it('returns error when create fails', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      vi.spyOn(adminModule, 'getAdminDatabase').mockImplementation(() => {
        throw new Error('Insert failed');
      });

      const result = await createCalendarEvent({
        isoDate: '2026-07-20',
        title: 'Sortie',
        location: 'Blanmont',
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Insert failed');
      expect(consoleSpy).toHaveBeenCalled();
    });
  });

  describe('updateCalendarEvent & deleteCalendarEvent', () => {
    it('updates event with updatedAt timestamp', async () => {
      const updateMock = vi.fn().mockResolvedValue(undefined);
      const refMock = vi.fn().mockReturnValue({ update: updateMock });
      vi.spyOn(adminModule, 'getAdminDatabase').mockReturnValue({ ref: refMock } as any);

      const result = await updateCalendarEvent('event-123', {
        remarks: 'Parcours modifié suite à des travaux',
      });

      expect(result.success).toBe(true);
      expect(updateMock).toHaveBeenCalled();
      const payload = updateMock.mock.calls[0][0];
      expect(payload.remarks).toBe('Parcours modifié suite à des travaux');
      expect(payload.updatedAt).toBeDefined();
    });

    it('removes event by ID', async () => {
      const removeMock = vi.fn().mockResolvedValue(undefined);
      const refMock = vi.fn().mockReturnValue({ remove: removeMock });
      vi.spyOn(adminModule, 'getAdminDatabase').mockReturnValue({ ref: refMock } as any);

      const result = await deleteCalendarEvent('event-to-remove');
      expect(result.success).toBe(true);
      expect(removeMock).toHaveBeenCalled();
    });
  });

  describe('getNextScheduledRide', () => {
    it('selects exact match on next Saturday', () => {
      const now = new Date();
      const daysUntilSat = (6 - now.getDay() + 7) % 7;
      const nextSat = new Date(now.getFullYear(), now.getMonth(), now.getDate() + daysUntilSat);
      const satIso = `${nextSat.getFullYear()}-${String(nextSat.getMonth() + 1).padStart(2, '0')}-${String(nextSat.getDate()).padStart(2, '0')}`;

      const events: CalendarEvent[] = [
        {
          id: 'sat-ev',
          isoDate: satIso,
          title: 'Sortie Samedi',
          location: 'Gare de Chastre',
          departure: '08:45',
          distances: '75',
          remarks: 'Vérifier la météo',
          gpxUrl: 'https://komoot.com/tour/123',
          group: 'Groupe A',
        },
      ];

      const ride = getNextScheduledRide(events);
      expect(ride.isCustomEvent).toBe(true);
      expect(ride.isoDate).toBe(satIso);
      expect(ride.location).toBe('Gare de Chastre');
      expect(ride.departure).toBe('08:45');
      expect(ride.distances).toBe('75 km');
      expect(ride.remarks).toBe('Vérifier la météo');
      expect(ride.gpxUrl).toBe('https://komoot.com/tour/123');
    });

    it('selects exact match on next Sunday when Saturday has no event', () => {
      const now = new Date();
      const daysUntilSat = (6 - now.getDay() + 7) % 7;
      const nextSun = new Date(now.getFullYear(), now.getMonth(), now.getDate() + daysUntilSat + 1);
      const sunIso = `${nextSun.getFullYear()}-${String(nextSun.getMonth() + 1).padStart(2, '0')}-${String(nextSun.getDate()).padStart(2, '0')}`;

      const events: CalendarEvent[] = [
        {
          id: 'sun-ev',
          isoDate: sunIso,
          title: 'Rando Dimanche',
          location: 'Place Communale',
          departure: '09:00',
          distances: '60 km', // Already contains km
        },
      ];

      const ride = getNextScheduledRide(events);
      expect(ride.isCustomEvent).toBe(true);
      expect(ride.isoDate).toBe(sunIso);
      expect(ride.distances).toBe('60 km');
    });

    it('selects closest future event when weekend has no match', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 14);
      const futureIso = `${futureDate.getFullYear()}-${String(futureDate.getMonth() + 1).padStart(2, '0')}-${String(futureDate.getDate()).padStart(2, '0')}`;

      const events: CalendarEvent[] = [
        {
          id: 'fut-ev',
          isoDate: futureIso,
          title: 'Brevet Longue Distance',
          location: 'Namur',
          departure: '07:00',
        },
      ];

      const ride = getNextScheduledRide(events);
      expect(ride.isCustomEvent).toBe(true);
      expect(ride.isoDate).toBe(futureIso);
      expect(ride.location).toBe('Namur');
    });

    it('falls back to default weekly ride when no future events are scheduled', () => {
      const pastEvents: CalendarEvent[] = [
        {
          id: 'past-ev',
          isoDate: '2020-01-01',
          title: 'Ancienne sortie',
        },
      ];

      const ride = getNextScheduledRide(pastEvents);
      expect(ride.isCustomEvent).toBe(false);
      expect(ride.location).toBe('Place de Blanmont (Chastre)');
      expect(ride.departure).toBe('8h30');
      expect(ride.distances).toBe('Groupes A, B, C & VTT');
    });
  });
});
