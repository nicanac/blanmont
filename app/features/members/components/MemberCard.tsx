'use client';

import { useState } from 'react';
import { Member } from '../../../types';
import { ShieldCheckIcon, UserIcon, ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';

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
 * Deterministically generates an editorial gradient based on the member's name.
 */
function getAvatarGradient(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash << 5) - hash + name.charCodeAt(i);
    hash |= 0;
  }
  const gradients = [
    'from-[#161922] via-[#242938] to-[#0a0c10]', // Deep Ink
    'from-[#2e1216] via-[#3d181d] to-[#101216]', // Crimson Garnet
    'from-[#112233] via-[#1a324a] to-[#0a0c10]', // Royal Navy
    'from-[#14261c] via-[#1e3b2b] to-[#0a0c10]', // Forest Racing
    'from-[#2a1e12] via-[#3d2c1a] to-[#101216]', // Amber Ochre
  ];
  return gradients[Math.abs(hash) % gradients.length];
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
  const gradient = getAvatarGradient(member.name);
  const roles = normalizeRoles(member.role);
  const hasValidPhoto = isValidPhotoUrl(member.photoUrl) && !imgError;

  return (
    <li className="group flex flex-col rounded-lg border border-[#e4e0d8] bg-white overflow-hidden transition-all duration-300 hover:border-[#e03e3e]/40 hover:shadow-lg hover:-translate-y-1">
      {/* ──── Portrait / Fallback Avatar Container ──── */}
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-[#161922]">
        {hasValidPhoto ? (
          <img
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            src={member.photoUrl}
            alt={member.name}
            onError={() => setImgError(true)}
            loading="lazy"
          />
        ) : (
          /* High-craft editorial monogram fallback when photo is missing or broken */
          <div className={`relative h-full w-full bg-gradient-to-br ${gradient} flex flex-col items-center justify-center select-none overflow-hidden p-6`}>
            {/* Watermark cycling chainring / crest background */}
            <svg
              className="pointer-events-none absolute -right-6 -bottom-6 h-40 w-40 text-white/5 transform rotate-12"
              viewBox="0 0 100 100"
              fill="currentColor"
              aria-hidden="true"
            >
              <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="4" fill="none" />
              <circle cx="50" cy="50" r="20" stroke="currentColor" strokeWidth="3" fill="none" />
              <path d="M50 10 L50 90 M10 50 L90 50 M22 22 L78 78 M22 78 L78 22" stroke="currentColor" strokeWidth="2" />
            </svg>

            <div className="relative z-10 flex flex-col items-center text-center space-y-2">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/10 border border-white/15 backdrop-blur-sm shadow-inner">
                <span className="text-xl font-extrabold uppercase tracking-tight text-white">
                  {initials}
                </span>
              </div>
              <span className="text-xs font-semibold uppercase tracking-[0.12em] text-[#a7adbb]/80">
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
                <span
                  key={idx}
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider backdrop-blur-md shadow-sm border ${
                    isBureau
                      ? 'bg-[#e03e3e]/90 text-white border-[#e03e3e]'
                      : isCaptain
                      ? 'bg-[#101216]/85 text-sky-300 border-sky-400/30'
                      : 'bg-[#101216]/80 text-[#f5f6f8] border-white/20'
                  }`}
                >
                  {isBureau && <ShieldCheckIcon className="h-3 w-3 shrink-0" />}
                  {isCaptain && <span className="h-1.5 w-1.5 rounded-full bg-sky-400 shrink-0" />}
                  <span className="truncate max-w-[140px]">{role}</span>
                </span>
              );
            })}
          </div>
        )}
      </div>

      {/* ──── Member Details Card Body ──── */}
      <div className="p-5 flex flex-col flex-grow justify-between space-y-3 bg-white">
        <div>
          <h3 className="text-base sm:text-lg font-bold tracking-tight text-[#101216] group-hover:text-[#e03e3e] transition-colors truncate">
            {member.name}
          </h3>

          {member.bio ? (
            <p className="mt-1.5 text-xs text-[#5c6370] line-clamp-2 leading-relaxed">
              {member.bio}
            </p>
          ) : (
            <p className="mt-1.5 text-xs text-[#7d8493] italic">
              Membre actif du peloton de Blanmont
            </p>
          )}
        </div>

        {/* Bottom Metadata & Social / Strava links */}
        <div className="pt-3 border-t border-[#e4e0d8] flex items-center justify-between text-xs text-[#7d8493]">
          <span className="inline-flex items-center gap-1">
            <UserIcon className="h-3.5 w-3.5 text-[#7d8493]" />
            <span>Club de Blanmont</span>
          </span>

          {member.stravaId && (
            <a
              href={`https://www.strava.com/athletes/${member.stravaId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-semibold text-[#fc4c02] hover:underline"
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
