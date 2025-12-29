'use client';

import { Button } from '@mui/material';
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline';
// @ts-ignore
import toGeoJSON from '@mapbox/polyline';
// @ts-ignore
import togpx from 'togpx';

interface Props {
    polyline?: string;
    traceName: string;
}

export default function DownloadGPXButton({ polyline, traceName }: Props) {
    if (!polyline) return null;

    const handleDownload = () => {
        try {
            // 1. Decode Polyline to GeoJSON LineString
            // Note: Strava polylines are usually precision 5, sometimes 6. Mapbox polyline defaults to 5.
            const coordinates = toGeoJSON.decode(polyline);
            // decode returns [lat, lon], geojson expects [lon, lat]
            const flipped = coordinates.map((c: number[]) => [c[1], c[0]]);

            const geoJson = {
                type: "FeatureCollection",
                features: [
                    {
                        type: "Feature",
                        properties: {
                            name: traceName
                        },
                        geometry: {
                            type: "LineString",
                            coordinates: flipped
                        }
                    }
                ]
            };

            // 2. Convert GeoJSON to GPX
            const gpxData = togpx(geoJson);

            // 3. Trigger Download
            const blob = new Blob([gpxData], { type: 'application/gpx+xml' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${traceName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.gpx`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (e) {
            console.error('Failed to generate GPX', e);
            alert('Failed to generate GPX file.');
        }
    };

    return (
        <Button
            variant="outlined"
            size="large"
            onClick={handleDownload}
            startIcon={<ArrowDownTrayIcon className="w-5 h-5" />}
        >
            Download GPX
        </Button>
    );
}
