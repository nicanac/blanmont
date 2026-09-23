'use client';

import { Trace } from '../../../types';

interface Props {
    traces: Trace[];
    selectedIds: string[];
    onToggle: (id: string) => void;
}

/**
 * Component to select multiple traces from a grid.
 * Used when creating a new ride proposal.
 * 
 * @param traces - The list of traces to choose from.
 * @param selectedIds - Array of currently selected trace IDs.
 * @param onToggle - Callback function when a trace is clicked.
 */
export default function TraceSelector({ traces, selectedIds, onToggle }: Props) {
    return (
        <div className="max-h-96 overflow-y-auto rounded-md border border-line dark:border-night-line bg-paper-2/50 dark:bg-night-2/50 p-4 space-y-3">
            <div className="text-xs font-semibold uppercase tracking-wider text-ink-3 dark:text-snow-3 tabular-nums">
                {traces.length} parcours disponibles
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {traces.map(trace => {
                    const isSelected = selectedIds.includes(trace.id);
                    return (
                        <div
                            key={trace.id}
                            className={`rounded-lg border p-4 transition-all duration-150 ease-out cursor-pointer ${
                                isSelected
                                    ? 'border-brand bg-red-50/60 dark:bg-red-950/30 ring-2 ring-brand/20 shadow-xs'
                                    : 'border-line dark:border-night-line bg-white dark:bg-night-2 hover:border-line-strong dark:hover:border-night-line-strong hover:bg-paper-2 dark:hover:bg-night-3'
                            }`}
                            onClick={() => onToggle(trace.id)}
                        >
                            <div className="flex items-center justify-between gap-2 mb-2">
                                <span className="text-sm font-bold text-ink dark:text-snow truncate">{trace.name}</span>
                                {isSelected && <span className="text-brand font-bold text-xs">✓</span>}
                            </div>
                            <div className="flex items-center gap-3 text-xs text-ink-3 dark:text-snow-3 tabular-nums">
                                <span>{trace.distance}&nbsp;km</span>
                                <span>{trace.elevation}&nbsp;m D+</span>
                                {trace.surface && <span>{trace.surface}</span>}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
