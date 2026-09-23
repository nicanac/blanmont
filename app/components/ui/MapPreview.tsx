'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Polyline, GeoJSON, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import polylineCodec from '@mapbox/polyline';
import { cn } from '@/app/utils/cn';

// Fix for default Leaflet marker icons in Next.js
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function FitBounds({
  positions,
  geoJson,
}: {
  positions?: [number, number][];
  geoJson?: any;
}) {
  const map = useMap();

  useEffect(() => {
    if (geoJson) {
      const layer = L.geoJSON(geoJson);
      map.fitBounds(layer.getBounds(), { padding: [30, 30] });
    } else if (positions && positions.length > 0) {
      const bounds = L.latLngBounds(positions);
      map.fitBounds(bounds, { padding: [30, 30] });
    }
  }, [map, positions, geoJson]);

  return null;
}

export interface MapPreviewProps {
  summaryPolyline?: string;
  geoJson?: any;
  positions?: [number, number][];
  strokeColor?: string;
  strokeWeight?: number;
  className?: string;
}

export default function MapPreview({
  summaryPolyline,
  geoJson,
  positions: initialPositions,
  strokeColor = '#e03e3e',
  strokeWeight = 4,
  className = '',
}: MapPreviewProps) {
  const [positions, setPositions] = useState<[number, number][]>(initialPositions || []);

  useEffect(() => {
    if (summaryPolyline) {
      try {
        const decoded = polylineCodec.decode(summaryPolyline) as [number, number][];
        setPositions(decoded);
      } catch (err) {
        console.error('Failed to decode summary polyline:', err);
      }
    }
  }, [summaryPolyline]);

  const hasData = geoJson || positions.length > 0;

  if (!hasData) {
    return (
      <div
        className={cn(
          'h-48 bg-paper-2 dark:bg-night-2 text-ink-3 dark:text-snow-3 flex items-center justify-center text-xs font-semibold uppercase tracking-wider rounded-lg',
          className
        )}
      >
        Chargement de la carte...
      </div>
    );
  }

  const center: [number, number] = positions.length > 0 ? positions[0] : [50.6, 4.6];

  return (
    <div className={cn('h-full w-full relative z-0 min-h-[220px]', className)}>
      <MapContainer
        center={center}
        zoom={12}
        scrollWheelZoom={false}
        className="h-full w-full rounded-lg z-0"
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {geoJson && (
          <GeoJSON data={geoJson} style={{ color: strokeColor, weight: strokeWeight }} />
        )}
        {positions.length > 0 && !geoJson && (
          <Polyline positions={positions} color={strokeColor} weight={strokeWeight} />
        )}
        <FitBounds positions={positions} geoJson={geoJson} />
      </MapContainer>
    </div>
  );
}
