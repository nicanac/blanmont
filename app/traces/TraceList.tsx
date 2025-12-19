'use client';

import { useState, useMemo } from 'react';
import { Trace } from '../types';
import TraceCard from './TraceCard';
import FilterPanel, { FilterState } from './FilterPanel';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid'; // Stable Grid v1
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Button from '@mui/material/Button';

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
        const result = initialTraces.filter(trace => {
            if (trace.distance < filters.minDist || trace.distance > filters.maxDist) return false;
            const elev = trace.elevation || 0;
            if (elev < filters.minElev || elev > filters.maxElev) return false;
            if (filters.selectedStarts.length > 0 && (!trace.start || !filters.selectedStarts.includes(trace.start))) return false;
            if (filters.selectedSurfaces.length > 0 && !filters.selectedSurfaces.includes(trace.surface)) return false;
            if (filters.minQuality > 0 && trace.quality < filters.minQuality) return false;
            return true;
        });

        switch (sort) {
            case 'distance_asc': result.sort((a, b) => a.distance - b.distance); break;
            case 'distance_desc': result.sort((a, b) => b.distance - a.distance); break;
            case 'elevation_asc': result.sort((a, b) => (a.elevation || 0) - (b.elevation || 0)); break;
            case 'elevation_desc': result.sort((a, b) => (b.elevation || 0) - (a.elevation || 0)); break;
            case 'start': result.sort((a, b) => (a.start || '').localeCompare(b.start || '')); break;
            case 'newest': default: break;
        }
        return result;
    }, [initialTraces, sort, filters]);

    return (
        <Box>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 4 }} alignItems="center">
                <Box sx={{ flexGrow: 1 }}>
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
                </Box>

                <Box sx={{ minWidth: 200 }}>
                    <FormControl fullWidth size="small">
                        <InputLabel>Sort By</InputLabel>
                        <Select
                            value={sort}
                            label="Sort By"
                            onChange={(e) => setSort(e.target.value as SortOption)}
                        >
                            <MenuItem value="newest">Default Order</MenuItem>
                            <MenuItem value="distance_asc">Distance (Short → Long)</MenuItem>
                            <MenuItem value="distance_desc">Distance (Long → Short)</MenuItem>
                            <MenuItem value="elevation_asc">Elevation (Flat → Hilly)</MenuItem>
                            <MenuItem value="elevation_desc">Elevation (Hilly → Flat)</MenuItem>
                            <MenuItem value="start">Start Location (A-Z)</MenuItem>
                        </Select>
                    </FormControl>
                </Box>
            </Stack>

            <Grid container spacing={3}>
                {filteredTraces.length > 0 ? (
                    filteredTraces.map((trace) => (
                        <Grid size={{ xs: 12, sm: 6, md: 4 }} key={trace.id}>
                            <TraceCard trace={trace} />
                        </Grid>
                    ))
                ) : (
                    <Grid size={{ xs: 12 }}>
                        <Box sx={{ textAlign: 'center', py: 8 }}>
                            <Typography variant="h5" color="text.secondary" gutterBottom>
                                No traces found matching your filters.
                            </Typography>
                            <Typography color="text.secondary" paragraph>
                                Try adjusting the sliders or clearing selections.
                            </Typography>
                            <Button
                                variant="outlined"
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
                            </Button>
                        </Box>
                    </Grid>
                )}
            </Grid>
        </Box>
    );
}
