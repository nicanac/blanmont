'use client';

import React from 'react';
import {
  ChartBarIcon,
  TrophyIcon,
  ArrowTrendingUpIcon,
  LightBulbIcon,
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
      icon: ChartBarIcon,
      content: (
        <div className="space-y-4">
          <div className="rounded-lg border border-night-line bg-night-2 p-4 text-snow-3 leading-relaxed">
            Ce tableau de bord agrège l&apos;ensemble des données de participation issues des pointages Carré Vert et des sorties officielles.
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-lg border border-night-line bg-night-2 space-y-1">
              <h4 className="font-bold text-white text-xs">Membres Actifs &amp; Taux d&apos;Engagement</h4>
              <p className="text-snow-3 text-xs">
                Pourcentage d&apos;adhérents ayant participé à au moins une sortie sur l&apos;année sélectionnée.
              </p>
            </div>

            <div className="p-3.5 rounded-lg border border-night-line bg-night-2 space-y-1">
              <h4 className="font-bold text-white text-xs">Moyenne de Sorties / Cycliste</h4>
              <p className="text-snow-3 text-xs">
                Régularité moyenne des cyclistes pour mesurer l&apos;assiduité globale du peloton.
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'evolution',
      label: '2. Graphiques & Groupes',
      icon: ArrowTrendingUpIcon,
      content: (
        <div className="space-y-4">
          <div className="rounded-lg border border-night-line bg-night-2 p-4 text-snow-3 leading-relaxed">
            Les graphiques interactifs permettent de comparer la fréquentation selon les saisons et les groupes de niveau.
          </div>

          <div className="space-y-3">
            <div className="p-3.5 rounded-lg border border-night-line bg-night-2 space-y-1">
              <h4 className="font-bold text-white text-xs">Répartition par Groupe (A, B, C, VTT)</h4>
              <p className="text-snow-3 text-xs">
                Diagramme circulaire représentant les effectifs respectifs des différents pelotons de vitesse.
              </p>
            </div>

            <div className="p-3.5 rounded-lg border border-night-line bg-night-2 space-y-1">
              <h4 className="font-bold text-white text-xs">Activité Hebdomadaire</h4>
              <p className="text-snow-3 text-xs">
                Histogramme montrant les pics de participation (beaux jours printaniers, week-ends de brevets).
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'reports',
      label: '3. Bilans d’Assemblée Générale',
      icon: TrophyIcon,
      content: (
        <div className="space-y-4">
          <div className="rounded-lg border border-night-line bg-night-2 p-4 text-snow-3 leading-relaxed">
            Ces chiffres alimentent le <strong>rapport moral et sportif</strong> présenté par le comité lors de l&apos;Assemblée Générale annuelle.
          </div>

          <div className="rounded-lg border border-night-line bg-night-2 p-4 flex items-start gap-3">
            <LightBulbIcon className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
            <p className="text-xs text-snow-3">
              Changez l&apos;année dans le sélecteur en haut à droite pour comparer l&apos;évolution de la participation d&apos;une saison à l&apos;autre.
            </p>
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
      badge="Analytics"
      icon={ChartBarIcon}
      iconColorClass="bg-purple-500/20 text-purple-400 border-purple-500/40"
      tabs={tabs}
    />
  );
}
