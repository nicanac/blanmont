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
        'group block overflow-hidden rounded-md border border-[#e4e0d8] bg-white shadow-2xs transition-all hover:shadow-lg hover:border-slate-300',
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
          className="object-cover transition-transform duration-500 group-hover:scale-103"
        />
        {/* Category Badge */}
        <div className="absolute top-4 left-4">
          <span className="inline-block rounded-full bg-[#e03e3e] px-3 py-0.5 text-xs font-semibold uppercase tracking-wider text-white shadow-2xs">
            {post.category}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-3">
        <h3
          className={cn(
            'font-bold text-[#101216] group-hover:text-[#e03e3e] transition-colors leading-snug line-clamp-2',
            featured ? 'text-2xl' : 'text-lg'
          )}
        >
          {post.title}
        </h3>

        <p className="text-[#3a3f4a] text-sm line-clamp-3 leading-relaxed">{post.excerpt}</p>

        {/* Meta Info */}
        <div className="flex items-center gap-3 pt-2 border-t border-[#efece5]">
          <div className="relative h-8 w-8 overflow-hidden rounded-full bg-[#f2efe9] ring-1 ring-slate-200">
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
            <span className="text-xs font-semibold text-[#101216]">{post.author}</span>
            <span className="text-xs text-[#5c6370]">{formatDate(post.publishedAt)}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
