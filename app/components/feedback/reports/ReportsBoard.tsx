'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowPathIcon, ExclamationTriangleIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { cn } from '@/app/utils/cn';
import type { FeedbackReport } from '@/app/lib/feedback/reports';
import {
  CATEGORY_LABELS,
  PRIORITY_LABELS,
  STATUS_LABELS,
  type FeedbackCategory,
  type FeedbackPriority,
} from '@/app/lib/feedback/labels';
import { FEEDBACK_CATEGORIES, FEEDBACK_PRIORITIES } from '@/app/lib/feedback/schema';
import { DEFAULT_FILTERS, countByStatus, filterReports, type Filters, type Tab } from './filters';
import ReportCard from './ReportCard';
import ReportDialog from './ReportDialog';

const TABS: { id: Tab; label: string }[] = [
  { id: 'open', label: STATUS_LABELS.open },
  { id: 'resolved', label: STATUS_LABELS.resolved },
  { id: 'dismissed', label: STATUS_LABELS.dismissed },
  { id: 'all', label: 'Tous' },
];

const EMPTY: Record<Tab, { title: string; hint: string }> = {
  open: { title: 'Rien à traiter pour le moment.', hint: 'Les nouveaux retours apparaîtront ici dès qu’un utilisateur en enverra un.' },
  resolved: { title: 'Aucun retour résolu.', hint: 'Les retours marqués « résolu » seront classés ici.' },
  dismissed: { title: 'Aucun retour écarté.', hint: 'Les retours que vous décidez de ne pas traiter seront classés ici.' },
  all: { title: 'Aucun retour reçu.', hint: 'Activez l’outil dans Paramètres pour que les utilisateurs puissent envoyer des retours.' },
};

const REFRESH_AFTER_MS = 30_000;
const selectClass =
  'rounded-sm border border-line bg-white px-2.5 py-2 text-xs font-semibold text-ink focus-visible:outline-2 focus-visible:outline-brand dark:border-night-line dark:bg-night-2 dark:text-snow';

/** Triage board for feedback reports: tabs with counts, search, filters, cards and a detail dialog. */
export default function ReportsBoard(): React.ReactElement {
  const [reports, setReports] = useState<FeedbackReport[] | null>(null);
  const [error, setError] = useState<{ status: number; message: string } | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [selected, setSelected] = useState<number | null>(null);
  const [lastLoad, setLastLoad] = useState(0);

  const load = useCallback(async (): Promise<void> => {
    setRefreshing(true);
    try {
      const res = await fetch('/api/feedback/reports', { credentials: 'same-origin' });
      const data = (await res.json().catch(() => ({}))) as { reports?: FeedbackReport[]; error?: string };
      if (!res.ok || !data.reports) {
        setError({ status: res.status, message: data.error ?? 'Impossible de charger les retours.' });
        return;
      }
      setReports(data.reports);
      setError(null);
      setLastLoad(Date.now());
    } catch {
      setError({ status: 0, message: 'Impossible de charger les retours.' });
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial data fetch on mount
    load();
  }, [load]);

  // Coming back to the tab refreshes the list, so triage never works on stale data.
  useEffect(() => {
    const onFocus = (): void => {
      if (Date.now() - lastLoad > REFRESH_AFTER_MS) load();
    };
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [lastLoad, load]);

  const visible = useMemo(() => filterReports(reports ?? [], filters), [reports, filters]);
  const counts = useMemo(() => countByStatus(reports ?? []), [reports]);
  const selectedIndex = selected === null ? -1 : visible.findIndex((r) => r.number === selected);
  const selectedReport = reports?.find((r) => r.number === selected) ?? null;

  const patch = (p: Partial<Filters>): void => setFilters((f) => ({ ...f, ...p }));

  const onUpdated = (updated: FeedbackReport): void => {
    const previous = reports?.find((r) => r.number === updated.number);
    // Merge: a report returned by a GitHub action carries no votes, so keep the ones already loaded.
    setReports((list) => list?.map((r) => (r.number === updated.number ? { ...r, ...updated } : r)) ?? list);
    // Triage flow: once a report leaves the current tab, jump to the next one instead of closing the dialog.
    if (previous && previous.status !== updated.status && filters.tab !== 'all' && filters.tab !== updated.status) {
      const next = visible[selectedIndex + 1] ?? visible[selectedIndex - 1];
      setSelected(next ? next.number : null);
    }
  };

  const navigate = (direction: -1 | 1): void => {
    const next = visible[selectedIndex + direction];
    if (next) setSelected(next.number);
  };

  const filtersActive = filters.query || filters.category !== 'all' || filters.priority !== 'all';

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Statut des retours">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            aria-pressed={filters.tab === t.id}
            onClick={() => patch({ tab: t.id })}
            className={cn(
              'inline-flex items-center gap-2 rounded-sm border px-3.5 py-2 text-xs font-bold uppercase tracking-wider focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand',
              filters.tab === t.id
                ? 'border-brand bg-brand text-white'
                : 'border-line bg-white text-ink hover:border-brand dark:border-night-line dark:bg-night-2 dark:text-snow'
            )}
          >
            {t.label}
            <span
              className={cn(
                'rounded-full px-1.5 py-px text-[11px] tabular-nums',
                filters.tab === t.id ? 'bg-white/20' : 'bg-paper-2 dark:bg-night'
              )}
            >
              {counts[t.id]}
            </span>
          </button>
        ))}
        <button
          type="button"
          onClick={() => load()}
          disabled={refreshing}
          className="ml-auto inline-flex items-center gap-1.5 rounded-sm border border-line px-3 py-2 text-xs font-semibold text-ink-2 hover:border-brand disabled:opacity-60 dark:border-night-line dark:text-snow-2"
        >
          <ArrowPathIcon className={cn('h-4 w-4', refreshing && 'animate-spin')} aria-hidden="true" />
          Actualiser
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <label className="relative min-w-[14rem] flex-1">
          <span className="sr-only">Rechercher un retour</span>
          <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-3" aria-hidden="true" />
          <input
            type="search"
            value={filters.query}
            onChange={(e) => patch({ query: e.target.value })}
            placeholder="Rechercher : titre, page, auteur, #numéro…"
            className="w-full rounded-sm border border-line bg-white py-2 pl-9 pr-3 text-sm focus-visible:outline-2 focus-visible:outline-brand dark:border-night-line dark:bg-night-2"
          />
        </label>
        <label>
          <span className="sr-only">Type</span>
          <select value={filters.category} onChange={(e) => patch({ category: e.target.value as 'all' | FeedbackCategory })} className={selectClass}>
            <option value="all">Tous les types</option>
            {FEEDBACK_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {CATEGORY_LABELS[c]}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="sr-only">Priorité</span>
          <select value={filters.priority} onChange={(e) => patch({ priority: e.target.value as 'all' | FeedbackPriority })} className={selectClass}>
            <option value="all">Toutes les priorités</option>
            {FEEDBACK_PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {PRIORITY_LABELS[p]}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="sr-only">Tri</span>
          <select value={filters.sort} onChange={(e) => patch({ sort: e.target.value as Filters['sort'] })} className={selectClass}>
            <option value="recent">Plus récents</option>
            <option value="priority">Plus urgents d’abord</option>
            <option value="votes">Plus votés</option>
          </select>
        </label>
      </div>

      {error && (
        <div role="alert" className="flex flex-wrap items-center gap-3 rounded-sm border border-brand/40 bg-brand/5 p-4 text-sm">
          <ExclamationTriangleIcon className="h-5 w-5 shrink-0 text-brand" aria-hidden="true" />
          <p className="flex-1 font-semibold text-brand">
            {error.status === 403 ? 'Cette page est réservée aux responsables et administrateurs.' : error.message}
          </p>
          {error.status !== 403 && (
            <button type="button" onClick={() => load()} className="rounded-sm border border-brand px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-brand">
              Réessayer
            </button>
          )}
        </div>
      )}

      {reports === null && !error && (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3" aria-busy="true" aria-label="Chargement des retours">
          {Array.from({ length: 6 }, (_, i) => (
            <li key={i} className="h-64 animate-pulse rounded-sm border border-line bg-paper-2 dark:border-night-line dark:bg-night-2" />
          ))}
        </ul>
      )}

      {reports && visible.length === 0 && (
        <div className="rounded-sm border border-dashed border-line p-10 text-center dark:border-night-line">
          <p className="font-bold">{filtersActive ? 'Aucun retour ne correspond à ces filtres.' : EMPTY[filters.tab].title}</p>
          <p className="mt-1 text-sm text-ink-3 dark:text-snow-3">
            {filtersActive ? 'Essayez d’élargir la recherche ou de changer d’onglet.' : EMPTY[filters.tab].hint}
          </p>
          {filtersActive && (
            <button
              type="button"
              onClick={() => patch({ query: '', category: 'all', priority: 'all' })}
              className="mt-4 rounded-sm border border-line px-3 py-1.5 text-xs font-bold uppercase tracking-wider dark:border-night-line"
            >
              Effacer les filtres
            </button>
          )}
        </div>
      )}

      {visible.length > 0 && (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {visible.map((r) => (
            <ReportCard key={r.number} report={r} onOpen={setSelected} />
          ))}
        </ul>
      )}

      {selectedReport && (
        <ReportDialog
          key={selectedReport.number}
          report={selectedReport}
          position={{ index: Math.max(selectedIndex, 0), total: Math.max(visible.length, 1) }}
          onClose={() => setSelected(null)}
          onNavigate={navigate}
          onUpdated={onUpdated}
        />
      )}
    </div>
  );
}
