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
  type ChartDataset,
  type TooltipItem,
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

const MONTHS_SHORT_FR = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
const DAYS_FULL_FR = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
const MONTHS_FULL_FR = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

function formatShortDateFr(isoDate?: string, fallback: string = ''): string {
  if (!isoDate || !isoDate.includes('-')) return fallback;
  const parts = isoDate.split('-').map(Number);
  if (parts.length < 3 || isNaN(parts[1]) || isNaN(parts[2])) return fallback;
  const mIndex = parts[1] - 1;
  const monthName = MONTHS_SHORT_FR[mIndex] || '';
  return `${parts[2]} ${monthName}`;
}

function formatFullDateFr(isoDate?: string, fallback: string = ''): string {
  if (!isoDate || !isoDate.includes('-')) return fallback;
  const parts = isoDate.split('-').map(Number);
  if (parts.length < 3) return fallback;
  const d = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2]));
  if (isNaN(d.getTime())) return fallback;
  const dayName = DAYS_FULL_FR[d.getUTCDay()];
  const monthName = MONTHS_FULL_FR[parts[1] - 1];
  return `${dayName} ${parts[2]} ${monthName} ${parts[0]}`;
}

interface TelemetryTimelineChartProps {
  selectedYear: string;
  weeklyDistribution: WeeklyTimelinePoint[];
  monthlyData: MonthlyTimelinePoint[];
  telemetryStats?: {
    totalPelotonKm: number;
    totalPelotonElevation: number;
    totalAttendances: number;
    officialRidesCount: number;
    avgPelotonSize: number;
    biggestPelotonEvent: {
      date: string;
      location: string;
      count: number;
      distance: number;
    } | null;
  };
}

export function TelemetryTimelineChart({
  selectedYear,
  weeklyDistribution,
  monthlyData,
  telemetryStats,
}: TelemetryTimelineChartProps): React.ReactElement {
  const [mode, setMode] = useState<'sortie' | 'mois' | 'cumul' | 'km'>('sortie');
  const [showTrend, setShowTrend] = useState<boolean>(true);

  // Peak ride count for visual badge highlight
  const maxRideCount = useMemo(() => {
    return Math.max(...weeklyDistribution.map((w) => w.count), 0);
  }, [weeklyDistribution]);

  // Telemetry summary computed or retrieved
  const summary = useMemo(() => {
    const totalAttendances = telemetryStats?.totalAttendances ?? weeklyDistribution.reduce((s, w) => s + w.count, 0);
    const totalKm = telemetryStats?.totalPelotonKm ?? weeklyDistribution.reduce((s, w) => s + w.pelotonKm, 0);
    const ridesCount = telemetryStats?.officialRidesCount ?? weeklyDistribution.length;
    const avgSize = telemetryStats?.avgPelotonSize ?? (ridesCount > 0 ? Math.round((totalAttendances / ridesCount) * 10) / 10 : 0);

    let peakCount = telemetryStats?.biggestPelotonEvent?.count ?? 0;
    let peakDate = telemetryStats?.biggestPelotonEvent?.date ?? '';

    if (!peakCount && weeklyDistribution.length > 0) {
      weeklyDistribution.forEach((w) => {
        if (w.count > peakCount) {
          peakCount = w.count;
          peakDate = formatShortDateFr(w.isoDate, w.week);
        }
      });
    }

    return {
      totalAttendances,
      totalKm,
      ridesCount,
      avgSize,
      peakCount,
      peakDate,
    };
  }, [telemetryStats, weeklyDistribution]);

  const chartData = useMemo(() => {
    if (mode === 'mois') {
      return {
        labels: monthlyData.map((m) => m.monthName),
        datasets: [
          {
            label: 'Présences mensuelles',
            data: monthlyData.map((m) => m.totalAttendance),
            backgroundColor: (context: ScriptableContext<'bar'>) => {
              const ctx = context.chart.ctx;
              const gradient = ctx.createLinearGradient(0, 0, 0, 240);
              gradient.addColorStop(0, '#e03e3e');
              gradient.addColorStop(1, '#b82b2b');
              return gradient;
            },
            hoverBackgroundColor: '#8e1b1b',
            borderRadius: 4,
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
        labels: weeklyDistribution.map((w) => formatShortDateFr(w.isoDate, w.week)),
        datasets: [
          {
            label: 'Cumul des présences',
            data: cumulativeCounts,
            borderColor: '#2e7d45',
            backgroundColor: (context: ScriptableContext<'line'>) => {
              const ctx = context.chart.ctx;
              const gradient = ctx.createLinearGradient(0, 0, 0, 260);
              gradient.addColorStop(0, 'rgba(46, 125, 69, 0.28)');
              gradient.addColorStop(1, 'rgba(46, 125, 69, 0.01)');
              return gradient;
            },
            fill: true,
            tension: 0.32,
            pointRadius: 2.5,
            pointHoverRadius: 5.5,
            pointBackgroundColor: '#2e7d45',
            pointBorderColor: '#ffffff',
            pointBorderWidth: 1.5,
          },
        ],
      };
    }

    if (mode === 'km') {
      return {
        labels: weeklyDistribution.map((w) => formatShortDateFr(w.isoDate, w.week)),
        datasets: [
          {
            label: 'Kilomètres-Peloton (km)',
            data: weeklyDistribution.map((w) => w.pelotonKm),
            borderColor: '#1f6fbf',
            backgroundColor: (context: ScriptableContext<'line'>) => {
              const ctx = context.chart.ctx;
              const gradient = ctx.createLinearGradient(0, 0, 0, 260);
              gradient.addColorStop(0, 'rgba(31, 111, 191, 0.28)');
              gradient.addColorStop(1, 'rgba(31, 111, 191, 0.01)');
              return gradient;
            },
            fill: true,
            tension: 0.32,
            pointRadius: 2.5,
            pointHoverRadius: 5.5,
            pointBackgroundColor: '#1f6fbf',
            pointBorderColor: '#ffffff',
            pointBorderWidth: 1.5,
          },
        ],
      };
    }

    // Default: Par Sortie with optional rolling average trendline
    const datasets: ChartDataset<'line'>[] = [
      {
        label: 'Cyclistes par sortie',
        data: weeklyDistribution.map((w) => w.count),
        borderColor: '#e03e3e',
        backgroundColor: (context: ScriptableContext<'line'>) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 260);
          gradient.addColorStop(0, 'rgba(224, 62, 62, 0.25)');
          gradient.addColorStop(1, 'rgba(224, 62, 62, 0.01)');
          return gradient;
        },
        fill: true,
        tension: 0.34,
        pointRadius: weeklyDistribution.map((w) => (w.count === maxRideCount && maxRideCount > 0 ? 5.5 : 2.5)),
        pointHoverRadius: 6.5,
        pointBackgroundColor: weeklyDistribution.map((w) => (w.count === maxRideCount && maxRideCount > 0 ? '#e8962a' : '#e03e3e')),
        pointBorderColor: '#ffffff',
        pointBorderWidth: weeklyDistribution.map((w) => (w.count === maxRideCount && maxRideCount > 0 ? 2 : 1)),
      },
    ];

    if (showTrend && weeklyDistribution.length >= 4) {
      const rollingAvg = weeklyDistribution.map((_, idx) => {
        const windowStart = Math.max(0, idx - 3);
        const slice = weeklyDistribution.slice(windowStart, idx + 1);
        const avg = slice.reduce((sum, item) => sum + item.count, 0) / slice.length;
        return Math.round(avg * 10) / 10;
      });

      datasets.push({
        label: 'Tendance (Moyenne mobile 4 sorties)',
        data: rollingAvg,
        borderColor: '#b0703b',
        borderWidth: 2,
        borderDash: [5, 4],
        pointRadius: 0,
        pointHoverRadius: 0,
        fill: false,
        tension: 0.38,
      });
    }

    return {
      labels: weeklyDistribution.map((w) => formatShortDateFr(w.isoDate, w.week)),
      datasets,
    };
  }, [mode, weeklyDistribution, monthlyData, showTrend, maxRideCount]);

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
        backgroundColor: '#151a1f',
        titleColor: '#eef1f4',
        bodyColor: '#eef1f4',
        borderColor: '#28303a',
        borderWidth: 1,
        padding: 12,
        boxPadding: 4,
        titleFont: { family: 'Archivo, sans-serif', size: 12, weight: 'bold' as const },
        bodyFont: { family: 'Archivo, sans-serif', size: 12 },
        callbacks: {
          title: (items: TooltipItem<'line' | 'bar'>[]): string => {
            if (!items || items.length === 0) return '';
            const idx = items[0].dataIndex;
            if (mode === 'mois') {
              return monthlyData[idx] ? `Mois de ${monthlyData[idx].monthName} ${selectedYear}` : '';
            }
            const pt = weeklyDistribution[idx];
            if (!pt) return '';
            return pt.isoDate ? formatFullDateFr(pt.isoDate, pt.week) : `Sortie du ${pt.week}`;
          },
          label: (context: TooltipItem<'line' | 'bar'>): string => {
            const idx = context.dataIndex;
            const pt = weeklyDistribution[idx];
            if (context.dataset.label && context.dataset.label.includes('Tendance')) {
              return `  Tendance : ${context.parsed.y} cyclos (moyenne mobile)`;
            }
            if (mode === 'sortie' && pt) {
              const diffAvg = summary.avgSize > 0
                ? Math.round(((pt.count - summary.avgSize) / summary.avgSize) * 100)
                : 0;
              const sign = diffAvg > 0 ? '+' : '';
              return [
                `  Peloton : ${pt.count} cyclistes`,
                `  Distance : ${pt.distance} km (${pt.pelotonKm.toLocaleString('fr-FR')} km-peloton)`,
                `  Écart saison : ${sign}${diffAvg}% (${summary.avgSize} moy.)`,
              ];
            }
            if (mode === 'mois') {
              const m = monthlyData[idx];
              return m
                ? [
                    `  Présences cumulées : ${m.totalAttendance} cyclos`,
                    `  Sorties tenues : ${m.eventCount}`,
                    `  Kilomètres-peloton : ${m.pelotonKm.toLocaleString('fr-FR')} km`,
                  ]
                : `  ${context.parsed.y} cyclos`;
            }
            if (mode === 'km' && pt) {
              return [
                `  Kilomètres-peloton : ${pt.pelotonKm.toLocaleString('fr-FR')} km`,
                `  Peloton : ${pt.count} cyclos sur ${pt.distance} km`,
              ];
            }
            if (mode === 'cumul') {
              return `  Cumul de la saison : ${context.parsed.y} présences`;
            }
            return `  ${context.dataset.label || ''} : ${context.parsed.y}`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(220, 221, 212, 0.6)' },
        ticks: {
          color: '#5c6069',
          font: { family: 'Archivo, sans-serif', size: 11 },
        },
      },
      x: {
        grid: { display: false },
        ticks: {
          color: '#5c6069',
          font: { family: 'Archivo, sans-serif', size: 11 },
          maxRotation: 0,
          autoSkip: true,
          maxTicksLimit: 10,
        },
      },
    },
  };

  return (
    <div className="rounded-md border border-line dark:border-night-line bg-paper dark:bg-night-2 p-5 sm:p-6">
      {/* Chart Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-line dark:border-night-line pb-4 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-extrabold uppercase tracking-tight text-ink dark:text-snow-1 font-semiwide">
              Affluence &amp; Volume Kilométrique du Peloton
            </h3>
            <span className="rounded-full bg-brand/10 text-brand px-2 py-0.5 text-xs font-bold uppercase tracking-wider border border-brand/20 font-mono">
              Saison {selectedYear}
            </span>
          </div>
          <p className="text-xs text-ink-3 dark:text-snow-3 mt-0.5">
            Évolution continue de la participation et de l&apos;effort collectif
          </p>
        </div>

        {/* View Mode Controls & Trend Toggle */}
        <div className="flex flex-wrap items-center gap-2">
          {mode === 'sortie' && (
            <button
              type="button"
              onClick={() => setShowTrend((prev) => !prev)}
              className={`rounded-md px-2.5 py-1 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer border ${
                showTrend
                  ? 'border-bistre/50 bg-bistre/10 text-bistre'
                  : 'border-line dark:border-night-line bg-paper-2 dark:bg-night-3 text-ink-3 dark:text-snow-3 hover:text-ink'
              }`}
              title="Afficher la moyenne mobile 4 sorties pour lisser les variations"
            >
              <span className="inline-flex items-center gap-1.5 font-narrow">
                <span className="h-1.5 w-3 border-b-2 border-dashed border-current inline-block" />
                Tendance
              </span>
            </button>
          )}

          <div className="inline-flex items-center rounded-md border border-line dark:border-night-line bg-paper-2 dark:bg-night-3 p-0.5 text-xs">
            <button
              type="button"
              onClick={() => setMode('sortie')}
              className={`rounded-sm px-2.5 py-1 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer font-narrow ${
                mode === 'sortie'
                  ? 'bg-paper dark:bg-night text-ink dark:text-snow-1 shadow-xs border border-line/60 dark:border-night-line'
                  : 'text-ink-3 dark:text-snow-3 hover:text-ink dark:hover:text-snow-1'
              }`}
            >
              Sortie
            </button>
            <button
              type="button"
              onClick={() => setMode('mois')}
              className={`rounded-sm px-2.5 py-1 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer font-narrow ${
                mode === 'mois'
                  ? 'bg-paper dark:bg-night text-ink dark:text-snow-1 shadow-xs border border-line/60 dark:border-night-line'
                  : 'text-ink-3 dark:text-snow-3 hover:text-ink dark:hover:text-snow-1'
              }`}
            >
              Mois
            </button>
            <button
              type="button"
              onClick={() => setMode('km')}
              className={`rounded-sm px-2.5 py-1 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer font-narrow ${
                mode === 'km'
                  ? 'bg-paper dark:bg-night text-ink dark:text-snow-1 shadow-xs border border-line/60 dark:border-night-line'
                  : 'text-ink-3 dark:text-snow-3 hover:text-ink dark:hover:text-snow-1'
              }`}
            >
              Km-Peloton
            </button>
            <button
              type="button"
              onClick={() => setMode('cumul')}
              className={`rounded-sm px-2.5 py-1 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer font-narrow ${
                mode === 'cumul'
                  ? 'bg-paper dark:bg-night text-ink dark:text-snow-1 shadow-xs border border-line/60 dark:border-night-line'
                  : 'text-ink-3 dark:text-snow-3 hover:text-ink dark:hover:text-snow-1'
              }`}
            >
              Cumul
            </button>
          </div>
        </div>
      </div>

      {/* Integrated Telemetry KPI strip for instant analytical clarity */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4 p-3 rounded-md bg-paper-2/60 dark:bg-night-3/40 border border-line dark:border-night-line text-xs">
        <div>
          <span className="font-narrow uppercase tracking-wider font-bold text-ink-3 dark:text-snow-3 text-[10px]">
            Peloton Moyen
          </span>
          <p className="font-extrabold text-ink dark:text-snow-1 text-sm tabular-nums font-mono">
            {summary.avgSize}{' '}
            <span className="text-[11px] font-normal text-ink-3 dark:text-snow-3 font-sans">cyclos/sortie</span>
          </p>
        </div>
        <div>
          <span className="font-narrow uppercase tracking-wider font-bold text-ink-3 dark:text-snow-3 text-[10px]">
            Pic de la Saison
          </span>
          <p className="font-extrabold text-ink dark:text-snow-1 text-sm tabular-nums font-mono">
            {summary.peakCount}{' '}
            <span className="text-[11px] font-normal text-ink-3 dark:text-snow-3 font-sans">
              cyclos {summary.peakDate ? `(${summary.peakDate})` : ''}
            </span>
          </p>
        </div>
        <div>
          <span className="font-narrow uppercase tracking-wider font-bold text-ink-3 dark:text-snow-3 text-[10px]">
            Sorties au Compteur
          </span>
          <p className="font-extrabold text-ink dark:text-snow-1 text-sm tabular-nums font-mono">
            {summary.ridesCount}{' '}
            <span className="text-[11px] font-normal text-ink-3 dark:text-snow-3 font-sans">
              ({summary.totalAttendances} cyclos)
            </span>
          </p>
        </div>
        <div>
          <span className="font-narrow uppercase tracking-wider font-bold text-ink-3 dark:text-snow-3 text-[10px]">
            Effort Collectif
          </span>
          <p className="font-extrabold text-ink dark:text-snow-1 text-sm tabular-nums font-mono">
            {summary.totalKm.toLocaleString('fr-FR')}{' '}
            <span className="text-[11px] font-normal text-ink-3 dark:text-snow-3 font-sans">km</span>
          </p>
        </div>
      </div>

      {/* Chart Canvas */}
      {weeklyDistribution.length > 0 ? (
        <div className="h-72 sm:h-80 w-full">
          {mode === 'mois' ? (
            <Bar data={chartData} options={options} />
          ) : (
            <Line data={chartData} options={options} />
          )}
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
          color: '#5c6069',
          font: { family: 'Archivo', size: 12 },
          stepSize: 1,
        },
      },
      x: {
        grid: { display: false },
        ticks: {
          color: '#5c6069',
          font: { family: 'Archivo', size: 12 },
        },
      },
    },
  };

  return (
    <div className="rounded-md border border-line dark:border-night-line bg-paper dark:bg-night-2 p-5 sm:p-6">
      <div className="border-b border-line dark:border-night-line pb-3 mb-4">
        <h3 className="font-extrabold uppercase tracking-tight text-ink dark:text-snow-1 font-semiwide">
          Distribution de l&apos;Assiduité
        </h3>
        <p className="text-xs text-ink-3 dark:text-snow-3">
          Répartition des cyclos selon leur volume de sorties validées
        </p>
      </div>
      <div className="h-64 w-full">
        <Bar data={data} options={options} />
      </div>
      <div className="mt-3 flex items-center justify-center gap-2 text-xs text-ink-3 dark:text-snow-3 font-mono">
        <span className="h-2.5 w-2.5 rounded-xs bg-brand" />
        <span>Nombre de cyclistes par tranche de carrés</span>
      </div>
    </div>
  );
}

interface GroupCompositionChartProps {
  groupDynamics: GroupDynamicsStats;
}

/**
 * Returns a cartographic spot ink color according to the IGN design system
 * for each cycling group, ensuring distinct and meaningful visual categorization.
 */
export function getGroupColor(name: string): string {
  const trimmed = (name || '').trim();
  const lower = trimmed.toLowerCase();

  // 1. Explicit color keywords
  if (lower.includes('vert')) return '#2e7d45'; // Woodland Green (vert)
  if (lower.includes('bleu')) return '#1f6fbf'; // Hydro Blue (hydro)
  if (lower.includes('jaune')) return '#e8962a'; // Amber Caution (ambre)
  if (lower.includes('rouge')) return '#d63535'; // Route Red (brand)

  // 2. Multi-group transitions
  if (/^groupe\s*b\s*[\/-]?\s*c$/i.test(trimmed) || /^(bc|b\/c|b-c)$/i.test(trimmed)) {
    return '#e8962a'; // Amber Caution (ambre)
  }

  // 3. Negative modifiers like A- / A -
  if (/^groupe\s*a\s*-$/i.test(trimmed) || /^a\s*-$/i.test(trimmed) || lower.includes('a-')) {
    return '#b0703b'; // Relief Bistre (bistre)
  }

  // 4. VTT or V
  if (/^groupe\s*v(?:tt)?$/i.test(trimmed) || /^(v|vtt)$/i.test(trimmed) || lower.includes('vtt')) {
    return '#2e7d45'; // Woodland Green (vert)
  }

  // 5. Group A (standard or elite)
  if (/^groupe\s*a$/i.test(trimmed) || /^a$/i.test(trimmed)) {
    return '#d63535'; // Route Red (brand)
  }

  // 6. Group B
  if (/^groupe\s*b$/i.test(trimmed) || /^b$/i.test(trimmed)) {
    return '#1f6fbf'; // Hydro Blue (hydro)
  }

  // 7. Group C
  if (/^groupe\s*c$/i.test(trimmed) || /^c$/i.test(trimmed)) {
    return '#7c3aed'; // Geodetic Violet
  }

  // 8. Other single letters / abbreviations
  if (/^groupe\s*j$/i.test(trimmed) || /^j$/i.test(trimmed)) return '#e8962a'; // Amber
  if (/^groupe\s*r$/i.test(trimmed) || /^r$/i.test(trimmed)) return '#d63535'; // Route Red

  // Fallbacks with word boundaries
  if (/\bvtt\b/i.test(trimmed)) return '#2e7d45';
  if (/\b(?:groupe\s+)?a-\b/i.test(trimmed)) return '#b0703b';
  if (/\b(?:groupe\s+)?bc\b/i.test(trimmed)) return '#e8962a';
  if (/\b(?:groupe\s+)?a\b/i.test(trimmed)) return '#d63535';
  if (/\b(?:groupe\s+)?b\b/i.test(trimmed)) return '#1f6fbf';
  if (/\b(?:groupe\s+)?c\b/i.test(trimmed)) return '#7c3aed';

  return '#5c6069'; // Muted Slate (ink-3)
}

/**
 * Ensures that every group in a displayed dataset receives a unique, distinct color
 * so no two groups collide visually in charts or legends.
 */
export function resolveGroupColors(groups: Array<{ group: string }>): Map<string, string> {
  const assigned = new Map<string, string>();
  const usedColors = new Set<string>();

  // Curated IGN cartographic palette for unambiguous contrast
  const fallbackPalette = [
    '#d63535', // Route Red
    '#1f6fbf', // Hydro Blue
    '#7c3aed', // Geodetic Violet
    '#2e7d45', // Woodland Green
    '#b0703b', // Relief Bistre
    '#e8962a', // Amber Caution
    '#0284c7', // Sky / Azur
    '#0d9488', // Emerald Teal
    '#5c6069', // Muted Slate
    '#c2410c', // Terracotta
    '#475569', // Deep Slate
  ];

  groups.forEach((g) => {
    const preferredColor = getGroupColor(g.group);
    if (!usedColors.has(preferredColor)) {
      assigned.set(g.group, preferredColor);
      usedColors.add(preferredColor);
    } else {
      const nextColor = fallbackPalette.find((c) => !usedColors.has(c)) || preferredColor;
      assigned.set(g.group, nextColor);
      usedColors.add(nextColor);
    }
  });

  return assigned;
}

export function GroupCompositionChart({
  groupDynamics,
}: GroupCompositionChartProps): React.ReactElement {
  const groupColorMap = useMemo(() => {
    return resolveGroupColors(groupDynamics.groupStats);
  }, [groupDynamics.groupStats]);

  const data = {
    labels: groupDynamics.groupStats.map((g) => g.group),
    datasets: [
      {
        data: groupDynamics.groupStats.map((g) => g.totalAttendances),
        backgroundColor: groupDynamics.groupStats.map(
          (g) => groupColorMap.get(g.group) || getGroupColor(g.group)
        ),
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
    <div className="rounded-md border border-line dark:border-night-line bg-paper dark:bg-night-2 p-5 sm:p-6">
      <div className="border-b border-line dark:border-night-line pb-3 mb-4">
        <h3 className="font-extrabold uppercase tracking-tight text-ink dark:text-snow-1 font-semiwide">
          Répartition de l&apos;Affluence par Groupe
        </h3>
        <p className="text-xs text-ink-3 dark:text-snow-3">
          Part de chaque peloton d&apos;allure dans le volume total de sorties
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 items-center gap-6 py-2">
        <div className="relative flex h-52 items-center justify-center">
          <div className="h-full w-full max-w-[200px]">
            <Doughnut data={data} options={options} />
          </div>
          <div className="pointer-events-none absolute flex flex-col items-center justify-center text-center">
            <span className="text-2xl font-extrabold text-ink dark:text-snow-1 tabular-nums font-mono">
              {total}
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-ink-3 dark:text-snow-3 font-narrow">
              Présences
            </span>
          </div>
        </div>

        <div className="space-y-1.5 min-w-0">
          {groupDynamics.groupStats.map((g) => (
            <div
              key={g.group}
              className="flex items-center justify-between gap-3 rounded-md border border-line dark:border-night-line bg-paper-2/70 dark:bg-night-3/60 px-3 py-2 text-xs"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className="h-2.5 w-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: groupColorMap.get(g.group) || getGroupColor(g.group) }}
                />
                <span className="font-bold text-ink dark:text-snow-1 truncate" title={g.group}>
                  {g.group}
                </span>
              </div>
              <div className="text-right shrink-0 font-mono whitespace-nowrap">
                <span className="font-extrabold text-ink dark:text-snow-1 tabular-nums">
                  {g.totalAttendances}
                </span>{' '}
                <span className="text-[11px] text-ink-3 dark:text-snow-3 font-sans">
                  ({g.percentOfTotal}%)
                </span>
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
        backgroundColor: '#1f6fbf',
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
          color: '#5c6069',
          font: { family: 'Archivo', size: 12 },
          stepSize: 1,
        },
      },
      x: {
        grid: { display: false },
        ticks: {
          color: '#5c6069',
          font: { family: 'Archivo', size: 12 },
        },
      },
    },
  };

  return (
    <div className="rounded-md border border-line dark:border-night-line bg-paper dark:bg-night-2 p-5 sm:p-6">
      <div className="border-b border-line dark:border-night-line pb-3 mb-4">
        <h3 className="font-extrabold uppercase tracking-tight text-ink dark:text-snow-1 font-semiwide">
          Profils Kilométriques du Catalogue
        </h3>
        <p className="text-xs text-ink-3 dark:text-snow-3">
          Distribution des {tracesStats.totalTraces} traces selon leur distance
        </p>
      </div>
      <div className="h-64 w-full">
        <Bar data={data} options={options} />
      </div>
      <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t border-line dark:border-night-line text-xs">
        {tracesStats.distanceBuckets.map((b) => (
          <div
            key={b.label}
            className="flex flex-col rounded-md border border-line dark:border-night-line bg-paper-2/60 dark:bg-night-3/50 p-2 text-center"
          >
            <span className="font-extrabold text-ink dark:text-snow-1 font-mono">{b.label}</span>
            <span className="text-[11px] text-ink-3 dark:text-snow-3 mt-0.5 font-sans leading-tight">
              {b.description}
            </span>
          </div>
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
        backgroundColor: ['#d63535', '#2e7d45', '#1f6fbf', '#e8962a', '#b0703b', '#5c6069'],
        borderWidth: 2,
        borderColor: '#ffffff',
      },
    ],
  };

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
      },
    },
  };

  return (
    <div className="rounded-md border border-line dark:border-night-line bg-paper dark:bg-night-2 p-5 sm:p-6">
      <div className="border-b border-line dark:border-night-line pb-3 mb-4">
        <h3 className="font-extrabold uppercase tracking-tight text-ink dark:text-snow-1 font-semiwide">
          Orientation &amp; Terroirs Explorés
        </h3>
        <p className="text-xs text-ink-3 dark:text-snow-3">
          Répartition géographique des parcours du club
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 items-center gap-6 py-2">
        <div className="relative flex h-52 items-center justify-center">
          <div className="h-full w-full max-w-[200px]">
            <Doughnut data={data} options={options} />
          </div>
          <div className="pointer-events-none absolute flex flex-col items-center justify-center text-center">
            <span className="text-2xl font-extrabold text-ink dark:text-snow-1 tabular-nums font-mono">
              {tracesStats.totalTraces}
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-ink-3 dark:text-snow-3 font-narrow">
              Parcours
            </span>
          </div>
        </div>

        <div className="space-y-1.5 min-w-0">
          {tracesStats.directionDistribution.map((d, idx) => (
            <div
              key={d.direction}
              className="flex items-center justify-between gap-3 rounded-md border border-line dark:border-night-line bg-paper-2/70 dark:bg-night-3/60 px-3 py-2 text-xs"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className="h-2.5 w-2.5 rounded-full shrink-0"
                  style={{
                    backgroundColor:
                      ['#d63535', '#2e7d45', '#1f6fbf', '#e8962a', '#b0703b', '#5c6069'][
                        idx % 6
                      ],
                  }}
                />
                <span className="font-semibold text-ink dark:text-snow-1 truncate">{d.direction}</span>
              </div>
              <span className="font-extrabold text-ink dark:text-snow-1 tabular-nums font-mono shrink-0">
                {d.count} <span className="font-normal font-sans text-ink-3 dark:text-snow-3 text-[11px]">parcours</span>
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
        backgroundColor: '#2e7d45',
        borderRadius: 4,
        maxBarThickness: 24,
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
          color: '#5c6069',
          font: { family: 'Archivo', size: 12 },
          stepSize: 1,
        },
      },
      y: {
        grid: { display: false },
        ticks: {
          color: '#5c6069',
          font: { family: 'Archivo', size: 12, weight: 'bold' as const },
        },
      },
    },
  };

  return (
    <div className="rounded-md border border-line dark:border-night-line bg-paper dark:bg-night-2 p-5 sm:p-6">
      <div className="border-b border-line dark:border-night-line pb-3 mb-4">
        <h3 className="font-extrabold uppercase tracking-tight text-ink dark:text-snow-1 font-semiwide">
          Tracés Plébiscités par le Club
        </h3>
        <p className="text-xs text-ink-3 dark:text-snow-3">
          Parcours ayant recueilli le plus de votes lors des sorties du samedi
        </p>
      </div>

      {popular.length > 0 ? (
        <div className="h-60 w-full">
          <Bar data={data} options={options} />
        </div>
      ) : (
        <div className="flex h-48 items-center justify-center text-xs text-ink-3 dark:text-snow-3">
          Aucun vote enregistré pour cette saison
        </div>
      )}
    </div>
  );
}
