'use client';

import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import {
    XMarkIcon,
    ArrowTopRightOnSquareIcon,
    CalendarDaysIcon,
    FlagIcon,
    TrophyIcon,
    ShieldCheckIcon,
    StarIcon,
    MapPinIcon,
    SparklesIcon,
} from '@heroicons/react/24/outline';
import {
    TrophySquareIcon,
    BicycleIcon,
    CrownIcon,
    PodiumMedalIcon,
} from '../components/ui/CyclingIcons';
import { CalendarEvent } from '../types';
import { parseDateInfo, HallOfFameMember, FidelityGrade } from '../lib/carreVert';

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
    isHallOfFame?: boolean;
    hallOfFame?: HallOfFameMember[];
};

// Formats dates consistently in French (e.g., "12 avr. 2026") using UTC to prevent shifts
function formatFrenchDate(dateStr: string, defaultYear?: number): string {
    const info = parseDateInfo(dateStr, defaultYear);
    if (!info) return dateStr;
    const date = new Date(Date.UTC(info.year, info.month - 1, info.day));
    return date.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        timeZone: 'UTC',
    });
}

// Reusable Group Badge Component
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

// Vector Medal Badge Component for Podiums
const PodiumMedalBadge = ({
    rank,
    variant = 'seasonal',
}: {
    rank: number;
    variant?: 'seasonal' | 'hof';
}): React.ReactElement => {
    if (rank === 1) {
        return (
            <div className={`flex h-7 w-7 items-center justify-center rounded-md shrink-0 ${
                variant === 'hof'
                    ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 ring-1 ring-amber-500/30'
                    : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 ring-1 ring-emerald-500/30'
            }`}>
                <CrownIcon className="h-4 w-4" aria-hidden="true" />
            </div>
        );
    }
    if (rank === 2) {
        return (
            <div className="flex h-7 w-7 items-center justify-center rounded-md shrink-0 bg-slate-100 text-slate-700 dark:bg-slate-800/80 dark:text-slate-300 ring-1 ring-slate-400/30">
                <PodiumMedalIcon className="h-4 w-4" aria-hidden="true" />
            </div>
        );
    }
    return (
        <div className="flex h-7 w-7 items-center justify-center rounded-md shrink-0 bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400 ring-1 ring-amber-700/30">
            <PodiumMedalIcon className="h-4 w-4" aria-hidden="true" />
        </div>
    );
};

// Fidelity Grade Badge Component for Hall of Fame (strictly vector SVG)
const FidelityGradeBadge = ({
    grade,
    label,
}: {
    grade: FidelityGrade;
    label: string;
}): React.ReactElement => {
    const styles = {
        legend: 'bg-amber-50 text-amber-800 ring-amber-600/20 dark:bg-amber-950/40 dark:text-amber-300 dark:ring-amber-500/30',
        pillar: 'bg-emerald-50 text-emerald-800 ring-emerald-600/20 dark:bg-emerald-950/40 dark:text-emerald-300 dark:ring-emerald-500/30',
        veteran: 'bg-blue-50 text-blue-800 ring-blue-600/20 dark:bg-blue-950/40 dark:text-blue-300 dark:ring-blue-500/30',
        faithful: 'bg-purple-50 text-purple-800 ring-purple-600/20 dark:bg-purple-950/40 dark:text-purple-300 dark:ring-purple-500/30',
        newcomer: 'bg-[#f2efe9] text-[#5c6370] ring-gray-500/10 dark:bg-[#1c202a] dark:text-[#a7adbb] dark:ring-white/10',
    }[grade];

    const renderIcon = () => {
        switch (grade) {
            case 'legend':
                return <CrownIcon className="h-3.5 w-3.5 shrink-0 text-amber-600 dark:text-amber-400" aria-hidden="true" />;
            case 'pillar':
                return <ShieldCheckIcon className="h-3.5 w-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />;
            case 'veteran':
                return <BicycleIcon className="h-3.5 w-3.5 shrink-0 text-blue-600 dark:text-blue-400" aria-hidden="true" />;
            case 'faithful':
                return <StarIcon className="h-3.5 w-3.5 shrink-0 text-purple-600 dark:text-purple-400" aria-hidden="true" />;
            case 'newcomer':
            default:
                return <SparklesIcon className="h-3.5 w-3.5 shrink-0 text-[#5c6370] dark:text-[#a7adbb]" aria-hidden="true" />;
        }
    };

    return (
        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${styles}`}>
            {renderIcon()}
            <span>{label}</span>
        </span>
    );
};

// Honors Badge Component (strictly vector SVG)
const HonorsBadge = ({ text }: { text: string }): React.ReactElement => (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 dark:bg-amber-950/50 px-2.5 py-0.5 text-[11px] font-bold text-amber-800 dark:text-amber-300 ring-1 ring-inset ring-amber-600/20">
        <TrophyIcon className="h-3 w-3 shrink-0 text-amber-600 dark:text-amber-400" aria-hidden="true" />
        <span className="tabular-nums">{text}</span>
    </span>
);

// Seasonal Podium Card Component (Flat-by-default, hairline depth)
const SeasonalPodiumCard = ({
    entry,
    rank,
    onSelect,
    totalPossibleRides,
    selectedYear,
}: {
    entry: LeaderboardEntry;
    rank: number;
    onSelect: (id: string) => void;
    totalPossibleRides: number;
    selectedYear: number;
}): React.ReactElement => {
    const titleColor = rank === 1 ? "text-emerald-700 dark:text-emerald-400" : "text-[#101216] dark:text-white";
    const borderStyle = rank === 1
        ? "border-2 border-emerald-600/70 dark:border-emerald-500/70 bg-white dark:bg-[#161922] shadow-2xs hover:shadow-md"
        : "border border-[#e4e0d8] dark:border-[#262b38] bg-[#faf8f5]/80 dark:bg-[#101216] shadow-2xs hover:shadow-xs";
    const lastDate = entry.dates.length > 0 ? formatFrenchDate(entry.dates[entry.dates.length - 1], selectedYear) : "Aucune";

    const fidelity = totalPossibleRides > 0
        ? Math.round((entry.rides / totalPossibleRides) * 100)
        : 0;

    return (
        <div
            tabIndex={0}
            role="button"
            aria-label={`Voir les présences de ${entry.name}, ${rank === 1 ? 'champion' : rank === 2 ? '2ème place' : '3ème place'}`}
            onClick={() => onSelect(entry.id)}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelect(entry.id);
                }
            }}
            className={`rounded-lg p-6 sm:p-8 ${borderStyle} flex flex-col justify-between transition-[transform,box-shadow] duration-150 cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-[#e03e3e] active:scale-[0.99] motion-reduce:transition-none motion-reduce:transform-none`}
        >
            <div>
                <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                        <PodiumMedalBadge rank={rank} variant="seasonal" />
                        <h3 className={`text-base font-bold leading-6 ${titleColor}`}>
                            {rank === 1 ? "Champion" : rank === 2 ? "2ème Place" : "3ème Place"}
                        </h3>
                    </div>
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

// Hall of Fame Podium Card Component (Flat-by-default, hairline depth)
const HofPodiumCard = ({
    member,
    rank,
    onSelect,
}: {
    member: HallOfFameMember;
    rank: number;
    onSelect: (id: string) => void;
}): React.ReactElement => {
    const titleColor = rank === 1 ? "text-amber-600 dark:text-amber-400" : "text-[#101216] dark:text-white";
    const borderStyle = rank === 1
        ? "border-2 border-amber-500/80 dark:border-amber-400/80 bg-white dark:bg-[#161922] shadow-2xs hover:shadow-md"
        : "border border-[#e4e0d8] dark:border-[#262b38] bg-[#faf8f5]/80 dark:bg-[#101216] shadow-2xs hover:shadow-xs";

    return (
        <div
            tabIndex={0}
            role="button"
            aria-label={`Voir le palmarès de ${member.name}, ${rank === 1 ? '1ère place historique' : rank === 2 ? '2ème place historique' : '3ème place historique'}`}
            onClick={() => onSelect(member.id)}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelect(member.id);
                }
            }}
            className={`rounded-lg p-6 sm:p-8 ${borderStyle} flex flex-col justify-between transition-[transform,box-shadow] duration-150 cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-[#e03e3e] active:scale-[0.99] motion-reduce:transition-none motion-reduce:transform-none`}
        >
            <div>
                <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                        <PodiumMedalBadge rank={rank} variant="hof" />
                        <h3 className={`text-base font-bold leading-6 ${titleColor}`}>
                            {rank === 1 ? "Grand Pilier" : rank === 2 ? "2ème Légende" : "3ème Légende"}
                        </h3>
                    </div>
                    <GroupBadge group={member.group} />
                </div>

                <p className="mt-4 text-xl font-bold tracking-tight text-[#101216] dark:text-white truncate">{member.name}</p>
                <div className="mt-2.5">
                    <FidelityGradeBadge grade={member.fidelityGrade} label={member.fidelityGradeLabel} />
                </div>

                <div className="mt-6 flex items-baseline gap-x-2">
                    <span className="text-4xl sm:text-5xl font-extrabold tracking-tight text-[#101216] dark:text-white tabular-nums">{member.totalCarres}</span>
                    <span className="text-sm font-semibold text-[#5c6370] dark:text-[#a7adbb]">Carrés Verts cumulés</span>
                </div>

                <ul role="list" className="mt-6 space-y-2.5 text-sm leading-6 text-[#3a3f4a] dark:text-[#a7adbb]">
                    <li className="flex gap-x-2 tabular-nums">
                        <span className="font-semibold text-[#101216] dark:text-white">Saisons actives :</span>
                        <span>{member.activeSeasons.length} ({member.activeSeasons.join(', ') || 'Aucune'})</span>
                    </li>
                    <li className="flex gap-x-2 tabular-nums">
                        <span className="font-semibold text-[#101216] dark:text-white">Sorties physiques :</span>
                        <span>{member.totalPhysicalRides} participations</span>
                    </li>
                    {member.honors.length > 0 && (
                        <li className="pt-2 flex flex-wrap gap-1.5">
                            {member.honors.map((h) => (
                                <HonorsBadge key={h} text={h} />
                            ))}
                        </li>
                    )}
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
    isHallOfFame = false,
    hallOfFame = [],
}: Props): React.ReactElement {
    const [selectedMemberId, setSelectedMemberId] = useState<string | null>(() => initialMemberId || null);
    const [open, setOpen] = useState(() => Boolean(initialMemberId));
    const [hoveredDateInfo, setHoveredDateInfo] = useState<{
        dateStr: string;
        event?: CalendarEvent;
    } | null>(null);

    const drawerRef = useRef<HTMLDivElement>(null);
    const closeButtonRef = useRef<HTMLButtonElement>(null);
    const previouslyFocusedElementRef = useRef<HTMLElement | null>(null);

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

    // Derive selected member data for Seasonal and Hall of Fame modes
    const selectedSeasonalEntry = useMemo(() => {
        if (!selectedMemberId) return null;
        return entries.find((e) => e.id === selectedMemberId) || null;
    }, [entries, selectedMemberId]);

    const selectedHofMember = useMemo(() => {
        if (!selectedMemberId) return null;
        return hallOfFame.find((m) => m.id === selectedMemberId) || null;
    }, [hallOfFame, selectedMemberId]);

    const handleSelectMember = useCallback((id: string) => {
        if (typeof document !== 'undefined') {
            previouslyFocusedElementRef.current = document.activeElement as HTMLElement;
        }
        setSelectedMemberId(id);
        setOpen(true);
        if (typeof window !== 'undefined') {
            const url = new URL(window.location.href);
            url.searchParams.set('member', id);
            window.history.replaceState({}, '', url.toString());
        }
    }, []);

    const handleClose = useCallback(() => {
        setOpen(false);
        setSelectedMemberId(null);
        setHoveredDateInfo(null);
        if (typeof window !== 'undefined') {
            const url = new URL(window.location.href);
            url.searchParams.delete('member');
            window.history.replaceState({}, '', url.toString());
        }
        requestAnimationFrame(() => {
            previouslyFocusedElementRef.current?.focus();
        });
    }, []);

    // Focus trap, Escape key handling, and background scroll locking for drawer
    useEffect(() => {
        if (!open) return;

        const timer = setTimeout(() => {
            closeButtonRef.current?.focus();
        }, 50);

        const handleKeyDown = (e: KeyboardEvent): void => {
            if (e.key === 'Escape') {
                e.preventDefault();
                handleClose();
                return;
            }

            if (e.key === 'Tab' && drawerRef.current) {
                const focusableElements = drawerRef.current.querySelectorAll<HTMLElement>(
                    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
                );
                if (focusableElements.length === 0) return;

                const firstElement = focusableElements[0];
                const lastElement = focusableElements[focusableElements.length - 1];

                if (e.shiftKey) {
                    if (document.activeElement === firstElement) {
                        e.preventDefault();
                        lastElement.focus();
                    }
                } else {
                    if (document.activeElement === lastElement) {
                        e.preventDefault();
                        firstElement.focus();
                    }
                }
            }
        };

        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            clearTimeout(timer);
            document.body.style.overflow = originalOverflow;
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [open, handleClose]);

    // Seasonal computations (only members with rides > 0)
    const sortedSeasonalEntries = useMemo(() => {
        return [...entries].sort((a, b) => b.rides - a.rides);
    }, [entries]);

    const activeSeasonalEntries = useMemo(() => {
        return sortedSeasonalEntries.filter((e) => e.rides > 0);
    }, [sortedSeasonalEntries]);

    // Calculate Global Ranks (Competition Ranking: 1, 1, 3, 4...) for active seasonal members
    const seasonalGlobalRanks = useMemo(() => {
        const ranks: Record<string, number> = {};
        activeSeasonalEntries.forEach((entry, index) => {
            if (index > 0 && entry.rides === activeSeasonalEntries[index - 1].rides) {
                ranks[entry.id] = ranks[activeSeasonalEntries[index - 1].id];
            } else {
                ranks[entry.id] = index + 1;
            }
        });
        return ranks;
    }, [activeSeasonalEntries]);

    // Calculate Group Ranks within each group
    const seasonalGroupRanks = useMemo(() => {
        const ranks: Record<string, number> = {};
        const groupLists: Record<string, LeaderboardEntry[]> = {};

        activeSeasonalEntries.forEach((entry) => {
            if (!groupLists[entry.group]) groupLists[entry.group] = [];
            groupLists[entry.group].push(entry);
        });

        Object.values(groupLists).forEach((groupMembers) => {
            groupMembers.forEach((member, index) => {
                if (index > 0 && member.rides === groupMembers[index - 1].rides) {
                    ranks[member.id] = ranks[groupMembers[index - 1].id];
                } else {
                    ranks[member.id] = index + 1;
                }
            });
        });

        return ranks;
    }, [activeSeasonalEntries]);

    const seasonalTop3 = activeSeasonalEntries.slice(0, 3);
    const seasonalOthers = activeSeasonalEntries.slice(3);

    // Hall of Fame computations (only members with totalCarres > 0)
    const activeHofMembers = useMemo(() => {
        return hallOfFame.filter((m) => m.totalCarres > 0);
    }, [hallOfFame]);

    const hofGlobalRanks = useMemo(() => {
        const ranks: Record<string, number> = {};
        activeHofMembers.forEach((member, index) => {
            if (index > 0 && member.totalCarres === activeHofMembers[index - 1].totalCarres) {
                ranks[member.id] = ranks[activeHofMembers[index - 1].id];
            } else {
                ranks[member.id] = index + 1;
            }
        });
        return ranks;
    }, [activeHofMembers]);

    const hofTop3 = activeHofMembers.slice(0, 3);
    const hofOthers = activeHofMembers.slice(3);

    return (
        <>
            <main className="min-h-screen bg-[#faf8f5] dark:bg-[#0a0c10] transition-colors duration-200">
                {/* ──── Editorial Cover Hero ──── */}
                <section className="relative overflow-hidden editorial-hero-surface border-b border-[#e4e0d8] dark:border-[#262b38] transition-colors duration-200">
                    {/* Atmospheric Background Watermark */}
                    <div className="absolute top-32 sm:top-44 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none select-none opacity-[0.035] dark:opacity-[0.025] leading-none text-center">
                        <span className="text-[clamp(6rem,22vw,28rem)] font-extrabold uppercase tracking-tighter text-[#101216] dark:text-white whitespace-nowrap">
                            BLANMONT
                        </span>
                    </div>

                    <div className="relative mx-auto max-w-7xl px-4 pt-14 pb-10 sm:px-6 sm:pt-20 sm:pb-12 lg:px-8 z-10">
                        {/* Title row */}
                        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
                            <div className="space-y-3 max-w-3xl">
                                <h1 className="text-[clamp(2.25rem,6vw,4.25rem)] font-extrabold uppercase tracking-[-0.03em] leading-[0.98] text-balance text-[#101216] dark:text-white">
                                    {isHallOfFame ? (
                                        <>
                                            Hall of <span className="text-amber-600 dark:text-amber-400 italic">Fame</span>
                                        </>
                                    ) : (
                                        <>
                                            Le Carré <span className="text-emerald-500 dark:text-emerald-400 italic">Vert</span> {selectedYear}
                                        </>
                                    )}
                                </h1>

                                <p className="max-w-2xl text-base text-[#5c6370] dark:text-[#a7adbb] leading-relaxed">
                                    {isHallOfFame
                                        ? "Le panthéon et classement historique cumulé récompensant la fidélité, l'engagement et l'assiduité des cyclistes de Blanmont au fil des saisons."
                                        : `Le classement officiel d'assiduité récompensant la régularité et l'engagement des cyclistes de Blanmont tout au long de la saison ${selectedYear}.`}
                                </p>
                            </div>

                            {/* Multi-Season & Hall of Fame Navigation Selector */}
                            <nav
                                aria-label="Sélection de la saison ou Hall of Fame"
                                className="inline-flex max-w-full items-center gap-1 rounded-lg bg-white dark:bg-[#161922] p-1 border border-[#e4e0d8] dark:border-[#262b38] shrink-0 shadow-2xs overflow-x-auto no-scrollbar scroll-smooth"
                            >
                                {availableYears.map((year) => {
                                    const isSelected = !isHallOfFame && year === selectedYear;
                                    return (
                                        <Link
                                            key={year}
                                            href={`/leaderboard?year=${year}`}
                                            prefetch={true}
                                            aria-current={isSelected ? 'page' : undefined}
                                            className={`min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-md px-3.5 py-2 text-xs font-bold uppercase tracking-wider tabular-nums cursor-pointer transition-[color,background-color,transform] duration-150 motion-reduce:transition-none ${
                                                isSelected
                                                    ? 'bg-emerald-600 text-white shadow-2xs'
                                                    : 'text-[#5c6370] dark:text-[#a7adbb] hover:text-[#101216] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 active:scale-95'
                                            }`}
                                        >
                                            {year}
                                        </Link>
                                    );
                                })}

                                <span className="w-px h-6 bg-[#e4e0d8] dark:bg-[#262b38] mx-0.5" aria-hidden="true" />

                                <Link
                                    href="/leaderboard?year=all"
                                    prefetch={true}
                                    aria-current={isHallOfFame ? 'page' : undefined}
                                    className={`min-h-[44px] inline-flex items-center justify-center gap-1.5 rounded-md px-3.5 py-2 text-xs font-bold uppercase tracking-wider cursor-pointer transition-[color,background-color,transform] duration-150 motion-reduce:transition-none ${
                                        isHallOfFame
                                            ? 'bg-amber-600 text-white shadow-2xs'
                                            : 'text-[#5c6370] dark:text-[#a7adbb] hover:text-[#101216] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 active:scale-95'
                                    }`}
                                >
                                    <TrophySquareIcon className="h-4 w-4" aria-hidden="true" />
                                    <span>Hall of Fame</span>
                                </Link>
                            </nav>
                        </div>

                        {/* Stat Strip on Hero */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-[#e4e0d8] dark:divide-white/10 pt-8 sm:pt-10">
                            {isHallOfFame ? (
                                <>
                                    {/* All-Time Leader */}
                                    <div className="py-3 sm:py-0 sm:px-6 first:sm:pl-0 flex items-center gap-4">
                                        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#faf8f5] dark:bg-[#101216] border border-[#e4e0d8] dark:border-[#262b38] text-amber-600 shrink-0 shadow-2xs">
                                            <TrophySquareIcon className="h-5 w-5" aria-hidden="true" />
                                        </div>
                                        <div className="min-w-0">
                                            <div className="text-2xl sm:text-3xl font-extrabold text-[#101216] dark:text-white tracking-tight truncate">
                                                {hofTop3[0]?.name || 'En cours'}
                                            </div>
                                            <div className="text-xs uppercase tracking-[0.08em] text-[#5c6370] dark:text-[#a7adbb] font-semibold tabular-nums">
                                                Grand Pilier ({hofTop3[0] ? `${hofTop3[0].totalCarres} carrés` : '0 carré'})
                                            </div>
                                        </div>
                                    </div>

                                    {/* All-time Ranked Members */}
                                    <div className="py-3 sm:py-0 sm:px-6 flex items-center gap-4">
                                        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#faf8f5] dark:bg-[#101216] border border-[#e4e0d8] dark:border-[#262b38] text-[#101216] dark:text-white shrink-0 shadow-2xs">
                                            <BicycleIcon className="h-5 w-5" aria-hidden="true" />
                                        </div>
                                        <div>
                                            <div className="text-2xl sm:text-3xl font-extrabold text-[#101216] dark:text-white tabular-nums tracking-tight">
                                                {activeHofMembers.length}
                                            </div>
                                            <div className="text-xs uppercase tracking-[0.08em] text-[#5c6370] dark:text-[#a7adbb] font-semibold">
                                                Membres au palmarès
                                            </div>
                                        </div>
                                    </div>

                                    {/* Archived Seasons */}
                                    <div className="py-3 sm:py-0 sm:px-6 last:sm:pr-0 flex items-center gap-4">
                                        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#faf8f5] dark:bg-[#101216] border border-[#e4e0d8] dark:border-[#262b38] text-[#101216] dark:text-white shrink-0 shadow-2xs">
                                            <CalendarDaysIcon className="h-5 w-5" aria-hidden="true" />
                                        </div>
                                        <div>
                                            <div className="text-2xl sm:text-3xl font-extrabold text-[#101216] dark:text-white tabular-nums tracking-tight">
                                                {availableYears.length}
                                            </div>
                                            <div className="text-xs uppercase tracking-[0.08em] text-[#5c6370] dark:text-[#a7adbb] font-semibold">
                                                Saisons ({availableYears[0]} – {availableYears[availableYears.length - 1]})
                                            </div>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    {/* Seasonal Leader */}
                                    <div className="py-3 sm:py-0 sm:px-6 first:sm:pl-0 flex items-center gap-4">
                                        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#faf8f5] dark:bg-[#101216] border border-[#e4e0d8] dark:border-[#262b38] text-[#e03e3e] shrink-0 shadow-2xs">
                                            <TrophySquareIcon className="h-5 w-5" aria-hidden="true" />
                                        </div>
                                        <div className="min-w-0">
                                            <div className="text-2xl sm:text-3xl font-extrabold text-[#101216] dark:text-white tracking-tight truncate">
                                                {seasonalTop3[0]?.name || 'En cours'}
                                            </div>
                                            <div className="text-xs uppercase tracking-[0.08em] text-[#5c6370] dark:text-[#a7adbb] font-semibold tabular-nums">
                                                Leader ({seasonalTop3[0] ? `${seasonalTop3[0].rides} sorties` : '0 sortie'})
                                            </div>
                                        </div>
                                    </div>

                                    {/* Seasonal Members Ranked */}
                                    <div className="py-3 sm:py-0 sm:px-6 flex items-center gap-4">
                                        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#faf8f5] dark:bg-[#101216] border border-[#e4e0d8] dark:border-[#262b38] text-[#101216] dark:text-white shrink-0 shadow-2xs">
                                            <BicycleIcon className="h-5 w-5" aria-hidden="true" />
                                        </div>
                                        <div>
                                            <div className="text-2xl sm:text-3xl font-extrabold text-[#101216] dark:text-white tabular-nums tracking-tight">
                                                {activeSeasonalEntries.length}
                                            </div>
                                            <div className="text-xs uppercase tracking-[0.08em] text-[#5c6370] dark:text-[#a7adbb] font-semibold">
                                                Membres classés
                                            </div>
                                        </div>
                                    </div>

                                    {/* Seasonal Total Rides */}
                                    <div className="py-3 sm:py-0 sm:px-6 last:sm:pr-0 flex items-center gap-4">
                                        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#faf8f5] dark:bg-[#101216] border border-[#e4e0d8] dark:border-[#262b38] text-[#101216] dark:text-white shrink-0 shadow-2xs">
                                            <FlagIcon className="h-5 w-5" aria-hidden="true" />
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
                                </>
                            )}
                        </div>
                    </div>
                </section>

                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
                    {/* ──── HALL OF FAME VIEW ──── */}
                    {isHallOfFame ? (
                        <>
                            {activeHofMembers.length === 0 ? (
                                <div className="mx-auto mt-12 max-w-2xl rounded-xl border border-[#e4e0d8] dark:border-[#262b38] bg-white dark:bg-[#161922] p-8 sm:p-12 text-center shadow-2xs">
                                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-lg bg-[#faf8f5] dark:bg-[#101216] border border-[#e4e0d8] dark:border-[#262b38] text-amber-600 dark:text-amber-400 mb-5">
                                        <TrophySquareIcon className="h-7 w-7" aria-hidden="true" />
                                    </div>
                                    <h3 className="text-lg sm:text-xl font-bold uppercase tracking-tight text-[#101216] dark:text-white">
                                        Aucun historique de présence répertorié
                                    </h3>
                                    <p className="mt-2 text-sm text-[#5c6370] dark:text-[#a7adbb] max-w-md mx-auto leading-relaxed">
                                        Le Hall of Fame agrège les participations enregistrées sur toutes les saisons officielles.
                                    </p>
                                </div>
                            ) : (
                                <>
                                    {/* Hall of Fame Podium */}
                                    {hofTop3.length > 0 && (
                                        <div className="mx-auto mt-6 sm:mt-8 grid max-w-2xl grid-cols-1 items-end gap-8 lg:mx-0 lg:max-w-none lg:grid-cols-3">
                                            {/* 2nd Place */}
                                            <div className="order-2 lg:order-1">
                                                {hofTop3[1] && (
                                                    <HofPodiumCard
                                                        member={hofTop3[1]}
                                                        rank={hofGlobalRanks[hofTop3[1].id]}
                                                        onSelect={handleSelectMember}
                                                    />
                                                )}
                                            </div>

                                            {/* 1st Place */}
                                            <div className="order-1 lg:order-2">
                                                {hofTop3[0] && (
                                                    <HofPodiumCard
                                                        member={hofTop3[0]}
                                                        rank={hofGlobalRanks[hofTop3[0].id]}
                                                        onSelect={handleSelectMember}
                                                    />
                                                )}
                                            </div>

                                            {/* 3rd Place */}
                                            <div className="order-3 lg:order-3">
                                                {hofTop3[2] && (
                                                    <HofPodiumCard
                                                        member={hofTop3[2]}
                                                        rank={hofGlobalRanks[hofTop3[2].id]}
                                                        onSelect={handleSelectMember}
                                                    />
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Hall of Fame Table (from #4 onwards) */}
                                    {hofOthers.length > 0 && (
                                        <div className="mt-16 sm:mt-20 overflow-hidden shadow-2xs ring-1 ring-[#e4e0d8] dark:ring-[#262b38] sm:rounded-lg bg-white dark:bg-[#101216] transition-colors">
                                            <div className="overflow-x-auto">
                                                <table className="min-w-full divide-y divide-[#e4e0d8] dark:divide-[#262b38]">
                                                    <thead className="bg-[#f2efe9] dark:bg-[#161922]">
                                                        <tr>
                                                            <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-xs font-semibold uppercase tracking-wider text-[#5c6370] dark:text-[#a7adbb] sm:pl-6">
                                                                Rang
                                                            </th>
                                                            <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-xs font-semibold uppercase tracking-wider text-[#5c6370] dark:text-[#a7adbb]">
                                                                Cycliste & Titre
                                                            </th>
                                                            <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-[#5c6370] dark:text-[#a7adbb]">
                                                                Groupe
                                                            </th>
                                                            <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-[#5c6370] dark:text-[#a7adbb]">
                                                                Saisons
                                                            </th>
                                                            <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-[#5c6370] dark:text-[#a7adbb]">
                                                                Carrés Verts
                                                            </th>
                                                            <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-[#5c6370] dark:text-[#a7adbb]">
                                                                Sorties
                                                            </th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-[#e4e0d8] dark:divide-[#262b38] bg-white dark:bg-[#101216]">
                                                        {hofOthers.map((member) => {
                                                            const rank = hofGlobalRanks[member.id];
                                                            return (
                                                                <tr
                                                                    key={member.id}
                                                                    tabIndex={0}
                                                                    role="button"
                                                                    aria-label={`Voir le palmarès de ${member.name}, rang ${rank}`}
                                                                    onClick={() => handleSelectMember(member.id)}
                                                                    onKeyDown={(e) => {
                                                                        if (e.key === 'Enter' || e.key === ' ') {
                                                                            e.preventDefault();
                                                                            handleSelectMember(member.id);
                                                                        }
                                                                    }}
                                                                    className="hover:bg-[#f2efe9] dark:hover:bg-[#161922] focus:outline-hidden focus-visible:bg-[#f2efe9] dark:focus-visible:bg-[#161922] focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#e03e3e] transition-colors cursor-pointer"
                                                                >
                                                                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-bold text-[#101216] dark:text-white tabular-nums sm:pl-6">
                                                                        #{rank}
                                                                    </td>
                                                                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm">
                                                                        <div className="flex flex-col sm:flex-row sm:items-center gap-1.5">
                                                                            <span className="font-bold text-[#101216] dark:text-white">
                                                                                {member.name}
                                                                            </span>
                                                                            <div className="flex items-center gap-1">
                                                                                <FidelityGradeBadge grade={member.fidelityGrade} label={member.fidelityGradeLabel} />
                                                                                {member.honors.map((h) => (
                                                                                    <HonorsBadge key={h} text={h} />
                                                                                ))}
                                                                            </div>
                                                                        </div>
                                                                    </td>
                                                                    <td className="whitespace-nowrap px-3 py-4 text-sm">
                                                                        <GroupBadge group={member.group} />
                                                                    </td>
                                                                    <td className="whitespace-nowrap px-3 py-4 text-sm">
                                                                        <div className="flex items-center gap-1 flex-wrap">
                                                                            {member.activeSeasons.map((y) => (
                                                                                <span
                                                                                    key={y}
                                                                                    className="inline-flex items-center rounded-sm bg-[#f2efe9] dark:bg-[#1c202a] px-1.5 py-0.5 text-[11px] font-semibold text-[#3a3f4a] dark:text-[#a7adbb] tabular-nums"
                                                                                >
                                                                                    {y}
                                                                                </span>
                                                                            ))}
                                                                        </div>
                                                                    </td>
                                                                    <td className="whitespace-nowrap px-3 py-4 text-sm font-extrabold text-emerald-700 dark:text-emerald-400 tabular-nums">
                                                                        {member.totalCarres}
                                                                    </td>
                                                                    <td className="whitespace-nowrap px-3 py-4 text-sm font-medium text-[#5c6370] dark:text-[#a7adbb] tabular-nums">
                                                                        {member.totalPhysicalRides}
                                                                    </td>
                                                                </tr>
                                                            );
                                                        })}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </>
                    ) : (
                        /* ──── SEASONAL VIEW ──── */
                        <>
                            {/* Empty State when season has no recorded rides */}
                            {activeSeasonalEntries.length === 0 && (
                                <div className="mx-auto mt-12 max-w-2xl rounded-xl border border-[#e4e0d8] dark:border-[#262b38] bg-white dark:bg-[#161922] p-8 sm:p-12 text-center shadow-2xs">
                                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-lg bg-[#faf8f5] dark:bg-[#101216] border border-[#e4e0d8] dark:border-[#262b38] text-emerald-600 dark:text-emerald-400 mb-5">
                                        <TrophySquareIcon className="h-7 w-7" aria-hidden="true" />
                                    </div>
                                    <h3 className="text-lg sm:text-xl font-bold uppercase tracking-tight text-[#101216] dark:text-white">
                                        Aucun classement pour la saison {selectedYear}
                                    </h3>
                                    <p className="mt-2 text-sm text-[#5c6370] dark:text-[#a7adbb] max-w-md mx-auto leading-relaxed">
                                        Les points du Carré Vert sont enregistrés à l&apos;issue de chaque sortie officielle du peloton. Consultez les saisons précédentes ou explorez le calendrier.
                                    </p>
                                    <div className="mt-6 flex flex-wrap justify-center gap-3">
                                        <Link
                                            href="/calendrier"
                                            className="min-h-[44px] inline-flex items-center justify-center rounded-md bg-[#e03e3e] hover:bg-[#c93434] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-xs transition-[background-color,transform] duration-150 active:scale-95 motion-reduce:transition-none"
                                        >
                                            Voir le calendrier
                                        </Link>
                                        <Link
                                            href="/leaderboard?year=all"
                                            className="min-h-[44px] inline-flex items-center justify-center rounded-md border border-[#e4e0d8] dark:border-[#262b38] bg-[#faf8f5] dark:bg-[#101216] hover:bg-[#f2efe9] dark:hover:bg-[#1c202a] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-[#101216] dark:text-white shadow-2xs transition-[background-color,transform] duration-150 active:scale-95 motion-reduce:transition-none"
                                        >
                                            Consulter le Hall of Fame
                                        </Link>
                                        {availableYears.filter((y) => y !== selectedYear).slice(0, 1).map((fallbackYear) => (
                                            <Link
                                                key={fallbackYear}
                                                href={`/leaderboard?year=${fallbackYear}`}
                                                className="min-h-[44px] inline-flex items-center justify-center rounded-md border border-[#e4e0d8] dark:border-[#262b38] bg-[#faf8f5] dark:bg-[#101216] hover:bg-[#f2efe9] dark:hover:bg-[#1c202a] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-[#101216] dark:text-white shadow-2xs transition-[background-color,transform] duration-150 active:scale-95 motion-reduce:transition-none"
                                            >
                                                Saison {fallbackYear}
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Seasonal Podium Section */}
                            {seasonalTop3.length > 0 && (
                                <div className="mx-auto mt-6 sm:mt-8 grid max-w-2xl grid-cols-1 items-end gap-8 lg:mx-0 lg:max-w-none lg:grid-cols-3">
                                    {/* 2nd Place */}
                                    <div className="order-2 lg:order-1">
                                        {seasonalTop3[1] && (
                                            <SeasonalPodiumCard
                                                entry={seasonalTop3[1]}
                                                rank={seasonalGlobalRanks[seasonalTop3[1].id]}
                                                onSelect={handleSelectMember}
                                                totalPossibleRides={totalPossibleRides}
                                                selectedYear={selectedYear}
                                            />
                                        )}
                                    </div>

                                    {/* 1st Place */}
                                    <div className="order-1 lg:order-2">
                                        {seasonalTop3[0] && (
                                            <SeasonalPodiumCard
                                                entry={seasonalTop3[0]}
                                                rank={seasonalGlobalRanks[seasonalTop3[0].id]}
                                                onSelect={handleSelectMember}
                                                totalPossibleRides={totalPossibleRides}
                                                selectedYear={selectedYear}
                                            />
                                        )}
                                    </div>

                                    {/* 3rd Place */}
                                    <div className="order-3 lg:order-3">
                                        {seasonalTop3[2] && (
                                            <SeasonalPodiumCard
                                                entry={seasonalTop3[2]}
                                                rank={seasonalGlobalRanks[seasonalTop3[2].id]}
                                                onSelect={handleSelectMember}
                                                totalPossibleRides={totalPossibleRides}
                                                selectedYear={selectedYear}
                                            />
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Seasonal Table (from #4 onwards) */}
                            {seasonalOthers.length > 0 && (
                                <div className="mt-16 sm:mt-20 overflow-hidden shadow-2xs ring-1 ring-[#e4e0d8] dark:ring-[#262b38] sm:rounded-lg bg-white dark:bg-[#101216] transition-colors">
                                    <div className="overflow-x-auto">
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
                                            <tbody className="divide-y divide-[#e4e0d8] dark:divide-[#262b38] bg-white dark:bg-[#101216]">
                                                {seasonalOthers.map((person) => {
                                                    const globalRank = seasonalGlobalRanks[person.id];
                                                    const groupRank = seasonalGroupRanks[person.id];
                                                    const isGroupTop3 = groupRank <= 3;

                                                    return (
                                                        <tr
                                                            key={person.id}
                                                            tabIndex={0}
                                                            role="button"
                                                            aria-label={`Voir les présences de ${person.name}, rang ${globalRank}`}
                                                            onClick={() => handleSelectMember(person.id)}
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter' || e.key === ' ') {
                                                                    e.preventDefault();
                                                                    handleSelectMember(person.id);
                                                                }
                                                            }}
                                                            className="hover:bg-[#f2efe9] dark:hover:bg-[#161922] focus:outline-hidden focus-visible:bg-[#f2efe9] dark:focus-visible:bg-[#161922] focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#e03e3e] transition-colors cursor-pointer"
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
                                                                <div className={`font-bold tabular-nums ${isGroupTop3 ? 'text-[#101216] dark:text-white' : 'text-[#3a3f4a] dark:text-[#d1d5db]'}`}>
                                                                    {person.rides}
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </main>

            {/* ──── Slide-over Drawer for Member Details ──── */}
            {open && (selectedSeasonalEntry || selectedHofMember) && (
                <div
                    className="fixed inset-0 z-50 overflow-hidden"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="drawer-title"
                >
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity animate-in fade-in duration-200 motion-reduce:transition-none motion-reduce:animate-none"
                        onClick={handleClose}
                        aria-hidden="true"
                    />

                    <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
                        <div
                            ref={drawerRef}
                            className="w-screen max-w-md bg-white dark:bg-[#101216] border-l border-[#e4e0d8] dark:border-[#262b38] shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 motion-reduce:animate-none transition-colors"
                        >
                            {/* Header: Editorial Dark Panel */}
                            <div className="bg-[#161922] border-b border-[#262b38] text-white p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-xs font-semibold uppercase tracking-wider text-[#a7adbb]">
                                        {isHallOfFame ? 'Dossier Palmarès' : `Saison ${selectedYear}`}
                                    </span>
                                    <button
                                        ref={closeButtonRef}
                                        onClick={handleClose}
                                        className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-md text-[#a7adbb] hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                                        aria-label="Fermer le panneau de détails"
                                    >
                                        <XMarkIcon className="h-5 w-5" />
                                    </button>
                                </div>
                                <h2 id="drawer-title" className="text-2xl font-bold tracking-tight text-white truncate">
                                    {selectedHofMember?.name || selectedSeasonalEntry?.name}
                                </h2>
                                <div className="mt-2 flex items-center gap-2 flex-wrap">
                                    {selectedHofMember && (
                                        <FidelityGradeBadge
                                            grade={selectedHofMember.fidelityGrade}
                                            label={selectedHofMember.fidelityGradeLabel}
                                        />
                                    )}
                                    {isHallOfFame ? (
                                        <p className="text-xs font-medium text-[#a7adbb]">
                                            Rang All-Time :{' '}
                                            <span className="text-amber-400 font-bold tabular-nums">
                                                #{selectedMemberId ? hofGlobalRanks[selectedMemberId] || '—' : '—'}
                                            </span>
                                        </p>
                                    ) : (
                                        <p className="text-xs font-medium text-[#a7adbb]">
                                            Rang saison {selectedYear} :{' '}
                                            <span className="text-emerald-400 font-bold tabular-nums">
                                                #{selectedMemberId ? seasonalGlobalRanks[selectedMemberId] || '—' : '—'}
                                            </span>
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-6 flex-1 overflow-y-auto space-y-6">
                                {isHallOfFame && selectedHofMember ? (
                                    /* ──── Hall of Fame Details ──── */
                                    <>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="rounded-md border border-[#e4e0d8] dark:border-[#262b38] bg-[#f2efe9]/70 dark:bg-[#161922] p-4">
                                                <div className="text-xs font-medium text-[#5c6370] dark:text-[#a7adbb]">Groupe habituel</div>
                                                <div className="mt-1">
                                                    <GroupBadge group={selectedHofMember.group} />
                                                </div>
                                            </div>
                                            <div className="rounded-md border border-[#e4e0d8] dark:border-[#262b38] bg-[#f2efe9]/70 dark:bg-[#161922] p-4">
                                                <div className="text-xs font-medium text-[#5c6370] dark:text-[#a7adbb]">Carrés Verts cumulés</div>
                                                <div className="mt-1 text-xl font-extrabold text-amber-600 dark:text-amber-400 tabular-nums">
                                                    {selectedHofMember.totalCarres}
                                                </div>
                                            </div>
                                            <div className="rounded-md border border-[#e4e0d8] dark:border-[#262b38] bg-[#f2efe9]/70 dark:bg-[#161922] p-4">
                                                <div className="text-xs font-medium text-[#5c6370] dark:text-[#a7adbb]">Saisons actives</div>
                                                <div className="mt-1 text-xl font-extrabold text-[#101216] dark:text-white tabular-nums">
                                                    {selectedHofMember.activeSeasons.length}
                                                </div>
                                            </div>
                                            <div className="rounded-md border border-[#e4e0d8] dark:border-[#262b38] bg-[#f2efe9]/70 dark:bg-[#161922] p-4">
                                                <div className="text-xs font-medium text-[#5c6370] dark:text-[#a7adbb]">Sorties physiques</div>
                                                <div className="mt-1 text-xl font-extrabold text-[#101216] dark:text-white tabular-nums">
                                                    {selectedHofMember.totalPhysicalRides}
                                                </div>
                                            </div>
                                        </div>

                                        {selectedHofMember.honors.length > 0 && (
                                            <div className="rounded-md border border-amber-200 dark:border-amber-900/40 bg-amber-50/50 dark:bg-amber-950/20 p-4">
                                                <div className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300 mb-2">
                                                    Palmarès & Titres
                                                </div>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {selectedHofMember.honors.map((h) => (
                                                        <HonorsBadge key={h} text={h} />
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Multi-Season Breakdown Cards */}
                                        <div className="border-t border-[#e4e0d8] dark:border-[#262b38] pt-6 space-y-4">
                                            <h3 className="text-sm font-bold text-[#101216] dark:text-white">
                                                Ventilation par saison
                                            </h3>

                                            <div className="space-y-3">
                                                {availableYears.map((year) => {
                                                    const s = selectedHofMember.seasonBreakdown[year];
                                                    const hasRides = s && s.carres > 0;

                                                    return (
                                                        <div
                                                            key={year}
                                                            className="rounded-lg border border-[#e4e0d8] dark:border-[#262b38] bg-[#faf8f5] dark:bg-[#161922] p-3.5"
                                                        >
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-xs font-bold uppercase tracking-wider text-[#101216] dark:text-white tabular-nums">
                                                                        Saison {year}
                                                                    </span>
                                                                    {s?.isChampion && (
                                                                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 px-2.5 py-0.5 text-[10px] font-bold ring-1 ring-amber-500/20">
                                                                            <CrownIcon className="h-3 w-3 shrink-0 text-amber-600 dark:text-amber-400" aria-hidden="true" />
                                                                            <span>Champion</span>
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 tabular-nums">
                                                                    {hasRides ? `${s.carres} Carrés Verts` : '0 sortie'}
                                                                </span>
                                                            </div>

                                                            {hasRides && s.dates.length > 0 && (
                                                                <div className="mt-3 flex flex-wrap gap-1.5 pt-2 border-t border-[#e4e0d8]/60 dark:border-[#262b38]">
                                                                    {s.dates.map((date) => {
                                                                        const parsed = parseDateInfo(date, year);
                                                                        const isoDate = parsed ? parsed.isoDate : date;
                                                                        const formattedDate = formatFrenchDate(date, year);
                                                                        const event = eventsByIsoDate.get(isoDate);

                                                                        return (
                                                                            <Link
                                                                                key={date}
                                                                                href={`/calendrier?date=${isoDate}${event ? `&event=${event.id}` : ''}`}
                                                                                className="inline-flex items-center gap-1 rounded-md bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 text-[11px] font-medium text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40 hover:bg-emerald-600 hover:text-white transition-colors"
                                                                            >
                                                                                <span className="tabular-nums">{formattedDate}</span>
                                                                                <ArrowTopRightOnSquareIcon className="h-3 w-3 opacity-60" />
                                                                            </Link>
                                                                        );
                                                                    })}
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    /* ──── Seasonal Details ──── */
                                    selectedSeasonalEntry && (
                                        <>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="rounded-md border border-[#e4e0d8] dark:border-[#262b38] bg-[#f2efe9]/70 dark:bg-[#161922] p-4">
                                                    <div className="text-xs font-medium text-[#5c6370] dark:text-[#a7adbb]">Groupe</div>
                                                    <div className="mt-1">
                                                        <GroupBadge group={selectedSeasonalEntry.group} />
                                                    </div>
                                                </div>
                                                <div className="rounded-md border border-[#e4e0d8] dark:border-[#262b38] bg-[#f2efe9]/70 dark:bg-[#161922] p-4">
                                                    <div className="text-xs font-medium text-[#5c6370] dark:text-[#a7adbb]">Sorties {selectedYear}</div>
                                                    <div className="mt-1 text-xl font-extrabold text-[#101216] dark:text-white tabular-nums">
                                                        {selectedSeasonalEntry.rides}
                                                    </div>
                                                </div>
                                                <div className="rounded-md border border-[#e4e0d8] dark:border-[#262b38] bg-[#f2efe9]/70 dark:bg-[#161922] p-4">
                                                    <div className="text-xs font-medium text-[#5c6370] dark:text-[#a7adbb]">Taux de Fidélité</div>
                                                    <div className="mt-1 text-xl font-extrabold text-emerald-600 dark:text-emerald-400 tabular-nums">
                                                        {totalPossibleRides > 0 ? Math.round((selectedSeasonalEntry.rides / totalPossibleRides) * 100) : 0}%
                                                    </div>
                                                </div>
                                                <div className="rounded-md border border-[#e4e0d8] dark:border-[#262b38] bg-[#f2efe9]/70 dark:bg-[#161922] p-4">
                                                    <div className="text-xs font-medium text-[#5c6370] dark:text-[#a7adbb]">Dernière sortie</div>
                                                    <div className="mt-1 text-xs font-bold text-[#101216] dark:text-white">
                                                        {selectedSeasonalEntry.dates.length > 0 ? formatFrenchDate(selectedSeasonalEntry.dates[selectedSeasonalEntry.dates.length - 1], selectedYear) : "Aucune"}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Link to view this member in Hall of Fame */}
                                            {selectedHofMember && (
                                                <Link
                                                    href={`/leaderboard?year=all&member=${selectedSeasonalEntry.id}`}
                                                    className="min-h-[44px] flex items-center justify-between rounded-lg border border-amber-200 dark:border-amber-900/40 bg-amber-50/50 dark:bg-amber-950/20 px-4 py-2.5 text-xs font-bold text-amber-800 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-950/40 transition-colors"
                                                >
                                                    <span className="flex items-center gap-2">
                                                        <TrophySquareIcon className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                                                        <span>Voir le palmarès de carrière au Hall of Fame</span>
                                                    </span>
                                                    <ArrowTopRightOnSquareIcon className="h-3.5 w-3.5 opacity-70" />
                                                </Link>
                                            )}

                                            <div className="border-t border-[#e4e0d8] dark:border-[#262b38] pt-6 space-y-3.5">
                                                <div className="flex items-center justify-between">
                                                    <h3 className="text-sm font-bold text-[#101216] dark:text-white">
                                                        Présences {selectedYear} ({selectedSeasonalEntry.dates.length})
                                                    </h3>
                                                    <span className="text-xs font-medium text-[#5c6370] dark:text-[#a7adbb]">
                                                        Cliquer pour voir la sortie
                                                    </span>
                                                </div>

                                                {/* Contextual preview box */}
                                                <div className="min-h-[40px] rounded-md border border-[#e4e0d8] dark:border-[#262b38] bg-[#faf8f5] dark:bg-[#161922] px-3 py-2 flex items-center text-xs transition-colors">
                                                    {hoveredDateInfo ? (
                                                        hoveredDateInfo.event ? (
                                                            <div className="flex items-center gap-2 truncate text-[#101216] dark:text-white">
                                                                <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
                                                                <span className="font-bold tabular-nums">{formatFrenchDate(hoveredDateInfo.dateStr, selectedYear)}</span>
                                                                <span className="text-[#5c6370] dark:text-[#a7adbb]">·</span>
                                                                <span className="flex items-center gap-1 font-semibold truncate">
                                                                    <MapPinIcon className="h-3.5 w-3.5 shrink-0 text-[#5c6370] dark:text-[#a7adbb]" aria-hidden="true" />
                                                                    <span className="truncate">{hoveredDateInfo.event.location}</span>
                                                                </span>
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
                                                                <span className="font-bold tabular-nums text-[#101216] dark:text-white">{formatFrenchDate(hoveredDateInfo.dateStr, selectedYear)}</span>
                                                                <span>· Voir dans le calendrier</span>
                                                            </div>
                                                        )
                                                    ) : (
                                                        <p className="text-xs text-[#5c6370] dark:text-[#a7adbb] flex items-center gap-1.5 truncate">
                                                            <CalendarDaysIcon className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                                                            <span>Cliquez sur une date pour ouvrir la sortie dans le calendrier.</span>
                                                        </p>
                                                    )}
                                                </div>

                                                <div className="flex flex-wrap gap-2">
                                                    {selectedSeasonalEntry.dates.map((date) => {
                                                        const parsed = parseDateInfo(date, selectedYear);
                                                        const isoDate = parsed ? parsed.isoDate : date;
                                                        const formattedDate = formatFrenchDate(date, selectedYear);
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
                                                                title={event ? `${formattedDate} - ${event.location} (cliquer pour voir dans le calendrier)` : `${formattedDate} (cliquer pour voir dans le calendrier)`}
                                                                aria-label={`Sortie du ${formattedDate}${event ? ` : ${event.location}` : ''}`}
                                                                className="group min-h-[44px] inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 px-3.5 py-2 text-xs font-medium text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50 hover:bg-emerald-600 hover:text-white hover:border-emerald-600 dark:hover:bg-emerald-500 dark:hover:text-[#0a0c10] dark:hover:border-emerald-500 transition-[color,background-color,border-color,transform] duration-150 cursor-pointer shadow-2xs hover:shadow-xs active:scale-95 motion-reduce:transition-none motion-reduce:transform-none"
                                                            >
                                                                <span className="tabular-nums font-semibold">{formattedDate}</span>
                                                                <ArrowTopRightOnSquareIcon className="h-3.5 w-3.5 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform motion-reduce:transition-none shrink-0" />
                                                            </Link>
                                                        );
                                                    })}
                                                    {selectedSeasonalEntry.dates.length === 0 && (
                                                        <div className="w-full rounded-md border border-dashed border-[#e4e0d8] dark:border-[#262b38] p-4 text-center">
                                                            <p className="text-xs italic text-[#5c6370] dark:text-[#a7adbb]">
                                                                Aucune sortie enregistrée pour cette saison.
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </>
                                    )
                                )}
                            </div>

                            {/* Footer */}
                            <div className="p-4 border-t border-[#e4e0d8] dark:border-[#262b38] flex justify-end">
                                <button
                                    onClick={handleClose}
                                    className="min-h-[44px] px-6 py-2.5 rounded-md border border-[#e4e0d8] dark:border-[#262b38] bg-white dark:bg-[#161922] text-xs font-semibold text-[#3a3f4a] dark:text-[#f5f6f8] hover:bg-[#f2efe9] dark:hover:bg-[#202533] transition-colors cursor-pointer motion-reduce:transition-none"
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
