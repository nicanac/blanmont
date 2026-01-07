'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeftIcon, CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface TraceData {
    id: string;
    name: string;
    distance: number;
    elevation?: number;
    direction?: string;
    surface: string;
    description?: string;
    mapUrl?: string;
    rating?: string;
    quality: number;
}

export default function TraceEditPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const [trace, setTrace] = useState<TraceData | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    // Form state
    const [name, setName] = useState('');
    const [distance, setDistance] = useState(0);
    const [elevation, setElevation] = useState(0);
    const [direction, setDirection] = useState('');
    const [surface, setSurface] = useState('');
    const [rating, setRating] = useState('');
    const [description, setDescription] = useState('');
    const [mapUrl, setMapUrl] = useState('');

    useEffect(() => {
        async function loadTrace() {
            try {
                const resolvedParams = await params;
                const response = await fetch(`/api/traces/${resolvedParams.id}`);
                if (!response.ok) {
                    throw new Error('Trace not found');
                }
                const data = await response.json();
                setTrace(data);

                // Populate form
                setName(data.name || '');
                setDistance(data.distance || 0);
                setElevation(data.elevation || 0);
                setDirection(data.direction || '');
                setSurface(data.surface || '');
                setRating(data.rating || '');
                setDescription(data.description || '');
                setMapUrl(data.mapUrl || '');
            } catch (e) {
                setError('Failed to load trace');
            } finally {
                setLoading(false);
            }
        }
        loadTrace();
    }, [params]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!trace) return;

        setSaving(true);
        setError(null);
        setSuccess(false);

        try {
            const response = await fetch(`/api/traces/${trace.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name,
                    distance,
                    elevation,
                    direction,
                    surface,
                    rating,
                    description,
                    mapUrl
                })
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to update trace');
            }

            setSuccess(true);
            setTimeout(() => {
                router.push(`/traces/${trace.id}`);
            }, 1500);
        } catch (e: any) {
            setError(e.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="max-w-2xl mx-auto py-10 px-4">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
                    <div className="space-y-4">
                        <div className="h-10 bg-gray-200 rounded"></div>
                        <div className="h-10 bg-gray-200 rounded"></div>
                        <div className="h-10 bg-gray-200 rounded"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (error && !trace) {
        return (
            <div className="max-w-2xl mx-auto py-10 px-4">
                <div className="p-4 bg-red-50 text-red-700 rounded-md border border-red-200">
                    {error}
                </div>
                <Link href="/traces" className="mt-4 inline-flex items-center text-sm text-gray-600 hover:text-gray-900">
                    <ArrowLeftIcon className="h-4 w-4 mr-1" />
                    Retour aux parcours
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="mb-8">
                <Link href={`/traces/${trace?.id}`} className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4">
                    <ArrowLeftIcon className="h-4 w-4 mr-1" />
                    Retour au parcours
                </Link>
                <h1 className="text-2xl font-bold text-gray-900">Modifier le parcours</h1>
                <p className="mt-1 text-sm text-gray-500">
                    Modifiez les informations du parcours ci-dessous.
                </p>
            </div>

            {/* Success Message */}
            {success && (
                <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-md border border-green-200 flex items-center">
                    <CheckCircleIcon className="h-5 w-5 mr-2" />
                    Parcours mis à jour avec succès ! Redirection...
                </div>
            )}

            {/* Error Message */}
            {error && trace && (
                <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-md border border-red-200 flex items-center">
                    <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
                    {error}
                </div>
            )}

            {/* Edit Form */}
            <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow-sm border">
                {/* Name */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Nom du parcours</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="mt-1 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-brand-primary sm:text-sm sm:leading-6"
                        required
                    />
                </div>

                {/* Distance & Elevation */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Distance (km)</label>
                        <input
                            type="number"
                            step="0.1"
                            value={distance}
                            onChange={(e) => setDistance(parseFloat(e.target.value) || 0)}
                            className="mt-1 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-brand-primary sm:text-sm sm:leading-6"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Dénivelé (m)</label>
                        <input
                            type="number"
                            value={elevation}
                            onChange={(e) => setElevation(parseInt(e.target.value) || 0)}
                            className="mt-1 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-brand-primary sm:text-sm sm:leading-6"
                        />
                    </div>
                </div>

                {/* Direction & Surface */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Direction</label>
                        <select
                            value={direction}
                            onChange={(e) => setDirection(e.target.value)}
                            className="mt-1 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-brand-primary sm:text-sm sm:leading-6"
                        >
                            <option value="">Sélectionner...</option>
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
                        <label className="block text-sm font-medium text-gray-700">Qualité route</label>
                        <select
                            value={surface}
                            onChange={(e) => setSurface(e.target.value)}
                            className="mt-1 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-brand-primary sm:text-sm sm:leading-6"
                        >
                            <option value="">Sélectionner...</option>
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

                {/* Rating */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Note</label>
                    <select
                        value={rating}
                        onChange={(e) => setRating(e.target.value)}
                        className="mt-1 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-brand-primary sm:text-sm sm:leading-6"
                    >
                        <option value="">Sélectionner...</option>
                        <option value="⭐">⭐</option>
                        <option value="⭐⭐">⭐⭐</option>
                        <option value="⭐⭐⭐">⭐⭐⭐</option>
                        <option value="⭐⭐⭐⭐">⭐⭐⭐⭐</option>
                        <option value="⭐⭐⭐⭐⭐">⭐⭐⭐⭐⭐</option>
                    </select>
                </div>

                {/* Map URL */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Lien Komoot / Carte</label>
                    <input
                        type="url"
                        value={mapUrl}
                        onChange={(e) => setMapUrl(e.target.value)}
                        placeholder="https://www.komoot.com/tour/..."
                        className="mt-1 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-brand-primary sm:text-sm sm:leading-6"
                    />
                </div>

                {/* Description */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Description / Note</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={4}
                        className="mt-1 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-brand-primary sm:text-sm sm:leading-6"
                    />
                </div>

                {/* Submit Button */}
                <div className="flex justify-end gap-4">
                    <Link
                        href={`/traces/${trace?.id}`}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                        Annuler
                    </Link>
                    <button
                        type="submit"
                        disabled={saving}
                        className="px-4 py-2 text-sm font-medium text-white bg-brand-primary rounded-md hover:opacity-90 disabled:opacity-50"
                    >
                        {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
                    </button>
                </div>
            </form>
        </div>
    );
}
