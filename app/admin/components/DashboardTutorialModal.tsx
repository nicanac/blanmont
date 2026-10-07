'use client';

import React from 'react';
import {
  AcademicCapIcon,
  ChatBubbleLeftRightIcon,
  SparklesIcon,
  CommandLineIcon,
  ClipboardDocumentCheckIcon,
  LightBulbIcon,
  UsersIcon,
  CalendarDaysIcon,
} from '@heroicons/react/24/outline';
import AdminTutorialModal from '@/app/admin/components/AdminTutorialModal';

interface DashboardTutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartTour?: () => void;
}

export default function DashboardTutorialModal({
  isOpen,
  onClose,
  onStartTour,
}: DashboardTutorialModalProps): React.ReactElement | null {
  const tabs = [
    {
      id: 'hq_overview',
      label: '1. Quartier Général & Rituels',
      badge: 'Débutant',
      icon: AcademicCapIcon,
      content: (
        <div className="space-y-4">
          <div className="rounded-md border border-line dark:border-night-line bg-paper-2 dark:bg-night-2 p-4 text-xs sm:text-sm text-ink dark:text-snow leading-relaxed">
            Bienvenue au <strong>Quartier Général du CC Saint-Martin Blanmont</strong>. C&apos;est le poste de commandement des opérations du club, conçu pour orchestrer la saison cycliste avec précision et fluidité.
          </div>

          <div className="space-y-3">
            <div className="p-3.5 rounded-md border border-line dark:border-night-line bg-paper dark:bg-night space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand text-white font-extrabold text-xs">
                  1
                </span>
                <h4 className="font-bold text-ink dark:text-white text-xs uppercase tracking-wider font-narrow">
                  Rythme Hebdomadaire Incontournable
                </h4>
              </div>
              <p className="text-ink-3 dark:text-snow-3 text-xs leading-relaxed">
                Le club vit au rythme de la semaine : sondage lancé le lundi, votes du peloton jusqu&apos;au vendredi 18h, briefing WhatsApp partagé en soirée, et rassemblement à 09h00 le samedi matin Place de la Féchère.
              </p>
            </div>

            <div className="p-3.5 rounded-md border border-line dark:border-night-line bg-paper dark:bg-night space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-vert text-white font-extrabold text-xs">
                  2
                </span>
                <h4 className="font-bold text-ink dark:text-white text-xs uppercase tracking-wider font-narrow">
                  Guide de Prise en Main Interactif
                </h4>
              </div>
              <p className="text-ink-3 dark:text-snow-3 text-xs leading-relaxed">
                La checklist au sommet de votre écran suit en temps réel la configuration du club (sondage actif, sorties planifiées, membres inscrits). Vous pouvez cocher chaque étape à votre rythme.
              </p>
            </div>
          </div>

          <div className="rounded-md border border-vert/30 bg-vert/5 p-4 flex items-start gap-3">
            <LightBulbIcon className="h-5 w-5 text-vert shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold text-ink dark:text-white text-xs">Astuce pour démarrer :</span>
              <p className="text-xs text-ink-3 dark:text-snow-3 leading-relaxed">
                Si vous êtes nouvellement nommé capitaine ou secrétaire, commencez par consulter les <strong>Membres</strong> pour vous familiariser avec l&apos;effectif des pelotons A, B, C et VTT.
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'briefing_ops',
      label: '2. Briefing WhatsApp & Commandement',
      badge: 'Confirmé',
      icon: SparklesIcon,
      content: (
        <div className="space-y-4">
          <div className="rounded-md border border-line dark:border-night-line bg-paper-2 dark:bg-night-2 p-4 text-xs sm:text-sm text-ink dark:text-snow leading-relaxed">
            Le bloc central <strong>« Poste de Commandement »</strong> regroupe toutes les informations logistiques de la prochaine sortie officielle.
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-md border border-line dark:border-night-line bg-paper dark:bg-night space-y-2">
              <div className="flex items-center gap-2">
                <SparklesIcon className="h-4 w-4 text-brand" />
                <h4 className="font-bold text-ink dark:text-white text-xs uppercase tracking-wider font-narrow">
                  Générateur de Briefing WhatsApp
                </h4>
              </div>
              <p className="text-ink-3 dark:text-snow-3 text-xs leading-relaxed">
                Cliquez sur <strong>« Briefing WhatsApp »</strong> : la plateforme compile automatiquement l&apos;effectif du weekend, la répartition des groupes (A, B, C, VTT), l&apos;heure de rendez-vous et le lien GPX officiel.
              </p>
            </div>

            <div className="p-3.5 rounded-md border border-line dark:border-night-line bg-paper dark:bg-night space-y-2">
              <div className="flex items-center gap-2">
                <UsersIcon className="h-4 w-4 text-ambre" />
                <h4 className="font-bold text-ink dark:text-white text-xs uppercase tracking-wider font-narrow">
                  Alerte Candidatures Sorties d’Essai
                </h4>
              </div>
              <p className="text-ink-3 dark:text-snow-3 text-xs leading-relaxed">
                Dès qu&apos;un nouveau cycliste postule via <span className="font-mono text-xs text-brand">/rejoindre</span>, un encart ambre apparaît au QG pour désigner un capitaine mentor sans délai.
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'shortcuts_palette',
      label: '3. Raccourcis Clavier & Outils',
      badge: 'Avancé',
      icon: CommandLineIcon,
      content: (
        <div className="space-y-4">
          <div className="rounded-md border border-line dark:border-night-line bg-paper-2 dark:bg-night-2 p-4 text-xs sm:text-sm text-ink dark:text-snow leading-relaxed">
            Gagnez un temps précieux grâce aux commandes rapides et à la palette universelle :
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-md border border-line dark:border-night-line bg-paper dark:bg-night space-y-2">
              <div className="flex items-center gap-2">
                <CommandLineIcon className="h-4 w-4 text-hydro" />
                <h4 className="font-bold text-ink dark:text-white text-xs uppercase tracking-wider font-narrow">
                  Palette de Commandes (Cmd + K / Ctrl + K)
                </h4>
              </div>
              <p className="text-ink-3 dark:text-snow-3 text-xs leading-relaxed">
                Ouvrez la recherche globale n&apos;importe où dans l&apos;admin pour basculer vers un module, créer une sortie ou chercher un adhérent en un instant.
              </p>
            </div>

            <div className="p-3.5 rounded-md border border-line dark:border-night-line bg-paper dark:bg-night space-y-2">
              <div className="flex items-center gap-2">
                <ClipboardDocumentCheckIcon className="h-4 w-4 text-vert" />
                <h4 className="font-bold text-ink dark:text-white text-xs uppercase tracking-wider font-narrow">
                  Pointage Express Départ
                </h4>
              </div>
              <p className="text-ink-3 dark:text-snow-3 text-xs leading-relaxed">
                Depuis le lien rapide sous le commandement, lancez l&apos;émargement tactile optimisé smartphone pour valider les présences au départ du peloton.
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
      title="Guide du Quartier Général"
      badge="Tableau de Bord"
      subtitle="Maîtrisez les opérations du club, le poste de commandement du peloton et les outils rapides."
      icon={AcademicCapIcon}
      iconColorClass="bg-brand/10 text-brand border-brand/30"
      tabs={tabs}
      tourButtonLabel="Lancer la visite interactive"
    />
  );
}
