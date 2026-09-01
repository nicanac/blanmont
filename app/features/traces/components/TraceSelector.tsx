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
        <div className="max-h-96 overflow-y-auto rounded-2xl border border-slate-200 bg-slate-50/50 p-4 space-y-3">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 tabular-nums">
                {traces.length} parcours disponibles
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {traces.map(trace => {
                    const isSelected = selectedIds.includes(trace.id);
                    return (
                        <div
                            key={trace.id}
                            className={`rounded-xl border p-4 transition-all cursor-pointer ${
                                isSelected
                                    ? 'border-[#e03e3e] bg-red-50/60 ring-2 ring-[#e03e3e]/20 shadow-xs'
                                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                            }`}
                            onClick={() => onToggle(trace.id)}
                        >
                            <div className="flex items-center justify-between gap-2 mb-2">
                                <span className="text-sm font-bold text-slate-900 truncate">{trace.name}</span>
                                {isSelected && <span className="text-[#e03e3e] font-bold text-xs">✓</span>}
                            </div>
                            <div className="flex items-center gap-3 text-xs text-slate-500 tabular-nums">
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
