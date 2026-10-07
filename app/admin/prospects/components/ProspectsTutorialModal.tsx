'use client';

import React from 'react';
import {
  UserPlusIcon,
  ClockIcon,
  SparklesIcon,
  CheckBadgeIcon,
  ArrowDownTrayIcon,
  LightBulbIcon,
  PhoneIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';
import AdminTutorialModal from '@/app/admin/components/AdminTutorialModal';

interface ProspectsTutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartTour?: () => void;
}

export default function ProspectsTutorialModal({
  isOpen,
  onClose,
  onStartTour,
}: ProspectsTutorialModalProps): React.ReactElement | null {
  const tabs = [
    {
      id: 'onboarding',
      label: '1. Accueil & 1ère Sortie',
      badge: 'Débutant',
      icon: UserPlusIcon,
      content: (
        <div className="space-y-4">
          <div className="rounded-md border border-line dark:border-night-line bg-paper-2 dark:bg-night-2 p-4 text-xs sm:text-sm text-ink dark:text-snow leading-relaxed">
            Le CRM des candidatures centralise les demandes de cyclistes ayant rempli le formulaire public <span className="font-mono text-brand text-xs">/rejoindre</span> pour découvrir le peloton du CC Saint-Martin Blanmont.
          </div>

          <div className="space-y-3">
            <div className="p-3.5 rounded-md border border-line dark:border-night-line bg-paper dark:bg-night space-y-1.5">
              <div className="flex items-center gap-2">
                <ClockIcon className="h-4 w-4 text-ambre" />
                <h4 className="font-bold text-ink dark:text-white text-xs uppercase tracking-wider font-narrow">
                  Premier Contact sous 48h
                </h4>
              </div>
              <p className="text-ink-3 dark:text-snow-3 text-xs leading-relaxed">
                Appelez ou envoyez un message au candidat pour faire connaissance, évaluer son niveau sportif (allure moyenne, habitude du peloton) et répondre à ses questions.
              </p>
            </div>

            <div className="p-3.5 rounded-md border border-line dark:border-night-line bg-paper dark:bg-night space-y-1.5">
              <div className="flex items-center gap-2">
                <ShieldCheckIcon className="h-4 w-4 text-hydro" />
                <h4 className="font-bold text-ink dark:text-white text-xs uppercase tracking-wider font-narrow">
                  Consignes de Sécurité pour la Sortie d&apos;Essai
                </h4>
              </div>
              <p className="text-ink-3 dark:text-snow-3 text-xs leading-relaxed">
                Rappelez les indispensables : casque rigide obligatoire, vélo en bon état mécanique, nécessaire de réparation (chambre à air, pompe) et rendez-vous à 08h50 sur la place communale.
              </p>
            </div>
          </div>

          <div className="rounded-md border border-vert/30 bg-vert/5 p-4 flex items-start gap-3">
            <LightBulbIcon className="h-5 w-5 text-vert shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold text-ink dark:text-white text-xs">Règle fédérale des essais :</span>
              <p className="text-xs text-ink-3 dark:text-snow-3 leading-relaxed">
                La fédération autorise jusqu&apos;à <strong>3 sorties d&apos;essai sans engagement</strong> avant obligation de souscrire la licence et la cotisation annuelle du club.
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'pipeline',
      label: '2. Pipeline & Parrainage',
      badge: 'Confirmé',
      icon: SparklesIcon,
      content: (
        <div className="space-y-4">
          <div className="rounded-md border border-line dark:border-night-line bg-paper-2 dark:bg-night-2 p-4 text-xs sm:text-sm text-ink dark:text-snow leading-relaxed">
            Suivez la progression de chaque candidat à travers le pipeline de recrutement du club :
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 rounded-md border border-ambre/30 bg-ambre/5 space-y-1">
              <span className="font-bold text-ambre text-xs uppercase tracking-wider font-narrow">
                1. À contacter
              </span>
              <p className="text-ink-3 dark:text-snow-3 text-xs leading-relaxed">
                Nouveau dossier reçu. Aucun contact n&apos;a encore été établi par le comité.
              </p>
            </div>

            <div className="p-3 rounded-md border border-hydro/30 bg-hydro/5 space-y-1">
              <span className="font-bold text-hydro text-xs uppercase tracking-wider font-narrow">
                2. Contacté
              </span>
              <p className="text-ink-3 dark:text-snow-3 text-xs leading-relaxed">
                Échange téléphonique ou email effectué. Sortie d&apos;essai planifiée.
              </p>
            </div>

            <div className="p-3 rounded-md border border-brand/30 bg-brand/5 space-y-1">
              <span className="font-bold text-brand text-xs uppercase tracking-wider font-narrow">
                3. Sorties 1, 2, 3
              </span>
              <p className="text-ink-3 dark:text-snow-3 text-xs leading-relaxed">
                Candidat en phase d&apos;immersion dans le peloton. Capitaine mentor désigné.
              </p>
            </div>

            <div className="p-3 rounded-md border border-vert/30 bg-vert/5 space-y-1">
              <span className="font-bold text-vert dark:text-vert-strong text-xs uppercase tracking-wider font-narrow">
                4. Converti Membre
              </span>
              <p className="text-ink-3 dark:text-snow-3 text-xs leading-relaxed">
                Essai validé ! Cotisation réglée et compte adhérent officiel créé dans l&apos;annuaire.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-md border border-line dark:border-night-line bg-paper dark:bg-night space-y-1.5">
            <h4 className="font-bold text-ink dark:text-white text-xs uppercase tracking-wider font-narrow">
              Désigner un Capitaine Mentor
            </h4>
            <p className="text-ink-3 dark:text-snow-3 text-xs leading-relaxed">
              Dans la fiche détaillée du candidat, assignez un capitaine de route référent. C&apos;est lui qui accueillera le cycliste le samedi matin à la Féchère et veillera sur son intégration en peloton.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 'export_conversion',
      label: '3. Conversion & Export CSV',
      badge: 'Avancé',
      icon: CheckBadgeIcon,
      content: (
        <div className="space-y-4">
          <div className="rounded-md border border-line dark:border-night-line bg-paper-2 dark:bg-night-2 p-4 text-xs sm:text-sm text-ink dark:text-snow leading-relaxed">
            Une fois la période d&apos;essai concluante, finalisez l&apos;adhésion sans ressaisie fastidieuse :
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-md border border-line dark:border-night-line bg-paper dark:bg-night space-y-2">
              <div className="flex items-center gap-2">
                <CheckBadgeIcon className="h-4 w-4 text-vert" />
                <h4 className="font-bold text-ink dark:text-white text-xs uppercase tracking-wider font-narrow">
                  Conversion en Membre Officiel
                </h4>
              </div>
              <p className="text-ink-3 dark:text-snow-3 text-xs leading-relaxed">
                Passez le statut à « Converti Membre ». Vous pouvez ensuite créer son compte officiel dans l&apos;annuaire avec son email et son groupe de prédilection pré-remplis.
              </p>
            </div>

            <div className="p-3.5 rounded-md border border-line dark:border-night-line bg-paper dark:bg-night space-y-2">
              <div className="flex items-center gap-2">
                <ArrowDownTrayIcon className="h-4 w-4 text-brand" />
                <h4 className="font-bold text-ink dark:text-white text-xs uppercase tracking-wider font-narrow">
                  Export CSV pour le Secrétariat
                </h4>
              </div>
              <p className="text-ink-3 dark:text-snow-3 text-xs leading-relaxed">
                Cliquez sur <strong>« Exporter CSV »</strong> pour télécharger l&apos;historique complet des demandes avec numéros de téléphone, emails et dates pour vos bilans de recrutement.
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
      title="Guide du CRM Candidatures & Sorties d’Essai"
      badge="CRM Recrutement"
      subtitle="Accompagnez les nouveaux cyclistes, assignez des parrains et convertissez les essais en adhésions."
      icon={UserPlusIcon}
      iconColorClass="bg-ambre/10 text-ambre border-ambre/30"
      tabs={tabs}
      tourButtonLabel="Lancer la visite interactive"
    />
  );
}
