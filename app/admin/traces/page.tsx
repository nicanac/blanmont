'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  PlusCircleIcon,
  CloudArrowUpIcon,
  MapIcon,
  ArrowTopRightOnSquareIcon,
  DocumentArrowUpIcon,
  ArrowRightIcon,
  InformationCircleIcon,
  AcademicCapIcon,
} from '@heroicons/react/24/outline';
import TracesTutorialModal from './components/TracesTutorialModal';
import { useAdminTours } from '../components/tours/adminTours';

export default function AdminTracesPage(): React.ReactElement {
  const [modalOpen, setModalOpen] = useState(false);
  const { startTracesTour } = useAdminTours();

  const traceActions = [
    {
      name: 'Ajouter une Trace Manuellement',
      category: 'Création',
      description: 'Définir un nouveau parcours GPS avec distance, dénivelé et lien Komoot/GPX.',
      href: '/admin/add-trace',
      icon: PlusCircleIcon,
      accent: 'bg-[#e03e3e]/10 text-[#e03e3e] border-[#e03e3e]/20',
      badge: 'Créateur',
    },
    {
      name: 'Importer un fichier GPX',
      category: 'Import Fichier',
      description: 'Téléverser un fichier .gpx depuis Garmin, Wahoo ou un site tiers avec calcul automatique du profil.',
      href: '/import/garmin',
      icon: DocumentArrowUpIcon,
      accent: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
      badge: 'Fichier GPX',
    },
    {
      name: 'Importer depuis Strava',
      category: 'Synchronisation',
      description: 'Synchroniser directement un itinéraire ou une sortie depuis votre compte Strava.',
      href: '/import/strava',
      icon: CloudArrowUpIcon,
      accent: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
      badge: 'Strava API',
    },
    {
      name: 'Catalogue Public des Traces',
      category: 'Consultation',
      description: 'Parcourir, filtrer par dénivelé/distance et tester les tracés sur la carte interactive.',
      href: '/traces',
      icon: MapIcon,
      accent: 'bg-sky-500/10 text-sky-600 border-sky-500/20',
      badge: 'Vue Membres',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div id="traces-header-section" className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-[#e4e0d8]">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-[#101216] px-3 py-1 text-xs font-bold uppercase tracking-wider text-white mb-2">
            <MapIcon className="h-3.5 w-3.5 text-[#e03e3e]" />
            <span>Gestion des Parcours</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#101216]">
            Traces &amp; Parcours GPS
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-[#5c6370]">
            Ajoutez, importez et organisez la bibliothèque d&apos;itinéraires du CC Saint-Martin Blanmont.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Tuto Button */}
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-md border border-[#e4e0d8] bg-white px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#101216] hover:bg-[#f2efe9] transition-colors shadow-xs"
            title="Ouvrir le guide des parcours"
          >
            <AcademicCapIcon className="h-4 w-4 text-[#e03e3e]" />
            <span>Tutoriel &amp; Guide</span>
          </button>

          <Link
            href="/traces"
            target="_blank"
            className="inline-flex items-center gap-2 rounded-md border border-[#e4e0d8] bg-white px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#101216] hover:bg-[#f2efe9] transition-colors"
          >
            <span>Catalogue public</span>
            <ArrowTopRightOnSquareIcon className="h-4 w-4 text-[#7d8493]" />
          </Link>
          <Link
            href="/admin/add-trace"
            className="inline-flex items-center gap-2 rounded-md bg-[#e03e3e] hover:bg-[#c93434] px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-white transition-colors shadow-xs"
          >
            <PlusCircleIcon className="h-4 w-4" />
            <span>Ajouter une Trace</span>
          </Link>
        </div>
      </div>

      {/* Action Cards Grid */}
      <div id="traces-action-grid" className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {traceActions.map((action) => (
          <Link
            key={action.name}
            href={action.href}
            className="group rounded-lg border border-[#e4e0d8] bg-white p-6 shadow-xs hover:border-[#e03e3e]/40 hover:shadow-md transition-all flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-[#f2efe9] text-[#5c6370] border border-[#e4e0d8] px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider">
                  {action.category}
                </span>
                <div className={`flex h-10 w-10 items-center justify-center rounded-md border ${action.accent}`}>
                  <action.icon className="h-5 w-5" />
                </div>
              </div>

              <div>
                <h3 className="text-base font-bold text-[#101216] group-hover:text-[#e03e3e] transition-colors">
                  {action.name}
                </h3>
                <p className="mt-1.5 text-xs text-[#5c6370] leading-relaxed">
                  {action.description}
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-[#f2efe9] flex items-center justify-between text-xs font-semibold text-[#7d8493] group-hover:text-[#101216]">
              <span>Accéder à l&apos;outil</span>
              <ArrowRightIcon className="h-3.5 w-3.5 text-[#e03e3e] transition-transform group-hover:translate-x-1" />
            </div>
          </Link>
        ))}
      </div>

      {/* Contextual Information Band */}
      <div id="traces-info-section" className="rounded-lg border border-[#e4e0d8] bg-white p-6 shadow-xs space-y-4">
        <div className="flex items-start gap-3.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[#101216] text-[#e03e3e]">
            <InformationCircleIcon className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-bold uppercase tracking-wider text-[#101216]">
              Comment fonctionnent les traces pour le club ?
            </h4>
            <p className="text-xs text-[#5c6370] leading-relaxed">
              Les traces GPS constituent le patrimoine cycliste du CC Saint-Martin Blanmont. Chaque trace publiée est automatiquement cartographiée avec son profil altimétrique (dénivelé D+), sa distance en kilomètres, son type de revêtement et un bouton de téléchargement direct GPX pour les compteurs GPS.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs border-t border-[#f2efe9]">
          <div className="p-3 rounded-md bg-[#faf8f5] border border-[#e4e0d8]">
            <div className="font-bold text-[#101216] uppercase tracking-wider mb-0.5">Format GPX</div>
            <div className="text-[#5c6370]">Compatible avec Garmin Connect, Wahoo ELEMNT, Hammerhead Karoo.</div>
          </div>
          <div className="p-3 rounded-md bg-[#faf8f5] border border-[#e4e0d8]">
            <div className="font-bold text-[#101216] uppercase tracking-wider mb-0.5">Sondage &amp; Sortie</div>
            <div className="text-[#5c6370]">Les traces peuvent être associées aux choix de vote lors du sondage de la semaine.</div>
          </div>
          <div className="p-3 rounded-md bg-[#faf8f5] border border-[#e4e0d8]">
            <div className="font-bold text-[#101216] uppercase tracking-wider mb-0.5">Carré Vert</div>
            <div className="text-[#5c6370]">Les points de participation sont enregistrés lors de chaque sortie officielle.</div>
          </div>
        </div>
      </div>

      <TracesTutorialModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onStartTour={() => {
          setTimeout(() => {
            startTracesTour();
          }, 200);
        }}
      />
    </div>
  );
}
