import Image from 'next/image';
import Link from 'next/link';
import { PageHero } from '../components/ui/PageHero';
import { UserGroupIcon } from '@heroicons/react/24/outline';

/**
 * Le Club page describing cycling groups within the club.
 */
export default function LeClubPage(): React.ReactElement {
    return (
        <main className="min-h-screen bg-gray-50">
            <PageHero
                title="Le Club"
                description="Découvrez nos groupes et trouvez celui qui correspond à votre niveau et vos envies."
                badge="Nos Groupes"
                badgeIcon={<UserGroupIcon className="h-4 w-4" />}
                variant="red"
                size="md"
            />
            <div className="mx-auto max-w-7xl px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 gap-x-8 gap-y-16 lg:grid-cols-2 lg:items-start">
                    {/* Left Column: Text Content */}
                    <div>
                        <div className="space-y-8">
                            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xs space-y-2">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-bold text-slate-900">Le groupe des A</h3>
                                    <span className="rounded-full bg-red-50 text-red-700 border border-red-200/70 px-2.5 py-0.5 text-xs font-semibold tabular-nums">
                                        &gt;&nbsp;30&nbsp;km/h
                                    </span>
                                </div>
                                <p className="text-sm leading-relaxed text-slate-600">
                                    Groupe assez sportif, allure rarement en dessous des 30&nbsp;km/h de moyenne... Ils nous représentent lors des randos organisées par d&apos;autres clubs. Ils suivent généralement une trace GPS envoyée via WhatsApp par les capitaines (Lucien et Laurent), mais un autre membre peut lui aussi en proposer une.
                                </p>
                            </div>

                            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xs space-y-2">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-bold text-slate-900">Le groupe des B</h3>
                                    <span className="rounded-full bg-blue-50 text-blue-700 border border-blue-200/70 px-2.5 py-0.5 text-xs font-semibold tabular-nums">
                                        25 - 28&nbsp;km/h
                                    </span>
                                </div>
                                <p className="text-sm leading-relaxed text-slate-600">
                                    Groupe roulant à une allure entre 25 et 28&nbsp;km/h de moyenne... Ici, rarement de trace GPS, ils partent vent de face pour un retour plus facile. Les circuits évitent généralement les nationales, et sont assez variés. Nous essayons de rentrer groupés, les capitaines (Dany, Philippe et René) y veillent particulièrement...
                                </p>
                            </div>

                            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xs space-y-2">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-bold text-slate-900">Le groupe des C</h3>
                                    <span className="rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/70 px-2.5 py-0.5 text-xs font-semibold tabular-nums">
                                        &lt;&nbsp;25&nbsp;km/h
                                    </span>
                                </div>
                                <p className="text-sm leading-relaxed text-slate-600">
                                    Groupe roulant à une allure inférieure à 25&nbsp;km/h, en espérant toutefois y arriver avant la fin de saison, de même que de réaliser un éventuel 100&nbsp;km... On y retrouve des personnes de tout âge, jeunes débutants ou moins entraînés, ou moins jeunes, encadrés par les capitaines (les 2 Joël et notre Président Michel).
                                </p>
                            </div>

                            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xs space-y-2">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-bold text-slate-900">Le groupe des VTT</h3>
                                    <span className="rounded-full bg-amber-50 text-amber-700 border border-amber-200/70 px-2.5 py-0.5 text-xs font-semibold">
                                        Sentiers &amp; Bois
                                    </span>
                                </div>
                                <p className="text-sm leading-relaxed text-slate-600">
                                    Groupe où tout le monde sera attendu au sommet des bosses et passages délicats. Le plus souvent l&apos;un ou l&apos;autre envoie une trace GPX ou propose un lieu de départ afin de diversifier les circuits. Ils participent aussi souvent à des randos organisées par d&apos;autres clubs, où chacun choisit sa distance en fonction de sa forme... Encadrement par Nicolas, Pascal et Jean.
                                </p>
                            </div>
                        </div>

                        <div className="mt-10 flex flex-wrap items-center gap-4">
                            <a
                                href="mailto:info@blanmont.be?subject=Demande%20d'adh%C3%A9sion%20au%20Club%20de%20Blanmont&body=Bonjour%20l'%C3%A9quipe%20du%20Club%20de%20Blanmont,%0A%0AJe%20souhaite%20rejoindre%20le%20club%20ou%20participer%20%C3%A0%20une%20premi%C3%A8re%20sortie%20d'essai.%0A%0AMes%20coordonn%C3%A9es%20:%0ANom%20:%20%0AT%C3%A9l%C3%A9phone%20:%20%0AGroupe%20souhait%C3%A9%20(A,%20B,%20C,%20VTT)%20:%20%0A%0AMerci%20!"
                                className="rounded-full bg-[#e03e3e] px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#c93434] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#e03e3e]"
                            >
                                Rejoindre le club (Contact)
                            </a>
                            <Link
                                href="/calendrier"
                                className="rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                            >
                                Voir les prochaines sorties
                            </Link>
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
        </main>
    );
}
