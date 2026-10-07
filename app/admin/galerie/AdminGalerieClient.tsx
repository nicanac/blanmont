'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import type { PhotoAlbum } from '@/app/types';
import {
  CameraIcon,
  PlusIcon,
  TrashIcon,
  PencilSquareIcon,
  ArrowTopRightOnSquareIcon,
  XMarkIcon,
  SparklesIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import { toast } from 'sonner';
import AdminPageHeader from '../components/AdminPageHeader';
import GalerieTutorialModal from './components/GalerieTutorialModal';
import { useAdminTours } from '../components/tours/adminTours';

interface AdminGalerieClientProps {
  initialAlbums: PhotoAlbum[];
}

export default function AdminGalerieClient({
  initialAlbums,
}: AdminGalerieClientProps): React.ReactElement {
  const [tutorialOpen, setTutorialOpen] = useState(false);
  const { startGalerieTour } = useAdminTours();
  const initialFormState = {
    title: '',
    description: '',
    year: new Date().getFullYear(),
    category: 'Sorties' as 'Sorties' | 'Ardennes & Stages' | 'Événements' | 'Équipements',
    coverUrl: '',
    externalAlbumUrl: '',
    photoCount: 20,
    featured: false,
  };

  const [albums, setAlbums] = useState<PhotoAlbum[]>(initialAlbums);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSeason, setSelectedSeason] = useState<number | 'all'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAlbum, setEditingAlbum] = useState<PhotoAlbum | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [form, setForm] = useState(initialFormState);

  const handleOpenCreateModal = (): void => {
    setEditingAlbum(null);
    setForm(initialFormState);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (album: PhotoAlbum): void => {
    setEditingAlbum(album);
    setForm({
      title: album.title,
      description: album.description || '',
      year: album.year,
      category: album.category as 'Sorties' | 'Ardennes & Stages' | 'Événements' | 'Équipements',
      coverUrl: album.coverUrl,
      externalAlbumUrl: album.externalAlbumUrl || '',
      photoCount: album.photoCount || 0,
      featured: Boolean(album.featured),
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = (): void => {
    setIsModalOpen(false);
    setEditingAlbum(null);
    setForm(initialFormState);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent): void => {
      if (e.key === 'Escape' && isModalOpen) {
        handleCloseModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen]);

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setIsSubmitting(true);
    const isEdit = Boolean(editingAlbum);
    const toastId = toast.loading(
      isEdit ? 'Modification de l’album photo...' : 'Création de l’album photo...'
    );

    try {
      const res = await fetch('/api/admin/galerie', {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          isEdit ? { id: editingAlbum!.id, ...form } : form
        ),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || `Erreur lors de la ${isEdit ? 'modification' : 'création'}`);
      }

      if (isEdit) {
        setAlbums(albums.map((a) => (a.id === editingAlbum!.id ? data.album : a)));
        toast.success('Album photo mis à jour avec succès !', { id: toastId });
      } else {
        setAlbums([data.album, ...albums]);
        toast.success('Album photo ajouté avec succès !', { id: toastId });
      }

      handleCloseModal();
    } catch (err: unknown) {
      const error = err as Error;
      toast.error(error.message || `Erreur lors de la ${isEdit ? 'modification' : 'création'}`, { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, title: string): Promise<void> => {
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
      <AdminPageHeader
        id="galerie-header-section"
        title="Galeries Photos & Chroniques"
        sheet="Feuille · Galeries Photos"
        badge={{ icon: CameraIcon, label: `${albums.length} albums` }}
        description="Gestion des albums photos du peloton, liens Google Photos et mise en avant des saisons."
        onOpenTutorial={() => setTutorialOpen(true)}
        tutorialButtonId="galerie-tutorial-btn"
        actions={[
          {
            label: 'Nouvel Album',
            onClick: handleOpenCreateModal,
            icon: PlusIcon,
            variant: 'primary',
          },
        ]}
      />

      <GalerieTutorialModal
        isOpen={tutorialOpen}
        onClose={() => setTutorialOpen(false)}
        onStartTour={() => {
          setTimeout(() => {
            startGalerieTour();
          }, 200);
        }}
      />

      {/* Search & Season Filter Bar */}
      <div id="galerie-search-filter" className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 bg-paper-2 dark:bg-night-2 rounded-md border border-line dark:border-night-line">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-3 dark:text-snow-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher par titre, description, lieu..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-paper dark:bg-night-3 border border-line dark:border-night-line rounded-md text-ink dark:text-white placeholder:text-ink-3 dark:placeholder:text-snow-3 focus:outline-none focus:border-brand"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-ink-3 dark:text-snow-3">Saison :</span>
          <select
            value={selectedSeason}
            onChange={(e) => setSelectedSeason(e.target.value === 'all' ? 'all' : Number(e.target.value))}
            className="px-2.5 py-2 text-xs font-semibold bg-paper dark:bg-night-3 border border-line dark:border-night-line rounded-md text-ink dark:text-white focus:outline-none focus:border-brand"
          >
            <option value="all">Toutes les saisons</option>
            {Array.from(new Set(albums.map((a) => a.year)))
              .sort((a, b) => b - a)
              .map((yr) => (
                <option key={yr} value={yr}>
                  Saison {yr}
                </option>
              ))}
          </select>
        </div>
      </div>

      {/* Albums Table */}
      <div id="galerie-table-section" className="rounded-sm border border-line dark:border-night-line bg-paper dark:bg-night-2 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-paper-2 dark:bg-night-3 text-xs font-bold uppercase tracking-wider text-ink-3 dark:text-snow-3 border-b border-line dark:border-night-line">
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
            <tbody className="divide-y divide-line dark:divide-night-line">
              {albums
                .filter((album) => {
                  if (selectedSeason !== 'all' && album.year !== selectedSeason) return false;
                  if (searchQuery.trim()) {
                    const q = searchQuery.toLowerCase();
                    return (
                      album.title.toLowerCase().includes(q) ||
                      album.description?.toLowerCase().includes(q) ||
                      album.category.toLowerCase().includes(q)
                    );
                  }
                  return true;
                })
                .map((album) => (
                <tr key={album.id} className="hover:bg-paper-2/60 dark:hover:bg-night-3/60 transition-colors">
                  <td className="py-3 px-4">
                    <div className="h-12 w-20 rounded-md overflow-hidden bg-night-2 border border-line dark:border-night-line relative shrink-0">
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
                          <SparklesIcon className="h-3 w-3 text-ambre" />
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4 max-w-xs">
                    <p className="font-bold text-ink dark:text-white">{album.title}</p>
                    <p className="text-xs text-ink-3 dark:text-snow-3 line-clamp-1 mt-0.5">
                      {album.description}
                    </p>
                  </td>
                  <td className="py-3 px-4 font-bold text-ink dark:text-white tabular-nums">
                    {album.year}
                  </td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-paper-2 dark:bg-night-3 border border-line dark:border-night-line text-ink-2 dark:text-snow-2">
                      {album.category}
                    </span>
                  </td>
                  <td className="py-3 px-4 tabular-nums font-semibold text-ink dark:text-white">
                    {album.photoCount}
                  </td>
                  <td className="py-3 px-4">
                    {album.externalAlbumUrl ? (
                      <a
                        href={album.externalAlbumUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-brand font-semibold hover:underline"
                      >
                        <span>Ouvrir</span>
                        <ArrowTopRightOnSquareIcon className="h-3 w-3" />
                      </a>
                    ) : (
                      <span className="text-snow-3">—</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(album)}
                        className="p-1.5 rounded-md text-ink-3 dark:text-snow-3 hover:text-ink dark:hover:text-white hover:bg-paper-2 dark:hover:bg-night-3 transition-colors"
                        title="Modifier l'album"
                        aria-label={`Modifier l'album ${album.title}`}
                      >
                        <PencilSquareIcon className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(album.id, album.title)}
                        disabled={deletingId === album.id}
                        className="p-1.5 rounded-md text-ink-3 dark:text-snow-3 hover:text-brand hover:bg-brand/10 transition-colors"
                        title="Supprimer l'album"
                        aria-label={`Supprimer l'album ${album.title}`}
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: New / Edit Album */}
      {isModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="galerie-modal-title"
          onClick={handleCloseModal}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-paper dark:bg-night-2 rounded-md border border-line dark:border-night-line w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95"
          >
            <div className="p-4 border-b border-line dark:border-night-line flex items-center justify-between">
              <h3
                id="galerie-modal-title"
                className="text-sm font-bold text-ink dark:text-white uppercase tracking-wider"
              >
                {editingAlbum ? 'Modifier l’album photo' : 'Ajouter un album photo'}
              </h3>
              <button
                type="button"
                onClick={handleCloseModal}
                className="p-1 rounded-md text-ink-3 dark:text-snow-3 hover:text-ink dark:hover:text-white"
                aria-label="Fermer"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
              <div>
                <label htmlFor="galerie-album-title" className="block font-semibold text-ink-2 dark:text-snow-2 mb-1">
                  Titre de l&apos;album *
                </label>
                <input
                  id="galerie-album-title"
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="ex: Sortie de rentrée · Saison 2026"
                  className="w-full rounded-md border border-line dark:border-night-line bg-paper-2 dark:bg-night-3 px-3 py-2 text-ink dark:text-white placeholder:text-ink-3 dark:placeholder:text-snow-3 focus:border-brand focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="galerie-album-year" className="block font-semibold text-ink-2 dark:text-snow-2 mb-1">
                    Saison (Année) *
                  </label>
                  <input
                    id="galerie-album-year"
                    type="number"
                    required
                    value={form.year}
                    onChange={(e) => setForm({ ...form, year: Number(e.target.value) })}
                    className="w-full rounded-md border border-line dark:border-night-line bg-paper-2 dark:bg-night-3 px-3 py-2 text-ink dark:text-white focus:border-brand focus:outline-hidden"
                  />
                </div>

                <div>
                  <label htmlFor="galerie-album-category" className="block font-semibold text-ink-2 dark:text-snow-2 mb-1">
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
                    className="w-full rounded-md border border-line dark:border-night-line px-3 py-2 text-ink dark:text-white bg-paper-2 dark:bg-night-3 focus:border-brand focus:outline-hidden"
                  >
                    <option value="Sorties">Sorties</option>
                    <option value="Ardennes & Stages">Ardennes &amp; Stages</option>
                    <option value="Événements">Événements</option>
                    <option value="Équipements">Équipements</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="galerie-album-cover" className="block font-semibold text-ink-2 dark:text-snow-2 mb-1">
                  URL de l&apos;image de couverture *
                </label>
                <input
                  id="galerie-album-cover"
                  type="text"
                  required
                  value={form.coverUrl}
                  onChange={(e) => setForm({ ...form, coverUrl: e.target.value })}
                  placeholder="/images/home-hero.jpg ou https://..."
                  className="w-full rounded-md border border-line dark:border-night-line bg-paper-2 dark:bg-night-3 px-3 py-2 text-ink dark:text-white placeholder:text-ink-3 dark:placeholder:text-snow-3 focus:border-brand focus:outline-hidden font-mono"
                />
              </div>

              <div>
                <label htmlFor="galerie-album-external-url" className="block font-semibold text-ink-2 dark:text-snow-2 mb-1">
                  Lien de l&apos;album externe (Google Photos, OneDrive...)
                </label>
                <input
                  id="galerie-album-external-url"
                  type="url"
                  value={form.externalAlbumUrl}
                  onChange={(e) => setForm({ ...form, externalAlbumUrl: e.target.value })}
                  placeholder="https://photos.google.com/..."
                  className="w-full rounded-md border border-line dark:border-night-line bg-paper-2 dark:bg-night-3 px-3 py-2 text-ink dark:text-white placeholder:text-ink-3 dark:placeholder:text-snow-3 focus:border-brand focus:outline-hidden font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="galerie-album-photo-count" className="block font-semibold text-ink-2 dark:text-snow-2 mb-1">
                    Nombre estimé de photos
                  </label>
                  <input
                    id="galerie-album-photo-count"
                    type="number"
                    value={form.photoCount}
                    onChange={(e) => setForm({ ...form, photoCount: Number(e.target.value) })}
                    className="w-full rounded-md border border-line dark:border-night-line bg-paper-2 dark:bg-night-3 px-3 py-2 text-ink dark:text-white focus:border-brand focus:outline-hidden"
                  />
                </div>

                <div className="flex items-center pt-6">
                  <label htmlFor="galerie-album-featured" className="flex items-center gap-2 cursor-pointer">
                    <input
                      id="galerie-album-featured"
                      type="checkbox"
                      checked={form.featured}
                      onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                      className="rounded border-line dark:border-night-line text-brand focus:ring-brand"
                    />
                    <span className="font-semibold text-ink dark:text-white">Mettre à la Une</span>
                  </label>
                </div>
              </div>

              <div>
                <label htmlFor="galerie-album-description" className="block font-semibold text-ink-2 dark:text-snow-2 mb-1">
                  Description / Récit de la sortie
                </label>
                <textarea
                  id="galerie-album-description"
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Quelques phrases pour situer le contexte, la météo, le parcours..."
                  className="w-full rounded-md border border-line dark:border-night-line bg-paper-2 dark:bg-night-3 px-3 py-2 text-ink dark:text-white placeholder:text-ink-3 dark:placeholder:text-snow-3 focus:border-brand focus:outline-hidden"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-4 border-t border-line dark:border-night-line">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-ink-2 dark:text-snow-3 hover:bg-paper-2 dark:hover:bg-night-3 rounded-md transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-brand hover:bg-brand-strong text-white text-xs font-semibold uppercase tracking-wider rounded-md shadow-xs transition-colors disabled:opacity-50 min-h-[40px]"
                >
                  {isSubmitting
                    ? 'Enregistrement...'
                    : editingAlbum
                    ? 'Enregistrer les modifications'
                    : 'Créer l’album'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
