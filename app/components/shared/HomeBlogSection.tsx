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
 * HomeBlogSection – Featured article with responsive news cards.
 */
export default function HomeBlogSection({ posts }: HomeBlogSectionProps): React.ReactElement | null {
  if (!posts || posts.length === 0) return null;

  const featuredPost = posts[0];
  const secondaryPosts = posts.slice(1, 3);

  return (
    <section className="bg-white py-16 sm:py-24 border-t border-slate-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="flex flex-wrap items-end justify-between gap-4 mb-10">
          <div className="space-y-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#e03e3e]">
              Actualités &amp; Vie du Club
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 text-balance">
              Les dernières nouvelles du peloton
            </h2>
          </div>
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-2 text-xs font-semibold text-slate-700 transition-all hover:bg-slate-50 hover:border-slate-300"
          >
            <span>Toutes les actualités</span>
            <ArrowRightIcon className="h-3 w-3 text-[#e03e3e]" />
          </Link>
        </div>

        {/* Content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Featured post (7 or 8 cols) */}
          <Link
            href={`/blog/${featuredPost.slug}`}
            className="group relative lg:col-span-7 xl:col-span-8 overflow-hidden rounded-3xl bg-slate-950 min-h-[380px] sm:min-h-[440px] shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-end"
          >
            <Image
              src={featuredPost.coverImage}
              alt={featuredPost.title}
              fill
              sizes="(max-width: 1024px) 100vw, 66vw"
              className="object-cover opacity-85 transition-transform duration-700 group-hover:scale-103"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
            
            <div className="relative z-10 p-6 sm:p-8 space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-[#e03e3e] px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider text-white shadow-2xs">
                  À la une
                </span>
                <span className="rounded-full bg-white/20 backdrop-blur-xs px-2.5 py-0.5 text-xs font-medium text-white">
                  {featuredPost.category}
                </span>
                <span className="text-xs text-white/80">
                  {formatDate(featuredPost.publishedAt)}
                </span>
              </div>

              <h3 className="text-xl sm:text-2xl font-bold text-white group-hover:text-red-200 transition-colors line-clamp-2">
                {featuredPost.title}
              </h3>
              <p className="text-xs sm:text-sm leading-relaxed text-slate-300 line-clamp-2 max-w-2xl">
                {featuredPost.excerpt}
              </p>
            </div>
          </Link>

          {/* Sidebar / secondary articles (5 or 4 cols) */}
          <div className="lg:col-span-5 xl:col-span-4 flex flex-col gap-5">
            {secondaryPosts.length > 0 ? (
              secondaryPosts.map((post) => (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className="group rounded-3xl border border-slate-200/80 bg-slate-50/60 hover:bg-white p-5 shadow-2xs hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between flex-1"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-2xs text-slate-500">
                      <span className="rounded-full bg-white border border-slate-200/80 px-2.5 py-0.5 font-semibold text-slate-700">
                        {post.category}
                      </span>
                      <span>{formatDate(post.publishedAt)}</span>
                    </div>

                    <h4 className="text-base font-bold text-slate-900 group-hover:text-[#e03e3e] transition-colors line-clamp-2">
                      {post.title}
                    </h4>
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {post.excerpt}
                    </p>
                  </div>

                  <div className="pt-3 mt-2 border-t border-slate-200/60 flex items-center gap-1 text-xs font-semibold text-[#e03e3e]">
                    <span>Lire l&apos;article</span>
                    <ArrowRightIcon className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              ))
            ) : (
              <>
                {/* Événements & Agenda */}
                <div className="rounded-3xl border border-slate-200/80 bg-slate-50/50 p-6 shadow-2xs flex-1 flex flex-col justify-between hover:border-slate-300 transition-all">
                  <div className="space-y-2.5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-50 text-amber-700">
                      <CalendarDaysIcon className="h-5 w-5" />
                    </div>
                    <h3 className="text-base font-bold text-slate-900">
                      Agenda des sorties
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Consultez les prochaines sorties du club, les horaires de départ et les randos extérieures prévues.
                    </p>
                  </div>
                  <div className="pt-4 mt-4 border-t border-slate-200/60">
                    <Link
                      href="/calendrier"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#e03e3e] hover:underline"
                    >
                      <span>Voir le calendrier complet</span>
                      <ArrowRightIcon className="h-3 w-3" />
                    </Link>
                  </div>
                </div>

                {/* Rejoindre le club */}
                <div className="rounded-3xl border border-slate-200/80 bg-slate-50/50 p-6 shadow-2xs flex-1 flex flex-col justify-between hover:border-slate-300 transition-all">
                  <div className="space-y-2.5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-red-50 text-[#e03e3e]">
                      <UserPlusIcon className="h-5 w-5" />
                    </div>
                    <h3 className="text-base font-bold text-slate-900">
                      Envie de nous rejoindre ?
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Venez tester une sortie sans engagement. Découvrez notre esprit club et trouvez le groupe qui vous correspond.
                    </p>
                  </div>
                  <div className="pt-4 mt-4 border-t border-slate-200/60">
                    <Link
                      href="/le-club"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#e03e3e] hover:underline"
                    >
                      <span>Présentation &amp; Groupes</span>
                      <ArrowRightIcon className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
