'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  MagnifyingGlassIcon,
  PhoneIcon,
  EnvelopeIcon,
  ChatBubbleLeftEllipsisIcon,
  CalendarDaysIcon,
  UserPlusIcon,
  XMarkIcon,
  ChevronRightIcon,
  FunnelIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import { BicycleIcon } from '@/app/components/ui/CyclingIcons';
import { TrialRideRequest, TrialRideStatus, Member } from '@/app/types';
import ProspectDetailModal from './ProspectDetailModal';
import {
  updateProspectStatusAction,
  updateProspectDetailsAction,
  convertProspectToMemberAction,
  deleteProspectAction,
} from '../actions';

interface ProspectsTableProps {
  initialProspects: TrialRideRequest[];
  captains: Member[];
}

type TabFilter = 'all' | 'pending' | 'in_trial' | 'converted' | 'archived';

function cleanPhoneForWhatsApp(phone: string): string {
  let cleaned = phone.replace(/[^0-9+]/g, '');
  if (cleaned.startsWith('+')) {
    cleaned = cleaned.substring(1);
  } else if (cleaned.startsWith('00')) {
    cleaned = cleaned.substring(2);
  } else if (cleaned.startsWith('0')) {
    cleaned = '32' + cleaned.substring(1);
  }
  return cleaned;
}

function getStatusBadge(status: TrialRideStatus): {
  label: string;
  classes: string;
} {
  switch (status) {
    case 'pending':
      return {
        label: 'Nouveau',
        classes:
          'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/60',
      };
    case 'contacted':
      return {
        label: 'Contacté',
        classes:
          'bg-sky-50 text-sky-800 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800/60',
      };
    case 'ride_1':
      return {
        label: 'Sortie 1 faite',
        classes:
          'bg-indigo-50 text-indigo-800 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800/60',
      };
    case 'ride_2':
      return {
        label: 'Sortie 2 faite',
        classes:
          'bg-indigo-50 text-indigo-800 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800/60',
      };
    case 'ride_3':
      return {
        label: 'Sortie 3 faite',
        classes:
          'bg-indigo-50 text-indigo-800 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800/60',
      };
    case 'converted':
    case 'completed':
      return {
        label: 'Membre validé',
        classes:
          'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60',
      };
    case 'archived':
    default:
      return {
        label: 'Sans suite / Archivé',
        classes:
          'bg-[#f2efe9] text-[#5c6370] border-[#e4e0d8] dark:bg-[#1f232b] dark:text-[#9ba3af] dark:border-[#2b313d]',
      };
  }
}

function getGroupBadge(group: string): { label: string; classes: string } {
  switch (group) {
    case 'A':
      return {
        label: 'Gr. A (>28 km/h)',
        classes:
          'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/60',
      };
    case 'B':
      return {
        label: 'Gr. B (25-27 km/h)',
        classes:
          'bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800/60',
      };
    case 'C':
      return {
        label: 'Gr. C (22-24 km/h)',
        classes:
          'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60',
      };
    case 'VTT':
    default:
      return {
        label: 'VTT',
        classes:
          'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/60',
      };
  }
}

export default function ProspectsTable({
  initialProspects,
  captains,
}: ProspectsTableProps): React.ReactElement {
  const [prospects, setProspects] = useState<TrialRideRequest[]>(initialProspects);
  const [searchTerm, setSearchTerm] = useState('');
  const [tabFilter, setTabFilter] = useState<TabFilter>('all');
  const [groupFilter, setGroupFilter] = useState<string>('all');
  const [bikeFilter, setBikeFilter] = useState<string>('all');
  const [selectedProspect, setSelectedProspect] = useState<TrialRideRequest | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Tab counts
  const pendingCount = useMemo(
    () => prospects.filter((p) => p.status === 'pending').length,
    [prospects]
  );
  const inTrialCount = useMemo(
    () =>
      prospects.filter((p) =>
        ['contacted', 'ride_1', 'ride_2', 'ride_3'].includes(p.status)
      ).length,
    [prospects]
  );
  const convertedCount = useMemo(
    () =>
      prospects.filter((p) => ['converted', 'completed'].includes(p.status)).length,
    [prospects]
  );
  const archivedCount = useMemo(
    () => prospects.filter((p) => p.status === 'archived').length,
    [prospects]
  );

  // Filtered prospects
  const filteredProspects = useMemo(() => {
    return prospects.filter((p) => {
      // Tab filter
      if (tabFilter === 'pending' && p.status !== 'pending') return false;
      if (
        tabFilter === 'in_trial' &&
        !['contacted', 'ride_1', 'ride_2', 'ride_3'].includes(p.status)
      ) {
        return false;
      }
      if (
        tabFilter === 'converted' &&
        !['converted', 'completed'].includes(p.status)
      ) {
        return false;
      }
      if (tabFilter === 'archived' && p.status !== 'archived') return false;

      // Group filter
      if (groupFilter !== 'all' && p.preferredGroup !== groupFilter) return false;

      // Bike filter
      if (bikeFilter !== 'all' && p.bikeType !== bikeFilter) return false;

      // Search term
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase().trim();
        const matchesName = (p.name || '').toLowerCase().includes(query);
        const matchesEmail = (p.email || '').toLowerCase().includes(query);
        const matchesPhone = (p.phone || '').toLowerCase().includes(query);
        const matchesNotes = (p.adminNotes || '').toLowerCase().includes(query);
        const matchesMessage = (p.message || '').toLowerCase().includes(query);
        const matchesMentor = (p.mentorCaptainName || '').toLowerCase().includes(query);
        if (
          !matchesName &&
          !matchesEmail &&
          !matchesPhone &&
          !matchesNotes &&
          !matchesMessage &&
          !matchesMentor
        ) {
          return false;
        }
      }

      return true;
    });
  }, [prospects, tabFilter, groupFilter, bikeFilter, searchTerm]);

  // Actions
  const handleOpenDetail = (prospect: TrialRideRequest): void => {
    setSelectedProspect(prospect);
    setIsModalOpen(true);
  };

  const handleStatusChange = async (
    id: string,
    status: TrialRideStatus
  ): Promise<boolean> => {
    const res = await updateProspectStatusAction(id, status);
    if (res.success) {
      setProspects((prev) =>
        prev.map((p) => (p.id === id ? { ...p, status, updatedAt: new Date().toISOString() } : p))
      );
      if (selectedProspect && selectedProspect.id === id) {
        setSelectedProspect((prev) => (prev ? { ...prev, status } : null));
      }
      return true;
    }
    return false;
  };

  const handleSaveDetails = async (
    id: string,
    data: {
      adminNotes?: string;
      mentorCaptainId?: string;
      mentorCaptainName?: string;
      status?: TrialRideStatus;
    }
  ): Promise<boolean> => {
    const res = await updateProspectDetailsAction(id, data);
    if (res.success) {
      setProspects((prev) =>
        prev.map((p) =>
          p.id === id
            ? {
                ...p,
                ...data,
                updatedAt: new Date().toISOString(),
              }
            : p
        )
      );
      if (selectedProspect && selectedProspect.id === id) {
        setSelectedProspect((prev) => (prev ? { ...prev, ...data } : null));
      }
      return true;
    }
    return false;
  };

  const handleConvertToMember = async (
    id: string
  ): Promise<{ success: boolean; memberId?: string; error?: string }> => {
    const res = await convertProspectToMemberAction(id);
    if (res.success) {
      setProspects((prev) =>
        prev.map((p) =>
          p.id === id
            ? {
                ...p,
                status: 'converted',
                convertedMemberId: res.memberId,
                updatedAt: new Date().toISOString(),
              }
            : p
        )
      );
      if (selectedProspect && selectedProspect.id === id) {
        setSelectedProspect((prev) =>
          prev
            ? {
                ...prev,
                status: 'converted',
                convertedMemberId: res.memberId,
              }
            : null
        );
      }
    }
    return res;
  };

  const handleDelete = async (id: string): Promise<boolean> => {
    const res = await deleteProspectAction(id);
    if (res.success) {
      setProspects((prev) => prev.filter((p) => p.id !== id));
      return true;
    }
    return false;
  };

  const resetFilters = (): void => {
    setSearchTerm('');
    setTabFilter('all');
    setGroupFilter('all');
    setBikeFilter('all');
  };

  return (
    <div className="space-y-4">
      {/* Tabs Filter Bar */}
      <div className="flex border-b border-[#e4e0d8] dark:border-[#222730] overflow-x-auto no-scrollbar gap-1 sm:gap-2">
        <button
          type="button"
          onClick={() => setTabFilter('all')}
          className={`flex items-center gap-2 border-b-2 px-3 sm:px-4 py-3 text-xs sm:text-sm font-semibold whitespace-nowrap transition-colors ${
            tabFilter === 'all'
              ? 'border-[#e03e3e] text-[#101216] dark:text-white'
              : 'border-transparent text-[#5c6370] dark:text-[#9ba3af] hover:text-[#101216] dark:hover:text-white'
          }`}
        >
          <span>Tous</span>
          <span className="rounded-full bg-[#f2efe9] dark:bg-[#1f232b] px-2 py-0.5 text-xs tabular-nums text-[#5c6370] dark:text-[#9ba3af]">
            {prospects.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setTabFilter('pending')}
          className={`flex items-center gap-2 border-b-2 px-3 sm:px-4 py-3 text-xs sm:text-sm font-semibold whitespace-nowrap transition-colors ${
            tabFilter === 'pending'
              ? 'border-amber-500 text-amber-900 dark:text-amber-300'
              : 'border-transparent text-[#5c6370] dark:text-[#9ba3af] hover:text-[#101216] dark:hover:text-white'
          }`}
        >
          <span>À contacter</span>
          <span
            className={`rounded-full px-2 py-0.5 text-xs tabular-nums font-bold ${
              pendingCount > 0
                ? 'bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200'
                : 'bg-[#f2efe9] dark:bg-[#1f232b] text-[#5c6370] dark:text-[#9ba3af]'
            }`}
          >
            {pendingCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setTabFilter('in_trial')}
          className={`flex items-center gap-2 border-b-2 px-3 sm:px-4 py-3 text-xs sm:text-sm font-semibold whitespace-nowrap transition-colors ${
            tabFilter === 'in_trial'
              ? 'border-sky-500 text-sky-900 dark:text-sky-300'
              : 'border-transparent text-[#5c6370] dark:text-[#9ba3af] hover:text-[#101216] dark:hover:text-white'
          }`}
        >
          <span>En essai</span>
          <span className="rounded-full bg-[#f2efe9] dark:bg-[#1f232b] px-2 py-0.5 text-xs tabular-nums text-[#5c6370] dark:text-[#9ba3af]">
            {inTrialCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setTabFilter('converted')}
          className={`flex items-center gap-2 border-b-2 px-3 sm:px-4 py-3 text-xs sm:text-sm font-semibold whitespace-nowrap transition-colors ${
            tabFilter === 'converted'
              ? 'border-emerald-500 text-emerald-900 dark:text-emerald-300'
              : 'border-transparent text-[#5c6370] dark:text-[#9ba3af] hover:text-[#101216] dark:hover:text-white'
          }`}
        >
          <span>Convertis Membres</span>
          <span className="rounded-full bg-[#f2efe9] dark:bg-[#1f232b] px-2 py-0.5 text-xs tabular-nums text-[#5c6370] dark:text-[#9ba3af]">
            {convertedCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setTabFilter('archived')}
          className={`flex items-center gap-2 border-b-2 px-3 sm:px-4 py-3 text-xs sm:text-sm font-semibold whitespace-nowrap transition-colors ${
            tabFilter === 'archived'
              ? 'border-[#5c6370] text-[#101216] dark:text-white'
              : 'border-transparent text-[#5c6370] dark:text-[#9ba3af] hover:text-[#101216] dark:hover:text-white'
          }`}
        >
          <span>Sans suite / Archivés</span>
          <span className="rounded-full bg-[#f2efe9] dark:bg-[#1f232b] px-2 py-0.5 text-xs tabular-nums text-[#5c6370] dark:text-[#9ba3af]">
            {archivedCount}
          </span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#5c6370] dark:text-[#9ba3af]" />
          <input
            type="text"
            placeholder="Rechercher par nom, email, téléphone, notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-md border border-[#e4e0d8] dark:border-[#222730] bg-white dark:bg-[#16191f] pl-9 pr-8 py-2 text-xs sm:text-sm text-[#101216] dark:text-white placeholder-[#9ba3af] focus:outline-hidden focus:ring-2 focus:ring-[#e03e3e]"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#5c6370] hover:text-[#101216] dark:text-[#9ba3af] dark:hover:text-white"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Group Filter */}
          <select
            value={groupFilter}
            onChange={(e) => setGroupFilter(e.target.value)}
            className="rounded-md border border-[#e4e0d8] dark:border-[#222730] bg-white dark:bg-[#16191f] px-3 py-2 text-xs text-[#101216] dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#e03e3e]"
            aria-label="Filtrer par groupe de vitesse"
          >
            <option value="all">Tous les groupes</option>
            <option value="A">Groupe A</option>
            <option value="B">Groupe B</option>
            <option value="C">Groupe C</option>
            <option value="VTT">VTT</option>
          </select>

          {/* Bike Filter */}
          <select
            value={bikeFilter}
            onChange={(e) => setBikeFilter(e.target.value)}
            className="rounded-md border border-[#e4e0d8] dark:border-[#222730] bg-white dark:bg-[#16191f] px-3 py-2 text-xs text-[#101216] dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#e03e3e]"
            aria-label="Filtrer par type de vélo"
          >
            <option value="all">Tous les vélos</option>
            <option value="Route">Route</option>
            <option value="Gravel">Gravel</option>
            <option value="VTT">VTT</option>
            <option value="VAE">VAE</option>
          </select>

          {(searchTerm || groupFilter !== 'all' || bikeFilter !== 'all' || tabFilter !== 'all') && (
            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex items-center gap-1 text-xs text-[#e03e3e] hover:underline px-2 py-1"
            >
              <ArrowPathIcon className="h-3.5 w-3.5" />
              <span>Réinitialiser</span>
            </button>
          )}
        </div>
      </div>

      {/* Table Container */}
      <div className="rounded-lg border border-[#e4e0d8] dark:border-[#222730] bg-white dark:bg-[#16191f] shadow-xs overflow-hidden">
        {filteredProspects.length === 0 ? (
          <div className="px-6 py-12 text-center space-y-3">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#f2efe9] dark:bg-[#1f232b] text-[#5c6370] dark:text-[#9ba3af]">
              <UserPlusIcon className="h-6 w-6" />
            </div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#101216] dark:text-white">
              {prospects.length === 0
                ? 'Aucune demande de sortie d’essai pour le moment'
                : 'Aucun candidat ne correspond aux filtres'}
            </h3>
            <p className="text-xs text-[#5c6370] dark:text-[#9ba3af] max-w-md mx-auto">
              {prospects.length === 0
                ? 'Les inscriptions déposées par les cyclistes sur /rejoindre apparaîtront automatiquement dans cette interface.'
                : 'Modifiez vos critères de recherche ou réinitialisez les filtres pour voir les autres dossiers.'}
            </p>
            {prospects.length > 0 && (
              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex items-center gap-1.5 rounded-md border border-[#e4e0d8] dark:border-[#222730] bg-white dark:bg-[#16191f] px-4 py-2 text-xs font-semibold text-[#101216] dark:text-white hover:bg-[#f2efe9] dark:hover:bg-[#1d2128]"
              >
                <span>Afficher toutes les candidatures</span>
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-[#e4e0d8] dark:divide-[#222730]">
              <thead className="bg-[#f2efe9] dark:bg-[#111318]">
                <tr>
                  <th
                    scope="col"
                    className="px-4 sm:px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#5c6370] dark:text-[#9ba3af]"
                  >
                    Candidat
                  </th>
                  <th
                    scope="col"
                    className="px-4 sm:px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#5c6370] dark:text-[#9ba3af]"
                  >
                    Contact Rapide
                  </th>
                  <th
                    scope="col"
                    className="px-4 sm:px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#5c6370] dark:text-[#9ba3af]"
                  >
                    Groupe &amp; Vélo
                  </th>
                  <th
                    scope="col"
                    className="px-4 sm:px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#5c6370] dark:text-[#9ba3af]"
                  >
                    1ère Sortie Voulue
                  </th>
                  <th
                    scope="col"
                    className="px-4 sm:px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#5c6370] dark:text-[#9ba3af]"
                  >
                    Capitaine Mentor
                  </th>
                  <th
                    scope="col"
                    className="px-4 sm:px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#5c6370] dark:text-[#9ba3af]"
                  >
                    Statut CRM
                  </th>
                  <th
                    scope="col"
                    className="px-4 sm:px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-[#5c6370] dark:text-[#9ba3af]"
                  >
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#efece5] dark:divide-[#222730] bg-white dark:bg-[#16191f] text-xs">
                {filteredProspects.map((p) => {
                  const statusInfo = getStatusBadge(p.status);
                  const groupInfo = getGroupBadge(p.preferredGroup);
                  const cleanPhone = cleanPhoneForWhatsApp(p.phone);
                  const firstName = p.name.split(' ')[0] || p.name;
                  const mentorGreeting = p.mentorCaptainName
                    ? `C'est ${p.mentorCaptainName}, capitaine au CC Saint-Martin Blanmont`
                    : `C'est le secrétariat du CC Saint-Martin Blanmont`;
                  const waMsg = encodeURIComponent(
                    `Bonjour ${firstName} ! 👋\n${mentorGreeting}.\nNous avons bien reçu ta demande de sortie d'essai dans le Groupe ${p.preferredGroup} (${p.bikeType}). Serais-tu disponible pour rouler ce weekend ? 🚴‍♂️`
                  );
                  const waUrl = `https://wa.me/${cleanPhone}?text=${waMsg}`;

                  return (
                    <tr
                      key={p.id}
                      className="hover:bg-[#faf8f5] dark:hover:bg-[#191d26] transition-colors cursor-pointer"
                      onClick={() => handleOpenDetail(p)}
                    >
                      {/* Candidat Name & Subtitle */}
                      <td className="px-4 sm:px-6 py-3.5 whitespace-nowrap">
                        <div className="font-extrabold text-sm text-[#101216] dark:text-white">
                          {p.name}
                        </div>
                        <div className="text-[11px] text-[#5c6370] dark:text-[#9ba3af] truncate max-w-[200px]">
                          {p.email}
                        </div>
                      </td>

                      {/* Contact Actions (WhatsApp, Tel, Email) */}
                      <td
                        className="px-4 sm:px-6 py-3.5 whitespace-nowrap"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center gap-1.5">
                          {/* 1-Click WhatsApp */}
                          <a
                            href={waUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex h-7 w-7 items-center justify-center rounded-sm bg-[#25D366]/15 hover:bg-[#25D366] text-[#25D366] hover:text-white transition-colors"
                            title={`Envoyer un WhatsApp à ${p.name}`}
                          >
                            <ChatBubbleLeftEllipsisIcon className="h-4 w-4" />
                          </a>

                          {/* Phone Call */}
                          <a
                            href={`tel:${p.phone}`}
                            className="inline-flex h-7 w-7 items-center justify-center rounded-sm bg-[#f2efe9] dark:bg-[#1f232b] hover:bg-[#e03e3e] text-[#101216] dark:text-white hover:text-white transition-colors"
                            title={`Appeler ${p.phone}`}
                          >
                            <PhoneIcon className="h-3.5 w-3.5" />
                          </a>

                          {/* Email */}
                          <a
                            href={`mailto:${p.email}?subject=Votre sortie d'essai au CC Saint-Martin Blanmont`}
                            className="inline-flex h-7 w-7 items-center justify-center rounded-sm bg-[#f2efe9] dark:bg-[#1f232b] hover:bg-[#e03e3e] text-[#101216] dark:text-white hover:text-white transition-colors"
                            title={`Écrire à ${p.email}`}
                          >
                            <EnvelopeIcon className="h-3.5 w-3.5" />
                          </a>

                          <span className="text-[11px] tabular-nums text-[#5c6370] dark:text-[#9ba3af] ml-1">
                            {p.phone}
                          </span>
                        </div>
                      </td>

                      {/* Group & Bike */}
                      <td className="px-4 sm:px-6 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-bold border ${groupInfo.classes}`}
                          >
                            {groupInfo.label}
                          </span>
                          <span className="inline-flex items-center rounded-sm bg-[#faf8f5] dark:bg-[#1f232b] px-1.5 py-0.5 text-[11px] font-semibold text-[#5c6370] dark:text-[#9ba3af] border border-[#e4e0d8] dark:border-[#2b313d]">
                            {p.bikeType}
                          </span>
                        </div>
                      </td>

                      {/* First Ride Desired Date */}
                      <td className="px-4 sm:px-6 py-3.5 whitespace-nowrap text-[#5c6370] dark:text-[#9ba3af]">
                        <div className="flex items-center gap-1.5">
                          <CalendarDaysIcon className="h-4 w-4 text-[#e03e3e]" />
                          <span className="tabular-nums font-semibold text-[#101216] dark:text-white">
                            {p.firstRideDate || 'À convenir'}
                          </span>
                        </div>
                      </td>

                      {/* Mentor Captain */}
                      <td className="px-4 sm:px-6 py-3.5 whitespace-nowrap">
                        {p.mentorCaptainName ? (
                          <span className="font-semibold text-[#101216] dark:text-white">
                            {p.mentorCaptainName}
                          </span>
                        ) : (
                          <span className="text-[#9ba3af] italic">Non assigné</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-4 sm:px-6 py-3.5 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider border ${statusInfo.classes}`}
                        >
                          {statusInfo.label}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="px-4 sm:px-6 py-3.5 whitespace-nowrap text-right">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenDetail(p);
                          }}
                          className="inline-flex items-center gap-1 rounded-md border border-[#e4e0d8] dark:border-[#222730] bg-white dark:bg-[#16191f] px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-[#101216] dark:text-white hover:bg-[#f2efe9] dark:hover:bg-[#1d2128] transition-colors"
                        >
                          <span>Fiche</span>
                          <ChevronRightIcon className="h-3 w-3" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <ProspectDetailModal
        isOpen={isModalOpen}
        prospect={selectedProspect}
        captains={captains}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedProspect(null);
        }}
        onStatusChange={handleStatusChange}
        onSaveDetails={handleSaveDetails}
        onConvertToMember={handleConvertToMember}
        onDelete={handleDelete}
      />
    </div>
  );
}
