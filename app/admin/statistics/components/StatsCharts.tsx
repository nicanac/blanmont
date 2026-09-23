'use client';

import React, { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import {
  ChartBarIcon,
  UserGroupIcon,
  CalendarDaysIcon,
  ArrowTrendingUpIcon,
  MagnifyingGlassIcon,
  SparklesIcon,
  MapIcon,
  TrophyIcon,
  DocumentChartBarIcon,
  ArrowDownTrayIcon,
  ShieldCheckIcon,
  FireIcon,
  StarIcon,
} from '@heroicons/react/24/outline';
import { BicycleIcon, TrophySquareIcon } from '@/app/components/ui/CyclingIcons';

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
  const handleDownloadCarreVertCsv = () => {
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

  const handleDownloadAgCsv = () => {
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
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'argent':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'bronze':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'peloton':
        return 'bg-paper-2 text-ink-2 border-line';
      default:
        return 'bg-stone-100 text-stone-600 border-stone-200';
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
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-white p-4 sm:p-5 rounded-lg border border-line shadow-xs">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-ink text-white">
            <BicycleIcon className="h-5 w-5 text-brand" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-ink-3">
              Période Analysée
            </p>
            <p className="text-base font-extrabold text-ink">
              Saison Cycliste {selectedYear} &bull; CC Saint-Martin Blanmont
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Year selector */}
          <div className="flex items-center gap-2">
            <label
              htmlFor="year-select"
              className="text-xs font-bold uppercase tracking-wider text-ink-3"
            >
              Année :
            </label>
            <select
              id="year-select"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="rounded-md border border-line bg-paper py-2 pl-3 pr-8 text-xs font-bold text-ink focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand cursor-pointer"
            >
              {stats.availableYears.map((year) => (
                <option key={year} value={year}>
                  Saison {year}
                </option>
              ))}
            </select>
          </div>

          {/* Direct CSV Export Buttons */}
          <button
            type="button"
            onClick={handleDownloadCarreVertCsv}
            className="inline-flex items-center gap-1.5 rounded-md border border-line bg-paper px-3 py-2 text-xs font-bold uppercase tracking-wider text-ink hover:bg-paper-2 transition-colors shadow-xs active:scale-98"
            title="Exporter le classement Carré Vert en CSV"
          >
            <ArrowDownTrayIcon className="h-3.5 w-3.5 text-ambre" />
            <span>CSV Carré Vert</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadAgCsv}
            className="inline-flex items-center gap-1.5 rounded-md border border-line bg-paper px-3 py-2 text-xs font-bold uppercase tracking-wider text-ink hover:bg-paper-2 transition-colors shadow-xs active:scale-98"
            title="Exporter la synthèse de l'Assemblée Générale en CSV"
          >
            <ArrowDownTrayIcon className="h-3.5 w-3.5 text-brand" />
            <span>CSV Bilan AG</span>
          </button>
        </div>
      </div>

      {/* 5 Thematic Navigation Tabs */}
      <div className="flex border-b border-line bg-white rounded-lg p-1.5 shadow-xs overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('telemetrie')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-md text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
            activeTab === 'telemetrie'
              ? 'bg-ink text-white shadow-xs'
              : 'text-ink-3 hover:text-ink hover:bg-paper'
          }`}
        >
          <BicycleIcon className="h-4 w-4 text-brand" />
          <span>1. Télémétrie &amp; Affluence</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('carre_vert')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-md text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
            activeTab === 'carre_vert'
              ? 'bg-ink text-white shadow-xs'
              : 'text-ink-3 hover:text-ink hover:bg-paper'
          }`}
        >
          <TrophyIcon className="h-4 w-4 text-ambre" />
          <span>2. Carré Vert &amp; Assiduité</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('traces')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-md text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
            activeTab === 'traces'
              ? 'bg-ink text-white shadow-xs'
              : 'text-ink-3 hover:text-ink hover:bg-paper'
          }`}
        >
          <MapIcon className="h-4 w-4 text-hydro" />
          <span>3. Traces &amp; Parcours GPS</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('groupes_democratie')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-md text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
            activeTab === 'groupes_democratie'
              ? 'bg-ink text-white shadow-xs'
              : 'text-ink-3 hover:text-ink hover:bg-paper'
          }`}
        >
          <UserGroupIcon className="h-4 w-4 text-vert-vif" />
          <span>4. Groupes &amp; Démocratie</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('ag_bilan')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-md text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
            activeTab === 'ag_bilan'
              ? 'bg-ink text-white shadow-xs'
              : 'text-ink-3 hover:text-ink hover:bg-paper'
          }`}
        >
          <DocumentChartBarIcon className="h-4 w-4 text-brand" />
          <span>5. Bilan AG &amp; Synthèse</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: TÉLÉMÉTRIE & AFFLUENCE */}
      {/* ========================================================================= */}
      {activeTab === 'telemetrie' && (
        <div className="space-y-8">
          {/* Top 4 Essential KPIs of Club Telemetry */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* 1. Total Peloton Km */}
            <div className="rounded-lg border border-line bg-white p-5 shadow-xs transition-all hover:border-ink/20">
              <div className="flex items-center justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-md bg-brand/10 text-brand border border-brand/20">
                  <BicycleIcon className="h-6 w-6" />
                </div>
                <span className="rounded-full bg-brand/15 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-brand">
                  Effort Collectif
                </span>
              </div>
              <p className="mt-4 text-xs font-bold uppercase tracking-wider text-ink-3">
                Kilomètres-Peloton
              </p>
              <div className="mt-1 flex items-baseline gap-1.5">
                <AnimatedCounter
                  value={stats.telemetry.totalPelotonKm}
                  className="text-3xl font-extrabold text-ink"
                />
                <span className="text-sm font-bold text-ink-3">km</span>
              </div>
              <p className="mt-2 text-xs text-ink-3">
                Soit <strong className="text-ink">{stats.telemetry.earthLapsEquivalent}x</strong> le tour de la Terre
              </p>
            </div>

            {/* 2. Total Peloton Elevation */}
            <div className="rounded-lg border border-line bg-white p-5 shadow-xs transition-all hover:border-ink/20">
              <div className="flex items-center justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-md bg-ambre/10 text-ambre border border-ambre/20">
                  <ArrowTrendingUpIcon className="h-6 w-6" />
                </div>
                <span className="rounded-full bg-ambre/15 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-ambre">
                  Dénivelé Positif
                </span>
              </div>
              <p className="mt-4 text-xs font-bold uppercase tracking-wider text-ink-3">
                Dénivelé Total Gravis
              </p>
              <div className="mt-1 flex items-baseline gap-1.5">
                <AnimatedCounter
                  value={stats.telemetry.totalPelotonElevation}
                  className="text-3xl font-extrabold text-ink"
                />
                <span className="text-sm font-bold text-ink-3">m D+</span>
              </div>
              <p className="mt-2 text-xs text-ink-3">
                Équivaut à <strong className="text-ink">{stats.telemetry.everestEquivalent}x</strong> l&apos;Everest
              </p>
            </div>

            {/* 3. Official Rides & Avg Peloton Size */}
            <div className="rounded-lg border border-line bg-white p-5 shadow-xs transition-all hover:border-ink/20">
              <div className="flex items-center justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-md bg-vert-vif/10 text-vert-vif border border-vert-vif/20">
                  <CalendarDaysIcon className="h-6 w-6" />
                </div>
                <span className="rounded-full bg-vert-vif/15 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-vert-vif">
                  Peloton Moyen
                </span>
              </div>
              <p className="mt-4 text-xs font-bold uppercase tracking-wider text-ink-3">
                Sorties Tenues
              </p>
              <div className="mt-1 flex items-baseline gap-2">
                <AnimatedCounter
                  value={stats.telemetry.officialRidesCount}
                  className="text-3xl font-extrabold text-ink"
                />
                <span className="text-xs font-semibold text-ink-3">
                  ({stats.telemetry.totalAttendances} cyclos cumulés)
                </span>
              </div>
              <p className="mt-2 text-xs text-ink-3">
                Moyenne de <strong className="text-ink">{stats.telemetry.avgPelotonSize}</strong> cyclos / sortie
              </p>
            </div>

            {/* 4. Active Member Rate */}
            <div className="rounded-lg border border-line bg-white p-5 shadow-xs transition-all hover:border-ink/20">
              <div className="flex items-center justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-md bg-hydro/10 text-hydro border border-hydro/20">
                  <UserGroupIcon className="h-6 w-6" />
                </div>
                <span className="rounded-full bg-hydro/15 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-hydro">
                  Engagement
                </span>
              </div>
              <p className="mt-4 text-xs font-bold uppercase tracking-wider text-ink-3">
                Membres Actifs
              </p>
              <div className="mt-1 flex items-baseline gap-1.5">
                <AnimatedCounter
                  value={stats.carreVert.activeMembers}
                  className="text-3xl font-extrabold text-ink"
                />
                <span className="text-xs font-semibold text-ink-3">
                  / {stats.carreVert.totalMembers} ({stats.carreVert.activityRate}%)
                </span>
              </div>
              <p className="mt-2 text-xs text-ink-3">
                Moyenne de <strong className="text-ink">{stats.carreVert.averageRidesPerActive}</strong> sorties / actif
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
              />
            </div>

            {/* Monthly Heatmap */}
            <div className="rounded-lg border border-line bg-white p-5 sm:p-6 shadow-xs lg:col-span-2">
              <div className="border-b border-line pb-3 mb-4 flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold uppercase tracking-tight text-ink">
                    Intensité Mensuelle du Peloton
                  </h3>
                  <p className="text-xs text-ink-3">
                    Volume cumulé de présences mois par mois sur la saison
                  </p>
                </div>
                <span className="text-xs font-bold text-ink-3 uppercase tracking-wider">
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
                      className="flex flex-col items-center justify-between rounded-md border border-line bg-paper p-2.5 transition-colors hover:border-ink/30"
                    >
                      <span className="text-xs font-bold uppercase tracking-wider text-ink-3">
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
                                  ? '#f59e0b'
                                  : '#10b981'
                                : '#e4e0d8',
                          }}
                          title={`${m.totalAttendance} présences (${m.pelotonKm} km)`}
                        />
                      </div>
                      <span className="text-xs font-bold text-ink tabular-nums">
                        {m.totalAttendance}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Season Highlights & Records */}
          <div className="rounded-lg border border-line bg-white p-5 sm:p-6 shadow-xs">
            <div className="border-b border-line pb-3 mb-4 flex items-center gap-2">
              <FireIcon className="h-5 w-5 text-brand" />
              <h3 className="font-extrabold uppercase tracking-tight text-ink">
                Faits Marquants &amp; Records de la Saison {selectedYear}
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="rounded-md border border-line bg-paper p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-ink-3">
                  Record d&apos;Affluence
                </p>
                <p className="mt-1 text-xl font-extrabold text-ink">
                  {stats.telemetry.biggestPelotonEvent
                    ? `${stats.telemetry.biggestPelotonEvent.count} cyclistes`
                    : '-'}
                </p>
                <p className="mt-1 text-xs text-ink-3">
                  {stats.telemetry.biggestPelotonEvent
                    ? `${stats.telemetry.biggestPelotonEvent.date} (${stats.telemetry.biggestPelotonEvent.location})`
                    : 'Aucun record'}
                </p>
              </div>

              <div className="rounded-md border border-line bg-paper p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-ink-3">
                  Sortie la Plus Longue
                </p>
                <p className="mt-1 text-xl font-extrabold text-ink">
                  {stats.telemetry.longestRideEvent
                    ? `${stats.telemetry.longestRideEvent.distance} km`
                    : '-'}
                </p>
                <p className="mt-1 text-xs text-ink-3">
                  {stats.telemetry.longestRideEvent
                    ? `${stats.telemetry.longestRideEvent.date} (${stats.telemetry.longestRideEvent.location})`
                    : 'Aucune donnée'}
                </p>
              </div>

              <div className="rounded-md border border-line bg-paper p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-ink-3">
                  Sortie la Plus Exigeante
                </p>
                <p className="mt-1 text-xl font-extrabold text-ink">
                  {stats.telemetry.toughestRideEvent
                    ? `${stats.telemetry.toughestRideEvent.elevation} m D+`
                    : '-'}
                </p>
                <p className="mt-1 text-xs text-ink-3">
                  {stats.telemetry.toughestRideEvent
                    ? `${stats.telemetry.toughestRideEvent.date} (${stats.telemetry.toughestRideEvent.location})`
                    : 'Aucune donnée'}
                </p>
              </div>

              <div className="rounded-md border border-line bg-paper p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-ink-3">
                  Mois le Plus Actif
                </p>
                <p className="mt-1 text-xl font-extrabold text-ink">
                  {stats.telemetry.mostActiveMonth?.monthName || '-'}
                </p>
                <p className="mt-1 text-xs text-ink-3">
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
          <div className="rounded-lg border border-line bg-white p-5 sm:p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-line pb-3 mb-4">
              <div>
                <h3 className="font-extrabold uppercase tracking-tight text-ink flex items-center gap-2">
                  <TrophyIcon className="h-5 w-5 text-ambre" />
                  <span>Paliers d&apos;Honneur du Carré Vert</span>
                </h3>
                <p className="text-xs text-ink-3">
                  Règle officielle : 1 carré maximum par week-end (samedi ou dimanche) + sorties semaine retenues
                </p>
              </div>
              <span className="text-xs font-bold text-ink bg-paper px-2.5 py-1 rounded-md border border-line">
                {stats.carreVert.totalPossibleCarres} carrés possibles
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div className="rounded-md border border-emerald-300 bg-emerald-50/80 p-3 text-center">
                <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-800">
                  Carré d&apos;Or (≥80%)
                </span>
                <p className="mt-1 text-2xl font-extrabold text-emerald-950 tabular-nums">
                  {stats.carreVert.tiersDistribution.or}
                </p>
                <p className="text-xs text-emerald-700">piliers du peloton</p>
              </div>

              <div className="rounded-md border border-blue-300 bg-blue-50/80 p-3 text-center">
                <span className="text-xs font-extrabold uppercase tracking-wider text-blue-800">
                  Argent (60–79%)
                </span>
                <p className="mt-1 text-2xl font-extrabold text-blue-950 tabular-nums">
                  {stats.carreVert.tiersDistribution.argent}
                </p>
                <p className="text-xs text-blue-700">très réguliers</p>
              </div>

              <div className="rounded-md border border-amber-300 bg-amber-50/80 p-3 text-center">
                <span className="text-xs font-extrabold uppercase tracking-wider text-amber-800">
                  Bronze (40–59%)
                </span>
                <p className="mt-1 text-2xl font-extrabold text-amber-950 tabular-nums">
                  {stats.carreVert.tiersDistribution.bronze}
                </p>
                <p className="text-xs text-amber-700">fidèles</p>
              </div>

              <div className="rounded-md border border-line bg-paper p-3 text-center">
                <span className="text-xs font-extrabold uppercase tracking-wider text-ink-3">
                  Peloton (20–39%)
                </span>
                <p className="mt-1 text-2xl font-extrabold text-ink tabular-nums">
                  {stats.carreVert.tiersDistribution.peloton}
                </p>
                <p className="text-xs text-ink-3">occasionnels</p>
              </div>

              <div className="rounded-md border border-line bg-paper p-3 text-center">
                <span className="text-xs font-extrabold uppercase tracking-wider text-ink-3">
                  Occasionnel (&lt;20%)
                </span>
                <p className="mt-1 text-2xl font-extrabold text-ink tabular-nums">
                  {stats.carreVert.tiersDistribution.occasionnel}
                </p>
                <p className="text-xs text-ink-3">en reprise</p>
              </div>
            </div>
          </div>

          {/* Histogram chart of attendance */}
          <RidesHistogramChart ridesBuckets={stats.carreVert.ridesBuckets} />

          {/* Official Carré Vert Rankings Table */}
          <div className="rounded-lg border border-line bg-white shadow-xs overflow-hidden">
            {/* Table Header & Search Filter Bar */}
            <div className="border-b border-line p-4 sm:p-5 bg-white">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-extrabold uppercase tracking-tight text-ink">
                      Classement Officiel du Carré Vert {selectedYear}
                    </h2>
                    <span className="rounded-full bg-ink px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-white">
                      {displayedEntries.length} Inscrits
                    </span>
                  </div>
                  <p className="text-xs text-ink-3">
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
                      className="w-full rounded-md border border-line bg-paper py-1.5 pl-9 pr-3 text-xs font-semibold text-ink placeholder:text-ink-3 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                    />
                  </div>

                  {/* Group Filter Selector */}
                  <div className="flex items-center rounded-md border border-line bg-paper p-0.5 text-xs">
                    {['all', 'A', 'B', 'C', 'VTT'].map((g) => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => setSelectedGroupFilter(g)}
                        className={`rounded-sm px-2.5 py-1 text-xs font-bold uppercase tracking-wider transition-all ${
                          selectedGroupFilter === g
                            ? 'bg-white text-ink shadow-xs'
                            : 'text-ink-3 hover:text-ink'
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
              <table className="min-w-full divide-y divide-line">
                <thead className="bg-paper sticky top-0 z-10">
                  <tr>
                    <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-ink-3">
                      Rang
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-ink-3">
                      Membre
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-ink-3">
                      Groupe
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-ink-3">
                      Palier de Mérite
                    </th>
                    <th className="px-5 py-3 text-right text-xs font-bold uppercase tracking-wider text-ink-3">
                      Carrés Validés
                    </th>
                    <th className="px-5 py-3 text-right text-xs font-bold uppercase tracking-wider text-ink-3">
                      Taux d&apos;Assiduité
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line bg-white text-xs">
                  {displayedEntries.length > 0 ? (
                    displayedEntries.map((entry, index) => (
                      <tr
                        key={entry.id}
                        className="hover:bg-paper transition-colors duration-150"
                      >
                        {/* Rank / Podium Badge */}
                        <td className="whitespace-nowrap px-5 py-3 font-extrabold text-ink">
                          {index === 0 ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-ambre/20 px-2 py-0.5 text-xs font-bold text-ambre-ink border border-ambre/40">
                              1er 🥇
                            </span>
                          ) : index === 1 ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-paper-2 px-2 py-0.5 text-xs font-bold text-ink-2 border border-line-strong">
                              2e 🥈
                            </span>
                          ) : index === 2 ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-800 border border-amber-300">
                              3e 🥉
                            </span>
                          ) : (
                            <span className="text-ink-3 tabular-nums pl-1.5 font-bold">
                              {index + 1}
                            </span>
                          )}
                        </td>

                        {/* Member Name */}
                        <td className="whitespace-nowrap px-5 py-3 font-bold text-ink">
                          {entry.name}
                          {index === 0 && entry.rides > 0 && (
                            <span className="ml-2 inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-ambre">
                              <SparklesIcon className="h-3.5 w-3.5" />
                              Champion
                            </span>
                          )}
                        </td>

                        {/* Group */}
                        <td className="whitespace-nowrap px-5 py-3">
                          <span className="inline-flex rounded-xs px-2 py-0.5 text-xs font-bold uppercase tracking-wider bg-paper text-ink border border-line">
                            {entry.group || 'Sans groupe'}
                          </span>
                        </td>

                        {/* Merit Tier */}
                        <td className="whitespace-nowrap px-5 py-3">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold border ${getTierBadgeStyle(
                              entry.tier
                            )}`}
                          >
                            {getTierLabel(entry.tier)}
                          </span>
                        </td>

                        {/* Rides Count */}
                        <td className="whitespace-nowrap px-5 py-3 text-right font-extrabold text-ink tabular-nums">
                          {entry.rides}
                        </td>

                        {/* Attendance Percentage & Progress Bar */}
                        <td className="whitespace-nowrap px-5 py-3 text-right">
                          <div
                            className="flex items-center justify-end gap-2.5"
                            title={`${entry.rides} sur ${stats.carreVert.totalPossibleCarres} carrés possibles`}
                          >
                            <span className="w-9 text-right font-bold text-ink tabular-nums">
                              {entry.percent}%
                            </span>
                            <div className="h-2 w-20 overflow-hidden rounded-xs bg-paper-2 border border-line">
                              <div
                                className="h-full rounded-xs transition-all duration-300"
                                style={{
                                  width: `${Math.min(entry.percent, 100)}%`,
                                  backgroundColor:
                                    entry.percent >= 80
                                      ? '#10b981'
                                      : entry.percent >= 60
                                      ? '#3b82f6'
                                      : entry.percent >= 40
                                      ? '#f59e0b'
                                      : '#e03e3e',
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
                        className="px-5 py-8 text-center text-xs font-semibold text-ink-3"
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
            <div className="rounded-lg border border-line bg-white p-5 shadow-xs">
              <p className="text-xs font-bold uppercase tracking-wider text-ink-3">
                Catalogue des Traces
              </p>
              <div className="mt-1 flex items-baseline gap-1.5">
                <AnimatedCounter
                  value={stats.traces.totalTraces}
                  className="text-3xl font-extrabold text-ink"
                />
                <span className="text-xs font-semibold text-ink-3">parcours</span>
              </div>
              <p className="mt-2 text-xs text-ink-3">
                Tracés GPS balisés et archivés
              </p>
            </div>

            <div className="rounded-lg border border-line bg-white p-5 shadow-xs">
              <p className="text-xs font-bold uppercase tracking-wider text-ink-3">
                Distance Totale Répertoire
              </p>
              <div className="mt-1 flex items-baseline gap-1.5">
                <AnimatedCounter
                  value={stats.traces.totalCatalogKm}
                  className="text-3xl font-extrabold text-ink"
                />
                <span className="text-xs font-semibold text-ink-3">km</span>
              </div>
              <p className="mt-2 text-xs text-ink-3">
                Moyenne de {stats.traces.avgTraceDistance} km par parcours
              </p>
            </div>

            <div className="rounded-lg border border-line bg-white p-5 shadow-xs">
              <p className="text-xs font-bold uppercase tracking-wider text-ink-3">
                Dénivelé Moyen
              </p>
              <div className="mt-1 flex items-baseline gap-1.5">
                <AnimatedCounter
                  value={stats.traces.avgTraceElevation}
                  className="text-3xl font-extrabold text-ink"
                />
                <span className="text-xs font-semibold text-ink-3">m D+</span>
              </div>
              <p className="mt-2 text-xs text-ink-3">
                Ratio de {stats.traces.avgSlopeRatio} m D+ / km
              </p>
            </div>

            <div className="rounded-lg border border-line bg-white p-5 shadow-xs">
              <p className="text-xs font-bold uppercase tracking-wider text-ink-3">
                Satisfaction Cyclos
              </p>
              <div className="mt-1 flex items-baseline gap-1.5">
                <span className="text-3xl font-extrabold text-ink">
                  ⭐ {stats.traces.feedbackStats.averageRating}
                </span>
                <span className="text-xs font-semibold text-ink-3">/ 5</span>
              </div>
              <p className="mt-2 text-xs text-ink-3">
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
          <div className="rounded-lg border border-line bg-white p-5 sm:p-6 shadow-xs">
            <div className="border-b border-line pb-3 mb-4 flex items-center justify-between">
              <div>
                <h3 className="font-extrabold uppercase tracking-tight text-ink">
                  Top 5 des Tracés les Mieux Notés
                </h3>
                <p className="text-xs text-ink-3">
                  Les parcours plébiscités par les adhérents du CC Saint-Martin Blanmont
                </p>
              </div>
              <span className="rounded-full bg-ambre/15 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-ambre">
                Coups de Cœur
              </span>
            </div>

            {stats.traces.feedbackStats.topRatedTraces.length > 0 ? (
              <div className="divide-y divide-line">
                {stats.traces.feedbackStats.topRatedTraces.map((t, idx) => (
                  <div
                    key={t.id}
                    className="py-3 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-extrabold text-ink-3 w-5 tabular-nums">
                        #{idx + 1}
                      </span>
                      <div>
                        <p className="font-bold text-ink">{t.name}</p>
                        <p className="text-xs text-ink-3">
                          {t.distance} km {t.elevation ? `&bull; ${t.elevation} m D+` : ''}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-extrabold text-ink">
                        ⭐ {t.rating} / 5
                      </span>
                      <p className="text-xs text-ink-3">
                        {t.reviewCount} avis
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-ink-3">
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
          <div className="rounded-lg border border-line bg-white p-5 sm:p-6 shadow-xs">
            <div className="border-b border-line pb-3 mb-4 flex items-center justify-between">
              <div>
                <h3 className="font-extrabold uppercase tracking-tight text-ink">
                  Démocratie des Sorties du Samedi
                </h3>
                <p className="text-xs text-ink-3">
                  Participation des membres aux votes hebdomadaires des tracés
                </p>
              </div>
              <span className="rounded-full bg-vert-vif/15 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-vert-vif">
                Votes Ouverts
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="rounded-md border border-line bg-paper p-3 text-center">
                <span className="text-xs font-bold uppercase tracking-wider text-ink-3">
                  Sorties Proposées
                </span>
                <p className="mt-1 text-2xl font-extrabold text-ink tabular-nums">
                  {stats.democracy.totalSaturdayRides}
                </p>
              </div>

              <div className="rounded-md border border-line bg-paper p-3 text-center">
                <span className="text-xs font-bold uppercase tracking-wider text-ink-3">
                  Sorties Votées
                </span>
                <p className="mt-1 text-2xl font-extrabold text-ink tabular-nums">
                  {stats.democracy.votedRidesCount}
                </p>
              </div>

              <div className="rounded-md border border-line bg-paper p-3 text-center">
                <span className="text-xs font-bold uppercase tracking-wider text-ink-3">
                  Total Suffrages
                </span>
                <p className="mt-1 text-2xl font-extrabold text-ink tabular-nums">
                  {stats.democracy.totalVotes}
                </p>
              </div>

              <div className="rounded-md border border-line bg-paper p-3 text-center">
                <span className="text-xs font-bold uppercase tracking-wider text-ink-3">
                  Moyenne Votants
                </span>
                <p className="mt-1 text-2xl font-extrabold text-ink tabular-nums">
                  {stats.democracy.avgVotesPerRide}
                </p>
              </div>
            </div>
          </div>

          {/* Administrative Health & Compliance */}
          <div className="rounded-lg border border-line bg-white p-5 sm:p-6 shadow-xs">
            <div className="border-b border-line pb-3 mb-4 flex items-center justify-between">
              <div>
                <h3 className="font-extrabold uppercase tracking-tight text-ink">
                  Santé Administrative &amp; Adhésions
                </h3>
                <p className="text-xs text-ink-3">
                  Cotisations statutaires, affiliation FFBC et adoption Strava
                </p>
              </div>
              <span className="rounded-full bg-ink text-white px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider">
                {stats.administration.totalMembers} Adhérents
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="rounded-md border border-line bg-paper p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-ink-3">
                  Cotisations 2026 en Règle
                </p>
                <div className="mt-1 flex items-baseline gap-1.5">
                  <span className="text-2xl font-extrabold text-ink tabular-nums">
                    {stats.administration.cotisationPaid + stats.administration.cotisationExempt}
                  </span>
                  <span className="text-xs font-semibold text-ink-3">
                    / {stats.administration.totalMembers} ({stats.administration.cotisationComplianceRate}%)
                  </span>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-xs bg-line">
                  <div
                    className="h-full bg-vert-vif"
                    style={{ width: `${stats.administration.cotisationComplianceRate}%` }}
                  />
                </div>
              </div>

              <div className="rounded-md border border-line bg-paper p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-ink-3">
                  Licenciés Fédération FFBC
                </p>
                <div className="mt-1 flex items-baseline gap-1.5">
                  <span className="text-2xl font-extrabold text-ink tabular-nums">
                    {stats.administration.ffbcLicensedCount}
                  </span>
                  <span className="text-xs font-semibold text-ink-3">
                    / {stats.administration.totalMembers} ({stats.administration.ffbcComplianceRate}%)
                  </span>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-xs bg-line">
                  <div
                    className="h-full bg-hydro"
                    style={{ width: `${stats.administration.ffbcComplianceRate}%` }}
                  />
                </div>
              </div>

              <div className="rounded-md border border-line bg-paper p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-ink-3">
                  Profils Strava Connectés
                </p>
                <div className="mt-1 flex items-baseline gap-1.5">
                  <span className="text-2xl font-extrabold text-ink tabular-nums">
                    {stats.administration.stravaLinkedCount}
                  </span>
                  <span className="text-xs font-semibold text-ink-3">
                    / {stats.administration.totalMembers} ({stats.administration.stravaAdoptionRate}%)
                  </span>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-xs bg-line">
                  <div
                    className="h-full bg-ambre"
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
