'use client';

import React from 'react';
import {
  ChatBubbleLeftRightIcon,
  ClockIcon,
  UserGroupIcon,
  ShareIcon,
  LightBulbIcon,
} from '@heroicons/react/24/outline';
import AdminTutorialModal from '@/app/admin/components/AdminTutorialModal';

interface SondagesTutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartTour: () => void;
}

export default function SondagesTutorialModal({
  isOpen,
  onClose,
  onStartTour,
}: SondagesTutorialModalProps): React.ReactElement | null {
  const tabs = [
    {
      id: 'ritual',
      label: '1. Le Rituel Hebdomadaire',
      icon: ClockIcon,
      content: (
        <div className="space-y-4">
          <div className="rounded-lg border border-[#262b38] bg-[#161922] p-4 text-[#a7adbb] leading-relaxed">
            Le sondage est le cœur battant de la vie du club chaque semaine. Il permet de connaître à l&apos;avance l&apos;effectif présent et d&apos;ajuster les groupes pour garantir la sécurité du peloton.
          </div>

          <div className="space-y-3">
            <div className="p-3.5 rounded-lg border border-[#262b38] bg-[#161922] space-y-1">
              <div className="flex items-center gap-2 text-white font-bold text-xs">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#e03e3e] text-white font-extrabold text-xs">
                  L
                </span>
                <span>Lundi matin : Génération automatique</span>
              </div>
              <p className="text-[#a7adbb] text-xs">
                Le sondage est créé automatiquement à partir de la sortie du samedi et des traces GPX du calendrier. Les administrateurs peuvent le modifier ou l&apos;ajuster manuellement à tout moment.
              </p>
            </div>

            <div className="p-3.5 rounded-lg border border-[#262b38] bg-[#161922] space-y-1">
              <div className="flex items-center gap-2 text-white font-bold text-xs">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-black font-extrabold text-xs">
                  M-J
                </span>
                <span>Mardi à Jeudi : Vote du peloton</span>
              </div>
              <p className="text-[#a7adbb] text-xs">
                Les membres indiquent leurs disponibilités (samedi / dimanche) et leurs choix de parcours et de groupes.
              </p>
            </div>

            <div className="p-3.5 rounded-lg border border-[#262b38] bg-[#161922] space-y-1">
              <div className="flex items-center gap-2 text-white font-bold text-xs">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-black font-extrabold text-xs">
                  V
                </span>
                <span>Vendredi Soir : Clôture &amp; Synthèse</span>
              </div>
              <p className="text-[#a7adbb] text-xs">
                L&apos;admin clôture le sondage, vérifie la taille des pelotons et partage le récapitulatif officiel sur le groupe WhatsApp du club.
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'votes',
      label: '2. Choix & Groupes de Niveau',
      icon: UserGroupIcon,
      content: (
        <div className="space-y-4">
          <div className="rounded-lg border border-[#262b38] bg-[#161922] p-4 text-[#a7adbb] leading-relaxed">
            Sur la page membre (<span className="text-white font-mono">/sondage</span>), chaque cycliste peut voter en 1 clic :
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-lg border border-[#262b38] bg-[#161922] space-y-1">
              <h4 className="font-bold text-white text-xs">Disponibilité</h4>
              <p className="text-[#a7adbb] text-xs">Samedi matin, Dimanche matin, Les deux jours, ou Absent.</p>
            </div>

            <div className="p-3.5 rounded-lg border border-[#262b38] bg-[#161922] space-y-1">
              <h4 className="font-bold text-white text-xs">Groupe de Niveau</h4>
              <p className="text-[#a7adbb] text-xs">Groupe A (&gt;30 km/h), Groupe B (27-29 km/h), Groupe C (24-26 km/h) ou VTT.</p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'whatsapp',
      label: '3. Synthèse WhatsApp',
      icon: ShareIcon,
      content: (
        <div className="space-y-4">
          <div className="rounded-lg border border-[#262b38] bg-[#161922] p-4 text-[#a7adbb] leading-relaxed">
            Fini les messages manuels fastidieux ! Sur la page de détails du sondage (<span className="text-white font-mono">/admin/sondages/[id]</span>), un bouton <strong>« Copier pour WhatsApp »</strong> génère instantanément le message complet avec les émojis, la liste des inscrits par groupe, l&apos;heure et le lien de la trace GPX.
          </div>

          <div className="rounded-lg border border-[#262b38] bg-[#161922] p-4 flex items-start gap-3">
            <LightBulbIcon className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
            <p className="text-xs text-[#a7adbb]">
              Les capitaines de route utilisent ce récapitulatif le samedi et dimanche matin pour faire l&apos;appel au départ sur la place de Blanmont.
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
      title="Guide des Sondages du Weekend"
      badge="Rituel Hebdomadaire"
      icon={ChatBubbleLeftRightIcon}
      tabs={tabs}
    />
  );
}
