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

import { redirect } from 'next/navigation';

export default function AdminTracesPage(): React.ReactElement {
  // Masqué temporairement / Hidden for now
  redirect('/admin');

  const [modalOpen, setModalOpen] = useState(false);
  const { startTracesTour } = useAdminTours();

  const traceActions = [
    {
      name: 'Ajouter une Trace Manuellement',
      category: 'Création',
      description: 'Définir un nouveau parcours GPS avec distance, dénivelé et lien Komoot/GPX.',
      href: '/admin/add-trace',
      icon: PlusCircleIcon,
      accent: 'bg-brand/10 text-brand border-brand/20',
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
      <div id="traces-header-section" className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-line">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-ink px-3 py-1 text-xs font-bold uppercase tracking-wider text-white mb-2">
            <MapIcon className="h-3.5 w-3.5 text-brand" />
            <span>Gestion des Parcours</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-ink">
            Traces &amp; Parcours GPS
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-ink-3">
            Ajoutez, importez et organisez la bibliothèque d&apos;itinéraires du CC Saint-Martin Blanmont.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Tuto Button */}
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-md border border-line dark:border-night-line bg-paper dark:bg-night-2 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-ink dark:text-white hover:bg-paper-2 dark:hover:bg-night-3 transition-colors"
            title="Ouvrir le guide des parcours"
          >
            <AcademicCapIcon className="h-4 w-4 text-brand" />
            <span>Tutoriel &amp; Guide</span>
          </button>

          <Link
            href="/traces"
            target="_blank"
            className="inline-flex items-center gap-2 rounded-md border border-line dark:border-night-line bg-paper dark:bg-night-2 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-ink dark:text-white hover:bg-paper-2 dark:hover:bg-night-3 transition-colors"
          >
            <span>Catalogue public</span>
            <ArrowTopRightOnSquareIcon className="h-4 w-4 text-ink-3 dark:text-snow-3" />
          </Link>
          <Link
            href="/admin/add-trace"
            className="inline-flex items-center gap-2 rounded-md bg-brand hover:bg-brand-strong px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-white transition-colors shadow-xs"
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
            className="group rounded-sm border border-line dark:border-night-line bg-paper dark:bg-night-2 p-6 hover:border-brand/40 transition-all flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-paper-2 dark:bg-night-3 text-ink-3 dark:text-snow-3 border border-line dark:border-night-line px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider">
                  {action.category}
                </span>
                <div className={`flex h-10 w-10 items-center justify-center rounded-md border ${action.accent}`}>
                  <action.icon className="h-5 w-5" />
                </div>
              </div>

              <div>
                <h3 className="text-base font-bold text-ink dark:text-white group-hover:text-brand transition-colors">
                  {action.name}
                </h3>
                <p className="mt-1.5 text-xs text-ink-3 dark:text-snow-3 leading-relaxed">
                  {action.description}
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-line dark:border-night-line flex items-center justify-between text-xs font-semibold text-ink-3 dark:text-snow-3 group-hover:text-ink dark:group-hover:text-white">
              <span>Accéder à l&apos;outil</span>
              <ArrowRightIcon className="h-3.5 w-3.5 text-brand transition-transform group-hover:translate-x-1" />
            </div>
          </Link>
        ))}
      </div>

      {/* Contextual Information Band */}
      <div id="traces-info-section" className="rounded-sm border border-line dark:border-night-line bg-paper dark:bg-night-2 p-6 space-y-4">
        <div className="flex items-start gap-3.5">
          <div className="flex h-8 w-8 md:h-8 md:w-8 shrink-0 items-center justify-center rounded-md bg-ink text-brand">
            <InformationCircleIcon className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-bold uppercase tracking-wider text-ink dark:text-white">
              Comment fonctionnent les traces pour le club ?
            </h4>
            <p className="text-xs text-ink-3 dark:text-snow-3 leading-relaxed">
              Les traces GPS constituent le patrimoine cycliste du CC Saint-Martin Blanmont. Chaque trace publiée est automatiquement cartographiée avec son profil altimétrique (dénivelé D+), sa distance en kilomètres, son type de revêtement et un bouton de téléchargement direct GPX pour les compteurs GPS.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs border-t border-line dark:border-night-line">
          <div className="p-3 rounded-md bg-paper-2 dark:bg-night-3 border border-line dark:border-night-line">
            <div className="font-bold text-ink dark:text-white uppercase tracking-wider mb-0.5">Format GPX</div>
            <div className="text-ink-3 dark:text-snow-3">Compatible avec Garmin Connect, Wahoo ELEMNT, Hammerhead Karoo.</div>
          </div>
          <div className="p-3 rounded-md bg-paper-2 dark:bg-night-3 border border-line dark:border-night-line">
            <div className="font-bold text-ink dark:text-white uppercase tracking-wider mb-0.5">Sondage &amp; Sortie</div>
            <div className="text-ink-3 dark:text-snow-3">Les traces peuvent être associées aux choix de vote lors du sondage de la semaine.</div>
          </div>
          <div className="p-3 rounded-md bg-paper-2 dark:bg-night-3 border border-line dark:border-night-line">
            <div className="font-bold text-ink dark:text-white uppercase tracking-wider mb-0.5">Carré Vert</div>
            <div className="text-ink-3 dark:text-snow-3">Les points de participation sont enregistrés lors de chaque sortie officielle.</div>
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
