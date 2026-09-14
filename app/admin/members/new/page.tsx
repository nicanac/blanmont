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
    phone: '',
    bio: '',
    photoUrl: '',
    stravaId: '',
    role: ['Member'] as string[],
    cotisation2026Status: 'pending' as 'paid' | 'pending' | 'exempt',
    cotisation2026PaidAt: '',
    ffbcLicenseNumber: '',
    iceContactName: '',
    iceContactPhone: '',
    iceRelationship: '',
    preferredGroup: 'B' as 'A' | 'B' | 'C' | 'VTT',
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

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="mb-1.5 block text-xs sm:text-sm font-semibold text-[#101216]">
                Téléphone / GSM
              </label>
              <input
                type="tel"
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full rounded-md border border-[#e4e0d8] bg-white px-3.5 py-2 text-sm text-[#101216] placeholder:text-[#7d8493] focus:border-[#e03e3e] focus:outline-none focus:ring-1 focus:ring-[#e03e3e] transition-colors shadow-xs"
                placeholder="+32 470 12 34 56"
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

            {/* Affiliation, Cotisation & Sécurité (ICE) */}
            <div className="md:col-span-2 pt-6 border-t border-[#e4e0d8] space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#101216]">
                Cotisation 2026, Licence FFBC &amp; Sécurité (ICE)
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-[#101216]">
                    Statut Cotisation 2026
                  </label>
                  <select
                    value={formData.cotisation2026Status}
                    onChange={(e) => setFormData({ ...formData, cotisation2026Status: e.target.value as any })}
                    className="w-full rounded-md border border-[#e4e0d8] bg-white px-3.5 py-2 text-xs font-semibold text-[#101216] focus:border-[#e03e3e] focus:outline-none focus:ring-1 focus:ring-[#e03e3e] shadow-xs"
                  >
                    <option value="pending">⏳ En attente de paiement</option>
                    <option value="paid">✓ À jour (Payée)</option>
                    <option value="exempt">Exempté (Comité / Honneur)</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-[#101216]">
                    Date de règlement
                  </label>
                  <input
                    type="date"
                    value={formData.cotisation2026PaidAt}
                    onChange={(e) => setFormData({ ...formData, cotisation2026PaidAt: e.target.value })}
                    className="w-full rounded-md border border-[#e4e0d8] bg-white px-3.5 py-2 text-xs text-[#101216] focus:border-[#e03e3e] focus:outline-none focus:ring-1 focus:ring-[#e03e3e] shadow-xs"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-[#101216]">
                    N° Licence FFBC
                  </label>
                  <input
                    type="text"
                    placeholder="ex: FFBC-2026-8491"
                    value={formData.ffbcLicenseNumber}
                    onChange={(e) => setFormData({ ...formData, ffbcLicenseNumber: e.target.value })}
                    className="w-full rounded-md border border-[#e4e0d8] bg-white px-3.5 py-2 text-xs text-[#101216] focus:border-[#e03e3e] focus:outline-none focus:ring-1 focus:ring-[#e03e3e] shadow-xs"
                  />
                </div>
              </div>

              {/* ICE Contact */}
              <div className="rounded-md border border-amber-500/20 bg-amber-500/5 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-900">
                    Contact d&apos;urgence en peloton (ICE - In Case of Emergency)
                  </span>
                  <span className="text-[10px] text-amber-800">Accessible aux capitaines</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="mb-1 block text-[11px] font-semibold text-amber-950">
                      Nom du proche
                    </label>
                    <input
                      type="text"
                      placeholder="ex: Marie Dupont"
                      value={formData.iceContactName}
                      onChange={(e) => setFormData({ ...formData, iceContactName: e.target.value })}
                      className="w-full rounded border border-[#e4e0d8] bg-white px-3 py-1.5 text-xs text-[#101216] focus:border-[#e03e3e] focus:outline-none shadow-2xs"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-[11px] font-semibold text-amber-950">
                      Téléphone d&apos;urgence
                    </label>
                    <input
                      type="tel"
                      placeholder="ex: +32 479 98 76 54"
                      value={formData.iceContactPhone}
                      onChange={(e) => setFormData({ ...formData, iceContactPhone: e.target.value })}
                      className="w-full rounded border border-[#e4e0d8] bg-white px-3 py-1.5 text-xs text-[#101216] focus:border-[#e03e3e] focus:outline-none shadow-2xs"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-[11px] font-semibold text-amber-950">
                      Lien de parenté
                    </label>
                    <input
                      type="text"
                      placeholder="ex: Épouse, Parent, Ami"
                      value={formData.iceRelationship}
                      onChange={(e) => setFormData({ ...formData, iceRelationship: e.target.value })}
                      className="w-full rounded border border-[#e4e0d8] bg-white px-3 py-1.5 text-xs text-[#101216] focus:border-[#e03e3e] focus:outline-none shadow-2xs"
                    />
                  </div>
                </div>
              </div>

              {/* Preferred Group */}
              <div className="max-w-xs">
                <label className="mb-1.5 block text-xs font-semibold text-[#101216]">
                  Groupe habituel d&apos;allure
                </label>
                <select
                  value={formData.preferredGroup}
                  onChange={(e) => setFormData({ ...formData, preferredGroup: e.target.value as any })}
                  className="w-full rounded-md border border-[#e4e0d8] bg-white px-3.5 py-2 text-xs font-semibold text-[#101216] focus:border-[#e03e3e] focus:outline-none focus:ring-1 focus:ring-[#e03e3e] shadow-xs"
                >
                  <option value="A">Groupe A (&gt; 30 km/h)</option>
                  <option value="B">Groupe B (25 – 28 km/h)</option>
                  <option value="C">Groupe C (&lt; 25 km/h)</option>
                  <option value="VTT">Groupe VTT</option>
                </select>
              </div>
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
