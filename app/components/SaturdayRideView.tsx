'use client';

import { useState } from 'react';
import { Member, SaturdayRide, Trace, Vote } from '../types';
import { submitVoteAction } from '../actions';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import ButtonGroup from '@mui/material/ButtonGroup';

interface Props {
    traces: Trace[];
    members: Member[];
    activeRides: SaturdayRide[];
    votes: Vote[];
}

/**
 * Component for displaying active Saturday Rides and handling member voting.
 * Implements optimistic UI updates for instant voting feedback.
 * 
 * @param traces - List of all available traces (for reference).
 * @param members - List of all club members (for user selection/auth simulation).
 * @param activeRides - List of rides currently open for voting.
 * @param votes - List of all current votes fetched from the server.
 */
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
        }
    };

    return (
        <Box sx={{ maxWidth: 1000, mx: 'auto', p: 2 }}>
            <Paper elevation={0} sx={{ p: 3, mb: 4, bgcolor: 'background.paper', borderRadius: 2 }}>
                <Stack direction={{ xs: 'column', md: 'row' }} alignItems="center" justifyContent="space-between" spacing={2}>
                    <Typography variant="h4" component="h1" fontWeight="bold">
                        Saturday Ride Selection
                    </Typography>
                    <Box sx={{ minWidth: 250 }}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Viewing as</InputLabel>
                            <Select
                                value={currentUser?.id || ''}
                                label="Viewing as"
                                onChange={(e) => handleUserChange(e.target.value)}
                            >
                                <MenuItem value="">Select User...</MenuItem>
                                {members.map(m => (
                                    <MenuItem key={m.id} value={m.id}>
                                        {m.name} {(m.role.includes('President') || m.role.includes('Admin')) ? '(Admin)' : ''}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Box>
                </Stack>
            </Paper>

            {!currentUser && (
                <Paper sx={{ p: 6, textAlign: 'center', bgcolor: 'transparent', border: '1px dashed rgba(255,255,255,0.2)' }}>
                    <Typography color="text.secondary">Please select a user above to continue.</Typography>
                </Paper>
            )}

            {currentUser && (
                <>
                    {activeRides.length === 0 ? (
                        <Box sx={{ textAlign: 'center', py: 8 }}>
                            <Typography variant="h5" gutterBottom>No Active Voting Sessions</Typography>
                            <Typography color="text.secondary">
                                There are currently no rides open for voting.
                                {!isAdmin && " Check back later!"}
                            </Typography>
                        </Box>
                    ) : (
                        <Stack spacing={4}>
                            {activeRides.map(ride => {
                                // Calculate votes with optimistic updates
                                const rideVotes = votes.filter(v => v.rideId === ride.id);
                                let currentMemberVote = rideVotes.find(v => v.memberId === currentUser.id);

                                // Check for optimistic vote
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
                                    <Box key={ride.id}>
                                        <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                                            <Typography variant="h5" fontWeight="bold">Vote for Saturday {ride.date}</Typography>
                                            <Chip label={ride.status} color="primary" size="small" />
                                        </Box>

                                        <Grid container spacing={3}>
                                            {ride.candidateTraceIds.map(traceId => {
                                                const trace = traces.find(t => t.id === traceId);
                                                if (!trace) return null;

                                                const isVoted = currentMemberVote?.traceId === traceId;
                                                const voteCount = voteCounts[traceId] || 0;

                                                return (
                                                    <Grid size={{ xs: 12, md: 6 }} key={traceId}>
                                                        <Card
                                                            variant="outlined"
                                                            sx={{
                                                                height: '100%',
                                                                display: 'flex',
                                                                flexDirection: 'column',
                                                                borderColor: isVoted ? 'primary.main' : 'divider',
                                                                borderWidth: isVoted ? 2 : 1,
                                                                opacity: (isVoting && !isVoted) ? 0.5 : 1,
                                                                transition: 'all 0.2s'
                                                            }}
                                                        >
                                                            <CardContent sx={{ flexGrow: 1 }}>
                                                                {isVoted && (
                                                                    <Chip label="Your Vote" color="primary" size="small" sx={{ mb: 1 }} />
                                                                )}
                                                                <Typography variant="h6" gutterBottom fontWeight="bold">
                                                                    {trace.name}
                                                                </Typography>

                                                                <Stack direction="row" spacing={2} sx={{ mb: 2, color: 'text.secondary', fontSize: '0.9rem' }}>
                                                                    <span>{trace.distance}km</span>
                                                                    <span>{trace.elevation}m</span>
                                                                    {trace.direction && <span>{trace.direction}</span>}
                                                                    <span style={{ color: 'white', fontWeight: 'bold' }}>{voteCount} votes</span>
                                                                </Stack>
                                                            </CardContent>

                                                            <CardActions sx={{ p: 2, pt: 0, flexDirection: 'column', gap: 1 }}>
                                                                <ButtonGroup fullWidth variant="outlined" size="small">
                                                                    <Button
                                                                        component="a"
                                                                        href={`/traces/${trace.id}`}
                                                                        target="_blank"
                                                                    >
                                                                        Details
                                                                    </Button>
                                                                    {trace.gpxUrl && (
                                                                        <Button
                                                                            component="a"
                                                                            href={trace.gpxUrl}
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                        >
                                                                            GPX
                                                                        </Button>
                                                                    )}
                                                                </ButtonGroup>

                                                                <Button
                                                                    variant="contained"
                                                                    fullWidth
                                                                    onClick={() => handleVote(ride.id, traceId)}
                                                                    disabled={isVoting || isVoted}
                                                                    color={isVoted ? "inherit" : "primary"}
                                                                    sx={{
                                                                        bgcolor: isVoted ? 'action.disabledBackground' : 'primary.main',
                                                                        color: isVoted ? 'text.disabled' : 'white'
                                                                    }}
                                                                >
                                                                    {isVoted ? 'Voted' : 'Vote'}
                                                                </Button>
                                                            </CardActions>
                                                        </Card>
                                                    </Grid>
                                                );
                                            })}
                                        </Grid>
                                    </Box>
                                );
                            })}
                        </Stack>
                    )}
                </>
            )}
        </Box>
    );
}


