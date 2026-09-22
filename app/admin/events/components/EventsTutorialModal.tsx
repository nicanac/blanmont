'use client';

import React from 'react';
import {
  CalendarDaysIcon,
  ArrowUpTrayIcon,
  MapPinIcon,
  ClockIcon,
  DevicePhoneMobileIcon,
} from '@heroicons/react/24/outline';
import AdminTutorialModal from '@/app/admin/components/AdminTutorialModal';

interface EventsTutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartTour: () => void;
}

export default function EventsTutorialModal({
  isOpen,
  onClose,
  onStartTour,
}: EventsTutorialModalProps): React.ReactElement | null {
  const tabs = [
    {
      id: 'calendar',
      label: '1. Sorties & Rendez-vous',
      icon: CalendarDaysIcon,
      content: (
        <div className="space-y-4">
          <div className="rounded-lg border border-[#262b38] bg-[#161922] p-4 text-[#a7adbb] leading-relaxed">
            Le calendrier officiel permet aux membres de connaître les dates des sorties, les points de départ (Place de Blanmont, local club), les horaires et les distances prévues pour les groupes.
          </div>

          <div className="space-y-3">
            <div className="p-3.5 rounded-lg border border-[#262b38] bg-[#161922] space-y-1">
              <div className="flex items-center gap-2 text-white font-bold text-xs">
                <MapPinIcon className="h-4 w-4 text-[#e03e3e]" />
                <span>Lieu de Départ &amp; Destination</span>
              </div>
              <p className="text-[#a7adbb] text-xs">
                Indiquez clairement le point de rendez-vous (ex. <em>Blanmont - Place communale</em>) et la destination ou le brevet au programme.
              </p>
            </div>

            <div className="p-3.5 rounded-lg border border-[#262b38] bg-[#161922] space-y-1">
              <div className="flex items-center gap-2 text-white font-bold text-xs">
                <ClockIcon className="h-4 w-4 text-amber-400" />
                <span>Horaires &amp; Distances</span>
              </div>
              <p className="text-[#a7adbb] text-xs">
                Précisez l&apos;heure de rassemblement (ex. 09h00) et les options de distances (ex. <em>75 km / 95 km</em>).
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'pdf_import',
      label: '2. Importation PDF en Lot',
      icon: ArrowUpTrayIcon,
      content: (
        <div className="space-y-4">
          <div className="rounded-lg border border-[#262b38] bg-[#161922] p-4 text-[#a7adbb] leading-relaxed">
            En début de saison, le club publie son calendrier officiel sous forme de fichier PDF. Vous pouvez importer toutes les sorties en une seule opération.
          </div>

          <div className="p-3.5 rounded-lg border border-[#262b38] bg-[#161922] space-y-2">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider">
              Processus d&apos;importation en 2 étapes :
            </h4>
            <ol className="text-xs text-[#a7adbb] space-y-1.5 list-decimal list-inside">
              <li>Cliquez sur <strong>« Importer PDF »</strong> et sélectionnez le document PDF du calendrier.</li>
              <li>L&apos;outil extrait les dates, départs et distances et affiche un tableau de prévisualisation.</li>
              <li>Validez pour enregistrer instantanément l&apos;ensemble de la saison dans la base de données.</li>
            </ol>
          </div>
        </div>
      ),
    },
    {
      id: 'sync',
      label: '3. Synchronisation iCal / Téléphone',
      icon: DevicePhoneMobileIcon,
      content: (
        <div className="space-y-4">
          <div className="rounded-lg border border-[#262b38] bg-[#161922] p-4 text-[#a7adbb] leading-relaxed">
            Le site propose un <strong>flux iCalendar en temps réel</strong> (<span className="text-white font-mono">/api/calendar/subscribe.ics</span>) pour les smartphones des cyclistes.
          </div>

          <div className="p-3.5 rounded-lg border border-[#262b38] bg-[#161922] space-y-2">
            <span className="font-bold text-white text-xs uppercase tracking-wider">
              Avantage pour les membres :
            </span>
            <p className="text-[#a7adbb] text-xs leading-relaxed">
              Dès qu&apos;une sortie est modifiée ou ajoutée dans l&apos;administration, les agendas Apple Calendar, Google Calendar et Outlook des membres se mettent à jour automatiquement sans aucune intervention manuelle.
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
      title="Guide du Calendrier & Sorties"
      badge="Planning"
      icon={CalendarDaysIcon}
      tabs={tabs}
    />
  );
}
