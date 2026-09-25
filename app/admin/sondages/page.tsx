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
        <div className="rounded-md border border-line dark:border-night-line bg-paper dark:bg-night-2 p-5 space-y-2">
          <div className="text-xs font-bold uppercase tracking-wider text-ink-3 dark:text-snow-3 font-mono">
            Sondage en cours
          </div>
          <div className="text-lg font-bold text-ink dark:text-snow-1 truncate">
            {activePoll ? activePoll.title : 'Aucun sondage actif'}
          </div>
          {activePoll ? (
            <p className="text-xs font-semibold text-vert dark:text-vert-light font-mono">
              ✓ {activePoll.attendeeCount} cyclistes inscrits
            </p>
          ) : (
            <p className="text-xs text-ink-3 dark:text-snow-3">Prêt pour la prochaine session</p>
          )}
        </div>

        <div className="rounded-md border border-line dark:border-night-line bg-paper dark:bg-night-2 p-5 space-y-2">
          <div className="text-xs font-bold uppercase tracking-wider text-ink-3 dark:text-snow-3 font-mono">
            Historique Total
          </div>
          <div className="text-2xl font-extrabold text-ink dark:text-snow-1 tabular-nums font-mono">
            {polls.length}
          </div>
          <p className="text-xs text-ink-3 dark:text-snow-3">Sondages enregistrés</p>
        </div>

        <div className="rounded-md border border-line dark:border-night-line bg-paper dark:bg-night-2 p-5 space-y-2">
          <div className="text-xs font-bold uppercase tracking-wider text-ink-3 dark:text-snow-3 font-mono">
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
          <p className="text-xs text-ink-3 dark:text-snow-3">Vue des membres en direct</p>
        </div>
      </div>

      {/* Polls List */}
      <div id="sondages-list-section" className="rounded-md border border-line dark:border-night-line bg-paper dark:bg-night-2 overflow-hidden">
        <div className="px-6 py-4 border-b border-line dark:border-night-line bg-paper-2 dark:bg-night flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-ink dark:text-snow-1 font-mono">
            Historique des sondages
          </h2>
          <span className="text-xs font-semibold text-ink-3 dark:text-snow-3 font-mono tabular-nums">
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
          <div className="divide-y divide-line/40 dark:divide-night-line">
            {pollsWithCounts.map((p) => (
              <div
                key={p.id}
                className="p-5 sm:px-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 hover:bg-paper-2 dark:hover:bg-night-3 transition-colors"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider border ${
                        p.status === 'active'
                          ? 'bg-vert/10 text-vert border-vert/30'
                          : p.status === 'draft'
                          ? 'bg-ambre/10 text-ambre-dark dark:text-ambre border-ambre/30'
                          : 'bg-paper-2 dark:bg-night text-ink-3 dark:text-snow-3 border-line dark:border-night-line'
                      }`}
                    >
                      {p.status === 'active'
                        ? 'En cours'
                        : p.status === 'draft'
                        ? 'Brouillon'
                        : 'Clôturé'}
                    </span>
                    <span className="text-xs text-ink-3 dark:text-snow-3 font-mono tabular-nums">
                      Weekend du {p.weekendIsoDate}
                    </span>
                  </div>

                  <Link
                    href={`/admin/sondages/${p.id}`}
                    className="text-base font-bold text-ink dark:text-snow-1 hover:text-brand dark:hover:text-brand-light transition-colors block"
                  >
                    {p.title}
                  </Link>

                  <div className="flex items-center gap-3 text-xs text-ink-3 dark:text-snow-3 flex-wrap">
                    <span>
                      <strong className="text-ink dark:text-snow-1 font-bold tabular-nums">{p.attendeeCount}</strong> participants déclarés
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
                    className="inline-flex items-center gap-1 rounded-sm border border-line dark:border-night-line bg-paper-2 dark:bg-night px-3 py-1.5 text-xs font-semibold text-ink dark:text-snow-1 hover:bg-paper-3 dark:hover:bg-night-line transition-colors"
                  >
                    <EyeIcon className="h-3.5 w-3.5 text-ink-3 dark:text-snow-3" />
                    <span>Réponses</span>
                  </Link>

                  <Link
                    href={`/admin/sondages/${p.id}/edit`}
                    className="rounded-sm p-1.5 text-ink-3 dark:text-snow-3 hover:text-brand dark:hover:text-brand-light hover:bg-paper-2 dark:hover:bg-night transition-colors"
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
