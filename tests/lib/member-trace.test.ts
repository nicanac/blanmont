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
});
