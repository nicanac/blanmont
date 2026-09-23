'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { updateWeekendPollAction, getSaturdaySortieInfoAction } from '@/app/actions';
import { WeekendPoll, PollCustomQuestion } from '@/app/types';
import {
  ArrowLeftIcon,
  PlusIcon,
  TrashIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import { toast } from 'sonner';

interface EditPollFormProps {
  poll: WeekendPoll;
}

export default function EditPollForm({ poll }: EditPollFormProps): React.ReactElement {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isSyncingSortie, setIsSyncingSortie] = useState(false);

  const [weekendIsoDate, setWeekendIsoDate] = useState(poll.weekendIsoDate);
  const [title, setTitle] = useState(poll.title);
  const [description, setDescription] = useState(poll.description || '');
  const [status, setStatus] = useState<'active' | 'draft' | 'closed'>(poll.status);
  const [customQuestions, setCustomQuestions] = useState<PollCustomQuestion[]>(
    poll.customQuestions || []
  );

  const handleSyncSortie = async (): Promise<void> => {
    setIsSyncingSortie(true);
    try {
      const info = await getSaturdaySortieInfoAction(weekendIsoDate);
      if (info && info.found) {
        setTitle(info.suggestedTitle);
        setDescription(info.suggestedDescription);

        if (info.distanceOptions && info.distanceOptions.length > 0) {
          const distanceQuestion: PollCustomQuestion = {
            id: `q-distance-${Date.now()}`,
            title: info.suggestedQuestionTitle || 'Option de distance / parcours (Samedi)',
            options: info.distanceOptions,
            allowMultiple: false,
          };
          setCustomQuestions((prev) => {
            const remaining = prev.filter(
              (q) =>
                !q.title.toLowerCase().includes('distance') &&
                !q.title.toLowerCase().includes('parcours')
            );
            return [distanceQuestion, ...remaining];
          });
        }
        toast.success(
          `Informations de la sortie appliquées : ${info.location} (${info.distanceOptions.length} option(s) de distance).`
        );
      } else {
        toast.info(
          `Aucune sortie spécifique trouvée au calendrier pour le samedi ${weekendIsoDate}.`
        );
      }
    } catch (_err) {
      toast.error('Erreur lors de la récupération des détails de la sortie.');
    } finally {
      setIsSyncingSortie(false);
    }
  };

  const handleAddQuestion = (): void => {
    const newQ: PollCustomQuestion = {
      id: `q-${Date.now()}`,
      title: 'Option / Préférence de parcours',
      options: ['Option 1', 'Option 2'],
      allowMultiple: false,
    };
    setCustomQuestions((prev) => [...prev, newQ]);
  };

  const handleUpdateQuestionTitle = (qId: string, val: string): void => {
    setCustomQuestions((prev) =>
      prev.map((q) => (q.id === qId ? { ...q, title: val } : q))
    );
  };

  const handleToggleMultiple = (qId: string): void => {
    setCustomQuestions((prev) =>
      prev.map((q) => (q.id === qId ? { ...q, allowMultiple: !q.allowMultiple } : q))
    );
  };

  const handleAddOption = (qId: string): void => {
    setCustomQuestions((prev) =>
      prev.map((q) =>
        q.id === qId ? { ...q, options: [...q.options, `Option ${q.options.length + 1}`] } : q
      )
    );
  };

  const handleUpdateOption = (qId: string, optIndex: number, val: string): void => {
    setCustomQuestions((prev) =>
      prev.map((q) => {
        if (q.id !== qId) return q;
        const opts = [...q.options];
        opts[optIndex] = val;
        return { ...q, options: opts };
      })
    );
  };

  const handleDeleteOption = (qId: string, optIndex: number): void => {
    setCustomQuestions((prev) =>
      prev.map((q) => {
        if (q.id !== qId) return q;
        return { ...q, options: q.options.filter((_, i) => i !== optIndex) };
      })
    );
  };

  const handleDeleteQuestion = (qId: string): void => {
    setCustomQuestions((prev) => prev.filter((q) => q.id !== qId));
  };

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();

    startTransition(async () => {
      try {
        const res = await updateWeekendPollAction(poll.id, {
          title,
          weekendIsoDate,
          description: description.trim() || undefined,
          status,
          customQuestions: customQuestions.length > 0 ? customQuestions : undefined,
        });

        if (res.success) {
          toast.success('Sondage mis à jour avec succès !');
          router.push(`/admin/sondages/${poll.id}`);
          router.refresh();
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        toast.error(`Erreur : ${msg}`);
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href={`/admin/sondages/${poll.id}`}
          className="rounded-md p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-white/10 dark:hover:text-white transition-colors duration-150"
        >
          <ArrowLeftIcon className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Modifier le Sondage
          </h1>
          <p className="text-xs text-ink-3 dark:text-snow-3">
            Mettez à jour les paramètres, le statut ou les questions QCM.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information Card */}
        <div className="rounded-lg border border-line dark:border-night-line bg-white dark:bg-night-2 p-6 sm:p-8 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-line dark:border-night-line">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-white">
              1. Informations Générales
            </h2>
            <button
              type="button"
              disabled={isSyncingSortie}
              onClick={handleSyncSortie}
              className="inline-flex items-center gap-1.5 rounded-md border border-brand/30 bg-brand/5 hover:bg-brand/10 px-3.5 py-2 text-xs font-semibold uppercase tracking-wider text-brand transition-colors duration-150 shadow-xs disabled:opacity-50 min-h-[44px]"
              title="Récupérer et réappliquer les informations de la sortie au calendrier pour cette date"
            >
              {isSyncingSortie ? (
                <div className="h-3.5 w-3.5 rounded-full border-2 border-brand border-t-transparent animate-spin" />
              ) : (
                <SparklesIcon className="h-3.5 w-3.5" />
              )}
              <span>Recharger depuis la sortie du samedi</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="poll-edit-weekend-date" className="block text-xs font-semibold text-slate-700 dark:text-gray-300 mb-1">
                Date cible du weekend (Samedi) *
              </label>
              <input
                id="poll-edit-weekend-date"
                type="date"
                required
                value={weekendIsoDate}
                onChange={(e) => setWeekendIsoDate(e.target.value)}
                className="w-full rounded-md border border-line dark:border-night-line bg-white dark:bg-night text-ink dark:text-snow p-2.5 text-xs font-mono focus:border-brand focus:outline-hidden transition-colors duration-150"
              />
            </div>

            <div>
              <label htmlFor="poll-edit-status" className="block text-xs font-semibold text-slate-700 dark:text-gray-300 mb-1">
                Statut du sondage *
              </label>
              <select
                id="poll-edit-status"
                value={status}
                onChange={(e) => setStatus(e.target.value as 'active' | 'draft' | 'closed')}
                className="w-full rounded-md border border-line dark:border-night-line bg-white dark:bg-night text-ink dark:text-snow p-2.5 text-xs font-semibold focus:border-brand focus:outline-hidden transition-colors duration-150"
              >
                <option value="active">Actif (Ouvert aux réponses)</option>
                <option value="draft">Brouillon (Non visible)</option>
                <option value="closed">Clôturé (Fermé aux réponses)</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="poll-edit-title" className="block text-xs font-semibold text-slate-700 dark:text-gray-300 mb-1">
              Titre du sondage *
            </label>
            <input
              id="poll-edit-title"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-md border border-line dark:border-night-line bg-white dark:bg-night text-ink dark:text-snow p-2.5 text-xs font-bold focus:border-brand focus:outline-hidden transition-colors duration-150"
            />
          </div>

          <div>
            <label htmlFor="poll-edit-description" className="block text-xs font-semibold text-slate-700 dark:text-gray-300 mb-1">
              Description / Consignes pour le peloton
            </label>
            <textarea
              id="poll-edit-description"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-md border border-line dark:border-night-line bg-white dark:bg-night text-ink dark:text-snow p-2.5 text-xs focus:border-brand focus:outline-hidden transition-colors duration-150"
            />
          </div>
        </div>

        {/* Custom QCM Questions Card */}
        <div className="rounded-lg border border-line dark:border-night-line bg-white dark:bg-night-2 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-white">
                2. Questions QCM personnalisées
              </h2>
              <p className="text-xs text-ink-3 dark:text-snow-3 mt-0.5">
                Questions supplémentaires pour ce sondage.
              </p>
            </div>

            <button
              type="button"
              onClick={handleAddQuestion}
              className="inline-flex items-center gap-1.5 rounded-md border border-line dark:border-night-line bg-paper dark:bg-ink px-4 py-2 text-xs font-semibold text-slate-700 dark:text-snow hover:bg-slate-100 dark:hover:bg-white/10 transition-colors duration-150 min-h-[44px]"
            >
              <PlusIcon className="h-4 w-4 text-brand" />
              <span>Ajouter une question</span>
            </button>
          </div>

          {customQuestions.length === 0 ? (
            <div className="rounded-lg border border-dashed border-line dark:border-ink-2 p-6 text-center text-xs text-ink-3 dark:text-ink-3">
              Aucune question supplémentaire.
            </div>
          ) : (
            <div className="space-y-6">
              {customQuestions.map((q, qIndex) => (
                <div
                  key={q.id}
                  className="rounded-lg border border-line dark:border-night-line bg-paper dark:bg-ink p-5 space-y-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs font-bold text-slate-700 dark:text-gray-300">
                      Question #{qIndex + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDeleteQuestion(q.id)}
                      className="text-slate-400 hover:text-brand transition-colors duration-150 cursor-pointer"
                      title="Supprimer cette question"
                      aria-label="Supprimer cette question"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>

                  <input
                    id={`poll-edit-q-title-${q.id}`}
                    type="text"
                    aria-label={`Intitulé de la question #${qIndex + 1}`}
                    value={q.title}
                    onChange={(e) => handleUpdateQuestionTitle(q.id, e.target.value)}
                    className="w-full rounded-md border border-line dark:border-night-line bg-white dark:bg-night text-ink dark:text-snow p-2.5 text-xs font-bold focus:border-brand focus:outline-hidden transition-colors duration-150"
                  />

                  {/* Options */}
                  <div className="space-y-2 pl-2">
                    {q.options.map((opt, optIdx) => (
                      <div key={optIdx} className="flex items-center gap-2">
                        <span className="text-xs text-ink-3">•</span>
                        <input
                          id={`poll-edit-q-${q.id}-opt-${optIdx}`}
                          type="text"
                          aria-label={`Option de réponse #${optIdx + 1} pour ${q.title || 'la question'}`}
                          value={opt}
                          onChange={(e) => handleUpdateOption(q.id, optIdx, e.target.value)}
                          className="flex-1 rounded-md border border-line dark:border-night-line bg-white dark:bg-night text-ink dark:text-snow px-3 py-1.5 text-xs focus:border-brand focus:outline-hidden transition-colors duration-150"
                        />
                        {q.options.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleDeleteOption(q.id, optIdx)}
                            className="p-1 text-slate-400 hover:text-brand transition-colors duration-150 cursor-pointer"
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

                      <label htmlFor={`poll-edit-q-${q.id}-multiple`} className="flex items-center gap-2 text-xs text-ink-3 dark:text-snow-3 cursor-pointer">
                        <input
                          id={`poll-edit-q-${q.id}-multiple`}
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
            href={`/admin/sondages/${poll.id}`}
            className="rounded-md border border-line dark:border-night-line bg-white dark:bg-night-2 px-6 py-2.5 text-xs font-semibold text-slate-700 dark:text-snow hover:bg-paper dark:hover:bg-night-3 transition-colors duration-150 min-h-[44px] inline-flex items-center"
          >
            Annuler
          </Link>
          <button
            type="submit"
            disabled={isPending}
            className="rounded-md bg-brand hover:bg-brand-strong text-white px-8 py-2.5 text-xs font-semibold uppercase tracking-wider shadow-xs transition-colors duration-150 disabled:opacity-50 min-h-[44px] inline-flex items-center cursor-pointer"
          >
            {isPending ? 'Enregistrement...' : 'Enregistrer les modifications'}
          </button>
        </div>
      </form>
    </div>
  );
}
