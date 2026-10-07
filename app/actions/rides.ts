'use server';

import { revalidatePath } from 'next/cache';
import { createRide, submitVote } from '../lib/firebase';
import { CreateRideSchema, SubmitVoteSchema, safeValidate } from '../lib/validation';
import { requireAdminSession, getSessionUser } from '../lib/auth/session';

/**
 * Server Action to propose a new Saturday Ride.
 *
 * @param date - The date of the ride.
 * @param traceIds - The list of candidate traces.
 */
export async function createRideAction(date: string, traceIds: string[]) {
  await requireAdminSession();
  const validation = safeValidate(CreateRideSchema, { date, traceIds });

  if (!validation.success) {
    throw new Error(
      `Validation failed: ${validation.errors.map((e) => `${e.field}: ${e.message}`).join(', ')}`
    );
  }

  await createRide(validation.data.date, validation.data.traceIds);
  revalidatePath('/saturday-ride');
}

/**
 * Server Action to submit a member's vote for a ride.
 *
 * @param rideId - The ride ID.
 * @param memberId - The member ID.
 * @param traceId - The selected trace ID.
 */
export async function submitVoteAction(rideId: string, memberId: string, traceId: string) {
  const session = await getSessionUser();
  if (session && session.id !== memberId && !session.isAdmin) {
    throw new Error('Action non autorisée pour ce membre.');
  }

  const validation = safeValidate(SubmitVoteSchema, { rideId, memberId, traceId });

  if (!validation.success) {
    throw new Error(
      `Validation failed: ${validation.errors.map((e) => `${e.field}: ${e.message}`).join(', ')}`
    );
  }

  await submitVote(validation.data.rideId, validation.data.memberId, validation.data.traceId);
  revalidatePath('/saturday-ride');
}
