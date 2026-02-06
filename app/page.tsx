import HeroActions from './components/shared/HeroActions';
import HomeBlogSection from './components/shared/HomeBlogSection';
import { getBlogPosts } from './lib/firebase';

/**
 * Landing page – centred hero with stat overlay and news grid.
 */
export default async function Home() {
  const posts = await getBlogPosts();

  return (
    <>
      {/* ──── Hero ──── */}
      <section className="bg-white pt-16 sm:pt-24">
        {/* Centred copy */}
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h1 className="font-serif text-5xl font-bold tracking-tight text-gray-900 sm:text-7xl">
            Club ouvert à tous
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-gray-600">
            Dames, Hommes, Jeunes et moins jeunes, Vététistes et
            quelques électriques.{' '}
            <span className="font-medium text-red-600">
              Tous les niveaux sont représentés.
            </span>
          </p>

          <div className="mt-8 flex items-center justify-center">
            <HeroActions />
          </div>
        </div>

        {/* Hero image + floating stat bar */}
        <div className="relative mx-auto mt-16 max-w-6xl px-7">
          <div className="overflow-hidden rounded-2xl shadow-xl">
            <img
              className="aspect-16/7 w-full object-cover"
              src="/images/home-hero.jpg"
              alt="Blanmont Cycling Club – peloton sur route"
            />
          </div>

          {/* Single stat bar – overlaps image bottom */}
          <div className="absolute inset-x-6 -bottom-12 flex justify-center">
            <div className="inline-flex divide-x divide-gray-200 rounded-xl bg-white shadow-lg">
              {[
                { value: '3', label: 'Groupes de niveau' },
                { value: 'Hebdo', label: 'Au moins une sortie' },
                { value: '100%', label: 'Ouvert à tous' },
              ].map((s) => (
                <div
                  key={s.label}
                  className="px-10 py-6 text-center sm:px-14"
                >
                  <p className="text-2xl font-bold text-gray-900 sm:text-3xl">
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
              {/* Spacer for the overlapping stat bar */}
      <div className="h-20" aria-hidden="true" />
      </section>



      {/* ──── News ──── */}
      <HomeBlogSection posts={posts} />
    </>
  );
}
