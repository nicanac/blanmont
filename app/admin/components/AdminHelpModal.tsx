'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  XMarkIcon,
  AcademicCapIcon,
  CalendarDaysIcon,
  ShieldCheckIcon,
  CommandLineIcon,
  ArrowTopRightOnSquareIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
  UsersIcon,
  ArrowUpTrayIcon,
} from '@heroicons/react/24/outline';

interface AdminHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onResetOnboarding?: () => void;
}

export default function AdminHelpModal({
  isOpen,
  onClose,
  onResetOnboarding,
}: AdminHelpModalProps): React.ReactElement | null {
  const [activeTab, setActiveTab] = useState<'ritual' | 'roles' | 'shortcuts' | 'guide'>('ritual');

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
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-3xl rounded-xl border border-[#262b38] bg-[#0a0c10] text-white shadow-2xl overflow-hidden z-10 my-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#262b38] px-6 py-4 bg-[#161922]">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-[#e03e3e]/20 text-[#e03e3e] border border-[#e03e3e]/40">
              <AcademicCapIcon className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold uppercase tracking-tight text-white">
                Centre d&apos;Aide &amp; Raccourcis Admin
              </h2>
              <p className="text-xs text-[#a7adbb]">
                Guide d&apos;exploitation du CC Saint-Martin Blanmont
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
            <CalendarDaysIcon className="h-4 w-4" />
            <span>Rythme Hebdomadaire</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('roles')}
            className={`flex items-center gap-2 border-b-2 py-3 px-3 text-xs font-bold uppercase tracking-wider transition-colors whitespace-nowrap ${
              activeTab === 'roles'
                ? 'border-[#e03e3e] text-white'
                : 'border-transparent text-[#7d8493] hover:text-white'
            }`}
          >
            <ShieldCheckIcon className="h-4 w-4" />
            <span>Rôles &amp; Droits</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('shortcuts')}
            className={`flex items-center gap-2 border-b-2 py-3 px-3 text-xs font-bold uppercase tracking-wider transition-colors whitespace-nowrap ${
              activeTab === 'shortcuts'
                ? 'border-[#e03e3e] text-white'
                : 'border-transparent text-[#7d8493] hover:text-white'
            }`}
          >
            <CommandLineIcon className="h-4 w-4" />
            <span>Raccourcis &amp; Outils</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('guide')}
            className={`flex items-center gap-2 border-b-2 py-3 px-3 text-xs font-bold uppercase tracking-wider transition-colors whitespace-nowrap ${
              activeTab === 'guide'
                ? 'border-[#e03e3e] text-white'
                : 'border-transparent text-[#7d8493] hover:text-white'
            }`}
          >
            <ArrowPathIcon className="h-4 w-4" />
            <span>Guide de Démarrage</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="p-6 max-h-[65vh] overflow-y-auto space-y-6 text-xs sm:text-sm">
          {/* TAB 1: RITUAL */}
          {activeTab === 'ritual' && (
            <div className="space-y-6">
              <div className="rounded-lg border border-[#262b38] bg-[#161922] p-4 text-[#a7adbb] leading-relaxed">
                Le fonctionnement du club s&apos;articule autour d&apos;un rythme hebdomadaire bien rodé. Voici le calendrier des actions attendues des administrateurs et capitaines de route.
              </div>

              <div className="space-y-4">
                <div className="relative pl-6 border-l-2 border-[#e03e3e] space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold uppercase tracking-wider text-white text-xs bg-[#e03e3e] px-2 py-0.5 rounded-xs">
                      Mardi
                    </span>
                    <h4 className="font-bold text-white text-sm">Ouverture du Sondage Weekend</h4>
                  </div>
                  <p className="text-[#a7adbb] text-xs">
                    Création du sondage du weekend sur <span className="text-white font-mono">/admin/sondages/new</span>. Les membres reçoivent la notification et votent pour leur présence (Samedi / Dimanche) et leur groupe de vitesse (A, B, C, VTT).
                  </p>
                </div>

                <div className="relative pl-6 border-l-2 border-amber-500 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold uppercase tracking-wider text-white text-xs bg-amber-500 px-2 py-0.5 rounded-xs">
                      Vendredi 18h
                    </span>
                    <h4 className="font-bold text-white text-sm">Synthèse &amp; Traces GPS</h4>
                  </div>
                  <p className="text-[#a7adbb] text-xs">
                    Consultation des effectifs, attribution des capitaines par groupe et partage du résumé WhatsApp via le bouton &laquo; Exporter WhatsApp &raquo; sur la fiche du sondage.
                  </p>
                </div>

                <div className="relative pl-6 border-l-2 border-emerald-500 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold uppercase tracking-wider text-white text-xs bg-emerald-600 px-2 py-0.5 rounded-xs">
                      Samedi 09h00
                    </span>
                    <h4 className="font-bold text-white text-sm">Départ &amp; Enregistrement Carré Vert</h4>
                  </div>
                  <p className="text-[#a7adbb] text-xs">
                    Rassemblement au local. Après la sortie, pointage des présences sur <span className="text-white font-mono">/admin/carre-vert</span> pour incrémenter les points du challenge annuel de régularité.
                  </p>
                </div>

                <div className="relative pl-6 border-l-2 border-sky-500 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold uppercase tracking-wider text-white text-xs bg-sky-600 px-2 py-0.5 rounded-xs">
                      Dimanche / Lundi
                    </span>
                    <h4 className="font-bold text-white text-sm">Compte-rendu &amp; Nouvelles</h4>
                  </div>
                  <p className="text-[#a7adbb] text-xs">
                    Publication des photos et d&apos;un article sur le blog pour relater les exploits du weekend et annoncer les dates des prochains brevets ou événements.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ROLES */}
          {activeTab === 'roles' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-lg border border-[#262b38] bg-[#161922] p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-[#e03e3e]/20 text-[#e03e3e] border border-[#e03e3e]/40 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider">
                      Administrateur / Président
                    </span>
                  </div>
                  <h4 className="font-bold text-white text-sm">Gestion complète</h4>
                  <ul className="text-xs text-[#a7adbb] space-y-1 list-disc list-inside">
                    <li>Création et gestion des sondages</li>
                    <li>Ajout et modification de membres &amp; rôles</li>
                    <li>Publication d&apos;articles sur le blog</li>
                    <li>Gestion du calendrier officiel &amp; import PDF</li>
                    <li>Gestion des stocks d&apos;équipements Gobik</li>
                  </ul>
                </div>

                <div className="rounded-lg border border-[#262b38] bg-[#161922] p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider">
                      Capitaine de Route
                    </span>
                  </div>
                  <h4 className="font-bold text-white text-sm">Animation &amp; Sécurité</h4>
                  <ul className="text-xs text-[#a7adbb] space-y-1 list-disc list-inside">
                    <li>Pointage des présences Carré Vert</li>
                    <li>Sélection des traces et groupes</li>
                    <li>Partage des résumés WhatsApp aux cyclistes</li>
                    <li>Propositions d&apos;itinéraires et traces GPX</li>
                  </ul>
                </div>
              </div>

              <div className="rounded-lg border border-[#262b38] bg-[#101216] p-4 text-xs text-[#7d8493] flex items-start gap-2.5">
                <ShieldCheckIcon className="h-5 w-5 text-sky-400 shrink-0 mt-0.5" />
                <p>
                  Les droits sont attribués dans l&apos;onglet <Link href="/admin/members" onClick={onClose} className="text-white font-semibold underline">Membres</Link>. Chaque membre peut posséder des rôles multiples (ex. Trésorier + Administrateur).
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: SHORTCUTS */}
          {activeTab === 'shortcuts' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Link
                  href="/admin/sondages/new"
                  onClick={onClose}
                  className="flex items-center justify-between p-3.5 rounded-lg border border-[#262b38] bg-[#161922] hover:border-[#e03e3e] hover:bg-[#1a1e2a] transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <ChatBubbleLeftRightIcon className="h-5 w-5 text-[#e03e3e]" />
                    <div>
                      <div className="text-xs font-bold uppercase tracking-wider text-white">Nouveau Sondage</div>
                      <div className="text-xs text-[#7d8493]">Lancer le vote de présence</div>
                    </div>
                  </div>
                  <ArrowTopRightOnSquareIcon className="h-4 w-4 text-[#7d8493] group-hover:text-white" />
                </Link>

                <Link
                  href="/admin/events/import"
                  onClick={onClose}
                  className="flex items-center justify-between p-3.5 rounded-lg border border-[#262b38] bg-[#161922] hover:border-[#e03e3e] hover:bg-[#1a1e2a] transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <ArrowUpTrayIcon className="h-5 w-5 text-sky-400" />
                    <div>
                      <div className="text-xs font-bold uppercase tracking-wider text-white">Importer Calendrier PDF</div>
                      <div className="text-xs text-[#7d8493]">Ingestion automatique du calendrier</div>
                    </div>
                  </div>
                  <ArrowTopRightOnSquareIcon className="h-4 w-4 text-[#7d8493] group-hover:text-white" />
                </Link>

                <Link
                  href="/admin/blog/new"
                  onClick={onClose}
                  className="flex items-center justify-between p-3.5 rounded-lg border border-[#262b38] bg-[#161922] hover:border-[#e03e3e] hover:bg-[#1a1e2a] transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <DocumentTextIcon className="h-5 w-5 text-emerald-400" />
                    <div>
                      <div className="text-xs font-bold uppercase tracking-wider text-white">Nouvel Article News</div>
                      <div className="text-xs text-[#7d8493]">Rédiger un article ou mot du club</div>
                    </div>
                  </div>
                  <ArrowTopRightOnSquareIcon className="h-4 w-4 text-[#7d8493] group-hover:text-white" />
                </Link>

                <Link
                  href="/admin/members/new"
                  onClick={onClose}
                  className="flex items-center justify-between p-3.5 rounded-lg border border-[#262b38] bg-[#161922] hover:border-[#e03e3e] hover:bg-[#1a1e2a] transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <UsersIcon className="h-5 w-5 text-amber-400" />
                    <div>
                      <div className="text-xs font-bold uppercase tracking-wider text-white">Ajouter un Membre</div>
                      <div className="text-xs text-[#7d8493]">Créer un compte cycliste</div>
                    </div>
                  </div>
                  <ArrowTopRightOnSquareIcon className="h-4 w-4 text-[#7d8493] group-hover:text-white" />
                </Link>
              </div>

              <div className="rounded-lg border border-[#262b38] bg-[#161922] p-4 text-xs text-[#a7adbb] space-y-2">
                <div className="font-bold text-white uppercase tracking-wider">Abonnement iCalendar direct :</div>
                <p className="font-mono text-xs bg-[#0a0c10] p-2 rounded border border-[#262b38] text-emerald-400 select-all">
                  /api/calendar/subscribe.ics
                </p>
                <p className="text-[#7d8493]">
                  Ce flux synchronise automatiquement les sorties avec Apple Calendar, Google Calendar et Outlook des membres.
                </p>
              </div>
            </div>
          )}

          {/* TAB 4: GUIDE RESET */}
          {activeTab === 'guide' && (
            <div className="space-y-4 text-center py-4">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#e03e3e]/10 text-[#e03e3e] border border-[#e03e3e]/30">
                <ArrowPathIcon className="h-6 w-6" />
              </div>

              <div className="max-w-md mx-auto space-y-2">
                <h4 className="text-base font-bold text-white">Guide de Démarrage Administrateur</h4>
                <p className="text-xs text-[#a7adbb]">
                  Le guide interactif sur le tableau de bord vous accompagne pas à pas pour configurer le sondage, le calendrier et les membres.
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    if (onResetOnboarding) {
                      onResetOnboarding();
                    }
                    onClose();
                  }}
                  className="inline-flex items-center gap-2 rounded-md bg-[#e03e3e] hover:bg-[#c93434] px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-white transition-colors shadow-xs"
                >
                  <CheckCircleIcon className="h-4 w-4" />
                  <span>Réafficher le Guide sur le Tableau de Bord</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-[#262b38] bg-[#161922] px-6 py-3">
          <div className="text-xs text-[#7d8493]">
            CC Saint-Martin Blanmont • Système d&apos;exploitation club
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-[#262b38] bg-[#0a0c10] px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-white hover:bg-white/5 transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
