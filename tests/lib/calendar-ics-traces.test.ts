import { describe, it, expect } from 'vitest';
import { generateICalendarFeed } from '@/app/lib/calendar-ics';
import type { CalendarEvent } from '@/app/types';

const ride: CalendarEvent = {
  id: 'ffbc',
  isoDate: '2026-11-28',
  location: 'Blanmont',
  distances: '60-110',
  departure: '8h30',
  address: '',
  remarks: '',
  alternative: '',
  group: '',
  gpxUrl: 'https://connect.garmin.com/app/course/1',
  traceLabel: '110 km',
  extraTraces: [{ label: '60 km', gpxUrl: 'https://www.strava.com/routes/2' }],
};

/** The feed folds long lines (RFC 5545): unfold before reading. */
const unfold = (ics: string): string => ics.replace(/\r?\n[ \t]/g, '');

describe('iCalendar feed: ride traces', () => {
  it('lists every trace of a ride as a member link, never its source URL (#252)', () => {
    const ics = unfold(generateICalendarFeed([ride], 'https://blanmont.be'));
    expect(ics).toContain('Trace GPX (110 km): https://blanmont.be/api/trace/ffbc');
    expect(ics).toContain('Trace GPX (60 km): https://blanmont.be/api/trace/ffbc?t=1');
    expect(ics).not.toMatch(/garmin|strava/);
  });

  it('keeps a single unnamed trace as "Trace GPX"', () => {
    const ics = unfold(generateICalendarFeed([{ ...ride, traceLabel: undefined, extraTraces: undefined }], 'https://x.be'));
    expect(ics).toContain('Trace GPX: https://x.be/api/trace/ffbc');
  });
});
