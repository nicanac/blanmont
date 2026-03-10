'use client';

import { useState, useEffect } from 'react';
import TraceForm from '../../features/traces/components/TraceForm';
import { CloudArrowUpIcon, CheckCircleIcon, XMarkIcon, TrashIcon, PencilIcon } from '@heroicons/react/24/outline';
import * as toGeoJSON from '@tmcw/togeojson';
import * as mapboxPolyline from '@mapbox/polyline';
import { importStravaTraceAction, deleteTraceAction, getTraceOptionsAction } from '../strava/actions';
import { StravaActivity } from '../../lib/strava';
import Link from 'next/link';

// Define strict type for preview data
interface PreviewData {
    name: string;
    distance: number;
    total_elevation_gain: number;
    map: { summary_polyline: string };
    total_photo_count: number;
    mapUrl?: string; // Optional
}

export default function GarminImportPage() {
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [preview, setPreview] = useState<PreviewData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [createdTraceId, setCreatedTraceId] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [traceOptions, setTraceOptions] = useState<{ directions: string[], surfaces: string[], locations: string[] } | undefined>(undefined);
    const [mode, setMode] = useState<'file' | 'url'>('file');
    const [url, setUrl] = useState('');

    useEffect(() => {
        getTraceOptionsAction().then(opts => {
            // Map backend 'starts'/'ends' to unified 'locations'
            const locations = Array.from(new Set([...opts.starts, ...opts.ends])).sort();
            setTraceOptions({
                directions: opts.directions,
                surfaces: opts.surfaces,
                locations
            });
        });
    }, []);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            await parseGPX(e.target.files[0]);
        }
    };

    const handleUrlSubmit = async () => {
        setLoading(true);
        setError(null);
        try {
            // dynamic import to avoid server-side issues if needed, or just import at top
            const { fetchGarminActivityAction } = await import('./actions');
            const result = await fetchGarminActivityAction(url);

            if (result.error) {
                setError(result.error);
                return;
            }

            if (result.activity) {
                // We got some data!
                setPreview({
                    name: result.activity.name || 'Imported Garmin Activity',
                    distance: result.activity.distance || 0,
                    total_elevation_gain: result.activity.elevation || 0,
                    map: {
                        summary_polyline: '' // Likely empty if we just scraped HTML
                    },
                    total_photo_count: 0,
                    // Pass the URL so it can be saved as the 'Komoot'/'Map' link in Notion
                    mapUrl: url
                });

                if (!result.activity.hasGpx) {
                    setSuccessMessage('URL loaded! Note: Retrieveing exact map data from Garmin URLs is restricted. Please verify stats below. The link will be saved.');
                }
            }
        } catch (e) {
            setError('Failed to load URL.');
        } finally {
            setLoading(false);
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
                // Fallback: Check for MultiLineString
                const multiTrack = geojson.features.find((f: any) => f.geometry.type === 'MultiLineString');
                if (multiTrack) throw new Error('MultiLineString not yet supported, please simplify GPX.');

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

    const handleImport = async (data: any) => {
        if (!preview) return;
        setLoading(true);

        try {
            // The existing importStravaTraceAction expects StravaActivity but takes 'any' in implementation.

            const mockActivity: any = {
                id: Date.now(), // Fake ID
                name: data.name,
                // Form 'distance' is in km, StravaActivity uses meters
                distance: data.distance * 1000,
                total_elevation_gain: data.elevation,
                start_latlng: [0, 0], // Not used for Notion creation really (except maybe map center?)
                map: {
                    id: `gpx-${Date.now()}`,
                    summary_polyline: preview.map.summary_polyline
                },
                description: data.description || 'Imported from Garmin/GPX',
                start_date: new Date().toISOString(),
                photos: { count: 0, primary: null },
                total_photo_count: 0,
                // Pass the URL for Notion 'Komoot' field
                mapUrl: data.mapUrl
            };

            const result = await importStravaTraceAction(mockActivity, {
                name: data.name,
                direction: data.direction,
                surface: data.surface,
                rating: data.rating,
                // Pass start/end if the action supports it (it might not yet, need to check)
                // For now, these might be lost if importStravaTraceAction doesn't handle them.
                // We should check 'importStravaTraceAction'.
            });

            if (result.success) {
                setSuccessMessage('Trace imported successfully!');
                setCreatedTraceId(result.traceId || null);
                setPreview(null);
                setFile(null);
                setUrl('');
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

    const handleDelete = async () => {
        if (!createdTraceId) return;
        if (!confirm('Êtes-vous sûr de vouloir supprimer ce parcours ?')) return;

        setLoading(true);
        try {
            const result = await deleteTraceAction(createdTraceId);
            if (result.success) {
                setSuccessMessage(null);
                setCreatedTraceId(null);
                alert('Parcours supprimé avec succès.');
            } else {
                setError('Échec de la suppression du parcours.');
            }
        } catch (e) {
            setError('Erreur lors de la suppression.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="text-center mb-10">
                    <Link href="/traces" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4">
                        <span className="mr-1">←</span> Retour aux parcours
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900">Importer un Parcours</h1>
                    <p className="mt-2 text-gray-600">
                        Importez un fichier GPX ou entrez une URL Garmin/Komoot.
                    </p>
                </div>

                {/* Main Card */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">

                    {/* Mode Toggle - Section Header */}
                    {!preview && !successMessage && (
                        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                            <div className="flex items-center gap-4">
                                <span className="text-sm font-medium text-gray-700">Méthode d'import:</span>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setMode('file')}
                                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${mode === 'file'
                                            ? 'bg-brand-primary text-white'
                                            : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'}`}
                                    >
                                        📁 Fichier GPX
                                    </button>
                                    <button
                                        onClick={() => setMode('url')}
                                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${mode === 'url'
                                            ? 'bg-brand-primary text-white'
                                            : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'}`}
                                    >
                                        🔗 URL
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {!preview && !successMessage && mode === 'file' && (
                        <div className="p-6">
                            <div className="flex justify-center rounded-lg border-2 border-dashed border-gray-300 px-6 py-10 hover:border-gray-400 transition-colors">
                                <div className="text-center">
                                    <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" aria-hidden="true" />
                                    <div className="mt-4 flex text-sm leading-6 text-gray-600 justify-center">
                                        <label
                                            htmlFor="file-upload"
                                            className="relative cursor-pointer rounded-md font-semibold text-brand-primary focus-within:outline-none focus-within:ring-2 focus-within:ring-brand-primary focus-within:ring-offset-2 hover:opacity-80"
                                        >
                                            <span>Téléverser un fichier GPX</span>
                                            <input id="file-upload" name="file-upload" type="file" className="sr-only" accept=".gpx" onChange={handleFileChange} />
                                        </label>
                                        <p className="pl-1">ou glisser-déposer</p>
                                    </div>
                                    <p className="text-xs leading-5 text-gray-500 mt-1">Fichier .GPX jusqu'à 10MB</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {!preview && !successMessage && mode === 'url' && (
                        <div className="p-6">
                            <label className="block text-sm font-medium text-gray-900 mb-2">URL de l'activité</label>
                            <div className="flex gap-4">
                                <input
                                    type="text"
                                    value={url}
                                    onChange={(e) => setUrl(e.target.value)}
                                    placeholder="https://connect.garmin.com/modern/activity/... ou https://www.komoot.com/tour/..."
                                    className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-brand-primary focus:ring-brand-primary sm:text-sm p-2 border"
                                />
                                <button
                                    onClick={handleUrlSubmit}
                                    disabled={loading || !url}
                                    className="bg-brand-primary text-white px-6 py-2 rounded-md hover:opacity-90 disabled:opacity-50 font-medium"
                                >
                                    {loading ? 'Chargement...' : 'Charger'}
                                </button>
                            </div>
                            <p className="mt-2 text-xs text-gray-500">
                                Note: Les données seront récupérées si l'activité est publique. Sinon, utilisez un fichier GPX.
                            </p>
                        </div>
                    )}

                    {loading && (
                        <div className="p-6 text-center">
                            <div className="animate-spin h-8 w-8 border-4 border-brand-primary border-t-transparent rounded-full mx-auto"></div>
                            <p className="mt-2 text-gray-600">Traitement en cours...</p>
                        </div>
                    )}

                    {error && (
                        <div className="m-6 p-4 bg-red-50 text-red-700 rounded-md border border-red-200">
                            {error}
                        </div>
                    )}

                    {successMessage && (
                        <div className="rounded-md bg-green-50 p-4 border border-green-200">
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
                                            <span className="sr-only">Fermer</span>
                                            <XMarkIcon className="h-5 w-5" aria-hidden="true" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                            {createdTraceId && (
                                <div className="mt-4 flex gap-3 flex-wrap">
                                    <Link
                                        href={`/traces/${createdTraceId}`}
                                        className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
                                    >
                                        Voir le parcours →
                                    </Link>
                                    <Link
                                        href={`/traces/${createdTraceId}/edit`}
                                        className="inline-flex items-center px-3 py-2 text-sm font-medium text-green-700 bg-white border border-green-300 rounded-md hover:bg-green-50"
                                    >
                                        <PencilIcon className="h-4 w-4 mr-1.5" />
                                        Modifier
                                    </Link>
                                    <button
                                        onClick={handleDelete}
                                        disabled={loading}
                                        className="inline-flex items-center px-3 py-2 text-sm font-medium text-red-700 bg-white border border-red-300 rounded-md hover:bg-red-50 disabled:opacity-50"
                                    >
                                        <TrashIcon className="h-4 w-4 mr-1.5" />
                                        Supprimer
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {preview && (
                        <div className="mt-8">
                            <h2 className="text-xl font-bold text-gray-900 mb-6">Aperçu et Modification</h2>
                            <TraceForm
                                initialData={{
                                    name: preview.name,
                                    // Convert meters to km for the form
                                    distance: Math.round(preview.distance / 100) / 10,
                                    elevation: preview.total_elevation_gain,
                                    mapUrl: preview.mapUrl,
                                    polyline: preview.map.summary_polyline,
                                    // Defaults
                                    surface: 'Road',
                                    rating: '⭐⭐⭐',
                                    direction: 'North',
                                    start: '',
                                    end: ''
                                }}
                                onSubmit={handleImport}
                                isSubmitting={loading}
                                submitLabel="Importer le tracé"
                                showDelete={!!createdTraceId}
                                onDelete={handleDelete}
                                options={traceOptions}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
