'use client';

import React from 'react';
import { BlogPost } from '../../../types';
import BlogCard from './BlogCard';

interface BlogListProps {
  posts: BlogPost[];
}

/**
 * BlogList component displays a grid of blog post cards.
 * The first post is displayed as a featured (large) card on the left,
 * subsequent posts are displayed in a smaller grid on the right.
 */
export default function BlogList({ posts }: BlogListProps): React.ReactElement {
  if (posts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">Aucun article pour le moment.</p>
      </div>
    );
  }

  // Separate featured post and remaining posts
  const [featuredPost, ...remainingPosts] = posts;

  // Split remaining posts into left column (after featured) and right column
  const leftColumnPosts = remainingPosts.filter((_, index) => index % 2 === 0);
  const rightColumnPosts = remainingPosts.filter((_, index) => index % 2 === 1);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Left Column - Featured + alternating posts */}
      <div className="lg:col-span-7 space-y-6">
        {/* Featured Post - Large */}
        <BlogCard post={featuredPost} featured />

        {/* Additional left column posts */}
        {leftColumnPosts.map((post) => (
          <BlogCard key={post.id} post={post} />
        ))}
      </div>

      {/* Right Column - Stacked smaller cards */}
      <div className="lg:col-span-5 space-y-6">
        {rightColumnPosts.map((post) => (
          <BlogCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
}
