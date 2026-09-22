/**
 * Cycling domain constants for the CC Saint-Martin Blanmont club.
 */

export const CYCLING_GROUPS = ['A', 'B', 'C', 'VTT'] as const;
export type CyclingGroup = (typeof CYCLING_GROUPS)[number];

export const CYCLING_GROUP_CHOICES = [
  'Groupe A',
  'Groupe B',
  'Groupe C',
  'Groupe VTT',
  'Autre',
] as const;
export type CyclingGroupChoiceType = (typeof CYCLING_GROUP_CHOICES)[number];

export const POLL_DAY_CHOICES = ['samedi', 'dimanche', 'les-deux', 'absent'] as const;
export type PollDayChoiceType = (typeof POLL_DAY_CHOICES)[number];

export const POLL_DAY_LABELS: Record<string, string> = {
  samedi: 'Samedi uniquement',
  dimanche: 'Dimanche uniquement',
  'les-deux': 'Samedi & Dimanche',
  absent: 'Absent ce week-end',
};

export const GROUP_DESCRIPTIONS: Record<CyclingGroup, { speed: string; description: string }> = {
  A: {
    speed: '28 - 32+ km/h',
    description: 'Peloton rapide, sorties rythmées et dénivelé soutenu.',
  },
  B: {
    speed: '25 - 28 km/h',
    description: 'Peloton régulier, allure soutenue et dynamique.',
  },
  C: {
    speed: '22 - 25 km/h',
    description: 'Peloton convivial, accent sur le plaisir et l’esprit de groupe.',
  },
  VTT: {
    speed: 'Tout-terrain',
    description: 'Sorties chemins, sous-bois et sentiers techniques.',
  },
};

export const BIKE_TYPES = ['Route', 'VTT', 'Gravel', 'VAE'] as const;
export type BikeType = (typeof BIKE_TYPES)[number];

export const EXPERIENCE_LEVELS = ['Débutant', 'Intermédiaire', 'Confirmé', 'Compétiteur'] as const;
export type ExperienceLevel = (typeof EXPERIENCE_LEVELS)[number];
