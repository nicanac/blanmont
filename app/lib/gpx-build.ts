/** GPX 1.1 writer shared by the browser download button and the Garmin course export route. */

const escapeXml = (value: string): string =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

/** Builds a GPX 1.1 document with a single track from [lon, lat] or [lon, lat, ele] points. */
export function buildGpx(name: string, lonLat: number[][]): string {
  const points = lonLat
    .map(
      ([lon, lat, ele]) =>
        `<trkpt lat="${lat}" lon="${lon}">${ele === undefined ? '' : `<ele>${ele}</ele>`}</trkpt>`
    )
    .join('');
  return (
    '<?xml version="1.0" encoding="UTF-8"?>' +
    '<gpx version="1.1" creator="CC Saint-Martin Blanmont" xmlns="http://www.topografix.com/GPX/1/1">' +
    `<trk><name>${escapeXml(name)}</name><trkseg>${points}</trkseg></trk></gpx>`
  );
}

/** ASCII file name for a download: "NordEst Tirlemont 105km" → "nordest-tirlemont-105km.gpx". */
export function gpxFileName(name: string): string {
  const slug = name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  return `${slug || 'trace'}.gpx`;
}
