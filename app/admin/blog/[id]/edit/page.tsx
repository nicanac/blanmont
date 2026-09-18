'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeftIcon, PhotoIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { use } from 'react';
import { useImageUpload } from '@/app/hooks/useImageUpload';
import { toast } from 'sonner';

const RichTextEditor = dynamic(() => import('../../components/RichTextEditor'), {
  ssr: false,
  loading: () => (
    <div className="h-64 animate-pulse rounded-lg border border-[#e4e0d8] dark:border-[#262b38] bg-[#f8f7f5] dark:bg-[#101216]" />
  ),
});

const CATEGORIES = [
  'Actualités',
  'Récits de sortie',
  'Conseils',
  'Événements',
  'Annonces',
];

interface EditBlogPostPageProps {
  params: Promise<{ id: string }>;
}

export default function EditBlogPostPage({ params }: EditBlogPostPageProps): React.ReactElement {
  const { id } = use(params);
  const router = useRouter();
  const { uploadImage, isUploading: isImageUploading, progress: uploadProgress } = useImageUpload();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    category: 'Actualités',
    coverImage: '',
    isPublished: true,
  });

  useEffect(() => {
    const fetchPost = async (): Promise<void> => {
      try {
        const response = await fetch(`/api/admin/blog/${id}`);
        if (response.ok) {
          const data = await response.json();
          setFormData({
            title: data.title || '',
            excerpt: data.excerpt || '',
            content: data.content || '',
            category: data.category || 'Actualités',
            coverImage: data.coverImage || '',
            isPublished: data.isPublished ?? true,
          });
        }
      } catch (error) {
        console.error('Error fetching post:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      try {
        const date = new Date().toISOString().split('T')[0];
        const filename = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const path = `blog/uploads/${date}-${filename}`;
        
        const url = await uploadImage(file, path);
        setFormData(prev => ({ ...prev, coverImage: url }));
        toast.success('Image importée avec succès !');
      } catch (error: any) {
        console.error('Error uploading image:', error);
        toast.error(`Erreur lors du téléchargement de l'image: ${error.message || error}`);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/admin/blog/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success('Article mis à jour avec succès !');
        router.push('/admin/blog');
        router.refresh();
      } else {
        toast.error('Erreur lors de la mise à jour de l\'article');
      }
    } catch (error) {
      console.error('Error updating post:', error);
      toast.error('Erreur lors de la mise à jour de l\'article');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 md:h-8 md:w-8 animate-spin rounded-full border-2 border-[#e03e3e] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/blog"
          className="rounded-md p-2 text-[#5c6370] dark:text-[#a7adbb] hover:bg-[#f2efe9] dark:hover:bg-[#262b38] transition-colors duration-150 min-h-[44px] min-w-[44px] inline-flex items-center justify-center"
        >
          <ArrowLeftIcon className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-[#101216] dark:text-white">Modifier l&apos;Article</h1>
          <p className="text-sm text-[#5c6370] dark:text-[#a7adbb]">Modifier les détails de l&apos;article</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-lg border border-[#e4e0d8] dark:border-[#262b38] bg-white dark:bg-[#161922] p-6 shadow-xs">
          <div className="space-y-6">
            {/* Title */}
            <div>
              <label htmlFor="title" className="mb-2 block text-sm font-medium text-[#101216] dark:text-white">
                Titre *
              </label>
              <input
                type="text"
                id="title"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full rounded-md border border-[#e4e0d8] dark:border-[#262b38] bg-white dark:bg-[#1d2128] px-4 py-2 text-sm text-[#101216] dark:text-white placeholder:text-[#a7adbb] focus:border-[#e03e3e] focus:outline-hidden focus:ring-1 focus:ring-[#e03e3e] transition-colors duration-150"
                placeholder="Titre de l'article"
              />
            </div>

            {/* Category */}
            <div>
              <label htmlFor="category" className="mb-2 block text-sm font-medium text-[#101216] dark:text-white">
                Catégorie *
              </label>
              <select
                id="category"
                required
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full rounded-md border border-[#e4e0d8] dark:border-[#262b38] bg-white dark:bg-[#1d2128] px-4 py-2 text-sm text-[#101216] dark:text-white focus:border-[#e03e3e] focus:outline-hidden focus:ring-1 focus:ring-[#e03e3e] transition-colors duration-150"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Excerpt */}
            <div>
              <label htmlFor="excerpt" className="mb-2 block text-sm font-medium text-[#101216] dark:text-white">
                Extrait *
              </label>
              <textarea
                id="excerpt"
                required
                rows={2}
                value={formData.excerpt}
                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                className="w-full rounded-md border border-[#e4e0d8] dark:border-[#262b38] bg-white dark:bg-[#1d2128] px-4 py-2 text-sm text-[#101216] dark:text-white placeholder:text-[#a7adbb] focus:border-[#e03e3e] focus:outline-hidden focus:ring-1 focus:ring-[#e03e3e] transition-colors duration-150"
                placeholder="Courte description de l'article"
              />
            </div>

            {/* Cover Image */}
            <div>
              <label htmlFor="coverImage" className="mb-2 block text-sm font-medium text-[#101216] dark:text-white">
                Image de couverture
              </label>
              <div className="space-y-3">
                 <div className="flex gap-4">
                  <div className="flex-1">
                    <input
                      id="blog-edit-file-upload"
                      type="file"
                      accept="image/*"
                      aria-label="Téléverser une image de couverture"
                      onChange={handleImageSelect}
                      disabled={isImageUploading}
                      className="block w-full text-sm text-[#5c6370] dark:text-[#a7adbb] file:mr-4 file:rounded-md file:border-0 file:bg-red-50 dark:file:bg-red-950/30 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-[#e03e3e] hover:file:bg-red-100 dark:hover:file:bg-red-950/50 transition-colors duration-150"
                    />
                  </div>
                   <input
                    type="text"
                    id="coverImage"
                    aria-label="URL de l'image de couverture"
                    value={formData.coverImage}
                    onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                    className="flex-1 rounded-md border border-[#e4e0d8] dark:border-[#262b38] bg-white dark:bg-[#1d2128] px-4 py-2 text-sm text-[#101216] dark:text-white focus:border-[#e03e3e] focus:outline-hidden focus:ring-1 focus:ring-[#e03e3e] transition-colors duration-150"
                    placeholder="URL de l'image"
                  />
                </div>
                 {isImageUploading && (
                   <div className="h-1.5 w-full rounded-full bg-[#f2efe9] dark:bg-[#262b38] overflow-hidden">
                     <div 
                       className="h-full bg-[#e03e3e] transition-all duration-300" 
                       style={{ width: `${uploadProgress}%` }} 
                     />
                   </div>
                )}
                {formData.coverImage && (
                  <div className="mt-2 relative group w-fit">
                    <div className="relative h-48 w-72 rounded-lg overflow-hidden border border-[#e4e0d8] dark:border-[#262b38]">
                      <Image
                        src={formData.coverImage}
                        alt="Preview"
                        fill
                        unoptimized
                        className="object-cover"
                        sizes="288px"
                      />
                    </div>
                    <button
                        type="button"
                        onClick={() => setFormData({...formData, coverImage: ''})}
                        className="absolute top-2 right-2 bg-[#e03e3e] text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-150 cursor-pointer"
                        title="Supprimer l'image"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                          <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                        </svg>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Content */}
            <div>
              <label className="mb-2 block text-sm font-medium text-[#101216] dark:text-white">
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
                className="h-4 w-4 rounded-md border-[#e4e0d8] dark:border-[#262b38] text-[#e03e3e] focus:ring-[#e03e3e]"
              />
              <label htmlFor="isPublished" className="text-sm font-medium text-[#101216] dark:text-white">
                Publié
              </label>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Link
            href="/admin/blog"
            className="rounded-md border border-[#e4e0d8] dark:border-[#262b38] bg-white dark:bg-[#161922] px-6 py-2 text-sm font-medium text-[#3a3f4a] dark:text-[#a7adbb] hover:bg-[#f2efe9] dark:hover:bg-[#262b38] transition-colors duration-150 min-h-[44px] inline-flex items-center justify-center"
          >
            Annuler
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-md bg-[#e03e3e] px-6 py-2 text-sm font-medium text-white hover:bg-[#c93434] transition-colors duration-150 disabled:opacity-50 min-h-[44px] inline-flex items-center justify-center cursor-pointer"
          >
            {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>
      </form>
    </div>
  );
}
