'use client';

import React from 'react';
import {
  UserCircleIcon,
  AdjustmentsHorizontalIcon,
  ArrowUpTrayIcon,
  PhotoIcon,
  CheckIcon,
  LightBulbIcon,
  Squares2X2Icon,
} from '@heroicons/react/24/outline';
import AdminTutorialModal from '@/app/admin/components/AdminTutorialModal';

interface MemberPhotosTutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartTour?: () => void;
}

export default function MemberPhotosTutorialModal({
  isOpen,
  onClose,
  onStartTour,
}: MemberPhotosTutorialModalProps): React.ReactElement | null {
  const tabs = [
    {
      id: 'roster',
      label: '1. Trombinoscope & Filtres',
      badge: 'Débutant',
      icon: UserCircleIcon,
      content: (
        <div className="space-y-4">
          <div className="rounded-md border border-line dark:border-night-line bg-paper-2 dark:bg-night-2 p-4 text-xs sm:text-sm text-ink dark:text-snow leading-relaxed">
            Ce gestionnaire permet d&apos;administrer les <strong>portraits photographiques</strong> de tous les cyclistes du club pour le trombinoscope public (<span className="font-mono text-brand text-xs">/le-club/membres</span>), les fiches membres et le Pointage Express.
          </div>

          <div className="space-y-3">
            <div className="p-3.5 rounded-md border border-line dark:border-night-line bg-paper dark:bg-night space-y-1.5">
              <h4 className="font-bold text-ink dark:text-white text-xs uppercase tracking-wider font-narrow">
                Filtres Rapides par Statut
              </h4>
              <p className="text-ink-3 dark:text-snow-3 text-xs leading-relaxed">
                Isolez en un clic les cyclistes <em>« Sans photo »</em> pour les photographier lors de la prochaine sortie, ou filtrez par <em>Bureau</em> et <em>Capitaines</em>.
              </p>
            </div>

            <div className="p-3.5 rounded-md border border-line dark:border-night-line bg-paper dark:bg-night space-y-1.5">
              <h4 className="font-bold text-ink dark:text-white text-xs uppercase tracking-wider font-narrow">
                Affichage Grille &amp; Table
              </h4>
              <p className="text-ink-3 dark:text-snow-3 text-xs leading-relaxed">
                Basculez entre la vue trombinoscope en cartes visuelles (idéale pour repérer les visages) et la vue tableau compacte (idéale pour les ajustements rapides).
              </p>
            </div>
          </div>

          <div className="rounded-md border border-vert/30 bg-vert/5 p-4 flex items-start gap-3">
            <LightBulbIcon className="h-5 w-5 text-vert shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold text-ink dark:text-white text-xs">Initiales automatiques :</span>
              <p className="text-xs text-ink-3 dark:text-snow-3 leading-relaxed">
                Si un coureur n&apos;a pas encore de photo, le système génère un badge aux couleurs du club avec ses initiales (ex. « NB » pour Nicolas Bruyère).
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'crop_alignment',
      label: '2. Cadrage & Alignement',
      badge: 'Confirmé',
      icon: AdjustmentsHorizontalIcon,
      content: (
        <div className="space-y-4">
          <div className="rounded-md border border-line dark:border-night-line bg-paper-2 dark:bg-night-2 p-4 text-xs sm:text-sm text-ink dark:text-snow leading-relaxed">
            Les photos de cyclistes prises en pleine action ou de pied nécessitent souvent un <strong>recalibrage du point focal</strong> pour que le visage ne soit pas coupé dans les médaillons circulaires.
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-md border border-line dark:border-night-line bg-paper dark:bg-night space-y-2">
              <div className="flex items-center gap-2">
                <AdjustmentsHorizontalIcon className="h-4 w-4 text-hydro" />
                <h4 className="font-bold text-ink dark:text-white text-xs uppercase tracking-wider font-narrow">
                  Curseur d&apos;Alignement Vertical
                </h4>
              </div>
              <p className="text-ink-3 dark:text-snow-3 text-xs leading-relaxed">
                Ajustez le curseur de position verticale (de 0% en haut à 100% en bas) pour remonter ou descendre la photo en direct dans son cadre.
              </p>
            </div>

            <div className="p-3.5 rounded-md border border-line dark:border-night-line bg-paper dark:bg-night space-y-2">
              <div className="flex items-center gap-2">
                <PhotoIcon className="h-4 w-4 text-brand" />
                <h4 className="font-bold text-ink dark:text-white text-xs uppercase tracking-wider font-narrow">
                  Préréglages en 1 Clic
                </h4>
              </div>
              <p className="text-ink-3 dark:text-snow-3 text-xs leading-relaxed">
                Les boutons <em>Haut (20%)</em>, <em>Centre (50%)</em> et <em>Bas (80%)</em> permettent un calage immédiat sans tâtonner.
              </p>
            </div>
          </div>

          <div className="rounded-md border border-ambre/30 bg-ambre/5 p-4 flex items-start gap-3">
            <LightBulbIcon className="h-5 w-5 text-ambre shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold text-ink dark:text-white text-xs">Aperçu en direct :</span>
              <p className="text-xs text-ink-3 dark:text-snow-3 leading-relaxed">
                Le médaillon circulaire à gauche du curseur reflète instantanément le rendu public au fur et à mesure que vous déplacez la réglette.
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'batch_save',
      label: '3. Téléversement & Sauvegarde',
      badge: 'Avancé',
      icon: ArrowUpTrayIcon,
      content: (
        <div className="space-y-4">
          <div className="rounded-md border border-line dark:border-night-line bg-paper-2 dark:bg-night-2 p-4 text-xs sm:text-sm text-ink dark:text-snow leading-relaxed">
            Téléversez de nouveaux clichés et enregistrez vos modifications par lot pour gagner du temps.
          </div>

          <div className="space-y-3">
            <div className="p-3.5 rounded-md border border-line dark:border-night-line bg-paper dark:bg-night space-y-1.5">
              <div className="flex items-center gap-2">
                <ArrowUpTrayIcon className="h-4 w-4 text-hydro" />
                <h4 className="font-bold text-ink dark:text-white text-xs uppercase tracking-wider font-narrow">
                  Changer la Photo d&apos;un Membre
                </h4>
              </div>
              <p className="text-ink-3 dark:text-snow-3 text-xs leading-relaxed">
                Cliquez sur l&apos;icône d&apos;appareil photo sur une carte membre pour ouvrir l&apos;outil de recadrage carré intégré et téléverser le cliché en haute définition.
              </p>
            </div>

            <div className="p-3.5 rounded-md border border-line dark:border-night-line bg-paper dark:bg-night space-y-1.5">
              <div className="flex items-center gap-2">
                <CheckIcon className="h-4 w-4 text-brand" />
                <h4 className="font-bold text-ink dark:text-white text-xs uppercase tracking-wider font-narrow">
                  Sauvegarde Globale en 1 Clic
                </h4>
              </div>
              <p className="text-ink-3 dark:text-snow-3 text-xs leading-relaxed">
                Modifiez autant de photos et de cadrages que souhaité. Le bouton rouge <strong>« Enregistrer (X) * »</strong> dans l&apos;en-tête comptabilise les membres modifiés et sauvegarde l&apos;ensemble en une seule opération sécurisée.
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
      onStartTour={onStartTour ? () => {
        onClose();
        onStartTour();
      } : undefined}
      title="Guide des Portraits & Cadrage"
      badge="Trombinoscope Club"
      subtitle="Recadrez et positionnez les visages des membres pour un rendu optimal sur toutes les vues."
      icon={UserCircleIcon}
      iconColorClass="bg-hydro/10 text-hydro border-hydro/30"
      tabs={tabs}
      tourButtonLabel="Lancer la visite interactive"
    />
  );
}
