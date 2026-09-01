import React from 'react';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeftIcon, TagIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { PageHero } from '@/app/components/ui/PageHero';
import { getBlogPostBySlug, getBlogPosts } from '../../lib/firebase';

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

/**
 * Formats a date string to a readable format
 */
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Generate static params for all blog posts
 */
export async function generateStaticParams(): Promise<{ slug: string }[]> {
  const posts = await getBlogPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

/**
 * Generate metadata for the blog post
 */
export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post) {
    return {
      title: 'Article non trouvé | Club de Blanmont',
    };
  }

  return {
    title: `${post.title} | Club de Blanmont`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: [post.coverImage],
      type: 'article',
      publishedTime: post.publishedAt,
      authors: [post.author],
    },
  };
}

/**
 * Blog Post Detail Page.
 * Displays a single blog post with full content.
 */
export default async function BlogPostPage({
  params,
}: BlogPostPageProps): Promise<React.ReactElement> {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="bg-white">
      <PageHero
        title={post.title}
        description={post.excerpt}
        badge={post.category}
        badgeIcon={<TagIcon className="h-4 w-4" />}
        variant="dark"
        size="md"
      >
        <div className="mt-8 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="relative h-12 w-12 overflow-hidden rounded-full ring-2 ring-white/20 bg-gray-800 flex items-center justify-center">
              {post.authorAvatar ? (
                <Image src={post.authorAvatar} alt={post.author} fill className="object-cover" />
              ) : (
                <UserCircleIcon className="h-8 w-8 text-gray-400" />
              )}
            </div>
            <div>
              <p className="font-medium text-white">{post.author}</p>
              <p className="text-sm text-gray-400">{formatDate(post.publishedAt)}</p>
            </div>
          </div>
        </div>
      </PageHero>

      <article className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-[#e03e3e] transition-colors mb-8"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          <span>Retour au blog</span>
        </Link>

        {/* Cover Image */}
        <div className="relative aspect-video w-full overflow-hidden rounded-2xl shadow-lg mb-12 border border-slate-200">
          <Image
            src={post.coverImage}
            alt={post.title}
            fill
            sizes="(max-width: 896px) 100vw, 896px"
            className="object-cover"
            priority
          />
        </div>

        {/* Content */}
        <div className="prose prose-lg prose-slate max-w-none leading-relaxed prose-headings:font-bold prose-headings:tracking-tight prose-a:text-[#e03e3e] prose-a:font-semibold hover:prose-a:underline prose-img:rounded-2xl">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {post.content}
          </ReactMarkdown>
        </div>

        {/* Footer */}
        <footer className="mt-12 pt-8 border-t border-slate-200">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#e03e3e] hover:text-[#c93434] transition-colors"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            <span>Voir tous les articles</span>
          </Link>
        </footer>
      </article>
    </div>
  );
}
