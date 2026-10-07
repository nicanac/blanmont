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
import AdminPageHeader from '@/app/admin/components/AdminPageHeader';

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
      <AdminPageHeader
        id="prospects-header-section"
        title="Candidatures & Sorties d'essai"
        sheet="Feuille · CRM Prospects"
        badge={{ icon: UserPlusIcon, label: 'CRM Prospects' }}
        description={
          <span>
            Suivi des demandes d&apos;essai reçues via{' '}
            <code className="text-brand font-mono text-xs">/rejoindre</code>, parrainage par les capitaines et adhésions.
          </span>
        }
        actions={[
          {
            label: 'Formulaire public',
            href: '/rejoindre',
            icon: ArrowTopRightOnSquareIcon,
            variant: 'secondary',
            tooltip: 'Consulter le formulaire public de demande d’essai',
          },
          {
            label: 'Exporter CSV',
            onClick: handleExportCsv,
            icon: ArrowDownTrayIcon,
            variant: 'primary',
            tooltip: 'Exporter les coordonnées des candidats au format CSV',
          },
        ]}
      />

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
              <span className="inline-flex items-center gap-1 rounded-full bg-ambre/20 dark:bg-ambre/30 px-2 py-0.5 text-xs font-bold text-ambre dark:text-ambre">
                <span className="h-1.5 w-1.5 rounded-full bg-ambre animate-pulse" />
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
