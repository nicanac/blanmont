import { isMockMode, getFirebaseDatabase, ref, get, set, remove, snapshotToArray } from './client';
import { getAdminDatabase } from './admin';

/**
 * Represents attendance for a single calendar event.
 * Stored at: attendance/{eventId}
 */
export interface EventAttendance {
  /** The calendar event ID */
  eventId: string;
  /** ISO date of the event (denormalized for querying) */
  isoDate: string;
  /** Map of memberId -> attendance info */
  members: Record<string, AttendanceMember>;
  /** Last updated timestamp */
  updatedAt?: string;
}

export interface AttendanceMember {
  /** Member ID (from leaderboard) */
  memberId: string;
  /** Member display name (denormalized) */
  name: string;
  /** Group (denormalized) */
  group: string;
  /** When this attendance was recorded */
  markedAt: string;
}

/**
 * Fetches attendance for a specific event.
 */
export const getEventAttendance = async (eventId: string): Promise<EventAttendance | null> => {
  if (isMockMode) {
    return null;
  }

  try {
    let snapshot;

    if (typeof window === 'undefined') {
      const db = getAdminDatabase();
      snapshot = await db.ref(`attendance/${eventId}`).once('value');
    } else {
      const db = getFirebaseDatabase();
      const attendanceRef = ref(db, `attendance/${eventId}`);
      snapshot = await get(attendanceRef);
    }

    if (!snapshot.exists()) return null;

    const data = snapshot.val();
    return {
      eventId,
      isoDate: data.isoDate || '',
      members: data.members || {},
      updatedAt: data.updatedAt,
    };
  } catch (error) {
    console.error('Failed to fetch event attendance:', error);
    return null;
  }
};

/**
 * Fetches attendance for all events.
 */
export const getAllAttendance = async (): Promise<EventAttendance[]> => {
  if (isMockMode) {
    return [];
  }

  try {
    let snapshot;

    if (typeof window === 'undefined') {
      const db = getAdminDatabase();
      snapshot = await db.ref('attendance').once('value');
    } else {
      const db = getFirebaseDatabase();
      const attendanceRef = ref(db, 'attendance');
      snapshot = await get(attendanceRef);
    }

    if (!snapshot.exists()) return [];

    const val = snapshot.val() as Record<string, Record<string, unknown>>;
    return Object.entries(val).map(([eventId, data]) => ({
      eventId,
      isoDate: (data.isoDate as string) || '',
      members: (data.members as Record<string, AttendanceMember>) || {},
      updatedAt: data.updatedAt as string | undefined,
    }));
  } catch (error) {
    console.error('Failed to fetch all attendance:', error);
    return [];
  }
};

/**
 * Sets the full attendance for an event (used by admin).
 */
export const setEventAttendance = async (
  eventId: string,
  isoDate: string,
  members: Record<string, AttendanceMember>
): Promise<{ success: boolean; error?: string }> => {
  if (isMockMode) {
    return { success: true };
  }

  try {
    const db = getFirebaseDatabase();
    const attendanceRef = ref(db, `attendance/${eventId}`);

    await set(attendanceRef, {
      isoDate,
      members,
      updatedAt: new Date().toISOString(),
    });

    return { success: true };
  } catch (error) {
    console.error('Failed to set event attendance:', error);
    return { success: false, error: String(error) };
  }
};

/**
 * Adds a single member to an event's attendance.
 */
export const addMemberAttendance = async (
  eventId: string,
  isoDate: string,
  member: AttendanceMember
): Promise<{ success: boolean; error?: string }> => {
  if (isMockMode) {
    return { success: true };
  }

  try {
    const db = getFirebaseDatabase();
    // Ensure the isoDate is set on the attendance record
    const dateRef = ref(db, `attendance/${eventId}/isoDate`);
    await set(dateRef, isoDate);

    const memberRef = ref(db, `attendance/${eventId}/members/${member.memberId}`);
    await set(memberRef, {
      ...member,
      markedAt: new Date().toISOString(),
    });

    const updatedAtRef = ref(db, `attendance/${eventId}/updatedAt`);
    await set(updatedAtRef, new Date().toISOString());

    return { success: true };
  } catch (error) {
    console.error('Failed to add member attendance:', error);
    return { success: false, error: String(error) };
  }
};

/**
 * Removes a single member from an event's attendance.
 */
export const removeMemberAttendance = async (
  eventId: string,
  memberId: string
): Promise<{ success: boolean; error?: string }> => {
  if (isMockMode) {
    return { success: true };
  }

  try {
    const db = getFirebaseDatabase();
    const memberRef = ref(db, `attendance/${eventId}/members/${memberId}`);
    await remove(memberRef);

    const updatedAtRef = ref(db, `attendance/${eventId}/updatedAt`);
    await set(updatedAtRef, new Date().toISOString());

    return { success: true };
  } catch (error) {
    console.error('Failed to remove member attendance:', error);
    return { success: false, error: String(error) };
  }
};
