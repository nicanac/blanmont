import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { BlogPost } from '../../types';
import {
  ArrowRightIcon,
  CalendarDaysIcon,
  UserPlusIcon,
  ShoppingBagIcon,
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
 * HomeBlogSection – Featured article with responsive info blocks.
 */
export default function HomeBlogSection({ posts }: HomeBlogSectionProps): React.ReactElement | null {
  if (!posts || posts.length === 0) return null;

  const featuredPost = posts[0];
  const secondaryPosts = posts.slice(1, 3);

  return (
    <section className="bg-white py-20 border-t border-slate-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="flex flex-wrap items-end justify-between gap-4 mb-12">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-widest text-[#e03e3e]">
              Actualités &amp; Vie du Club
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
              Les dernières nouvelles du peloton
            </h2>
          </div>
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-6 py-2.5 text-xs font-bold text-slate-700 transition-all hover:bg-slate-50 hover:border-slate-400"
          >
            <span>Toutes les actualités</span>
            <ArrowRightIcon className="h-3.5 w-3.5 text-[#e03e3e]" />
          </Link>
        </div>

        {/* Content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Featured post (8 cols) */}
          <Link
            href={`/blog/${featuredPost.slug}`}
            className="group relative lg:col-span-8 overflow-hidden rounded-3xl bg-slate-950 min-h-[440px] shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col justify-end"
          >
            <Image
              src={featuredPost.coverImage}
              alt={featuredPost.title}
              fill
              sizes="(max-width: 1024px) 100vw, 66vw"
              className="object-cover opacity-85 transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
            
            <div className="relative z-10 p-6 sm:p-10 space-y-3">
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-[#e03e3e] px-3 py-1 text-xs font-bold uppercase tracking-wider text-white shadow-xs">
                  À la une
                </span>
                <span className="rounded-full bg-white/20 backdrop-blur-xs px-3 py-1 text-xs font-medium text-white">
                  {featuredPost.category}
                </span>
                <span className="text-xs text-white/70">
                  {formatDate(featuredPost.publishedAt)}
                </span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-extrabold text-white group-hover:text-red-200 transition-colors line-clamp-2">
                {featuredPost.title}
              </h3>
              <p className="text-sm leading-relaxed text-slate-300 line-clamp-2 max-w-2xl">
                {featuredPost.excerpt}
              </p>
            </div>
          </Link>

          {/* Sidebar info cards (4 cols) */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            {/* Événements & Agenda */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50/60 p-6 shadow-xs flex-1 flex flex-col justify-between hover:border-slate-300 transition-all">
              <div className="space-y-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                  <CalendarDaysIcon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">
                  Agenda des sorties
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Consultez les prochaines sorties du club, les horaires de départ et les randos extérieures prévues.
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-slate-200/80">
                <Link
                  href="/calendrier"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#e03e3e] hover:underline"
                >
                  <span>Voir le calendrier complet</span>
                  <ArrowRightIcon className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>

            {/* Rejoindre le club */}
            <div className="rounded-3xl border border-slate-200 bg-slate-50/60 p-6 shadow-xs flex-1 flex flex-col justify-between hover:border-slate-300 transition-all">
              <div className="space-y-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-50 text-[#e03e3e]">
                  <UserPlusIcon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">
                  Envie de nous rejoindre ?
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Venez tester une sortie sans engagement. Découvrez notre esprit club et trouvez le groupe qui vous correspond.
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-slate-200/80">
                <Link
                  href="/le-club"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#e03e3e] hover:underline"
                >
                  <span>Présentation &amp; Groupes</span>
                  <ArrowRightIcon className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
