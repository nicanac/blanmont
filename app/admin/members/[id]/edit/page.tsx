'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeftIcon, ArrowsUpDownIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import Image from 'next/image';
import { use } from 'react';
import { useImageUpload } from '@/app/hooks/useImageUpload';
import { toast } from 'sonner';
import {
  parseVerticalPosition,
  formatVerticalPosition,
  VERTICAL_PRESETS,
} from '@/app/lib/imagePosition';

import MemberRoleSelector from '../../components/MemberRoleSelector';

interface EditMemberPageProps {
  params: Promise<{ id: string }>;
}

export default function EditMemberPage({ params }: EditMemberPageProps): React.ReactElement {
  const { id } = use(params);
  const router = useRouter();
  const { uploadImage, isUploading: isImageUploading, progress: uploadProgress } = useImageUpload();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    bio: '',
    photoUrl: '',
    photoPosition: 'center center',
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

  useEffect(() => {
    const fetchMember = async (): Promise<void> => {
      try {
        const response = await fetch(`/api/admin/members/${id}`);
        if (response.ok) {
          const data = await response.json();
          setFormData({
            name: data.name || '',
            email: data.email || '',
            phone: data.phone || '',
            bio: data.bio || '',
            photoUrl: data.photoUrl || '',
            photoPosition: data.photoPosition || 'center center',
            stravaId: data.stravaId || '',
            role: data.role || ['Member'],
            cotisation2026Status: data.cotisation2026Status || 'pending',
            cotisation2026PaidAt: data.cotisation2026PaidAt || '',
            ffbcLicenseNumber: data.ffbcLicenseNumber || '',
            iceContactName: data.iceContactName || '',
            iceContactPhone: data.iceContactPhone || '',
            iceRelationship: data.iceRelationship || '',
            preferredGroup: data.preferredGroup || 'B',
          });
        }
      } catch (error) {
        console.error('Error fetching member:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMember();
  }, [id]);


  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      try {
        // Use a consistent path structure: members/{uid}/avatar-{timestamp}.jpg
        const timestamp = Date.now();
        const path = `members/${id}/avatar-${timestamp}.jpg`;
        const url = await uploadImage(file, path);
        setFormData(prev => ({ ...prev, photoUrl: url }));
        toast.success('Photo mise à jour avec succès !');
      } catch (error) {
        console.error('Error uploading image:', error);
        toast.error('Erreur lors du téléchargement de l\'image');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/admin/members/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success('Membre mis à jour avec succès !');
        router.push('/admin/members');
        router.refresh();
      } else {
        toast.error('Erreur lors de la mise à jour du membre');
      }
    } catch (error) {
      console.error('Error updating member:', error);
      toast.error('Erreur lors de la mise à jour du membre');
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
      <div className="flex items-center gap-4 pb-4 border-b border-[#e4e0d8]">
        <Link
          href="/admin/members"
          className="rounded-md border border-[#e4e0d8] bg-white p-2 text-[#5c6370] hover:bg-[#f2efe9] hover:text-[#101216] transition-colors shadow-xs"
          title="Retour à l'annuaire des membres"
        >
          <ArrowLeftIcon className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#101216]">Modifier le Membre</h1>
          <p className="text-xs sm:text-sm text-[#5c6370]">Mettre à jour les informations, rôles et statuts du membre</p>
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
                className="w-full rounded-md border border-[#e4e0d8] bg-white px-3.5 py-2 text-sm text-[#101216] placeholder:text-[#5c6370] focus:border-[#e03e3e] focus:outline-none focus:ring-1 focus:ring-[#e03e3e] transition-colors shadow-xs"
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
                className="w-full rounded-md border border-[#e4e0d8] bg-white px-3.5 py-2 text-sm text-[#101216] placeholder:text-[#5c6370] focus:border-[#e03e3e] focus:outline-none focus:ring-1 focus:ring-[#e03e3e] transition-colors shadow-xs"
              />
            </div>

            {/* Photo URL & Placement */}
            <div className="md:col-span-2 space-y-4 pt-2 border-t border-[#e4e0d8]">
              <div className="flex items-center justify-between">
                <label htmlFor="photoUrl" className="block text-xs sm:text-sm font-semibold text-[#101216]">
                  Photo de profil &amp; Cadrage
                </label>
                <Link
                  href="/admin/members/photos"
                  className="text-xs font-semibold text-[#e03e3e] hover:underline"
                >
                  Ouvrir l&apos;atelier de cadrage global →
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-start">
                {/* 4:5 Portrait Live Preview */}
                <div className="sm:col-span-1">
                  <p className="text-xs font-bold uppercase tracking-wider text-[#5c6370] mb-1.5">
                    Aperçu rendu /members (4:5)
                  </p>
                  <div className="relative aspect-[4/5] w-full max-w-[200px] mx-auto sm:mx-0 overflow-hidden rounded-lg border border-[#e4e0d8] bg-[#161922] shadow-xs">
                    {formData.photoUrl ? (
                      <Image
                        src={formData.photoUrl}
                        alt="Aperçu photo"
                        fill
                        unoptimized
                        sizes="200px"
                        style={{ objectPosition: formData.photoPosition || 'center center' }}
                        className="object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-xs font-semibold text-[#a7adbb]">
                        Aucune photo
                      </div>
                    )}
                    <span className="absolute bottom-2 right-2 rounded bg-black/80 px-1.5 py-0.5 text-xs font-mono font-bold text-white">
                      {parseVerticalPosition(formData.photoPosition)}% Y
                    </span>
                  </div>
                </div>

                {/* Upload & Position Controls */}
                <div className="sm:col-span-2 space-y-4">
                  <div className="flex flex-col gap-3">
                    <input
                      id="member-photo-file-upload"
                      type="file"
                      accept="image/*"
                      aria-label="Téléverser une nouvelle photo de profil"
                      onChange={handleImageSelect}
                      disabled={isImageUploading}
                      className="block w-full text-xs text-[#5c6370] file:mr-4 file:rounded-md file:border file:border-[#e4e0d8] file:bg-[#faf8f5] file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-[#101216] hover:file:bg-[#f2efe9] cursor-pointer"
                    />

                    {isImageUploading && (
                      <div className="h-1.5 w-full rounded-full bg-[#f2efe9] overflow-hidden">
                        <div 
                          className="h-full bg-[#e03e3e] transition-all duration-300" 
                          style={{ width: `${uploadProgress}%` }} 
                        />
                      </div>
                    )}

                    <input
                      type="text"
                      id="photoUrl"
                      aria-label="URL manuelle de la photo du membre"
                      placeholder="Ou entrer une URL manuelle (https://...)"
                      value={formData.photoUrl}
                      onChange={(e) => setFormData({ ...formData, photoUrl: e.target.value })}
                      className="w-full rounded-md border border-[#e4e0d8] bg-white px-3.5 py-2 text-xs text-[#101216] placeholder:text-[#5c6370] focus:border-[#e03e3e] focus:outline-none focus:ring-1 focus:ring-[#e03e3e] transition-colors shadow-xs"
                    />
                  </div>

                  {/* Positioning slider and presets */}
                  {formData.photoUrl && (
                    <div className="rounded-md border border-[#e4e0d8] bg-[#faf8f5] p-3.5 space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-[#101216] flex items-center gap-1.5">
                          <ArrowsUpDownIcon className="h-3.5 w-3.5 text-[#e03e3e]" />
                          <span>Alignement vertical</span>
                        </span>
                        <span className="font-mono font-bold text-[#e03e3e]">
                          {parseVerticalPosition(formData.photoPosition)}%
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {VERTICAL_PRESETS.map((preset) => (
                          <button
                            key={preset.id}
                            type="button"
                            onClick={() =>
                              setFormData((prev) => ({ ...prev, photoPosition: preset.position }))
                            }
                            className={`rounded px-2.5 py-1 text-xs font-semibold uppercase tracking-wider border transition-colors ${
                              Math.abs(parseVerticalPosition(formData.photoPosition) - preset.percent) <= 12
                                ? 'bg-[#101216] text-white border-[#101216]'
                                : 'bg-white text-[#101216] border-[#e4e0d8] hover:bg-[#f2efe9]'
                            }`}
                          >
                            {preset.label}
                          </button>
                        ))}
                      </div>

                      <input
                        id="member-photo-vertical-position"
                        type="range"
                        min={0}
                        max={100}
                        step={1}
                        aria-label="Ajuster l'alignement vertical de la photo"
                        value={parseVerticalPosition(formData.photoPosition)}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            photoPosition: formatVerticalPosition(Number(e.target.value)),
                          }))
                        }
                        className="w-full accent-[#e03e3e] cursor-pointer"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Strava ID */}
            <div>
              <label htmlFor="stravaId" className="mb-1.5 block text-xs sm:text-sm font-semibold text-[#101216]">
                Strava Athlete ID
              </label>
              <input
                type="text"
                id="stravaId"
                placeholder="ex: 12345678"
                value={formData.stravaId}
                onChange={(e) => setFormData({ ...formData, stravaId: e.target.value })}
                className="w-full rounded-md border border-[#e4e0d8] bg-white px-3.5 py-2 text-sm text-[#101216] placeholder:text-[#5c6370] focus:border-[#e03e3e] focus:outline-none focus:ring-1 focus:ring-[#e03e3e] transition-colors shadow-xs"
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
                placeholder="Courte présentation, anecdotes ou parcours du cycliste..."
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                className="w-full rounded-md border border-[#e4e0d8] bg-white px-3.5 py-2 text-sm text-[#101216] placeholder:text-[#5c6370] focus:border-[#e03e3e] focus:outline-none focus:ring-1 focus:ring-[#e03e3e] transition-colors shadow-xs"
              />
            </div>

            {/* Affiliation, Cotisation & Sécurité (ICE) */}
            <div className="md:col-span-2 pt-6 border-t border-[#e4e0d8] space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#101216]">
                Cotisation 2026, Licence FFBC &amp; Sécurité (ICE)
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="member-edit-cotisation" className="mb-1.5 block text-xs font-semibold text-[#101216]">
                    Statut Cotisation 2026
                  </label>
                  <select
                    id="member-edit-cotisation"
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
                  <label htmlFor="member-edit-cotisation-date" className="mb-1.5 block text-xs font-semibold text-[#101216]">
                    Date de règlement
                  </label>
                  <input
                    id="member-edit-cotisation-date"
                    type="date"
                    value={formData.cotisation2026PaidAt}
                    onChange={(e) => setFormData({ ...formData, cotisation2026PaidAt: e.target.value })}
                    className="w-full rounded-md border border-[#e4e0d8] bg-white px-3.5 py-2 text-xs text-[#101216] focus:border-[#e03e3e] focus:outline-none focus:ring-1 focus:ring-[#e03e3e] shadow-xs"
                  />
                </div>

                <div>
                  <label htmlFor="member-edit-licence" className="mb-1.5 block text-xs font-semibold text-[#101216]">
                    N° Licence FFBC
                  </label>
                  <input
                    id="member-edit-licence"
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
                  <span className="text-xs text-amber-800">Accessible aux capitaines</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label htmlFor="member-edit-ice-name" className="mb-1 block text-xs font-semibold text-amber-950">
                      Nom du proche
                    </label>
                    <input
                      id="member-edit-ice-name"
                      type="text"
                      placeholder="ex: Marie Dupont"
                      value={formData.iceContactName}
                      onChange={(e) => setFormData({ ...formData, iceContactName: e.target.value })}
                      className="w-full rounded border border-[#e4e0d8] bg-white px-3 py-1.5 text-xs text-[#101216] focus:border-[#e03e3e] focus:outline-none shadow-2xs"
                    />
                  </div>

                  <div>
                    <label htmlFor="member-edit-ice-phone" className="mb-1 block text-xs font-semibold text-amber-950">
                      Téléphone d&apos;urgence
                    </label>
                    <input
                      id="member-edit-ice-phone"
                      type="tel"
                      placeholder="ex: +32 479 98 76 54"
                      value={formData.iceContactPhone}
                      onChange={(e) => setFormData({ ...formData, iceContactPhone: e.target.value })}
                      className="w-full rounded border border-[#e4e0d8] bg-white px-3 py-1.5 text-xs text-[#101216] focus:border-[#e03e3e] focus:outline-none shadow-2xs"
                    />
                  </div>

                  <div>
                    <label htmlFor="member-edit-ice-relation" className="mb-1 block text-xs font-semibold text-amber-950">
                      Lien de parenté
                    </label>
                    <input
                      id="member-edit-ice-relation"
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
                <label htmlFor="member-edit-group" className="mb-1.5 block text-xs font-semibold text-[#101216]">
                  Groupe habituel d&apos;allure
                </label>
                <select
                  id="member-edit-group"
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
            {isSubmitting ? 'Enregistrement...' : 'Enregistrer les modifications'}
          </button>
        </div>
      </form>
    </div>
  );
}
