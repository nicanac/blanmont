import { getTrace, getTraces, submitFeedback, getMembers, getFeedbackForTrace } from '../../lib/notion';
import { uploadMapPreview, generateMapPreview } from '../../actions';
import DownloadGPXButton from '../../features/traces/components/DownloadGPXButton';
import { notFound } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import FeedbackForm from './FeedbackForm';
import FeedbackList from './FeedbackList';
import {
    MapPinIcon,
    ArrowTrendingUpIcon,
    ArrowsRightLeftIcon,
    CameraIcon,
    ChatBubbleLeftRightIcon,
    PencilSquareIcon,
    ArrowTopRightOnSquareIcon
} from '@heroicons/react/24/outline';

import TraceMapWrapper from './TraceMapWrapper';

export const revalidate = 60;

export async function generateStaticParams() {
    const traces = await getTraces();
    return traces.map((trace) => ({
        id: trace.id,
    }));
}

export default async function TraceDetailPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const trace = await getTrace(params.id);

    if (!trace) {
        notFound();
    }

    const members = await getMembers();
    const feedbackList = await getFeedbackForTrace(trace.id);

    async function addFeedback(formData: FormData) {
        'use server'
        const rating = Number(formData.get('rating'));
        const comment = formData.get('comment') as string;
        const memberId = formData.get('memberId') as string;
        const feedbackId = formData.get('feedbackId') as string;

        if (trace && rating && comment && memberId) {
            await submitFeedback(trace.id, memberId, rating, comment, feedbackId || undefined);
            revalidatePath(`/traces/${trace.id}`);
        }
    }

    // derived date or default
    // We don't have a date field, skipping for now.

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            {/* HERRO SECTION */}
            <div className="relative h-[45vh] lg:h-[50vh] w-full bg-gray-900 overflow-hidden">
                {/* Background Image with Overlay */}
                <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 hover:scale-105"
                    style={{ backgroundImage: `url(${trace.photoUrl || '/placeholder-trace.jpg'})` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent" />

                <div className="absolute inset-0 flex flex-col justify-end px-4 sm:px-6 lg:px-8 pb-10 sm:pb-16 max-w-7xl mx-auto w-full">
                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-4">
                        <span className="inline-flex items-center rounded-full bg-brand-primary/90 px-3 py-1 text-sm font-medium text-white shadow-sm backdrop-blur-sm">
                            {trace.surface}
                        </span>
                        {trace.ratingColor && (
                            <span className="inline-flex items-center rounded-full bg-white/20 px-3 py-1 text-sm font-medium text-white backdrop-blur-sm border border-white/10">
                                {'⭐'.repeat(trace.quality)}
                            </span>
                        )}
                    </div>

                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight mb-6 shadow-black drop-shadow-lg">
                        {trace.name}
                    </h1>

                    {/* Key Stats Big */}
                    <div className="flex items-center gap-8 sm:gap-12 text-white/90">
                        <div>
                            <p className="text-sm font-medium text-white/60 uppercase tracking-wider mb-1">Distance</p>
                            <p className="text-3xl sm:text-4xl font-bold text-white leading-none">
                                {trace.distance} <span className="text-lg sm:text-xl font-medium text-white/60">km</span>
                            </p>
                        </div>
                        {trace.elevation !== undefined && (
                            <div>
                                <p className="text-sm font-medium text-white/60 uppercase tracking-wider mb-1">Dénivelé</p>
                                <p className="text-3xl sm:text-4xl font-bold text-white leading-none">
                                    {trace.elevation} <span className="text-lg sm:text-xl font-medium text-white/60">m</span>
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* MAIN CONTENT GRID */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* LEFT COLUMN (2/3) */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* Map Card */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="p-4 sm:p-6 border-b border-gray-100 flex justify-between items-center">
                                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                    <MapPinIcon className="h-5 w-5 text-brand-primary" />
                                    Carte Interactive
                                </h2>
                                {trace.mapUrl && (
                                    <a href={trace.mapUrl} target="_blank" rel="noopener noreferrer"
                                        className="text-sm text-brand-primary hover:text-brand-dark font-medium flex items-center gap-1 hover:underline">
                                        Voir sur Komoot <ArrowTopRightOnSquareIcon className="h-3 w-3" />
                                    </a>
                                )}
                            </div>
                            <div className="h-80 sm:h-96 w-full bg-gray-50 relative group">
                                {trace.polyline ? (
                                    <TraceMapWrapper polyline={trace.polyline} />
                                ) : (
                                    <div className="flex items-center justify-center h-full text-gray-400">
                                        Pas de tracé disponible pour la carte
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Description */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">À propos du parcours</h2>
                            <div className="prose prose-brand max-w-none text-gray-600 whitespace-pre-line leading-relaxed">
                                {trace.description || "Aucune description fournie pour ce parcours."}
                            </div>
                        </div>

                        {/* Photos */}
                        {trace.photoPreviews && trace.photoPreviews.length > 0 && (
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                                    <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                        <CameraIcon className="h-5 w-5 text-gray-500" />
                                        Aperçu Photos
                                    </h2>
                                    {trace.photoAlbumUrl && (
                                        <a href={trace.photoAlbumUrl} target="_blank" rel="noopener noreferrer"
                                            className="text-sm text-brand-primary hover:text-brand-dark font-medium hover:underline">
                                            Voir l'album complet
                                        </a>
                                    )}
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1 p-1 bg-gray-100">
                                    {trace.photoPreviews.slice(0, 6).map((url, i) => (
                                        <a
                                            key={i}
                                            href={trace.photoAlbumUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="relative aspect-square overflow-hidden group"
                                        >
                                            <img
                                                src={url}
                                                alt={`Photo ${i}`}
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                            />
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Comments */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                                <ChatBubbleLeftRightIcon className="h-5 w-5 text-gray-400" />
                                Retours de la communauté
                            </h2>
                            <FeedbackList feedbackList={feedbackList} members={members} />
                        </div>
                    </div>

                    {/* RIGHT COLUMN (1/3) - SIDEBAR */}
                    <div className="space-y-6">

                        {/* Action Card */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">Actions</h3>
                            <div className="space-y-3">
                                <div className="w-full">
                                    <DownloadGPXButton polyline={trace.polyline} traceName={trace.name} />
                                </div>
                                {trace.mapUrl && (
                                    <a
                                        href={trace.mapUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-center w-full px-4 py-2 border border-brand-primary text-brand-primary font-medium rounded-lg hover:bg-brand-primary/5 transition-colors"
                                    >
                                        Ouvrir sur Komoot
                                    </a>
                                )}
                            </div>
                        </div>

                        {/* Details Card */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 divide-y divide-gray-100">
                            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">Détails</h3>

                            <div className="py-3 flex justify-between items-center">
                                <span className="text-gray-500 flex items-center gap-2">
                                    <ArrowsRightLeftIcon className="h-4 w-4" /> Type
                                </span>
                                <span className="font-medium text-gray-900">{trace.surface}</span>
                            </div>

                            {trace.direction && (
                                <div className="py-3 flex justify-between items-center">
                                    <span className="text-gray-500 flex items-center gap-2">
                                        <ArrowTrendingUpIcon className="h-4 w-4" /> Sens
                                    </span>
                                    <span className="font-medium text-gray-900">{trace.direction}</span>
                                </div>
                            )}

                            {(trace.start || trace.end) && (
                                <div className="py-3">
                                    <div className="flex items-start gap-3 mb-2">
                                        <div className="flex flex-col items-center mt-1">
                                            <div className="w-2 h-2 rounded-full bg-green-500" />
                                            <div className="w-0.5 h-6 bg-gray-200 my-1" />
                                            <div className="w-2 h-2 rounded-full bg-red-500" />
                                        </div>
                                        <div className="flex-1 space-y-3">
                                            <div>
                                                <p className="text-xs text-gray-400 uppercase">Départ</p>
                                                <p className="text-sm font-medium text-gray-900">{trace.start || 'Non spécifié'}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-400 uppercase">Arrivée</p>
                                                <p className="text-sm font-medium text-gray-900">{trace.end || 'Non spécifié'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Share Feedback CTA */}
                        <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl shadow-sm border border-indigo-100 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Vous avez roulé ce parcours ?</h3>
                            <p className="text-gray-600 text-sm mb-4">Partagez votre expérience et aidez les autres membres du club.</p>
                            <Suspense fallback={<div>Chargement...</div>}>
                                <FeedbackForm
                                    traceId={trace.id}
                                    members={members}
                                    feedbackList={feedbackList}
                                    onSubmit={addFeedback}
                                />
                            </Suspense>
                        </div>

                        {/* Admin Tools (Hidden/Subtle) */}
                        <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 opacity-75 hover:opacity-100 transition-opacity">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-semibold text-gray-500 uppercase">Admin</span>
                            </div>
                            <div className="grid grid-cols-1 gap-2">
                                <a href={`/traces/${trace.id}/edit`} className="text-xs flex items-center justify-center gap-1 py-1.5 bg-white border border-gray-300 rounded hover:bg-gray-50 text-gray-700">
                                    <PencilSquareIcon className="h-3 w-3" /> Modifier les infos
                                </a>
                                <form action={generateMapPreview}>
                                    <input type="hidden" name="traceId" value={trace.id} />
                                    <button type="submit" className="w-full text-xs flex items-center justify-center gap-1 py-1.5 bg-white border border-gray-300 rounded hover:bg-gray-50 text-gray-700">
                                        ⚡ Regen Map Preview
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

