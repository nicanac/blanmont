'use client';

import React, { useMemo } from 'react';
import {
  ChartBarIcon,
  ClockIcon,
  ArrowDownTrayIcon,
  CalendarDaysIcon,
  GlobeAltIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';
import { ActivityLog, ActivityStats, LogCategory, LogSeverity } from '@/app/types/logging';

interface Props {
  logs: ActivityLog[];
  stats?: ActivityStats | null;
}

export default function ReviewAnalyticsTab({ logs, stats }: Props): React.ReactElement {
  // Aggregate daily activity timeline
  const dailyDistribution = useMemo(() => {
    const daysMap = new Map<string, number>();

    // Seed the last 14 days
    const now = new Date();
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(5, 10); // MM-DD
      daysMap.set(key, 0);
    }

    // Populate counts
    for (const log of logs) {
      const key = log.timestamp.slice(5, 10);
      if (daysMap.has(key)) {
        daysMap.set(key, (daysMap.get(key) || 0) + 1);
      }
    }

    const maxCount = Math.max(...Array.from(daysMap.values()), 1);

    return Array.from(daysMap.entries()).map(([date, count]) => ({
      date,
      count,
      pct: Math.round((count / maxCount) * 100),
    }));
  }, [logs]);

  // Aggregate hourly peak distribution
  const hourlyDistribution = useMemo(() => {
    let matin = 0;      // 06h - 12h
    let apresMidi = 0;  // 12h - 18h
    let soiree = 0;     // 18h - 24h
    let nuit = 0;       // 00h - 06h

    for (const log of logs) {
      const hour = new Date(log.timestamp).getHours();
      if (hour >= 6 && hour < 12) matin++;
      else if (hour >= 12 && hour < 18) apresMidi++;
      else if (hour >= 18 && hour < 24) soiree++;
      else nuit++;
    }

    const total = logs.length || 1;
    return [
      { label: 'Matin (06h - 12h)', count: matin, pct: Math.round((matin / total) * 100), color: 'bg-hydro' },
      { label: 'Après-midi (12h - 18h)', count: apresMidi, pct: Math.round((apresMidi / total) * 100), color: 'bg-vert' },
      { label: 'Soirée (18h - 24h)', count: soiree, pct: Math.round((soiree / total) * 100), color: 'bg-ambre' },
      { label: 'Nuit (00h - 06h)', count: nuit, pct: Math.round((nuit / total) * 100), color: 'bg-bistre' },
    ];
  }, [logs]);

  // Aggregate Weekend vs Weekday distribution
  const weekendVsWeekday = useMemo(() => {
    let weekend = 0;
    let weekday = 0;

    for (const log of logs) {
      const day = new Date(log.timestamp).getDay(); // 0 is Sunday, 6 is Saturday
      if (day === 0 || day === 6) weekend++;
      else weekday++;
    }

    const total = logs.length || 1;
    return {
      weekend: { count: weekend, pct: Math.round((weekend / total) * 100) },
      weekday: { count: weekday, pct: Math.round((weekday / total) * 100) },
    };
  }, [logs]);

  // Top GPX Downloads and Route Views
  const topGpxRoutes = useMemo(() => {
    const routeMap = new Map<string, { title: string; count: number }>();

    for (const log of logs) {
      if (log.action === 'traces:gpx_download' || (log.category === 'navigation' && log.context.path?.startsWith('/traces/'))) {
        const rawTitle = (log.metadata?.traceName as string) || log.title.replace(/^Téléchargement GPX : /, '').replace(/^Consultation trace : /, '');
        const key = rawTitle || log.context.path || 'Trace Blanmont';
        const existing = routeMap.get(key) || { title: key, count: 0 };
        existing.count++;
        routeMap.set(key, existing);
      }
    }

    return Array.from(routeMap.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [logs]);

  // Category breakdown
  const categoryStats = useMemo(() => {
    const cats: Record<LogCategory, number> = {
      auth: 0,
      navigation: 0,
      participation: 0,
      admin: 0,
      security: 0,
    };

    for (const log of logs) {
      if (cats[log.category] !== undefined) {
        cats[log.category]++;
      }
    }

    const total = logs.length || 1;
    return [
      { id: 'navigation', label: 'Navigation & GPX', count: cats.navigation, pct: Math.round((cats.navigation / total) * 100), color: 'bg-hydro' },
      { id: 'participation', label: 'Sorties & Votes', count: cats.participation, pct: Math.round((cats.participation / total) * 100), color: 'bg-vert' },
      { id: 'auth', label: 'Authentification', count: cats.auth, pct: Math.round((cats.auth / total) * 100), color: 'bg-ambre' },
      { id: 'admin', label: 'Administration', count: cats.admin, pct: Math.round((cats.admin / total) * 100), color: 'bg-bistre' },
      { id: 'security', label: 'Sécurité & Alertes', count: cats.security, pct: Math.round((cats.security / total) * 100), color: 'bg-brand' },
    ];
  }, [logs]);

  return (
    <div className="space-y-6">
      {/* 14-Day Activity Histogram */}
      <div className="p-4 rounded-lg bg-paper-2 dark:bg-night-2 border border-line dark:border-night-line">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <ChartBarIcon className="w-5 h-5 text-brand" />
            <h3 className="font-wide font-extrabold uppercase text-sm text-ink dark:text-white">
              Fréquentation Quotidienne (14 derniers jours)
            </h3>
          </div>
          <span className="text-xs font-mono tabular-nums text-ink-3 dark:text-snow-3">
            Total : {logs.length} événements
          </span>
        </div>

        {/* Histogram Bars */}
        <div className="h-44 flex items-end justify-between gap-1 sm:gap-2 pt-6 pb-2 border-b border-line dark:border-night-line">
          {dailyDistribution.map((d) => (
            <div key={d.date} className="flex-1 flex flex-col items-center h-full justify-end group">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-mono tabular-nums text-ink-2 dark:text-snow-2 mb-1">
                {d.count}
              </div>
              <div
                className="w-full max-w-[28px] rounded-t-xs bg-vert/80 hover:bg-vert transition-all cursor-pointer relative"
                style={{ height: `${Math.max(d.pct, 4)}%` }}
                title={`${d.date} : ${d.count} événements`}
              />
              <span className="text-[10px] font-mono text-ink-4 dark:text-snow-4 mt-2 -rotate-45 sm:rotate-0 origin-top">
                {d.date}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Grid of Peak Hours & Weekend Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Hourly Peaks */}
        <div className="p-4 rounded-lg bg-paper dark:bg-night border border-line dark:border-night-line space-y-3">
          <div className="flex items-center gap-2 mb-2">
            <ClockIcon className="w-4 h-4 text-hydro" />
            <h4 className="font-narrow font-bold uppercase tracking-wider text-xs text-ink dark:text-white">
              Créneaux Horaires de Consultation
            </h4>
          </div>

          <div className="space-y-2.5">
            {hourlyDistribution.map((slot) => (
              <div key={slot.label} className="space-y-1">
                <div className="flex justify-between text-xs font-sans">
                  <span className="text-ink-2 dark:text-snow-2">{slot.label}</span>
                  <span className="font-mono tabular-nums font-semibold text-ink dark:text-white">
                    {slot.count} ({slot.pct}%)
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-black/5 dark:bg-white/5 overflow-hidden">
                  <div className={`h-full ${slot.color} rounded-full`} style={{ width: `${slot.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Weekend vs Weekday Distribution */}
        <div className="p-4 rounded-lg bg-paper dark:bg-night border border-line dark:border-night-line space-y-3">
          <div className="flex items-center gap-2 mb-2">
            <CalendarDaysIcon className="w-4 h-4 text-bistre" />
            <h4 className="font-narrow font-bold uppercase tracking-wider text-xs text-ink dark:text-white">
              Répartition Week-end vs Semaine
            </h4>
          </div>

          <div className="space-y-3 pt-2">
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-sans">
                <span className="font-semibold text-ink dark:text-white">🚴 Week-end (Samedi &amp; Dimanche)</span>
                <span className="font-mono tabular-nums font-bold text-vert">
                  {weekendVsWeekday.weekend.count} ({weekendVsWeekday.weekend.pct}%)
                </span>
              </div>
              <div className="h-2.5 w-full rounded-full bg-black/5 dark:bg-white/5 overflow-hidden">
                <div
                  className="h-full bg-vert rounded-full"
                  style={{ width: `${weekendVsWeekday.weekend.pct}%` }}
                />
              </div>
              <p className="text-[11px] text-ink-3 dark:text-snow-3 font-sans">
                Concentration des préparatifs de sorties et des votes de parcours.
              </p>
            </div>

            <div className="space-y-1 pt-1">
              <div className="flex justify-between text-xs font-sans">
                <span className="font-semibold text-ink dark:text-white">💼 Semaine (Lundi au Vendredi)</span>
                <span className="font-mono tabular-nums font-bold text-hydro">
                  {weekendVsWeekday.weekday.count} ({weekendVsWeekday.weekday.pct}%)
                </span>
              </div>
              <div className="h-2.5 w-full rounded-full bg-black/5 dark:bg-white/5 overflow-hidden">
                <div
                  className="h-full bg-hydro rounded-full"
                  style={{ width: `${weekendVsWeekday.weekday.pct}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Leaderboard of Top GPX Downloads & Category Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Top GPX Downloads */}
        <div className="p-4 rounded-lg bg-paper dark:bg-night border border-line dark:border-night-line space-y-3">
          <div className="flex items-center gap-2 mb-2">
            <ArrowDownTrayIcon className="w-4 h-4 text-vert" />
            <h4 className="font-narrow font-bold uppercase tracking-wider text-xs text-ink dark:text-white">
              Palmarès Traces &amp; Téléchargements GPX
            </h4>
          </div>

          {topGpxRoutes.length === 0 ? (
            <p className="text-xs text-ink-3 dark:text-snow-3 italic py-4 text-center">
              Aucun téléchargement GPX enregistré dans la période sélectionnée.
            </p>
          ) : (
            <div className="space-y-2">
              {topGpxRoutes.map((route, idx) => (
                <div
                  key={route.title}
                  className="flex items-center justify-between p-2 rounded-md bg-paper-2 dark:bg-night-2 border border-line/60 dark:border-night-line/60 text-xs"
                >
                  <div className="flex items-center gap-2 truncate pr-2">
                    <span className="w-5 h-5 rounded-full bg-vert/15 text-vert font-mono font-bold text-[10px] flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <span className="font-medium text-ink dark:text-snow truncate">
                      {route.title}
                    </span>
                  </div>
                  <span className="font-mono tabular-nums font-bold text-ink dark:text-white shrink-0">
                    {route.count} DL
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Category Breakdown */}
        <div className="p-4 rounded-lg bg-paper dark:bg-night border border-line dark:border-night-line space-y-3">
          <div className="flex items-center gap-2 mb-2">
            <GlobeAltIcon className="w-4 h-4 text-ambre" />
            <h4 className="font-narrow font-bold uppercase tracking-wider text-xs text-ink dark:text-white">
              Ventilation par Typologie d'Activité
            </h4>
          </div>

          <div className="space-y-2.5">
            {categoryStats.map((c) => (
              <div key={c.id} className="space-y-1">
                <div className="flex justify-between text-xs font-sans">
                  <span className="text-ink-2 dark:text-snow-2">{c.label}</span>
                  <span className="font-mono tabular-nums font-semibold text-ink dark:text-white">
                    {c.count} ({c.pct}%)
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-black/5 dark:bg-white/5 overflow-hidden">
                  <div className={`h-full ${c.color} rounded-full`} style={{ width: `${c.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
