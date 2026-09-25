'use client';

import React from 'react';
import {
  ArrowDownTrayIcon,
  PrinterIcon,
  TrophyIcon,
  SparklesIcon,
  CheckBadgeIcon,
} from '@heroicons/react/24/outline';
import { BicycleIcon } from '@/app/components/ui/CyclingIcons';
import type { ClubAggregatedStatistics } from '@/app/lib/clubStatistics';
import {
  generateCarreVertCsv,
  generateClubAgSummaryCsv,
} from '@/app/lib/clubStatistics';

interface StatsAgSummaryProps {
  stats: ClubAggregatedStatistics;
}

export default function StatsAgSummary({ stats }: StatsAgSummaryProps): React.ReactElement {
  const handleDownloadAgCsv = () => {
    const csvContent = generateClubAgSummaryCsv(stats);
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute(
      'download',
      `bilan-officiel-ag-${stats.selectedYear}-cc-blanmont.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadCarreVertCsv = () => {
    const csvContent = generateCarreVertCsv(stats);
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute(
      'download',
      `classement-carre-vert-${stats.selectedYear}-cc-blanmont.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-md border border-line dark:border-night-line bg-paper dark:bg-night-2 p-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-ink dark:bg-snow-1 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-paper dark:text-ink font-mono">
              Saison {stats.selectedYear}
            </span>
            <span className="rounded-full bg-bois/40 dark:bg-vert/20 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-vert dark:text-bois font-narrow">
              Document Officiel AG
            </span>
          </div>
          <h2 className="mt-2 text-xl font-extrabold uppercase tracking-tight text-ink dark:text-snow-1 font-semiwide">
            Synthèse de l&apos;Assemblée Générale
          </h2>
          <p className="text-xs text-ink-3 dark:text-snow-3">
            Bilan consolidé de l&apos;exercice sportif, classement statutaire du Carré Vert et démocratie du club.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleDownloadAgCsv}
            className="inline-flex items-center gap-2 rounded-md border border-line dark:border-night-line bg-paper-2 dark:bg-night-3 px-3.5 py-2 text-xs font-bold uppercase tracking-wider text-ink dark:text-snow-1 hover:bg-line dark:hover:bg-night-line transition-colors cursor-pointer"
            title="Télécharger le rapport de synthèse de l'AG au format CSV"
          >
            <ArrowDownTrayIcon className="h-4 w-4 text-brand" />
            <span>Export Bilan AG</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadCarreVertCsv}
            className="inline-flex items-center gap-2 rounded-md border border-line dark:border-night-line bg-paper-2 dark:bg-night-3 px-3.5 py-2 text-xs font-bold uppercase tracking-wider text-ink dark:text-snow-1 hover:bg-line dark:hover:bg-night-line transition-colors cursor-pointer"
            title="Télécharger le tableau officiel du Carré Vert"
          >
            <TrophyIcon className="h-4 w-4 text-ambre" />
            <span>Export Carré Vert</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-2 rounded-md bg-ink dark:bg-snow-1 px-4 py-2 text-xs font-bold uppercase tracking-wider text-paper dark:text-ink hover:bg-night-line transition-colors cursor-pointer"
            title="Imprimer cette synthèse pour la séance de l'AG"
          >
            <PrinterIcon className="h-4 w-4" />
            <span>Imprimer</span>
          </button>
        </div>
      </div>

      {/* Main Printable Document Section */}
      <div className="rounded-md border border-line dark:border-night-line bg-paper dark:bg-night-2 p-6 sm:p-8 space-y-8 print:border-none print:shadow-none print:p-0">
        {/* Editorial Header */}
        <div className="border-b border-line dark:border-night-line pb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-brand font-narrow">
                CC Saint-Martin Blanmont
              </p>
              <h1 className="text-2xl font-extrabold text-ink dark:text-snow-1 font-semiwide">
                Rapport Statistique d&apos;Activité &amp; Bilan Sportif
              </h1>
            </div>
            <div className="text-right">
              <p className="text-xs font-semibold text-ink-3 dark:text-snow-3 font-narrow">Année Officielle</p>
              <p className="text-lg font-extrabold text-ink dark:text-snow-1 tabular-nums font-mono">
                {stats.selectedYear}
              </p>
            </div>
          </div>
        </div>

        {/* 1. Télémétrie & Activité du Peloton */}
        <section className="space-y-4">
          <h3 className="text-sm font-extrabold uppercase tracking-tight text-ink dark:text-snow-1 font-semiwide flex items-center gap-2">
            <BicycleIcon className="h-4 w-4 text-brand" />
            <span>1. Activité Sportive &amp; Kilométrage du Peloton</span>
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="rounded-md border border-line dark:border-night-line bg-paper-2 dark:bg-night-3 p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-ink-3 dark:text-snow-3 font-narrow">
                Kilomètres-Peloton
              </p>
              <p className="mt-1 text-2xl font-extrabold text-ink dark:text-snow-1 tabular-nums font-mono">
                {stats.telemetry.totalPelotonKm.toLocaleString('fr-BE')}{' '}
                <span className="text-xs font-semibold text-ink-3 dark:text-snow-3 font-sans">km</span>
              </p>
              <p className="mt-1 text-xs text-ink-3 dark:text-snow-3">
                {stats.telemetry.earthLapsEquivalent}x le tour de la Terre
              </p>
            </div>

            <div className="rounded-md border border-line dark:border-night-line bg-paper-2 dark:bg-night-3 p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-ink-3 dark:text-snow-3 font-narrow">
                Dénivelé Positif
              </p>
              <p className="mt-1 text-2xl font-extrabold text-ink dark:text-snow-1 tabular-nums font-mono">
                {stats.telemetry.totalPelotonElevation.toLocaleString('fr-BE')}{' '}
                <span className="text-xs font-semibold text-ink-3 dark:text-snow-3 font-sans">m D+</span>
              </p>
              <p className="mt-1 text-xs text-ink-3 dark:text-snow-3">
                {stats.telemetry.everestEquivalent} ascensions de l&apos;Everest
              </p>
            </div>

            <div className="rounded-md border border-line dark:border-night-line bg-paper-2 dark:bg-night-3 p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-ink-3 dark:text-snow-3 font-narrow">
                Sorties Tenues
              </p>
              <p className="mt-1 text-2xl font-extrabold text-ink dark:text-snow-1 tabular-nums font-mono">
                {stats.telemetry.officialRidesCount}
              </p>
              <p className="mt-1 text-xs text-ink-3 dark:text-snow-3">
                {stats.telemetry.totalAttendances} participations cumulées
              </p>
            </div>

            <div className="rounded-md border border-line dark:border-night-line bg-paper-2 dark:bg-night-3 p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-ink-3 dark:text-snow-3 font-narrow">
                Peloton Moyen
              </p>
              <p className="mt-1 text-2xl font-extrabold text-ink dark:text-snow-1 tabular-nums font-mono">
                {stats.telemetry.avgPelotonSize}
              </p>
              <p className="mt-1 text-xs text-ink-3 dark:text-snow-3">
                coureurs par sortie organisée
              </p>
            </div>
          </div>
        </section>

        {/* 2. Palmarès Officiel du Carré Vert */}
        <section className="space-y-4">
          <h3 className="text-sm font-extrabold uppercase tracking-tight text-ink dark:text-snow-1 font-semiwide flex items-center gap-2">
            <TrophyIcon className="h-4 w-4 text-ambre" />
            <span>2. Palmarès Statutaire du Carré Vert</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {stats.carreVert.podium.map((p) => (
              <div
                key={p.rank}
                className="rounded-md border border-line dark:border-night-line bg-paper-2 dark:bg-night-3 p-4 relative overflow-hidden"
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-bold ${
                      p.rank === 1
                        ? 'bg-ambre/20 text-ambre border border-ambre/40'
                        : p.rank === 2
                        ? 'bg-paper-2 text-ink-2 dark:text-snow-2 border border-line-strong'
                        : 'bg-ambre/10 text-ambre/80 border border-ambre/30'
                    }`}
                  >
                    {p.rank === 1 ? '1er 🥇 Champion' : p.rank === 2 ? '2e 🥈 Vice-champion' : '3e 🥉 Podium'}
                  </span>
                  <span className="text-xs font-bold text-ink-3 dark:text-snow-3">
                    {p.group ? `Gr. ${p.group}` : 'Cyclo'}
                  </span>
                </div>
                <p className="mt-3 text-base font-extrabold text-ink dark:text-snow-1">
                  {p.name}
                </p>
                <p className="mt-1 text-xs font-bold text-ink dark:text-snow-1 tabular-nums font-mono">
                  {p.rides} carrés validés ({p.percent}% d&apos;assiduité)
                </p>
              </div>
            ))}
          </div>

          {/* Merit Tiers Summary */}
          <div className="rounded-md border border-line dark:border-night-line bg-paper-2 dark:bg-night-3 p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-ink-3 dark:text-snow-3 mb-3 font-narrow">
              Distribution des Paliers d&apos;Assiduité
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
              <div className="rounded-sm border border-vert/30 bg-bois/40 dark:bg-vert/20 p-2.5">
                <span className="text-xs font-bold uppercase text-vert dark:text-bois font-narrow">
                  Carré d&apos;Or (≥80%)
                </span>
                <p className="mt-1 text-xl font-extrabold text-vert-dark dark:text-bois tabular-nums font-mono">
                  {stats.carreVert.tiersDistribution.or}
                </p>
              </div>
              <div className="rounded-sm border border-hydro/30 bg-hydro/10 dark:bg-hydro/20 p-2.5">
                <span className="text-xs font-bold uppercase text-hydro font-narrow">
                  Argent (60-79%)
                </span>
                <p className="mt-1 text-xl font-extrabold text-hydro tabular-nums font-mono">
                  {stats.carreVert.tiersDistribution.argent}
                </p>
              </div>
              <div className="rounded-sm border border-ambre/30 bg-ambre/10 dark:bg-ambre/20 p-2.5">
                <span className="text-xs font-bold uppercase text-ambre font-narrow">
                  Bronze (40-59%)
                </span>
                <p className="mt-1 text-xl font-extrabold text-ambre tabular-nums font-mono">
                  {stats.carreVert.tiersDistribution.bronze}
                </p>
              </div>
              <div className="rounded-sm border border-line dark:border-night-line bg-paper dark:bg-night-2 p-2.5">
                <span className="text-xs font-bold uppercase text-ink-3 dark:text-snow-3 font-narrow">
                  Peloton (20-39%)
                </span>
                <p className="mt-1 text-xl font-extrabold text-ink dark:text-snow-1 tabular-nums font-mono">
                  {stats.carreVert.tiersDistribution.peloton}
                </p>
              </div>
              <div className="rounded-sm border border-line dark:border-night-line bg-paper dark:bg-night-2 p-2.5">
                <span className="text-xs font-bold uppercase text-ink-3 dark:text-snow-3 font-narrow">
                  Occasionnel (&lt;20%)
                </span>
                <p className="mt-1 text-xl font-extrabold text-ink dark:text-snow-1 tabular-nums font-mono">
                  {stats.carreVert.tiersDistribution.occasionnel}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Patrimoine Routier & Démocratie */}
        <section className="space-y-4">
          <h3 className="text-sm font-extrabold uppercase tracking-tight text-ink dark:text-snow-1 font-semiwide flex items-center gap-2">
            <CheckBadgeIcon className="h-4 w-4 text-vert" />
            <span>3. Patrimoine Routier &amp; Démocratie du Club</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-md border border-line dark:border-night-line bg-paper-2 dark:bg-night-3 p-4 space-y-2">
              <p className="text-xs font-bold uppercase tracking-wider text-ink-3 dark:text-snow-3 font-narrow">
                Catalogue des Parcours &amp; Qualité
              </p>
              <ul className="text-xs text-ink dark:text-snow-1 space-y-1">
                <li className="flex justify-between">
                  <span>Traces répertoriées :</span>
                  <span className="font-extrabold tabular-nums font-mono">{stats.traces.totalTraces}</span>
                </li>
                <li className="flex justify-between">
                  <span>Distance totale du catalogue :</span>
                  <span className="font-extrabold tabular-nums font-mono">{stats.traces.totalCatalogKm} km</span>
                </li>
                <li className="flex justify-between">
                  <span>Distance moyenne d&apos;une trace :</span>
                  <span className="font-extrabold tabular-nums font-mono">{stats.traces.avgTraceDistance} km</span>
                </li>
                <li className="flex justify-between">
                  <span>Satisfaction moyenne des membres :</span>
                  <span className="font-extrabold tabular-nums font-mono">⭐ {stats.traces.feedbackStats.averageRating} / 5</span>
                </li>
              </ul>
            </div>

            <div className="rounded-md border border-line dark:border-night-line bg-paper-2 dark:bg-night-3 p-4 space-y-2">
              <p className="text-xs font-bold uppercase tracking-wider text-ink-3 dark:text-snow-3 font-narrow">
                Démocratie &amp; Sorties du Samedi
              </p>
              <ul className="text-xs text-ink dark:text-snow-1 space-y-1">
                <li className="flex justify-between">
                  <span>Sorties du samedi proposées :</span>
                  <span className="font-extrabold tabular-nums font-mono">{stats.democracy.totalSaturdayRides}</span>
                </li>
                <li className="flex justify-between">
                  <span>Sorties soumises au vote démocratique :</span>
                  <span className="font-extrabold tabular-nums font-mono">{stats.democracy.votedRidesCount}</span>
                </li>
                <li className="flex justify-between">
                  <span>Total votes enregistrés :</span>
                  <span className="font-extrabold tabular-nums font-mono">{stats.democracy.totalVotes}</span>
                </li>
                <li className="flex justify-between">
                  <span>Moyenne de votes par sortie :</span>
                  <span className="font-extrabold tabular-nums font-mono">{stats.democracy.avgVotesPerRide} votants</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Footer Sign-off for AG */}
        <div className="pt-6 border-t border-line dark:border-night-line flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs text-ink-3 dark:text-snow-3">
          <p>
            Validé pour l&apos;Assemblée Générale statutaire du CC Saint-Martin Blanmont.
          </p>
          <p className="font-semibold text-ink dark:text-snow-1">
            Fait à Blanmont, le {new Date().toLocaleDateString('fr-BE')}
          </p>
        </div>
      </div>
    </div>
  );
}
