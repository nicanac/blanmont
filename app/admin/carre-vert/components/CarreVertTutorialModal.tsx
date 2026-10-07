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
  CalendarDaysIcon,
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
      label: '1. Règles & Challenge',
      badge: 'Débutant',
      icon: CheckBadgeIcon,
      content: (
        <div className="space-y-4">
          <div className="rounded-md border border-line dark:border-night-line bg-paper-2 dark:bg-night-2 p-4 text-xs sm:text-sm text-ink dark:text-snow leading-relaxed">
            Le <strong>Carré Vert</strong> est le trophée d&apos;assiduité historique du CC Saint-Martin Blanmont. Il récompense la régularité et la fidélité des cyclistes aux sorties officielles du calendrier tout au long de la saison.
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-md border border-vert/30 bg-vert/5 space-y-2">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-vert text-white font-extrabold text-xs">
                  1
                </span>
                <h4 className="font-bold text-vert dark:text-vert-strong text-xs uppercase tracking-wider font-narrow">
                  1 Point par Sortie
                </h4>
              </div>
              <p className="text-ink-3 dark:text-snow-3 text-xs leading-relaxed">
                Chaque participation validée à une sortie officielle programmée au calendrier rapporte <strong>1 point d&apos;assiduité</strong> (le fameux « Carré Vert »), avec un maximum de 1 point par weekend.
              </p>
            </div>

            <div className="p-3.5 rounded-md border border-hydro/30 bg-hydro/5 space-y-2">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-hydro text-white font-extrabold text-xs">
                  G
                </span>
                <h4 className="font-bold text-hydro text-xs uppercase tracking-wider font-narrow">
                  Classement en Ligne
                </h4>
              </div>
              <p className="text-ink-3 dark:text-snow-3 text-xs leading-relaxed">
                Le classement public (<span className="text-brand font-mono text-xs">/leaderboard</span>) affiche les cyclistes par rang global, avec des filtres par groupe de niveau (Groupe A, B, C, VTT).
              </p>
            </div>
          </div>

          <div className="rounded-md border border-ambre/30 bg-ambre/5 p-4 flex items-start gap-3">
            <LightBulbIcon className="h-5 w-5 text-ambre shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold text-ink dark:text-white text-xs">Règle de fin de saison :</span>
              <p className="text-xs text-ink-3 dark:text-snow-3">
                En fin d&apos;année, les lauréats du Carré Vert sont mis à l&apos;honneur lors de l&apos;Assemblée Générale du club avec remise de récompenses officielles et attribution du maillot d&apos;assiduité.
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'cron_sheets',
      label: '2. Synchronisation Sheets & Cron',
      badge: 'Confirmé',
      icon: TableCellsIcon,
      content: (
        <div className="space-y-4">
          <div className="rounded-md border border-line dark:border-night-line bg-paper-2 dark:bg-night-2 p-4 text-xs sm:text-sm text-ink dark:text-snow leading-relaxed">
            Le club maintient un tableur Google Sheets pour le suivi des présences. La plateforme dispose d&apos;une <strong>double passerelle d&apos;ingestion</strong> : cron automatique et synchronisation manuelle instantanée.
          </div>

          <div className="space-y-3">
            <div className="p-3.5 rounded-md border border-line dark:border-night-line bg-paper dark:bg-night space-y-1">
              <div className="flex items-center gap-2">
                <ArrowPathIcon className="h-4 w-4 text-vert" />
                <span className="font-bold text-ink dark:text-white text-xs uppercase tracking-wider font-narrow">
                  La Tâche Cron Automatique (/api/cron/sync-leaderboard)
                </span>
              </div>
              <p className="text-ink-3 dark:text-snow-3 text-xs leading-relaxed">
                Un job cron s&apos;exécute périodiquement. Il télécharge le flux CSV exporté de la feuille de calcul Google Sheets, extrait les colonnes de dates formatées <span className="font-mono text-xs font-bold text-ink dark:text-white">JJ/MM</span> pour la saison 2026, et associe chaque coche aux membres correspondants.
              </p>
            </div>

            <div className="p-3.5 rounded-md border border-line dark:border-night-line bg-paper dark:bg-night space-y-1">
              <div className="flex items-center gap-2">
                <TableCellsIcon className="h-4 w-4 text-hydro" />
                <span className="font-bold text-ink dark:text-white text-xs uppercase tracking-wider font-narrow">
                  Bouton « Synchroniser le Carré Vert »
                </span>
              </div>
              <p className="text-ink-3 dark:text-snow-3 text-xs leading-relaxed">
                Si le secrétaire ou le président vient de modifier le tableur Google Sheets, vous n&apos;avez pas besoin d&apos;attendre le cron : cliquez sur le bouton vert <strong>« Synchroniser »</strong> en haut de page pour lancer l&apos;ingestion immédiate.
              </p>
            </div>

            <div className="p-3.5 rounded-md border border-line dark:border-night-line bg-paper dark:bg-night space-y-1">
              <div className="flex items-center gap-2">
                <ShieldCheckIcon className="h-4 w-4 text-ambre" />
                <span className="font-bold text-ink dark:text-white text-xs uppercase tracking-wider font-narrow">
                  Recalcul Automatique &amp; Déduplication
                </span>
              </div>
              <p className="text-ink-3 dark:text-snow-3 text-xs leading-relaxed">
                Lors de chaque synchronisation, les doublons sont éliminés, les totaux de points sont recalculés de manière déterministe et le classement en ligne est rafraîchi instantanément.
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'seasons_hall_of_fame',
      label: '3. Multi-Saisons & Hall of Fame',
      badge: 'Avancé',
      icon: TrophyIcon,
      content: (
        <div className="space-y-4">
          <div className="rounded-md border border-line dark:border-night-line bg-paper-2 dark:bg-night-2 p-4 text-xs sm:text-sm text-ink dark:text-snow leading-relaxed">
            Le système gère l&apos;<strong>historique complet du club</strong> avec sélecteur de saison et Panthéon des légendes de Blanmont.
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-md border border-line dark:border-night-line bg-paper dark:bg-night space-y-1.5">
              <div className="flex items-center gap-2">
                <CalendarDaysIcon className="h-4 w-4 text-brand" />
                <h4 className="font-bold text-ink dark:text-white text-xs uppercase tracking-wider font-narrow">
                  Archives 2025, 2026 &amp; Saisons Futures
                </h4>
              </div>
              <p className="text-ink-3 dark:text-snow-3 text-xs leading-relaxed">
                Le sélecteur de saison sur la page publique permet de consulter le palmarès figé des années précédentes tout en suivant le classement actif de la saison en cours.
              </p>
            </div>

            <div className="p-3.5 rounded-md border border-line dark:border-night-line bg-paper dark:bg-night space-y-1.5">
              <div className="flex items-center gap-2">
                <TrophyIcon className="h-4 w-4 text-ambre" />
                <h4 className="font-bold text-ink dark:text-white text-xs uppercase tracking-wider font-narrow">
                  Hall of Fame (Panthéon)
                </h4>
              </div>
              <p className="text-ink-3 dark:text-snow-3 text-xs leading-relaxed">
                Le Hall of Fame cumule l&apos;ensemble des points acquis par chaque coureur depuis sa première adhésion au club, immortalisant l&apos;engagement des vétérans.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-md border border-line dark:border-night-line bg-paper-2 dark:bg-night-2 space-y-1.5">
            <div className="flex items-center gap-2">
              <UserGroupIcon className="h-4 w-4 text-vert" />
              <h4 className="font-bold text-ink dark:text-white text-xs uppercase tracking-wider font-narrow">
                Pointage Direct sur le Web
              </h4>
            </div>
            <p className="text-ink-3 dark:text-snow-3 text-xs leading-relaxed">
              En plus du tableur Sheets, vous pouvez pointer les cyclistes directement depuis le panneau latéral de cette page ou via le <strong>Pointage Express</strong> sur smartphone au départ.
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
      title="Guide du Carré Vert & Synchronisation"
      badge="Challenge Club"
      subtitle="Maîtrisez le challenge d'assiduité du club, le scraping Google Sheets et l'historique multi-saisons."
      icon={TrophyIcon}
      iconColorClass="bg-vert/10 text-vert border-vert/30"
      tabs={tabs}
      tourButtonLabel="Lancer la visite interactive"
    />
  );
}
