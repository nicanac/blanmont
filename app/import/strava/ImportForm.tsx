'use client';

import { useState } from 'react';
import { fetchStravaActivityAction, importStravaTraceAction } from './actions';
import { StravaActivity } from '../../lib/strava';

export default function ImportForm() {
    const [url, setUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [preview, setPreview] = useState<StravaActivity | null>(null);
    const [error, setError] = useState<string | null>(null);

    // New fields
    const [editedName, setEditedName] = useState('');
    const [direction, setDirection] = useState('↑ Nord');

    const handlePreview = async () => {
        setLoading(true);
        setError(null);
        setPreview(null);
        try {
            const result = await fetchStravaActivityAction(url);
            if (result.error) {
                setError(result.error);
            } else if (result.activity) {
                setPreview(result.activity);
                setEditedName(result.activity.name); // Init name
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
            const result = await importStravaTraceAction(preview, { name: editedName, direction });
            if (result.success) {
                alert('Trace imported successfully! (Check Notion)');
                setPreview(null);
                setUrl('');
                setEditedName('');
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
                <div className="p-4 bg-red-50 text-red-700 rounded-md">
                    {error}
                </div>
            )}

            {preview && (
                <div className="border rounded-lg p-6 bg-white shadow-sm">
                    {/* Editable Fields */}
                    <div className="grid grid-cols-1 gap-6 mb-6">
                        <div>
                            <label className="block text-sm font-medium leading-6 text-gray-900">Name</label>
                            <input
                                type="text"
                                value={editedName}
                                onChange={(e) => setEditedName(e.target.value)}
                                className="mt-1 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                            />
                        </div>

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
                                <option value="Centre">Centre</option>
                            </select>
                        </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-md mb-6 text-sm text-gray-600">
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <span className="block font-semibold">Distance</span>
                                {(preview.distance / 1000).toFixed(2)} km
                            </div>
                            <div>
                                <span className="block font-semibold">Elevation</span>
                                {preview.total_elevation_gain} m
                            </div>
                            <div>
                                <span className="block font-semibold">Date</span>
                                {new Date(preview.start_date).toLocaleDateString()}
                            </div>
                        </div>
                    </div>

                    {/* Assuming summary_polyline exists, we can use a static map API or just show it's ready */}
                    {preview.map?.summary_polyline && (
                        <div className="bg-gray-200 h-48 rounded flex items-center justify-center text-gray-500 mb-4">
                            Map Data Available (Polyline)
                        </div>
                    )}

                    <button
                        onClick={handleImport}
                        disabled={loading}
                        className="w-full bg-green-600 text-white py-3 rounded-md hover:bg-green-700 font-bold transition-colors"
                    >
                        {loading ? 'Creating Trace...' : 'Create Trace in Notion'}
                    </button>
                </div>
            )}
        </div>
    );
}
