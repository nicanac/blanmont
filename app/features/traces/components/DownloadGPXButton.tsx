'use client';

import { ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import toGeoJSON from '@mapbox/polyline';
import { buildGpxDocument } from '@/app/lib/gpx';
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
      const positions = coordinates.map(
        ([latitude, longitude]: number[]) => [longitude, latitude] as [number, number]
      );
      const gpxData = buildGpxDocument(traceName, positions);
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
      className="inline-flex items-center gap-2 rounded-md border border-line dark:border-night-line bg-white dark:bg-night-2 px-6 py-3 text-sm font-semibold text-ink-2 dark:text-snow shadow-xs hover:bg-paper-2 dark:hover:bg-night-3 hover:border-line-strong dark:hover:border-night-line-strong transition-all duration-150 ease-out active:scale-95 cursor-pointer"
    >
      <ArrowDownTrayIcon className="h-4 w-4 text-brand" />
      <span>Télécharger GPX</span>
    </button>
  );
}
