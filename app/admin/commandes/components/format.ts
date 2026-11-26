import type { EquipmentOrderStatus } from '@/app/types/equipment';

export const formatEuro = (value: number): string => `${value.toFixed(2).replace('.', ',')} €`;

export const formatCents = (cents: number): string => formatEuro(cents / 100);

/** DD/MM/YYYY from a YYYY-MM-DD day or an ISO timestamp (Europe/Brussels). Empty when missing. */
export function formatDate(value?: string): string {
  if (!value) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value.split('-').reverse().join('/');
  return new Date(value).toLocaleDateString('fr-BE', { timeZone: 'Europe/Brussels' });
}

export const STATUS_LABELS: Record<EquipmentOrderStatus, string> = {
  pending: 'En attente de paiement',
  paid: 'Payée',
  confirmed: 'Confirmée (ancienne)',
  delivered: 'Remise',
  cancelled: 'Annulée',
};

/** Excel-friendly CSV download (BOM so accents survive). */
export function downloadCsv(filename: string, rows: (string | number | undefined)[][]): void {
  const esc = (v: string | number | undefined): string => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const csv = rows.map((r) => r.map(esc).join(',')).join('\n');
  const url = URL.createObjectURL(
    new Blob([String.fromCharCode(0xfeff) + csv], { type: 'text/csv;charset=utf-8' })
  );
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export const INPUT_CLASS =
  'min-h-[44px] w-full rounded-md border border-line bg-paper px-3.5 py-2.5 text-sm text-ink placeholder-ink-3 focus:border-brand focus:outline-hidden dark:border-night-line dark:bg-night-2 dark:text-white';

export const LABEL_CLASS = 'mb-1 block text-xs font-semibold text-ink-3 dark:text-snow-3';
