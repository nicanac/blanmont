import React from 'react';
import Link from 'next/link';
import {
  UsersIcon,
  UserPlusIcon,
  DocumentTextIcon,
  CalendarDaysIcon,
  PlusIcon,
  ChatBubbleLeftRightIcon,
  ArrowRightIcon,
  ClipboardDocumentCheckIcon,
  Cog6ToothIcon,
  CameraIcon,
  MapPinIcon,
  ClockIcon,
  ArrowDownTrayIcon,
} from '@heroicons/react/24/outline';
import { JerseyIcon, TrophySquareIcon } from '@/app/components/ui/CyclingIcons';
import { SheetHeader, SheetLegendRow } from '@/app/components/carte/SheetHeader';
import { getBlogPosts } from '../lib/firebase/blog';
import { getMembers } from '../lib/firebase/members';
import { getCalendarEvents } from '../lib/firebase/calendar';
import { getActiveWeekendPoll, getPollResponses } from '../lib/firebase/polls';
import { getTrialRequests } from '../lib/firebase/trial-requests';
import AdminOnboardingChecklist from './components/AdminOnboardingChecklist';
import PelotonBriefingAction from './components/PelotonBriefingAction';
import { parseDateInfo } from '../lib/carreVert';

export const dynamic = 'force-dynamic';

function formatDate(dateString: string): string {
  const info = parseDateInfo(dateString);
  if (!info) return dateString;
  try {
    const utcDate = new Date(Date.UTC(info.year, info.month - 1, info.day));
    return utcDate.toLocaleDateString('fr-BE', {
      timeZone: 'UTC',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return info.displayDate;
  }
}

export default async function AdminDashboardPage(): Promise<React.ReactElement> {
  const [blogPosts, members, events, activePoll, trialRequests] = await Promise.all([
    getBlogPosts(),
    getMembers(),
    getCalendarEvents(),
    getActiveWeekendPoll(),
    getTrialRequests(),
  ]);

  const pollResponses = activePoll ? await getPollResponses(activePoll.id) : [];
  const activeAttendees = pollResponses.filter((r) => r.dayChoice !== 'absent').length;
  const pendingTrials = trialRequests.filter((t) => t.status === 'pending');
  const pendingTrialsCount = pendingTrials.length;

  const totalMembers = members.length;
  const totalBlogPosts = blogPosts.length;

  const now = new Date();
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const upcomingEvents = events.filter((event) => {
    const eventDate = new Date(event.isoDate);
    return eventDate >= now && eventDate <= nextWeek;
  }).length;

  // Next upcoming ride
  const todayStr = now.toISOString().split('T')[0];
  const sortedUpcomingEvents = [...events]
    .filter((e) => e.isoDate >= todayStr)
    .sort((a, b) => a.isoDate.localeCompare(b.isoDate));
  const nextRide = sortedUpcomingEvents[0] || null;

  // Group and day breakdown
  const attendingResponses = pollResponses.filter((r) => r.dayChoice !== 'absent');
  const groupCounts: Record<string, number> = {
    'Groupe A': 0,
    'Groupe B': 0,
    'Groupe C': 0,
    'Groupe VTT': 0,
  };
  let otherGroupCount = 0;

  attendingResponses.forEach((r) => {
    if (r.groupChoice && groupCounts[r.groupChoice] !== undefined) {
      groupCounts[r.groupChoice] += 1;
    } else {
      otherGroupCount += 1;
    }
  });

  const dayCounts = {
    samedi: attendingResponses.filter((r) => r.dayChoice === 'samedi' || r.dayChoice === 'les-deux').length,
    dimanche: attendingResponses.filter((r) => r.dayChoice === 'dimanche' || r.dayChoice === 'les-deux').length,
  };

  const recentPosts = blogPosts.slice(0, 5);

  const legendRows: SheetLegendRow[] = [
    {
      term: 'Membres inscrits',
      value: <span className="tabular-nums font-bold">{totalMembers}</span>,
      hint: 'Annuaire officiel',
    },
    {
      term: 'Sondage Hebdo',
      value: <span className="tabular-nums font-bold">{activePoll ? `${activeAttendees} inscrits` : 'Inactif'}</span>,
      hint: activePoll ? 'Weekend en cours' : 'À lancer',
    },
    {
      term: 'Sorties (7j)',
      value: <span className="tabular-nums font-bold">{upcomingEvents}</span>,
      hint: 'Rendez-vous programmés',
    },
    {
      term: 'Sorties d’essai',
      value: (
        <span className={`tabular-nums font-bold ${pendingTrialsCount > 0 ? 'text-ambre' : 'text-vert'}`}>
          {pendingTrialsCount > 0 ? `${pendingTrialsCount} en attente` : 'À jour'}
        </span>
      ),
      hint: 'Candidatures /rejoindre',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Topographic Sheet Cartouche Header */}
      <SheetHeader
        sheet="Feuille · Quartier Général"
        title="Tableau de bord · Quartier Général"
        description="Poste de commandement des opérations du club, coordination du peloton hebdomadaire et suivi communautaire."
        legend={legendRows}
        actions={
          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              href="/admin/sondages/new"
              className="inline-flex items-center gap-1.5 rounded-md border border-line dark:border-night-line bg-paper-2 dark:bg-night-2 px-3 py-1.5 text-xs font-narrow font-semibold uppercase tracking-wider text-ink dark:text-snow hover:bg-line dark:hover:bg-night-3 transition-colors active:translate-y-px"
            >
              <ChatBubbleLeftRightIcon className="h-4 w-4 text-brand" />
              <span>Nouveau Sondage</span>
            </Link>
            <Link
              href="/admin/events/new"
              className="inline-flex items-center gap-1.5 rounded-md border border-line dark:border-night-line bg-paper-2 dark:bg-night-2 px-3 py-1.5 text-xs font-narrow font-semibold uppercase tracking-wider text-ink dark:text-snow hover:bg-line dark:hover:bg-night-3 transition-colors active:translate-y-px"
            >
              <CalendarDaysIcon className="h-4 w-4 text-brand" />
              <span>Nouvelle Sortie</span>
            </Link>
            <Link
              href="/admin/blog/new"
              className="inline-flex items-center gap-1.5 rounded-md bg-brand hover:bg-brand-strong px-3.5 py-1.5 text-xs font-narrow font-bold uppercase tracking-[0.07em] text-white transition-colors active:translate-y-px shadow-xs"
            >
              <PlusIcon className="h-4 w-4 stroke-[2.5]" />
              <span>Nouvel Article</span>
            </Link>
          </div>
        }
      />

      {/* Admin Onboarding Checklist (Cleaned & Collapsible) */}
      <AdminOnboardingChecklist
        hasActivePoll={Boolean(activePoll)}
        activePollTitle={activePoll?.title}
        hasUpcomingEvents={events.some((e) => e.isoDate >= todayStr)}
        upcomingEventsCount={events.filter((e) => e.isoDate >= todayStr).length}
        hasMembers={totalMembers > 0}
        totalMembers={totalMembers}
        hasBlogPosts={totalBlogPosts > 0}
        totalBlogPosts={totalBlogPosts}
      />

      {/* Asymmetric Cartographic Bento Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Main Operational Column (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Peloton Command: Weekend Ride & Poll Attendance */}
          <section
            aria-labelledby="peloton-command-heading"
            className="rounded-md border border-line dark:border-night-line bg-paper dark:bg-night-2 p-5 sm:p-6 corner-ticks space-y-5"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-line dark:border-night-line pb-4">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-tint dark:bg-brand/10 border border-brand/20 px-2.5 py-0.5 text-xs font-narrow font-bold uppercase tracking-wider text-brand">
                    <span className="h-1.5 w-1.5 rounded-full bg-brand animate-pulse" />
                    <span>Poste de Commandement</span>
                  </span>
                  <span className="text-xs font-narrow font-semibold uppercase tracking-wider text-ink-3 dark:text-snow-3">
                    Peloton du Weekend
                  </span>
                </div>
                <h2
                  id="peloton-command-heading"
                  className="mt-1 text-lg sm:text-xl font-wide font-extrabold tracking-tight text-ink dark:text-white"
                >
                  {activePoll ? activePoll.title : nextRide ? nextRide.location : 'Sortie en Préparation'}
                </h2>
              </div>

              {/* WhatsApp Briefing Generator & Quick Copy */}
              <PelotonBriefingAction
                pollTitle={activePoll?.title}
                dateStr={
                  nextRide
                    ? formatDate(nextRide.isoDate)
                    : activePoll?.weekendIsoDate
                    ? formatDate(activePoll.weekendIsoDate)
                    : undefined
                }
                attendeesCount={activeAttendees}
                groups={[
                  { name: 'Groupe A', count: groupCounts['Groupe A'] },
                  { name: 'Groupe B', count: groupCounts['Groupe B'] },
                  { name: 'Groupe C', count: groupCounts['Groupe C'] },
                  { name: 'Groupe VTT', count: groupCounts['Groupe VTT'] },
                  ...(otherGroupCount > 0 ? [{ name: 'Autre', count: otherGroupCount }] : []),
                ]}
                departureLocation={nextRide?.location}
                departureTime={nextRide?.departure}
                distance={nextRide?.distances}
                gpxUrl={nextRide?.gpxUrl}
              />
            </div>

            {/* Ride Logistics Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-md bg-paper-2 dark:bg-night border border-line dark:border-night-line text-xs">
              <div className="flex items-center gap-2.5">
                <MapPinIcon className="h-4 w-4 text-brand shrink-0" />
                <div className="truncate">
                  <span className="text-ink-3 dark:text-snow-3 block font-narrow uppercase tracking-wider text-xs">
                    Lieu de départ
                  </span>
                  <span className="font-semibold text-ink dark:text-snow truncate">
                    {nextRide?.location || 'Place de la Féchère, Blanmont'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <ClockIcon className="h-4 w-4 text-brand shrink-0" />
                <div>
                  <span className="text-ink-3 dark:text-snow-3 block font-narrow uppercase tracking-wider text-xs">
                    Rendez-vous
                  </span>
                  <span className="font-semibold text-ink dark:text-snow">
                    {nextRide?.departure || '09h00'}
                    {nextRide?.isoDate && ` · ${formatDate(nextRide.isoDate)}`}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <ArrowDownTrayIcon className="h-4 w-4 text-brand shrink-0" />
                <div>
                  <span className="text-ink-3 dark:text-snow-3 block font-narrow uppercase tracking-wider text-xs">
                    Parcours &amp; GPX
                  </span>
                  {nextRide?.gpxUrl ? (
                    <a
                      href={nextRide.gpxUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-brand hover:underline truncate inline-flex items-center gap-1"
                    >
                      <span>{nextRide.distances || 'Télécharger la trace'}</span>
                      <span>↗</span>
                    </a>
                  ) : (
                    <span className="text-ink-3 dark:text-snow-3 italic">
                      {nextRide?.distances ? `${nextRide.distances} (GPX à venir)` : 'À définir'}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Real-Time Groups & Days Roster */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-narrow font-bold uppercase tracking-wider text-ink-3 dark:text-snow-3">
                  Composition des Groupes ({activeAttendees} cycliste{activeAttendees > 1 ? 's' : ''})
                </h3>
                {activePoll && (
                  <div className="flex items-center gap-3 text-xs font-narrow text-ink-3 dark:text-snow-3">
                    <span>
                      Samedi : <strong className="text-ink dark:text-snow tabular-nums">{dayCounts.samedi}</strong>
                    </span>
                    <span>·</span>
                    <span>
                      Dimanche : <strong className="text-ink dark:text-snow tabular-nums">{dayCounts.dimanche}</strong>
                    </span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { name: 'Groupe A', count: groupCounts['Groupe A'], pace: '> 29 km/h', ink: 'text-brand' },
                  { name: 'Groupe B', count: groupCounts['Groupe B'], pace: '26 - 28 km/h', ink: 'text-hydro' },
                  { name: 'Groupe C', count: groupCounts['Groupe C'], pace: '23 - 25 km/h', ink: 'text-vert' },
                  { name: 'Groupe VTT', count: groupCounts['Groupe VTT'], pace: 'Chemins & Bois', ink: 'text-bistre' },
                ].map((grp) => (
                  <div
                    key={grp.name}
                    className="p-3 rounded-md bg-paper-2 dark:bg-night border border-line dark:border-night-line text-left space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-narrow font-bold uppercase tracking-wider text-ink dark:text-white">
                        {grp.name}
                      </span>
                      <span className={`text-base font-extrabold tabular-nums ${grp.ink}`}>
                        {grp.count}
                      </span>
                    </div>
                    <p className="text-xs text-ink-3 dark:text-snow-3 font-mono">
                      {grp.pace}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Action Bar under Command Center */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-line dark:border-night-line text-xs font-narrow">
              <div className="flex items-center gap-4">
                <Link
                  href={activePoll ? `/admin/sondages/${activePoll.id}` : '/admin/sondages'}
                  className="font-bold text-brand hover:underline inline-flex items-center gap-1"
                >
                  <span>Gérer les réponses au sondage</span>
                  <ArrowRightIcon className="h-3 w-3" />
                </Link>
                <Link
                  href="/admin/events"
                  className="font-semibold text-ink-3 hover:text-ink dark:hover:text-white hover:underline"
                >
                  Calendrier complet
                </Link>
              </div>

              <Link
                href="/admin/pointage-express"
                className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-ink hover:text-brand transition-colors"
              >
                <ClipboardDocumentCheckIcon className="h-4 w-4 text-brand" />
                <span>Ouvrir le Pointage Express (Départ)</span>
              </Link>
            </div>
          </section>

          {/* Pending Trial Requests (High-Priority Club Growth Alert) */}
          {pendingTrialsCount > 0 && (
            <section
              aria-labelledby="pending-trials-heading"
              className="rounded-md border border-ambre/40 dark:border-ambre/30 bg-paper dark:bg-night-2 p-5 corner-ticks space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-sm bg-ambre/15 text-ambre border border-ambre/30 shrink-0">
                    <UserPlusIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <h2
                      id="pending-trials-heading"
                      className="text-sm font-bold text-ink dark:text-white"
                    >
                      {pendingTrialsCount} {pendingTrialsCount > 1 ? 'candidatures de sortie d’essai' : 'candidature de sortie d’essai'} en attente de parrainage
                    </h2>
                    <p className="text-xs text-ink-3 dark:text-snow-3 mt-0.5">
                      Des cyclistes ont postulé via <code>/rejoindre</code> et attendent une prise de contact d&apos;un capitaine mentor.
                    </p>
                  </div>
                </div>

                <Link
                  href="/admin/prospects"
                  className="inline-flex items-center gap-1.5 rounded-md bg-ambre hover:bg-ambre/90 text-white px-3.5 py-2 text-xs font-narrow font-bold uppercase tracking-[0.07em] transition-colors shrink-0 active:translate-y-px"
                >
                  <span>Gérer les candidatures</span>
                  <ArrowRightIcon className="h-3.5 w-3.5" />
                </Link>
              </div>

              {/* Inline Candidates Roster */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-line/60 dark:border-night-line">
                {pendingTrials.slice(0, 2).map((trial) => (
                  <div
                    key={trial.id}
                    className="p-3 rounded-md bg-paper-2 dark:bg-night border border-line dark:border-night-line space-y-1 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-ink dark:text-white">{trial.name}</span>
                      <span className="font-narrow uppercase font-bold text-xs px-2 py-0.5 rounded-xs bg-paper dark:bg-night-2 border border-line dark:border-night-line">
                        Groupe {trial.preferredGroup || 'B'}
                      </span>
                    </div>
                    <p className="text-ink-3 dark:text-snow-3 text-xs">
                      {trial.experienceLevel || 'Intermédiaire'} · Vélo {trial.bikeType || 'Route'}
                    </p>
                    <div className="flex items-center gap-3 pt-1 text-xs font-mono text-ink-3">
                      <a href={`mailto:${trial.email}`} className="text-brand hover:underline">
                        {trial.email}
                      </a>
                      {trial.phone && (
                        <span>· {trial.phone}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Recent Blog Posts Table (Cartographic Styling) */}
          <section
            aria-labelledby="recent-posts-heading"
            className="rounded-md border border-line dark:border-night-line bg-paper dark:bg-night-2 overflow-hidden corner-ticks"
          >
            <div className="border-b border-line dark:border-night-line px-5 py-4 flex items-center justify-between">
              <div>
                <h2
                  id="recent-posts-heading"
                  className="text-xs font-narrow font-bold uppercase tracking-wider text-ink dark:text-white"
                >
                  Derniers Articles &amp; Chroniques Publiés
                </h2>
                <p className="text-xs text-ink-3 dark:text-snow-3 mt-0.5">
                  Actualités récentes du club et récits de sorties
                </p>
              </div>
              <Link
                href="/admin/blog"
                className="inline-flex items-center gap-1 text-xs font-narrow font-bold uppercase tracking-wider text-brand hover:underline"
              >
                <span>Voir tout le blog</span>
                <ArrowRightIcon className="h-3 w-3" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-line dark:divide-night-line">
                <thead className="bg-paper-2 dark:bg-night">
                  <tr>
                    <th className="px-5 py-2.5 text-left text-xs font-narrow font-semibold uppercase tracking-wider text-ink-3 dark:text-snow-3">
                      Titre
                    </th>
                    <th className="px-5 py-2.5 text-left text-xs font-narrow font-semibold uppercase tracking-wider text-ink-3 dark:text-snow-3">
                      Auteur
                    </th>
                    <th className="px-5 py-2.5 text-left text-xs font-narrow font-semibold uppercase tracking-wider text-ink-3 dark:text-snow-3">
                      Date
                    </th>
                    <th className="px-5 py-2.5 text-left text-xs font-narrow font-semibold uppercase tracking-wider text-ink-3 dark:text-snow-3">
                      Statut
                    </th>
                    <th className="px-5 py-2.5 text-right text-xs font-narrow font-semibold uppercase tracking-wider text-ink-3 dark:text-snow-3">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line dark:divide-night-line bg-paper dark:bg-night-2 text-xs">
                  {recentPosts.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-5 py-8 text-center text-ink-3 dark:text-snow-3">
                        Aucun article publié pour le moment.{' '}
                        <Link href="/admin/blog/new" className="text-brand font-semibold hover:underline">
                          Créer un premier article
                        </Link>
                      </td>
                    </tr>
                  ) : (
                    recentPosts.map((post) => (
                      <tr key={post.id} className="hover:bg-paper-2 dark:hover:bg-night-3 transition-colors">
                        <td className="px-5 py-3.5">
                          <div>
                            <p className="font-bold text-ink dark:text-white truncate max-w-sm">
                              {post.title}
                            </p>
                            <p className="text-xs text-ink-3 dark:text-snow-3 font-narrow uppercase tracking-wider">
                              {post.category || 'Actualité'}
                            </p>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-5 py-3.5 text-ink-2 dark:text-snow-2 font-medium">
                          {post.author}
                        </td>
                        <td className="whitespace-nowrap px-5 py-3.5 text-ink-3 dark:text-snow-3 tabular-nums">
                          {formatDate(post.publishedAt)}
                        </td>
                        <td className="whitespace-nowrap px-5 py-3.5">
                          <span
                            className={`inline-flex rounded-full px-2 py-0.5 text-xs font-narrow font-bold uppercase tracking-wider ${
                              post.isPublished
                                ? 'bg-bois/60 dark:bg-vert/20 text-vert dark:text-vert border border-vert/30'
                                : 'bg-ambre/15 text-ambre border border-ambre/30'
                            }`}
                          >
                            {post.isPublished ? 'En ligne' : 'Brouillon'}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-5 py-3.5 text-right font-narrow">
                          <Link
                            href={`/admin/blog/${post.id}/edit`}
                            className="text-brand hover:text-brand-strong font-bold uppercase tracking-wider hover:underline"
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
          </section>
        </div>

        {/* Side Column: Quick Ops Shortcuts & Telemetry (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Rituels & Actions Rapides */}
          <section
            aria-labelledby="quick-ops-heading"
            className="rounded-md border border-line dark:border-night-line bg-paper dark:bg-night-2 p-5 corner-ticks space-y-3"
          >
            <h2
              id="quick-ops-heading"
              className="text-xs font-narrow font-bold uppercase tracking-wider text-ink-3 dark:text-snow-3 border-b border-line dark:border-night-line pb-2.5"
            >
              Rituels &amp; Actions Rapides
            </h2>

            <div className="space-y-2">
              <Link
                href="/admin/pointage-express"
                className="group flex items-center justify-between p-3 rounded-md bg-paper-2 dark:bg-night border border-line dark:border-night-line hover:border-brand/40 dark:hover:border-brand/40 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-paper dark:bg-night-2 border border-line dark:border-night-line text-ink dark:text-snow group-hover:bg-brand group-hover:text-white transition-colors">
                    <ClipboardDocumentCheckIcon className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="text-xs font-narrow font-bold uppercase tracking-wider text-ink dark:text-white block">
                      Pointage Express
                    </span>
                    <span className="text-xs text-ink-3 dark:text-snow-3 block">
                      Roll-call départ samedi matin
                    </span>
                  </div>
                </div>
                <span className="text-xs font-narrow font-bold text-brand uppercase tracking-wider">
                  Départ
                </span>
              </Link>

              <Link
                href="/admin/carre-vert"
                className="group flex items-center justify-between p-3 rounded-md bg-paper-2 dark:bg-night border border-line dark:border-night-line hover:border-brand/40 dark:hover:border-brand/40 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-paper dark:bg-night-2 border border-line dark:border-night-line text-ink dark:text-snow group-hover:bg-vert group-hover:text-white transition-colors">
                    <TrophySquareIcon className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="text-xs font-narrow font-bold uppercase tracking-wider text-ink dark:text-white block">
                      Pointage Carré Vert
                    </span>
                    <span className="text-xs text-ink-3 dark:text-snow-3 block">
                      Assiduité &amp; challenge annuel
                    </span>
                  </div>
                </div>
                <ArrowRightIcon className="h-3.5 w-3.5 text-ink-3 group-hover:text-ink dark:group-hover:text-white transition-colors" />
              </Link>

              <Link
                href="/admin/members"
                className="group flex items-center justify-between p-3 rounded-md bg-paper-2 dark:bg-night border border-line dark:border-night-line hover:border-brand/40 dark:hover:border-brand/40 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-paper dark:bg-night-2 border border-line dark:border-night-line text-ink dark:text-snow group-hover:bg-brand group-hover:text-white transition-colors">
                    <UsersIcon className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="text-xs font-narrow font-bold uppercase tracking-wider text-ink dark:text-white block">
                      Annuaire Membres
                    </span>
                    <span className="text-xs text-ink-3 dark:text-snow-3 block">
                      {totalMembers} adhérents actifs
                    </span>
                  </div>
                </div>
                <ArrowRightIcon className="h-3.5 w-3.5 text-ink-3 group-hover:text-ink dark:group-hover:text-white transition-colors" />
              </Link>

              <Link
                href="/admin/equipements"
                className="group flex items-center justify-between p-3 rounded-md bg-paper-2 dark:bg-night border border-line dark:border-night-line hover:border-brand/40 dark:hover:border-brand/40 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-paper dark:bg-night-2 border border-line dark:border-night-line text-ink dark:text-snow group-hover:bg-brand group-hover:text-white transition-colors">
                    <JerseyIcon className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="text-xs font-narrow font-bold uppercase tracking-wider text-ink dark:text-white block">
                      Équipements Club
                    </span>
                    <span className="text-xs text-ink-3 dark:text-snow-3 block">
                      Maillots &amp; commandes
                    </span>
                  </div>
                </div>
                <ArrowRightIcon className="h-3.5 w-3.5 text-ink-3 group-hover:text-ink dark:group-hover:text-white transition-colors" />
              </Link>

              <Link
                href="/admin/galerie"
                className="group flex items-center justify-between p-3 rounded-md bg-paper-2 dark:bg-night border border-line dark:border-night-line hover:border-brand/40 dark:hover:border-brand/40 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-paper dark:bg-night-2 border border-line dark:border-night-line text-ink dark:text-snow group-hover:bg-brand group-hover:text-white transition-colors">
                    <CameraIcon className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="text-xs font-narrow font-bold uppercase tracking-wider text-ink dark:text-white block">
                      Galeries Photos
                    </span>
                    <span className="text-xs text-ink-3 dark:text-snow-3 block">
                      Albums des sorties
                    </span>
                  </div>
                </div>
                <ArrowRightIcon className="h-3.5 w-3.5 text-ink-3 group-hover:text-ink dark:group-hover:text-white transition-colors" />
              </Link>

              <Link
                href="/admin/settings"
                className="group flex items-center justify-between p-3 rounded-md bg-paper-2 dark:bg-night border border-line dark:border-night-line hover:border-brand/40 dark:hover:border-brand/40 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-paper dark:bg-night-2 border border-line dark:border-night-line text-ink dark:text-snow group-hover:bg-brand group-hover:text-white transition-colors">
                    <Cog6ToothIcon className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="text-xs font-narrow font-bold uppercase tracking-wider text-ink dark:text-white block">
                      Paramètres &amp; Thème
                    </span>
                    <span className="text-xs text-ink-3 dark:text-snow-3 block">
                      Configuration du système
                    </span>
                  </div>
                </div>
                <ArrowRightIcon className="h-3.5 w-3.5 text-ink-3 group-hover:text-ink dark:group-hover:text-white transition-colors" />
              </Link>
            </div>
          </section>

          {/* Quick Territory Context Box */}
          <div className="p-4 rounded-md border border-line dark:border-night-line bg-paper-2 dark:bg-night text-xs space-y-2">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-vert" />
              <span className="font-narrow font-bold uppercase tracking-wider text-ink dark:text-white">
                Place de la Féchère · 50°37′23″ N · 4°38′32″ E
              </span>
            </div>
            <p className="text-ink-3 dark:text-snow-3 text-xs leading-relaxed">
              Point de rassemblement fédéral du CC Saint-Martin Blanmont. Les départs des sorties officielles du samedi s&apos;organisent à 09h00 (hiver 09h30).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
