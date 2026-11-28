'use client';

import React, { useEffect, useRef } from 'react';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useGroupLabels } from '@/app/context/GroupLabelsContext';
import type { CatalogTraceOption } from '@/app/lib/event-trace';
import {
  MAX_RIDE_TRACES,
  RIDE_TRACE_LABEL_MAX,
  emptyRideTraceRow,
  traceLabelSuggestions,
  type RideTraceRow,
} from '@/app/lib/ride-traces';
import { traceOptionLabel, useTraceLinks, type TraceLinksStatus } from './useTraceLinks';

/** One trace of a ride in the event forms: what a group or a distance rides. */
export type EventTraceValue = RideTraceRow;

interface EventTraceFieldsProps {
  /** The ride's traces, main trace first (at least one row). */
  value: EventTraceValue[];
  onChange: (next: EventTraceValue[]) => void;
  /** The ride's announced distances ("65-85-105"): offered as trace labels. */
  distances?: string;
}

const fieldClass =
  'w-full rounded-sm border border-line dark:border-night-line bg-paper-2 dark:bg-night px-4 py-2 text-sm text-ink dark:text-snow focus:border-brand focus:outline-hidden transition-colors duration-150';

const LABEL_SUGGESTIONS_ID = 'trace-label-suggestions';

interface TraceRowProps {
  index: number;
  row: EventTraceValue;
  /** Several rows: each one shows its label field and a remove button. */
  several: boolean;
  status: TraceLinksStatus;
  traces: CatalogTraceOption[];
  onChange: (row: EventTraceValue) => void;
  onRemove: () => void;
}

/**
 * One trace: a trace of the catalogue, whose link the server copies into the ride (#255), or a
 * link typed by hand (Garmin, Strava, Komoot, .gpx file). Row 0 keeps the historical ids.
 */
function TraceRow({ index, row, several, status, traces, onChange, onRemove }: TraceRowProps): React.ReactElement {
  const suffix = index === 0 ? '' : `-${index}`;
  const linked = row.traceId ? traces.find((t) => t.id === row.traceId) : undefined;
  const showLabel = several || row.label !== '';

  const pickTrace = (traceId: string): void => {
    const trace = traces.find((t) => t.id === traceId);
    // Back to "typed by hand": the field starts empty rather than keeping the trace's link.
    onChange(trace ? { ...row, traceId: trace.id, gpxUrl: trace.link } : { ...row, traceId: '', gpxUrl: '' });
  };

  const catalogHint =
    status === 'loading'
      ? 'Chargement du catalogue…'
      : status === 'ready'
        ? 'La sortie prend le lien GPX de la trace choisie. « Aucune » pour saisir un lien à la main.'
        : 'Catalogue indisponible : saisissez le lien à la main.';

  const fields = (
    <>
      {showLabel && (
        <div className="md:col-span-2">
          <label htmlFor={`traceLabel${suffix}`} className="mb-2 block text-sm font-medium text-ink dark:text-snow">
            Groupe ou distance
          </label>
          <input
            type="text"
            id={`traceLabel${suffix}`}
            name={`traces[${index}][label]`}
            value={row.label}
            maxLength={RIDE_TRACE_LABEL_MAX}
            list={LABEL_SUGGESTIONS_ID}
            onChange={(e) => onChange({ ...row, label: e.target.value })}
            aria-describedby={`traceLabel${suffix}-hint`}
            className={fieldClass}
            placeholder="ex. GR1 · 110 km, Petit parcours · 60 km"
          />
          <p id={`traceLabel${suffix}-hint`} className="mt-1 text-xs text-ink-3 dark:text-snow-3">
            Ce que les membres lisent à côté du bouton de téléchargement.
          </p>
        </div>
      )}

      {/* Catalog trace */}
      <div className="md:col-span-2">
        <label htmlFor={`traceId${suffix}`} className="mb-2 block text-sm font-medium text-ink dark:text-snow">
          Trace du catalogue
        </label>
        <select
          id={`traceId${suffix}`}
          name={`traces[${index}][traceId]`}
          value={row.traceId}
          onChange={(e) => pickTrace(e.target.value)}
          disabled={status !== 'ready'}
          aria-describedby={`traceId${suffix}-hint`}
          className={`${fieldClass} disabled:opacity-60`}
        >
          <option value="">Aucune (lien saisi à la main)</option>
          {row.traceId && !linked && (
            // Linked trace no longer in the catalogue (deleted or without link): keep it selectable.
            <option value={row.traceId}>Trace liée absente du catalogue</option>
          )}
          {traces.map((trace) => (
            <option key={trace.id} value={trace.id}>
              {traceOptionLabel(trace)}
            </option>
          ))}
        </select>
        <p id={`traceId${suffix}-hint`} className="mt-1 text-xs text-ink-3 dark:text-snow-3" aria-live="polite">
          {catalogHint}
        </p>
      </div>

      {/* GPX / Garmin / Strava trace link */}
      <div className="md:col-span-2">
        <label htmlFor={`gpxUrl${suffix}`} className="mb-2 block text-sm font-medium text-ink dark:text-snow">
          Lien de la trace / GPX (Garmin, Strava, Komoot ou URL de fichier .gpx)
        </label>
        <input
          type="url"
          id={`gpxUrl${suffix}`}
          name={`traces[${index}][gpxUrl]`}
          value={row.gpxUrl}
          // Unlocked when the catalogue cannot load, so a linked ride can still be fixed by hand.
          readOnly={Boolean(row.traceId) && status !== 'error'}
          onChange={(e) => onChange({ ...row, traceId: '', gpxUrl: e.target.value })}
          aria-describedby={`gpxUrl${suffix}-hint`}
          autoCorrect="off"
          autoCapitalize="none"
          spellCheck={false}
          className={`${fieldClass} font-mono read-only:text-ink-3 dark:read-only:text-snow-3`}
          placeholder="https://connect.garmin.com/modern/course/... ou https://www.strava.com/routes/..."
        />
        <p id={`gpxUrl${suffix}-hint`} className="mt-1 text-xs text-ink-3 dark:text-snow-3">
          {row.traceId
            ? 'Lien repris de la trace du catalogue. Choisissez « Aucune » pour le modifier.'
            : 'Ce lien sera accessible aux membres sur le calendrier, le sondage et le bloc « Prochain Rendez-vous » pour télécharger ou visualiser la trace.'}
        </p>
      </div>
    </>
  );

  if (!several) return fields;

  return (
    <fieldset className="md:col-span-2 grid gap-4 md:grid-cols-2 rounded-sm border border-line dark:border-night-line p-4">
      <legend className="px-1 font-narrow text-xs font-bold uppercase tracking-[0.1em] text-ink-2 dark:text-snow-2">
        Trace {index + 1}
        {index === 0 ? ' · principale' : ''}
      </legend>
      {fields}
      <div className="md:col-span-2 flex justify-end">
        <button
          type="button"
          onClick={onRemove}
          className="inline-flex min-h-[44px] items-center gap-1.5 rounded-sm px-3 text-xs font-semibold text-brand hover:bg-brand/10 transition-colors duration-150"
        >
          <TrashIcon className="h-4 w-4" aria-hidden="true" />
          Retirer la trace {index + 1}
        </button>
      </div>
    </fieldset>
  );
}

/**
 * Traces of a ride in the event forms: one per group or distance, like FFBC rides (the first
 * one is the main trace every single-trace reader shows). A ride with one trace looks as before.
 */
export default function EventTraceFields({ value, onChange, distances }: EventTraceFieldsProps): React.ReactElement {
  const { status, traces } = useTraceLinks();
  const { settings } = useGroupLabels();
  const rows = value.length > 0 ? value : [emptyRideTraceRow()];
  const several = rows.length > 1;
  const suggestions = traceLabelSuggestions(
    settings.groups.map((g) => g.label),
    distances
  );

  // Keyboard focus follows the list: a new row's first field, or "Ajouter" after a removal.
  // Set by add/remove, applied once the parent has rendered the new list.
  const addButton = useRef<HTMLButtonElement>(null);
  const pendingFocus = useRef<number | 'add' | null>(null);
  useEffect(() => {
    const target = pendingFocus.current;
    if (target === null) return;
    pendingFocus.current = null;
    if (target === 'add') addButton.current?.focus();
    else document.getElementById(`traceLabel${target === 0 ? '' : `-${target}`}`)?.focus();
  });

  const update = (index: number, row: EventTraceValue): void =>
    onChange(rows.map((r, i) => (i === index ? row : r)));
  const remove = (index: number): void => {
    const next = rows.filter((_, i) => i !== index);
    onChange(next.length > 0 ? next : [emptyRideTraceRow()]);
    pendingFocus.current = 'add';
  };
  const add = (): void => {
    onChange([...rows, emptyRideTraceRow()]);
    pendingFocus.current = rows.length;
  };

  return (
    <>
      {rows.map((row, index) => (
        <TraceRow
          key={index}
          index={index}
          row={row}
          several={several}
          status={status}
          traces={traces}
          onChange={(next) => update(index, next)}
          onRemove={() => remove(index)}
        />
      ))}

      <datalist id={LABEL_SUGGESTIONS_ID}>
        {suggestions.map((s) => (
          <option key={s} value={s} />
        ))}
      </datalist>

      <div className="md:col-span-2">
        <button
          ref={addButton}
          type="button"
          onClick={add}
          disabled={rows.length >= MAX_RIDE_TRACES}
          className="inline-flex min-h-[44px] items-center gap-1.5 rounded-sm border border-dashed border-line-strong dark:border-night-line px-4 py-2 text-xs font-semibold text-ink dark:text-snow hover:border-brand hover:text-brand disabled:opacity-50 disabled:hover:border-line-strong disabled:hover:text-ink transition-colors duration-150"
        >
          <PlusIcon className="h-4 w-4" aria-hidden="true" />
          Ajouter une trace (autre groupe ou distance)
        </button>
        <p className="mt-1 text-xs text-ink-3 dark:text-snow-3">
          {rows.length >= MAX_RIDE_TRACES
            ? `${MAX_RIDE_TRACES} traces au plus par sortie.`
            : 'Une trace par groupe ou par distance, comme les sorties FFBC. Nommez chacune (« GR1 », « 110 km »).'}
        </p>
      </div>
    </>
  );
}
