import React, { Suspense } from 'react';
import { getMembers, getTraces, getActiveRides, getVotes } from '../lib/firebase';
import SaturdayRideView from '../features/saturday-ride/components/SaturdayRideView';
import { Vote } from '../types';

// Revalidate every minute to show fresh votes
export const revalidate = 60;

function SaturdayRideLoading(): React.ReactElement {
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-8 text-center bg-[#faf8f5]">
      <div className="space-y-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#e4e0d8] border-t-[#e03e3e] mx-auto" />
        <p className="text-xs font-semibold uppercase tracking-wider text-[#5c6370]">
          Chargement des parcours et votes du samedi...
        </p>
      </div>
    </div>
  );
}

/**
 * Saturday Ride Voting Page.
 * Aggregates all data needed for the voting interface: members, all traces, active rides, and current votes.
 * Wraps the interactive `SaturdayRideView` client component.
 * Revalidates every 60 seconds.
 */
export default async function SaturdayRidePage(): Promise<React.ReactElement> {
  const [traces, members, activeRides] = await Promise.all([
    getTraces(),
    getMembers(),
    getActiveRides(),
  ]);

  // Fetch votes for all active rides
  const allVotes: Vote[] = [];
  await Promise.all(
    activeRides.map(async (ride) => {
      const rideVotes = await getVotes(ride.id);
      allVotes.push(...rideVotes);
    })
  );

  return (
    <Suspense fallback={<SaturdayRideLoading />}>
      <SaturdayRideView
        traces={traces}
        members={members}
        activeRides={activeRides}
        votes={allVotes}
      />
    </Suspense>
  );
}
