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
      className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-[#3a3f4a] shadow-xs hover:bg-[#f2efe9] hover:border-slate-400 transition-all active:scale-95"
    >
      <ArrowDownTrayIcon className="h-4 w-4 text-[#e03e3e]" />
      <span>Télécharger GPX</span>
    </button>
  );
}
