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
            <div className="mb-8 rounded-lg overflow-hidden border border-line dark:border-night-line bg-paper-2 dark:bg-night-2">
                <div className="h-64 sm:h-80 w-full">
                    {data.map?.summary_polyline ? (
                        <MapPreview summaryPolyline={data.map.summary_polyline} />
                    ) : (
                        <div className="h-full w-full flex items-center justify-center text-ink-3 dark:text-snow-3">
                            Pas de données cartographiques
                        </div>
                    )}
                </div>
                {/* Stats Overlay similar to AddTraceForm */}
                <div className="bg-paper-2 dark:bg-night-3 px-4 py-3 border-t border-line dark:border-night-line flex gap-6 text-sm">
                    <div>
                        <span className="text-ink-3 dark:text-snow-3 font-medium mr-2">Distance:</span>
                        <span className="font-bold text-ink dark:text-snow">{editedDistance.toFixed(1)} km</span>
                    </div>
                    <div>
                        <span className="text-ink-3 dark:text-snow-3 font-medium mr-2">Dénivelé:</span>
                        <span className="font-bold text-ink dark:text-snow">{editedElevation} m</span>
                    </div>
                </div>
            </div>

            <div className="space-y-8 max-w-4xl mx-auto">
                {/* SECTION: GENERAL */}
                <div>
                    <h3 className="text-lg font-bold text-ink dark:text-white mb-4">Informations Générales</h3>
                    <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                        {/* Name */}
                        <div className="sm:col-span-4">
                            <label className="block text-sm font-medium text-ink dark:text-white">Nom du Parcours</label>
                            <input
                                type="text"
                                value={editedName}
                                onChange={(e) => setEditedName(e.target.value)}
                                className="mt-1 block w-full rounded-md border border-line dark:border-night-line bg-white dark:bg-night-3 text-ink dark:text-white shadow-xs focus:border-brand focus:outline-hidden focus:ring-1 focus:ring-brand sm:text-sm p-2 transition-colors duration-150"
                            />
                        </div>

                        {/* Rating */}
                        <div className="sm:col-span-2">
                            <label className="block text-sm font-medium text-ink dark:text-white">Difficulté (Rating)</label>
                            <select
                                value={rating}
                                onChange={(e) => setRating(e.target.value)}
                                className="mt-1 block w-full rounded-md border border-line dark:border-night-line bg-white dark:bg-night-3 text-ink dark:text-white shadow-xs focus:border-brand focus:outline-hidden focus:ring-1 focus:ring-brand sm:text-sm p-2 transition-colors duration-150"
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
                            <label className="block text-sm font-medium text-ink dark:text-white">Direction</label>
                            <select
                                value={direction}
                                onChange={(e) => setDirection(e.target.value)}
                                className="mt-1 block w-full rounded-md border border-line dark:border-night-line bg-white dark:bg-night-3 text-ink dark:text-white shadow-xs focus:border-brand focus:outline-hidden focus:ring-1 focus:ring-brand sm:text-sm p-2 transition-colors duration-150"
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
                            <label className="block text-sm font-medium text-ink dark:text-white">Type de vélo</label>
                            <select
                                value={surface}
                                onChange={(e) => setSurface(e.target.value)}
                                className="mt-1 block w-full rounded-md border border-line dark:border-night-line bg-white dark:bg-night-3 text-ink dark:text-white shadow-xs focus:border-brand focus:outline-hidden focus:ring-1 focus:ring-brand sm:text-sm p-2 transition-colors duration-150"
                            >
                                <option value="Road">Route</option>
                                <option value="Gravel">Gravel</option>
                                <option value="Mixed">Mixte</option>
                                <option value="MTB">VTT</option>
                                <option value="Path">Chemin</option>
                            </select>
                        </div>

                        {/* Additional Stats Section */}
                        <div className="sm:col-span-6 pt-4 border-t border-line dark:border-night-line mt-2">
                            <h4 className="text-sm font-semibold text-ink dark:text-white mb-3">Statistiques (Modifiables)</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-ink dark:text-white">Distance (km)</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={editedDistance}
                                        onChange={(e) => setEditedDistance(parseFloat(e.target.value) || 0)}
                                        className="mt-1 block w-full rounded-md border border-line dark:border-night-line bg-white dark:bg-night-3 text-ink dark:text-white shadow-xs focus:border-brand focus:outline-hidden focus:ring-1 focus:ring-brand sm:text-sm p-2 transition-colors duration-150"
                                    />
                                    <p className="mt-1 text-xs text-ink-3 dark:text-snow-3">Format: xx.x km</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-ink dark:text-white">
                                        Dénivelé (m)
                                        {elevationMissing && (
                                            <span className="ml-2 text-amber-600 dark:text-amber-400 font-normal text-xs inline-flex items-center">
                                                <ExclamationTriangleIcon className="h-3 w-3 mr-1" />
                                                À vérifier
                                            </span>
                                        )}
                                    </label>
                                    <input
                                        type="number"
                                        value={editedElevation}
                                        onChange={(e) => setEditedElevation(parseInt(e.target.value) || 0)}
                                        className={`mt-1 block w-full rounded-md shadow-xs focus:border-brand focus:outline-hidden focus:ring-1 focus:ring-brand sm:text-sm p-2 border transition-colors duration-150 ${elevationMissing ? 'border-amber-400 bg-amber-50/60 dark:bg-amber-950/30 dark:border-amber-700 dark:text-amber-200' : 'border-line dark:border-night-line bg-white dark:bg-night-3 text-ink dark:text-white'}`}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="sm:col-span-6">
                            <label className="block text-sm font-medium text-ink dark:text-white">Description / Note</label>
                            <div className="mt-1">
                                <textarea
                                    rows={4}
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Ajoutez une description, état des routes, points d'intérêt..."
                                    className="block w-full rounded-md border border-line dark:border-night-line bg-white dark:bg-night-3 text-ink dark:text-white shadow-xs focus:border-brand focus:outline-hidden focus:ring-1 focus:ring-brand sm:text-sm p-2 placeholder:text-snow-3 transition-colors duration-150"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="pt-5 border-t border-line dark:border-night-line">
                    <div className="flex justify-end">
                        <button
                            type="button"
                            onClick={handleImportClick}
                            disabled={isLoading}
                            className="ml-3 inline-flex items-center justify-center rounded-md border border-transparent bg-brand min-h-[44px] py-2 px-5 text-sm font-semibold text-white shadow-xs hover:bg-brand-strong focus:outline-hidden focus-visible:ring-2 focus-visible:ring-brand disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150 cursor-pointer"
                        >
                            {isLoading ? 'Création en cours...' : 'Créer le parcours Notion'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
