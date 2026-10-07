type GpxPosition = readonly [longitude: number, latitude: number];

function escapeXmlText(value: string): string {
  return value
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function buildGpxDocument(
  trackName: string,
  positions: readonly GpxPosition[]
): string {
  const points = positions.map(([longitude, latitude]) => {
    if (
      !Number.isFinite(longitude) ||
      !Number.isFinite(latitude) ||
      longitude < -180 ||
      longitude > 180 ||
      latitude < -90 ||
      latitude > 90
    ) {
      throw new Error('Les coordonnées du parcours sont invalides.');
    }
    return `      <trkpt lat="${latitude}" lon="${longitude}"></trkpt>`;
  });
  const name = escapeXmlText(trackName);

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<gpx version="1.1" creator="CC Saint-Martin Blanmont" xmlns="http://www.topografix.com/GPX/1/1">',
    '  <trk>',
    `    <name>${name}</name>`,
    '    <trkseg>',
    ...points,
    '    </trkseg>',
    '  </trk>',
    '</gpx>',
  ].join('\n');
}
