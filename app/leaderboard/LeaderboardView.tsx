'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageHero } from '../components/ui/PageHero';
import { TrophyIcon, XMarkIcon } from '@heroicons/react/24/outline';

type LeaderboardEntry = {
    id: string;
    name: string;
    rides: number;
    group: string;
    dates: string[];
};

type Props = {
    entries: LeaderboardEntry[];
    totalPossibleRides: number;
    selectedYear: number;
    availableYears: number[];
};

// Reusable Badge Component
const GroupBadge = ({ group }: { group: string }): React.ReactElement => (
    <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${group.startsWith('A') ? 'bg-red-50 text-red-700 ring-red-600/10' :
        group.startsWith('B') ? 'bg-blue-50 text-blue-700 ring-blue-600/10' :
            group.startsWith('C') ? 'bg-green-50 text-green-700 ring-green-600/10' :
                'bg-gray-50 text-gray-600 ring-gray-500/10'
        }`}>
        {group}
    </span>
);

// Podium Card Component
const PodiumCard = ({ entry, rank, onSelect, totalPossibleRides }: { entry: LeaderboardEntry; rank: number; onSelect: (entry: LeaderboardEntry) => void; totalPossibleRides: number }): React.ReactElement => {
    const medal = rank === 1 ? "🏆" : rank === 2 ? "🥈" : "🥉";
    const titleColor = rank === 1 ? "text-emerald-700" : "text-slate-900";
    const ringColor = rank === 1 ? "ring-emerald-600 ring-2" : "ring-slate-200 ring-1";
    const shadow = rank === 1 ? "shadow-2xl scale-105 z-10" : "shadow-md";
    const bg = rank === 1 ? "bg-white" : "bg-slate-50/70";
    const lastDate = entry.dates.length > 0 ? entry.dates[entry.dates.length - 1] : "N/A";

    // Avoid division by zero
    const fidelity = totalPossibleRides > 0
        ? Math.round((entry.rides / totalPossibleRides) * 100)
        : 0;

    return (
        <div
            onClick={() => onSelect(entry)}
            className={`rounded-3xl p-8 ${ringColor} ${shadow} ${bg} flex flex-col justify-between transition-all duration-300 hover:shadow-xl cursor-pointer`}
        >
            <div>
                <div className="flex items-center justify-between">
                    <h3 className={`text-base font-bold leading-6 ${titleColor} flex items-center gap-2`}>
                        {medal} {rank === 1 ? "Champion" : rank === 2 ? "2ème Place" : "3ème Place"}
                    </h3>
                    <GroupBadge group={entry.group} />
                </div>

                <p className="mt-4 text-xl font-bold tracking-tight text-slate-900 truncate">{entry.name}</p>

                <div className="mt-6 flex items-baseline gap-x-2">
                    <span className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 tabular-nums">{entry.rides}</span>
                    <span className="text-sm font-semibold text-slate-500">sorties</span>
                </div>

                <ul role="list" className="mt-8 space-y-3 text-sm leading-6 text-slate-600">
                    <li className="flex gap-x-3 tabular-nums">
                        <span className="font-semibold text-slate-900">Fidélité :</span> {fidelity}&nbsp;%
                    </li>
                    <li className="flex gap-x-3">
                        <span className="font-semibold text-slate-900">Dernière :</span> {lastDate}
                    </li>
                </ul>
            </div>
        </div>
    );
};

export default function LeaderboardView({ entries, totalPossibleRides, selectedYear, availableYears }: Props): React.ReactElement {
    const router = useRouter();
    const [selectedMember, setSelectedMember] = useState<LeaderboardEntry | null>(null);
    const [open, setOpen] = useState(false);

    // Derived state for the selected member's rank
    const selectedRank = selectedMember ? entries.findIndex(e => e.id === selectedMember.id) + 1 : 0;

    const handleSelectMember = (member: LeaderboardEntry) => {
        setSelectedMember(member);
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };




    // Sort entries by rides descending
    const sortedEntries = [...entries].sort((a, b) => b.rides - a.rides);

    // Calculate Global Ranks (Competition Ranking: 1, 1, 3, 4...)
    const globalRanks: Record<string, number> = {};
    sortedEntries.forEach((entry, index) => {
        if (index > 0 && entry.rides === sortedEntries[index - 1].rides) {
            globalRanks[entry.id] = globalRanks[sortedEntries[index - 1].id];
        } else {
            globalRanks[entry.id] = index + 1;
        }
    });

    // Calculate Group Ranks (Competition Ranking within each group)
    const groupRanks: Record<string, number> = {};
    const groupLists: Record<string, LeaderboardEntry[]> = {};

    // Group entries
    sortedEntries.forEach(entry => {
        if (!groupLists[entry.group]) groupLists[entry.group] = [];
        groupLists[entry.group].push(entry);
    });

    // Rank within groups
    Object.values(groupLists).forEach(groupMembers => {
        groupMembers.forEach((member, index) => {
            if (index > 0 && member.rides === groupMembers[index - 1].rides) {
                groupRanks[member.id] = groupRanks[groupMembers[index - 1].id];
            } else {
                groupRanks[member.id] = index + 1;
            }
        });
    });

    const top3 = sortedEntries.slice(0, 3);
    const others = sortedEntries.slice(3);

    return (
        <>
            <main className="min-h-screen bg-gray-50">
                <PageHero
                    title="Carré Vert"
                    description="Le peloton de tête et le classement complet de la saison."
                    badge="Challenge Fidélité"
                    badgeIcon={<TrophyIcon className="h-4 w-4" />}
                    variant="dark"
                    size="md"
                />
                <div className="mx-auto max-w-7xl px-6 lg:px-8 py-12">
                    {/* Year Selector */}
                    <div className="flex justify-center">
                        <div className="inline-flex rounded-lg bg-gray-100 p-1">
                            {availableYears.map(year => (
                                <button
                                    key={year}
                                    onClick={() => router.push(`/leaderboard?year=${year}`)}
                                    className={`rounded-md px-5 py-2 text-sm font-semibold tabular-nums transition-all duration-200 ${year === selectedYear
                                        ? 'bg-emerald-600 text-white shadow-xs'
                                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
                                        }`}
                                >
                                    {year}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Podium Section */}
                    {top3.length > 0 && (
                        <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 items-end gap-8 lg:mx-0 lg:max-w-none lg:grid-cols-3">
                            {/* 2nd Place Slot (top3[1]) */}
                            <div className="order-2 lg:order-1">
                                {top3[1] && <PodiumCard entry={top3[1]} rank={globalRanks[top3[1].id]} onSelect={handleSelectMember} totalPossibleRides={totalPossibleRides} />}
                            </div>

                            {/* 1st Place Slot (top3[0]) */}
                            <div className="order-1 lg:order-2">
                                {top3[0] && <PodiumCard entry={top3[0]} rank={globalRanks[top3[0].id]} onSelect={handleSelectMember} totalPossibleRides={totalPossibleRides} />}
                            </div>

                            {/* 3rd Place Slot (top3[2]) */}
                            <div className="order-3 lg:order-3">
                                {top3[2] && <PodiumCard entry={top3[2]} rank={globalRanks[top3[2].id]} onSelect={handleSelectMember} totalPossibleRides={totalPossibleRides} />}
                            </div>
                        </div>
                    )}

                    {/* Full Table (Others) */}
                    {others.length > 0 && (
                        <div className="mt-20 overflow-hidden shadow-xs ring-1 ring-slate-200 sm:rounded-2xl bg-white">
                            <table className="min-w-full divide-y divide-slate-200">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700 sm:pl-6">
                                            Rang
                                        </th>
                                        <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">
                                            Nom
                                        </th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">
                                            Groupe
                                        </th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">
                                            Sorties
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 bg-white">
                                    {others.map((person) => {
                                        const globalRank = globalRanks[person.id];
                                        const groupRank = groupRanks[person.id];
                                        const isGroupTop3 = groupRank <= 3;

                                        return (
                                            <tr
                                                key={person.id}
                                                onClick={() => handleSelectMember(person)}
                                                className="hover:bg-slate-50 transition-colors cursor-pointer"
                                            >
                                                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-bold text-slate-900 tabular-nums sm:pl-6">
                                                    #{globalRank}
                                                </td>
                                                <td className={`whitespace-nowrap py-4 pl-4 pr-3 text-sm ${isGroupTop3 ? 'font-bold text-slate-900' : 'font-medium text-slate-700'}`}>
                                                    {person.name}
                                                </td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500">
                                                    <GroupBadge group={person.group} />
                                                </td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500">
                                                    <div className={`font-bold tabular-nums ${isGroupTop3 ? 'text-slate-900' : 'text-slate-600'}`}>{person.rides}</div>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </main>

            {/* Slide-over Drawer */}
            {open && selectedMember && (
                <div className="fixed inset-0 z-50 overflow-hidden">
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
                        onClick={handleClose}
                    />

                    <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
                        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
                            {/* Header */}
                            <div className="bg-emerald-700 text-white p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-xs font-semibold uppercase tracking-wider text-emerald-200">
                                        Détails du membre
                                    </span>
                                    <button
                                        onClick={handleClose}
                                        className="rounded-full p-1.5 text-white/80 hover:text-white hover:bg-emerald-600 transition-colors"
                                        aria-label="Fermer"
                                    >
                                        <XMarkIcon className="h-5 w-5" />
                                    </button>
                                </div>
                                <h2 className="text-2xl font-bold tracking-tight text-white">
                                    {selectedMember.name}
                                </h2>
                                <p className="text-xs font-medium text-emerald-100 mt-1">
                                    Rang actuel : #{selectedRank} au classement général
                                </p>
                            </div>

                            {/* Content */}
                            <div className="p-6 flex-1 overflow-y-auto space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
                                        <div className="text-xs font-medium text-slate-500">Groupe</div>
                                        <div className="mt-1">
                                            <GroupBadge group={selectedMember.group} />
                                        </div>
                                    </div>
                                    <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
                                        <div className="text-xs font-medium text-slate-500">Total Sorties</div>
                                        <div className="mt-1 text-xl font-extrabold text-slate-900">
                                            {selectedMember.rides}
                                        </div>
                                    </div>
                                    <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
                                        <div className="text-xs font-medium text-slate-500">Taux de Fidélité</div>
                                        <div className="mt-1 text-xl font-extrabold text-emerald-600">
                                            {totalPossibleRides > 0 ? Math.round((selectedMember.rides / totalPossibleRides) * 100) : 0}%
                                        </div>
                                    </div>
                                    <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
                                        <div className="text-xs font-medium text-slate-500">Dernière sortie</div>
                                        <div className="mt-1 text-xs font-bold text-slate-800">
                                            {selectedMember.dates.length > 0 ? selectedMember.dates[selectedMember.dates.length - 1] : "Aucune"}
                                        </div>
                                    </div>
                                </div>

                                <div className="border-t border-slate-100 pt-6 space-y-3">
                                    <h3 className="text-sm font-bold text-slate-900">
                                        Historique des présences ({selectedMember.dates.length})
                                    </h3>

                                    <div className="flex flex-wrap gap-1.5">
                                        {selectedMember.dates.map((date) => (
                                            <span
                                                key={date}
                                                className="inline-flex items-center rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-800 border border-emerald-200"
                                            >
                                                {date}
                                            </span>
                                        ))}
                                        {selectedMember.dates.length === 0 && (
                                            <p className="text-xs italic text-slate-400">
                                                Aucune sortie enregistrée pour cette saison.
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="p-4 border-t border-slate-100 flex justify-end">
                                <button
                                    onClick={handleClose}
                                    className="rounded-full border border-slate-200 bg-white px-5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                                >
                                    Fermer
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
