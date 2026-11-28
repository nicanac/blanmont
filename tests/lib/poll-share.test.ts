import { describe, it, expect } from 'vitest';
import { buildPollShareMessage, weekendTraces, SONDAGE_URL } from '@/app/lib/poll-share';
import type { CalendarEvent, PollResponse } from '@/app/types';

const event = (isoDate: string, gpxUrl?: string): CalendarEvent => ({
  id: isoDate,
  isoDate,
  location: '',
  distances: '',
  departure: '',
  address: '',
  remarks: '',
  alternative: '',
  group: '',
  gpxUrl,
});

const response = (over: Partial<PollResponse>): PollResponse => ({
  id: Math.random().toString(36),
  pollId: 'p',
  memberId: 'm',
  memberName: 'M',
  updatedAt: '',
  ...over,
});

describe('weekendTraces', () => {
  it('keeps the Saturday and Sunday traces only, across a month end', () => {
    const events = [
      event('2026-11-28', 'https://strava.com/routes/1'),
      event('2026-11-29', 'https://strava.com/routes/2'),
      event('2026-11-30', 'https://strava.com/routes/3'),
      event('2026-11-21', 'https://strava.com/routes/4'),
    ];
    expect(weekendTraces(events, '2026-11-28').map((t) => t.url)).toEqual([
      'https://strava.com/routes/1',
      'https://strava.com/routes/2',
    ]);
    // Saturday 31 Jan → Sunday 1 Feb.
    expect(weekendTraces([event('2027-02-01', 'x'), event('2027-01-31')], '2027-01-31')).toEqual([
      { eventId: '2027-02-01', index: 0, label: '', isoDate: '2027-02-01', url: 'x' },
    ]);
  });

  it('carries the calendar event id for the member GPX download (#259)', () => {
    const ride = { ...event('2026-11-28', 'https://connect.garmin.com/app/course/1'), id: 'evt-42' };
    expect(weekendTraces([ride], '2026-11-28')).toEqual([
      { eventId: 'evt-42', index: 0, label: '', isoDate: '2026-11-28', url: 'https://connect.garmin.com/app/course/1' },
    ]);
  });

  it('lists every trace of a ride with one per group or distance, main trace first', () => {
    const ride = {
      ...event('2026-11-28', 'https://connect.garmin.com/app/course/1'),
      id: 'ffbc',
      traceLabel: '110 km',
      extraTraces: [
        { label: '80 km', gpxUrl: 'https://connect.garmin.com/app/course/2' },
        { gpxUrl: 'https://f.io/50.gpx' },
      ],
    };
    expect(weekendTraces([ride], '2026-11-28')).toEqual([
      { eventId: 'ffbc', index: 0, label: '110 km', isoDate: '2026-11-28', url: 'https://connect.garmin.com/app/course/1' },
      { eventId: 'ffbc', index: 1, label: '80 km', isoDate: '2026-11-28', url: 'https://connect.garmin.com/app/course/2' },
      // An unnamed trace among several is numbered.
      { eventId: 'ffbc', index: 2, label: 'Trace 3', isoDate: '2026-11-28', url: 'https://f.io/50.gpx' },
    ]);
  });
});

describe('buildPollShareMessage', () => {
  const responses = [
    response({ slots: ['samedi-matin'], groupChoice: 'Groupe B', groupVariant: 'plus' }),
    response({ slots: ['samedi-matin', 'dimanche-matin'], groupChoice: 'Groupe A' }),
    response({ slots: ['samedi-matin'], groupChoice: 'Groupe A' }),
    response({}), // absent
  ];
  const groupName = (code: string): string =>
    ({ 'Groupe A': 'GR1', 'Groupe B': 'GR2' })[code] ?? code;

  it('names each trace of a ride that has one per group or distance', () => {
    const msg = buildPollShareMessage({
      poll: { weekendIsoDate: '2026-11-28', status: 'active' },
      responses,
      traces: [
        { isoDate: '2026-11-28', url: 'https://strava.com/routes/1', label: 'GR1' },
        { isoDate: '2026-11-28', url: 'https://strava.com/routes/2', label: 'GR3' },
      ],
      groupName,
    });
    expect(msg).toContain('🗺️ Tracé GPS · Samedi 28 novembre 2026 · GR1 : https://strava.com/routes/1');
    expect(msg).toContain('🗺️ Tracé GPS · Samedi 28 novembre 2026 · GR3 : https://strava.com/routes/2');
  });

  it('prints the slot tally, groups in vote order, traces and the vote link', () => {
    const msg = buildPollShareMessage({
      poll: { weekendIsoDate: '2026-11-28', status: 'active' },
      responses,
      traces: [{ isoDate: '2026-11-28', url: 'https://strava.com/routes/1' }],
      groupName,
    });
    expect(msg).toContain('*3 membres inscrits* · 1 absent');
    expect(msg).toContain('• Samedi matin (8h30) : 3');
    expect(msg).toContain('• Dimanche matin (9h00) : 1');
    expect(msg).toContain('🏁 Groupes : GR1 2 · GR2+ 1');
    expect(msg).toContain('📅 Samedi 28 novembre 2026');
    expect(msg).toContain('🗺️ Tracé GPS · Samedi 28 novembre 2026 : https://strava.com/routes/1');
    expect(msg.endsWith(`🗳️ Votez ici : ${SONDAGE_URL}`)).toBe(true);
  });

  it('skips traces and groups when there are none, and says when votes are closed', () => {
    const msg = buildPollShareMessage({
      poll: { weekendIsoDate: '2026-11-28', status: 'closed' },
      responses: [],
      traces: [],
      groupName,
    });
    expect(msg).not.toContain('Tracé GPS');
    expect(msg).not.toContain('Groupes');
    expect(msg).toContain('*0 membre inscrit*');
    expect(msg).toContain('Votes clôturés');
  });
});
