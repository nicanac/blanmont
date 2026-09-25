'use client';

import React from 'react';
import {
  BoltIcon,
  QrCodeIcon,
  ShieldCheckIcon,
  HandRaisedIcon,
} from '@heroicons/react/24/outline';
import AdminTutorialModal from '@/app/admin/components/AdminTutorialModal';

interface PointageExpressTutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PointageExpressTutorialModal({
  isOpen,
  onClose,
}: PointageExpressTutorialModalProps): React.ReactElement | null {
  const tabs = [
    {
      id: 'pointage',
      label: '1. Émargement Tactile',
      icon: HandRaisedIcon,
      content: (
        <div className="space-y-4">
          <div className="rounded-lg border border-night-line bg-night-2 p-4 text-snow-3 leading-relaxed text-xs">
            Le <strong>Pointage Express</strong> est l&apos;interface optimisée pour les capitaines de route et organisateurs sur le terrain (Place de Blanmont) avant le départ du peloton.
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-md border border-night-line bg-night-2 space-y-1.5">
              <h4 className="font-bold text-white text-xs uppercase tracking-wider font-narrow">
                1 Tap pour Pointer
              </h4>
              <p className="text-snow-3 text-xs leading-relaxed">
                Touchez la case à cocher d&apos;un membre pour l&apos;enregistrer au départ. Les compteurs par groupe de niveau (A, B, C, VTT) se mettent à jour instantanément.
              </p>
            </div>

            <div className="p-3.5 rounded-md border border-night-line bg-night-2 space-y-1.5">
              <h4 className="font-bold text-white text-xs uppercase tracking-wider font-narrow">
                Filtres &amp; Recherche
              </h4>
              <p className="text-snow-3 text-xs leading-relaxed">
                Filtrez par statut (Pointés, Non pointés) ou par groupe pour retrouver rapidement les cyclistes sans faire défiler tout l&apos;annuaire.
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'qr',
      label: '2. Scan QR Code',
      icon: QrCodeIcon,
      content: (
        <div className="space-y-4">
          <div className="rounded-lg border border-night-line bg-night-2 p-4 text-snow-3 leading-relaxed text-xs">
            Les membres du club disposent d&apos;un <strong>Pass Numérique officiel</strong> accessible sur leur smartphone (<span className="text-white font-mono">/profile/pass</span>).
          </div>

          <div className="p-3.5 rounded-lg border border-night-line bg-night-2 space-y-2">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider">
              Validation Automatique par Caméra
            </h4>
            <p className="text-snow-3 text-xs leading-relaxed">
              En scannant le QR Code « Pointage Départ » d&apos;un membre avec l&apos;appareil photo d&apos;un smartphone, le pointage est validé sans saisie manuelle.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 'ice',
      label: '3. Fiches ICE & Secours',
      icon: ShieldCheckIcon,
      content: (
        <div className="space-y-4">
          <div className="rounded-lg border border-night-line bg-night-2 p-4 text-snow-3 leading-relaxed text-xs">
            En cas de chute, malaise ou incident mécanique sérieux en cours de sortie, chaque membre pointé dispose d&apos;un accès rapide à sa <strong>fiche médicale / ICE (In Case of Emergency)</strong>.
          </div>

          <div className="p-3.5 rounded-lg border border-night-line bg-night-2 space-y-2">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider">
              Contact d&apos;Urgence en 1 Clic
            </h4>
            <p className="text-snow-3 text-xs leading-relaxed">
              Touchez l&apos;icône de bouclier sur la ligne d&apos;un cycliste pour afficher son numéro de licence FFBC et appeler directement son contact d&apos;urgence.
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
      title="Guide du Pointage Express"
      badge="Terrain & Départ"
      icon={BoltIcon}
      iconColorClass="bg-brand/20 text-brand border-brand/40"
      tabs={tabs}
    />
  );
}
