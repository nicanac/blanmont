'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { fetchStravaActivityAction, importStravaTraceAction } from './actions';
import { StravaActivity } from '../../lib/strava';
import { CheckCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';

// Dynamic import for Leaflet map to avoid SSR issues
const MapPreview = dynamic(() => import('../../components/ui/MapPreview'), { ssr: false });

export default function ImportForm() {
    const [url, setUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [preview, setPreview] = useState<StravaActivity | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    // Editable fields
    const [editedName, setEditedName] = useState('');
    const [direction, setDirection] = useState('↑ Nord');
    const [surface, setSurface] = useState('4 - good');
    const [rating, setRating] = useState('⭐⭐⭐');

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
                setEditedName(result.activity.name);
            }
        } catch (e) {
            setError('An unexpected error occurred.');
        } finally {
            setLoading(false);
        }
    };

    const handleImport = async () => {
        if (!preview) return;
        setLoading(true);
        try {
            const result = await importStravaTraceAction(preview, {
                name: editedName,
                direction,
                surface,
                rating
            });

            if (result.success) {
                setSuccessMessage('Trace imported successfully! You can find it in Notion.');
                setPreview(null);
                setUrl('');
                setEditedName('');
                setDirection('↑ Nord');
                setSurface('4 - good');
                setRating('⭐⭐⭐');
            } else {
                setError(result.error || 'Failed to import trace.');
            }
        } catch (e) {
            setError('Import failed.');
        } finally {
            setLoading(false);
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
                <div className="pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg bg-white shadow-lg ring-1 ring-black/5 mb-6">
                    <div className="p-4">
                        <div className="flex items-start">
                            <div className="flex-shrink-0">
                                <CheckCircleIcon className="h-6 w-6 text-green-400" aria-hidden="true" />
                            </div>
                            <div className="ml-3 w-0 flex-1 pt-0.5">
                                <p className="text-sm font-medium text-gray-900">Successfully imported!</p>
                                <p className="mt-1 text-sm text-gray-500">{successMessage}</p>
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
            )}

            {preview && (
                <div className="border rounded-lg p-6 bg-white shadow-sm transition-all duration-300">
                    {/* Header Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium leading-6 text-gray-900">Name</label>
                                <input
                                    type="text"
                                    value={editedName}
                                    onChange={(e) => setEditedName(e.target.value)}
                                    className="mt-1 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium leading-6 text-gray-900">Direction</label>
                                    <select
                                        value={direction}
                                        onChange={(e) => setDirection(e.target.value)}
                                        className="mt-1 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                    >
                                        <option value="↑ Nord">↑ Nord</option>
                                        <option value="↓ Sud">↓ Sud</option>
                                        <option value="→ Est">→ Est</option>
                                        <option value="← Ouest">← Ouest</option>
                                        <option value="↗ Nord Est">↗ Nord Est</option>
                                        <option value="↗ Nord Ouest">↗ Nord Ouest</option>
                                        <option value="↘ Sud Est">↘ Sud Est</option>
                                        <option value="↙ Sud Ouest">↙ Sud Ouest</option>
                                        {/* Fallback/Duplicate handling just in case */}
                                        <option value="Nord">Nord (Legacy)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium leading-6 text-gray-900">Rating</label>
                                    <select
                                        value={rating}
                                        onChange={(e) => setRating(e.target.value)}
                                        className="mt-1 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                    >
                                        <option value="⭐">⭐</option>
                                        <option value="⭐⭐">⭐⭐</option>
                                        <option value="⭐⭐⭐">⭐⭐⭐</option>
                                        <option value="⭐⭐⭐⭐">⭐⭐⭐⭐</option>
                                        <option value="⭐⭐⭐⭐⭐">⭐⭐⭐⭐⭐</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium leading-6 text-gray-900">Road Quality</label>
                                <select
                                    value={surface}
                                    onChange={(e) => setSurface(e.target.value)}
                                    className="mt-1 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                >
                                    <option value="1 - bad">1 - Bad</option>
                                    <option value="2 - bad -> average">2 - Bad to Average</option>
                                    <option value="3 - average -> good">3 - Average to Good</option>
                                    <option value="4 - good">4 - Good</option>
                                    <option value="5 - good -> very good">5 - Good to Very Good</option>
                                    <option value="6 - very good -> excellent">6 - Very Good to Excellent</option>
                                    <option value="7 - Excellent">7 - Excellent</option>
                                </select>
                            </div>
                        </div>

                        {/* Map Preview */}
                        <div className="h-64 rounded-lg overflow-hidden border border-gray-200">
                            {preview.map?.summary_polyline ? (
                                <MapPreview summaryPolyline={preview.map.summary_polyline} />
                            ) : (
                                <div className="h-full w-full bg-gray-100 flex items-center justify-center text-gray-500">
                                    No Map Data
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Stats Summary */}
                    <div className="bg-gray-50 p-4 rounded-md mb-6 text-sm text-gray-600">
                        <div className="grid grid-cols-3 gap-4 text-center">
                            <div>
                                <div className="font-semibold mb-1">Distance</div>
                                <span className="text-gray-900 font-bold text-lg">{(preview.distance / 1000).toFixed(1)}</span> km
                            </div>
                            <div>
                                <div className="font-semibold mb-1">Elevation</div>
                                <span className="text-gray-900 font-bold text-lg">{preview.total_elevation_gain}</span> m
                            </div>
                            <div>
                                <div className="font-semibold mb-1">Photos</div>
                                <span className="text-gray-900 font-bold text-lg">{preview.total_photo_count || 0}</span>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={handleImport}
                        disabled={loading}
                        className="w-full bg-green-600 text-white py-3 rounded-md hover:bg-green-700 font-bold transition-colors shadow-sm disabled:opacity-50"
                    >
                        {loading ? 'Creating Trace...' : 'Create Trace in Notion'}
                    </button>
                </div>
            )}
        </div>
    );
}
