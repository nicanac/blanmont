import type { Metadata } from 'next';
import { getCalendarEvents, getLeaderboardEntries, LeaderboardEntry } from '../lib/firebase';
import { getAllAttendance, EventAttendance } from '../lib/firebase/attendance';
import { CalendarEvent } from '../types';
import { calculateLeaderboardFromAttendance, getPossibleCarresCount } from '../lib/carreVert';
import LeaderboardView from './LeaderboardView';

export const dynamic = 'force-dynamic';

export async function generateMetadata(
    { searchParams }: { searchParams: Promise<{ year?: string; member?: string }> }
): Promise<Metadata> {
    const params = await searchParams;
    const currentYear = new Date().getFullYear();
    const parsed = params.year ? parseInt(params.year, 10) : currentYear;
    const year = isNaN(parsed) ? currentYear : parsed;

    return {
        title: `Le Carré Vert ${year} | Classement d'Assiduité`,
        description: `Classement officiel d'assiduité du Carré Vert ${year} récompensant la régularité et l'engagement des cyclistes du Cyclo Club Saint-Martin Blanmont.`,
        openGraph: {
            title: `Le Carré Vert ${year} | Classement d'Assiduité - CC Saint-Martin Blanmont`,
            description: `Classement officiel d'assiduité du Carré Vert ${year} récompensant la régularité des membres du peloton.`,
        },
    };
}

export default async function LeaderboardPage(
    { searchParams }: { searchParams: Promise<{ year?: string; member?: string }> }
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
            events={events}
            totalPossibleRides={totalPossibleRides}
            selectedYear={selectedYear}
            availableYears={availableYears}
            initialMemberId={params.member}
        />
    );
}

