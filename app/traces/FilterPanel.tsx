'use client';

import { useState, useRef, useEffect } from 'react';
import styles from './page.module.css';

export interface FilterState {
    minDist: number;
    maxDist: number;
    minElev: number;
    maxElev: number;
    selectedStarts: string[];
    selectedSurfaces: string[];
    minQuality: number;
}

interface FilterPanelProps {
    minDist: number;
    maxDist: number;
    minElev: number;
    maxElev: number;
    availableStarts: string[];
    availableSurfaces: string[];
    filters: FilterState;
    onFilterChange: (filters: FilterState) => void;
}

/**
 * Component for filtering traces.
 * Provides controls for Range (Dist/Elev), Checkboxes (Start/Surface), and Rating.
 */
export default function FilterPanel({
    minDist, maxDist,
    minElev, maxElev,
    availableStarts,
    availableSurfaces,
    filters,
    onFilterChange
}: FilterPanelProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const togglePanel = () => setIsExpanded(!isExpanded);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsExpanded(false);
            }
        };

        if (isExpanded) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isExpanded]);

    const handleRangeChange = (key: keyof FilterState, value: number) => {
        onFilterChange({ ...filters, [key]: value });
    };

    const handleCheckboxChange = (key: 'selectedStarts' | 'selectedSurfaces', value: string) => {
        const current = filters[key];
        const updated = current.includes(value)
            ? current.filter(item => item !== value)
            : [...current, value];
        onFilterChange({ ...filters, [key]: updated });
    };

    return (
        <div className={styles.filterContainer} ref={containerRef}>
            <button
                onClick={togglePanel}
                className={styles.pillsFilter}
                aria-expanded={isExpanded}
            >
                {isExpanded ? 'Hide Filters' : 'Show Filters 🔍'}
            </button>

            {isExpanded && (
                <div className={styles.filterPanel}>
                    <div className={styles.filterSection}>
                        <h4>Distance (km)</h4>
                        <div className={styles.rangeInputs}>
                            <div className={styles.rangeGroup}>
                                <label>Min: {filters.minDist}km</label>
                                <input
                                    type="range"
                                    min={minDist}
                                    max={maxDist}
                                    value={filters.minDist}
                                    onChange={(e) => handleRangeChange('minDist', Number(e.target.value))}
                                    className={styles.rangeInput}
                                />
                            </div>
                            <div className={styles.rangeGroup}>
                                <label>Max: {filters.maxDist}km</label>
                                <input
                                    type="range"
                                    min={minDist}
                                    max={maxDist}
                                    value={filters.maxDist}
                                    onChange={(e) => handleRangeChange('maxDist', Number(e.target.value))}
                                    className={styles.rangeInput}
                                />
                            </div>
                        </div>
                    </div>

                    <div className={styles.filterSection}>
                        <h4>Elevation (m)</h4>
                        <div className={styles.rangeInputs}>
                            <div className={styles.rangeGroup}>
                                <label>Min: {filters.minElev}m</label>
                                <input
                                    type="range"
                                    min={minElev}
                                    max={maxElev}
                                    value={filters.minElev}
                                    onChange={(e) => handleRangeChange('minElev', Number(e.target.value))}
                                    className={styles.rangeInput}
                                />
                            </div>
                            <div className={styles.rangeGroup}>
                                <label>Max: {filters.maxElev}m</label>
                                <input
                                    type="range"
                                    min={minElev}
                                    max={maxElev}
                                    value={filters.maxElev}
                                    onChange={(e) => handleRangeChange('maxElev', Number(e.target.value))}
                                    className={styles.rangeInput}
                                />
                            </div>
                        </div>
                    </div>

                    <div className={styles.filterSection}>
                        <h4>Filter by Start Location</h4>
                        <div className={styles.checkboxGroup}>
                            {availableStarts.map(start => (
                                <label key={start} className={styles.checkboxLabel}>
                                    <input
                                        type="checkbox"
                                        checked={filters.selectedStarts.includes(start)}
                                        onChange={() => handleCheckboxChange('selectedStarts', start)}
                                    />
                                    {start}
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className={styles.filterSection}>
                        <h4>Surface</h4>
                        <div className={styles.checkboxGroup}>
                            {availableSurfaces.map(surface => (
                                <label key={surface} className={styles.checkboxLabel}>
                                    <input
                                        type="checkbox"
                                        checked={filters.selectedSurfaces.includes(surface)}
                                        onChange={() => handleCheckboxChange('selectedSurfaces', surface)}
                                    />
                                    {surface}
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className={styles.filterSection}>
                        <h4>Minimum Rating</h4>
                        <select
                            value={filters.minQuality}
                            onChange={(e) => handleRangeChange('minQuality', Number(e.target.value))}
                            className={styles.sortSelect}
                            style={{ width: '100%' }}
                        >
                            <option value={0}>Any Rating</option>
                            <option value={2}>2+ Stars</option>
                            <option value={3}>3+ Stars</option>
                            <option value={4}>4+ Stars</option>
                            <option value={5}>5 Stars Only</option>
                        </select>
                    </div>

                    <button
                        className={styles.resetBtn}
                        onClick={() => onFilterChange({
                            minDist: minDist,
                            maxDist: maxDist,
                            minElev: minElev,
                            maxElev: maxElev,
                            selectedStarts: [],
                            selectedSurfaces: [],
                            minQuality: 0
                        })}
                    >
                        Reset All Filters
                    </button>
                </div>
            )}
        </div>
    );
}
