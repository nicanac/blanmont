import React from 'react';
import type { Metadata } from 'next';
import { getActiveWeekendPoll, getPollResponses, getMembers } from '../lib/firebase';
import WeekendPollView from '../features/sondage/components/WeekendPollView';

export const revalidate = 30; // Revalidate every 30 seconds for live poll counts

export const metadata: Metadata = {
  title: 'Sondage du Weekend | CC Saint-Martin Blanmont',
  description:
    'Indiquez vos créneaux et votre groupe de niveau pour les sorties vélo du weekend au départ de Blanmont.',
};

export default async function SondagePage(): Promise<React.ReactElement> {
  const [activePoll, members] = await Promise.all([getActiveWeekendPoll(), getMembers()]);
  const responses = activePoll ? await getPollResponses(activePoll.id) : [];

  // The poll card comes first, with no map header: the vote fits on one screen.
  return (
    <main className="min-h-screen bg-paper dark:bg-night transition-colors duration-200">
      <section className="mx-auto max-w-7xl px-3 py-3 sm:px-6 sm:py-5 lg:px-8">
        <WeekendPollView poll={activePoll} responses={responses} members={members} />
      </section>
    </main>
  );
}
