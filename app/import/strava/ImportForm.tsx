'use client';

import { useState } from 'react';
import { fetchStravaActivityAction, importStravaTraceAction } from './actions';
import { StravaActivity } from '../../lib/strava';

export default function ImportForm() {
    const [url, setUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [preview, setPreview] = useState<StravaActivity | null>(null);
    const [error, setError] = useState<string | null>(null);

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
            const result = await importStravaTraceAction(preview);
            if (result.success) {
                alert('Trace imported successfully! (Check Notion)');
                setPreview(null);
                setUrl('');
            } else {
                setError('Failed to import trace.');
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
                <div className="border rounded-lg p-4 bg-gray-50">
                    <h4 className="font-bold text-lg mb-2">{preview.name}</h4>
                    <div className="grid grid-cols-3 gap-4 mb-4 text-sm text-gray-600">
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

                    {/* Assuming summary_polyline exists, we can use a static map API or just show it's ready */}
                    {preview.map?.summary_polyline && (
                        <div className="bg-gray-200 h-48 rounded flex items-center justify-center text-gray-500 mb-4">
                            Map Data Available (Polyline)
                        </div>
                    )}

                    <button
                        onClick={handleImport}
                        disabled={loading}
                        className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 font-semibold"
                    >
                        {loading ? 'Importing...' : 'Create Trace in Notion'}
                    </button>
                </div>
            )}
        </div>
    );
}
