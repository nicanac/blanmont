'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { BlogPost } from '@/app/types';
import { ArrowRightIcon, SparklesIcon, BookOpenIcon } from '@heroicons/react/24/outline';

interface EditorialGazetteSectionProps {
  posts: BlogPost[];
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

export default function EditorialGazetteSection({ posts }: EditorialGazetteSectionProps) {
  if (!posts || posts.length === 0) return null;

  const featured = posts[0];
  const secondary = posts.slice(1, 4);

  return (
    <section className="py-24 sm:py-32 bg-[#faf8f5] text-[#101216] border-b border-[#e4e0d8] relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12 sm:space-y-16">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#e4e0d8] pb-8">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em] text-[#e03e3e]">
              <BookOpenIcon className="h-4 w-4" />
              Édition &amp; Chroniques
            </div>
            <h2 className="text-[clamp(2.25rem,5vw,3.75rem)] font-extrabold uppercase tracking-[-0.03em] leading-[0.98] text-[#101216] text-balance">
              La Gazette du Peloton
            </h2>
            <p className="text-base text-[#3a3f4a] leading-relaxed">
              Récits d&apos;échappées, présentations des nouveaux équipements, sorties patrimoniales et conseils d&apos;entraînement signés par les capitaines.
            </p>
          </div>

          <Link
            href="/blog"
            className="inline-flex items-center gap-2 rounded-md border border-[#e4e0d8] bg-white px-5 py-3 text-xs font-bold uppercase tracking-wider text-[#101216] hover:border-[#101216]/40 transition-colors shadow-xs"
          >
            <span>Toutes les publications</span>
            <ArrowRightIcon className="h-3.5 w-3.5 text-[#e03e3e]" />
          </Link>
        </div>

        {/* ── Magazine Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Main Featured Article (Hard-Cropped Editorial Cover) */}
          <Link
            href={`/blog/${featured.slug}`}
            className="group relative lg:col-span-7 overflow-hidden rounded-xl bg-[#0a0c10] border border-[#e4e0d8] min-h-[420px] sm:min-h-[520px] flex flex-col justify-end shadow-xl hover:shadow-2xl transition-all duration-500"
          >
            <Image
              src={featured.coverImage}
              alt={featured.title}
              fill
              sizes="(max-width: 1024px) 100vw, 58vw"
              className="object-cover opacity-90 transition-transform duration-700 ease-out group-hover:scale-[1.03]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#08090c] via-[#08090c]/40 to-transparent" />

            <div className="relative z-10 p-6 sm:p-10 space-y-4">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="rounded-md bg-[#e03e3e] px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-white shadow-md">
                  À la Une
                </span>
                <span className="rounded-md bg-white/20 backdrop-blur-md px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-white border border-white/20">
                  {featured.category}
                </span>
                <span className="text-xs text-white/75">
                  {formatDate(featured.publishedAt)}
                </span>
              </div>

              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight text-white group-hover:text-[#e03e3e] transition-colors">
                {featured.title}
              </h3>

              <p className="text-sm sm:text-base text-white/80 line-clamp-2 leading-relaxed max-w-2xl font-light">
                {featured.excerpt}
              </p>

              <div className="pt-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white group-hover:text-[#e03e3e] transition-colors">
                <span>Lire l&apos;article complet</span>
                <ArrowRightIcon className="h-3.5 w-3.5 group-hover:translate-x-1.5 transition-transform" />
              </div>
            </div>
          </Link>

          {/* Right Column: Editorial Ledger Index */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
            <div className="border-t border-[#e4e0d8] divide-y divide-[#e4e0d8]">
              {secondary.map((post) => (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className="group block py-6 hover:bg-white/80 transition-colors px-4 -mx-4 rounded-lg"
                >
                  <div className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-widest text-[#5c6370]">
                    <span className="text-[#e03e3e]">{post.category}</span>
                    <span className="h-px w-3 bg-[#e4e0d8]" />
                    <span className="font-medium text-[#7d8493]">{formatDate(post.publishedAt)}</span>
                  </div>

                  <h4 className="mt-2 text-lg sm:text-xl font-bold tracking-tight text-[#101216] group-hover:text-[#e03e3e] transition-colors leading-snug">
                    {post.title}
                  </h4>

                  <p className="mt-1.5 text-xs sm:text-sm text-[#5c6370] line-clamp-2 leading-relaxed">
                    {post.excerpt}
                  </p>

                  <div className="mt-3 flex items-center gap-1.5 text-xs font-bold text-[#e03e3e]">
                    <span>Découvrir</span>
                    <ArrowRightIcon className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              ))}
            </div>

            {/* Newsletter or Club Gazette Footer Pill */}
            <div className="rounded-lg bg-white border border-[#e4e0d8] p-5 flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-[#101216]">
                  La boutique officielle
                </span>
                <p className="text-[11px] text-[#5c6370]">
                  Maillots, cuissards et vestes thermiques du club.
                </p>
              </div>
              <Link
                href="/le-club/equipement"
                className="text-xs font-bold uppercase tracking-wider text-[#e03e3e] hover:underline"
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
