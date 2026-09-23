import React from 'react';
import type { Metadata } from 'next';
import { getBlogPosts } from '../lib/firebase';
import { BlogList } from '../features/blog/components';
import { SheetHeader } from '../components/carte/SheetHeader';

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
    <main className="min-h-screen bg-paper dark:bg-night">
      <SheetHeader
        sheet="Carnet de route"
        focus={{ x: 60, y: 58 }}
        title="Les news du peloton"
        description="Récits des sorties du weekend, conseils techniques, annonces officielles et coulisses du Club Cyclo Saint-Martin de Blanmont."
        legend={[
          { term: 'Articles publiés', value: `${posts.length}` },
          { term: 'Thématiques & rubriques', value: `${categoriesCount}` },
          { term: 'Le peloton de Blanmont', value: 'Récits & vie du club' },
        ]}
      />

      {/* ──── Main Content Spread (Paper) ──── */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <BlogList posts={posts} />
      </section>
    </main>
  );
}
