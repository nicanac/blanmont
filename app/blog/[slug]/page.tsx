import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeftIcon, CalendarDaysIcon, UserIcon } from '@heroicons/react/24/outline';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { getBlogPostBySlug, getBlogPosts } from '../../lib/firebase';

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return dateString;
  }
}

function isValidImageUrl(url?: string): boolean {
  if (!url) return false;
  const trimmed = url.trim().toLowerCase();
  if (
    !trimmed ||
    trimmed.includes('placehold.co') ||
    trimmed.includes('via.placeholder') ||
    trimmed.includes('placeholder') ||
    trimmed === 'null' ||
    trimmed === 'undefined'
  ) {
    return false;
  }
  return true;
}

function getInitials(name: string): string {
  if (!name) return 'CC';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  const posts = await getBlogPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

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
      images: post.coverImage ? [post.coverImage] : [],
      type: 'article',
      publishedTime: post.publishedAt,
      authors: [post.author],
    },
  };
}

export default async function BlogPostPage({
  params,
}: BlogPostPageProps): Promise<React.ReactElement> {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const hasCoverImage = isValidImageUrl(post.coverImage);
  const hasAvatar = isValidImageUrl(post.authorAvatar);
  const initials = getInitials(post.author);

  return (
    <main className="min-h-screen bg-[#faf8f5]">
      {/* ──── Editorial Article Header (Ink) ──── */}
      <header className="relative overflow-hidden bg-[#0a0c10] text-white border-b border-[#262b38]">
        {/* Ambient red glow */}
        <div className="pointer-events-none absolute -top-40 -right-24 h-[500px] w-[500px] rounded-full bg-[#e03e3e]/15 blur-[140px]" />

        <div className="relative mx-auto max-w-4xl px-4 pt-10 pb-12 sm:px-6 sm:pt-14 sm:pb-16 lg:px-8 space-y-6">
          {/* Back Navigation */}
          <div>
            <Link
              href="/blog"
              className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#a7adbb] hover:text-white transition-colors"
            >
              <ArrowLeftIcon className="h-3.5 w-3.5" />
              <span>Retour aux actualités</span>
            </Link>
          </div>

          {/* Category Pill */}
          <div>
            <span className="inline-flex items-center rounded-full bg-[#e03e3e]/15 border border-[#e03e3e]/30 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#e03e3e]">
              {post.category || 'Actualité'}
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-[clamp(2.25rem,5.5vw,3.75rem)] font-extrabold uppercase tracking-tight leading-[1.02] text-balance text-white">
            {post.title}
          </h1>

          {/* Excerpt */}
          {post.excerpt && (
            <p className="text-base sm:text-lg text-[#a7adbb] leading-relaxed">
              {post.excerpt}
            </p>
          )}

          {/* Author & Meta Strip */}
          <div className="pt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-3">
              <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-[#161922] border border-white/15 flex items-center justify-center font-bold text-xs text-white shadow-sm">
                {hasAvatar ? (
                  <img
                    src={post.authorAvatar}
                    alt={post.author}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span>{initials}</span>
                )}
              </div>
              <div>
                <p className="font-bold text-white">{post.author}</p>
                <p className="text-xs text-[#a7adbb]">Membre du Club de Blanmont</p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-[#a7adbb] tabular-nums bg-white/5 border border-white/10 px-3 py-1.5 rounded-full">
              <CalendarDaysIcon className="h-4 w-4 text-[#7d8493]" />
              <span>Publié le {formatDate(post.publishedAt)}</span>
            </div>
          </div>
        </div>
      </header>

      {/* ──── Article Body (Paper) ──── */}
      <article className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        {/* Cover Photo if present */}
        {hasCoverImage && (
          <div className="relative aspect-[16/9] w-full overflow-hidden rounded-lg shadow-xl mb-12 border border-[#e4e0d8] bg-[#161922]">
            <img
              src={post.coverImage}
              alt={post.title}
              className="h-full w-full object-cover"
            />
          </div>
        )}

        {/* Markdown Content */}
        <div className="prose prose-lg prose-slate max-w-none leading-relaxed prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-[#101216] prose-p:text-[#3a3f4a] prose-a:text-[#e03e3e] prose-a:font-semibold hover:prose-a:underline prose-blockquote:border-l-[#e03e3e] prose-blockquote:bg-white prose-blockquote:p-4 prose-blockquote:rounded-r-md prose-img:rounded-lg prose-img:border prose-img:border-[#e4e0d8]">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {post.content}
          </ReactMarkdown>
        </div>

        {/* Article Footer */}
        <footer className="mt-14 pt-8 border-t border-[#e4e0d8] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 rounded-md bg-[#e03e3e] hover:bg-[#c93434] text-white px-5 py-2.5 text-xs font-semibold uppercase tracking-wider transition-colors"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            <span>Tous les articles</span>
          </Link>

          <Link
            href="/calendrier"
            className="inline-flex items-center gap-2 rounded-md border border-[#e4e0d8] bg-white hover:bg-[#f2efe9] text-[#101216] px-5 py-2.5 text-xs font-semibold uppercase tracking-wider transition-colors"
          >
            <span>Consulter le calendrier des sorties</span>
          </Link>
        </footer>
      </article>
    </main>
  );
}
