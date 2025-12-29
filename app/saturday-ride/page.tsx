import { getMembers, getTraces, getActiveRides, getVotes } from '../lib/notion/index';
import SaturdayRideView from '../features/saturday-ride/components/SaturdayRideView';
import { Suspense } from 'react';
import { Vote } from '../types';

// Revalidate every minute to show fresh votes
export const revalidate = 60;

/**
 * Saturday Ride Voting Page.
 * Aggregates all data needed for the voting interface: members, all traces, active rides, and current votes.
 * Wraps the interactive `SaturdayRideView` client component.
 * Revalidates every 60 seconds.
 */
export default async function SaturdayRidePage() {
    const [traces, members, activeRides] = await Promise.all([
        getTraces(),
        getMembers(),
        getActiveRides()
    ]);

    // Fetch votes for all active rides
    const allVotes: Vote[] = [];
    await Promise.all(activeRides.map(async (ride) => {
        const rideVotes = await getVotes(ride.id);
        allVotes.push(...rideVotes);
    }));

    return (
        <Suspense fallback={<div>Loading Saturday Ride...</div>}>
            <SaturdayRideView
                traces={traces}
                members={members}
                activeRides={activeRides}
                votes={allVotes}
            />
        </Suspense>
    );
}

