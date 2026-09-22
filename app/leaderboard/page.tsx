import type { Metadata } from 'next';
import { getCalendarEvents, getLeaderboardEntries } from '../lib/firebase';
import { getAllAttendance } from '../lib/firebase/attendance';
import {
    calculateLeaderboardFromAttendance,
    getPossibleCarresCount,
    getAvailableYears,
    calculateHallOfFameLeaderboard,
} from '../lib/carreVert';
import LeaderboardView from './LeaderboardView';

export const dynamic = 'force-dynamic';

export async function generateMetadata(
    { searchParams }: { searchParams: Promise<{ year?: string; member?: string }> }
): Promise<Metadata> {
    const params = await searchParams;
    const isHallOfFame = params.year === 'all' || params.year === 'hall-of-fame';

    if (isHallOfFame) {
        return {
            title: `Hall of Fame & Palmarès | Le Carré Vert`,
            description: `Le panthéon et classement historique cumulé récompensant la régularité, l'engagement et la fidélité des membres du Cyclo Club Saint-Martin Blanmont au fil des saisons.`,
            openGraph: {
                title: `Hall of Fame & Palmarès | Le Carré Vert - CC Saint-Martin Blanmont`,
                description: `Le panthéon et classement historique cumulé récompensant la fidélité des membres du peloton.`,
            },
        };
    }

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

    // Fetch from Firebase
    const [rawEntries, events, allAttendance] = await Promise.all([
        getLeaderboardEntries(),
        getCalendarEvents(),
        getAllAttendance(),
    ]);

    // Available years: dynamically discovered, guaranteeing baseline [2024, 2025, 2026, 2027]
    const availableYears = getAvailableYears(events, allAttendance, rawEntries, [2024, 2025, 2026, 2027]);

    const isHallOfFame = params.year === 'all' || params.year === 'hall-of-fame';
    const parsed = params.year ? parseInt(params.year, 10) : currentYear;
    const selectedYear = !isHallOfFame && availableYears.includes(parsed) ? parsed : currentYear;

    // Calculate seasonal entries for the selected year
    const entries = calculateLeaderboardFromAttendance(rawEntries, events, allAttendance, selectedYear);
    const totalPossibleRides = getPossibleCarresCount(events, selectedYear, {
        includeOnlyPastOrAttended: true,
        allAttendance,
    });

    // Calculate Hall of Fame cumulative fidelity rankings across all seasons
    const hallOfFame = calculateHallOfFameLeaderboard(rawEntries, events, allAttendance, availableYears);

    return (
        <LeaderboardView
            entries={entries}
            events={events}
            totalPossibleRides={totalPossibleRides}
            selectedYear={selectedYear}
            availableYears={availableYears}
            initialMemberId={params.member}
            isHallOfFame={isHallOfFame}
            hallOfFame={hallOfFame}
        />
    );
}

