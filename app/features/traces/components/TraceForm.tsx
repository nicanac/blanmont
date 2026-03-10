'use client';

import { useState, Fragment } from 'react';
import dynamic from 'next/dynamic';
import { ExclamationTriangleIcon, CheckIcon, ChevronUpDownIcon } from '@heroicons/react/24/outline';
import { Combobox, Transition } from '@headlessui/react';
import { Trace } from '../../../types';

// Dynamic import for Leaflet map (Client-side only)
const MapPreview = dynamic(() => import('./MapPreview'), { ssr: false });

interface TraceFormProps {
    initialData: Partial<Trace> & { polyline?: string; };
    onSubmit: (data: any) => Promise<void>;
    isSubmitting: boolean;
    submitLabel?: string;
    showDelete?: boolean;
    onDelete?: () => void;
    options?: {
        directions: string[];
        surfaces: string[];
        locations: string[]; // Shared for start/end
    };
}

// Reusable Combobox Component
function LocationCombobox({
    label,
    value,
    onChange,
    options = []
}: {
    label: string;
    value: string;
    onChange: (val: string) => void;
    options: string[];
}) {
    const [query, setQuery] = useState('');

    const filteredOptions =
        query === ''
            ? options
            : options.filter((item) =>
                item.toLowerCase().replace(/\s+/g, '').includes(query.toLowerCase().replace(/\s+/g, ''))
            );

    return (
        <Combobox value={value} onChange={(val: string | null) => onChange(val ?? '')}>
            <div className="relative mt-1">
                <Combobox.Label className="block text-sm font-medium text-gray-700">{label}</Combobox.Label>
                <div className="relative w-full cursor-default overflow-hidden rounded-md border border-gray-300 bg-white text-left shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-teal-300 sm:text-sm">
                    <Combobox.Input
                        className="w-full border-none py-2 pl-3 pr-10 text-sm leading-5 text-gray-900 focus:ring-0"
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder="Select or type..."
                    />
                    <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
                        <ChevronUpDownIcon
                            className="h-5 w-5 text-gray-400"
                            aria-hidden="true"
                        />
                    </Combobox.Button>
                </div>
                <Transition
                    as={Fragment}
                    leave="transition ease-in duration-100"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                    afterLeave={() => setQuery('')}
                >
                    <Combobox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm z-50">
                        {filteredOptions.length === 0 && query !== '' ? (
                            <div className="relative cursor-default select-none py-2 px-4 text-gray-700">
                                Create "{query}"
                            </div>
                        ) : (
                            filteredOptions.map((item) => (
                                <Combobox.Option
                                    key={item}
                                    className={({ active }) =>
                                        `relative cursor-default select-none py-2 pl-10 pr-4 ${active ? 'bg-brand-primary text-white' : 'text-gray-900'
                                        }`
                                    }
                                    value={item}
                                >
                                    {({ selected, active }) => (
                                        <>
                                            <span
                                                className={`block truncate ${selected ? 'font-medium' : 'font-normal'
                                                    }`}
                                            >
                                                {item}
                                            </span>
                                            {selected ? (
                                                <span
                                                    className={`absolute inset-y-0 left-0 flex items-center pl-3 ${active ? 'text-white' : 'text-brand-primary'
                                                        }`}
                                                >
                                                    <CheckIcon className="h-5 w-5" aria-hidden="true" />
                                                </span>
                                            ) : null}
                                        </>
                                    )}
                                </Combobox.Option>
                            ))
                        )}
                    </Combobox.Options>
                </Transition>
            </div>
        </Combobox>
    );
}


export default function TraceForm({
    initialData,
    onSubmit,
    isSubmitting,
    submitLabel = 'Enregistrer',
    showDelete = false,
    onDelete,
    options = { directions: [], surfaces: [], locations: [] }
}: TraceFormProps) {
    // Form State
    const [name, setName] = useState(initialData.name || '');
    const [distance, setDistance] = useState(initialData.distance || 0);
    const [elevation, setElevation] = useState(initialData.elevation || 0);
    const [direction, setDirection] = useState(initialData.direction || '');
    const [surface, setSurface] = useState(initialData.surface || '');
    const [rating, setRating] = useState(initialData.rating || '⭐⭐⭐');
    const [description, setDescription] = useState(initialData.description || '');
    const [mapUrl, setMapUrl] = useState(initialData.mapUrl || '');
    const [start, setStart] = useState(initialData.start || '');
    const [end, setEnd] = useState(initialData.end || '');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onSubmit({
            name,
            distance,
            elevation,
            direction,
            surface,
            rating,
            description,
            mapUrl,
            start,
            end
        });
    };

    // Derived options (defaults if empty)
    const directionOptions = options.directions.length > 0 ? options.directions : ['Nord', 'Sud', 'Est', 'Ouest', 'Boucle'];
    const surfaceOptions = options.surfaces.length > 0 ? options.surfaces : ['Road', 'Gravel', 'MTB'];

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            {/* Top Section: Map & Stats (The "Bento" Header) */}
            <div className="rounded-lg overflow-hidden border border-gray-200 bg-gray-50 shadow-sm">
                <div className="h-64 sm:h-80 w-full relative group">
                    {initialData.polyline ? (
                        <MapPreview summaryPolyline={initialData.polyline} />
                    ) : (
                        <div className="h-full w-full flex items-center justify-center text-gray-500 bg-gray-100">
                            Pas de tracé disponible
                        </div>
                    )}
                </div>

                {/* Stats Overlay */}
                <div className="bg-white px-6 py-4 border-t border-gray-200 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Distance (km)</label>
                        <input
                            type="number"
                            step="0.1"
                            value={distance}
                            onChange={(e) => setDistance(parseFloat(e.target.value))}
                            className="block w-full text-lg font-bold text-gray-900 border-none p-0 focus:ring-0 bg-transparent placeholder-gray-300"
                            placeholder="0.0"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Dénivelé (m)</label>
                        <div className="flex items-center gap-2">
                            <input
                                type="number"
                                value={elevation}
                                onChange={(e) => setElevation(parseInt(e.target.value))}
                                className={`block w-full text-lg font-bold border-none p-0 focus:ring-0 bg-transparent placeholder-gray-300 ${elevation === 0 ? 'text-amber-600' : 'text-gray-900'}`}
                                placeholder="0"
                            />
                            {elevation === 0 && (
                                <ExclamationTriangleIcon className="h-5 w-5 text-amber-500" title="Attention: Dénivelé manquant" />
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Form Fields */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-200 bg-gray-50">
                    <h3 className="text-lg font-medium text-gray-900">Détails du Parcours</h3>
                    <p className="mt-1 text-sm text-gray-500">Informations générales et techniques.</p>
                </div>

                <div className="p-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                    {/* Name */}
                    <div className="sm:col-span-4">
                        <label className="block text-sm font-medium text-gray-700">Nom</label>
                        <input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-primary focus:ring-brand-primary sm:text-sm p-2 border"
                        />
                    </div>

                    {/* Rating */}
                    <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-gray-700">Difficulté</label>
                        <select
                            value={rating}
                            onChange={(e) => setRating(e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-primary focus:ring-brand-primary sm:text-sm p-2 border"
                        >
                            <option value="⭐">⭐ (Facile)</option>
                            <option value="⭐⭐">⭐⭐ (Moyen)</option>
                            <option value="⭐⭐⭐">⭐⭐⭐ (Difficile)</option>
                            <option value="⭐⭐⭐⭐">⭐⭐⭐⭐ (Expert)</option>
                        </select>
                    </div>

                    {/* Direction */}
                    <div className="sm:col-span-3">
                        <label className="block text-sm font-medium text-gray-700">Direction</label>
                        <select
                            value={direction}
                            onChange={(e) => setDirection(e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-primary focus:ring-brand-primary sm:text-sm p-2 border"
                        >
                            <option value="">Sélectionner...</option>
                            {directionOptions.map((opt) => (
                                <option key={opt} value={opt}>{opt}</option>
                            ))}
                        </select>
                    </div>

                    {/* Surface */}
                    <div className="sm:col-span-3">
                        <label className="block text-sm font-medium text-gray-700">Qualité de Route (Surface)</label>
                        <select
                            value={surface}
                            onChange={(e) => setSurface(e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-primary focus:ring-brand-primary sm:text-sm p-2 border"
                            title="Indique la qualité du revêtement (1 - Mauvais à 7 - Excellent)"
                        >
                            <option value="">Sélectionner...</option>
                            {surfaceOptions.map((opt) => (
                                <option key={opt} value={opt}>{opt}</option>
                            ))}
                        </select>
                    </div>

                    {/* Start Location */}
                    <div className="sm:col-span-3">
                        <LocationCombobox
                            label="Lieu de Départ"
                            value={start}
                            onChange={setStart}
                            options={options?.locations || []}
                        />
                    </div>

                    {/* End Location */}
                    <div className="sm:col-span-3">
                        <LocationCombobox
                            label="Lieu d'Arrivée"
                            value={end}
                            onChange={setEnd}
                            options={options?.locations || []}
                        />
                    </div>

                    {/* Description */}
                    <div className="sm:col-span-6">
                        <label className="block text-sm font-medium text-gray-700">Description</label>
                        <textarea
                            rows={3}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-primary focus:ring-brand-primary sm:text-sm p-2 border"
                        />
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-200">
                    {showDelete && onDelete ? (
                        <button
                            type="button"
                            onClick={onDelete}
                            className="text-red-600 hover:text-red-800 text-sm font-medium flex items-center gap-1"
                        >
                            <span>Supprimer</span>
                        </button>
                    ) : (
                        <div></div>
                    )}

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="inline-flex justify-center rounded-md border border-transparent bg-brand-primary py-2 px-6 text-sm font-medium text-white shadow-sm hover:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {isSubmitting ? 'Enregistrement...' : submitLabel}
                    </button>
                </div>
            </div>
        </form>
    );
}
