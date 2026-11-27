import React from 'react';
import type { Metadata } from 'next';
import { getActiveWeekendPoll, getPollResponses, getMembers } from '../lib/firebase';
import { getCalendarEvents } from '../lib/firebase/calendar';
import { weekendTraces } from '../lib/poll-share';
import { withTraceRoutes } from '../lib/trace-route';
import { getSessionUser } from '../lib/auth/session';
import WeekendPollView from '../features/sondage/components/WeekendPollView';

// Reading the session cookie makes this page dynamic: the weekend trace is for members only (#252).

export const metadata: Metadata = {
  title: 'Sondage du Weekend | CC Saint-Martin Blanmont',
  description:
    'Indiquez vos créneaux et votre groupe de niveau pour les sorties vélo du weekend au départ de Blanmont.',
};

export default async function SondagePage(): Promise<React.ReactElement> {
  const [activePoll, members, events, sessionUser] = await Promise.all([
    getActiveWeekendPoll(),
    getMembers(),
    getCalendarEvents(),
    getSessionUser(),
  ]);
  // Responses and the trace previews (Garmin course / GPX, cached 1 h) load in parallel.
  // Guests never receive the traces: they are left out on the server, not hidden in the view.
  const [responses, traces] = activePoll
    ? await Promise.all([
        getPollResponses(activePoll.id),
        sessionUser ? withTraceRoutes(weekendTraces(events, activePoll.weekendIsoDate)) : [],
      ])
    : [[], []];

  // The view prints the vote inside the page cartouche (SheetHeader), then the stats below.
  return (
    <main className="min-h-screen bg-paper dark:bg-night transition-colors duration-200">
      <WeekendPollView poll={activePoll} responses={responses} members={members} traces={traces} />
    </main>
  );
}
