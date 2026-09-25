import React from 'react';
import Link from 'next/link';
import { PencilIcon, DocumentTextIcon, ArrowTopRightOnSquareIcon, PlusIcon } from '@heroicons/react/24/outline';
import { getBlogPosts } from '../../lib/firebase/blog';
import DeleteBlogButton from './components/DeleteBlogButton';
import AdminEmptyState from '../components/AdminEmptyState';
import BlogIndexHeader from './components/BlogIndexHeader';
import { parseDateInfo } from '@/app/lib/carreVert';

export const dynamic = 'force-dynamic';

function formatDate(dateString: string): string {
  const info = parseDateInfo(dateString);
  if (!info) return dateString;
  try {
    const utcDate = new Date(Date.UTC(info.year, info.month - 1, info.day));
    return utcDate.toLocaleDateString('fr-BE', {
      timeZone: 'UTC',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return info.displayDate;
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
        <div id="blog-table-section" className="rounded-sm border border-line dark:border-night-line bg-paper dark:bg-night-2 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-line dark:divide-night-line">
              <thead className="bg-paper-2 dark:bg-night-3">
                <tr>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-ink-3 dark:text-snow-3">
                    Article
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-ink-3 dark:text-snow-3">
                    Auteur
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-ink-3 dark:text-snow-3">
                    Catégorie
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-ink-3 dark:text-snow-3">
                    Date
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-ink-3 dark:text-snow-3">
                    Statut
                  </th>
                  <th className="px-6 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-ink-3 dark:text-snow-3">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line dark:divide-night-line bg-paper dark:bg-night-2 text-xs">
                {posts.map((post) => (
                  <tr key={post.id} className="hover:bg-paper-2/60 dark:hover:bg-night-3/60 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-bold text-ink dark:text-white truncate max-w-xs">
                          {post.title}
                        </p>
                        <p className="text-xs text-ink-3 dark:text-snow-3 truncate max-w-xs">{post.excerpt}</p>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-ink-2 dark:text-snow-2 font-medium">
                      {post.author}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span className="inline-flex rounded-full bg-paper-2 dark:bg-night-3 border border-line dark:border-night-line px-2.5 py-0.5 text-xs font-semibold text-ink-3 dark:text-snow-3">
                        {post.category || 'Actualité'}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-ink-3 dark:text-snow-3 tabular-nums">
                      {formatDate(post.publishedAt)}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider border ${
                          post.isPublished
                            ? 'bg-vert/10 text-vert border-vert/30'
                            : 'bg-ambre/10 text-ambre border-ambre/30'
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
                          className="rounded-md p-1.5 text-ink-3 dark:text-snow-3 hover:bg-paper-2 dark:hover:bg-night-3 hover:text-ink dark:hover:text-white transition-colors"
                          title="Voir sur le site"
                        >
                          <ArrowTopRightOnSquareIcon className="h-4 w-4" />
                        </Link>
                        <Link
                          href={`/admin/blog/${post.id}/edit`}
                          className="rounded-md p-1.5 text-ink-3 dark:text-snow-3 hover:bg-paper-2 dark:hover:bg-night-3 hover:text-ink dark:hover:text-white transition-colors"
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
