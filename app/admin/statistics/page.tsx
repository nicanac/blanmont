import React from 'react';
import {
  ChartBarIcon,
  UserGroupIcon,
  TrophyIcon,
  CalendarDaysIcon,
  ArrowTrendingUpIcon,
} from '@heroicons/react/24/outline';
import StatsCharts from './components/StatsCharts';

export const dynamic = 'force-dynamic';

const DATABASE_ID = '2d29555c-6779-80fc-b4c9-c912fc338142';
const NOTION_TOKEN = process.env.NOTION_TOKEN || process.env.NOTION_KEY;
const NOTION_VERSION = '2022-06-28';

type LeaderboardEntry = {
  id: string;
  name: string;
  rides: number;
  group: string;
  dates: string[];
};

async function getLeaderboardData(): Promise<LeaderboardEntry[]> {
  const pages: LeaderboardEntry[] = [];
  let cursor: string | undefined = undefined;

  // Define Notion API response types
  interface NotionPropertyValue {
    type: string;
    title?: Array<{ plain_text: string }>;
    number?: number | null;
    select?: { name: string } | null;
    multi_select?: Array<{ name: string }>;
  }

  interface NotionPage {
    id: string;
    properties: Record<string, NotionPropertyValue>;
  }

  interface NotionResponse {
    results: NotionPage[];
    next_cursor: string | null;
  }

  try {
    do {
      const res: Response = await fetch(`https://api.notion.com/v1/databases/${DATABASE_ID}/query`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${NOTION_TOKEN}`,
          'Notion-Version': NOTION_VERSION,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          start_cursor: cursor,
          sorts: [{ property: 'Rides', direction: 'descending' }],
        }),
        next: { revalidate: 60 },
      });

      if (!res.ok) {
        throw new Error(`Notion API Error: ${res.status}`);
      }

      const response: NotionResponse = await res.json();

      for (const page of response.results) {
        const props = page.properties;
        if (!props) continue;

        const nameTitle = props['Name']?.type === 'title' ? props['Name'].title : [];
        const name = nameTitle && nameTitle.length > 0 ? nameTitle[0].plain_text : 'Unknown';
        const rides = props['Rides']?.type === 'number' ? props['Rides'].number || 0 : 0;
        const groupSelect = props['Group']?.type === 'select' ? props['Group'].select : null;
        const group = groupSelect ? groupSelect.name : '-';
        const datesMulti = props['Dates']?.type === 'multi_select' ? props['Dates'].multi_select : [];
        const dates = datesMulti ? datesMulti.map((d: { name: string }) => d.name) : [];

        pages.push({ id: page.id, name, rides, group, dates });
      }
      cursor = response.next_cursor || undefined;
    } while (cursor);
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return [];
  }

  return pages;
}

function calculateStats(entries: LeaderboardEntry[]): {
  totalMembers: number;
  totalRides: number;
  averageRides: number;
  maxRides: number;
  topPerformer: string;
  groupStats: { group: string; count: number; avgRides: number }[];
  participationRate: number;
  weeklyDistribution: { week: string; count: number }[];
  monthlyData: { month: string; rides: number }[];
} {
  const totalMembers = entries.length;
  const totalRides = entries.reduce((sum, e) => sum + e.rides, 0);
  const averageRides = totalMembers > 0 ? Math.round(totalRides / totalMembers) : 0;
  const maxRides = entries.length > 0 ? entries[0].rides : 0;
  const topPerformer = entries.length > 0 ? entries[0].name : '-';
  const activeMembers = entries.filter((e) => e.rides > 0).length;
  const participationRate = totalMembers > 0 ? Math.round((activeMembers / totalMembers) * 100) : 0;

  // Group stats
  const groupMap = new Map<string, { count: number; rides: number }>();
  for (const e of entries) {
    const current = groupMap.get(e.group) || { count: 0, rides: 0 };
    groupMap.set(e.group, { count: current.count + 1, rides: current.rides + e.rides });
  }
  const groupStats = Array.from(groupMap.entries())
    .map(([group, data]) => ({
      group,
      count: data.count,
      avgRides: Math.round(data.rides / data.count),
    }))
    .sort((a, b) => b.avgRides - a.avgRides);

  // Weekly distribution from dates
  const weekCounts = new Map<string, number>();
  for (const entry of entries) {
    for (const date of entry.dates) {
      const count = weekCounts.get(date) || 0;
      weekCounts.set(date, count + 1);
    }
  }
  const weeklyDistribution = Array.from(weekCounts.entries())
    .map(([week, count]) => ({ week, count }))
    .sort((a, b) => a.week.localeCompare(b.week))
    .slice(-12); // Last 12 weeks

  // Monthly aggregation
  const monthCounts = new Map<string, number>();
  for (const entry of entries) {
    for (const date of entry.dates) {
      // Dates are like "2024-W01" or "01/01/2024" - extract month
      const month = date.substring(0, 7); // YYYY-MM or similar
      const count = monthCounts.get(month) || 0;
      monthCounts.set(month, count + 1);
    }
  }
  const monthlyData = Array.from(monthCounts.entries())
    .map(([month, rides]) => ({ month, rides }))
    .sort((a, b) => a.month.localeCompare(b.month))
    .slice(-6);

  return {
    totalMembers,
    totalRides,
    averageRides,
    maxRides,
    topPerformer,
    groupStats,
    participationRate,
    weeklyDistribution,
    monthlyData,
  };
}

export default async function AdminStatisticsPage(): Promise<React.ReactElement> {
  const entries = await getLeaderboardData();
  const stats = calculateStats(entries);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Statistiques</h1>
        <p className="text-sm text-gray-500">
          Données du Carré Vert - Présence aux sorties du samedi
        </p>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
              <UserGroupIcon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Membres</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalMembers}</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 text-green-600">
              <CalendarDaysIcon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Sorties</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalRides}</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
              <ChartBarIcon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Moyenne/Membre</p>
              <p className="text-2xl font-bold text-gray-900">{stats.averageRides}</p>
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
              <p className="text-2xl font-bold text-gray-900">{stats.participationRate}%</p>
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
            <p className="text-sm font-medium text-amber-800">Champion du Carré Vert</p>
            <p className="text-2xl font-bold text-gray-900">{stats.topPerformer}</p>
            <p className="text-sm text-gray-600">
              {stats.maxRides} sorties • {Math.round((stats.maxRides / 52) * 100)}% de présence
            </p>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <StatsCharts entries={entries} stats={stats} />

      {/* Group Stats */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="font-semibold text-gray-900">Statistiques par Groupe</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {stats.groupStats.map((group) => (
            <div key={group.group} className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center gap-3">
                <span
                  className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${
                    group.group.startsWith('A')
                      ? 'bg-red-100 text-red-800'
                      : group.group.startsWith('B')
                      ? 'bg-blue-100 text-blue-800'
                      : group.group.startsWith('C')
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {group.group}
                </span>
                <span className="text-gray-600">{group.count} membres</span>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900">{group.avgRides} sorties</p>
                <p className="text-sm text-gray-500">moyenne</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Member Rankings Table */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="font-semibold text-gray-900">Classement Complet</h2>
        </div>
        <div className="max-h-96 overflow-y-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 sticky top-0">
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
              {entries.map((entry, index) => (
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
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                        entry.group.startsWith('A')
                          ? 'bg-red-100 text-red-800'
                          : entry.group.startsWith('B')
                          ? 'bg-blue-100 text-blue-800'
                          : entry.group.startsWith('C')
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {entry.group}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-3 text-right text-sm font-semibold text-gray-900">
                    {entry.rides}
                  </td>
                  <td className="whitespace-nowrap px-6 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <div className="h-2 w-16 overflow-hidden rounded-full bg-gray-200">
                        <div
                          className="h-full rounded-full bg-green-500"
                          style={{ width: `${Math.min((entry.rides / 52) * 100, 100)}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-500">
                        {Math.round((entry.rides / 52) * 100)}%
                      </span>
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
