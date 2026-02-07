'use client';

import { useState, useMemo } from 'react';
import { Trace } from '../../../types';
import FilterPanel, { FilterState } from './FilterPanel';
import TraceCard from './TraceCard';
import { PageHero } from '../../../components/ui/PageHero';
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
        <main className="min-h-screen bg-gray-50">
            <PageHero
                title="Nos Parcours"
                description="Découvrez nos traces GPX pour vos sorties vélo."
                badge="Traces"
                badgeIcon={<MapIcon className="h-4 w-4" />}
                variant="green"
                size="md"
            />
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
                {/* Controls Bar */}
                <div className="flex items-center justify-between border-b border-gray-200 pb-6">
                    <h2 className="text-lg font-medium text-gray-900">{filteredTraces.length} parcours</h2>
                    <div className="flex items-center">
                        <Menu as="div" className="relative inline-block text-left">
                            <div>
                                <Menu.Button className="group inline-flex justify-center text-sm font-medium text-gray-700 hover:text-gray-900">
                                    Trier
                                    <ChevronDownIcon
                                        className="-mr-1 ml-1 h-5 w-5 flex-shrink-0 text-gray-400 group-hover:text-gray-500"
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
                                <Menu.Items className="absolute right-0 z-10 mt-2 w-40 origin-top-right rounded-md bg-white shadow-2xl ring-1 ring-black ring-opacity-5 focus:outline-none">
                                    <div className="py-1">
                                        {sortOptions.map((option) => (
                                            <Menu.Item key={option.name}>
                                                {({ active }) => (
                                                    <button
                                                        onClick={() => setSort(option.value as SortOption)}
                                                        className={cn(
                                                            option.value === sort ? 'font-medium text-gray-900' : 'text-gray-500',
                                                            active ? 'bg-gray-100' : '',
                                                            'block px-4 py-2 text-sm w-full text-left'
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

                        <button type="button" className="-m-2 ml-5 p-2 text-gray-400 hover:text-gray-500 sm:ml-7">
                            <span className="sr-only">View grid</span>
                            <Squares2X2Icon className="h-5 w-5" aria-hidden="true" />
                        </button>
                        <button
                            type="button"
                            className="-m-2 ml-4 p-2 text-gray-400 hover:text-gray-500 sm:ml-6 lg:hidden"
                            onClick={() => setMobileFiltersOpen(true)}
                        >
                            <span className="sr-only">Filters</span>
                            <FunnelIcon className="h-5 w-5" aria-hidden="true" />
                        </button>
                    </div>
                </div>

                <section aria-labelledby="products-heading" className="pb-24 pt-6">
                    <h2 id="products-heading" className="sr-only">
                        Products
                    </h2>

                    <div className="grid grid-cols-1 gap-x-8 gap-y-10 lg:grid-cols-4">
                        {/* Deskstop Filters */}
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
                                <div className="text-center py-20">
                                    <p className="text-gray-500">Aucun parcours ne correspond à ces filtres.</p>
                                    <button
                                        onClick={() => setFilters({
                                            minDist: ranges.minDist, maxDist: ranges.maxDist,
                                            minElev: ranges.minElev, maxElev: ranges.maxElev,
                                            selectedStarts: [], selectedSurfaces: [], selectedDirections: [], minQuality: 0
                                        })}
                                        className="mt-4 text-brand-primary font-semibold"
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
