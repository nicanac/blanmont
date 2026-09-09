import React from 'react';
import type { Metadata } from 'next';
import { getBlogPosts } from '../lib/firebase';
import { BlogList } from '../features/blog/components';
import {
  NewspaperIcon,
  BookOpenIcon,
} from '@heroicons/react/24/outline';
import { ClubCrestIcon } from '@/app/components/ui/CyclingIcons';

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
    <main className="min-h-screen bg-[#faf8f5] dark:bg-[#0a0c10]">
      {/* ──── Editorial Cover Hero ──── */}
      <section className="relative overflow-hidden editorial-hero-surface border-b border-[#e4e0d8] dark:border-[#262b38]">
        {/* Atmospheric Background Watermark */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none select-none opacity-[0.03] dark:opacity-[0.025] leading-none text-center">
          <span className="text-[clamp(6rem,22vw,28rem)] font-extrabold uppercase tracking-tighter text-[#101216] dark:text-white whitespace-nowrap">
            BLANMONT
          </span>
        </div>

        <div className="relative mx-auto max-w-7xl px-4 pt-14 pb-10 sm:px-6 sm:pt-20 sm:pb-12 lg:px-8 z-10">
          {/* Title row */}
          <div className="space-y-3 max-w-3xl pb-8 border-b border-[#e4e0d8] dark:border-white/10">
            <h1 className="text-[clamp(2.25rem,6vw,4.25rem)] font-extrabold uppercase tracking-[-0.03em] leading-[0.98] text-balance text-[#101216] dark:text-white">
              Les News du <span className="text-[#e03e3e] italic">Peloton</span>
            </h1>

            <p className="max-w-2xl text-base text-[#5c6370] dark:text-[#a7adbb] leading-relaxed">
              Récits des sorties du weekend, conseils techniques, annonces officielles et coulisses du Club Cyclo Saint-Martin de Blanmont.
            </p>
          </div>

          {/* Stat Strip (Horizontal Hairline Structure) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-[#e4e0d8] dark:divide-white/10 pt-6">
            {/* Total Articles */}
            <div className="py-3 sm:py-0 sm:px-6 first:sm:pl-0 flex items-center gap-4 group">
              <div className="flex h-11 w-11 items-center justify-center rounded-sm bg-[#faf8f5] dark:bg-[#101216] border border-[#e4e0d8] dark:border-[#262b38] text-[#101216] dark:text-[#f5f6f8] shrink-0 transition-colors group-hover:border-[#e03e3e] group-hover:bg-[#e03e3e] group-hover:text-white">
                <NewspaperIcon className="h-5 w-5 transition-transform duration-200 group-hover:scale-105" aria-hidden="true" />
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-extrabold text-[#101216] dark:text-white tabular-nums tracking-tight">
                  {posts.length}
                </div>
                <div className="text-xs uppercase tracking-[0.08em] text-[#5c6370] dark:text-[#a7adbb] font-semibold">
                  Articles publiés
                </div>
              </div>
            </div>

            {/* Rubriques */}
            <div className="py-3 sm:py-0 sm:px-6 flex items-center gap-4 group">
              <div className="flex h-11 w-11 items-center justify-center rounded-sm bg-[#faf8f5] dark:bg-[#101216] border border-[#e4e0d8] dark:border-[#262b38] text-[#101216] dark:text-[#f5f6f8] shrink-0 transition-colors group-hover:border-[#e03e3e] group-hover:bg-[#e03e3e] group-hover:text-white">
                <BookOpenIcon className="h-5 w-5 transition-transform duration-200 group-hover:scale-105" aria-hidden="true" />
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-extrabold text-[#101216] dark:text-white tabular-nums tracking-tight">
                  {categoriesCount}
                </div>
                <div className="text-xs uppercase tracking-[0.08em] text-[#5c6370] dark:text-[#a7adbb] font-semibold">
                  Thématiques &amp; rubriques
                </div>
              </div>
            </div>

            {/* Club spirit */}
            <div className="py-3 sm:py-0 sm:px-6 last:sm:pr-0 flex items-center gap-4 group">
              <div className="flex h-11 w-11 items-center justify-center rounded-sm bg-[#faf8f5] dark:bg-[#101216] border border-[#e4e0d8] dark:border-[#262b38] text-[#101216] dark:text-[#f5f6f8] shrink-0 transition-colors group-hover:border-[#e03e3e] group-hover:bg-[#e03e3e] group-hover:text-white">
                <ClubCrestIcon className="h-5 w-5 transition-transform duration-200 group-hover:scale-105" aria-hidden="true" />
              </div>
              <div>
                <div className="text-base sm:text-lg font-bold text-[#101216] dark:text-white tracking-tight">
                  Le Peloton de Blanmont
                </div>
                <div className="text-xs uppercase tracking-[0.08em] text-[#5c6370] dark:text-[#a7adbb] font-semibold">
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
