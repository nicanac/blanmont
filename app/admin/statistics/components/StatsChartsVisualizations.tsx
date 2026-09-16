'use client';

import React, { useState, useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler,
  type ScriptableContext,
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
);

interface WeeklyStat {
  week: string;
  count: number;
  isoDate: string;
}

interface MonthlyStat {
  monthIndex: number;
  monthName: string;
  totalAttendance: number;
}

interface GroupStat {
  group: string;
  count: number;
  avgRides: number;
}

interface BucketStat {
  label: string;
  count: number;
}

export interface StatsChartsVisualizationsProps {
  selectedYear: string;
  filteredStats: {
    weeklyDistribution: WeeklyStat[];
    monthlyData: MonthlyStat[];
    ridesBuckets: BucketStat[];
    groupStats: GroupStat[];
    participatingMembers: number;
  };
}

export default function StatsChartsVisualizations({
  selectedYear,
  filteredStats,
}: StatsChartsVisualizationsProps): React.ReactElement {
  const [timelineViewMode, setTimelineViewMode] = useState<'sortie' | 'mois' | 'cumul'>('sortie');

  // Group Badge and Color Helpers matching Editorial Peloton palette
  const getGroupColorHex = (group: string): string => {
    if (group.startsWith('A')) return '#e03e3e'; // Brand crimson
    if (group.startsWith('B')) return '#3b82f6'; // Sky blue
    if (group.startsWith('C')) return '#10b981'; // Peloton emerald
    if (group.toLowerCase().includes('vtt')) return '#f59e0b'; // Amber
    return '#5c6370'; // Muted ink
  };

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

  // 1. Seasonal Attendance (Spline Area Curve with Gradient)
  const timelineChartData = useMemo(() => {
    if (timelineViewMode === 'mois') {
      return {
        labels: filteredStats.monthlyData.map((m) => m.monthName.slice(0, 4)),
        datasets: [
          {
            label: 'Présences cumulées',
            data: filteredStats.monthlyData.map((m) => m.totalAttendance),
            borderColor: '#e03e3e',
            backgroundColor: (context: ScriptableContext<'line'>) => {
              const ctx = context.chart.ctx;
              const gradient = ctx.createLinearGradient(0, 0, 0, 280);
              gradient.addColorStop(0, 'rgba(224, 62, 62, 0.35)');
              gradient.addColorStop(1, 'rgba(224, 62, 62, 0.0)');
              return gradient;
            },
            fill: true,
            tension: 0.35,
            pointRadius: 4,
            pointHoverRadius: 6,
            pointBackgroundColor: '#e03e3e',
            pointBorderColor: '#ffffff',
            pointBorderWidth: 2,
          },
        ],
      };
    }

    if (timelineViewMode === 'cumul') {
      let runSum = 0;
      const cumulativeCounts = filteredStats.weeklyDistribution.map((w) => {
        runSum += w.count;
        return runSum;
      });
      return {
        labels: filteredStats.weeklyDistribution.map((w) => w.week),
        datasets: [
          {
            label: 'Cumul des présences',
            data: cumulativeCounts,
            borderColor: '#10b981',
            backgroundColor: (context: ScriptableContext<'line'>) => {
              const ctx = context.chart.ctx;
              const gradient = ctx.createLinearGradient(0, 0, 0, 280);
              gradient.addColorStop(0, 'rgba(16, 185, 129, 0.35)');
              gradient.addColorStop(1, 'rgba(16, 185, 129, 0.0)');
              return gradient;
            },
            fill: true,
            tension: 0.3,
            pointRadius: 2,
            pointHoverRadius: 5,
            pointBackgroundColor: '#10b981',
            pointBorderColor: '#ffffff',
            pointBorderWidth: 2,
          },
        ],
      };
    }

    // Default: Par sortie
    return {
      labels: filteredStats.weeklyDistribution.map((w) => w.week),
      datasets: [
        {
          label: 'Participants',
          data: filteredStats.weeklyDistribution.map((w) => w.count),
          borderColor: '#e03e3e',
          backgroundColor: (context: ScriptableContext<'line'>) => {
            const ctx = context.chart.ctx;
            const gradient = ctx.createLinearGradient(0, 0, 0, 280);
            gradient.addColorStop(0, 'rgba(224, 62, 62, 0.28)');
            gradient.addColorStop(1, 'rgba(224, 62, 62, 0.0)');
            return gradient;
          },
          fill: true,
          tension: 0.32,
          pointRadius: 3,
          pointHoverRadius: 6,
          pointBackgroundColor: '#e03e3e',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
        },
      ],
    };
  }, [filteredStats.weeklyDistribution, filteredStats.monthlyData, timelineViewMode]);

  // 2. Rides Distribution Bar Chart
  const ridesDistributionData = {
    labels: filteredStats.ridesBuckets.map((b) => b.label),
    datasets: [
      {
        label: 'Membres',
        data: filteredStats.ridesBuckets.map((b) => b.count),
        backgroundColor: (context: ScriptableContext<'bar'>) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 220);
          gradient.addColorStop(0, '#e03e3e');
          gradient.addColorStop(1, '#c93434');
          return gradient;
        },
        hoverBackgroundColor: '#a82020',
        borderRadius: 4,
      },
    ],
  };

  // 3. Group Composition Doughnut
  const groupCompositionData = {
    labels: filteredStats.groupStats.map((g) => g.group),
    datasets: [
      {
        data: filteredStats.groupStats.map((g) => g.count),
        backgroundColor: filteredStats.groupStats.map((g) => getGroupColorHex(g.group)),
        hoverOffset: 6,
        borderWidth: 2,
        borderColor: '#ffffff',
      },
    ],
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: '#101216',
        titleColor: '#ffffff',
        bodyColor: '#f5f6f8',
        borderColor: '#262b38',
        borderWidth: 1,
        padding: 10,
        boxPadding: 4,
        usePointStyle: true,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(228, 224, 216, 0.6)',
        },
        ticks: {
          color: '#5c6370',
          font: { family: 'Poppins', size: 11 },
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#5c6370',
          font: { family: 'Poppins', size: 11 },
          maxRotation: 45,
          autoSkip: true,
          maxTicksLimit: 14,
        },
      },
    },
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#101216',
        titleColor: '#ffffff',
        bodyColor: '#f5f6f8',
        borderColor: '#262b38',
        borderWidth: 1,
        padding: 10,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(228, 224, 216, 0.6)',
        },
        ticks: {
          color: '#5c6370',
          font: { family: 'Poppins', size: 11 },
          stepSize: 1,
        },
      },
      x: {
        grid: { display: false },
        ticks: {
          color: '#5c6370',
          font: { family: 'Poppins', size: 11 },
        },
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '72%',
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: '#101216',
        titleColor: '#ffffff',
        bodyColor: '#f5f6f8',
        borderColor: '#262b38',
        borderWidth: 1,
        padding: 10,
        callbacks: {
          label: (context: { label?: string; parsed?: number }) => {
            const count = context.parsed || 0;
            const total = filteredStats.participatingMembers || 1;
            const pct = Math.round((count / total) * 100);
            return ` ${context.label}: ${count} membres (${pct}%)`;
          },
        },
      },
    },
  };

  return (
    <>
      {/* Graph 1: Seasonal Activity Line/Area Curve */}
      <div className="rounded-lg border border-[#e4e0d8] bg-white p-5 sm:p-6 shadow-xs lg:col-span-2">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-[#e4e0d8] pb-4 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold uppercase tracking-tight text-[#101216]">
                Courbe d&apos;Affluence &amp; Dynamique Saisonnière
              </h3>
              <span className="rounded-full bg-[#e03e3e]/10 text-[#e03e3e] px-2 py-0.5 text-xs font-bold uppercase tracking-wider border border-[#e03e3e]/20">
                Temps Réel
              </span>
            </div>
            <p className="text-xs text-[#5c6370]">
              Volume de cyclistes aux sorties officielles du club en {selectedYear}
            </p>
          </div>

          {/* View Switcher Pills */}
          <div className="flex items-center rounded-md border border-[#e4e0d8] bg-[#faf8f5] p-0.5 text-xs">
            <button
              type="button"
              onClick={() => setTimelineViewMode('sortie')}
              className={`rounded-sm px-2.5 py-1 font-semibold transition-all ${
                timelineViewMode === 'sortie'
                  ? 'bg-white text-[#101216] shadow-xs font-bold'
                  : 'text-[#5c6370] hover:text-[#101216]'
              }`}
            >
              Par Sortie
            </button>
            <button
              type="button"
              onClick={() => setTimelineViewMode('mois')}
              className={`rounded-sm px-2.5 py-1 font-semibold transition-all ${
                timelineViewMode === 'mois'
                  ? 'bg-white text-[#101216] shadow-xs font-bold'
                  : 'text-[#5c6370] hover:text-[#101216]'
              }`}
            >
              Par Mois
            </button>
            <button
              type="button"
              onClick={() => setTimelineViewMode('cumul')}
              className={`rounded-sm px-2.5 py-1 font-semibold transition-all ${
                timelineViewMode === 'cumul'
                  ? 'bg-white text-[#101216] shadow-xs font-bold'
                  : 'text-[#5c6370] hover:text-[#101216]'
              }`}
            >
              Cumulé
            </button>
          </div>
        </div>

        {filteredStats.weeklyDistribution.length > 0 ? (
          <div className="h-72 sm:h-80 w-full">
            <Line data={timelineChartData} options={lineChartOptions} />
          </div>
        ) : (
          <div className="flex h-60 items-center justify-center text-xs font-medium text-[#5c6370]">
            Aucune donnée d&apos;affluence enregistrée pour cette année
          </div>
        )}
      </div>

      {/* Graph 2: Rides Distribution Histogram */}
      <div className="rounded-lg border border-[#e4e0d8] bg-white p-5 sm:p-6 shadow-xs">
        <div className="border-b border-[#e4e0d8] pb-3 mb-4">
          <h3 className="font-extrabold uppercase tracking-tight text-[#101216]">
            Distribution de l&apos;Assiduité
          </h3>
          <p className="text-xs text-[#5c6370]">
            Répartition des membres par tranche de sorties accomplies
          </p>
        </div>
        <div className="h-64 w-full">
          <Bar data={ridesDistributionData} options={barChartOptions} />
        </div>
        <div className="mt-3 flex items-center justify-center gap-4 text-xs text-[#5c6370]">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-xs bg-[#e03e3e]" />
            Effectif par tranche de carrés
          </span>
        </div>
      </div>

      {/* Graph 3: Group Dynamics & Doughnut */}
      <div className="rounded-lg border border-[#e4e0d8] bg-white p-5 sm:p-6 shadow-xs flex flex-col justify-between">
        <div className="border-b border-[#e4e0d8] pb-3 mb-4">
          <h3 className="font-extrabold uppercase tracking-tight text-[#101216]">
            Dynamique &amp; Force des Groupes
          </h3>
          <p className="text-xs text-[#5c6370]">
            Participation et assiduité par niveau de peloton
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 items-center gap-4 py-2">
          {/* Donut with center readout */}
          <div className="relative flex h-52 items-center justify-center">
            <div className="h-full w-full max-w-[200px]">
              <Doughnut data={groupCompositionData} options={doughnutOptions} />
            </div>
            <div className="pointer-events-none absolute flex flex-col items-center justify-center text-center">
              <span className="text-xl font-extrabold text-[#101216] tabular-nums">
                {filteredStats.participatingMembers}
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-[#5c6370]">
                Cyclistes
              </span>
            </div>
          </div>

          {/* Group Legend Cards */}
          <div className="space-y-2">
            {filteredStats.groupStats.map((group) => (
              <div
                key={group.group}
                className="flex items-center justify-between rounded-md border border-[#e4e0d8] bg-[#faf8f5] p-2 text-xs"
              >
                <div className="flex items-center gap-2">
                  <span className={`inline-flex rounded-xs px-2 py-0.5 text-xs font-bold uppercase tracking-wider ${getGroupBadgeStyle(group.group)}`}>
                    {group.group}
                  </span>
                  <span className="font-bold text-[#101216] tabular-nums">
                    {group.count} cycliste{group.count > 1 ? 's' : ''}
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-extrabold text-[#101216] tabular-nums">
                    {group.avgRides}
                  </span>{' '}
                  <span className="text-xs text-[#5c6370]">moy.</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
