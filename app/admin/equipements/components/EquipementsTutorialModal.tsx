'use client';

import React from 'react';
import {
  TagIcon,
  CubeIcon,
  LightBulbIcon,
  ShoppingBagIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import { JerseyIcon } from '@/app/components/ui/CyclingIcons';
import AdminTutorialModal from '@/app/admin/components/AdminTutorialModal';

interface EquipementsTutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartTour: () => void;
}

export default function EquipementsTutorialModal({
  isOpen,
  onClose,
  onStartTour,
}: EquipementsTutorialModalProps): React.ReactElement | null {
  const tabs = [
    {
      id: 'catalog',
      label: '1. Catalogue Gobik',
      badge: 'Débutant',
      icon: JerseyIcon,
      content: (
        <div className="space-y-4">
          <div className="rounded-md border border-line dark:border-night-line bg-paper-2 dark:bg-night-2 p-4 text-xs sm:text-sm text-ink dark:text-snow leading-relaxed">
            Les tenues officielles du CC Saint-Martin Blanmont sont confectionnées par l&apos;équipementier <strong>Gobik</strong>. Vous administrez ici les articles visibles par les adhérents sur la boutique du club (<span className="text-brand font-mono text-xs">/le-club/equipement</span>).
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-md border border-line dark:border-night-line bg-paper dark:bg-night space-y-1">
              <h4 className="font-bold text-ink dark:text-white text-xs uppercase tracking-wider font-narrow">
                Photos &amp; Spécifications
              </h4>
              <p className="text-ink-3 dark:text-snow-3 text-xs leading-relaxed">
                Ajoutez des visuels nets (face et dos) des maillots, cuissards et vestes pour valoriser la coupe athlétique et les finitions techniques Gobik.
              </p>
            </div>

            <div className="p-3.5 rounded-md border border-line dark:border-night-line bg-paper dark:bg-night space-y-1">
              <h4 className="font-bold text-ink dark:text-white text-xs uppercase tracking-wider font-narrow">
                Catégories &amp; Tarifs Subventionnés
              </h4>
              <p className="text-ink-3 dark:text-snow-3 text-xs leading-relaxed">
                Classez chaque pièce <em>(Maillots, Cuissards, Vestes, Accessoires)</em> et appliquez le tarif préférentiel subventionné par le club.
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'stock',
      label: '2. Tailles & Inventaire',
      badge: 'Confirmé',
      icon: CubeIcon,
      content: (
        <div className="space-y-4">
          <div className="rounded-md border border-line dark:border-night-line bg-paper-2 dark:bg-night-2 p-4 text-xs sm:text-sm text-ink dark:text-snow leading-relaxed">
            Le stock physique du vestiaire club est décompté par taille standard : <span className="font-mono text-xs font-bold text-ink dark:text-white">XS, S, M, L, XL, 2XL</span>.
          </div>

          <div className="space-y-3">
            <div className="p-3.5 rounded-md border border-line dark:border-night-line bg-paper dark:bg-night space-y-1">
              <div className="flex items-center gap-2">
                <ArrowPathIcon className="h-4 w-4 text-hydro" />
                <h4 className="font-bold text-ink dark:text-white text-xs uppercase tracking-wider font-narrow">
                  Ajustement en 1 Clic
                </h4>
              </div>
              <p className="text-ink-3 dark:text-snow-3 text-xs leading-relaxed">
                Lors de la réception d&apos;une commande fournisseur ou de la remise d&apos;un maillot lors d&apos;une permanence, ajustez la quantité immédiatement pour garder l&apos;inventaire exact.
              </p>
            </div>

            <div className="p-3.5 rounded-md border border-line dark:border-night-line bg-paper dark:bg-night space-y-1">
              <div className="flex items-center gap-2">
                <TagIcon className="h-4 w-4 text-ambre" />
                <h4 className="font-bold text-ink dark:text-white text-xs uppercase tracking-wider font-narrow">
                  Indicateur Automatique « Épuisé »
                </h4>
              </div>
              <p className="text-ink-3 dark:text-snow-3 text-xs leading-relaxed">
                Dès qu&apos;une taille tombe à 0 pièce en réserve, elle passe automatiquement en rupture sur la vitrine publique afin d&apos;éviter les déceptions.
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'orders',
      label: '3. Commandes Groupées',
      badge: 'Avancé',
      icon: ShoppingBagIcon,
      content: (
        <div className="space-y-4">
          <div className="rounded-md border border-line dark:border-night-line bg-paper-2 dark:bg-night-2 p-4 text-xs sm:text-sm text-ink dark:text-snow leading-relaxed">
            Le club organise <strong>2 commandes groupées par an</strong> auprès de Gobik (session de Printemps pour les tenues légères et session d&apos;Automne pour l&apos;hiver).
          </div>

          <div className="rounded-md border border-vert/30 bg-vert/5 p-4 flex items-start gap-3">
            <LightBulbIcon className="h-5 w-5 text-vert shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold text-ink dark:text-white text-xs">Bonne pratique d&apos;intendance :</span>
              <p className="text-xs text-ink-3 dark:text-snow-3 leading-relaxed">
                Consultez les niveaux de stock fin février afin de regrouper les besoins des nouveaux adhérents et d&apos;envoyer le bon de commande groupé à Gobik avant les premières sorties ensoleillées.
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
      title="Guide du Vestiaire Gobik & Stocks"
      badge="Boutique Club"
      subtitle="Pilotez le vestiaire officiel du club, l'inventaire par taille et les commandes groupées."
      icon={JerseyIcon}
      iconColorClass="bg-ink text-white border-line dark:border-night-line"
      tabs={tabs}
      tourButtonLabel="Lancer la visite interactive"
    />
  );
}
