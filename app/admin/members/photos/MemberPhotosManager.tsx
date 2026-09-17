'use client';

import React, { useState, useMemo, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  PhotoIcon,
  AdjustmentsHorizontalIcon,
  CheckIcon,
  ArrowPathIcon,
  MagnifyingGlassIcon,
  ArrowTopRightOnSquareIcon,
  ArrowUpTrayIcon,
  ShieldCheckIcon,
  ArrowsUpDownIcon,
  Squares2X2Icon,
  ListBulletIcon,
} from '@heroicons/react/24/outline';
import { BicycleIcon } from '@/app/components/ui/CyclingIcons';
import { toast } from 'sonner';
import { Member } from '@/app/types';
import { useImageUpload } from '@/app/hooks/useImageUpload';
import {
  parseVerticalPosition,
  formatVerticalPosition,
  VERTICAL_PRESETS,
} from '@/app/lib/imagePosition';
import MemberCropModal from '../components/MemberCropModal';

interface MemberPhotosManagerProps {
  initialMembers: Member[];
}

type RoleFilter = 'all' | 'with-photo' | 'bureau' | 'capitaines' | 'without-photo';
type ViewMode = 'grid' | 'table';

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
    'from-[#161922] via-[#242938] to-[#0a0c10]',
    'from-[#2e1216] via-[#3d181d] to-[#101216]',
    'from-[#112233] via-[#1a324a] to-[#0a0c10]',
    'from-[#14261c] via-[#1e3b2b] to-[#0a0c10]',
    'from-[#2a1e12] via-[#3d2c1a] to-[#101216]',
  ];
  return gradients[Math.abs(hash) % gradients.length];
}

const readFile = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener('load', () => resolve(reader.result as string), false);
    reader.addEventListener('error', (err) => reject(err));
    reader.readAsDataURL(file);
  });
};

export default function MemberPhotosManager({
  initialMembers,
}: MemberPhotosManagerProps): React.ReactElement {
  // Members state dictionary for fast lookup and modification
  const [membersMap, setMembersMap] = useState<Record<string, Member>>(() => {
    const map: Record<string, Member> = {};
    for (const m of initialMembers) {
      map[m.id] = { ...m };
    }
    return map;
  });

  // Track modified member IDs
  const [modifiedIds, setModifiedIds] = useState<Set<string>>(new Set());
  const [savingIds, setSavingIds] = useState<Set<string>>(new Set());
  const [isSavingAll, setIsSavingAll] = useState(false);

  // Filter & Search state
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('with-photo');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [brokenImages, setBrokenImages] = useState<Record<string, boolean>>({});

  // Image Upload Hook
  const { uploadImage, isUploading } = useImageUpload();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadTargetMemberId, setUploadTargetMemberId] = useState<string | null>(null);

  // Modal Cropper State
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [cropModalImageSrc, setCropModalImageSrc] = useState<string | null>(null);
  const [cropModalMemberId, setCropModalMemberId] = useState<string | null>(null);

  // Filtered members list
  const memberList = useMemo(() => {
    return Object.values(membersMap);
  }, [membersMap]);

  const filteredMembers = useMemo(() => {
    const query = search.toLowerCase().trim();
    return memberList.filter((member) => {
      const rolesString = Array.isArray(member.role) ? member.role.join(' ') : String(member.role || '');
      const hasPhoto = isValidPhotoUrl(member.photoUrl) && !brokenImages[member.id];

      // Search filter
      const matchesSearch =
        !query ||
        member.name.toLowerCase().includes(query) ||
        rolesString.toLowerCase().includes(query) ||
        (member.email && member.email.toLowerCase().includes(query));

      if (!matchesSearch) return false;

      // Role filter
      if (roleFilter === 'with-photo') return hasPhoto;
      if (roleFilter === 'without-photo') return !hasPhoto;
      if (roleFilter === 'bureau') {
        return /président|tresorier|trésorier|secrétaire|secretaire|vice|comité|comite/i.test(rolesString);
      }
      if (roleFilter === 'capitaines') {
        return /capitaine/i.test(rolesString);
      }
      return true;
    });
  }, [memberList, search, roleFilter, brokenImages]);

  // Member position changer
  const handleSetPosition = (id: string, newPosition: string): void => {
    setMembersMap((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        photoPosition: newPosition,
      },
    }));
    setModifiedIds((prev) => new Set(prev).add(id));
  };

  // Open cropper for existing photo
  const handleOpenRecrop = (id: string): void => {
    const member = membersMap[id];
    if (!member || !member.photoUrl) return;

    setCropModalMemberId(id);
    setCropModalImageSrc(member.photoUrl);
    setCropModalOpen(true);
  };

  // Upload file selection handler
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = e.target.files?.[0];
    if (!file || !uploadTargetMemberId) return;

    try {
      const dataUrl = await readFile(file);
      setCropModalMemberId(uploadTargetMemberId);
      setCropModalImageSrc(dataUrl);
      setCropModalOpen(true);
    } catch {
      toast.error('Impossible de lire le fichier image sélectionné.');
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Trigger file selection for a specific member
  const triggerUploadForMember = (id: string): void => {
    setUploadTargetMemberId(id);
    fileInputRef.current?.click();
  };

  // Confirm crop & upload
  const handleCropConfirmed = async (croppedBlob: Blob): Promise<void> => {
    if (!cropModalMemberId) return;

    const toastId = toast.loading('Téléversement de la photo recadrée...');
    try {
      const timestamp = Date.now();
      const fileName = `member-${cropModalMemberId}-${timestamp}.jpg`;
      const file = new File([croppedBlob], fileName, { type: 'image/jpeg' });
      const path = `members/${cropModalMemberId}/${fileName}`;

      const uploadedUrl = await uploadImage(file, path);

      // Update state
      setMembersMap((prev) => ({
        ...prev,
        [cropModalMemberId]: {
          ...prev[cropModalMemberId],
          photoUrl: uploadedUrl,
          photoPosition: prev[cropModalMemberId].photoPosition || 'center center',
        },
      }));
      setModifiedIds((prev) => new Set(prev).add(cropModalMemberId));
      setBrokenImages((prev) => ({ ...prev, [cropModalMemberId]: false }));

      toast.success('Photo mise à jour avec succès ! Pensez à enregistrer.', { id: toastId });
    } catch (err: unknown) {
      console.error('Error uploading cropped image:', err);
      const message = err instanceof Error ? err.message : 'Échec du téléversement';
      toast.error(`Erreur: ${message}`, { id: toastId });
      throw err;
    }
  };

  // Save single member
  const handleSaveSingle = async (id: string): Promise<void> => {
    const member = membersMap[id];
    if (!member) return;

    setSavingIds((prev) => new Set(prev).add(id));
    const toastId = toast.loading(`Enregistrement pour ${member.name}...`);

    try {
      const res = await fetch(`/api/admin/members/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          photoPosition: member.photoPosition || 'center center',
          photoUrl: member.photoUrl,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Erreur lors de la sauvegarde');
      }

      setModifiedIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      toast.success(`Cadrage de ${member.name} enregistré !`, { id: toastId });
    } catch (err: unknown) {
      console.error('Error saving member:', err);
      const message = err instanceof Error ? err.message : 'Impossible d\'enregistrer';
      toast.error(`Erreur: ${message}`, { id: toastId });
    } finally {
      setSavingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  // Save all modified members
  const handleSaveAll = async (): Promise<void> => {
    if (modifiedIds.size === 0) return;

    setIsSavingAll(true);
    const toastId = toast.loading(`Enregistrement de ${modifiedIds.size} membre(s)...`);

    try {
      const promises = Array.from(modifiedIds).map(async (id) => {
        const member = membersMap[id];
        if (!member) return;
        const res = await fetch(`/api/admin/members/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            photoPosition: member.photoPosition || 'center center',
            photoUrl: member.photoUrl,
          }),
        });
        if (!res.ok) {
          throw new Error(`Échec pour ${member.name}`);
        }
      });

      await Promise.all(promises);
      setModifiedIds(new Set());
      toast.success('Tous les cadrages ont été enregistrés et publiés !', { id: toastId });
    } catch (err: unknown) {
      console.error('Error saving all members:', err);
      const message = err instanceof Error ? err.message : 'Erreur lors de l\'enregistrement groupé';
      toast.error(message, { id: toastId });
    } finally {
      setIsSavingAll(false);
    }
  };

  const withPhotoCount = useMemo(() => {
    return memberList.filter((m) => isValidPhotoUrl(m.photoUrl) && !brokenImages[m.id]).length;
  }, [memberList, brokenImages]);

  const activeTargetMemberName = cropModalMemberId ? membersMap[cropModalMemberId]?.name : undefined;

  return (
    <div className="space-y-8 pb-20">
      {/* Hidden file input for uploading */}
      <input
        id="member-photos-file-upload"
        ref={fileInputRef}
        type="file"
        accept="image/*"
        aria-label="Téléverser une photo pour le trombinoscope"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-[#e4e0d8]">
        <div>
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#101216] px-3 py-1 text-xs font-bold uppercase tracking-wider text-white">
              <PhotoIcon className="h-3.5 w-3.5 text-[#e03e3e]" />
              <span>Cadrage &amp; Portraits</span>
            </span>
            <Link
              href="/members"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#5c6370] hover:text-[#e03e3e] transition-colors"
              title="Voir la page publique /members"
            >
              <span>Voir /members</span>
              <ArrowTopRightOnSquareIcon className="h-3 w-3" />
            </Link>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#101216]">
            Cadrage des Photos Membres
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-[#5c6370]">
            Ajustez précisément la position verticale et le cadrage des photos de tous les membres. Les modifications se répercutent instantanément sur la page publique.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <Link
            href="/admin/members"
            className="inline-flex items-center gap-1.5 rounded-md border border-[#e4e0d8] bg-white px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#5c6370] hover:text-[#101216] hover:bg-[#f2efe9] transition-colors shadow-xs"
          >
            <span>Annuaire Membres</span>
          </Link>

          <button
            type="button"
            onClick={handleSaveAll}
            disabled={modifiedIds.size === 0 || isSavingAll}
            className={`inline-flex items-center gap-2 rounded-md px-6 py-2.5 text-xs font-semibold uppercase tracking-wider text-white transition-all shadow-xs ${
              modifiedIds.size > 0
                ? 'bg-[#e03e3e] hover:bg-[#c93434] ring-2 ring-[#e03e3e]/30 cursor-pointer'
                : 'bg-[#101216] opacity-60 cursor-not-allowed'
            }`}
          >
            {isSavingAll ? (
              <>
                <ArrowPathIcon className="h-4 w-4 animate-spin" />
                <span>Enregistrement...</span>
              </>
            ) : (
              <>
                <CheckIcon className="h-4 w-4" />
                <span>
                  {modifiedIds.size > 0
                    ? `Enregistrer (${modifiedIds.size}) *`
                    : 'Tout est enregistré'}
                </span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ── Controls Bar: Filters, Search, View Switcher ── */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 p-4 rounded-lg border border-[#e4e0d8] bg-white shadow-xs">
        {/* Search input */}
        <div className="relative flex-1 max-w-md">
          <MagnifyingGlassIcon className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#5c6370]" />
          <input
            id="member-photos-search-input"
            type="text"
            aria-label="Rechercher un membre par nom ou rôle"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un membre par nom ou rôle..."
            className="w-full rounded-md border border-[#e4e0d8] bg-[#faf8f5] pl-10 pr-4 py-2 text-xs sm:text-sm text-[#101216] placeholder:text-[#5c6370] focus:border-[#e03e3e] focus:bg-white focus:outline-none transition-colors"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-[#5c6370] hover:text-[#101216]"
            >
              Effacer
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={() => setRoleFilter('with-photo')}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider transition-colors ${
              roleFilter === 'with-photo'
                ? 'bg-[#101216] text-white'
                : 'bg-[#f2efe9] text-[#5c6370] hover:bg-[#e4e0d8] hover:text-[#101216]'
            }`}
          >
            <span>Avec photo</span>
            <span className={`text-xs tabular-nums ${roleFilter === 'with-photo' ? 'text-[#a7adbb]' : 'text-[#5c6370]'}`}>
              ({withPhotoCount})
            </span>
          </button>

          <button
            type="button"
            onClick={() => setRoleFilter('bureau')}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider transition-colors ${
              roleFilter === 'bureau'
                ? 'bg-[#e03e3e] text-white'
                : 'bg-[#f2efe9] text-[#5c6370] hover:bg-[#e4e0d8] hover:text-[#101216]'
            }`}
          >
            <ShieldCheckIcon className="h-3.5 w-3.5" />
            <span>Bureau</span>
          </button>

          <button
            type="button"
            onClick={() => setRoleFilter('capitaines')}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider transition-colors ${
              roleFilter === 'capitaines'
                ? 'bg-emerald-700 text-white'
                : 'bg-[#f2efe9] text-[#5c6370] hover:bg-[#e4e0d8] hover:text-[#101216]'
            }`}
          >
            <BicycleIcon className={`h-3.5 w-3.5 ${roleFilter === 'capitaines' ? 'text-white' : 'text-[#e03e3e]'}`} />
            <span>Capitaines</span>
          </button>

          <button
            type="button"
            onClick={() => setRoleFilter('all')}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider transition-colors ${
              roleFilter === 'all'
                ? 'bg-[#101216] text-white'
                : 'bg-[#f2efe9] text-[#5c6370] hover:bg-[#e4e0d8] hover:text-[#101216]'
            }`}
          >
            <span>Tous ({memberList.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setRoleFilter('without-photo')}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider transition-colors ${
              roleFilter === 'without-photo'
                ? 'bg-[#101216] text-white'
                : 'bg-[#f2efe9] text-[#5c6370] hover:bg-[#e4e0d8] hover:text-[#101216]'
            }`}
          >
            <span>Sans photo ({memberList.length - withPhotoCount})</span>
          </button>

          {/* View mode toggle */}
          <div className="ml-2 pl-2 border-l border-[#e4e0d8] flex items-center gap-1">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded border transition-colors ${
                viewMode === 'grid'
                  ? 'bg-[#101216] text-white border-[#101216]'
                  : 'bg-white text-[#5c6370] border-[#e4e0d8] hover:bg-[#f2efe9]'
              }`}
              title="Vue Cartes Réelles (Ratio 4:5)"
            >
              <Squares2X2Icon className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded border transition-colors ${
                viewMode === 'table'
                  ? 'bg-[#101216] text-white border-[#101216]'
                  : 'bg-white text-[#5c6370] border-[#e4e0d8] hover:bg-[#f2efe9]'
              }`}
              title="Vue Liste Compacte"
            >
              <ListBulletIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Main Display: Grid of Member Cards ── */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredMembers.map((member) => {
            const hasPhoto = isValidPhotoUrl(member.photoUrl) && !brokenImages[member.id];
            const initials = getInitials(member.name);
            const gradient = getAvatarGradient(member.name);
            const currentY = parseVerticalPosition(member.photoPosition);
            const isModified = modifiedIds.has(member.id);
            const isSaving = savingIds.has(member.id);
            const roles = Array.isArray(member.role) ? member.role : [member.role].filter(Boolean);

            return (
              <div
                key={member.id}
                className={`flex flex-col rounded-lg border bg-white overflow-hidden shadow-xs transition-all duration-200 ${
                  isModified
                    ? 'border-[#e03e3e] ring-2 ring-[#e03e3e]/20'
                    : 'border-[#e4e0d8] hover:border-[#101216]/40'
                }`}
              >
                {/* ──── Portrait Preview Container (Identical 4:5 ratio as /members) ──── */}
                <div className="relative aspect-[4/5] w-full overflow-hidden bg-[#161922] group">
                  {hasPhoto ? (
                    <>
                      <Image
                        src={member.photoUrl}
                        alt={member.name}
                        fill
                        unoptimized
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        style={{ objectPosition: member.photoPosition || 'center center' }}
                        onError={() => setBrokenImages((prev) => ({ ...prev, [member.id]: true }))}
                        className="object-cover transition-transform duration-300"
                      />
                      {/* Current Vertical % Pill */}
                      <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5">
                        <span className="rounded bg-black/80 backdrop-blur-sm px-2 py-0.5 text-xs font-mono font-bold text-white border border-white/10">
                          {currentY}% Y
                        </span>
                        {isModified && (
                          <span className="h-2 w-2 rounded-full bg-[#e03e3e] animate-pulse" title="Modifié" />
                        )}
                      </div>
                    </>
                  ) : (
                    /* Monogram fallback */
                    <div className={`relative h-full w-full bg-gradient-to-br ${gradient} flex flex-col items-center justify-center select-none overflow-hidden p-6`}>
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/10 border border-white/15 backdrop-blur-sm">
                        <span className="text-xl font-extrabold uppercase tracking-tight text-white">
                          {initials}
                        </span>
                      </div>
                      <span className="mt-2 text-xs font-semibold uppercase tracking-wider text-[#a7adbb]">
                        Pas de photo
                      </span>
                    </div>
                  )}

                  {/* Floating role badge overlay on photo top */}
                  {roles.length > 0 && (
                    <div className="absolute top-3 left-3 flex flex-wrap gap-1 z-10 max-w-[70%]">
                      {roles.slice(0, 1).map((r, i) => (
                        <span
                          key={i}
                          className="rounded-full bg-[#101216]/85 backdrop-blur-md px-2 py-0.5 text-xs font-bold uppercase tracking-wider text-white border border-white/15 truncate"
                        >
                          {r}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Hover Overlay Button to open Cropper */}
                  {hasPhoto && (
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-4">
                      <button
                        type="button"
                        onClick={() => handleOpenRecrop(member.id)}
                        className="inline-flex items-center gap-1.5 rounded-md bg-[#101216] border border-white/20 text-white px-3 py-2 text-xs font-semibold uppercase tracking-wider hover:bg-[#e03e3e] transition-colors shadow-lg"
                      >
                        <AdjustmentsHorizontalIcon className="h-4 w-4" />
                        <span>Recadrer 4:5</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* ──── Controls Panel ──── */}
                <div className="p-4 flex flex-col flex-grow justify-between space-y-3.5 bg-white border-t border-[#e4e0d8]">
                  {/* Name and email */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="text-sm font-bold text-[#101216] truncate">
                        {member.name}
                      </h3>
                      <p className="text-xs text-[#5c6370] truncate">
                        {member.email || 'Membre actif'}
                      </p>
                    </div>

                    {isModified && (
                      <span className="shrink-0 rounded bg-amber-50 border border-amber-200 px-1.5 py-0.5 text-xs font-bold uppercase tracking-wider text-amber-800">
                        Modifié
                      </span>
                    )}
                  </div>

                  {hasPhoto ? (
                    <>
                      {/* Vertical Alignment Presets */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-[#5c6370] flex items-center gap-1">
                            <ArrowsUpDownIcon className="h-3 w-3 text-[#e03e3e]" />
                            <span>Alignement vertical</span>
                          </span>
                          <span className="font-mono font-bold text-[#101216]">{currentY}%</span>
                        </div>

                        {/* Presets Row */}
                        <div className="grid grid-cols-3 gap-1">
                          {VERTICAL_PRESETS.map((preset) => {
                            const isSelected = Math.abs(currentY - preset.percent) <= 12;
                            return (
                              <button
                                key={preset.id}
                                type="button"
                                onClick={() => handleSetPosition(member.id, preset.position)}
                                className={`rounded px-2 py-1 text-xs font-bold uppercase tracking-wider border transition-colors text-center truncate ${
                                  isSelected
                                    ? 'bg-[#101216] text-white border-[#101216]'
                                    : 'bg-[#faf8f5] text-[#5c6370] border-[#e4e0d8] hover:bg-[#f2efe9] hover:text-[#101216]'
                                }`}
                                title={preset.label}
                              >
                                {preset.shortLabel}
                              </button>
                            );
                          })}
                        </div>

                        {/* Range Slider for Millimetric Positioning */}
                        <input
                          id={`member-photo-y-${member.id}`}
                          type="range"
                          min={0}
                          max={100}
                          step={1}
                          aria-label={`Ajuster la position verticale de la photo pour ${member.name}`}
                          value={currentY}
                          onChange={(e) =>
                            handleSetPosition(member.id, formatVerticalPosition(Number(e.target.value)))
                          }
                          className="w-full accent-[#e03e3e] cursor-pointer mt-1"
                        />
                      </div>

                      {/* Card Action Buttons */}
                      <div className="pt-2 border-t border-[#e4e0d8] flex items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => handleOpenRecrop(member.id)}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-[#5c6370] hover:text-[#101216] transition-colors"
                        >
                          <AdjustmentsHorizontalIcon className="h-3.5 w-3.5 text-[#e03e3e]" />
                          <span>Recadrer</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => triggerUploadForMember(member.id)}
                          disabled={isUploading}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-[#5c6370] hover:text-[#101216] transition-colors"
                        >
                          <ArrowUpTrayIcon className="h-3.5 w-3.5" />
                          <span>Changer</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleSaveSingle(member.id)}
                          disabled={!isModified || isSaving}
                          className={`inline-flex items-center gap-1 rounded px-2.5 py-1 text-xs font-bold uppercase tracking-wider transition-colors ${
                            isModified
                              ? 'bg-[#e03e3e] hover:bg-[#c93434] text-white shadow-xs'
                              : 'bg-[#f2efe9] text-[#a7adbb] cursor-not-allowed'
                          }`}
                        >
                          {isSaving ? (
                            <ArrowPathIcon className="h-3 w-3 animate-spin" />
                          ) : (
                            <CheckIcon className="h-3 w-3" />
                          )}
                          <span>Sauver</span>
                        </button>
                      </div>
                    </>
                  ) : (
                    /* If no photo: upload trigger */
                    <div className="pt-2 border-t border-[#e4e0d8] space-y-2">
                      <p className="text-xs text-[#5c6370]">
                        Ce membre n&apos;a pas encore de photo de profil.
                      </p>
                      <button
                        type="button"
                        onClick={() => triggerUploadForMember(member.id)}
                        disabled={isUploading}
                        className="w-full inline-flex items-center justify-center gap-1.5 rounded-md bg-[#101216] hover:bg-[#262b38] text-white px-3 py-2 text-xs font-semibold uppercase tracking-wider transition-colors"
                      >
                        <ArrowUpTrayIcon className="h-3.5 w-3.5 text-[#e03e3e]" />
                        <span>Téléverser &amp; Cadrer</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ── Compact Table View ── */
        <div className="overflow-hidden rounded-lg border border-[#e4e0d8] bg-white shadow-xs">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-[#e4e0d8]">
              <thead className="bg-[#f2efe9]">
                <tr>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-[#5c6370]">
                    Portrait &amp; Membre
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-[#5c6370]">
                    Positionnement Vertical
                  </th>
                  <th className="px-6 py-3.5 text-center text-xs font-semibold uppercase tracking-wider text-[#5c6370]">
                    Valeur
                  </th>
                  <th className="px-6 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-[#5c6370]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#efece5] bg-white text-xs">
                {filteredMembers.map((member) => {
                  const hasPhoto = isValidPhotoUrl(member.photoUrl) && !brokenImages[member.id];
                  const initials = getInitials(member.name);
                  const gradient = getAvatarGradient(member.name);
                  const currentY = parseVerticalPosition(member.photoPosition);
                  const isModified = modifiedIds.has(member.id);
                  const isSaving = savingIds.has(member.id);

                  return (
                    <tr key={member.id} className="hover:bg-[#faf8f5] transition-colors">
                      <td className="whitespace-nowrap px-6 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="relative h-14 w-11 shrink-0 overflow-hidden rounded border border-[#262b38] bg-[#101216]">
                            {hasPhoto ? (
                              <Image
                                src={member.photoUrl}
                                alt={member.name}
                                fill
                                unoptimized
                                sizes="44px"
                                style={{ objectPosition: member.photoPosition || 'center center' }}
                                className="object-cover"
                              />
                            ) : (
                              <div className={`h-full w-full bg-gradient-to-br ${gradient} flex items-center justify-center font-bold text-white text-xs`}>
                                {initials}
                              </div>
                            )}
                          </div>

                          <div>
                            <p className="font-bold text-[#101216]">{member.name}</p>
                            <p className="text-xs text-[#5c6370]">{member.email || '-'}</p>
                          </div>
                        </div>
                      </td>

                    <td className="px-6 py-3.5 max-w-xs">
                      {hasPhoto ? (
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            {VERTICAL_PRESETS.map((preset) => (
                              <button
                                key={preset.id}
                                type="button"
                                onClick={() => handleSetPosition(member.id, preset.position)}
                                className={`rounded px-2 py-0.5 text-xs font-bold uppercase tracking-wider border transition-colors ${
                                  Math.abs(currentY - preset.percent) <= 12
                                    ? 'bg-[#101216] text-white border-[#101216]'
                                    : 'bg-[#faf8f5] text-[#5c6370] border-[#e4e0d8] hover:bg-[#f2efe9]'
                                }`}
                              >
                                {preset.shortLabel}
                              </button>
                            ))}
                          </div>
                          <input
                            id={`member-table-photo-y-${member.id}`}
                            type="range"
                            min={0}
                            max={100}
                            step={1}
                            aria-label={`Ajuster la position verticale de la photo pour ${member.name}`}
                            value={currentY}
                            onChange={(e) =>
                              handleSetPosition(member.id, formatVerticalPosition(Number(e.target.value)))
                            }
                            className="w-full accent-[#e03e3e] cursor-pointer"
                          />
                        </div>
                      ) : (
                        <span className="text-xs text-[#5c6370] italic">Pas de photo</span>
                      )}
                    </td>

                    <td className="whitespace-nowrap px-6 py-3.5 text-center font-mono font-bold text-xs text-[#101216]">
                      {hasPhoto ? `${currentY}%` : '-'}
                    </td>

                    <td className="whitespace-nowrap px-6 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {hasPhoto && (
                          <button
                            type="button"
                            onClick={() => handleOpenRecrop(member.id)}
                            className="rounded-md border border-[#e4e0d8] bg-white px-2.5 py-1 text-xs font-semibold text-[#101216] hover:bg-[#f2efe9] transition-colors"
                            title="Recadrer l'image"
                          >
                            Recadrer 4:5
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => triggerUploadForMember(member.id)}
                          className="rounded-md border border-[#e4e0d8] bg-white px-2.5 py-1 text-xs font-semibold text-[#101216] hover:bg-[#f2efe9] transition-colors"
                          title="Changer l'image"
                        >
                          Téléverser
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSaveSingle(member.id)}
                          disabled={!isModified || isSaving}
                          className={`rounded-md px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white transition-colors ${
                            isModified
                              ? 'bg-[#e03e3e] hover:bg-[#c93434]'
                              : 'bg-[#101216] opacity-40 cursor-not-allowed'
                          }`}
                        >
                          {isSaving ? '...' : 'Sauver'}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredMembers.length === 0 && (
        <div className="rounded-lg border border-[#e4e0d8] bg-white p-12 text-center space-y-3">
          <PhotoIcon className="mx-auto h-12 w-12 text-[#5c6370]" />
          <h3 className="text-base font-bold text-[#101216]">Aucun membre trouvé</h3>
          <p className="text-xs sm:text-sm text-[#5c6370] max-w-sm mx-auto">
            Aucun membre ne correspond aux critères de filtre ou de recherche sélectionnés.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearch('');
              setRoleFilter('all');
            }}
            className="inline-flex items-center gap-2 rounded-md bg-[#e03e3e] text-white px-4 py-2 text-xs font-semibold uppercase tracking-wider hover:bg-[#c93434] transition-colors"
          >
            Réinitialiser les filtres
          </button>
        </div>
      )}

      {/* ── Visual Crop Modal ── */}
      <MemberCropModal
        isOpen={cropModalOpen}
        imageSrc={cropModalImageSrc}
        memberName={activeTargetMemberName}
        aspectRatio={4 / 5}
        onClose={() => {
          setCropModalOpen(false);
          setCropModalImageSrc(null);
          setCropModalMemberId(null);
        }}
        onCropConfirmed={handleCropConfirmed}
      />

      {/* ── Floating Save Bar if changes exist ── */}
      {modifiedIds.size > 0 && (
        <div className="fixed bottom-6 right-6 z-40 flex items-center gap-4 rounded-lg border border-[#e03e3e] bg-[#101216] p-4 text-white shadow-2xl animate-in slide-in-from-bottom-5">
          <div className="space-y-0.5">
            <p className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-[#e03e3e] animate-ping" />
              <span>{modifiedIds.size} modification(s) en attente</span>
            </p>
            <p className="text-xs text-[#a7adbb]">
              Cliquez pour publier instantanément sur le site.
            </p>
          </div>
          <button
            type="button"
            onClick={handleSaveAll}
            disabled={isSavingAll}
            className="rounded-md bg-[#e03e3e] hover:bg-[#c93434] px-4 py-2 text-xs font-bold uppercase tracking-wider text-white transition-colors cursor-pointer"
          >
            {isSavingAll ? 'Enregistrement...' : 'Enregistrer tout'}
          </button>
        </div>
      )}
    </div>
  );
}
