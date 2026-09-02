'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  XMarkIcon,
  CalendarDaysIcon,
  PlayIcon,
  PlusIcon,
  ArrowUpTrayIcon,
  MapPinIcon,
  ClockIcon,
  DevicePhoneMobileIcon,
} from '@heroicons/react/24/outline';

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
  const [activeTab, setActiveTab] = useState<'calendar' | 'pdf_import' | 'sync'>('calendar');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent): void => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-3xl rounded-xl border border-[#262b38] bg-[#0a0c10] text-white shadow-2xl overflow-hidden z-10 my-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#262b38] px-6 py-4 bg-[#161922]">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[#e03e3e]/20 text-[#e03e3e] border border-[#e03e3e]/40">
              <CalendarDaysIcon className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold uppercase tracking-tight text-white">
                  Guide du Calendrier &amp; Sorties
                </h2>
                <span className="text-[0.6875rem] font-bold uppercase tracking-wider rounded-full bg-[#e03e3e]/20 text-[#e03e3e] border border-[#e03e3e]/40 px-2 py-0.5">
                  Planning
                </span>
              </div>
              <p className="text-xs text-[#a7adbb]">
                Programmation des sorties officielles, import PDF en lot et flux iCalendar
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1.5 text-[#7d8493] hover:bg-white/10 hover:text-white transition-colors"
          >
            <span className="sr-only">Fermer</span>
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-[#262b38] bg-[#101216] px-6 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('calendar')}
            className={`flex items-center gap-2 border-b-2 py-3 px-3 text-xs font-bold uppercase tracking-wider transition-colors whitespace-nowrap ${
              activeTab === 'calendar'
                ? 'border-[#e03e3e] text-white'
                : 'border-transparent text-[#7d8493] hover:text-white'
            }`}
          >
            <CalendarDaysIcon className="h-4 w-4" />
            <span>1. Sorties &amp; Rendez-vous</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('pdf_import')}
            className={`flex items-center gap-2 border-b-2 py-3 px-3 text-xs font-bold uppercase tracking-wider transition-colors whitespace-nowrap ${
              activeTab === 'pdf_import'
                ? 'border-[#e03e3e] text-white'
                : 'border-transparent text-[#7d8493] hover:text-white'
            }`}
          >
            <ArrowUpTrayIcon className="h-4 w-4" />
            <span>2. Importation PDF en Lot</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('sync')}
            className={`flex items-center gap-2 border-b-2 py-3 px-3 text-xs font-bold uppercase tracking-wider transition-colors whitespace-nowrap ${
              activeTab === 'sync'
                ? 'border-[#e03e3e] text-white'
                : 'border-transparent text-[#7d8493] hover:text-white'
            }`}
          >
            <DevicePhoneMobileIcon className="h-4 w-4" />
            <span>3. Synchronisation iCal / Téléphone</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="p-6 max-h-[60vh] overflow-y-auto space-y-6 text-xs sm:text-sm">
          {/* TAB 1: CALENDAR */}
          {activeTab === 'calendar' && (
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
          )}

          {/* TAB 2: PDF IMPORT */}
          {activeTab === 'pdf_import' && (
            <div className="space-y-4">
              <div className="rounded-lg border border-[#262b38] bg-[#161922] p-4 text-[#a7adbb] leading-relaxed">
                En début de saison, le club publie son calendrier officiel sous forme de fichier PDF. Vous pouvez importer toutes les sorties en une seule opération.
              </div>

              <div className="p-3.5 rounded-lg border border-[#262b38] bg-[#161922] space-y-2">
                <h4 className="font-bold text-white text-xs uppercase tracking-wider">
                  Processus d&apos;importation en 2 étapes :
                </h4>
                <ol className="text-xs text-[#a7adbb] space-y-1.5 list-decimal list-inside">
                  <li>Cliquez sur <strong>&laquo; Importer PDF &raquo;</strong> et sélectionnez le document PDF du calendrier.</li>
                  <li>L&apos;outil extrait les dates, départs et distances et affiche un tableau de prévisualisation.</li>
                  <li>Validez pour enregistrer instantanément l&apos;ensemble de la saison dans la base de données.</li>
                </ol>
              </div>
            </div>
          )}

          {/* TAB 3: SYNC */}
          {activeTab === 'sync' && (
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
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between border-t border-[#262b38] bg-[#161922] px-6 py-4 gap-3">
          <button
            type="button"
            onClick={() => {
              onClose();
              onStartTour();
            }}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-md border border-[#262b38] bg-[#0a0c10] hover:bg-white/10 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-white transition-colors"
          >
            <PlayIcon className="h-4 w-4 text-[#e03e3e]" />
            <span>Lancer la visite interactive</span>
          </button>

          <Link
            href="/admin/events/new"
            onClick={onClose}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-md bg-[#e03e3e] hover:bg-[#c93434] px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-white transition-colors shadow-xs"
          >
            <PlusIcon className="h-4 w-4" />
            <span>Nouvelle Sortie</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
