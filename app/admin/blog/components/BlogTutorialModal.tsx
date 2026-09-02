'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  XMarkIcon,
  BookOpenIcon,
  PlayIcon,
  PlusIcon,
  DocumentTextIcon,
  ListBulletIcon,
  TagIcon,
  LightBulbIcon,
} from '@heroicons/react/24/outline';

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
  const [activeTab, setActiveTab] = useState<'steps' | 'formatting' | 'guidelines'>('steps');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent): void => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-3xl rounded-xl border border-[#262b38] bg-[#0a0c10] text-white shadow-2xl overflow-hidden z-10 my-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#262b38] px-6 py-4 bg-[#161922]">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[#e03e3e]/20 text-[#e03e3e] border border-[#e03e3e]/40">
              <BookOpenIcon className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold uppercase tracking-tight text-white">
                  Guide de Rédaction &amp; Publication
                </h2>
                <span className="text-[0.6875rem] font-bold uppercase tracking-wider rounded-full bg-[#e03e3e]/20 text-[#e03e3e] border border-[#e03e3e]/40 px-2 py-0.5">
                  Tutoriel
                </span>
              </div>
              <p className="text-xs text-[#a7adbb]">
                Comment rédiger et publier un article captivant pour le club
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1.5 text-[#7d8493] hover:bg-white/10 hover:text-white transition-colors"
          >
            <span className="sr-only">Fermer</span>
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-[#262b38] bg-[#101216] px-6 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('steps')}
            className={`flex items-center gap-2 border-b-2 py-3 px-3 text-xs font-bold uppercase tracking-wider transition-colors whitespace-nowrap ${
              activeTab === 'steps'
                ? 'border-[#e03e3e] text-white'
                : 'border-transparent text-[#7d8493] hover:text-white'
            }`}
          >
            <DocumentTextIcon className="h-4 w-4" />
            <span>1. Étapes de Création</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('formatting')}
            className={`flex items-center gap-2 border-b-2 py-3 px-3 text-xs font-bold uppercase tracking-wider transition-colors whitespace-nowrap ${
              activeTab === 'formatting'
                ? 'border-[#e03e3e] text-white'
                : 'border-transparent text-[#7d8493] hover:text-white'
            }`}
          >
            <ListBulletIcon className="h-4 w-4" />
            <span>2. Mise en Page &amp; Médias</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('guidelines')}
            className={`flex items-center gap-2 border-b-2 py-3 px-3 text-xs font-bold uppercase tracking-wider transition-colors whitespace-nowrap ${
              activeTab === 'guidelines'
                ? 'border-[#e03e3e] text-white'
                : 'border-transparent text-[#7d8493] hover:text-white'
            }`}
          >
            <TagIcon className="h-4 w-4" />
            <span>3. Ligne Éditoriale</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="p-6 max-h-[60vh] overflow-y-auto space-y-6 text-xs sm:text-sm">
          {/* TAB 1: STEPS */}
          {activeTab === 'steps' && (
            <div className="space-y-4">
              <div className="rounded-lg border border-[#262b38] bg-[#161922] p-4 text-[#a7adbb] leading-relaxed">
                Créer un article sur le site du CC Saint-Martin Blanmont se fait en 5 étapes rapides. L’éditeur prend en charge la mise en forme riche et l’optimisation automatique des photos.
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3.5 p-3.5 rounded-lg border border-[#262b38] bg-[#161922]">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#e03e3e] text-white font-extrabold text-xs">
                    1
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-white text-sm">Définir le Titre &amp; la Catégorie</h4>
                    <p className="text-[#a7adbb] text-xs leading-relaxed">
                      Choisissez un titre évocateur (ex. <em>&laquo; Récit de la sortie fléchée à Villers-la-Ville &raquo;</em>) et sélectionnez la thématique correspondante.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 p-3.5 rounded-lg border border-[#262b38] bg-[#161922]">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#e03e3e] text-white font-extrabold text-xs">
                    2
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-white text-sm">Rédiger l&apos;Extrait (Chapeau)</h4>
                    <p className="text-[#a7adbb] text-xs leading-relaxed">
                      L&apos;extrait est le résumé de 1 à 2 phrases affiché sur la page d&apos;accueil, dans les listes et lors du partage de liens. Il doit susciter la curiosité.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 p-3.5 rounded-lg border border-[#262b38] bg-[#161922]">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#e03e3e] text-white font-extrabold text-xs">
                    3
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-white text-sm">Ajouter une Image de Couverture</h4>
                    <p className="text-[#a7adbb] text-xs leading-relaxed">
                      Téléversez une photo haute définition prise lors de la sortie (format paysage conseillé 16:9). Elle illustrera fièrement la tête de l&apos;article.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 p-3.5 rounded-lg border border-[#262b38] bg-[#161922]">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#e03e3e] text-white font-extrabold text-xs">
                    4
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-white text-sm">Composer le Corps de Texte</h4>
                    <p className="text-[#a7adbb] text-xs leading-relaxed">
                      Utilisez l&apos;éditeur WYSIWYG pour structurer avec des sous-titres H2/H3, mettre des passages en gras, insérer des listes et ajouter des liens vers des traces GPX.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 p-3.5 rounded-lg border border-[#262b38] bg-[#161922]">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#e03e3e] text-white font-extrabold text-xs">
                    5
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-white text-sm">Publier ou Enregistrer en Brouillon</h4>
                    <p className="text-[#a7adbb] text-xs leading-relaxed">
                      Laissez &laquo; Publier immédiatement &raquo; coché pour rendre l&apos;article accessible au peloton, ou décochez pour le relire ultérieurement.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: FORMATTING */}
          {activeTab === 'formatting' && (
            <div className="space-y-4">
              <div className="rounded-lg border border-[#262b38] bg-[#161922] p-4 text-xs text-[#a7adbb] space-y-2">
                <div className="font-bold text-white uppercase tracking-wider">Outils disponibles dans la barre d&apos;édition :</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="p-2.5 rounded bg-[#0a0c10] border border-[#262b38] space-y-1">
                    <span className="font-bold text-white text-xs">Titres H2 &amp; H3</span>
                    <p className="text-[#7d8493] text-[0.6875rem]">Idéal pour découper les longs récits en sections lisibles.</p>
                  </div>
                  <div className="p-2.5 rounded bg-[#0a0c10] border border-[#262b38] space-y-1">
                    <span className="font-bold text-white text-xs">Listes à puces &amp; numérotées</span>
                    <p className="text-[#7d8493] text-[0.6875rem]">Pour lister les consignes, les horaires ou les inscrits.</p>
                  </div>
                  <div className="p-2.5 rounded bg-[#0a0c10] border border-[#262b38] space-y-1">
                    <span className="font-bold text-white text-xs">Liens externes &amp; GPX</span>
                    <p className="text-[#7d8493] text-[0.6875rem]">Liez directement vers des parcours Strava, Komoot ou Google Maps.</p>
                  </div>
                  <div className="p-2.5 rounded bg-[#0a0c10] border border-[#262b38] space-y-1">
                    <span className="font-bold text-white text-xs">Images intégrées</span>
                    <p className="text-[#7d8493] text-[0.6875rem]">Insérez des visuels et photos au fil du texte.</p>
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
          )}

          {/* TAB 3: GUIDELINES */}
          {activeTab === 'guidelines' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-lg border border-[#262b38] bg-[#161922] space-y-1.5">
                  <span className="rounded-full bg-[#e03e3e]/20 text-[#e03e3e] border border-[#e03e3e]/40 px-2 py-0.5 text-[0.6875rem] font-bold uppercase tracking-wider">
                    Actualités
                  </span>
                  <h4 className="font-bold text-white text-xs">Nouvelles du club</h4>
                  <p className="text-[#a7adbb] text-xs">Assemblées générales, mot du président, cotisations et informations officielles.</p>
                </div>

                <div className="p-3.5 rounded-lg border border-[#262b38] bg-[#161922] space-y-1.5">
                  <span className="rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-2 py-0.5 text-[0.6875rem] font-bold uppercase tracking-wider">
                    Récits de sortie
                  </span>
                  <h4 className="font-bold text-white text-xs">Chroniques du weekend</h4>
                  <p className="text-[#a7adbb] text-xs">Comptes-rendus des sorties du samedi, exploits sur les brevets et anecdotes du peloton.</p>
                </div>

                <div className="p-3.5 rounded-lg border border-[#262b38] bg-[#161922] space-y-1.5">
                  <span className="rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 px-2 py-0.5 text-[0.6875rem] font-bold uppercase tracking-wider">
                    Conseils
                  </span>
                  <h4 className="font-bold text-white text-xs">Guide &amp; Entraînement</h4>
                  <p className="text-[#a7adbb] text-xs">Entretien du vélo, nutrition sportive, sécurité en groupe et conseils mécaniques.</p>
                </div>

                <div className="p-3.5 rounded-lg border border-[#262b38] bg-[#161922] space-y-1.5">
                  <span className="rounded-full bg-sky-500/20 text-sky-400 border border-sky-500/40 px-2 py-0.5 text-[0.6875rem] font-bold uppercase tracking-wider">
                    Événements
                  </span>
                  <h4 className="font-bold text-white text-xs">Brevets &amp; Voyages</h4>
                  <p className="text-[#a7adbb] text-xs">Présentation des voyages club (ex. stage de printemps, séjour montagne) et des grands rendez-vous.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between border-t border-[#262b38] bg-[#161922] px-6 py-4 gap-3">
          <button
            type="button"
            onClick={() => {
              onClose();
              onStartTour();
            }}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-md border border-[#262b38] bg-[#0a0c10] hover:bg-white/10 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-white transition-colors"
          >
            <PlayIcon className="h-4 w-4 text-[#e03e3e]" />
            <span>Lancer la visite interactive (Tour)</span>
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <Link
              href="/admin/blog/new"
              onClick={onClose}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-md bg-[#e03e3e] hover:bg-[#c93434] px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-white transition-colors shadow-xs"
            >
              <PlusIcon className="h-4 w-4" />
              <span>Créer un article maintenant</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
