import React from 'react';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
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
      title: 'Article non trouvé | Blanmont Cycling Club',
    };
  }

  return {
    title: `${post.title} | Blanmont Cycling Club`,
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
export default async function BlogPostPage({ params }: BlogPostPageProps): Promise<React.ReactElement> {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="bg-white">
      <article className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12 pt-24">
        {/* Back Link */}
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-red-600 transition-colors mb-8"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Retour au blog
        </Link>

        {/* Header */}
        <header className="mb-8">
          <div className="mb-4">
            <span className="inline-block rounded bg-red-600 px-3 py-1 text-xs font-medium text-white">
              {post.category}
            </span>
          </div>

          <h1 className="text-4xl font-bold tracking-tight text-gray-900 mb-4">
            {post.title}
          </h1>

          <p className="text-xl text-gray-600 mb-6">{post.excerpt}</p>

          {/* Author & Date */}
          <div className="flex items-center gap-4 border-b border-gray-200 pb-6">
            <div className="relative h-12 w-12 overflow-hidden rounded-full bg-gray-200">
              {post.authorAvatar && (
                <Image
                  src={post.authorAvatar}
                  alt={post.author}
                  fill
                  className="object-cover"
                />
              )}
            </div>
            <div>
              <p className="font-medium text-gray-900">{post.author}</p>
              <p className="text-sm text-gray-500">{formatDate(post.publishedAt)}</p>
            </div>
          </div>
        </header>

        {/* Cover Image */}
        <div className="relative aspect-video overflow-hidden rounded-lg mb-8">
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
        <div
          className="prose prose-lg prose-gray max-w-none prose-headings:font-semibold prose-a:text-red-600 prose-a:no-underline hover:prose-a:underline"
          dangerouslySetInnerHTML={{
            __html: convertMarkdownToHtml(post.content),
          }}
        />

        {/* Footer */}
        <footer className="mt-12 pt-8 border-t border-gray-200">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm font-medium text-red-600 hover:text-red-700 transition-colors"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Voir tous les articles
          </Link>
        </footer>
      </article>
    </div>
  );
}

/**
 * Simple Markdown to HTML converter for basic content.
 * For production, consider using a library like marked or remark.
 */
function convertMarkdownToHtml(markdown: string): string {
  return markdown
    // Headers
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    // Bold
    .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
    // Italic
    .replace(/\*(.*)\*/gim, '<em>$1</em>')
    // Lists
    .replace(/^\- (.*$)/gim, '<li>$1</li>')
    // Links
    .replace(/\[([^\]]+)\]\(([^\)]+)\)/gim, '<a href="$2">$1</a>')
    // Paragraphs (basic)
    .split('\n\n')
    .map((block) => {
      const trimmed = block.trim();
      if (!trimmed) return '';
      if (trimmed.startsWith('<h') || trimmed.startsWith('<li')) {
        // Wrap consecutive li elements in ul
        if (trimmed.includes('<li>')) {
          return `<ul>${trimmed}</ul>`;
        }
        return trimmed;
      }
      return `<p>${trimmed.replace(/\n/g, '<br>')}</p>`;
    })
    .join('\n');
}
