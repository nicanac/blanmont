'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createWeekendPollAction } from '@/app/actions';
import { PollCustomQuestion } from '@/app/types';
import {
  ArrowLeftIcon,
  PlusIcon,
  TrashIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import { toast } from 'sonner';

function getNextSaturdayIso(): string {
  const now = new Date();
  const currentDay = now.getDay();
  const daysUntilSaturday = (6 - currentDay + 7) % 7;
  const sat = new Date(now.getFullYear(), now.getMonth(), now.getDate() + (daysUntilSaturday === 0 ? 7 : daysUntilSaturday));
  const y = sat.getFullYear();
  const m = String(sat.getMonth() + 1).padStart(2, '0');
  const d = String(sat.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export default function NewWeekendPollPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const defaultSat = getNextSaturdayIso();
  const [weekendIsoDate, setWeekendIsoDate] = useState(defaultSat);
  const [title, setTitle] = useState(`Sortie du Weekend - ${defaultSat}`);
  const [description, setDescription] = useState(
    'Indiquez vos disponibilités et votre groupe de niveau pour les sorties de ce weekend !'
  );
  const [status, setStatus] = useState<'active' | 'draft' | 'closed'>('active');
  const [customQuestions, setCustomQuestions] = useState<PollCustomQuestion[]>([]);

  // Add a new custom question
  const handleAddQuestion = () => {
    const newQ: PollCustomQuestion = {
      id: `q-${Date.now()}`,
      title: 'Option / Préférence de parcours',
      options: ['Option courte (~70 km)', 'Option moyenne (~90 km)', 'Option longue (~120 km)'],
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
          className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
        >
          <ArrowLeftIcon className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Nouveau Sondage de Weekend
          </h1>
          <p className="text-xs text-slate-500">
            Configurez la session de sondage et les éventuelles questions personnalisées.
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
                onChange={(e) => {
                  setWeekendIsoDate(e.target.value);
                  setTitle(`Sortie du Weekend - ${e.target.value}`);
                }}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-mono text-slate-800 focus:border-[#e03e3e] focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Statut initial du sondage *
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as 'active' | 'draft' | 'closed')}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-semibold text-slate-800 focus:border-[#e03e3e] focus:outline-hidden"
              >
                <option value="active">Actif (Ouvert aux réponses immédiatement)</option>
                <option value="draft">Brouillon (Non visible)</option>
                <option value="closed">Clôturé</option>
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
                2. Questions QCM personnalisées (Facultatif)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Ajoutez des questions spécifiques pour ce weekend (ex. choix d&apos;horaire, pause café, distance).
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
              Aucune question supplémentaire. Le sondage demandera uniquement le jour (Samedi/Dimanche) et le groupe (A/B/C/VTT).
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
                      title="Supprimer cette question"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>

                  <input
                    type="text"
                    value={q.title}
                    onChange={(e) => handleUpdateQuestionTitle(q.id, e.target.value)}
                    placeholder="Intitulé de la question..."
                    className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-bold text-slate-900 focus:border-[#e03e3e] focus:outline-hidden"
                  />

                  {/* Options */}
                  <div className="space-y-2 pl-2">
                    <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                      Options de réponse :
                    </span>
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
            href="/admin/sondages"
            className="rounded-full border border-slate-200 bg-white px-6 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Annuler
          </Link>
          <button
            type="submit"
            disabled={isPending}
            className="rounded-full bg-[#e03e3e] hover:bg-[#c93434] text-white px-8 py-2.5 text-xs font-semibold shadow-xs transition-colors disabled:opacity-50"
          >
            {isPending ? 'Création en cours...' : 'Créer et publier le sondage'}
          </button>
        </div>
      </form>
    </div>
  );
}
