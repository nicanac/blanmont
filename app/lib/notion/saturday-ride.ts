import { SaturdayRide, Vote, NotionPage } from '../../types';
import { isMockMode, SATURDAY_RIDE_DB_ID, VOTES_DB_ID, cleanId, notionRequest } from './client';
import { logger } from '../logger';

export const getActiveRides = async (): Promise<SaturdayRide[]> => {
    if (isMockMode || !SATURDAY_RIDE_DB_ID) {
        if (isMockMode) return [{ id: 'mock-ride', date: '2024-05-18', candidateTraceIds: ['1'], status: 'Voting' }] as any;
        return [];
    }

    try {
        const dbId = cleanId(SATURDAY_RIDE_DB_ID);
        const response = await notionRequest(`databases/${dbId}/query`, 'POST', {
             sorts: [{ property: 'Date', direction: 'ascending' }],
        });

        const activeRides = response.results
            .map((page: NotionPage) => {
                const props = page.properties;
                const candidates = props.Candidates?.relation?.map((r: { id: string }) => r.id) || [];
                const selected = props['Selected Trace']?.relation?.[0]?.id;

                return {
                    id: page.id,
                    date: props.Date?.date?.start || '',
                    candidateTraceIds: candidates,
                    selectedTraceId: selected,
                    status: props.Status?.status?.name || props.Status?.select?.name || 'Draft'
                };
            })
            .filter((ride: SaturdayRide) => ride.status === 'Voting');

        return activeRides;

    } catch (e) {
        logger.error('Failed to get active rides:', e);
        return [];
    }
};

export const createRide = async (date: string, traceIds: string[]) => {
    if (isMockMode || !SATURDAY_RIDE_DB_ID) return;

    try {
        const dbId = cleanId(SATURDAY_RIDE_DB_ID);
        await notionRequest('pages', 'POST', {
            parent: { database_id: dbId },
            properties: {
                Name: { title: [{ text: { content: `Ride ${date}` } }] },
                Date: { date: { start: date } },
                Candidates: { relation: traceIds.map(id => ({ id })) },
                Status: { status: { name: 'Voting' } }
            }
        });
    } catch (e) {
        logger.error('Failed to create ride:', e);
        throw e;
    }
};

export const getVotes = async (rideId: string): Promise<Vote[]> => {
    if (isMockMode || !VOTES_DB_ID) return [];

    try {
        const dbId = cleanId(VOTES_DB_ID);
        const response = await notionRequest(`databases/${dbId}/query`, 'POST', {
            filter: {
                property: 'Ride',
                relation: { contains: rideId }
            }
        });

        return response.results.map((page: any) => ({
            id: page.id,
            rideId: rideId,
            memberId: page.properties.Member?.relation?.[0]?.id || '',
            traceId: page.properties.Trace?.relation?.[0]?.id || ''
        }));
    } catch (e) {
        logger.error('Failed to get votes:', e);
        return [];
    }
};

export const submitVote = async (rideId: string, memberId: string, traceId: string) => {
    if (isMockMode || !VOTES_DB_ID) return;

    try {
        // Check if member already voted for this ride
        const votes = await getVotes(rideId);
        const existingVote = votes.find(v => v.memberId === memberId);

        if (existingVote) {
             // Update existing vote
             await notionRequest(`pages/${existingVote.id}`, 'PATCH', {
                 properties: {
                     Trace: { relation: [{ id: traceId }] }
                 }
             });
        } else {
            // Create new vote
            const dbId = cleanId(VOTES_DB_ID);
            await notionRequest('pages', 'POST', {
                parent: { database_id: dbId },
                properties: {
                    Ride: { relation: [{ id: rideId }] },
                    Member: { relation: [{ id: memberId }] },
                    Trace: { relation: [{ id: traceId }] }
                }
            });
        }
    } catch (e) {
        logger.error('Failed to submit vote:', e);
        throw e;
    }
};
