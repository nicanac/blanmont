'use client';

import { ArrowDownTrayIcon } from '@heroicons/react/24/outline';
// @ts-ignore
import toGeoJSON from '@mapbox/polyline';
// @ts-ignore
import togpx from 'togpx';
import { toast } from 'sonner';

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

      const geoJson = {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            properties: {
              name: traceName,
            },
            geometry: {
              type: 'LineString',
              coordinates: flipped,
            },
          },
        ],
      };

      const gpxData = togpx(geoJson);
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
      className="inline-flex items-center gap-2 rounded-md border border-[#e4e0d8] dark:border-[#262b38] bg-white dark:bg-[#161922] px-6 py-3 text-sm font-semibold text-[#3a3f4a] dark:text-[#f5f6f8] shadow-xs hover:bg-[#f2efe9] dark:hover:bg-[#1e222d] hover:border-[#c9c4ba] dark:hover:border-[#3a4254] transition-all duration-150 ease-out active:scale-95 cursor-pointer"
    >
      <ArrowDownTrayIcon className="h-4 w-4 text-[#e03e3e]" />
      <span>Télécharger GPX</span>
    </button>
  );
}
