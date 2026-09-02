import React from 'react';
import Link from 'next/link';
import { PencilIcon, DocumentTextIcon, ArrowTopRightOnSquareIcon, PlusIcon } from '@heroicons/react/24/outline';
import { getBlogPosts } from '../../lib/firebase/blog';
import DeleteBlogButton from './components/DeleteBlogButton';
import AdminEmptyState from '../components/AdminEmptyState';
import BlogIndexHeader from './components/BlogIndexHeader';

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
      {/* Header with Tutorial & New Post Actions */}
      <BlogIndexHeader postCount={posts.length} />

      {/* Posts Content */}
      {posts.length === 0 ? (
        <AdminEmptyState
          icon={DocumentTextIcon}
          title="Aucun article publié sur le blog"
          description="Rédigez les comptes-rendus de sorties, partagez les photos du peloton et diffusez les annonces officielles pour tous les membres du club."
          primaryAction={{
            label: 'Rédiger le premier article',
            href: '/admin/blog/new',
            icon: PlusIcon,
          }}
          secondaryAction={{
            label: 'Voir la rubrique News',
            href: '/blog',
            icon: ArrowTopRightOnSquareIcon,
          }}
          tip="Vous pouvez utiliser le format Markdown et insérer des photos pour enrichir la mise en page de vos chroniques."
        />
      ) : (
        <div id="blog-table-section" className="rounded-lg border border-[#e4e0d8] bg-white shadow-xs overflow-hidden">
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
                {posts.map((post) => (
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
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
