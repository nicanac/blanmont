import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from '../../app/api/gpx/stats/route';
import { NextRequest } from 'next/server';

const mockGpxData = `
<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="Blanmont">
  <trk>
    <trkseg>
      <trkpt lat="50.6094" lon="4.6833"><ele>100</ele></trkpt>
      <trkpt lat="50.6194" lon="4.6833"><ele>150</ele></trkpt>
    </trkseg>
  </trk>
</gpx>
`;

const mockMultiLineGpxData = `
<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="Blanmont">
  <trk>
    <trkseg>
      <trkpt lat="50.6094" lon="4.6833"><ele>100</ele></trkpt>
      <trkpt lat="50.6194" lon="4.6833"><ele>150</ele></trkpt>
    </trkseg>
    <trkseg>
      <trkpt lat="50.6294" lon="4.6833"><ele>150</ele></trkpt>
      <trkpt lat="50.6394" lon="4.6833"><ele>200</ele></trkpt>
    </trkseg>
  </trk>
</gpx>
`;

const createMockRequest = (url: string) => {
  return new NextRequest(new URL(`http://localhost:3000/api/gpx/stats?url=${encodeURIComponent(url)}`));
};

describe('GET /api/gpx/stats', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('rejects invalid or local URLs', async () => {
    const urls = [
      'http://example.com/test.gpx', // not https
      'https://localhost/test.gpx',
      'https://127.0.0.1/test.gpx',
      'https://192.168.1.1/test.gpx',
      'https://169.254.169.254/test.gpx'
    ];

    for (const url of urls) {
      const req = createMockRequest(url);
      const res = await GET(req);
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toBe('Invalid or disallowed URL');
    }
  });

  it('rejects html UI links directly', async () => {
    const req = createMockRequest('https://strava.com/activities/123');
    const res = await GET(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe('Cannot parse HTML pages, need direct GPX URL');
  });

  it('calculates metrics for a LineString correctly', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      headers: new Headers({ 'content-type': 'application/xml' }),
      text: () => Promise.resolve(mockGpxData),
      body: {
        getReader: () => {
          let read = false;
          return {
            read: () => {
              if (read) return Promise.resolve({ done: true, value: undefined });
              read = true;
              return Promise.resolve({ done: false, value: new TextEncoder().encode(mockGpxData) });
            },
            cancel: vi.fn()
          };
        }
      }
    } as any);

    const req = createMockRequest('https://example.com/test.gpx');
    const res = await GET(req);
    expect(res.status).toBe(200);
    const json = await res.json();

    // Distance from 50.6094 to 50.6194 is roughly 1.11 km
    expect(json.distance).toBe('1.1');
    expect(json.elevation).toBe(50);
    // 1.11 / 25 + 50 / 1000 = 0.0444 + 0.05 = 0.0944 hours = ~6 minutes
    expect(json.estimatedTime).toBe('0h06');
  });

  it('calculates metrics for a MultiLineString correctly', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      headers: new Headers({ 'content-type': 'application/xml' }),
      text: () => Promise.resolve(mockMultiLineGpxData),
      body: {
        getReader: () => {
          let read = false;
          return {
            read: () => {
              if (read) return Promise.resolve({ done: true, value: undefined });
              read = true;
              return Promise.resolve({ done: false, value: new TextEncoder().encode(mockMultiLineGpxData) });
            },
            cancel: vi.fn()
          };
        }
      }
    } as any);

    const req = createMockRequest('https://example.com/multi.gpx');
    const res = await GET(req);
    expect(res.status).toBe(200);
    const json = await res.json();

    // Each segment is roughly 1.11 km -> total 2.22 km
    expect(json.distance).toBe('2.2');
    expect(json.elevation).toBe(100);
  });

  it('handles minute rounding edge case correctly (no 2h60)', async () => {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="Blanmont">
  <trk><trkseg>
    <trkpt lat="0" lon="0"><ele>0</ele></trkpt>
    <trkpt lat="0.673" lon="0"><ele>0</ele></trkpt>
  </trkseg></trk>
</gpx>`;

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      headers: new Headers({ 'content-type': 'application/xml' }),
      text: () => Promise.resolve(xml),
      body: {
        getReader: () => {
          let read = false;
          return {
            read: () => {
              if (read) return Promise.resolve({ done: true, value: undefined });
              read = true;
              return Promise.resolve({ done: false, value: new TextEncoder().encode(xml) });
            },
            cancel: vi.fn()
          };
        }
      }
    } as any);

    const req = createMockRequest('https://example.com/edge.gpx');
    const res = await GET(req);
    const json = await res.json();

    expect(json.estimatedTime).toBe('3h00');
  });
});
