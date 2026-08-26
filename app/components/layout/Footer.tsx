import Link from 'next/link';

const navigation = {
    club: [
        { name: 'Présentation & Groupes', href: '/le-club' },
        { name: 'Les Membres', href: '/members' },
        { name: 'Équipements & Tenues', href: '/le-club/equipement' },
        { name: 'Classement Carré Vert', href: '/leaderboard' },
    ],
    routes: [
        { name: 'Sortie du Samedi (Vote)', href: '/saturday-ride' },
        { name: 'Tous les Parcours GPS', href: '/traces' },
        { name: 'Calendrier des Sorties', href: '/calendrier' },
        { name: 'Importer un parcours', href: '/import/strava' },
    ],
    newsAndAccount: [
        { name: 'Les News du Club', href: '/blog' },
        { name: 'Mon Espace Membre', href: '/profile' },
        { name: 'Connexion Membre', href: '/login' },
        { name: 'Administration', href: '/admin' },
    ],
};

export default function Footer() {
    return (
        <footer className="bg-slate-50 border-t border-slate-200" aria-labelledby="footer-heading">
            <h2 id="footer-heading" className="sr-only">
                Pied de page
            </h2>
            <div className="mx-auto max-w-7xl px-6 pb-12 pt-16 sm:pt-20 lg:px-8">
                <div className="xl:grid xl:grid-cols-3 xl:gap-12">
                    {/* Brand & Club identity */}
                    <div className="space-y-6">
                        <Link href="/" className="inline-flex items-center gap-2">
                            <span className="text-2xl font-extrabold text-slate-900 tracking-tight font-sans">
                                BLAN<span className="text-[#e03e3e]">MONT</span>
                            </span>
                            <span className="text-xs font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-red-100 text-[#e03e3e]">
                                CC St-Martin
                            </span>
                        </Link>
                        <p className="text-sm leading-relaxed text-slate-600 max-w-sm">
                            Cyclo Club Saint-Martin Blanmont. Convivialité, passion du cyclisme sur route et esprit d&apos;équipe au cœur du Brabant wallon.
                        </p>

                        {/* Practical club info */}
                        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-2 text-xs text-slate-600 max-w-sm">
                            <div className="flex items-center gap-2 font-medium text-slate-800">
                                <span className="h-2 w-2 rounded-full bg-[#e03e3e]" />
                                Rendez-vous hebdomadaire
                            </div>
                            <p>Départ le samedi matin — Place de Blanmont (Chastre)</p>
                            <p className="text-slate-500">Groupes A (30+ km/h), B (25-28 km/h), C (&lt;25 km/h) &amp; VTT.</p>
                        </div>

                        {/* Social icons */}
                        <div className="flex space-x-5 pt-2">
                            <a
                                href="https://www.facebook.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-slate-400 hover:text-[#e03e3e] transition-colors"
                                aria-label="Page Facebook du club"
                            >
                                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                                </svg>
                            </a>
                            <a
                                href="https://www.instagram.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-slate-400 hover:text-[#e03e3e] transition-colors"
                                aria-label="Compte Instagram du club"
                            >
                                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                    <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.468 2.53c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                                </svg>
                            </a>
                            <a
                                href="https://www.strava.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-slate-400 hover:text-[#fc4c02] transition-colors"
                                aria-label="Club Strava"
                            >
                                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                    <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7.925 15.772h4.172" />
                                </svg>
                            </a>
                        </div>
                    </div>

                    {/* Navigation Columns */}
                    <div className="mt-12 grid grid-cols-2 gap-8 sm:grid-cols-3 xl:col-span-2 xl:mt-0">
                        <div>
                            <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">
                                Le Club
                            </h3>
                            <ul role="list" className="mt-4 space-y-3">
                                {navigation.club.map((item) => (
                                    <li key={item.name}>
                                        <Link
                                            href={item.href}
                                            className="text-sm leading-6 text-slate-600 hover:text-[#e03e3e] transition-colors"
                                        >
                                            {item.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">
                                Parcours &amp; Sorties
                            </h3>
                            <ul role="list" className="mt-4 space-y-3">
                                {navigation.routes.map((item) => (
                                    <li key={item.name}>
                                        <Link
                                            href={item.href}
                                            className="text-sm leading-6 text-slate-600 hover:text-[#e03e3e] transition-colors"
                                        >
                                            {item.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="col-span-2 sm:col-span-1">
                            <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">
                                Vie du Club
                            </h3>
                            <ul role="list" className="mt-4 space-y-3">
                                {navigation.newsAndAccount.map((item) => (
                                    <li key={item.name}>
                                        <Link
                                            href={item.href}
                                            className="text-sm leading-6 text-slate-600 hover:text-[#e03e3e] transition-colors"
                                        >
                                            {item.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="mt-12 border-t border-slate-200 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-xs leading-5 text-slate-500 text-center sm:text-left">
                        &copy; {new Date().getFullYear()} Cyclo Club Saint-Martin Blanmont. Tous droits réservés.
                    </p>
                    <p className="text-xs text-slate-400 text-center sm:text-right">
                        Fait avec passion pour le cyclisme à Blanmont &bull; Brabant wallon
                    </p>
                </div>
            </div>
        </footer>
    );
}
