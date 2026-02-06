import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { BlogPost } from '../../../types';
import { cn } from '../../../utils/cn';

interface BlogCardProps {
  post: BlogPost;
  /** Display as a featured (large) card */
  featured?: boolean;
}

/**
 * Formats a date string to a readable format
 */
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * BlogCard component displays a single blog post preview.
 * Can be rendered as a featured card (large) or a regular card.
 */
export default function BlogCard({ post, featured = false }: BlogCardProps): React.ReactElement {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className={cn(
        'group block overflow-hidden rounded-lg bg-white shadow-sm transition-shadow hover:shadow-lg',
        featured ? 'lg:col-span-2' : ''
      )}
    >
      {/* Image Container */}
      <div
        className={cn(
          'relative overflow-hidden',
          featured ? 'aspect-video' : 'aspect-4/3'
        )}
      >
        <Image
          src={post.coverImage}
          alt={post.title}
          fill
          sizes={featured ? '(max-width: 768px) 100vw, 66vw' : '(max-width: 768px) 100vw, 33vw'}
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {/* Category Badge */}
        <div className="absolute top-4 left-4">
          <span className="inline-block rounded bg-red-600 px-3 py-1 text-xs font-medium text-white">
            {post.category}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3
          className={cn(
            'font-semibold text-gray-900 group-hover:text-red-600 transition-colors line-clamp-2',
            featured ? 'text-2xl mb-3' : 'text-lg mb-2'
          )}
        >
          {post.title}
        </h3>

        <p className="text-gray-600 text-sm line-clamp-3 mb-4">{post.excerpt}</p>

        {/* Meta Info */}
        <div className="flex items-center gap-3">
          <div className="relative h-8 w-8 overflow-hidden rounded-full bg-gray-200">
            {post.authorAvatar && (
              <Image
                src={post.authorAvatar}
                alt={post.author}
                fill
                className="object-cover"
              />
            )}
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-900">{post.author}</span>
            <span className="text-xs text-gray-500">{formatDate(post.publishedAt)}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
