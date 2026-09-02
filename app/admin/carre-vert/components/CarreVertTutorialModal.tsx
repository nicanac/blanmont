'use client';

import React, { useState, useEffect } from 'react';
import {
  XMarkIcon,
  CheckBadgeIcon,
  PlayIcon,
  ArrowPathIcon,
  TableCellsIcon,
  UserGroupIcon,
  LightBulbIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';

interface CarreVertTutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartTour: () => void;
}

export default function CarreVertTutorialModal({
  isOpen,
  onClose,
  onStartTour,
}: CarreVertTutorialModalProps): React.ReactElement | null {
  const [activeTab, setActiveTab] = useState<'principles' | 'cron_sheets' | 'attendance'>('principles');

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
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
              <CheckBadgeIcon className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold uppercase tracking-tight text-white">
                  Guide du Carré Vert &amp; Synchronisation
                </h2>
                <span className="text-[0.6875rem] font-bold uppercase tracking-wider rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-2 py-0.5">
                  Challenge Club
                </span>
              </div>
              <p className="text-xs text-[#a7adbb]">
                Fonctionnement de l&apos;assiduité, calcul des points et scraping du tableur Google Sheets
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
            onClick={() => setActiveTab('principles')}
            className={`flex items-center gap-2 border-b-2 py-3 px-3 text-xs font-bold uppercase tracking-wider transition-colors whitespace-nowrap ${
              activeTab === 'principles'
                ? 'border-emerald-400 text-white'
                : 'border-transparent text-[#7d8493] hover:text-white'
            }`}
          >
            <CheckBadgeIcon className="h-4 w-4 text-emerald-400" />
            <span>1. Principe &amp; Points</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('cron_sheets')}
            className={`flex items-center gap-2 border-b-2 py-3 px-3 text-xs font-bold uppercase tracking-wider transition-colors whitespace-nowrap ${
              activeTab === 'cron_sheets'
                ? 'border-emerald-400 text-white'
                : 'border-transparent text-[#7d8493] hover:text-white'
            }`}
          >
            <TableCellsIcon className="h-4 w-4 text-sky-400" />
            <span>2. Scraping Cron &amp; Google Sheets</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('attendance')}
            className={`flex items-center gap-2 border-b-2 py-3 px-3 text-xs font-bold uppercase tracking-wider transition-colors whitespace-nowrap ${
              activeTab === 'attendance'
                ? 'border-emerald-400 text-white'
                : 'border-transparent text-[#7d8493] hover:text-white'
            }`}
          >
            <UserGroupIcon className="h-4 w-4 text-amber-400" />
            <span>3. Pointage des Présences</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="p-6 max-h-[60vh] overflow-y-auto space-y-6 text-xs sm:text-sm">
          {/* TAB 1: PRINCIPLES */}
          {activeTab === 'principles' && (
            <div className="space-y-4">
              <div className="rounded-lg border border-[#262b38] bg-[#161922] p-4 text-[#a7adbb] leading-relaxed">
                Le <strong>Carré Vert</strong> est le trophée d&apos;assiduité historique du CC Saint-Martin Blanmont. Il récompense la régularité des cyclistes aux sorties officielles du calendrier tout au long de la saison.
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-4 rounded-lg border border-[#262b38] bg-[#161922] space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-black font-extrabold text-xs">
                      1
                    </span>
                    <h4 className="font-bold text-white text-xs uppercase tracking-wider">
                      1 Point par Sortie
                    </h4>
                  </div>
                  <p className="text-[#a7adbb] text-xs leading-relaxed">
                    Chaque participation validée à une sortie officielle programmée au calendrier rapporte 1 point d&apos;assiduité (le fameux &laquo; Carré Vert &raquo;).
                  </p>
                </div>

                <div className="p-4 rounded-lg border border-[#262b38] bg-[#161922] space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-sky-500 text-white font-extrabold text-xs">
                      G
                    </span>
                    <h4 className="font-bold text-white text-xs uppercase tracking-wider">
                      Classement Global &amp; Groupes
                    </h4>
                  </div>
                  <p className="text-[#a7adbb] text-xs leading-relaxed">
                    Le classement public (<span className="text-white font-mono">/leaderboard</span>) affiche les cyclistes selon leur rang global et leur groupe de vitesse (A, B, C).
                  </p>
                </div>
              </div>

              <div className="rounded-lg border border-[#262b38] bg-[#161922] p-4 flex items-start gap-3">
                <LightBulbIcon className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-bold text-white text-xs">Règle de fin de saison :</span>
                  <p className="text-xs text-[#a7adbb]">
                    En fin d&apos;année, les lauréats du Carré Vert sont mis à l&apos;honneur lors de l&apos;Assemblée Générale du club avec remise de récompenses officielles.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CRON & GOOGLE SHEETS */}
          {activeTab === 'cron_sheets' && (
            <div className="space-y-4">
              <div className="rounded-lg border border-[#262b38] bg-[#161922] p-4 text-[#a7adbb] leading-relaxed">
                Le club maintient historiquement un tableur Google Sheets pour le suivi des présences. La plateforme dispose d&apos;un <strong>système de scraping automatisé</strong> qui synchronise en continu les données.
              </div>

              <div className="space-y-3">
                <div className="p-3.5 rounded-lg border border-[#262b38] bg-[#161922] space-y-1">
                  <div className="flex items-center gap-2">
                    <ArrowPathIcon className="h-4 w-4 text-emerald-400" />
                    <span className="font-bold text-white text-xs uppercase tracking-wider">
                      La Tâche Cron Automatique (/api/cron/sync-leaderboard)
                    </span>
                  </div>
                  <p className="text-[#a7adbb] text-xs leading-relaxed">
                    Un job Vercel Cron s&apos;exécute périodiquement. Il télécharge le flux CSV exporté de la feuille de calcul Google Sheets, extrait les colonnes de dates formatées <span className="text-white font-mono font-bold">JJ/MM</span> pour la saison 2026, et associe chaque coche aux membres correspondants.
                  </p>
                </div>

                <div className="p-3.5 rounded-lg border border-[#262b38] bg-[#161922] space-y-1">
                  <div className="flex items-center gap-2">
                    <TableCellsIcon className="h-4 w-4 text-sky-400" />
                    <span className="font-bold text-white text-xs uppercase tracking-wider">
                      Bouton &laquo; Synchroniser le Carré Vert &raquo;
                    </span>
                  </div>
                  <p className="text-[#a7adbb] text-xs leading-relaxed">
                    Si le secrétaire ou le président vient de modifier le tableur Google Sheets, vous n&apos;avez pas besoin d&apos;attendre le cron : cliquez sur le bouton vert <strong>&laquo; Synchroniser &raquo;</strong> en haut de page pour lancer l&apos;ingestion immédiate.
                  </p>
                </div>

                <div className="p-3.5 rounded-lg border border-[#262b38] bg-[#161922] space-y-1">
                  <div className="flex items-center gap-2">
                    <ShieldCheckIcon className="h-4 w-4 text-amber-400" />
                    <span className="font-bold text-white text-xs uppercase tracking-wider">
                      Recalcul Automatique &amp; Sécurité
                    </span>
                  </div>
                  <p className="text-[#a7adbb] text-xs leading-relaxed">
                    Lors de chaque synchronisation, les doublons sont éliminés, les totaux de points sont recalculés de manière déterministe et le classement en ligne est rafraîchi instantanément.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ATTENDANCE */}
          {activeTab === 'attendance' && (
            <div className="space-y-4">
              <div className="rounded-lg border border-[#262b38] bg-[#161922] p-4 text-[#a7adbb] leading-relaxed">
                En plus de la synchronisation avec le tableur Google Sheets, les administrateurs et capitaines de route peuvent <strong>pointer les présences directement depuis cette interface web</strong> après chaque sortie.
              </div>

              <div className="space-y-3">
                <div className="p-3.5 rounded-lg border border-[#262b38] bg-[#161922] space-y-1">
                  <h4 className="font-bold text-white text-xs">1. Sélectionner l&apos;Événement</h4>
                  <p className="text-[#a7adbb] text-xs">
                    Dans la colonne de gauche, cliquez sur la date de la sortie (ex. Samedi 15 mars).
                  </p>
                </div>

                <div className="p-3.5 rounded-lg border border-[#262b38] bg-[#161922] space-y-1">
                  <h4 className="font-bold text-white text-xs">2. Cocher les Cyclistes Présents</h4>
                  <p className="text-[#a7adbb] text-xs">
                    Dans le panneau de droite, cochez les cases des membres ayant participé, filtrables par groupe (Groupe A, B, C, etc.).
                  </p>
                </div>

                <div className="p-3.5 rounded-lg border border-[#262b38] bg-[#161922] space-y-1">
                  <h4 className="font-bold text-white text-xs">3. Sauvegarde Temps Réel</h4>
                  <p className="text-[#a7adbb] text-xs">
                    Chaque pointage est enregistré instantanément dans la base de données Firebase et met à jour le profil du membre.
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
            <PlayIcon className="h-4 w-4 text-emerald-400" />
            <span>Lancer la visite interactive</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto inline-flex items-center justify-center rounded-md bg-emerald-600 hover:bg-emerald-700 px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-white transition-colors shadow-xs"
          >
            <span>J&apos;ai compris</span>
          </button>
        </div>
      </div>
    </div>
  );
}
