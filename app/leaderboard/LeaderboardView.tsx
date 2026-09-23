'use client';

import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import {
    XMarkIcon,
    ArrowTopRightOnSquareIcon,
    CalendarDaysIcon,
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
import { SheetHeader } from '../components/carte/SheetHeader';
import { RoadSwatch } from '../components/carte/RoadSwatch';
import type { CyclingGroup } from '../constants/cycling';

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
const roadClassOf = (group: string): CyclingGroup | null => {
    const g = group.toUpperCase();
    if (g.startsWith('VTT') || g.startsWith('V')) return 'VTT';
    if (g.startsWith('A')) return 'A';
    if (g.startsWith('B')) return 'B';
    if (g.startsWith('C')) return 'C';
    return null;
};

const GroupBadge = ({ group }: { group: string }): React.ReactElement => {
    const road = roadClassOf(group);
    return (
        <span className="inline-flex items-center gap-2 font-narrow text-sm font-bold text-ink dark:text-snow">
            {road ? <RoadSwatch group={road} className="w-7" /> : null}
            <span>{group}</span>
        </span>
    );
};

// The Carré Vert itself: one square per eligible ride, filled when attended
const CarreStrip = ({ rides, possible, size = 'sm' }: { rides: number; possible: number; size?: 'sm' | 'md' }): React.ReactElement => {
    const total = Math.max(possible, rides);
    const dim = size === 'md' ? 'size-[9px]' : 'size-[7px]';
    return (
        <span className="flex flex-wrap gap-[2px]" role="img" aria-label={`${rides} sorties sur ${possible}`}>
            {Array.from({ length: total }, (_, i) => (
                <span
                    key={i}
                    className={`${dim} ${i < rides ? 'bg-vert dark:bg-vert-vif' : 'border border-line-strong dark:border-night-line-strong'}`}
                />
            ))}
        </span>
    );
};

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
                    ? 'bg-ambre/15 text-ambre-ink dark:text-ambre ring-1 ring-ambre/40'
                    : 'bg-vert text-white ring-1 ring-vert'
            }`}>
                <CrownIcon className="h-4 w-4" aria-hidden="true" />
            </div>
        );
    }
    if (rank === 2) {
        return (
            <div className="flex h-7 w-7 items-center justify-center rounded-md shrink-0 bg-paper-2 text-ink dark:bg-night-3 dark:text-snow ring-1 ring-line-strong dark:ring-night-line-strong">
                <PodiumMedalIcon className="h-4 w-4" aria-hidden="true" />
            </div>
        );
    }
    return (
        <div className="flex h-7 w-7 items-center justify-center rounded-md shrink-0 bg-bistre-soft/25 text-bistre-ink dark:text-bistre-soft ring-1 ring-bistre/40">
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
        legend: 'bg-ambre/15 text-ambre-ink ring-ambre/30 dark:text-ambre',
        pillar: 'bg-vert-tint text-vert-strong ring-vert/25 dark:bg-vert/15 dark:text-vert-vif',
        veteran: 'bg-hydro-tint text-hydro ring-hydro/25 dark:bg-hydro/15 dark:text-hydro-soft',
        faithful: 'bg-bistre-soft/25 text-bistre-ink ring-bistre/30 dark:text-bistre-soft',
        newcomer: 'bg-paper-2 text-ink-3 ring-gray-500/10 dark:bg-night-3 dark:text-snow-3 dark:ring-white/10',
    }[grade];

    const renderIcon = () => {
        switch (grade) {
            case 'legend':
                return <CrownIcon className="h-3.5 w-3.5 shrink-0 text-ambre-ink dark:text-ambre" aria-hidden="true" />;
            case 'pillar':
                return <ShieldCheckIcon className="h-3.5 w-3.5 shrink-0 text-vert dark:text-vert-vif" aria-hidden="true" />;
            case 'veteran':
                return <BicycleIcon className="h-3.5 w-3.5 shrink-0 text-hydro dark:text-hydro-soft" aria-hidden="true" />;
            case 'faithful':
                return <StarIcon className="h-3.5 w-3.5 shrink-0 text-bistre-ink dark:text-bistre-soft" aria-hidden="true" />;
            case 'newcomer':
            default:
                return <SparklesIcon className="h-3.5 w-3.5 shrink-0 text-ink-3 dark:text-snow-3" aria-hidden="true" />;
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
    <span className="inline-flex items-center gap-1.5 rounded-full bg-ambre/15 px-2.5 py-0.5 text-[11px] font-bold text-ambre-ink dark:text-ambre ring-1 ring-inset ring-ambre/30">
        <TrophyIcon className="h-3 w-3 shrink-0 text-ambre-ink dark:text-ambre" aria-hidden="true" />
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
    const titleColor = rank === 1 ? "text-vert dark:text-vert-vif" : "text-ink dark:text-white";
    const borderStyle = rank === 1
        ? "neatline [--nl:var(--color-vert)] bg-white dark:bg-night-2 hover:shadow-md"
        : "border border-line dark:border-night-line bg-white dark:bg-night-2 hover:border-ink dark:hover:border-snow-3";
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
            className={`rounded-lg p-6 sm:p-8 ${borderStyle} flex flex-col justify-between transition-[transform,box-shadow] duration-150 cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-brand active:scale-[0.99] motion-reduce:transition-none motion-reduce:transform-none`}
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

                <p className="mt-4 text-xl font-bold tracking-tight text-ink dark:text-white truncate">{entry.name}</p>

                <div className="mt-6 flex items-baseline gap-x-2">
                    <span className="font-narrow text-4xl sm:text-5xl font-extrabold text-ink dark:text-white tabular-nums">{entry.rides}</span>
                    <span className="text-sm font-semibold text-ink-3 dark:text-snow-3">sorties</span>
                </div>

                <div className="mt-4">
                    <CarreStrip rides={entry.rides} possible={totalPossibleRides} size="md" />
                </div>

                <ul role="list" className="mt-8 space-y-3 text-sm leading-6 text-ink-2 dark:text-snow-3">
                    <li className="flex gap-x-3 tabular-nums">
                        <span className="font-semibold text-ink dark:text-white">Fidélité :</span> {fidelity}&nbsp;%
                    </li>
                    <li className="flex gap-x-3">
                        <span className="font-semibold text-ink dark:text-white">Dernière :</span> {lastDate}
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
    const titleColor = rank === 1 ? "text-ambre-ink dark:text-ambre" : "text-ink dark:text-white";
    const borderStyle = rank === 1
        ? "border-2 border-amber-500/80 dark:border-amber-400/80 bg-white dark:bg-night-2 shadow-2xs hover:shadow-md"
        : "border border-line dark:border-night-line bg-paper/80 dark:bg-ink shadow-2xs hover:shadow-xs";

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
            className={`rounded-lg p-6 sm:p-8 ${borderStyle} flex flex-col justify-between transition-[transform,box-shadow] duration-150 cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-brand active:scale-[0.99] motion-reduce:transition-none motion-reduce:transform-none`}
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

                <p className="mt-4 text-xl font-bold tracking-tight text-ink dark:text-white truncate">{member.name}</p>
                <div className="mt-2.5">
                    <FidelityGradeBadge grade={member.fidelityGrade} label={member.fidelityGradeLabel} />
                </div>

                <div className="mt-6 flex items-baseline gap-x-2">
                    <span className="text-4xl sm:text-5xl font-extrabold tracking-tight text-ink dark:text-white tabular-nums">{member.totalCarres}</span>
                    <span className="text-sm font-semibold text-ink-3 dark:text-snow-3">Carrés Verts cumulés</span>
                </div>

                <ul role="list" className="mt-6 space-y-2.5 text-sm leading-6 text-ink-2 dark:text-snow-3">
                    <li className="flex gap-x-2 tabular-nums">
                        <span className="font-semibold text-ink dark:text-white">Saisons actives :</span>
                        <span>{member.activeSeasons.length} ({member.activeSeasons.join(', ') || 'Aucune'})</span>
                    </li>
                    <li className="flex gap-x-2 tabular-nums">
                        <span className="font-semibold text-ink dark:text-white">Sorties physiques :</span>
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
            <main className="min-h-screen bg-paper dark:bg-night transition-colors duration-200">
                <SheetHeader
                    sheet={isHallOfFame ? 'Hall of Fame' : `Carré Vert ${selectedYear}`}
                    focus={{ x: 62, y: 52 }}
                    tone={isHallOfFame ? 'nuit' : 'vert'}
                    title={isHallOfFame ? 'Hall of Fame' : `Le Carré Vert ${selectedYear}`}
                    description={
                        isHallOfFame
                            ? "Le panthéon et classement historique cumulé récompensant la fidélité, l'engagement et l'assiduité des cyclistes de Blanmont au fil des saisons."
                            : `Le classement officiel d'assiduité récompensant la régularité et l'engagement des cyclistes de Blanmont tout au long de la saison ${selectedYear}.`
                    }
                    legend={
                        isHallOfFame
                            ? [
                                  {
                                      term: 'En tête du palmarès',
                                      value: hofTop3[0]?.name || 'En cours',
                                      hint: `Grand Pilier (${hofTop3[0] ? `${hofTop3[0].totalCarres} carrés` : '0 carré'})`,
                                  },
                                  { term: 'Membres au palmarès', value: String(activeHofMembers.length) },
                                  {
                                      term: 'Saisons archivées',
                                      value: String(availableYears.length),
                                      hint: `Saisons (${availableYears[0]} – ${availableYears[availableYears.length - 1]})`,
                                  },
                              ]
                            : [
                                  {
                                      term: 'En tête de la saison',
                                      value: seasonalTop3[0]?.name || 'En cours',
                                      hint: `Leader (${seasonalTop3[0] ? `${seasonalTop3[0].rides} sorties` : '0 sortie'})`,
                                  },
                                  { term: 'Membres classés', value: String(activeSeasonalEntries.length) },
                                  { term: 'Sorties éligibles', value: String(totalPossibleRides) },
                              ]
                    }
                >
                    <nav
                        aria-label="Sélection de la saison ou Hall of Fame"
                        className="no-scrollbar inline-flex max-w-full items-center gap-1 overflow-x-auto border border-white/40 p-1"
                    >
                        {availableYears.map((year) => {
                            const isSelected = !isHallOfFame && year === selectedYear;
                            return (
                                <Link
                                    key={year}
                                    href={`/leaderboard?year=${year}`}
                                    prefetch={true}
                                    aria-current={isSelected ? 'page' : undefined}
                                    className={`inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-sm px-3.5 font-narrow text-sm font-bold tabular-nums transition-colors duration-150 ${
                                        isSelected ? 'bg-white text-vert-strong' : 'text-white hover:bg-white/15'
                                    }`}
                                >
                                    {year}
                                </Link>
                            );
                        })}
                
                        <span className="mx-0.5 h-6 w-px bg-white/35" aria-hidden="true" />
                
                        <Link
                            href="/leaderboard?year=all"
                            prefetch={true}
                            aria-current={isHallOfFame ? 'page' : undefined}
                            className={`inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-sm px-3.5 font-narrow text-sm font-bold uppercase tracking-[0.06em] transition-colors duration-150 ${
                                isHallOfFame ? 'bg-white text-ink' : 'text-white hover:bg-white/15'
                            }`}
                        >
                            <TrophySquareIcon className="size-4" aria-hidden="true" />
                            <span>Hall of Fame</span>
                        </Link>
                    </nav>
                </SheetHeader>

                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
                    {/* ──── HALL OF FAME VIEW ──── */}
                    {isHallOfFame ? (
                        <>
                            {activeHofMembers.length === 0 ? (
                                <div className="mx-auto mt-12 max-w-2xl rounded-xl border border-line dark:border-night-line bg-white dark:bg-night-2 p-8 sm:p-12 text-center shadow-2xs">
                                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-lg bg-paper dark:bg-ink border border-line dark:border-night-line text-ambre-ink dark:text-ambre mb-5">
                                        <TrophySquareIcon className="h-7 w-7" aria-hidden="true" />
                                    </div>
                                    <h3 className="text-lg sm:text-xl font-bold uppercase tracking-tight text-ink dark:text-white">
                                        Aucun historique de présence répertorié
                                    </h3>
                                    <p className="mt-2 text-sm text-ink-3 dark:text-snow-3 max-w-md mx-auto leading-relaxed">
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
                                        <div className="mt-16 overflow-hidden border-t-2 border-ink bg-white transition-colors sm:mt-20 dark:border-snow-2 dark:bg-night-2">
                                            <div className="overflow-x-auto">
                                                <table className="min-w-full divide-y divide-line dark:divide-night-line">
                                                    <thead className="bg-paper-2 dark:bg-night-2">
                                                        <tr>
                                                            <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-xs font-semibold uppercase tracking-wider text-ink-3 dark:text-snow-3 sm:pl-6">
                                                                Rang
                                                            </th>
                                                            <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-xs font-semibold uppercase tracking-wider text-ink-3 dark:text-snow-3">
                                                                Cycliste & Titre
                                                            </th>
                                                            <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-ink-3 dark:text-snow-3">
                                                                Groupe
                                                            </th>
                                                            <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-ink-3 dark:text-snow-3">
                                                                Saisons
                                                            </th>
                                                            <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-ink-3 dark:text-snow-3">
                                                                Carrés Verts
                                                            </th>
                                                            <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-ink-3 dark:text-snow-3">
                                                                Sorties
                                                            </th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-line dark:divide-night-line bg-white dark:bg-ink">
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
                                                                    className="hover:bg-paper-2 dark:hover:bg-night-2 focus:outline-hidden focus-visible:bg-paper-2 dark:focus-visible:bg-night-2 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand transition-colors cursor-pointer"
                                                                >
                                                                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-bold text-ink dark:text-white tabular-nums sm:pl-6">
                                                                        #{rank}
                                                                    </td>
                                                                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm">
                                                                        <div className="flex flex-col sm:flex-row sm:items-center gap-1.5">
                                                                            <span className="font-bold text-ink dark:text-white">
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
                                                                                    className="inline-flex items-center rounded-sm bg-paper-2 dark:bg-night-3 px-1.5 py-0.5 text-[11px] font-semibold text-ink-2 dark:text-snow-3 tabular-nums"
                                                                                >
                                                                                    {y}
                                                                                </span>
                                                                            ))}
                                                                        </div>
                                                                    </td>
                                                                    <td className="whitespace-nowrap px-3 py-4 text-sm font-extrabold text-emerald-700 dark:text-emerald-400 tabular-nums">
                                                                        {member.totalCarres}
                                                                    </td>
                                                                    <td className="whitespace-nowrap px-3 py-4 text-sm font-medium text-ink-3 dark:text-snow-3 tabular-nums">
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
                                <div className="mx-auto mt-12 max-w-2xl rounded-xl border border-line dark:border-night-line bg-white dark:bg-night-2 p-8 sm:p-12 text-center shadow-2xs">
                                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-lg bg-paper dark:bg-ink border border-line dark:border-night-line text-vert dark:text-vert-vif mb-5">
                                        <TrophySquareIcon className="h-7 w-7" aria-hidden="true" />
                                    </div>
                                    <h3 className="text-lg sm:text-xl font-bold uppercase tracking-tight text-ink dark:text-white">
                                        Aucun classement pour la saison {selectedYear}
                                    </h3>
                                    <p className="mt-2 text-sm text-ink-3 dark:text-snow-3 max-w-md mx-auto leading-relaxed">
                                        Les points du Carré Vert sont enregistrés à l&apos;issue de chaque sortie officielle du peloton. Consultez les saisons précédentes ou explorez le calendrier.
                                    </p>
                                    <div className="mt-6 flex flex-wrap justify-center gap-3">
                                        <Link
                                            href="/calendrier"
                                            className="min-h-[44px] inline-flex items-center justify-center rounded-md bg-brand hover:bg-brand-strong px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-xs transition-[background-color,transform] duration-150 active:scale-95 motion-reduce:transition-none"
                                        >
                                            Voir le calendrier
                                        </Link>
                                        <Link
                                            href="/leaderboard?year=all"
                                            className="min-h-[44px] inline-flex items-center justify-center rounded-md border border-line dark:border-night-line bg-paper dark:bg-ink hover:bg-paper-2 dark:hover:bg-night-3 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-ink dark:text-white shadow-2xs transition-[background-color,transform] duration-150 active:scale-95 motion-reduce:transition-none"
                                        >
                                            Consulter le Hall of Fame
                                        </Link>
                                        {availableYears.filter((y) => y !== selectedYear).slice(0, 1).map((fallbackYear) => (
                                            <Link
                                                key={fallbackYear}
                                                href={`/leaderboard?year=${fallbackYear}`}
                                                className="min-h-[44px] inline-flex items-center justify-center rounded-md border border-line dark:border-night-line bg-paper dark:bg-ink hover:bg-paper-2 dark:hover:bg-night-3 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-ink dark:text-white shadow-2xs transition-[background-color,transform] duration-150 active:scale-95 motion-reduce:transition-none"
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
                                <div className="mt-16 sm:mt-20 overflow-hidden shadow-2xs ring-1 ring-line dark:ring-night-line sm:rounded-lg bg-white dark:bg-ink transition-colors">
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-line dark:divide-night-line">
                                            <thead className="bg-paper-2 dark:bg-night-2">
                                                <tr>
                                                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-xs font-semibold uppercase tracking-wider text-ink-3 dark:text-snow-3 sm:pl-6">
                                                        Rang
                                                    </th>
                                                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-xs font-semibold uppercase tracking-wider text-ink-3 dark:text-snow-3">
                                                        Nom
                                                    </th>
                                                    <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-ink-3 dark:text-snow-3">
                                                        Groupe
                                                    </th>
                                                    <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-ink-3 dark:text-snow-3">
                                                        Sorties
                                                    </th>
                                                    <th scope="col" className="hidden px-3 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-ink-3 md:table-cell dark:text-snow-3">
                                                        Carrés verts
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-line dark:divide-night-line bg-white dark:bg-ink">
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
                                                            className="hover:bg-paper-2 dark:hover:bg-night-2 focus:outline-hidden focus-visible:bg-paper-2 dark:focus-visible:bg-night-2 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand transition-colors cursor-pointer"
                                                        >
                                                            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-bold text-ink dark:text-white tabular-nums sm:pl-6">
                                                                #{globalRank}
                                                            </td>
                                                            <td className={`whitespace-nowrap py-4 pl-4 pr-3 text-sm ${isGroupTop3 ? 'font-bold text-ink dark:text-white' : 'font-medium text-ink-2 dark:text-snow-2'}`}>
                                                                {person.name}
                                                            </td>
                                                            <td className="whitespace-nowrap px-3 py-4 text-sm">
                                                                <GroupBadge group={person.group} />
                                                            </td>
                                                            <td className="whitespace-nowrap px-3 py-4 text-sm">
                                                                <div className={`font-bold tabular-nums ${isGroupTop3 ? 'text-ink dark:text-white' : 'text-ink-2 dark:text-snow-2'}`}>
                                                                    {person.rides}
                                                                </div>
                                                            </td>
                                                            <td className="hidden px-3 py-4 md:table-cell">
                                                                <CarreStrip rides={person.rides} possible={totalPossibleRides} />
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
                            className="w-screen max-w-md bg-white dark:bg-ink border-l border-line dark:border-night-line shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 motion-reduce:animate-none transition-colors"
                        >
                            {/* Header: Editorial Dark Panel */}
                            <div className="bg-night-2 border-b border-night-line text-white p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-xs font-semibold uppercase tracking-wider text-snow-3">
                                        {isHallOfFame ? 'Dossier Palmarès' : `Saison ${selectedYear}`}
                                    </span>
                                    <button
                                        ref={closeButtonRef}
                                        onClick={handleClose}
                                        className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-md text-snow-3 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
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
                                        <p className="text-xs font-medium text-snow-3">
                                            Rang All-Time :{' '}
                                            <span className="text-amber-400 font-bold tabular-nums">
                                                #{selectedMemberId ? hofGlobalRanks[selectedMemberId] || '—' : '—'}
                                            </span>
                                        </p>
                                    ) : (
                                        <p className="text-xs font-medium text-snow-3">
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
                                            <div className="rounded-md border border-line dark:border-night-line bg-paper-2/70 dark:bg-night-2 p-4">
                                                <div className="text-xs font-medium text-ink-3 dark:text-snow-3">Groupe habituel</div>
                                                <div className="mt-1">
                                                    <GroupBadge group={selectedHofMember.group} />
                                                </div>
                                            </div>
                                            <div className="rounded-md border border-line dark:border-night-line bg-paper-2/70 dark:bg-night-2 p-4">
                                                <div className="text-xs font-medium text-ink-3 dark:text-snow-3">Carrés Verts cumulés</div>
                                                <div className="mt-1 text-xl font-extrabold text-ambre-ink dark:text-ambre tabular-nums">
                                                    {selectedHofMember.totalCarres}
                                                </div>
                                            </div>
                                            <div className="rounded-md border border-line dark:border-night-line bg-paper-2/70 dark:bg-night-2 p-4">
                                                <div className="text-xs font-medium text-ink-3 dark:text-snow-3">Saisons actives</div>
                                                <div className="mt-1 text-xl font-extrabold text-ink dark:text-white tabular-nums">
                                                    {selectedHofMember.activeSeasons.length}
                                                </div>
                                            </div>
                                            <div className="rounded-md border border-line dark:border-night-line bg-paper-2/70 dark:bg-night-2 p-4">
                                                <div className="text-xs font-medium text-ink-3 dark:text-snow-3">Sorties physiques</div>
                                                <div className="mt-1 text-xl font-extrabold text-ink dark:text-white tabular-nums">
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
                                        <div className="border-t border-line dark:border-night-line pt-6 space-y-4">
                                            <h3 className="text-sm font-bold text-ink dark:text-white">
                                                Ventilation par saison
                                            </h3>

                                            <div className="space-y-3">
                                                {availableYears.map((year) => {
                                                    const s = selectedHofMember.seasonBreakdown[year];
                                                    const hasRides = s && s.carres > 0;

                                                    return (
                                                        <div
                                                            key={year}
                                                            className="rounded-lg border border-line dark:border-night-line bg-paper dark:bg-night-2 p-3.5"
                                                        >
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-xs font-bold uppercase tracking-wider text-ink dark:text-white tabular-nums">
                                                                        Saison {year}
                                                                    </span>
                                                                    {s?.isChampion && (
                                                                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 px-2.5 py-0.5 text-[10px] font-bold ring-1 ring-amber-500/20">
                                                                            <CrownIcon className="h-3 w-3 shrink-0 text-ambre-ink dark:text-ambre" aria-hidden="true" />
                                                                            <span>Champion</span>
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <span className="text-xs font-extrabold text-vert dark:text-vert-vif tabular-nums">
                                                                    {hasRides ? `${s.carres} Carrés Verts` : '0 sortie'}
                                                                </span>
                                                            </div>

                                                            {hasRides && s.dates.length > 0 && (
                                                                <div className="mt-3 flex flex-wrap gap-1.5 pt-2 border-t border-line/60 dark:border-night-line">
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
                                                <div className="rounded-md border border-line dark:border-night-line bg-paper-2/70 dark:bg-night-2 p-4">
                                                    <div className="text-xs font-medium text-ink-3 dark:text-snow-3">Groupe</div>
                                                    <div className="mt-1">
                                                        <GroupBadge group={selectedSeasonalEntry.group} />
                                                    </div>
                                                </div>
                                                <div className="rounded-md border border-line dark:border-night-line bg-paper-2/70 dark:bg-night-2 p-4">
                                                    <div className="text-xs font-medium text-ink-3 dark:text-snow-3">Sorties {selectedYear}</div>
                                                    <div className="mt-1 text-xl font-extrabold text-ink dark:text-white tabular-nums">
                                                        {selectedSeasonalEntry.rides}
                                                    </div>
                                                </div>
                                                <div className="rounded-md border border-line dark:border-night-line bg-paper-2/70 dark:bg-night-2 p-4">
                                                    <div className="text-xs font-medium text-ink-3 dark:text-snow-3">Taux de Fidélité</div>
                                                    <div className="mt-1 text-xl font-extrabold text-vert dark:text-vert-vif tabular-nums">
                                                        {totalPossibleRides > 0 ? Math.round((selectedSeasonalEntry.rides / totalPossibleRides) * 100) : 0}%
                                                    </div>
                                                </div>
                                                <div className="rounded-md border border-line dark:border-night-line bg-paper-2/70 dark:bg-night-2 p-4">
                                                    <div className="text-xs font-medium text-ink-3 dark:text-snow-3">Dernière sortie</div>
                                                    <div className="mt-1 text-xs font-bold text-ink dark:text-white">
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
                                                        <TrophySquareIcon className="h-4 w-4 text-ambre-ink dark:text-ambre" />
                                                        <span>Voir le palmarès de carrière au Hall of Fame</span>
                                                    </span>
                                                    <ArrowTopRightOnSquareIcon className="h-3.5 w-3.5 opacity-70" />
                                                </Link>
                                            )}

                                            <div className="border-t border-line dark:border-night-line pt-6 space-y-3.5">
                                                <div className="flex items-center justify-between">
                                                    <h3 className="text-sm font-bold text-ink dark:text-white">
                                                        Présences {selectedYear} ({selectedSeasonalEntry.dates.length})
                                                    </h3>
                                                    <span className="text-xs font-medium text-ink-3 dark:text-snow-3">
                                                        Cliquer pour voir la sortie
                                                    </span>
                                                </div>

                                                {/* Contextual preview box */}
                                                <div className="min-h-[40px] rounded-md border border-line dark:border-night-line bg-paper dark:bg-night-2 px-3 py-2 flex items-center text-xs transition-colors">
                                                    {hoveredDateInfo ? (
                                                        hoveredDateInfo.event ? (
                                                            <div className="flex items-center gap-2 truncate text-ink dark:text-white">
                                                                <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
                                                                <span className="font-bold tabular-nums">{formatFrenchDate(hoveredDateInfo.dateStr, selectedYear)}</span>
                                                                <span className="text-ink-3 dark:text-snow-3">·</span>
                                                                <span className="flex items-center gap-1 font-semibold truncate">
                                                                    <MapPinIcon className="h-3.5 w-3.5 shrink-0 text-ink-3 dark:text-snow-3" aria-hidden="true" />
                                                                    <span className="truncate">{hoveredDateInfo.event.location}</span>
                                                                </span>
                                                                {hoveredDateInfo.event.distances && (
                                                                    <>
                                                                        <span className="text-ink-3 dark:text-snow-3">·</span>
                                                                        <span className="tabular-nums font-medium text-ink-3 dark:text-snow-3">
                                                                            {hoveredDateInfo.event.distances} km
                                                                        </span>
                                                                    </>
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <div className="flex items-center gap-2 text-ink-3 dark:text-snow-3">
                                                                <span className="h-2 w-2 rounded-full bg-slate-400 shrink-0" />
                                                                <span className="font-bold tabular-nums text-ink dark:text-white">{formatFrenchDate(hoveredDateInfo.dateStr, selectedYear)}</span>
                                                                <span>· Voir dans le calendrier</span>
                                                            </div>
                                                        )
                                                    ) : (
                                                        <p className="text-xs text-ink-3 dark:text-snow-3 flex items-center gap-1.5 truncate">
                                                            <CalendarDaysIcon className="h-3.5 w-3.5 text-vert dark:text-vert-vif shrink-0" />
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
                                                                className="group min-h-[44px] inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 px-3.5 py-2 text-xs font-medium text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50 hover:bg-emerald-600 hover:text-white hover:border-emerald-600 dark:hover:bg-emerald-500 dark:hover:text-night dark:hover:border-emerald-500 transition-[color,background-color,border-color,transform] duration-150 cursor-pointer shadow-2xs hover:shadow-xs active:scale-95 motion-reduce:transition-none motion-reduce:transform-none"
                                                            >
                                                                <span className="tabular-nums font-semibold">{formattedDate}</span>
                                                                <ArrowTopRightOnSquareIcon className="h-3.5 w-3.5 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform motion-reduce:transition-none shrink-0" />
                                                            </Link>
                                                        );
                                                    })}
                                                    {selectedSeasonalEntry.dates.length === 0 && (
                                                        <div className="w-full rounded-md border border-dashed border-line dark:border-night-line p-4 text-center">
                                                            <p className="text-xs italic text-ink-3 dark:text-snow-3">
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
                            <div className="p-4 border-t border-line dark:border-night-line flex justify-end">
                                <button
                                    onClick={handleClose}
                                    className="min-h-[44px] px-6 py-2.5 rounded-md border border-line dark:border-night-line bg-white dark:bg-night-2 text-xs font-semibold text-ink-2 dark:text-snow hover:bg-paper-2 dark:hover:bg-night-3 transition-colors cursor-pointer motion-reduce:transition-none"
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
