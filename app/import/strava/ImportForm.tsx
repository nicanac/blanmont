'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { fetchStravaActivityAction, importStravaTraceAction, deleteTraceAction } from './actions';
import { StravaActivity } from '../../lib/strava';
import { CheckCircleIcon, XMarkIcon, TrashIcon } from '@heroicons/react/24/outline';
import TracePreviewForm from '../../features/import/components/TracePreviewForm';
import { toast } from 'sonner';

// Dynamic import for Leaflet map to avoid SSR issues
const MapPreview = dynamic(() => import('../../features/traces/components/MapPreview'), { ssr: false });

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
                toast.error(result.error);
            } else if (result.activity) {
                setPreview(result.activity);
                toast.success('Activité Strava chargée !');
            }
        } catch {
            setError('Une erreur inattendue est survenue.');
            toast.error('Une erreur inattendue est survenue.');
        } finally {
            setLoading(false);
        }
    };

    const handleImport = async (details: {
        name: string;
        direction: string;
        surface: string;
        rating: string;
        distance: number;
        elevation: number;
        description: string;
    }) => {
        if (!preview) return;
        setLoading(true);
        try {
            const activityWithEdits = {
                ...preview,
                distance: details.distance * 1000,
                total_elevation_gain: details.elevation,
                description: details.description || preview.description
            };

            const result = await importStravaTraceAction(activityWithEdits, {
                name: details.name,
                direction: details.direction,
                surface: details.surface,
                rating: details.rating
            });

            if (result.success) {
                setSuccessMessage('Parcours importé avec succès !');
                setCreatedTraceId(result.traceId || null);
                setPreview(null);
                setUrl('');
                toast.success('Parcours importé avec succès dans la base de données !');
            } else {
                setError(result.error || 'Échec de l’importation.');
                toast.error(result.error || 'Échec de l’importation.');
            }
        } catch {
            setError('Échec de l’importation.');
            toast.error('Échec de l’importation.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!createdTraceId) return;
        if (!confirm('Êtes-vous sûr de vouloir supprimer ce parcours ?')) return;

        try {
            const result = await deleteTraceAction(createdTraceId);
            if (result.success) {
                setSuccessMessage(null);
                setCreatedTraceId(null);
                toast.success('Parcours supprimé avec succès.');
            } else {
                toast.error(result.error || 'Échec de la suppression.');
            }
        } catch {
            toast.error('Erreur lors de la suppression.');
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
                    className="flex-1 rounded-xl border border-slate-300 px-4 py-2 text-slate-900 shadow-xs placeholder:text-slate-400 focus:border-[#fc4c02] focus:ring-1 focus:ring-[#fc4c02] focus:outline-hidden text-sm"
                />
                <button
                    onClick={handlePreview}
                    disabled={loading || !url}
                    className="rounded-xl bg-[#fc4c02] px-5 py-2 text-sm font-semibold text-white shadow-xs hover:bg-[#e03d00] transition-colors disabled:opacity-50"
                >
                    {loading ? 'Chargement...' : 'Prévisualiser'}
                </button>
            </div>

            {error && (
                <div className="p-4 bg-red-50 text-red-700 rounded-2xl border border-red-200 text-sm">
                    {error}
                </div>
            )}

            {successMessage && (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 shadow-xs">
                    <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                            <CheckCircleIcon className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                            <div>
                                <h4 className="text-sm font-bold text-emerald-900">Importation réussie</h4>
                                <p className="text-xs text-emerald-700 mt-0.5">{successMessage}</p>
                                {createdTraceId && (
                                    <div className="mt-3 flex items-center gap-4 text-xs font-semibold">
                                        <Link
                                            href={`/traces/${createdTraceId}`}
                                            className="text-[#e03e3e] hover:underline"
                                        >
                                            Consulter le parcours →
                                        </Link>
                                        <button
                                            onClick={handleDelete}
                                            className="text-red-600 hover:text-red-800"
                                        >
                                            Supprimer
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => setSuccessMessage(null)}
                            className="text-emerald-500 hover:text-emerald-800"
                        >
                            <XMarkIcon className="h-4 w-4" />
                        </button>
                    </div>
                </div>
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
