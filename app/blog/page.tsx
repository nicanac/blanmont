import React from 'react';
import type { Metadata } from 'next';
import { getBlogPosts } from '../lib/firebase';
import { BlogList } from '../features/blog/components';
import {
  NewspaperIcon,
  BookOpenIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Les News | Club de Blanmont',
  description: 'Articles, conseils et actualités du Club de Blanmont',
};

export default async function BlogPage(): Promise<React.ReactElement> {
  const posts = await getBlogPosts();

  // Extract unique categories count
  const categoriesCount = new Set(posts.map((p) => p.category).filter(Boolean)).size || 4;

  return (
    <main className="min-h-screen bg-[#faf8f5]">
      {/* ──── Editorial Cover Hero (Ink) ──── */}
      <section className="relative overflow-hidden bg-[#0a0c10] text-white border-b border-[#262b38]">
        <div className="relative mx-auto max-w-7xl px-4 pt-14 pb-10 sm:px-6 sm:pt-20 sm:pb-12 lg:px-8">
          {/* Title row */}
          <div className="space-y-3 max-w-3xl pb-8 border-b border-white/10">
            <h1 className="text-[clamp(2.25rem,6vw,4.25rem)] font-extrabold uppercase tracking-[-0.03em] leading-[0.98] text-balance">
              Les News du <span className="text-[#e03e3e] italic">Peloton</span>
            </h1>

            <p className="max-w-2xl text-base text-[#a7adbb] leading-relaxed">
              Récits des sorties du weekend, conseils techniques, annonces officielles et coulisses du Club Cyclo Saint-Martin de Blanmont.
            </p>
          </div>

          {/* Stat Strip on Ink (Horizontal Hairline Structure) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-white/10 pt-6">
            {/* Total Articles */}
            <div className="py-3 sm:py-0 sm:px-6 first:sm:pl-0 flex items-center gap-4">
              <div className="rounded-md bg-[#e03e3e]/15 border border-[#e03e3e]/30 p-2.5 text-[#e03e3e] shrink-0">
                <NewspaperIcon className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-extrabold text-white tabular-nums tracking-tight">
                  {posts.length}
                </div>
                <div className="text-xs uppercase tracking-[0.08em] text-[#a7adbb] font-semibold">
                  Articles publiés
                </div>
              </div>
            </div>

            {/* Rubriques */}
            <div className="py-3 sm:py-0 sm:px-6 flex items-center gap-4">
              <div className="rounded-md bg-white/5 border border-white/10 p-2.5 text-[#f5f6f8] shrink-0">
                <BookOpenIcon className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-extrabold text-white tabular-nums tracking-tight">
                  {categoriesCount}
                </div>
                <div className="text-xs uppercase tracking-[0.08em] text-[#a7adbb] font-semibold">
                  Thématiques &amp; rubriques
                </div>
              </div>
            </div>

            {/* Club spirit */}
            <div className="py-3 sm:py-0 sm:px-6 last:sm:pr-0 flex items-center gap-4">
              <div className="rounded-md bg-white/5 border border-white/10 p-2.5 text-[#f5f6f8] shrink-0">
                <SparklesIcon className="h-5 w-5 text-[#3b82f6]" aria-hidden="true" />
              </div>
              <div>
                <div className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Le Peloton de Blanmont
                </div>
                <div className="text-xs uppercase tracking-[0.08em] text-[#a7adbb] font-semibold">
                  Récits &amp; vie du club
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ──── Main Content Spread (Paper) ──── */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <BlogList posts={posts} />
      </section>
    </main>
  );
}
