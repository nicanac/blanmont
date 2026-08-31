import { getCalendarEvents, getLeaderboardEntries, LeaderboardEntry } from '../lib/firebase';
import { getAllAttendance, EventAttendance } from '../lib/firebase/attendance';
import { CalendarEvent } from '../types';
import { calculateLeaderboardFromAttendance, getPossibleCarresCount } from '../lib/carreVert';
import LeaderboardView from './LeaderboardView';

export const dynamic = 'force-dynamic';

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
    
    // Calculate rides from attendance records for the selected year using Carré Vert rules
    const entries = calculateLeaderboardFromAttendance(rawEntries, events, allAttendance, selectedYear);
    const totalPossibleRides = getPossibleCarresCount(events, selectedYear, {
        includeOnlyPastOrAttended: true,
        allAttendance,
    });
    
    return (
        <LeaderboardView
            entries={entries}
            totalPossibleRides={totalPossibleRides}
            selectedYear={selectedYear}
            availableYears={availableYears}
        />
    );
}

