'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { use } from 'react';
import { toast } from 'sonner';

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
        <div className="h-8 w-8 md:h-8 md:w-8 animate-spin rounded-full border-2 border-[#e03e3e] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/events"
          className="rounded-md p-2 text-[#5c6370] dark:text-[#a7adbb] hover:bg-[#f2efe9] dark:hover:bg-[#262b38] transition-colors duration-150 min-h-[44px] min-w-[44px] inline-flex items-center justify-center"
        >
          <ArrowLeftIcon className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-[#101216] dark:text-white">Modifier l&apos;Événement</h1>
          <p className="text-sm text-[#5c6370] dark:text-[#a7adbb]">Modifier les détails de la sortie</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-lg border border-[#e4e0d8] dark:border-[#262b38] bg-white dark:bg-[#161922] p-6 shadow-xs">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Date */}
            <div>
              <label htmlFor="isoDate" className="mb-2 block text-sm font-medium text-[#101216] dark:text-white">
                Date *
              </label>
              <input
                type="date"
                id="isoDate"
                required
                value={formData.isoDate}
                onChange={(e) => setFormData({ ...formData, isoDate: e.target.value })}
                className="w-full rounded-md border border-[#e4e0d8] dark:border-[#262b38] bg-white dark:bg-[#1d2128] px-4 py-2 text-sm text-[#101216] dark:text-white focus:border-[#e03e3e] focus:outline-hidden focus:ring-1 focus:ring-[#e03e3e] transition-colors duration-150"
              />
            </div>

            {/* Location */}
            <div>
              <label htmlFor="location" className="mb-2 block text-sm font-medium text-[#101216] dark:text-white">
                Lieu *
              </label>
              <input
                type="text"
                id="location"
                required
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full rounded-md border border-[#e4e0d8] dark:border-[#262b38] bg-white dark:bg-[#1d2128] px-4 py-2 text-sm text-[#101216] dark:text-white focus:border-[#e03e3e] focus:outline-hidden focus:ring-1 focus:ring-[#e03e3e] transition-colors duration-150"
              />
            </div>

            {/* Departure */}
            <div>
              <label htmlFor="departure" className="mb-2 block text-sm font-medium text-[#101216] dark:text-white">
                Heure de départ
              </label>
              <input
                type="text"
                id="departure"
                value={formData.departure}
                onChange={(e) => setFormData({ ...formData, departure: e.target.value })}
                className="w-full rounded-md border border-[#e4e0d8] dark:border-[#262b38] bg-white dark:bg-[#1d2128] px-4 py-2 text-sm text-[#101216] dark:text-white focus:border-[#e03e3e] focus:outline-hidden focus:ring-1 focus:ring-[#e03e3e] transition-colors duration-150"
              />
            </div>

            {/* Distances */}
            <div>
              <label htmlFor="distances" className="mb-2 block text-sm font-medium text-[#101216] dark:text-white">
                Distances
              </label>
              <input
                type="text"
                id="distances"
                value={formData.distances}
                onChange={(e) => setFormData({ ...formData, distances: e.target.value })}
                className="w-full rounded-md border border-[#e4e0d8] dark:border-[#262b38] bg-white dark:bg-[#1d2128] px-4 py-2 text-sm text-[#101216] dark:text-white focus:border-[#e03e3e] focus:outline-hidden focus:ring-1 focus:ring-[#e03e3e] transition-colors duration-150"
              />
            </div>

            {/* Address */}
            <div className="md:col-span-2">
              <label htmlFor="address" className="mb-2 block text-sm font-medium text-[#101216] dark:text-white">
                Adresse
              </label>
              <input
                type="text"
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full rounded-md border border-[#e4e0d8] dark:border-[#262b38] bg-white dark:bg-[#1d2128] px-4 py-2 text-sm text-[#101216] dark:text-white focus:border-[#e03e3e] focus:outline-hidden focus:ring-1 focus:ring-[#e03e3e] transition-colors duration-150"
              />
            </div>

            {/* Alternative */}
            <div className="md:col-span-2">
              <label htmlFor="alternative" className="mb-2 block text-sm font-medium text-[#101216] dark:text-white">
                Alternative (mauvais temps)
              </label>
              <input
                type="text"
                id="alternative"
                value={formData.alternative}
                onChange={(e) => setFormData({ ...formData, alternative: e.target.value })}
                className="w-full rounded-md border border-[#e4e0d8] dark:border-[#262b38] bg-white dark:bg-[#1d2128] px-4 py-2 text-sm text-[#101216] dark:text-white focus:border-[#e03e3e] focus:outline-hidden focus:ring-1 focus:ring-[#e03e3e] transition-colors duration-150"
              />
            </div>

            {/* Remarks */}
            <div className="md:col-span-2">
              <label htmlFor="remarks" className="mb-2 block text-sm font-medium text-[#101216] dark:text-white">
                Remarques
              </label>
              <textarea
                id="remarks"
                rows={3}
                value={formData.remarks}
                onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                className="w-full rounded-md border border-[#e4e0d8] dark:border-[#262b38] bg-white dark:bg-[#1d2128] px-4 py-2 text-sm text-[#101216] dark:text-white focus:border-[#e03e3e] focus:outline-hidden focus:ring-1 focus:ring-[#e03e3e] transition-colors duration-150"
              />
            </div>

            {/* GPX / Garmin / Strava Trace Link */}
            <div className="md:col-span-2">
              <label htmlFor="gpxUrl" className="mb-2 block text-sm font-medium text-[#101216] dark:text-white">
                Lien de la trace / GPX (Garmin, Strava, Komoot ou URL de fichier .gpx)
              </label>
              <input
                type="url"
                id="gpxUrl"
                value={formData.gpxUrl}
                onChange={(e) => setFormData({ ...formData, gpxUrl: e.target.value })}
                className="w-full rounded-md border border-[#e4e0d8] dark:border-[#262b38] bg-white dark:bg-[#1d2128] px-4 py-2 text-sm text-[#101216] dark:text-white focus:border-[#e03e3e] focus:outline-hidden focus:ring-1 focus:ring-[#e03e3e] transition-colors duration-150"
                placeholder="https://connect.garmin.com/modern/course/... ou https://www.strava.com/routes/..."
              />
              <p className="mt-1 text-xs text-[#5c6370] dark:text-[#a7adbb]">
                Ce lien sera directement accessible sur le calendrier et dans le bloc « Prochain
                Rendez-vous » pour télécharger ou visualiser la trace.
              </p>
            </div>

            {/* Group */}
            <div>
              <label htmlFor="group" className="mb-2 block text-sm font-medium text-[#101216] dark:text-white">
                Groupe
              </label>
              <select
                id="group"
                value={formData.group}
                onChange={(e) => setFormData({ ...formData, group: e.target.value })}
                className="w-full rounded-md border border-[#e4e0d8] dark:border-[#262b38] bg-white dark:bg-[#1d2128] px-4 py-2 text-sm text-[#101216] dark:text-white focus:border-[#e03e3e] focus:outline-hidden focus:ring-1 focus:ring-[#e03e3e] transition-colors duration-150"
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
            className="rounded-md border border-[#e4e0d8] dark:border-[#262b38] bg-white dark:bg-[#161922] px-6 py-2 text-sm font-medium text-[#3a3f4a] dark:text-[#a7adbb] hover:bg-[#f2efe9] dark:hover:bg-[#262b38] transition-colors duration-150 min-h-[44px] inline-flex items-center justify-center"
          >
            Annuler
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-md bg-[#e03e3e] px-6 py-2 text-sm font-medium text-white hover:bg-[#c93434] transition-colors duration-150 disabled:opacity-50 min-h-[44px] inline-flex items-center justify-center cursor-pointer"
          >
            {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>
      </form>
    </div>
  );
}
