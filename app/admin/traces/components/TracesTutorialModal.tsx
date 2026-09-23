'use client';

import React from 'react';
import {
  MapIcon,
  CloudArrowUpIcon,
  DocumentArrowUpIcon,
  DevicePhoneMobileIcon,
  LightBulbIcon,
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
      icon: MapIcon,
      content: (
        <div className="space-y-4">
          <div className="rounded-lg border border-night-line bg-night-2 p-4 text-snow-3 leading-relaxed">
            Le CC Saint-Martin Blanmont dispose d&apos;une riche collection de parcours traversant le Brabant wallon, le Namurois et la Hesbaye.
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-lg border border-night-line bg-night-2 space-y-1">
              <h4 className="font-bold text-white text-xs">Profil &amp; Dénivelé D+</h4>
              <p className="text-snow-3 text-xs">
                Chaque trace calcule automatiquement le dénivelé positif cumulé et le profil de relief pour adapter le choix de sortie au niveau du groupe.
              </p>
            </div>

            <div className="p-3.5 rounded-lg border border-night-line bg-night-2 space-y-1">
              <h4 className="font-bold text-white text-xs">Cartographie Interactive</h4>
              <p className="text-snow-3 text-xs">
                Les tracés sont visualisables en plein écran avec zoom sur les carrefours clés et points d&apos;eau/ravito.
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'import',
      label: '2. Méthodes d’Importation',
      icon: DocumentArrowUpIcon,
      content: (
        <div className="space-y-4">
          <div className="space-y-3">
            <div className="p-3.5 rounded-lg border border-night-line bg-night-2 space-y-1">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                <DocumentArrowUpIcon className="h-4 w-4" />
                <span>Import de fichier .GPX</span>
              </div>
              <p className="text-snow-3 text-xs">
                Glissez-déposez n&apos;importe quel fichier GPX (Openrunner, Komoot, Strava, RideWithGPS) : les coordonnées et altitudes sont extraites automatiquement.
              </p>
            </div>

            <div className="p-3.5 rounded-lg border border-night-line bg-night-2 space-y-1">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
                <CloudArrowUpIcon className="h-4 w-4" />
                <span>Synchronisation Strava API</span>
              </div>
              <p className="text-snow-3 text-xs">
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
      icon: DevicePhoneMobileIcon,
      content: (
        <div className="space-y-4">
          <div className="rounded-lg border border-night-line bg-night-2 p-4 text-snow-3 leading-relaxed">
            Les membres peuvent télécharger les traces au format GPX pour les envoyer vers leurs compteurs Garmin Edge, Wahoo ELEMNT ou Hammerhead Karoo.
          </div>

          <div className="rounded-lg border border-night-line bg-night-2 p-4 flex items-start gap-3">
            <LightBulbIcon className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold text-white text-xs">Liaison avec le Sondage du Weekend :</span>
              <p className="text-xs text-snow-3">
                Lors de la création du sondage hebdomadaire, vous pouvez sélectionner une trace du catalogue pour que les cyclistes votent en connaissance de cause du parcours et du dénivelé.
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
      icon={MapIcon}
      iconColorClass="bg-amber-500/20 text-amber-400 border-amber-500/40"
      tabs={tabs}
    />
  );
}
