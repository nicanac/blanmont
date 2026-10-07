'use client';

import React from 'react';
import {
  WindowIcon,
  PhotoIcon,
  SparklesIcon,
  MapPinIcon,
  ArrowsUpDownIcon,
  AdjustmentsHorizontalIcon,
  LightBulbIcon,
  CheckBadgeIcon,
} from '@heroicons/react/24/outline';
import AdminTutorialModal from '@/app/admin/components/AdminTutorialModal';

interface HeroTutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartTour?: () => void;
}

export default function HeroTutorialModal({
  isOpen,
  onClose,
  onStartTour,
}: HeroTutorialModalProps): React.ReactElement | null {
  const tabs = [
    {
      id: 'preview_slides',
      label: '1. Diaporama & Aperçu',
      badge: 'Débutant',
      icon: PhotoIcon,
      content: (
        <div className="space-y-4">
          <div className="rounded-md border border-line dark:border-night-line bg-paper-2 dark:bg-night-2 p-4 text-xs sm:text-sm text-ink dark:text-snow leading-relaxed">
            La <strong>bannière d&apos;accueil</strong> est la première impression offerte aux visiteurs et aux futurs membres sur <span className="font-mono text-brand text-xs">/</span>. Elle combine un diaporama immersif grand angle et un cartouche de télémétrie du peloton.
          </div>

          <div className="space-y-3">
            <div className="p-3.5 rounded-md border border-line dark:border-night-line bg-paper dark:bg-night space-y-1.5">
              <h4 className="font-bold text-ink dark:text-white text-xs uppercase tracking-wider font-narrow">
                Aperçu en Direct WYSIWYG
              </h4>
              <p className="text-ink-3 dark:text-snow-3 text-xs leading-relaxed">
                Le bloc supérieur reflète en temps réel le rendu exact sur le site public : titre, sous-titre, badge thématique et bouton d&apos;action (CTA).
              </p>
            </div>

            <div className="p-3.5 rounded-md border border-line dark:border-night-line bg-paper dark:bg-night space-y-1.5">
              <h4 className="font-bold text-ink dark:text-white text-xs uppercase tracking-wider font-narrow">
                Bouton d&apos;Appel à l&apos;Action (CTA)
              </h4>
              <p className="text-ink-3 dark:text-snow-3 text-xs leading-relaxed">
                Chaque diapositive dispose d&apos;un lien d&apos;action ciblé (ex. <em>« Rejoindre le Club »</em> vers <span className="font-mono text-xs">/rejoindre</span> ou <em>« Consulter le Calendrier »</em> vers <span className="font-mono text-xs">/le-club/calendrier</span>).
              </p>
            </div>
          </div>

          <div className="rounded-md border border-vert/30 bg-vert/5 p-4 flex items-start gap-3">
            <LightBulbIcon className="h-5 w-5 text-vert shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold text-ink dark:text-white text-xs">Conseil pour débuter :</span>
              <p className="text-xs text-ink-3 dark:text-snow-3 leading-relaxed">
                Conservez entre 2 et 4 diapositives actives pour un défilement fluide sans surcharger l&apos;attention des visiteurs.
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'crop_ratio',
      label: '2. Recadrage 21:9 & Visages',
      badge: 'Confirmé',
      icon: SparklesIcon,
      content: (
        <div className="space-y-4">
          <div className="rounded-md border border-line dark:border-night-line bg-paper-2 dark:bg-night-2 p-4 text-xs sm:text-sm text-ink dark:text-snow leading-relaxed">
            La charte visuelle <strong>La Feuille de Blanmont</strong> utilise un ratio panoramique cinéma <span className="font-mono font-bold text-xs text-brand">21:9</span> pour une immersion cartographique maximale.
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-md border border-line dark:border-night-line bg-paper dark:bg-night space-y-2">
              <div className="flex items-center gap-2">
                <AdjustmentsHorizontalIcon className="h-4 w-4 text-hydro" />
                <h4 className="font-bold text-ink dark:text-white text-xs uppercase tracking-wider font-narrow">
                  Alignement Vertical Rapide
                </h4>
              </div>
              <p className="text-ink-3 dark:text-snow-3 text-xs leading-relaxed">
                Utilisez les préréglages <em>Haut (visages)</em>, <em>Centre</em> ou <em>Bas (vélos)</em> pour centrer le point focal de l&apos;image sans devoir la retéléverser.
              </p>
            </div>

            <div className="p-3.5 rounded-md border border-line dark:border-night-line bg-paper dark:bg-night space-y-2">
              <div className="flex items-center gap-2">
                <SparklesIcon className="h-4 w-4 text-brand" />
                <h4 className="font-bold text-ink dark:text-white text-xs uppercase tracking-wider font-narrow">
                  Outil de Recadrage 21:9
                </h4>
              </div>
              <p className="text-ink-3 dark:text-snow-3 text-xs leading-relaxed">
                Cliquez sur « Recadrer » pour zoomer et recadrer au millimètre directement dans le navigateur avant l&apos;envoi automatique sur Cloudinary.
              </p>
            </div>
          </div>

          <div className="rounded-md border border-ambre/30 bg-ambre/5 p-4 flex items-start gap-3">
            <LightBulbIcon className="h-5 w-5 text-ambre shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold text-ink dark:text-white text-xs">Résolution recommandée :</span>
              <p className="text-xs text-ink-3 dark:text-snow-3 leading-relaxed">
                Importez des clichés d&apos;au minimum 1920×1080 pixels au format paysage pour garantir une netteté cristalline sur les écrans Retina et 4K.
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'telemetry_ordering',
      label: '3. Télémétrie & Ordre',
      badge: 'Avancé',
      icon: MapPinIcon,
      content: (
        <div className="space-y-4">
          <div className="rounded-md border border-line dark:border-night-line bg-paper-2 dark:bg-night-2 p-4 text-xs sm:text-sm text-ink dark:text-snow leading-relaxed">
            Sous les photos de la bannière se déploient les <strong>vignettes de télémétrie du club</strong>, renseignant les détails opérationnels clés.
          </div>

          <div className="space-y-3">
            <div className="p-3.5 rounded-md border border-line dark:border-night-line bg-paper dark:bg-night space-y-1.5">
              <div className="flex items-center gap-2">
                <MapPinIcon className="h-4 w-4 text-brand" />
                <h4 className="font-bold text-ink dark:text-white text-xs uppercase tracking-wider font-narrow">
                  Vignettes de Données Clés
                </h4>
              </div>
              <p className="text-ink-3 dark:text-snow-3 text-xs leading-relaxed">
                Personnalisez le lieu de départ (Place de la Féchère), les horaires du peloton, les groupes de niveau (A, B, C, VTT) et le challenge d&apos;assiduité Carré Vert.
              </p>
            </div>

            <div className="p-3.5 rounded-md border border-line dark:border-night-line bg-paper dark:bg-night space-y-1.5">
              <div className="flex items-center gap-2">
                <ArrowsUpDownIcon className="h-4 w-4 text-vert" />
                <h4 className="font-bold text-ink dark:text-white text-xs uppercase tracking-wider font-narrow">
                  Ordonnancement &amp; Sauvegarde
                </h4>
              </div>
              <p className="text-ink-3 dark:text-snow-3 text-xs leading-relaxed">
                Utilisez les flèches monter/descendre pour déterminer la diapositive d&apos;ouverture. Dès qu&apos;une modification est apportée, le bouton <strong>« Enregistrer * »</strong> en haut à droite s&apos;illumine en rouge.
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
      title="Guide de la Bannière d'Accueil"
      badge="Vitrine Publique"
      subtitle="Maîtrisez le diaporama immersif, le cadrage panoramique 21:9 et les cartouches télémétriques."
      icon={WindowIcon}
      iconColorClass="bg-brand/10 text-brand border-brand/30"
      tabs={tabs}
      tourButtonLabel="Lancer la visite interactive"
    />
  );
}
