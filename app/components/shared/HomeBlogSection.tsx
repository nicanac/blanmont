import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { BlogPost } from '../../types';
import {
  ArrowRightIcon,
  CalendarDaysIcon,
  UserPlusIcon,
} from '@heroicons/react/24/outline';

interface HomeBlogSectionProps {
  posts: BlogPost[];
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
 * HomeBlogSection – featured post with sidebar info cards.
 */
export default function HomeBlogSection({ posts }: HomeBlogSectionProps): React.ReactElement | null {
  if (!posts || posts.length === 0) return null;

  const featuredPost = posts[0];

  return (
    <section className="bg-gray-50 py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="flex flex-wrap items-end justify-between gap-4 mb-10">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-red-600 mb-2">
              Actualités &amp; vie du club
            </p>
            <h2 className="text-3xl font-bold tracking-tight text-gray-900">
              Les dernières nouvelles
            </h2>
          </div>
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 rounded-full border border-gray-300 bg-white px-5 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            Toutes les news
          </Link>
        </div>

        {/* Content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Featured post */}
          <Link
            href={`/blog/${featuredPost.slug}`}
            className="group relative lg:col-span-3 overflow-hidden rounded-2xl bg-gray-900 min-h-[420px]"
          >
            <Image
              src={featuredPost.coverImage}
              alt={featuredPost.title}
              fill
              sizes="(max-width: 1024px) 100vw, 60vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-linear-to-t from-gray-900/90 via-gray-900/30 to-transparent" />
            <div className="absolute bottom-0 p-8">
              <span className="mb-3 inline-block rounded bg-red-600 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
                À la une
              </span>
              <h3 className="text-2xl font-bold text-white group-hover:text-red-200 transition-colors line-clamp-2">
                {featuredPost.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-300 line-clamp-2 max-w-lg">
                {featuredPost.excerpt}
              </p>
            </div>
          </Link>

          {/* Sidebar info cards */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {/* Prochains événements */}
            <div className="flex-1 rounded-2xl bg-white p-6 shadow-sm">
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <CalendarDaysIcon className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Prochains Événements
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Ne manquez pas notre souper annuel le 15 mars.
              </p>
              <Link
                href="/calendrier"
                className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-gray-900 hover:text-red-600 transition-colors"
              >
                Voir l&apos;agenda
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
            </div>

            {/* Nouveau membre */}
            <div className="flex-1 rounded-2xl bg-white p-6 shadow-sm">
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-red-50 text-red-600">
                <UserPlusIcon className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Nouveau Membre ?
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Guide complet pour rejoindre le club et choisir votre groupe.
              </p>
              <Link
                href="/le-club"
                className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-gray-900 hover:text-red-600 transition-colors"
              >
                Lire le guide
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
