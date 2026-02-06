import React from 'react';
import type { Metadata } from 'next';
import { getBlogPosts } from '../lib/firebase';
import { BlogList } from '../features/blog/components';
import { PageHeader } from '../components/ui/PageHeader';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Les News | Blanmont Cycling Club',
  description: 'Articles, conseils et actualités du Blanmont Cycling Club',
};

/**
 * Blog Listing Page.
 * Fetches and displays all published blog posts.
 * Revalidates every 60 seconds.
 */
export default async function BlogPage(): Promise<React.ReactElement> {
  const posts = await getBlogPosts();

  return (
    <div className="bg-white">
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <PageHeader 
          title="Les News" 
          description="Conseils, récits de sorties et actualités du club" 
        />

        {/* Blog Grid */}
        <div className="py-10">
          <BlogList posts={posts} />
        </div>
      </main>
    </div>
  );
}
