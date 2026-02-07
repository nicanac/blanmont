'use client';

import React, { useState, useMemo } from 'react';
import {
  ChartBarIcon,
  UserGroupIcon,
  TrophyIcon,
  CalendarDaysIcon,
  ArrowTrendingUpIcon,
} from '@heroicons/react/24/outline';

import type { LeaderboardEntry } from '@/app/lib/firebase/leaderboard';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface StatsChartsProps {
  entries: LeaderboardEntry[];
}

const parseDate = (dateStr: string): string => {
  if (!dateStr) return '';
  // Format: DD/MM/YYYY
  const parts = dateStr.split('/');
  if (parts.length === 3) {
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  }
  return dateStr;
};

const getYear = (dateStr: string): string => {
  if (!dateStr) return '';
  const parts = dateStr.split('/');
  return parts.length === 3 ? parts[2] : '';
};

const getISOWeekKey = (d: Date): string => {
  const jan4 = new Date(Date.UTC(d.getUTCFullYear(), 0, 4));
  const startOfWeek = new Date(jan4);
  startOfWeek.setUTCDate(jan4.getUTCDate() - ((jan4.getUTCDay() + 6) % 7));
  const weekNo = Math.ceil(((d.getTime() - startOfWeek.getTime()) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-${weekNo}`;
};

export default function StatsCharts({ entries }: StatsChartsProps): React.ReactElement {
  // Extract all available years from the data
  const availableYears = useMemo(() => {
    const years = new Set<string>();
    entries.forEach(entry => {
      entry.dates?.forEach(date => {
        years.add(getYear(date));
      });
    });
    return Array.from(years).sort().reverse();
  }, [entries]);

  const [selectedYear, setSelectedYear] = useState<string>(
    availableYears.length > 0 ? availableYears[0] : new Date().getFullYear().toString()
  );

  // Recalculate stats based on selected year
  const filteredStats = useMemo(() => {
    // 1. Identify all unique dates and categorize them (Weekend vs Weekday)
    const allDatesInYear = new Set<string>();
    entries.forEach(entry => {
      entry.dates?.forEach(date => {
        if (getYear(date) === selectedYear) {
          allDatesInYear.add(date);
        }
      });
    });

    const weekendWeeks = new Set<string>();
    const weekdayDates = new Set<string>();

    allDatesInYear.forEach(dateStr => {
      const [d, m, y] = dateStr.split('/').map(Number);
      const date = new Date(Date.UTC(y, m - 1, d));
      const dayOfWeek = date.getUTCDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) { // Sunday or Saturday
        weekendWeeks.add(getISOWeekKey(date));
      } else {
        weekdayDates.add(dateStr);
      }
    });

    const totalPossibleCarres = weekendWeeks.size + weekdayDates.size;

    // 2. Process entries with the rule: 1 per weekend max, weekdays count separately
    const processedEntries = entries.map(entry => {
      const datesInYear = entry.dates?.filter(date => getYear(date) === selectedYear) || [];

      const memberWeekendWeeks = new Set<string>();
      const memberWeekdayDates = new Set<string>();

      datesInYear.forEach(dateStr => {
        const [d, m, y] = dateStr.split('/').map(Number);
        const date = new Date(Date.UTC(y, m - 1, d));
        const dayOfWeek = date.getUTCDay();
        if (dayOfWeek === 0 || dayOfWeek === 6) {
          memberWeekendWeeks.add(getISOWeekKey(date));
        } else {
          memberWeekdayDates.add(dateStr);
        }
      });

      const carresCount = memberWeekendWeeks.size + memberWeekdayDates.size;

      return {
        ...entry,
        rides: carresCount, // "rides" here actually means "carres" based on the rule
        actualRides: datesInYear.length, // total number of physical attendances
        activeDates: datesInYear,
      };
    });

    const activeParticipants = processedEntries.filter(e => e.rides > 0);
    const sortedByRides = [...processedEntries].sort((a, b) => b.rides - a.rides);

    const totalMembers = entries.length; // Total registered
    const participatingMembers = activeParticipants.length;
    const totalRides = processedEntries.reduce((sum, e) => sum + e.rides, 0);
    const averageRides = participatingMembers > 0 ? Math.round(totalRides / participatingMembers) : 0; // Avg among active
    const maxRides = processedEntries.length > 0 ? Math.max(...processedEntries.map(e => e.rides)) : 0;

    const topPerformerEntry = sortedByRides[0];
    const topPerformer = topPerformerEntry && topPerformerEntry.rides > 0 ? topPerformerEntry.name : '-';

    const participationRate = totalMembers > 0 ? Math.round((participatingMembers / totalMembers) * 100) : 0;

    // Group stats
    const groupMap = new Map<string, { count: number; rides: number }>();
    for (const e of processedEntries) {
      if (e.rides === 0) continue; // Only count active participants for group stats in this year?
      const groupName = e.group || 'Inconnu';
      const current = groupMap.get(groupName) || { count: 0, rides: 0 };
      groupMap.set(groupName, { count: current.count + 1, rides: current.rides + e.rides });
    }

    const groupStats = Array.from(groupMap.entries())
      .map(([group, data]) => ({
        group,
        count: data.count,
        avgRides: data.count > 0 ? Math.round(data.rides / data.count) : 0,
      }))
      .sort((a, b) => b.avgRides - a.avgRides);

    // Weekly/Event distribution
    const dateCounts = new Map<string, number>();
    for (const entry of processedEntries) {
      for (const date of entry.activeDates) {
        const count = dateCounts.get(date) || 0;
        dateCounts.set(date, count + 1);
      }
    }

    const weeklyDistribution = Array.from(dateCounts.entries())
      .map(([date, count]) => ({
        week: date,
        count,
        isoDate: parseDate(date)
      }))
      .sort((a, b) => a.isoDate.localeCompare(b.isoDate));

    // Rides Distribution Buckets
    const ridesBuckets = [
      { label: '0', min: 0, max: 0, count: 0 },
      { label: '1-5', min: 1, max: 5, count: 0 },
      { label: '6-10', min: 6, max: 10, count: 0 },
      { label: '11-20', min: 11, max: 20, count: 0 },
      { label: '21-30', min: 21, max: 30, count: 0 },
      { label: '31-40', min: 31, max: 40, count: 0 },
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
      ridesBuckets,
      sortedEntries: sortedByRides,
      totalPossibleCarres
    };
  }, [entries, selectedYear]);

  const getGroupColor = (group: string): string => {
    if (group.startsWith('A')) return 'bg-red-500';
    if (group.startsWith('B')) return 'bg-blue-500';
    if (group.startsWith('C')) return 'bg-green-500';
    return 'bg-gray-500';
  };

  const getGroupColorHex = (group: string): string => {
    if (group.startsWith('A')) return '#ef4444'; // red-500
    if (group.startsWith('B')) return '#3b82f6'; // blue-500
    if (group.startsWith('C')) return '#22c55e'; // green-500
    return '#6b7280'; // gray-500
  };

  const getGroupBadgeColor = (group: string): string => {
    if (group.startsWith('A')) return 'bg-red-100 text-red-800';
    if (group.startsWith('B')) return 'bg-blue-100 text-blue-800';
    if (group.startsWith('C')) return 'bg-green-100 text-green-800';
    return 'bg-gray-100 text-gray-800';
  };

  // Chart Configs
  const ridesDistributionData = {
    labels: filteredStats.ridesBuckets.map(b => b.label),
    datasets: [
      {
        label: 'Membres',
        data: filteredStats.ridesBuckets.map(b => b.count),
        backgroundColor: 'rgba(239, 68, 68, 0.7)', // red-500
        borderRadius: 4,
      },
    ],
  };

  const groupCompositionData = {
    labels: filteredStats.groupStats.map(g => g.group),
    datasets: [
      {
        data: filteredStats.groupStats.map(g => g.count),
        backgroundColor: filteredStats.groupStats.map(g => getGroupColorHex(g.group)),
        borderWidth: 0,
      },
    ],
  };

  const weeklyActivityData = {
    labels: filteredStats.weeklyDistribution.map(w => w.week),
    datasets: [
      {
        label: 'Participants',
        data: filteredStats.weeklyDistribution.map(w => w.count),
        backgroundColor: 'rgba(34, 197, 94, 0.7)', // green-500
        borderRadius: 4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          display: true,
          borderDash: [2, 4],
          color: 'rgba(0,0,0,0.05)',
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
    },
  };


  return (
    <div className="space-y-6">
      {/* Year Selector */}
      <div className="flex items-center justify-end">
        <label htmlFor="year-select" className="mr-2 text-sm font-medium text-gray-700">Année:</label>
        <select
          id="year-select"
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
          className="rounded-md border-gray-300 py-1 pl-3 pr-8 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
        >
          {availableYears.map(year => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
              <UserGroupIcon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Membres Actifs</p>
              <p className="text-2xl font-bold text-gray-900">{filteredStats.participatingMembers} <span className="text-xs text-gray-400">/ {filteredStats.totalMembers}</span></p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 text-green-600">
              <CalendarDaysIcon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Sorties ({selectedYear})</p>
              <p className="text-2xl font-bold text-gray-900">{filteredStats.totalRides}</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
              <ChartBarIcon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Moyenne/Actif</p>
              <p className="text-2xl font-bold text-gray-900">{filteredStats.averageRides}</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100 text-purple-600">
              <ArrowTrendingUpIcon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Taux Participation</p>
              <p className="text-2xl font-bold text-gray-900">{filteredStats.participationRate}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Top Performer */}
      <div className="rounded-xl border border-gray-200 bg-linear-to-r from-amber-50 to-yellow-50 p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-amber-600">
            <TrophyIcon className="h-8 w-8" />
          </div>
          <div>
            <p className="text-sm font-medium text-amber-800">Champion du Carré Vert {selectedYear}</p>
            <p className="text-2xl font-bold text-gray-900">{filteredStats.topPerformer}</p>
            <p className="text-sm text-gray-600">
              {filteredStats.maxRides} carres
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Rides Distribution Chart */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 font-semibold text-gray-900">Distribution des Sorties</h3>
          <div className="h-64 w-full">
            <Bar data={ridesDistributionData} options={chartOptions} />
          </div>
          <p className="mt-4 text-center text-xs text-gray-500">
            Nombre de membres par tranche de sorties
          </p>
        </div>

        {/* Group Composition */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 font-semibold text-gray-900">Répartition par Groupe</h3>
          <div className="flex h-64 items-center justify-center">
            <div className="h-full w-full max-w-xs">
              <Doughnut data={groupCompositionData} options={doughnutOptions} />
            </div>
          </div>
        </div>

        {/* Weekly Activity */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm lg:col-span-2">
          <h3 className="mb-4 font-semibold text-gray-900">Activité Hebdomadaire ({selectedYear})</h3>
          {filteredStats.weeklyDistribution.length > 0 ? (
            <div className="h-80 w-full">
              <Bar data={weeklyActivityData} options={chartOptions} />
            </div>
          ) : (
            <div className="flex h-40 items-center justify-center text-gray-500">
              Aucune donnée pour cette année
            </div>
          )}

        </div>
      </div>

      {/* Group Stats Table */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="font-semibold text-gray-900">Statistiques par Groupe</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {filteredStats.groupStats.map((group) => (
            <div key={group.group} className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center gap-3">
                <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${getGroupBadgeColor(group.group)}`}>
                  {group.group}
                </span>
                <span className="text-gray-600">{group.count} membres actifs</span>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900">{group.avgRides} sorties</p>
                <p className="text-sm text-gray-500">moyenne</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Rankings Table */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="font-semibold text-gray-900">Classement Complet {selectedYear}</h2>
        </div>
        <div className="max-h-96 overflow-y-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Rang
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Membre
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Groupe
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                  Sorties
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                  Présence
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {filteredStats.sortedEntries.map((entry, index) => (
                <tr key={entry.id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-6 py-3 text-sm">
                    {index < 3 ? (
                      <span className="text-lg">
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                      </span>
                    ) : (
                      <span className="text-gray-500">{index + 1}</span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-6 py-3 text-sm font-medium text-gray-900">
                    {entry.name}
                  </td>
                  <td className="whitespace-nowrap px-6 py-3">
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${getGroupBadgeColor(entry.group || '')}`}
                    >
                      {entry.group || '-'}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-3 text-right text-sm font-semibold text-gray-900">
                    {entry.rides}
                  </td>
                  <td className="whitespace-nowrap px-6 py-3 text-right">
                    <div className="flex items-center justify-end gap-2" title={`${entry.rides} / ${filteredStats.totalPossibleCarres} carres possibles`}>
                      <div className="w-8 text-xs text-gray-500 text-right">
                        {filteredStats.totalPossibleCarres > 0
                          ? Math.round((entry.rides / filteredStats.totalPossibleCarres) * 100)
                          : 0}%
                      </div>
                      <div className="h-2 w-16 overflow-hidden rounded-full bg-gray-200">
                        <div
                          className="h-full rounded-full bg-green-500"
                          style={{
                            width: `${filteredStats.totalPossibleCarres > 0
                              ? Math.min((entry.rides / filteredStats.totalPossibleCarres) * 100, 100)
                              : 0}%`
                          }}
                        />
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
