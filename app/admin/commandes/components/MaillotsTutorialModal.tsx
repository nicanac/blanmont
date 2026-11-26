'use client';

import React from 'react';
import {
  BanknotesIcon,
  BuildingLibraryIcon,
  ExclamationTriangleIcon,
  ShieldCheckIcon,
  TruckIcon,
  ShoppingBagIcon,
} from '@heroicons/react/24/outline';
import { JerseyIcon } from '@/app/components/ui/CyclingIcons';
import AdminTutorialModal from '@/app/admin/components/AdminTutorialModal';

export type MaillotsTutorialTab = 'setup' | 'payments' | 'order' | 'delivery' | 'special';

interface MaillotsTutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Tab matching the page the button was clicked on. */
  initialTab?: MaillotsTutorialTab;
}

const CARD = 'p-3.5 rounded-md border border-line dark:border-night-line bg-paper dark:bg-night space-y-1';
const TITLE = 'font-bold text-ink dark:text-white text-xs uppercase tracking-wider font-narrow';
const TEXT = 'text-ink-3 dark:text-snow-3 text-xs leading-relaxed';
const INTRO =
  'rounded-md border border-line dark:border-night-line bg-paper-2 dark:bg-night-2 p-4 text-xs sm:text-sm text-ink dark:text-snow leading-relaxed';

function Step({ title, children }: { title: string; children: React.ReactNode }): React.ReactElement {
  return (
    <div className={CARD}>
      <h4 className={TITLE}>{title}</h4>
      <div className={TEXT}>{children}</div>
    </div>
  );
}

const REASONS: [string, string, string][] = [
  ['Sans référence', 'Communication oubliée, ou virement sans rapport (cotisation, sponsor…)', 'Retrouver la commande (nom, montant) puis « Associer à une commande », sinon « Ignorer »'],
  ['Référence inconnue', 'Faute de frappe dans la communication', 'Retrouver la commande puis « Associer », sinon « Ignorer »'],
  ['Montant différent', 'Trop ou trop peu payé', 'Contacter le membre ; associer un virement, rembourser l’excédent'],
  ['Déjà payée ou annulée', 'Double paiement ou commande annulée', 'Rembourser par virement bancaire puis « Ignorer »'],
];

export default function MaillotsTutorialModal({
  isOpen,
  onClose,
  initialTab,
}: MaillotsTutorialModalProps): React.ReactElement | null {
  const tabs = [
    {
      id: 'setup',
      label: '1. Préparer',
      badge: 'Essentiel',
      icon: BuildingLibraryIcon,
      content: (
        <div className="space-y-4">
          <div className={INTRO}>
            Chaque membre commande <strong>connecté</strong> et reçoit une <strong>communication structurée</strong> unique et un{' '}
            <strong>QR code</strong> de paiement. Vous importez ensuite le fichier <strong>CODA</strong> de la banque : les paiements corrects sont reconnus automatiquement.
          </div>
          <Step title="Une seule fois : le compte du club">
            Ouvrez <strong>Banque du club → Paiements — compte du club</strong> (en bas de la page Banque) : bénéficiaire, IBAN (vérifié) et BIC. Scannez le{' '}
            <strong>QR de test (1,00 €)</strong> avec une application bancaire, vérifiez les champs préremplis puis <strong>annulez</strong> le virement. Vérifiez aussi que la banque en ligne exporte les extraits au{' '}
            <strong>format CODA</strong> (sinon, demandez l’activation à l’agence). Sans compte configuré, les membres n’ont pas de QR code.
          </Step>
          <Step title="Ouvrir une commande groupée">
            <strong>Commandes Équipement → Commandes groupées</strong>, formulaire <strong>« Nouvelle commande groupée »</strong> en bas de page : titre, articles, date de clôture et, pour le stock du club, unités supplémentaires par taille. Annoncez-la avec le lien vers <span className="font-mono">/le-club/equipement</span>. Après la clôture, plus personne ne peut commander.
          </Step>
        </div>
      ),
    },
    {
      id: 'payments',
      label: '2. Paiements',
      badge: 'Essentiel',
      icon: BanknotesIcon,
      content: (
        <div className="space-y-4">
          <div className={INTRO}>
            À faire <strong>chaque semaine</strong> pendant la campagne, et <strong>toujours juste avant la clôture</strong>.
          </div>
          <Step title="Rapprocher : import CODA">
            Exportez les extraits CODA depuis la banque, puis <strong>Commandes Équipement → Banque</strong> : choisissez le fichier et cliquez <strong>Importer</strong>. Le résumé indique les mouvements <em>rapprochés</em> (commandes passées à « Payée »), les <em>doublons ignorés</em> (réimporter est sans risque) et ceux <em>à traiter</em>.
          </Step>
          <div className="overflow-x-auto rounded-md border border-line dark:border-night-line">
            <table className="w-full text-left text-xs">
              <thead className="bg-paper-2 dark:bg-night-2 font-narrow uppercase tracking-wider text-ink-3 dark:text-snow-3">
                <tr>
                  <th scope="col" className="p-2.5">Raison</th>
                  <th scope="col" className="p-2.5">Cause</th>
                  <th scope="col" className="p-2.5">Action</th>
                </tr>
              </thead>
              <tbody className="text-ink dark:text-snow">
                {REASONS.map(([reason, cause, action]) => (
                  <tr key={reason} className="border-t border-line dark:border-night-line align-top">
                    <th scope="row" className="p-2.5 font-bold">{reason}</th>
                    <td className="p-2.5">{cause}</td>
                    <td className="p-2.5">{action}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="rounded-md border border-ambre/30 bg-ambre/10 p-3.5 flex items-start gap-3">
            <ExclamationTriangleIcon className="h-5 w-5 text-ambre shrink-0" aria-hidden="true" />
            <p className={TEXT}>
              « Associer à une commande » marque la commande payée <strong>quel que soit le montant</strong> : vérifiez avant de cliquer. Paiement en espèces : <strong>Commandes Équipement</strong>, ligne de la commande, <strong>Marquer payé</strong>.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 'order',
      label: '3. Commander',
      badge: 'Confirmé',
      icon: ShoppingBagIcon,
      content: (
        <div className="space-y-3">
          <Step title="1. Dernier rapprochement">Importez une dernière fois le CODA (étape 2).</Step>
          <Step title="2. Clôturer">
            Ouvrez la commande groupée et cliquez <strong>Clôturer la commande</strong>. L’encadré orange « commandes non payées » liste celles qui sont exclues : relancez les membres ou annulez ces commandes.
          </Step>
          <Step title="3. Commander chez Gobik">
            <strong>Exporter CSV</strong> donne la matrice des tailles (membres payés + stock club) au format Gobik : envoyez-la à Gobik, puis cliquez <strong>Marquer commandée chez Gobik</strong>. La date apparaît chez chaque membre concerné.
          </Step>
        </div>
      ),
    },
    {
      id: 'delivery',
      label: '4. Distribuer',
      badge: 'Confirmé',
      icon: TruckIcon,
      content: (
        <div className="space-y-3">
          <Step title="Réception">
            Vérifiez les quantités avec la matrice puis cliquez <strong>Marquer reçue</strong> (confirmation demandée). Les unités supplémentaires entrent <strong>une seule fois</strong> au stock du club et les membres voient la date d’arrivée.
          </Step>
          <Step title="Remise">
            Section <strong>Remise aux membres</strong> (visible une fois la commande reçue), utilisable sur téléphone : cliquez <strong>Remis</strong> pour chaque membre.
          </Step>
          <Step title="Ventes depuis le stock">
            Le membre qui choisit <strong>Retrait du stock</strong> réserve l’article tout de suite (le stock diminue). Le paiement suit le même chemin (QR, CODA). Une fois payé, remettez l’article et cliquez <strong>Remis</strong> dans <strong>Commandes Équipement</strong>. Une commande annulée avant la remise rend l’article au stock ; l’inventaire se corrige dans <strong>Équipements Club</strong>.
          </Step>
        </div>
      ),
    },
    {
      id: 'special',
      label: '5. Cas particuliers',
      badge: 'Avancé',
      icon: ShieldCheckIcon,
      content: (
        <div className="space-y-3">
          <Step title="Annulations et remboursements">
            <strong>Annuler</strong> une commande non payée : rien d’autre à faire. Annuler une commande <strong>payée</strong> : l’application le signale, mais le <strong>remboursement se fait hors application</strong>, par virement depuis la banque du club.
          </Step>
          <Step title="Confidentialité">
            Seuls le nom du donneur d’ordre, les 4 derniers chiffres de son IBAN, la date, le montant et la communication sont conservés. Le fichier CODA n’est <strong>pas stocké</strong>. Seuls les administrateurs et les rôles autorisés à la section Commandes (le Trésorier par défaut) voient la page Banque.
          </Step>
        </div>
      ),
    },
  ];

  return (
    <AdminTutorialModal
      isOpen={isOpen}
      onClose={onClose}
      initialTab={initialTab}
      title="Guide Trésorier : maillots"
      badge="Commandes groupées"
      subtitle="Du compte du club à la remise des maillots : paiements, import CODA, commande Gobik."
      icon={JerseyIcon}
      iconColorClass="bg-ink text-white border-line dark:border-night-line"
      tabs={tabs}
    />
  );
}
