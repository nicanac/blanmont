'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { gpx } from '@tmcw/togeojson';

// Dynamic import for Map to avoid SSR issues with Leaflet
const MapPreview = dynamic(() => import('./MapPreview'), {
    ssr: false,
    loading: () => <div className="h-full w-full flex items-center justify-center bg-gray-100">Chargement de la carte...</div>
});

export default function AddTraceForm() {
    const [formData, setFormData] = useState({
        name: '',
        date: '',
        distance: '',
        elevation: '',
        direction: '',
        start: '',
        end: '',
        komootLink: '',
        gpxLink: '',
        photoLink: '',
        roadQuality: '',
        rating: '',
        status: 'Done',
        note: ''
    });
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    // GPX State
    const [gpxGeoJson, setGpxGeoJson] = useState<any>(null);
    const [isParsingGpx, setIsParsingGpx] = useState(false);
    const [mapKey, setMapKey] = useState(0);
    const [isMapOpen, setIsMapOpen] = useState(false); // Collapsible: closed by default
    const [gpxContent, setGpxContent] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('loading');
        setMessage('');

        try {
            // Send form data AND the raw GPX content
            const payload = { ...formData, gpxContent };

            const res = await fetch('/api/admin/add-trace', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to submit');
            }

            setStatus('success');
            setMessage('Parcours ajouté avec succès !');
            setFormData({
                name: '', date: '', distance: '', elevation: '',
                direction: '', start: '', end: '',
                komootLink: '', gpxLink: '', photoLink: '',
                roadQuality: '', rating: '', status: 'Done', note: ''
            });
            setGpxGeoJson(null);
            setGpxContent(null);
            setIsMapOpen(false); // Reset map state
        } catch (err: any) {
            setStatus('error');
            setMessage(err.message);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Auto-generate GPX link from Komoot URL
    useEffect(() => {
        const komootUrl = formData.komootLink;
        if (!komootUrl) return;

        // Try to match standard tour URL
        const match = komootUrl.match(/tour\/(\d+)/);
        if (match && match[1]) {
            const tourId = match[1];
            const downloadUrl = `https://www.komoot.com/tour/${tourId}/download`;

            // Only auto-fill if currently empty to avoid overwriting user custom input
            if (!formData.gpxLink) {
                setFormData(prev => ({ ...prev, gpxLink: downloadUrl }));
            }
        }
    }, [formData.komootLink]);

    // --- GPX File Upload & Parsing ---
    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsParsingGpx(true);
        setIsMapOpen(true); // Auto-open map

        const reader = new FileReader();

        reader.onload = (event) => {
            try {
                const text = event.target?.result as string;
                if (!text) return;

                setGpxContent(text); // Save raw content

                // Parse XML
                const parser = new DOMParser();
                const gpxDoc = parser.parseFromString(text, 'text/xml');

                // Convert to GeoJSON
                const geoJson = gpx(gpxDoc);
                setGpxGeoJson(geoJson);
                setMapKey(prev => prev + 1); // Force map re-render

                // Calculate Stats
                const { totalDistance, totalElevation } = calculateStats(geoJson);

                setFormData(prev => ({
                    ...prev,
                    distance: (totalDistance / 1000).toFixed(1), // km
                    elevation: Math.round(totalElevation).toString(), // m
                }));

            } catch (err) {
                console.error('Error parsing GPX:', err);
                setMessage('Erreur lors de la lecture du fichier GPX.');
            } finally {
                setIsParsingGpx(false);
            }
        };

        reader.readAsText(file);
    };

    // Helper: Calculate stats from GeoJSON
    const calculateStats = (geoJson: any) => {
        let totalDistance = 0;
        let totalElevation = 0;

        const getDist = (c1: number[], c2: number[]) => {
            const R = 6371e3;
            const lat1 = c1[1] * Math.PI / 180;
            const lat2 = c2[1] * Math.PI / 180;
            const dLat = (c2[1] - c1[1]) * Math.PI / 180;
            const dLon = (c2[0] - c1[0]) * Math.PI / 180;
            const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(lat1) * Math.cos(lat2) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2);
            return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        };

        if (geoJson.features) {
            geoJson.features.forEach((feature: any) => {
                if (feature.geometry.type === 'LineString') {
                    const coords = feature.geometry.coordinates;
                    for (let i = 0; i < coords.length - 1; i++) {
                        const p1 = coords[i];
                        const p2 = coords[i + 1];
                        totalDistance += getDist(p1, p2);
                        if (p1.length > 2 && p2.length > 2) {
                            const diff = p2[2] - p1[2];
                            if (diff > 0) totalElevation += diff;
                        }
                    }
                }
            });
        }
        return { totalDistance, totalElevation };
    };

    // Helper to get embed URL from Komoot link
    const getKomootEmbedUrl = (url: string) => {
        if (!url) return null;
        try {
            const urlObj = new URL(url);
            const match = urlObj.pathname.match(/(.*\/tour\/\d+)/);
            if (match && match[1]) {
                return `${urlObj.origin}${match[1]}/embed?profile=1`;
            }
        } catch (e) {
            return null;
        }
        return null;
    };

    const mapEmbedUrl = getKomootEmbedUrl(formData.komootLink);

    return (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden max-w-5xl mx-auto">

            {/* COLLAPSIBLE HEADER */}
            <div
                className="bg-gray-50 px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-gray-100 transition-colors border-b border-gray-200"
                onClick={() => setIsMapOpen(!isMapOpen)}
            >
                <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 7m0 13V7m0 0L9 7" />
                    </svg>
                    <h3 className="text-sm font-medium text-gray-900">
                        {isMapOpen ? 'Masquer la carte' : 'Afficher la carte'}
                    </h3>
                </div>
                <button type="button" className="text-gray-400">
                    {isMapOpen ? (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                    ) : (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    )}
                </button>
            </div>

            {/* MAP SECTION (CONDITIONAL) */}
            {isMapOpen && (
                <div className="w-full h-64 sm:h-80 lg:h-96 bg-gray-50 border-b border-gray-200 relative animate-in slide-in-from-top-4 duration-300">
                    {gpxGeoJson ? (
                        <MapPreview key={mapKey} geoJson={gpxGeoJson} />
                    ) : mapEmbedUrl ? (
                        <iframe
                            src={mapEmbedUrl}
                            width="100%"
                            height="100%"
                            frameBorder="0"
                            allowFullScreen
                            className="absolute inset-0 w-full h-full"
                        ></iframe>
                    ) : (
                        <div className="h-full w-full flex flex-col items-center justify-center text-gray-400 p-6">
                            {isParsingGpx ? (
                                <div className="animate-pulse flex flex-col items-center">
                                    <svg className="animate-spin h-8 w-8 text-blue-500 mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <span>Lecture du fichier GPX...</span>
                                </div>
                            ) : (
                                <>
                                    <svg className="h-12 w-12 text-gray-300 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 7m0 13V7m0 0L9 7" />
                                    </svg>
                                    <p className="text-sm">Aperçu de la carte</p>
                                </>
                            )}
                        </div>
                    )}

                    {/* Floating Stats Summary (Optional overlay) */}
                    {(formData.distance || formData.elevation) && (
                        <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm p-3 rounded-lg shadow-md border border-gray-200 text-xs sm:text-sm flex gap-4 z-[400]">
                            <div>
                                <span className="block text-gray-500 font-medium">Distance</span>
                                <span className="block font-bold text-gray-900">{formData.distance ? `${formData.distance} km` : '-'}</span>
                            </div>
                            <div>
                                <span className="block text-gray-500 font-medium">Dénivelé</span>
                                <span className="block font-bold text-gray-900">{formData.elevation ? `${formData.elevation} m` : '-'}</span>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* FORM SECTION */}
            <div className="py-8 px-4 sm:px-6 lg:px-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-8">Détails du Parcours</h2>

                <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl mx-auto">

                    {/* SECTION: GENERAL */}
                    <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Informations Générales</h3>
                        <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                            <div className="sm:col-span-4">
                                <label className="block text-sm font-medium text-gray-700">Nom du Parcours</label>
                                <input
                                    type="text"
                                    name="name"
                                    required
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-primary focus:ring-brand-primary sm:text-sm p-2 border"
                                    value={formData.name}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="sm:col-span-2">
                                <label className="block text-sm font-medium text-gray-700">Date</label>
                                <input
                                    type="date"
                                    name="date"
                                    required
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-primary focus:ring-brand-primary sm:text-sm p-2 border"
                                    value={formData.date}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="sm:col-span-3">
                                <label className="block text-sm font-medium text-gray-700">Statut</label>
                                <select
                                    name="status"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-primary focus:ring-brand-primary sm:text-sm p-2 border"
                                    value={formData.status}
                                    onChange={handleChange}
                                >
                                    <option value="Done">Done</option>
                                    <option value="To rate">To rate</option>
                                    <option value="In Progress">In Progress</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* SECTION: STATS & LOC */}
                    <div className="border-t border-gray-200 pt-8">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Localisation & Stats</h3>
                        <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">

                            <div className="col-span-full bg-blue-50 p-4 rounded-md border border-blue-100">
                                <label className="block text-sm font-medium text-blue-900 mb-2">
                                    Importer un fichier GPX (Recommandé)
                                </label>
                                <div className="flex flex-col sm:flex-row gap-4 items-center">
                                    <input
                                        type="file"
                                        accept=".gpx"
                                        onChange={handleFileUpload}
                                        className="block w-full text-sm text-gray-500
                                            file:mr-4 file:py-2 file:px-4
                                            file:rounded-full file:border-0
                                            file:text-sm file:font-semibold
                                            file:bg-blue-100 file:text-blue-700
                                            hover:file:bg-blue-200"
                                    />
                                    <p className="text-xs text-blue-600 sm:max-w-xs">
                                        Calcule auto de la distance, dénivelé et affiche la carte ci-dessus.
                                    </p>
                                </div>
                            </div>

                            <div className="sm:col-span-2">
                                <label className="block text-sm font-medium text-gray-700">Direction</label>
                                <select
                                    name="direction"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-primary focus:ring-brand-primary sm:text-sm p-2 border"
                                    value={formData.direction}
                                    onChange={handleChange}
                                >
                                    <option value="">Choisir...</option>
                                    <option value="North">↑ Nord</option>
                                    <option value="South">↓ Sud</option>
                                    <option value="East">→ Est</option>
                                    <option value="West">← Ouest</option>
                                    <option value="North-East">↗ Nord-Est</option>
                                    <option value="North-West">↖ Nord-Ouest</option>
                                    <option value="South-East">↘ Sud-Est</option>
                                    <option value="South-West">↙ Sud-Ouest</option>
                                </select>
                            </div>

                            <div className="sm:col-span-2">
                                <label className="block text-sm font-medium text-gray-700">Départ</label>
                                <input
                                    type="text"
                                    name="start"
                                    placeholder="Ville"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-primary focus:ring-brand-primary sm:text-sm p-2 border"
                                    value={formData.start}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="sm:col-span-2">
                                <label className="block text-sm font-medium text-gray-700">Arrivée</label>
                                <input
                                    type="text"
                                    name="end"
                                    placeholder="Ville"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-primary focus:ring-brand-primary sm:text-sm p-2 border"
                                    value={formData.end}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="sm:col-span-3">
                                <label className="block text-sm font-medium text-gray-700">Distance (km)</label>
                                <input
                                    type="number"
                                    name="distance"
                                    step="0.1"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-primary focus:ring-brand-primary sm:text-sm p-2 border"
                                    value={formData.distance}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="sm:col-span-3">
                                <label className="block text-sm font-medium text-gray-700">Dénivelé (D+)</label>
                                <input
                                    type="number"
                                    name="elevation"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-primary focus:ring-brand-primary sm:text-sm p-2 border"
                                    value={formData.elevation}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                    </div>

                    {/* SECTION: RATINGS */}
                    <div className="border-t border-gray-200 pt-8">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Évaluation</h3>
                        <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                            <div className="sm:col-span-3">
                                <label className="block text-sm font-medium text-gray-700">Qualité Route</label>
                                <select
                                    name="roadQuality"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-primary focus:ring-brand-primary sm:text-sm p-2 border"
                                    value={formData.roadQuality}
                                    onChange={handleChange}
                                >
                                    <option value="">...</option>
                                    <option value="1 - bad">1 - bad</option>
                                    <option value="2 - bad -> average">2 - bad - average</option>
                                    <option value="3 - average -> good">3 - average - good</option>
                                    <option value="4 - good">4 - good</option>
                                    <option value="5 - good -> very good">5 - good - very good</option>
                                    <option value="6 - very good -> excellent">6 - very good - excellent</option>
                                    <option value="7 - Excellent">7 - Excellent</option>
                                </select>
                            </div>
                            <div className="sm:col-span-3">
                                <label className="block text-sm font-medium text-gray-700">Note Globale</label>
                                <select
                                    name="rating"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-primary focus:ring-brand-primary sm:text-sm p-2 border"
                                    value={formData.rating}
                                    onChange={handleChange}
                                >
                                    <option value="">...</option>
                                    <option value="⭐">⭐</option>
                                    <option value="⭐⭐">⭐⭐</option>
                                    <option value="⭐⭐⭐">⭐⭐⭐</option>
                                    <option value="⭐⭐⭐⭐">⭐⭐⭐⭐</option>
                                    <option value="⭐⭐⭐⭐⭐">⭐⭐⭐⭐⭐</option>
                                </select>
                            </div>
                            <div className="col-span-full">
                                <label className="block text-sm font-medium text-gray-700">Notes / Remarques</label>
                                <textarea
                                    name="note"
                                    rows={2}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-primary focus:ring-brand-primary sm:text-sm p-2 border"
                                    value={formData.note}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                    </div>

                    {/* SECTION: LINKS */}
                    <div className="border-t border-gray-200 pt-8">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Liens Externes</h3>
                        <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                            <div className="col-span-full">
                                <label className="block text-sm font-medium text-gray-700">Lien Komoot (Optionnel)</label>
                                <input
                                    type="url"
                                    name="komootLink"
                                    placeholder="https://www.komoot.fr/tour/..."
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-primary focus:ring-brand-primary sm:text-sm p-2 border"
                                    value={formData.komootLink}
                                    onChange={handleChange}
                                />
                                <p className="mt-1 text-xs text-gray-500">
                                    Si vide, la carte au-dessus se basera sur l'import GPX.
                                </p>
                            </div>
                            <div className="sm:col-span-3">
                                <label className="block text-sm font-medium text-gray-700">Fichier GPX (URL de référence)</label>
                                <input
                                    type="url"
                                    name="gpxLink"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-primary focus:ring-brand-primary sm:text-sm p-2 border"
                                    value={formData.gpxLink}
                                    onChange={handleChange}
                                />
                                <p className="mt-1 text-xs text-gray-500">
                                    Pour le téléchargement par les membres (ex: lien Google Drive).
                                </p>
                            </div>
                            <div className="sm:col-span-3">
                                <label className="block text-sm font-medium text-gray-700">Photo (URL)</label>
                                <input
                                    type="url"
                                    name="photoLink"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-primary focus:ring-brand-primary sm:text-sm p-2 border"
                                    value={formData.photoLink}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 pb-8">
                        <button
                            type="submit"
                            disabled={status === 'loading'}
                            className="w-full flex justify-center py-4 px-4 border border-transparent rounded-lg shadow-md text-base font-medium text-white bg-brand-primary hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary disabled:opacity-50 transition-all transform hover:scale-[1.02]"
                        >
                            {status === 'loading' ? 'Envoi en cours...' : 'Ajouter le Parcours'}
                        </button>
                        {status === 'success' && <p className="text-sm text-green-600 text-center mt-3">{message}</p>}
                        {status === 'error' && <p className="text-sm text-red-600 text-center mt-3">{message}</p>}
                    </div>

                </form>
            </div>
        </div>
    );
}
