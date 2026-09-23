'use client';

import React from 'react';
import {
  UsersIcon,
  KeyIcon,
  ShieldCheckIcon,
  UserCircleIcon,
  LightBulbIcon,
} from '@heroicons/react/24/outline';
import AdminTutorialModal from '@/app/admin/components/AdminTutorialModal';

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
  const tabs = [
    {
      id: 'roster',
      label: '1. Annuaire & Inscription',
      icon: UserCircleIcon,
      content: (
        <div className="space-y-4">
          <div className="rounded-lg border border-night-line bg-night-2 p-4 text-snow-3 leading-relaxed">
            L&apos;annuaire centralise l&apos;ensemble des cyclistes du CC Saint-Martin Blanmont. Chaque membre dispose d&apos;un compte lui permettant de voter pour les sorties, commander des équipements et consulter ses points Carré Vert.
          </div>

          <div className="space-y-3">
            <div className="p-3.5 rounded-lg border border-night-line bg-night-2 space-y-1">
              <h4 className="font-bold text-white text-xs">Création d&apos;un Membre</h4>
              <p className="text-snow-3 text-xs">
                Cliquez sur « Nouveau Membre » pour saisir son prénom, nom, adresse email de contact et lui attribuer un groupe de niveau par défaut.
              </p>
            </div>

            <div className="p-3.5 rounded-lg border border-night-line bg-night-2 space-y-1">
              <h4 className="font-bold text-white text-xs">Recherche &amp; Filtres</h4>
              <p className="text-snow-3 text-xs">
                La barre de recherche filtre instantanément par nom, prénom, email ou statut de rôle pour retrouver rapidement une fiche cycliste.
              </p>
            </div>
          </div>

          <div className="rounded-lg border border-night-line bg-night-2 p-4 flex items-start gap-3">
            <LightBulbIcon className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
            <p className="text-xs text-snow-3">
              Les avatars sont générés automatiquement avec les initiales du cycliste si aucune photo personnalisée n&apos;a été téléversée.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 'roles',
      label: '2. Rôles & Droits',
      icon: ShieldCheckIcon,
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-lg border border-night-line bg-night-2 space-y-1">
              <span className="rounded-full bg-brand/20 text-brand border border-brand/40 px-2 py-0.5 text-xs font-bold uppercase tracking-wider">
                Président / Admin
              </span>
              <p className="text-snow-3 text-xs">
                Accès intégral à la création de sorties, validation des membres, sondages et stocks Gobik.
              </p>
            </div>

            <div className="p-3.5 rounded-lg border border-night-line bg-night-2 space-y-1">
              <span className="rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-2 py-0.5 text-xs font-bold uppercase tracking-wider">
                Capitaine de Route
              </span>
              <p className="text-snow-3 text-xs">
                Accès au pointage Carré Vert, organisation des groupes de niveau et partage des résumés WhatsApp.
              </p>
            </div>

            <div className="p-3.5 rounded-lg border border-night-line bg-night-2 space-y-1">
              <span className="rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 px-2 py-0.5 text-xs font-bold uppercase tracking-wider">
                Trésorier / Secrétaire
              </span>
              <p className="text-snow-3 text-xs">
                Gestion des cotisations, suivi des commandes de vêtements et mise à jour des coordonnées.
              </p>
            </div>

            <div className="p-3.5 rounded-lg border border-night-line bg-night-2 space-y-1">
              <span className="rounded-full bg-sky-500/20 text-sky-400 border border-sky-500/40 px-2 py-0.5 text-xs font-bold uppercase tracking-wider">
                Membre Cycliste
              </span>
              <p className="text-snow-3 text-xs">
                Accès membre standard : participation aux votes, téléchargement de traces GPX et profil personnel.
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'security',
      label: '3. Mots de Passe & Sécurité',
      icon: KeyIcon,
      content: (
        <div className="space-y-4">
          <div className="rounded-lg border border-night-line bg-night-2 p-4 text-snow-3 leading-relaxed">
            Si un membre oublie son mot de passe ou a besoin d&apos;activer son compte, vous pouvez lui générer un nouveau mot de passe sécurisé en quelques secondes.
          </div>

          <div className="p-3.5 rounded-lg border border-night-line bg-night-2 space-y-2">
            <div className="flex items-center gap-2">
              <KeyIcon className="h-4 w-4 text-amber-400" />
              <span className="font-bold text-white text-xs uppercase tracking-wider">
                Bouton Clé (Réinitialisation)
              </span>
            </div>
            <p className="text-snow-3 text-xs leading-relaxed">
              Sur chaque ligne du tableau, cliquez sur l&apos;icône de clé pour ouvrir la page de réinitialisation et définir un nouveau mot de passe à communiquer au membre.
            </p>
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
      title="Guide de Gestion des Membres"
      badge="Annuaire Club"
      icon={UsersIcon}
      iconColorClass="bg-sky-500/20 text-sky-400 border-sky-500/40"
      tabs={tabs}
    />
  );
}
