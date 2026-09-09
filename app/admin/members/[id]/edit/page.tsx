'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { use } from 'react';
import { useImageUpload } from '@/app/hooks/useImageUpload';
import { toast } from 'sonner';

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
    bio: '',
    photoUrl: '',
    stravaId: '',
    role: ['Member'] as string[],
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
            bio: data.bio || '',
            photoUrl: data.photoUrl || '',
            stravaId: data.stravaId || '',
            role: data.role || ['Member'],
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
          className="rounded-md border border-[#e4e0d8] bg-white p-2 text-[#7d8493] hover:bg-[#f2efe9] hover:text-[#101216] transition-colors shadow-xs"
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
                className="w-full rounded-md border border-[#e4e0d8] bg-white px-3.5 py-2 text-sm text-[#101216] placeholder:text-[#7d8493] focus:border-[#e03e3e] focus:outline-none focus:ring-1 focus:ring-[#e03e3e] transition-colors shadow-xs"
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
              />
            </div>

            {/* Photo URL */}
            <div>
              <label htmlFor="photoUrl" className="mb-1.5 block text-xs sm:text-sm font-semibold text-[#101216]">
                Photo de profil
              </label>
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-4">
                  {(formData.photoUrl) && (
                    <img
                      src={formData.photoUrl}
                      alt="Avatar"
                      className="h-16 w-16 rounded-full object-cover border border-[#e4e0d8] shadow-xs"
                    />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    disabled={isImageUploading}
                    className="block w-full text-xs text-[#5c6370] file:mr-4 file:rounded-md file:border file:border-[#e4e0d8] file:bg-[#faf8f5] file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-[#101216] hover:file:bg-[#f2efe9] cursor-pointer"
                  />
                </div>
                {isImageUploading && (
                   <div className="h-1.5 w-full rounded-full bg-[#f2efe9] overflow-hidden">
                     <div 
                       className="h-full bg-[#e03e3e] transition-all duration-300" 
                       style={{ width: `${uploadProgress}%` }} 
                     />
                   </div>
                )}
                <div className="relative">
                  <input
                    type="text"
                    id="photoUrl"
                    placeholder="Ou entrer une URL manuelle"
                    value={formData.photoUrl}
                    onChange={(e) => setFormData({ ...formData, photoUrl: e.target.value })}
                    className="w-full rounded-md border border-[#e4e0d8] bg-white px-3.5 py-2 text-xs text-[#101216] placeholder:text-[#7d8493] focus:border-[#e03e3e] focus:outline-none focus:ring-1 focus:ring-[#e03e3e] transition-colors shadow-xs"
                  />
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
                className="w-full rounded-md border border-[#e4e0d8] bg-white px-3.5 py-2 text-sm text-[#101216] placeholder:text-[#7d8493] focus:border-[#e03e3e] focus:outline-none focus:ring-1 focus:ring-[#e03e3e] transition-colors shadow-xs"
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
                className="w-full rounded-md border border-[#e4e0d8] bg-white px-3.5 py-2 text-sm text-[#101216] placeholder:text-[#7d8493] focus:border-[#e03e3e] focus:outline-none focus:ring-1 focus:ring-[#e03e3e] transition-colors shadow-xs"
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
            {isSubmitting ? 'Enregistrement...' : 'Enregistrer les modifications'}
          </button>
        </div>
      </form>
    </div>
  );
}
