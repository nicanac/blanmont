import { CalendarEvent } from '../../types';
import {
  isMockMode,
  useNotionFallback,
  getFirebaseDatabase,
  ref,
  get,
  set,
  update,
  remove,
  snapshotToArray,
} from './client';
// Admin SDK for server-side access (bypasses security rules)
import { getAdminDatabase } from './admin';

// Notion fallback import
import { getCalendarEvents as getNotionCalendarEvents } from '../notion/calendar';

/**
 * Fetches all calendar events.
 */
export const getCalendarEvents = async (): Promise<CalendarEvent[]> => {
  // Fallback to Notion if Firebase not configured
  if (isMockMode) {
    if (useNotionFallback) {
      return getNotionCalendarEvents();
    }
    console.warn('Firebase not configured, falling back to mock.');
    return [];
  }

  try {
    let snapshot;

    // Use Admin SDK on server side to bypass rules
    if (typeof window === 'undefined') {
      const db = getAdminDatabase();
      snapshot = await db.ref('calendar-events').once('value');
    } else {
      const db = getFirebaseDatabase();
      const eventsRef = ref(db, 'calendar-events');
      snapshot = await get(eventsRef);
    }

    if (!snapshot.exists()) return [];

    const events = snapshotToArray<CalendarEvent>(snapshot);

    // Sort by date
    return events.sort((a, b) => a.isoDate.localeCompare(b.isoDate));
  } catch (error) {
    console.error('Failed to fetch calendar events:', error);
    return [];
  }
};

/**
 * Creates a new calendar event.
 */
export const createCalendarEvent = async (
  eventData: Omit<CalendarEvent, 'id'>
): Promise<{ success: boolean; id?: string; error?: string }> => {
  if (isMockMode) {
    console.log('Mock create calendar event:', eventData);
    return { success: true, id: 'mock-event-id' };
  }

  try {
    const newId = `event_${Date.now()}`;
    const dataToSave = {
      ...eventData,
      createdAt: new Date().toISOString(),
    };

    if (typeof window === 'undefined') {
      const db = getAdminDatabase();
      await db.ref(`calendar-events/${newId}`).set(dataToSave);
    } else {
      const db = getFirebaseDatabase();
      const eventRef = ref(db, `calendar-events/${newId}`);
      await set(eventRef, dataToSave);
    }

    return { success: true, id: newId };
  } catch (error) {
    console.error('Failed to create calendar event:', error);
    return { success: false, error: String(error) };
  }
};

/**
 * Updates a calendar event.
 */
export const updateCalendarEvent = async (
  eventId: string,
  eventData: Partial<CalendarEvent>
): Promise<{ success: boolean; error?: string }> => {
  if (isMockMode) {
    console.log('Mock update calendar event:', { eventId, eventData });
    return { success: true };
  }

  try {
    if (typeof window === 'undefined') {
      const db = getAdminDatabase();
      await db.ref(`calendar-events/${eventId}`).update({
        ...eventData,
        updatedAt: new Date().toISOString(),
      });
    } else {
      const db = getFirebaseDatabase();
      const eventRef = ref(db, `calendar-events/${eventId}`);
      await update(eventRef, {
        ...eventData,
        updatedAt: new Date().toISOString(),
      });
    }

    return { success: true };
  } catch (error) {
    console.error('Failed to update calendar event:', error);
    return { success: false, error: String(error) };
  }
};

/**
 * Deletes a calendar event.
 */
export const deleteCalendarEvent = async (
  eventId: string
): Promise<{ success: boolean; error?: string }> => {
  if (isMockMode) {
    console.log('Mock delete calendar event:', eventId);
    return { success: true };
  }

  try {
    if (typeof window === 'undefined') {
      const db = getAdminDatabase();
      await db.ref(`calendar-events/${eventId}`).remove();
    } else {
      const db = getFirebaseDatabase();
      const eventRef = ref(db, `calendar-events/${eventId}`);
      await remove(eventRef);
    }

    return { success: true };
  } catch (error) {
    console.error('Failed to delete calendar event:', error);
    return { success: false, error: String(error) };
  }
};

export interface ScheduledRideInfo {
  isoDate: string;
  dateFormatted: string;
  location: string;
  departure: string;
  distances?: string;
  address?: string;
  remarks?: string;
  gpxUrl?: string;
  group?: string;
  isCustomEvent: boolean;
}

/**
 * Calculates the next upcoming scheduled ride (prioritizing the next Saturday/Sunday).
 */
export function getNextScheduledRide(events: CalendarEvent[]): ScheduledRideInfo {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const todayIso = `${y}-${m}-${d}`;

  const currentDay = now.getDay(); // 0 = Sun, 1 = Mon, ..., 6 = Sat
  const daysUntilSaturday = (6 - currentDay + 7) % 7;
  const nextSaturdayDate = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + daysUntilSaturday
  );
  const nextSatIso = `${nextSaturdayDate.getFullYear()}-${String(nextSaturdayDate.getMonth() + 1).padStart(2, '0')}-${String(nextSaturdayDate.getDate()).padStart(2, '0')}`;

  const nextSundayDate = new Date(
    nextSaturdayDate.getFullYear(),
    nextSaturdayDate.getMonth(),
    nextSaturdayDate.getDate() + 1
  );
  const nextSunIso = `${nextSundayDate.getFullYear()}-${String(nextSundayDate.getMonth() + 1).padStart(2, '0')}-${String(nextSundayDate.getDate()).padStart(2, '0')}`;

  // Helper to format ISO date to readable French (e.g., "Samedi 29 août")
  const formatFrenchDate = (iso: string): string => {
    const [yr, mo, dy] = iso.split('-');
    const dateObj = new Date(Number(yr), Number(mo) - 1, Number(dy));
    const formatted = dateObj.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  };

  const formatDistances = (dist?: string): string | undefined => {
    if (!dist) return undefined;
    return dist.toLowerCase().includes('km') ? dist : `${dist} km`;
  };

  // 1. Exact match on next Saturday
  const satEvent = events.find((e) => e.isoDate === nextSatIso);
  if (satEvent) {
    return {
      isoDate: satEvent.isoDate,
      dateFormatted: formatFrenchDate(satEvent.isoDate),
      location: satEvent.location || 'Place de Blanmont',
      departure: satEvent.departure || '8h30',
      distances: formatDistances(satEvent.distances),
      address: satEvent.address,
      remarks: satEvent.remarks,
      gpxUrl: satEvent.gpxUrl,
      group: satEvent.group,
      isCustomEvent: true,
    };
  }

  // 2. Exact match on next Sunday (if no Saturday event)
  const sunEvent = events.find((e) => e.isoDate === nextSunIso);
  if (sunEvent) {
    return {
      isoDate: sunEvent.isoDate,
      dateFormatted: formatFrenchDate(sunEvent.isoDate),
      location: sunEvent.location || 'Place de Blanmont',
      departure: sunEvent.departure || '8h30',
      distances: formatDistances(sunEvent.distances),
      address: sunEvent.address,
      remarks: sunEvent.remarks,
      gpxUrl: sunEvent.gpxUrl,
      group: sunEvent.group,
      isCustomEvent: true,
    };
  }

  // 3. Closest future event >= today
  const futureEvents = events
    .filter((e) => e.isoDate >= todayIso)
    .sort((a, b) => a.isoDate.localeCompare(b.isoDate));
  if (futureEvents.length > 0) {
    const nextEvent = futureEvents[0];
    return {
      isoDate: nextEvent.isoDate,
      dateFormatted: formatFrenchDate(nextEvent.isoDate),
      location: nextEvent.location || 'Place de Blanmont',
      departure: nextEvent.departure || '8h30',
      distances: formatDistances(nextEvent.distances),
      address: nextEvent.address,
      remarks: nextEvent.remarks,
      gpxUrl: nextEvent.gpxUrl,
      group: nextEvent.group,
      isCustomEvent: true,
    };
  }

  // 4. Default weekly club ride at Blanmont
  return {
    isoDate: nextSatIso,
    dateFormatted: formatFrenchDate(nextSatIso),
    location: 'Place de Blanmont (Chastre)',
    departure: '8h30',
    distances: 'Groupes A, B, C & VTT',
    isCustomEvent: false,
  };
}

