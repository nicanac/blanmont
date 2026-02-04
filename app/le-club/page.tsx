import Image from 'next/image';

/**
 * Le Club page describing cycling groups within the club.
 */
export default function LeClubPage() {
    return (
        <div className="bg-white py-24 sm:py-32">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="grid grid-cols-1 gap-x-8 gap-y-16 lg:grid-cols-2 lg:items-start">
                    {/* Left Column: Text Content */}
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                            Nos Groupes
                        </h2>
                        <p className="mt-4 text-lg leading-8 text-gray-500">
                            Notre club se compose de 3 groupes pour la route, et depuis quelques années d&apos;une section VTT.
                        </p>

                        <div className="mt-8 space-y-8">
                            <div>
                                <h3 className="text-xl font-semibold text-gray-900">Le groupe des A</h3>
                                <p className="mt-2 text-base leading-7 text-gray-600">
                                    Groupe assez sportif, allure rarement en dessous des 30 km/h de moyenne... Ils nous représentent lors des randos organisées par d&apos;autres clubs. Ils suivent généralement une trace GPS envoyée via whatsapp par les capitaines (Lucien et Laurent), mais un autre membre peut lui aussi en proposer une.
                                </p>
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold text-gray-900">Le groupe des B</h3>
                                <p className="mt-2 text-base leading-7 text-gray-600">
                                    Groupe roulant à une allure entre 25 et 28 km/h de moyenne... Ici, rarement de trace GPS, ils partent vent de face pour pour un retour plus facile. Les circuits évitent généralement les nationales, et sont assez variés. Nous essayons de rentrer groupé, les capitaines (Dany, Philippe et René) y veillent particulièrement...
                                </p>
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold text-gray-900">Le groupe des C</h3>
                                <p className="mt-2 text-base leading-7 text-gray-600">
                                    Groupe roulant à une allure inférieure à 25 km/h, en espérant toutefois y arriver avant la fin de saison, de même que de réaliser un éventuel 100 km... On y retrouve, des personnes de tout âge, jeunes débutants ou moins entraînés, où moins jeunes, encadré par les capitaines (Les 2 Joël et Notre Président Michel).
                                </p>
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold text-gray-900">Le groupe des VTT</h3>
                                <p className="mt-2 text-base leading-7 text-gray-600">
                                    Groupe où tout le monde sera attendu au sommet des bosses et passages délicats, le plus souvent l&apos;un où l&apos;autre envoi une trace GPX, ou propose un lieu de départ afin de diversifier les circuits. Ils participent aussi souvent à des randos organisées par d&apos;autres clubs, où chacun choisi sa distance en fonction de sa forme... Encadrement par Nicolas, Pascal et Jean.
                                </p>
                            </div>
                        </div>

                        <div className="mt-10">
                            <a href="/register" className="rounded-md bg-brand-primary px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-red-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary">
                                Rejoindre le club
                            </a>
                        </div>
                    </div>

                    {/* Right Column: Bento Grid Images */}
                    <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
                        {/* Top Right Large Image */}
                        <div className="col-span-2 relative h-64 sm:h-80 lg:h-96 rounded-2xl overflow-hidden">
                            <Image
                                src="/images/home-hero.jpg"
                                alt="Groupe Cycliste"
                                fill
                                className="object-cover"
                                sizes="(max-width: 1024px) 100vw, 50vw"
                                priority
                            />
                        </div>

                        {/* Bottom Row Images */}
                        <div className="relative h-48 sm:h-64 rounded-2xl overflow-hidden">
                            <Image
                                src="/images/IMG_8019.JPG"
                                alt="VTT"
                                fill
                                className="object-cover"
                                sizes="(max-width: 1024px) 50vw, 25vw"
                            />
                        </div>
                        <div className="relative h-48 sm:h-64 rounded-2xl overflow-hidden">
                            <Image
                                src="/images/IMG_5777.JPG"
                                alt="Groupe Route"
                                fill
                                className="object-cover"
                                sizes="(max-width: 1024px) 50vw, 25vw"
                            />
                        </div>
                        <div className="col-span-2 relative h-48 sm:h-64 rounded-2xl overflow-hidden">
                            <Image
                                src="/images/6efc2d5e-2326-446d-98d8-47889f881454.jpg"
                                alt="Ambiance Club"
                                fill
                                className="object-cover"
                                sizes="(max-width: 1024px) 100vw, 50vw"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
