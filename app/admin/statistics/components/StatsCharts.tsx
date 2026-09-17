'use client';

import React, { useState, useMemo } from 'react';
import {
  ChartBarIcon,
  UserGroupIcon,
  CalendarDaysIcon,
  ArrowTrendingUpIcon,
  MagnifyingGlassIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import { BicycleIcon, TrophySquareIcon } from '@/app/components/ui/CyclingIcons';

import type { LeaderboardEntry } from '@/app/lib/firebase/leaderboard';
import type { CalendarEvent } from '@/app/types';
import type { EventAttendance } from '@/app/lib/firebase/attendance';
import {
  parseDateInfo,
  calculateLeaderboardFromAttendance,
  getPossibleCarresCount,
} from '@/app/lib/carreVert';

import dynamic from 'next/dynamic';
import AnimatedCounter from './AnimatedCounter';

const Peloton3DShowcase = dynamic(() => import('./Peloton3DShowcase'), {
  ssr: false,
  loading: () => (
    <div className="rounded-lg border border-[#e4e0d8] bg-white p-8 flex items-center justify-center min-h-[320px] text-xs text-[#5c6370] animate-pulse">
      <div className="flex flex-col items-center gap-2">
        <div className="h-8 w-8 rounded-full border-2 border-[#e03e3e] border-t-transparent animate-spin" />
        <span>Chargement du module 3D...</span>
      </div>
    </div>
  ),
});

const StatsChartsVisualizations = dynamic(() => import('./StatsChartsVisualizations'), {
  ssr: false,
  loading: () => (
    <div className="col-span-full rounded-lg border border-[#e4e0d8] bg-white p-8 flex items-center justify-center min-h-[300px] text-xs text-[#5c6370] animate-pulse">
      <div className="flex flex-col items-center gap-2">
        <div className="h-6 w-6 rounded-full border-2 border-[#e03e3e] border-t-transparent animate-spin" />
        <span>Chargement des graphiques d'analyse...</span>
      </div>
    </div>
  ),
});

interface StatsChartsProps {
  entries: LeaderboardEntry[];
  events?: CalendarEvent[];
  allAttendance?: EventAttendance[];
}

const MONTH_NAMES = [
  'Janvier',
  'Février',
  'Mars',
  'Avril',
  'Mai',
  'Juin',
  'Juillet',
  'Août',
  'Septembre',
  'Octobre',
  'Novembre',
  'Décembre',
];

export default function StatsCharts({
  entries,
  events = [],
  allAttendance = [],
}: StatsChartsProps): React.ReactElement {
  // Extract all available years from the data
  const availableYears = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const years = new Set<string>();
    years.add(currentYear.toString());

    entries.forEach((entry) => {
      entry.dates?.forEach((date) => {
        const info = parseDateInfo(date);
        if (info) years.add(info.year.toString());
      });
    });

    events.forEach((evt) => {
      const info = parseDateInfo(evt.isoDate);
      if (info) years.add(info.year.toString());
    });

    allAttendance.forEach((att) => {
      if (att.isoDate) {
        const info = parseDateInfo(att.isoDate);
        if (info) years.add(info.year.toString());
      }
    });

    return Array.from(years).sort().reverse();
  }, [entries, events, allAttendance]);

  const [selectedYear, setSelectedYear] = useState<string>(
    availableYears.length > 0 ? availableYears[0] : new Date().getFullYear().toString()
  );

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroupFilter, setSelectedGroupFilter] = useState<string>('all');

  // Recalculate stats based on selected year using Carré Vert rules
  const filteredStats = useMemo(() => {
    const yearNum = parseInt(selectedYear, 10);

    // Calculate member entries using Carré Vert rules
    const processedEntries = calculateLeaderboardFromAttendance(
      entries,
      events,
      allAttendance,
      yearNum
    );

    // Calculate total possible carrés for the year
    const totalPossibleCarres = getPossibleCarresCount(events, yearNum, {
      includeOnlyPastOrAttended: true,
      allAttendance,
    });

    const activeParticipants = processedEntries.filter((e) => e.rides > 0);
    const sortedByRides = [...processedEntries].sort((a, b) => b.rides - a.rides);

    const totalMembers = entries.length;
    const participatingMembers = activeParticipants.length;
    const totalRides = processedEntries.reduce((sum, e) => sum + e.rides, 0);
    const averageRides =
      participatingMembers > 0 ? Math.round(totalRides / participatingMembers) : 0;
    const maxRides =
      processedEntries.length > 0 ? Math.max(...processedEntries.map((e) => e.rides)) : 0;

    const topPerformerEntry = sortedByRides[0];
    const topPerformer =
      topPerformerEntry && topPerformerEntry.rides > 0 ? topPerformerEntry.name : '-';

    const participationRate =
      totalMembers > 0 ? Math.round((participatingMembers / totalMembers) * 100) : 0;

    // Group stats calculation
    const groupMap = new Map<string, { count: number; rides: number }>();
    for (const e of processedEntries) {
      if (e.rides === 0) continue;
      const groupName = e.group || 'Sans groupe';
      const current = groupMap.get(groupName) || { count: 0, rides: 0 };
      groupMap.set(groupName, { count: current.count + 1, rides: current.rides + e.rides });
    }

    const groupStats = Array.from(groupMap.entries())
      .map(([group, data]) => ({
        group,
        count: data.count,
        avgRides: data.count > 0 ? Math.round(data.rides / data.count) : 0,
        totalRides: data.rides,
      }))
      .sort((a, b) => b.count - a.count);

    // Weekly/Event distribution: count attendance per date in this year
    const dateCounts = new Map<string, { count: number; isoDate: string; month: number }>();

    if (allAttendance.length > 0) {
      allAttendance.forEach((att) => {
        if (!att.isoDate || !att.members) return;
        const info = parseDateInfo(att.isoDate);
        if (!info || info.year !== yearNum) return;

        const count = Object.keys(att.members).length;
        if (count > 0) {
          dateCounts.set(info.displayDate, { count, isoDate: info.isoDate, month: info.month });
        }
      });
    }

    if (dateCounts.size === 0) {
      for (const entry of processedEntries) {
        for (const date of entry.dates) {
          const info = parseDateInfo(date);
          if (!info || info.year !== yearNum) continue;

          const existing = dateCounts.get(info.displayDate) || {
            count: 0,
            isoDate: info.isoDate,
            month: info.month,
          };
          dateCounts.set(info.displayDate, {
            count: existing.count + 1,
            isoDate: info.isoDate,
            month: info.month,
          });
        }
      }
    }

    const weeklyDistribution = Array.from(dateCounts.entries())
      .map(([date, data]) => ({
        week: date,
        count: data.count,
        isoDate: data.isoDate,
        month: data.month,
      }))
      .sort((a, b) => a.isoDate.localeCompare(b.isoDate));

    // Monthly aggregation for seasonality analysis
    const monthlyData = Array.from({ length: 12 }, (_, i) => ({
      monthIndex: i + 1,
      monthName: MONTH_NAMES[i],
      totalAttendance: 0,
      eventCount: 0,
    }));

    weeklyDistribution.forEach((item) => {
      if (item.month >= 1 && item.month <= 12) {
        monthlyData[item.month - 1].totalAttendance += item.count;
        monthlyData[item.month - 1].eventCount += 1;
      }
    });

    // Rides Distribution Buckets
    const ridesBuckets = [
      { label: '0', min: 0, max: 0, count: 0 },
      { label: '1–5', min: 1, max: 5, count: 0 },
      { label: '6–10', min: 6, max: 10, count: 0 },
      { label: '11–20', min: 11, max: 20, count: 0 },
      { label: '21–30', min: 21, max: 30, count: 0 },
      { label: '31–40', min: 31, max: 40, count: 0 },
      { label: '40+', min: 41, max: Infinity, count: 0 },
    ];

    for (const entry of processedEntries) {
      for (const bucket of ridesBuckets) {
        if (entry.rides >= bucket.min && entry.rides <= bucket.max) {
          bucket.count++;
          break;
        }
      }
    }

    return {
      totalMembers,
      participatingMembers,
      totalRides,
      averageRides,
      maxRides,
      topPerformer,
      groupStats,
      participationRate,
      weeklyDistribution,
      monthlyData,
      ridesBuckets,
      sortedEntries: sortedByRides,
      totalPossibleCarres,
    };
  }, [entries, events, allAttendance, selectedYear]);

  const getGroupBadgeStyle = (group: string): string => {
    if (group.startsWith('A'))
      return 'bg-[#e03e3e]/10 text-[#e03e3e] border border-[#e03e3e]/30';
    if (group.startsWith('B'))
      return 'bg-[#3b82f6]/10 text-[#3b82f6] border border-[#3b82f6]/30';
    if (group.startsWith('C'))
      return 'bg-[#10b981]/10 text-[#10b981] border border-[#10b981]/30';
    if (group.toLowerCase().includes('vtt'))
      return 'bg-[#f59e0b]/10 text-[#f59e0b] border border-[#f59e0b]/30';
    return 'bg-[#f2efe9] text-[#5c6370] border border-[#e4e0d8]';
  };

  // Filtered leaderboard entries for the search & group filter
  const displayedEntries = useMemo(() => {
    let result = filteredStats.sortedEntries;

    if (selectedGroupFilter !== 'all') {
      result = result.filter((entry) => {
        const group = entry.group || 'Sans groupe';
        return group.toLowerCase() === selectedGroupFilter.toLowerCase();
      });
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((entry) => entry.name.toLowerCase().includes(q));
    }

    return result;
  }, [filteredStats.sortedEntries, selectedGroupFilter, searchQuery]);

  return (
    <div className="space-y-8">
      {/* Top Filter & Season Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-4 rounded-lg border border-[#e4e0d8] shadow-xs">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[#101216] text-white">
            <BicycleIcon className="h-4 w-4 text-[#e03e3e]" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[#5c6370]">
              Période Analysée
            </p>
            <p className="text-sm font-extrabold text-[#101216]">
              Saison Officielle {selectedYear}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="year-select" className="text-xs font-semibold uppercase tracking-wider text-[#5c6370]">
            Changer d'Année:
          </label>
          <select
            id="year-select"
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="rounded-md border border-[#e4e0d8] bg-[#faf8f5] py-1.5 pl-3 pr-8 text-xs font-bold text-[#101216] focus:border-[#e03e3e] focus:outline-none focus:ring-1 focus:ring-[#e03e3e] cursor-pointer"
          >
            {availableYears.map((year) => (
              <option key={year} value={year}>
                Saison {year}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* KPI Stats Strip Bento (#stats-cards-section) */}
      <div id="stats-cards-section" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Active Members */}
        <div className="rounded-lg border border-[#e4e0d8] bg-white p-5 shadow-xs transition-all hover:border-[#101216]/20">
          <div className="flex items-center justify-between">
            <div className="flex h-11 w-11 items-center justify-center rounded-md bg-[#3b82f6]/10 text-[#3b82f6] border border-[#3b82f6]/20">
              <UserGroupIcon className="h-5 w-5" />
            </div>
            <span className="rounded-full bg-[#f2efe9] px-2 py-0.5 text-xs font-bold uppercase tracking-wider text-[#5c6370]">
              Inscrits {filteredStats.totalMembers}
            </span>
          </div>
          <p className="mt-4 text-xs font-bold uppercase tracking-wider text-[#5c6370]">
            Membres Actifs
          </p>
          <div className="mt-1 flex items-baseline gap-1.5">
            <AnimatedCounter
              value={filteredStats.participatingMembers}
              className="text-3xl font-extrabold text-[#101216]"
            />
            <span className="text-xs font-semibold text-[#5c6370]">
              / {filteredStats.totalMembers} cyclistes
            </span>
          </div>
        </div>

        {/* Total Rides */}
        <div className="rounded-lg border border-[#e4e0d8] bg-white p-5 shadow-xs transition-all hover:border-[#101216]/20">
          <div className="flex items-center justify-between">
            <div className="flex h-11 w-11 items-center justify-center rounded-md bg-[#10b981]/10 text-[#10b981] border border-[#10b981]/20">
              <CalendarDaysIcon className="h-5 w-5" />
            </div>
            <span className="rounded-full bg-[#10b981]/15 px-2 py-0.5 text-xs font-bold uppercase tracking-wider text-[#10b981]">
              Sorties du Club
            </span>
          </div>
          <p className="mt-4 text-xs font-bold uppercase tracking-wider text-[#5c6370]">
            Total Présences ({selectedYear})
          </p>
          <div className="mt-1">
            <AnimatedCounter
              value={filteredStats.totalRides}
              className="text-3xl font-extrabold text-[#101216]"
            />
          </div>
        </div>

        {/* Average Rides per active member */}
        <div className="rounded-lg border border-[#e4e0d8] bg-white p-5 shadow-xs transition-all hover:border-[#101216]/20">
          <div className="flex items-center justify-between">
            <div className="flex h-11 w-11 items-center justify-center rounded-md bg-[#f59e0b]/10 text-[#f59e0b] border border-[#f59e0b]/20">
              <ChartBarIcon className="h-5 w-5" />
            </div>
            <span className="rounded-full bg-[#f59e0b]/15 px-2 py-0.5 text-xs font-bold uppercase tracking-wider text-[#f59e0b]">
              Assiduité
            </span>
          </div>
          <p className="mt-4 text-xs font-bold uppercase tracking-wider text-[#5c6370]">
            Moyenne / Actif
          </p>
          <div className="mt-1 flex items-baseline gap-1.5">
            <AnimatedCounter
              value={filteredStats.averageRides}
              className="text-3xl font-extrabold text-[#101216]"
            />
            <span className="text-xs font-semibold text-[#5c6370]">sorties / an</span>
          </div>
        </div>

        {/* Participation Rate */}
        <div className="rounded-lg border border-[#e4e0d8] bg-white p-5 shadow-xs transition-all hover:border-[#101216]/20">
          <div className="flex items-center justify-between">
            <div className="flex h-11 w-11 items-center justify-center rounded-md bg-[#e03e3e]/10 text-[#e03e3e] border border-[#e03e3e]/20">
              <ArrowTrendingUpIcon className="h-5 w-5" />
            </div>
            <span className="rounded-full bg-[#e03e3e]/15 px-2 py-0.5 text-xs font-bold uppercase tracking-wider text-[#e03e3e]">
              Régularité
            </span>
          </div>
          <p className="mt-4 text-xs font-bold uppercase tracking-wider text-[#5c6370]">
            Taux de Participation
          </p>
          <div className="mt-1">
            <AnimatedCounter
              value={filteredStats.participationRate}
              suffix="%"
              className="text-3xl font-extrabold text-[#101216]"
            />
          </div>
        </div>
      </div>

      {/* Three.js 3D Showcase Hero */}
      <Peloton3DShowcase
        championName={filteredStats.topPerformer}
        maxRides={filteredStats.maxRides}
        totalPossibleCarres={filteredStats.totalPossibleCarres}
        selectedYear={selectedYear}
        weeklyDistribution={filteredStats.weeklyDistribution}
      />

      {/* Visualizations Grid Section (#stats-charts-section) */}
      <div id="stats-charts-section" className="grid gap-6 lg:grid-cols-2">
        {/* Dynamic Client-Side Chart.js Visualizations */}
        <StatsChartsVisualizations
          selectedYear={selectedYear}
          filteredStats={filteredStats}
        />

        {/* Graph 4: Seasonality Intensity Matrix */}
        <div className="rounded-lg border border-[#e4e0d8] bg-white p-5 sm:p-6 shadow-xs lg:col-span-2">
          <div className="border-b border-[#e4e0d8] pb-3 mb-4 flex items-center justify-between">
            <div>
              <h3 className="font-extrabold uppercase tracking-tight text-[#101216]">
                Intensité Mensuelle du Peloton
              </h3>
              <p className="text-xs text-[#5c6370]">
                Volume total de présences accumulées mois par mois
              </p>
            </div>
            <span className="text-xs font-bold text-[#5c6370] uppercase tracking-wider">
              12 Mois
            </span>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-6 lg:grid-cols-12 gap-2 text-center">
            {filteredStats.monthlyData.map((m) => {
              const maxMonthly = Math.max(...filteredStats.monthlyData.map((x) => x.totalAttendance), 1);
              const intensityRatio = m.totalAttendance / maxMonthly;

              return (
                <div
                  key={m.monthName}
                  className="flex flex-col items-center justify-between rounded-md border border-[#e4e0d8] bg-[#faf8f5] p-2.5 transition-colors hover:border-[#101216]/30"
                >
                  <span className="text-xs font-bold uppercase tracking-wider text-[#5c6370]">
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
                      title={`${m.totalAttendance} présences`}
                    />
                  </div>
                  <span className="text-xs font-bold text-[#101216] tabular-nums">
                    {m.totalAttendance}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Official Carré Vert Rankings Table */}
      <div className="rounded-lg border border-[#e4e0d8] bg-white shadow-xs overflow-hidden">
        {/* Table Header & Search Filter Bar */}
        <div className="border-b border-[#e4e0d8] p-4 sm:p-5 bg-white">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold uppercase tracking-tight text-[#101216]">
                  Classement Officiel du Carré Vert {selectedYear}
                </h2>
                <span className="rounded-full bg-[#101216] px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-white">
                  {displayedEntries.length} Inscrits
                </span>
              </div>
              <p className="text-xs text-[#5c6370]">
                Régularité calculée selon les règles officielles (1 point max par week-end + sorties semaine)
              </p>
            </div>

            {/* Search Input & Group Filters */}
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="relative min-w-[200px]">
                <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#5c6370]" />
                <input
                  id="stats-cyclist-search"
                  type="text"
                  aria-label="Rechercher un cycliste"
                  placeholder="Rechercher un cycliste..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-md border border-[#e4e0d8] bg-[#faf8f5] py-1.5 pl-9 pr-3 text-xs font-semibold text-[#101216] placeholder:text-[#5c6370] focus:border-[#e03e3e] focus:outline-none focus:ring-1 focus:ring-[#e03e3e]"
                />
              </div>

              {/* Group Filter Selector */}
              <div className="flex items-center rounded-md border border-[#e4e0d8] bg-[#faf8f5] p-0.5 text-xs">
                {['all', 'A', 'B', 'C'].map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setSelectedGroupFilter(g)}
                    className={`rounded-sm px-2.5 py-1 text-xs font-bold uppercase tracking-wider transition-all ${
                      selectedGroupFilter === g
                        ? 'bg-white text-[#101216] shadow-xs'
                        : 'text-[#5c6370] hover:text-[#101216]'
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
          <table className="min-w-full divide-y divide-[#e4e0d8]">
            <thead className="bg-[#faf8f5] sticky top-0 z-10">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-[#5c6370]">
                  Rang
                </th>
                <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-[#5c6370]">
                  Membre
                </th>
                <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-[#5c6370]">
                  Groupe
                </th>
                <th className="px-5 py-3 text-right text-xs font-bold uppercase tracking-wider text-[#5c6370]">
                  Carrés Validés
                </th>
                <th className="px-5 py-3 text-right text-xs font-bold uppercase tracking-wider text-[#5c6370]">
                  Taux d'Assiduité
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e4e0d8] bg-white text-xs">
              {displayedEntries.length > 0 ? (
                displayedEntries.map((entry, index) => {
                  const percent =
                    filteredStats.totalPossibleCarres > 0
                      ? Math.round((entry.rides / filteredStats.totalPossibleCarres) * 100)
                      : 0;

                  return (
                    <tr
                      key={entry.id}
                      className="hover:bg-[#faf8f5] transition-colors"
                    >
                      {/* Rank / Podium Badge */}
                      <td className="whitespace-nowrap px-5 py-3 font-extrabold text-[#101216]">
                        {index === 0 ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-[#f59e0b]/20 px-2 py-0.5 text-xs font-bold text-[#b45309] border border-[#f59e0b]/40">
                            1er 🥇
                          </span>
                        ) : index === 1 ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-slate-200 px-2 py-0.5 text-xs font-bold text-slate-700 border border-slate-300">
                            2e 🥈
                          </span>
                        ) : index === 2 ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-800 border border-amber-300">
                            3e 🥉
                          </span>
                        ) : (
                          <span className="text-[#5c6370] tabular-nums pl-1.5 font-bold">
                            {index + 1}
                          </span>
                        )}
                      </td>

                      {/* Member Name */}
                      <td className="whitespace-nowrap px-5 py-3 font-bold text-[#101216]">
                        {entry.name}
                        {index === 0 && entry.rides > 0 && (
                          <span className="ml-2 inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-[#f59e0b]">
                            <SparklesIcon className="h-3.5 w-3.5" />
                            Champion
                          </span>
                        )}
                      </td>

                      {/* Group */}
                      <td className="whitespace-nowrap px-5 py-3">
                        <span
                          className={`inline-flex rounded-xs px-2 py-0.5 text-xs font-bold uppercase tracking-wider ${getGroupBadgeStyle(
                            entry.group || ''
                          )}`}
                        >
                          {entry.group || 'Sans groupe'}
                        </span>
                      </td>

                      {/* Rides Count */}
                      <td className="whitespace-nowrap px-5 py-3 text-right font-extrabold text-[#101216] tabular-nums">
                        {entry.rides}
                      </td>

                      {/* Attendance Percentage & Progress Bar */}
                      <td className="whitespace-nowrap px-5 py-3 text-right">
                        <div
                          className="flex items-center justify-end gap-2.5"
                          title={`${entry.rides} sur ${filteredStats.totalPossibleCarres} carrés possibles`}
                        >
                          <span className="w-9 text-right font-bold text-[#101216] tabular-nums">
                            {percent}%
                          </span>
                          <div className="h-2 w-20 overflow-hidden rounded-xs bg-[#f2efe9] border border-[#e4e0d8]">
                            <div
                              className="h-full rounded-xs transition-all duration-300"
                              style={{
                                width: `${Math.min(percent, 100)}%`,
                                backgroundColor:
                                  percent >= 75
                                    ? '#10b981'
                                    : percent >= 40
                                    ? '#3b82f6'
                                    : '#e03e3e',
                              }}
                            />
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="px-5 py-8 text-center text-xs font-semibold text-[#5c6370]"
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
  );
}
