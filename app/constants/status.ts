/**
 * Centralized status constants, labels and styling classes.
 */

export const COTISATION_STATUS_CONFIG = {
  paid: {
    label: 'Cotisation En ordre',
    shortLabel: 'Payée',
    variant: 'success' as const,
    bgClass: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  },
  pending: {
    label: 'Cotisation En attente',
    shortLabel: 'En attente',
    variant: 'warning' as const,
    bgClass: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
  },
  exempt: {
    label: 'Cotisation Dispensé',
    shortLabel: 'Dispensé',
    variant: 'neutral' as const,
    bgClass: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20',
  },
} as const;

export const POLL_STATUS_CONFIG = {
  active: {
    label: 'Actif',
    variant: 'success' as const,
    bgClass: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  },
  draft: {
    label: 'Brouillon',
    variant: 'warning' as const,
    bgClass: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  },
  closed: {
    label: 'Clôturé',
    variant: 'neutral' as const,
    bgClass: 'bg-slate-500/10 text-slate-600 border-slate-500/20',
  },
} as const;

export const TRIAL_STATUS_CONFIG = {
  pending: { label: 'En attente', variant: 'warning' as const },
  contacted: { label: 'Contacté', variant: 'neutral' as const },
  ride_1: { label: 'Sortie 1/3', variant: 'brand' as const },
  ride_2: { label: 'Sortie 2/3', variant: 'brand' as const },
  ride_3: { label: 'Sortie 3/3', variant: 'brand' as const },
  completed: { label: 'Essais terminés', variant: 'success' as const },
  converted: { label: 'Adhérent club', variant: 'success' as const },
  archived: { label: 'Archivé', variant: 'neutral' as const },
} as const;
