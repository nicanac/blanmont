'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  XMarkIcon,
  MapIcon,
  PlayIcon,
  PlusIcon,
  CloudArrowUpIcon,
  DocumentArrowUpIcon,
  DevicePhoneMobileIcon,
  LightBulbIcon,
} from '@heroicons/react/24/outline';

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
  const [activeTab, setActiveTab] = useState<'catalog' | 'import' | 'usage'>('catalog');

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
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-amber-500/20 text-amber-400 border border-amber-500/40">
              <MapIcon className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold uppercase tracking-tight text-white">
                  Guide des Traces &amp; Parcours GPS
                </h2>
                <span className="text-[0.6875rem] font-bold uppercase tracking-wider rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 px-2 py-0.5">
                  Itinéraires
                </span>
              </div>
              <p className="text-xs text-[#a7adbb]">
                Gestion du catalogue de parcours, imports GPX, Strava et calculs altimétriques
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
            onClick={() => setActiveTab('catalog')}
            className={`flex items-center gap-2 border-b-2 py-3 px-3 text-xs font-bold uppercase tracking-wider transition-colors whitespace-nowrap ${
              activeTab === 'catalog'
                ? 'border-amber-400 text-white'
                : 'border-transparent text-[#7d8493] hover:text-white'
            }`}
          >
            <MapIcon className="h-4 w-4 text-amber-400" />
            <span>1. Le Catalogue de Traces</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('import')}
            className={`flex items-center gap-2 border-b-2 py-3 px-3 text-xs font-bold uppercase tracking-wider transition-colors whitespace-nowrap ${
              activeTab === 'import'
                ? 'border-amber-400 text-white'
                : 'border-transparent text-[#7d8493] hover:text-white'
            }`}
          >
            <DocumentArrowUpIcon className="h-4 w-4 text-emerald-400" />
            <span>2. Méthodes d&apos;Importation</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('usage')}
            className={`flex items-center gap-2 border-b-2 py-3 px-3 text-xs font-bold uppercase tracking-wider transition-colors whitespace-nowrap ${
              activeTab === 'usage'
                ? 'border-amber-400 text-white'
                : 'border-transparent text-[#7d8493] hover:text-white'
            }`}
          >
            <DevicePhoneMobileIcon className="h-4 w-4 text-sky-400" />
            <span>3. Compteurs &amp; Sondages</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="p-6 max-h-[60vh] overflow-y-auto space-y-6 text-xs sm:text-sm">
          {/* TAB 1: CATALOG */}
          {activeTab === 'catalog' && (
            <div className="space-y-4">
              <div className="rounded-lg border border-[#262b38] bg-[#161922] p-4 text-[#a7adbb] leading-relaxed">
                Le CC Saint-Martin Blanmont dispose d&apos;une riche collection de parcours traversant le Brabant wallon, le Namurois et la Hesbaye.
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-lg border border-[#262b38] bg-[#161922] space-y-1">
                  <h4 className="font-bold text-white text-xs">Profil &amp; Dénivelé D+</h4>
                  <p className="text-[#a7adbb] text-xs">
                    Chaque trace calcule automatiquement le dénivelé positif cumulé et le profil de relief pour adapter le choix de sortie au niveau du groupe.
                  </p>
                </div>

                <div className="p-3.5 rounded-lg border border-[#262b38] bg-[#161922] space-y-1">
                  <h4 className="font-bold text-white text-xs">Cartographie Interactive</h4>
                  <p className="text-[#a7adbb] text-xs">
                    Les tracés sont visualisables en plein écran avec zoom sur les carrefours clés et points d&apos;eau/ravito.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: IMPORT */}
          {activeTab === 'import' && (
            <div className="space-y-4">
              <div className="space-y-3">
                <div className="p-3.5 rounded-lg border border-[#262b38] bg-[#161922] space-y-1">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                    <DocumentArrowUpIcon className="h-4 w-4" />
                    <span>Import de fichier .GPX</span>
                  </div>
                  <p className="text-[#a7adbb] text-xs">
                    Glissez-déposez n&apos;importe quel fichier GPX (Openrunner, Komoot, Strava, RideWithGPS) : les coordonnées et altitudes sont extraites automatiquement.
                  </p>
                </div>

                <div className="p-3.5 rounded-lg border border-[#262b38] bg-[#161922] space-y-1">
                  <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
                    <CloudArrowUpIcon className="h-4 w-4" />
                    <span>Synchronisation Strava API</span>
                  </div>
                  <p className="text-[#a7adbb] text-xs">
                    Connectez votre compte Strava pour importer directement l&apos;une de vos activités récentes comme nouveau parcours officiel.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: USAGE */}
          {activeTab === 'usage' && (
            <div className="space-y-4">
              <div className="rounded-lg border border-[#262b38] bg-[#161922] p-4 text-[#a7adbb] leading-relaxed">
                Les membres peuvent télécharger les traces au format GPX pour les envoyer vers leurs compteurs Garmin Edge, Wahoo ELEMNT ou Hammerhead Karoo.
              </div>

              <div className="rounded-lg border border-[#262b38] bg-[#161922] p-4 flex items-start gap-3">
                <LightBulbIcon className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-bold text-white text-xs">Liaison avec le Sondage du Weekend :</span>
                  <p className="text-xs text-[#a7adbb]">
                    Lors de la création du sondage hebdomadaire, vous pouvez sélectionner une trace du catalogue pour que les cyclistes votent en connaissance de cause du parcours et du dénivelé.
                  </p>
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
            <PlayIcon className="h-4 w-4 text-amber-400" />
            <span>Lancer la visite interactive</span>
          </button>

          <Link
            href="/admin/add-trace"
            onClick={onClose}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-md bg-[#e03e3e] hover:bg-[#c93434] px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-white transition-colors shadow-xs"
          >
            <PlusIcon className="h-4 w-4" />
            <span>Ajouter une Trace</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
