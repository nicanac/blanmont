'use client';

import { useEffect, useState } from 'react';
import type { CatalogTraceOption, EventTraceRow, TraceLinksPayload } from '@/app/lib/event-trace';

export type TraceLinksStatus = 'loading' | 'ready' | 'denied' | 'error';

export interface TraceLinksState {
  status: TraceLinksStatus;
  traces: CatalogTraceOption[];
  events: EventTraceRow[];
}

/** Catalog traces and upcoming rides for the trace pickers (#255). `denied`: no Événements access. */
export function useTraceLinks(): TraceLinksState {
  const [state, setState] = useState<TraceLinksState>({ status: 'loading', traces: [], events: [] });

  useEffect(() => {
    let live = true;
    fetch('/api/admin/events/trace-links', { cache: 'no-store' })
      .then(async (res) => {
        if (!live) return;
        if (res.status === 401 || res.status === 403) {
          setState({ status: 'denied', traces: [], events: [] });
          return;
        }
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as TraceLinksPayload;
        if (live) setState({ status: 'ready', traces: data.traces ?? [], events: data.events ?? [] });
      })
      .catch((error: unknown) => {
        console.error('Error loading catalog traces:', error);
        if (live) setState({ status: 'error', traces: [], events: [] });
      });
    return () => {
      live = false;
    };
  }, []);

  return state;
}

/** "Name · 85 km · 950 m D+", the label of a trace in a picker. */
export function traceOptionLabel(trace: CatalogTraceOption): string {
  const parts = [trace.name];
  if (trace.distance > 0) parts.push(`${trace.distance} km`);
  if (trace.elevation) parts.push(`${trace.elevation} m D+`);
  return parts.join(' · ');
}
