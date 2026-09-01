import React from 'react';
import Link from 'next/link';
import { getAllWeekendPolls, getPollResponses } from '@/app/lib/firebase/polls';
import {
  PlusIcon,
  ChatBubbleLeftRightIcon,
  CheckCircleIcon,
  EyeIcon,
  PencilSquareIcon,
  CalendarDaysIcon,
} from '@heroicons/react/24/outline';
import PollStatusToggle from './components/PollStatusToggle';

export const dynamic = 'force-dynamic';

export default async function AdminSondagesPage(): Promise<React.ReactElement> {
  const polls = await getAllWeekendPolls();

  // Fetch responses count for each poll
  const pollsWithCounts = await Promise.all(
    polls.map(async (p) => {
      const responses = await getPollResponses(p.id);
      return {
        ...p,
        responseCount: responses.length,
        attendeeCount: responses.filter((r) => r.dayChoice !== 'absent').length,
      };
    })
  );

  const activePoll = pollsWithCounts.find((p) => p.status === 'active');

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Sondages du Weekend
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Gérez les sondages hebdomadaires pour savoir qui roule chaque weekend.
          </p>
        </div>

        <Link
          href="/admin/sondages/new"
          className="inline-flex items-center gap-2 rounded-full bg-[#e03e3e] px-5 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-[#c93434] transition-colors"
        >
          <PlusIcon className="h-4 w-4" />
          <span>Créer un nouveau sondage</span>
        </Link>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Sondage actif
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl font-bold text-slate-900 truncate">
              {activePoll ? activePoll.title : 'Aucun'}
            </span>
          </div>
          {activePoll && (
            <p className="text-xs text-emerald-600 font-medium mt-1">
              ✓ {activePoll.attendeeCount} coureurs inscrits pour ce weekend
            </p>
          )}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Total Sessions
          </div>
          <div className="mt-2 text-2xl font-extrabold text-slate-900">
            {polls.length}
          </div>
          <p className="text-xs text-slate-500 mt-1">Sondages créés au total</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Page Publique
          </div>
          <div className="mt-2">
            <Link
              href="/sondage"
              target="_blank"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#e03e3e] hover:underline"
            >
              <span>Accéder à /sondage</span>
              <span>↗</span>
            </Link>
          </div>
          <p className="text-xs text-slate-500 mt-1">Vue membre en direct</p>
        </div>
      </div>

      {/* Polls List */}
      <div className="rounded-3xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800">
            Historique des sondages
          </h2>
        </div>

        {pollsWithCounts.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            Aucun sondage de weekend créé pour le moment. Cliquez sur &laquo; Créer un nouveau sondage &raquo;.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {pollsWithCounts.map((p) => (
              <div
                key={p.id}
                className="p-5 sm:px-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 hover:bg-slate-50/70 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        p.status === 'active'
                          ? 'bg-emerald-100 text-emerald-800'
                          : p.status === 'draft'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {p.status === 'active'
                        ? 'En cours'
                        : p.status === 'draft'
                          ? 'Brouillon'
                          : 'Clôturé'}
                    </span>
                    <span className="text-xs text-slate-500 font-mono">
                      Weekend du {p.weekendIsoDate}
                    </span>
                  </div>

                  <Link
                    href={`/admin/sondages/${p.id}`}
                    className="text-base font-bold text-slate-900 hover:text-[#e03e3e] transition-colors"
                  >
                    {p.title}
                  </Link>

                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    <span>
                      <strong className="text-slate-800 font-bold">{p.attendeeCount}</strong> présents
                    </span>
                    <span>•</span>
                    <span>{p.responseCount} réponses totales</span>
                    {p.customQuestions && p.customQuestions.length > 0 && (
                      <>
                        <span>•</span>
                        <span>{p.customQuestions.length} question(s) QCM</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <PollStatusToggle pollId={p.id} currentStatus={p.status} />

                  <Link
                    href={`/admin/sondages/${p.id}`}
                    className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <EyeIcon className="h-4 w-4 text-slate-400" />
                    <span>Réponses</span>
                  </Link>

                  <Link
                    href={`/admin/sondages/${p.id}/edit`}
                    className="rounded-xl p-2 text-slate-400 hover:text-[#e03e3e] hover:bg-slate-100 transition-colors"
                    title="Modifier les paramètres du sondage"
                  >
                    <PencilSquareIcon className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
