'use client';

import React from 'react';
import {
  BookOpenIcon,
  DocumentTextIcon,
  ListBulletIcon,
  TagIcon,
  LightBulbIcon,
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
      label: '1. Étapes de Création',
      icon: DocumentTextIcon,
      content: (
        <div className="space-y-4">
          <div className="rounded-lg border border-[#262b38] bg-[#161922] p-4 text-[#a7adbb] leading-relaxed">
            Créer un article sur le site du CC Saint-Martin Blanmont se fait en 5 étapes rapides. L’éditeur prend en charge la mise en forme riche et l’optimisation automatique des photos.
          </div>

          <div className="space-y-4">
            {[
              {
                num: 1,
                title: 'Définir le Titre & la Catégorie',
                desc: 'Choisissez un titre évocateur (ex. « Récit de la sortie fléchée à Villers-la-Ville ») et sélectionnez la thématique correspondante.',
              },
              {
                num: 2,
                title: 'Rédiger l’Extrait (Chapeau)',
                desc: 'L’extrait est le résumé de 1 à 2 phrases affiché sur la page d’accueil et lors du partage de liens. Il doit susciter la curiosité.',
              },
              {
                num: 3,
                title: 'Ajouter une Image de Couverture',
                desc: 'Téléversez une photo haute définition prise lors de la sortie (format paysage conseillé 16:9). Elle illustrera fièrement la tête de l’article.',
              },
              {
                num: 4,
                title: 'Composer le Corps de Texte',
                desc: 'Utilisez l’éditeur WYSIWYG pour structurer avec des sous-titres H2/H3, mettre des passages en gras, insérer des listes et ajouter des liens vers des traces GPX.',
              },
              {
                num: 5,
                title: 'Publier ou Enregistrer en Brouillon',
                desc: 'Laissez « Publier immédiatement » coché pour rendre l’article accessible au peloton, ou décochez pour le relire ultérieurement.',
              },
            ].map((step) => (
              <div
                key={step.num}
                className="flex items-start gap-3.5 p-3.5 rounded-lg border border-[#262b38] bg-[#161922]"
              >
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#e03e3e] text-white font-extrabold text-xs">
                  {step.num}
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-white text-sm">{step.title}</h4>
                  <p className="text-[#a7adbb] text-xs leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ),
    },
    {
      id: 'formatting',
      label: '2. Mise en Page & Médias',
      icon: ListBulletIcon,
      content: (
        <div className="space-y-4">
          <div className="rounded-lg border border-[#262b38] bg-[#161922] p-4 text-xs text-[#a7adbb] space-y-2">
            <div className="font-bold text-white uppercase tracking-wider">
              Outils disponibles dans la barre d’édition :
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="p-2.5 rounded bg-[#0a0c10] border border-[#262b38] space-y-1">
                <span className="font-bold text-white text-xs">Titres H2 &amp; H3</span>
                <p className="text-[#5c6370] text-xs">Idéal pour découper les longs récits en sections lisibles.</p>
              </div>
              <div className="p-2.5 rounded bg-[#0a0c10] border border-[#262b38] space-y-1">
                <span className="font-bold text-white text-xs">Listes à puces &amp; numérotées</span>
                <p className="text-[#5c6370] text-xs">Pour lister les consignes, les horaires ou les inscrits.</p>
              </div>
              <div className="p-2.5 rounded bg-[#0a0c10] border border-[#262b38] space-y-1">
                <span className="font-bold text-white text-xs">Liens externes &amp; GPX</span>
                <p className="text-[#5c6370] text-xs">Liez directement vers des parcours Strava, Komoot ou Google Maps.</p>
              </div>
              <div className="p-2.5 rounded bg-[#0a0c10] border border-[#262b38] space-y-1">
                <span className="font-bold text-white text-xs">Images intégrées</span>
                <p className="text-[#5c6370] text-xs">Insérez des visuels et photos au fil du texte.</p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-[#262b38] bg-[#161922] p-4 flex items-start gap-3">
            <LightBulbIcon className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold text-white text-xs">Conseil de lisibilité :</span>
              <p className="text-xs text-[#a7adbb]">
                Privilégiez des paragraphes de 3 à 4 phrases maximum pour un confort de lecture optimal sur smartphone.
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'guidelines',
      label: '3. Ligne Éditoriale',
      icon: TagIcon,
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-lg border border-[#262b38] bg-[#161922] space-y-1.5">
              <span className="rounded-full bg-[#e03e3e]/20 text-[#e03e3e] border border-[#e03e3e]/40 px-2 py-0.5 text-xs font-bold uppercase tracking-wider">
                Actualités
              </span>
              <h4 className="font-bold text-white text-xs">Nouvelles du club</h4>
              <p className="text-[#a7adbb] text-xs">
                Assemblées générales, mot du président, cotisations et informations officielles.
              </p>
            </div>

            <div className="p-3.5 rounded-lg border border-[#262b38] bg-[#161922] space-y-1.5">
              <span className="rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-2 py-0.5 text-xs font-bold uppercase tracking-wider">
                Récits de sortie
              </span>
              <h4 className="font-bold text-white text-xs">Chroniques du weekend</h4>
              <p className="text-[#a7adbb] text-xs">
                Comptes-rendus des sorties du samedi, exploits sur les brevets et anecdotes du peloton.
              </p>
            </div>

            <div className="p-3.5 rounded-lg border border-[#262b38] bg-[#161922] space-y-1.5">
              <span className="rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 px-2 py-0.5 text-xs font-bold uppercase tracking-wider">
                Conseils
              </span>
              <h4 className="font-bold text-white text-xs">Guide &amp; Entraînement</h4>
              <p className="text-[#a7adbb] text-xs">
                Entretien du vélo, nutrition sportive, sécurité en groupe et conseils mécaniques.
              </p>
            </div>

            <div className="p-3.5 rounded-lg border border-[#262b38] bg-[#161922] space-y-1.5">
              <span className="rounded-full bg-sky-500/20 text-sky-400 border border-sky-500/40 px-2 py-0.5 text-xs font-bold uppercase tracking-wider">
                Événements
              </span>
              <h4 className="font-bold text-white text-xs">Brevets &amp; Voyages</h4>
              <p className="text-[#a7adbb] text-xs">
                Présentation des voyages club (ex. stage de printemps, séjour montagne) et des grands rendez-vous.
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
      icon={BookOpenIcon}
      tabs={tabs}
      tourButtonLabel="Lancer la visite interactive"
    />
  );
}
