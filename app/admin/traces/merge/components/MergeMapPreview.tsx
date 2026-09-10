'use client';

import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet icons
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: '/images/leaflet/marker-icon-2x.png',
  iconUrl: '/images/leaflet/marker-icon.png',
  shadowUrl: '/images/leaflet/marker-shadow.png',
});

interface MergeMapPreviewProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  segments: any[];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function MapUpdater({ segments }: { segments: any[] }): null {
  const map = useMap();

  useEffect(() => {
    if (!segments || segments.length === 0) return;

    const bounds = L.latLngBounds([]);
    let hasPoints = false;

    segments.forEach(seg => {
      if (!seg.geoJson) return;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      seg.geoJson.features.forEach((feature: any) => {
        if (feature.geometry.type === 'LineString') {
          feature.geometry.coordinates.forEach((coord: number[]) => {
            bounds.extend([coord[1], coord[0]]);
            hasPoints = true;
          });
        }
      });
    });

    if (hasPoints && bounds.isValid()) {
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [segments, map]);

  return null;
}

export default function MergeMapPreview({ segments }: MergeMapPreviewProps): React.ReactElement {

  // Default center to Blanmont, BE
  const defaultCenter: [number, number] = [50.627, 4.646];
  const COLORS = ['#e03e3e', '#101216', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];

  return (
    <div className="h-full w-full relative z-0">
      <MapContainer
        center={defaultCenter}
        zoom={11}
        scrollWheelZoom={true}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {segments.map((seg, index) => {
          if (!seg.geoJson) return null;

          const lines: [number, number][][] = [];

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          seg.geoJson.features.forEach((feature: any) => {
            if (feature.geometry.type === 'LineString') {
               const pts = feature.geometry.coordinates.map((c: number[]) => [c[1], c[0]] as [number, number]);
               lines.push(pts);
            }
          });

          const color = COLORS[index % COLORS.length];

          return lines.map((line, i) => (
             <React.Fragment key={`${seg.id}-${i}`}>
                {/* Background thick line for better visibility */}
                <Polyline
                  positions={line}
                  color="#ffffff"
                  weight={6}
                  opacity={0.8}
                />
                {/* Main line */}
                <Polyline
                  positions={line}
                  color={color}
                  weight={4}
                  opacity={0.9}
                />
             </React.Fragment>
          ));
        })}

        <MapUpdater segments={segments} />
      </MapContainer>
    </div>
  );
}
