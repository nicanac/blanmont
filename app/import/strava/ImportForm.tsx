'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { fetchStravaActivityAction, importStravaTraceAction, deleteTraceAction } from './actions';
import { StravaActivity } from '../../lib/strava';
import { Snackbar } from '@mui/material';
import { CheckCircleIcon, XMarkIcon, TrashIcon, ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';
import TracePreviewForm from '../../components/import/TracePreviewForm';

// Dynamic import for Leaflet map to avoid SSR issues
const MapPreview = dynamic(() => import('../../components/ui/MapPreview'), { ssr: false });

export default function ImportForm() {
    const [url, setUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [preview, setPreview] = useState<StravaActivity | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [createdTraceId, setCreatedTraceId] = useState<string | null>(null);

    const handlePreview = async () => {
        setLoading(true);
        setError(null);
        setSuccessMessage(null);
        setPreview(null);
        try {
            const result = await fetchStravaActivityAction(url);
            if (result.error) {
                setError(result.error);
            } else if (result.activity) {
                setPreview(result.activity);
                // setEditedName(result.activity.name); // No longer needed here, passed to child
            }
        } catch (e) {
            setError('An unexpected error occurred.');
        } finally {
            setLoading(false);
        }
    };

    const handleImport = async (details: { name: string; direction: string; surface: string; rating: string }) => {
        if (!preview) return;
        setLoading(true);
        try {
            const result = await importStravaTraceAction(preview, {
                name: details.name,
                direction: details.direction,
                surface: details.surface,
                rating: details.rating
            });

            if (result.success) {
                setSuccessMessage('Trace imported successfully! You can review or delete it below.');
                setCreatedTraceId(result.traceId || null);
                setPreview(null);
                setUrl('');
            } else {
                setError(result.error || 'Failed to import trace.');
            }
        } catch (e) {
            setError('Import failed.');
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
                setSuccessMessage(null);
                setCreatedTraceId(null);
                alert('Trace deleted.');
            } else {
                alert('Failed to delete trace.');
            }
        } catch (e) {
            alert('Error deleting trace.');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex gap-4">
                <input
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://www.strava.com/activities/123456789"
                    className="flex-1 rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-[#fc4c02] sm:text-sm sm:leading-6"
                />
                <button
                    onClick={handlePreview}
                    disabled={loading || !url}
                    className="bg-brand-primary text-white px-4 py-2 rounded-md hover:opacity-90 disabled:opacity-50"
                >
                    {loading ? 'Loading...' : 'Preview'}
                </button>
            </div>

            {error && (
                <div className="p-4 bg-red-50 text-red-700 rounded-md border border-red-200">
                    {error}
                </div>
            )}

            {successMessage && (
                <Snackbar
                    open={!!successMessage}
                    anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                    onClose={() => { }}
                    message={null}
                >
                    <div className="pointer-events-auto w-96 overflow-hidden rounded-lg bg-white shadow-lg ring-1 ring-black/5">
                        <div className="p-4">
                            <div className="flex items-start">
                                <div className="flex-shrink-0">
                                    <CheckCircleIcon className="h-6 w-6 text-green-400" aria-hidden="true" />
                                </div>
                                <div className="ml-3 w-0 flex-1 pt-0.5">
                                    <p className="text-sm font-medium text-gray-900">Successfully imported!</p>
                                    <p className="mt-1 text-sm text-gray-500">{successMessage}</p>

                                    {createdTraceId && (
                                        <div className="mt-4 flex gap-4">
                                            <Link
                                                href={`/traces/${createdTraceId}`}
                                                target="_blank"
                                                className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                                            >
                                                View Trace
                                            </Link>
                                            <button
                                                onClick={handleDelete}
                                                className="text-sm font-medium text-red-600 hover:text-red-500"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    )}
                                </div>
                                <div className="ml-4 flex flex-shrink-0">
                                    <button
                                        type="button"
                                        className="inline-flex rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                                        onClick={() => setSuccessMessage(null)}
                                    >
                                        <span className="sr-only">Close</span>
                                        <XMarkIcon className="h-5 w-5" aria-hidden="true" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </Snackbar>
            )}

            {preview && (
                <TracePreviewForm
                    data={preview}
                    onImport={handleImport}
                    isLoading={loading}
                />
            )}
        </div>
    );
}
