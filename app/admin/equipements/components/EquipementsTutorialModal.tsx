'use client';

import React from 'react';
import {
  TagIcon,
  CubeIcon,
  LightBulbIcon,
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
      label: '1. Catalogue Officiel',
      icon: JerseyIcon,
      content: (
        <div className="space-y-4">
          <div className="rounded-lg border border-[#262b38] bg-[#161922] p-4 text-[#a7adbb] leading-relaxed">
            Les équipements du CC Saint-Martin Blanmont sont fabriqués par l&apos;équipementier <strong>Gobik</strong>. Vous gérez ici les modèles présentés aux membres sur la boutique publique (<span className="text-white font-mono">/le-club/equipement</span>).
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-lg border border-[#262b38] bg-[#161922] space-y-1">
              <h4 className="font-bold text-white text-xs">Photos &amp; Description</h4>
              <p className="text-[#a7adbb] text-xs">
                Ajoutez des photos de face/dos des maillots et vestes pour que les cyclistes apprécient les finitions et détails techniques.
              </p>
            </div>

            <div className="p-3.5 rounded-lg border border-[#262b38] bg-[#161922] space-y-1">
              <h4 className="font-bold text-white text-xs">Catégories &amp; Tarifs</h4>
              <p className="text-[#a7adbb] text-xs">
                Classez chaque pièce (Maillots, Cuissards, Vestes, Accessoires) et fixez le prix adhérent subventionné par le club.
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'stock',
      label: '2. Tailles & Inventaire',
      icon: CubeIcon,
      content: (
        <div className="space-y-4">
          <div className="rounded-lg border border-[#262b38] bg-[#161922] p-4 text-[#a7adbb] leading-relaxed">
            Le stock est géré finement par taille (<span className="text-white font-mono font-bold">XS, S, M, L, XL, 2XL</span>).
          </div>

          <div className="space-y-3">
            <div className="p-3.5 rounded-lg border border-[#262b38] bg-[#161922] space-y-1">
              <h4 className="font-bold text-white text-xs">Mise à Jour Rapide</h4>
              <p className="text-[#a7adbb] text-xs">
                Lors de la réception d&apos;un carton ou d&apos;une vente à un membre lors d&apos;une permanence, ajustez la quantité de la taille concernée en 1 clic.
              </p>
            </div>

            <div className="p-3.5 rounded-lg border border-[#262b38] bg-[#161922] space-y-1">
              <h4 className="font-bold text-white text-xs">Indicateur d&apos;Épuisement</h4>
              <p className="text-[#a7adbb] text-xs">
                Lorsqu&apos;une taille atteint 0 pièce, elle est marquée comme « Épuisée » sur le site public pour éviter les commandes impossibles.
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'orders',
      label: '3. Commandes & Réassort',
      icon: TagIcon,
      content: (
        <div className="space-y-4">
          <div className="rounded-lg border border-[#262b38] bg-[#161922] p-4 text-[#a7adbb] leading-relaxed">
            Le club organise 2 commandes groupées par an auprès de Gobik (Printemps &amp; Automne).
          </div>

          <div className="rounded-lg border border-[#262b38] bg-[#161922] p-4 flex items-start gap-3">
            <LightBulbIcon className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold text-white text-xs">Astuce de gestion :</span>
              <p className="text-xs text-[#a7adbb]">
                Consultez régulièrement l&apos;état des stocks pour anticiper les réassorts avant le début de la saison estivale.
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
      badge="Vestiaire Club"
      icon={JerseyIcon}
      iconColorClass="bg-[#101216] text-white border-[#262b38]"
      tabs={tabs}
    />
  );
}
