import React from 'react';
import Link from 'next/link';
import {
  UsersIcon,
  DocumentTextIcon,
  CalendarDaysIcon,
  PlusIcon,
  ChatBubbleLeftRightIcon,
  ArrowRightIcon,
  ShoppingBagIcon,
} from '@heroicons/react/24/outline';
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
      color: 'bg-[#e03e3e]/15 text-[#e03e3e] border-[#e03e3e]/30',
      description: activePoll ? activePoll.title : 'Créer un sondage',
    },
    {
      name: 'Membres du Club',
      value: totalMembers,
      icon: UsersIcon,
      href: '/admin/members',
      color: 'bg-sky-500/15 text-sky-600 border-sky-500/30',
      description: 'Membres actifs enregistrés',
    },
    {
      name: 'Articles Blog & News',
      value: totalBlogPosts,
      icon: DocumentTextIcon,
      href: '/admin/blog',
      color: 'bg-emerald-500/15 text-emerald-600 border-emerald-500/30',
      description: 'Publications en ligne',
    },
    {
      name: 'Sorties (7 jours)',
      value: upcomingEvents,
      icon: CalendarDaysIcon,
      href: '/admin/events',
      color: 'bg-amber-500/15 text-amber-600 border-amber-500/30',
      description: 'Sorties & rendez-vous',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-[#e4e0d8]">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-[#101216] px-3 py-1 text-xs font-bold uppercase tracking-wider text-white mb-2">
            <span className="h-1.5 w-1.5 rounded-full bg-[#e03e3e]" />
            Espace Administration
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#101216]">
            Tableau de bord
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-[#5c6370]">
            Gestion du club, des membres, des sondages hebdomadaires et des sorties.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/admin/sondages/new"
            className="inline-flex items-center gap-2 rounded-md bg-white border border-[#e4e0d8] px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#101216] hover:bg-[#f2efe9] transition-colors"
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
            className="group rounded-lg border border-[#e4e0d8] bg-white p-5 shadow-xs hover:border-[#e03e3e]/40 hover:shadow-md transition-all flex flex-col justify-between space-y-4"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#7d8493]">
                {stat.name}
              </span>
              <div className={`flex h-9 w-9 items-center justify-center rounded-md border ${stat.color}`}>
                <stat.icon className="h-4 w-4" />
              </div>
            </div>

            <div>
              <p className="text-2xl sm:text-3xl font-extrabold text-[#101216] tabular-nums tracking-tight">
                {stat.value}
              </p>
              <p className="text-xs text-[#5c6370] mt-1 truncate">{stat.description}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Recent Blog Posts Table */}
      <div className="rounded-lg border border-[#e4e0d8] bg-white shadow-xs overflow-hidden">
        <div className="border-b border-[#e4e0d8] px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#101216]">
              Derniers Articles Publiés
            </h2>
            <p className="text-xs text-[#7d8493] mt-0.5">Actualités et chroniques récentes</p>
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
          <table className="min-w-full divide-y divide-[#e4e0d8]">
            <thead className="bg-[#f2efe9]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#7d8493]">
                  Titre
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#7d8493]">
                  Auteur
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#7d8493]">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#7d8493]">
                  Statut
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-[#7d8493]">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#efece5] bg-white text-xs">
              {recentPosts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-[#7d8493]">
                    Aucun article publié pour le moment.{' '}
                    <Link href="/admin/blog/new" className="text-[#e03e3e] font-semibold hover:underline">
                      Créer un premier article
                    </Link>
                  </td>
                </tr>
              ) : (
                recentPosts.map((post) => (
                  <tr key={post.id} className="hover:bg-[#faf8f5] transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-bold text-[#101216] truncate max-w-sm">
                          {post.title}
                        </p>
                        <p className="text-xs text-[#7d8493]">{post.category || 'Actualité'}</p>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-[#3a3f4a] font-medium">
                      {post.author}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-[#7d8493] tabular-nums">
                      {formatDate(post.publishedAt)}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider ${
                          post.isPublished
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
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
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Link
          href="/admin/events/new"
          className="flex items-center gap-3.5 rounded-lg border border-[#e4e0d8] bg-white p-5 hover:border-[#e03e3e]/40 hover:shadow-sm transition-all"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-[#e03e3e]/10 text-[#e03e3e]">
            <CalendarDaysIcon className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[#101216]">Nouvelle Sortie</p>
            <p className="text-xs text-[#7d8493]">Ajouter au calendrier</p>
          </div>
        </Link>

        <Link
          href="/admin/members"
          className="flex items-center gap-3.5 rounded-lg border border-[#e4e0d8] bg-white p-5 hover:border-[#e03e3e]/40 hover:shadow-sm transition-all"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-sky-500/10 text-sky-600">
            <UsersIcon className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[#101216]">Gestion Membres</p>
            <p className="text-xs text-[#7d8493]">Rôles et accès</p>
          </div>
        </Link>

        <Link
          href="/admin/equipements"
          className="flex items-center gap-3.5 rounded-lg border border-[#e4e0d8] bg-white p-5 hover:border-[#e03e3e]/40 hover:shadow-sm transition-all"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-600">
            <ShoppingBagIcon className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[#101216]">Équipements Club</p>
            <p className="text-xs text-[#7d8493]">Stock et catalogue</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
