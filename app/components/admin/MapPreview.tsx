'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons in Next.js
// (Though we are mainly plotting lines, good to have)
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function MapFitter({ geoJson }: { geoJson: any }) {
    const map = useMap();
    useEffect(() => {
        if (geoJson) {
            const layer = L.geoJSON(geoJson);
            map.fitBounds(layer.getBounds(), { padding: [50, 50] });
        }
    }, [geoJson, map]);
    return null;
}

export default function MapPreview({ geoJson }: { geoJson: any }) {
    if (!geoJson) return null;

    return (
        <div className="h-full w-full relative z-0">
            <MapContainer
                center={[50.6, 4.6]}
                zoom={10}
                scrollWheelZoom={false}
                className="h-full w-full"
                style={{ height: '100%', width: '100%' }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <GeoJSON data={geoJson} style={{ color: 'red', weight: 4 }} />
                <MapFitter geoJson={geoJson} />
            </MapContainer>
        </div>
    );
}
