'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { toast } from 'sonner';
import MemberRoleSelector from '../components/MemberRoleSelector';

export default function NewMemberPage(): React.ReactElement {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    bio: '',
    photoUrl: '',
    stravaId: '',
    role: ['Member'] as string[],
  });

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/admin/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success('Membre créé avec succès !');
        router.push('/admin/members');
        router.refresh();
      } else {
        toast.error('Erreur lors de la création du membre');
      }
    } catch (error) {
      console.error('Error creating member:', error);
      toast.error('Erreur lors de la création du membre');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 pb-4 border-b border-[#e4e0d8]">
        <Link
          href="/admin/members"
          className="rounded-md border border-[#e4e0d8] bg-white p-2 text-[#7d8493] hover:bg-[#f2efe9] hover:text-[#101216] transition-colors shadow-xs"
          title="Retour à l'annuaire des membres"
        >
          <ArrowLeftIcon className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#101216]">Nouveau Membre</h1>
          <p className="text-xs sm:text-sm text-[#5c6370]">Ajouter un nouveau cycliste ou encadrant au club</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-lg border border-[#e4e0d8] bg-white p-6 sm:p-8 shadow-xs">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Name */}
            <div>
              <label htmlFor="name" className="mb-1.5 block text-xs sm:text-sm font-semibold text-[#101216]">
                Nom complet *
              </label>
              <input
                type="text"
                id="name"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full rounded-md border border-[#e4e0d8] bg-white px-3.5 py-2 text-sm text-[#101216] placeholder:text-[#7d8493] focus:border-[#e03e3e] focus:outline-none focus:ring-1 focus:ring-[#e03e3e] transition-colors shadow-xs"
                placeholder="ex: Lucien Szustak"
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="mb-1.5 block text-xs sm:text-sm font-semibold text-[#101216]">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full rounded-md border border-[#e4e0d8] bg-white px-3.5 py-2 text-sm text-[#101216] placeholder:text-[#7d8493] focus:border-[#e03e3e] focus:outline-none focus:ring-1 focus:ring-[#e03e3e] transition-colors shadow-xs"
                placeholder="membre@blanmont.be"
              />
            </div>

            {/* Photo URL */}
            <div>
              <label htmlFor="photoUrl" className="mb-1.5 block text-xs sm:text-sm font-semibold text-[#101216]">
                Photo URL
              </label>
              <input
                type="text"
                id="photoUrl"
                value={formData.photoUrl}
                onChange={(e) => setFormData({ ...formData, photoUrl: e.target.value })}
                className="w-full rounded-md border border-[#e4e0d8] bg-white px-3.5 py-2 text-sm text-[#101216] placeholder:text-[#7d8493] focus:border-[#e03e3e] focus:outline-none focus:ring-1 focus:ring-[#e03e3e] transition-colors shadow-xs"
                placeholder="https://..."
              />
            </div>

            {/* Strava ID */}
            <div>
              <label htmlFor="stravaId" className="mb-1.5 block text-xs sm:text-sm font-semibold text-[#101216]">
                Strava Athlete ID
              </label>
              <input
                type="text"
                id="stravaId"
                value={formData.stravaId}
                onChange={(e) => setFormData({ ...formData, stravaId: e.target.value })}
                className="w-full rounded-md border border-[#e4e0d8] bg-white px-3.5 py-2 text-sm text-[#101216] placeholder:text-[#7d8493] focus:border-[#e03e3e] focus:outline-none focus:ring-1 focus:ring-[#e03e3e] transition-colors shadow-xs"
                placeholder="ex: 12345678"
              />
            </div>

            {/* Bio */}
            <div className="md:col-span-2">
              <label htmlFor="bio" className="mb-1.5 block text-xs sm:text-sm font-semibold text-[#101216]">
                Bio &amp; Présentation
              </label>
              <textarea
                id="bio"
                rows={3}
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                className="w-full rounded-md border border-[#e4e0d8] bg-white px-3.5 py-2 text-sm text-[#101216] placeholder:text-[#7d8493] focus:border-[#e03e3e] focus:outline-none focus:ring-1 focus:ring-[#e03e3e] transition-colors shadow-xs"
                placeholder="Quelques mots sur le cycliste, ses allures favorites..."
              />
            </div>

            {/* Roles Section */}
            <div className="md:col-span-2 pt-4 border-t border-[#e4e0d8]">
              <MemberRoleSelector
                roles={formData.role}
                onChange={(newRoles) => setFormData({ ...formData, role: newRoles })}
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Link
            href="/admin/members"
            className="rounded-md border border-[#e4e0d8] bg-white px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#101216] hover:bg-[#f2efe9] transition-colors shadow-xs"
          >
            Annuler
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-md bg-[#e03e3e] hover:bg-[#c93434] px-6 py-2.5 text-xs font-semibold uppercase tracking-wider text-white shadow-xs transition-colors disabled:opacity-50"
          >
            {isSubmitting ? 'Création...' : 'Créer le membre'}
          </button>
        </div>
      </form>
    </div>
  );
}
