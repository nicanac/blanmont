'use client';

import React from 'react';
import { traceOptionLabel, useTraceLinks } from './useTraceLinks';

/** The trace part of an event form: what the ride follows. */
export interface EventTraceValue {
  /** Catalog trace id, '' for a link typed by hand (or none). */
  traceId: string;
  gpxUrl: string;
}

interface EventTraceFieldsProps {
  value: EventTraceValue;
  onChange: (next: EventTraceValue) => void;
}

const fieldClass =
  'w-full rounded-sm border border-line dark:border-night-line bg-paper-2 dark:bg-night px-4 py-2 text-sm text-ink dark:text-snow focus:border-brand focus:outline-hidden transition-colors duration-150';

/**
 * Trace of a ride in the event forms (#255): a trace of the catalogue, whose link the server
 * copies into `gpxUrl`, or a link typed by hand (Garmin, Strava, Komoot, .gpx file).
 */
export default function EventTraceFields({ value, onChange }: EventTraceFieldsProps): React.ReactElement {
  const { status, traces } = useTraceLinks();
  const linked = value.traceId ? traces.find((t) => t.id === value.traceId) : undefined;

  const pickTrace = (traceId: string): void => {
    const trace = traces.find((t) => t.id === traceId);
    // Back to "typed by hand": the field starts empty rather than keeping the trace's link.
    onChange(trace ? { traceId: trace.id, gpxUrl: trace.link } : { traceId: '', gpxUrl: '' });
  };

  const catalogHint =
    status === 'loading'
      ? 'Chargement du catalogue…'
      : status === 'ready'
        ? 'La sortie prend le lien GPX de la trace choisie. « Aucune » pour saisir un lien à la main.'
        : 'Catalogue indisponible : saisissez le lien à la main.';

  return (
    <>
      {/* Catalog trace */}
      <div className="md:col-span-2">
        <label htmlFor="traceId" className="mb-2 block text-sm font-medium text-ink dark:text-snow">
          Trace du catalogue
        </label>
        <select
          id="traceId"
          name="traceId"
          value={value.traceId}
          onChange={(e) => pickTrace(e.target.value)}
          disabled={status !== 'ready'}
          aria-describedby="traceId-hint"
          className={`${fieldClass} disabled:opacity-60`}
        >
          <option value="">Aucune (lien saisi à la main)</option>
          {value.traceId && !linked && (
            // Linked trace no longer in the catalogue (deleted or without link): keep it selectable.
            <option value={value.traceId}>Trace liée absente du catalogue</option>
          )}
          {traces.map((trace) => (
            <option key={trace.id} value={trace.id}>
              {traceOptionLabel(trace)}
            </option>
          ))}
        </select>
        <p id="traceId-hint" className="mt-1 text-xs text-ink-3 dark:text-snow-3" aria-live="polite">
          {catalogHint}
        </p>
      </div>

      {/* GPX / Garmin / Strava trace link */}
      <div className="md:col-span-2">
        <label htmlFor="gpxUrl" className="mb-2 block text-sm font-medium text-ink dark:text-snow">
          Lien de la trace / GPX (Garmin, Strava, Komoot ou URL de fichier .gpx)
        </label>
        <input
          type="url"
          id="gpxUrl"
          name="gpxUrl"
          value={value.gpxUrl}
          // Unlocked when the catalogue cannot load, so a linked ride can still be fixed by hand.
          readOnly={Boolean(value.traceId) && status !== 'error'}
          onChange={(e) => onChange({ traceId: '', gpxUrl: e.target.value })}
          aria-describedby="gpxUrl-hint"
          autoCorrect="off"
          autoCapitalize="none"
          spellCheck={false}
          className={`${fieldClass} font-mono read-only:text-ink-3 dark:read-only:text-snow-3`}
          placeholder="https://connect.garmin.com/modern/course/... ou https://www.strava.com/routes/..."
        />
        <p id="gpxUrl-hint" className="mt-1 text-xs text-ink-3 dark:text-snow-3">
          {value.traceId
            ? 'Lien repris de la trace du catalogue. Choisissez « Aucune » pour le modifier.'
            : 'Ce lien sera accessible aux membres sur le calendrier et dans le bloc « Prochain Rendez-vous » pour télécharger ou visualiser la trace.'}
        </p>
      </div>
    </>
  );
}
