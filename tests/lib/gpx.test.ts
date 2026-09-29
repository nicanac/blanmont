import { describe, expect, it } from 'vitest';
import { buildGpxDocument } from '@/app/lib/gpx';

describe('GPX document generation', () => {
  it('escapes track names and writes longitude/latitude in GPX order', () => {
    const document = buildGpxDocument('R&D <club>', [[4.6366, 50.6092]]);

    expect(document).toContain('<name>R&amp;D &lt;club&gt;</name>');
    expect(document).toContain('<trkpt lat="50.6092" lon="4.6366"></trkpt>');
  });

  it('rejects invalid geographic coordinates', () => {
    expect(() => buildGpxDocument('Parcours', [[181, 50]])).toThrow(/coordonnées.*invalides/i);
  });
});
