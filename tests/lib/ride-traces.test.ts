import { describe, it, expect } from 'vitest';
import {
  MAX_RIDE_TRACES,
  rideTraceFields,
  rideTraceLinks,
  rideTraceRows,
  rideTraces,
  rideTraceTitle,
  traceDownloadLabel,
  traceLabelSuggestions,
  withRideTraces,
  hasRideTrace,
} from '@/app/lib/ride-traces';

const FFBC = {
  gpxUrl: 'https://connect.garmin.com/app/course/1',
  traceId: 'trace_110',
  traceLabel: '110 km',
  extraTraces: [
    { label: '80 km', gpxUrl: 'https://connect.garmin.com/app/course/2', traceId: 'trace_80' },
    { gpxUrl: 'https://f.io/50.gpx' },
  ],
};

describe('ride traces (one per group or distance)', () => {
  it('lists the main trace first, then the others, with their position', () => {
    expect(rideTraces(FFBC)).toEqual([
      { index: 0, label: '110 km', traceId: 'trace_110', gpxUrl: 'https://connect.garmin.com/app/course/1' },
      { index: 1, label: '80 km', traceId: 'trace_80', gpxUrl: 'https://connect.garmin.com/app/course/2' },
      { index: 2, gpxUrl: 'https://f.io/50.gpx' },
    ]);
  });

  it('reads a single-trace ride as before', () => {
    expect(rideTraces({ gpxUrl: 'https://x.io/a.gpx' })).toEqual([{ index: 0, gpxUrl: 'https://x.io/a.gpx' }]);
    expect(rideTraces({ gpxUrl: '' })).toEqual([]);
    expect(rideTraces(null)).toEqual([]);
    expect(hasRideTrace({ gpxUrl: '  ' })).toBe(false);
  });

  it('skips empty traces and reads RTDB arrays stored as objects', () => {
    const ride = {
      gpxUrl: '',
      extraTraces: { 0: { gpxUrl: 'https://x.io/a.gpx', label: ' GR1 ' }, 2: { gpxUrl: '' } } as never,
    };
    // Without a main link, the first other trace takes index 0: the server reads it the same way.
    expect(rideTraces(ride)).toEqual([{ index: 0, label: 'GR1', gpxUrl: 'https://x.io/a.gpx' }]);
  });

  it('names a trace by its label, by its number among several, or not at all when alone', () => {
    expect(rideTraceTitle({ index: 1, label: 'GR3' }, 3)).toBe('GR3');
    expect(rideTraceTitle({ index: 2 }, 3)).toBe('Trace 3');
    expect(rideTraceTitle({ index: 0 }, 1)).toBe('');
    expect(traceDownloadLabel('')).toBe('Télécharger la trace GPX');
    expect(traceDownloadLabel('GR1')).toBe('Télécharger la trace GPX · GR1');
  });

  it('gives the download links of a ride', () => {
    expect(rideTraceLinks(FFBC).map((l) => [l.index, l.title])).toEqual([
      [0, '110 km'],
      [1, '80 km'],
      [2, 'Trace 3'],
    ]);
  });

  it('splits a list into the stored fields; null removes a key', () => {
    expect(
      rideTraceFields([
        { label: 'GR1', gpxUrl: 'https://a.io/1.gpx', traceId: 't1' },
        { label: '', gpxUrl: '' },
        { label: 'GR3', gpxUrl: 'https://a.io/3.gpx' },
      ])
    ).toEqual({
      gpxUrl: 'https://a.io/1.gpx',
      traceId: 't1',
      traceLabel: 'GR1',
      extraTraces: [{ label: 'GR3', gpxUrl: 'https://a.io/3.gpx' }],
    });
    expect(rideTraceFields([{ gpxUrl: 'https://a.io/1.gpx' }])).toEqual({
      gpxUrl: 'https://a.io/1.gpx',
      traceId: null,
      traceLabel: null,
      extraTraces: null,
    });
    expect(rideTraceFields([])).toEqual({ gpxUrl: '', traceId: null, traceLabel: null, extraTraces: null });
  });

  it('never stores undefined (RTDB rejects it)', () => {
    const { extraTraces } = rideTraceFields([{ gpxUrl: 'https://a' }, { gpxUrl: 'https://b', label: undefined }]);
    expect(extraTraces).toEqual([{ gpxUrl: 'https://b' }]);
    expect(Object.keys(extraTraces![0])).toEqual(['gpxUrl']);
  });

  it('replaces the traces of a ride, dropping the keys that become empty', () => {
    const ride = { id: 'r', ...FFBC };
    expect(withRideTraces(ride, [{ gpxUrl: '/api/trace/r' }])).toEqual({ id: 'r', gpxUrl: '/api/trace/r' });
  });

  it('turns a stored ride into form rows, at least one', () => {
    expect(rideTraceRows(FFBC)).toEqual([
      { label: '110 km', traceId: 'trace_110', gpxUrl: 'https://connect.garmin.com/app/course/1' },
      { label: '80 km', traceId: 'trace_80', gpxUrl: 'https://connect.garmin.com/app/course/2' },
      { label: '', traceId: '', gpxUrl: 'https://f.io/50.gpx' },
    ]);
    expect(rideTraceRows({})).toEqual([{ label: '', traceId: '', gpxUrl: '' }]);
  });

  it('offers group names and the announced distances as labels', () => {
    expect(traceLabelSuggestions(['GR1', 'GR2', ' '], '65-85-105 km')).toEqual([
      'GR1',
      'GR2',
      '65 km',
      '85 km',
      '105 km',
    ]);
    expect(traceLabelSuggestions(['GR1'], undefined)).toEqual(['GR1']);
  });

  it('caps a ride at a handful of traces', () => {
    expect(MAX_RIDE_TRACES).toBe(6);
  });
});
