import React from 'react';
import type { Metadata } from 'next';
import { PageHero } from '../components/ui/PageHero';
import { getActiveWeekendPoll, getPollResponses, getMembers } from '../lib/firebase';
import WeekendPollView from '../features/sondage/components/WeekendPollView';
import { ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';

export const revalidate = 30; // Revalidate every 30 seconds for live poll counts

export const metadata: Metadata = {
  title: 'Sondage du Weekend | Club de Blanmont',
  description: 'Indiquez vos disponibilités et votre groupe de niveau pour les sorties vélo du weekend.',
};

export default async function SondagePage(): Promise<React.ReactElement> {
  const [activePoll, members] = await Promise.all([
    getActiveWeekendPoll(),
    getMembers(),
  ]);

  const responses = activePoll ? await getPollResponses(activePoll.id) : [];

  return (
    <main className="min-h-screen bg-slate-50 pb-16">
      <PageHero
        title="Sondage du Weekend"
        description="Qui vient rouler ce weekend ? Choisissez votre jour, votre groupe et découvrez le peloton en direct."
        badge="Sorties Weekend"
        badgeIcon={<ChatBubbleLeftRightIcon className="h-4 w-4" />}
        variant="red"
        size="md"
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 -mt-6 sm:-mt-8">
        <WeekendPollView poll={activePoll} responses={responses} members={members} />
      </div>
    </main>
  );
}
