import territoryData from '@/app/data/territory.json';

export interface TerritoryPlace {
  name: string;
  kind: string;
  x: number;
  y: number;
  population?: number;
}

export interface TerritoryRiver {
  name: string;
  x: number;
  y: number;
}

export interface Territory {
  generatedAt: string;
  center: { lat: number; lon: number; name: string };
  extentKm: number;
  elevation: { min: number; max: number; interval: number; indexEvery: number };
  places: TerritoryPlace[];
  rivers: TerritoryRiver[];
  credits: { relief: string; data: string };
}

export const territory = territoryData as Territory;

/** Map lettering ranks, like a topographic sheet: towns in wide caps, villages in roman. */
export type LabelRank = 'town' | 'village';

export interface MapLabel {
  name: string;
  x: number;
  y: number;
  rank: LabelRank;
  /** Lower numbers stay visible on small screens. */
  priority: 1 | 2 | 3;
}

const CURATED: Array<[string, LabelRank, 1 | 2 | 3]> = [
  ['Gembloux', 'town', 1],
  ['Wavre', 'town', 1],
  ['Louvain-la-Neuve', 'town', 1],
  ['Ottignies', 'town', 2],
  ['Perwez', 'town', 2],
  ['Chastre', 'village', 1],
  ['Walhain', 'village', 1],
  ['Mont-Saint-Guibert', 'village', 1],
  ['Villers-la-Ville', 'village', 2],
  ['Court-Saint-Etienne', 'village', 2],
  ['Chaumont-Gistoux', 'village', 2],
  ['Sombreffe', 'village', 2],
  ['Perbais', 'village', 2],
  ['Cortil-Noirmont', 'village', 2],
  ['Corbais', 'village', 3],
  ['Hévillers', 'village', 3],
  ['Villeroux', 'village', 3],
  ['Gentinnes', 'village', 3],
  ['Ernage', 'village', 3],
  ['Sauvenière', 'village', 3],
  ['Tourinnes-Saint-Lambert', 'village', 3],
  ['Nil-Saint-Vincent-Saint-Martin', 'village', 3],
  ['Corroy-le-Grand', 'village', 3],
  ['Corroy-le-Château', 'village', 3],
  ['Grand-Leez', 'village', 3],
  ['Tilly', 'village', 3],
  ['Mellery', 'village', 3],
  ['Saint-Géry', 'village', 3],
  ['Thorembais-Saint-Trond', 'village', 3],
  ['Orbais', 'village', 3],
  ['Lonzée', 'village', 3],
  ['Bothey', 'village', 3],
];

const RIVERS: Array<[string, string]> = [
  ['La Dyle', 'La Dyle'],
  ["L'Orne", "L'Orne"],
  ['La Thyle', 'La Thyle'],
  ["L'Orneau", "L'Orneau"],
  ['Mehaigne', 'La Mehaigne'],
  ['La Grande Gette', 'La Grande Gette'],
];

export function getMapLabels(maxPriority: 1 | 2 | 3 = 3): MapLabel[] {
  const labels: MapLabel[] = [];
  for (const [name, rank, priority] of CURATED) {
    if (priority > maxPriority) continue;
    const candidates = territory.places.filter((p) => p.name === name && p.kind !== 'station');
    const place = candidates.find((p) => p.kind === 'town') ?? candidates[0];
    if (!place) continue;
    labels.push({ name: place.name, x: place.x, y: place.y, rank, priority });
  }
  return labels;
}

export function getRiverLabels(): Array<{ name: string; x: number; y: number }> {
  return RIVERS.flatMap(([source, display]) => {
    const river = territory.rivers.find((r) => r.name === source);
    return river ? [{ name: display, x: river.x, y: river.y }] : [];
  });
}

/** Formats decimal degrees as a sheet-margin coordinate, e.g. 50°37′23″ N. */
export function formatCoordinate(value: number, axis: 'lat' | 'lon'): string {
  const hemi = axis === 'lat' ? (value >= 0 ? 'N' : 'S') : value >= 0 ? 'E' : 'O';
  const abs = Math.abs(value);
  let deg = Math.floor(abs);
  let min = Math.floor((abs - deg) * 60);
  let sec = Math.round(((abs - deg) * 60 - min) * 60);
  if (sec === 60) {
    sec = 0;
    min += 1;
  }
  if (min === 60) {
    min = 0;
    deg += 1;
  }
  return `${deg}°${String(min).padStart(2, '0')}′${String(sec).padStart(2, '0')}″ ${hemi}`;
}

export const DEPARTURE_POINT = {
  /** The name the club uses for its meeting point. */
  clubName: 'Place de Blanmont',
  /** The toponym printed on the map at the geodetic mark. */
  name: 'Place de la Féchère',
  village: 'Blanmont',
  commune: 'Chastre',
  postcode: '1450',
  lat: territory.center.lat,
  lon: territory.center.lon,
  coordinates: `${formatCoordinate(territory.center.lat, 'lat')} · ${formatCoordinate(territory.center.lon, 'lon')}`,
  osmUrl: `https://www.openstreetmap.org/?mlat=${territory.center.lat}&mlon=${territory.center.lon}#map=16/${territory.center.lat}/${territory.center.lon}`,
};

export const MAP_CREDITS = `${territory.credits.relief} · ${territory.credits.data}`;
