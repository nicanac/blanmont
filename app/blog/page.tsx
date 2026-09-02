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

  return (
    <main className="min-h-screen bg-[#faf8f5]">
      {/* ──── Editorial Cover Hero (Ink) ──── */}
      <section className="relative overflow-hidden bg-[#0a0c10] text-white border-b border-[#262b38]">
        {/* Ambient red glow */}
        <div className="pointer-events-none absolute -top-40 -right-24 h-[500px] w-[500px] rounded-full bg-[#e03e3e]/15 blur-[140px]" />

        <div className="relative mx-auto max-w-7xl px-4 pt-14 pb-10 sm:px-6 sm:pt-20 sm:pb-12 lg:px-8">
          {/* Title row */}
          <div className="space-y-4 max-w-3xl pb-10 border-b border-white/10">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/5 border border-white/10 px-3.5 py-1.5 text-xs font-bold uppercase tracking-[0.08em] text-[#f5f6f8]">
              <span className="h-2 w-2 rounded-full bg-[#e03e3e] animate-pulse" />
              Saison 2026 · Chroniques &amp; Actualités
            </div>

            <h1 className="text-[clamp(2.25rem,6vw,4.25rem)] font-extrabold uppercase tracking-[-0.03em] leading-[0.98] text-balance">
              Les News du <span className="text-[#e03e3e] italic">Peloton</span>
            </h1>

            <p className="max-w-2xl text-base text-[#a7adbb] leading-relaxed">
              Récits des sorties du weekend, conseils techniques, annonces officielles et coulisses du Club Cyclo Saint-Martin de Blanmont.
            </p>
          </div>

          {/* Telemetry ribbon on Ink */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-8">
            {/* Total Articles */}
            <div className="rounded-lg border border-white/15 bg-[#161922]/90 backdrop-blur-md p-5 flex items-start gap-4 shadow-xl">
              <div className="rounded-md bg-[#e03e3e]/15 border border-[#e03e3e]/30 p-2.5 text-[#e03e3e] shrink-0 mt-0.5">
                <NewspaperIcon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <span className="text-xs font-semibold uppercase tracking-[0.08em] text-[#e03e3e]">
                  Publications
                </span>
                <div className="mt-1 text-sm font-bold text-white tabular-nums">
                  {posts.length} articles en ligne
                </div>
                <p className="mt-1 text-xs text-[#a7adbb]">
                  Chroniques, bilans &amp; vie du club
                </p>
              </div>
            </div>

            {/* Rubriques */}
            <div className="rounded-lg border border-white/15 bg-[#161922]/90 backdrop-blur-md p-5 flex items-start gap-4 shadow-xl">
              <div className="rounded-md bg-white/5 border border-white/10 p-2.5 text-[#f5f6f8] shrink-0 mt-0.5">
                <BookOpenIcon className="h-5 w-5 text-white" />
              </div>
              <div>
                <span className="text-xs font-semibold uppercase tracking-[0.08em] text-[#7d8493]">
                  Thématiques
                </span>
                <div className="mt-1 text-sm font-bold text-white">
                  Sorties, Matériel &amp; Conseils
                </div>
                <p className="mt-1 text-xs text-[#a7adbb]">
                  Écrits par les membres et capitaines
                </p>
              </div>
            </div>

            {/* Club spirit */}
            <div className="rounded-lg border border-white/15 bg-[#161922]/90 backdrop-blur-md p-5 flex items-start gap-4 shadow-xl">
              <div className="rounded-md bg-white/5 border border-white/10 p-2.5 text-[#f5f6f8] shrink-0 mt-0.5">
                <SparklesIcon className="h-5 w-5 text-sky-400" />
              </div>
              <div>
                <span className="text-xs font-semibold uppercase tracking-[0.08em] text-[#7d8493]">
                  Rédacteurs
                </span>
                <div className="mt-1 text-sm font-bold text-white">
                  Le Peloton de Blanmont
                </div>
                <p className="mt-1 text-xs text-[#a7adbb]">
                  Partage d&apos;expériences &amp; récits de route
                </p>
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
