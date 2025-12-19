import HeroActions from './components/HeroActions';

/**
 * The Landing Page (Home).
 * Refactored to "Split with angled image on right" layout.
 */
export default function Home() {
  return (
    <div className="relative bg-white">
      <div className="mx-auto max-w-7xl">
        <div className="relative z-10 lg:w-full lg:max-w-2xl">
          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-hidden="true"
            className="absolute inset-y-0 right-8 hidden h-full w-80 translate-x-1/2 transform fill-white lg:block"
          >
            <polygon points="0,0 90,0 50,100 0,100" />
          </svg>

          <div className="relative px-6 py-32 sm:py-40 lg:px-8 lg:py-56 lg:pr-0">
            <div className="mx-auto max-w-2xl lg:mx-0 lg:max-w-xl">
              <div className="hidden sm:mb-10 sm:flex">
                <div className="relative rounded-full px-3 py-1 text-sm leading-6 text-gray-500 ring-1 ring-gray-900/10 hover:ring-gray-900/20">
                  De nouveaux parcours chaque semaine.{' '}
                  <a href="/traces" className="whitespace-nowrap font-semibold text-red-600">
                    <span className="absolute inset-0" aria-hidden="true" />
                    Voir les parcours <span aria-hidden="true">&rarr;</span>
                  </a>
                </div>
              </div>
              <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
                Club ouvert à tous <br />
                <span className="text-red-600 text-2xl sm:text-4xl block mt-4">Dames, Hommes, Jeunes et moins jeunes, Vététistes et quelques électriques.</span>
              </h1>
              <p className="mt-6 text-lg leading-8 text-gray-600">
                Tous les niveaux sont représentés... 3 groupes possibles
              </p>

              {/* Preserved HeroActions */}
              <div className="mt-10 flex items-center justify-start">
                <HeroActions />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-gray-50 lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
        <img
          className="aspect-[3/2] object-cover lg:aspect-auto lg:h-full lg:w-full"
          src="/images/home-hero.jpg"
          alt="Blanmont Cycling Club members"
        />
      </div>
    </div>
  );
}
