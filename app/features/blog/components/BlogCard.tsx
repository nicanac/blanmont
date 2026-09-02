'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { BlogPost } from '../../../types';
import { NewspaperIcon, CalendarDaysIcon, ArrowRightIcon } from '@heroicons/react/24/outline';

interface BlogCardProps {
  post: BlogPost;
  featured?: boolean;
}

function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateString;
  }
}

function isValidImageUrl(url?: string): boolean {
  if (!url) return false;
  const trimmed = url.trim().toLowerCase();
  if (
    !trimmed ||
    trimmed.includes('placehold.co') ||
    trimmed.includes('via.placeholder') ||
    trimmed.includes('placeholder') ||
    trimmed === 'null' ||
    trimmed === 'undefined'
  ) {
    return false;
  }
  return true;
}

function getInitials(name: string): string {
  if (!name) return 'CC';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function BlogCard({ post, featured = false }: BlogCardProps): React.ReactElement {
  const [imgError, setImgError] = useState(false);
  const [avatarError, setAvatarError] = useState(false);

  const hasCoverImage = isValidImageUrl(post.coverImage) && !imgError;
  const hasAvatar = isValidImageUrl(post.authorAvatar) && !avatarError;

  return (
    <Link
      href={`/blog/${post.slug}`}
      className={`group flex flex-col rounded-lg border border-[#e4e0d8] bg-white overflow-hidden transition-all duration-300 hover:border-[#e03e3e]/40 hover:shadow-lg hover:-translate-y-1 ${
        featured ? 'lg:col-span-2' : ''
      }`}
    >
      {/* ──── Cover Image / Graphic Fallback ──── */}
      <div
        className={`relative w-full overflow-hidden bg-[#161922] ${
          featured ? 'aspect-[16/9] sm:aspect-[2/1]' : 'aspect-[16/10]'
        }`}
      >
        {hasCoverImage ? (
          <img
            src={post.coverImage}
            alt={post.title}
            onError={() => setImgError(true)}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          /* High-craft editorial article fallback */
          <div className="relative h-full w-full bg-gradient-to-br from-[#161922] via-[#242938] to-[#0a0c10] flex flex-col justify-between p-6 select-none overflow-hidden">
            {/* Background watermark */}
            <svg
              className="pointer-events-none absolute -right-8 -bottom-8 h-48 w-48 text-white/5 transform rotate-12"
              viewBox="0 0 100 100"
              fill="currentColor"
              aria-hidden="true"
            >
              <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="3" fill="none" />
              <path d="M50 10 L50 90 M10 50 L90 50" stroke="currentColor" strokeWidth="2" />
            </svg>

            <div className="relative z-10 flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-widest text-[#7d8493]">
                CC SAINT-MARTIN
              </span>
              <NewspaperIcon className="h-6 w-6 text-[#e03e3e]/40" />
            </div>

            <div className="relative z-10 space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#a7adbb]">
                Chronique du club
              </span>
              <h4 className="text-base sm:text-lg font-bold text-white line-clamp-2 leading-snug">
                {post.title}
              </h4>
            </div>
          </div>
        )}

        {/* Category Badge */}
        <div className="absolute top-3 left-3 z-10">
          <span className="inline-flex items-center gap-1 rounded-full bg-[#101216]/85 backdrop-blur-md px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-white border border-white/20">
            {post.category || 'Actualité'}
          </span>
        </div>
      </div>

      {/* ──── Card Content ──── */}
      <div className="p-5 sm:p-6 flex flex-col flex-grow justify-between space-y-4 bg-white">
        <div className="space-y-2">
          <h3
            className={`font-bold text-[#101216] group-hover:text-[#e03e3e] transition-colors leading-snug line-clamp-2 ${
              featured ? 'text-xl sm:text-2xl' : 'text-base sm:text-lg'
            }`}
          >
            {post.title}
          </h3>

          <p className="text-xs sm:text-sm text-[#5c6370] line-clamp-2 leading-relaxed">
            {post.excerpt}
          </p>
        </div>

        {/* Author & Date Footer */}
        <div className="pt-3 border-t border-[#e4e0d8] flex items-center justify-between text-xs text-[#7d8493]">
          <div className="flex items-center gap-2.5 min-w-0">
            {/* Author Avatar with initials fallback */}
            <div className="relative h-7 w-7 shrink-0 overflow-hidden rounded-full bg-[#161922] border border-[#e4e0d8] flex items-center justify-center text-xs font-bold text-white">
              {hasAvatar ? (
                <img
                  src={post.authorAvatar}
                  alt={post.author}
                  onError={() => setAvatarError(true)}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span>{getInitials(post.author)}</span>
              )}
            </div>
            <span className="font-semibold text-[#101216] truncate max-w-[120px]">
              {post.author}
            </span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0 tabular-nums">
            <CalendarDaysIcon className="h-3.5 w-3.5 text-[#7d8493]" />
            <span>{formatDate(post.publishedAt)}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
