import type { CalendarEvent, Member, Trace, Feedback, SaturdayRide, Vote } from '@/app/types';
import type { LeaderboardEntry } from './firebase/leaderboard';
import type { EventAttendance } from './firebase/attendance';
import {
  parseDateInfo,
  calculateLeaderboardFromAttendance,
  getPossibleCarresCount,
} from './carreVert';

export interface ProcessedMemberRank {
  id: string;
  name: string;
  rides: number;
  group?: string;
  dates: string[];
  percent: number;
  tier: 'or' | 'argent' | 'bronze' | 'peloton' | 'occasionnel';
}

export interface ClubTelemetryStats {
  totalPelotonKm: number;
  totalPelotonElevation: number;
  totalAttendances: number;
  officialRidesCount: number;
  avgPelotonSize: number;
  avgRideDistance: number;
  avgRideElevation: number;
  earthLapsEquivalent: number;
  everestEquivalent: number;
  biggestPelotonEvent: {
    date: string;
    location: string;
    count: number;
    distance: number;
  } | null;
  longestRideEvent: {
    date: string;
    location: string;
    distance: number;
    count: number;
  } | null;
  toughestRideEvent: {
    date: string;
    location: string;
    elevation: number;
    count: number;
  } | null;
  mostActiveMonth: {
    monthName: string;
    totalAttendance: number;
    ridesCount: number;
  } | null;
}

export interface CarreVertStats {
  totalPossibleCarres: number;
  processedEntries: ProcessedMemberRank[];
  podium: Array<{
    rank: number;
    name: string;
    rides: number;
    percent: number;
    group?: string;
  }>;
  tiersDistribution: {
    or: number;
    argent: number;
    bronze: number;
    peloton: number;
    occasionnel: number;
  };
  ridesBuckets: Array<{
    label: string;
    min: number;
    max: number;
    count: number;
  }>;
  totalMembers: number;
  activeMembers: number;
  dormantMembers: number;
  activityRate: number;
  averageRidesPerActive: number;
  maxRides: number;
  topPerformer: string;
}

export interface TracesCatalogStats {
  totalTraces: number;
  totalCatalogKm: number;
  totalCatalogElevation: number;
  avgTraceDistance: number;
  avgTraceElevation: number;
  avgSlopeRatio: number;
  distanceBuckets: Array<{
    label: string;
    count: number;
    description: string;
  }>;
  surfaceDistribution: Array<{
    surface: string;
    count: number;
  }>;
  directionDistribution: Array<{
    direction: string;
    count: number;
  }>;
  feedbackStats: {
    totalReviews: number;
    averageRating: number;
    topRatedTraces: Array<{
      id: string;
      name: string;
      rating: number;
      reviewCount: number;
      distance: number;
      elevation?: number;
    }>;
  };
}

export interface GroupDynamicsStats {
  groupStats: Array<{
    group: string;
    count: number;
    totalAttendances: number;
    avgRides: number;
    percentOfTotal: number;
  }>;
}

export interface DemocracyStats {
  totalSaturdayRides: number;
  votedRidesCount: number;
  totalVotes: number;
  avgVotesPerRide: number;
  participationRate: number;
  popularTraces: Array<{
    traceId: string;
    traceName: string;
    voteCount: number;
    distance?: number;
  }>;
}

export interface AdministrationHealthStats {
  totalMembers: number;
  cotisationPaid: number;
  cotisationPending: number;
  cotisationExempt: number;
  cotisationComplianceRate: number;
  ffbcLicensedCount: number;
  ffbcComplianceRate: number;
  stravaLinkedCount: number;
  stravaAdoptionRate: number;
  rolesDistribution: Array<{
    role: string;
    count: number;
  }>;
}

export interface WeeklyTimelinePoint {
  week: string;
  count: number;
  isoDate: string;
  month: number;
  distance: number;
  elevation: number;
  pelotonKm: number;
}

export interface MonthlyTimelinePoint {
  monthIndex: number;
  monthName: string;
  totalAttendance: number;
  eventCount: number;
  pelotonKm: number;
  pelotonElevation: number;
}

export interface ClubAggregatedStatistics {
  selectedYear: string;
  availableYears: string[];
  telemetry: ClubTelemetryStats;
  carreVert: CarreVertStats;
  traces: TracesCatalogStats;
  groupDynamics: GroupDynamicsStats;
  democracy: DemocracyStats;
  administration: AdministrationHealthStats;
  weeklyDistribution: WeeklyTimelinePoint[];
  monthlyData: MonthlyTimelinePoint[];
}

export const MONTH_NAMES_FR = [
  'Janvier',
  'Février',
  'Mars',
  'Avril',
  'Mai',
  'Juin',
  'Juillet',
  'Août',
  'Septembre',
  'Octobre',
  'Novembre',
  'Décembre',
];

/**
 * Parses numeric distance from freeform strings like "80-110", "95 km", "75".
 * Takes average for ranges. Returns 80 as sensible cycling club default.
 */
export function parseEventDistance(distStr?: string): number {
  if (!distStr || typeof distStr !== 'string') return 80;
  const cleaned = distStr.replace(/km/gi, '').trim();

  // Range pattern like "80-110" or "80 - 110"
  const rangeMatch = cleaned.match(/^(\d+(?:\.\d+)?)\s*[-–/]\s*(\d+(?:\.\d+)?)$/);
  if (rangeMatch) {
    const min = parseFloat(rangeMatch[1]);
    const max = parseFloat(rangeMatch[2]);
    if (!isNaN(min) && !isNaN(max) && min > 0 && max > 0) {
      return Math.round((min + max) / 2);
    }
  }

  // Single number
  const numMatch = cleaned.match(/\d+(?:\.\d+)?/);
  if (numMatch) {
    const val = parseFloat(numMatch[0]);
    if (!isNaN(val) && val > 0) return Math.round(val);
  }

  return 80;
}

/**
 * Attempts to match a calendar event with a catalog trace
 */
export function matchEventWithTrace(event: CalendarEvent, traces: Trace[]): Trace | undefined {
  if (!traces || traces.length === 0) return undefined;

  // Match by GPX url
  if (event.gpxUrl) {
    const match = traces.find((t) => t.gpxUrl && t.gpxUrl === event.gpxUrl);
    if (match) return match;
  }

  // Match by exact or partial name in location/remarks
  const query = `${event.location || ''} ${event.remarks || ''}`.toLowerCase();
  if (query.trim().length > 3) {
    const match = traces.find(
      (t) => t.name && query.includes(t.name.toLowerCase().trim())
    );
    if (match) return match;
  }

  return undefined;
}

/**
 * Estimates elevation for an event if not explicitly specified in trace.
 * Average Walloon terrain: ~8.0m D+ per km.
 */
export function getEventElevation(event: CalendarEvent, matchedTrace?: Trace, distance: number = 80): number {
  if (matchedTrace?.elevation && matchedTrace.elevation > 0) {
    return matchedTrace.elevation;
  }
  return Math.round(distance * 8);
}

/**
 * Determines Carré Vert merit tier based on official percentage
 */
export function getCarreVertTier(percent: number): 'or' | 'argent' | 'bronze' | 'peloton' | 'occasionnel' {
  if (percent >= 80) return 'or';
  if (percent >= 60) return 'argent';
  if (percent >= 40) return 'bronze';
  if (percent >= 20) return 'peloton';
  return 'occasionnel';
}

/**
 * Main pure computation function for all Club Statistics
 */
export function computeClubStatistics(params: {
  entries: LeaderboardEntry[];
  events: CalendarEvent[];
  allAttendance: EventAttendance[];
  traces: Trace[];
  members: Member[];
  saturdayRides: SaturdayRide[];
  votes: Vote[];
  feedback: Feedback[];
  selectedYear: string;
}): ClubAggregatedStatistics {
  const {
    entries = [],
    events = [],
    allAttendance = [],
    traces = [],
    members = [],
    saturdayRides = [],
    votes = [],
    feedback = [],
    selectedYear,
  } = params;

  const yearNum = parseInt(selectedYear, 10) || new Date().getFullYear();

  // 1. Available Years extraction
  const yearsSet = new Set<string>();
  yearsSet.add(new Date().getFullYear().toString());

  entries.forEach((e) => {
    e.dates?.forEach((d) => {
      const info = parseDateInfo(d);
      if (info) yearsSet.add(info.year.toString());
    });
  });
  events.forEach((evt) => {
    const info = parseDateInfo(evt.isoDate);
    if (info) yearsSet.add(info.year.toString());
  });
  allAttendance.forEach((att) => {
    if (att.isoDate) {
      const info = parseDateInfo(att.isoDate);
      if (info) yearsSet.add(info.year.toString());
    }
  });
  saturdayRides.forEach((r) => {
    if (r.date) {
      const info = parseDateInfo(r.date);
      if (info) yearsSet.add(info.year.toString());
    }
  });

  const availableYears = Array.from(yearsSet).sort().reverse();

  // 2. Carré Vert Leaderboard calculation for selected year
  const processedRaw = calculateLeaderboardFromAttendance(
    entries,
    events,
    allAttendance,
    yearNum
  );

  const totalPossibleCarres = getPossibleCarresCount(events, yearNum, {
    includeOnlyPastOrAttended: true,
    allAttendance,
  });

  const processedEntries: ProcessedMemberRank[] = processedRaw
    .map((e) => {
      const percent =
        totalPossibleCarres > 0
          ? Math.round((e.rides / totalPossibleCarres) * 100)
          : 0;
      return {
        id: e.id,
        name: e.name,
        rides: e.rides,
        group: e.group,
        dates: e.dates,
        percent,
        tier: getCarreVertTier(percent),
      };
    })
    .sort((a, b) => b.rides - a.rides);

  const totalMembers = members.length > 0 ? members.length : entries.length;
  const activeParticipants = processedEntries.filter((e) => e.rides > 0);
  const activeMembersCount = activeParticipants.length;
  const dormantMembersCount = Math.max(0, totalMembers - activeMembersCount);
  const activityRate = totalMembers > 0 ? Math.round((activeMembersCount / totalMembers) * 100) : 0;

  const totalRidesSum = processedEntries.reduce((sum, e) => sum + e.rides, 0);
  const averageRidesPerActive =
    activeMembersCount > 0 ? Math.round((totalRidesSum / activeMembersCount) * 10) / 10 : 0;
  const maxRides = processedEntries.length > 0 ? processedEntries[0].rides : 0;
  const topPerformer =
    processedEntries.length > 0 && processedEntries[0].rides > 0
      ? processedEntries[0].name
      : '-';

  // Podium
  const podium = processedEntries
    .slice(0, 3)
    .filter((e) => e.rides > 0)
    .map((e, idx) => ({
      rank: idx + 1,
      name: e.name,
      rides: e.rides,
      percent: e.percent,
      group: e.group,
    }));

  // Tiers distribution
  const tiersDistribution = {
    or: 0,
    argent: 0,
    bronze: 0,
    peloton: 0,
    occasionnel: 0,
  };
  processedEntries.forEach((e) => {
    tiersDistribution[e.tier]++;
  });

  // Rides distribution buckets
  const ridesBuckets = [
    { label: '0 sortie', min: 0, max: 0, count: 0 },
    { label: '1–5', min: 1, max: 5, count: 0 },
    { label: '6–10', min: 6, max: 10, count: 0 },
    { label: '11–20', min: 11, max: 20, count: 0 },
    { label: '21–30', min: 21, max: 30, count: 0 },
    { label: '31–40', min: 31, max: 40, count: 0 },
    { label: '40+', min: 41, max: Infinity, count: 0 },
  ];
  processedEntries.forEach((e) => {
    for (const b of ridesBuckets) {
      if (e.rides >= b.min && e.rides <= b.max) {
        b.count++;
        break;
      }
    }
  });

  // 3. Weekly & Event Attendance Consolidation with Mileage & Elevation
  const eventsByIsoDate = new Map<string, CalendarEvent>();
  events.forEach((evt) => {
    if (evt.isoDate) {
      eventsByIsoDate.set(evt.isoDate, evt);
    }
  });

  // Track attendance per date
  const dateMap = new Map<
    string,
    {
      isoDate: string;
      displayDate: string;
      count: number;
      month: number;
      distance: number;
      elevation: number;
      location: string;
    }
  >();

  if (allAttendance.length > 0) {
    allAttendance.forEach((att) => {
      if (!att.isoDate || !att.members) return;
      const info = parseDateInfo(att.isoDate);
      if (!info || info.year !== yearNum) return;

      const count = Object.keys(att.members).length;
      if (count > 0) {
        const calEvent = eventsByIsoDate.get(att.isoDate);
        const matchedTrace = calEvent ? matchEventWithTrace(calEvent, traces) : undefined;
        const dist = matchedTrace?.distance || (calEvent ? parseEventDistance(calEvent.distances) : 80);
        const elev = getEventElevation(calEvent || { id: '', isoDate: att.isoDate, location: '', distances: '', departure: '', address: '', remarks: '', alternative: '', group: '' }, matchedTrace, dist);

        dateMap.set(info.isoDate, {
          isoDate: info.isoDate,
          displayDate: info.displayDate,
          count,
          month: info.month,
          distance: dist,
          elevation: elev,
          location: calEvent?.location || 'Sortie Club',
        });
      }
    });
  }

  // Fallback to entries dates if attendance node had no records for this year
  if (dateMap.size === 0) {
    for (const entry of processedEntries) {
      for (const d of entry.dates) {
        const info = parseDateInfo(d);
        if (!info || info.year !== yearNum) continue;

        const calEvent = eventsByIsoDate.get(info.isoDate);
        const matchedTrace = calEvent ? matchEventWithTrace(calEvent, traces) : undefined;
        const dist = matchedTrace?.distance || (calEvent ? parseEventDistance(calEvent.distances) : 80);
        const elev = getEventElevation(calEvent || { id: '', isoDate: info.isoDate, location: '', distances: '', departure: '', address: '', remarks: '', alternative: '', group: '' }, matchedTrace, dist);

        const existing = dateMap.get(info.isoDate) || {
          isoDate: info.isoDate,
          displayDate: info.displayDate,
          count: 0,
          month: info.month,
          distance: dist,
          elevation: elev,
          location: calEvent?.location || 'Sortie Club',
        };
        existing.count++;
        dateMap.set(info.isoDate, existing);
      }
    }
  }

  const weeklyDistribution: WeeklyTimelinePoint[] = Array.from(dateMap.values())
    .map((item) => ({
      week: item.displayDate,
      count: item.count,
      isoDate: item.isoDate,
      month: item.month,
      distance: item.distance,
      elevation: item.elevation,
      pelotonKm: item.count * item.distance,
    }))
    .sort((a, b) => a.isoDate.localeCompare(b.isoDate));

  // Monthly aggregated data
  const monthlyData: MonthlyTimelinePoint[] = Array.from({ length: 12 }, (_, i) => ({
    monthIndex: i + 1,
    monthName: MONTH_NAMES_FR[i],
    totalAttendance: 0,
    eventCount: 0,
    pelotonKm: 0,
    pelotonElevation: 0,
  }));

  let totalPelotonKm = 0;
  let totalPelotonElevation = 0;
  let totalOfficialRides = weeklyDistribution.length;
  let totalAttendancesCount = 0;

  weeklyDistribution.forEach((pt) => {
    totalAttendancesCount += pt.count;
    totalPelotonKm += pt.pelotonKm;
    totalPelotonElevation += pt.count * pt.elevation;

    if (pt.month >= 1 && pt.month <= 12) {
      const m = monthlyData[pt.month - 1];
      m.totalAttendance += pt.count;
      m.eventCount += 1;
      m.pelotonKm += pt.pelotonKm;
      m.pelotonElevation += pt.count * pt.elevation;
    }
  });

  const avgPelotonSize =
    totalOfficialRides > 0 ? Math.round((totalAttendancesCount / totalOfficialRides) * 10) / 10 : 0;
  const avgRideDistance =
    totalOfficialRides > 0
      ? Math.round(
          weeklyDistribution.reduce((acc, curr) => acc + curr.distance, 0) /
            totalOfficialRides
        )
      : 0;
  const avgRideElevation =
    totalOfficialRides > 0
      ? Math.round(
          weeklyDistribution.reduce((acc, curr) => acc + curr.elevation, 0) /
            totalOfficialRides
        )
      : 0;

  // Earth laps & Everest equivalents
  // Earth circumference ~ 40,075 km
  const earthLapsEquivalent = Math.round((totalPelotonKm / 40075) * 100) / 100;
  // Everest height ~ 8,848 m
  const everestEquivalent = Math.round((totalPelotonElevation / 8848) * 10) / 10;

  // Records
  let biggestPelotonEvent: ClubTelemetryStats['biggestPelotonEvent'] = null;
  let longestRideEvent: ClubTelemetryStats['longestRideEvent'] = null;
  let toughestRideEvent: ClubTelemetryStats['toughestRideEvent'] = null;

  weeklyDistribution.forEach((pt) => {
    const rawItem = dateMap.get(pt.isoDate);
    const loc = rawItem?.location || 'Sortie Club';

    if (!biggestPelotonEvent || pt.count > biggestPelotonEvent.count) {
      biggestPelotonEvent = {
        date: pt.week,
        location: loc,
        count: pt.count,
        distance: pt.distance,
      };
    }

    if (!longestRideEvent || pt.distance > longestRideEvent.distance) {
      longestRideEvent = {
        date: pt.week,
        location: loc,
        distance: pt.distance,
        count: pt.count,
      };
    }

    if (!toughestRideEvent || pt.elevation > toughestRideEvent.elevation) {
      toughestRideEvent = {
        date: pt.week,
        location: loc,
        elevation: pt.elevation,
        count: pt.count,
      };
    }
  });

  let mostActiveMonth: ClubTelemetryStats['mostActiveMonth'] = null;
  monthlyData.forEach((m) => {
    if (m.totalAttendance > 0) {
      if (!mostActiveMonth || m.totalAttendance > mostActiveMonth.totalAttendance) {
        mostActiveMonth = {
          monthName: m.monthName,
          totalAttendance: m.totalAttendance,
          ridesCount: m.eventCount,
        };
      }
    }
  });

  const telemetry: ClubTelemetryStats = {
    totalPelotonKm,
    totalPelotonElevation,
    totalAttendances: totalAttendancesCount,
    officialRidesCount: totalOfficialRides,
    avgPelotonSize,
    avgRideDistance,
    avgRideElevation,
    earthLapsEquivalent,
    everestEquivalent,
    biggestPelotonEvent,
    longestRideEvent,
    toughestRideEvent,
    mostActiveMonth,
  };

  const carreVert: CarreVertStats = {
    totalPossibleCarres,
    processedEntries,
    podium,
    tiersDistribution,
    ridesBuckets,
    totalMembers,
    activeMembers: activeMembersCount,
    dormantMembers: dormantMembersCount,
    activityRate,
    averageRidesPerActive,
    maxRides,
    topPerformer,
  };

  // 4. Traces Catalog Analytics
  const totalTraces = traces.length;
  let totalCatalogKm = 0;
  let totalCatalogElevation = 0;

  const distanceBuckets = [
    { label: '< 70 km', count: 0, description: 'Sorties de reprise / hivernales' },
    { label: '70 – 90 km', count: 0, description: 'Format standard hebdomadaire' },
    { label: '90 – 110 km', count: 0, description: 'Grandes sorties rythmées' },
    { label: '> 110 km', count: 0, description: 'Classiques & endurance' },
  ];

  const surfaceMap = new Map<string, number>();
  const directionMap = new Map<string, number>();

  traces.forEach((t) => {
    const dist = t.distance || 0;
    const elev = t.elevation || 0;
    totalCatalogKm += dist;
    totalCatalogElevation += elev;

    if (dist < 70) distanceBuckets[0].count++;
    else if (dist <= 90) distanceBuckets[1].count++;
    else if (dist <= 110) distanceBuckets[2].count++;
    else distanceBuckets[3].count++;

    const surf = (t.surface || 'Route').trim();
    surfaceMap.set(surf, (surfaceMap.get(surf) || 0) + 1);

    // Standardize cardinal direction
    let dir = (t.direction || 'Centre').trim();
    if (dir.includes('Nord')) dir = 'Nord (Dyle / Flandre)';
    else if (dir.includes('Sud')) dir = 'Sud (Condroz / Meuse)';
    else if (dir.includes('Est')) dir = 'Est (Hesbaye / Méhaigne)';
    else if (dir.includes('Ouest')) dir = 'Ouest (Roman Païs / Senne)';
    directionMap.set(dir, (directionMap.get(dir) || 0) + 1);
  });

  const avgTraceDistance = totalTraces > 0 ? Math.round(totalCatalogKm / totalTraces) : 0;
  const avgTraceElevation = totalTraces > 0 ? Math.round(totalCatalogElevation / totalTraces) : 0;
  const avgSlopeRatio =
    totalCatalogKm > 0 ? Math.round((totalCatalogElevation / totalCatalogKm) * 10) / 10 : 0;

  // Feedback on traces
  const feedbackByTrace = new Map<string, { ratings: number[]; count: number }>();
  feedback.forEach((f) => {
    if (!f.traceId || typeof f.rating !== 'number') return;
    const entry = feedbackByTrace.get(f.traceId) || { ratings: [], count: 0 };
    entry.ratings.push(f.rating);
    entry.count++;
    feedbackByTrace.set(f.traceId, entry);
  });

  const tracesById = new Map<string, Trace>(traces.map((t) => [t.id, t]));
  const topRatedTraces: TracesCatalogStats['feedbackStats']['topRatedTraces'] = [];

  feedbackByTrace.forEach((val, traceId) => {
    const trace = tracesById.get(traceId);
    if (!trace) return;
    const avg = val.ratings.reduce((a, b) => a + b, 0) / val.ratings.length;
    topRatedTraces.push({
      id: trace.id,
      name: trace.name,
      rating: Math.round(avg * 10) / 10,
      reviewCount: val.count,
      distance: trace.distance,
      elevation: trace.elevation,
    });
  });

  topRatedTraces.sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount);

  const totalReviews = feedback.length;
  const averageRating =
    totalReviews > 0
      ? Math.round(
          (feedback.reduce((sum, f) => sum + (f.rating || 0), 0) / totalReviews) * 10
        ) / 10
      : 0;

  const tracesStats: TracesCatalogStats = {
    totalTraces,
    totalCatalogKm,
    totalCatalogElevation,
    avgTraceDistance,
    avgTraceElevation,
    avgSlopeRatio,
    distanceBuckets,
    surfaceDistribution: Array.from(surfaceMap.entries()).map(([surface, count]) => ({
      surface,
      count,
    })),
    directionDistribution: Array.from(directionMap.entries()).map(([direction, count]) => ({
      direction,
      count,
    })),
    feedbackStats: {
      totalReviews,
      averageRating,
      topRatedTraces: topRatedTraces.slice(0, 5),
    },
  };

  // 5. Group Dynamics (A, B, C, VTT)
  const groupMap = new Map<string, { count: number; rides: number }>();

  // Count from processed entries
  processedEntries.forEach((e) => {
    if (e.rides === 0) return;
    let grp = (e.group || 'Sans groupe').trim();
    if (grp.toUpperCase() === 'V') grp = 'Groupe V (Vert / Allure A)';
    else if (grp.toUpperCase() === 'J') grp = 'Groupe J (Jaune / Allure B)';
    else if (grp.toUpperCase() === 'B') grp = 'Groupe B (Bleu / Allure C)';
    else if (grp.toUpperCase() === 'R') grp = 'Groupe R (Rouge / Sport)';

    const current = groupMap.get(grp) || { count: 0, rides: 0 };
    groupMap.set(grp, {
      count: current.count + 1,
      rides: current.rides + e.rides,
    });
  });

  const totalGroupRides = Array.from(groupMap.values()).reduce((sum, g) => sum + g.rides, 0);

  const groupStats: GroupDynamicsStats['groupStats'] = Array.from(groupMap.entries())
    .map(([group, data]) => ({
      group,
      count: data.count,
      totalAttendances: data.rides,
      avgRides: data.count > 0 ? Math.round(data.rides / data.count) : 0,
      percentOfTotal:
        totalGroupRides > 0 ? Math.round((data.rides / totalGroupRides) * 100) : 0,
    }))
    .sort((a, b) => b.totalAttendances - a.totalAttendances);

  // 6. Democracy & Saturday Rides
  const yearRides = saturdayRides.filter((r) => {
    if (!r.date) return false;
    const info = parseDateInfo(r.date);
    return info && info.year === yearNum;
  });

  const votedRides = yearRides.filter((r) => r.candidateTraceIds && r.candidateTraceIds.length > 0);
  const rideIdsInYear = new Set(yearRides.map((r) => r.id));
  const yearVotes = votes.filter((v) => rideIdsInYear.has(v.rideId));

  const traceVoteCounts = new Map<string, number>();
  yearVotes.forEach((v) => {
    if (v.traceId) {
      traceVoteCounts.set(v.traceId, (traceVoteCounts.get(v.traceId) || 0) + 1);
    }
  });

  const popularTraces: DemocracyStats['popularTraces'] = Array.from(traceVoteCounts.entries())
    .map(([traceId, voteCount]) => {
      const trace = tracesById.get(traceId);
      return {
        traceId,
        traceName: trace?.name || `Parcours ${traceId}`,
        voteCount,
        distance: trace?.distance,
      };
    })
    .sort((a, b) => b.voteCount - a.voteCount)
    .slice(0, 5);

  const democracy: DemocracyStats = {
    totalSaturdayRides: yearRides.length,
    votedRidesCount: votedRides.length,
    totalVotes: yearVotes.length,
    avgVotesPerRide:
      votedRides.length > 0 ? Math.round((yearVotes.length / votedRides.length) * 10) / 10 : 0,
    participationRate:
      totalMembers > 0 && votedRides.length > 0
        ? Math.round((yearVotes.length / (totalMembers * votedRides.length)) * 100)
        : 0,
    popularTraces,
  };

  // 7. Administration & Health
  let cotisationPaid = 0;
  let cotisationPending = 0;
  let cotisationExempt = 0;
  let ffbcLicensedCount = 0;
  let stravaLinkedCount = 0;
  const rolesMap = new Map<string, number>();

  members.forEach((m) => {
    if (m.cotisation2026Status === 'paid') cotisationPaid++;
    else if (m.cotisation2026Status === 'exempt') cotisationExempt++;
    else cotisationPending++;

    if (m.ffbcLicenseNumber && m.ffbcLicenseNumber.trim().length > 0) {
      ffbcLicensedCount++;
    }

    if (m.stravaId && m.stravaId.trim().length > 0) {
      stravaLinkedCount++;
    }

    const roles = Array.isArray(m.role) && m.role.length > 0 ? m.role : ['Membre'];
    roles.forEach((r) => {
      rolesMap.set(r, (rolesMap.get(r) || 0) + 1);
    });
  });

  const memberBase = members.length > 0 ? members.length : 1;
  const cotisationComplianceRate = Math.round(((cotisationPaid + cotisationExempt) / memberBase) * 100);
  const ffbcComplianceRate = Math.round((ffbcLicensedCount / memberBase) * 100);
  const stravaAdoptionRate = Math.round((stravaLinkedCount / memberBase) * 100);

  const administration: AdministrationHealthStats = {
    totalMembers,
    cotisationPaid,
    cotisationPending,
    cotisationExempt,
    cotisationComplianceRate,
    ffbcLicensedCount,
    ffbcComplianceRate,
    stravaLinkedCount,
    stravaAdoptionRate,
    rolesDistribution: Array.from(rolesMap.entries()).map(([role, count]) => ({
      role,
      count,
    })),
  };

  return {
    selectedYear: selectedYear.toString(),
    availableYears,
    telemetry,
    carreVert,
    traces: tracesStats,
    groupDynamics: { groupStats },
    democracy,
    administration,
    weeklyDistribution,
    monthlyData,
  };
}

/**
 * Generates official CSV export for Carré Vert rankings
 */
export function generateCarreVertCsv(stats: ClubAggregatedStatistics): string {
  const headers = [
    'Rang',
    'Membre',
    'Groupe',
    'Carres_Valides',
    'Carres_Possibles',
    'Taux_Assiduite_Pct',
    'Palier_Honneur',
  ];

  const rows = stats.carreVert.processedEntries.map((e, idx) => [
    (idx + 1).toString(),
    `"${e.name.replace(/"/g, '""')}"`,
    `"${(e.group || 'Sans groupe').replace(/"/g, '""')}"`,
    e.rides.toString(),
    stats.carreVert.totalPossibleCarres.toString(),
    `${e.percent}%`,
    e.tier.toUpperCase(),
  ]);

  return [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\n');
}

/**
 * Generates official CSV summary report for the General Assembly (AG)
 */
export function generateClubAgSummaryCsv(stats: ClubAggregatedStatistics): string {
  const lines: string[] = [];

  lines.push(`BILAN OFFICIEL DE LA SAISON CYCLISTE ${stats.selectedYear}`);
  lines.push(`CLUB : CC SAINT-MARTIN BLANMONT`);
  lines.push(`DATE D'EXTRACTION : ${new Date().toLocaleDateString('fr-BE')}`);
  lines.push('');
  lines.push('1. TELEMETRIE SPORTIVE & KILOMETRAGE');
  lines.push(`Kilometres-peloton cumules;${stats.telemetry.totalPelotonKm} km`);
  lines.push(`Denivele positif total conquis;${stats.telemetry.totalPelotonElevation} m D+`);
  lines.push(`Nombre de sorties officielles tenues;${stats.telemetry.officialRidesCount}`);
  lines.push(`Total presences cyclistes enregistrees;${stats.telemetry.totalAttendances}`);
  lines.push(`Taille moyenne du peloton par sortie;${stats.telemetry.avgPelotonSize} cyclistes`);
  lines.push(`Distance moyenne d'une sortie;${stats.telemetry.avgRideDistance} km`);
  lines.push(`Denivele moyen d'une sortie;${stats.telemetry.avgRideElevation} m D+`);
  lines.push(`Equivalent tours de la Terre;${stats.telemetry.earthLapsEquivalent} tours`);
  lines.push(`Equivalent ascensions Everest;${stats.telemetry.everestEquivalent} fois`);
  lines.push('');
  lines.push('2. CARRE VERT & ASSIDUITE');
  lines.push(`Membres inscrits au club;${stats.carreVert.totalMembers}`);
  lines.push(`Membres actifs cette saison;${stats.carreVert.activeMembers}`);
  lines.push(`Membres dormants (0 sortie);${stats.carreVert.dormantMembers}`);
  lines.push(`Taux d'activite du club;${stats.carreVert.activityRate}%`);
  lines.push(`Champion du Carre Vert;${stats.carreVert.topPerformer}`);
  lines.push(`Max carres realises;${stats.carreVert.maxRides} sur ${stats.carreVert.totalPossibleCarres}`);
  lines.push(`Palier Or (>=80% d'assiduite);${stats.carreVert.tiersDistribution.or} cyclos`);
  lines.push(`Palier Argent (60-79%);${stats.carreVert.tiersDistribution.argent} cyclos`);
  lines.push(`Palier Bronze (40-59%);${stats.carreVert.tiersDistribution.bronze} cyclos`);
  lines.push(`Peloton regulier (20-39%);${stats.carreVert.tiersDistribution.peloton} cyclos`);
  lines.push('');
  lines.push('3. PATRIMOINE ROUTIER (CATALOGUE DES TRACES)');
  lines.push(`Parcours repertories;${stats.traces.totalTraces}`);
  lines.push(`Distance cumulée du catalogue;${stats.traces.totalCatalogKm} km`);
  lines.push(`Denivele moyen par trace;${stats.traces.avgTraceElevation} m D+`);
  lines.push(`Avis membres deposes;${stats.traces.feedbackStats.totalReviews}`);
  lines.push(`Note moyenne satisfaction;${stats.traces.feedbackStats.averageRating} / 5`);
  lines.push('');
  lines.push('4. DEMOCRATIE & SORTIES DU SAMEDI');
  lines.push(`Sorties du samedi proposees;${stats.democracy.totalSaturdayRides}`);
  lines.push(`Sorties soumises au vote democratique;${stats.democracy.votedRidesCount}`);
  lines.push(`Total votes exprimes par les membres;${stats.democracy.totalVotes}`);
  lines.push(`Moyenne votants par sortie;${stats.democracy.avgVotesPerRide}`);
  lines.push('');
  lines.push('5. SANTE ADMINISTRATIVE');
  lines.push(`Cotisations reglees ou exemptees;${stats.administration.cotisationPaid + stats.administration.cotisationExempt} (${stats.administration.cotisationComplianceRate}%)`);
  lines.push(`Licencies officiels FFBC;${stats.administration.ffbcLicensedCount} (${stats.administration.ffbcComplianceRate}%)`);
  lines.push(`Adoption profils Strava;${stats.administration.stravaLinkedCount} (${stats.administration.stravaAdoptionRate}%)`);

  return lines.join('\n');
}
