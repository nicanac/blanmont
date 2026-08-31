'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { updateWeekendPollAction } from '@/app/actions';
import { WeekendPoll, PollCustomQuestion } from '@/app/types';
import {
  ArrowLeftIcon,
  PlusIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { toast } from 'sonner';

interface EditPollFormProps {
  poll: WeekendPoll;
}

export default function EditPollForm({ poll }: EditPollFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [weekendIsoDate, setWeekendIsoDate] = useState(poll.weekendIsoDate);
  const [title, setTitle] = useState(poll.title);
  const [description, setDescription] = useState(poll.description || '');
  const [status, setStatus] = useState<'active' | 'draft' | 'closed'>(poll.status);
  const [customQuestions, setCustomQuestions] = useState<PollCustomQuestion[]>(
    poll.customQuestions || []
  );

  const handleAddQuestion = () => {
    const newQ: PollCustomQuestion = {
      id: `q-${Date.now()}`,
      title: 'Option / Préférence de parcours',
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
          className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
        >
          <ArrowLeftIcon className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Modifier le Sondage
          </h1>
          <p className="text-xs text-slate-500">
            Mettez à jour les paramètres, le statut ou les questions QCM.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information Card */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-5">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800">
            1. Informations Générales
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Date cible du weekend (Samedi) *
              </label>
              <input
                type="date"
                required
                value={weekendIsoDate}
                onChange={(e) => setWeekendIsoDate(e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-mono text-slate-800 focus:border-[#e03e3e] focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Statut du sondage *
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as 'active' | 'draft' | 'closed')}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-semibold text-slate-800 focus:border-[#e03e3e] focus:outline-hidden"
              >
                <option value="active">Actif (Ouvert aux réponses)</option>
                <option value="draft">Brouillon (Non visible)</option>
                <option value="closed">Clôturé (Fermé aux réponses)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Titre du sondage *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-bold text-slate-900 focus:border-[#e03e3e] focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Description / Consignes pour le peloton
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-[#e03e3e] focus:outline-hidden"
            />
          </div>
        </div>

        {/* Custom QCM Questions Card */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800">
                2. Questions QCM personnalisées
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Questions supplémentaires pour ce sondage.
              </p>
            </div>

            <button
              type="button"
              onClick={handleAddQuestion}
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <PlusIcon className="h-4 w-4 text-[#e03e3e]" />
              <span>Ajouter une question</span>
            </button>
          </div>

          {customQuestions.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-center text-xs text-slate-400">
              Aucune question supplémentaire.
            </div>
          ) : (
            <div className="space-y-6">
              {customQuestions.map((q, qIndex) => (
                <div
                  key={q.id}
                  className="rounded-2xl border border-slate-200 bg-slate-50/50 p-5 space-y-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs font-bold text-slate-700">
                      Question #{qIndex + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDeleteQuestion(q.id)}
                      className="text-slate-400 hover:text-red-600 transition-colors"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>

                  <input
                    type="text"
                    value={q.title}
                    onChange={(e) => handleUpdateQuestionTitle(q.id, e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-bold text-slate-900 focus:border-[#e03e3e] focus:outline-hidden"
                  />

                  {/* Options */}
                  <div className="space-y-2 pl-2">
                    {q.options.map((opt, optIdx) => (
                      <div key={optIdx} className="flex items-center gap-2">
                        <span className="text-xs text-slate-400">•</span>
                        <input
                          type="text"
                          value={opt}
                          onChange={(e) => handleUpdateOption(q.id, optIdx, e.target.value)}
                          className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 focus:border-[#e03e3e] focus:outline-hidden"
                        />
                        {q.options.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleDeleteOption(q.id, optIdx)}
                            className="p-1 text-slate-300 hover:text-red-600"
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
                        className="text-xs font-semibold text-[#e03e3e] hover:underline"
                      >
                        + Ajouter une option
                      </button>

                      <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={q.allowMultiple || false}
                          onChange={() => handleToggleMultiple(q.id)}
                          className="rounded border-slate-300 text-[#e03e3e] focus:ring-[#e03e3e]"
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
            className="rounded-full border border-slate-200 bg-white px-6 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Annuler
          </Link>
          <button
            type="submit"
            disabled={isPending}
            className="rounded-full bg-[#e03e3e] hover:bg-[#c93434] text-white px-8 py-2.5 text-xs font-semibold shadow-xs transition-colors disabled:opacity-50"
          >
            {isPending ? 'Enregistrement...' : 'Enregistrer les modifications'}
          </button>
        </div>
      </form>
    </div>
  );
}
