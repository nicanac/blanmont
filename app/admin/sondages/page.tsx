import React from 'react';
import Link from 'next/link';
import { getAllWeekendPolls, getPollResponses } from '@/app/lib/firebase/polls';
import {
  PlusIcon,
  ChatBubbleLeftRightIcon,
  EyeIcon,
  PencilSquareIcon,
  ArrowTopRightOnSquareIcon,
} from '@heroicons/react/24/outline';
import PollStatusToggle from './components/PollStatusToggle';
import AdminEmptyState from '../components/AdminEmptyState';
import SondagesHeader from './components/SondagesHeader';

export const dynamic = 'force-dynamic';

export default async function AdminSondagesPage(): Promise<React.ReactElement> {
  const polls = await getAllWeekendPolls();

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
    <div className="space-y-8">
      {/* Page Header with Tutorial & New Poll Actions */}
      <SondagesHeader sessionCount={polls.length} />

      {/* Overview Stats */}
      <div id="sondages-overview-cards" className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="rounded-lg border border-line bg-white p-5 shadow-xs space-y-2">
          <div className="text-xs font-bold uppercase tracking-wider text-ink-3">
            Sondage en cours
          </div>
          <div className="text-lg font-bold text-ink truncate">
            {activePoll ? activePoll.title : 'Aucun sondage actif'}
          </div>
          {activePoll ? (
            <p className="text-xs font-semibold text-emerald-600">
              ✓ {activePoll.attendeeCount} cyclistes inscrits
            </p>
          ) : (
            <p className="text-xs text-ink-3">Prêt pour la prochaine session</p>
          )}
        </div>

        <div className="rounded-lg border border-line bg-white p-5 shadow-xs space-y-2">
          <div className="text-xs font-bold uppercase tracking-wider text-ink-3">
            Historique Total
          </div>
          <div className="text-2xl font-extrabold text-ink tabular-nums">
            {polls.length}
          </div>
          <p className="text-xs text-ink-3">Sondages enregistrés</p>
        </div>

        <div className="rounded-lg border border-line bg-white p-5 shadow-xs space-y-2">
          <div className="text-xs font-bold uppercase tracking-wider text-ink-3">
            Page Publique
          </div>
          <div className="pt-1">
            <Link
              href="/sondage"
              target="_blank"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-brand hover:underline"
            >
              <span>Accéder à /sondage</span>
              <ArrowTopRightOnSquareIcon className="h-3.5 w-3.5" />
            </Link>
          </div>
          <p className="text-xs text-ink-3">Vue des membres en direct</p>
        </div>
      </div>

      {/* Polls List */}
      <div id="sondages-list-section" className="rounded-lg border border-line bg-white shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-line bg-paper-2 flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-ink">
            Historique des sondages
          </h2>
          <span className="text-xs font-semibold text-ink-3 tabular-nums">
            {pollsWithCounts.length} sessions
          </span>
        </div>

        {pollsWithCounts.length === 0 ? (
          <div className="p-6">
            <AdminEmptyState
              icon={ChatBubbleLeftRightIcon}
              title="Aucun sondage de weekend enregistré"
              description="Les sondages permettent aux membres d'indiquer leur présence (Samedi / Dimanche) et de constituer les groupes de niveau (A, B, C, VTT)."
              primaryAction={{
                label: 'Créer le premier sondage',
                href: '/admin/sondages/new',
                icon: PlusIcon,
              }}
              secondaryAction={{
                label: 'Voir la page publique',
                href: '/sondage',
                icon: ArrowTopRightOnSquareIcon,
              }}
              tip="Le sondage hebdomadaire est généralement publié le mardi afin de laisser le temps aux membres de voter avant le vendredi soir."
            />
          </div>
        ) : (
          <div className="divide-y divide-paper-2">
            {pollsWithCounts.map((p) => (
              <div
                key={p.id}
                className="p-5 sm:px-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 hover:bg-paper transition-colors"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider border ${
                        p.status === 'active'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : p.status === 'draft'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-paper-2 text-ink-3 border-line'
                      }`}
                    >
                      {p.status === 'active'
                        ? 'En cours'
                        : p.status === 'draft'
                        ? 'Brouillon'
                        : 'Clôturé'}
                    </span>
                    <span className="text-xs text-ink-3 font-mono tabular-nums">
                      Weekend du {p.weekendIsoDate}
                    </span>
                  </div>

                  <Link
                    href={`/admin/sondages/${p.id}`}
                    className="text-base font-bold text-ink hover:text-brand transition-colors block"
                  >
                    {p.title}
                  </Link>

                  <div className="flex items-center gap-3 text-xs text-ink-3 flex-wrap">
                    <span>
                      <strong className="text-ink font-bold tabular-nums">{p.attendeeCount}</strong> participants déclarés
                    </span>
                    <span>•</span>
                    <span className="tabular-nums">{p.responseCount} réponses totales</span>
                    {p.customQuestions && p.customQuestions.length > 0 && (
                      <>
                        <span>•</span>
                        <span>{p.customQuestions.length} question(s) QCM</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <PollStatusToggle pollId={p.id} currentStatus={p.status} />

                  <Link
                    href={`/admin/sondages/${p.id}`}
                    className="inline-flex items-center gap-1 rounded-md border border-line bg-white px-3 py-1.5 text-xs font-semibold text-ink hover:bg-paper-2 transition-colors"
                  >
                    <EyeIcon className="h-3.5 w-3.5 text-ink-3" />
                    <span>Réponses</span>
                  </Link>

                  <Link
                    href={`/admin/sondages/${p.id}/edit`}
                    className="rounded-md p-1.5 text-ink-3 hover:text-brand hover:bg-paper-2 transition-colors"
                    title="Modifier les paramètres"
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
