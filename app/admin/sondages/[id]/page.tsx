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
            className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                  poll.status === 'active'
                    ? 'bg-emerald-100 text-emerald-800'
                    : poll.status === 'draft'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-slate-100 text-slate-600'
                }`}
              >
                {poll.status === 'active'
                  ? 'Sondage Actif'
                  : poll.status === 'draft'
                    ? 'Brouillon'
                    : 'Clôturé'}
              </span>
              <span className="text-xs text-slate-500 font-mono">
                Weekend du {poll.weekendIsoDate}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">
              {poll.title}
            </h1>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/sondage"
            target="_blank"
            className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <EyeIcon className="h-4 w-4 text-slate-400" />
            <span>Vue publique</span>
          </Link>

          <Link
            href={`/admin/sondages/${poll.id}/edit`}
            className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <PencilSquareIcon className="h-4 w-4 text-slate-400" />
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
            <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-xs">
              <div className="text-2xl font-bold text-slate-900 tabular-nums">{saturdayCount}</div>
              <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-0.5">
                Samedi
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-xs">
              <div className="text-2xl font-bold text-slate-900 tabular-nums">{sundayCount}</div>
              <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-0.5">
                Dimanche
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-xs">
              <div className="text-2xl font-bold text-emerald-600 tabular-nums">{activeAttendees.length}</div>
              <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-0.5">
                Total Présents
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-xs">
              <div className="text-2xl font-bold text-slate-400 tabular-nums">{absentCount}</div>
              <div className="text-xs font-medium text-slate-400 uppercase tracking-wider mt-0.5">
                Absents
              </div>
            </div>
          </div>

          {/* Group breakdown */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Répartition par groupe
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {['Groupe A', 'Groupe B', 'Groupe C', 'Groupe VTT'].map((grp) => (
                <div key={grp} className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                  <div className="text-xs font-bold text-slate-800">{grp}</div>
                  <div className="text-lg font-extrabold text-slate-900 mt-1">
                    {groupCounts[grp] || 0}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: WhatsApp Summary Card */}
        <div className="lg:col-span-4">
          <PollWhatsAppExport poll={poll} responses={responses} />
        </div>
      </div>

      {/* Responses Table */}
      <div className="rounded-3xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800">
            Toutes les réponses ({responses.length})
          </h2>
        </div>

        {responses.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            Aucun membre n&apos;a encore répondu à ce sondage.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100 text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold">
                <tr>
                  <th className="px-5 py-3">Membre</th>
                  <th className="px-4 py-3">Disponibilité</th>
                  <th className="px-4 py-3">Groupe</th>
                  <th className="px-4 py-3">Remarques / Réponses</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3 w-10 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {responses.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-3.5 font-bold text-slate-900">
                      {r.memberName}
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          r.dayChoice === 'absent'
                            ? 'bg-slate-100 text-slate-500'
                            : 'bg-emerald-50 text-emerald-800'
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
                    <td className="px-4 py-3.5 font-semibold text-slate-800">
                      {r.dayChoice !== 'absent' ? r.groupChoice : '—'}
                    </td>
                    <td className="px-4 py-3.5 text-slate-600 max-w-xs truncate">
                      {r.comment ? `« ${r.comment} »` : '—'}
                    </td>
                    <td className="px-4 py-3.5 text-slate-400 font-mono text-xs tabular-nums">
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
