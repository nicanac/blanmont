import React from 'react';
import type { Metadata } from 'next';
import { getBlogPosts } from '../lib/firebase';
import { BlogList } from '../features/blog/components';
import { PageHero } from '../components/ui/PageHero';
import { NewspaperIcon } from '@heroicons/react/24/outline';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Les News | Club de Blanmont',
  description: 'Articles, conseils et actualités du Club de Blanmont',
};

/**
 * Blog Listing Page.
 * Fetches and displays all published blog posts.
 * Revalidates every 60 seconds.
 */
export default async function BlogPage(): Promise<React.ReactElement> {
  const posts = await getBlogPosts();

  return (
    <main className="min-h-screen bg-[#faf8f5]">
      <PageHero
        title="Les News"
        description="Articles, conseils et actualités du Club de Blanmont"
        badge="Blog"
        badgeIcon={<NewspaperIcon className="h-4 w-4" />}
        variant="dark"
        size="md"
      />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <BlogList posts={posts} />
      </div>
    </main>
  );
}
