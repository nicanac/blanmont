'use client';

import React, { useState } from 'react';
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
  BoltIcon,
  UserPlusIcon,
  CameraIcon,
  ShareIcon,
  WindowIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';
import { JerseyIcon, TrophySquareIcon } from '@/app/components/ui/CyclingIcons';

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
      <div className="relative w-full max-w-4xl rounded-md border border-line dark:border-night-line bg-paper dark:bg-night text-ink dark:text-snow shadow-[0_25px_50px_-12px_rgba(13,16,19,0.45)] overflow-hidden z-10 my-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-line dark:border-night-line px-6 py-4 bg-paper-2 dark:bg-night-2">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-sm bg-brand/10 text-brand border border-brand/30">
              <AcademicCapIcon className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="admin-help-title" className="text-base font-wide font-extrabold uppercase tracking-tight text-ink dark:text-white">
                  Centre d&apos;Aide &amp; Rituels Admin
                </h2>
                <span className="rounded-full bg-paper dark:bg-night-line border border-line dark:border-night-line px-2 py-0.5 text-xs font-narrow font-bold uppercase tracking-wider text-ink-3 dark:text-snow-3">
                  Guide Exploitation
                </span>
              </div>
              <p className="text-xs text-ink-3 dark:text-snow-3">
                Guide des opérations pour organisateurs débutants et confirmés du CC Saint-Martin Blanmont.
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
        <div className="flex flex-col sm:flex-row border-b border-line dark:border-night-line bg-paper-2 dark:bg-night-2 divide-y sm:divide-y-0 divide-line dark:divide-night-line">
          {[
            { id: 'ritual', label: 'Rythme Hebdo', icon: CalendarDaysIcon },
            { id: 'roles', label: 'Rôles & Droits', icon: ShieldCheckIcon },
            { id: 'shortcuts', label: 'Raccourcis & Outils', icon: CommandLineIcon },
            { id: 'guide', label: 'Guide Démarrage', icon: ArrowPathIcon },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                title={tab.label}
                className={`flex-1 min-w-0 flex items-center justify-between sm:justify-center gap-2 py-3 px-3 sm:px-4 text-xs font-narrow font-bold uppercase tracking-wider transition-colors duration-150 cursor-pointer ${
                  isActive
                    ? 'border-l-4 sm:border-l-0 sm:border-b-2 border-brand text-brand dark:text-white bg-paper dark:bg-white/5'
                    : 'border-l-4 sm:border-l-0 sm:border-b-2 border-transparent text-ink-3 dark:text-snow-3 hover:text-ink dark:hover:text-white hover:bg-paper/50 dark:hover:bg-white/[0.02]'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0 truncate">
                  <tab.icon className="h-4 w-4 shrink-0" />
                  <span className="truncate">{tab.label}</span>
                </div>
              </button>
            );
          })}
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
                      Lundi 08h
                    </span>
                    <h4 className="font-bold text-ink dark:text-white text-sm">Ouverture Automatique du Sondage</h4>
                  </div>
                  <p className="text-ink-3 dark:text-snow-3 text-xs">
                    Création du sondage du weekend (automatique via cron ou manuelle sur <span className="font-mono text-xs">/admin/sondages</span>). Les membres votent sur <span className="font-mono text-xs">/sondage</span> pour leur présence (Samedi / Dimanche / Les deux) et leur groupe (A, B, C, VTT).
                  </p>
                </div>

                <div className="relative pl-6 border-l-2 border-ambre space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-narrow font-extrabold uppercase tracking-wider text-white text-xs bg-ambre px-2 py-0.5 rounded-xs">
                      Vendredi 18h
                    </span>
                    <h4 className="font-bold text-ink dark:text-white text-sm">Briefing WhatsApp &amp; Traces GPX</h4>
                  </div>
                  <p className="text-ink-3 dark:text-snow-3 text-xs">
                    Consultation des effectifs inscrits, vérification de la taille des pelotons et partage du briefing officiel sur WhatsApp en 1 clic grâce au bouton <strong>« Briefing WhatsApp »</strong> au Quartier Général.
                  </p>
                </div>

                <div className="relative pl-6 border-l-2 border-vert space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-narrow font-extrabold uppercase tracking-wider text-white text-xs bg-vert px-2 py-0.5 rounded-xs">
                      Samedi 09h00
                    </span>
                    <h4 className="font-bold text-ink dark:text-white text-sm">Départ &amp; Pointage Express</h4>
                  </div>
                  <p className="text-ink-3 dark:text-snow-3 text-xs">
                    Rassemblement Place de la Féchère. Les capitaines émargent le peloton sur mobile via <span className="font-mono text-xs">/admin/pointage-express</span> (1-tap ou scan QR Pass Numérique) pour alimenter le classement Carré Vert.
                  </p>
                </div>

                <div className="relative pl-6 border-l-2 border-hydro space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-narrow font-extrabold uppercase tracking-wider text-white text-xs bg-hydro px-2 py-0.5 rounded-xs">
                      Dimanche / Lundi
                    </span>
                    <h4 className="font-bold text-ink dark:text-white text-sm">Compte-rendu &amp; Albums Photos</h4>
                  </div>
                  <p className="text-ink-3 dark:text-snow-3 text-xs">
                    Publication des photos sur <span className="font-mono text-xs">/admin/galerie</span> et d&apos;un récit de sortie sur le blog pour relater les exploits du weekend.
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
                    <span className="rounded-full bg-brand/10 text-brand border border-brand/30 px-2.5 py-0.5 text-xs font-narrow font-bold uppercase tracking-wider">
                      Administrateur / Président
                    </span>
                  </div>
                  <h4 className="font-bold text-ink dark:text-white text-sm">Gestion Complète &amp; Institutionnelle</h4>
                  <ul className="text-xs text-ink-3 dark:text-snow-3 space-y-1 list-disc list-inside">
                    <li>Création et clôture des sondages hebdomadaires</li>
                    <li>Ajout et modification de membres &amp; rôles</li>
                    <li>Publication d&apos;articles officiels sur le blog</li>
                    <li>Import PDF du calendrier annuel complet</li>
                    <li>Gestion du vestiaire &amp; commandes Gobik</li>
                  </ul>
                </div>

                <div className="rounded-md border border-line dark:border-night-line bg-paper-2 dark:bg-night-2 p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-vert/10 text-vert dark:text-vert-strong border border-vert/30 px-2.5 py-0.5 text-xs font-narrow font-bold uppercase tracking-wider">
                      Capitaine de Route
                    </span>
                  </div>
                  <h4 className="font-bold text-ink dark:text-white text-sm">Animation, Terrain &amp; Sécurité</h4>
                  <ul className="text-xs text-ink-3 dark:text-snow-3 space-y-1 list-disc list-inside">
                    <li>Pointage Express mobile &amp; Carré Vert</li>
                    <li>Accès aux fiches secours ICE et licences FFBC</li>
                    <li>Partage des briefings WhatsApp au peloton</li>
                    <li>Parrainage des candidats en sortie d&apos;essai</li>
                  </ul>
                </div>
              </div>

              <div className="rounded-md border border-line dark:border-night-line bg-paper-2 dark:bg-night p-4 text-xs text-ink-3 dark:text-snow-3 flex items-start gap-2.5">
                <ShieldCheckIcon className="h-5 w-5 text-hydro shrink-0 mt-0.5" />
                <p>
                  Les droits sont attribués dans l&apos;onglet <Link href="/admin/members" onClick={onClose} className="text-brand font-semibold hover:underline">Membres</Link>. Chaque cycliste peut posséder des rôles multiples (ex. Capitaine + Trésorier).
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: SHORTCUTS */}
          {activeTab === 'shortcuts' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                <Link
                  href="/admin/pointage-express"
                  onClick={onClose}
                  className="flex items-center justify-between p-3 rounded-md border border-line dark:border-night-line bg-paper-2 dark:bg-night-2 hover:border-brand transition-all duration-200 ease-out group"
                >
                  <div className="flex items-center gap-2.5">
                    <BoltIcon className="h-4 w-4 text-brand shrink-0" />
                    <div>
                      <div className="text-xs font-narrow font-bold uppercase tracking-wider text-ink dark:text-white">Pointage Express</div>
                      <div className="text-[11px] text-ink-3 dark:text-snow-3">Émargement &amp; secours ICE</div>
                    </div>
                  </div>
                  <ArrowTopRightOnSquareIcon className="h-3.5 w-3.5 text-ink-3 group-hover:text-brand transition-colors" />
                </Link>

                <Link
                  href="/admin/carre-vert"
                  onClick={onClose}
                  className="flex items-center justify-between p-3 rounded-md border border-line dark:border-night-line bg-paper-2 dark:bg-night-2 hover:border-brand transition-all duration-200 ease-out group"
                >
                  <div className="flex items-center gap-2.5">
                    <TrophySquareIcon className="h-4 w-4 text-vert shrink-0" />
                    <div>
                      <div className="text-xs font-narrow font-bold uppercase tracking-wider text-ink dark:text-white">Carré Vert</div>
                      <div className="text-[11px] text-ink-3 dark:text-snow-3">Challenge &amp; assiduité</div>
                    </div>
                  </div>
                  <ArrowTopRightOnSquareIcon className="h-3.5 w-3.5 text-ink-3 group-hover:text-brand transition-colors" />
                </Link>

                <Link
                  href="/admin/prospects"
                  onClick={onClose}
                  className="flex items-center justify-between p-3 rounded-md border border-line dark:border-night-line bg-paper-2 dark:bg-night-2 hover:border-brand transition-all duration-200 ease-out group"
                >
                  <div className="flex items-center gap-2.5">
                    <UserPlusIcon className="h-4 w-4 text-ambre shrink-0" />
                    <div>
                      <div className="text-xs font-narrow font-bold uppercase tracking-wider text-ink dark:text-white">Candidatures CRM</div>
                      <div className="text-[11px] text-ink-3 dark:text-snow-3">Sorties d’essai &amp; parrainage</div>
                    </div>
                  </div>
                  <ArrowTopRightOnSquareIcon className="h-3.5 w-3.5 text-ink-3 group-hover:text-brand transition-colors" />
                </Link>

                <Link
                  href="/admin/sondages"
                  onClick={onClose}
                  className="flex items-center justify-between p-3 rounded-md border border-line dark:border-night-line bg-paper-2 dark:bg-night-2 hover:border-brand transition-all duration-200 ease-out group"
                >
                  <div className="flex items-center gap-2.5">
                    <ChatBubbleLeftRightIcon className="h-4 w-4 text-brand shrink-0" />
                    <div>
                      <div className="text-xs font-narrow font-bold uppercase tracking-wider text-ink dark:text-white">Sondages Weekend</div>
                      <div className="text-[11px] text-ink-3 dark:text-snow-3">Votes de présence &amp; allures</div>
                    </div>
                  </div>
                  <ArrowTopRightOnSquareIcon className="h-3.5 w-3.5 text-ink-3 group-hover:text-brand transition-colors" />
                </Link>

                <Link
                  href="/admin/events"
                  onClick={onClose}
                  className="flex items-center justify-between p-3 rounded-md border border-line dark:border-night-line bg-paper-2 dark:bg-night-2 hover:border-brand transition-all duration-200 ease-out group"
                >
                  <div className="flex items-center gap-2.5">
                    <CalendarDaysIcon className="h-4 w-4 text-hydro shrink-0" />
                    <div>
                      <div className="text-xs font-narrow font-bold uppercase tracking-wider text-ink dark:text-white">Sorties &amp; Calendrier</div>
                      <div className="text-[11px] text-ink-3 dark:text-snow-3">Programme &amp; import PDF</div>
                    </div>
                  </div>
                  <ArrowTopRightOnSquareIcon className="h-3.5 w-3.5 text-ink-3 group-hover:text-brand transition-colors" />
                </Link>

                <Link
                  href="/admin/galerie"
                  onClick={onClose}
                  className="flex items-center justify-between p-3 rounded-md border border-line dark:border-night-line bg-paper-2 dark:bg-night-2 hover:border-brand transition-all duration-200 ease-out group"
                >
                  <div className="flex items-center gap-2.5">
                    <CameraIcon className="h-4 w-4 text-vert shrink-0" />
                    <div>
                      <div className="text-xs font-narrow font-bold uppercase tracking-wider text-ink dark:text-white">Galeries Photos</div>
                      <div className="text-[11px] text-ink-3 dark:text-snow-3">Albums &amp; liens HD</div>
                    </div>
                  </div>
                  <ArrowTopRightOnSquareIcon className="h-3.5 w-3.5 text-ink-3 group-hover:text-brand transition-colors" />
                </Link>

                <Link
                  href="/admin/hero"
                  onClick={onClose}
                  className="flex items-center justify-between p-3 rounded-md border border-line dark:border-night-line bg-paper-2 dark:bg-night-2 hover:border-brand transition-all duration-200 ease-out group"
                >
                  <div className="flex items-center gap-2.5">
                    <WindowIcon className="h-4 w-4 text-brand shrink-0" />
                    <div>
                      <div className="text-xs font-narrow font-bold uppercase tracking-wider text-ink dark:text-white">Bannière Accueil</div>
                      <div className="text-[11px] text-ink-3 dark:text-snow-3">Slider 21:9 &amp; télémétrie</div>
                    </div>
                  </div>
                  <ArrowTopRightOnSquareIcon className="h-3.5 w-3.5 text-ink-3 group-hover:text-brand transition-colors" />
                </Link>

                <Link
                  href="/admin/members"
                  onClick={onClose}
                  className="flex items-center justify-between p-3 rounded-md border border-line dark:border-night-line bg-paper-2 dark:bg-night-2 hover:border-brand transition-all duration-200 ease-out group"
                >
                  <div className="flex items-center gap-2.5">
                    <UsersIcon className="h-4 w-4 text-hydro shrink-0" />
                    <div>
                      <div className="text-xs font-narrow font-bold uppercase tracking-wider text-ink dark:text-white">Annuaire Membres</div>
                      <div className="text-[11px] text-ink-3 dark:text-snow-3">Comptes, rôles &amp; sécurité</div>
                    </div>
                  </div>
                  <ArrowTopRightOnSquareIcon className="h-3.5 w-3.5 text-ink-3 group-hover:text-brand transition-colors" />
                </Link>

                <Link
                  href="/admin/members/photos"
                  onClick={onClose}
                  className="flex items-center justify-between p-3 rounded-md border border-line dark:border-night-line bg-paper-2 dark:bg-night-2 hover:border-brand transition-all duration-200 ease-out group"
                >
                  <div className="flex items-center gap-2.5">
                    <UserCircleIcon className="h-4 w-4 text-hydro shrink-0" />
                    <div>
                      <div className="text-xs font-narrow font-bold uppercase tracking-wider text-ink dark:text-white">Portraits &amp; Cadrage</div>
                      <div className="text-[11px] text-ink-3 dark:text-snow-3">Trombinoscope &amp; visages</div>
                    </div>
                  </div>
                  <ArrowTopRightOnSquareIcon className="h-3.5 w-3.5 text-ink-3 group-hover:text-brand transition-colors" />
                </Link>

                <Link
                  href="/admin/equipements"
                  onClick={onClose}
                  className="flex items-center justify-between p-3 rounded-md border border-line dark:border-night-line bg-paper-2 dark:bg-night-2 hover:border-brand transition-all duration-200 ease-out group"
                >
                  <div className="flex items-center gap-2.5">
                    <JerseyIcon className="h-4 w-4 text-ink dark:text-snow shrink-0" />
                    <div>
                      <div className="text-xs font-narrow font-bold uppercase tracking-wider text-ink dark:text-white">Vestiaire Gobik</div>
                      <div className="text-[11px] text-ink-3 dark:text-snow-3">Stocks &amp; commandes</div>
                    </div>
                  </div>
                  <ArrowTopRightOnSquareIcon className="h-3.5 w-3.5 text-ink-3 group-hover:text-brand transition-colors" />
                </Link>

                <Link
                  href="/admin/statistics"
                  onClick={onClose}
                  className="flex items-center justify-between p-3 rounded-md border border-line dark:border-night-line bg-paper-2 dark:bg-night-2 hover:border-brand transition-all duration-200 ease-out group"
                >
                  <div className="flex items-center gap-2.5">
                    <ChartBarIcon className="h-4 w-4 text-hydro shrink-0" />
                    <div>
                      <div className="text-xs font-narrow font-bold uppercase tracking-wider text-ink dark:text-white">Statistiques</div>
                      <div className="text-[11px] text-ink-3 dark:text-snow-3">Fréquentation &amp; bilans AG</div>
                    </div>
                  </div>
                  <ArrowTopRightOnSquareIcon className="h-3.5 w-3.5 text-ink-3 group-hover:text-brand transition-colors" />
                </Link>

                <Link
                  href="/admin/settings"
                  onClick={onClose}
                  className="flex items-center justify-between p-3 rounded-md border border-line dark:border-night-line bg-paper-2 dark:bg-night-2 hover:border-brand transition-all duration-200 ease-out group"
                >
                  <div className="flex items-center gap-2.5">
                    <Cog6ToothIcon className="h-4 w-4 text-ink-3 dark:text-snow-3 shrink-0" />
                    <div>
                      <div className="text-xs font-narrow font-bold uppercase tracking-wider text-ink dark:text-white">Paramètres &amp; Thème</div>
                      <div className="text-[11px] text-ink-3 dark:text-snow-3">Charte IGN &amp; mode jour/nuit</div>
                    </div>
                  </div>
                  <ArrowTopRightOnSquareIcon className="h-3.5 w-3.5 text-ink-3 group-hover:text-brand transition-colors" />
                </Link>
              </div>

              {/* Keyboard Shortcuts Card */}
              <div className="p-4 rounded-md border border-line dark:border-night-line bg-paper-2 dark:bg-night-2 space-y-2">
                <span className="font-narrow font-bold uppercase tracking-wider text-ink dark:text-white text-xs block">
                  Raccourcis Clavier du Système :
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center justify-between p-2 rounded bg-paper dark:bg-night border border-line dark:border-night-line">
                    <span className="text-ink-3 dark:text-snow-3">Palette de commandes</span>
                    <kbd className="px-2 py-0.5 rounded bg-paper-2 dark:bg-night-3 border border-line dark:border-night-line font-mono font-bold text-xs">
                      Cmd + K
                    </kbd>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded bg-paper dark:bg-night border border-line dark:border-night-line">
                    <span className="text-ink-3 dark:text-snow-3">Replier / déplier le menu</span>
                    <kbd className="px-2 py-0.5 rounded bg-paper-2 dark:bg-night-3 border border-line dark:border-night-line font-mono font-bold text-xs">
                      Cmd + B
                    </kbd>
                  </div>
                </div>
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
                  className="inline-flex items-center gap-2 rounded-md bg-brand hover:bg-brand-strong px-5 py-2.5 text-xs font-narrow font-bold uppercase tracking-[0.07em] text-white transition-colors duration-150 active:translate-y-px cursor-pointer"
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
            className="rounded-md border border-line dark:border-night-line bg-paper dark:bg-night px-4 py-1.5 text-xs font-narrow font-semibold uppercase tracking-wider text-ink dark:text-snow hover:bg-line dark:hover:bg-night-3 transition-colors duration-150 cursor-pointer"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
