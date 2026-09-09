'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { TrophyIcon, XMarkIcon, ArrowTopRightOnSquareIcon, CalendarDaysIcon, FlagIcon } from '@heroicons/react/24/outline';
import { TrophySquareIcon, BicycleIcon } from '../components/ui/CyclingIcons';
import { CalendarEvent } from '../types';
import { parseDateInfo } from '../lib/carreVert';

type LeaderboardEntry = {
    id: string;
    name: string;
    rides: number;
    group: string;
    dates: string[];
};

type Props = {
    entries: LeaderboardEntry[];
    events?: CalendarEvent[];
    totalPossibleRides: number;
    selectedYear: number;
    availableYears: number[];
    initialMemberId?: string;
};

// Reusable Badge Component
const GroupBadge = ({ group }: { group: string }): React.ReactElement => (
    <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
        group.startsWith('A') ? 'bg-red-50 text-red-700 ring-red-600/10 dark:bg-red-950/40 dark:text-red-400 dark:ring-red-500/20' :
        group.startsWith('B') ? 'bg-blue-50 text-blue-700 ring-blue-600/10 dark:bg-blue-950/40 dark:text-blue-400 dark:ring-blue-500/20' :
        group.startsWith('C') ? 'bg-green-50 text-green-700 ring-green-600/10 dark:bg-green-950/40 dark:text-green-400 dark:ring-green-500/20' :
        'bg-[#f2efe9] text-[#3a3f4a] ring-gray-500/10 dark:bg-[#1c202a] dark:text-[#a7adbb] dark:ring-white/10'
    }`}>
        {group}
    </span>
);

// Podium Card Component
const PodiumCard = ({ entry, rank, onSelect, totalPossibleRides }: { entry: LeaderboardEntry; rank: number; onSelect: (entry: LeaderboardEntry) => void; totalPossibleRides: number }): React.ReactElement => {
    const medal = rank === 1 ? "🏆" : rank === 2 ? "🥈" : "🥉";
    const titleColor = rank === 1 ? "text-emerald-700 dark:text-emerald-400" : "text-[#101216] dark:text-white";
    const ringColor = rank === 1 ? "ring-emerald-500/80 dark:ring-emerald-400/80 ring-2" : "ring-[#e4e0d8] dark:ring-[#262b38] ring-1";
    const shadow = rank === 1 ? "shadow-2xl scale-105 z-10" : "shadow-md";
    const bg = rank === 1 ? "bg-white dark:bg-[#161922]" : "bg-[#f2efe9]/70 dark:bg-[#101216]";
    const lastDate = entry.dates.length > 0 ? entry.dates[entry.dates.length - 1] : "N/A";

    // Avoid division by zero
    const fidelity = totalPossibleRides > 0
        ? Math.round((entry.rides / totalPossibleRides) * 100)
        : 0;

    return (
        <div
            onClick={() => onSelect(entry)}
            className={`rounded-lg p-8 ${ringColor} ${shadow} ${bg} flex flex-col justify-between transition-all duration-300 hover:shadow-xl cursor-pointer`}
        >
            <div>
                <div className="flex items-center justify-between">
                    <h3 className={`text-base font-bold leading-6 ${titleColor} flex items-center gap-2`}>
                        {medal} {rank === 1 ? "Champion" : rank === 2 ? "2ème Place" : "3ème Place"}
                    </h3>
                    <GroupBadge group={entry.group} />
                </div>

                <p className="mt-4 text-xl font-bold tracking-tight text-[#101216] dark:text-white truncate">{entry.name}</p>

                <div className="mt-6 flex items-baseline gap-x-2">
                    <span className="text-4xl sm:text-5xl font-extrabold tracking-tight text-[#101216] dark:text-white tabular-nums">{entry.rides}</span>
                    <span className="text-sm font-semibold text-[#5c6370] dark:text-[#a7adbb]">sorties</span>
                </div>

                <ul role="list" className="mt-8 space-y-3 text-sm leading-6 text-[#3a3f4a] dark:text-[#a7adbb]">
                    <li className="flex gap-x-3 tabular-nums">
                        <span className="font-semibold text-[#101216] dark:text-white">Fidélité :</span> {fidelity}&nbsp;%
                    </li>
                    <li className="flex gap-x-3">
                        <span className="font-semibold text-[#101216] dark:text-white">Dernière :</span> {lastDate}
                    </li>
                </ul>
            </div>
        </div>
    );
};

export default function LeaderboardView({
    entries,
    events = [],
    totalPossibleRides,
    selectedYear,
    availableYears,
    initialMemberId,
}: Props): React.ReactElement {
    const router = useRouter();
    const [selectedMember, setSelectedMember] = useState<LeaderboardEntry | null>(() => {
        if (!initialMemberId) return null;
        return entries.find((e) => e.id === initialMemberId) || null;
    });
    const [open, setOpen] = useState(() => Boolean(initialMemberId && entries.some((e) => e.id === initialMemberId)));
    const [hoveredDateInfo, setHoveredDateInfo] = useState<{
        dateStr: string;
        event?: CalendarEvent;
    } | null>(null);

    // Build lookup map for events by isoDate
    const eventsByIsoDate = useMemo(() => {
        const map = new Map<string, CalendarEvent>();
        events.forEach((evt) => {
            if (evt.isoDate) {
                map.set(evt.isoDate, evt);
            }
        });
        return map;
    }, [events]);

    // Derived state for the selected member's rank
    const selectedRank = selectedMember ? entries.findIndex(e => e.id === selectedMember.id) + 1 : 0;

    const handleSelectMember = (member: LeaderboardEntry) => {
        setSelectedMember(member);
        setOpen(true);
        if (typeof window !== 'undefined') {
            const url = new URL(window.location.href);
            url.searchParams.set('member', member.id);
            window.history.replaceState({}, '', url.toString());
        }
    };

    const handleClose = () => {
        setOpen(false);
        setHoveredDateInfo(null);
        if (typeof window !== 'undefined') {
            const url = new URL(window.location.href);
            url.searchParams.delete('member');
            window.history.replaceState({}, '', url.toString());
        }
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
            <main className="min-h-screen bg-[#faf8f5] dark:bg-[#0a0c10] transition-colors duration-200">
                {/* ──── Editorial Cover Hero (Adaptive Light / Dark) ──── */}
                <section className="relative overflow-hidden editorial-hero-surface border-b border-[#e4e0d8] dark:border-[#262b38] transition-colors duration-200">
                    {/* Atmospheric Background Watermark */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none select-none opacity-[0.035] dark:opacity-[0.025] leading-none text-center">
                        <span className="text-[clamp(6rem,22vw,28rem)] font-extrabold uppercase tracking-tighter text-[#101216] dark:text-white whitespace-nowrap">
                            BLANMONT
                        </span>
                    </div>

                    <div className="relative mx-auto max-w-7xl px-4 pt-14 pb-10 sm:px-6 sm:pt-20 sm:pb-12 lg:px-8 z-10">
                        {/* Title row */}
                        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 pb-8 border-b border-[#e4e0d8] dark:border-white/10">
                            <div className="space-y-3 max-w-3xl">
                                <h1 className="text-[clamp(2.25rem,6vw,4.25rem)] font-extrabold uppercase tracking-[-0.03em] leading-[0.98] text-balance">
                                    Le Carré <span className="text-emerald-500 dark:text-emerald-400 italic">Vert</span>
                                </h1>

                                <p className="max-w-2xl text-base text-[#5c6370] dark:text-[#a7adbb] leading-relaxed">
                                    Le classement officiel d&apos;assiduité récompensant la régularité et l&apos;engagement des cyclistes de Blanmont tout au long de la saison {selectedYear}.
                                </p>
                            </div>

                            {/* Year Selector in Hero */}
                            <div className="inline-flex rounded-lg bg-white dark:bg-[#161922] p-1 border border-[#e4e0d8] dark:border-[#262b38] shrink-0 shadow-xs">
                                {availableYears.map(year => (
                                    <button
                                        key={year}
                                        type="button"
                                        onClick={() => router.push(`/leaderboard?year=${year}`)}
                                        className={`min-h-[40px] rounded-md px-4 py-2 text-xs font-bold uppercase tracking-wider tabular-nums transition-colors cursor-pointer ${
                                            year === selectedYear
                                                ? 'bg-emerald-600 text-white shadow-sm'
                                                : 'text-[#5c6370] dark:text-[#a7adbb] hover:text-[#101216] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'
                                        }`}
                                    >
                                        {year}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Stat Strip on Hero (Horizontal Hairline Structure) */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-[#e4e0d8] dark:divide-white/10 pt-6">
                            {/* Leader */}
                            <div className="py-3 sm:py-0 sm:px-6 first:sm:pl-0 flex items-center gap-4">
                                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#faf8f5] dark:bg-[#101216] border border-[#e4e0d8] dark:border-[#262b38] text-[#101216] dark:text-white shrink-0 shadow-2xs">
                                    <TrophySquareIcon className="h-5 w-5 text-[#e03e3e]" aria-hidden="true" />
                                </div>
                                <div className="min-w-0">
                                    <div className="text-2xl sm:text-3xl font-extrabold text-[#101216] dark:text-white tracking-tight truncate">
                                        {top3[0]?.name || 'En cours'}
                                    </div>
                                    <div className="text-xs uppercase tracking-[0.08em] text-[#5c6370] dark:text-[#a7adbb] font-semibold tabular-nums">
                                        Leader ({top3[0] ? `${top3[0].rides} sorties` : '0 sortie'})
                                    </div>
                                </div>
                            </div>

                            {/* Pelotons Ranked */}
                            <div className="py-3 sm:py-0 sm:px-6 flex items-center gap-4">
                                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#faf8f5] dark:bg-[#101216] border border-[#e4e0d8] dark:border-[#262b38] text-[#101216] dark:text-white shrink-0 shadow-2xs">
                                    <BicycleIcon className="h-5 w-5 text-[#101216] dark:text-white" aria-hidden="true" />
                                </div>
                                <div>
                                    <div className="text-2xl sm:text-3xl font-extrabold text-[#101216] dark:text-white tabular-nums tracking-tight">
                                        {sortedEntries.length}
                                    </div>
                                    <div className="text-xs uppercase tracking-[0.08em] text-[#5c6370] dark:text-[#a7adbb] font-semibold">
                                        Membres classés
                                    </div>
                                </div>
                            </div>

                            {/* Total Rides */}
                            <div className="py-3 sm:py-0 sm:px-6 last:sm:pr-0 flex items-center gap-4">
                                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#faf8f5] dark:bg-[#101216] border border-[#e4e0d8] dark:border-[#262b38] text-[#101216] dark:text-white shrink-0 shadow-2xs">
                                    <FlagIcon className="h-5 w-5 text-[#101216] dark:text-white" aria-hidden="true" />
                                </div>
                                <div>
                                    <div className="text-2xl sm:text-3xl font-extrabold text-[#101216] dark:text-white tabular-nums tracking-tight">
                                        {totalPossibleRides}
                                    </div>
                                    <div className="text-xs uppercase tracking-[0.08em] text-[#5c6370] dark:text-[#a7adbb] font-semibold">
                                        Sorties éligibles
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14">

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
                        <div className="mt-16 sm:mt-20 overflow-hidden shadow-xs ring-1 ring-[#e4e0d8] dark:ring-[#262b38] sm:rounded-lg bg-white dark:bg-[#101216] transition-colors">
                            <table className="min-w-full divide-y divide-[#e4e0d8] dark:divide-[#262b38]">
                                <thead className="bg-[#f2efe9] dark:bg-[#161922]">
                                    <tr>
                                        <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-xs font-semibold uppercase tracking-wider text-[#5c6370] dark:text-[#a7adbb] sm:pl-6">
                                            Rang
                                        </th>
                                        <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-xs font-semibold uppercase tracking-wider text-[#5c6370] dark:text-[#a7adbb]">
                                            Nom
                                        </th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-[#5c6370] dark:text-[#a7adbb]">
                                            Groupe
                                        </th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-[#5c6370] dark:text-[#a7adbb]">
                                            Sorties
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#efece5] dark:divide-[#262b38] bg-white dark:bg-[#101216]">
                                    {others.map((person) => {
                                        const globalRank = globalRanks[person.id];
                                        const groupRank = groupRanks[person.id];
                                        const isGroupTop3 = groupRank <= 3;

                                        return (
                                            <tr
                                                key={person.id}
                                                onClick={() => handleSelectMember(person)}
                                                className="hover:bg-[#f2efe9] dark:hover:bg-[#161922] transition-colors cursor-pointer"
                                            >
                                                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-bold text-[#101216] dark:text-white tabular-nums sm:pl-6">
                                                    #{globalRank}
                                                </td>
                                                <td className={`whitespace-nowrap py-4 pl-4 pr-3 text-sm ${isGroupTop3 ? 'font-bold text-[#101216] dark:text-white' : 'font-medium text-[#3a3f4a] dark:text-[#d1d5db]'}`}>
                                                    {person.name}
                                                </td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm">
                                                    <GroupBadge group={person.group} />
                                                </td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm">
                                                    <div className={`font-bold tabular-nums ${isGroupTop3 ? 'text-[#101216] dark:text-white' : 'text-[#3a3f4a] dark:text-[#d1d5db]'}`}>{person.rides}</div>
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
                        className="fixed inset-0 bg-slate-950/60 dark:bg-black/80 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
                        onClick={handleClose}
                    />

                    <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
                        <div className="w-screen max-w-md bg-white dark:bg-[#101216] border-l border-[#e4e0d8] dark:border-[#262b38] shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 transition-colors">
                            {/* Header */}
                            <div className="bg-emerald-700 dark:bg-emerald-950 dark:border-b dark:border-emerald-800/40 text-white p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-xs font-semibold uppercase tracking-wider text-emerald-200">
                                        Détails du membre
                                    </span>
                                    <button
                                        onClick={handleClose}
                                        className="rounded-full p-1.5 text-white/80 hover:text-white hover:bg-emerald-600 dark:hover:bg-emerald-900 transition-colors"
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
                                    <div className="rounded-md border border-[#efece5] dark:border-[#262b38] bg-[#f2efe9]/70 dark:bg-[#161922] p-4">
                                        <div className="text-xs font-medium text-[#5c6370] dark:text-[#a7adbb]">Groupe</div>
                                        <div className="mt-1">
                                            <GroupBadge group={selectedMember.group} />
                                        </div>
                                    </div>
                                    <div className="rounded-md border border-[#efece5] dark:border-[#262b38] bg-[#f2efe9]/70 dark:bg-[#161922] p-4">
                                        <div className="text-xs font-medium text-[#5c6370] dark:text-[#a7adbb]">Total Sorties</div>
                                        <div className="mt-1 text-xl font-extrabold text-[#101216] dark:text-white tabular-nums">
                                            {selectedMember.rides}
                                        </div>
                                    </div>
                                    <div className="rounded-md border border-[#efece5] dark:border-[#262b38] bg-[#f2efe9]/70 dark:bg-[#161922] p-4">
                                        <div className="text-xs font-medium text-[#5c6370] dark:text-[#a7adbb]">Taux de Fidélité</div>
                                        <div className="mt-1 text-xl font-extrabold text-emerald-600 dark:text-emerald-400 tabular-nums">
                                            {totalPossibleRides > 0 ? Math.round((selectedMember.rides / totalPossibleRides) * 100) : 0}%
                                        </div>
                                    </div>
                                    <div className="rounded-md border border-[#efece5] dark:border-[#262b38] bg-[#f2efe9]/70 dark:bg-[#161922] p-4">
                                        <div className="text-xs font-medium text-[#5c6370] dark:text-[#a7adbb]">Dernière sortie</div>
                                        <div className="mt-1 text-xs font-bold text-[#101216] dark:text-white">
                                            {selectedMember.dates.length > 0 ? selectedMember.dates[selectedMember.dates.length - 1] : "Aucune"}
                                        </div>
                                    </div>
                                </div>

                                <div className="border-t border-[#efece5] dark:border-[#262b38] pt-6 space-y-3.5">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-sm font-bold text-[#101216] dark:text-white">
                                            Historique des présences ({selectedMember.dates.length})
                                        </h3>
                                        <span className="text-[11px] font-medium text-[#5c6370] dark:text-[#a7adbb]">
                                            Cliquer pour voir la sortie
                                        </span>
                                    </div>

                                    {/* Contextual preview box on hover/focus */}
                                    <div className="min-h-[40px] rounded-md border border-[#e4e0d8] dark:border-[#262b38] bg-[#faf8f5] dark:bg-[#161922] px-3 py-2 flex items-center text-xs transition-colors">
                                        {hoveredDateInfo ? (
                                            hoveredDateInfo.event ? (
                                                <div className="flex items-center gap-2 truncate text-[#101216] dark:text-white">
                                                    <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
                                                    <span className="font-bold tabular-nums">{hoveredDateInfo.dateStr}</span>
                                                    <span className="text-[#5c6370] dark:text-[#a7adbb]">·</span>
                                                    <span className="font-semibold truncate">📍 {hoveredDateInfo.event.location}</span>
                                                    {hoveredDateInfo.event.distances && (
                                                        <>
                                                            <span className="text-[#5c6370] dark:text-[#a7adbb]">·</span>
                                                            <span className="tabular-nums font-medium text-[#5c6370] dark:text-[#a7adbb]">
                                                                {hoveredDateInfo.event.distances} km
                                                            </span>
                                                        </>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2 text-[#5c6370] dark:text-[#a7adbb]">
                                                    <span className="h-2 w-2 rounded-full bg-slate-400 shrink-0" />
                                                    <span className="font-bold tabular-nums text-[#101216] dark:text-white">{hoveredDateInfo.dateStr}</span>
                                                    <span>· Voir dans le calendrier</span>
                                                </div>
                                            )
                                        ) : (
                                            <p className="text-[11px] text-[#5c6370] dark:text-[#a7adbb] flex items-center gap-1.5 truncate">
                                                <CalendarDaysIcon className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                                                <span>Cliquez sur une date pour ouvrir la sortie dans le calendrier.</span>
                                            </p>
                                        )}
                                    </div>

                                    <div className="flex flex-wrap gap-1.5">
                                        {selectedMember.dates.map((date) => {
                                            const parsed = parseDateInfo(date, selectedYear);
                                            const isoDate = parsed ? parsed.isoDate : date;
                                            const event = eventsByIsoDate.get(isoDate);
                                            const targetUrl = `/calendrier?date=${isoDate}${event ? `&event=${event.id}` : ''}`;

                                            return (
                                                <Link
                                                    key={date}
                                                    href={targetUrl}
                                                    onMouseEnter={() => setHoveredDateInfo({ dateStr: date, event })}
                                                    onMouseLeave={() => setHoveredDateInfo(null)}
                                                    onFocus={() => setHoveredDateInfo({ dateStr: date, event })}
                                                    onBlur={() => setHoveredDateInfo(null)}
                                                    title={event ? `${date} - ${event.location} (cliquer pour voir dans le calendrier)` : `${date} (cliquer pour voir dans le calendrier)`}
                                                    className="group inline-flex items-center gap-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1 text-xs font-medium text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50 hover:bg-emerald-600 hover:text-white hover:border-emerald-600 dark:hover:bg-emerald-500 dark:hover:text-[#0a0c10] dark:hover:border-emerald-500 transition-all duration-150 cursor-pointer shadow-2xs hover:shadow-xs active:scale-95"
                                                >
                                                    <span className="tabular-nums">{date}</span>
                                                    <ArrowTopRightOnSquareIcon className="h-3 w-3 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform shrink-0" />
                                                </Link>
                                            );
                                        })}
                                        {selectedMember.dates.length === 0 && (
                                            <p className="text-xs italic text-[#7d8493] dark:text-[#a7adbb]">
                                                Aucune sortie enregistrée pour cette saison.
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="p-4 border-t border-[#efece5] dark:border-[#262b38] flex justify-end">
                                <button
                                    onClick={handleClose}
                                    className="rounded-full border border-[#e4e0d8] dark:border-[#262b38] bg-white dark:bg-[#161922] px-5 py-2 text-xs font-semibold text-[#3a3f4a] dark:text-[#f5f6f8] hover:bg-[#f2efe9] dark:hover:bg-[#202533] transition-colors cursor-pointer"
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
