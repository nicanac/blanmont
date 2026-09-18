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
            className="rounded-md p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-white/10 dark:hover:text-white transition-colors duration-150"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                  poll.status === 'active'
                    ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300'
                    : poll.status === 'draft'
                      ? 'bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300'
                      : 'bg-slate-100 dark:bg-[#1d2128] text-slate-600 dark:text-[#a7adbb]'
                }`}
              >
                {poll.status === 'active'
                  ? 'Sondage Actif'
                  : poll.status === 'draft'
                    ? 'Brouillon'
                    : 'Clôturé'}
              </span>
              <span className="text-xs text-[#5c6370] dark:text-[#a7adbb] font-mono">
                Weekend du {poll.weekendIsoDate}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight mt-1">
              {poll.title}
            </h1>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/sondage"
            target="_blank"
            className="inline-flex items-center gap-1.5 rounded-md border border-[#e4e0d8] dark:border-[#262b38] bg-white dark:bg-[#161922] px-4 py-2 text-xs font-semibold text-slate-700 dark:text-[#f5f6f8] hover:bg-slate-50 dark:hover:bg-white/5 transition-colors duration-150"
          >
            <EyeIcon className="h-4 w-4 text-[#5c6370]" />
            <span>Vue publique</span>
          </Link>

          <Link
            href={`/admin/sondages/${poll.id}/edit`}
            className="inline-flex items-center gap-1.5 rounded-md border border-[#e4e0d8] dark:border-[#262b38] bg-white dark:bg-[#161922] px-4 py-2 text-xs font-semibold text-slate-700 dark:text-[#f5f6f8] hover:bg-slate-50 dark:hover:bg-white/5 transition-colors duration-150"
          >
            <PencilSquareIcon className="h-4 w-4 text-[#5c6370]" />
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
            <div className="rounded-lg border border-[#e4e0d8] dark:border-[#262b38] bg-white dark:bg-[#161922] p-4 text-center shadow-xs">
              <div className="text-2xl font-bold text-slate-900 dark:text-white tabular-nums">{saturdayCount}</div>
              <div className="text-xs font-medium text-[#5c6370] dark:text-[#a7adbb] uppercase tracking-wider mt-0.5">
                Samedi
              </div>
            </div>
            <div className="rounded-lg border border-[#e4e0d8] dark:border-[#262b38] bg-white dark:bg-[#161922] p-4 text-center shadow-xs">
              <div className="text-2xl font-bold text-slate-900 dark:text-white tabular-nums">{sundayCount}</div>
              <div className="text-xs font-medium text-[#5c6370] dark:text-[#a7adbb] uppercase tracking-wider mt-0.5">
                Dimanche
              </div>
            </div>
            <div className="rounded-lg border border-[#e4e0d8] dark:border-[#262b38] bg-white dark:bg-[#161922] p-4 text-center shadow-xs">
              <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">{activeAttendees.length}</div>
              <div className="text-xs font-medium text-[#5c6370] dark:text-[#a7adbb] uppercase tracking-wider mt-0.5">
                Total Présents
              </div>
            </div>
            <div className="rounded-lg border border-[#e4e0d8] dark:border-[#262b38] bg-white dark:bg-[#161922] p-4 text-center shadow-xs">
              <div className="text-2xl font-bold text-slate-400 dark:text-[#5c6370] tabular-nums">{absentCount}</div>
              <div className="text-xs font-medium text-slate-400 dark:text-[#5c6370] uppercase tracking-wider mt-0.5">
                Absents
              </div>
            </div>
          </div>

          {/* Group breakdown */}
          <div className="rounded-lg border border-[#e4e0d8] dark:border-[#262b38] bg-white dark:bg-[#161922] p-6 shadow-xs space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-gray-300">
              Répartition par groupe
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {['Groupe A', 'Groupe B', 'Groupe C', 'Groupe VTT'].map((grp) => (
                <div key={grp} className="rounded-md border border-[#e4e0d8] dark:border-[#262b38] bg-[#f8f7f5] dark:bg-[#101216] p-3">
                  <div className="text-xs font-bold text-slate-800 dark:text-white">{grp}</div>
                  <div className="text-lg font-extrabold text-slate-900 dark:text-white mt-1">
                    {groupCounts[grp] || 0}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Custom Questions breakdown (e.g. Distances) */}
          {poll.customQuestions && poll.customQuestions.length > 0 && (
            <div className="rounded-lg border border-[#e4e0d8] dark:border-[#262b38] bg-white dark:bg-[#161922] p-6 shadow-xs space-y-4">
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
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-gray-300">
                      {q.title}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                      {q.options.map((opt) => (
                        <div
                          key={opt}
                          className="rounded-md border border-[#e4e0d8] dark:border-[#262b38] bg-[#f8f7f5] dark:bg-[#101216] p-3 flex items-center justify-between"
                        >
                          <span className="text-xs font-semibold text-slate-800 dark:text-[#f5f6f8] truncate mr-2">
                            {opt}
                          </span>
                          <span className="rounded-md bg-white dark:bg-[#161922] border border-[#e4e0d8] dark:border-[#262b38] px-2 py-0.5 text-xs font-bold text-[#e03e3e] tabular-nums">
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
      <div className="rounded-lg border border-[#e4e0d8] dark:border-[#262b38] bg-white dark:bg-[#161922] shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-[#e4e0d8] dark:border-[#262b38] flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-white">
            Toutes les réponses ({responses.length})
          </h2>
        </div>

        {responses.length === 0 ? (
          <div className="p-12 text-center text-xs text-[#5c6370] dark:text-[#5c6370]">
            Aucun membre n&apos;a encore répondu à ce sondage.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-[#e4e0d8] dark:divide-[#262b38] text-left text-xs">
              <thead className="bg-[#f8f7f5] dark:bg-[#101216] text-[#5c6370] dark:text-[#a7adbb] font-bold">
                <tr>
                  <th className="px-5 py-3">Membre</th>
                  <th className="px-4 py-3">Disponibilité</th>
                  <th className="px-4 py-3">Groupe</th>
                  <th className="px-4 py-3">Remarques / Réponses</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3 w-10 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e4e0d8] dark:divide-[#262b38]">
                {responses.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/70 dark:hover:bg-white/5 transition-colors duration-150">
                    <td className="px-5 py-3.5 font-bold text-slate-900 dark:text-white">
                      {r.memberName}
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          r.dayChoice === 'absent'
                            ? 'bg-slate-100 dark:bg-[#1d2128] text-slate-500 dark:text-[#a7adbb]'
                            : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300'
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
                    <td className="px-4 py-3.5 font-semibold text-slate-800 dark:text-gray-200">
                      {r.dayChoice !== 'absent' ? r.groupChoice : '—'}
                    </td>
                    <td className="px-4 py-3.5 text-slate-600 dark:text-[#a7adbb] max-w-sm">
                      {r.customAnswers && Object.keys(r.customAnswers).length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-1">
                          {Object.values(r.customAnswers).map((ans, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center rounded-md bg-amber-50 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/50 px-2 py-0.5 text-xs font-semibold text-amber-900 dark:text-amber-300"
                            >
                              🚴 {Array.isArray(ans) ? ans.join(', ') : ans}
                            </span>
                          ))}
                        </div>
                      )}
                      {r.comment ? (
                        <span className="italic text-slate-700 dark:text-gray-300 block">« {r.comment} »</span>
                      ) : (
                        (!r.customAnswers || Object.keys(r.customAnswers).length === 0) && '—'
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-[#5c6370] dark:text-[#5c6370] font-mono text-xs tabular-nums">
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
