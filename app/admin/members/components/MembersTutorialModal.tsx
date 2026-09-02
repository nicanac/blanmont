'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  XMarkIcon,
  UsersIcon,
  PlayIcon,
  PlusIcon,
  KeyIcon,
  ShieldCheckIcon,
  UserCircleIcon,
  LightBulbIcon,
} from '@heroicons/react/24/outline';

interface MembersTutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartTour: () => void;
}

export default function MembersTutorialModal({
  isOpen,
  onClose,
  onStartTour,
}: MembersTutorialModalProps): React.ReactElement | null {
  const [activeTab, setActiveTab] = useState<'roster' | 'roles' | 'security'>('roster');

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
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-sky-500/20 text-sky-400 border border-sky-500/40">
              <UsersIcon className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold uppercase tracking-tight text-white">
                  Guide de Gestion des Membres
                </h2>
                <span className="text-[0.6875rem] font-bold uppercase tracking-wider rounded-full bg-sky-500/20 text-sky-400 border border-sky-500/40 px-2 py-0.5">
                  Annuaire Club
                </span>
              </div>
              <p className="text-xs text-[#a7adbb]">
                Création de comptes, attribution des rôles et gestion des accès sécurisés
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
            onClick={() => setActiveTab('roster')}
            className={`flex items-center gap-2 border-b-2 py-3 px-3 text-xs font-bold uppercase tracking-wider transition-colors whitespace-nowrap ${
              activeTab === 'roster'
                ? 'border-sky-400 text-white'
                : 'border-transparent text-[#7d8493] hover:text-white'
            }`}
          >
            <UserCircleIcon className="h-4 w-4 text-sky-400" />
            <span>1. Annuaire &amp; Inscription</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('roles')}
            className={`flex items-center gap-2 border-b-2 py-3 px-3 text-xs font-bold uppercase tracking-wider transition-colors whitespace-nowrap ${
              activeTab === 'roles'
                ? 'border-sky-400 text-white'
                : 'border-transparent text-[#7d8493] hover:text-white'
            }`}
          >
            <ShieldCheckIcon className="h-4 w-4 text-emerald-400" />
            <span>2. Rôles &amp; Droits</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('security')}
            className={`flex items-center gap-2 border-b-2 py-3 px-3 text-xs font-bold uppercase tracking-wider transition-colors whitespace-nowrap ${
              activeTab === 'security'
                ? 'border-sky-400 text-white'
                : 'border-transparent text-[#7d8493] hover:text-white'
            }`}
          >
            <KeyIcon className="h-4 w-4 text-amber-400" />
            <span>3. Mots de Passe &amp; Sécurité</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="p-6 max-h-[60vh] overflow-y-auto space-y-6 text-xs sm:text-sm">
          {/* TAB 1: ROSTER */}
          {activeTab === 'roster' && (
            <div className="space-y-4">
              <div className="rounded-lg border border-[#262b38] bg-[#161922] p-4 text-[#a7adbb] leading-relaxed">
                L&apos;annuaire centralise l&apos;ensemble des cyclistes du CC Saint-Martin Blanmont. Chaque membre dispose d&apos;un compte lui permettant de voter pour les sorties, commander des équipements et consulter ses points Carré Vert.
              </div>

              <div className="space-y-3">
                <div className="p-3.5 rounded-lg border border-[#262b38] bg-[#161922] space-y-1">
                  <h4 className="font-bold text-white text-xs">Création d&apos;un Membre</h4>
                  <p className="text-[#a7adbb] text-xs">
                    Cliquez sur &laquo; Nouveau Membre &raquo; pour saisir son prénom, nom, adresse email de contact et lui attribuer un groupe de niveau par défaut.
                  </p>
                </div>

                <div className="p-3.5 rounded-lg border border-[#262b38] bg-[#161922] space-y-1">
                  <h4 className="font-bold text-white text-xs">Recherche &amp; Filtres</h4>
                  <p className="text-[#a7adbb] text-xs">
                    La barre de recherche filtre instantanément par nom, prénom, email ou statut de rôle pour retrouver rapidement une fiche cycliste.
                  </p>
                </div>
              </div>

              <div className="rounded-lg border border-[#262b38] bg-[#161922] p-4 flex items-start gap-3">
                <LightBulbIcon className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
                <p className="text-xs text-[#a7adbb]">
                  Les avatars sont générés automatiquement avec les initiales du cycliste si aucune photo personnalisée n&apos;a été téléversée.
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: ROLES */}
          {activeTab === 'roles' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-lg border border-[#262b38] bg-[#161922] space-y-1">
                  <span className="rounded-full bg-[#e03e3e]/20 text-[#e03e3e] border border-[#e03e3e]/40 px-2 py-0.5 text-[0.6875rem] font-bold uppercase tracking-wider">
                    Président / Admin
                  </span>
                  <p className="text-[#a7adbb] text-xs">Accès intégral à la création de sorties, validation des membres, sondages et stocks Gobik.</p>
                </div>

                <div className="p-3.5 rounded-lg border border-[#262b38] bg-[#161922] space-y-1">
                  <span className="rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-2 py-0.5 text-[0.6875rem] font-bold uppercase tracking-wider">
                    Capitaine de Route
                  </span>
                  <p className="text-[#a7adbb] text-xs">Accès au pointage Carré Vert, organisation des groupes de niveau et partage des résumés WhatsApp.</p>
                </div>

                <div className="p-3.5 rounded-lg border border-[#262b38] bg-[#161922] space-y-1">
                  <span className="rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 px-2 py-0.5 text-[0.6875rem] font-bold uppercase tracking-wider">
                    Trésorier / Secrétaire
                  </span>
                  <p className="text-[#a7adbb] text-xs">Gestion des cotisations, suivi des commandes de vêtements et mise à jour des coordonnées.</p>
                </div>

                <div className="p-3.5 rounded-lg border border-[#262b38] bg-[#161922] space-y-1">
                  <span className="rounded-full bg-sky-500/20 text-sky-400 border border-sky-500/40 px-2 py-0.5 text-[0.6875rem] font-bold uppercase tracking-wider">
                    Membre Cycliste
                  </span>
                  <p className="text-[#a7adbb] text-xs">Accès membre standard : participation aux votes, téléchargement de traces GPX et profil personnel.</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SECURITY */}
          {activeTab === 'security' && (
            <div className="space-y-4">
              <div className="rounded-lg border border-[#262b38] bg-[#161922] p-4 text-[#a7adbb] leading-relaxed">
                Si un membre oublie son mot de passe ou a besoin d&apos;activer son compte, vous pouvez lui générer un nouveau mot de passe sécurisé en quelques secondes.
              </div>

              <div className="p-3.5 rounded-lg border border-[#262b38] bg-[#161922] space-y-2">
                <div className="flex items-center gap-2">
                  <KeyIcon className="h-4 w-4 text-amber-400" />
                  <span className="font-bold text-white text-xs uppercase tracking-wider">
                    Bouton Clé (Réinitialisation)
                  </span>
                </div>
                <p className="text-[#a7adbb] text-xs leading-relaxed">
                  Sur chaque ligne du tableau, cliquez sur l&apos;icône de clé pour ouvrir la page de réinitialisation et définir un nouveau mot de passe à communiquer au membre.
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
            <PlayIcon className="h-4 w-4 text-sky-400" />
            <span>Lancer la visite interactive</span>
          </button>

          <Link
            href="/admin/members/new"
            onClick={onClose}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-md bg-[#e03e3e] hover:bg-[#c93434] px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-white transition-colors shadow-xs"
          >
            <PlusIcon className="h-4 w-4" />
            <span>Nouveau Membre</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
