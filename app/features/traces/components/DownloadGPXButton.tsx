'use client';

import { ArrowDownTrayIcon } from '@heroicons/react/24/outline';
// @ts-ignore
import toGeoJSON from '@mapbox/polyline';
import { toast } from 'sonner';

const escapeXml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

/** Builds a minimal GPX 1.1 document with a single track from [lon, lat] pairs. */
export function buildGpx(name: string, lonLat: number[][]): string {
  const points = lonLat
    .map(([lon, lat]) => `<trkpt lat="${lat}" lon="${lon}"></trkpt>`)
    .join('');
  return (
    '<?xml version="1.0" encoding="UTF-8"?>' +
    '<gpx version="1.1" creator="Sidereal Satellite" xmlns="http://www.topografix.com/GPX/1/1">' +
    `<trk><name>${escapeXml(name)}</name><trkseg>${points}</trkseg></trk></gpx>`
  );
}

interface Props {
  polyline?: string;
  traceName: string;
}

export default function DownloadGPXButton({ polyline, traceName }: Props) {
  if (!polyline) return null;

  const handleDownload = () => {
    try {
      const coordinates = toGeoJSON.decode(polyline);
      const flipped = coordinates.map((c: number[]) => [c[1], c[0]]);

      const gpxData = buildGpx(traceName, flipped);
      const blob = new Blob([gpxData], { type: 'application/gpx+xml' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${traceName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.gpx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Trace GPX téléchargée avec succès !');
    } catch (e) {
      console.error('Failed to generate GPX', e);
      toast.error('Impossible de générer le fichier GPX.');
    }
  };

  return (
    <button
      type="button"
      onClick={handleDownload}
      data-track="gpx-download"
      data-track-title={traceName}
      className="inline-flex items-center gap-2 rounded-md border border-line dark:border-night-line bg-white dark:bg-night-2 px-6 py-3 text-sm font-semibold text-ink-2 dark:text-snow shadow-xs hover:bg-paper-2 dark:hover:bg-night-3 hover:border-line-strong dark:hover:border-night-line-strong transition-all duration-150 ease-out active:scale-95 cursor-pointer"
    >
      <ArrowDownTrayIcon className="h-4 w-4 text-brand" />
      <span>Télécharger GPX</span>
    </button>
  );
}
