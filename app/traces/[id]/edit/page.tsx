'use client';

import { useState, useEffect, Fragment } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Dialog, Transition } from '@headlessui/react';
import { ArrowLeftIcon, CheckCircleIcon, ExclamationTriangleIcon, TrashIcon } from '@heroicons/react/24/outline';

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
    const [deleting, setDeleting] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
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
            } catch {
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
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : 'Une erreur est survenue.');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!trace) return;

        setShowDeleteModal(false);
        setDeleting(true);
        setError(null);

        try {
            const response = await fetch(`/api/traces/${trace.id}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error('Failed to delete trace');
            }

            router.push('/traces');
        } catch {
            setError('Erreur lors de la suppression du parcours.');
            setDeleting(false);
        }
    };

    if (loading) {
        return (
            <main className="min-h-screen bg-paper dark:bg-night text-ink dark:text-snow transition-colors duration-200">
                <div className="max-w-2xl mx-auto py-10 px-4">
                    <div className="animate-pulse">
                        <div className="h-8 bg-paper-2 dark:bg-night-line rounded w-1/3 mb-6"></div>
                        <div className="space-y-4">
                            <div className="h-10 bg-paper-2 dark:bg-night-line rounded"></div>
                            <div className="h-10 bg-paper-2 dark:bg-night-line rounded"></div>
                            <div className="h-10 bg-paper-2 dark:bg-night-line rounded"></div>
                        </div>
                    </div>
                </div>
            </main>
        );
    }

    if (error && !trace) {
        return (
            <main className="min-h-screen bg-paper dark:bg-night text-ink dark:text-snow transition-colors duration-200">
                <div className="max-w-2xl mx-auto py-10 px-4">
                    <div className="p-4 bg-brand-tint dark:bg-brand/15 text-brand-strong dark:text-brand-soft rounded-md border border-brand/30">
                        {error}
                    </div>
                    <Link href="/traces" className="mt-4 inline-flex items-center text-sm font-semibold text-ink-2 dark:text-snow-3 hover:text-ink dark:hover:text-snow transition-colors duration-150">
                        <ArrowLeftIcon className="h-4 w-4 mr-1" />
                        Retour aux parcours
                    </Link>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-paper dark:bg-night text-ink dark:text-snow transition-colors duration-200 py-10 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <Link href={`/traces/${trace?.id}`} className="inline-flex items-center text-sm font-semibold text-ink-2 dark:text-snow-3 hover:text-ink dark:hover:text-snow transition-colors duration-150 mb-4">
                        <ArrowLeftIcon className="h-4 w-4 mr-1" />
                        Retour au parcours
                    </Link>
                    <h1 className="font-wide text-2xl sm:text-3xl font-extrabold uppercase text-ink dark:text-snow">Modifier le parcours</h1>
                    <p className="mt-1 text-sm text-ink-3 dark:text-snow-3">
                        Modifiez les informations du parcours ci-dessous.
                    </p>
                </div>

            {/* Success Message */}
            {success && (
                <div className="mb-6 p-4 bg-green-50 dark:bg-emerald-950/40 text-green-700 dark:text-emerald-300 rounded-md border border-green-200 dark:border-emerald-900/50 flex items-center">
                    <CheckCircleIcon className="h-5 w-5 mr-2" />
                    Parcours mis à jour avec succès ! Redirection...
                </div>
            )}

            {/* Error Message */}
            {error && trace && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 rounded-md border border-red-200 dark:border-red-900/50 flex items-center">
                    <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
                    {error}
                </div>
            )}

            {/* Edit Form */}
            <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-night-2 p-6 rounded-lg shadow-sm border border-line dark:border-night-line">
                {/* Name */}
                <div>
                    <label className="block text-sm font-medium text-ink-2 dark:text-snow-2">Nom du parcours</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="mt-1 block w-full rounded-md border border-line dark:border-night-line py-1.5 px-3 bg-white dark:bg-ink text-ink dark:text-snow shadow-xs focus:border-brand focus:outline-hidden focus:ring-1 focus:ring-brand transition-colors duration-150 sm:text-sm sm:leading-6"
                        required
                    />
                </div>

                {/* Distance & Elevation */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-ink-2 dark:text-snow-2">Distance (km)</label>
                        <input
                            type="number"
                            step="0.1"
                            value={distance}
                            onChange={(e) => setDistance(parseFloat(e.target.value) || 0)}
                            className="mt-1 block w-full rounded-md border border-line dark:border-night-line py-1.5 px-3 bg-white dark:bg-ink text-ink dark:text-snow shadow-xs focus:border-brand focus:outline-hidden focus:ring-1 focus:ring-brand transition-colors duration-150 sm:text-sm sm:leading-6"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-ink-2 dark:text-snow-2">Dénivelé (m)</label>
                        <input
                            type="number"
                            value={elevation}
                            onChange={(e) => setElevation(parseInt(e.target.value) || 0)}
                            className="mt-1 block w-full rounded-md border border-line dark:border-night-line py-1.5 px-3 bg-white dark:bg-ink text-ink dark:text-snow shadow-xs focus:border-brand focus:outline-hidden focus:ring-1 focus:ring-brand transition-colors duration-150 sm:text-sm sm:leading-6"
                        />
                    </div>
                </div>

                {/* Direction & Surface */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-ink-2 dark:text-snow-2">Direction</label>
                        <select
                            value={direction}
                            onChange={(e) => setDirection(e.target.value)}
                            className="mt-1 block w-full rounded-md border border-line dark:border-night-line py-1.5 px-3 bg-white dark:bg-ink text-ink dark:text-snow shadow-xs focus:border-brand focus:outline-hidden focus:ring-1 focus:ring-brand transition-colors duration-150 sm:text-sm sm:leading-6 cursor-pointer"
                        >
                            <option value="">Sélectionner...</option>
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
                    <div>
                        <label className="block text-sm font-medium text-ink-2 dark:text-snow-2">Type de vélo</label>
                        <select
                            value={surface}
                            onChange={(e) => setSurface(e.target.value)}
                            className="mt-1 block w-full rounded-md border border-line dark:border-night-line py-1.5 px-3 bg-white dark:bg-ink text-ink dark:text-snow shadow-xs focus:border-brand focus:outline-hidden focus:ring-1 focus:ring-brand transition-colors duration-150 sm:text-sm sm:leading-6 cursor-pointer"
                        >
                            <option value="">Sélectionner...</option>
                            <option value="Road">Route</option>
                            <option value="Gravel">Gravel</option>
                            <option value="Mixed">Mixte</option>
                            <option value="MTB">VTT</option>
                            <option value="Path">Chemin</option>
                        </select>
                    </div>
                </div>

                {/* Rating */}
                <div>
                    <label className="block text-sm font-medium text-ink-2 dark:text-snow-2">Note</label>
                    <select
                        value={rating}
                        onChange={(e) => setRating(e.target.value)}
                        className="mt-1 block w-full rounded-md border border-line dark:border-night-line py-1.5 px-3 bg-white dark:bg-ink text-ink dark:text-snow shadow-xs focus:border-brand focus:outline-hidden focus:ring-1 focus:ring-brand transition-colors duration-150 sm:text-sm sm:leading-6 cursor-pointer"
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
                    <label className="block text-sm font-medium text-ink-2 dark:text-snow-2">Lien Komoot / Carte</label>
                    <input
                        type="url"
                        value={mapUrl}
                        onChange={(e) => setMapUrl(e.target.value)}
                        placeholder="https://www.komoot.com/tour/..."
                        className="mt-1 block w-full rounded-md border border-line dark:border-night-line py-1.5 px-3 bg-white dark:bg-ink text-ink dark:text-snow shadow-xs placeholder:text-ink-3 dark:placeholder:text-snow-3/60 focus:border-brand focus:outline-hidden focus:ring-1 focus:ring-brand transition-colors duration-150 sm:text-sm sm:leading-6"
                    />
                </div>

                {/* Description */}
                <div>
                    <label className="block text-sm font-medium text-ink-2 dark:text-snow-2">Description / Note</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={4}
                        className="mt-1 block w-full rounded-md border border-line dark:border-night-line py-1.5 px-3 bg-white dark:bg-ink text-ink dark:text-snow shadow-xs placeholder:text-ink-3 dark:placeholder:text-snow-3/60 focus:border-brand focus:outline-hidden focus:ring-1 focus:ring-brand transition-colors duration-150 sm:text-sm sm:leading-6"
                    />
                </div>

                {/* Actions */}
                <div className="flex justify-between items-center pt-4 border-t border-line dark:border-night-line">
                    {/* Delete Button - Left side */}
                    <button
                        type="button"
                        onClick={() => setShowDeleteModal(true)}
                        disabled={deleting || saving}
                        className="inline-flex items-center justify-center px-3 py-2 min-h-[44px] text-sm font-medium text-red-700 dark:text-red-400 bg-white dark:bg-night-2 border border-red-300 dark:border-red-900/50 rounded-md hover:bg-red-50 dark:hover:bg-red-950/30 disabled:opacity-50 transition-colors duration-150 cursor-pointer"
                    >
                        <TrashIcon className="h-4 w-4 mr-1.5" />
                        {deleting ? 'Suppression...' : 'Supprimer'}
                    </button>

                    {/* Save/Cancel - Right side */}
                    <div className="flex gap-3">
                        <Link
                            href={`/traces/${trace?.id}`}
                            className="inline-flex items-center justify-center px-4 py-2 min-h-[44px] text-sm font-medium text-ink-2 dark:text-snow-2 bg-white dark:bg-night-2 border border-line dark:border-night-line rounded-md hover:bg-paper-2 dark:hover:bg-night-3 transition-colors duration-150"
                        >
                            Annuler
                        </Link>
                        <button
                            type="submit"
                            disabled={saving || deleting}
                            className="inline-flex items-center justify-center px-4 py-2 min-h-[44px] text-sm font-medium text-white bg-brand rounded-md hover:bg-brand-strong transition-colors duration-150 disabled:opacity-50 shadow-xs cursor-pointer"
                        >
                            {saving ? 'Enregistrement...' : 'Enregistrer'}
                        </button>
                    </div>
                </div>
            </form>

            {/* Delete Confirmation Modal */}
            <Transition appear show={showDeleteModal} as={Fragment}>
                <Dialog as="div" className="relative z-50" onClose={() => setShowDeleteModal(false)}>
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" />
                    </Transition.Child>

                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4 text-center">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 scale-95"
                                enterTo="opacity-100 scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-95"
                            >
                                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-md bg-white dark:bg-night-2 border border-line dark:border-night-line p-6 text-left align-middle shadow-xl transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-full bg-red-100 dark:bg-red-950/50">
                                            <ExclamationTriangleIcon className="w-6 h-6 md:w-6 md:h-6 text-red-600 dark:text-red-400" />
                                        </div>
                                        <div>
                                            <Dialog.Title as="h3" className="text-lg font-semibold leading-6 text-ink dark:text-snow">
                                                Supprimer le parcours
                                            </Dialog.Title>
                                            <p className="mt-1 text-sm text-ink-3 dark:text-snow-3">
                                                Cette action est irréversible.
                                            </p>
                                        </div>
                                    </div>

                                    <p className="mt-4 text-sm text-ink-2 dark:text-snow-2">
                                        Êtes-vous sûr de vouloir supprimer <strong>{trace?.name}</strong> ? Toutes les données associées seront perdues.
                                    </p>

                                    <div className="mt-6 flex justify-end gap-3">
                                        <button
                                            type="button"
                                            className="px-4 py-2 min-h-[44px] inline-flex items-center justify-center text-sm font-medium text-ink-2 dark:text-snow-2 bg-white dark:bg-ink border border-line dark:border-night-line rounded-md hover:bg-paper-2 dark:hover:bg-night-3 transition-colors duration-150 cursor-pointer"
                                            onClick={() => setShowDeleteModal(false)}
                                        >
                                            Annuler
                                        </button>
                                        <button
                                            type="button"
                                            className="px-4 py-2 min-h-[44px] inline-flex items-center justify-center text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md shadow-xs transition-colors duration-150 cursor-pointer"
                                            onClick={handleDelete}
                                        >
                                            Supprimer
                                        </button>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>
            </div>
        </main>
    );
}
