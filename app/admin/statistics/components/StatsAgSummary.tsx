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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-lg border border-line bg-white p-5 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-ink px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-white">
              Saison {stats.selectedYear}
            </span>
            <span className="rounded-full bg-vert-vif/15 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-vert-vif">
              Document Officiel AG
            </span>
          </div>
          <h2 className="mt-2 text-xl font-extrabold uppercase tracking-tight text-ink">
            Synthèse de l&apos;Assemblée Générale
          </h2>
          <p className="text-xs text-ink-3">
            Bilan consolidé de l&apos;exercice sportif, classement statutaire du Carré Vert et démocratie du club.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleDownloadAgCsv}
            className="inline-flex items-center gap-2 rounded-md border border-line bg-paper px-3.5 py-2 text-xs font-bold uppercase tracking-wider text-ink hover:bg-paper-2 hover:border-ink/30 transition-colors shadow-xs active:scale-98"
            title="Télécharger le rapport de synthèse de l'AG au format CSV"
          >
            <ArrowDownTrayIcon className="h-4 w-4 text-brand" />
            <span>Export Bilan AG</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadCarreVertCsv}
            className="inline-flex items-center gap-2 rounded-md border border-line bg-paper px-3.5 py-2 text-xs font-bold uppercase tracking-wider text-ink hover:bg-paper-2 hover:border-ink/30 transition-colors shadow-xs active:scale-98"
            title="Télécharger le tableau officiel du Carré Vert"
          >
            <TrophyIcon className="h-4 w-4 text-ambre" />
            <span>Export Carré Vert</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-2 rounded-md bg-ink px-4 py-2 text-xs font-bold uppercase tracking-wider text-white hover:bg-night-line transition-colors shadow-xs active:scale-98"
            title="Imprimer cette synthèse pour la séance de l'AG"
          >
            <PrinterIcon className="h-4 w-4 text-white" />
            <span>Imprimer</span>
          </button>
        </div>
      </div>

      {/* Main Printable Document Section */}
      <div className="rounded-lg border border-line bg-white p-6 sm:p-8 shadow-xs space-y-8 print:border-none print:shadow-none print:p-0">
        {/* Editorial Header */}
        <div className="border-b border-line pb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-brand">
                CC Saint-Martin Blanmont
              </p>
              <h1 className="text-2xl font-extrabold text-ink">
                Rapport Statistique d&apos;Activité &amp; Bilan Sportif
              </h1>
            </div>
            <div className="text-right">
              <p className="text-xs font-semibold text-ink-3">Année Officielle</p>
              <p className="text-lg font-extrabold text-ink tabular-nums">
                {stats.selectedYear}
              </p>
            </div>
          </div>
        </div>

        {/* 1. Télémétrie & Activité du Peloton */}
        <section className="space-y-4">
          <h3 className="text-sm font-extrabold uppercase tracking-tight text-ink flex items-center gap-2">
            <BicycleIcon className="h-4 w-4 text-brand" />
            <span>1. Activité Sportive &amp; Kilométrage du Peloton</span>
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="rounded-md border border-line bg-paper p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-ink-3">
                Kilomètres-Peloton
              </p>
              <p className="mt-1 text-2xl font-extrabold text-ink tabular-nums">
                {stats.telemetry.totalPelotonKm.toLocaleString('fr-BE')}{' '}
                <span className="text-xs font-semibold text-ink-3">km</span>
              </p>
              <p className="mt-1 text-xs text-ink-3">
                {stats.telemetry.earthLapsEquivalent}x le tour de la Terre
              </p>
            </div>

            <div className="rounded-md border border-line bg-paper p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-ink-3">
                Dénivelé Positif
              </p>
              <p className="mt-1 text-2xl font-extrabold text-ink tabular-nums">
                {stats.telemetry.totalPelotonElevation.toLocaleString('fr-BE')}{' '}
                <span className="text-xs font-semibold text-ink-3">m D+</span>
              </p>
              <p className="mt-1 text-xs text-ink-3">
                {stats.telemetry.everestEquivalent} ascensions de l&apos;Everest
              </p>
            </div>

            <div className="rounded-md border border-line bg-paper p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-ink-3">
                Sorties Tenues
              </p>
              <p className="mt-1 text-2xl font-extrabold text-ink tabular-nums">
                {stats.telemetry.officialRidesCount}
              </p>
              <p className="mt-1 text-xs text-ink-3">
                {stats.telemetry.totalAttendances} participations cumulées
              </p>
            </div>

            <div className="rounded-md border border-line bg-paper p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-ink-3">
                Peloton Moyen
              </p>
              <p className="mt-1 text-2xl font-extrabold text-ink tabular-nums">
                {stats.telemetry.avgPelotonSize}
              </p>
              <p className="mt-1 text-xs text-ink-3">
                coureurs par sortie organisée
              </p>
            </div>
          </div>
        </section>

        {/* 2. Palmarès Officiel du Carré Vert */}
        <section className="space-y-4">
          <h3 className="text-sm font-extrabold uppercase tracking-tight text-ink flex items-center gap-2">
            <TrophyIcon className="h-4 w-4 text-ambre" />
            <span>2. Palmarès Statutaire du Carré Vert</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {stats.carreVert.podium.map((p) => (
              <div
                key={p.rank}
                className="rounded-md border border-line bg-white p-4 relative overflow-hidden"
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-bold ${
                      p.rank === 1
                        ? 'bg-amber-100 text-amber-900 border border-amber-300'
                        : p.rank === 2
                        ? 'bg-paper-2 text-ink-2 border border-line-strong'
                        : 'bg-orange-100 text-orange-900 border border-orange-300'
                    }`}
                  >
                    {p.rank === 1 ? '1er 🥇 Champion' : p.rank === 2 ? '2e 🥈 Vice-champion' : '3e 🥉 Podium'}
                  </span>
                  <span className="text-xs font-bold text-ink-3">
                    {p.group ? `Gr. ${p.group}` : 'Cyclo'}
                  </span>
                </div>
                <p className="mt-3 text-base font-extrabold text-ink">
                  {p.name}
                </p>
                <p className="mt-1 text-xs font-bold text-ink tabular-nums">
                  {p.rides} carrés validés ({p.percent}% d&apos;assiduité)
                </p>
              </div>
            ))}
          </div>

          {/* Merit Tiers Summary */}
          <div className="rounded-md border border-line bg-paper p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-ink-3 mb-3">
              Distribution des Paliers d&apos;Assiduité
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
              <div className="rounded-sm border border-emerald-200 bg-emerald-50 p-2.5">
                <span className="text-xs font-bold uppercase text-emerald-800">
                  Carré d&apos;Or (≥80%)
                </span>
                <p className="mt-1 text-xl font-extrabold text-emerald-900 tabular-nums">
                  {stats.carreVert.tiersDistribution.or}
                </p>
              </div>
              <div className="rounded-sm border border-blue-200 bg-blue-50 p-2.5">
                <span className="text-xs font-bold uppercase text-blue-800">
                  Argent (60-79%)
                </span>
                <p className="mt-1 text-xl font-extrabold text-blue-900 tabular-nums">
                  {stats.carreVert.tiersDistribution.argent}
                </p>
              </div>
              <div className="rounded-sm border border-amber-200 bg-amber-50 p-2.5">
                <span className="text-xs font-bold uppercase text-amber-800">
                  Bronze (40-59%)
                </span>
                <p className="mt-1 text-xl font-extrabold text-amber-900 tabular-nums">
                  {stats.carreVert.tiersDistribution.bronze}
                </p>
              </div>
              <div className="rounded-sm border border-line bg-white p-2.5">
                <span className="text-xs font-bold uppercase text-ink-3">
                  Peloton (20-39%)
                </span>
                <p className="mt-1 text-xl font-extrabold text-ink tabular-nums">
                  {stats.carreVert.tiersDistribution.peloton}
                </p>
              </div>
              <div className="rounded-sm border border-line bg-white p-2.5">
                <span className="text-xs font-bold uppercase text-ink-3">
                  Occasionnel (&lt;20%)
                </span>
                <p className="mt-1 text-xl font-extrabold text-ink tabular-nums">
                  {stats.carreVert.tiersDistribution.occasionnel}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Patrimoine Routier & Démocratie */}
        <section className="space-y-4">
          <h3 className="text-sm font-extrabold uppercase tracking-tight text-ink flex items-center gap-2">
            <CheckBadgeIcon className="h-4 w-4 text-vert-vif" />
            <span>3. Patrimoine Routier &amp; Démocratie du Club</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-md border border-line bg-paper p-4 space-y-2">
              <p className="text-xs font-bold uppercase tracking-wider text-ink-3">
                Catalogue des Parcours &amp; Qualité
              </p>
              <ul className="text-xs text-ink space-y-1">
                <li className="flex justify-between">
                  <span>Traces répertoriées :</span>
                  <span className="font-extrabold tabular-nums">{stats.traces.totalTraces}</span>
                </li>
                <li className="flex justify-between">
                  <span>Distance totale du catalogue :</span>
                  <span className="font-extrabold tabular-nums">{stats.traces.totalCatalogKm} km</span>
                </li>
                <li className="flex justify-between">
                  <span>Distance moyenne d&apos;une trace :</span>
                  <span className="font-extrabold tabular-nums">{stats.traces.avgTraceDistance} km</span>
                </li>
                <li className="flex justify-between">
                  <span>Satisfaction moyenne des membres :</span>
                  <span className="font-extrabold tabular-nums">⭐ {stats.traces.feedbackStats.averageRating} / 5</span>
                </li>
              </ul>
            </div>

            <div className="rounded-md border border-line bg-paper p-4 space-y-2">
              <p className="text-xs font-bold uppercase tracking-wider text-ink-3">
                Démocratie &amp; Sorties du Samedi
              </p>
              <ul className="text-xs text-ink space-y-1">
                <li className="flex justify-between">
                  <span>Sorties du samedi proposées :</span>
                  <span className="font-extrabold tabular-nums">{stats.democracy.totalSaturdayRides}</span>
                </li>
                <li className="flex justify-between">
                  <span>Sorties soumises au vote démocratique :</span>
                  <span className="font-extrabold tabular-nums">{stats.democracy.votedRidesCount}</span>
                </li>
                <li className="flex justify-between">
                  <span>Total votes enregistrés :</span>
                  <span className="font-extrabold tabular-nums">{stats.democracy.totalVotes}</span>
                </li>
                <li className="flex justify-between">
                  <span>Moyenne de votes par sortie :</span>
                  <span className="font-extrabold tabular-nums">{stats.democracy.avgVotesPerRide} votants</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Footer Sign-off for AG */}
        <div className="pt-6 border-t border-line flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs text-ink-3">
          <p>
            Validé pour l&apos;Assemblée Générale statutaire du CC Saint-Martin Blanmont.
          </p>
          <p className="font-semibold text-ink">
            Fait à Blanmont, le {new Date().toLocaleDateString('fr-BE')}
          </p>
        </div>
      </div>
    </div>
  );
}
