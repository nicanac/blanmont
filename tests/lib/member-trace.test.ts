import { describe, it, expect } from 'vitest';
import { memberTraceHref, withMemberTraceLinks } from '@/app/lib/member-trace';

describe('member trace links (#252)', () => {
  it('replaces each source URL with the member link of its event', () => {
    const events = withMemberTraceLinks([
      { id: 'evt-1', gpxUrl: 'https://connect.garmin.com/app/course/532374522' },
      { id: 'evt-2', gpxUrl: '' },
      { id: 'evt-3' },
    ]);
    expect(events[0].gpxUrl).toBe('/api/trace/evt-1');
    expect(events[1].gpxUrl).toBe('');
    expect(events[2].gpxUrl).toBeUndefined();
    expect(JSON.stringify(events)).not.toContain('garmin');
  });

  it('encodes the event id', () => {
    expect(memberTraceHref('a/b')).toBe('/api/trace/a%2Fb');
  });

  it('links every trace of a ride with one per group or distance', () => {
    const [ride] = withMemberTraceLinks([
      {
        id: 'ffbc',
        gpxUrl: 'https://connect.garmin.com/app/course/1',
        traceLabel: '110 km',
        traceId: 'trace_110',
        extraTraces: [
          { label: '80 km', gpxUrl: 'https://connect.garmin.com/app/course/2' },
          { label: '50 km', gpxUrl: 'https://f.io/50.gpx' },
        ],
      },
    ]);
    expect(ride).toEqual({
      id: 'ffbc',
      gpxUrl: '/api/trace/ffbc',
      traceLabel: '110 km',
      traceId: 'trace_110',
      extraTraces: [
        { label: '80 km', gpxUrl: '/api/trace/ffbc?t=1' },
        { label: '50 km', gpxUrl: '/api/trace/ffbc?t=2' },
      ],
    });
    // A guest's page never carries a source URL.
    expect(JSON.stringify(ride)).not.toMatch(/garmin|f\.io/);
  });
});
