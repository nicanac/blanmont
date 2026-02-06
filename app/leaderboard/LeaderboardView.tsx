'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
    Drawer,
    Box,
    Typography,
    IconButton,
    Divider
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { PageHeader } from '../components/ui/PageHeader';

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
    const titleColor = rank === 1 ? "text-green-600" : "text-gray-900";
    const ringColor = rank === 1 ? "ring-green-600 ring-2" : "ring-gray-200 ring-1";
    const shadow = rank === 1 ? "shadow-2xl scale-105 z-10" : "shadow-md";
    const bg = rank === 1 ? "bg-white" : "bg-gray-50/50";
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
                    <h3 className={`text-lg font-semibold leading-8 ${titleColor} flex items-center gap-2`}>
                        {medal} {rank === 1 ? "Champion" : rank === 2 ? "2ème Place" : "3ème Place"}
                    </h3>
                    <GroupBadge group={entry.group} />
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
            <div className="bg-white">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <PageHeader 
                        title="Carré Vert" 
                        description="Le peloton de tête et le classement complet de la saison." 
                    />

                    {/* Year Selector */}
                    <div className="mt-6 flex justify-center">
                        <div className="inline-flex rounded-lg bg-gray-100 p-1">
                            {availableYears.map(year => (
                                <button
                                    key={year}
                                    onClick={() => router.push(`/leaderboard?year=${year}`)}
                                    className={`rounded-md px-5 py-2 text-sm font-semibold transition-all duration-200 ${
                                        year === selectedYear
                                            ? 'bg-green-600 text-white shadow-sm'
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
                                    {others.map((person) => {
                                        const globalRank = globalRanks[person.id];
                                        const groupRank = groupRanks[person.id];
                                        const isGroupTop3 = groupRank <= 3;

                                        return (
                                            <tr
                                                key={person.id}
                                                onClick={() => handleSelectMember(person)}
                                                className="hover:bg-green-50 transition-colors cursor-pointer"
                                            >
                                                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                                                    {globalRank}
                                                </td>
                                                <td className={`whitespace-nowrap py-4 pl-4 pr-3 text-sm ${isGroupTop3 ? 'font-bold text-gray-900' : 'font-medium text-gray-600'}`}>
                                                    {person.name}
                                                </td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                    <GroupBadge group={person.group} />
                                                </td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                    <div className={`font-bold ${isGroupTop3 ? 'text-gray-900' : 'text-gray-500'}`}>{person.rides}</div>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* MUI Drawer */}
            <Drawer
                anchor="right"
                open={open}
                onClose={handleClose}
                PaperProps={{
                    sx: { width: { xs: '100%', sm: 400 } }
                }}
            >
                {selectedMember && (
                    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                        {/* Header */}
                        <Box sx={{ bgcolor: '#15803d', color: 'white', px: 3, py: 3 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                                <Typography variant="subtitle1" fontWeight="bold">
                                    Détails du membre
                                </Typography>
                                <IconButton onClick={handleClose} sx={{ color: 'white' }}>
                                    <CloseIcon />
                                </IconButton>
                            </Box>
                            <Typography variant="h4" fontWeight="bold">
                                {selectedMember.name}
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#dcfce7', mt: 0.5 }}>
                                Rang actuel: #{selectedRank}
                            </Typography>
                        </Box>

                        {/* Content */}
                        <Box sx={{ p: 3, flex: 1, overflowY: 'auto' }}>
                            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 3 }}>
                                <Box>
                                    <Typography variant="caption" color="text.secondary" fontWeight="medium">
                                        Groupe
                                    </Typography>
                                    <Box mt={0.5}>
                                        <GroupBadge group={selectedMember.group} />
                                    </Box>
                                </Box>
                                <Box>
                                    <Typography variant="caption" color="text.secondary" fontWeight="medium">
                                        Total Sorties
                                    </Typography>
                                    <Typography variant="h5" fontWeight="bold" color="text.primary">
                                        {selectedMember.rides}
                                    </Typography>
                                </Box>
                                <Box>
                                    <Typography variant="caption" color="text.secondary" fontWeight="medium">
                                        Fidélité
                                    </Typography>
                                    <Typography variant="body2" color="text.primary">
                                        {totalPossibleRides > 0 ? Math.round((selectedMember.rides / totalPossibleRides) * 100) : 0}%
                                    </Typography>
                                </Box>
                                <Box>
                                    <Typography variant="caption" color="text.secondary" fontWeight="medium">
                                        Dernière participation
                                    </Typography>
                                    <Typography variant="body2" color="text.primary">
                                        {selectedMember.dates.length > 0 ? selectedMember.dates[selectedMember.dates.length - 1] : "Aucune"}
                                    </Typography>
                                </Box>
                            </Box>

                            <Divider sx={{ my: 4 }} />

                            <Typography variant="h6" fontWeight="bold" gutterBottom>
                                Historique des présences
                            </Typography>

                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
                                {selectedMember.dates.map((date) => (
                                    <span key={date} className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                                        {date}
                                    </span>
                                ))}
                                {selectedMember.dates.length === 0 && (
                                    <Typography variant="body2" color="text.secondary" fontStyle="italic">
                                        Aucune sortie enregistrée
                                    </Typography>
                                )}
                            </Box>
                        </Box>
                    </Box>
                )}
            </Drawer>
        </>
    );
}
