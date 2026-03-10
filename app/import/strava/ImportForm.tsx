'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { fetchStravaActivityAction, importStravaTraceAction, deleteTraceAction, getTraceOptionsAction } from './actions';
import { StravaActivity } from '../../lib/strava';
import { CheckCircleIcon, XMarkIcon, TrashIcon, ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';
import TraceForm from '../../features/traces/components/TraceForm';

// Dynamic import for Leaflet map to avoid SSR issues
const MapPreview = dynamic(() => import('../../features/traces/components/MapPreview'), { ssr: false });

export default function ImportForm() {
    const [url, setUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [preview, setPreview] = useState<any | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<boolean>(false);
    const [createdTraceId, setCreatedTraceId] = useState<string | null>(null);
    const [traceOptions, setTraceOptions] = useState<{ directions: string[], surfaces: string[], locations: string[] } | undefined>(undefined);

    useEffect(() => {
        getTraceOptionsAction().then(opts => {
            const locations = Array.from(new Set([...opts.starts, ...opts.ends])).sort();
            setTraceOptions({
                directions: opts.directions,
                surfaces: opts.surfaces,
                locations
            });
        });
    }, []);

    const handlePreview = async () => {
        setLoading(true);
        setError(null);
        setSuccess(false);
        setPreview(null);
        setCreatedTraceId(null);

        try {
            const result = await fetchStravaActivityAction(url);
            if (!result.success || !result.activity) {
                throw new Error(result.error || 'Failed to fetch activity');
            }
            setPreview(result.activity);
        } catch (err: any) {
            setError(err.message || 'Error occurred');
        } finally {
            setLoading(false);
        }
    };

    const handleImport = async (data: any) => {
        if (!preview) return;
        setLoading(true);
        setError(null);

        try {
            // Prepare activity object with overrides for the action
            const activityWithEdits = {
                ...preview,
                distance: data.distance * 1000, // Convert km back to meters
                total_elevation_gain: data.elevation,
                description: data.description || preview.description,
                mapUrl: data.mapUrl
            };

            const result = await importStravaTraceAction(activityWithEdits, {
                name: data.name,
                direction: data.direction,
                surface: data.surface,
                rating: data.rating,
                start: data.start,
                end: data.end
            });

            if (!result.success) {
                throw new Error(result.error || 'Import failed');
            }

            setCreatedTraceId(result.traceId || null);
            setSuccess(true);
            setPreview(null);
            setUrl('');

        } catch (err: any) {
            setError(err.message || 'Import failed');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!createdTraceId) return;
        if (!confirm('Are you sure you want to delete this trace?')) return;

        try {
            const result = await deleteTraceAction(createdTraceId);
            if (result.success) {
                setCreatedTraceId(null);
                setSuccess(false);
                alert('Trace deleted successfully');
            } else {
                throw new Error(result.error);
            }
        } catch (err: any) {
            alert(err.message);
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Importer depuis Strava</h2>

            {/* URL Input */}
            <div className="flex gap-4 mb-6">
                <input
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://www.strava.com/activities/..."
                    className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-brand-primary focus:ring-brand-primary sm:text-sm"
                />
                <button
                    onClick={handlePreview}
                    disabled={loading || !url}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-brand-primary hover:opacity-90 disabled:opacity-50"
                >
                    {loading ? 'Chargement...' : 'Prévisualiser'}
                </button>
            </div>

            {/* Error Message */}
            {error && (
                <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-md border border-red-200 flex items-center">
                    <XMarkIcon className="h-5 w-5 mr-2" />
                    {error}
                </div>
            )}

            {/* Success Message */}
            {success && createdTraceId && (
                <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-md border border-green-200">
                    <div className="flex items-center mb-2">
                        <CheckCircleIcon className="h-5 w-5 mr-2" />
                        <span className="font-medium">Import réussi !</span>
                    </div>
                    <div className="flex gap-4 mt-2 ml-7">
                        <Link
                            href={`/traces/${createdTraceId}`}
                            className="text-sm font-medium underline hover:text-green-800 flex items-center"
                        >
                            Voir le parcours <ArrowTopRightOnSquareIcon className="h-4 w-4 ml-1" />
                        </Link>
                        <button
                            onClick={handleDelete}
                            className="text-sm font-medium text-red-600 hover:text-red-800 flex items-center"
                        >
                            Supprimer <TrashIcon className="h-4 w-4 ml-1" />
                        </button>
                    </div>
                </div>
            )}

            {/* Preview & Edit Form */}
            {preview && (
                <div className="mt-8 border-t pt-6">
                    <TraceForm
                        initialData={{
                            id: 'preview',
                            name: preview.name,
                            distance: preview.distance / 1000,
                            elevation: preview.total_elevation_gain,
                            mapUrl: `https://www.strava.com/activities/${preview.id}`,
                            polyline: preview.map?.summary_polyline,
                            description: preview.description || '',
                            surface: 'Road',
                            rating: '⭐⭐⭐',
                            direction: '',
                            quality: 5,
                            start: '',
                            end: ''
                        }}
                        onSubmit={handleImport}
                        isSubmitting={loading}
                        submitLabel="Importer le tracé"
                        showDelete={false}
                        options={traceOptions}
                    />
                </div>
            )}
        </div>
    );
}
