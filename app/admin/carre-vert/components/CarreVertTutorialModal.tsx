'use client';

import React from 'react';
import {
  TrophyIcon,
  CheckBadgeIcon,
  TableCellsIcon,
  UserGroupIcon,
  ArrowPathIcon,
  ShieldCheckIcon,
  LightBulbIcon,
} from '@heroicons/react/24/outline';
import AdminTutorialModal from '@/app/admin/components/AdminTutorialModal';

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
  const tabs = [
    {
      id: 'principles',
      label: '1. Principe & Points',
      icon: CheckBadgeIcon,
      content: (
        <div className="space-y-4">
          <div className="rounded-lg border border-night-line bg-night-2 p-4 text-snow-3 leading-relaxed">
            Le <strong>Carré Vert</strong> est le trophée d&apos;assiduité historique du CC Saint-Martin Blanmont. Il récompense la régularité des cyclistes aux sorties officielles du calendrier tout au long de la saison.
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-4 rounded-md border border-night-line bg-night-2 space-y-2">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-vert text-white font-extrabold text-xs">
                  1
                </span>
                <h4 className="font-bold text-white text-xs uppercase tracking-wider font-narrow">
                  1 Point par Sortie
                </h4>
              </div>
              <p className="text-snow-3 text-xs leading-relaxed">
                Chaque participation validée à une sortie officielle programmée au calendrier rapporte 1 point d&apos;assiduité (le fameux « Carré Vert »).
              </p>
            </div>

            <div className="p-4 rounded-md border border-night-line bg-night-2 space-y-2">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-hydro text-white font-extrabold text-xs">
                  G
                </span>
                <h4 className="font-bold text-white text-xs uppercase tracking-wider font-narrow">
                  Classement Global &amp; Groupes
                </h4>
              </div>
              <p className="text-snow-3 text-xs leading-relaxed">
                Le classement public (<span className="text-white font-mono">/leaderboard</span>) affiche les cyclistes selon leur rang global et leur groupe de vitesse (A, B, C).
              </p>
            </div>
          </div>

          <div className="rounded-lg border border-night-line bg-night-2 p-4 flex items-start gap-3">
            <LightBulbIcon className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold text-white text-xs">Règle de fin de saison :</span>
              <p className="text-xs text-snow-3">
                En fin d&apos;année, les lauréats du Carré Vert sont mis à l&apos;honneur lors de l&apos;Assemblée Générale du club avec remise de récompenses officielles.
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'cron_sheets',
      label: '2. Scraping Cron & Google Sheets',
      icon: TableCellsIcon,
      content: (
        <div className="space-y-4">
          <div className="rounded-lg border border-night-line bg-night-2 p-4 text-snow-3 leading-relaxed">
            Le club maintient historiquement un tableur Google Sheets pour le suivi des présences. La plateforme dispose d&apos;un <strong>système de scraping automatisé</strong> qui synchronise en continu les données.
          </div>

          <div className="space-y-3">
            <div className="p-3.5 rounded-lg border border-night-line bg-night-2 space-y-1">
              <div className="flex items-center gap-2">
                <ArrowPathIcon className="h-4 w-4 text-emerald-400" />
                <span className="font-bold text-white text-xs uppercase tracking-wider">
                  La Tâche Cron Automatique (/api/cron/sync-leaderboard)
                </span>
              </div>
              <p className="text-snow-3 text-xs leading-relaxed">
                Un job Vercel Cron s&apos;exécute périodiquement. Il télécharge le flux CSV exporté de la feuille de calcul Google Sheets, extrait les colonnes de dates formatées <span className="text-white font-mono font-bold">JJ/MM</span> pour la saison 2026, et associe chaque coche aux membres correspondants.
              </p>
            </div>

            <div className="p-3.5 rounded-lg border border-night-line bg-night-2 space-y-1">
              <div className="flex items-center gap-2">
                <TableCellsIcon className="h-4 w-4 text-sky-400" />
                <span className="font-bold text-white text-xs uppercase tracking-wider">
                  Bouton « Synchroniser le Carré Vert »
                </span>
              </div>
              <p className="text-snow-3 text-xs leading-relaxed">
                Si le secrétaire ou le président vient de modifier le tableur Google Sheets, vous n&apos;avez pas besoin d&apos;attendre le cron : cliquez sur le bouton vert <strong>« Synchroniser »</strong> en haut de page pour lancer l&apos;ingestion immédiate.
              </p>
            </div>

            <div className="p-3.5 rounded-lg border border-night-line bg-night-2 space-y-1">
              <div className="flex items-center gap-2">
                <ShieldCheckIcon className="h-4 w-4 text-amber-400" />
                <span className="font-bold text-white text-xs uppercase tracking-wider">
                  Recalcul Automatique &amp; Sécurité
                </span>
              </div>
              <p className="text-snow-3 text-xs leading-relaxed">
                Lors de chaque synchronisation, les doublons sont éliminés, les totaux de points sont recalculés de manière déterministe et le classement en ligne est rafraîchi instantanément.
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'attendance',
      label: '3. Pointage des Présences',
      icon: UserGroupIcon,
      content: (
        <div className="space-y-4">
          <div className="rounded-lg border border-night-line bg-night-2 p-4 text-snow-3 leading-relaxed">
            En plus de la synchronisation avec le tableur Google Sheets, les administrateurs et capitaines de route peuvent <strong>pointer les présences directement depuis cette interface web</strong> après chaque sortie.
          </div>

          <div className="space-y-3">
            <div className="p-3.5 rounded-lg border border-night-line bg-night-2 space-y-1">
              <h4 className="font-bold text-white text-xs">1. Sélectionner l&apos;Événement</h4>
              <p className="text-snow-3 text-xs">
                Dans la colonne de gauche, cliquez sur la date de la sortie (ex. Samedi 15 mars).
              </p>
            </div>

            <div className="p-3.5 rounded-lg border border-night-line bg-night-2 space-y-1">
              <h4 className="font-bold text-white text-xs">2. Cocher les Cyclistes Présents</h4>
              <p className="text-snow-3 text-xs">
                Dans le panneau de droite, cochez les cases des membres ayant participé, filtrables par groupe (Groupe A, B, C, etc.).
              </p>
            </div>

            <div className="p-3.5 rounded-lg border border-night-line bg-night-2 space-y-1">
              <h4 className="font-bold text-white text-xs">3. Sauvegarde Temps Réel</h4>
              <p className="text-snow-3 text-xs">
                Chaque pointage est enregistré instantanément dans la base de données Firebase et met à jour le profil du membre.
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
      title="Guide du Carré Vert & Synchronisation"
      badge="Challenge Club"
      icon={TrophyIcon}
      iconColorClass="bg-bois/40 text-vert border-vert/40"
      tabs={tabs}
    />
  );
}
