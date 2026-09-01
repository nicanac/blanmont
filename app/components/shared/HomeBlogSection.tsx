import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { BlogPost } from '../../types';
import {
  ArrowRightIcon,
  CalendarDaysIcon,
  UserPlusIcon,
} from '@heroicons/react/24/outline';

interface HomeBlogSectionProps {
  posts: BlogPost[];
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
 * HomeBlogSection – Editorial cover story with hairline news index.
 */
export default function HomeBlogSection({ posts }: HomeBlogSectionProps): React.ReactElement | null {
  if (!posts || posts.length === 0) return null;

  const featuredPost = posts[0];
  const secondaryPosts = posts.slice(1, 4);

  return (
    <section className="bg-[#faf8f5] py-16 sm:py-24 border-t border-[#e4e0d8]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section header — no eyebrow, the heading speaks */}
        <div className="flex flex-wrap items-end justify-between gap-4 mb-10">
          <h2 className="max-w-xl text-[clamp(2rem,4.5vw,3.25rem)] font-bold tracking-[-0.025em] leading-[1.02] text-[#101216] text-balance">
            Les dernières nouvelles du peloton
          </h2>
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 rounded-md border border-[#e4e0d8] bg-white px-5 py-2.5 text-[0.8125rem] font-semibold uppercase tracking-[0.06em] text-[#101216] transition-colors hover:border-[#101216]/30"
          >
            <span>Toutes les actualités</span>
            <ArrowRightIcon className="h-3.5 w-3.5 text-[#e03e3e]" />
          </Link>
        </div>

        {/* Content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Featured post — hard-cropped cover story */}
          <Link
            href={`/blog/${featuredPost.slug}`}
            className="group relative lg:col-span-7 overflow-hidden rounded-sm bg-[#0a0c10] min-h-[380px] sm:min-h-[480px] flex flex-col justify-end"
          >
            <Image
              src={featuredPost.coverImage}
              alt={featuredPost.title}
              fill
              sizes="(max-width: 1024px) 100vw, 58vw"
              className="object-cover opacity-90 transition-transform duration-700 group-hover:scale-[1.03]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0c10] via-[#0a0c10]/40 to-transparent" />

            <div className="relative z-10 p-6 sm:p-8 space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-[#e03e3e] px-2.5 py-0.5 text-[0.6875rem] font-bold uppercase tracking-[0.08em] text-white">
                  À la une
                </span>
                <span className="rounded-full bg-white/15 px-2.5 py-0.5 text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-white">
                  {featuredPost.category}
                </span>
                <span className="text-xs text-white/70">
                  {formatDate(featuredPost.publishedAt)}
                </span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-bold tracking-[-0.015em] leading-[1.1] text-white group-hover:text-[#e03e3e] transition-colors line-clamp-2">
                {featuredPost.title}
              </h3>
              <p className="text-xs sm:text-sm leading-relaxed text-white/70 line-clamp-2 max-w-2xl">
                {featuredPost.excerpt}
              </p>
            </div>
          </Link>

          {/* Sidebar — hairline news index, not cards */}
          <div className="lg:col-span-5 flex flex-col">
            {secondaryPosts.length > 0 ? (
              <div className="flex-1 border-t border-[#e4e0d8]">
                {secondaryPosts.map((post) => (
                  <Link
                    key={post.id}
                    href={`/blog/${post.slug}`}
                    className="group block py-5 border-b border-[#e4e0d8] hover:bg-white/60 transition-colors px-1 -mx-1"
                  >
                    <div className="flex items-center gap-3 text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-[#5c6370]">
                      <span className="text-[#e03e3e]">{post.category}</span>
                      <span aria-hidden="true" className="h-px w-4 bg-[#e4e0d8]" />
                      <span className="normal-case tracking-normal font-medium">{formatDate(post.publishedAt)}</span>
                    </div>

                    <h4 className="mt-2 text-lg font-bold tracking-[-0.015em] leading-snug text-[#101216] group-hover:text-[#e03e3e] transition-colors line-clamp-2">
                      {post.title}
                    </h4>
                    <p className="mt-1 text-xs text-[#3a3f4a] line-clamp-2 leading-relaxed max-w-[65ch]">
                      {post.excerpt}
                    </p>

                    <div className="mt-2.5 flex items-center gap-1 text-xs font-semibold text-[#e03e3e]">
                      <span>Lire l&apos;article</span>
                      <ArrowRightIcon className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="flex-1 flex flex-col gap-6">
                {/* Événements & Agenda */}
                <div className="rounded-lg border border-[#e4e0d8] bg-white p-6 flex-1 flex flex-col justify-between">
                  <div className="space-y-2.5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-md bg-amber-500/10 text-amber-700">
                      <CalendarDaysIcon className="h-5 w-5" />
                    </div>
                    <h3 className="text-lg font-bold tracking-[-0.015em] text-[#101216]">
                      Agenda des sorties
                    </h3>
                    <p className="text-xs text-[#3a3f4a] leading-relaxed">
                      Consultez les prochaines sorties du club, les horaires de départ et les randos extérieures prévues.
                    </p>
                  </div>
                  <div className="pt-4 mt-4 border-t border-[#e4e0d8]">
                    <Link
                      href="/calendrier"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#e03e3e] hover:underline"
                    >
                      <span>Voir le calendrier complet</span>
                      <ArrowRightIcon className="h-3 w-3" />
                    </Link>
                  </div>
                </div>

                {/* Rejoindre le club */}
                <div className="rounded-lg border border-[#e4e0d8] bg-white p-6 flex-1 flex flex-col justify-between">
                  <div className="space-y-2.5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[#e03e3e]/10 text-[#e03e3e]">
                      <UserPlusIcon className="h-5 w-5" />
                    </div>
                    <h3 className="text-lg font-bold tracking-[-0.015em] text-[#101216]">
                      Envie de nous rejoindre ?
                    </h3>
                    <p className="text-xs text-[#3a3f4a] leading-relaxed">
                      Venez tester une sortie sans engagement. Découvrez notre esprit club et trouvez le groupe qui vous correspond.
                    </p>
                  </div>
                  <div className="pt-4 mt-4 border-t border-[#e4e0d8]">
                    <Link
                      href="/le-club"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#e03e3e] hover:underline"
                    >
                      <span>Présentation &amp; Groupes</span>
                      <ArrowRightIcon className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
