import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getWeekendPollById, getPollResponses } from '@/app/lib/firebase';
import {
  ArrowLeftIcon,
  PencilSquareIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';
import PollWhatsAppExport from './components/PollWhatsAppExport';
import AdminDeletePollButton from './components/AdminDeletePollButton';
import AdminDeleteResponseButton from './components/AdminDeleteResponseButton';

export const dynamic = 'force-dynamic';

interface AdminPollDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminPollDetailPage({ params }: AdminPollDetailPageProps): Promise<React.ReactElement> {
  const { id } = await params;
  const [poll, responses] = await Promise.all([
    getWeekendPollById(id),
    getPollResponses(id),
  ]);

  if (!poll) {
    notFound();
  }

  const activeAttendees = responses.filter((r) => r.dayChoice !== 'absent');
  const saturdayCount = responses.filter((r) => r.dayChoice === 'samedi' || r.dayChoice === 'les-deux').length;
  const sundayCount = responses.filter((r) => r.dayChoice === 'dimanche' || r.dayChoice === 'les-deux').length;
  const absentCount = responses.filter((r) => r.dayChoice === 'absent').length;

  const groupCounts: Record<string, number> = {
    'Groupe A': 0,
    'Groupe B': 0,
    'Groupe C': 0,
    'Groupe VTT': 0,
    'Autre': 0,
  };

  activeAttendees.forEach((r) => {
    if (groupCounts[r.groupChoice] !== undefined) {
      groupCounts[r.groupChoice]++;
    } else {
      groupCounts['Autre']++;
    }
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/sondages"
            className="rounded-sm p-2 text-ink-3 hover:bg-paper-2 hover:text-ink dark:hover:bg-night-2 dark:hover:text-snow-1 transition-colors duration-150"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                  poll.status === 'active'
                    ? 'bg-vert/10 border border-vert/30 text-vert dark:text-vert-light font-mono'
                    : poll.status === 'draft'
                      ? 'bg-ambre/10 border border-ambre/30 text-ambre-dark dark:text-ambre font-mono'
                      : 'bg-paper-2 border border-line text-ink-3 dark:bg-night-3 dark:border-night-line dark:text-snow-3 font-mono'
                }`}
              >
                {poll.status === 'active'
                  ? 'Sondage Actif'
                  : poll.status === 'draft'
                    ? 'Brouillon'
                    : 'Clôturé'}
              </span>
              <span className="text-xs text-ink-3 dark:text-snow-3 font-mono">
                Weekend du {poll.weekendIsoDate}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-ink dark:text-snow-1 tracking-tight mt-1 font-semiwide">
              {poll.title}
            </h1>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/sondage"
            target="_blank"
            className="inline-flex items-center gap-1.5 rounded-sm border border-line dark:border-night-line bg-paper dark:bg-night px-4 py-2 text-xs font-semibold text-ink dark:text-snow-1 hover:bg-paper-2 dark:hover:bg-night-2 transition-colors duration-150"
          >
            <EyeIcon className="h-4 w-4 text-ink-3 dark:text-snow-3" />
            <span>Vue publique</span>
          </Link>

          <Link
            href={`/admin/sondages/${poll.id}/edit`}
            className="inline-flex items-center gap-1.5 rounded-sm border border-line dark:border-night-line bg-paper dark:bg-night px-4 py-2 text-xs font-semibold text-ink dark:text-snow-1 hover:bg-paper-2 dark:hover:bg-night-2 transition-colors duration-150"
          >
            <PencilSquareIcon className="h-4 w-4 text-ink-3 dark:text-snow-3" />
            <span>Modifier</span>
          </Link>

          <AdminDeletePollButton pollId={poll.id} />
        </div>
      </div>

      {/* Metrics & WhatsApp summary card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Stats Grid */}
        <div className="lg:col-span-8 space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-md border border-line dark:border-night-line bg-paper dark:bg-night-2 p-4 text-center">
              <div className="text-2xl font-bold text-ink dark:text-snow-1 font-mono tabular-nums">{saturdayCount}</div>
              <div className="text-xs font-medium text-ink-3 dark:text-snow-3 uppercase tracking-wider mt-0.5 font-mono">
                Samedi
              </div>
            </div>
            <div className="rounded-md border border-line dark:border-night-line bg-paper dark:bg-night-2 p-4 text-center">
              <div className="text-2xl font-bold text-ink dark:text-snow-1 font-mono tabular-nums">{sundayCount}</div>
              <div className="text-xs font-medium text-ink-3 dark:text-snow-3 uppercase tracking-wider mt-0.5 font-mono">
                Dimanche
              </div>
            </div>
            <div className="rounded-md border border-line dark:border-night-line bg-paper dark:bg-night-2 p-4 text-center">
              <div className="text-2xl font-bold text-vert dark:text-vert-light font-mono tabular-nums">{activeAttendees.length}</div>
              <div className="text-xs font-medium text-ink-3 dark:text-snow-3 uppercase tracking-wider mt-0.5 font-mono">
                Total Présents
              </div>
            </div>
            <div className="rounded-md border border-line dark:border-night-line bg-paper dark:bg-night-2 p-4 text-center">
              <div className="text-2xl font-bold text-ink-3 dark:text-snow-3 font-mono tabular-nums">{absentCount}</div>
              <div className="text-xs font-medium text-ink-3 dark:text-snow-3 uppercase tracking-wider mt-0.5 font-mono">
                Absents
              </div>
            </div>
          </div>

          {/* Group breakdown */}
          <div className="rounded-md border border-line dark:border-night-line bg-paper dark:bg-night-2 p-6 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-ink-2 dark:text-snow-2 font-mono">
              Répartition par groupe
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {['Groupe A', 'Groupe B', 'Groupe C', 'Groupe VTT'].map((grp) => (
                <div key={grp} className="rounded-sm border border-line dark:border-night-line bg-paper-2 dark:bg-night p-3">
                  <div className="text-xs font-bold text-ink dark:text-snow-1">{grp}</div>
                  <div className="text-lg font-extrabold text-ink dark:text-snow-1 font-mono tabular-nums mt-1">
                    {groupCounts[grp] || 0}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Custom Questions breakdown (e.g. Distances) */}
          {poll.customQuestions && poll.customQuestions.length > 0 && (
            <div className="rounded-md border border-line dark:border-night-line bg-paper dark:bg-night-2 p-6 space-y-4">
              {poll.customQuestions.map((q) => {
                const counts: Record<string, number> = {};
                q.options.forEach((opt) => (counts[opt] = 0));
                responses.forEach((r) => {
                  const ans = r.customAnswers?.[q.id];
                  if (!ans) return;
                  if (Array.isArray(ans)) {
                    ans.forEach((a) => {
                      counts[a] = (counts[a] || 0) + 1;
                    });
                  } else {
                    counts[ans] = (counts[ans] || 0) + 1;
                  }
                });

                return (
                  <div key={q.id} className="space-y-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-ink-2 dark:text-snow-2 font-mono">
                      {q.title}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                      {q.options.map((opt) => (
                        <div
                          key={opt}
                          className="rounded-sm border border-line dark:border-night-line bg-paper-2 dark:bg-night p-3 flex items-center justify-between"
                        >
                          <span className="text-xs font-semibold text-ink dark:text-snow-1 truncate mr-2">
                            {opt}
                          </span>
                          <span className="rounded-xs bg-paper dark:bg-night-2 border border-line dark:border-night-line px-2 py-0.5 text-xs font-bold text-brand font-mono tabular-nums">
                            {counts[opt] || 0}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: WhatsApp Summary Card */}
        <div className="lg:col-span-4">
          <PollWhatsAppExport poll={poll} responses={responses} />
        </div>
      </div>

      {/* Responses Table */}
      <div className="rounded-md border border-line dark:border-night-line bg-paper dark:bg-night-2 overflow-hidden">
        <div className="px-6 py-4 border-b border-line dark:border-night-line bg-paper-2 dark:bg-night flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-ink dark:text-snow-1 font-mono">
            Toutes les réponses ({responses.length})
          </h2>
        </div>

        {responses.length === 0 ? (
          <div className="p-12 text-center text-xs text-ink-3 dark:text-snow-3">
            Aucun membre n&apos;a encore répondu à ce sondage.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-line dark:divide-night-line text-left text-xs">
              <thead className="bg-paper-2 dark:bg-night text-ink-3 dark:text-snow-3 font-bold font-mono">
                <tr>
                  <th className="px-5 py-3">Membre</th>
                  <th className="px-4 py-3">Disponibilité</th>
                  <th className="px-4 py-3">Groupe</th>
                  <th className="px-4 py-3">Remarques / Réponses</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3 w-10 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line/40 dark:divide-night-line">
                {responses.map((r) => (
                  <tr key={r.id} className="hover:bg-paper-2/60 dark:hover:bg-night-3/60 transition-colors duration-150">
                    <td className="px-5 py-3.5 font-bold text-ink dark:text-snow-1">
                      {r.memberName}
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          r.dayChoice === 'absent'
                            ? 'bg-paper-2 dark:bg-night text-ink-3 dark:text-snow-3 border border-line dark:border-night-line'
                            : 'bg-vert/10 text-vert dark:text-vert-light border border-vert/30'
                        }`}
                      >
                        {r.dayChoice === 'samedi'
                          ? 'Samedi matin'
                          : r.dayChoice === 'dimanche'
                            ? 'Dimanche matin'
                            : r.dayChoice === 'les-deux'
                              ? 'Samedi & Dimanche'
                              : 'Absent'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 font-semibold text-ink-2 dark:text-snow-2">
                      {r.dayChoice !== 'absent' ? r.groupChoice : '—'}
                    </td>
                    <td className="px-4 py-3.5 text-ink-2 dark:text-snow-3 max-w-sm">
                      {r.customAnswers && Object.keys(r.customAnswers).length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-1">
                          {Object.values(r.customAnswers).map((ans, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center rounded-xs bg-ambre/10 border border-ambre/30 px-2 py-0.5 text-xs font-semibold text-ambre-dark dark:text-ambre font-mono"
                            >
                              🚴 {Array.isArray(ans) ? ans.join(', ') : ans}
                            </span>
                          ))}
                        </div>
                      )}
                      {r.comment ? (
                        <span className="italic text-ink-2 dark:text-snow-2 block">« {r.comment} »</span>
                      ) : (
                        (!r.customAnswers || Object.keys(r.customAnswers).length === 0) && '—'
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-ink-3 dark:text-snow-3 font-mono text-xs tabular-nums">
                      {r.updatedAt ? new Date(r.updatedAt).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : '—'}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <AdminDeleteResponseButton pollId={poll.id} memberId={r.memberId} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
