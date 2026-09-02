import React from 'react';
import Link from 'next/link';
import { PlusIcon, PencilIcon, DocumentTextIcon, ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';
import { getBlogPosts } from '../../lib/firebase/blog';
import DeleteBlogButton from './components/DeleteBlogButton';

export const dynamic = 'force-dynamic';

function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-BE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateString;
  }
}

export default async function BlogAdminPage(): Promise<React.ReactElement> {
  const posts = await getBlogPosts();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-[#e4e0d8]">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-[#101216] px-3 py-1 text-xs font-bold uppercase tracking-wider text-white mb-2">
            <DocumentTextIcon className="h-3.5 w-3.5 text-[#e03e3e]" />
            <span>Gestion des Articles</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#101216]">
            Les News du Club
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-[#5c6370]">
            {posts.length} article{posts.length !== 1 ? 's' : ''} au total dans la base de données.
          </p>
        </div>
        <Link
          href="/admin/blog/new"
          className="inline-flex items-center gap-2 rounded-md bg-[#e03e3e] hover:bg-[#c93434] px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-white transition-colors shadow-xs shrink-0"
        >
          <PlusIcon className="h-4 w-4" />
          <span>Nouvel Article</span>
        </Link>
      </div>

      {/* Posts Table */}
      <div className="rounded-lg border border-[#e4e0d8] bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-[#e4e0d8]">
            <thead className="bg-[#f2efe9]">
              <tr>
                <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-[#7d8493]">
                  Article
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-[#7d8493]">
                  Auteur
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-[#7d8493]">
                  Catégorie
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-[#7d8493]">
                  Date
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-[#7d8493]">
                  Statut
                </th>
                <th className="px-6 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-[#7d8493]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#efece5] bg-white text-xs">
              {posts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-[#7d8493]">
                    Aucun article pour le moment.{' '}
                    <Link href="/admin/blog/new" className="text-[#e03e3e] font-semibold hover:underline">
                      Créer un article
                    </Link>
                  </td>
                </tr>
              ) : (
                posts.map((post) => (
                  <tr key={post.id} className="hover:bg-[#faf8f5] transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-bold text-[#101216] truncate max-w-xs">
                          {post.title}
                        </p>
                        <p className="text-xs text-[#7d8493] truncate max-w-xs">{post.excerpt}</p>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-[#3a3f4a] font-medium">
                      {post.author}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span className="inline-flex rounded-full bg-[#f2efe9] border border-[#e4e0d8] px-2.5 py-0.5 text-xs font-semibold text-[#5c6370]">
                        {post.category || 'Actualité'}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-[#7d8493] tabular-nums">
                      {formatDate(post.publishedAt)}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider border ${
                          post.isPublished
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        {post.isPublished ? 'Publié' : 'Brouillon'}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/blog/${post.slug}`}
                          target="_blank"
                          className="rounded-md p-1.5 text-[#7d8493] hover:bg-[#f2efe9] hover:text-[#101216] transition-colors"
                          title="Voir sur le site"
                        >
                          <ArrowTopRightOnSquareIcon className="h-4 w-4" />
                        </Link>
                        <Link
                          href={`/admin/blog/${post.id}/edit`}
                          className="rounded-md p-1.5 text-[#7d8493] hover:bg-[#f2efe9] hover:text-[#101216] transition-colors"
                          title="Modifier"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </Link>
                        <DeleteBlogButton postId={post.id} postTitle={post.title} />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
