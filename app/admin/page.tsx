import React from 'react';
import Link from 'next/link';
import {
  UsersIcon,
  DocumentTextIcon,
  CalendarDaysIcon,
  PlusIcon,
  ChatBubbleLeftRightIcon,
  ArrowRightIcon,
  PhotoIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline';
import { JerseyIcon } from '@/app/components/ui/CyclingIcons';
import { getBlogPosts } from '../lib/firebase/blog';
import { getMembers } from '../lib/firebase/members';
import { getCalendarEvents } from '../lib/firebase/calendar';
import { getActiveWeekendPoll, getPollResponses } from '../lib/firebase/polls';
import AdminOnboardingChecklist from './components/AdminOnboardingChecklist';

export const dynamic = 'force-dynamic';

function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-BE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateString;
  }
}

export default async function AdminDashboardPage(): Promise<React.ReactElement> {
  const [blogPosts, members, events, activePoll] = await Promise.all([
    getBlogPosts(),
    getMembers(),
    getCalendarEvents(),
    getActiveWeekendPoll(),
  ]);

  const pollResponses = activePoll ? await getPollResponses(activePoll.id) : [];
  const activeAttendees = pollResponses.filter((r) => r.dayChoice !== 'absent').length;

  const totalMembers = members.length;
  const totalBlogPosts = blogPosts.length;

  const now = new Date();
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const upcomingEvents = events.filter((event) => {
    const eventDate = new Date(event.isoDate);
    return eventDate >= now && eventDate <= nextWeek;
  }).length;

  const recentPosts = blogPosts.slice(0, 5);

  const stats = [
    {
      name: 'Sondage Weekend',
      value: activePoll ? `${activeAttendees} inscrits` : 'Inactif',
      icon: ChatBubbleLeftRightIcon,
      href: activePoll ? `/admin/sondages/${activePoll.id}` : '/admin/sondages',
      description: activePoll ? activePoll.title : 'Créer un sondage',
    },
    {
      name: 'Membres du Club',
      value: totalMembers,
      icon: UsersIcon,
      href: '/admin/members',
      description: 'Membres actifs enregistrés',
    },
    {
      name: 'Articles Blog & News',
      value: totalBlogPosts,
      icon: DocumentTextIcon,
      href: '/admin/blog',
      description: 'Publications en ligne',
    },
    {
      name: 'Sorties (7 jours)',
      value: upcomingEvents,
      icon: CalendarDaysIcon,
      href: '/admin/events',
      description: 'Sorties & rendez-vous',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-[#e4e0d8] dark:border-[#222730]">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#101216] dark:text-white">
              Tableau de bord
            </h1>
            <span className="inline-flex items-center gap-2 rounded-full bg-[#101216] dark:bg-[#1d2128] px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-white">
              <span className="h-1.5 w-1.5 rounded-full bg-[#e03e3e]" />
              <span>Espace Administration</span>
            </span>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-[#5c6370] dark:text-[#9ba3af]">
            Gestion du club, des membres, des sondages hebdomadaires et des sorties.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/admin/hero"
            className="inline-flex items-center gap-2 rounded-md bg-white dark:bg-[#16191f] border border-[#e4e0d8] dark:border-[#222730] px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#101216] dark:text-white hover:bg-[#f2efe9] dark:hover:bg-[#1d2128] transition-colors"
          >
            <PhotoIcon className="h-4 w-4 text-[#e03e3e]" />
            <span>Bannière Accueil</span>
          </Link>
          <Link
            href="/admin/sondages/new"
            className="inline-flex items-center gap-2 rounded-md bg-white dark:bg-[#16191f] border border-[#e4e0d8] dark:border-[#222730] px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#101216] dark:text-white hover:bg-[#f2efe9] dark:hover:bg-[#1d2128] transition-colors"
          >
            <ChatBubbleLeftRightIcon className="h-4 w-4 text-[#e03e3e]" />
            <span>Nouveau Sondage</span>
          </Link>
          <Link
            href="/admin/blog/new"
            className="inline-flex items-center gap-2 rounded-md bg-[#e03e3e] hover:bg-[#c93434] px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-white transition-colors shadow-xs"
          >
            <PlusIcon className="h-4 w-4" />
            <span>Nouvel Article</span>
          </Link>
        </div>
      </div>

      {/* Admin Onboarding & Quickstart Checklist */}
      <AdminOnboardingChecklist
        hasActivePoll={Boolean(activePoll)}
        activePollTitle={activePoll?.title}
        hasUpcomingEvents={events.some((e) => e.isoDate >= new Date().toISOString().split('T')[0])}
        upcomingEventsCount={events.filter((e) => e.isoDate >= new Date().toISOString().split('T')[0]).length}
        hasMembers={totalMembers > 0}
        totalMembers={totalMembers}
        hasBlogPosts={totalBlogPosts > 0}
        totalBlogPosts={totalBlogPosts}
      />

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link
            key={stat.name}
            href={stat.href}
            className="group rounded-lg border border-[#e4e0d8] dark:border-[#222730] bg-white dark:bg-[#16191f] p-5 shadow-xs hover:border-[#e03e3e]/40 dark:hover:border-[#e03e3e]/40 hover:shadow-md transition-all flex flex-col justify-between space-y-4"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#7d8493] dark:text-[#9ba3af]">
                {stat.name}
              </span>
              <div className="flex h-9 w-9 items-center justify-center rounded-sm bg-[#faf8f5] dark:bg-[#101216] border border-[#e4e0d8] dark:border-[#222730] text-[#101216] dark:text-[#f5f6f8] transition-colors group-hover:border-[#e03e3e] group-hover:bg-[#e03e3e] group-hover:text-white">
                <stat.icon className="h-4 w-4 transition-transform duration-200 group-hover:scale-105" />
              </div>
            </div>

            <div>
              <p className="text-2xl sm:text-3xl font-extrabold text-[#101216] dark:text-white tabular-nums tracking-tight">
                {stat.value}
              </p>
              <p className="text-xs text-[#5c6370] dark:text-[#9ba3af] mt-1 truncate">{stat.description}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Recent Blog Posts Table */}
      <div className="rounded-lg border border-[#e4e0d8] dark:border-[#222730] bg-white dark:bg-[#16191f] shadow-xs overflow-hidden">
        <div className="border-b border-[#e4e0d8] dark:border-[#222730] px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#101216] dark:text-white">
              Derniers Articles Publiés
            </h2>
            <p className="text-xs text-[#7d8493] dark:text-[#9ba3af] mt-0.5">Actualités et chroniques récentes</p>
          </div>
          <Link
            href="/admin/blog"
            className="inline-flex items-center gap-1 text-xs font-semibold text-[#e03e3e] hover:underline"
          >
            <span>Voir tout le blog</span>
            <ArrowRightIcon className="h-3 w-3" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-[#e4e0d8] dark:divide-[#222730]">
            <thead className="bg-[#f2efe9] dark:bg-[#111318]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#7d8493] dark:text-[#9ba3af]">
                  Titre
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#7d8493] dark:text-[#9ba3af]">
                  Auteur
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#7d8493] dark:text-[#9ba3af]">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#7d8493] dark:text-[#9ba3af]">
                  Statut
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-[#7d8493] dark:text-[#9ba3af]">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#efece5] dark:divide-[#222730] bg-white dark:bg-[#16191f] text-xs">
              {recentPosts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-[#7d8493] dark:text-[#9ba3af]">
                    Aucun article publié pour le moment.{' '}
                    <Link href="/admin/blog/new" className="text-[#e03e3e] font-semibold hover:underline">
                      Créer un premier article
                    </Link>
                  </td>
                </tr>
              ) : (
                recentPosts.map((post) => (
                  <tr key={post.id} className="hover:bg-[#faf8f5] dark:hover:bg-[#1d2128] transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-bold text-[#101216] dark:text-white truncate max-w-sm">
                          {post.title}
                        </p>
                        <p className="text-xs text-[#7d8493] dark:text-[#9ba3af]">{post.category || 'Actualité'}</p>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-[#3a3f4a] dark:text-[#c4cad4] font-medium">
                      {post.author}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-[#7d8493] dark:text-[#9ba3af] tabular-nums">
                      {formatDate(post.publishedAt)}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider ${
                          post.isPublished
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40'
                            : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/40'
                        }`}
                      >
                        {post.isPublished ? 'En ligne' : 'Brouillon'}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right">
                      <Link
                        href={`/admin/blog/${post.id}/edit`}
                        className="text-[#e03e3e] hover:text-[#c93434] font-semibold hover:underline"
                      >
                        Modifier
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Action Shortcuts */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link
          href="/admin/events/new"
          className="group flex items-center gap-3.5 rounded-lg border border-[#e4e0d8] dark:border-[#222730] bg-white dark:bg-[#16191f] p-5 hover:border-[#e03e3e]/40 dark:hover:border-[#e03e3e]/40 hover:shadow-sm transition-all"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm bg-[#faf8f5] dark:bg-[#101216] border border-[#e4e0d8] dark:border-[#222730] text-[#101216] dark:text-[#f5f6f8] transition-colors group-hover:border-[#e03e3e] group-hover:bg-[#e03e3e] group-hover:text-white">
            <CalendarDaysIcon className="h-5 w-5 transition-transform duration-200 group-hover:scale-105" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[#101216] dark:text-white">Nouvelle Sortie</p>
            <p className="text-xs text-[#7d8493] dark:text-[#9ba3af]">Ajouter au calendrier</p>
          </div>
        </Link>

        <Link
          href="/admin/members"
          className="group flex items-center gap-3.5 rounded-lg border border-[#e4e0d8] dark:border-[#222730] bg-white dark:bg-[#16191f] p-5 hover:border-[#e03e3e]/40 dark:hover:border-[#e03e3e]/40 hover:shadow-sm transition-all"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm bg-[#faf8f5] dark:bg-[#101216] border border-[#e4e0d8] dark:border-[#222730] text-[#101216] dark:text-[#f5f6f8] transition-colors group-hover:border-[#e03e3e] group-hover:bg-[#e03e3e] group-hover:text-white">
            <UsersIcon className="h-5 w-5 transition-transform duration-200 group-hover:scale-105" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[#101216] dark:text-white">Gestion Membres</p>
            <p className="text-xs text-[#7d8493] dark:text-[#9ba3af]">Rôles et accès</p>
          </div>
        </Link>

        <Link
          href="/admin/equipements"
          className="group flex items-center gap-3.5 rounded-lg border border-[#e4e0d8] dark:border-[#222730] bg-white dark:bg-[#16191f] p-5 hover:border-[#e03e3e]/40 dark:hover:border-[#e03e3e]/40 hover:shadow-sm transition-all"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm bg-[#faf8f5] dark:bg-[#101216] border border-[#e4e0d8] dark:border-[#222730] text-[#101216] dark:text-[#f5f6f8] transition-colors group-hover:border-[#e03e3e] group-hover:bg-[#e03e3e] group-hover:text-white">
            <JerseyIcon className="h-5 w-5 transition-transform duration-200 group-hover:scale-105" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[#101216] dark:text-white">Équipements Club</p>
            <p className="text-xs text-[#7d8493] dark:text-[#9ba3af]">Stock et catalogue</p>
          </div>
        </Link>

        <Link
          href="/admin/settings"
          className="group flex items-center gap-3.5 rounded-lg border border-[#e4e0d8] dark:border-[#222730] bg-white dark:bg-[#16191f] p-5 hover:border-[#e03e3e]/40 dark:hover:border-[#e03e3e]/40 hover:shadow-sm transition-all"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm bg-[#faf8f5] dark:bg-[#101216] border border-[#e4e0d8] dark:border-[#222730] text-[#101216] dark:text-[#f5f6f8] transition-colors group-hover:border-[#e03e3e] group-hover:bg-[#e03e3e] group-hover:text-white">
            <Cog6ToothIcon className="h-5 w-5 transition-transform duration-200 group-hover:scale-105" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[#101216] dark:text-white">Paramètres & Thème</p>
            <p className="text-xs text-[#7d8493] dark:text-[#9ba3af]">Clair, sombre ou auto</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
