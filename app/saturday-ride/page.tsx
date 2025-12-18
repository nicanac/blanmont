import { getMembers, getTraces, getActiveRides, getVotes } from '../lib/notion';
import SaturdayRideView from '../components/SaturdayRideView';
import { Suspense } from 'react';
import { Vote } from '../types';

// Revalidate every minute to show fresh votes
export const revalidate = 60;

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

