'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeftIcon,
  AcademicCapIcon,
  DocumentTextIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import type { ComponentType } from 'react';
import { useImageUpload } from '@/app/hooks/useImageUpload';
import { toast } from 'sonner';
import { useBlogTour } from '../components/BlogTour';
import BlogTutorialModal from '../components/BlogTutorialModal';

// Interface for the editor props
interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
}

// Lazy load the rich text editor to avoid SSR issues
const RichTextEditor: ComponentType<RichTextEditorProps> = dynamic(
  () => import('@/app/admin/blog/components/RichTextEditor') as Promise<{ default: ComponentType<RichTextEditorProps> }>,
  {
    ssr: false,
    loading: () => (
      <div className="h-64 animate-pulse rounded-md border border-[#e4e0d8] bg-[#f2efe9]" />
    ),
  }
);

const CATEGORIES = [
  'Actualités',
  'Récits de sortie',
  'Conseils',
  'Événements',
  'Annonces',
];

export default function NewBlogPostPage(): React.ReactElement {
  const router = useRouter();
  const { uploadImage, isUploading: isImageUploading, progress: uploadProgress } = useImageUpload();
  const { startEditorTour } = useBlogTour();
  const [tutorialOpen, setTutorialOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    category: 'Actualités',
    coverImage: '',
    isPublished: true,
  });

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      try {
        const date = new Date().toISOString().split('T')[0];
        const filename = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const path = `blog/uploads/${date}-${filename}`;
        
        const url = await uploadImage(file, path);
        setFormData(prev => ({ ...prev, coverImage: url }));
        toast.success('Image importée avec succès !');
      } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : String(error);
        console.error('Error uploading image:', error);
        toast.error(`Erreur lors du téléchargement de l'image: ${msg}`);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Get author from localStorage
      const memberData = localStorage.getItem('memberData');
      const member = memberData ? JSON.parse(memberData) : null;

      const response = await fetch('/api/admin/blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          author: member?.name || 'Administrateur',
          authorAvatar: member?.photo || '/images/default-avatar.png',
        }),
      });

      if (response.ok) {
        toast.success('Article créé avec succès !');
        router.push('/admin/blog');
        router.refresh();
      } else {
        toast.error('Erreur lors de la création de l\'article');
      }
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error('Erreur lors de la création de l\'article');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-[#e4e0d8]">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/blog"
            className="rounded-md border border-[#e4e0d8] bg-white p-2 text-[#7d8493] hover:bg-[#f2efe9] hover:text-[#101216] transition-colors"
            title="Retour à la liste des articles"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </Link>
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-[#101216] px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-white mb-1">
              <DocumentTextIcon className="h-3.5 w-3.5 text-[#e03e3e]" />
              <span>Rédaction</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#101216]">
              Nouvel Article
            </h1>
            <p className="mt-0.5 text-xs sm:text-sm text-[#5c6370]">
              Rédigez et publiez une actualité ou un récit pour les membres du club.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={startEditorTour}
            className="inline-flex items-center gap-1.5 rounded-md border border-[#e4e0d8] bg-white px-3.5 py-2 text-xs font-semibold uppercase tracking-wider text-[#101216] hover:bg-[#f2efe9] transition-colors shadow-xs"
            title="Démarrer la visite guidée interactive du formulaire"
          >
            <AcademicCapIcon className="h-4 w-4 text-[#e03e3e]" />
            <span>Visite Guidée</span>
          </button>
          <button
            type="button"
            onClick={() => setTutorialOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-md border border-[#e4e0d8] bg-white px-3.5 py-2 text-xs font-semibold uppercase tracking-wider text-[#101216] hover:bg-[#f2efe9] transition-colors shadow-xs"
            title="Ouvrir le guide complet de rédaction"
          >
            <span>Guide Rédaction</span>
          </button>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-lg border border-[#e4e0d8] bg-white p-6 shadow-xs space-y-6">
          {/* Title */}
          <div id="post-title-field">
            <label htmlFor="title" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#101216]">
              Titre de l&apos;Article *
            </label>
            <input
              type="text"
              id="title"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full rounded-md border border-[#e4e0d8] bg-[#faf8f5] px-4 py-2.5 text-sm text-[#101216] placeholder:text-[#7d8493] focus:border-[#e03e3e] focus:bg-white focus:outline-none transition-colors"
              placeholder="Ex: Sortie d'automne en Brabant wallon & pause café"
            />
          </div>

          {/* Category */}
          <div id="post-category-field">
            <label htmlFor="category" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#101216]">
              Catégorie *
            </label>
            <select
              id="category"
              required
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full rounded-md border border-[#e4e0d8] bg-[#faf8f5] px-4 py-2.5 text-sm text-[#101216] focus:border-[#e03e3e] focus:bg-white focus:outline-none transition-colors"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Excerpt */}
          <div id="post-excerpt-field">
            <label htmlFor="excerpt" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#101216]">
              Extrait (Chapeau d&apos;accroche) *
            </label>
            <textarea
              id="excerpt"
              required
              rows={2}
              value={formData.excerpt}
              onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
              className="w-full rounded-md border border-[#e4e0d8] bg-[#faf8f5] px-4 py-2.5 text-sm text-[#101216] placeholder:text-[#7d8493] focus:border-[#e03e3e] focus:bg-white focus:outline-none transition-colors leading-relaxed"
              placeholder="1 à 2 phrases résumant l'article, affichées sur la page d'accueil et les partages..."
            />
          </div>

          {/* Cover Image */}
          <div id="post-cover-field">
            <label htmlFor="coverImage" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#101216]">
              Image de Couverture
            </label>
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    disabled={isImageUploading}
                    className="block w-full text-xs text-[#5c6370] file:mr-4 file:rounded-md file:border-0 file:bg-[#101216] file:px-4 file:py-2 file:text-xs file:font-semibold file:text-white hover:file:bg-[#262b38] file:transition-colors file:cursor-pointer"
                  />
                </div>
                <input
                  type="text"
                  id="coverImage"
                  value={formData.coverImage}
                  onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                  className="flex-1 rounded-md border border-[#e4e0d8] bg-[#faf8f5] px-4 py-2 text-xs text-[#101216] placeholder:text-[#7d8493] focus:border-[#e03e3e] focus:bg-white focus:outline-none transition-colors"
                  placeholder="Ou collez directement une URL d'image (https://...)"
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

              {formData.coverImage && (
                <div className="mt-2 relative group w-fit">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={formData.coverImage}
                    alt="Prévisualisation couverture"
                    className="h-48 w-auto rounded-md object-cover border border-[#e4e0d8] shadow-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, coverImage: '' })}
                    className="absolute top-2 right-2 bg-[#e03e3e] text-white p-1.5 rounded-full opacity-90 hover:opacity-100 hover:bg-[#c93434] transition-all shadow-xs"
                    title="Supprimer l'image"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Content */}
          <div id="post-content-field">
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#101216]">
              Contenu de l&apos;Article *
            </label>
            <RichTextEditor
              value={formData.content}
              onChange={(value: string) => setFormData({ ...formData, content: value })}
            />
          </div>

          {/* Published Toggle */}
          <div id="post-status-field" className="flex items-center gap-3 pt-2 border-t border-[#f2efe9]">
            <input
              type="checkbox"
              id="isPublished"
              checked={formData.isPublished}
              onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
              className="h-4 w-4 rounded border-[#e4e0d8] text-[#e03e3e] focus:ring-[#e03e3e]"
            />
            <label htmlFor="isPublished" className="text-xs font-bold uppercase tracking-wider text-[#101216] cursor-pointer">
              Publier immédiatement (visible sur le site dès enregistrement)
            </label>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3">
          <Link
            href="/admin/blog"
            className="rounded-md border border-[#e4e0d8] bg-white px-6 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#101216] hover:bg-[#f2efe9] transition-colors"
          >
            Annuler
          </Link>
          <button
            id="post-submit-button"
            type="submit"
            disabled={isSubmitting}
            className="rounded-md bg-[#e03e3e] hover:bg-[#c93434] px-7 py-2.5 text-xs font-semibold uppercase tracking-wider text-white transition-colors shadow-xs disabled:opacity-50"
          >
            {isSubmitting ? 'Création en cours...' : 'Créer et Enregistrer l\'Article'}
          </button>
        </div>
      </form>

      {/* Tutorial Modal */}
      <BlogTutorialModal
        isOpen={tutorialOpen}
        onClose={() => setTutorialOpen(false)}
        onStartTour={() => {
          setTimeout(() => {
            startEditorTour();
          }, 200);
        }}
      />
    </div>
  );
}
