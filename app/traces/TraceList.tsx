'use client';

import { useState, useMemo } from 'react';
import { Trace } from '../types';
import styles from './page.module.css';
import TraceCard from './TraceCard';
import FilterPanel, { FilterState } from './FilterPanel';

interface TraceListProps {
    initialTraces: Trace[];
}

type SortOption = 'newest' | 'distance_asc' | 'distance_desc' | 'elevation_asc' | 'elevation_desc' | 'start';

export default function TraceList({ initialTraces }: TraceListProps) {
    const [sort, setSort] = useState<SortOption>('newest');

    // Calculate derived ranges and options from data
    const ranges = useMemo(() => {
        if (initialTraces.length === 0) return {
            minDist: 0, maxDist: 100, minElev: 0, maxElev: 1000,
            starts: [], surfaces: []
        };

        const dists = initialTraces.map(t => t.distance);
        const elevs = initialTraces.map(t => t.elevation || 0);
        const starts = Array.from(new Set(initialTraces.map(t => t.start).filter(Boolean) as string[])).sort();
        const surfaces = Array.from(new Set(initialTraces.map(t => t.surface))).sort();

        return {
            minDist: Math.floor(Math.min(...dists) / 10) * 10,
            maxDist: Math.ceil(Math.max(...dists) / 10) * 10,
            minElev: 0,
            maxElev: Math.ceil(Math.max(...elevs) / 100) * 100,
            starts,
            surfaces
        };
    }, [initialTraces]);

    const [filters, setFilters] = useState<FilterState>({
        minDist: ranges.minDist,
        maxDist: ranges.maxDist,
        minElev: ranges.minElev,
        maxElev: ranges.maxElev,
        selectedStarts: [],
        selectedSurfaces: [],
        minQuality: 0
    });

    const filteredTraces = useMemo(() => {
        let result = initialTraces.filter(trace => {
            // Distance Filter
            if (trace.distance < filters.minDist || trace.distance > filters.maxDist) return false;

            // Elevation Filter
            const elev = trace.elevation || 0;
            if (elev < filters.minElev || elev > filters.maxElev) return false;

            // Start Location Filter
            if (filters.selectedStarts.length > 0) {
                if (!trace.start || !filters.selectedStarts.includes(trace.start)) return false;
            }

            // Surface Filter
            if (filters.selectedSurfaces.length > 0) {
                if (!filters.selectedSurfaces.includes(trace.surface)) return false;
            }

            // Quality Filter
            if (filters.minQuality > 0 && trace.quality < filters.minQuality) return false;

            return true;
        });

        switch (sort) {
            case 'distance_asc':
                result.sort((a, b) => a.distance - b.distance);
                break;
            case 'distance_desc':
                result.sort((a, b) => b.distance - a.distance);
                break;
            case 'elevation_asc':
                result.sort((a, b) => (a.elevation || 0) - (b.elevation || 0));
                break;
            case 'elevation_desc':
                result.sort((a, b) => (b.elevation || 0) - (a.elevation || 0));
                break;
            case 'start':
                result.sort((a, b) => (a.start || '').localeCompare(b.start || ''));
                break;
            case 'newest':
            default:
                break;
        }
        return result;
    }, [initialTraces, sort, filters]);

    return (
        <>
            <div className={styles.controls}>
                <div style={{ flexGrow: 1 }}>
                    <FilterPanel
                        minDist={ranges.minDist}
                        maxDist={ranges.maxDist}
                        minElev={ranges.minElev}
                        maxElev={ranges.maxElev}
                        availableStarts={ranges.starts}
                        availableSurfaces={ranges.surfaces}
                        filters={filters}
                        onFilterChange={setFilters}
                    />
                </div>

                <div>
                    <select
                        value={sort}
                        onChange={(e) => setSort(e.target.value as SortOption)}
                        className={styles.sortSelect}
                        title="Sort Traces"
                        aria-label="Sort Traces"
                    >
                        <option value="newest">Default Order</option>
                        <option value="distance_asc">Distance (Short → Long)</option>
                        <option value="distance_desc">Distance (Long → Short)</option>
                        <option value="elevation_asc">Elevation (Flat → Hilly)</option>
                        <option value="elevation_desc">Elevation (Hilly → Flat)</option>
                        <option value="start">Start Location (A-Z)</option>
                    </select>
                </div>
            </div>

            <div className={styles.grid}>
                {filteredTraces.length > 0 ? (
                    filteredTraces.map((trace) => (
                        <TraceCard key={trace.id} trace={trace} />
                    ))
                ) : (
                    <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                        <h3>No traces found matching your filters.</h3>
                        <p>Try adjusting the sliders or clearing selections.</p>
                        <button
                            className={styles.btnAction}
                            style={{ marginTop: '1rem', display: 'inline-block' }}
                            onClick={() => setFilters({
                                minDist: ranges.minDist,
                                maxDist: ranges.maxDist,
                                minElev: ranges.minElev,
                                maxElev: ranges.maxElev,
                                selectedStarts: [],
                                selectedSurfaces: [],
                                minQuality: 0
                            })}
                        >
                            Reset Filters
                        </button>
                    </div>
                )}
            </div>
        </>
    );
}
