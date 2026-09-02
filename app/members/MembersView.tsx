'use client';

import { useState, useMemo } from 'react';
import { Member } from '../types';
import MemberCard from '../features/members/components/MemberCard';
import { MagnifyingGlassIcon, UserGroupIcon, UsersIcon } from '@heroicons/react/24/outline';

interface MembersViewProps {
  members: Member[];
}

type RoleFilter = 'all' | 'bureau' | 'capitaines';

export default function MembersView({ members }: MembersViewProps) {
  const [search, setSearch] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<RoleFilter>('all');

  const filteredMembers = useMemo(() => {
    return members.filter((member) => {
      // 1. Search query matching name, bio, or role
      const searchLower = search.toLowerCase().trim();
      const rolesString = Array.isArray(member.role) ? member.role.join(' ') : String(member.role || '');
      const matchesSearch =
        !searchLower ||
        member.name.toLowerCase().includes(searchLower) ||
        (member.bio && member.bio.toLowerCase().includes(searchLower)) ||
        rolesString.toLowerCase().includes(searchLower);

      if (!matchesSearch) return false;

      // 2. Role filter matching
      if (selectedFilter === 'bureau') {
        return /président|tresorier|trésorier|secrétaire|secretaire|vice|comité|comite/i.test(rolesString);
      }
      if (selectedFilter === 'capitaines') {
        return /capitaine/i.test(rolesString);
      }

      return true;
    });
  }, [members, search, selectedFilter]);

  const bureauCount = useMemo(() => {
    return members.filter((m) => {
      const rolesString = Array.isArray(m.role) ? m.role.join(' ') : String(m.role || '');
      return /président|tresorier|trésorier|secrétaire|secretaire|vice|comité|comite/i.test(rolesString);
    }).length;
  }, [members]);

  const captainsCount = useMemo(() => {
    return members.filter((m) => {
      const rolesString = Array.isArray(m.role) ? m.role.join(' ') : String(m.role || '');
      return /capitaine/i.test(rolesString);
    }).length;
  }, [members]);

  return (
    <div className="space-y-8">
      {/* ──── Controls Bar: Search & Role Filter Tabs ──── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 sm:p-5 rounded-lg border border-[#e4e0d8] bg-white shadow-xs">
        {/* Search input */}
        <div className="relative flex-1 max-w-md">
          <MagnifyingGlassIcon className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#7d8493]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un membre, un rôle..."
            className="w-full rounded-md border border-[#e4e0d8] bg-[#faf8f5] pl-10 pr-4 py-2 text-xs sm:text-sm text-[#101216] placeholder:text-[#7d8493] focus:border-[#e03e3e] focus:bg-white focus:outline-none transition-colors"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-[#7d8493] hover:text-[#101216]"
            >
              Effacer
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setSelectedFilter('all')}
            className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors ${
              selectedFilter === 'all'
                ? 'bg-[#101216] text-white'
                : 'bg-[#f2efe9] text-[#5c6370] hover:bg-[#e4e0d8] hover:text-[#101216]'
            }`}
          >
            <span>Tous</span>
            <span className={`text-xs tabular-nums ${selectedFilter === 'all' ? 'text-[#a7adbb]' : 'text-[#7d8493]'}`}>
              ({members.length})
            </span>
          </button>

          <button
            onClick={() => setSelectedFilter('bureau')}
            className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors ${
              selectedFilter === 'bureau'
                ? 'bg-[#e03e3e] text-white'
                : 'bg-[#f2efe9] text-[#5c6370] hover:bg-[#e4e0d8] hover:text-[#101216]'
            }`}
          >
            <span>Bureau &amp; Comité</span>
            <span className={`text-xs tabular-nums ${selectedFilter === 'bureau' ? 'text-white/80' : 'text-[#7d8493]'}`}>
              ({bureauCount})
            </span>
          </button>

          <button
            onClick={() => setSelectedFilter('capitaines')}
            className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors ${
              selectedFilter === 'capitaines'
                ? 'bg-sky-600 text-white'
                : 'bg-[#f2efe9] text-[#5c6370] hover:bg-[#e4e0d8] hover:text-[#101216]'
            }`}
          >
            <span>Capitaines de Route</span>
            <span className={`text-xs tabular-nums ${selectedFilter === 'capitaines' ? 'text-white/80' : 'text-[#7d8493]'}`}>
              ({captainsCount})
            </span>
          </button>
        </div>
      </div>

      {/* ──── Members Grid ──── */}
      {filteredMembers.length > 0 ? (
        <ul role="list" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredMembers.map((member) => (
            <MemberCard key={member.id} member={member} />
          ))}
        </ul>
      ) : (
        /* Empty State */
        <div className="rounded-lg border border-[#e4e0d8] bg-white p-12 text-center space-y-3">
          <UsersIcon className="mx-auto h-12 w-12 text-[#7d8493]" />
          <h3 className="text-base font-bold text-[#101216]">Aucun membre trouvé</h3>
          <p className="text-xs sm:text-sm text-[#5c6370] max-w-sm mx-auto">
            Aucun membre ne correspond à votre recherche « {search} ». Essayez de réinitialiser vos filtres.
          </p>
          <button
            onClick={() => {
              setSearch('');
              setSelectedFilter('all');
            }}
            className="inline-flex items-center gap-2 rounded-md bg-[#e03e3e] text-white px-4 py-2 text-xs font-semibold uppercase tracking-wider hover:bg-[#c93434] transition-colors"
          >
            Réinitialiser les filtres
          </button>
        </div>
      )}
    </div>
  );
}
