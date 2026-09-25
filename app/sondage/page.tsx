import React from 'react';
import type { Metadata } from 'next';
import { getActiveWeekendPoll, getPollResponses, getMembers } from '../lib/firebase';
import WeekendPollView from '../features/sondage/components/WeekendPollView';
import { SheetHeader } from '../components/carte/SheetHeader';

export const revalidate = 30; // Revalidate every 30 seconds for live poll counts

export const metadata: Metadata = {
  title: 'Sondage du Weekend | CC Saint-Martin Blanmont',
  description:
    'Indiquez vos disponibilités et votre groupe de niveau pour les sorties vélo du weekend au départ de Blanmont.',
};

export default async function SondagePage(): Promise<React.ReactElement> {
  const [activePoll, members] = await Promise.all([getActiveWeekendPoll(), getMembers()]);

  const responses = activePoll ? await getPollResponses(activePoll.id) : [];

  const saturdayCount = responses.filter(
    (r) => r.dayChoice === 'samedi' || r.dayChoice === 'les-deux'
  ).length;
  const sundayCount = responses.filter(
    (r) => r.dayChoice === 'dimanche' || r.dayChoice === 'les-deux'
  ).length;

  return (
    <main className="min-h-screen bg-paper dark:bg-night transition-colors duration-200">
      <SheetHeader
        sheet="Feuille de route & Pelotons"
        focus={{ x: 50, y: 50 }}
        title="Sondage du week-end"
        description={
          activePoll?.description ||
          'Qui vient rouler ce week-end ? Choisissez votre jour, votre groupe de niveau et découvrez la composition des pelotons en direct.'
        }
        legend={[
          {
            term: 'Participations',
            value: `${responses.length} coureur${responses.length > 1 ? 's' : ''}`,
          },
          {
            term: 'Peloton Samedi',
            value: `${saturdayCount} coureur${saturdayCount > 1 ? 's' : ''}`,
            hint: 'Départ 8h30',
          },
          {
            term: 'Peloton Dimanche',
            value: `${sundayCount} coureur${sundayCount > 1 ? 's' : ''}`,
            hint: 'Départ 9h00',
          },
        ]}
      />

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <WeekendPollView poll={activePoll} responses={responses} members={members} />
      </section>
    </main>
  );
}
