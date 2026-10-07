'use client';

import React, { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import {
  UserGroupIcon,
  CalendarDaysIcon,
  ArrowTrendingUpIcon,
  MagnifyingGlassIcon,
  SparklesIcon,
  MapIcon,
  TrophyIcon,
  DocumentChartBarIcon,
  ArrowDownTrayIcon,
  FireIcon,
  StarIcon,
} from '@heroicons/react/24/outline';
import { BicycleIcon } from '@/app/components/ui/CyclingIcons';

import type { LeaderboardEntry } from '@/app/lib/firebase/leaderboard';
import type { CalendarEvent, Member, Trace, Feedback, SaturdayRide, Vote } from '@/app/types';
import type { EventAttendance } from '@/app/lib/firebase/attendance';
import {
  computeClubStatistics,
  generateCarreVertCsv,
  generateClubAgSummaryCsv,
} from '@/app/lib/clubStatistics';

import AnimatedCounter from './AnimatedCounter';
import StatsAgSummary from './StatsAgSummary';
import {
  TelemetryTimelineChart,
  RidesHistogramChart,
  GroupCompositionChart,
  TracesDistanceChart,
  TracesDirectionChart,
  DemocracyPopularChart,
} from './StatsChartsVisualizations';

const Peloton3DShowcase = dynamic(() => import('./Peloton3DShowcase'), {
  ssr: false,
  loading: () => (
    <div className="rounded-lg border border-line bg-white p-8 flex items-center justify-center min-h-[320px] text-xs text-ink-3 animate-pulse">
      <div className="flex flex-col items-center gap-2">
        <div className="h-8 w-8 rounded-full border-2 border-brand border-t-transparent animate-spin" />
        <span>Chargement du module 3D...</span>
      </div>
    </div>
  ),
});

interface StatsChartsProps {
  entries: LeaderboardEntry[];
  events?: CalendarEvent[];
  allAttendance?: EventAttendance[];
  traces?: Trace[];
  members?: Member[];
  saturdayRides?: SaturdayRide[];
  votes?: Vote[];
  feedback?: Feedback[];
}

type TabType = 'telemetrie' | 'carre_vert' | 'traces' | 'groupes_democratie' | 'ag_bilan';

export default function StatsCharts({
  entries = [],
  events = [],
  allAttendance = [],
  traces = [],
  members = [],
  saturdayRides = [],
  votes = [],
  feedback = [],
}: StatsChartsProps): React.ReactElement {
  // 1. Initial year calculation
  const initialYears = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const years = new Set<string>();
    years.add(currentYear.toString());

    entries.forEach((entry) => {
      entry.dates?.forEach((date) => {
        const parts = date.split('/');
        if (parts.length === 3) years.add(parts[2]);
      });
    });

    events.forEach((evt) => {
      if (evt.isoDate) {
        const y = evt.isoDate.slice(0, 4);
        if (y) years.add(y);
      }
    });

    return Array.from(years).sort().reverse();
  }, [entries, events]);

  const [selectedYear, setSelectedYear] = useState<string>(
    initialYears.length > 0 ? initialYears[0] : new Date().getFullYear().toString()
  );

  const [activeTab, setActiveTab] = useState<TabType>('telemetrie');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroupFilter, setSelectedGroupFilter] = useState<string>('all');

  // 2. Pure Comprehensive Club Statistics Calculation
  const stats = useMemo(() => {
    return computeClubStatistics({
      entries,
      events,
      allAttendance,
      traces,
      members,
      saturdayRides,
      votes,
      feedback,
      selectedYear,
    });
  }, [
    entries,
    events,
    allAttendance,
    traces,
    members,
    saturdayRides,
    votes,
    feedback,
    selectedYear,
  ]);

  // 3. Filtered Carré Vert entries for Table view
  const displayedEntries = useMemo(() => {
    let result = stats.carreVert.processedEntries;

    if (selectedGroupFilter !== 'all') {
      result = result.filter((entry) => {
        const group = (entry.group || 'Sans groupe').toLowerCase();
        return group.includes(selectedGroupFilter.toLowerCase());
      });
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((entry) => entry.name.toLowerCase().includes(q));
    }

    return result;
  }, [stats.carreVert.processedEntries, selectedGroupFilter, searchQuery]);

  // 4. Export CSV Handlers
  const handleDownloadCarreVertCsv = (): void => {
    const csvContent = generateCarreVertCsv(stats);
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `classement-carre-vert-${selectedYear}-cc-blanmont.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadAgCsv = (): void => {
    const csvContent = generateClubAgSummaryCsv(stats);
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `bilan-officiel-ag-${selectedYear}-cc-blanmont.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getTierBadgeStyle = (tier: string): string => {
    switch (tier) {
      case 'or':
        return 'bg-bois/40 text-vert dark:text-bois border-vert/30';
      case 'argent':
        return 'bg-hydro/10 text-hydro border-hydro/30';
      case 'bronze':
        return 'bg-ambre/15 text-ambre border-ambre/30';
      case 'peloton':
        return 'bg-paper-2 dark:bg-night-3 text-ink-2 dark:text-snow-2 border-line dark:border-night-line';
      default:
        return 'bg-paper-2 dark:bg-night-3 text-ink-3 dark:text-snow-3 border-line dark:border-night-line';
    }
  };

  const getTierLabel = (tier: string): string => {
    switch (tier) {
      case 'or':
        return 'Carré d\'Or (≥80%)';
      case 'argent':
        return 'Carré d\'Argent (60-79%)';
      case 'bronze':
        return 'Carré de Bronze (40-59%)';
      case 'peloton':
        return 'Peloton (20-39%)';
      default:
        return 'Occasionnel (<20%)';
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Filter & Season Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-paper dark:bg-night-2 p-4 sm:p-5 rounded-md border border-line dark:border-night-line">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-ink dark:bg-night-3 text-white border border-line dark:border-night-line">
            <BicycleIcon className="h-5 w-5 text-brand" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-wider text-ink-3 dark:text-snow-3 font-narrow">
              Période Analysée
            </p>
            <p className="text-sm sm:text-base font-extrabold text-ink dark:text-snow-1 font-semiwide truncate">
              Saison Cycliste {selectedYear} &bull; CC Saint-Martin Blanmont
            </p>
          </div>
        </div>

        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 shrink-0">
          {/* Year selector */}
          <div className="flex items-center gap-2 rounded-md border border-line dark:border-night-line bg-paper-2 dark:bg-night-3 px-3 py-1.5">
            <label
              htmlFor="year-select"
              className="text-xs font-bold uppercase tracking-wider text-ink-3 dark:text-snow-3 font-narrow whitespace-nowrap"
            >
              Année :
            </label>
            <select
              id="year-select"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="bg-transparent text-xs font-bold text-ink dark:text-snow-1 focus:outline-none cursor-pointer"
            >
              {stats.availableYears.map((year) => (
                <option key={year} value={year} className="bg-paper dark:bg-night-2 text-ink dark:text-snow-1">
                  Saison {year}
                </option>
              ))}
            </select>
          </div>

          {/* Unified CSV Export Group */}
          <div className="inline-flex items-center rounded-md border border-line dark:border-night-line bg-paper-2 dark:bg-night-3 overflow-hidden divide-x divide-line dark:divide-night-line">
            <button
              type="button"
              onClick={handleDownloadCarreVertCsv}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold uppercase tracking-[0.06em] text-ink dark:text-snow-1 font-narrow hover:bg-paper dark:hover:bg-night-2 active:translate-y-px transition-colors cursor-pointer whitespace-nowrap"
              title="Exporter le classement Carré Vert en CSV"
            >
              <ArrowDownTrayIcon className="h-3.5 w-3.5 text-ambre" />
              <span>CSV Carré Vert</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadAgCsv}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold uppercase tracking-[0.06em] text-ink dark:text-snow-1 font-narrow hover:bg-paper dark:hover:bg-night-2 active:translate-y-px transition-colors cursor-pointer whitespace-nowrap"
              title="Exporter la synthèse de l'Assemblée Générale en CSV"
            >
              <ArrowDownTrayIcon className="h-3.5 w-3.5 text-brand" />
              <span>CSV Bilan AG</span>
            </button>
          </div>
        </div>
      </div>

      {/* 5 Thematic Navigation Tabs — Carte IGN Sheet Navigator */}
      <nav aria-label="Sous-navigation analytique" className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 p-1.5 bg-paper-2/60 dark:bg-night-3/60 rounded-md border border-line dark:border-night-line">
        {/* Tab 1 */}
        <button
          type="button"
          onClick={() => setActiveTab('telemetrie')}
          aria-label="1. Télémétrie & Affluence"
          className={`group relative flex flex-col justify-between p-3 rounded-md text-left transition-all cursor-pointer ${
            activeTab === 'telemetrie'
              ? 'bg-paper dark:bg-night shadow-xs border border-line dark:border-night-line text-ink dark:text-snow-1'
              : 'bg-transparent hover:bg-paper/70 dark:hover:bg-night-2/70 text-ink-3 dark:text-snow-3 hover:text-ink dark:hover:text-snow-1 border border-transparent'
          }`}
        >
          {activeTab === 'telemetrie' && (
            <span className="absolute top-0 left-2 right-2 h-0.5 bg-brand rounded-full" />
          )}
          <div className="flex items-center justify-between gap-1 mb-1.5">
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-ink-4 dark:text-snow-4">
              01 &bull; Direct
            </span>
            <BicycleIcon className="h-4 w-4 text-brand shrink-0" />
          </div>
          <span className="text-xs font-extrabold uppercase tracking-tight font-semiwide leading-snug">
            1. Télémétrie &amp; Affluence
          </span>
          <span className="mt-1 text-[11px] text-ink-3 dark:text-snow-3 font-normal font-sans">
            {stats.telemetry.officialRidesCount} sorties &bull; {stats.telemetry.avgPelotonSize} moy.
          </span>
        </button>

        {/* Tab 2 */}
        <button
          type="button"
          onClick={() => setActiveTab('carre_vert')}
          aria-label="2. Carré Vert & Assiduité"
          className={`group relative flex flex-col justify-between p-3 rounded-md text-left transition-all cursor-pointer ${
            activeTab === 'carre_vert'
              ? 'bg-paper dark:bg-night shadow-xs border border-line dark:border-night-line text-ink dark:text-snow-1'
              : 'bg-transparent hover:bg-paper/70 dark:hover:bg-night-2/70 text-ink-3 dark:text-snow-3 hover:text-ink dark:hover:text-snow-1 border border-transparent'
          }`}
        >
          {activeTab === 'carre_vert' && (
            <span className="absolute top-0 left-2 right-2 h-0.5 bg-ambre rounded-full" />
          )}
          <div className="flex items-center justify-between gap-1 mb-1.5">
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-ink-4 dark:text-snow-4">
              02 &bull; Trophée
            </span>
            <TrophyIcon className="h-4 w-4 text-ambre shrink-0" />
          </div>
          <span className="text-xs font-extrabold uppercase tracking-tight font-semiwide leading-snug">
            2. Carré Vert &amp; Assiduité
          </span>
          <span className="mt-1 text-[11px] text-ink-3 dark:text-snow-3 font-normal font-sans">
            {stats.carreVert.activeMembers} actifs &bull; {stats.carreVert.totalPossibleCarres} max
          </span>
        </button>

        {/* Tab 3 */}
        <button
          type="button"
          onClick={() => setActiveTab('traces')}
          aria-label="3. Traces & Parcours GPS"
          className={`group relative flex flex-col justify-between p-3 rounded-md text-left transition-all cursor-pointer ${
            activeTab === 'traces'
              ? 'bg-paper dark:bg-night shadow-xs border border-line dark:border-night-line text-ink dark:text-snow-1'
              : 'bg-transparent hover:bg-paper/70 dark:hover:bg-night-2/70 text-ink-3 dark:text-snow-3 hover:text-ink dark:hover:text-snow-1 border border-transparent'
          }`}
        >
          {activeTab === 'traces' && (
            <span className="absolute top-0 left-2 right-2 h-0.5 bg-hydro rounded-full" />
          )}
          <div className="flex items-center justify-between gap-1 mb-1.5">
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-ink-4 dark:text-snow-4">
              03 &bull; Répertoire
            </span>
            <MapIcon className="h-4 w-4 text-hydro shrink-0" />
          </div>
          <span className="text-xs font-extrabold uppercase tracking-tight font-semiwide leading-snug">
            3. Traces &amp; Parcours GPS
          </span>
          <span className="mt-1 text-[11px] text-ink-3 dark:text-snow-3 font-normal font-sans">
            {stats.traces.totalTraces} tracés &bull; {stats.traces.avgTraceDistance} km moy.
          </span>
        </button>

        {/* Tab 4 */}
        <button
          type="button"
          onClick={() => setActiveTab('groupes_democratie')}
          aria-label="4. Groupes & Démocratie"
          className={`group relative flex flex-col justify-between p-3 rounded-md text-left transition-all cursor-pointer ${
            activeTab === 'groupes_democratie'
              ? 'bg-paper dark:bg-night shadow-xs border border-line dark:border-night-line text-ink dark:text-snow-1'
              : 'bg-transparent hover:bg-paper/70 dark:hover:bg-night-2/70 text-ink-3 dark:text-snow-3 hover:text-ink dark:hover:text-snow-1 border border-transparent'
          }`}
        >
          {activeTab === 'groupes_democratie' && (
            <span className="absolute top-0 left-2 right-2 h-0.5 bg-vert rounded-full" />
          )}
          <div className="flex items-center justify-between gap-1 mb-1.5">
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-ink-4 dark:text-snow-4">
              04 &bull; Allures
            </span>
            <UserGroupIcon className="h-4 w-4 text-vert shrink-0" />
          </div>
          <span className="text-xs font-extrabold uppercase tracking-tight font-semiwide leading-snug">
            4. Groupes &amp; Démocratie
          </span>
          <span className="mt-1 text-[11px] text-ink-3 dark:text-snow-3 font-normal font-sans">
            {stats.democracy.totalVotes} votes &bull; {stats.groupDynamics.groupStats.length} groupes
          </span>
        </button>

        {/* Tab 5 */}
        <button
          type="button"
          onClick={() => setActiveTab('ag_bilan')}
          aria-label="5. Bilan AG & Synthèse"
          className={`group relative flex flex-col justify-between p-3 rounded-md text-left transition-all cursor-pointer col-span-2 sm:col-span-1 lg:col-span-1 ${
            activeTab === 'ag_bilan'
              ? 'bg-paper dark:bg-night shadow-xs border border-line dark:border-night-line text-ink dark:text-snow-1'
              : 'bg-transparent hover:bg-paper/70 dark:hover:bg-night-2/70 text-ink-3 dark:text-snow-3 hover:text-ink dark:hover:text-snow-1 border border-transparent'
          }`}
        >
          {activeTab === 'ag_bilan' && (
            <span className="absolute top-0 left-2 right-2 h-0.5 bg-brand rounded-full" />
          )}
          <div className="flex items-center justify-between gap-1 mb-1.5">
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-ink-4 dark:text-snow-4">
              05 &bull; Statuts
            </span>
            <DocumentChartBarIcon className="h-4 w-4 text-brand shrink-0" />
          </div>
          <span className="text-xs font-extrabold uppercase tracking-tight font-semiwide leading-snug">
            5. Bilan AG &amp; Synthèse
          </span>
          <span className="mt-1 text-[11px] text-ink-3 dark:text-snow-3 font-normal font-sans">
            Rapport officiel &bull; Imprimer
          </span>
        </button>
      </nav>

      {/* ========================================================================= */}
      {/* TAB 1: TÉLÉMÉTRIE & AFFLUENCE */}
      {/* ========================================================================= */}
      {activeTab === 'telemetrie' && (
        <div className="space-y-8">
          {/* Top 4 Essential KPIs of Club Telemetry */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* 1. Total Peloton Km */}
            <div className="rounded-md border border-line dark:border-night-line bg-paper dark:bg-night-2 p-5 transition-all">
              <div className="flex items-center justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-md bg-brand/10 text-brand border border-brand/20">
                  <BicycleIcon className="h-6 w-6" />
                </div>
                <span className="rounded-full bg-brand/15 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-brand font-narrow">
                  Effort Collectif
                </span>
              </div>
              <p className="mt-4 text-xs font-bold uppercase tracking-wider text-ink-3 dark:text-snow-3 font-narrow">
                Kilomètres-Peloton
              </p>
              <div className="mt-1 flex items-baseline gap-1.5 font-mono">
                <AnimatedCounter
                  value={stats.telemetry.totalPelotonKm}
                  className="text-3xl font-extrabold text-ink dark:text-snow-1 tabular-nums"
                />
                <span className="text-sm font-bold text-ink-3 dark:text-snow-3">km</span>
              </div>
              <p className="mt-2 text-xs text-ink-3 dark:text-snow-3">
                Soit <strong className="text-ink dark:text-snow-1 font-mono">{stats.telemetry.earthLapsEquivalent}x</strong> le tour de la Terre
              </p>
            </div>

            {/* 2. Total Peloton Elevation */}
            <div className="rounded-md border border-line dark:border-night-line bg-paper dark:bg-night-2 p-5 transition-all">
              <div className="flex items-center justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-md bg-ambre/10 text-ambre border border-ambre/20">
                  <ArrowTrendingUpIcon className="h-6 w-6" />
                </div>
                <span className="rounded-full bg-ambre/15 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-ambre font-narrow">
                  Dénivelé Positif
                </span>
              </div>
              <p className="mt-4 text-xs font-bold uppercase tracking-wider text-ink-3 dark:text-snow-3 font-narrow">
                Dénivelé Total Gravis
              </p>
              <div className="mt-1 flex items-baseline gap-1.5 font-mono">
                <AnimatedCounter
                  value={stats.telemetry.totalPelotonElevation}
                  className="text-3xl font-extrabold text-ink dark:text-snow-1 tabular-nums"
                />
                <span className="text-sm font-bold text-ink-3 dark:text-snow-3">m D+</span>
              </div>
              <p className="mt-2 text-xs text-ink-3 dark:text-snow-3">
                Équivaut à <strong className="text-ink dark:text-snow-1 font-mono">{stats.telemetry.everestEquivalent}x</strong> l&apos;Everest
              </p>
            </div>

            {/* 3. Official Rides & Avg Peloton Size */}
            <div className="rounded-md border border-line dark:border-night-line bg-paper dark:bg-night-2 p-5 transition-all">
              <div className="flex items-center justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-md bg-bois/40 dark:bg-vert/20 text-vert dark:text-bois border border-vert/20">
                  <CalendarDaysIcon className="h-6 w-6" />
                </div>
                <span className="rounded-full bg-bois/40 dark:bg-vert/20 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-vert dark:text-bois font-narrow">
                  Peloton Moyen
                </span>
              </div>
              <p className="mt-4 text-xs font-bold uppercase tracking-wider text-ink-3 dark:text-snow-3 font-narrow">
                Sorties Tenues
              </p>
              <div className="mt-1 flex items-baseline gap-2 font-mono">
                <AnimatedCounter
                  value={stats.telemetry.officialRidesCount}
                  className="text-3xl font-extrabold text-ink dark:text-snow-1 tabular-nums"
                />
                <span className="text-xs font-semibold text-ink-3 dark:text-snow-3">
                  ({stats.telemetry.totalAttendances.toLocaleString('fr-BE')} présences cumulées)
                </span>
              </div>
              <p className="mt-2 text-xs text-ink-3 dark:text-snow-3">
                Moyenne de <strong className="text-ink dark:text-snow-1 font-mono">{stats.telemetry.avgPelotonSize}</strong> cyclos / sortie
              </p>
            </div>

            {/* 4. Active Member Rate */}
            <div className="rounded-md border border-line dark:border-night-line bg-paper dark:bg-night-2 p-5 transition-all">
              <div className="flex items-center justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-md bg-hydro/10 text-hydro border border-hydro/20">
                  <UserGroupIcon className="h-6 w-6" />
                </div>
                <span className="rounded-full bg-hydro/15 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-hydro font-narrow">
                  Engagement
                </span>
              </div>
              <p className="mt-4 text-xs font-bold uppercase tracking-wider text-ink-3 dark:text-snow-3 font-narrow">
                Membres Actifs
              </p>
              <div className="mt-1 flex items-baseline gap-1.5 font-mono">
                <AnimatedCounter
                  value={stats.carreVert.activeMembers}
                  className="text-3xl font-extrabold text-ink dark:text-snow-1 tabular-nums"
                />
                <span className="text-xs font-semibold text-ink-3 dark:text-snow-3">
                  / {stats.carreVert.totalMembers} ({stats.carreVert.activityRate}%)
                </span>
              </div>
              <p className="mt-2 text-xs text-ink-3 dark:text-snow-3">
                Moyenne de <strong className="text-ink dark:text-snow-1 font-mono">{stats.carreVert.averageRidesPerActive}</strong> sorties / actif
              </p>
            </div>
          </div>

          {/* Three.js 3D Showcase Hero */}
          <Peloton3DShowcase
            championName={stats.carreVert.topPerformer}
            maxRides={stats.carreVert.maxRides}
            totalPossibleCarres={stats.carreVert.totalPossibleCarres}
            selectedYear={selectedYear}
            weeklyDistribution={stats.weeklyDistribution}
          />

          {/* Visualizations Grid Section */}
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="lg:col-span-2">
              <TelemetryTimelineChart
                selectedYear={selectedYear}
                weeklyDistribution={stats.weeklyDistribution}
                monthlyData={stats.monthlyData}
                telemetryStats={stats.telemetry}
              />
            </div>

            {/* Monthly Heatmap */}
            <div className="rounded-md border border-line dark:border-night-line bg-paper dark:bg-night-2 p-5 sm:p-6 lg:col-span-2">
              <div className="border-b border-line dark:border-night-line pb-3 mb-4 flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold uppercase tracking-tight text-ink dark:text-snow-1 font-semiwide">
                    Intensité Mensuelle du Peloton
                  </h3>
                  <p className="text-xs text-ink-3 dark:text-snow-3">
                    Volume cumulé de présences mois par mois sur la saison
                  </p>
                </div>
                <span className="text-xs font-bold text-ink-3 dark:text-snow-3 uppercase tracking-wider font-narrow">
                  12 Mois
                </span>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-6 lg:grid-cols-12 gap-2 text-center">
                {stats.monthlyData.map((m) => {
                  const maxMonthly = Math.max(
                    ...stats.monthlyData.map((x) => x.totalAttendance),
                    1
                  );
                  const intensityRatio = m.totalAttendance / maxMonthly;

                  return (
                    <div
                      key={m.monthName}
                      className="flex flex-col items-center justify-between rounded-md border border-line dark:border-night-line bg-paper-2 dark:bg-night-3 p-2.5 transition-colors"
                    >
                      <span className="text-xs font-bold uppercase tracking-wider text-ink-3 dark:text-snow-3 font-narrow">
                        {m.monthName.slice(0, 3)}
                      </span>
                      <div className="my-2 h-14 w-full flex items-end justify-center">
                        <div
                          className="w-4 rounded-xs transition-all duration-300"
                          style={{
                            height: `${Math.max(intensityRatio * 100, 8)}%`,
                            backgroundColor:
                              m.totalAttendance > 0
                                ? intensityRatio > 0.7
                                  ? '#e03e3e'
                                  : intensityRatio > 0.3
                                  ? '#e8962a'
                                  : '#2e7d45'
                                : '#dcddd4',
                          }}
                          title={`${m.totalAttendance} présences (${m.pelotonKm} km)`}
                        />
                      </div>
                      <span className="text-xs font-bold text-ink dark:text-snow-1 tabular-nums font-mono">
                        {m.totalAttendance}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Season Highlights & Records */}
          <div className="rounded-md border border-line dark:border-night-line bg-paper dark:bg-night-2 p-5 sm:p-6">
            <div className="border-b border-line dark:border-night-line pb-3 mb-4 flex items-center gap-2">
              <FireIcon className="h-5 w-5 text-brand" />
              <h3 className="font-extrabold uppercase tracking-tight text-ink dark:text-snow-1 font-semiwide">
                Faits Marquants &amp; Records de la Saison {selectedYear}
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="rounded-md border border-line dark:border-night-line bg-paper-2/60 dark:bg-night-3/60 p-4 relative overflow-hidden">
                <span className="absolute top-0 left-0 right-0 h-0.5 bg-brand" />
                <p className="text-xs font-bold uppercase tracking-wider text-ink-3 dark:text-snow-3 font-narrow">
                  Record d&apos;Affluence
                </p>
                <p className="mt-1 text-xl font-extrabold text-ink dark:text-snow-1 font-mono tabular-nums">
                  {stats.telemetry.biggestPelotonEvent
                    ? `${stats.telemetry.biggestPelotonEvent.count} cyclistes`
                    : '-'}
                </p>
                <p className="mt-1.5 text-xs text-ink-3 dark:text-snow-3 font-sans truncate">
                  {stats.telemetry.biggestPelotonEvent
                    ? `${stats.telemetry.biggestPelotonEvent.date} (${stats.telemetry.biggestPelotonEvent.location})`
                    : 'Aucun record'}
                </p>
              </div>

              <div className="rounded-md border border-line dark:border-night-line bg-paper-2/60 dark:bg-night-3/60 p-4 relative overflow-hidden">
                <span className="absolute top-0 left-0 right-0 h-0.5 bg-hydro" />
                <p className="text-xs font-bold uppercase tracking-wider text-ink-3 dark:text-snow-3 font-narrow">
                  Sortie la Plus Longue
                </p>
                <p className="mt-1 text-xl font-extrabold text-ink dark:text-snow-1 font-mono tabular-nums">
                  {stats.telemetry.longestRideEvent
                    ? `${stats.telemetry.longestRideEvent.distance} km`
                    : '-'}
                </p>
                <p className="mt-1.5 text-xs text-ink-3 dark:text-snow-3 font-sans truncate">
                  {stats.telemetry.longestRideEvent
                    ? `${stats.telemetry.longestRideEvent.date} (${stats.telemetry.longestRideEvent.location})`
                    : 'Aucune donnée'}
                </p>
              </div>

              <div className="rounded-md border border-line dark:border-night-line bg-paper-2/60 dark:bg-night-3/60 p-4 relative overflow-hidden">
                <span className="absolute top-0 left-0 right-0 h-0.5 bg-bistre" />
                <p className="text-xs font-bold uppercase tracking-wider text-ink-3 dark:text-snow-3 font-narrow">
                  Sortie la Plus Exigeante
                </p>
                <p className="mt-1 text-xl font-extrabold text-ink dark:text-snow-1 font-mono tabular-nums">
                  {stats.telemetry.toughestRideEvent
                    ? `${stats.telemetry.toughestRideEvent.elevation} m D+`
                    : '-'}
                </p>
                <p className="mt-1.5 text-xs text-ink-3 dark:text-snow-3 font-sans truncate">
                  {stats.telemetry.toughestRideEvent
                    ? `${stats.telemetry.toughestRideEvent.date} (${stats.telemetry.toughestRideEvent.location})`
                    : 'Aucune donnée'}
                </p>
              </div>

              <div className="rounded-md border border-line dark:border-night-line bg-paper-2/60 dark:bg-night-3/60 p-4 relative overflow-hidden">
                <span className="absolute top-0 left-0 right-0 h-0.5 bg-vert" />
                <p className="text-xs font-bold uppercase tracking-wider text-ink-3 dark:text-snow-3 font-narrow">
                  Mois le Plus Actif
                </p>
                <p className="mt-1 text-xl font-extrabold text-ink dark:text-snow-1 font-mono">
                  {stats.telemetry.mostActiveMonth?.monthName || '-'}
                </p>
                <p className="mt-1.5 text-xs text-ink-3 dark:text-snow-3 font-sans truncate">
                  {stats.telemetry.mostActiveMonth
                    ? `${stats.telemetry.mostActiveMonth.totalAttendance} présences (${stats.telemetry.mostActiveMonth.ridesCount} sorties)`
                    : 'Aucune donnée'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: CARRÉ VERT & ASSIDUITÉ */}
      {/* ========================================================================= */}
      {activeTab === 'carre_vert' && (
        <div className="space-y-8">
          {/* Rules & Merit Tiers Cards */}
          <div className="rounded-md border border-line dark:border-night-line bg-paper dark:bg-night-2 p-5 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-line dark:border-night-line pb-3 mb-4">
              <div>
                <h3 className="font-extrabold uppercase tracking-tight text-ink dark:text-snow-1 font-semiwide flex items-center gap-2">
                  <TrophyIcon className="h-5 w-5 text-ambre" />
                  <span>Paliers d&apos;Honneur du Carré Vert</span>
                </h3>
                <p className="text-xs text-ink-3 dark:text-snow-3">
                  Règle officielle : 1 carré maximum par week-end (samedi ou dimanche) + sorties semaine retenues
                </p>
              </div>
              <span className="text-xs font-bold text-ink dark:text-snow-1 bg-paper-2 dark:bg-night-3 px-2.5 py-1 rounded-md border border-line dark:border-night-line font-mono">
                {stats.carreVert.totalPossibleCarres} carrés possibles
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div className="rounded-md border border-vert/30 bg-bois/40 dark:bg-vert/20 p-3 text-center">
                <span className="text-xs font-extrabold uppercase tracking-wider text-vert dark:text-bois font-narrow">
                  Carré d&apos;Or (≥80%)
                </span>
                <p className="mt-1 text-2xl font-extrabold text-vert-dark dark:text-bois tabular-nums font-mono">
                  {stats.carreVert.tiersDistribution.or}
                </p>
                <p className="text-xs text-vert dark:text-bois/80">piliers du peloton</p>
              </div>

              <div className="rounded-md border border-hydro/30 bg-hydro/10 dark:bg-hydro/20 p-3 text-center">
                <span className="text-xs font-extrabold uppercase tracking-wider text-hydro font-narrow">
                  Argent (60–79%)
                </span>
                <p className="mt-1 text-2xl font-extrabold text-hydro tabular-nums font-mono">
                  {stats.carreVert.tiersDistribution.argent}
                </p>
                <p className="text-xs text-hydro/80">très réguliers</p>
              </div>

              <div className="rounded-md border border-ambre/30 bg-ambre/10 dark:bg-ambre/20 p-3 text-center">
                <span className="text-xs font-extrabold uppercase tracking-wider text-ambre font-narrow">
                  Bronze (40–59%)
                </span>
                <p className="mt-1 text-2xl font-extrabold text-ambre tabular-nums font-mono">
                  {stats.carreVert.tiersDistribution.bronze}
                </p>
                <p className="text-xs text-ambre/80">fidèles</p>
              </div>

              <div className="rounded-md border border-line dark:border-night-line bg-paper-2 dark:bg-night-3 p-3 text-center">
                <span className="text-xs font-extrabold uppercase tracking-wider text-ink-3 dark:text-snow-3 font-narrow">
                  Peloton (20–39%)
                </span>
                <p className="mt-1 text-2xl font-extrabold text-ink dark:text-snow-1 tabular-nums font-mono">
                  {stats.carreVert.tiersDistribution.peloton}
                </p>
                <p className="text-xs text-ink-3 dark:text-snow-3">occasionnels</p>
              </div>

              <div className="rounded-md border border-line dark:border-night-line bg-paper-2 dark:bg-night-3 p-3 text-center">
                <span className="text-xs font-extrabold uppercase tracking-wider text-ink-3 dark:text-snow-3 font-narrow">
                  Occasionnel (&lt;20%)
                </span>
                <p className="mt-1 text-2xl font-extrabold text-ink dark:text-snow-1 tabular-nums font-mono">
                  {stats.carreVert.tiersDistribution.occasionnel}
                </p>
                <p className="text-xs text-ink-3 dark:text-snow-3">en reprise</p>
              </div>
            </div>
          </div>

          {/* Histogram chart of attendance */}
          <RidesHistogramChart ridesBuckets={stats.carreVert.ridesBuckets} />

          {/* Official Carré Vert Rankings Table */}
          <div className="rounded-md border border-line dark:border-night-line bg-paper dark:bg-night-2 overflow-hidden">
            {/* Table Header & Search Filter Bar */}
            <div className="border-b border-line dark:border-night-line p-4 sm:p-5 bg-paper dark:bg-night-2">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-extrabold uppercase tracking-tight text-ink dark:text-snow-1 font-semiwide">
                      Classement Officiel du Carré Vert {selectedYear}
                    </h2>
                    <span className="rounded-full bg-ink dark:bg-snow-1 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-paper dark:text-ink font-mono">
                      {displayedEntries.length} Inscrits
                    </span>
                  </div>
                  <p className="text-xs text-ink-3 dark:text-snow-3">
                    Tableau officiel de régularité pour l&apos;attribution du trophée annuel
                  </p>
                </div>

                {/* Search Input & Group Filters */}
                <div className="flex flex-wrap items-center gap-2.5">
                  <div className="relative min-w-[200px]">
                    <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-3" />
                    <input
                      id="stats-cyclist-search"
                      type="text"
                      aria-label="Rechercher un cycliste"
                      placeholder="Rechercher un cycliste..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full rounded-md border border-line dark:border-night-line bg-paper-2 dark:bg-night-3 py-1.5 pl-9 pr-3 text-xs font-semibold text-ink dark:text-snow-1 placeholder:text-ink-3 dark:placeholder:text-snow-3 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                    />
                  </div>

                  {/* Group Filter Selector */}
                  <div className="flex items-center rounded-md border border-line dark:border-night-line bg-paper-2 dark:bg-night-3 p-0.5 text-xs">
                    {['all', 'A', 'B', 'C', 'VTT'].map((g) => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => setSelectedGroupFilter(g)}
                        className={`rounded-sm px-2.5 py-1 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                          selectedGroupFilter === g
                            ? 'bg-paper dark:bg-night text-ink dark:text-snow-1'
                            : 'text-ink-3 dark:text-snow-3 hover:text-ink dark:hover:text-snow-1'
                        }`}
                      >
                        {g === 'all' ? 'Tous' : `Gr. ${g}`}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Table Body */}
            <div className="max-h-[500px] overflow-x-auto overflow-y-auto">
              <table className="min-w-full divide-y divide-line dark:divide-night-line">
                <thead className="bg-paper-2 dark:bg-night-3 sticky top-0 z-10">
                  <tr>
                    <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-ink-3 dark:text-snow-3">
                      Rang
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-ink-3 dark:text-snow-3">
                      Membre
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-ink-3 dark:text-snow-3">
                      Groupe
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-ink-3 dark:text-snow-3">
                      Palier de Mérite
                    </th>
                    <th className="px-5 py-3 text-right text-xs font-bold uppercase tracking-wider text-ink-3 dark:text-snow-3">
                      Carrés Validés
                    </th>
                    <th className="px-5 py-3 text-right text-xs font-bold uppercase tracking-wider text-ink-3 dark:text-snow-3">
                      Taux d&apos;Assiduité
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line dark:divide-night-line bg-paper dark:bg-night-2 text-xs">
                  {displayedEntries.length > 0 ? (
                    displayedEntries.map((entry, index) => (
                      <tr
                        key={entry.id}
                        className="hover:bg-paper-2/50 dark:hover:bg-night-3/50 transition-colors duration-150"
                      >
                        {/* Rank / Podium Badge */}
                        <td className="whitespace-nowrap px-5 py-3 font-extrabold text-ink dark:text-snow-1">
                          {index === 0 ? (
                            <span className="inline-flex items-center gap-1 rounded-sm bg-ambre/20 px-2 py-0.5 text-xs font-bold text-amber-900 dark:text-amber-200 border border-ambre/40 font-mono">
                              1er
                            </span>
                          ) : index === 1 ? (
                            <span className="inline-flex items-center gap-1 rounded-sm bg-paper-2 dark:bg-night-3 px-2 py-0.5 text-xs font-bold text-ink dark:text-snow-1 border border-line-strong dark:border-night-line font-mono">
                              2e
                            </span>
                          ) : index === 2 ? (
                            <span className="inline-flex items-center gap-1 rounded-sm bg-bistre/15 px-2 py-0.5 text-xs font-bold text-bistre-dark dark:text-bistre border border-bistre/30 font-mono">
                              3e
                            </span>
                          ) : (
                            <span className="text-ink-3 dark:text-snow-3 tabular-nums pl-1.5 font-bold font-mono">
                              {index + 1}
                            </span>
                          )}
                        </td>

                        {/* Member Name */}
                        <td className="whitespace-nowrap px-5 py-3 font-bold text-ink dark:text-snow-1">
                          {entry.name}
                          {index === 0 && entry.rides > 0 && (
                            <span className="ml-2 inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-ambre font-narrow">
                              <SparklesIcon className="h-3.5 w-3.5" />
                              Champion
                            </span>
                          )}
                        </td>

                        {/* Group */}
                        <td className="whitespace-nowrap px-5 py-3">
                          <span className="inline-flex rounded-xs px-2 py-0.5 text-xs font-bold uppercase tracking-wider bg-paper-2 dark:bg-night-3 text-ink-2 dark:text-snow-2 border border-line dark:border-night-line font-narrow">
                            {entry.group || 'Sans groupe'}
                          </span>
                        </td>

                        {/* Merit Tier */}
                        <td className="whitespace-nowrap px-5 py-3">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold border font-narrow ${getTierBadgeStyle(
                              entry.tier
                            )}`}
                          >
                            {getTierLabel(entry.tier)}
                          </span>
                        </td>

                        {/* Rides Count */}
                        <td className="whitespace-nowrap px-5 py-3 text-right font-extrabold text-ink dark:text-snow-1 tabular-nums font-mono">
                          {entry.rides}
                        </td>

                        {/* Attendance Percentage & Progress Bar */}
                        <td className="whitespace-nowrap px-5 py-3 text-right">
                          <div
                            className="flex items-center justify-end gap-2.5"
                            title={`${entry.rides} sur ${stats.carreVert.totalPossibleCarres} carrés possibles`}
                          >
                            <span className="w-9 text-right font-bold text-ink dark:text-snow-1 tabular-nums font-mono">
                              {entry.percent}%
                            </span>
                            <div className="h-2 w-20 overflow-hidden rounded-xs bg-paper-2 dark:bg-night-3 border border-line dark:border-night-line">
                              <div
                                className="h-full rounded-xs transition-all duration-300"
                                style={{
                                  width: `${Math.min(entry.percent, 100)}%`,
                                  backgroundColor:
                                    entry.percent >= 80
                                      ? '#2e7d45'
                                      : entry.percent >= 60
                                      ? '#1f6fbf'
                                      : entry.percent >= 40
                                      ? '#e8962a'
                                      : '#b0703b',
                                }}
                              />
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-5 py-8 text-center text-xs font-semibold text-ink-3 dark:text-snow-3"
                      >
                        Aucun cycliste ne correspond à votre recherche.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: TRACES & PARCOURS GPS */}
      {/* ========================================================================= */}
      {activeTab === 'traces' && (
        <div className="space-y-8">
          {/* Top 4 KPIs of Traces Catalog */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-md border border-line dark:border-night-line bg-paper dark:bg-night-2 p-5">
              <p className="text-xs font-bold uppercase tracking-wider text-ink-3 dark:text-snow-3 font-narrow">
                Catalogue des Traces
              </p>
              <div className="mt-1 flex items-baseline gap-1.5 font-mono">
                <AnimatedCounter
                  value={stats.traces.totalTraces}
                  className="text-3xl font-extrabold text-ink dark:text-snow-1 tabular-nums"
                />
                <span className="text-xs font-semibold text-ink-3 dark:text-snow-3 font-sans">parcours</span>
              </div>
              <p className="mt-2 text-xs text-ink-3 dark:text-snow-3">
                Tracés GPS balisés et archivés
              </p>
            </div>

            <div className="rounded-md border border-line dark:border-night-line bg-paper dark:bg-night-2 p-5">
              <p className="text-xs font-bold uppercase tracking-wider text-ink-3 dark:text-snow-3 font-narrow">
                Distance Totale Répertoire
              </p>
              <div className="mt-1 flex items-baseline gap-1.5 font-mono">
                <AnimatedCounter
                  value={stats.traces.totalCatalogKm}
                  className="text-3xl font-extrabold text-ink dark:text-snow-1 tabular-nums"
                />
                <span className="text-xs font-semibold text-ink-3 dark:text-snow-3 font-sans">km</span>
              </div>
              <p className="mt-2 text-xs text-ink-3 dark:text-snow-3">
                Moyenne de {stats.traces.avgTraceDistance} km par parcours
              </p>
            </div>

            <div className="rounded-md border border-line dark:border-night-line bg-paper dark:bg-night-2 p-5">
              <p className="text-xs font-bold uppercase tracking-wider text-ink-3 dark:text-snow-3 font-narrow">
                Dénivelé Moyen
              </p>
              <div className="mt-1 flex items-baseline gap-1.5 font-mono">
                <AnimatedCounter
                  value={stats.traces.avgTraceElevation}
                  className="text-3xl font-extrabold text-ink dark:text-snow-1 tabular-nums"
                />
                <span className="text-xs font-semibold text-ink-3 dark:text-snow-3 font-sans">m D+</span>
              </div>
              <p className="mt-2 text-xs text-ink-3 dark:text-snow-3">
                Ratio de {stats.traces.avgSlopeRatio} m D+ / km
              </p>
            </div>

            <div className="rounded-md border border-line dark:border-night-line bg-paper dark:bg-night-2 p-5">
              <p className="text-xs font-bold uppercase tracking-wider text-ink-3 dark:text-snow-3 font-narrow">
                Satisfaction Cyclos
              </p>
              <div className="mt-1 flex items-baseline gap-1.5 font-mono">
                <div className="flex items-center gap-1.5">
                  <StarIcon className="h-6 w-6 text-ambre fill-ambre shrink-0" />
                  <span className="text-3xl font-extrabold text-ink dark:text-snow-1 tabular-nums">
                    {stats.traces.feedbackStats.averageRating}
                  </span>
                </div>
                <span className="text-xs font-semibold text-ink-3 dark:text-snow-3 font-sans">/ 5</span>
              </div>
              <p className="mt-2 text-xs text-ink-3 dark:text-snow-3">
                Basé sur {stats.traces.feedbackStats.totalReviews} avis déposés
              </p>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid gap-6 lg:grid-cols-2">
            <TracesDistanceChart tracesStats={stats.traces} />
            <TracesDirectionChart tracesStats={stats.traces} />
          </div>

          {/* Top Rated Traces List */}
          <div className="rounded-md border border-line dark:border-night-line bg-paper dark:bg-night-2 p-5 sm:p-6">
            <div className="border-b border-line dark:border-night-line pb-3 mb-4 flex items-center justify-between">
              <div>
                <h3 className="font-extrabold uppercase tracking-tight text-ink dark:text-snow-1 font-semiwide">
                  Top 5 des Tracés les Mieux Notés
                </h3>
                <p className="text-xs text-ink-3 dark:text-snow-3">
                  Les parcours plébiscités par les adhérents du CC Saint-Martin Blanmont
                </p>
              </div>
              <span className="rounded-full bg-ambre/15 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-ambre font-narrow">
                Coups de Cœur
              </span>
            </div>

            {stats.traces.feedbackStats.topRatedTraces.length > 0 ? (
              <div className="divide-y divide-line dark:divide-night-line">
                {stats.traces.feedbackStats.topRatedTraces.map((t, idx) => (
                  <div
                    key={t.id}
                    className="py-3 px-2 flex items-center justify-between text-xs hover:bg-paper-2/50 dark:hover:bg-night-3/50 transition-colors rounded-sm"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-sm bg-paper-2 dark:bg-night-3 border border-line dark:border-night-line font-mono text-xs font-bold text-ink-2 dark:text-snow-2">
                        #{idx + 1}
                      </span>
                      <div className="min-w-0">
                        <p className="font-bold text-ink dark:text-snow-1 truncate">{t.name}</p>
                        <div className="mt-0.5 flex items-center gap-1.5 text-xs text-ink-3 dark:text-snow-3 font-mono">
                          <span className="tabular-nums font-semibold">{t.distance} km</span>
                          {t.elevation ? (
                            <>
                              <span className="text-ink-4 dark:text-snow-4">•</span>
                              <span className="tabular-nums font-semibold">{t.elevation} m D+</span>
                            </>
                          ) : null}
                        </div>
                      </div>
                    </div>
                    <div className="text-right shrink-0 font-mono ml-4">
                      <div className="flex items-center justify-end gap-1">
                        <StarIcon className="h-3.5 w-3.5 text-ambre fill-ambre" />
                        <span className="font-extrabold text-ink dark:text-snow-1 tabular-nums">
                          {t.rating}
                        </span>
                        <span className="text-[11px] text-ink-3 dark:text-snow-3 font-sans">/ 5</span>
                      </div>
                      <p className="text-[11px] text-ink-3 dark:text-snow-3 font-sans">
                        {t.reviewCount} {t.reviewCount > 1 ? 'avis' : 'avis'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-ink-3 dark:text-snow-3 italic">
                Aucun avis pour l&apos;instant sur les parcours.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: GROUPES & DÉMOCRATIE */}
      {/* ========================================================================= */}
      {activeTab === 'groupes_democratie' && (
        <div className="space-y-8">
          {/* Charts Row */}
          <div className="grid gap-6 lg:grid-cols-2">
            <GroupCompositionChart groupDynamics={stats.groupDynamics} />
            <DemocracyPopularChart democracy={stats.democracy} />
          </div>

          {/* Saturday Rides Democratic Telemetry */}
          <div className="rounded-md border border-line dark:border-night-line bg-paper dark:bg-night-2 p-5 sm:p-6">
            <div className="border-b border-line dark:border-night-line pb-3 mb-4 flex items-center justify-between">
              <div>
                <h3 className="font-extrabold uppercase tracking-tight text-ink dark:text-snow-1 font-semiwide">
                  Démocratie des Sorties du Samedi
                </h3>
                <p className="text-xs text-ink-3 dark:text-snow-3">
                  Participation des membres aux votes hebdomadaires des tracés
                </p>
              </div>
              <span className="rounded-full bg-bois/40 dark:bg-vert/20 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-vert dark:text-bois font-narrow">
                Votes Ouverts
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="rounded-md border border-line dark:border-night-line bg-paper-2/60 dark:bg-night-3/60 p-4 text-center relative overflow-hidden">
                <span className="absolute top-0 left-0 right-0 h-0.5 bg-brand" />
                <span className="text-xs font-bold uppercase tracking-wider text-ink-3 dark:text-snow-3 font-narrow">
                  Sorties Proposées
                </span>
                <p className="mt-1 text-2xl font-extrabold text-ink dark:text-snow-1 tabular-nums font-mono">
                  {stats.democracy.totalSaturdayRides}
                </p>
                <p className="mt-1 text-[11px] text-ink-3 dark:text-snow-3">
                  calendrier officiel
                </p>
              </div>

              <div className="rounded-md border border-line dark:border-night-line bg-paper-2/60 dark:bg-night-3/60 p-4 text-center relative overflow-hidden">
                <span className="absolute top-0 left-0 right-0 h-0.5 bg-hydro" />
                <span className="text-xs font-bold uppercase tracking-wider text-ink-3 dark:text-snow-3 font-narrow">
                  Sorties Votées
                </span>
                <p className="mt-1 text-2xl font-extrabold text-ink dark:text-snow-1 tabular-nums font-mono">
                  {stats.democracy.votedRidesCount}
                </p>
                <p className="mt-1 text-[11px] text-ink-3 dark:text-snow-3">
                  soumises aux membres
                </p>
              </div>

              <div className="rounded-md border border-line dark:border-night-line bg-paper-2/60 dark:bg-night-3/60 p-4 text-center relative overflow-hidden">
                <span className="absolute top-0 left-0 right-0 h-0.5 bg-vert" />
                <span className="text-xs font-bold uppercase tracking-wider text-ink-3 dark:text-snow-3 font-narrow">
                  Total Suffrages
                </span>
                <p className="mt-1 text-2xl font-extrabold text-ink dark:text-snow-1 tabular-nums font-mono">
                  {stats.democracy.totalVotes}
                </p>
                <p className="mt-1 text-[11px] text-ink-3 dark:text-snow-3">
                  voix exprimées
                </p>
              </div>

              <div className="rounded-md border border-line dark:border-night-line bg-paper-2/60 dark:bg-night-3/60 p-4 text-center relative overflow-hidden">
                <span className="absolute top-0 left-0 right-0 h-0.5 bg-ambre" />
                <span className="text-xs font-bold uppercase tracking-wider text-ink-3 dark:text-snow-3 font-narrow">
                  Moyenne Votants
                </span>
                <p className="mt-1 text-2xl font-extrabold text-ink dark:text-snow-1 tabular-nums font-mono">
                  {stats.democracy.avgVotesPerRide}
                </p>
                <p className="mt-1 text-[11px] text-ink-3 dark:text-snow-3">
                  votes / sortie
                </p>
              </div>
            </div>
          </div>

          {/* Administrative Health & Compliance */}
          <div className="rounded-md border border-line dark:border-night-line bg-paper dark:bg-night-2 p-5 sm:p-6">
            <div className="border-b border-line dark:border-night-line pb-3 mb-4 flex items-center justify-between">
              <div>
                <h3 className="font-extrabold uppercase tracking-tight text-ink dark:text-snow-1 font-semiwide">
                  Santé Administrative &amp; Adhésions
                </h3>
                <p className="text-xs text-ink-3 dark:text-snow-3">
                  Cotisations statutaires, affiliation FFBC et adoption Strava
                </p>
              </div>
              <span className="rounded-full bg-ink dark:bg-snow-1 text-paper dark:text-ink px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider font-mono">
                {stats.administration.totalMembers} Adhérents
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="rounded-md border border-line dark:border-night-line bg-paper-2/60 dark:bg-night-3/60 p-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold uppercase tracking-wider text-ink-3 dark:text-snow-3 font-narrow">
                    Cotisations {selectedYear} en Règle
                  </p>
                  <span className="rounded-full bg-vert/15 px-2 py-0.5 text-xs font-bold font-mono text-vert border border-vert/20">
                    {stats.administration.cotisationComplianceRate}%
                  </span>
                </div>
                <div className="mt-2 flex items-baseline gap-1.5 font-mono">
                  <span className="text-2xl font-extrabold text-ink dark:text-snow-1 tabular-nums">
                    {stats.administration.cotisationPaid + stats.administration.cotisationExempt}
                  </span>
                  <span className="text-xs font-semibold text-ink-3 dark:text-snow-3 font-sans">
                    / {stats.administration.totalMembers} membres
                  </span>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-xs bg-paper dark:bg-night border border-line dark:border-night-line">
                  <div
                    className="h-full bg-vert transition-all duration-300"
                    style={{ width: `${stats.administration.cotisationComplianceRate}%` }}
                  />
                </div>
              </div>

              <div className="rounded-md border border-line dark:border-night-line bg-paper-2/60 dark:bg-night-3/60 p-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold uppercase tracking-wider text-ink-3 dark:text-snow-3 font-narrow">
                    Licenciés Fédération FFBC
                  </p>
                  <span className="rounded-full bg-hydro/15 px-2 py-0.5 text-xs font-bold font-mono text-hydro border border-hydro/20">
                    {stats.administration.ffbcComplianceRate}%
                  </span>
                </div>
                <div className="mt-2 flex items-baseline gap-1.5 font-mono">
                  <span className="text-2xl font-extrabold text-ink dark:text-snow-1 tabular-nums">
                    {stats.administration.ffbcLicensedCount}
                  </span>
                  <span className="text-xs font-semibold text-ink-3 dark:text-snow-3 font-sans">
                    / {stats.administration.totalMembers} membres
                  </span>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-xs bg-paper dark:bg-night border border-line dark:border-night-line">
                  <div
                    className="h-full bg-hydro transition-all duration-300"
                    style={{ width: `${stats.administration.ffbcComplianceRate}%` }}
                  />
                </div>
              </div>

              <div className="rounded-md border border-line dark:border-night-line bg-paper-2/60 dark:bg-night-3/60 p-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold uppercase tracking-wider text-ink-3 dark:text-snow-3 font-narrow">
                    Profils Strava Connectés
                  </p>
                  <span className="rounded-full bg-ambre/15 px-2 py-0.5 text-xs font-bold font-mono text-ambre border border-ambre/20">
                    {stats.administration.stravaAdoptionRate}%
                  </span>
                </div>
                <div className="mt-2 flex items-baseline gap-1.5 font-mono">
                  <span className="text-2xl font-extrabold text-ink dark:text-snow-1 tabular-nums">
                    {stats.administration.stravaLinkedCount}
                  </span>
                  <span className="text-xs font-semibold text-ink-3 dark:text-snow-3 font-sans">
                    / {stats.administration.totalMembers} membres
                  </span>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-xs bg-paper dark:bg-night border border-line dark:border-night-line">
                  <div
                    className="h-full bg-ambre transition-all duration-300"
                    style={{ width: `${stats.administration.stravaAdoptionRate}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: BILAN AG & SYNTHÈSE */}
      {/* ========================================================================= */}
      {activeTab === 'ag_bilan' && <StatsAgSummary stats={stats} />}
    </div>
  );
}
