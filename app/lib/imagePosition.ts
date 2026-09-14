/**
 * Utility functions for parsing and formatting image vertical alignment / focal points.
 * Reused across Hero banner and Member portraits.
 */

export interface PositionPreset {
  id: 'top' | 'center' | 'bottom';
  label: string;
  shortLabel: string;
  percent: number;
  position: string;
}

export const VERTICAL_PRESETS: PositionPreset[] = [
  { id: 'top', label: 'Haut (Visages / Têtes)', shortLabel: 'Haut', percent: 15, position: 'center 15%' },
  { id: 'center', label: 'Centre (Standard)', shortLabel: 'Centre', percent: 50, position: 'center center' },
  { id: 'bottom', label: 'Bas (Buste / Vélos)', shortLabel: 'Bas', percent: 85, position: 'center 85%' },
];

/**
 * Extracts numeric vertical percentage (0 - 100) from an object-position string.
 * Supports values like 'center 25%', 'top', 'center center', etc.
 */
export function parseVerticalPosition(position?: string): number {
  if (!position) return 50;
  const pos = position.toLowerCase().trim();
  if (pos.includes('top')) return 15;
  if (pos.includes('bottom')) return 85;
  if (pos === 'center' || pos === 'center center') return 50;
  const match = pos.match(/(\d+)%/);
  if (match) return parseInt(match[1], 10);
  return 50;
}

/**
 * Formats a vertical percentage (0 - 100) into a standard CSS object-position string.
 */
export function formatVerticalPosition(percent: number): string {
  const clamped = Math.max(0, Math.min(100, Math.round(percent)));
  return `center ${clamped}%`;
}
