import React from 'react';
import type { Metadata } from 'next';
import { getBlogPosts } from '../lib/firebase';
import { BlogList } from '../features/blog/components';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Blog | Blanmont Cycling Club',
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
        <div className="border-b border-gray-200 pb-6 pt-24">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">
            Blanmont Cycling Club Blog
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            Conseils, récits de sorties et actualités du club
          </p>
        </div>

        {/* Blog Grid */}
        <div className="py-10">
          <BlogList posts={posts} />
        </div>
      </main>
    </div>
  );
}
