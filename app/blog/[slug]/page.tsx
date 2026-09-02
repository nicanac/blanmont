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

  // Compute estimated reading time (~200 words per minute)
  const wordCount = post.content ? post.content.trim().split(/\s+/).length : 0;
  const readingTimeMinutes = Math.max(1, Math.ceil(wordCount / 200));

  const encodedShareUrl = encodeURIComponent(`https://blanmont.be/blog/${post.slug}`);
  const encodedShareText = encodeURIComponent(
    `🚴‍♂️ ${post.title} — Club Cyclo Saint-Martin de Blanmont : https://blanmont.be/blog/${post.slug}`
  );

  return (
    <main className="min-h-screen bg-[#faf8f5]">
      {/* ──── Editorial Article Header (Ink) ──── */}
      <header className="relative overflow-hidden bg-[#0a0c10] text-white border-b border-[#262b38]">
        {/* Atmospheric Background Watermark */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none select-none opacity-[0.025] leading-none text-center">
          <span className="text-[clamp(6rem,22vw,28rem)] font-extrabold uppercase tracking-tighter text-white whitespace-nowrap">
            BLANMONT
          </span>
        </div>

        <div className="relative mx-auto max-w-4xl px-4 pt-8 pb-10 sm:px-6 sm:pt-12 sm:pb-14 lg:px-8 space-y-6 z-10">
          {/* Back Navigation & Category row */}
          <div className="flex items-center justify-between gap-4">
            <Link
              href="/blog"
              className="min-h-[44px] inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#a7adbb] hover:text-white transition-colors focus-visible:ring-2 focus-visible:ring-[#e03e3e] focus:outline-hidden rounded-md"
            >
              <ArrowLeftIcon className="h-4 w-4" aria-hidden="true" />
              <span>Retour aux actualités</span>
            </Link>

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
              <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-[#161922] border border-white/15 flex items-center justify-center font-bold text-xs text-white shadow-xs">
                {hasAvatar ? (
                  <img
                    src={post.authorAvatar}
                    alt=""
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

            <div className="flex flex-wrap items-center gap-3 text-[#a7adbb]">
              <div className="flex items-center gap-1.5 tabular-nums bg-white/5 border border-white/10 px-3 py-1.5 rounded-full">
                <CalendarDaysIcon className="h-4 w-4 text-[#a7adbb]" aria-hidden="true" />
                <span>Publié le {formatDate(post.publishedAt)}</span>
              </div>

              <div className="flex items-center gap-1.5 tabular-nums bg-white/5 border border-white/10 px-3 py-1.5 rounded-full">
                <span>⏱️</span>
                <span>{readingTimeMinutes} min de lecture</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ──── Article Body (Paper) ──── */}
      <article className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        {/* Cover Photo if present */}
        {hasCoverImage && (
          <div className="relative aspect-[16/9] w-full overflow-hidden rounded-lg shadow-md mb-12 border border-[#e4e0d8] bg-[#161922]">
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

        {/* Share & Footer Strip */}
        <footer className="mt-14 pt-8 border-t border-[#e4e0d8] space-y-6">
          {/* Social Share Bar */}
          <div className="rounded-lg border border-[#e4e0d8] bg-white p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-[#101216]">Partager cette chronique</h3>
              <p className="text-xs text-[#5c6370]">Partagez le récit avec le groupe et vos amis cyclistes.</p>
            </div>
            <a
              href={`https://api.whatsapp.com/send?text=${encodedShareText}`}
              target="_blank"
              rel="noopener noreferrer"
              className="min-h-[44px] inline-flex items-center justify-center gap-2 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition-colors shrink-0"
            >
              <span>💬 Partager sur WhatsApp</span>
            </a>
          </div>

          {/* Navigation CTAs */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <Link
              href="/blog"
              className="min-h-[44px] inline-flex items-center justify-center gap-2 rounded-md bg-[#e03e3e] hover:bg-[#c93434] text-white px-6 py-2.5 text-xs font-bold uppercase tracking-wider transition-colors shadow-xs"
            >
              <ArrowLeftIcon className="h-4 w-4" aria-hidden="true" />
              <span>Tous les articles</span>
            </Link>

            <Link
              href="/calendrier"
              className="min-h-[44px] inline-flex items-center justify-center gap-2 rounded-md border border-[#e4e0d8] bg-white hover:bg-[#f2efe9] text-[#101216] px-6 py-2.5 text-xs font-bold uppercase tracking-wider transition-colors shadow-xs"
            >
              <span>Consulter le calendrier des sorties</span>
            </Link>
          </div>
        </footer>
      </article>
    </main>
  );
}
