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
