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
import type {
  WeeklyTimelinePoint,
  MonthlyTimelinePoint,
  TracesCatalogStats,
  GroupDynamicsStats,
  DemocracyStats,
} from '@/app/lib/clubStatistics';

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

interface TelemetryTimelineChartProps {
  selectedYear: string;
  weeklyDistribution: WeeklyTimelinePoint[];
  monthlyData: MonthlyTimelinePoint[];
}

export function TelemetryTimelineChart({
  selectedYear,
  weeklyDistribution,
  monthlyData,
}: TelemetryTimelineChartProps): React.ReactElement {
  const [mode, setMode] = useState<'sortie' | 'mois' | 'cumul' | 'km'>('sortie');

  const chartData = useMemo(() => {
    if (mode === 'mois') {
      return {
        labels: monthlyData.map((m) => m.monthName.slice(0, 4)),
        datasets: [
          {
            label: 'Présences mensuelles',
            data: monthlyData.map((m) => m.totalAttendance),
            borderColor: '#e03e3e',
            backgroundColor: (context: ScriptableContext<'line'>) => {
              const ctx = context.chart.ctx;
              const gradient = ctx.createLinearGradient(0, 0, 0, 260);
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

    if (mode === 'cumul') {
      let runSum = 0;
      const cumulativeCounts = weeklyDistribution.map((w) => {
        runSum += w.count;
        return runSum;
      });
      return {
        labels: weeklyDistribution.map((w) => w.week),
        datasets: [
          {
            label: 'Cumul des présences',
            data: cumulativeCounts,
            borderColor: '#10b981',
            backgroundColor: (context: ScriptableContext<'line'>) => {
              const ctx = context.chart.ctx;
              const gradient = ctx.createLinearGradient(0, 0, 0, 260);
              gradient.addColorStop(0, 'rgba(16, 185, 129, 0.35)');
              gradient.addColorStop(1, 'rgba(16, 185, 129, 0.0)');
              return gradient;
            },
            fill: true,
            tension: 0.3,
            pointRadius: 3,
            pointHoverRadius: 5,
            pointBackgroundColor: '#10b981',
            pointBorderColor: '#ffffff',
            pointBorderWidth: 2,
          },
        ],
      };
    }

    if (mode === 'km') {
      return {
        labels: weeklyDistribution.map((w) => w.week),
        datasets: [
          {
            label: 'Kilomètres-Peloton (km)',
            data: weeklyDistribution.map((w) => w.pelotonKm),
            borderColor: '#3b82f6',
            backgroundColor: (context: ScriptableContext<'line'>) => {
              const ctx = context.chart.ctx;
              const gradient = ctx.createLinearGradient(0, 0, 0, 260);
              gradient.addColorStop(0, 'rgba(59, 130, 246, 0.35)');
              gradient.addColorStop(1, 'rgba(59, 130, 246, 0.0)');
              return gradient;
            },
            fill: true,
            tension: 0.3,
            pointRadius: 3,
            pointHoverRadius: 6,
            pointBackgroundColor: '#3b82f6',
            pointBorderColor: '#ffffff',
            pointBorderWidth: 2,
          },
        ],
      };
    }

    // Default: Par Sortie
    return {
      labels: weeklyDistribution.map((w) => w.week),
      datasets: [
        {
          label: 'Cyclistes par sortie',
          data: weeklyDistribution.map((w) => w.count),
          borderColor: '#e03e3e',
          backgroundColor: (context: ScriptableContext<'line'>) => {
            const ctx = context.chart.ctx;
            const gradient = ctx.createLinearGradient(0, 0, 0, 260);
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
  }, [mode, weeklyDistribution, monthlyData]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#101216',
        titleColor: '#ffffff',
        bodyColor: '#f5f6f8',
        borderColor: '#262b38',
        borderWidth: 1,
        padding: 10,
        boxPadding: 4,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(228, 224, 216, 0.6)' },
        ticks: {
          color: '#5c6370',
          font: { family: 'Archivo', size: 11 },
        },
      },
      x: {
        grid: { display: false },
        ticks: {
          color: '#5c6370',
          font: { family: 'Archivo', size: 11 },
          maxRotation: 45,
          autoSkip: true,
          maxTicksLimit: 14,
        },
      },
    },
  };

  return (
    <div className="rounded-lg border border-line bg-white p-5 sm:p-6 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-line pb-4 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-extrabold uppercase tracking-tight text-ink">
              Affluence &amp; Volume Kilométrique du Peloton
            </h3>
            <span className="rounded-full bg-brand/10 text-brand px-2 py-0.5 text-xs font-bold uppercase tracking-wider border border-brand/20">
              Saison {selectedYear}
            </span>
          </div>
          <p className="text-xs text-ink-3">
            Évolution continue de la participation et de l&apos;effort collectif
          </p>
        </div>

        <div className="flex flex-wrap items-center rounded-md border border-line bg-paper p-0.5 text-xs">
          <button
            type="button"
            onClick={() => setMode('sortie')}
            className={`rounded-sm px-2.5 py-1 font-bold uppercase tracking-wider transition-all ${
              mode === 'sortie' ? 'bg-white text-ink shadow-xs' : 'text-ink-3 hover:text-ink'
            }`}
          >
            Sortie
          </button>
          <button
            type="button"
            onClick={() => setMode('mois')}
            className={`rounded-sm px-2.5 py-1 font-bold uppercase tracking-wider transition-all ${
              mode === 'mois' ? 'bg-white text-ink shadow-xs' : 'text-ink-3 hover:text-ink'
            }`}
          >
            Mois
          </button>
          <button
            type="button"
            onClick={() => setMode('km')}
            className={`rounded-sm px-2.5 py-1 font-bold uppercase tracking-wider transition-all ${
              mode === 'km' ? 'bg-white text-ink shadow-xs' : 'text-ink-3 hover:text-ink'
            }`}
          >
            Km-Peloton
          </button>
          <button
            type="button"
            onClick={() => setMode('cumul')}
            className={`rounded-sm px-2.5 py-1 font-bold uppercase tracking-wider transition-all ${
              mode === 'cumul' ? 'bg-white text-ink shadow-xs' : 'text-ink-3 hover:text-ink'
            }`}
          >
            Cumul
          </button>
        </div>
      </div>

      {weeklyDistribution.length > 0 ? (
        <div className="h-72 sm:h-80 w-full">
          <Line data={chartData} options={options} />
        </div>
      ) : (
        <div className="flex h-60 items-center justify-center text-xs font-semibold text-ink-3">
          Aucune sortie enregistrée pour cette année
        </div>
      )}
    </div>
  );
}

interface RidesHistogramChartProps {
  ridesBuckets: Array<{ label: string; count: number }>;
}

export function RidesHistogramChart({
  ridesBuckets,
}: RidesHistogramChartProps): React.ReactElement {
  const data = {
    labels: ridesBuckets.map((b) => b.label),
    datasets: [
      {
        label: 'Membres',
        data: ridesBuckets.map((b) => b.count),
        backgroundColor: (context: ScriptableContext<'bar'>) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 220);
          gradient.addColorStop(0, '#e03e3e');
          gradient.addColorStop(1, '#b92828');
          return gradient;
        },
        hoverBackgroundColor: '#8e1b1b',
        borderRadius: 4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#101216',
        titleColor: '#ffffff',
        bodyColor: '#f5f6f8',
        padding: 10,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(228, 224, 216, 0.6)' },
        ticks: {
          color: '#5c6370',
          font: { family: 'Archivo', size: 11 },
          stepSize: 1,
        },
      },
      x: {
        grid: { display: false },
        ticks: {
          color: '#5c6370',
          font: { family: 'Archivo', size: 11 },
        },
      },
    },
  };

  return (
    <div className="rounded-lg border border-line bg-white p-5 sm:p-6 shadow-xs">
      <div className="border-b border-line pb-3 mb-4">
        <h3 className="font-extrabold uppercase tracking-tight text-ink">
          Distribution de l&apos;Assiduité
        </h3>
        <p className="text-xs text-ink-3">
          Répartition des cyclos selon leur volume de sorties validées
        </p>
      </div>
      <div className="h-64 w-full">
        <Bar data={data} options={options} />
      </div>
      <div className="mt-3 flex items-center justify-center gap-2 text-xs text-ink-3">
        <span className="h-2.5 w-2.5 rounded-xs bg-brand" />
        <span>Nombre de cyclistes par tranche de carrés</span>
      </div>
    </div>
  );
}

interface GroupCompositionChartProps {
  groupDynamics: GroupDynamicsStats;
}

export function GroupCompositionChart({
  groupDynamics,
}: GroupCompositionChartProps): React.ReactElement {
  const getGroupColor = (name: string): string => {
    if (name.includes('A') || name.includes('Vert') || name.includes('V')) return '#10b981';
    if (name.includes('B') || name.includes('Jaune') || name.includes('J')) return '#3b82f6';
    if (name.includes('C') || name.includes('Bleu')) return '#f59e0b';
    if (name.includes('Rouge') || name.includes('R')) return '#e03e3e';
    return '#5c6370';
  };

  const data = {
    labels: groupDynamics.groupStats.map((g) => g.group),
    datasets: [
      {
        data: groupDynamics.groupStats.map((g) => g.totalAttendances),
        backgroundColor: groupDynamics.groupStats.map((g) => getGroupColor(g.group)),
        hoverOffset: 6,
        borderWidth: 2,
        borderColor: '#ffffff',
      },
    ],
  };

  const total = groupDynamics.groupStats.reduce((sum, g) => sum + g.totalAttendances, 0);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '72%',
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#101216',
        titleColor: '#ffffff',
        bodyColor: '#f5f6f8',
        padding: 10,
        callbacks: {
          label: (context: { label?: string; parsed?: number }) => {
            const count = context.parsed || 0;
            const pct = total > 0 ? Math.round((count / total) * 100) : 0;
            return ` ${context.label}: ${count} présences (${pct}%)`;
          },
        },
      },
    },
  };

  return (
    <div className="rounded-lg border border-line bg-white p-5 sm:p-6 shadow-xs">
      <div className="border-b border-line pb-3 mb-4">
        <h3 className="font-extrabold uppercase tracking-tight text-ink">
          Répartition de l&apos;Affluence par Groupe
        </h3>
        <p className="text-xs text-ink-3">
          Part de chaque peloton d&apos;allure dans le volume total de sorties
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 items-center gap-4 py-2">
        <div className="relative flex h-52 items-center justify-center">
          <div className="h-full w-full max-w-[200px]">
            <Doughnut data={data} options={options} />
          </div>
          <div className="pointer-events-none absolute flex flex-col items-center justify-center text-center">
            <span className="text-2xl font-extrabold text-ink tabular-nums">
              {total}
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-ink-3">
              Présences
            </span>
          </div>
        </div>

        <div className="space-y-2">
          {groupDynamics.groupStats.map((g) => (
            <div
              key={g.group}
              className="flex items-center justify-between rounded-md border border-line bg-paper p-2.5 text-xs"
            >
              <div className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: getGroupColor(g.group) }}
                />
                <span className="font-bold text-ink">{g.group}</span>
              </div>
              <div className="text-right">
                <span className="font-extrabold text-ink tabular-nums">
                  {g.totalAttendances}
                </span>{' '}
                <span className="text-xs text-ink-3">({g.percentOfTotal}%)</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

interface TracesDistanceChartProps {
  tracesStats: TracesCatalogStats;
}

export function TracesDistanceChart({
  tracesStats,
}: TracesDistanceChartProps): React.ReactElement {
  const data = {
    labels: tracesStats.distanceBuckets.map((b) => b.label),
    datasets: [
      {
        label: 'Parcours',
        data: tracesStats.distanceBuckets.map((b) => b.count),
        backgroundColor: '#3b82f6',
        borderRadius: 4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#101216',
        titleColor: '#ffffff',
        bodyColor: '#f5f6f8',
        padding: 10,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(228, 224, 216, 0.6)' },
        ticks: {
          color: '#5c6370',
          font: { family: 'Archivo', size: 11 },
          stepSize: 1,
        },
      },
      x: {
        grid: { display: false },
        ticks: {
          color: '#5c6370',
          font: { family: 'Archivo', size: 11 },
        },
      },
    },
  };

  return (
    <div className="rounded-lg border border-line bg-white p-5 sm:p-6 shadow-xs">
      <div className="border-b border-line pb-3 mb-4">
        <h3 className="font-extrabold uppercase tracking-tight text-ink">
          Profils Kilométriques du Catalogue
        </h3>
        <p className="text-xs text-ink-3">
          Distribution des {tracesStats.totalTraces} traces selon leur distance
        </p>
      </div>
      <div className="h-64 w-full">
        <Bar data={data} options={options} />
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-center gap-3 text-xs text-ink-3">
        {tracesStats.distanceBuckets.map((b) => (
          <span key={b.label} className="inline-flex items-center gap-1">
            <span className="font-bold text-ink">{b.label} :</span>
            <span>{b.description}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

interface TracesDirectionChartProps {
  tracesStats: TracesCatalogStats;
}

export function TracesDirectionChart({
  tracesStats,
}: TracesDirectionChartProps): React.ReactElement {
  const data = {
    labels: tracesStats.directionDistribution.map((d) => d.direction),
    datasets: [
      {
        data: tracesStats.directionDistribution.map((d) => d.count),
        backgroundColor: ['#e03e3e', '#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#64748b'],
        borderWidth: 2,
        borderColor: '#ffffff',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#101216',
        titleColor: '#ffffff',
        bodyColor: '#f5f6f8',
        padding: 10,
      },
    },
  };

  return (
    <div className="rounded-lg border border-line bg-white p-5 sm:p-6 shadow-xs">
      <div className="border-b border-line pb-3 mb-4">
        <h3 className="font-extrabold uppercase tracking-tight text-ink">
          Orientation &amp; Terroirs Explorés
        </h3>
        <p className="text-xs text-ink-3">
          Répartition géographique des parcours du club
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 items-center gap-4 py-2">
        <div className="flex h-52 items-center justify-center">
          <div className="h-full w-full max-w-[200px]">
            <Doughnut data={data} options={options} />
          </div>
        </div>

        <div className="space-y-2">
          {tracesStats.directionDistribution.map((d) => (
            <div
              key={d.direction}
              className="flex items-center justify-between rounded-md border border-line bg-paper p-2 text-xs"
            >
              <span className="font-semibold text-ink">{d.direction}</span>
              <span className="font-extrabold text-ink tabular-nums">
                {d.count} parcours
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

interface DemocracyPopularChartProps {
  democracy: DemocracyStats;
}

export function DemocracyPopularChart({
  democracy,
}: DemocracyPopularChartProps): React.ReactElement {
  const popular = democracy.popularTraces.slice(0, 5);

  const data = {
    labels: popular.map((p) => p.traceName),
    datasets: [
      {
        label: 'Suffrages reçus',
        data: popular.map((p) => p.voteCount),
        backgroundColor: '#10b981',
        borderRadius: 4,
      },
    ],
  };

  const options = {
    indexAxis: 'y' as const,
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#101216',
        titleColor: '#ffffff',
        bodyColor: '#f5f6f8',
        padding: 10,
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        grid: { color: 'rgba(228, 224, 216, 0.6)' },
        ticks: {
          color: '#5c6370',
          font: { family: 'Archivo', size: 11 },
          stepSize: 1,
        },
      },
      y: {
        grid: { display: false },
        ticks: {
          color: '#101216',
          font: { family: 'Archivo', size: 11, weight: 'bold' as const },
        },
      },
    },
  };

  return (
    <div className="rounded-lg border border-line bg-white p-5 sm:p-6 shadow-xs">
      <div className="border-b border-line pb-3 mb-4">
        <h3 className="font-extrabold uppercase tracking-tight text-ink">
          Tracés Plébiscités par le Club
        </h3>
        <p className="text-xs text-ink-3">
          Parcours ayant recueilli le plus de votes lors des sorties du samedi
        </p>
      </div>

      {popular.length > 0 ? (
        <div className="h-60 w-full">
          <Bar data={data} options={options} />
        </div>
      ) : (
        <div className="flex h-48 items-center justify-center text-xs text-ink-3">
          Aucun vote enregistré pour cette saison
        </div>
      )}
    </div>
  );
}
