'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { BlogPost } from '@/app/types';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import { parseDateInfo } from '@/app/lib/carreVert';

interface EditorialGazetteSectionProps {
  posts: BlogPost[];
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

export default function EditorialGazetteSection({ posts }: EditorialGazetteSectionProps) {
  if (!posts || posts.length === 0) return null;

  const featured = posts[0];
  const secondary = posts.slice(1, 4);

  return (
    <section className="py-24 sm:py-32 bg-paper dark:bg-night text-ink dark:text-snow border-b border-line dark:border-night-line relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12 sm:space-y-16">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-line dark:border-night-line pb-8">
          <div className="space-y-3 max-w-2xl">
            <h2 className="text-[clamp(2.25rem,5vw,3.75rem)] font-extrabold uppercase tracking-[-0.03em] leading-[0.98] text-ink dark:text-white text-balance">
              La Gazette du Peloton
            </h2>
            <p className="text-base text-ink-2 dark:text-snow-3 leading-relaxed">
              Récits d&apos;échappées, présentations des nouveaux équipements, sorties patrimoniales et conseils d&apos;entraînement signés par les capitaines.
            </p>
          </div>

          <Link
            href="/blog"
            className="inline-flex items-center gap-2 rounded-md border border-line dark:border-night-line bg-white dark:bg-night-2 px-5 py-3 text-xs font-bold uppercase tracking-wider text-ink dark:text-snow hover:border-ink/40 dark:hover:border-white/40 transition-colors duration-150 shadow-xs"
          >
            <span>Toutes les publications</span>
            <ArrowRightIcon className="h-3.5 w-3.5 text-brand" />
          </Link>
        </div>

        {/* ── Magazine Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Main Featured Article (Hard-Cropped Editorial Cover) */}
          <Link
            href={`/blog/${featured.slug}`}
            className="group relative lg:col-span-7 overflow-hidden rounded-xl bg-night border border-line dark:border-night-line min-h-[420px] sm:min-h-[520px] flex flex-col justify-end shadow-xl hover:shadow-2xl transition-all duration-200 ease-out"
          >
            <Image
              src={featured.coverImage}
              alt={featured.title}
              fill
              unoptimized
              sizes="(max-width: 1024px) 100vw, 58vw"
              className="object-cover opacity-90 transition-transform duration-700 ease-out group-hover:scale-[1.03]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-night via-night/40 to-transparent" />

            <div className="relative z-10 p-6 sm:p-10 space-y-3">
              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight text-white group-hover:text-brand transition-colors duration-150">
                {featured.title}
              </h3>

              <div className="flex flex-wrap items-center gap-2.5 text-xs text-white/80">
                <span className="font-semibold text-white">
                  {featured.category}
                </span>
                <span className="text-white/40">•</span>
                <span>
                  {formatDate(featured.publishedAt)}
                </span>
              </div>

              <p className="text-sm sm:text-base text-white/80 line-clamp-2 leading-relaxed max-w-2xl font-light pt-1">
                {featured.excerpt}
              </p>

              <div className="pt-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white group-hover:text-brand transition-colors duration-150">
                <span>Lire l&apos;article complet</span>
                <ArrowRightIcon className="h-3.5 w-3.5 group-hover:translate-x-1.5 transition-transform duration-150" />
              </div>
            </div>
          </Link>

          {/* Right Column: Editorial Ledger Index */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
            <div className="border-t border-line dark:border-night-line divide-y divide-line dark:divide-night-line">
              {secondary.map((post) => (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className="group block py-6 hover:bg-white/80 dark:hover:bg-night-2 transition-colors duration-150 px-4 -mx-4 rounded-lg"
                >
                  <h4 className="text-lg sm:text-xl font-bold tracking-tight text-ink dark:text-white group-hover:text-brand transition-colors duration-150 leading-snug">
                    {post.title}
                  </h4>

                  <div className="mt-1.5 flex items-center gap-2 text-xs text-ink-3 dark:text-snow-3">
                    <span className="font-semibold text-brand">{post.category}</span>
                    <span>•</span>
                    <span>{formatDate(post.publishedAt)}</span>
                  </div>

                  <p className="mt-2 text-xs sm:text-sm text-ink-3 dark:text-snow-3 line-clamp-2 leading-relaxed">
                    {post.excerpt}
                  </p>

                  <div className="mt-3 flex items-center gap-1.5 text-xs font-bold text-brand">
                    <span>Découvrir</span>
                    <ArrowRightIcon className="h-3 w-3 group-hover:translate-x-1 transition-transform duration-150" />
                  </div>
                </Link>
              ))}
            </div>

            {/* Newsletter or Club Gazette Footer Pill */}
            <div className="rounded-lg bg-white dark:bg-night-2 border border-line dark:border-night-line p-5 flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-ink dark:text-white">
                  La boutique officielle
                </span>
                <p className="text-xs text-ink-3 dark:text-snow-3">
                  Maillots, cuissards et vestes thermiques du club.
                </p>
              </div>
              <Link
                href="/le-club/equipement"
                className="text-xs font-bold uppercase tracking-wider text-brand hover:underline transition-colors duration-150"
              >
                Équipements →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
