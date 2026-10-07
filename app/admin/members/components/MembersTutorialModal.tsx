'use client';

import React from 'react';
import {
  UsersIcon,
  KeyIcon,
  ShieldCheckIcon,
  UserCircleIcon,
  LightBulbIcon,
  CameraIcon,
  PhoneIcon,
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
      badge: 'Débutant',
      icon: UserCircleIcon,
      content: (
        <div className="space-y-4">
          <div className="rounded-md border border-line dark:border-night-line bg-paper-2 dark:bg-night-2 p-4 text-xs sm:text-sm text-ink dark:text-snow leading-relaxed">
            L&apos;annuaire centralise l&apos;ensemble des cyclistes du CC Saint-Martin Blanmont. Chaque membre dispose d&apos;un compte personnel lui permettant de voter pour les sorties, commander des équipements et consulter ses points Carré Vert.
          </div>

          <div className="space-y-3">
            <div className="p-3.5 rounded-md border border-line dark:border-night-line bg-paper dark:bg-night space-y-1">
              <h4 className="font-bold text-ink dark:text-white text-xs uppercase tracking-wider font-narrow">
                Création d&apos;un Nouveau Compte Cycliste
              </h4>
              <p className="text-ink-3 dark:text-snow-3 text-xs leading-relaxed">
                Cliquez sur <strong>« Nouveau Membre »</strong> pour saisir son prénom, nom, adresse email de contact et lui attribuer un groupe de niveau habituel (A, B, C ou VTT).
              </p>
            </div>

            <div className="p-3.5 rounded-md border border-line dark:border-night-line bg-paper dark:bg-night space-y-1">
              <h4 className="font-bold text-ink dark:text-white text-xs uppercase tracking-wider font-narrow">
                Recherche Instantanée &amp; Filtres
              </h4>
              <p className="text-ink-3 dark:text-snow-3 text-xs leading-relaxed">
                La barre de recherche filtre en direct par nom, prénom, email ou statut de rôle pour retrouver en 2 frappes de clavier n&apos;importe quelle fiche adhérent.
              </p>
            </div>
          </div>

          <div className="rounded-md border border-ambre/30 bg-ambre/5 p-4 flex items-start gap-3">
            <LightBulbIcon className="h-5 w-5 text-ambre shrink-0 mt-0.5" />
            <p className="text-xs text-ink-3 dark:text-snow-3">
              Si aucune photo n&apos;a été fournie, les avatars génèrent automatiquement un badge aux couleurs du club avec les initiales du cycliste.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 'roles',
      label: '2. Rôles & Permissions',
      badge: 'Confirmé',
      icon: ShieldCheckIcon,
      content: (
        <div className="space-y-4">
          <div className="rounded-md border border-line dark:border-night-line bg-paper-2 dark:bg-night-2 p-4 text-xs sm:text-sm text-ink dark:text-snow leading-relaxed">
            Les droits d&apos;accès sont modulaires. Chaque cycliste peut cumuler plusieurs rôles (ex. Capitaine de Route + Trésorier).
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-md border border-brand/30 bg-brand/5 space-y-1">
              <span className="rounded-full bg-brand/20 text-brand border border-brand/30 px-2 py-0.5 text-xs font-bold uppercase tracking-wider font-narrow">
                Président / Admin
              </span>
              <p className="text-ink-3 dark:text-snow-3 text-xs leading-relaxed">
                Accès total : gestion des sondages, validation des membres, importation de calendriers PDF, articles de blog et stocks Gobik.
              </p>
            </div>

            <div className="p-3.5 rounded-md border border-vert/30 bg-vert/5 space-y-1">
              <span className="rounded-full bg-vert/20 text-vert dark:text-vert-strong border border-vert/30 px-2 py-0.5 text-xs font-bold uppercase tracking-wider font-narrow">
                Capitaine de Route
              </span>
              <p className="text-ink-3 dark:text-snow-3 text-xs leading-relaxed">
                Émargement terrain Carré Vert &amp; Pointage Express, fiches ICE d&apos;urgence, organisation des groupes de niveau et partage des résumés WhatsApp.
              </p>
            </div>

            <div className="p-3.5 rounded-md border border-ambre/30 bg-ambre/5 space-y-1">
              <span className="rounded-full bg-ambre/20 text-ambre border border-ambre/30 px-2 py-0.5 text-xs font-bold uppercase tracking-wider font-narrow">
                Trésorier / Secrétaire
              </span>
              <p className="text-ink-3 dark:text-snow-3 text-xs leading-relaxed">
                Suivi des cotisations, inventaire du vestiaire Gobik, coordonnées postales et export des listes d&apos;adhérents.
              </p>
            </div>

            <div className="p-3.5 rounded-md border border-hydro/30 bg-hydro/5 space-y-1">
              <span className="rounded-full bg-hydro/20 text-hydro border border-hydro/30 px-2 py-0.5 text-xs font-bold uppercase tracking-wider font-narrow">
                Membre Cycliste
              </span>
              <p className="text-ink-3 dark:text-snow-3 text-xs leading-relaxed">
                Accès membre adhérent : participation aux votes de weekend, téléchargement de traces GPX et Pass Numérique personnel.
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'security_photos',
      label: '3. Sécurité, Clés & Portraits',
      badge: 'Avancé',
      icon: KeyIcon,
      content: (
        <div className="space-y-4">
          <div className="rounded-md border border-line dark:border-night-line bg-paper-2 dark:bg-night-2 p-4 text-xs sm:text-sm text-ink dark:text-snow leading-relaxed">
            Outils avancés pour l&apos;administration des comptes, la sécurité et la mise en valeur des portraits du club.
          </div>

          <div className="space-y-3">
            <div className="p-3.5 rounded-md border border-line dark:border-night-line bg-paper dark:bg-night space-y-2">
              <div className="flex items-center gap-2">
                <KeyIcon className="h-4 w-4 text-ambre" />
                <span className="font-bold text-ink dark:text-white text-xs uppercase tracking-wider font-narrow">
                  Bouton Clé (Réinitialisation de Mot de Passe)
                </span>
              </div>
              <p className="text-ink-3 dark:text-snow-3 text-xs leading-relaxed">
                Sur chaque ligne du tableau, cliquez sur l&apos;icône de clé pour générer un lien sécurisé de réinitialisation ou définir un mot de passe temporaire à communiquer au membre.
              </p>
            </div>

            <div className="p-3.5 rounded-md border border-line dark:border-night-line bg-paper dark:bg-night space-y-2">
              <div className="flex items-center gap-2">
                <CameraIcon className="h-4 w-4 text-hydro" />
                <span className="font-bold text-ink dark:text-white text-xs uppercase tracking-wider font-narrow">
                  Portraits &amp; Cadrage (/admin/members/photos)
                </span>
              </div>
              <p className="text-ink-3 dark:text-snow-3 text-xs leading-relaxed">
                Accédez à l&apos;outil de cadrage dédié pour téléverser et recadrer les portraits des membres avec ratio carré harmonisé, visible dans le trombinoscope public du club.
              </p>
            </div>

            <div className="p-3.5 rounded-md border border-line dark:border-night-line bg-paper dark:bg-night space-y-2">
              <div className="flex items-center gap-2">
                <PhoneIcon className="h-4 w-4 text-vert" />
                <span className="font-bold text-ink dark:text-white text-xs uppercase tracking-wider font-narrow">
                  Licence FFBC &amp; Contacts d&apos;Urgence ICE
                </span>
              </div>
              <p className="text-ink-3 dark:text-snow-3 text-xs leading-relaxed">
                Renseignez le numéro de licence fédérale FFBC et le contact d&apos;urgence (téléphone du conjoint/proche). Ces données sont indispensables pour le Pointage Express en cas d&apos;accident.
              </p>
            </div>
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
      subtitle="Gérez les profils des coureurs, la matrice des rôles, la sécurité des accès et les portraits."
      icon={UsersIcon}
      iconColorClass="bg-hydro/10 text-hydro border-hydro/30"
      tabs={tabs}
      tourButtonLabel="Lancer la visite interactive"
    />
  );
}
