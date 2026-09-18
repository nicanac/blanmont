import Link from 'next/link';
import {
  UsersIcon,
  HomeIcon,
  CalendarDaysIcon,
  ChatBubbleLeftRightIcon,
  QuestionMarkCircleIcon,
} from '@heroicons/react/24/outline';

/**
 * Global 404 Not Found page for CC Saint-Martin Blanmont.
 * Designed in the Editorial Peloton magazine aesthetic.
 */
export default function NotFound() {
  return (
    <main className="flex min-h-[80vh] flex-col items-center justify-center px-4 py-16 sm:px-6 lg:px-8 bg-[#faf8f5] dark:bg-[#0a0c10]">
      <div className="w-full max-w-xl text-center space-y-6">
        {/* Status Chip */}
        <div className="inline-flex items-center gap-2 rounded-full bg-[#101216] dark:bg-[#161922] border border-transparent dark:border-[#262b38] px-4 py-1.5 text-xs font-bold uppercase tracking-[0.08em] text-white shadow-xs">
          <QuestionMarkCircleIcon className="h-4 w-4 text-[#e03e3e]" />
          <span>Erreur 404 · Hors Parcours</span>
        </div>

        {/* Display Headline */}
        <div className="space-y-3">
          <h1 className="text-4xl sm:text-6xl font-extrabold uppercase tracking-tight text-[#101216] dark:text-[#f5f6f8] leading-none">
            Page <span className="text-[#e03e3e] italic">Introuvable</span>
          </h1>
          <p className="text-sm sm:text-base text-[#5c6370] dark:text-[#a7adbb] max-w-md mx-auto leading-relaxed">
            Vous avez quitté l&apos;itinéraire balisé. La page demandée n&apos;existe pas ou a été déplacée.
          </p>
        </div>

        {/* Navigation Quick Links Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 text-left max-w-md mx-auto">
          <Link
            href="/"
            className="group flex items-center gap-3 rounded-lg border border-[#e4e0d8] dark:border-[#262b38] bg-white dark:bg-[#161922] p-4 hover:border-[#e03e3e]/40 dark:hover:border-[#e03e3e]/60 hover:shadow-md transition-all"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-red-50 dark:bg-red-950/40 text-[#e03e3e] group-hover:bg-[#e03e3e] group-hover:text-white transition-colors">
              <HomeIcon className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-[#101216] dark:text-[#f5f6f8] uppercase tracking-wider">
                Accueil
              </div>
              <div className="text-xs text-[#5c6370] dark:text-[#a7adbb]">Retour au club</div>
            </div>
          </Link>

          <Link
            href="/members"
            className="group flex items-center gap-3 rounded-lg border border-[#e4e0d8] dark:border-[#262b38] bg-white dark:bg-[#161922] p-4 hover:border-[#e03e3e]/40 dark:hover:border-[#e03e3e]/60 hover:shadow-md transition-all"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-slate-100 dark:bg-[#1e222d] text-[#101216] dark:text-[#f5f6f8] group-hover:bg-[#101216] dark:group-hover:bg-[#262b38] group-hover:text-white transition-colors">
              <UsersIcon className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-[#101216] dark:text-[#f5f6f8] uppercase tracking-wider">
                Membres
              </div>
              <div className="text-xs text-[#5c6370] dark:text-[#a7adbb]">L’annuaire du club</div>
            </div>
          </Link>

          <Link
            href="/calendrier"
            className="group flex items-center gap-3 rounded-lg border border-[#e4e0d8] dark:border-[#262b38] bg-white dark:bg-[#161922] p-4 hover:border-[#e03e3e]/40 dark:hover:border-[#e03e3e]/60 hover:shadow-md transition-all"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-slate-100 dark:bg-[#1e222d] text-[#101216] dark:text-[#f5f6f8] group-hover:bg-[#101216] dark:group-hover:bg-[#262b38] group-hover:text-white transition-colors">
              <CalendarDaysIcon className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-[#101216] dark:text-[#f5f6f8] uppercase tracking-wider">
                Calendrier
              </div>
              <div className="text-xs text-[#5c6370] dark:text-[#a7adbb]">Sorties 2026</div>
            </div>
          </Link>

          <Link
            href="/sondage"
            className="group flex items-center gap-3 rounded-lg border border-[#e4e0d8] dark:border-[#262b38] bg-white dark:bg-[#161922] p-4 hover:border-[#e03e3e]/40 dark:hover:border-[#e03e3e]/60 hover:shadow-md transition-all"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-slate-100 dark:bg-[#1e222d] text-[#101216] dark:text-[#f5f6f8] group-hover:bg-[#101216] dark:group-hover:bg-[#262b38] group-hover:text-white transition-colors">
              <ChatBubbleLeftRightIcon className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-[#101216] dark:text-[#f5f6f8] uppercase tracking-wider">
                Sondage
              </div>
              <div className="text-xs text-[#5c6370] dark:text-[#a7adbb]">Sortie weekend</div>
            </div>
          </Link>
        </div>
      </div>
    </main>
  );
}
