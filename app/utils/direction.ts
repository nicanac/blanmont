export interface ParsedDirection {
  /** Bearing the route heads out on, in degrees (0 = north). */
  bearing: number;
  code: 'N' | 'NE' | 'E' | 'SE' | 'S' | 'SO' | 'O' | 'NO';
  label: string;
}

const LABELS: Record<ParsedDirection['code'], string> = {
  N: 'Nord',
  NE: 'Nord-Est',
  E: 'Est',
  SE: 'Sud-Est',
  S: 'Sud',
  SO: 'Sud-Ouest',
  O: 'Ouest',
  NO: 'Nord-Ouest',
};

const BEARINGS: Record<ParsedDirection['code'], number> = {
  N: 0,
  NE: 45,
  E: 90,
  SE: 135,
  S: 180,
  SO: 225,
  O: 270,
  NO: 315,
};

/**
 * Reads the free-text direction of a route ("↗ Nord Ouest", "← Ouest", "North", "Sud-Est")
 * into a canonical compass point. The words win over any arrow glyph in the source text.
 */
export function parseDirection(direction?: string | null): ParsedDirection | null {
  if (!direction) return null;
  const text = direction
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
  const north = /\b(nord|north)\b/.test(text);
  const south = /\b(sud|south)\b/.test(text);
  const east = /\b(est|east)\b/.test(text);
  const west = /\b(ouest|west)\b/.test(text);

  let code: ParsedDirection['code'] | null = null;
  if (north && east) code = 'NE';
  else if (north && west) code = 'NO';
  else if (south && east) code = 'SE';
  else if (south && west) code = 'SO';
  else if (north) code = 'N';
  else if (south) code = 'S';
  else if (east) code = 'E';
  else if (west) code = 'O';
  if (!code) return null;
  return { code, bearing: BEARINGS[code], label: LABELS[code] };
}
