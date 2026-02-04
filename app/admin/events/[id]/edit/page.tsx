'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { use } from 'react';

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
        router.push('/admin/events');
        router.refresh();
      } else {
        alert('Erreur lors de la mise à jour de l\'événement');
      }
    } catch (error) {
      console.error('Error updating event:', error);
      alert('Erreur lors de la mise à jour de l\'événement');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-red-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/events"
          className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
        >
          <ArrowLeftIcon className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Modifier l&apos;Événement</h1>
          <p className="text-sm text-gray-500">Modifier les détails de la sortie</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Date */}
            <div>
              <label htmlFor="isoDate" className="mb-2 block text-sm font-medium text-gray-700">
                Date *
              </label>
              <input
                type="date"
                id="isoDate"
                required
                value={formData.isoDate}
                onChange={(e) => setFormData({ ...formData, isoDate: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
              />
            </div>

            {/* Location */}
            <div>
              <label htmlFor="location" className="mb-2 block text-sm font-medium text-gray-700">
                Lieu *
              </label>
              <input
                type="text"
                id="location"
                required
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
              />
            </div>

            {/* Departure */}
            <div>
              <label htmlFor="departure" className="mb-2 block text-sm font-medium text-gray-700">
                Heure de départ
              </label>
              <input
                type="text"
                id="departure"
                value={formData.departure}
                onChange={(e) => setFormData({ ...formData, departure: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
              />
            </div>

            {/* Distances */}
            <div>
              <label htmlFor="distances" className="mb-2 block text-sm font-medium text-gray-700">
                Distances
              </label>
              <input
                type="text"
                id="distances"
                value={formData.distances}
                onChange={(e) => setFormData({ ...formData, distances: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
              />
            </div>

            {/* Address */}
            <div className="md:col-span-2">
              <label htmlFor="address" className="mb-2 block text-sm font-medium text-gray-700">
                Adresse
              </label>
              <input
                type="text"
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
              />
            </div>

            {/* Alternative */}
            <div className="md:col-span-2">
              <label htmlFor="alternative" className="mb-2 block text-sm font-medium text-gray-700">
                Alternative (mauvais temps)
              </label>
              <input
                type="text"
                id="alternative"
                value={formData.alternative}
                onChange={(e) => setFormData({ ...formData, alternative: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
              />
            </div>

            {/* Remarks */}
            <div className="md:col-span-2">
              <label htmlFor="remarks" className="mb-2 block text-sm font-medium text-gray-700">
                Remarques
              </label>
              <textarea
                id="remarks"
                rows={3}
                value={formData.remarks}
                onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
              />
            </div>

            {/* Group */}
            <div>
              <label htmlFor="group" className="mb-2 block text-sm font-medium text-gray-700">
                Groupe
              </label>
              <select
                id="group"
                value={formData.group}
                onChange={(e) => setFormData({ ...formData, group: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
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
            className="rounded-lg border border-gray-300 bg-white px-6 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Annuler
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-lg bg-red-600 px-6 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
          >
            {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>
      </form>
    </div>
  );
}
