import { describe, it, expect } from 'vitest';
import {
  parseIsoDate,
  departureDateParts,
  windAdvice,
  cardinalName,
  tallyPoll,
  localTodayIso,
  upcomingEvents,
  formatDistance,
  humanizePollTitle,
  humanizeAddress,
} from '@/app/components/home/homeData';
import type { CalendarEvent, PollResponse } from '@/app/types';

function response(partial: Partial<PollResponse>): PollResponse {
  return {
    id: partial.id ?? Math.random().toString(36).slice(2),
    pollId: 'poll-1',
    memberId: partial.memberId ?? 'm',
    memberName: partial.memberName ?? 'Membre',
    dayChoice: partial.dayChoice ?? 'samedi',
    groupChoice: partial.groupChoice ?? 'Groupe A',
    updatedAt: '2026-09-20T08:00:00.000Z',
  };
}

function event(partial: Partial<CalendarEvent>): CalendarEvent {
  return {
    id: partial.id ?? partial.isoDate ?? 'e',
    isoDate: partial.isoDate ?? '2026-09-26',
    location: partial.location ?? 'Blanmont',
    distances: partial.distances ?? '80-110',
    departure: partial.departure ?? '8h30',
    address: partial.address ?? 'FECHERE',
    remarks: '',
    alternative: '',
    group: '',
  };
}

describe('home sheet data helpers', () => {
  it('parses ISO dates as local calendar dates without UTC shifts', () => {
    const date = parseIsoDate('2026-09-26');
    expect(date?.getFullYear()).toBe(2026);
    expect(date?.getMonth()).toBe(8);
    expect(date?.getDate()).toBe(26);
    expect(parseIsoDate('not-a-date')).toBeNull();
  });

  it('splits a departure date into French display parts', () => {
    const parts = departureDateParts('2026-09-26');
    expect(parts.weekday).toBe('Samedi');
    expect(parts.dayMonth).toBe('26 septembre');
    expect(parts.day).toBe('26');
    expect(parts.monthShort).toBe('sept');
  });

  it('advises riding out into the wind and home with it', () => {
    expect(windAdvice({ windSpeed: 18, windCardinal: 'SO' })).toBe(
      'Partir face au vent, vers le sud-ouest, et rentrer vent dans le dos.'
    );
    expect(windAdvice({ windSpeed: 6, windCardinal: 'N' })).toBe(
      'Vent faible : tous les parcours se valent.'
    );
    expect(windAdvice(null)).toBeNull();
    expect(cardinalName('NO')).toBe('nord-ouest');
  });

  it('tallies weekend poll responses by day and group', () => {
    const tally = tallyPoll([
      response({ dayChoice: 'samedi', groupChoice: 'Groupe A' }),
      response({ dayChoice: 'les-deux', groupChoice: 'Groupe B' }),
      response({ dayChoice: 'dimanche', groupChoice: 'Groupe VTT' }),
      response({ dayChoice: 'absent', groupChoice: 'Groupe C' }),
      response({ dayChoice: 'samedi', groupChoice: 'Autre' }),
    ]);
    expect(tally.total).toBe(5);
    expect(tally.riders).toBe(4);
    expect(tally.saturday).toBe(3);
    expect(tally.sunday).toBe(2);
    expect(tally.both).toBe(1);
    expect(tally.absent).toBe(1);
    expect(tally.byGroup).toEqual({ A: 1, B: 1, C: 0, VTT: 1, Autre: 1 });
  });

  it('lists upcoming events in chronological order from today', () => {
    const events = [
      event({ id: 'late', isoDate: '2026-10-10' }),
      event({ id: 'past', isoDate: '2026-09-01' }),
      event({ id: 'sat-9', isoDate: '2026-09-26', departure: '9h' }),
      event({ id: 'sat-8', isoDate: '2026-09-26', departure: '8h30' }),
    ];
    const list = upcomingEvents(events, '2026-09-23', 3);
    expect(list.map((e) => e.id)).toEqual(['sat-8', 'sat-9', 'late']);
  });

  it('formats local today and distances', () => {
    expect(localTodayIso(new Date(2026, 8, 3))).toBe('2026-09-03');
    expect(formatDistance('80-110')).toBe('80-110 km');
    expect(formatDistance('120 km')).toBe('120 km');
    expect(formatDistance('  ')).toBeNull();
    expect(formatDistance(undefined)).toBeNull();
  });

  it('humanizes auto-generated poll titles', () => {
    expect(humanizePollTitle('Sortie du Weekend - 2026-09-26 (Blanmont)')).toBe(
      'Sortie du week-end · 26 septembre (Blanmont)'
    );
  });

  it('expands the meeting-point shorthand into its place name', () => {
    expect(humanizeAddress('FECHERE')).toBe('Place de la Féchère');
    expect(humanizeAddress(' Féchère ')).toBe('Place de la Féchère');
    expect(humanizeAddress('Salle St Eloi - Rue du Blanc Bois 29')).toBe('Salle St Eloi - Rue du Blanc Bois 29');
    expect(humanizeAddress('')).toBeNull();
  });
});
