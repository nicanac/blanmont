'use client';

import React from 'react';
import {
  MapIcon,
  CloudArrowUpIcon,
  DocumentArrowUpIcon,
  DevicePhoneMobileIcon,
  LightBulbIcon,
  ArrowTrendingUpIcon,
} from '@heroicons/react/24/outline';
import AdminTutorialModal from '@/app/admin/components/AdminTutorialModal';

interface TracesTutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartTour: () => void;
}

export default function TracesTutorialModal({
  isOpen,
  onClose,
  onStartTour,
}: TracesTutorialModalProps): React.ReactElement | null {
  const tabs = [
    {
      id: 'catalog',
      label: '1. Le Catalogue de Traces',
      badge: 'Débutant',
      icon: MapIcon,
      content: (
        <div className="space-y-4">
          <div className="rounded-md border border-line dark:border-night-line bg-paper-2 dark:bg-night-2 p-4 text-xs sm:text-sm text-ink dark:text-snow leading-relaxed">
            Le CC Saint-Martin Blanmont dispose d&apos;une riche collection de parcours traversant le Brabant wallon, le Namurois et la Hesbaye.
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-md border border-line dark:border-night-line bg-paper dark:bg-night space-y-1">
              <div className="flex items-center gap-2">
                <ArrowTrendingUpIcon className="h-4 w-4 text-brand" />
                <h4 className="font-bold text-ink dark:text-white text-xs uppercase tracking-wider font-narrow">
                  Dénivelé D+ &amp; Profil
                </h4>
              </div>
              <p className="text-ink-3 dark:text-snow-3 text-xs leading-relaxed">
                Chaque trace calcule automatiquement le dénivelé positif cumulé et le profil de relief pour adapter le choix de sortie au niveau du groupe.
              </p>
            </div>

            <div className="p-3.5 rounded-md border border-line dark:border-night-line bg-paper dark:bg-night space-y-1">
              <div className="flex items-center gap-2">
                <MapIcon className="h-4 w-4 text-vert" />
                <h4 className="font-bold text-ink dark:text-white text-xs uppercase tracking-wider font-narrow">
                  Cartographie Interactive
                </h4>
              </div>
              <p className="text-ink-3 dark:text-snow-3 text-xs leading-relaxed">
                Les tracés sont visualisables en plein écran avec zoom sur les carrefours clés et points de regroupement.
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'import',
      label: '2. Méthodes d’Importation',
      badge: 'Confirmé',
      icon: DocumentArrowUpIcon,
      content: (
        <div className="space-y-4">
          <div className="space-y-3">
            <div className="p-3.5 rounded-md border border-line dark:border-night-line bg-paper dark:bg-night space-y-1">
              <div className="flex items-center gap-2 text-vert font-bold text-xs uppercase tracking-wider font-narrow">
                <DocumentArrowUpIcon className="h-4 w-4" />
                <span>Import de fichier .GPX</span>
              </div>
              <p className="text-ink-3 dark:text-snow-3 text-xs leading-relaxed">
                Glissez-déposez n&apos;importe quel fichier GPX (Openrunner, Komoot, Strava, RideWithGPS) : les coordonnées et altitudes sont extraites automatiquement.
              </p>
            </div>

            <div className="p-3.5 rounded-md border border-line dark:border-night-line bg-paper dark:bg-night space-y-1">
              <div className="flex items-center gap-2 text-ambre font-bold text-xs uppercase tracking-wider font-narrow">
                <CloudArrowUpIcon className="h-4 w-4" />
                <span>Synchronisation Strava API</span>
              </div>
              <p className="text-ink-3 dark:text-snow-3 text-xs leading-relaxed">
                Connectez votre compte Strava pour importer directement l&apos;une de vos activités récentes comme nouveau parcours officiel.
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'usage',
      label: '3. Compteurs & Sondages',
      badge: 'Avancé',
      icon: DevicePhoneMobileIcon,
      content: (
        <div className="space-y-4">
          <div className="rounded-md border border-line dark:border-night-line bg-paper-2 dark:bg-night-2 p-4 text-xs sm:text-sm text-ink dark:text-snow leading-relaxed">
            Les membres peuvent télécharger les traces au format GPX pour les envoyer vers leurs compteurs Garmin Edge, Wahoo ELEMNT ou Hammerhead Karoo.
          </div>

          <div className="rounded-md border border-ambre/30 bg-ambre/5 p-4 flex items-start gap-3">
            <LightBulbIcon className="h-5 w-5 text-ambre shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold text-ink dark:text-white text-xs">Liaison avec le Sondage du Weekend :</span>
              <p className="text-xs text-ink-3 dark:text-snow-3 leading-relaxed">
                Lors de la création du sondage hebdomadaire, sélectionnez une trace du catalogue pour que les cyclistes votent en connaissance du parcours et du dénivelé.
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
      title="Guide des Traces & Parcours GPS"
      badge="Itinéraires"
      subtitle="Gérez le patrimoine de traces GPS du club, les imports Strava/Komoot et les profils altimétriques."
      icon={MapIcon}
      iconColorClass="bg-bistre/10 text-bistre border-bistre/30"
      tabs={tabs}
      tourButtonLabel="Lancer la visite interactive"
    />
  );
}
