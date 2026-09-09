export interface RoleDefinition {
  key: string;
  label: string;
  description: string;
  badgeStyle: string;
  synonyms: string[];
}

export const CLUB_ROLES: RoleDefinition[] = [
  {
    key: 'Capitaine de Route',
    label: 'Capitaine de Route',
    description: 'Encadrement des pelotons, pointage Carré Vert et sécurité des sorties.',
    badgeStyle: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/30',
    synonyms: ['capitaine', 'capitaine de route', 'captain', 'road captain'],
  },
  {
    key: 'Président',
    label: 'Président',
    description: 'Direction générale du club, représentation officielle et assemblées.',
    badgeStyle: 'bg-[#e03e3e]/10 text-[#e03e3e] border-[#e03e3e]/30',
    synonyms: ['président', 'president'],
  },
  {
    key: 'Trésorier',
    label: 'Trésorier',
    description: 'Gestion financière, cotisations annuelles et commandes d\'équipements.',
    badgeStyle: 'bg-amber-500/10 text-amber-700 border-amber-500/30',
    synonyms: ['trésorier', 'tresorier', 'treasurer'],
  },
  {
    key: 'Secrétaire',
    label: 'Secrétaire',
    description: 'Gestion des adhésions, convocations, PV et correspondances officielles.',
    badgeStyle: 'bg-sky-500/10 text-sky-700 border-sky-500/30',
    synonyms: ['secrétaire', 'secretaire', 'secretary'],
  },
  {
    key: 'Admin',
    label: 'Administrateur',
    description: 'Accès intégral au back-office, gestion des utilisateurs et configuration.',
    badgeStyle: 'bg-[#101216] text-white border-white/10',
    synonyms: ['admin', 'administrateur', 'webmaster'],
  },
  {
    key: 'Member',
    label: 'Membre',
    description: 'Cycliste adhérent du club participant aux sorties et rituels.',
    badgeStyle: 'bg-[#f2efe9] text-[#5c6370] border-[#e4e0d8]',
    synonyms: ['member', 'membre', 'cycliste', 'adhérent', 'adherent'],
  },
];

/**
 * Normalizes an array or single value of roles into a clean string array.
 */
export function normalizeRoles(roles: string[] | string | undefined | null): string[] {
  if (!roles) return [];
  if (Array.isArray(roles)) {
    return roles.map((r) => String(r).trim()).filter(Boolean);
  }
  return [String(roles).trim()].filter(Boolean);
}

/**
 * Checks if a member has a specific role by key or synonym (case and accent insensitive).
 */
export function hasClubRole(roles: string[] | string | undefined | null, roleKey: string): boolean {
  const normalized = normalizeRoles(roles);
  const def = CLUB_ROLES.find((r) => r.key === roleKey);

  if (def) {
    return normalized.some((r) => {
      const lower = r.toLowerCase();
      return (
        lower === def.key.toLowerCase() ||
        def.synonyms.some((syn) => lower.includes(syn) || syn.includes(lower))
      );
    });
  }

  // Fallback direct check
  const targetLower = roleKey.toLowerCase();
  return normalized.some((r) => r.toLowerCase() === targetLower);
}

/**
 * Checks if a role matches any of the standard club roles.
 */
export function isStandardClubRole(role: string): boolean {
  const lower = role.toLowerCase().trim();
  return CLUB_ROLES.some(
    (def) =>
      lower === def.key.toLowerCase() ||
      def.synonyms.some((syn) => lower === syn || lower.includes(syn))
  );
}

/**
 * Toggles a standard role on or off while maintaining clean arrays and eliminating duplicate synonyms.
 */
export function toggleClubRole(
  currentRoles: string[] | string | undefined | null,
  roleKey: string,
  enable: boolean
): string[] {
  const normalized = normalizeRoles(currentRoles);
  const def = CLUB_ROLES.find((r) => r.key === roleKey);
  if (!def) return normalized;

  // Filter out this role and any of its synonyms
  const filtered = normalized.filter((r) => {
    const lower = r.toLowerCase();
    return (
      lower !== def.key.toLowerCase() &&
      !def.synonyms.some((syn) => lower.includes(syn) || syn.includes(lower))
    );
  });

  if (enable) {
    return [...filtered, def.key];
  }

  return filtered;
}

/**
 * Extracts non-standard / specialized roles (e.g. Traceur, Resp. Calendrier, Resp. maillots, Vice-Président).
 */
export function extractCustomRoles(roles: string[] | string | undefined | null): string[] {
  const normalized = normalizeRoles(roles);
  return normalized.filter((r) => !isStandardClubRole(r));
}

/**
 * Suggested specialty / custom roles often used in the club.
 */
export const SUGGESTED_SPECIALTIES = [
  'Traceur',
  'Resp. Calendrier',
  'Resp. maillots',
  'Vice-Président',
  'Resp. section VTT',
  'Sécurité',
];
