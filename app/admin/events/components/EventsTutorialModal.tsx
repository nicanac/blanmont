'use client';

import React from 'react';
import {
  CalendarDaysIcon,
  ArrowUpTrayIcon,
  MapPinIcon,
  ClockIcon,
  DevicePhoneMobileIcon,
  LightBulbIcon,
  MapIcon,
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
      label: '1. Sorties & Planning',
      badge: 'Débutant',
      icon: CalendarDaysIcon,
      content: (
        <div className="space-y-4">
          <div className="rounded-md border border-line dark:border-night-line bg-paper-2 dark:bg-night-2 p-4 text-xs sm:text-sm text-ink dark:text-snow leading-relaxed">
            Le <strong>calendrier officiel</strong> permet aux membres de connaître les dates des sorties, les points de rassemblement, les horaires et les distances prévues pour chaque peloton.
          </div>

          <div className="space-y-3">
            <div className="p-3.5 rounded-md border border-line dark:border-night-line bg-paper dark:bg-night space-y-1">
              <div className="flex items-center gap-2 text-ink dark:text-white font-bold text-xs uppercase tracking-wider font-narrow">
                <MapPinIcon className="h-4 w-4 text-brand" />
                <span>Lieu de Départ &amp; Destination</span>
              </div>
              <p className="text-ink-3 dark:text-snow-3 text-xs leading-relaxed">
                Indiquez clairement le point de rendez-vous (ex. <em>Place de la Féchère, Blanmont</em>) et la destination ou le brevet au programme (ex. <em>Flèche Brabançonne</em>).
              </p>
            </div>

            <div className="p-3.5 rounded-md border border-line dark:border-night-line bg-paper dark:bg-night space-y-1">
              <div className="flex items-center gap-2 text-ink dark:text-white font-bold text-xs uppercase tracking-wider font-narrow">
                <ClockIcon className="h-4 w-4 text-ambre" />
                <span>Horaires &amp; Distances par Groupe</span>
              </div>
              <p className="text-ink-3 dark:text-snow-3 text-xs leading-relaxed">
                Précisez l&apos;heure de rassemblement (ex. 09h00 en été, 09h30 en hiver) et les options de distances (ex. <em>70 km / 95 km</em>) pour orienter le choix des cyclistes.
              </p>
            </div>
          </div>

          <div className="rounded-md border border-ambre/30 bg-ambre/5 p-4 flex items-start gap-3">
            <LightBulbIcon className="h-5 w-5 text-ambre shrink-0 mt-0.5" />
            <p className="text-xs text-ink-3 dark:text-snow-3">
              En cas d&apos;annulation pour cause d&apos;intempéries (verglas, orage violent), vous pouvez modifier le titre avec la mention <em>« ANNULÉ - Météo »</em> pour alerter instantanément le peloton.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 'pdf_import',
      label: '2. Importation PDF par Lot',
      badge: 'Confirmé',
      icon: ArrowUpTrayIcon,
      content: (
        <div className="space-y-4">
          <div className="rounded-md border border-line dark:border-night-line bg-paper-2 dark:bg-night-2 p-4 text-xs sm:text-sm text-ink dark:text-snow leading-relaxed">
            En début de saison, le comité prépare un calendrier annuel complet au format PDF. Notre outil d&apos;extraction intelligent vous évite de saisir les sorties une par une.
          </div>

          <div className="p-3.5 rounded-md border border-line dark:border-night-line bg-paper dark:bg-night space-y-2.5">
            <h4 className="font-bold text-ink dark:text-white text-xs uppercase tracking-wider font-narrow">
              Processus d&apos;importation en 3 étapes :
            </h4>
            <ol className="text-xs text-ink-3 dark:text-snow-3 space-y-2 list-decimal list-inside leading-relaxed">
              <li>
                Cliquez sur <strong>« Importer PDF »</strong> et déposez le document PDF officiel du calendrier de la saison.
              </li>
              <li>
                L&apos;outil analyse et extrait automatiquement les dates, heures, lieux de départ et distances dans un tableau de prévisualisation interactif.
              </li>
              <li>
                Vérifiez les données, corrigez éventuellement une ligne, puis cliquez sur <strong>« Valider et importer »</strong> pour inscrire toute la saison en base de données.
              </li>
            </ol>
          </div>
        </div>
      ),
    },
    {
      id: 'sync',
      label: '3. Synchronisation iCal & GPX',
      badge: 'Avancé',
      icon: DevicePhoneMobileIcon,
      content: (
        <div className="space-y-4">
          <div className="rounded-md border border-line dark:border-night-line bg-paper-2 dark:bg-night-2 p-4 text-xs sm:text-sm text-ink dark:text-snow leading-relaxed">
            Le site propose un <strong>flux iCalendar en temps réel</strong> (<span className="text-brand font-mono text-xs">/api/calendar/subscribe.ics</span>) pour les smartphones et compteurs des cyclistes.
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-md border border-line dark:border-night-line bg-paper dark:bg-night space-y-2">
              <div className="flex items-center gap-2">
                <DevicePhoneMobileIcon className="h-4 w-4 text-hydro" />
                <span className="font-bold text-ink dark:text-white text-xs uppercase tracking-wider font-narrow">
                  Synchronisation Mobile
                </span>
              </div>
              <p className="text-ink-3 dark:text-snow-3 text-xs leading-relaxed">
                Dès qu&apos;une sortie est modifiée ou ajoutée dans l&apos;administration, les agendas Apple Calendar, Google Calendar et Outlook des membres se mettent à jour automatiquement.
              </p>
            </div>

            <div className="p-3.5 rounded-md border border-line dark:border-night-line bg-paper dark:bg-night space-y-2">
              <div className="flex items-center gap-2">
                <MapIcon className="h-4 w-4 text-vert" />
                <span className="font-bold text-ink dark:text-white text-xs uppercase tracking-wider font-narrow">
                  Liaison Traces GPS
                </span>
              </div>
              <p className="text-ink-3 dark:text-snow-3 text-xs leading-relaxed">
                Renseignez le lien vers le tracé GPX ou Komoot pour que le bouton de téléchargement apparaisse directement dans la fiche de la sortie et sur le sondage hebdomadaire.
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
      title="Guide du Calendrier & Sorties"
      badge="Planning Officiel"
      subtitle="Organisez les sorties du club, importez le calendrier PDF et diffusez le flux iCal."
      icon={CalendarDaysIcon}
      iconColorClass="bg-brand/10 text-brand border-brand/30"
      tabs={tabs}
      tourButtonLabel="Lancer la visite interactive"
    />
  );
}
