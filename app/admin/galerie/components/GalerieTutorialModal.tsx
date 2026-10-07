'use client';

import React from 'react';
import {
  CameraIcon,
  PhotoIcon,
  SparklesIcon,
  ArrowTopRightOnSquareIcon,
  LightBulbIcon,
  EyeIcon,
  CalendarDaysIcon,
} from '@heroicons/react/24/outline';
import AdminTutorialModal from '@/app/admin/components/AdminTutorialModal';

interface GalerieTutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartTour?: () => void;
}

export default function GalerieTutorialModal({
  isOpen,
  onClose,
  onStartTour,
}: GalerieTutorialModalProps): React.ReactElement | null {
  const tabs = [
    {
      id: 'albums_creation',
      label: '1. Création d’un Album',
      badge: 'Débutant',
      icon: CameraIcon,
      content: (
        <div className="space-y-4">
          <div className="rounded-md border border-line dark:border-night-line bg-paper-2 dark:bg-night-2 p-4 text-xs sm:text-sm text-ink dark:text-snow leading-relaxed">
            La galerie photo immortalise les souvenirs des sorties du weekend, des brevets régionaux, des stages printaniers et des rassemblements officiels du club.
          </div>

          <div className="space-y-3">
            <div className="p-3.5 rounded-md border border-line dark:border-night-line bg-paper dark:bg-night space-y-1.5">
              <h4 className="font-bold text-ink dark:text-white text-xs uppercase tracking-wider font-narrow">
                Titre Évocateur &amp; Année
              </h4>
              <p className="text-ink-3 dark:text-snow-3 text-xs leading-relaxed">
                Nommez clairement la session (ex. <em>« Stage des Ardennes 2026 »</em> ou <em>« Sortie de rentrée à Villers »</em>) et sélectionnez l&apos;année correspondante pour le tri chronologique.
              </p>
            </div>

            <div className="p-3.5 rounded-md border border-line dark:border-night-line bg-paper dark:bg-night space-y-1.5">
              <h4 className="font-bold text-ink dark:text-white text-xs uppercase tracking-wider font-narrow">
                Catégorie Thématique
              </h4>
              <p className="text-ink-3 dark:text-snow-3 text-xs leading-relaxed">
                Classez parmi les 4 rubriques officielles du club : <em>Sorties, Ardennes &amp; Stages, Événements,</em> ou <em>Équipements</em>.
              </p>
            </div>

            <div className="p-3.5 rounded-md border border-line dark:border-night-line bg-paper dark:bg-night space-y-1.5">
              <h4 className="font-bold text-ink dark:text-white text-xs uppercase tracking-wider font-narrow">
                Photo de Couverture HD
              </h4>
              <p className="text-ink-3 dark:text-snow-3 text-xs leading-relaxed">
                Choisissez une belle photo panoramique de groupe ou d&apos;action sur le vélo (ratio paysage 16:9 recommandé). Elle illustrera la carte de l&apos;album sur <span className="font-mono text-brand text-xs">/galerie</span>.
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'external_links',
      label: '2. Albums Externes & Partage',
      badge: 'Confirmé',
      icon: ArrowTopRightOnSquareIcon,
      content: (
        <div className="space-y-4">
          <div className="rounded-md border border-line dark:border-night-line bg-paper-2 dark:bg-night-2 p-4 text-xs sm:text-sm text-ink dark:text-snow leading-relaxed">
            Pour héberger des dizaines de clichés haute résolution sans surcharger le serveur du club, reliez un album externe partagé.
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-md border border-line dark:border-night-line bg-paper dark:bg-night space-y-2">
              <div className="flex items-center gap-2">
                <ArrowTopRightOnSquareIcon className="h-4 w-4 text-hydro" />
                <h4 className="font-bold text-ink dark:text-white text-xs uppercase tracking-wider font-narrow">
                  Lien Google Photos / Flickr
                </h4>
              </div>
              <p className="text-ink-3 dark:text-snow-3 text-xs leading-relaxed">
                Collez l&apos;URL publique de votre album partagé. Les membres pourront ouvrir en 1 clic l&apos;album complet et télécharger les photos de leur peloton en pleine qualité.
              </p>
            </div>

            <div className="p-3.5 rounded-md border border-line dark:border-night-line bg-paper dark:bg-night space-y-2">
              <div className="flex items-center gap-2">
                <PhotoIcon className="h-4 w-4 text-vert" />
                <h4 className="font-bold text-ink dark:text-white text-xs uppercase tracking-wider font-narrow">
                  Compteur de Photos
                </h4>
              </div>
              <p className="text-ink-3 dark:text-snow-3 text-xs leading-relaxed">
                Indiquez le nombre approximatif de photos (ex. <em>45 photos</em>) pour signaler la richesse de l&apos;album aux visiteurs du site.
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'featured',
      label: '3. Mise en Avant & Accueil',
      badge: 'Avancé',
      icon: SparklesIcon,
      content: (
        <div className="space-y-4">
          <div className="rounded-md border border-line dark:border-night-line bg-paper-2 dark:bg-night-2 p-4 text-xs sm:text-sm text-ink dark:text-snow leading-relaxed">
            Valorisez les temps forts de la saison sur la page d&apos;accueil du site public :
          </div>

          <div className="p-3.5 rounded-md border border-ambre/30 bg-ambre/5 space-y-2">
            <div className="flex items-center gap-2">
              <SparklesIcon className="h-4 w-4 text-ambre" />
              <h4 className="font-bold text-ink dark:text-white text-xs uppercase tracking-wider font-narrow">
                Option « Album à la une »
              </h4>
            </div>
            <p className="text-ink-3 dark:text-snow-3 text-xs leading-relaxed">
              En cochant cette option, l&apos;album bénéficie d&apos;un bandeau doré prestigieux et apparaît en tête de liste dans les encarts visuels du club.
            </p>
          </div>

          <div className="rounded-md border border-line dark:border-night-line bg-paper dark:bg-night p-4 flex items-start gap-3">
            <LightBulbIcon className="h-5 w-5 text-ambre shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold text-ink dark:text-white text-xs">Conseil de modération :</span>
              <p className="text-xs text-ink-3 dark:text-snow-3 leading-relaxed">
                Veillez à ce que les coureurs figurant en gros plan soient consentants pour la diffusion publique sur le site du club (respect du droit à l&apos;image).
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
      title="Guide des Galeries Photos"
      badge="Médias Club"
      subtitle="Publiez les reportages photographiques des sorties, reliez des albums HD et mettez en avant les exploits."
      icon={CameraIcon}
      iconColorClass="bg-hydro/10 text-hydro border-hydro/30"
      tabs={tabs}
      tourButtonLabel="Lancer la visite interactive"
    />
  );
}
