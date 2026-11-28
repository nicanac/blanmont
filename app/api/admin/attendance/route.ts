import { NextRequest, NextResponse } from 'next/server';
import type { Database } from 'firebase-admin/database';
import { getAdminDatabase } from '@/app/lib/firebase/admin';
import { getMembers } from '@/app/lib/firebase/members';
import { calculateMemberCarres, parseDateInfo } from '@/app/lib/carreVert';
import { verifySectionRequest } from '@/app/lib/auth/admin-access';
import { recordActivity } from '@/app/lib/logging/activityLogger';
import { pollRespondentsForRide } from '@/app/lib/poll-attendance-loader';
import {
  pollPrefillCandidates,
  prefilledMemberIds,
  type PollPrefillRecord,
} from '@/app/lib/poll-attendance';
import { RecordIdSchema } from '@/app/lib/validation';
import type { AttendanceMember } from '@/app/lib/firebase/attendance';
import type { SessionUser } from '@/app/lib/auth/session';

/**
 * GET /api/admin/attendance?eventId=xxx
 * Fetch attendance for a specific event, or all attendance if no eventId.
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const authCheck = await verifySectionRequest(request, 'pointage-express');
  if (!authCheck.authorized) {
    return authCheck.response;
  }

  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('eventId');
    const db = getAdminDatabase();

    if (eventId) {
      const snapshot = await db.ref(`attendance/${eventId}`).once('value');
      if (!snapshot.exists()) {
        return NextResponse.json({ members: {} });
      }
      return NextResponse.json({ eventId, ...snapshot.val() });
    }

    // Return all attendance
    const snapshot = await db.ref('attendance').once('value');
    if (!snapshot.exists()) {
      return NextResponse.json({});
    }
    return NextResponse.json(snapshot.val());
  } catch (error) {
    console.error('Error fetching attendance:', error);
    return NextResponse.json({ error: 'Failed to fetch attendance' }, { status: 500 });
  }
}

/** Adds the ride's day to a member's leaderboard entry (Carré Vert), when they have one. */
async function addLeaderboardDate(db: Database, memberId: string, isoDate: string): Promise<void> {
  try {
    const memberSnap = await db.ref(`leaderboard/${memberId}`).once('value');
    if (!memberSnap.exists()) return;
    const memberData = memberSnap.val() || {};
    const currentDates: string[] = Array.isArray(memberData.dates) ? memberData.dates : [];
    const dateInfo = parseDateInfo(isoDate);
    if (!dateInfo) return;

    const dateStrWithYear = `${String(dateInfo.day).padStart(2, '0')}/${String(dateInfo.month).padStart(2, '0')}/${dateInfo.year}`;
    const alreadyHasDate = currentDates.some((d) => {
      const info = parseDateInfo(d);
      return info && info.isoDate === dateInfo.isoDate;
    });
    if (alreadyHasDate) return;

    const updatedDates = [...currentDates, dateStrWithYear];
    await db.ref(`leaderboard/${memberId}`).update({
      dates: updatedDates,
      rides: calculateMemberCarres(updatedDates).carres,
      updatedAt: new Date().toISOString(),
    });
  } catch (leaderboardError) {
    console.warn('Could not update leaderboard for member:', memberId, leaderboardError);
  }
}

/** Removes the ride's day from a member's leaderboard entry, when they have one. */
async function removeLeaderboardDate(db: Database, memberId: string, isoDate: string): Promise<void> {
  try {
    const memberSnap = await db.ref(`leaderboard/${memberId}`).once('value');
    if (!memberSnap.exists()) return;
    const memberData = memberSnap.val() || {};
    const currentDates: string[] = Array.isArray(memberData.dates) ? memberData.dates : [];
    const dateInfo = parseDateInfo(isoDate);
    if (!dateInfo) return;

    const updatedDates = currentDates.filter((d) => {
      const info = parseDateInfo(d);
      return !info || info.isoDate !== dateInfo.isoDate;
    });
    await db.ref(`leaderboard/${memberId}`).update({
      dates: updatedDates,
      rides: calculateMemberCarres(updatedDates).carres,
      updatedAt: new Date().toISOString(),
    });
  } catch (leaderboardError) {
    console.warn('Could not update leaderboard for member:', memberId, leaderboardError);
  }
}

const activityUser = (
  user: SessionUser
): {
  isAuthenticated: true;
  userId: SessionUser['id'];
  userName: SessionUser['name'];
  userEmail: SessionUser['email'];
  role: SessionUser['role'];
} => ({
  isAuthenticated: true,
  userId: user.id,
  userName: user.name,
  userEmail: user.email,
  role: user.role,
});

/**
 * Ticks the members who answered the weekend poll that they ride on the event's day
 * (app/lib/poll-attendance). Only members not present yet and never ticked by the poll before:
 * a member the captain unticked stays unticked. `onlyIfFirst` (the automatic pre-check on the
 * ride's day) does nothing once the poll has pre-checked this ride, even from another phone.
 * Answers the members ticked, every member the poll ticked so far, and the ride's attendance.
 */
async function prefillFromPoll(
  db: Database,
  user: SessionUser,
  eventId: string,
  onlyIfFirst: boolean
): Promise<NextResponse> {
  const eventSnap = await db.ref(`calendar-events/${eventId}`).once('value');
  const isoDate: unknown = eventSnap.exists() ? eventSnap.val()?.isoDate : undefined;
  if (typeof isoDate !== 'string' || !isoDate) {
    return NextResponse.json({ error: 'Sortie introuvable' }, { status: 404 });
  }

  const attendanceRef = db.ref(`attendance/${eventId}`);
  const [respondents, members, attendanceSnap] = await Promise.all([
    pollRespondentsForRide(isoDate),
    getMembers(),
    attendanceRef.once('value'),
  ]);
  const attendance = (attendanceSnap.val() ?? {}) as {
    members?: Record<string, AttendanceMember>;
    pollPrefill?: PollPrefillRecord;
  };
  const present = Object.keys(attendance.members ?? {});
  const membersById = new Map(members.map((m) => [m.id, m]));
  // Only club members the roster shows (a deleted member's old answer is skipped).
  const candidates = pollPrefillCandidates(
    respondents.filter((r) => membersById.has(r.memberId)),
    present,
    prefilledMemberIds(attendance.pollPrefill)
  );

  // Claim the members on the marker first: two phones pre-checking at once tick each member once.
  let claimed: string[] = [];
  const now = new Date().toISOString();
  const result = await attendanceRef.child('pollPrefill').transaction((current: PollPrefillRecord | null) => {
    if (onlyIfFirst && current) return undefined; // already pre-checked: abort
    const seen = current?.memberIds ?? {};
    claimed = candidates.filter((id) => !seen[id]);
    if (claimed.length === 0) return undefined; // nothing new: abort, write nothing
    return {
      at: now,
      by: user.name || user.email || 'Admin',
      memberIds: { ...seen, ...Object.fromEntries(claimed.map((id) => [id, true])) },
    };
  });
  const record = (result.snapshot.val() ?? null) as PollPrefillRecord | null;
  if (!result.committed) claimed = [];

  const byId = new Map(respondents.map((r) => [r.memberId, r]));
  const added: AttendanceMember[] = claimed.map((memberId) => {
    const member = membersById.get(memberId);
    const respondent = byId.get(memberId);
    return {
      memberId,
      name: member?.name || respondent?.name || memberId,
      // The group answered for this weekend, else the member's usual group (as a manual tick).
      group: respondent?.group || member?.preferredGroup || 'B',
      markedAt: now,
    };
  });

  if (added.length > 0) {
    await attendanceRef.update({
      isoDate,
      updatedAt: now,
      ...Object.fromEntries(added.map((m) => [`members/${m.memberId}`, m])),
    });
    await Promise.all(added.map((m) => addLeaderboardDate(db, m.memberId, isoDate)));
    await recordActivity({
      category: 'admin',
      action: 'admin:attendance_prefilled',
      title: `Pointage pré-coché depuis le sondage : ${added.length} membre${added.length > 1 ? 's' : ''}`,
      severity: 'info',
      user: activityUser(user),
      metadata: { eventId, isoDate, memberIds: claimed, auto: onlyIfFirst },
    }).catch(() => {});
  }

  const membersNow = { ...(attendance.members ?? {}), ...Object.fromEntries(added.map((m) => [m.memberId, m])) };
  return NextResponse.json({
    success: true,
    added,
    prefilled: prefilledMemberIds(record),
    members: membersNow,
  });
}

/**
 * Unticks members the poll pre-checked (the "Annuler" of the pre-check toast). They leave the
 * marker too, so the "Cocher les répondants" button offers them again; the marker itself stays,
 * so the automatic pre-check does not come back.
 */
async function undoPollPrefill(
  db: Database,
  user: SessionUser,
  eventId: string,
  memberIds: string[]
): Promise<NextResponse> {
  const attendanceRef = db.ref(`attendance/${eventId}`);
  const snapshot = await attendanceRef.once('value');
  const attendance = (snapshot.val() ?? {}) as { isoDate?: string; pollPrefill?: PollPrefillRecord };
  const prefilled = new Set(prefilledMemberIds(attendance.pollPrefill));
  // Only members the poll ticked: a tick made by hand is never undone here.
  const removed = [...new Set(memberIds)].filter((id) => prefilled.has(id));

  if (removed.length > 0) {
    await attendanceRef.update({
      updatedAt: new Date().toISOString(),
      ...Object.fromEntries(removed.flatMap((id) => [[`members/${id}`, null], [`pollPrefill/memberIds/${id}`, null]])),
    });
    if (attendance.isoDate) {
      await Promise.all(removed.map((id) => removeLeaderboardDate(db, id, attendance.isoDate as string)));
    }
    await recordActivity({
      category: 'admin',
      action: 'admin:attendance_prefill_undone',
      title: `Pré-cochage du sondage annulé : ${removed.length} membre${removed.length > 1 ? 's' : ''}`,
      severity: 'info',
      user: activityUser(user),
      metadata: { eventId, memberIds: removed },
    }).catch(() => {});
  }

  return NextResponse.json({
    success: true,
    removed,
    prefilled: [...prefilled].filter((id) => !removed.includes(id)),
  });
}

/**
 * POST /api/admin/attendance
 * Body: { eventId, isoDate, memberId, name, group, action: 'add' | 'remove' }
 *     | { eventId, action: 'prefill-poll', onlyIfFirst?: boolean }
 *     | { eventId, action: 'undo-prefill', memberIds: string[] }
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const authCheck = await verifySectionRequest(request, 'pointage-express');
  if (!authCheck.authorized) {
    return authCheck.response;
  }

  try {
    const data = await request.json();
    const { eventId, isoDate, memberId, name, group, action } = data;

    if (action === 'prefill-poll' || action === 'undo-prefill') {
      if (!RecordIdSchema.safeParse(eventId).success) {
        return NextResponse.json({ error: 'Identifiant de sortie invalide' }, { status: 400 });
      }
      const db = getAdminDatabase();
      if (action === 'prefill-poll') {
        return await prefillFromPoll(db, authCheck.user, eventId, data.onlyIfFirst === true);
      }
      const ids: unknown = data.memberIds;
      if (!Array.isArray(ids) || ids.length > 500 || !ids.every((id) => RecordIdSchema.safeParse(id).success)) {
        return NextResponse.json({ error: 'Liste de membres invalide' }, { status: 400 });
      }
      return await undoPollPrefill(db, authCheck.user, eventId, ids as string[]);
    }

    if (!eventId || !memberId || !action) {
      return NextResponse.json(
        { error: 'Missing required fields: eventId, memberId, action' },
        { status: 400 }
      );
    }

    const db = getAdminDatabase();

    if (action === 'add') {
      if (!isoDate || !name) {
        return NextResponse.json(
          { error: 'Missing required fields for add: isoDate, name' },
          { status: 400 }
        );
      }

      // Set the isoDate on the attendance record
      await db.ref(`attendance/${eventId}/isoDate`).set(isoDate);

      // Add the member to attendance
      await db.ref(`attendance/${eventId}/members/${memberId}`).set({
        memberId,
        name,
        group: group || '',
        markedAt: new Date().toISOString(),
      });

      await db.ref(`attendance/${eventId}/updatedAt`).set(new Date().toISOString());

      // Also keep leaderboard entry in sync
      await addLeaderboardDate(db, memberId, isoDate);

      await recordActivity({
        category: 'admin',
        action: 'admin:attendance_marked',
        title: `Pointage présence : ${name} (${group ? `Groupe ${group}` : 'Présent'})`,
        severity: 'info',
        user: activityUser(authCheck.user),
        metadata: { eventId, memberId, name, group, isoDate },
      }).catch(() => {});

      return NextResponse.json({ success: true });
    }

    if (action === 'remove') {
      await db.ref(`attendance/${eventId}/members/${memberId}`).remove();
      await db.ref(`attendance/${eventId}/updatedAt`).set(new Date().toISOString());

      // Also keep leaderboard entry in sync. The isoDate comes with the request, else from the record.
      let targetIso = isoDate;
      if (!targetIso) {
        try {
          const eventSnap = await db.ref(`attendance/${eventId}/isoDate`).once('value');
          if (eventSnap.exists()) targetIso = eventSnap.val();
        } catch (lookupError) {
          console.warn('Could not read the attendance date of event:', eventId, lookupError);
        }
      }
      if (targetIso) await removeLeaderboardDate(db, memberId, targetIso);

      await recordActivity({
        category: 'admin',
        action: 'admin:attendance_removed',
        title: `Retrait présence pour membre : ${name || memberId}`,
        severity: 'info',
        user: activityUser(authCheck.user),
        metadata: { eventId, memberId, name, isoDate },
      }).catch(() => {});

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action. Use "add" or "remove".' }, { status: 400 });
  } catch (error) {
    console.error('Error updating attendance:', error);
    return NextResponse.json({ error: 'Failed to update attendance' }, { status: 500 });
  }
}
