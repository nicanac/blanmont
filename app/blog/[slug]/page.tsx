import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeftIcon, CalendarDaysIcon, ClockIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { getBlogPostBySlug, getBlogPosts } from '../../lib/firebase';

import Image from 'next/image';
import { parseDateInfo } from '@/app/lib/carreVert';
import { sanitizeBlogHtml, isHtmlContent } from '@/app/lib/sanitizeHtml';
import TerritoryMap from '@/app/components/carte/TerritoryMap';

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

function formatDate(dateString: string): string {
  const info = parseDateInfo(dateString);
  if (!info) return dateString;
  try {
    const utcDate = new Date(Date.UTC(info.year, info.month - 1, info.day));
    return utcDate.toLocaleDateString('fr-FR', {
      timeZone: 'UTC',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return info.displayDate;
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
  const initials = getInitials(post.author);

  // Compute estimated reading time (~200 words per minute)
  const wordCount = post.content ? post.content.trim().split(/\s+/).length : 0;
  const readingTimeMinutes = Math.max(1, Math.ceil(wordCount / 200));

  const encodedShareText = encodeURIComponent(
    `🚴‍♂️ ${post.title} — Club Cyclo Saint-Martin de Blanmont : https://blanmont.be/blog/${post.slug}`
  );

  return (
    <main className="min-h-screen bg-paper dark:bg-night">
      <header className="border-b border-line bg-paper dark:border-night-line dark:bg-night">
        <div className="relative h-20 overflow-hidden border-b border-line [--sheet:1500px] sm:h-24 sm:[--sheet:2300px] dark:border-night-line">
          <TerritoryMap labels={0} marker="none" layers="relief" sheetClassName="w-(--sheet) left-[calc(50%-var(--sheet)*0.56)] top-[calc(50%-var(--sheet)*0.42)]" />
        </div>
        <div className="mx-auto max-w-4xl space-y-6 px-4 pb-10 pt-8 sm:px-6 sm:pb-14 sm:pt-10 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            <Link
              href="/blog"
              className="inline-flex min-h-[44px] items-center gap-2 rounded-sm font-narrow text-xs font-bold uppercase tracking-[0.1em] text-ink-2 transition-colors hover:text-ink dark:text-snow-2 dark:hover:text-snow"
            >
              <ArrowLeftIcon className="size-4" aria-hidden="true" />
              <span>Retour aux actualités</span>
            </Link>
            <span className="inline-flex items-center rounded-full border border-brand/40 px-3 py-1 font-narrow text-xs font-bold uppercase tracking-[0.1em] text-brand dark:text-brand-soft">
              {post.category || 'Actualité'}
            </span>
          </div>
      
          <h1 className="text-balance font-semiwide text-[clamp(2.1rem,5vw,3.6rem)] font-extrabold leading-[1.02] tracking-[-0.01em] text-ink dark:text-snow">
            {post.title}
          </h1>
      
          {post.excerpt && <p className="max-w-[62ch] text-lg leading-relaxed text-ink-2 dark:text-snow-2">{post.excerpt}</p>}
      
          <div className="flex flex-wrap items-center justify-between gap-4 border-t-2 border-ink pt-5 text-xs dark:border-snow-2">
            <div className="flex items-center gap-3">
              <div className="relative flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-sm bg-ink text-xs font-bold text-white dark:bg-night-3">
                {post.authorAvatar ? <Image src={post.authorAvatar} alt="" fill unoptimized sizes="40px" className="object-cover" /> : <span>{initials}</span>}
              </div>
              <div>
                <p className="text-sm font-bold text-ink dark:text-snow">{post.author}</p>
                <p className="text-xs text-ink-3 dark:text-snow-3">Membre du Club de Blanmont</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 font-narrow text-xs font-semibold uppercase tracking-[0.08em] text-ink-3 dark:text-snow-3">
              <span className="inline-flex items-center gap-1.5 tabular-nums">
                <CalendarDaysIcon className="size-4" aria-hidden="true" />
                Publié le {formatDate(post.publishedAt)}
              </span>
              <span className="inline-flex items-center gap-1.5 tabular-nums">
                <ClockIcon className="size-4" aria-hidden="true" />
                {readingTimeMinutes} min de lecture
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* ──── Article Body (Paper) ──── */}
      <article className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        {/* Cover Photo if present */}
        {hasCoverImage && (
          <figure className="mb-12">
            <div className="relative aspect-[16/9] w-full overflow-hidden border border-ink bg-paper-2 dark:border-night-line-strong dark:bg-night-3">
              <Image
                src={post.coverImage}
                alt={post.title}
                fill
                unoptimized
                priority
                sizes="(max-width: 1024px) 100vw, 896px"
                className="object-cover"
              />
            </div>
          </figure>
        )}

        {/* Article content set to a comfortable reading measure */}
        <div className="prose mx-auto max-w-[68ch]">
          {isHtmlContent(post.content) ? (
            <div
              dangerouslySetInnerHTML={{
                __html: sanitizeBlogHtml(post.content),
              }}
            />
          ) : (
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {post.content}
            </ReactMarkdown>
          )}
        </div>

        {/* Share & Footer Strip */}
        <footer className="mx-auto mt-14 max-w-[68ch] space-y-6 border-t-2 border-ink pt-8 dark:border-snow-2">
          <div className="flex flex-col gap-3 border border-line bg-white p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5 dark:border-night-line dark:bg-night-2">
            <div>
              <h3 className="text-sm font-bold text-ink dark:text-white">Partager cette chronique</h3>
              <p className="text-xs text-ink-3 dark:text-snow-3">Partagez le récit avec le groupe et vos amis cyclistes.</p>
            </div>
            <a
              href={`https://api.whatsapp.com/send?text=${encodedShareText}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[44px] shrink-0 items-center justify-center gap-2 rounded-md bg-vert px-5 font-narrow text-xs font-bold uppercase tracking-[0.08em] text-white transition-colors hover:bg-vert-strong"
            >
              <ChatBubbleLeftRightIcon className="size-4" aria-hidden="true" />
              <span>Partager sur WhatsApp</span>
            </a>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <Link
              href="/blog"
              className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-md bg-brand px-6 font-narrow text-xs font-bold uppercase tracking-[0.08em] text-white transition-colors hover:bg-brand-strong"
            >
              <ArrowLeftIcon className="size-4" aria-hidden="true" />
              <span>Tous les articles</span>
            </Link>

            <Link
              href="/calendrier"
              className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-md border border-ink px-6 font-narrow text-xs font-bold uppercase tracking-[0.08em] text-ink transition-colors hover:bg-ink hover:text-white dark:border-snow-2 dark:text-snow dark:hover:bg-snow dark:hover:text-night"
            >
              <span>Consulter le calendrier des sorties</span>
            </Link>
          </div>
        </footer>
      </article>
    </main>
  );
}
