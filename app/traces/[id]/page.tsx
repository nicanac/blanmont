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
import { SheetHeader } from '../../components/carte/SheetHeader';
import {
  MapIcon,
  PhotoIcon,
  PencilSquareIcon,
  SparklesIcon,
  ArrowLeftIcon,
} from '@heroicons/react/24/outline';

// Revalidate every minute
export const revalidate = 60;

// Enable static generation for known paths (optional, but good for performance)
export async function generateStaticParams(): Promise<{ id: string }[]> {
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
export default async function TraceDetailPage(props: {
  params: Promise<{ id: string }>;
}): Promise<React.ReactElement> {
  const params = await props.params;
  const trace = await getTrace(params.id);

  if (!trace) {
    notFound();
  }

  // Fetch additional data
  const members = await getMembers();
  const feedbackList = await getFeedbackForTrace(trace.id);

  async function addFeedback(formData: FormData): Promise<void> {
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
    <main className="min-h-screen bg-paper text-ink transition-colors duration-200 dark:bg-night dark:text-snow">
      <SheetHeader
        sheet="Parcours &amp; GPX"
        focus={{ x: 50, y: 50 }}
        title={trace.name}
        description={
          trace.description ||
          'Trace officielle du Club Cyclo Saint-Martin de Blanmont. Consultez le profil altimétrique, téléchargez le fichier GPX et partagez vos impressions.'
        }
        legend={[
          { term: 'Distance', value: `${trace.distance} km` },
          { term: 'Dénivelé', value: trace.elevation ? `${trace.elevation} m D+` : '—' },
          { term: 'Revêtement', value: trace.surface || 'Route' },
          ...(trace.direction ? [{ term: 'Direction', value: trace.direction }] : []),
          ...(trace.start ? [{ term: 'Départ', value: trace.start }] : []),
        ]}
        actions={
          <div className="flex flex-wrap items-center gap-3">
            <DownloadGPXButton polyline={trace.polyline} traceName={trace.name} />
            {trace.mapUrl && (
              <a
                href={trace.mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-[44px] items-center gap-2 rounded-md border border-line dark:border-night-line bg-paper dark:bg-night-2 px-4 py-2 font-narrow text-xs font-bold uppercase tracking-[0.08em] text-ink dark:text-snow hover:bg-paper-2 dark:hover:bg-night-3 transition-colors"
              >
                <MapIcon className="h-4 w-4 text-hydro" aria-hidden="true" />
                <span>Carte interactive</span>
              </a>
            )}
          </div>
        }
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Navigation Breadcrumb */}
        <div className="mb-6">
          <Link
            href="/traces"
            className="inline-flex min-h-[44px] items-center gap-2 font-narrow text-xs font-bold uppercase tracking-[0.1em] text-ink-2 transition-colors hover:text-ink dark:text-snow-2 dark:hover:text-snow"
          >
            <ArrowLeftIcon className="h-4 w-4" aria-hidden="true" />
            <span>Retour aux parcours</span>
          </Link>
        </div>

        {/* Hero Photo Plate (if available) */}
        {trace.photoUrl && (
          <div className="relative mb-8 h-[260px] sm:h-[380px] overflow-hidden rounded-lg border border-line dark:border-night-line shadow-xs">
            <Image
              src={trace.photoUrl}
              alt={trace.name}
              fill
              className="object-cover object-center"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none" />
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs text-white">
              <span className="rounded-full bg-brand px-3 py-1 font-narrow font-bold uppercase tracking-[0.08em]">
                {trace.surface}
              </span>
              <span className="font-narrow font-bold uppercase tracking-[0.08em] tabular-nums text-white/90">
                {trace.distance} km · {trace.elevation || 0} m D+
              </span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-start">
          {/* Main Content */}
          <div className="lg:col-span-8 space-y-8">
            <div className="rounded-lg border border-line dark:border-night-line bg-white dark:bg-night-2 p-6 sm:p-8 shadow-xs space-y-6">
              <div className="text-base text-ink-2 dark:text-snow-2 leading-relaxed whitespace-pre-line">
                {trace.description || 'Aucune description fournie.'}
              </div>

              <div className="flex flex-wrap gap-3 pt-2">
                {trace.mapUrl && (
                  <a
                    href={trace.mapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="min-h-[44px] inline-flex items-center gap-2 rounded-md bg-brand px-6 py-3 font-narrow text-xs font-bold uppercase tracking-[0.08em] text-white shadow-xs hover:bg-brand-strong transition-colors"
                  >
                    <MapIcon className="h-4 w-4" aria-hidden="true" />
                    <span>Voir la carte interactive</span>
                  </a>
                )}

                <DownloadGPXButton polyline={trace.polyline} traceName={trace.name} />

                {trace.photoAlbumUrl && (
                  <a
                    href={trace.photoAlbumUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="min-h-[44px] inline-flex items-center gap-2 rounded-md border border-line dark:border-night-line bg-paper dark:bg-night-2 px-6 py-3 font-narrow text-xs font-bold uppercase tracking-[0.08em] text-ink dark:text-snow hover:bg-paper-2 dark:hover:bg-night-3 transition-colors"
                  >
                    <PhotoIcon className="h-4 w-4 text-hydro" aria-hidden="true" />
                    <span>Voir l&apos;album photo</span>
                  </a>
                )}
              </div>

              {/* Photo Previews */}
              {trace.photoPreviews && trace.photoPreviews.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 pt-4 border-t border-line dark:border-night-line">
                  {trace.photoPreviews.map((url, i) => (
                  <a
                    key={i}
                    href={trace.photoAlbumUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="relative aspect-square overflow-hidden rounded-md bg-paper-2 dark:bg-ink hover:opacity-90 transition-opacity"
                  >
                    <Image
                      src={url}
                      alt={`Ride preview ${i + 1}`}
                      fill
                      unoptimized
                      sizes="(max-width: 600px) 50vw, 25vw"
                      className="object-cover"
                    />
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Feedback Section */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-ink dark:text-white">
              Commentaires de la communauté
            </h3>
            <FeedbackList feedbackList={feedbackList} members={members} />
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          {/* Feedback Form Card */}
          <div className="rounded-lg border border-line dark:border-night-line bg-white dark:bg-night-2 p-6 shadow-xs space-y-4">
            <div>
              <h3 className="text-lg font-bold text-ink dark:text-white">Donnez votre avis</h3>
              <p className="text-xs text-ink-3 dark:text-snow-3 mt-1">
                Vous avez roulé ce parcours ? Partagez votre expérience avec le club.
              </p>
            </div>
            <Suspense fallback={<div className="text-xs text-ink-3 dark:text-snow-3">Chargement...</div>}>
              <FeedbackForm
                traceId={trace.id}
                members={members}
                feedbackList={feedbackList}
                onSubmit={addFeedback}
              />
            </Suspense>
          </div>

          {/* Admin Tools Card */}
          <div className="rounded-lg border border-line dark:border-night-line bg-paper-2/70 dark:bg-night-2/70 p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-ink-2 dark:text-snow-3">
              Outils Administrateur
            </h3>

            {/* Edit Trace Button */}
            <Link
              href={`/traces/${trace.id}/edit`}
              className="min-h-[44px] inline-flex items-center justify-center gap-2 w-full rounded-md bg-ink dark:bg-white dark:text-ink px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-night-line dark:hover:bg-gray-200 transition-colors"
            >
              <PencilSquareIcon className="h-4 w-4" aria-hidden="true" />
              <span>Modifier le parcours</span>
            </Link>

            <div className="border-t border-line dark:border-night-line pt-3 space-y-3">
              <p className="text-xs text-ink-3 dark:text-snow-3">
                Mettre à jour l&apos;aperçu de la carte (URL de l&apos;image)
              </p>

              <form action={uploadMapPreview} className="space-y-2">
                <input type="hidden" name="traceId" value={trace.id} />
                <input
                  type="url"
                  name="imageUrl"
                  placeholder="https://example.com/map.jpg"
                  required
                  className="w-full min-h-[44px] rounded-md border border-line dark:border-night-line bg-white dark:bg-night-3 px-3 py-2 text-xs text-ink dark:text-white placeholder:text-ink-3 dark:placeholder:text-gray-500 focus:border-brand focus:outline-hidden"
                />
                <button
                  type="submit"
                  className="min-h-[44px] w-full rounded-md border border-line dark:border-night-line bg-white dark:bg-night-3 px-4 py-2 text-xs font-bold uppercase tracking-wider text-ink-2 dark:text-white hover:bg-paper-2 dark:hover:bg-night-line transition-colors"
                >
                  Mettre à jour l&apos;image
                </button>
              </form>

              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-line dark:border-night-line" />
                <span className="shrink mx-2 text-xs text-ink-3 dark:text-snow-3 font-semibold uppercase tracking-wider">ou</span>
                <div className="flex-grow border-t border-line dark:border-night-line" />
              </div>

              <form action={generateMapPreview}>
                <input type="hidden" name="traceId" value={trace.id} />
                <button
                  type="submit"
                  className="min-h-[44px] inline-flex items-center justify-center gap-1.5 w-full rounded-md border border-line dark:border-night-line bg-white dark:bg-night-3 px-4 py-2 text-xs font-bold uppercase tracking-wider text-ink-2 dark:text-white hover:bg-paper-2 dark:hover:bg-night-line transition-colors"
                >
                  <SparklesIcon className="h-3.5 w-3.5 text-amber-500" aria-hidden="true" />
                  <span>Générer depuis Komoot</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
      </div>
    </main>
  );
}
