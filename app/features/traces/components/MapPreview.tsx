'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { logger } from '../../../lib/logger';

// Fix for default marker icons in Next.js/Leaflet
// Although we might only draw a polyline, good to have if we add markers later.
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function FitBounds({ positions }: { positions: [number, number][] }) {
    const map = useMap();
    useEffect(() => {
        if (positions.length > 0) {
            const bounds = L.latLngBounds(positions);
            map.fitBounds(bounds, { padding: [20, 20] });
        }
    }, [map, positions]);
    return null;
}

interface MapPreviewProps {
    summaryPolyline: string;
}

export default function MapPreview({ summaryPolyline }: MapPreviewProps) {
    const [positions, setPositions] = useState<[number, number][]>([]);

    useEffect(() => {
        if (!summaryPolyline) return;
        try {
            // Check if polyline import works directly, otherwise fallback to simple decoding if needed
            // But @mapbox/polyline should be reliable if installed. 
            // If not installed, I might need to add it or use a simple decoder function.
            // I'll assume I need to install it or use a local helper if it fails.
            // Checking package.json from previous step... it wasn't there!
            // I will use a local decode function to avoid new dependencies if possible.
            const decoded = decodePolyline(summaryPolyline);
            setPositions(decoded);
        } catch (e) {
            logger.error("Failed to decode polyline", e);
        }
    }, [summaryPolyline]);

    if (!positions.length) return <div className="h-48 bg-gray-100 flex items-center justify-center">Loading Map...</div>;

    return (
        <MapContainer
            center={positions[0]}
            zoom={13}
            scrollWheelZoom={false}
            className="h-full w-full rounded-lg z-0"
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Polyline positions={positions} color="#fc4c02" weight={4} />
            <FitBounds positions={positions} />
        </MapContainer>
    );
}

// Simple Polyline Decoder (Google algorithm)
function decodePolyline(encoded: string): [number, number][] {
    let index = 0, len = encoded.length;
    let lat = 0, lng = 0;
    const coordinates: [number, number][] = [];

    while (index < len) {
        let b, shift = 0, result = 0;
        do {
            b = encoded.charCodeAt(index++) - 63;
            result |= (b & 0x1f) << shift;
            shift += 5;
        } while (b >= 0x20);
        const dlat = ((result & 1) ? ~(result >> 1) : (result >> 1));
        lat += dlat;

        shift = 0;
        result = 0;
        do {
            b = encoded.charCodeAt(index++) - 63;
            result |= (b & 0x1f) << shift;
            shift += 5;
        } while (b >= 0x20);
        const dlng = ((result & 1) ? ~(result >> 1) : (result >> 1));
        lng += dlng;

        coordinates.push([lat * 1e-5, lng * 1e-5]);
    }
    return coordinates;
}
