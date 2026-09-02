'use client';

import React, { useState, useEffect } from 'react';
import {
  XMarkIcon,
  ChartBarIcon,
  PlayIcon,
  TrophyIcon,
  ArrowTrendingUpIcon,
  LightBulbIcon,
} from '@heroicons/react/24/outline';

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
  const [activeTab, setActiveTab] = useState<'metrics' | 'evolution' | 'reports'>('metrics');

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
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-purple-500/20 text-purple-400 border border-purple-500/40">
              <ChartBarIcon className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold uppercase tracking-tight text-white">
                  Guide des Statistiques &amp; Analyses
                </h2>
                <span className="text-[0.6875rem] font-bold uppercase tracking-wider rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/40 px-2 py-0.5">
                  Analytics
                </span>
              </div>
              <p className="text-xs text-[#a7adbb]">
                Mesure de l&apos;activité du club, dynamisme des groupes et bilans de saison
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
            onClick={() => setActiveTab('metrics')}
            className={`flex items-center gap-2 border-b-2 py-3 px-3 text-xs font-bold uppercase tracking-wider transition-colors whitespace-nowrap ${
              activeTab === 'metrics'
                ? 'border-purple-400 text-white'
                : 'border-transparent text-[#7d8493] hover:text-white'
            }`}
          >
            <ChartBarIcon className="h-4 w-4 text-purple-400" />
            <span>1. Indicateurs Clés</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('evolution')}
            className={`flex items-center gap-2 border-b-2 py-3 px-3 text-xs font-bold uppercase tracking-wider transition-colors whitespace-nowrap ${
              activeTab === 'evolution'
                ? 'border-purple-400 text-white'
                : 'border-transparent text-[#7d8493] hover:text-white'
            }`}
          >
            <ArrowTrendingUpIcon className="h-4 w-4 text-emerald-400" />
            <span>2. Graphiques &amp; Groupes</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('reports')}
            className={`flex items-center gap-2 border-b-2 py-3 px-3 text-xs font-bold uppercase tracking-wider transition-colors whitespace-nowrap ${
              activeTab === 'reports'
                ? 'border-purple-400 text-white'
                : 'border-transparent text-[#7d8493] hover:text-white'
            }`}
          >
            <TrophyIcon className="h-4 w-4 text-amber-400" />
            <span>3. Bilans d&apos;Assemblée Générale</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="p-6 max-h-[60vh] overflow-y-auto space-y-6 text-xs sm:text-sm">
          {/* TAB 1: METRICS */}
          {activeTab === 'metrics' && (
            <div className="space-y-4">
              <div className="rounded-lg border border-[#262b38] bg-[#161922] p-4 text-[#a7adbb] leading-relaxed">
                Ce tableau de bord agrège l&apos;ensemble des données de participation issues des pointages Carré Vert et des sorties officielles.
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-lg border border-[#262b38] bg-[#161922] space-y-1">
                  <h4 className="font-bold text-white text-xs">Membres Actifs &amp; Taux d&apos;Engagement</h4>
                  <p className="text-[#a7adbb] text-xs">
                    Pourcentage d&apos;adhérents ayant participé à au moins une sortie sur l&apos;année sélectionnée.
                  </p>
                </div>

                <div className="p-3.5 rounded-lg border border-[#262b38] bg-[#161922] space-y-1">
                  <h4 className="font-bold text-white text-xs">Moyenne de Sorties / Cycliste</h4>
                  <p className="text-[#a7adbb] text-xs">
                    Régularité moyenne des cyclistes pour mesurer l&apos;assiduité globale du peloton.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: EVOLUTION */}
          {activeTab === 'evolution' && (
            <div className="space-y-4">
              <div className="rounded-lg border border-[#262b38] bg-[#161922] p-4 text-[#a7adbb] leading-relaxed">
                Les graphiques interactifs permettent de comparer la fréquentation selon les saisons et les groupes de niveau.
              </div>

              <div className="space-y-3">
                <div className="p-3.5 rounded-lg border border-[#262b38] bg-[#161922] space-y-1">
                  <h4 className="font-bold text-white text-xs">Répartition par Groupe (A, B, C, VTT)</h4>
                  <p className="text-[#a7adbb] text-xs">
                    Diagramme circulaire représentant les effectifs respectifs des différents pelotons de vitesse.
                  </p>
                </div>

                <div className="p-3.5 rounded-lg border border-[#262b38] bg-[#161922] space-y-1">
                  <h4 className="font-bold text-white text-xs">Activité Hebdomadaire</h4>
                  <p className="text-[#a7adbb] text-xs">
                    Histogramme montrant les pics de participation (beaux jours printaniers, week-ends de brevets).
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: REPORTS */}
          {activeTab === 'reports' && (
            <div className="space-y-4">
              <div className="rounded-lg border border-[#262b38] bg-[#161922] p-4 text-[#a7adbb] leading-relaxed">
                Ces chiffres alimentent le <strong>rapport moral et sportif</strong> présenté par le comité lors de l&apos;Assemblée Générale annuelle.
              </div>

              <div className="rounded-lg border border-[#262b38] bg-[#161922] p-4 flex items-start gap-3">
                <LightBulbIcon className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
                <p className="text-xs text-[#a7adbb]">
                  Changez l&apos;année dans le sélecteur en haut à droite pour comparer l&apos;évolution de la participation d&apos;une saison à l&apos;autre.
                </p>
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
            <PlayIcon className="h-4 w-4 text-purple-400" />
            <span>Lancer la visite interactive</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto inline-flex items-center justify-center rounded-md bg-purple-600 hover:bg-purple-700 px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-white transition-colors shadow-xs"
          >
            <span>Fermer le guide</span>
          </button>
        </div>
      </div>
    </div>
  );
}
