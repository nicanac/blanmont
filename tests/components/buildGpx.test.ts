import { describe, expect, it } from 'vitest';
import { buildGpx } from '@/app/features/traces/components/DownloadGPXButton';

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
});
