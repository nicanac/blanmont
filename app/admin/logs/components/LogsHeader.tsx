'use client';

import React, { useState } from 'react';
import {
  ShieldCheckIcon,
  ArrowDownTrayIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import AdminPageHeader from '@/app/admin/components/AdminPageHeader';
import LogsTutorialModal from './LogsTutorialModal';
import { ActivityStats } from '@/app/types/logging';

interface Props {
  stats?: ActivityStats | null;
  onExportCsv: () => void;
  onOpenPurge: () => void;
  isPurging?: boolean;
}

export default function LogsHeader({
  stats,
  onExportCsv,
  onOpenPurge,
  isPurging,
}: Props): React.ReactElement {
  const [tutorialOpen, setTutorialOpen] = useState(false);

  const legend = [
    {
      term: 'JOURNAL',
      value: `${stats?.total ?? 0} événements`,
      hint: 'Mois en cours',
    },
    {
      term: 'VISITEURS',
      value: `${stats?.uniqueVisitors ?? 0} distincts`,
      hint: 'Sessions anonymes',
    },
    {
      term: 'MEMBRES ACTIFS',
      value: `${stats?.activeMembers ?? 0} cyclos`,
      hint: 'Comptes authentifiés',
    },
    {
      term: 'SÉCURITÉ',
      value: `${stats?.securityAlertsCount ?? 0} alertes`,
      hint: stats?.securityAlertsCount && stats.securityAlertsCount > 0 ? 'À surveiller' : 'Système nominal',
    },
  ];

  return (
    <>
      <AdminPageHeader
        id="logs-page-header"
        title="Journal d'Activité & Audit"
        badge={{ icon: ShieldCheckIcon, label: 'Observabilité' }}
        description="Surveillance en continu et traçabilité des parcours utilisateurs : visiteurs anonymes, membres connectés et interventions administratives."
        legend={legend}
        onOpenTutorial={() => setTutorialOpen(true)}
        tutorialLabel="Guide du Journal"
        actions={[
          {
            id: 'logs-export-csv-btn',
            label: 'Exporter CSV',
            onClick: onExportCsv,
            icon: ArrowDownTrayIcon,
            variant: 'secondary',
            tooltip: 'Télécharger les logs filtrés au format CSV',
          },
          {
            id: 'logs-purge-btn',
            label: isPurging ? 'Purge...' : 'Purger (>90j)',
            onClick: onOpenPurge,
            icon: TrashIcon,
            variant: 'secondary',
            tooltip: 'Nettoyer les logs plus anciens que 90 jours',
          },
        ]}
      />

      <LogsTutorialModal
        isOpen={tutorialOpen}
        onClose={() => setTutorialOpen(false)}
      />
    </>
  );
}
