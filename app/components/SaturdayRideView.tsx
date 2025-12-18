'use client';

import { useState } from 'react';
import { Member, SaturdayRide, Trace, Vote } from '../types';
import { submitVoteAction } from '../actions';
import styles from './SaturdayRideView.module.css';

interface Props {
    traces: Trace[];
    members: Member[];
    activeRides: SaturdayRide[];
    votes: Vote[];
}

export default function SaturdayRideView({ traces, members, activeRides, votes }: Props) {
    const [currentUser, setCurrentUser] = useState<Member | null>(null);
    const [votingRideIds, setVotingRideIds] = useState<string[]>([]);
    const [optimisticVotes, setOptimisticVotes] = useState<Record<string, { traceId: string, memberId: string }>>({});

    // Derived state
    const isAdmin = currentUser?.role.includes('President') || currentUser?.role.includes('Admin');

    const handleUserChange = (memberId: string) => {
        const member = members.find(m => m.id === memberId) || null;
        setCurrentUser(member);
        setOptimisticVotes({}); // Reset local state to ensure no stale data for new user
    };

    const handleVote = async (rideId: string, traceId: string) => {
        if (!currentUser || votingRideIds.includes(rideId)) return;

        // Optimistic update
        const previousOptimistic = optimisticVotes[rideId];
        setOptimisticVotes(prev => ({
            ...prev,
            [rideId]: { traceId, memberId: currentUser.id }
        }));
        setVotingRideIds(prev => [...prev, rideId]);

        try {
            await submitVoteAction(rideId, currentUser.id, traceId);
        } catch (e) {
            console.error(e);
            // Revert on failure
            if (previousOptimistic) {
                setOptimisticVotes(prev => ({ ...prev, [rideId]: previousOptimistic }));
            } else {
                setOptimisticVotes(prev => {
                    const newState = { ...prev };
                    delete newState[rideId];
                    return newState;
                });
            }
            alert('Failed to submit vote. Please try again.');
        } finally {
            setVotingRideIds(prev => prev.filter(id => id !== rideId));
            // Do NOT clear optimistic state here. 
            // We keep it to prevent flickering (flash of old state) before server props update.
            // It will be naturally consistent with the new server state when it arrives.
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.topBar}>
                <h1>Saturday Ride Selection</h1>
                <div className={styles.userSelect}>
                    <label>Viewing as:</label>
                    <select
                        onChange={(e) => handleUserChange(e.target.value)}
                        value={currentUser?.id || ''}
                    >
                        <option value="">Select User...</option>
                        {members.map(m => (
                            <option key={m.id} value={m.id}>
                                {m.name} {(m.role.includes('President') || m.role.includes('Admin')) ? '(Admin)' : ''}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {!currentUser && (
                <div className={styles.placeholder}>
                    <p>Please select a user to continue.</p>
                </div>
            )}

            {currentUser && (
                <>
                    {/* Active Rides List */}
                    {activeRides.length === 0 ? (
                        <div className={styles.section}>
                            <h2>No Active Voting Sessions</h2>
                            <p style={{ color: 'var(--text-secondary)' }}>
                                There are currently no rides open for voting.
                                {!isAdmin && " Check back later!"}
                            </p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                            {activeRides.map(ride => {
                                // Calculate votes with optimistic updates
                                const rideVotes = votes.filter(v => v.rideId === ride.id);
                                let currentMemberVote = rideVotes.find(v => v.memberId === currentUser.id);

                                // Check for optimistic vote
                                const optVote = optimisticVotes[ride.id];
                                if (optVote && optVote.memberId === currentUser.id) {
                                    // Override current member vote
                                    currentMemberVote = {
                                        id: 'optimistic',
                                        rideId: ride.id,
                                        memberId: currentUser.id,
                                        traceId: optVote.traceId
                                    };
                                }

                                const voteCounts = rideVotes.reduce((acc, vote) => {
                                    // If this is the current user's old vote and we have a new optimistic vote, ignore it
                                    if (optVote && vote.memberId === currentUser.id) return acc;

                                    acc[vote.traceId] = (acc[vote.traceId] || 0) + 1;
                                    return acc;
                                }, {} as Record<string, number>);

                                // Add optimistic vote to counts
                                if (optVote) {
                                    voteCounts[optVote.traceId] = (voteCounts[optVote.traceId] || 0) + 1;
                                }

                                const isVoting = votingRideIds.includes(ride.id);

                                return (
                                    <div key={ride.id} className={styles.section}>
                                        <div className={styles.statusHeader}>
                                            <h2>Vote for Saturday {ride.date}</h2>
                                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                                <span className={styles.statusTag}>{ride.status}</span>
                                            </div>
                                        </div>

                                        <div className={styles.candidatesGrid}>
                                            {ride.candidateTraceIds.map(traceId => {
                                                const trace = traces.find(t => t.id === traceId);
                                                if (!trace) return null;

                                                const isVoted = currentMemberVote?.traceId === traceId;
                                                const voteCount = voteCounts[traceId] || 0;

                                                return (
                                                    <div key={traceId} className={`${styles.candidateCard} ${isVoted ? styles.voted : ''}`} style={{ opacity: (isVoting && !isVoted) ? 0.5 : 1 }}>
                                                        {isVoted && <div className={styles.votedBadge}>Your Vote</div>}
                                                        <h3>{trace.name}</h3>
                                                        <div className={styles.traceStats}>
                                                            <span>{trace.distance}km</span>
                                                            <span>{trace.elevation}m</span>
                                                            <span>{voteCount} votes</span>
                                                        </div>
                                                        <button
                                                            className={isVoted ? styles.btnSecondary : styles.btnPrimary}
                                                            onClick={() => handleVote(ride.id, traceId)}
                                                            disabled={isVoting || isVoted}
                                                            style={{ cursor: isVoted ? 'default' : (isVoting ? 'wait' : 'pointer') }}
                                                        >
                                                            {isVoted ? 'Voted' : 'Vote'}
                                                        </button>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
