'use client';

import React from 'react';
import {
  BoltIcon,
  QrCodeIcon,
  ShieldCheckIcon,
  HandRaisedIcon,
  PhoneIcon,
  TrophyIcon,
  DevicePhoneMobileIcon,
  LightBulbIcon,
} from '@heroicons/react/24/outline';
import AdminTutorialModal from '@/app/admin/components/AdminTutorialModal';

interface PointageExpressTutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartTour?: () => void;
}

export default function PointageExpressTutorialModal({
  isOpen,
  onClose,
  onStartTour,
}: PointageExpressTutorialModalProps): React.ReactElement | null {
  const tabs = [
    {
      id: 'touch_flow',
      label: '1. Émargement Tactile',
      badge: 'Débutant',
      icon: HandRaisedIcon,
      content: (
        <div className="space-y-4">
          <div className="rounded-md border border-line dark:border-night-line bg-paper-2 dark:bg-night-2 p-4 text-xs sm:text-sm text-ink dark:text-snow leading-relaxed">
            Le <strong>Pointage Express</strong> est conçu pour une utilisation tactile sur le terrain (Place de la Féchère, Blanmont) depuis un smartphone ou une tablette entre 08h45 et 09h00 avant le départ du peloton.
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-md border border-line dark:border-night-line bg-paper dark:bg-night space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand text-white font-extrabold text-xs">
                  1
                </span>
                <h4 className="font-bold text-ink dark:text-white text-xs uppercase tracking-wider font-narrow">
                  1 Tap pour Pointer
                </h4>
              </div>
              <p className="text-ink-3 dark:text-snow-3 text-xs leading-relaxed">
                Touchez la case à cocher d&apos;un cycliste pour l&apos;émarger au départ. Le compteur global et le compteur de son groupe (A, B, C ou VTT) s&apos;incrémentent instantanément.
              </p>
            </div>

            <div className="p-3.5 rounded-md border border-line dark:border-night-line bg-paper dark:bg-night space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-hydro text-white font-extrabold text-xs">
                  2
                </span>
                <h4 className="font-bold text-ink dark:text-white text-xs uppercase tracking-wider font-narrow">
                  Choix de la Sortie
                </h4>
              </div>
              <p className="text-ink-3 dark:text-snow-3 text-xs leading-relaxed">
                Le sélecteur se positionne automatiquement sur la sortie du jour (ou la plus proche à venir). Vous pouvez également pointer rétroactivement une sortie passée.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-md border border-line dark:border-night-line bg-paper dark:bg-night space-y-1.5">
            <h4 className="font-bold text-ink dark:text-white text-xs uppercase tracking-wider font-narrow">
              Filtres Rapides &amp; Recherche
            </h4>
            <p className="text-ink-3 dark:text-snow-3 text-xs leading-relaxed">
              Utilisez la barre de recherche par nom ou les onglets rapides <em>(Tous, Pointés, Non pointés, Groupe A, Groupe B, Groupe C, VTT)</em> pour retrouver un coureur sans faire défiler tout l&apos;annuaire.
            </p>
          </div>

          <div className="rounded-md border border-vert/30 bg-vert/5 p-4 flex items-start gap-3">
            <LightBulbIcon className="h-5 w-5 text-vert shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold text-ink dark:text-white text-xs">Astuce terrain pour les capitaines :</span>
              <p className="text-xs text-ink-3 dark:text-snow-3">
                Un retour haptique (légère vibration) confirme chaque pointage sur les smartphones compatibles. Même avec des gants légers de mi-saison, le bouton est largement calibré.
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'qr_pass',
      label: '2. Pass Numérique & QR',
      badge: 'Confirmé',
      icon: QrCodeIcon,
      content: (
        <div className="space-y-4">
          <div className="rounded-md border border-line dark:border-night-line bg-paper-2 dark:bg-night-2 p-4 text-xs sm:text-sm text-ink dark:text-snow leading-relaxed">
            Chaque membre inscrit dispose d&apos;un <strong>Pass Numérique officiel</strong> accessible sur son profil membre (<span className="font-mono text-brand text-xs">/profile/pass</span>) pouvant être ajouté à l&apos;écran d&apos;accueil de son smartphone.
          </div>

          <div className="space-y-3">
            <div className="p-3.5 rounded-md border border-line dark:border-night-line bg-paper dark:bg-night space-y-2">
              <div className="flex items-center gap-2">
                <DevicePhoneMobileIcon className="h-4 w-4 text-hydro" />
                <h4 className="font-bold text-ink dark:text-white text-xs uppercase tracking-wider font-narrow">
                  Validation Automatique par Caméra
                </h4>
              </div>
              <p className="text-ink-3 dark:text-snow-3 text-xs leading-relaxed">
                Le coureur présente son QR Code « Départ ». En le scannant avec l&apos;appareil photo d&apos;un smartphone capitaine, l&apos;URL spéciale ouvre directement le Pointage Express et émerge le membre instantanément avec un badge vert.
              </p>
            </div>

            <div className="p-3.5 rounded-md border border-line dark:border-night-line bg-paper dark:bg-night space-y-2">
              <div className="flex items-center gap-2">
                <QrCodeIcon className="h-4 w-4 text-brand" />
                <h4 className="font-bold text-ink dark:text-white text-xs uppercase tracking-wider font-narrow">
                  Zéro Erreur d&apos;Homonymie
                </h4>
              </div>
              <p className="text-ink-3 dark:text-snow-3 text-xs leading-relaxed">
                Le QR Code intègre l&apos;identifiant unique Firebase du membre, évitant toute confusion entre coureurs portant le même nom ou prénom.
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'ice_carre_vert',
      label: '3. Fiches ICE & Carré Vert',
      badge: 'Avancé',
      icon: ShieldCheckIcon,
      content: (
        <div className="space-y-4">
          <div className="rounded-md border border-line dark:border-night-line bg-paper-2 dark:bg-night-2 p-4 text-xs sm:text-sm text-ink dark:text-snow leading-relaxed">
            Au-delà du simple pointage, l&apos;outil constitue la <strong>première ligne de sécurité</strong> du peloton en cas d&apos;incident de parcours.
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-md border border-line dark:border-night-line bg-paper dark:bg-night space-y-2">
              <div className="flex items-center gap-2">
                <PhoneIcon className="h-4 w-4 text-brand" />
                <h4 className="font-bold text-ink dark:text-white text-xs uppercase tracking-wider font-narrow">
                  Fiche Médicale &amp; Secours ICE
                </h4>
              </div>
              <p className="text-ink-3 dark:text-snow-3 text-xs leading-relaxed">
                En cas de chute ou malaise, touchez l&apos;icône de bouclier sur la ligne d&apos;un membre : le numéro de licence FFBC et le contact d&apos;urgence à appeler s&apos;affichent avec un lien téléphonique direct.
              </p>
            </div>

            <div className="p-3.5 rounded-md border border-line dark:border-night-line bg-paper dark:bg-night space-y-2">
              <div className="flex items-center gap-2">
                <TrophyIcon className="h-4 w-4 text-vert" />
                <h4 className="font-bold text-ink dark:text-white text-xs uppercase tracking-wider font-narrow">
                  Alimentation du Carré Vert
                </h4>
              </div>
              <p className="text-ink-3 dark:text-snow-3 text-xs leading-relaxed">
                Chaque pointage enregistré sur le terrain alimente immédiatement la base de données Firebase et incrémente le classement annuel d&apos;assiduité visible sur <span className="font-mono text-vert text-xs">/leaderboard</span>.
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
      onStartTour={onStartTour ? () => {
        onClose();
        onStartTour();
      } : undefined}
      title="Guide du Pointage Express"
      badge="Terrain & Départ"
      subtitle="Émargement fluide au rassemblement du samedi matin, scan QR et gestion des urgences ICE."
      icon={BoltIcon}
      iconColorClass="bg-brand/10 text-brand border-brand/30"
      tabs={tabs}
      tourButtonLabel="Lancer la visite tactile"
    />
  );
}
