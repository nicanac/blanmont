'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { toast } from 'sonner';

export default function NewEventPage(): React.ReactElement {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    isoDate: '',
    location: '',
    distances: '',
    departure: '',
    address: '',
    remarks: '',
    alternative: '',
    group: 'Blanmont',
    gpxUrl: '',
  });

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/admin/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success('Événement créé avec succès !');
        router.push('/admin/events');
        router.refresh();
      } else {
        toast.error("Erreur lors de la création de l'événement");
      }
    } catch (error) {
      console.error('Error creating event:', error);
      toast.error("Erreur lors de la création de l'événement");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/events"
          className="rounded-md p-2 text-ink-3 dark:text-snow-3 hover:bg-paper-2 dark:hover:bg-night-line transition-colors duration-150 min-h-[44px] min-w-[44px] inline-flex items-center justify-center"
        >
          <ArrowLeftIcon className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-ink dark:text-white">Nouvel Événement</h1>
          <p className="text-sm text-ink-3 dark:text-snow-3">Ajouter une sortie au calendrier</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-lg border border-line dark:border-night-line bg-white dark:bg-night-2 p-6 shadow-xs">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Date */}
            <div>
              <label htmlFor="isoDate" className="mb-2 block text-sm font-medium text-ink dark:text-white">
                Date *
              </label>
              <input
                type="date"
                id="isoDate"
                required
                value={formData.isoDate}
                onChange={(e) => setFormData({ ...formData, isoDate: e.target.value })}
                className="w-full rounded-md border border-line dark:border-night-line bg-white dark:bg-night-3 px-4 py-2 text-sm text-ink dark:text-white focus:border-brand focus:outline-hidden focus:ring-1 focus:ring-brand transition-colors duration-150"
              />
            </div>

            {/* Location */}
            <div>
              <label htmlFor="location" className="mb-2 block text-sm font-medium text-ink dark:text-white">
                Lieu *
              </label>
              <input
                type="text"
                id="location"
                required
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full rounded-md border border-line dark:border-night-line bg-white dark:bg-night-3 px-4 py-2 text-sm text-ink dark:text-white focus:border-brand focus:outline-hidden focus:ring-1 focus:ring-brand transition-colors duration-150"
                placeholder="Blanmont"
              />
            </div>

            {/* Departure */}
            <div>
              <label htmlFor="departure" className="mb-2 block text-sm font-medium text-ink dark:text-white">
                Heure de départ
              </label>
              <input
                type="text"
                id="departure"
                value={formData.departure}
                onChange={(e) => setFormData({ ...formData, departure: e.target.value })}
                className="w-full rounded-md border border-line dark:border-night-line bg-white dark:bg-night-3 px-4 py-2 text-sm text-ink dark:text-white focus:border-brand focus:outline-hidden focus:ring-1 focus:ring-brand transition-colors duration-150"
                placeholder="09:00"
              />
            </div>

            {/* Distances */}
            <div>
              <label htmlFor="distances" className="mb-2 block text-sm font-medium text-ink dark:text-white">
                Distances
              </label>
              <input
                type="text"
                id="distances"
                value={formData.distances}
                onChange={(e) => setFormData({ ...formData, distances: e.target.value })}
                className="w-full rounded-md border border-line dark:border-night-line bg-white dark:bg-night-3 px-4 py-2 text-sm text-ink dark:text-white focus:border-brand focus:outline-hidden focus:ring-1 focus:ring-brand transition-colors duration-150"
                placeholder="70/90/110 km"
              />
            </div>

            {/* Address */}
            <div className="md:col-span-2">
              <label htmlFor="address" className="mb-2 block text-sm font-medium text-ink dark:text-white">
                Adresse
              </label>
              <input
                type="text"
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full rounded-md border border-line dark:border-night-line bg-white dark:bg-night-3 px-4 py-2 text-sm text-ink dark:text-white focus:border-brand focus:outline-hidden focus:ring-1 focus:ring-brand transition-colors duration-150"
                placeholder="Place de Blanmont, 1315 Incourt"
              />
            </div>

            {/* Alternative */}
            <div className="md:col-span-2">
              <label htmlFor="alternative" className="mb-2 block text-sm font-medium text-ink dark:text-white">
                Alternative (mauvais temps)
              </label>
              <input
                type="text"
                id="alternative"
                value={formData.alternative}
                onChange={(e) => setFormData({ ...formData, alternative: e.target.value })}
                className="w-full rounded-md border border-line dark:border-night-line bg-white dark:bg-night-3 px-4 py-2 text-sm text-ink dark:text-white focus:border-brand focus:outline-hidden focus:ring-1 focus:ring-brand transition-colors duration-150"
                placeholder="Sortie VTT/Gravel si pluie"
              />
            </div>

            {/* Remarks */}
            <div className="md:col-span-2">
              <label htmlFor="remarks" className="mb-2 block text-sm font-medium text-ink dark:text-white">
                Remarques
              </label>
              <textarea
                id="remarks"
                rows={3}
                value={formData.remarks}
                onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                className="w-full rounded-md border border-line dark:border-night-line bg-white dark:bg-night-3 px-4 py-2 text-sm text-ink dark:text-white focus:border-brand focus:outline-hidden focus:ring-1 focus:ring-brand transition-colors duration-150"
                placeholder="Informations supplémentaires..."
              />
            </div>

            {/* GPX / Garmin / Strava Trace Link */}
            <div className="md:col-span-2">
              <label htmlFor="gpxUrl" className="mb-2 block text-sm font-medium text-ink dark:text-white">
                Lien de la trace / GPX (Garmin, Strava, Komoot ou URL de fichier .gpx)
              </label>
              <input
                type="url"
                id="gpxUrl"
                value={formData.gpxUrl}
                onChange={(e) => setFormData({ ...formData, gpxUrl: e.target.value })}
                className="w-full rounded-md border border-line dark:border-night-line bg-white dark:bg-night-3 px-4 py-2 text-sm text-ink dark:text-white focus:border-brand focus:outline-hidden focus:ring-1 focus:ring-brand transition-colors duration-150"
                placeholder="https://connect.garmin.com/modern/course/... ou https://www.strava.com/routes/..."
              />
              <p className="mt-1 text-xs text-ink-3 dark:text-snow-3">
                Ce lien sera directement accessible sur le calendrier et dans le bloc « Prochain
                Rendez-vous » pour télécharger ou visualiser la trace.
              </p>
            </div>

            {/* Group */}
            <div>
              <label htmlFor="group" className="mb-2 block text-sm font-medium text-ink dark:text-white">
                Groupe
              </label>
              <select
                id="group"
                value={formData.group}
                onChange={(e) => setFormData({ ...formData, group: e.target.value })}
                className="w-full rounded-md border border-line dark:border-night-line bg-white dark:bg-night-3 px-4 py-2 text-sm text-ink dark:text-white focus:border-brand focus:outline-hidden focus:ring-1 focus:ring-brand transition-colors duration-150"
              >
                <option value="Blanmont">Blanmont</option>
                <option value="Gravel">Gravel</option>
                <option value="VTT">VTT</option>
                <option value="Spécial">Spécial</option>
              </select>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Link
            href="/admin/events"
            className="rounded-md border border-line dark:border-night-line bg-white dark:bg-night-2 px-6 py-2 text-sm font-medium text-ink-2 dark:text-snow-3 hover:bg-paper-2 dark:hover:bg-night-line transition-colors duration-150 min-h-[44px] inline-flex items-center justify-center"
          >
            Annuler
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-md bg-brand px-6 py-2 text-sm font-medium text-white hover:bg-brand-strong transition-colors duration-150 disabled:opacity-50 min-h-[44px] inline-flex items-center justify-center cursor-pointer"
          >
            {isSubmitting ? 'Création...' : "Créer l'événement"}
          </button>
        </div>
      </form>
    </div>
  );
}
