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
    const [direction, setDirection] = useState('North');
    const [surface, setSurface] = useState('Road');
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
        <div className="py-6 px-4 sm:px-6 lg:px-8">
            {/* Map Preview Section - Full Width similar to AddTraceForm */}
            <div className="mb-8 rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                <div className="h-64 sm:h-80 w-full">
                    {data.map?.summary_polyline ? (
                        <MapPreview summaryPolyline={data.map.summary_polyline} />
                    ) : (
                        <div className="h-full w-full flex items-center justify-center text-gray-500">
                            Pas de données cartographiques
                        </div>
                    )}
                </div>
                {/* Stats Overlay similar to AddTraceForm */}
                <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 flex gap-6 text-sm">
                    <div>
                        <span className="text-gray-500 font-medium mr-2">Distance:</span>
                        <span className="font-bold text-gray-900">{editedDistance.toFixed(1)} km</span>
                    </div>
                    <div>
                        <span className="text-gray-500 font-medium mr-2">Dénivelé:</span>
                        <span className="font-bold text-gray-900">{editedElevation} m</span>
                    </div>
                </div>
            </div>

            <div className="space-y-8 max-w-4xl mx-auto">
                {/* SECTION: GENERAL */}
                <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Informations Générales</h3>
                    <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                        {/* Name */}
                        <div className="sm:col-span-4">
                            <label className="block text-sm font-medium text-gray-700">Nom du Parcours</label>
                            <input
                                type="text"
                                value={editedName}
                                onChange={(e) => setEditedName(e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-primary focus:ring-brand-primary sm:text-sm p-2 border"
                            />
                        </div>

                        {/* Rating */}
                        <div className="sm:col-span-2">
                            <label className="block text-sm font-medium text-gray-700">Difficulté (Rating)</label>
                            <select
                                value={rating}
                                onChange={(e) => setRating(e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-primary focus:ring-brand-primary sm:text-sm p-2 border"
                            >
                                <option value="⭐">⭐ (Facile)</option>
                                <option value="⭐⭐">⭐⭐</option>
                                <option value="⭐⭐⭐">⭐⭐⭐ (Moyen)</option>
                                <option value="⭐⭐⭐⭐">⭐⭐⭐⭐ (Difficile)</option>
                                <option value="⭐⭐⭐⭐⭐">⭐⭐⭐⭐⭐ (Expert)</option>
                            </select>
                        </div>

                        {/* Direction */}
                        <div className="sm:col-span-3">
                            <label className="block text-sm font-medium text-gray-700">Direction</label>
                            <select
                                value={direction}
                                onChange={(e) => setDirection(e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-primary focus:ring-brand-primary sm:text-sm p-2 border"
                            >
                                <option value="North">↑ Nord</option>
                                <option value="South">↓ Sud</option>
                                <option value="East">→ Est</option>
                                <option value="West">← Ouest</option>
                                <option value="North-East">↗ Nord-Est</option>
                                <option value="North-West">↖ Nord-Ouest</option>
                                <option value="South-East">↘ Sud-Est</option>
                                <option value="South-West">↙ Sud-Ouest</option>
                            </select>
                        </div>

                        {/* Surface */}
                        <div className="sm:col-span-3">
                            <label className="block text-sm font-medium text-gray-700">Type de vélo</label>
                            <select
                                value={surface}
                                onChange={(e) => setSurface(e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-primary focus:ring-brand-primary sm:text-sm p-2 border"
                            >
                                <option value="Road">Route</option>
                                <option value="Gravel">Gravel</option>
                                <option value="Mixed">Mixte</option>
                                <option value="MTB">VTT</option>
                                <option value="Path">Chemin</option>
                            </select>
                        </div>

                        {/* Additional Stats Section */}
                        <div className="sm:col-span-6 pt-4 border-t border-gray-100 mt-2">
                            <h4 className="text-sm font-medium text-gray-900 mb-3">Statistiques (Modifiables)</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Distance (km)</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={editedDistance}
                                        onChange={(e) => setEditedDistance(parseFloat(e.target.value) || 0)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-primary focus:ring-brand-primary sm:text-sm p-2 border"
                                    />
                                    <p className="mt-1 text-xs text-gray-500">Format: xx.x km</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Dénivelé (m)
                                        {elevationMissing && (
                                            <span className="ml-2 text-amber-600 font-normal text-xs inline-flex items-center">
                                                <ExclamationTriangleIcon className="h-3 w-3 mr-1" />
                                                À vérifier
                                            </span>
                                        )}
                                    </label>
                                    <input
                                        type="number"
                                        value={editedElevation}
                                        onChange={(e) => setEditedElevation(parseInt(e.target.value) || 0)}
                                        className={`mt-1 block w-full rounded-md shadow-sm focus:border-brand-primary focus:ring-brand-primary sm:text-sm p-2 border ${elevationMissing ? 'border-amber-300 bg-amber-50' : 'border-gray-300'}`}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="sm:col-span-6">
                            <label className="block text-sm font-medium text-gray-700">Description / Note</label>
                            <div className="mt-1">
                                <textarea
                                    rows={4}
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Ajoutez une description, état des routes, points d'intérêt..."
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-primary focus:ring-brand-primary sm:text-sm p-2 border"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="pt-5 border-t border-gray-200">
                    <div className="flex justify-end">
                        <button
                            type="button"
                            onClick={handleImportClick}
                            disabled={isLoading}
                            className="ml-3 inline-flex justify-center rounded-md border border-transparent bg-brand-primary py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Création en cours...' : 'Créer le parcours Notion'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
