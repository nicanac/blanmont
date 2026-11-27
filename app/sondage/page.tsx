import React from 'react';
import type { Metadata } from 'next';
import { getActiveWeekendPoll, getPollResponses, getMembers } from '../lib/firebase';
import { getCalendarEvents } from '../lib/firebase/calendar';
import { weekendTraces } from '../lib/poll-share';
import WeekendPollView from '../features/sondage/components/WeekendPollView';

export const revalidate = 30; // Revalidate every 30 seconds for live poll counts

export const metadata: Metadata = {
  title: 'Sondage du Weekend | CC Saint-Martin Blanmont',
  description:
    'Indiquez vos créneaux et votre groupe de niveau pour les sorties vélo du weekend au départ de Blanmont.',
};

export default async function SondagePage(): Promise<React.ReactElement> {
  const [activePoll, members, events] = await Promise.all([
    getActiveWeekendPoll(),
    getMembers(),
    getCalendarEvents(),
  ]);
  const responses = activePoll ? await getPollResponses(activePoll.id) : [];
  const traces = activePoll ? weekendTraces(events, activePoll.weekendIsoDate) : [];

  // The view prints the vote inside the page cartouche (SheetHeader), then the stats below.
  return (
    <main className="min-h-screen bg-paper dark:bg-night transition-colors duration-200">
      <WeekendPollView poll={activePoll} responses={responses} members={members} traces={traces} />
    </main>
  );
}
