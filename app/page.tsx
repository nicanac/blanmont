import Link from 'next/link';
import { GlobeAltIcon } from '@heroicons/react/24/outline'; // Using outline for consistency with PageHero icons if any, or solid 
import { PageHero } from './components/ui/PageHero';
import HomeBlogSection from './components/shared/HomeBlogSection';
import { getBlogPosts } from './lib/firebase';

/**
 * Landing page – centred hero with stat overlay and news grid.
 * Refactored to use PageHero for consistent branding.
 */
export default async function Home() {
  const posts = await getBlogPosts();

  return (
    <>
      <main className="bg-white">
        {/* ──── Hero ──── */}
        <div className="relative isolate">
          <PageHero
            title="Club ouvert à tous"
            description={
              <span>
                Dames, Hommes, Jeunes et moins jeunes, Vététistes et
                quelques électriques.{' '}
                <span className="font-medium text-white underline decoration-yellow-400 decoration-2 underline-offset-4">
                  Tous les niveaux sont représentés.
                </span>
              </span>
            }
            variant="red"
            size="lg" // Larger size for home page impact
          >
            <div className="flex items-center justify-center gap-x-6">
              <Link
                href="/traces"
                className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-red-600 shadow-sm hover:bg-red-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                <span className="flex items-center gap-2">
                  <GlobeAltIcon className="h-5 w-5" />
                  Explorer les Parcours
                </span>
              </Link>
              <Link
                href="/le-club"
                className="text-sm font-semibold leading-6 text-white hover:text-red-100"
              >
                Découvrir le Club <span aria-hidden="true">→</span>
              </Link>
            </div>
            {/* Add extra padding at the bottom to accommodate the overlap */}
            <div className="h-24 sm:h-32" aria-hidden="true" />
          </PageHero>

          {/* Hero image + floating stat bar (Overlapping) */}
          <div className="relative mx-auto -mt-40 max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="relative overflow-hidden rounded-2xl shadow-xl ring-1 ring-gray-900/10">
              <img
                className="aspect-[16/9] w-full object-cover sm:aspect-[2/1] lg:aspect-[16/7]"
                src="/images/home-hero.jpg"
                alt="Blanmont Cycling Club – peloton sur route"
              />
            </div>

            {/* Single stat bar – overlaps image bottom (hidden on mobile, shown inline below) */}
            <div className="absolute inset-x-0 -bottom-12 hidden justify-center sm:flex">
              <div className="inline-flex divide-x divide-gray-200 rounded-xl bg-white shadow-xl ring-1 ring-gray-900/5">
                {[
                  { value: '3', label: 'Groupes de niveau' },
                  { value: 'Hebdo', label: 'Au moins une sortie' },
                  { value: '100%', label: 'Ouvert à tous' },
                ].map((s) => (
                  <div
                    key={s.label}
                    className="px-10 py-6 text-center sm:px-14"
                  >
                    <p className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
                      {s.value}
                    </p>
                    <p className="mt-1 text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                      {s.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Mobile stat bar – stacked below the image */}
          <div className="mx-auto mt-8 grid max-w-lg grid-cols-1 gap-4 px-4 sm:hidden">
            {[
              { value: '3', label: 'Groupes de niveau' },
              { value: 'Hebdo', label: 'Au moins une sortie' },
              { value: '100%', label: 'Ouvert à tous' },
            ].map((s) => (
              <div
                key={s.label}
                className="rounded-xl bg-white px-6 py-5 text-center shadow-md ring-1 ring-gray-900/5"
              >
                <p className="text-xl font-bold text-gray-900">{s.value}</p>
                <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-gray-500">
                  {s.label}
                </p>
              </div>
            ))}
          </div>

          {/* Spacer for the overlapping stat bar (desktop only) */}
          <div className="h-16 hidden sm:block" aria-hidden="true" />
        </div>

        {/* ──── News ──── */}
        <HomeBlogSection posts={posts} />
      </main>
    </>
  );
}
