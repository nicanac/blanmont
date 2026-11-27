import { describe, expect, it } from 'vitest';
import { buildGpx, gpxFileName } from '@/app/lib/gpx-build';

describe('buildGpx', () => {
  it('writes one track point per [lon, lat] pair', () => {
    const gpx = buildGpx('Boucle', [
      [4.7, 50.6],
      [4.8, 50.7],
    ]);
    expect(gpx).toContain('<trkpt lat="50.6" lon="4.7">');
    expect(gpx).toContain('<trkpt lat="50.7" lon="4.8">');
  });

  it('escapes XML characters in the track name', () => {
    expect(buildGpx('A & <B>', [])).toContain('<name>A &amp; &lt;B&gt;</name>');
  });

  it('writes the elevation when the point has one', () => {
    expect(buildGpx('Boucle', [[4.7, 50.6, 123.7]])).toContain(
      '<trkpt lat="50.6" lon="4.7"><ele>123.7</ele></trkpt>'
    );
  });
});

describe('gpxFileName', () => {
  it('turns a course name into an ASCII .gpx file name', () => {
    expect(gpxFileName('NordEst Tirlemont 105km')).toBe('nordest-tirlemont-105km.gpx');
    expect(gpxFileName('Côte de Thy-le-Château')).toBe('cote-de-thy-le-chateau.gpx');
    expect(gpxFileName('  ')).toBe('trace.gpx');
  });
});
