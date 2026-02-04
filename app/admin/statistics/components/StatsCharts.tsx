'use client';

import React from 'react';

type LeaderboardEntry = {
  id: string;
  name: string;
  rides: number;
  group: string;
  dates: string[];
};

interface StatsChartsProps {
  entries: LeaderboardEntry[];
  stats: {
    totalMembers: number;
    totalRides: number;
    averageRides: number;
    groupStats: { group: string; count: number; avgRides: number }[];
    weeklyDistribution: { week: string; count: number }[];
    monthlyData: { month: string; rides: number }[];
  };
}

export default function StatsCharts({ entries, stats }: StatsChartsProps): React.ReactElement {
  // Distribution by rides count
  const ridesBuckets = [
    { label: '0', min: 0, max: 0, count: 0 },
    { label: '1-5', min: 1, max: 5, count: 0 },
    { label: '6-10', min: 6, max: 10, count: 0 },
    { label: '11-20', min: 11, max: 20, count: 0 },
    { label: '21-30', min: 21, max: 30, count: 0 },
    { label: '31-40', min: 31, max: 40, count: 0 },
    { label: '40+', min: 41, max: Infinity, count: 0 },
  ];

  for (const entry of entries) {
    for (const bucket of ridesBuckets) {
      if (entry.rides >= bucket.min && entry.rides <= bucket.max) {
        bucket.count++;
        break;
      }
    }
  }

  const maxBucketCount = Math.max(...ridesBuckets.map((b) => b.count), 1);

  // Group distribution
  const groupColors: Record<string, string> = {
    A: 'bg-red-500',
    B: 'bg-blue-500',
    C: 'bg-green-500',
  };

  const getGroupColor = (group: string): string => {
    if (group.startsWith('A')) return groupColors.A;
    if (group.startsWith('B')) return groupColors.B;
    if (group.startsWith('C')) return groupColors.C;
    return 'bg-gray-500';
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Rides Distribution Chart */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 font-semibold text-gray-900">Distribution des Sorties</h3>
        <div className="space-y-3">
          {ridesBuckets.map((bucket) => (
            <div key={bucket.label} className="flex items-center gap-3">
              <span className="w-12 text-sm text-gray-600">{bucket.label}</span>
              <div className="flex-1">
                <div className="h-6 overflow-hidden rounded-lg bg-gray-100">
                  <div
                    className="h-full rounded-lg bg-red-500 transition-all"
                    style={{ width: `${(bucket.count / maxBucketCount) * 100}%` }}
                  />
                </div>
              </div>
              <span className="w-8 text-right text-sm font-medium text-gray-900">
                {bucket.count}
              </span>
            </div>
          ))}
        </div>
        <p className="mt-4 text-center text-xs text-gray-500">
          Nombre de membres par tranche de sorties
        </p>
      </div>

      {/* Group Composition */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 font-semibold text-gray-900">Répartition par Groupe</h3>
        <div className="flex h-48 items-end justify-center gap-4">
          {stats.groupStats.map((group) => {
            const maxCount = Math.max(...stats.groupStats.map((g) => g.count), 1);
            const height = (group.count / maxCount) * 100;
            return (
              <div key={group.group} className="flex flex-col items-center">
                <div
                  className={`w-16 ${getGroupColor(group.group)} rounded-t-lg transition-all`}
                  style={{ height: `${height}%`, minHeight: '20px' }}
                />
                <span className="mt-2 text-sm font-medium text-gray-900">{group.group}</span>
                <span className="text-xs text-gray-500">{group.count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Weekly Activity */}
      {stats.weeklyDistribution.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm lg:col-span-2">
          <h3 className="mb-4 font-semibold text-gray-900">Activité Hebdomadaire (12 dernières semaines)</h3>
          <div className="flex h-40 items-end justify-between gap-1">
            {stats.weeklyDistribution.map((week) => {
              const maxCount = Math.max(...stats.weeklyDistribution.map((w) => w.count), 1);
              const height = (week.count / maxCount) * 100;
              return (
                <div key={week.week} className="flex flex-1 flex-col items-center">
                  <div
                    className="w-full max-w-8 rounded-t bg-green-500 transition-all hover:bg-green-600"
                    style={{ height: `${height}%`, minHeight: '4px' }}
                    title={`${week.week}: ${week.count} participations`}
                  />
                </div>
              );
            })}
          </div>
          <div className="mt-2 flex justify-between text-xs text-gray-400">
            <span>{stats.weeklyDistribution[0]?.week}</span>
            <span>{stats.weeklyDistribution[stats.weeklyDistribution.length - 1]?.week}</span>
          </div>
        </div>
      )}

      {/* Top 10 Performers */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm lg:col-span-2">
        <h3 className="mb-4 font-semibold text-gray-900">Top 10 - Meilleurs Participants</h3>
        <div className="space-y-2">
          {entries.slice(0, 10).map((entry, index) => {
            const percentage = (entry.rides / (entries[0]?.rides || 1)) * 100;
            return (
              <div key={entry.id} className="flex items-center gap-3">
                <span className="w-6 text-center text-sm font-medium text-gray-500">
                  {index + 1}
                </span>
                <span className="w-32 truncate text-sm font-medium text-gray-900">
                  {entry.name}
                </span>
                <div className="flex-1">
                  <div className="h-5 overflow-hidden rounded-lg bg-gray-100">
                    <div
                      className={`h-full rounded-lg ${
                        index === 0
                          ? 'bg-linear-to-r from-amber-400 to-yellow-500'
                          : index === 1
                          ? 'bg-gray-400'
                          : index === 2
                          ? 'bg-amber-600'
                          : 'bg-green-500'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
                <span className="w-12 text-right text-sm font-semibold text-gray-900">
                  {entry.rides}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
