'use client';

import { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import Link from 'next/link';
import { Member, SaturdayRide, Trace, Vote } from '../../../types';
import { submitVoteAction } from '../../../actions';
import { CheckCircleIcon, ArrowDownTrayIcon, ArrowRightIcon } from '@heroicons/react/20/solid';
import TraceCard from '../../traces/components/TraceCard';

interface Props {
    traces: Trace[];
    members: Member[];
    activeRides: SaturdayRide[];
    votes: Vote[];
}

function classNames(...classes: string[]) {
    return classes.filter(Boolean).join(' ')
}

export default function SaturdayRideView({ traces, members, activeRides, votes }: Props) {
    const { user, isAuthenticated } = useAuth();
    const [votingRideIds, setVotingRideIds] = useState<string[]>([]);
    const [optimisticVotes, setOptimisticVotes] = useState<Record<string, { traceId: string, memberId: string }>>({});

    const currentUser = user ? members.find(m => m.id === user.id) : null;
    const isAdmin = currentUser?.role.includes('President') || currentUser?.role.includes('Admin');

    const handleVote = async (rideId: string, traceId: string) => {
        if (!currentUser || votingRideIds.includes(rideId)) return;

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
            if (previousOptimistic) {
                setOptimisticVotes(prev => ({ ...prev, [rideId]: previousOptimistic }));
            } else {
                setOptimisticVotes(prev => {
                    const newState = { ...prev };
                    delete newState[rideId];
                    return newState;
                });
            }
            alert('Impossible de soumettre le vote. Veuillez réessayer.');
        } finally {
            setVotingRideIds(prev => prev.filter(id => id !== rideId));
        }
    };

    return (
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
            <div className="flex items-baseline justify-between border-b border-gray-200 pb-6 pt-24 mb-8">
                <h1 className="text-4xl font-bold tracking-tight text-gray-900">
                    Choix de la Sortie Samedi
                </h1>
            </div>

            {!isAuthenticated && (
                <div className="rounded-md bg-white p-12 text-center shadow">
                    <h3 className="mt-2 text-sm font-semibold text-gray-900">Connexion Requise</h3>
                    <p className="mt-1 text-sm text-gray-500">Veuillez vous connecter pour participer au vote.</p>
                    <div className="mt-6">
                        <Link
                            href="/login"
                            className="inline-flex items-center rounded-md bg-brand-primary px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
                        >
                            Se connecter pour voter
                        </Link>
                    </div>
                </div>
            )}

            {currentUser && (
                <>
                    {activeRides.length === 0 ? (
                        <div className="text-center py-12 bg-white rounded-lg shadow">
                            <h3 className="mt-2 text-sm font-semibold text-gray-900">Aucune session de vote active</h3>
                            <p className="mt-1 text-sm text-gray-500">
                                Il n&apos;y a actuellement aucune sortie ouverte au vote.
                                {!isAdmin && " Revenez plus tard !"}
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-8">
                            {activeRides.map(ride => {
                                const rideVotes = votes.filter(v => v.rideId === ride.id);
                                let currentMemberVote = rideVotes.find(v => v.memberId === currentUser.id);

                                const optVote = optimisticVotes[ride.id];
                                if (optVote && optVote.memberId === currentUser.id) {
                                    currentMemberVote = {
                                        id: 'optimistic',
                                        rideId: ride.id,
                                        memberId: currentUser.id,
                                        traceId: optVote.traceId
                                    };
                                }

                                const voteCounts = rideVotes.reduce((acc, vote) => {
                                    if (optVote && vote.memberId === currentUser.id) return acc;
                                    acc[vote.traceId] = (acc[vote.traceId] || 0) + 1;
                                    return acc;
                                }, {} as Record<string, number>);

                                if (optVote) {
                                    voteCounts[optVote.traceId] = (voteCounts[optVote.traceId] || 0) + 1;
                                }

                                const isVoting = votingRideIds.includes(ride.id);

                                return (
                                    <div key={ride.id}>
                                        <div className="mb-4 flex items-center gap-4">
                                            <h2 className="text-xl font-bold text-gray-900">Vote pour le Samedi {ride.date}</h2>
                                            <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                                                {ride.status}
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                            {ride.candidateTraceIds.map(traceId => {
                                                const trace = traces.find(t => t.id === traceId);
                                                if (!trace) return null;

                                                const isVoted = currentMemberVote?.traceId === traceId;
                                                const voteCount = voteCounts[traceId] || 0;

                                                return (

                                                    <div key={traceId}>
                                                        <TraceCard
                                                            trace={trace}
                                                            className={classNames(
                                                                isVoted ? 'ring-2 ring-brand-primary' : 'hover:shadow-lg',
                                                                isVoting && !isVoted ? 'opacity-50' : ''
                                                            )}
                                                            footer={
                                                                <div className="relative z-10 border-t border-gray-100 bg-gray-50 px-4 py-4 sm:px-6 flex flex-col gap-2">
                                                                    <div className="flex rounded-md shadow-sm">
                                                                        <Link
                                                                            href={`/traces/${trace.id}`}
                                                                            target="_blank"
                                                                            className="relative -mr-px inline-flex w-0 flex-1 items-center justify-center gap-x-2 rounded-l-md border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-50 focus:z-10 focus:outline-none focus:ring-1 focus:ring-inset focus:ring-brand-primary"
                                                                        >
                                                                            Détails <ArrowRightIcon className="h-4 w-4" />
                                                                        </Link>
                                                                        {trace.gpxUrl && (
                                                                            <a
                                                                                href={trace.gpxUrl}
                                                                                target="_blank"
                                                                                rel="noopener noreferrer"
                                                                                className="relative -ml-px inline-flex w-0 flex-1 items-center justify-center gap-x-2 rounded-r-md border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-50 focus:z-10 focus:outline-none focus:ring-1 focus:ring-inset focus:ring-brand-primary"
                                                                            >
                                                                                GPX <ArrowDownTrayIcon className="h-4 w-4" />
                                                                            </a>
                                                                        )}
                                                                    </div>
                                                                    <button
                                                                        onClick={() => handleVote(ride.id, traceId)}
                                                                        disabled={isVoting || isVoted}
                                                                        className={classNames(
                                                                            isVoted
                                                                                ? 'bg-gray-100 text-gray-400'
                                                                                : 'bg-brand-primary text-white hover:bg-red-700',
                                                                            'inline-flex w-full items-center justify-center rounded-md px-3 py-2 text-sm font-semibold shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary disabled:cursor-not-allowed'
                                                                        )}
                                                                    >
                                                                        {isVoted ? 'Voté' : 'Voter'}
                                                                    </button>
                                                                </div>
                                                            }
                                                            imageOverlay={
                                                                <>
                                                                    {isVoted && (
                                                                        <div className="absolute top-2 left-2">
                                                                            <span className="inline-flex items-center gap-1 rounded-full bg-brand-primary px-2 py-1 text-xs font-medium text-white shadow-sm ring-1 ring-inset ring-red-600/10">
                                                                                <CheckCircleIcon className="h-3 w-3" /> Votre Vote
                                                                            </span>
                                                                        </div>
                                                                    )}
                                                                    {voteCount > 0 && (
                                                                        <div className="absolute bottom-2 left-2">
                                                                            <span className="inline-flex items-center gap-1 rounded-full bg-black/60 px-2 py-1 text-xs font-medium text-white backdrop-blur-sm">
                                                                                {voteCount} vote{voteCount !== 1 ? 's' : ''}
                                                                            </span>
                                                                        </div>
                                                                    )}
                                                                </>
                                                            }
                                                        />
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )
                    }
                </>
            )}
        </div>
    );
}
