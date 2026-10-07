'use client';

import React from 'react';
import {
  BookOpenIcon,
  DocumentTextIcon,
  ListBulletIcon,
  TagIcon,
  LightBulbIcon,
  PhotoIcon,
  LinkIcon,
} from '@heroicons/react/24/outline';
import AdminTutorialModal from '@/app/admin/components/AdminTutorialModal';

interface BlogTutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartTour: () => void;
}

export default function BlogTutorialModal({
  isOpen,
  onClose,
  onStartTour,
}: BlogTutorialModalProps): React.ReactElement | null {
  const tabs = [
    {
      id: 'steps',
      label: '1. Rédaction & 5 Étapes',
      badge: 'Débutant',
      icon: DocumentTextIcon,
      content: (
        <div className="space-y-4">
          <div className="rounded-md border border-line dark:border-night-line bg-paper-2 dark:bg-night-2 p-4 text-xs sm:text-sm text-ink dark:text-snow leading-relaxed">
            Créer un article sur le site du CC Saint-Martin Blanmont se fait en <strong>5 étapes simples</strong>. L&apos;éditeur WYSIWYG prend en charge la mise en page riche et l&apos;optimisation automatique des photos.
          </div>

          <div className="space-y-3">
            {[
              {
                num: 1,
                title: 'Titre & Catégorie',
                desc: 'Choisissez un titre évocateur (ex. « Récit de la sortie fléchée à Villers-la-Ville ») et sélectionnez la thématique appropriée.',
              },
              {
                num: 2,
                title: 'Extrait (Chapeau d’Accroche)',
                desc: 'Rédigez un résumé de 1 à 2 phrases affiché sur la page d’accueil et lors du partage du lien sur les réseaux ou WhatsApp.',
              },
              {
                num: 3,
                title: 'Photo de Couverture',
                desc: 'Téléversez une photo prise lors de la sortie (format paysage 16:9 recommandé). Elle illustrera avec panache la tête de l’article.',
              },
              {
                num: 4,
                title: 'Corps de Texte & Récit',
                desc: 'Structurez votre récit avec des sous-titres H2/H3, mettez en gras les moments forts et insérez des liens vers les traces GPX.',
              },
              {
                num: 5,
                title: 'Publication ou Brouillon',
                desc: 'Cochez « Publier immédiatement » pour le rendre public, ou enregistrez en brouillon pour le faire relire par le président.',
              },
            ].map((step) => (
              <div
                key={step.num}
                className="flex items-start gap-3.5 p-3.5 rounded-md border border-line dark:border-night-line bg-paper dark:bg-night"
              >
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand text-white font-extrabold text-xs">
                  {step.num}
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-ink dark:text-white text-xs uppercase tracking-wider font-narrow">
                    {step.title}
                  </h4>
                  <p className="text-ink-3 dark:text-snow-3 text-xs leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ),
    },
    {
      id: 'formatting',
      label: '2. Mise en Page & Liens',
      badge: 'Confirmé',
      icon: ListBulletIcon,
      content: (
        <div className="space-y-4">
          <div className="rounded-md border border-line dark:border-night-line bg-paper-2 dark:bg-night-2 p-4 text-xs text-ink-3 dark:text-snow-3 space-y-2">
            <div className="font-bold text-ink dark:text-white uppercase tracking-wider font-narrow text-xs">
              Outils disponibles dans la barre d’édition :
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="p-2.5 rounded bg-paper dark:bg-night border border-line dark:border-night-line space-y-1">
                <span className="font-bold text-ink dark:text-white text-xs font-narrow uppercase">Titres H2 &amp; H3</span>
                <p className="text-ink-3 dark:text-snow-3 text-xs">Idéal pour aérer les longs récits de brevet ou d’assemblée générale.</p>
              </div>
              <div className="p-2.5 rounded bg-paper dark:bg-night border border-line dark:border-night-line space-y-1">
                <span className="font-bold text-ink dark:text-white text-xs font-narrow uppercase">Listes à Puces</span>
                <p className="text-ink-3 dark:text-snow-3 text-xs">Pour détailler les consignes météo, horaires de train ou le matériel à emporter.</p>
              </div>
              <div className="p-2.5 rounded bg-paper dark:bg-night border border-line dark:border-night-line space-y-1">
                <span className="font-bold text-ink dark:text-white text-xs font-narrow uppercase">Liens Traces GPX / Strava</span>
                <p className="text-ink-3 dark:text-snow-3 text-xs">Liez directement vers des parcours Strava, Komoot ou Google Maps.</p>
              </div>
              <div className="p-2.5 rounded bg-paper dark:bg-night border border-line dark:border-night-line space-y-1">
                <span className="font-bold text-ink dark:text-white text-xs font-narrow uppercase">Photos Intégrées</span>
                <p className="text-ink-3 dark:text-snow-3 text-xs">Insérez des photos d’ambiance ou de pause café au fil des paragraphes.</p>
              </div>
            </div>
          </div>

          <div className="rounded-md border border-ambre/30 bg-ambre/5 p-4 flex items-start gap-3">
            <LightBulbIcon className="h-5 w-5 text-ambre shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold text-ink dark:text-white text-xs">Conseil de lisibilité sur smartphone :</span>
              <p className="text-xs text-ink-3 dark:text-snow-3 leading-relaxed">
                Plus de 70% des membres lisent le blog depuis leur téléphone. Privilégiez des paragraphes de 3 à 4 phrases maximum pour un confort de lecture optimal.
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'guidelines',
      label: '3. Ligne Éditoriale',
      badge: 'Avancé',
      icon: TagIcon,
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-md border border-brand/30 bg-brand/5 space-y-1.5">
              <span className="rounded-full bg-brand/20 text-brand border border-brand/30 px-2 py-0.5 text-xs font-bold uppercase tracking-wider font-narrow">
                Actualités
              </span>
              <h4 className="font-bold text-ink dark:text-white text-xs uppercase font-narrow">Nouvelles Officielles</h4>
              <p className="text-ink-3 dark:text-snow-3 text-xs leading-relaxed">
                Assemblées générales, mot du président, cotisations annuelles et informations institutionnelles.
              </p>
            </div>

            <div className="p-3.5 rounded-md border border-vert/30 bg-vert/5 space-y-1.5">
              <span className="rounded-full bg-vert/20 text-vert dark:text-vert-strong border border-vert/30 px-2 py-0.5 text-xs font-bold uppercase tracking-wider font-narrow">
                Récits de sortie
              </span>
              <h4 className="font-bold text-ink dark:text-white text-xs uppercase font-narrow">Chroniques du Weekend</h4>
              <p className="text-ink-3 dark:text-snow-3 text-xs leading-relaxed">
                Comptes-rendus des sorties du samedi, exploits sur les brevets régionaux et anecdotes du peloton.
              </p>
            </div>

            <div className="p-3.5 rounded-md border border-ambre/30 bg-ambre/5 space-y-1.5">
              <span className="rounded-full bg-ambre/20 text-ambre border border-ambre/30 px-2 py-0.5 text-xs font-bold uppercase tracking-wider font-narrow">
                Conseils
              </span>
              <h4 className="font-bold text-ink dark:text-white text-xs uppercase font-narrow">Guide &amp; Entraînement</h4>
              <p className="text-ink-3 dark:text-snow-3 text-xs leading-relaxed">
                Entretien du vélo, nutrition sportive, sécurité en groupe et conseils mécaniques utiles.
              </p>
            </div>

            <div className="p-3.5 rounded-md border border-hydro/30 bg-hydro/5 space-y-1.5">
              <span className="rounded-full bg-hydro/20 text-hydro border border-hydro/30 px-2 py-0.5 text-xs font-bold uppercase tracking-wider font-narrow">
                Événements
              </span>
              <h4 className="font-bold text-ink dark:text-white text-xs uppercase font-narrow">Stages &amp; Voyages Club</h4>
              <p className="text-ink-3 dark:text-snow-3 text-xs leading-relaxed">
                Présentation des voyages club (stage de printemps en Espagne ou séjour montagne) et grands brevets.
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
      title="Guide de Rédaction & Publication"
      badge="Les News"
      subtitle="Rédigez des articles captivants pour les coureurs, structurez votre texte et illustrez les sorties."
      icon={BookOpenIcon}
      iconColorClass="bg-brand/10 text-brand border-brand/30"
      tabs={tabs}
      tourButtonLabel="Lancer la visite interactive"
    />
  );
}
