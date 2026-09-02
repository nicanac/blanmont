'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  PencilIcon,
  KeyIcon,
  MagnifyingGlassIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';
import DeleteMemberButton from './DeleteMemberButton';
import { Member } from '@/app/types';

interface MembersTableProps {
  initialMembers: Member[];
}

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

function getInitials(name: string): string {
  if (!name) return 'CC';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function getAvatarGradient(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash << 5) - hash + name.charCodeAt(i);
    hash |= 0;
  }
  const gradients = [
    'from-[#161922] to-[#0a0c10]',
    'from-[#2e1216] to-[#101216]',
    'from-[#112233] to-[#0a0c10]',
    'from-[#14261c] to-[#0a0c10]',
  ];
  return gradients[Math.abs(hash) % gradients.length];
}

export default function MembersTable({ initialMembers }: MembersTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});

  const filteredMembers = initialMembers.filter((member) => {
    const term = searchTerm.toLowerCase().trim();
    const rolesStr = Array.isArray(member.role) ? member.role.join(' ') : String(member.role || '');
    return (
      !term ||
      member.name.toLowerCase().includes(term) ||
      (member.email && member.email.toLowerCase().includes(term)) ||
      rolesStr.toLowerCase().includes(term)
    );
  });

  const getRoleBadgeStyle = (role: string): string => {
    const r = role.toLowerCase();
    if (r.includes('président') || r.includes('president')) {
      return 'bg-[#e03e3e]/10 text-[#e03e3e] border-[#e03e3e]/30 font-bold';
    }
    if (r.includes('trésorier') || r.includes('tresorier') || r.includes('treasurer')) {
      return 'bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold';
    }
    if (r.includes('secrétaire') || r.includes('secretaire') || r.includes('secretary')) {
      return 'bg-sky-50 text-sky-700 border-sky-200 font-semibold';
    }
    if (r.includes('admin') || r.includes('webmaster')) {
      return 'bg-[#101216] text-white border-white/10 font-bold';
    }
    if (r.includes('capitaine')) {
      return 'bg-indigo-50 text-indigo-700 border-indigo-200 font-semibold';
    }
    return 'bg-[#f2efe9] text-[#5c6370] border-[#e4e0d8]';
  };

  return (
    <div className="space-y-4">
      {/* Search Input Bar */}
      <div className="relative max-w-md">
        <MagnifyingGlassIcon className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#7d8493]" />
        <input
          type="text"
          className="block w-full rounded-md border border-[#e4e0d8] bg-white py-2 pl-10 pr-4 text-xs sm:text-sm text-[#101216] placeholder:text-[#7d8493] focus:border-[#e03e3e] focus:outline-none transition-colors shadow-xs"
          placeholder="Rechercher par nom, rôle ou email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Table Container */}
      <div className="overflow-hidden rounded-lg border border-[#e4e0d8] bg-white shadow-xs">
        <table className="min-w-full divide-y divide-[#e4e0d8]">
          <thead className="bg-[#f2efe9]">
            <tr>
              <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-[#7d8493]">
                Membre
              </th>
              <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-[#7d8493]">
                Email
              </th>
              <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-[#7d8493]">
                Rôle(s)
              </th>
              <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-[#7d8493]">
                Strava
              </th>
              <th className="px-6 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-[#7d8493]">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#efece5] bg-white text-xs">
            {filteredMembers.map((member) => {
              const hasPhoto = isValidPhotoUrl(member.photoUrl) && !imgErrors[member.id];
              const initials = getInitials(member.name);
              const gradient = getAvatarGradient(member.name);

              return (
                <tr key={member.id} className="hover:bg-[#faf8f5] transition-colors">
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="flex items-center gap-3">
                      {/* Avatar with fallback initials */}
                      <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full bg-[#161922] border border-[#e4e0d8] flex items-center justify-center font-bold text-xs text-white">
                        {hasPhoto ? (
                          <img
                            src={member.photoUrl}
                            alt={member.name}
                            onError={() => setImgErrors((prev) => ({ ...prev, [member.id]: true }))}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className={`h-full w-full bg-gradient-to-br ${gradient} flex items-center justify-center text-xs font-extrabold text-white`}>
                            {initials}
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-[#101216]">{member.name}</p>
                        {member.bio && (
                          <p className="text-xs text-[#7d8493] line-clamp-1 max-w-xs">{member.bio}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-[#5c6370]">
                    {member.email || '-'}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {(Array.isArray(member.role) ? member.role : [member.role].filter(Boolean)).map((r) => (
                        <span
                          key={r}
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs border ${getRoleBadgeStyle(
                            String(r)
                          )}`}
                        >
                          {String(r)}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-[#5c6370]">
                    {member.stravaId ? (
                      <a
                        href={`https://www.strava.com/athletes/${member.stravaId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold text-[#fc4c02] hover:underline"
                      >
                        Athlète Strava ↗
                      </a>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        href={`/admin/members/${member.id}/edit`}
                        className="rounded-md p-1.5 text-[#7d8493] hover:bg-[#f2efe9] hover:text-[#101216] transition-colors"
                        title="Modifier"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </Link>
                      <Link
                        href={`/admin/members/${member.id}/reset-password`}
                        className="rounded-md p-1.5 text-[#7d8493] hover:bg-sky-50 hover:text-sky-600 transition-colors"
                        title="Réinitialiser mot de passe"
                      >
                        <KeyIcon className="h-4 w-4" />
                      </Link>
                      <DeleteMemberButton
                        memberId={member.id}
                        memberName={member.name}
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filteredMembers.length === 0 && (
          <div className="py-12 text-center text-xs text-[#7d8493]">
            Aucun membre trouvé pour « {searchTerm} »
          </div>
        )}
      </div>
    </div>
  );
}
