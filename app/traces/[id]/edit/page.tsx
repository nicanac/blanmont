'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeftIcon, CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import TraceForm from '../../../features/traces/components/TraceForm';
import { getTraceOptionsAction } from '../../../import/strava/actions';

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
    start?: string;
    end?: string;
    polyline?: string;
}

export default function TraceEditPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const [trace, setTrace] = useState<TraceData | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [traceOptions, setTraceOptions] = useState<{ directions: string[], surfaces: string[], locations: string[] } | undefined>(undefined);

    useEffect(() => {
        async function loadData() {
            try {
                // Fetch Trace Data
                const resolvedParams = await params;
                const traceResponse = await fetch(`/api/traces/${resolvedParams.id}`);
                if (!traceResponse.ok) throw new Error('Trace not found');
                const traceData = await traceResponse.json();
                setTrace(traceData);

                // Fetch Options
                const opts = await getTraceOptionsAction();
                const locations = Array.from(new Set([...opts.starts, ...opts.ends])).sort();
                setTraceOptions({
                    directions: opts.directions,
                    surfaces: opts.surfaces,
                    locations
                });

            } catch (e) {
                setError('Failed to load data');
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, [params]);

    const handleSubmit = async (data: any) => {
        if (!trace) return;

        setSaving(true);
        setError(null);
        setSuccess(false);

        try {
            const response = await fetch(`/api/traces/${trace.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                const resData = await response.json();
                throw new Error(resData.error || 'Failed to update trace');
            }

            setSuccess(true);
            setTimeout(() => {
                router.push(`/traces/${trace.id}`);
            }, 1000);
        } catch (e: any) {
            setError(e.message);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        // Handled within TraceForm via showDelete=true
        // But logic needs to be passed
        if (!trace) return;
        try {
            const response = await fetch(`/api/traces/${trace.id}`, { method: 'DELETE' });
            if (!response.ok) throw new Error('Failed to delete trace');
            router.push('/traces');
        } catch (e: any) {
            setError('Erreur lors de la suppression.');
        }
    };

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto py-10 px-4">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-64 bg-gray-200 rounded"></div>
                    <div className="h-32 bg-gray-200 rounded"></div>
                </div>
            </div>
        );
    }

    if (error && !trace) {
        return (
            <div className="max-w-4xl mx-auto py-10 px-4">
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
        <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
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
                    Parcours mis à jour avec succès !
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-md border border-red-200 flex items-center">
                    <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
                    {error}
                </div>
            )}

            {trace && (
                <TraceForm
                    initialData={trace}
                    onSubmit={handleSubmit}
                    isSubmitting={saving}
                    submitLabel="Enregistrer les modifications"
                    showDelete={true}
                    onDelete={handleDelete}
                    options={traceOptions}
                />
            )}
        </div>
    );
}
