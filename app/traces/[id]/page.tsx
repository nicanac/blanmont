import { getTrace, getTraces, submitFeedback, getMembers, getFeedbackForTrace } from '../../lib/firebase';
import { uploadMapPreview, generateMapPreview } from '../../actions';
import DownloadGPXButton from '../../features/traces/components/DownloadGPXButton';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { Suspense } from 'react';
import FeedbackForm from './FeedbackForm';
import FeedbackList from './FeedbackList';
import {
  MapIcon,
  PhotoIcon,
  PencilSquareIcon,
  SparklesIcon,
  ArrowDownTrayIcon,
} from '@heroicons/react/24/outline';

// Revalidate every minute
export const revalidate = 60;

// Enable static generation for known paths (optional, but good for performance)
export async function generateStaticParams() {
  const traces = await getTraces();
  return traces.map((trace) => ({
    id: trace.id,
  }));
}

/**
 * Trace Detail Page.
 * Displays comprehensive information about a specific trace (Map, Stats, Photos, Feedback).
 * Includes forms for submitting feedback and admin tools for updating map previews.
 *
 * @param props.params - Route parameters containing the trace `id`.
 */
export default async function TraceDetailPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const trace = await getTrace(params.id);

  if (!trace) {
    notFound();
  }

  // Fetch additional data
  const members = await getMembers();
  const feedbackList = await getFeedbackForTrace(trace.id);

  async function addFeedback(formData: FormData) {
    'use server';

    const rating = Number(formData.get('rating'));
    const comment = formData.get('comment') as string;
    const memberId = formData.get('memberId') as string;
    const feedbackId = formData.get('feedbackId') as string; // Capture ID for update

    if (trace && rating && comment && memberId) {
      await submitFeedback(trace.id, memberId, rating, comment, feedbackId || undefined);
      revalidatePath(`/traces/${trace.id}`);
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Section */}
      <div className="relative mb-8 h-[300px] sm:h-[400px] overflow-hidden rounded-lg bg-slate-900 flex flex-col justify-end shadow-xl">
        {trace.photoUrl && (
          <div className="absolute inset-0 opacity-60">
            <Image
              src={trace.photoUrl}
              alt={trace.name}
              fill
              className="object-cover object-center"
              priority
            />
          </div>
        )}
        <div className="relative z-10 p-6 sm:p-8 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent">
          <div className="flex flex-wrap gap-2 mb-2">
            <span className="rounded-full bg-[#e03e3e] px-3 py-1 text-xs font-semibold text-white shadow-xs">
              {trace.surface}
            </span>
            {trace.start && (
              <span className="rounded-full border border-white/40 bg-black/30 px-3 py-1 text-xs font-medium text-white backdrop-blur-xs">
                Départ : {trace.start}
              </span>
            )}
            {trace.end && (
              <span className="rounded-full border border-white/40 bg-black/30 px-3 py-1 text-xs font-medium text-white backdrop-blur-xs">
                Arrivée : {trace.end}
              </span>
            )}
            {trace.direction && (
              <span className="rounded-full border border-white/40 bg-black/30 px-3 py-1 text-xs font-medium text-white backdrop-blur-xs">
                Dir : {trace.direction}
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight text-balance">
            {trace.name}
          </h1>

          <div className="mt-3 flex items-center gap-4 text-white text-sm font-bold">
            <span className="text-lg tabular-nums">{trace.distance} km</span>
            <span className="text-white/40">•</span>
            {trace.elevation && (
              <>
                <span className="text-lg tabular-nums">{trace.elevation} m D+</span>
                <span className="text-white/40">•</span>
              </>
            )}
            <span className="text-amber-400 text-lg">
              {'★'.repeat(trace.quality || 5)}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-start">
        {/* Main Content */}
        <div className="lg:col-span-8 space-y-8">
          <div className="rounded-lg border border-[#e4e0d8] bg-white p-6 sm:p-8 shadow-xs space-y-6">
            <div className="text-base text-[#3a3f4a] leading-relaxed whitespace-pre-line">
              {trace.description || 'Aucune description fournie.'}
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              {trace.mapUrl && (
                <a
                  href={trace.mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-[#e03e3e] px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#c93434] transition-colors"
                >
                  <MapIcon className="h-4 w-4" />
                  <span>Voir la carte interactive</span>
                </a>
              )}

              <DownloadGPXButton polyline={trace.polyline} traceName={trace.name} />

              {trace.photoAlbumUrl && (
                <a
                  href={trace.photoAlbumUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors"
                >
                  <PhotoIcon className="h-4 w-4" />
                  <span>Voir l&apos;album photo</span>
                </a>
              )}
            </div>

            {/* Photo Previews */}
            {trace.photoPreviews && trace.photoPreviews.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 pt-4 border-t border-[#efece5]">
                {trace.photoPreviews.map((url, i) => (
                  <a
                    key={i}
                    href={trace.photoAlbumUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="relative aspect-square overflow-hidden rounded-md bg-[#f2efe9] hover:opacity-90 transition-opacity"
                  >
                    <Image
                      src={url}
                      alt={`Ride preview ${i + 1}`}
                      fill
                      sizes="(max-width: 600px) 50vw, 25vw"
                      className="object-cover"
                      loading="lazy"
                    />
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Feedback Section */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-[#101216]">
              Commentaires de la communauté
            </h3>
            <FeedbackList feedbackList={feedbackList} members={members} />
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          {/* Feedback Form Card */}
          <div className="rounded-lg border border-[#e4e0d8] bg-white p-6 shadow-xs space-y-4">
            <div>
              <h3 className="text-lg font-bold text-[#101216]">Donnez votre avis</h3>
              <p className="text-xs text-[#5c6370] mt-1">
                Vous avez roulé ce parcours ? Partagez votre expérience avec le club.
              </p>
            </div>
            <Suspense fallback={<div className="text-xs text-slate-400">Chargement...</div>}>
              <FeedbackForm
                traceId={trace.id}
                members={members}
                feedbackList={feedbackList}
                onSubmit={addFeedback}
              />
            </Suspense>
          </div>

          {/* Admin Tools Card */}
          <div className="rounded-lg border border-[#e4e0d8] bg-[#f2efe9]/70 p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#3a3f4a]">
              Outils Administrateur
            </h3>

            {/* Edit Trace Button */}
            <Link
              href={`/traces/${trace.id}/edit`}
              className="inline-flex items-center justify-center gap-2 w-full rounded-full bg-slate-900 px-4 py-2.5 text-xs font-semibold text-white hover:bg-slate-800 transition-colors"
            >
              <PencilSquareIcon className="h-4 w-4" />
              <span>Modifier le parcours</span>
            </Link>

            <div className="border-t border-[#e4e0d8] pt-3 space-y-3">
              <p className="text-xs text-[#5c6370]">
                Mettre à jour l&apos;aperçu de la carte (URL de l&apos;image)
              </p>

              <form action={uploadMapPreview} className="space-y-2">
                <input type="hidden" name="traceId" value={trace.id} />
                <input
                  type="url"
                  name="imageUrl"
                  placeholder="https://example.com/map.jpg"
                  required
                  className="w-full rounded-xl border border-[#e4e0d8] bg-white px-3 py-2 text-xs text-[#101216] focus:border-[#e03e3e] focus:outline-hidden"
                />
                <button
                  type="submit"
                  className="w-full rounded-full border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-[#3a3f4a] hover:bg-[#f2efe9] transition-colors"
                >
                  Mettre à jour l&apos;image
                </button>
              </form>

              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-[#e4e0d8]" />
                <span className="shrink mx-2 text-xs text-slate-400 font-semibold uppercase tracking-wider">ou</span>
                <div className="flex-grow border-t border-[#e4e0d8]" />
              </div>

              <form action={generateMapPreview}>
                <input type="hidden" name="traceId" value={trace.id} />
                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-1.5 w-full rounded-full border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-[#3a3f4a] hover:bg-[#f2efe9] transition-colors"
                >
                  <SparklesIcon className="h-3.5 w-3.5 text-amber-500" />
                  <span>Générer depuis Komoot</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
