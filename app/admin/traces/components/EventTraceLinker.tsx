'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { ArrowPathIcon, CalendarDaysIcon, LinkIcon } from '@heroicons/react/24/outline';
import { Spinner } from '@/app/components/ui/Spinner';
import { formatFrenchDate } from '@/app/utils/date';
import type { CatalogTraceOption, EventTraceRow } from '@/app/lib/event-trace';
import type { BackfillReport } from '@/app/lib/event-trace-catalog';
import { traceOptionLabel, useTraceLinks } from '../../events/components/useTraceLinks';

/** Rides listed before "show all": about two months of weekends. */
const FIRST_ROWS = 8;

const selectClass =
  'w-full min-h-[44px] rounded-sm border border-line dark:border-night-line bg-paper-2 dark:bg-night px-3 py-2 text-sm text-ink dark:text-snow focus:border-brand focus:outline-hidden transition-colors duration-150';

/** What the ride follows now, in words. */
function currentTraceText(row: EventTraceRow, traces: CatalogTraceOption[]): string {
  if (row.traceId) {
    const trace = traces.find((t) => t.id === row.traceId);
    return trace ? trace.name : 'Trace liée absente du catalogue';
  }
  return row.gpxUrl ? 'Lien saisi à la main' : 'Aucune trace';
}

interface RowProps {
  row: EventTraceRow;
  traces: CatalogTraceOption[];
  onSaved: (row: EventTraceRow) => void;
}

/** One upcoming ride: pick a catalog trace, then link (or unlink) it explicitly. */
function EventTraceRowForm({ row, traces, onSaved }: RowProps): React.ReactElement {
  const [selected, setSelected] = useState(row.traceId ?? '');
  const [saving, setSaving] = useState(false);
  const current = row.traceId ?? '';
  const unchanged = selected === current;
  const date = formatFrenchDate(row.isoDate);
  const headingId = `ride-${row.id}-title`;
  const selectId = `ride-${row.id}-trace`;

  const submit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (unchanged || saving) return;
    setSaving(true);
    const trace = traces.find((t) => t.id === selected);
    try {
      const res = await fetch(`/api/admin/events/${encodeURIComponent(row.id)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        // Unlinking also removes the trace's link from the ride.
        body: JSON.stringify(trace ? { traceId: trace.id } : { traceId: '', gpxUrl: '' }),
      });
      if (!res.ok) {
        const body = [400, 404, 422].includes(res.status) ? await res.json().catch(() => null) : null;
        toast.error(body?.error || "Impossible d'enregistrer la trace de cette sortie");
        return;
      }
      if (trace) {
        onSaved({ ...row, traceId: trace.id, gpxUrl: trace.link });
        toast.success(`« ${trace.name} » liée à la sortie du ${date}`);
      } else {
        onSaved({ ...row, traceId: undefined, gpxUrl: undefined });
        toast.success(`Trace retirée de la sortie du ${date}`);
      }
    } catch (error) {
      console.error('Error linking trace:', error);
      toast.error("Impossible d'enregistrer la trace de cette sortie");
    } finally {
      setSaving(false);
    }
  };

  return (
    <li>
      <form
        onSubmit={submit}
        aria-labelledby={headingId}
        className="grid gap-3 p-5 sm:px-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)_auto] md:items-end"
      >
        <div className="min-w-0 space-y-1">
          <p id={headingId} className="flex flex-wrap items-center gap-2">
            <span className="font-bold text-sm text-ink dark:text-snow font-semiwide tabular-nums">
              {date}
            </span>
            {row.group && (
              <span className="rounded-full bg-paper-2 dark:bg-night border border-line dark:border-night-line px-2.5 py-0.5 text-xs font-semibold text-ink-3 dark:text-snow-3">
                {row.group}
              </span>
            )}
          </p>
          <p className="truncate text-sm text-ink-2 dark:text-snow-2">{row.location || 'Lieu à préciser'}</p>
          <p className="text-xs text-ink-3 dark:text-snow-3">
            Actuellement : <span className="font-semibold">{currentTraceText(row, traces)}</span>
          </p>
        </div>

        <div className="min-w-0">
          <label
            htmlFor={selectId}
            className="mb-1 block font-narrow text-xs font-bold uppercase tracking-[0.06em] text-ink-3 dark:text-snow-3"
          >
            Trace du catalogue
          </label>
          <select
            id={selectId}
            name="traceId"
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
            className={selectClass}
          >
            <option value="">Aucune trace du catalogue</option>
            {row.traceId && !traces.some((t) => t.id === row.traceId) && (
              <option value={row.traceId}>Trace liée absente du catalogue</option>
            )}
            {traces.map((trace) => (
              <option key={trace.id} value={trace.id}>
                {traceOptionLabel(trace)}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          disabled={unchanged || saving}
          className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-sm bg-brand px-5 py-2 text-xs font-semibold uppercase tracking-wider text-white transition-colors hover:bg-brand-strong disabled:cursor-not-allowed disabled:opacity-50"
        >
          <LinkIcon className="h-4 w-4" aria-hidden="true" />
          {saving ? 'Enregistrement…' : selected || !current ? 'Lier' : 'Retirer'}
        </button>
      </form>
    </li>
  );
}

/** Calls of the backfill route at most, a few seconds each (a run stops earlier when done). */
const MAX_BACKFILL_CALLS = 40;

const plural = (n: number, word: string): string => `${n} ${word}${n > 1 ? 's' : ''}`;

/**
 * "Traces des sorties → catalogue" (#263): adds to the club catalogue the trace links already
 * typed on calendar rides (past and upcoming) and links each ride to its catalog trace. New
 * links are added when a ride is saved; this button catches up the older ones.
 */
function RideTraceBackfill({ onDone }: { onDone: () => void }): React.ReactElement {
  const [running, setRunning] = useState(false);

  const run = async (): Promise<void> => {
    if (running) return;
    setRunning(true);
    const total = { linked: 0, created: 0, remaining: 0 };
    try {
      for (let call = 0; call < MAX_BACKFILL_CALLS; call++) {
        const res = await fetch('/api/admin/events/trace-catalog', { method: 'POST' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const report = (await res.json()) as BackfillReport;
        total.linked += report.linked;
        total.created += report.created;
        total.remaining = report.remaining;
        // Done, or nothing linked in this call (only rides the catalogue refused are left).
        if (report.remaining === 0 || report.linked === 0) break;
      }
      if (total.linked === 0 && total.remaining === 0) {
        toast.success('Toutes les traces des sorties sont déjà dans le catalogue.');
      } else {
        const summary = `${plural(total.linked, 'sortie')} liée${total.linked > 1 ? 's' : ''} · ${plural(
          total.created,
          'trace'
        )} ajoutée${total.created > 1 ? 's' : ''} au catalogue`;
        if (total.remaining > 0) {
          toast.warning(`${summary} · ${total.remaining} à reprendre : relancez plus tard.`);
        } else {
          toast.success(summary);
        }
      }
      onDone();
    } catch (error) {
      console.error('Error adding ride traces to the catalogue:', error);
      toast.error("Impossible d'ajouter les traces des sorties au catalogue");
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="flex flex-col gap-3 border-b border-line dark:border-night-line px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-xs text-ink-3 dark:text-snow-3 leading-relaxed sm:max-w-[60ch]">
        Un lien saisi sur une sortie rejoint le catalogue public des traces à l&apos;enregistrement.
        Ajoutez aussi les liens des sorties déjà enregistrées, passées et à venir.
      </p>
      <button
        type="button"
        onClick={run}
        disabled={running}
        aria-busy={running}
        className="inline-flex min-h-[44px] shrink-0 items-center justify-center gap-2 rounded-sm border border-line dark:border-night-line bg-paper dark:bg-night-2 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-ink dark:text-white hover:bg-paper-2 dark:hover:bg-night-3 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
      >
        <ArrowPathIcon className={`h-4 w-4 text-brand ${running ? 'animate-spin' : ''}`} aria-hidden="true" />
        {running ? 'Ajout en cours…' : 'Ajouter les traces des sorties au catalogue'}
      </button>
    </div>
  );
}

/**
 * "Lier une trace à une sortie" (#255): links a trace of the catalogue to an upcoming ride of
 * the calendar. The ride then shows the trace everywhere (calendar, poll, next ride), for
 * members only (#252). Needs the Événements & Sorties section: hidden without it.
 */
export default function EventTraceLinker(): React.ReactElement | null {
  const { status, traces, events, reload } = useTraceLinks();
  // Rides saved here since the load, by id: the list shows them over the loaded rows.
  const [saved, setSaved] = useState<Record<string, EventTraceRow>>({});
  const [showAll, setShowAll] = useState(false);

  if (status === 'denied') return null;

  const rows = events.map((e) => saved[e.id] ?? e);
  const visible = showAll ? rows : rows.slice(0, FIRST_ROWS);
  const saveRow = (next: EventTraceRow): void => setSaved((all) => ({ ...all, [next.id]: next }));

  return (
    <section
      id="traces-event-links-section"
      aria-labelledby="traces-event-links-title"
      className="rounded-sm border border-line dark:border-night-line bg-paper dark:bg-night-2 overflow-hidden"
    >
      <div className="border-b border-line dark:border-night-line px-6 py-4 bg-paper-2 dark:bg-night space-y-1">
        <div className="flex items-center justify-between gap-3">
          <h2
            id="traces-event-links-title"
            className="text-xs font-bold uppercase tracking-wider text-ink dark:text-snow font-mono"
          >
            Lier une trace à une sortie
          </h2>
          {status === 'ready' && (
            <span className="text-xs font-semibold text-ink-3 dark:text-snow-3 font-mono tabular-nums">
              {rows.length} sorties à venir
            </span>
          )}
        </div>
        <p className="text-xs text-ink-3 dark:text-snow-3 leading-relaxed">
          Choisissez une trace du catalogue pour une sortie du calendrier : son lien GPX devient la
          trace de la sortie (calendrier, sondage, prochain rendez-vous), visible des membres
          connectés. Elle remplace un lien saisi à la main.
        </p>
      </div>

      {status === 'ready' && (
        <RideTraceBackfill
          onDone={() => {
            // Show the rides as the backfill left them.
            setSaved({});
            reload();
          }}
        />
      )}

      {status === 'loading' && (
        <div className="flex items-center justify-center py-10">
          <Spinner size="md" />
        </div>
      )}

      {status === 'error' && (
        <p className="px-6 py-6 text-sm text-ink-3 dark:text-snow-3" role="alert">
          Impossible de charger le catalogue et le calendrier. Réessayez plus tard.
        </p>
      )}

      {status === 'ready' && rows.length === 0 && (
        <div className="flex flex-col items-start gap-3 px-6 py-6 text-sm text-ink-3 dark:text-snow-3">
          <p>Aucune sortie à venir dans le calendrier.</p>
          <Link
            href="/admin/events/new"
            className="inline-flex min-h-[44px] items-center gap-2 rounded-sm border border-line dark:border-night-line bg-paper dark:bg-night-2 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-ink dark:text-white hover:bg-paper-2 dark:hover:bg-night-3 transition-colors"
          >
            <CalendarDaysIcon className="h-4 w-4 text-brand" aria-hidden="true" />
            Ajouter une sortie
          </Link>
        </div>
      )}

      {status === 'ready' && rows.length > 0 && traces.length === 0 && (
        <p className="border-b border-line dark:border-night-line px-6 py-4 text-sm text-ink-3 dark:text-snow-3">
          Aucune trace du catalogue n&apos;a de fichier GPX ni de lien de carte.
        </p>
      )}

      {status === 'ready' && rows.length > 0 && (
        <>
          <ul className="divide-y divide-line/40 dark:divide-night-line">
            {visible.map((row) => (
              <EventTraceRowForm key={row.id} row={row} traces={traces} onSaved={saveRow} />
            ))}
          </ul>
          {rows.length > FIRST_ROWS && (
            <div className="border-t border-line dark:border-night-line px-6 py-3">
              <button
                type="button"
                onClick={() => setShowAll((v) => !v)}
                aria-expanded={showAll}
                className="min-h-[44px] text-xs font-semibold uppercase tracking-wider text-brand hover:text-brand-strong"
              >
                {showAll ? 'Afficher moins de sorties' : `Afficher les ${rows.length} sorties`}
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}
