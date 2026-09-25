'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { use } from 'react';
import { toast } from 'sonner';
import { Spinner } from '@/app/components/ui/Spinner';

interface EditEventPageProps {
  params: Promise<{ id: string }>;
}

export default function EditEventPage({ params }: EditEventPageProps): React.ReactElement {
  const { id } = use(params);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
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

  useEffect(() => {
    const fetchEvent = async (): Promise<void> => {
      try {
        const response = await fetch(`/api/admin/events/${id}`);
        if (response.ok) {
          const data = await response.json();
          setFormData({
            isoDate: data.isoDate || '',
            location: data.location || '',
            distances: data.distances || '',
            departure: data.departure || '',
            address: data.address || '',
            remarks: data.remarks || '',
            alternative: data.alternative || '',
            group: data.group || 'Blanmont',
            gpxUrl: data.gpxUrl || '',
          });
        }
      } catch (error) {
        console.error('Error fetching event:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/admin/events/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success('Événement mis à jour avec succès !');
        router.push('/admin/events');
        router.refresh();
      } else {
        toast.error("Erreur lors de la mise à jour de l'événement");
      }
    } catch (error) {
      console.error('Error updating event:', error);
      toast.error("Erreur lors de la mise à jour de l'événement");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner size="md" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/events"
          className="rounded-sm p-2 text-ink-3 dark:text-snow-3 hover:bg-paper-2 dark:hover:bg-night-line transition-colors duration-150 min-h-[44px] min-w-[44px] inline-flex items-center justify-center"
        >
          <ArrowLeftIcon className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-ink dark:text-snow-1 font-semiwide">Modifier l&apos;Événement</h1>
          <p className="text-sm text-ink-3 dark:text-snow-3">Modifier les détails de la sortie</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-md border border-line dark:border-night-line bg-paper dark:bg-night-2 p-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Date */}
            <div>
              <label htmlFor="isoDate" className="mb-2 block text-sm font-medium text-ink dark:text-snow-1 font-mono">
                Date *
              </label>
              <input
                type="date"
                id="isoDate"
                required
                value={formData.isoDate}
                onChange={(e) => setFormData({ ...formData, isoDate: e.target.value })}
                className="w-full rounded-sm border border-line dark:border-night-line bg-paper-2 dark:bg-night px-4 py-2 text-sm text-ink dark:text-snow-1 font-mono focus:border-brand focus:outline-hidden transition-colors duration-150"
              />
            </div>

            {/* Location */}
            <div>
              <label htmlFor="location" className="mb-2 block text-sm font-medium text-ink dark:text-snow-1">
                Lieu *
              </label>
              <input
                type="text"
                id="location"
                required
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full rounded-sm border border-line dark:border-night-line bg-paper-2 dark:bg-night px-4 py-2 text-sm text-ink dark:text-snow-1 focus:border-brand focus:outline-hidden transition-colors duration-150"
              />
            </div>

            {/* Departure */}
            <div>
              <label htmlFor="departure" className="mb-2 block text-sm font-medium text-ink dark:text-snow-1 font-mono">
                Heure de départ
              </label>
              <input
                type="text"
                id="departure"
                value={formData.departure}
                onChange={(e) => setFormData({ ...formData, departure: e.target.value })}
                className="w-full rounded-sm border border-line dark:border-night-line bg-paper-2 dark:bg-night px-4 py-2 text-sm text-ink dark:text-snow-1 font-mono focus:border-brand focus:outline-hidden transition-colors duration-150"
              />
            </div>

            {/* Distances */}
            <div>
              <label htmlFor="distances" className="mb-2 block text-sm font-medium text-ink dark:text-snow-1 font-mono">
                Distances
              </label>
              <input
                type="text"
                id="distances"
                value={formData.distances}
                onChange={(e) => setFormData({ ...formData, distances: e.target.value })}
                className="w-full rounded-sm border border-line dark:border-night-line bg-paper-2 dark:bg-night px-4 py-2 text-sm text-ink dark:text-snow-1 font-mono focus:border-brand focus:outline-hidden transition-colors duration-150"
              />
            </div>

            {/* Address */}
            <div className="md:col-span-2">
              <label htmlFor="address" className="mb-2 block text-sm font-medium text-ink dark:text-snow-1">
                Adresse
              </label>
              <input
                type="text"
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full rounded-sm border border-line dark:border-night-line bg-paper-2 dark:bg-night px-4 py-2 text-sm text-ink dark:text-snow-1 focus:border-brand focus:outline-hidden transition-colors duration-150"
              />
            </div>

            {/* Alternative */}
            <div className="md:col-span-2">
              <label htmlFor="alternative" className="mb-2 block text-sm font-medium text-ink dark:text-snow-1">
                Alternative (mauvais temps)
              </label>
              <input
                type="text"
                id="alternative"
                value={formData.alternative}
                onChange={(e) => setFormData({ ...formData, alternative: e.target.value })}
                className="w-full rounded-sm border border-line dark:border-night-line bg-paper-2 dark:bg-night px-4 py-2 text-sm text-ink dark:text-snow-1 focus:border-brand focus:outline-hidden transition-colors duration-150"
              />
            </div>

            {/* Remarks */}
            <div className="md:col-span-2">
              <label htmlFor="remarks" className="mb-2 block text-sm font-medium text-ink dark:text-snow-1">
                Remarques
              </label>
              <textarea
                id="remarks"
                rows={3}
                value={formData.remarks}
                onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                className="w-full rounded-sm border border-line dark:border-night-line bg-paper-2 dark:bg-night px-4 py-2 text-sm text-ink dark:text-snow-1 focus:border-brand focus:outline-hidden transition-colors duration-150"
              />
            </div>

            {/* GPX / Garmin / Strava Trace Link */}
            <div className="md:col-span-2">
              <label htmlFor="gpxUrl" className="mb-2 block text-sm font-medium text-ink dark:text-snow-1">
                Lien de la trace / GPX (Garmin, Strava, Komoot ou URL de fichier .gpx)
              </label>
              <input
                type="url"
                id="gpxUrl"
                value={formData.gpxUrl}
                onChange={(e) => setFormData({ ...formData, gpxUrl: e.target.value })}
                className="w-full rounded-sm border border-line dark:border-night-line bg-paper-2 dark:bg-night px-4 py-2 text-sm text-ink dark:text-snow-1 font-mono focus:border-brand focus:outline-hidden transition-colors duration-150"
                placeholder="https://connect.garmin.com/modern/course/... ou https://www.strava.com/routes/..."
              />
              <p className="mt-1 text-xs text-ink-3 dark:text-snow-3">
                Ce lien sera directement accessible sur le calendrier et dans le bloc « Prochain
                Rendez-vous » pour télécharger ou visualiser la trace.
              </p>
            </div>

            {/* Group */}
            <div>
              <label htmlFor="group" className="mb-2 block text-sm font-medium text-ink dark:text-snow-1">
                Groupe
              </label>
              <select
                id="group"
                value={formData.group}
                onChange={(e) => setFormData({ ...formData, group: e.target.value })}
                className="w-full rounded-sm border border-line dark:border-night-line bg-paper-2 dark:bg-night px-4 py-2 text-sm text-ink dark:text-snow-1 focus:border-brand focus:outline-hidden transition-colors duration-150"
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
            className="rounded-sm border border-line dark:border-night-line bg-paper dark:bg-night-2 px-6 py-2 text-sm font-medium text-ink-2 dark:text-snow-3 hover:bg-paper-2 dark:hover:bg-night-line transition-colors duration-150 min-h-[44px] inline-flex items-center justify-center"
          >
            Annuler
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-sm bg-brand px-6 py-2 text-sm font-medium text-white hover:bg-brand-strong transition-colors duration-150 disabled:opacity-50 min-h-[44px] inline-flex items-center justify-center cursor-pointer font-mono uppercase tracking-wider"
          >
            {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>
      </form>
    </div>
  );
}
