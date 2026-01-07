'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

// Dynamic import for Leaflet map
const MapPreview = dynamic(() => import('../../traces/components/MapPreview'), { ssr: false });

export interface TraceImportData {
    name: string;
    distance: number;
    total_elevation_gain: number;
    map: {
        summary_polyline: string;
    };
    total_photo_count?: number;
    mapUrl?: string;
}

interface TracePreviewFormProps {
    data: TraceImportData;
    onImport: (details: {
        name: string;
        direction: string;
        surface: string;
        rating: string;
        distance: number;
        elevation: number;
        description: string;
    }) => Promise<void>;
    isLoading: boolean;
}

export default function TracePreviewForm({ data, onImport, isLoading }: TracePreviewFormProps) {
    const [editedName, setEditedName] = useState(data.name);
    const [direction, setDirection] = useState('↑ Nord');
    const [surface, setSurface] = useState('4 - good');
    const [rating, setRating] = useState('⭐⭐⭐');

    // New editable fields
    const [editedDistance, setEditedDistance] = useState(data.distance / 1000); // Convert to km
    const [editedElevation, setEditedElevation] = useState(data.total_elevation_gain);
    const [description, setDescription] = useState('');

    // Check if elevation data is missing (0 or very low)
    const elevationMissing = data.total_elevation_gain === 0;

    const handleImportClick = () => {
        onImport({
            name: editedName,
            direction,
            surface,
            rating,
            distance: editedDistance,
            elevation: editedElevation,
            description
        });
    };

    return (
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
                    {data.map?.summary_polyline ? (
                        <MapPreview summaryPolyline={data.map.summary_polyline} />
                    ) : (
                        <div className="h-full w-full bg-gray-100 flex items-center justify-center text-gray-500">
                            No Map Data
                        </div>
                    )}
                </div>
            </div>

            {/* Stats - Editable */}
            <div className="bg-gray-50 p-4 rounded-md mb-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium leading-6 text-gray-900">Distance (km)</label>
                        <input
                            type="number"
                            step="0.1"
                            value={editedDistance}
                            onChange={(e) => setEditedDistance(parseFloat(e.target.value) || 0)}
                            className="mt-1 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium leading-6 text-gray-900">
                            Dénivelé (m)
                            {elevationMissing && (
                                <span className="ml-2 text-amber-600 font-normal text-xs inline-flex items-center">
                                    <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                                    Non détecté
                                </span>
                            )}
                        </label>
                        <input
                            type="number"
                            value={editedElevation}
                            onChange={(e) => setEditedElevation(parseInt(e.target.value) || 0)}
                            className={`mt-1 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 ${elevationMissing ? 'ring-amber-300 bg-amber-50' : 'ring-gray-300'
                                }`}
                            placeholder={elevationMissing ? 'Saisir manuellement' : ''}
                        />
                        {elevationMissing && (
                            <p className="mt-1 text-xs text-amber-600">
                                Le fichier GPX ne contient pas de données d&apos;altitude. Veuillez saisir le dénivelé manuellement.
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Description */}
            <div className="mb-6">
                <label className="block text-sm font-medium leading-6 text-gray-900">Description / Note</label>
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    placeholder="Ajoutez une description pour ce parcours..."
                    className="mt-1 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
            </div>

            <button
                onClick={handleImportClick}
                disabled={isLoading}
                className="w-full bg-green-600 text-white py-3 rounded-md hover:bg-green-700 font-bold transition-colors shadow-sm disabled:opacity-50"
            >
                {isLoading ? 'Creating Trace...' : 'Create Trace in Notion'}
            </button>
        </div>
    );
}
