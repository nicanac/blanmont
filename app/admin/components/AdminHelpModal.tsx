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

import { useFocusTrap } from '@/app/hooks/useFocusTrap';

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
  const modalRef = useFocusTrap<HTMLDivElement>({ isOpen, onClose });

  if (!isOpen) return null;

  return (
    <div
      ref={modalRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="admin-help-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-3xl rounded-md border border-line dark:border-night-line bg-paper dark:bg-night text-ink dark:text-snow shadow-[0_25px_50px_-12px_rgba(13,16,19,0.45)] overflow-hidden z-10 my-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-line dark:border-night-line px-6 py-4 bg-paper-2 dark:bg-night-2">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-sm bg-brand/10 text-brand border border-brand/30">
              <AcademicCapIcon className="h-5 w-5" />
            </div>
            <div>
              <h2 id="admin-help-title" className="text-base font-wide font-extrabold uppercase tracking-tight text-ink dark:text-white">
                Centre d&apos;Aide &amp; Raccourcis Admin
              </h2>
              <p className="text-xs text-ink-3 dark:text-snow-3">
                Guide d&apos;exploitation du CC Saint-Martin Blanmont
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer l'aide"
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-md p-2 text-ink-3 dark:text-snow-3 hover:bg-black/5 dark:hover:bg-white/10 hover:text-ink dark:hover:text-white transition-colors duration-150"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-line dark:border-night-line bg-paper-2 dark:bg-night-2 px-6 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('ritual')}
            className={`flex items-center gap-2 border-b-2 py-3 px-3 text-xs font-bold uppercase tracking-wider transition-colors duration-150 whitespace-nowrap ${
              activeTab === 'ritual'
                ? 'border-brand text-white'
                : 'border-transparent text-ink-3 hover:text-white'
            }`}
          >
            <CalendarDaysIcon className="h-4 w-4" />
            <span>Rythme Hebdomadaire</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('roles')}
            className={`flex items-center gap-2 border-b-2 py-3 px-3 text-xs font-bold uppercase tracking-wider transition-colors duration-150 whitespace-nowrap ${
              activeTab === 'roles'
                ? 'border-brand text-white'
                : 'border-transparent text-ink-3 hover:text-white'
            }`}
          >
            <ShieldCheckIcon className="h-4 w-4" />
            <span>Rôles &amp; Droits</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('shortcuts')}
            className={`flex items-center gap-2 border-b-2 py-3 px-3 text-xs font-bold uppercase tracking-wider transition-colors duration-150 whitespace-nowrap ${
              activeTab === 'shortcuts'
                ? 'border-brand text-white'
                : 'border-transparent text-ink-3 hover:text-white'
            }`}
          >
            <CommandLineIcon className="h-4 w-4" />
            <span>Raccourcis &amp; Outils</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('guide')}
            className={`flex items-center gap-2 border-b-2 py-3 px-3 text-xs font-bold uppercase tracking-wider transition-colors duration-150 whitespace-nowrap ${
              activeTab === 'guide'
                ? 'border-brand text-white'
                : 'border-transparent text-ink-3 hover:text-white'
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
              <div className="rounded-md border border-line dark:border-night-line bg-paper-2 dark:bg-night-2 p-4 text-ink dark:text-snow leading-relaxed">
                Le fonctionnement du club s&apos;articule autour d&apos;un rythme hebdomadaire bien rodé. Voici le calendrier des actions attendues des administrateurs et capitaines de route.
              </div>

              <div className="space-y-4">
                <div className="relative pl-6 border-l-2 border-brand space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-narrow font-extrabold uppercase tracking-wider text-white text-xs bg-brand px-2 py-0.5 rounded-xs">
                      Mardi
                    </span>
                    <h4 className="font-bold text-ink dark:text-white text-sm">Ouverture du Sondage Weekend</h4>
                  </div>
                  <p className="text-ink-3 dark:text-snow-3 text-xs">
                    Création du sondage du weekend sur <span className="text-ink dark:text-white font-mono">/admin/sondages/new</span>. Les membres reçoivent la notification et votent pour leur présence (Samedi / Dimanche) et leur groupe de vitesse (A, B, C, VTT).
                  </p>
                </div>

                <div className="relative pl-6 border-l-2 border-ambre space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-narrow font-extrabold uppercase tracking-wider text-white text-xs bg-ambre px-2 py-0.5 rounded-xs">
                      Vendredi 18h
                    </span>
                    <h4 className="font-bold text-ink dark:text-white text-sm">Synthèse &amp; Traces GPS</h4>
                  </div>
                  <p className="text-ink-3 dark:text-snow-3 text-xs">
                    Consultation des effectifs, attribution des capitaines par groupe et partage du résumé WhatsApp via le bouton &laquo; Exporter WhatsApp &raquo; sur la fiche du sondage.
                  </p>
                </div>

                <div className="relative pl-6 border-l-2 border-vert space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-narrow font-extrabold uppercase tracking-wider text-white text-xs bg-vert px-2 py-0.5 rounded-xs">
                      Samedi 09h00
                    </span>
                    <h4 className="font-bold text-ink dark:text-white text-sm">Départ &amp; Enregistrement Carré Vert</h4>
                  </div>
                  <p className="text-ink-3 dark:text-snow-3 text-xs">
                    Rassemblement au local. Après la sortie, pointage des présences sur <span className="text-ink dark:text-white font-mono">/admin/carre-vert</span> pour incrémenter les points du challenge annuel de régularité.
                  </p>
                </div>

                <div className="relative pl-6 border-l-2 border-hydro space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-narrow font-extrabold uppercase tracking-wider text-white text-xs bg-hydro px-2 py-0.5 rounded-xs">
                      Dimanche / Lundi
                    </span>
                    <h4 className="font-bold text-ink dark:text-white text-sm">Compte-rendu &amp; Nouvelles</h4>
                  </div>
                  <p className="text-ink-3 dark:text-snow-3 text-xs">
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
                <div className="rounded-md border border-line dark:border-night-line bg-paper-2 dark:bg-night-2 p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-brand-tint dark:bg-brand/20 text-brand border border-brand/30 px-2.5 py-0.5 text-xs font-narrow font-bold uppercase tracking-wider">
                      Administrateur / Président
                    </span>
                  </div>
                  <h4 className="font-bold text-ink dark:text-white text-sm">Gestion complète</h4>
                  <ul className="text-xs text-ink-3 dark:text-snow-3 space-y-1 list-disc list-inside">
                    <li>Création et gestion des sondages</li>
                    <li>Ajout et modification de membres &amp; rôles</li>
                    <li>Publication d&apos;articles sur le blog</li>
                    <li>Gestion du calendrier officiel &amp; import PDF</li>
                    <li>Gestion des stocks d&apos;équipements Gobik</li>
                  </ul>
                </div>

                <div className="rounded-md border border-line dark:border-night-line bg-paper-2 dark:bg-night-2 p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-bois/80 dark:bg-vert/20 text-vert dark:text-vert-strong border border-vert/30 px-2.5 py-0.5 text-xs font-narrow font-bold uppercase tracking-wider">
                      Capitaine de Route
                    </span>
                  </div>
                  <h4 className="font-bold text-ink dark:text-white text-sm">Animation &amp; Sécurité</h4>
                  <ul className="text-xs text-ink-3 dark:text-snow-3 space-y-1 list-disc list-inside">
                    <li>Pointage des présences Carré Vert</li>
                    <li>Sélection des traces et groupes</li>
                    <li>Partage des résumés WhatsApp aux cyclistes</li>
                    <li>Propositions d&apos;itinéraires et traces GPX</li>
                  </ul>
                </div>
              </div>

              <div className="rounded-md border border-line dark:border-night-line bg-paper-2 dark:bg-night p-4 text-xs text-ink-3 dark:text-snow-3 flex items-start gap-2.5">
                <ShieldCheckIcon className="h-5 w-5 text-hydro shrink-0 mt-0.5" />
                <p>
                  Les droits sont attribués dans l&apos;onglet <Link href="/admin/members" onClick={onClose} className="text-brand font-semibold hover:underline">Membres</Link>. Chaque membre peut posséder des rôles multiples (ex. Trésorier + Administrateur).
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
                  className="flex items-center justify-between p-3.5 rounded-md border border-line dark:border-night-line bg-paper-2 dark:bg-night-2 hover:border-brand transition-all duration-200 ease-out group"
                >
                  <div className="flex items-center gap-3">
                    <ChatBubbleLeftRightIcon className="h-5 w-5 text-brand" />
                    <div>
                      <div className="text-xs font-narrow font-bold uppercase tracking-wider text-ink dark:text-white">Nouveau Sondage</div>
                      <div className="text-xs text-ink-3 dark:text-snow-3">Lancer le vote de présence</div>
                    </div>
                  </div>
                  <ArrowTopRightOnSquareIcon className="h-4 w-4 text-ink-3 group-hover:text-brand transition-colors duration-150" />
                </Link>

                <Link
                  href="/admin/events/import"
                  onClick={onClose}
                  className="flex items-center justify-between p-3.5 rounded-md border border-line dark:border-night-line bg-paper-2 dark:bg-night-2 hover:border-brand transition-all duration-200 ease-out group"
                >
                  <div className="flex items-center gap-3">
                    <ArrowUpTrayIcon className="h-5 w-5 text-hydro" />
                    <div>
                      <div className="text-xs font-narrow font-bold uppercase tracking-wider text-ink dark:text-white">Importer Calendrier PDF</div>
                      <div className="text-xs text-ink-3 dark:text-snow-3">Ingestion automatique du calendrier</div>
                    </div>
                  </div>
                  <ArrowTopRightOnSquareIcon className="h-4 w-4 text-ink-3 group-hover:text-brand transition-colors duration-150" />
                </Link>

                <Link
                  href="/admin/blog/new"
                  onClick={onClose}
                  className="flex items-center justify-between p-3.5 rounded-md border border-line dark:border-night-line bg-paper-2 dark:bg-night-2 hover:border-brand transition-all duration-200 ease-out group"
                >
                  <div className="flex items-center gap-3">
                    <DocumentTextIcon className="h-5 w-5 text-vert" />
                    <div>
                      <div className="text-xs font-narrow font-bold uppercase tracking-wider text-ink dark:text-white">Nouvel Article News</div>
                      <div className="text-xs text-ink-3 dark:text-snow-3">Rédiger un article ou mot du club</div>
                    </div>
                  </div>
                  <ArrowTopRightOnSquareIcon className="h-4 w-4 text-ink-3 group-hover:text-brand transition-colors duration-150" />
                </Link>

                <Link
                  href="/admin/members/new"
                  onClick={onClose}
                  className="flex items-center justify-between p-3.5 rounded-md border border-line dark:border-night-line bg-paper-2 dark:bg-night-2 hover:border-brand transition-all duration-200 ease-out group"
                >
                  <div className="flex items-center gap-3">
                    <UsersIcon className="h-5 w-5 text-ambre" />
                    <div>
                      <div className="text-xs font-narrow font-bold uppercase tracking-wider text-ink dark:text-white">Ajouter un Membre</div>
                      <div className="text-xs text-ink-3 dark:text-snow-3">Créer un compte cycliste</div>
                    </div>
                  </div>
                  <ArrowTopRightOnSquareIcon className="h-4 w-4 text-ink-3 group-hover:text-brand transition-colors duration-150" />
                </Link>
              </div>

              <div className="rounded-md border border-line dark:border-night-line bg-paper-2 dark:bg-night-2 p-4 text-xs text-ink-3 dark:text-snow-3 space-y-2">
                <div className="font-narrow font-bold text-ink dark:text-white uppercase tracking-wider">Abonnement iCalendar direct :</div>
                <p className="font-mono text-xs bg-paper dark:bg-night p-2 rounded-xs border border-line dark:border-night-line text-vert select-all">
                  /api/calendar/subscribe.ics
                </p>
                <p className="text-ink-3 dark:text-snow-3 text-xs">
                  Ce flux synchronise automatiquement les sorties avec Apple Calendar, Google Calendar et Outlook des membres.
                </p>
              </div>
            </div>
          )}

          {/* TAB 4: GUIDE RESET */}
          {activeTab === 'guide' && (
            <div className="space-y-4 text-center py-4">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand/10 text-brand border border-brand/30">
                <ArrowPathIcon className="h-6 w-6 md:h-6 md:w-6" />
              </div>

              <div className="max-w-md mx-auto space-y-2">
                <h4 className="text-base font-bold text-ink dark:text-white">Guide de Démarrage Administrateur</h4>
                <p className="text-xs text-ink-3 dark:text-snow-3">
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
                  className="inline-flex items-center gap-2 rounded-md bg-brand hover:bg-brand-strong px-5 py-2.5 text-xs font-narrow font-bold uppercase tracking-[0.07em] text-white transition-colors duration-150 active:translate-y-px"
                >
                  <CheckCircleIcon className="h-4 w-4" />
                  <span>Réafficher le Guide sur le Tableau de Bord</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-line dark:border-night-line bg-paper-2 dark:bg-night-2 px-6 py-3">
          <div className="text-xs font-narrow text-ink-3 dark:text-snow-3">
            CC Saint-Martin Blanmont • Système d&apos;exploitation club
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-line dark:border-night-line bg-paper dark:bg-night px-4 py-1.5 text-xs font-narrow font-semibold uppercase tracking-wider text-ink dark:text-snow hover:bg-line dark:hover:bg-night-3 transition-colors duration-150"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
