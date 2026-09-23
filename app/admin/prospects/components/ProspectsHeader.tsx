'use client';

import React from 'react';
import Link from 'next/link';
import {
  UserPlusIcon,
  ArrowDownTrayIcon,
  ArrowTopRightOnSquareIcon,
  ClockIcon,
  SparklesIcon,
  CheckBadgeIcon,
  UsersIcon,
} from '@heroicons/react/24/outline';
import { TrialRideRequest } from '@/app/types';

interface ProspectsHeaderProps {
  prospects: TrialRideRequest[];
}

export default function ProspectsHeader({ prospects }: ProspectsHeaderProps): React.ReactElement {
  const pendingCount = prospects.filter((p) => p.status === 'pending').length;
  const inTrialCount = prospects.filter((p) =>
    ['contacted', 'ride_1', 'ride_2', 'ride_3'].includes(p.status)
  ).length;
  const convertedCount = prospects.filter((p) =>
    ['converted', 'completed'].includes(p.status)
  ).length;
  const totalCount = prospects.length;

  const handleExportCsv = (): void => {
    if (prospects.length === 0) return;

    const headers = [
      'ID',
      'Date demande',
      'Nom',
      'Email',
      'Téléphone',
      'Groupe souhaité',
      'Type de vélo',
      'Niveau',
      'Première sortie souhaitée',
      'Statut',
      'Capitaine Mentor',
      'Notes internes',
      'Message',
    ];

    const rows = prospects.map((p) => [
      p.id,
      p.createdAt ? new Date(p.createdAt).toLocaleDateString('fr-BE') : '',
      `"${(p.name || '').replace(/"/g, '""')}"`,
      p.email || '',
      p.phone || '',
      p.preferredGroup || '',
      p.bikeType || '',
      p.experienceLevel || '',
      p.firstRideDate || '',
      p.status || '',
      `"${(p.mentorCaptainName || '').replace(/"/g, '""')}"`,
      `"${(p.adminNotes || '').replace(/"/g, '""')}"`,
      `"${(p.message || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `prospects_cc_blanmont_${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Title & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-line dark:border-night-3">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-ink dark:text-white">
              Candidatures &amp; Sorties d&apos;essai
            </h1>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-ink dark:bg-night-3 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-white">
              <UserPlusIcon className="h-3.5 w-3.5 text-brand" />
              <span>CRM Prospects</span>
            </span>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-ink-3 dark:text-snow-3">
            Suivi des demandes d&apos;essai reçues via <code className="text-brand font-mono text-xs">/rejoindre</code>, parrainage par les capitaines et adhésions.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <Link
            href="/rejoindre"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-md border border-line dark:border-night-3 bg-white dark:bg-night-2 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-ink dark:text-white hover:bg-paper-2 dark:hover:bg-night-3 transition-colors shadow-xs"
            title="Consulter le formulaire public de demande d'essai"
          >
            <span>Formulaire public</span>
            <ArrowTopRightOnSquareIcon className="h-3.5 w-3.5 text-ink-3 dark:text-snow-3" />
          </Link>

          <button
            type="button"
            onClick={handleExportCsv}
            disabled={prospects.length === 0}
            className="inline-flex items-center gap-2 rounded-md border border-line dark:border-night-3 bg-white dark:bg-night-2 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-ink dark:text-white hover:bg-paper-2 dark:hover:bg-night-3 transition-colors shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
            title="Exporter les coordonnées des candidats au format CSV"
          >
            <ArrowDownTrayIcon className="h-4 w-4 text-brand" />
            <span>Exporter CSV</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* À contacter */}
        <div className="rounded-lg border border-line dark:border-night-3 bg-white dark:bg-night-2 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-ink-3 dark:text-snow-3">
              À contacter
            </span>
            <span className="flex h-7 w-7 items-center justify-center rounded-sm bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-400">
              <ClockIcon className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold tabular-nums tracking-tight text-ink dark:text-white">
              {pendingCount}
            </span>
            {pendingCount > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 dark:bg-amber-900/50 px-2 py-0.5 text-[11px] font-bold text-amber-800 dark:text-amber-300">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                Action requise
              </span>
            )}
          </div>
          <p className="mt-1 text-xs text-ink-3 dark:text-snow-3">
            Nouveaux candidats non contactés
          </p>
        </div>

        {/* En cours d'essai */}
        <div className="rounded-lg border border-line dark:border-night-3 bg-white dark:bg-night-2 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-ink-3 dark:text-snow-3">
              En cours d&apos;essai
            </span>
            <span className="flex h-7 w-7 items-center justify-center rounded-sm bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 text-sky-600 dark:text-sky-400">
              <SparklesIcon className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold tabular-nums tracking-tight text-ink dark:text-white">
              {inTrialCount}
            </span>
            <span className="text-xs text-ink-3 dark:text-snow-3">
              contactés ou sorties 1-3
            </span>
          </div>
          <p className="mt-1 text-xs text-ink-3 dark:text-snow-3">
            Accompagnement en peloton
          </p>
        </div>

        {/* Adhésions validées */}
        <div className="rounded-lg border border-line dark:border-night-3 bg-white dark:bg-night-2 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-ink-3 dark:text-snow-3">
              Convertis Membres
            </span>
            <span className="flex h-7 w-7 items-center justify-center rounded-sm bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400">
              <CheckBadgeIcon className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold tabular-nums tracking-tight text-ink dark:text-white">
              {convertedCount}
            </span>
            {totalCount > 0 && (
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums">
                ({Math.round((convertedCount / totalCount) * 100)}%)
              </span>
            )}
          </div>
          <p className="mt-1 text-xs text-ink-3 dark:text-snow-3">
            Compte membre club créé
          </p>
        </div>

        {/* Total dossiers */}
        <div className="rounded-lg border border-line dark:border-night-3 bg-white dark:bg-night-2 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-ink-3 dark:text-snow-3">
              Total Candidats
            </span>
            <span className="flex h-7 w-7 items-center justify-center rounded-sm bg-paper dark:bg-ink border border-line dark:border-night-3 text-ink dark:text-snow">
              <UsersIcon className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold tabular-nums tracking-tight text-ink dark:text-white">
              {totalCount}
            </span>
            <span className="text-xs text-ink-3 dark:text-snow-3">
              demandes enregistrées
            </span>
          </div>
          <p className="mt-1 text-xs text-ink-3 dark:text-snow-3">
            Historique complet du club
          </p>
        </div>
      </div>
    </div>
  );
}
