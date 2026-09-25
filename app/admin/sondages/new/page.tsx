'use client';

import React, { useState, useEffect, useTransition, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createWeekendPollAction, getSaturdaySortieInfoAction } from '@/app/actions';
import { PollCustomQuestion } from '@/app/types';
import type { SaturdaySortieInfo } from '@/app/lib/sondage-helpers';
import {
  ArrowLeftIcon,
  PlusIcon,
  TrashIcon,
  SparklesIcon,
  CalendarDaysIcon,
  MapPinIcon,
  ClockIcon,
  CheckCircleIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';
import { toast } from 'sonner';

function getNextSaturdayIso(): string {
  const now = new Date();
  const currentDay = now.getDay();
  const daysUntilSaturday = (6 - currentDay + 7) % 7;
  const sat = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + (daysUntilSaturday === 0 ? 7 : daysUntilSaturday)
  );
  const y = sat.getFullYear();
  const m = String(sat.getMonth() + 1).padStart(2, '0');
  const d = String(sat.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function NewWeekendPollForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const urlDate = searchParams.get('date');
  const urlPrefill = searchParams.get('prefill') === '1' || searchParams.get('prefill') === 'true';

  const defaultSat = urlDate || getNextSaturdayIso();
  const [weekendIsoDate, setWeekendIsoDate] = useState(defaultSat);
  const [title, setTitle] = useState(`Sortie du Weekend - ${defaultSat}`);
  const [description, setDescription] = useState(
    'Indiquez vos disponibilités et votre groupe de niveau pour les sorties de ce weekend !'
  );
  const [status, setStatus] = useState<'active' | 'draft' | 'closed'>('active');
  const [customQuestions, setCustomQuestions] = useState<PollCustomQuestion[]>([]);

  // Saturday Sortie Detection State
  const [sortieInfo, setSortieInfo] = useState<SaturdaySortieInfo | null>(null);
  const [isLoadingSortie, setIsLoadingSortie] = useState(false);
  const [hasAppliedInfo, setHasAppliedInfo] = useState(false);

  // Fetch Saturday sortie info whenever target weekend date changes
  useEffect(() => {
    let isCancelled = false;

    async function fetchSortie() {
      setIsLoadingSortie(true);
      try {
        const info = await getSaturdaySortieInfoAction(weekendIsoDate);
        if (!isCancelled) {
          setSortieInfo(info);

          // If auto-prefill requested via URL param on first load
          if (urlPrefill && info.found && !hasAppliedInfo) {
            applySortieInfo(info, false);
          }
        }
      } catch (err) {
        console.error('Failed to load Saturday sortie info:', err);
      } finally {
        if (!isCancelled) {
          setIsLoadingSortie(false);
        }
      }
    }

    fetchSortie();

    return () => {
      isCancelled = true;
    };
  }, [weekendIsoDate]);

  // Apply Saturday Sortie details to the form
  const applySortieInfo = (info: SaturdaySortieInfo, showToast = true) => {
    setTitle(info.suggestedTitle);
    setDescription(info.suggestedDescription);

    // Create the QCM distance question based on the Saturday ride
    const distanceQuestion: PollCustomQuestion = {
      id: `q-distance-${Date.now()}`,
      title: info.suggestedQuestionTitle,
      options: info.distanceOptions,
      allowMultiple: false,
    };

    // Filter out previous distance questions and prepend new one
    setCustomQuestions((prev) => {
      const remaining = prev.filter(
        (q) =>
          !q.title.toLowerCase().includes('distance') &&
          !q.title.toLowerCase().includes('parcours')
      );
      return [distanceQuestion, ...remaining];
    });

    setHasAppliedInfo(true);
    if (showToast) {
      toast.success(
        `Informations de la sortie du samedi appliquées (lieu, départs et ${info.distanceOptions.length} options de distance) !`
      );
    }
  };

  // Add a new blank custom question
  const handleAddQuestion = () => {
    const newQ: PollCustomQuestion = {
      id: `q-${Date.now()}`,
      title: 'Option / Préférence supplémentaire',
      options: ['Option 1', 'Option 2'],
      allowMultiple: false,
    };
    setCustomQuestions((prev) => [...prev, newQ]);
  };

  const handleUpdateQuestionTitle = (qId: string, val: string) => {
    setCustomQuestions((prev) =>
      prev.map((q) => (q.id === qId ? { ...q, title: val } : q))
    );
  };

  const handleToggleMultiple = (qId: string) => {
    setCustomQuestions((prev) =>
      prev.map((q) => (q.id === qId ? { ...q, allowMultiple: !q.allowMultiple } : q))
    );
  };

  const handleAddOption = (qId: string) => {
    setCustomQuestions((prev) =>
      prev.map((q) =>
        q.id === qId ? { ...q, options: [...q.options, `Option ${q.options.length + 1}`] } : q
      )
    );
  };

  const handleUpdateOption = (qId: string, optIndex: number, val: string) => {
    setCustomQuestions((prev) =>
      prev.map((q) => {
        if (q.id !== qId) return q;
        const opts = [...q.options];
        opts[optIndex] = val;
        return { ...q, options: opts };
      })
    );
  };

  const handleDeleteOption = (qId: string, optIndex: number) => {
    setCustomQuestions((prev) =>
      prev.map((q) => {
        if (q.id !== qId) return q;
        return { ...q, options: q.options.filter((_, i) => i !== optIndex) };
      })
    );
  };

  const handleDeleteQuestion = (qId: string) => {
    setCustomQuestions((prev) => prev.filter((q) => q.id !== qId));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    startTransition(async () => {
      try {
        const res = await createWeekendPollAction({
          title,
          weekendIsoDate,
          description: description.trim() || undefined,
          status,
          customQuestions: customQuestions.length > 0 ? customQuestions : undefined,
        });

        if (res.success) {
          toast.success('Sondage créé avec succès !');
          router.push('/admin/sondages');
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        toast.error(`Erreur : ${msg}`);
      }
    });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/admin/sondages"
          className="rounded-sm p-2 text-ink-3 hover:bg-paper-2 hover:text-ink dark:hover:bg-night-2 dark:hover:text-snow-1 transition-colors duration-150"
          title="Retour à la liste des sondages"
        >
          <ArrowLeftIcon className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-ink dark:text-snow-1 font-semiwide">
            Nouveau Sondage de Weekend
          </h1>
          <p className="text-xs text-ink-3 dark:text-snow-3">
            Configurez la session de sondage et synchronisez avec la sortie du samedi.
          </p>
        </div>
      </div>

      {/* Saturday Sortie Detection & Autofill Card */}
      <div className="rounded-md border border-line dark:border-night-line bg-paper dark:bg-night-2 p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-line dark:border-night-line">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 md:h-8 md:w-8 items-center justify-center rounded-sm bg-brand/10 text-brand border border-brand/20">
              <SparklesIcon className="h-4 w-4" />
            </span>
            <div>
              <h3 className="text-sm font-bold text-ink dark:text-snow-1 font-semiwide">
                Sortie du Samedi &amp; Distances au Calendrier
              </h3>
              <p className="text-xs text-ink-3 dark:text-snow-3">
                Détection automatique des parcours programmés pour le weekend ciblé.
              </p>
            </div>
          </div>

          {hasAppliedInfo && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-vert/10 border border-vert/30 px-3 py-1 text-xs font-semibold text-vert dark:text-vert-light self-start sm:self-auto font-mono">
              <CheckCircleIcon className="h-4 w-4 text-vert dark:text-vert-light" />
              <span>Infos du samedi appliquées</span>
            </span>
          )}
        </div>

        {isLoadingSortie ? (
          <div className="flex items-center gap-3 py-4 text-xs text-ink-3 dark:text-snow-3 animate-pulse">
            <div className="h-4 w-4 rounded-full border-2 border-brand border-t-transparent animate-spin" />
            <span>Recherche de la sortie du samedi au calendrier...</span>
          </div>
        ) : sortieInfo && sortieInfo.found ? (
          <div className="space-y-4">
            {/* Metas pill row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="rounded-sm border border-line dark:border-night-line bg-paper-2 dark:bg-night p-3 flex items-start gap-2.5">
                <MapPinIcon className="h-4 w-4 text-brand shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <div className="text-xs font-bold uppercase tracking-wider text-ink-3 dark:text-snow-3 font-mono">Lieu &amp; RDV</div>
                  <div className="text-xs font-bold text-ink dark:text-snow-1 truncate">{sortieInfo.location}</div>
                  {sortieInfo.address && (
                    <div className="text-xs text-ink-3 dark:text-snow-3 truncate">{sortieInfo.address}</div>
                  )}
                </div>
              </div>

              <div className="rounded-sm border border-line dark:border-night-line bg-paper-2 dark:bg-night p-3 flex items-start gap-2.5">
                <ClockIcon className="h-4 w-4 text-brand shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <div className="text-xs font-bold uppercase tracking-wider text-ink-3 dark:text-snow-3 font-mono">Départ</div>
                  <div className="text-xs font-bold text-ink dark:text-snow-1 font-mono">{sortieInfo.departure}</div>
                  <div className="text-xs text-ink-3 dark:text-snow-3">{sortieInfo.formattedDate}</div>
                </div>
              </div>

              <div className="rounded-sm border border-line dark:border-night-line bg-paper-2 dark:bg-night p-3 flex items-start gap-2.5">
                <CalendarDaysIcon className="h-4 w-4 text-brand shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <div className="text-xs font-bold uppercase tracking-wider text-ink-3 dark:text-snow-3 font-mono">Distances prévues</div>
                  <div className="text-xs font-bold text-brand tabular-nums font-mono">
                    {sortieInfo.distancesRaw ? (
                      sortieInfo.distancesRaw.toLowerCase().includes('km')
                        ? sortieInfo.distancesRaw
                        : `${sortieInfo.distancesRaw} km`
                    ) : (
                      'Standard club'
                    )}
                  </div>
                  <div className="text-xs text-ink-3 dark:text-snow-3">
                    {sortieInfo.distanceOptions.length} option{sortieInfo.distanceOptions.length > 1 ? 's' : ''} de distance
                  </div>
                </div>
              </div>
            </div>

            {sortieInfo.remarks && (
              <div className="text-xs text-ambre-dark dark:text-ambre rounded-sm bg-ambre/10 border border-ambre/30 px-3 py-2 font-mono">
                <strong className="font-semibold text-ambre-dark dark:text-ambre">Note au calendrier :</strong> {sortieInfo.remarks}
              </div>
            )}

            {/* Action button */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
              <div className="text-xs text-ink-3 dark:text-snow-3">
                Options qui seront ajoutées au sondage :{' '}
                <span className="font-semibold text-ink-2 dark:text-snow-2 font-mono">
                  {sortieInfo.distanceOptions.join(' • ')}
                </span>
              </div>

              <button
                type="button"
                onClick={() => applySortieInfo(sortieInfo)}
                className="inline-flex items-center justify-center gap-2 rounded-sm bg-brand hover:bg-brand-strong text-white px-5 py-2.5 text-xs font-semibold uppercase tracking-wider transition-colors duration-150 shrink-0 cursor-pointer min-h-[44px]"
              >
                <SparklesIcon className="h-4 w-4" />
                <span>Utiliser les infos de la sortie du samedi</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="rounded-sm border border-dashed border-line dark:border-night-line p-4 space-y-2.5">
            <div className="flex items-center gap-2 text-xs text-ink-2 dark:text-snow-2">
              <InformationCircleIcon className="h-4 w-4 text-ink-3 shrink-0" />
              <span>
                Aucune sortie spécifique enregistrée au calendrier pour le samedi <strong className="font-mono">{weekendIsoDate}</strong>.
              </span>
            </div>

            {sortieInfo?.nextAvailableSaturdayIso && (
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => {
                    const nextDate = sortieInfo.nextAvailableSaturdayIso!;
                    setWeekendIsoDate(nextDate);
                    setTitle(`Sortie du Weekend - ${nextDate}`);
                    setHasAppliedInfo(false);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-sm border border-line dark:border-night-line bg-paper-2 dark:bg-night px-3 py-1.5 text-xs font-semibold text-ink dark:text-snow-1 hover:bg-paper-3 dark:hover:bg-night-line transition-colors duration-150 cursor-pointer"
                >
                  <span>Sélectionner la prochaine sortie programmée ({sortieInfo.nextAvailableSaturdayIso})</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information Card */}
        <div className="rounded-md border border-line dark:border-night-line bg-paper dark:bg-night-2 p-6 sm:p-8 space-y-5">
          <h2 className="text-sm font-bold uppercase tracking-wider text-ink dark:text-snow-1 font-mono">
            1. Informations Générales
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="poll-weekend-date" className="block text-xs font-semibold text-ink-2 dark:text-snow-2 mb-1">
                Date cible du weekend (Samedi) *
              </label>
              <input
                id="poll-weekend-date"
                type="date"
                required
                value={weekendIsoDate}
                onChange={(e) => {
                  const val = e.target.value;
                  setWeekendIsoDate(val);
                  setTitle(`Sortie du Weekend - ${val}`);
                  setHasAppliedInfo(false);
                }}
                className="w-full rounded-sm border border-line dark:border-night-line bg-paper-2 dark:bg-night text-ink dark:text-snow-1 p-2.5 text-xs font-mono focus:border-brand focus:outline-hidden transition-colors duration-150"
              />
            </div>

            <div>
              <label htmlFor="poll-status" className="block text-xs font-semibold text-ink-2 dark:text-snow-2 mb-1">
                Statut initial du sondage *
              </label>
              <select
                id="poll-status"
                value={status}
                onChange={(e) => setStatus(e.target.value as 'active' | 'draft' | 'closed')}
                className="w-full rounded-sm border border-line dark:border-night-line bg-paper-2 dark:bg-night text-ink dark:text-snow-1 p-2.5 text-xs font-semibold focus:border-brand focus:outline-hidden transition-colors duration-150"
              >
                <option value="active">Actif (Ouvert aux réponses immédiatement)</option>
                <option value="draft">Brouillon (Non visible)</option>
                <option value="closed">Clôturé</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="poll-title" className="block text-xs font-semibold text-ink-2 dark:text-snow-2 mb-1">
              Titre du sondage *
            </label>
            <input
              id="poll-title"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-sm border border-line dark:border-night-line bg-paper-2 dark:bg-night text-ink dark:text-snow-1 p-2.5 text-xs font-bold focus:border-brand focus:outline-hidden transition-colors duration-150"
            />
          </div>

          <div>
            <label htmlFor="poll-description" className="block text-xs font-semibold text-ink-2 dark:text-snow-2 mb-1">
              Description / Consignes pour le peloton
            </label>
            <textarea
              id="poll-description"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-sm border border-line dark:border-night-line bg-paper-2 dark:bg-night text-ink dark:text-snow-1 p-2.5 text-xs focus:border-brand focus:outline-hidden transition-colors duration-150"
            />
          </div>
        </div>

        {/* Custom QCM Questions Card */}
        <div className="rounded-md border border-line dark:border-night-line bg-paper dark:bg-night-2 p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-ink dark:text-snow-1 font-mono">
                2. Questions QCM personnalisées (Facultatif)
              </h2>
              <p className="text-xs text-ink-3 dark:text-snow-3 mt-0.5">
                Proposez les options de distance du samedi ou d&apos;autres questions spécifiques.
              </p>
            </div>

            <button
              type="button"
              onClick={handleAddQuestion}
              className="inline-flex items-center gap-1.5 rounded-sm border border-line dark:border-night-line bg-paper-2 dark:bg-night px-4 py-2 text-xs font-semibold text-ink dark:text-snow-1 hover:bg-paper-3 dark:hover:bg-night-line transition-colors duration-150 cursor-pointer min-h-[44px]"
            >
              <PlusIcon className="h-4 w-4 text-brand" />
              <span>Ajouter une question</span>
            </button>
          </div>

          {customQuestions.length === 0 ? (
            <div className="rounded-sm border border-dashed border-line dark:border-night-line p-6 text-center text-xs text-ink-3 dark:text-snow-3 font-mono">
              Aucune question supplémentaire. Le sondage demandera uniquement le jour (Samedi/Dimanche) et le groupe (A/B/C/VTT).
              {sortieInfo?.found && (
                <div className="mt-2">
                  <button
                    type="button"
                    onClick={() => applySortieInfo(sortieInfo)}
                    className="text-xs font-semibold text-brand hover:underline transition-colors duration-150 cursor-pointer"
                  >
                    Cliquez ici pour insérer automatiquement la question de distance du samedi
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {customQuestions.map((q, qIndex) => (
                <div
                  key={q.id}
                  className="rounded-sm border border-line dark:border-night-line bg-paper-2 dark:bg-night p-5 space-y-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs font-bold text-ink dark:text-snow-1 font-mono">
                      Question #{qIndex + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDeleteQuestion(q.id)}
                      className="text-ink-3 hover:text-brand transition-colors duration-150 cursor-pointer"
                      title="Supprimer cette question"
                      aria-label="Supprimer cette question"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>

                  <input
                    id={`poll-question-title-${q.id}`}
                    type="text"
                    aria-label={`Intitulé de la question #${qIndex + 1}`}
                    value={q.title}
                    onChange={(e) => handleUpdateQuestionTitle(q.id, e.target.value)}
                    placeholder="Intitulé de la question..."
                    className="w-full rounded-sm border border-line dark:border-night-line bg-paper dark:bg-night-2 text-ink dark:text-snow-1 p-2.5 text-xs font-bold focus:border-brand focus:outline-hidden transition-colors duration-150"
                  />

                  {/* Options */}
                  <div className="space-y-2 pl-2">
                    <span className="text-xs font-semibold text-ink-3 dark:text-snow-3 uppercase tracking-wider block font-mono">
                      Options de réponse :
                    </span>
                    {q.options.map((opt, optIdx) => (
                      <div key={optIdx} className="flex items-center gap-2">
                        <span className="text-xs text-ink-3">•</span>
                        <input
                          id={`poll-question-${q.id}-opt-${optIdx}`}
                          type="text"
                          aria-label={`Option de réponse #${optIdx + 1} pour ${q.title || 'la question'}`}
                          value={opt}
                          onChange={(e) => handleUpdateOption(q.id, optIdx, e.target.value)}
                          className="flex-1 rounded-sm border border-line dark:border-night-line bg-paper dark:bg-night-2 text-ink dark:text-snow-1 px-3 py-1.5 text-xs focus:border-brand focus:outline-hidden transition-colors duration-150"
                        />
                        {q.options.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleDeleteOption(q.id, optIdx)}
                            className="p-1 text-ink-3 hover:text-brand transition-colors duration-150 cursor-pointer"
                            title="Supprimer cette option"
                            aria-label="Supprimer cette option"
                          >
                            <TrashIcon className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    ))}

                    <div className="pt-1 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => handleAddOption(q.id)}
                        className="text-xs font-semibold text-brand hover:underline transition-colors duration-150 cursor-pointer"
                      >
                        + Ajouter une option
                      </button>

                      <label htmlFor={`poll-question-${q.id}-multiple`} className="flex items-center gap-2 text-xs text-ink-3 dark:text-snow-3 cursor-pointer">
                        <input
                          id={`poll-question-${q.id}-multiple`}
                          type="checkbox"
                          checked={q.allowMultiple || false}
                          onChange={() => handleToggleMultiple(q.id)}
                          className="rounded-xs border-line dark:border-night-line text-brand focus:ring-brand"
                        />
                        <span>Autoriser plusieurs choix</span>
                      </label>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Link
            href="/admin/sondages"
            className="rounded-sm border border-line dark:border-night-line bg-paper dark:bg-night-2 px-6 py-2.5 text-xs font-semibold text-ink dark:text-snow-1 hover:bg-paper-2 dark:hover:bg-night-3 transition-colors duration-150 min-h-[44px] inline-flex items-center"
          >
            Annuler
          </Link>
          <button
            type="submit"
            disabled={isPending}
            className="rounded-sm bg-brand hover:bg-brand-strong text-white px-8 py-2.5 text-xs font-semibold uppercase tracking-wider transition-colors duration-150 disabled:opacity-50 min-h-[44px] inline-flex items-center cursor-pointer font-mono"
          >
            {isPending ? 'Création en cours...' : 'Créer et publier le sondage'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function NewWeekendPollPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-4xl mx-auto p-12 text-center text-xs text-slate-500">
          Chargement du formulaire de sondage...
        </div>
      }
    >
      <NewWeekendPollForm />
    </Suspense>
  );
}
