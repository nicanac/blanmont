'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import type { PhotoAlbum } from '@/app/types';
import {
  CameraIcon,
  PlusIcon,
  TrashIcon,
  ArrowTopRightOnSquareIcon,
  XMarkIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import { toast } from 'sonner';

interface AdminGalerieClientProps {
  initialAlbums: PhotoAlbum[];
}

export default function AdminGalerieClient({
  initialAlbums,
}: AdminGalerieClientProps): React.ReactElement {
  const [albums, setAlbums] = useState<PhotoAlbum[]>(initialAlbums);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: '',
    description: '',
    year: new Date().getFullYear(),
    category: 'Sorties' as 'Sorties' | 'Ardennes & Stages' | 'Événements' | 'Équipements',
    coverUrl: '',
    externalAlbumUrl: '',
    photoCount: 20,
    featured: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const toastId = toast.loading('Création de l’album photo...');

    try {
      const res = await fetch('/api/admin/galerie', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Erreur lors de la création');
      }

      setAlbums([data.album, ...albums]);
      setIsModalOpen(false);
      setForm({
        title: '',
        description: '',
        year: new Date().getFullYear(),
        category: 'Sorties',
        coverUrl: '',
        externalAlbumUrl: '',
        photoCount: 20,
        featured: false,
      });
      toast.success('Album photo ajouté avec succès !', { id: toastId });
    } catch (err: unknown) {
      const error = err as Error;
      toast.error(error.message || 'Erreur lors de la création', { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer l'album "${title}" ?`)) {
      return;
    }

    setDeletingId(id);
    const toastId = toast.loading('Suppression de l’album...');

    try {
      const res = await fetch(`/api/admin/galerie?id=${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        throw new Error('Erreur lors de la suppression');
      }

      setAlbums(albums.filter((a) => a.id !== id));
      toast.success('Album supprimé avec succès', { id: toastId });
    } catch {
      toast.error('Erreur lors de la suppression de l’album', { id: toastId });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-[#e4e0d8]">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#101216]">
              Galeries Photos &amp; Chroniques
            </h1>
            <span className="inline-flex items-center gap-1 rounded-full bg-[#101216] px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-white">
              <CameraIcon className="h-3.5 w-3.5 text-[#e03e3e]" />
              <span>{albums.length} albums</span>
            </span>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-[#5c6370]">
            Gestion des albums photos du peloton, liens Google Photos et mise en avant des saisons.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-md bg-[#e03e3e] hover:bg-[#c93434] px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-white transition-colors shadow-xs shrink-0 min-h-[44px]"
        >
          <PlusIcon className="h-4 w-4 stroke-[2.5]" />
          <span>Nouvel Album</span>
        </button>
      </div>

      {/* Albums Table */}
      <div className="rounded-[10px] border border-[#e4e0d8] bg-white overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#faf8f5] text-xs font-bold uppercase tracking-wider text-[#5c6370] border-b border-[#e4e0d8]">
              <tr>
                <th className="py-3 px-4">Couverture</th>
                <th className="py-3 px-4">Titre &amp; Description</th>
                <th className="py-3 px-4">Saison</th>
                <th className="py-3 px-4">Catégorie</th>
                <th className="py-3 px-4">Photos</th>
                <th className="py-3 px-4">Lien Externe</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#efece5]">
              {albums.map((album) => (
                <tr key={album.id} className="hover:bg-[#faf8f5]/60 transition-colors">
                  <td className="py-3 px-4">
                    <div className="h-12 w-20 rounded-md overflow-hidden bg-[#161922] border border-[#e4e0d8] relative shrink-0">
                      <Image
                        src={album.coverUrl}
                        alt={album.title}
                        fill
                        unoptimized
                        sizes="80px"
                        className="object-cover"
                      />
                      {album.featured && (
                        <div className="absolute top-1 left-1">
                          <SparklesIcon className="h-3 w-3 text-amber-400" />
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4 max-w-xs">
                    <p className="font-bold text-[#101216]">{album.title}</p>
                    <p className="text-xs text-[#5c6370] line-clamp-1 mt-0.5">
                      {album.description}
                    </p>
                  </td>
                  <td className="py-3 px-4 font-bold text-[#101216] tabular-nums">
                    {album.year}
                  </td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-[#faf8f5] border border-[#e4e0d8] text-[#3a3f4a]">
                      {album.category}
                    </span>
                  </td>
                  <td className="py-3 px-4 tabular-nums font-semibold text-[#101216]">
                    {album.photoCount}
                  </td>
                  <td className="py-3 px-4">
                    {album.externalAlbumUrl ? (
                      <a
                        href={album.externalAlbumUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[#e03e3e] font-semibold hover:underline"
                      >
                        <span>Ouvrir</span>
                        <ArrowTopRightOnSquareIcon className="h-3 w-3" />
                      </a>
                    ) : (
                      <span className="text-[#a7adbb]">—</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => handleDelete(album.id, album.title)}
                      disabled={deletingId === album.id}
                      className="p-1.5 rounded-md text-[#5c6370] hover:text-[#e03e3e] hover:bg-[#e03e3e]/10 transition-colors"
                      title="Supprimer l'album"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: New Album */}
      {isModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4"
        >
          <div className="bg-white rounded-[10px] border border-[#e4e0d8] w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95">
            <div className="p-4 border-b border-[#efece5] flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#101216] uppercase tracking-wider">
                Ajouter un album photo
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-md text-[#5c6370] hover:text-[#101216]"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
              <div>
                <label htmlFor="galerie-album-title" className="block font-semibold text-[#3a3f4a] mb-1">
                  Titre de l&apos;album *
                </label>
                <input
                  id="galerie-album-title"
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="ex: Sortie de rentrée · Saison 2026"
                  className="w-full rounded-md border border-[#e4e0d8] px-3 py-2 text-[#101216] focus:border-[#e03e3e] focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="galerie-album-year" className="block font-semibold text-[#3a3f4a] mb-1">
                    Saison (Année) *
                  </label>
                  <input
                    id="galerie-album-year"
                    type="number"
                    required
                    value={form.year}
                    onChange={(e) => setForm({ ...form, year: Number(e.target.value) })}
                    className="w-full rounded-md border border-[#e4e0d8] px-3 py-2 text-[#101216] focus:border-[#e03e3e] focus:outline-hidden"
                  />
                </div>

                <div>
                  <label htmlFor="galerie-album-category" className="block font-semibold text-[#3a3f4a] mb-1">
                    Thème / Catégorie *
                  </label>
                  <select
                    id="galerie-album-category"
                    value={form.category}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        category: e.target.value as
                          | 'Sorties'
                          | 'Ardennes & Stages'
                          | 'Événements'
                          | 'Équipements',
                      })
                    }
                    className="w-full rounded-md border border-[#e4e0d8] px-3 py-2 text-[#101216] bg-white focus:border-[#e03e3e] focus:outline-hidden"
                  >
                    <option value="Sorties">Sorties</option>
                    <option value="Ardennes & Stages">Ardennes &amp; Stages</option>
                    <option value="Événements">Événements</option>
                    <option value="Équipements">Équipements</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="galerie-album-cover" className="block font-semibold text-[#3a3f4a] mb-1">
                  URL de l&apos;image de couverture *
                </label>
                <input
                  id="galerie-album-cover"
                  type="text"
                  required
                  value={form.coverUrl}
                  onChange={(e) => setForm({ ...form, coverUrl: e.target.value })}
                  placeholder="/images/home-hero.jpg ou https://..."
                  className="w-full rounded-md border border-[#e4e0d8] px-3 py-2 text-[#101216] focus:border-[#e03e3e] focus:outline-hidden font-mono"
                />
              </div>

              <div>
                <label htmlFor="galerie-album-external-url" className="block font-semibold text-[#3a3f4a] mb-1">
                  Lien de l&apos;album externe (Google Photos, OneDrive...)
                </label>
                <input
                  id="galerie-album-external-url"
                  type="url"
                  value={form.externalAlbumUrl}
                  onChange={(e) => setForm({ ...form, externalAlbumUrl: e.target.value })}
                  placeholder="https://photos.google.com/..."
                  className="w-full rounded-md border border-[#e4e0d8] px-3 py-2 text-[#101216] focus:border-[#e03e3e] focus:outline-hidden font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="galerie-album-photo-count" className="block font-semibold text-[#3a3f4a] mb-1">
                    Nombre estimé de photos
                  </label>
                  <input
                    id="galerie-album-photo-count"
                    type="number"
                    value={form.photoCount}
                    onChange={(e) => setForm({ ...form, photoCount: Number(e.target.value) })}
                    className="w-full rounded-md border border-[#e4e0d8] px-3 py-2 text-[#101216] focus:border-[#e03e3e] focus:outline-hidden"
                  />
                </div>

                <div className="flex items-center pt-6">
                  <label htmlFor="galerie-album-featured" className="flex items-center gap-2 cursor-pointer">
                    <input
                      id="galerie-album-featured"
                      type="checkbox"
                      checked={form.featured}
                      onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                      className="rounded border-[#e4e0d8] text-[#e03e3e] focus:ring-[#e03e3e]"
                    />
                    <span className="font-semibold text-[#101216]">Mettre à la Une</span>
                  </label>
                </div>
              </div>

              <div>
                <label htmlFor="galerie-album-description" className="block font-semibold text-[#3a3f4a] mb-1">
                  Description / Récit de la sortie
                </label>
                <textarea
                  id="galerie-album-description"
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Quelques phrases pour situer le contexte, la météo, le parcours..."
                  className="w-full rounded-md border border-[#e4e0d8] px-3 py-2 text-[#101216] focus:border-[#e03e3e] focus:outline-hidden"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-4 border-t border-[#efece5]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-[#3a3f4a] hover:bg-[#f2efe9] rounded-md transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-[#e03e3e] hover:bg-[#c93434] text-white text-xs font-semibold uppercase tracking-wider rounded-md shadow-xs transition-colors disabled:opacity-50 min-h-[40px]"
                >
                  {isSubmitting ? 'Enregistrement...' : 'Créer l’album'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
