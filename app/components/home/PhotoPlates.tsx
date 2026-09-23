import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import type { HeroSlide, PhotoAlbum } from '@/app/types';

interface PhotoPlatesProps {
  albums: PhotoAlbum[];
  slides: HeroSlide[];
  albumCount: number;
  photoCount: number;
}

interface Plate {
  key: string;
  src: string;
  alt: string;
  title: string;
  meta?: string;
  href: string;
  external?: boolean;
  position?: string;
}

type CSSVars = React.CSSProperties & Record<`--${string}`, string>;

/**
 * Photographic plates of the club's own rides: the latest albums of the archive,
 * framed like plates bound into the back of a map guide.
 */
export default function PhotoPlates({
  albums,
  slides,
  albumCount,
  photoCount,
}: PhotoPlatesProps): React.ReactElement | null {
  const plates: Plate[] = albums.slice(0, 4).map((album) => ({
    key: album.id,
    src: album.coverUrl,
    alt: album.title,
    title: album.title,
    meta: `${album.year} · ${album.photoCount} photo${album.photoCount > 1 ? 's' : ''}`,
    href: album.externalAlbumUrl || '/galerie',
    external: Boolean(album.externalAlbumUrl),
  }));

  if (plates.length === 0) {
    slides.slice(0, 4).forEach((slide) =>
      plates.push({
        key: slide.id,
        src: slide.url,
        alt: slide.alt || 'Le peloton du CC Saint-Martin Blanmont',
        title: slide.alt || 'Le peloton du CC Saint-Martin Blanmont',
        href: '/galerie',
        position: slide.position,
      })
    );
  }

  if (plates.length === 0) return null;
  const [lead, ...rest] = plates;

  const linkProps = (plate: Plate) =>
    plate.external
      ? { href: plate.href, target: '_blank', rel: 'noopener noreferrer' }
      : { href: plate.href };

  return (
    <section
      aria-labelledby="planches-title"
      className="border-b border-line bg-white py-20 sm:py-24 dark:border-night-line dark:bg-night-2"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <h2
            id="planches-title"
            className="max-w-[14ch] text-balance font-wide text-[clamp(2rem,4.2vw,3.5rem)] font-extrabold uppercase leading-[0.94] text-ink dark:text-snow"
          >
            Au fil des sorties
          </h2>
          <p className="max-w-[40ch] text-sm text-ink-2 sm:text-right dark:text-snow-2">
            <span className="tabular-nums">{albumCount}</span> albums et{' '}
            <span className="tabular-nums">{photoCount.toLocaleString('fr-BE')}</span> photos
            racontent les saisons du peloton, de Blanmont aux Ardennes.
          </p>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-12">
          <a {...linkProps(lead)} className="group lg:col-span-7">
            <figure>
              <div className="relative aspect-[4/3] overflow-hidden border border-ink bg-paper-2 dark:border-night-line-strong dark:bg-night-3">
                <Image
                  src={lead.src}
                  alt={lead.alt}
                  fill
                  unoptimized
                  referrerPolicy="no-referrer"
                  sizes="(max-width: 1024px) 100vw, 58vw"
                  className="object-cover object-(--pos) transition-transform duration-700 ease-(--ease-plot) group-hover:scale-[1.03]"
                  style={{ '--pos': lead.position || 'center' } as CSSVars}
                />
              </div>
              <figcaption className="mt-3 flex items-baseline justify-between gap-4 border-b border-line pb-3 dark:border-night-line">
                <span className="text-base font-bold text-ink group-hover:text-brand dark:text-snow dark:group-hover:text-brand-soft">
                  <span className="mr-2 font-narrow text-xs font-bold uppercase tracking-[0.12em] text-ink-3 dark:text-snow-3">
                    Planche 1
                  </span>
                  {lead.title}
                </span>
                {lead.meta && (
                  <span className="shrink-0 font-narrow text-xs tabular-nums text-ink-3 dark:text-snow-3">
                    {lead.meta}
                  </span>
                )}
              </figcaption>
            </figure>
          </a>

          {rest.length > 0 && (
            <ol className="flex flex-col divide-y divide-line border-y border-line lg:col-span-5 dark:divide-night-line dark:border-night-line">
              {rest.map((plate, i) => (
                <li key={plate.key}>
                  <a {...linkProps(plate)} className="group flex items-center gap-4 py-4">
                    <span className="relative aspect-[4/3] w-32 shrink-0 overflow-hidden border border-ink bg-paper-2 sm:w-40 dark:border-night-line-strong dark:bg-night-3">
                      <Image
                        src={plate.src}
                        alt={plate.alt}
                        fill
                        unoptimized
                        referrerPolicy="no-referrer"
                        sizes="160px"
                        className="object-cover transition-transform duration-700 ease-(--ease-plot) group-hover:scale-[1.05]"
                      />
                    </span>
                    <span className="min-w-0">
                      <span className="block font-narrow text-xs font-bold uppercase tracking-[0.12em] text-ink-3 dark:text-snow-3">
                        Planche {i + 2}
                      </span>
                      <span className="mt-1 line-clamp-2 block text-sm font-bold leading-snug text-ink group-hover:text-brand dark:text-snow dark:group-hover:text-brand-soft">
                        {plate.title}
                      </span>
                      {plate.meta && (
                        <span className="mt-1 block font-narrow text-xs tabular-nums text-ink-3 dark:text-snow-3">
                          {plate.meta}
                        </span>
                      )}
                    </span>
                  </a>
                </li>
              ))}
            </ol>
          )}
        </div>

        <div className="mt-8">
          <Link
            href="/galerie"
            className="group inline-flex min-h-[48px] items-center gap-2.5 rounded-md border border-ink px-6 font-narrow text-sm font-bold uppercase tracking-[0.08em] text-ink transition-colors hover:bg-ink hover:text-white dark:border-snow-2 dark:text-snow dark:hover:bg-snow dark:hover:text-night"
          >
            Toute la galerie
            <ArrowRightIcon
              className="size-4 transition-transform duration-300 group-hover:translate-x-1"
              aria-hidden="true"
            />
          </Link>
        </div>
      </div>
    </section>
  );
}
