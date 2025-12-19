'use client';

import { Fragment, useState } from 'react';
import { Dialog, Disclosure, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { MinusIcon, PlusIcon } from '@heroicons/react/20/solid';

export interface FilterState {
    minDist: number;
    maxDist: number;
    minElev: number;
    maxElev: number;
    selectedStarts: string[];
    selectedSurfaces: string[];
    selectedDirections: string[];
    minQuality: number;
}

interface FilterPanelProps {
    minDist: number;
    maxDist: number;
    minElev: number;
    maxElev: number;
    availableStarts: string[];
    availableSurfaces: string[];
    availableDirections: string[];
    filters: FilterState;
    onFilterChange: (filters: FilterState) => void;
    mobileFiltersOpen: boolean;
    setMobileFiltersOpen: (open: boolean) => void;
}

export default function FilterPanel({
    minDist, maxDist,
    minElev, maxElev,
    availableStarts,
    availableSurfaces,
    availableDirections,
    filters,
    onFilterChange,
    mobileFiltersOpen,
    setMobileFiltersOpen
}: FilterPanelProps) {

    const handleCheckboxChange = (key: 'selectedStarts' | 'selectedSurfaces' | 'selectedDirections', value: string) => {
        const current = filters[key];
        const updated = current.includes(value)
            ? current.filter(item => item !== value)
            : [...current, value];
        onFilterChange({ ...filters, [key]: updated });
    };

    const sections = [
        {
            id: 'surface',
            name: 'Surface',
            options: availableSurfaces.map(s => ({ value: s, label: s, checked: filters.selectedSurfaces.includes(s) }))
        },
        {
            id: 'start',
            name: 'Départ',
            options: availableStarts.map(s => ({ value: s, label: s, checked: filters.selectedStarts.includes(s) }))
        },
        {
            id: 'direction',
            name: 'Direction',
            options: availableDirections.map(s => ({ value: s, label: s, checked: filters.selectedDirections.includes(s) }))
        },
    ];

    return (
        <>
            {/* Mobile filter dialog */}
            <Transition.Root show={mobileFiltersOpen} as={Fragment}>
                <Dialog as="div" className="relative z-40 lg:hidden" onClose={setMobileFiltersOpen}>
                    <Transition.Child
                        as={Fragment}
                        enter="transition-opacity ease-linear duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="transition-opacity ease-linear duration-300"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-black bg-opacity-25" />
                    </Transition.Child>

                    <div className="fixed inset-0 z-40 flex">
                        <Transition.Child
                            as={Fragment}
                            enter="transition ease-in-out duration-300 transform"
                            enterFrom="translate-x-full"
                            enterTo="translate-x-0"
                            leave="transition ease-in-out duration-300 transform"
                            leaveFrom="translate-x-0"
                            leaveTo="translate-x-full"
                        >
                            <Dialog.Panel className="relative ml-auto flex h-full w-full max-w-xs flex-col overflow-y-auto bg-white py-4 pb-12 shadow-xl">
                                <div className="flex items-center justify-between px-4">
                                    <h2 className="text-lg font-medium text-gray-900">Filters</h2>
                                    <button
                                        type="button"
                                        className="-mr-2 flex h-10 w-10 items-center justify-center rounded-md bg-white p-2 text-gray-400"
                                        onClick={() => setMobileFiltersOpen(false)}
                                    >
                                        <span className="sr-only">Close menu</span>
                                        <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                                    </button>
                                </div>

                                {/* Mobile Filters */}
                                <form className="mt-4 border-t border-gray-200">
                                    {/* Distance Mobile */}
                                    <div className="px-4 py-6 border-b border-gray-200">
                                        <h3 className="text-sm font-medium text-gray-900 mb-4">Distance ({filters.minDist} - {filters.maxDist} km)</h3>
                                        <div className="flex items-center gap-4">
                                            <input
                                                type="range"
                                                min={minDist}
                                                max={maxDist}
                                                value={filters.maxDist}
                                                onChange={(e) => onFilterChange({ ...filters, maxDist: Number(e.target.value) })}
                                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-600"
                                            />
                                        </div>
                                    </div>

                                    {/* Elevation Mobile */}
                                    <div className="px-4 py-6 border-b border-gray-200">
                                        <h3 className="text-sm font-medium text-gray-900 mb-4">Elevation (Max {filters.maxElev} m)</h3>
                                        <input
                                            type="range"
                                            min={minElev}
                                            max={maxElev}
                                            value={filters.maxElev}
                                            onChange={(e) => onFilterChange({ ...filters, maxElev: Number(e.target.value) })}
                                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-600"
                                        />
                                    </div>


                                    {sections.map((section) => (
                                        <Disclosure as="div" key={section.id} className="border-t border-gray-200 px-4 py-6">
                                            {({ open }) => (
                                                <>
                                                    <h3 className="-mx-2 -my-3 flow-root">
                                                        <Disclosure.Button className="flex w-full items-center justify-between bg-white px-2 py-3 text-gray-400 hover:text-gray-500">
                                                            <span className="font-medium text-gray-900">{section.name}</span>
                                                            <span className="ml-6 flex items-center">
                                                                {open ? (
                                                                    <MinusIcon className="h-5 w-5" aria-hidden="true" />
                                                                ) : (
                                                                    <PlusIcon className="h-5 w-5" aria-hidden="true" />
                                                                )}
                                                            </span>
                                                        </Disclosure.Button>
                                                    </h3>
                                                    <Disclosure.Panel className="pt-6">
                                                        <div className="space-y-6">
                                                            {section.options.map((option, optionIdx) => (
                                                                <div key={option.value} className="flex items-center">
                                                                    <input
                                                                        id={`filter-mobile-${section.id}-${optionIdx}`}
                                                                        name={`${section.id}[]`}
                                                                        defaultValue={option.value}
                                                                        type="checkbox"
                                                                        defaultChecked={option.checked}
                                                                        onChange={() => handleCheckboxChange(
                                                                            section.id === 'surface' ? 'selectedSurfaces' :
                                                                                section.id === 'direction' ? 'selectedDirections' :
                                                                                    'selectedStarts',
                                                                            option.value
                                                                        )}
                                                                        className="h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
                                                                    />
                                                                    <label
                                                                        htmlFor={`filter-mobile-${section.id}-${optionIdx}`}
                                                                        className="ml-3 min-w-0 flex-1 text-gray-500"
                                                                    >
                                                                        {option.label}
                                                                    </label>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </Disclosure.Panel>
                                                </>
                                            )}
                                        </Disclosure>
                                    ))}
                                </form>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </Dialog>
            </Transition.Root>

            {/* Desktop Filters */}
            <div className="hidden lg:block">
                <form className="space-y-10">

                    {/* Distance Desktop */}
                    <div>
                        <h3 className="text-sm font-medium text-gray-900 mb-4">Distance</h3>
                        <div className="px-1">
                            <div className="flex justify-between text-xs text-gray-500 mb-2">
                                <span>{filters.minDist} km</span>
                                <span>{filters.maxDist} km</span>
                            </div>
                            <input
                                type="range"
                                min={minDist}
                                max={maxDist}
                                value={filters.maxDist}
                                onChange={(e) => onFilterChange({ ...filters, maxDist: Number(e.target.value) })}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-600"
                            />
                        </div>
                    </div>

                    {/* Elevation Desktop */}
                    <div className="pt-6">
                        <h3 className="text-sm font-medium text-gray-900 mb-4">Max Elevation</h3>
                        <div className="px-1">
                            <div className="flex justify-between text-xs text-gray-500 mb-2">
                                <span>0 m</span>
                                <span>{filters.maxElev} m</span>
                            </div>
                            <input
                                type="range"
                                min={minElev}
                                max={maxElev}
                                value={filters.maxElev}
                                onChange={(e) => onFilterChange({ ...filters, maxElev: Number(e.target.value) })}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-600"
                            />
                        </div>
                    </div>

                    {sections.map((section) => (
                        <Disclosure as="div" key={section.id} className="border-t border-gray-200 pt-6" defaultOpen={true}>
                            {({ open }) => (
                                <>
                                    <h3 className="-mx-2 -my-3 flow-root cursor-pointer">
                                        <Disclosure.Button className="flex w-full items-center justify-between bg-white px-2 py-3 text-gray-400 hover:text-gray-500">
                                            <span className="font-medium text-gray-900">{section.name}</span>
                                            <span className="ml-6 flex items-center">
                                                {open ? (
                                                    <MinusIcon className="h-5 w-5" aria-hidden="true" />
                                                ) : (
                                                    <PlusIcon className="h-5 w-5" aria-hidden="true" />
                                                )}
                                            </span>
                                        </Disclosure.Button>
                                    </h3>
                                    <Disclosure.Panel className="pt-3">
                                        <div className="space-y-2">
                                            {section.options.map((option, optionIdx) => (
                                                <div key={option.value} className="flex items-center">
                                                    <input
                                                        id={`filter-${section.id}-${optionIdx}`}
                                                        name={`${section.id}[]`}
                                                        defaultValue={option.value}
                                                        type="checkbox"
                                                        defaultChecked={option.checked}
                                                        onChange={() => handleCheckboxChange(
                                                            section.id === 'surface' ? 'selectedSurfaces' :
                                                                section.id === 'direction' ? 'selectedDirections' :
                                                                    'selectedStarts',
                                                            option.value
                                                        )}
                                                        className="h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500 cursor-pointer"
                                                    />
                                                    <label
                                                        htmlFor={`filter-${section.id}-${optionIdx}`}
                                                        className="ml-3 min-w-0 flex-1 text-gray-500 cursor-pointer"
                                                    >
                                                        {option.label}
                                                    </label>
                                                </div>
                                            ))}
                                        </div>
                                    </Disclosure.Panel>
                                </>
                            )}
                        </Disclosure>
                    ))}

                    <div className="pt-10">
                        <button
                            type="button"
                            onClick={() => onFilterChange({
                                minDist: minDist,
                                maxDist: maxDist,
                                minElev: minElev,
                                maxElev: maxElev,
                                selectedStarts: [],
                                selectedSurfaces: [],
                                selectedDirections: [],
                                minQuality: 0
                            })}
                            className="text-sm font-medium text-red-600 hover:text-red-500"
                        >
                            Reset Filters
                        </button>
                    </div>

                </form>
            </div>
        </>
    );
}
