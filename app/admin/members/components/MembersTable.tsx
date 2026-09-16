'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  PencilIcon,
  KeyIcon,
  MagnifyingGlassIcon,
  UsersIcon,
  ShieldCheckIcon,
  PhotoIcon,
  PhoneIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import { BicycleIcon } from '@/app/components/ui/CyclingIcons';
import DeleteMemberButton from './DeleteMemberButton';
import { Member } from '@/app/types';

interface MembersTableProps {
  initialMembers: Member[];
}

type MemberTabFilter = 'all' | 'capitaines' | 'bureau' | 'admin' | 'paid' | 'pending' | 'no-ice';

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
  const [tabFilter, setTabFilter] = useState<MemberTabFilter>('all');
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});
  const [selectedIceMember, setSelectedIceMember] = useState<Member | null>(null);

  const captainsCount = useMemo(() => {
    return initialMembers.filter((m) => {
      const rolesStr = Array.isArray(m.role) ? m.role.join(' ') : String(m.role || '');
      return /capitaine/i.test(rolesStr);
    }).length;
  }, [initialMembers]);

  const bureauCount = useMemo(() => {
    return initialMembers.filter((m) => {
      const rolesStr = Array.isArray(m.role) ? m.role.join(' ') : String(m.role || '');
      return /président|president|tresorier|trésorier|treasurer|secrétaire|secretaire|secretary|vice/i.test(rolesStr);
    }).length;
  }, [initialMembers]);

  const adminCount = useMemo(() => {
    return initialMembers.filter((m) => {
      const rolesStr = Array.isArray(m.role) ? m.role.join(' ') : String(m.role || '');
      return /admin|webmaster/i.test(rolesStr);
    }).length;
  }, [initialMembers]);

  const paidCount = useMemo(() => {
    return initialMembers.filter((m) => m.cotisation2026Status === 'paid').length;
  }, [initialMembers]);

  const pendingCount = useMemo(() => {
    return initialMembers.filter((m) => !m.cotisation2026Status || m.cotisation2026Status === 'pending').length;
  }, [initialMembers]);

  const noIceCount = useMemo(() => {
    return initialMembers.filter((m) => !m.iceContactPhone).length;
  }, [initialMembers]);

  const filteredMembers = useMemo(() => {
    return initialMembers.filter((member) => {
      const term = searchTerm.toLowerCase().trim();
      const rolesStr = Array.isArray(member.role) ? member.role.join(' ') : String(member.role || '');

      // Text search match
      const matchesSearch =
        !term ||
        member.name.toLowerCase().includes(term) ||
        (member.email && member.email.toLowerCase().includes(term)) ||
        (member.phone && member.phone.toLowerCase().includes(term)) ||
        (member.iceContactName && member.iceContactName.toLowerCase().includes(term)) ||
        rolesStr.toLowerCase().includes(term);

      if (!matchesSearch) return false;

      // Tab filter match
      if (tabFilter === 'capitaines') {
        return /capitaine/i.test(rolesStr);
      }
      if (tabFilter === 'bureau') {
        return /président|president|tresorier|trésorier|treasurer|secrétaire|secretaire|secretary|vice/i.test(rolesStr);
      }
      if (tabFilter === 'admin') {
        return /admin|webmaster/i.test(rolesStr);
      }
      if (tabFilter === 'paid') {
        return member.cotisation2026Status === 'paid';
      }
      if (tabFilter === 'pending') {
        return !member.cotisation2026Status || member.cotisation2026Status === 'pending';
      }
      if (tabFilter === 'no-ice') {
        return !member.iceContactPhone;
      }

      return true;
    });
  }, [initialMembers, searchTerm, tabFilter]);

  const getRoleBadgeStyle = (role: string): string => {
    const r = role.toLowerCase();
    if (r.includes('président') || r.includes('president')) {
      return 'bg-[#e03e3e]/10 text-[#e03e3e] border-[#e03e3e]/30 font-bold';
    }
    if (r.includes('trésorier') || r.includes('tresorier') || r.includes('treasurer')) {
      return 'bg-amber-50 text-amber-700 border-amber-200 font-semibold';
    }
    if (r.includes('secrétaire') || r.includes('secretaire') || r.includes('secretary')) {
      return 'bg-sky-50 text-sky-700 border-sky-200 font-semibold';
    }
    if (r.includes('admin') || r.includes('webmaster')) {
      return 'bg-[#101216] text-white border-white/10 font-bold';
    }
    if (r.includes('capitaine')) {
      return 'bg-emerald-50 text-emerald-800 border-emerald-300 font-bold';
    }
    return 'bg-[#f2efe9] text-[#5c6370] border-[#e4e0d8]';
  };

  return (
    <div className="space-y-4">
      {/* Controls Bar: Search & Quick Role Filters */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 p-3.5 sm:p-4 rounded-lg border border-[#e4e0d8] bg-white shadow-xs">
        {/* Search Input Bar */}
        <div id="members-search-bar" className="relative flex-1 max-w-md">
          <MagnifyingGlassIcon className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#5c6370]" />
          <input
            id="admin-members-search-input"
            type="text"
            aria-label="Rechercher par nom, rôle ou email"
            className="block w-full rounded-md border border-[#e4e0d8] bg-[#faf8f5] py-2 pl-10 pr-4 text-xs sm:text-sm text-[#101216] placeholder:text-[#5c6370] focus:border-[#e03e3e] focus:bg-white focus:outline-none transition-colors"
            placeholder="Rechercher par nom, rôle ou email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-[#5c6370] hover:text-[#101216]"
            >
              Effacer
            </button>
          )}
        </div>

        {/* Quick Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={() => setTabFilter('all')}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
              tabFilter === 'all'
                ? 'bg-[#101216] text-white'
                : 'bg-[#f2efe9] text-[#5c6370] hover:bg-[#e4e0d8] hover:text-[#101216]'
            }`}
          >
            <span>Tous</span>
            <span className={`text-[0.6875rem] tabular-nums ${tabFilter === 'all' ? 'text-[#a7adbb]' : 'text-[#5c6370]'}`}>
              ({initialMembers.length})
            </span>
          </button>

          <button
            type="button"
            onClick={() => setTabFilter('capitaines')}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
              tabFilter === 'capitaines'
                ? 'bg-emerald-700 text-white'
                : 'bg-[#f2efe9] text-[#5c6370] hover:bg-[#e4e0d8] hover:text-[#101216]'
            }`}
          >
            <BicycleIcon className={`h-3.5 w-3.5 ${tabFilter === 'capitaines' ? 'text-white' : 'text-[#e03e3e]'}`} />
            <span>Capitaines</span>
            <span className={`text-[0.6875rem] tabular-nums ${tabFilter === 'capitaines' ? 'text-white/80' : 'text-[#5c6370]'}`}>
              ({captainsCount})
            </span>
          </button>

          <button
            type="button"
            onClick={() => setTabFilter('paid')}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
              tabFilter === 'paid'
                ? 'bg-emerald-600 text-white'
                : 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
            }`}
          >
            <CheckCircleIcon className="h-3.5 w-3.5" />
            <span>Cotisation Payée</span>
            <span className="text-[0.6875rem] tabular-nums font-bold">
              ({paidCount})
            </span>
          </button>

          <button
            type="button"
            onClick={() => setTabFilter('pending')}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
              tabFilter === 'pending'
                ? 'bg-amber-600 text-white'
                : 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
            }`}
          >
            <ClockIcon className="h-3.5 w-3.5" />
            <span>En attente</span>
            <span className="text-[0.6875rem] tabular-nums font-bold">
              ({pendingCount})
            </span>
          </button>

          <button
            type="button"
            onClick={() => setTabFilter('no-ice')}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
              tabFilter === 'no-ice'
                ? 'bg-[#e03e3e] text-white'
                : 'bg-[#fdecec] text-[#e03e3e] border border-[#e03e3e]/30 hover:bg-[#fbdada]'
            }`}
          >
            <ExclamationTriangleIcon className="h-3.5 w-3.5" />
            <span>Sans ICE</span>
            <span className="text-[0.6875rem] tabular-nums font-bold">
              ({noIceCount})
            </span>
          </button>

          <button
            type="button"
            onClick={() => setTabFilter('admin')}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
              tabFilter === 'admin'
                ? 'bg-[#101216] text-white ring-1 ring-white/20'
                : 'bg-[#f2efe9] text-[#5c6370] hover:bg-[#e4e0d8] hover:text-[#101216]'
            }`}
          >
            <KeyIcon className="h-3.5 w-3.5" />
            <span>Admins</span>
            <span className={`text-[0.6875rem] tabular-nums ${tabFilter === 'admin' ? 'text-white/80' : 'text-[#5c6370]'}`}>
              ({adminCount})
            </span>
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div id="members-table-section" className="overflow-hidden rounded-lg border border-[#e4e0d8] bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-[#e4e0d8]">
            <thead className="bg-[#f2efe9]">
              <tr>
                <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-[#5c6370]">
                  Membre
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-[#5c6370]">
                  Email &amp; Tél
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-[#5c6370]">
                  Rôle(s)
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-[#5c6370]">
                  Cotisation 2026
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-[#5c6370]">
                  Sécurité ICE
                </th>
                <th className="px-6 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-[#5c6370]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#efece5] bg-white text-xs">
              {filteredMembers.map((member) => {
                const hasPhoto = isValidPhotoUrl(member.photoUrl) && !imgErrors[member.id];
                const initials = getInitials(member.name);
                const gradient = getAvatarGradient(member.name);
                const isCotisationPaid = member.cotisation2026Status === 'paid';
                const isCotisationExempt = member.cotisation2026Status === 'exempt';
                const hasIce = Boolean(member.iceContactPhone);

                return (
                  <tr key={member.id} className="hover:bg-[#faf8f5] transition-colors">
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex items-center gap-3">
                        {/* Avatar with fallback initials */}
                        <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full bg-[#161922] border border-[#e4e0d8] flex items-center justify-center font-bold text-xs text-white">
                          {hasPhoto ? (
                            <Image
                              src={member.photoUrl}
                              alt={member.name}
                              fill
                              unoptimized
                              sizes="36px"
                              style={{ objectPosition: member.photoPosition || 'center center' }}
                              onError={() => setImgErrors((prev) => ({ ...prev, [member.id]: true }))}
                              className="object-cover"
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
                            <p className="text-xs text-[#5c6370] line-clamp-1 max-w-xs">{member.bio}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-[#5c6370]">
                      <div className="space-y-0.5">
                        <p>{member.email || '-'}</p>
                        {member.phone && (
                          <p className="text-[11px] text-[#5c6370] font-mono">{member.phone}</p>
                        )}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {(Array.isArray(member.role) ? member.role : [member.role].filter(Boolean)).map((r) => {
                          const roleStr = String(r);
                          const isCaptain = /capitaine/i.test(roleStr);
                          return (
                            <span
                              key={r}
                              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs border ${getRoleBadgeStyle(
                                roleStr
                              )}`}
                            >
                              {isCaptain && <BicycleIcon className="h-3 w-3 shrink-0 text-[#e03e3e]" />}
                              <span>{roleStr}</span>
                            </span>
                          );
                        })}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      {isCotisationPaid ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 text-xs font-bold">
                          <CheckCircleIcon className="h-3.5 w-3.5 text-emerald-600" />
                          <span>À jour</span>
                        </span>
                      ) : isCotisationExempt ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200 px-2.5 py-0.5 text-xs font-medium">
                          <span>Exempté</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-0.5 text-xs font-bold">
                          <ClockIcon className="h-3.5 w-3.5 text-amber-600" />
                          <span>En attente</span>
                        </span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      {hasIce ? (
                        <button
                          type="button"
                          onClick={() => setSelectedIceMember(member)}
                          className="inline-flex items-center gap-1.5 rounded-md border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-xs font-bold text-amber-900 hover:bg-amber-500/20 transition-colors cursor-pointer"
                          title="Afficher la fiche d'urgence ICE"
                        >
                          <PhoneIcon className="h-3.5 w-3.5 text-amber-700" />
                          <span>{member.iceContactName || 'ICE renseigné'}</span>
                        </button>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs text-[#5c6370]">
                          <ExclamationTriangleIcon className="h-3.5 w-3.5 text-amber-500" />
                          <span>Non renseigné</span>
                        </span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href="/admin/members/photos"
                          className="rounded-md p-1.5 text-[#5c6370] hover:bg-[#f2efe9] hover:text-[#e03e3e] transition-colors"
                          title="Cadrage et positionnement photo"
                        >
                          <PhotoIcon className="h-4 w-4" />
                        </Link>
                        <Link
                          href={`/admin/members/${member.id}/edit`}
                          className="rounded-md p-1.5 text-[#5c6370] hover:bg-[#f2efe9] hover:text-[#101216] transition-colors"
                          title="Modifier"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </Link>
                        <Link
                          href={`/admin/members/${member.id}/reset-password`}
                          className="rounded-md p-1.5 text-[#5c6370] hover:bg-sky-50 hover:text-sky-600 transition-colors"
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
        </div>

        {filteredMembers.length === 0 && (
          <div className="py-12 px-4 text-center space-y-2">
            <UsersIcon className="mx-auto h-8 w-8 text-[#5c6370]" />
            <p className="text-sm font-semibold text-[#101216]">
              Aucun membre trouvé
            </p>
            <p className="text-xs text-[#5c6370] max-w-sm mx-auto">
              {tabFilter === 'capitaines'
                ? 'Aucun membre n\'a actuellement le statut Capitaine de Route. Modifiez un membre pour lui assigner ce rôle.'
                : tabFilter === 'no-ice'
                ? 'Tous les membres ont renseigné leur contact d\'urgence !'
                : searchTerm
                ? `Aucun résultat ne correspond à « ${searchTerm} ».`
                : 'Aucun membre ne correspond aux critères sélectionnés.'}
            </p>
            {(searchTerm || tabFilter !== 'all') && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setTabFilter('all');
                }}
                className="mt-2 inline-flex items-center gap-1.5 rounded-md border border-[#e4e0d8] bg-white px-3 py-1.5 text-xs font-semibold text-[#101216] hover:bg-[#f2efe9] transition-colors shadow-xs"
              >
                Réinitialiser les filtres
              </button>
            )}
          </div>
        )}
      </div>

      {/* ICE Emergency Modal */}
      {selectedIceMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="relative w-full max-w-md rounded-lg border border-[#e4e0d8] bg-white p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-[#e4e0d8] pb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-md bg-amber-500/10 text-amber-700">
                  <ShieldCheckIcon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#101216]">Fiche d&apos;Urgence Peloton (ICE)</h3>
                  <p className="text-[11px] text-[#5c6370]">{selectedIceMember.name}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedIceMember(null)}
                className="rounded p-1 text-[#5c6370] hover:text-[#101216] hover:bg-[#f2efe9]"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="rounded-md border border-[#e4e0d8] bg-[#faf8f5] p-3.5 space-y-2">
                <div className="flex justify-between">
                  <span className="text-[#5c6370]">Contact d&apos;urgence :</span>
                  <span className="font-bold text-[#101216]">{selectedIceMember.iceContactName || 'Non précisé'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#5c6370]">Lien de parenté :</span>
                  <span className="font-semibold text-[#101216]">{selectedIceMember.iceRelationship || 'Proche'}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-[#e4e0d8]">
                  <span className="text-[#5c6370]">Téléphone d&apos;urgence :</span>
                  {selectedIceMember.iceContactPhone ? (
                    <a
                      href={`tel:${selectedIceMember.iceContactPhone}`}
                      className="inline-flex items-center gap-1.5 rounded-md bg-[#e03e3e] px-3 py-1 text-xs font-bold text-white hover:bg-[#c93434] transition-colors"
                    >
                      <PhoneIcon className="h-3.5 w-3.5" />
                      <span>{selectedIceMember.iceContactPhone}</span>
                    </a>
                  ) : (
                    <span className="text-amber-700 font-semibold">Non renseigné</span>
                  )}
                </div>
              </div>

              <div className="space-y-1 pt-1 text-[11px] text-[#5c6370]">
                <p>• <strong>Téléphone du membre</strong> : {selectedIceMember.phone || 'Non renseigné'}</p>
                <p>• <strong>N° Licence FFBC</strong> : {selectedIceMember.ffbcLicenseNumber || 'Non renseigné'}</p>
                <p>• <strong>Groupe habituel</strong> : Groupe {selectedIceMember.preferredGroup || 'B'}</p>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-[#e4e0d8]">
              <button
                type="button"
                onClick={() => setSelectedIceMember(null)}
                className="rounded-md border border-[#e4e0d8] bg-white px-4 py-2 text-xs font-semibold text-[#101216] hover:bg-[#f2efe9]"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
