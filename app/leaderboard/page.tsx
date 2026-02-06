import { getCalendarEvents, getLeaderboardEntries, LeaderboardEntry } from '../lib/firebase';
import { getAllAttendance, EventAttendance } from '../lib/firebase/attendance';
import { CalendarEvent } from '../types';
import LeaderboardView from './LeaderboardView';

export const dynamic = 'force-dynamic';

// Helper to get ISO Week key (YYYY-Www)
function getISOWeekKey(d: Date): string {
    const jan4 = new Date(Date.UTC(d.getUTCFullYear(), 0, 4));
    const startOfWeek = new Date(jan4);
    startOfWeek.setUTCDate(jan4.getUTCDate() - ((jan4.getUTCDay() + 6) % 7));
    const weekNo = Math.ceil(((d.getTime() - startOfWeek.getTime()) / 86400000 + 1) / 7);
    return `${d.getUTCFullYear()}-${weekNo}`;
}

/**
 * Counts the total number of possible rides based on calendar events.
 * 
 * COUNTING RULES:
 * 1. Weekend rides (Saturday + Sunday) count as 1 per week
 *    - If there's an event on Saturday only: counts as 1
 *    - If there's an event on Sunday only: counts as 1
 *    - If there are events on BOTH Saturday AND Sunday of same week: still counts as 1
 * 2. Weekday rides (Monday-Friday) count as 1 each
 * 
 * Only counts events for the given year, up to today if it's the current year.
 */
function getPossibleRidesCount(events: CalendarEvent[], year: number): number {
    if (!events || events.length === 0) return 0;

    const now = new Date();
    const currentYear = now.getFullYear();
    const startOfYearISO = `${year}-01-01`;
    const endISO = year < currentYear ? `${year}-12-31` : now.toISOString().split('T')[0];

    const weekendWeeks = new Set<string>();
    const weekdayDates = new Set<string>();

    events.forEach(event => {
        if (event.isoDate < startOfYearISO || event.isoDate > endISO) {
            return;
        }

        const [y, month, day] = event.isoDate.split('-').map(Number);
        const d = new Date(Date.UTC(y, month - 1, day));
        const dayOfWeek = d.getUTCDay();

        if (dayOfWeek === 0 || dayOfWeek === 6) {
            weekendWeeks.add(getISOWeekKey(d));
        } else {
            weekdayDates.add(event.isoDate);
        }
    });

    return weekendWeeks.size + weekdayDates.size;
}

/**
 * Build a lookup: eventId -> { isoDate, isWeekend, weekKey }
 * Only for events in the given year, up to today if it's the current year.
 */
function buildEventInfoMap(events: CalendarEvent[], year: number): Map<string, { isoDate: string; isWeekend: boolean; weekKey: string }> {
    const now = new Date();
    const currentYear = now.getFullYear();
    const startOfYearISO = `${year}-01-01`;
    const endISO = year < currentYear ? `${year}-12-31` : now.toISOString().split('T')[0];

    const map = new Map<string, { isoDate: string; isWeekend: boolean; weekKey: string }>();

    events.forEach(event => {
        if (event.isoDate >= startOfYearISO && event.isoDate <= endISO) {
            const [y, month, day] = event.isoDate.split('-').map(Number);
            const d = new Date(Date.UTC(y, month - 1, day));
            const dayOfWeek = d.getUTCDay();
            const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
            const weekKey = getISOWeekKey(d);

            map.set(event.id, { isoDate: event.isoDate, isWeekend, weekKey });
        }
    });

    return map;
}

/**
 * Calculates rides for each leaderboard entry based on attendance records.
 * 
 * Uses the new attendance data model where each event has a list of present members.
 * Falls back to the legacy dates array if no attendance data exists for an entry.
 * 
 * COUNTING RULES:
 * 1. Weekend rides (Saturday + Sunday) count as 1 per week
 * 2. Weekday rides (Monday-Friday) count as 1 each
 */
function calculateRidesFromAttendance(
    entries: LeaderboardEntry[],
    events: CalendarEvent[],
    allAttendance: EventAttendance[],
    year: number
): LeaderboardEntry[] {
    const eventInfoMap = buildEventInfoMap(events, year);

    // Build a lookup: memberId -> set of eventIds they attended
    const memberEventIds: Record<string, Set<string>> = {};
    allAttendance.forEach(att => {
        if (!att.members) return;
        Object.keys(att.members).forEach(memberId => {
            if (!memberEventIds[memberId]) memberEventIds[memberId] = new Set();
            memberEventIds[memberId].add(att.eventId);
        });
    });

    // Build a lookup: memberId -> list of ISO dates they attended (for display)
    const memberDates: Record<string, string[]> = {};
    allAttendance.forEach(att => {
        if (!att.members || !att.isoDate) return;
        Object.keys(att.members).forEach(memberId => {
            if (!memberDates[memberId]) memberDates[memberId] = [];
            memberDates[memberId].push(att.isoDate);
        });
    });

    return entries.map(entry => {
        const eventIds = memberEventIds[entry.id];
        const hasAttendance = eventIds && eventIds.size > 0;

        const memberWeekendWeeks = new Set<string>();
        const memberWeekdayDates = new Set<string>();
        let displayDates: string[] = [];

        if (hasAttendance) {
            // Use attendance records (new system)
            eventIds.forEach(eventId => {
                const info = eventInfoMap.get(eventId);
                if (!info) return;

                if (info.isWeekend) {
                    memberWeekendWeeks.add(info.weekKey);
                } else {
                    memberWeekdayDates.add(info.isoDate);
                }
            });

            const startISO = `${year}-01-01`;
            const endISO = `${year}-12-31`;
            displayDates = (memberDates[entry.id] || [])
                .filter(iso => iso >= startISO && iso <= endISO)
                .sort()
                .map(iso => {
                    const [y, m, d] = iso.split('-');
                    return `${parseInt(d, 10)}/${parseInt(m, 10)}/${y}`;
                });
        } else {
            // Fallback to legacy dates array (DD/MM/YYYY format)
            const legacyIsoDates: string[] = [];
            (entry.dates || []).forEach(dateStr => {
                const parts = dateStr.split('/');
                if (parts.length === 3) {
                    const [dd, mm, yyyy] = parts;
                    const iso = `${yyyy}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}`;
                    if (iso.startsWith(`${year}-`)) {
                        legacyIsoDates.push(iso);
                    }
                }
            });

            legacyIsoDates.forEach(iso => {
                const [y, m, d] = iso.split('-').map(Number);
                const dt = new Date(Date.UTC(y, m - 1, d));
                const dayOfWeek = dt.getUTCDay();
                if (dayOfWeek === 0 || dayOfWeek === 6) {
                    memberWeekendWeeks.add(getISOWeekKey(dt));
                } else {
                    memberWeekdayDates.add(iso);
                }
            });

            displayDates = legacyIsoDates.sort().map(iso => {
                const [y, m, d] = iso.split('-');
                return `${parseInt(d, 10)}/${parseInt(m, 10)}/${y}`;
            });
        }

        const rideCount = memberWeekendWeeks.size + memberWeekdayDates.size;

        return { ...entry, rides: rideCount, dates: displayDates };
    }).sort((a, b) => b.rides - a.rides);
}


export default async function LeaderboardPage(
    { searchParams }: { searchParams: Promise<{ year?: string }> }
): Promise<React.ReactElement> {
    const params = await searchParams;
    const currentYear = new Date().getFullYear();
    const availableYears = Array.from({ length: currentYear - 2025 + 1 }, (_, i) => 2025 + i);
    const parsed = params.year ? parseInt(params.year, 10) : currentYear;
    const selectedYear = availableYears.includes(parsed) ? parsed : currentYear;

    // Fetch from Firebase
    const [rawEntries, events, allAttendance] = await Promise.all([
        getLeaderboardEntries(),
        getCalendarEvents(),
        getAllAttendance(),
    ]);
    
    // Calculate rides from attendance records for the selected year
    const entries = calculateRidesFromAttendance(rawEntries, events, allAttendance, selectedYear);
    const totalPossibleRides = getPossibleRidesCount(events, selectedYear);
    
    return (
        <LeaderboardView
            entries={entries}
            totalPossibleRides={totalPossibleRides}
            selectedYear={selectedYear}
            availableYears={availableYears}
        />
    );
}
