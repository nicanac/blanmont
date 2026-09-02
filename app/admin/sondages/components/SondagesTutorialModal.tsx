'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  XMarkIcon,
  ChatBubbleLeftRightIcon,
  PlayIcon,
  PlusIcon,
  ClockIcon,
  UserGroupIcon,
  ShareIcon,
  LightBulbIcon,
} from '@heroicons/react/24/outline';

interface SondagesTutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartTour: () => void;
}

export default function SondagesTutorialModal({
  isOpen,
  onClose,
  onStartTour,
}: SondagesTutorialModalProps): React.ReactElement | null {
  const [activeTab, setActiveTab] = useState<'ritual' | 'votes' | 'whatsapp'>('ritual');

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
              <ChatBubbleLeftRightIcon className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold uppercase tracking-tight text-white">
                  Guide des Sondages du Weekend
                </h2>
                <span className="text-[0.6875rem] font-bold uppercase tracking-wider rounded-full bg-[#e03e3e]/20 text-[#e03e3e] border border-[#e03e3e]/40 px-2 py-0.5">
                  Rituel Hebdomadaire
                </span>
              </div>
              <p className="text-xs text-[#a7adbb]">
                Organisation des sorties, composition des groupes et génération du récapitulatif WhatsApp
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
            onClick={() => setActiveTab('ritual')}
            className={`flex items-center gap-2 border-b-2 py-3 px-3 text-xs font-bold uppercase tracking-wider transition-colors whitespace-nowrap ${
              activeTab === 'ritual'
                ? 'border-[#e03e3e] text-white'
                : 'border-transparent text-[#7d8493] hover:text-white'
            }`}
          >
            <ClockIcon className="h-4 w-4" />
            <span>1. Le Rituel Hebdomadaire</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('votes')}
            className={`flex items-center gap-2 border-b-2 py-3 px-3 text-xs font-bold uppercase tracking-wider transition-colors whitespace-nowrap ${
              activeTab === 'votes'
                ? 'border-[#e03e3e] text-white'
                : 'border-transparent text-[#7d8493] hover:text-white'
            }`}
          >
            <UserGroupIcon className="h-4 w-4 text-sky-400" />
            <span>2. Choix &amp; Groupes de Niveau</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('whatsapp')}
            className={`flex items-center gap-2 border-b-2 py-3 px-3 text-xs font-bold uppercase tracking-wider transition-colors whitespace-nowrap ${
              activeTab === 'whatsapp'
                ? 'border-[#e03e3e] text-white'
                : 'border-transparent text-[#7d8493] hover:text-white'
            }`}
          >
            <ShareIcon className="h-4 w-4 text-emerald-400" />
            <span>3. Synthèse WhatsApp</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="p-6 max-h-[60vh] overflow-y-auto space-y-6 text-xs sm:text-sm">
          {/* TAB 1: RITUAL */}
          {activeTab === 'ritual' && (
            <div className="space-y-4">
              <div className="rounded-lg border border-[#262b38] bg-[#161922] p-4 text-[#a7adbb] leading-relaxed">
                Le sondage est le cœur battant de la vie du club chaque semaine. Il permet de connaître à l&apos;avance l&apos;effectif présent et d&apos;ajuster les groupes pour garantir la sécurité du peloton.
              </div>

              <div className="space-y-3">
                <div className="p-3.5 rounded-lg border border-[#262b38] bg-[#161922] space-y-1">
                  <div className="flex items-center gap-2 text-white font-bold text-xs">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#e03e3e] text-white font-extrabold text-[0.625rem]">
                      M
                    </span>
                    <span>Mardi : Lancement du vote</span>
                  </div>
                  <p className="text-[#a7adbb] text-xs">
                    L&apos;administrateur crée le sondage de la semaine avec la météo prévisionnelle et les options de traces.
                  </p>
                </div>

                <div className="p-3.5 rounded-lg border border-[#262b38] bg-[#161922] space-y-1">
                  <div className="flex items-center gap-2 text-white font-bold text-xs">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-black font-extrabold text-[0.625rem]">
                      V
                    </span>
                    <span>Vendredi Soir : Clôture &amp; Synthèse</span>
                  </div>
                  <p className="text-[#a7adbb] text-xs">
                    L&apos;admin clôture le sondage, vérifie la taille des pelotons et partage le récapitulatif officiel sur le groupe WhatsApp du club.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: VOTES */}
          {activeTab === 'votes' && (
            <div className="space-y-4">
              <div className="rounded-lg border border-[#262b38] bg-[#161922] p-4 text-[#a7adbb] leading-relaxed">
                Sur la page membre (<span className="text-white font-mono">/sondage</span>), chaque cycliste peut voter en 1 clic :
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-lg border border-[#262b38] bg-[#161922] space-y-1">
                  <h4 className="font-bold text-white text-xs">Disponibilité</h4>
                  <p className="text-[#a7adbb] text-xs">Samedi matin, Dimanche matin, Les deux jours, ou Absent.</p>
                </div>

                <div className="p-3.5 rounded-lg border border-[#262b38] bg-[#161922] space-y-1">
                  <h4 className="font-bold text-white text-xs">Groupe de Niveau</h4>
                  <p className="text-[#a7adbb] text-xs">Groupe A (&gt;30 km/h), Groupe B (27-29 km/h), Groupe C (24-26 km/h) ou VTT.</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: WHATSAPP */}
          {activeTab === 'whatsapp' && (
            <div className="space-y-4">
              <div className="rounded-lg border border-[#262b38] bg-[#161922] p-4 text-[#a7adbb] leading-relaxed">
                Fini les messages manuels fastidieux ! Sur la page de détails du sondage (<span className="text-white font-mono">/admin/sondages/[id]</span>), un bouton <strong>&laquo; Copier pour WhatsApp &raquo;</strong> génère instantanément le message complet avec les émojis, la liste des inscrits par groupe, l&apos;heure et le lien de la trace GPX.
              </div>

              <div className="rounded-lg border border-[#262b38] bg-[#161922] p-4 flex items-start gap-3">
                <LightBulbIcon className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
                <p className="text-xs text-[#a7adbb]">
                  Les capitaines de route utilisent ce récapitulatif le samedi et dimanche matin pour faire l&apos;appel au départ sur la place de Blanmont.
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
            <PlayIcon className="h-4 w-4 text-[#e03e3e]" />
            <span>Lancer la visite interactive</span>
          </button>

          <Link
            href="/admin/sondages/new"
            onClick={onClose}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-md bg-[#e03e3e] hover:bg-[#c93434] px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-white transition-colors shadow-xs"
          >
            <PlusIcon className="h-4 w-4" />
            <span>Créer un Sondage</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
