'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { use } from 'react';
import { useImageUpload } from '@/app/hooks/useImageUpload';

const ROLES = ['Member', 'Admin', 'President', 'Treasurer', 'Secretary'];

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

  const handleRoleChange = (role: string, checked: boolean): void => {
    if (checked) {
      setFormData({ ...formData, role: [...formData.role, role] });
    } else {
      setFormData({ ...formData, role: formData.role.filter((r) => r !== role) });
    }
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      try {
        // Use a consistent path structure: members/{uid}/avatar-{timestamp}.jpg
        const timestamp = Date.now();
        const path = `members/${id}/avatar-${timestamp}.jpg`;
        const url = await uploadImage(file, path);
        setFormData(prev => ({ ...prev, photoUrl: url }));
      } catch (error) {
        console.error('Error uploading image:', error);
        alert('Erreur lors du téléchargement de l\'image');
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
        router.push('/admin/members');
        router.refresh();
      } else {
        alert('Erreur lors de la mise à jour du membre');
      }
    } catch (error) {
      console.error('Error updating member:', error);
      alert('Erreur lors de la mise à jour du membre');
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
          href="/admin/members"
          className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
        >
          <ArrowLeftIcon className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Modifier le Membre</h1>
          <p className="text-sm text-gray-500">Modifier les informations du membre</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Name */}
            <div>
              <label htmlFor="name" className="mb-2 block text-sm font-medium text-gray-700">
                Nom complet *
              </label>
              <input
                type="text"
                id="name"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
              />
            </div>

            {/* Photo URL */}
            <div>
              <label htmlFor="photoUrl" className="mb-2 block text-sm font-medium text-gray-700">
                Photo de profil
              </label>
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-4">
                  {(formData.photoUrl) && (
                    <img
                      src={formData.photoUrl}
                      alt="Avatar"
                      className="h-16 w-16 rounded-full object-cover border border-gray-200"
                    />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    disabled={isImageUploading}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:rounded-full file:border-0 file:bg-red-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-red-700 hover:file:bg-red-100"
                  />
                </div>
                {isImageUploading && (
                   <div className="h-1.5 w-full rounded-full bg-gray-100 overflow-hidden">
                     <div 
                       className="h-full bg-red-600 transition-all duration-300" 
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
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                  />
                </div>
              </div>
            </div>

            {/* Strava ID */}
            <div>
              <label htmlFor="stravaId" className="mb-2 block text-sm font-medium text-gray-700">
                Strava ID
              </label>
              <input
                type="text"
                id="stravaId"
                value={formData.stravaId}
                onChange={(e) => setFormData({ ...formData, stravaId: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
              />
            </div>

            {/* Bio */}
            <div className="md:col-span-2">
              <label htmlFor="bio" className="mb-2 block text-sm font-medium text-gray-700">
                Bio
              </label>
              <textarea
                id="bio"
                rows={3}
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
              />
            </div>

            {/* Roles */}
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Rôle(s)
              </label>
              <div className="flex flex-wrap gap-4">
                {ROLES.map((role) => (
                  <label key={role} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.role.includes(role)}
                      onChange={(e) => handleRoleChange(role, e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
                    />
                    <span className="text-sm text-gray-700">{role}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Link
            href="/admin/members"
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
