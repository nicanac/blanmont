const BRUSSELS = 'Europe/Brussels';

/** fr-BE long date. A bare YYYY-MM-DD (bank value date) is read at noon UTC so no timezone shifts it. */
export function formatDate(value: string): string {
  const date = new Date(value.length === 10 ? `${value}T12:00:00Z` : value);
  return date.toLocaleDateString('fr-BE', { day: 'numeric', month: 'long', year: 'numeric', timeZone: BRUSSELS });
}

/** Campaign deadline: date and time, e.g. "12 décembre 2026 à 20:00". */
export function formatCampaignDeadline(iso: string): string {
  const date = new Date(iso);
  const time = date.toLocaleTimeString('fr-BE', { hour: '2-digit', minute: '2-digit', timeZone: BRUSSELS });
  return `${formatDate(iso)} à ${time}`;
}

export function formatEuro(value: number): string {
  return `${value.toFixed(2).replace('.', ',')} €`;
}
