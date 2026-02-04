'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeftIcon, PhotoIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import type { ComponentType } from 'react';

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
      <div className="h-64 animate-pulse rounded-lg border border-gray-300 bg-gray-50" />
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    category: 'Actualités',
    coverImage: '',
    isPublished: true,
  });

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
        router.push('/admin/blog');
        router.refresh();
      } else {
        alert('Erreur lors de la création de l\'article');
      }
    } catch (error) {
      console.error('Error creating post:', error);
      alert('Erreur lors de la création de l\'article');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/blog"
          className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
        >
          <ArrowLeftIcon className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Nouvel Article</h1>
          <p className="text-sm text-gray-500">Créer un nouvel article de blog</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="space-y-6">
            {/* Title */}
            <div>
              <label htmlFor="title" className="mb-2 block text-sm font-medium text-gray-700">
                Titre *
              </label>
              <input
                type="text"
                id="title"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                placeholder="Titre de l'article"
              />
            </div>

            {/* Category */}
            <div>
              <label htmlFor="category" className="mb-2 block text-sm font-medium text-gray-700">
                Catégorie *
              </label>
              <select
                id="category"
                required
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Excerpt */}
            <div>
              <label htmlFor="excerpt" className="mb-2 block text-sm font-medium text-gray-700">
                Extrait *
              </label>
              <textarea
                id="excerpt"
                required
                rows={2}
                value={formData.excerpt}
                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                placeholder="Courte description de l'article (visible dans la liste)"
              />
            </div>

            {/* Cover Image */}
            <div>
              <label htmlFor="coverImage" className="mb-2 block text-sm font-medium text-gray-700">
                Image de couverture
              </label>
              <div className="flex gap-4">
                <input
                  type="text"
                  id="coverImage"
                  value={formData.coverImage}
                  onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                  className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                  placeholder="URL de l'image ou télécharger ci-dessous"
                />
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  <PhotoIcon className="h-5 w-5" />
                  Uploader
                </button>
              </div>
              {formData.coverImage && (
                <div className="mt-2">
                  <img
                    src={formData.coverImage}
                    alt="Preview"
                    className="h-32 w-auto rounded-lg object-cover"
                  />
                </div>
              )}
            </div>

            {/* Content */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Contenu *
              </label>
              <RichTextEditor
                value={formData.content}
                onChange={(value: string) => setFormData({ ...formData, content: value })}
              />
            </div>

            {/* Published Toggle */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="isPublished"
                checked={formData.isPublished}
                onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
              />
              <label htmlFor="isPublished" className="text-sm font-medium text-gray-700">
                Publier immédiatement
              </label>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Link
            href="/admin/blog"
            className="rounded-lg border border-gray-300 bg-white px-6 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Annuler
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-lg bg-red-600 px-6 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
          >
            {isSubmitting ? 'Création...' : 'Créer l\'article'}
          </button>
        </div>
      </form>
    </div>
  );
}
