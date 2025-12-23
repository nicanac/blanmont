import { Fragment } from 'react';

const DATABASE_ID = '2d29555c-6779-80fc-b4c9-c912fc338142';
const NOTION_TOKEN = process.env.NOTION_TOKEN || process.env.NOTION_KEY;
const NOTION_VERSION = '2022-06-28';

// Types
type LeaderboardEntry = {
    id: string;
    name: string;
    rides: number;
    group: string;
    dates: string[];
};

// Data Fetching Helper using native fetch to avoid client library issues
async function notionQuery(payload: any = {}) {
    const res = await fetch(`https://api.notion.com/v1/databases/${DATABASE_ID}/query`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${NOTION_TOKEN}`,
            'Notion-Version': NOTION_VERSION,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        next: { revalidate: 60 }, // Revalidate cache every 60s
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(`Notion API Error: ${res.status} ${text}`);
    }

    return res.json();
}

async function getLeaderboardData(): Promise<LeaderboardEntry[]> {
    const pages: LeaderboardEntry[] = [];
    let cursor: string | undefined = undefined;

    try {
        do {
            const response: any = await notionQuery({
                start_cursor: cursor,
                sorts: [
                    {
                        property: 'Rides',
                        direction: 'descending',
                    },
                ],
            });

            for (const page of response.results) {
                if (!('properties' in page)) continue;
                const props = page.properties;

                // Extract properties carefully
                const nameTitle = props['Name']?.type === 'title' ? props['Name'].title : [];
                const name = nameTitle.length > 0 ? nameTitle[0].plain_text : 'Unknown';

                const rides = props['Rides']?.type === 'number' ? props['Rides'].number || 0 : 0;

                const groupSelect = props['Group']?.type === 'select' ? props['Group'].select : null;
                const group = groupSelect ? groupSelect.name : '-';

                const datesMulti = props['Dates']?.type === 'multi_select' ? props['Dates'].multi_select : [];
                const dates = datesMulti.map((d: any) => d.name);

                pages.push({
                    id: page.id,
                    name,
                    rides,
                    group,
                    dates
                });
            }
            cursor = response.next_cursor || undefined;
        } while (cursor);
    } catch (error) {
        console.error("Error fetching leaderboard:", error);
        return [];
    }

    return pages;
}

export default async function LeaderboardPage() {
    const entries = await getLeaderboardData();

    // Split data
    const top3 = entries.slice(0, 3);
    const others = entries.slice(3);

    // Helper for Podium Card
    const PodiumCard = ({ entry, rank }: { entry: LeaderboardEntry; rank: number }) => {
        const isFirst = rank === 0;
        const medal = rank === 0 ? "🏆" : rank === 1 ? "🥈" : "🥉";
        const titleColor = rank === 0 ? "text-green-600" : "text-gray-900";
        const ringColor = rank === 0 ? "ring-green-600 ring-2" : "ring-gray-200 ring-1";
        const shadow = rank === 0 ? "shadow-2xl scale-105 z-10" : "shadow-md";
        const bg = rank === 0 ? "bg-white" : "bg-gray-50/50";

        // Last date logic
        const lastDate = entry.dates.length > 0 ? entry.dates[entry.dates.length - 1] : "N/A";
        const fidelity = Math.round((entry.rides / 52) * 100);

        return (
            <div className={`rounded-3xl p-8 ${ringColor} ${shadow} ${bg} flex flex-col justify-between transition-all duration-300 hover:shadow-lg`}>
                <div>
                    <div className="flex items-center justify-between">
                        <h3 className={`text-lg font-semibold leading-8 ${titleColor} flex items-center gap-2`}>
                            {medal} {rank === 0 ? "Champion" : rank === 1 ? "2ème Place" : "3ème Place"}
                        </h3>
                        <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${entry.group.startsWith('A') ? 'bg-red-50 text-red-700 ring-red-600/10' :
                                entry.group.startsWith('B') ? 'bg-blue-50 text-blue-700 ring-blue-600/10' :
                                    entry.group.startsWith('C') ? 'bg-green-50 text-green-700 ring-green-600/10' :
                                        'bg-gray-50 text-gray-600 ring-gray-500/10'
                            }`}>
                            {entry.group}
                        </span>
                    </div>

                    <p className="mt-4 text-2xl font-bold tracking-tight text-gray-900 truncate">{entry.name}</p>

                    <div className="mt-6 flex items-baseline gap-x-2">
                        <span className="text-5xl font-bold tracking-tight text-gray-900">{entry.rides}</span>
                        <span className="text-sm font-semibold leading-6 text-gray-600">sorties</span>
                    </div>

                    <ul role="list" className="mt-8 space-y-3 text-sm leading-6 text-gray-600">
                        <li className="flex gap-x-3">
                            <span className="font-semibold text-gray-900">Fidélité:</span> {fidelity}%
                        </li>
                        <li className="flex gap-x-3">
                            <span className="font-semibold text-gray-900">Dernière:</span> {lastDate}
                        </li>
                    </ul>
                </div>
            </div>
        );
    };

    return (
        <div className="bg-white py-24 sm:py-32">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="mx-auto max-w-2xl lg:mx-0">
                    <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl text-green-700">Classé Vert</h2>
                    <p className="mt-2 text-lg leading-8 text-gray-600">
                        Le peloton de tête et le classement complet de la saison.
                    </p>
                </div>

                {/* Podium Section */}
                {top3.length > 0 && (
                    <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 items-end gap-8 lg:mx-0 lg:max-w-none lg:grid-cols-3">
                        {/* 2nd Place (Left) */}
                        <div className="order-2 lg:order-1">
                            {top3[1] && <PodiumCard entry={top3[1]} rank={1} />}
                        </div>

                        {/* 1st Place (Center) - Highlighting order for mobile flow vs desktop */}
                        <div className="order-1 lg:order-2">
                            {top3[0] && <PodiumCard entry={top3[0]} rank={0} />}
                        </div>

                        {/* 3rd Place (Right) */}
                        <div className="order-3 lg:order-3">
                            {top3[2] && <PodiumCard entry={top3[2]} rank={2} />}
                        </div>
                    </div>
                )}

                {/* Full Table (Others) */}
                {others.length > 0 && (
                    <div className="mt-20 overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
                        <table className="min-w-full divide-y divide-gray-300">
                            <thead className="bg-green-50">
                                <tr>
                                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                                        Rang
                                    </th>
                                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">
                                        Nom
                                    </th>
                                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                        Groupe
                                    </th>
                                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                        Sorties
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                                {others.map((person, index) => (
                                    <tr key={person.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                                            {index + 4}
                                        </td>
                                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900">
                                            {person.name}
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                            <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${person.group.startsWith('A') ? 'bg-red-50 text-red-700 ring-red-600/10' :
                                                    person.group.startsWith('B') ? 'bg-blue-50 text-blue-700 ring-blue-600/10' :
                                                        person.group.startsWith('C') ? 'bg-green-50 text-green-700 ring-green-600/10' :
                                                            'bg-gray-50 text-gray-600 ring-gray-500/10'
                                                }`}>
                                                {person.group}
                                            </span>
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                            <div className="font-bold text-gray-900">{person.rides}</div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
