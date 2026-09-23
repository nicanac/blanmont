'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Member } from '../../../types';
import { ShieldCheckIcon, UserIcon, ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';
import Badge from '@/app/components/ui/Badge';
import TerritoryMap from '@/app/components/carte/TerritoryMap';

interface MemberCardProps {
  member: Member;
}

/**
 * Extracts 1-2 uppercase initials from a name.
 */
function getInitials(name: string): string {
  if (!name) return 'CC';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Deterministically picks the patch of the territory printed behind a member's monogram.
 */
function getSheetFocus(name: string): { x: number; y: number } {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash << 5) - hash + name.charCodeAt(i);
    hash |= 0;
  }
  const h = Math.abs(hash);
  return { x: 30 + (h % 40), y: 30 + (Math.floor(h / 40) % 40) };
}

/**
 * Categorizes and formats roles safely.
 */
function normalizeRoles(roles: string[] | string | undefined): string[] {
  if (!roles) return [];
  if (Array.isArray(roles)) {
    return roles.filter((r) => Boolean(r) && r !== 'Member' && r !== 'Membre');
  }
  if (typeof roles === 'string') {
    return [roles].filter((r) => r !== 'Member' && r !== 'Membre');
  }
  return [];
}

/**
 * Validates that a photo URL is real and not a dummy/mock placeholder.
 */
function isValidPhotoUrl(url?: string): boolean {
  if (!url) return false;
  const trimmed = url.trim().toLowerCase();
  if (
    !trimmed ||
    trimmed.includes('placehold.co') ||
    trimmed.includes('via.placeholder') ||
    trimmed.includes('placeholder') ||
    trimmed.includes('default-avatar') ||
    trimmed === 'null' ||
    trimmed === 'undefined'
  ) {
    return false;
  }
  return true;
}

export default function MemberCard({ member }: MemberCardProps) {
  const [imgError, setImgError] = useState(false);
  const initials = getInitials(member.name);
  const focus = getSheetFocus(member.name);
  const roles = normalizeRoles(member.role);
  const hasValidPhoto = isValidPhotoUrl(member.photoUrl) && !imgError;

  return (
    <li className="group flex flex-col overflow-hidden border border-line bg-white transition-colors duration-200 ease-out hover:border-ink dark:border-night-line dark:bg-night-2 dark:hover:border-snow-3">
      {/* ──── Portrait / Fallback Avatar Container ──── */}
      <div className="relative aspect-[4/5] w-full overflow-hidden border-b border-line bg-paper-2 dark:border-night-line dark:bg-night-3">
        {hasValidPhoto ? (
          <Image
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            src={member.photoUrl}
            alt={member.name}
            fill
            unoptimized
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            style={{ objectPosition: member.photoPosition || 'center center' }}
            onError={() => setImgError(true)}
          />
        ) : (
          /* Monogram printed on a patch of the club's territory when no portrait exists */
          <div
            className="relative flex size-full select-none flex-col items-center justify-center overflow-hidden p-6 [--sheet:1400px]"
            style={{ '--fx': String(focus.x / 100), '--fy': String(focus.y / 100) } as React.CSSProperties}
          >
            <TerritoryMap
              labels={0}
              marker="none"
              layers="relief"
              sheetClassName="w-(--sheet) left-[calc(50%-var(--sheet)*var(--fx))] top-[calc(50%-var(--sheet)*var(--fy))]"
            />
            <div className="relative z-10 flex flex-col items-center space-y-2 text-center">
              <span className="flex size-20 items-center justify-center border border-ink bg-white font-wide text-2xl font-extrabold uppercase text-ink dark:border-snow-3 dark:bg-night-2 dark:text-snow">
                {initials}
              </span>
              <span className="bg-white/90 px-2 py-0.5 font-narrow text-xs font-bold uppercase tracking-[0.12em] text-ink-2 dark:bg-night-2/90 dark:text-snow-2">
                CC Saint-Martin
              </span>
            </div>
          </div>
        )}

        {/* Floating role badge overlay on photo top */}
        {roles.length > 0 && (
          <div className="absolute top-3 left-3 right-3 flex flex-wrap gap-1.5 z-10">
            {roles.map((role, idx) => {
              const isBureau = /président|tresorier|trésorier|secrétaire|secretaire|vice/i.test(role);
              const isCaptain = /capitaine/i.test(role);

              return (
                <Badge
                  key={idx}
                  variant={isBureau ? 'brand-solid' : 'neutral'}
                  size="sm"
                  icon={isBureau ? ShieldCheckIcon : undefined}
                  className={isCaptain ? 'border border-white/20' : 'border border-white/15'}
                >
                  <span className="truncate max-w-[140px]">{role}</span>
                </Badge>
              );
            })}
          </div>
        )}
      </div>

      {/* ──── Member Details Card Body ──── */}
      <div className="p-5 flex flex-col flex-grow justify-between space-y-3 bg-white dark:bg-night-2">
        <div>
          <h3 className="truncate font-semiwide text-base font-extrabold text-ink transition-colors duration-150 group-hover:text-brand sm:text-lg dark:text-snow dark:group-hover:text-brand-soft">
            {member.name}
          </h3>

          {member.bio ? (
            <p className="mt-1.5 text-xs text-ink-3 dark:text-snow-3 line-clamp-2 leading-relaxed">
              {member.bio}
            </p>
          ) : (
            <p className="mt-1.5 text-xs text-ink-3 dark:text-snow-3 italic">
              Membre actif du peloton de Blanmont
            </p>
          )}
        </div>

        {/* Bottom Metadata & Social / Strava links */}
        <div className="pt-3 border-t border-line dark:border-night-line flex items-center justify-between text-xs text-ink-3 dark:text-snow-3">
          <span className="inline-flex items-center gap-1">
            <UserIcon className="h-3.5 w-3.5 text-ink-3 dark:text-snow-3" />
            <span>Club de Blanmont</span>
          </span>

          {member.stravaId && (
            <a
              href={`https://www.strava.com/athletes/${member.stravaId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-semibold text-[#fc4c02] hover:underline transition-colors duration-150"
              title="Profil Strava"
            >
              <span>Strava</span>
              <ArrowTopRightOnSquareIcon className="h-3 w-3" />
            </a>
          )}
        </div>
      </div>
    </li>
  );
}
