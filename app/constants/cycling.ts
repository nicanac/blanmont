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

/**
 * The four weekend groups as the club presents them publicly, each printed on the
 * territory sheet as a road class of the map legend (main road, secondary, local, track).
 */
export interface PaceGroup {
  id: CyclingGroup;
  name: string;
  speed: string;
  roadClass: string;
  description: string;
}

export const PACE_GROUPS: readonly PaceGroup[] = [
  {
    id: 'A',
    name: 'Groupe A',
    speed: '> 30 km/h',
    roadClass: 'Route principale',
    description:
      'Sportif, rythmé et soutenu. Pour les cyclistes aguerris habitués aux relais dynamiques.',
  },
  {
    id: 'B',
    name: 'Groupe B',
    speed: '25 – 28 km/h',
    roadClass: 'Route secondaire',
    description:
      'Équilibré, fluide et convivial en peloton régulier. Idéal pour progresser et rouler groupé.',
  },
  {
    id: 'C',
    name: 'Groupe C',
    speed: '< 25 km/h',
    roadClass: 'Route locale',
    description:
      'Découverte, reprise et plaisir sans pression. Adapté aux vélos traditionnels et VAE.',
  },
  {
    id: 'VTT',
    name: 'Groupe VTT',
    speed: 'Sentiers',
    roadClass: 'Chemin & sous-bois',
    description: 'Chemins de terre, sous-bois et sentiers vallonnés du Brabant wallon.',
  },
] as const;
