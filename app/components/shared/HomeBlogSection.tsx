import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { BlogPost } from '../../types';
import { ArrowRightIcon } from '@heroicons/react/24/outline';

import { parseDateInfo } from '@/app/lib/carreVert';

interface HomeBlogSectionProps {
  posts: BlogPost[];
}

function formatDate(dateString: string): string {
  const info = parseDateInfo(dateString);
  if (!info) return dateString;
  try {
    const utcDate = new Date(Date.UTC(info.year, info.month - 1, info.day));
    return utcDate.toLocaleDateString('fr-FR', {
      timeZone: 'UTC',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return info.displayDate;
  }
}

/**
 * The club's logbook: the latest story set large beside a ruled index of entries.
 */
export default function HomeBlogSection({
  posts,
}: HomeBlogSectionProps): React.ReactElement | null {
  if (!posts || posts.length === 0) return null;

  const featuredPost = posts[0];
  const secondaryPosts = posts.slice(1, 4);

  return (
    <section
      aria-labelledby="carnet-title"
      className="border-b border-line bg-paper py-20 transition-colors duration-200 sm:py-24 dark:border-night-line dark:bg-night"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2
              id="carnet-title"
              className="max-w-[14ch] text-balance font-wide text-[clamp(2rem,4.2vw,3.5rem)] font-extrabold uppercase leading-[0.94] text-ink dark:text-snow"
            >
              Carnet de route
            </h2>
            <p className="mt-4 max-w-[46ch] text-base leading-relaxed text-ink-2 dark:text-snow-2">
              Récits de sorties, nouvelles tenues et actualités du club de Blanmont.
            </p>
          </div>
          <Link
            href="/blog"
            className="group inline-flex min-h-[48px] shrink-0 items-center gap-2.5 rounded-md border border-ink px-6 font-narrow text-sm font-bold uppercase tracking-[0.08em] text-ink transition-colors hover:bg-ink hover:text-white dark:border-snow-2 dark:text-snow dark:hover:bg-snow dark:hover:text-night"
          >
            <span>Toutes les actualités</span>
            <ArrowRightIcon
              className="size-4 transition-transform duration-300 group-hover:translate-x-1"
              aria-hidden="true"
            />
          </Link>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-12">
          <Link href={`/blog/${featuredPost.slug}`} className="group lg:col-span-7">
            <article>
              <div className="relative aspect-[16/10] overflow-hidden border border-ink bg-paper-2 dark:border-night-line-strong dark:bg-night-3">
                <Image
                  src={featuredPost.coverImage}
                  alt={featuredPost.title}
                  fill
                  unoptimized
                  sizes="(max-width: 1024px) 100vw, 58vw"
                  className="object-cover transition-transform duration-700 ease-(--ease-plot) group-hover:scale-[1.03]"
                />
                <span className="absolute left-4 top-4 rounded-full bg-brand px-3 py-1 font-narrow text-xs font-bold uppercase tracking-[0.1em] text-white">
                  À la une
                </span>
              </div>
              <div className="mt-5 flex flex-wrap items-center gap-3 font-narrow text-xs font-bold uppercase tracking-[0.1em] text-ink-3 dark:text-snow-3">
                <span className="text-brand dark:text-brand-soft">{featuredPost.category}</span>
                <span
                  aria-hidden="true"
                  className="h-px w-5 bg-line-strong dark:bg-night-line-strong"
                />
                <time className="normal-case tracking-normal">
                  {formatDate(featuredPost.publishedAt)}
                </time>
              </div>
              <h3 className="mt-3 text-balance font-semiwide text-[clamp(1.5rem,2.6vw,2.25rem)] font-extrabold leading-[1.05] text-ink transition-colors group-hover:text-brand dark:text-snow dark:group-hover:text-brand-soft">
                {featuredPost.title}
              </h3>
              <p className="mt-3 line-clamp-3 max-w-[62ch] text-base leading-relaxed text-ink-2 dark:text-snow-2">
                {featuredPost.excerpt}
              </p>
            </article>
          </Link>

          {secondaryPosts.length > 0 && (
            <ol className="border-t-2 border-ink lg:col-span-5 dark:border-snow-2">
              {secondaryPosts.map((post) => (
                <li key={post.id} className="border-b border-line dark:border-night-line">
                  <Link href={`/blog/${post.slug}`} className="group block py-5">
                    <div className="flex items-center gap-3 font-narrow text-xs font-bold uppercase tracking-[0.1em] text-ink-3 dark:text-snow-3">
                      <span className="text-brand dark:text-brand-soft">{post.category}</span>
                      <span
                        aria-hidden="true"
                        className="h-px w-4 bg-line-strong dark:bg-night-line-strong"
                      />
                      <time className="normal-case tracking-normal">
                        {formatDate(post.publishedAt)}
                      </time>
                    </div>
                    <h4 className="mt-2 line-clamp-2 text-lg font-bold leading-snug text-ink transition-colors group-hover:text-brand dark:text-snow dark:group-hover:text-brand-soft">
                      {post.title}
                    </h4>
                    <p className="mt-1 line-clamp-2 max-w-[62ch] text-sm leading-relaxed text-ink-2 dark:text-snow-2">
                      {post.excerpt}
                    </p>
                    <span className="mt-2.5 inline-flex items-center gap-1 text-xs font-bold text-ink dark:text-snow">
                      Lire l&apos;article
                      <ArrowRightIcon
                        className="size-3 transition-transform duration-300 group-hover:translate-x-1"
                        aria-hidden="true"
                      />
                    </span>
                  </Link>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>
    </section>
  );
}
