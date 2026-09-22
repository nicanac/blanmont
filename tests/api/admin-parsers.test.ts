import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
import { POST as fetchMetadataRoute } from '@/app/api/admin/fetch-metadata/route';
import { POST as parseGpxRoute } from '@/app/api/admin/parse-gpx/route';
import * as sessionModule from '@/app/lib/auth/session';

describe('Admin Metadata & GPX Parsers API', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('POST /api/admin/fetch-metadata', () => {
    it('requires admin authorization', async () => {
      vi.spyOn(sessionModule, 'verifyAdminRequest').mockResolvedValue({
        authorized: false,
        response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
      } as any);

      const req = new NextRequest('http://localhost:3000/api/admin/fetch-metadata', {
        method: 'POST',
        body: JSON.stringify({ url: 'https://www.komoot.com/tour/123' }),
      });

      const res = await fetchMetadataRoute(req);
      expect(res.status).toBe(401);
    });

    it('returns 400 when url is invalid', async () => {
      vi.spyOn(sessionModule, 'verifyAdminRequest').mockResolvedValue({
        authorized: true,
        user: { id: 'admin-1', isAdmin: true },
      } as any);

      const req = new NextRequest('http://localhost:3000/api/admin/fetch-metadata', {
        method: 'POST',
        body: JSON.stringify({ url: 'not-a-valid-url' }),
      });

      const res = await fetchMetadataRoute(req);
      expect(res.status).toBe(400);
    });

    it('fetches page HTML and extracts OpenGraph metadata and distance/elevation', async () => {
      vi.spyOn(sessionModule, 'verifyAdminRequest').mockResolvedValue({
        authorized: true,
        user: { id: 'admin-1', isAdmin: true },
      } as any);

      const mockHtml = `
        <html>
          <head>
            <meta property="og:title" content="Tour des Abbayes | Komoot" />
            <meta name="description" content="Parcours cycliste en Brabant Wallon. 78,5 km avec 640 m de dénivelé positif." />
            <meta property="og:image" content="https://images.komoot.com/map/preview.jpg" />
          </head>
        </html>
      `;

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        text: async () => mockHtml,
      } as any);

      const req = new NextRequest('http://localhost:3000/api/admin/fetch-metadata', {
        method: 'POST',
        body: JSON.stringify({ url: 'https://www.komoot.com/tour/999' }),
      });

      const res = await fetchMetadataRoute(req);
      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.name).toBe('Tour des Abbayes');
      expect(data.distance).toBe('78.5');
      expect(data.elevation).toBe('640');
      expect(data.photoLink).toBe('https://images.komoot.com/map/preview.jpg');
    });
  });

  describe('POST /api/admin/parse-gpx', () => {
    it('requires admin authorization', async () => {
      vi.spyOn(sessionModule, 'verifyAdminRequest').mockResolvedValue({
        authorized: false,
        response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
      } as any);

      const req = new NextRequest('http://localhost:3000/api/admin/parse-gpx', {
        method: 'POST',
        body: JSON.stringify({ url: 'https://example.com/tour.gpx' }),
      });

      const res = await parseGpxRoute(req);
      expect(res.status).toBe(401);
    });

    it('parses GPX content and computes distance and elevation gain accurately', async () => {
      vi.spyOn(sessionModule, 'verifyAdminRequest').mockResolvedValue({
        authorized: true,
        user: { id: 'admin-1', isAdmin: true },
      } as any);

      const sampleGpxXml = `<?xml version="1.0" encoding="UTF-8"?>
        <gpx version="1.1" creator="Blanmont">
          <trk>
            <name>Test Ride</name>
            <trkseg>
              <trkpt lat="50.6092" lon="4.6366"><ele>120.0</ele></trkpt>
              <trkpt lat="50.6150" lon="4.6450"><ele>145.0</ele></trkpt>
              <trkpt lat="50.6200" lon="4.6500"><ele>160.0</ele></trkpt>
            </trkseg>
          </trk>
        </gpx>
      `;

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        text: async () => sampleGpxXml,
      } as any);

      const req = new NextRequest('http://localhost:3000/api/admin/parse-gpx', {
        method: 'POST',
        body: JSON.stringify({ url: 'https://example.com/test.gpx' }),
      });

      const res = await parseGpxRoute(req);
      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.distance).toBeDefined();
      expect(Number(data.distance)).toBeGreaterThan(0);
      expect(data.elevation).toBe(40); // (145 - 120) + (160 - 145) = 40m
      expect(data.geoJson).toBeDefined();
    });
  });
});
