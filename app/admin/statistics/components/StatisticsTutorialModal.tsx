'use client';

import React from 'react';
import {
  ChartBarIcon,
  TrophyIcon,
  ArrowTrendingUpIcon,
  LightBulbIcon,
  SignalIcon,
  CalendarDaysIcon,
} from '@heroicons/react/24/outline';
import AdminTutorialModal from '@/app/admin/components/AdminTutorialModal';

interface StatisticsTutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartTour: () => void;
}

export default function StatisticsTutorialModal({
  isOpen,
  onClose,
  onStartTour,
}: StatisticsTutorialModalProps): React.ReactElement | null {
  const tabs = [
    {
      id: 'metrics',
      label: '1. Indicateurs Clés',
      badge: 'Débutant',
      icon: ChartBarIcon,
      content: (
        <div className="space-y-4">
          <div className="rounded-md border border-line dark:border-night-line bg-paper-2 dark:bg-night-2 p-4 text-xs sm:text-sm text-ink dark:text-snow leading-relaxed">
            Ce tableau de bord agrège l&apos;ensemble des données de participation issues des pointages Carré Vert, du Pointage Express et des sorties officielles programmées.
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-md border border-line dark:border-night-line bg-paper dark:bg-night space-y-1">
              <h4 className="font-bold text-ink dark:text-white text-xs uppercase tracking-wider font-narrow">
                Membres Actifs &amp; Taux d&apos;Engagement
              </h4>
              <p className="text-ink-3 dark:text-snow-3 text-xs leading-relaxed">
                Le pourcentage d&apos;adhérents ayant participé à au moins une sortie sur l&apos;année sélectionnée, mesurant la vitalité réelle du club.
              </p>
            </div>

            <div className="p-3.5 rounded-md border border-line dark:border-night-line bg-paper dark:bg-night space-y-1">
              <h4 className="font-bold text-ink dark:text-white text-xs uppercase tracking-wider font-narrow">
                Moyenne de Sorties / Cycliste
              </h4>
              <p className="text-ink-3 dark:text-snow-3 text-xs leading-relaxed">
                L&apos;indice de régularité moyenne pour suivre si l&apos;assiduité globale du peloton progresse au fil des mois.
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'evolution',
      label: '2. Graphiques & Groupes',
      badge: 'Confirmé',
      icon: ArrowTrendingUpIcon,
      content: (
        <div className="space-y-4">
          <div className="rounded-md border border-line dark:border-night-line bg-paper-2 dark:bg-night-2 p-4 text-xs sm:text-sm text-ink dark:text-snow leading-relaxed">
            Les graphiques interactifs permettent de comparer l&apos;affluence selon les groupes de niveau et les périodes de l&apos;année.
          </div>

          <div className="space-y-3">
            <div className="p-3.5 rounded-md border border-line dark:border-night-line bg-paper dark:bg-night space-y-1">
              <h4 className="font-bold text-ink dark:text-white text-xs uppercase tracking-wider font-narrow">
                Répartition par Groupe (A, B, C, VTT)
              </h4>
              <p className="text-ink-3 dark:text-snow-3 text-xs leading-relaxed">
                Le diagramme de répartition indique la proportion de cyclistes roulant dans chaque peloton, utile pour anticiper le nombre de capitaines requis.
              </p>
            </div>

            <div className="p-3.5 rounded-md border border-line dark:border-night-line bg-paper dark:bg-night space-y-1">
              <h4 className="font-bold text-ink dark:text-white text-xs uppercase tracking-wider font-narrow">
                Saisonnalité &amp; Pics d&apos;Activité
              </h4>
              <p className="text-ink-3 dark:text-snow-3 text-xs leading-relaxed">
                L&apos;histogramme chronologique met en valeur les pics de participation lors des beaux jours de printemps et des week-ends de brevets régionaux.
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'reports',
      label: '3. Bilans d’Assemblée Générale',
      badge: 'Avancé',
      icon: TrophyIcon,
      content: (
        <div className="space-y-4">
          <div className="rounded-md border border-line dark:border-night-line bg-paper-2 dark:bg-night-2 p-4 text-xs sm:text-sm text-ink dark:text-snow leading-relaxed">
            Ces chiffres alimentent le <strong>rapport moral et sportif officiel</strong> présenté par le comité lors de l&apos;Assemblée Générale annuelle.
          </div>

          <div className="rounded-md border border-ambre/30 bg-ambre/5 p-4 flex items-start gap-3">
            <LightBulbIcon className="h-5 w-5 text-ambre shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold text-ink dark:text-white text-xs">Comparatif Inter-Saisons :</span>
              <p className="text-xs text-ink-3 dark:text-snow-3 leading-relaxed">
                Changez l&apos;année dans le sélecteur en haut à droite pour comparer instantanément les saisons (2025 vs 2026) et mesurer l&apos;impact des nouvelles recrues.
              </p>
            </div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <AdminTutorialModal
      isOpen={isOpen}
      onClose={onClose}
      onStartTour={() => {
        onClose();
        onStartTour();
      }}
      title="Guide des Statistiques & Analyses"
      badge="Télémétrie Club"
      subtitle="Analysez la fréquentation des pelotons, la régularité des coureurs et préparez les bilans d'AG."
      icon={ChartBarIcon}
      iconColorClass="bg-hydro/10 text-hydro border-hydro/30"
      tabs={tabs}
      tourButtonLabel="Lancer la visite interactive"
    />
  );
}
