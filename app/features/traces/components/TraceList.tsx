'use client';

import { useState, useMemo } from 'react';
import { Trace } from '../../../types';
import FilterPanel, { FilterState } from './FilterPanel';
import TraceCard from './TraceCard';
import { SheetHeader } from '../../../components/carte/SheetHeader';
import { FunnelIcon, Squares2X2Icon, MapIcon } from '@heroicons/react/20/solid';
import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import { cn } from '../../../utils/cn';

interface TraceListProps {
    initialTraces: Trace[];
}

type SortOption = 'newest' | 'distance_asc' | 'distance_desc' | 'elevation_asc' | 'elevation_desc' | 'start';

const sortOptions = [
    { name: 'Plus récents', value: 'newest', current: true },
    { name: 'Distance : Croissant', value: 'distance_asc', current: false },
    { name: 'Distance : Décroissant', value: 'distance_desc', current: false },
    { name: 'Dénivelé : Croissant', value: 'elevation_asc', current: false },
    { name: 'Dénivelé : Décroissant', value: 'elevation_desc', current: false },
];


export default function TraceList({ initialTraces }: TraceListProps): React.ReactElement {
    const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
    const [sort, setSort] = useState<SortOption>('newest');

    // Calculate derived ranges and options from data
    const ranges = useMemo(() => {
        if (initialTraces.length === 0) return {
            minDist: 0, maxDist: 100, minElev: 0, maxElev: 1000,
            starts: [], surfaces: [], directions: []
        };

        const dists = initialTraces.map(t => t.distance);
        const elevs = initialTraces.map(t => t.elevation || 0);
        const starts = Array.from(new Set(initialTraces.map(t => t.start).filter(Boolean) as string[])).sort();
        const surfaces = Array.from(new Set(initialTraces.map(t => t.surface))).sort();
        const directions = Array.from(new Set(initialTraces.map(t => t.direction).filter(Boolean) as string[])).sort();

        return {
            minDist: Math.floor(Math.min(...dists) / 10) * 10,
            maxDist: Math.ceil(Math.max(...dists) / 10) * 10,
            minElev: 0,
            maxElev: Math.ceil(Math.max(...elevs) / 100) * 100,
            starts,
            surfaces,
            directions
        };
    }, [initialTraces]);

    const [filters, setFilters] = useState<FilterState>({
        minDist: ranges.minDist,
        maxDist: ranges.maxDist,
        minElev: ranges.minElev,
        maxElev: ranges.maxElev,
        selectedStarts: [],
        selectedSurfaces: [],
        selectedDirections: [],
        minQuality: 0
    });

    const filteredTraces = useMemo(() => {
        const result = initialTraces.filter(trace => {
            if (trace.distance < filters.minDist || trace.distance > filters.maxDist) return false;
            const elev = trace.elevation || 0;
            if (elev < filters.minElev || elev > filters.maxElev) return false;
            if (filters.selectedStarts.length > 0 && (!trace.start || !filters.selectedStarts.includes(trace.start))) return false;
            if (filters.selectedSurfaces.length > 0 && !filters.selectedSurfaces.includes(trace.surface)) return false;
            if (filters.selectedDirections.length > 0 && (!trace.direction || !filters.selectedDirections.includes(trace.direction))) return false;
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
        <main className="min-h-screen bg-paper dark:bg-night transition-colors duration-200">
            <SheetHeader
                sheet="Catalogue des parcours"
                focus={{ x: 50, y: 50 }}
                title="Les parcours du peloton"
                description="Explorez notre sélection de traces GPX officielles, des routes vallonnées du Brabant aux sentiers VTT."
                legend={[
                    { term: 'Catalogue officiel', value: `${initialTraces.length} parcours` },
                    { term: 'Sélection actuelle', value: `${filteredTraces.length} affichés` },
                    { term: 'Format & GPS', value: 'Fichiers GPX' },
                ]}
            />
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
                {/* Controls Bar */}
                <div className="flex items-center justify-between border-b border-line dark:border-night-line pb-6">
                    <h2 className="text-base font-bold text-ink dark:text-white tabular-nums">
                        {filteredTraces.length} parcours disponibles
                    </h2>
                    <div className="flex items-center">
                        <Menu as="div" className="relative inline-block text-left">
                            <div>
                                <Menu.Button className="group inline-flex items-center justify-center min-h-[44px] px-2 text-sm font-medium text-ink-2 dark:text-snow-3 hover:text-ink dark:hover:text-white">
                                    Trier
                                    <ChevronDownIcon
                                        className="-mr-1 ml-1 h-5 w-5 flex-shrink-0 text-gray-400 group-hover:text-ink-3 dark:group-hover:text-white"
                                        aria-hidden="true"
                                    />
                                </Menu.Button>
                            </div>

                            <Transition
                                as={Fragment}
                                enter="transition ease-out duration-100"
                                enterFrom="transform opacity-0 scale-95"
                                enterTo="transform opacity-100 scale-100"
                                leave="transition ease-in duration-75"
                                leaveFrom="transform opacity-100 scale-100"
                                leaveTo="transform opacity-0 scale-95"
                            >
                                <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white dark:bg-night-2 border border-line dark:border-night-line shadow-2xl ring-1 ring-black ring-opacity-5 focus:outline-none">
                                    <div className="py-1">
                                        {sortOptions.map((option) => (
                                            <Menu.Item key={option.name}>
                                                {({ active }) => (
                                                    <button
                                                        onClick={() => setSort(option.value as SortOption)}
                                                        className={cn(
                                                            option.value === sort ? 'font-bold text-brand' : 'text-ink-2 dark:text-snow-3',
                                                            active ? 'bg-paper-2 dark:bg-night-3' : '',
                                                            'flex items-center px-4 py-2.5 text-xs w-full text-left transition-colors min-h-[44px]'
                                                        )}
                                                    >
                                                        {option.name}
                                                    </button>
                                                )}
                                            </Menu.Item>
                                        ))}
                                    </div>
                                </Menu.Items>
                            </Transition>
                        </Menu>

                        <button type="button" className="-m-2 ml-4 flex h-11 w-11 items-center justify-center text-gray-400 hover:text-ink-3 dark:hover:text-white sm:ml-6" aria-label="Affichage en grille">
                            <span className="sr-only">Affichage en grille</span>
                            <Squares2X2Icon className="h-5 w-5" aria-hidden="true" />
                        </button>
                        <button
                            type="button"
                            className="-m-2 ml-2 flex h-11 w-11 items-center justify-center text-gray-400 hover:text-ink-3 dark:hover:text-white sm:ml-4 lg:hidden"
                            onClick={() => setMobileFiltersOpen(true)}
                            aria-label="Filtres de recherche"
                        >
                            <span className="sr-only">Filtres</span>
                            <FunnelIcon className="h-5 w-5" aria-hidden="true" />
                        </button>
                    </div>
                </div>

                <section aria-labelledby="traces-heading" className="pb-24 pt-6">
                    <h2 id="traces-heading" className="sr-only">
                        Liste des parcours
                    </h2>

                    <div className="grid grid-cols-1 gap-x-8 gap-y-10 lg:grid-cols-4">
                        {/* Desktop Filters */}
                        <div className="hidden lg:block">
                            <FilterPanel
                                minDist={ranges.minDist}
                                maxDist={ranges.maxDist}
                                minElev={ranges.minElev}
                                maxElev={ranges.maxElev}
                                availableStarts={ranges.starts}
                                availableSurfaces={ranges.surfaces}
                                availableDirections={ranges.directions}
                                filters={filters}
                                onFilterChange={setFilters}
                                mobileFiltersOpen={mobileFiltersOpen}
                                setMobileFiltersOpen={setMobileFiltersOpen}
                            />
                        </div>

                        {/* Product grid */}
                        <div className="lg:col-span-3">
                            {filteredTraces.length > 0 ? (
                                <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:gap-x-8">
                                    {filteredTraces.map((trace) => (
                                        <TraceCard key={trace.id} trace={trace} />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-16 bg-white dark:bg-night-2 rounded-lg border border-line dark:border-night-line p-8 space-y-4">
                                    <p className="text-xs sm:text-sm text-ink-3 dark:text-snow-3">Aucun parcours ne correspond aux filtres sélectionnés.</p>
                                    <button
                                        type="button"
                                        onClick={() => setFilters({
                                            minDist: ranges.minDist, maxDist: ranges.maxDist,
                                            minElev: ranges.minElev, maxElev: ranges.maxElev,
                                            selectedStarts: [], selectedSurfaces: [], selectedDirections: [], minQuality: 0
                                        })}
                                        className="inline-flex items-center justify-center rounded-md bg-brand hover:bg-brand-strong text-white px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition-colors min-h-[44px]"
                                    >
                                        Effacer tous les filtres
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </section>
            </div>
        </main>
    );
}
