'use client';

import { useState } from 'react';
import TracePreviewForm, { TraceImportData } from '../../components/import/TracePreviewForm';
import { CloudArrowUpIcon, CheckCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';
import * as toGeoJSON from '@tmcw/togeojson';
import * as mapboxPolyline from '@mapbox/polyline';
import { importStravaTraceAction } from '../strava/actions';
import { StravaActivity } from '../../lib/strava';
import Link from 'next/link';

export default function GarminImportPage() {
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<TraceImportData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [createdTraceId, setCreatedTraceId] = useState<string | null>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            await parseGPX(e.target.files[0]);
        }
    };

    const parseGPX = async (file: File) => {
        setLoading(true);
        setError(null);
        try {
            const text = await file.text();
            const dom = new DOMParser().parseFromString(text, 'text/xml');

            // Convert to GeoJSON to easily calculate stats and polyline
            const geojson = toGeoJSON.gpx(dom);

            // We expect a FeatureCollection with at least one LineString
            const track = geojson.features.find((f: any) => f.geometry.type === 'LineString');

            if (!track || !track.geometry || track.geometry.type !== 'LineString') {
                throw new Error('No track found in GPX file.');
            }

            const coordinates = track.geometry.coordinates as [number, number, number?][];

            // Calculate distance (simplified)
            let distance = 0;
            for (let i = 0; i < coordinates.length - 1; i++) {
                distance += calculateDistance(
                    coordinates[i][1], coordinates[i][0],
                    coordinates[i + 1][1], coordinates[i + 1][0]
                );
            }

            // Calculate Elevation Gain (if Z matches exist)
            let elevationGain = 0;
            for (let i = 0; i < coordinates.length - 1; i++) {
                const alt1 = coordinates[i][2] || 0;
                const alt2 = coordinates[i + 1][2] || 0;
                if (alt2 > alt1) {
                    elevationGain += (alt2 - alt1);
                }
            }

            // Encode Polyline
            // mapboxPolyline expects [lat, lng]
            const pathForPolyline = coordinates.map(c => [c[1], c[0]] as [number, number]);
            const encodedPolyline = mapboxPolyline.encode(pathForPolyline);

            setPreview({
                name: file.name.replace('.gpx', ''),
                distance: distance,
                total_elevation_gain: Math.round(elevationGain),
                map: {
                    summary_polyline: encodedPolyline
                },
                total_photo_count: 0
            });

        } catch (e) {
            console.error('GPX Parse Error:', e);
            setError('Failed to parse GPX file. Please make sure it is a valid GPX.');
        } finally {
            setLoading(false);
        }
    };

    // Haversine formula for distance
    function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
        const R = 6371e3; // metres
        const φ1 = lat1 * Math.PI / 180;
        const φ2 = lat2 * Math.PI / 180;
        const Δφ = (lat2 - lat1) * Math.PI / 180;
        const Δλ = (lon2 - lon1) * Math.PI / 180;

        const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c;
    }

    const handleImport = async (details: { name: string; direction: string; surface: string; rating: string }) => {
        if (!preview) return;
        setLoading(true);

        try {
            // We need to shape this like a StravaActivity for the action
            // Or create a new generic action. But to save time and reuse logic, let's mock it.
            // The existing importStravaTraceAction expects StravaActivity.

            const mockActivity: StravaActivity = {
                id: Date.now(), // Fake ID
                name: details.name,
                distance: preview.distance,
                total_elevation_gain: preview.total_elevation_gain,
                start_latlng: [0, 0], // Not used for Notion creation really (except maybe map center?)
                map: {
                    id: `gpx-${Date.now()}`,
                    summary_polyline: preview.map.summary_polyline
                },
                description: 'Imported from Garmin/GPX',
                start_date: new Date().toISOString(),
                photos: { count: 0, primary: null },
                total_photo_count: 0
            };

            const result = await importStravaTraceAction(mockActivity, details);

            if (result.success) {
                setSuccessMessage('Trace imported successfully from GPX!');
                setCreatedTraceId(result.traceId || null);
                setPreview(null);
                setFile(null);
            } else {
                setError(result.error || 'Failed to create trace in Notion.');
            }
        } catch (e) {
            console.error(e);
            setError('System error during import.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
            <div className="md:flex md:items-center md:justify-between mb-8">
                <div className="min-w-0 flex-1">
                    <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
                        Garmin Import
                    </h2>
                </div>
            </div>

            <div className="space-y-6">
                {!preview && !successMessage && (
                    <div className="flex justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10 bg-white">
                        <div className="text-center">
                            <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-300" aria-hidden="true" />
                            <div className="mt-4 flex text-sm leading-6 text-gray-600 justify-center">
                                <label
                                    htmlFor="file-upload"
                                    className="relative cursor-pointer rounded-md bg-white font-semibold text-brand-primary focus-within:outline-none focus-within:ring-2 focus-within:ring-brand-primary focus-within:ring-offset-2 hover:text-indigo-500"
                                >
                                    <span>Upload a GPX file</span>
                                    <input id="file-upload" name="file-upload" type="file" className="sr-only" accept=".gpx" onChange={handleFileChange} />
                                </label>
                                <p className="pl-1">or drag and drop</p>
                            </div>
                            <p className="text-xs leading-5 text-gray-600">.GPX up to 10MB</p>
                        </div>
                    </div>
                )}

                {loading && <div className="text-center py-4">Processing...</div>}

                {error && (
                    <div className="p-4 bg-red-50 text-red-700 rounded-md border border-red-200">
                        {error}
                    </div>
                )}

                {successMessage && (
                    <div className="rounded-md bg-green-50 p-4">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <CheckCircleIcon className="h-5 w-5 text-green-400" aria-hidden="true" />
                            </div>
                            <div className="ml-3">
                                <p className="text-sm font-medium text-green-800">{successMessage}</p>
                            </div>
                            <div className="ml-auto pl-3">
                                <div className="-mx-1.5 -my-1.5">
                                    <button
                                        type="button"
                                        onClick={() => setSuccessMessage(null)}
                                        className="inline-flex rounded-md bg-green-50 p-1.5 text-green-500 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2"
                                    >
                                        <span className="sr-only">Dismiss</span>
                                        <XMarkIcon className="h-5 w-5" aria-hidden="true" />
                                    </button>
                                </div>
                            </div>
                        </div>
                        {createdTraceId && (
                            <div className="mt-4">
                                <Link
                                    href={`/traces/${createdTraceId}`}
                                    className="text-sm font-medium text-green-800 hover:underline"
                                >
                                    View Created Trace &rarr;
                                </Link>
                            </div>
                        )}
                    </div>
                )}

                {preview && (
                    <TracePreviewForm
                        data={preview}
                        onImport={handleImport}
                        isLoading={loading}
                    />
                )}
            </div>
        </div>
    );
}
