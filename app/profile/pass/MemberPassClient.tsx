'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import { getMemberProfileAction, updateMemberEmergencyAction } from '@/app/actions';
import { generateQrCodeSvg, generateQrCodeDataUrl } from '@/app/lib/qrcode';
import { Spinner } from '@/app/components/ui/Spinner';
import {
  ShieldCheckIcon,
  PhoneIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  ArrowsPointingOutIcon,
  ArrowDownTrayIcon,
  PencilSquareIcon,
  XMarkIcon,
  ArrowLeftIcon,
  ArrowPathIcon,
  IdentificationIcon,
  ShareIcon,
} from '@heroicons/react/24/outline';
import { BoltIcon } from '@heroicons/react/24/solid';
import { ClubCrestIcon } from '@/app/components/ui/CyclingIcons';
import { toast } from 'sonner';

interface MemberPassData {
  id: string;
  name: string;
  role?: string[] | string;
  email?: string;
  phone?: string;
  photoUrl?: string;
  preferredGroup?: 'A' | 'B' | 'C' | 'VTT';
  cotisation2026Status?: 'paid' | 'pending' | 'exempt';
  cotisation2026PaidAt?: string;
  ffbcLicenseNumber?: string;
  iceContactName?: string;
  iceContactPhone?: string;
  iceRelationship?: string;
  updatedAt?: string;
}

const LOCAL_STORAGE_PASS_KEY = 'cc_blanmont_member_pass_cache';

function getInitials(name: string): string {
  if (!name) return 'CC';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function MemberPassClient(): React.ReactElement {
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();

  const [memberData, setMemberData] = useState<MemberPassData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOfflineCache, setIsOfflineCache] = useState(false);
  const [qrMode, setQrMode] = useState<'pointage' | 'ice'>('pointage');
  const [qrSvg, setQrSvg] = useState<string>('');
  const [isFullscreenQr, setIsFullscreenQr] = useState(false);
  const [isEditingData, setIsEditingData] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [imgError, setImgError] = useState(false);

  // Edit form state
  const [editForm, setEditForm] = useState({
    phone: '',
    ffbcLicenseNumber: '',
    iceContactName: '',
    iceContactPhone: '',
    iceRelationship: '',
    preferredGroup: 'B' as 'A' | 'B' | 'C' | 'VTT',
  });

  // Load member data with offline cache fallback
  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }

    async function loadData() {
      // First try to load from local storage cache for instant rendering
      try {
        const cached = localStorage.getItem(LOCAL_STORAGE_PASS_KEY);
        if (cached) {
          const parsed = JSON.parse(cached) as MemberPassData;
          setMemberData(parsed);
          setEditForm({
            phone: parsed.phone || '',
            ffbcLicenseNumber: parsed.ffbcLicenseNumber || '',
            iceContactName: parsed.iceContactName || '',
            iceContactPhone: parsed.iceContactPhone || '',
            iceRelationship: parsed.iceRelationship || '',
            preferredGroup: parsed.preferredGroup || 'B',
          });
        }
      } catch (e) {
        console.warn('Could not read cached pass:', e);
      }

      if (user) {
        try {
          const fresh = await getMemberProfileAction();
          if (fresh) {
            const data: MemberPassData = {
              id: user.id,
              name: user.name,
              role: user.role,
              email: user.email,
              phone: fresh.phone || user.phone,
              photoUrl: fresh.photoUrl || user.avatarUrl,
              preferredGroup: fresh.preferredGroup || 'B',
              cotisation2026Status: fresh.cotisation2026Status || 'pending',
              cotisation2026PaidAt: fresh.cotisation2026PaidAt,
              ffbcLicenseNumber: fresh.ffbcLicenseNumber,
              iceContactName: fresh.iceContactName,
              iceContactPhone: fresh.iceContactPhone,
              iceRelationship: fresh.iceRelationship,
              updatedAt: fresh.updatedAt || new Date().toISOString(),
            };

            setMemberData(data);
            setIsOfflineCache(false);
            setEditForm({
              phone: data.phone || '',
              ffbcLicenseNumber: data.ffbcLicenseNumber || '',
              iceContactName: data.iceContactName || '',
              iceContactPhone: data.iceContactPhone || '',
              iceRelationship: data.iceRelationship || '',
              preferredGroup: data.preferredGroup || 'B',
            });

            // Save to localStorage for offline availability
            try {
              localStorage.setItem(LOCAL_STORAGE_PASS_KEY, JSON.stringify(data));
            } catch (err) {
              console.warn('Could not cache pass locally:', err);
            }
          }
        } catch (err) {
          console.error('Error fetching member profile:', err);
          setIsOfflineCache(true);
        } finally {
          setIsLoading(false);
        }
      } else if (!isAuthLoading) {
        setIsLoading(false);
      }
    }

    loadData();
  }, [user, isAuthenticated, isAuthLoading, router]);

  // Compute QR Code payload depending on active mode
  const qrPayload = useMemo(() => {
    if (!memberData) return '';
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://blanmont.be';

    if (qrMode === 'pointage') {
      // Express check-in URL scanned by captains at ride departures
      return `${origin}/admin/pointage-express?memberId=${encodeURIComponent(
        memberData.id
      )}&name=${encodeURIComponent(memberData.name)}&group=${memberData.preferredGroup || 'B'}`;
    } else {
      // Emergency ICE vCard scanned by first-responders or fellow riders
      return `BEGIN:VCARD
VERSION:3.0
FN:ICE - ${memberData.iceContactName || 'Contact Urgence'} (${memberData.name})
TEL;TYPE=CELL:${memberData.iceContactPhone || ''}
NOTE:Contact urgence cycliste CC Saint-Martin Blanmont. Licence FFBC: ${
        memberData.ffbcLicenseNumber || 'Non renseignee'
      }. Groupe: ${memberData.preferredGroup || 'B'}.
END:VCARD`;
    }
  }, [memberData, qrMode]);

  // Generate SVG QR Code
  useEffect(() => {
    if (!qrPayload) return;

    generateQrCodeSvg(qrPayload, {
      margin: 1,
      width: 240,
      color: {
        dark: '#0a0c10',
        light: '#ffffff',
      },
    })
      .then((svg) => setQrSvg(svg))
      .catch((err) => console.error('Error generating QR code SVG:', err));
  }, [qrPayload]);

  // Handle saving emergency details and license
  const handleSaveData = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setIsSaving(true);
    const toastId = toast.loading('Mise à jour de votre carte de membre...');

    try {
      await updateMemberEmergencyAction(editForm);

      setMemberData((prev) => (prev ? { ...prev, ...editForm } : null));

      // Update local storage cache
      if (memberData) {
        const updated = { ...memberData, ...editForm };
        try {
          localStorage.setItem(LOCAL_STORAGE_PASS_KEY, JSON.stringify(updated));
        } catch {
          // ignore cache errors
        }
      }

      setIsEditingData(false);
      toast.success('Carte de membre et contact ICE mis à jour !', { id: toastId });
    } catch (err: unknown) {
      const error = err as Error;
      toast.error(error.message || 'Erreur lors de l’enregistrement.', { id: toastId });
    } finally {
      setIsSaving(false);
    }
  };

  // Download QR Code as PNG image
  const handleDownloadQr = useCallback(async () => {
    if (!qrPayload || !memberData) return;
    try {
      const dataUrl = await generateQrCodeDataUrl(qrPayload, {
        margin: 2,
        width: 600,
        color: { dark: '#0a0c10', light: '#ffffff' },
      });

      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `cc-blanmont-qr-${qrMode}-${memberData.name.toLowerCase().replace(/\s+/g, '-')}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      toast.success('QR Code téléchargé avec succès !');
    } catch {
      toast.error('Impossible de télécharger le QR code.');
    }
  }, [qrPayload, memberData, qrMode]);

  // Share or copy link
  const handleShare = useCallback(async () => {
    if (!memberData) return;
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Pass Sécurité & Carte de Membre - ${memberData.name}`,
          text: `Carte officielle et contact d'urgence CC Saint-Martin Blanmont`,
          url,
        });
      } catch {
        // Share dismissed
      }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        toast.success('Lien du pass copié dans le presse-papier !');
      } catch {
        toast.error('Impossible de copier le lien.');
      }
    }
  }, [memberData]);

  if (isAuthLoading || (isLoading && !memberData)) {
    return (
      <main className="min-h-screen bg-paper dark:bg-night flex items-center justify-center p-8">
        <div className="flex flex-col items-center gap-4">
          <Spinner size="lg" />
          <p className="text-xs font-semibold uppercase tracking-wider text-ink-3 dark:text-snow-3">
            Chargement de votre pass officiel...
          </p>
        </div>
      </main>
    );
  }

  if (!memberData) {
    return (
      <main className="min-h-screen bg-paper dark:bg-night flex items-center justify-center p-6">
        <div className="max-w-md w-full rounded-lg border border-line dark:border-night-line bg-white dark:bg-night-2 p-6 text-center space-y-4">
          <ExclamationTriangleIcon className="h-10 w-10 text-brand mx-auto" />
          <h1 className="text-lg font-bold text-ink dark:text-snow">
            Pass Membre Introuvable
          </h1>
          <p className="text-xs text-ink-3 dark:text-snow-3">
            Veuillez vous reconnecter pour accéder à votre carte officielle du club.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center justify-center px-4 py-2 bg-brand hover:bg-brand-strong text-white text-xs font-semibold uppercase tracking-wider rounded-md min-h-[44px]"
          >
            Se connecter
          </Link>
        </div>
      </main>
    );
  }

  const hasPhoto = Boolean(memberData.photoUrl) && !imgError;
  const initials = getInitials(memberData.name);
  const cotisationStatus = memberData.cotisation2026Status || 'pending';
  const hasIce = Boolean(memberData.iceContactName && memberData.iceContactPhone);
  const hasLicense = Boolean(memberData.ffbcLicenseNumber);
  const roles = Array.isArray(memberData.role)
    ? memberData.role.join(', ')
    : memberData.role || 'Membre actif';

  return (
    <main className="min-h-screen bg-paper dark:bg-night text-ink dark:text-snow pb-24">
      {/* Top Wayfinding & Actions Bar */}
      <header className="border-b border-line dark:border-night-line bg-white dark:bg-night-2 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-4">
          <Link
            href="/profile"
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-ink-3 dark:text-snow-3 hover:text-ink dark:hover:text-snow transition-colors min-h-[44px]"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            <span>Mon Profil</span>
          </Link>

          <div className="flex items-center gap-2">
            {isOfflineCache && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800">
                <ClockIcon className="h-3.5 w-3.5" /> Hors-Ligne
              </span>
            )}

            <button
              type="button"
              onClick={() => setIsEditingData(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-line dark:border-night-line text-xs font-semibold text-ink dark:text-snow hover:bg-paper dark:hover:bg-night-3 transition-colors min-h-[44px]"
            >
              <PencilSquareIcon className="h-4 w-4 text-brand" />
              <span className="hidden sm:inline">Modifier Coordonnées</span>
              <span className="sm:hidden">Éditer</span>
            </button>

            <button
              type="button"
              onClick={handleShare}
              aria-label="Partager la carte de membre"
              className="inline-flex items-center justify-center p-2 rounded-md border border-line dark:border-night-line text-ink-3 dark:text-snow-3 hover:text-ink dark:hover:text-snow hover:bg-paper dark:hover:bg-night-3 transition-colors min-h-[44px] min-w-[44px]"
            >
              <ShareIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Page Layout Container */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* Page Title & Mission */}
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-ink dark:text-snow">
            Pass Sécurité &amp; Carte de Membre{' '}
            Digitale
          </h1>
          <p className="mt-2 text-sm text-ink-3 dark:text-snow-3 max-w-2xl leading-relaxed">
            Votre carte officielle d&apos;adhésion au CC Saint-Martin Blanmont pour la saison 2026,
            incluant le numéro de licence FFBC, l&apos;appel direct du contact d&apos;urgence (ICE)
            et le QR code de pointage express au départ.
          </p>
        </div>

        {/* Bento Grid: Official Digital Pass (Left) & QR Code / Safety Strip (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT: Official Membership Card (Front & Details) */}
          <div className="lg:col-span-7 space-y-6">
            {/* The Official Digital Card Container */}
            <div className="relative rounded-lg border border-line dark:border-night-line bg-white dark:bg-night-2 p-6 sm:p-7 shadow-xs overflow-hidden">
              {/* Official Federation & Club Crest Top Band */}
              <div className="flex items-center justify-between pb-5 border-b border-paper-2 dark:border-night-line">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-md bg-brand/10 dark:bg-brand/20 text-brand flex items-center justify-center border border-brand/20 shrink-0">
                    <ClubCrestIcon className="h-6 w-6" />
                  </div>
                  <div>
                    <span className="block text-xs font-bold uppercase tracking-[0.12em] text-ink dark:text-snow">
                      CC Saint-Martin Blanmont
                    </span>
                    <span className="block text-xs text-ink-3 dark:text-snow-3">
                      Club Cyclo fondé en 1978 &bull; Affiliation FFBC
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="inline-block font-mono text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-paper dark:bg-night border border-line dark:border-night-line text-ink dark:text-snow">
                    Saison 2026
                  </span>
                </div>
              </div>

              {/* Card Body: Member Photo + Identity Info */}
              <div className="pt-6 flex flex-col sm:flex-row items-start sm:items-center gap-5 sm:gap-6">
                {/* Official Member Photo */}
                <div className="relative h-28 w-28 sm:h-32 sm:w-32 rounded-lg bg-night border border-line dark:border-night-line overflow-hidden shrink-0">
                  {hasPhoto ? (
                    <Image
                      src={memberData.photoUrl!}
                      alt={memberData.name}
                      fill
                      unoptimized
                      onError={() => setImgError(true)}
                      sizes="(max-width: 640px) 112px, 128px"
                      className="object-cover object-center"
                    />
                  ) : (
                    <div className="h-full w-full flex flex-col items-center justify-center text-center p-2 bg-night-2 select-none">
                      <span className="text-2xl font-black text-white">{initials}</span>
                      <span className="mt-1 text-xs font-bold uppercase tracking-wider text-snow-3">
                        CCSM
                      </span>
                    </div>
                  )}

                  {/* Group badge overlay */}
                  <div className="absolute bottom-1.5 left-1.5 right-1.5">
                    <span className="block w-full py-0.5 text-center text-xs font-bold uppercase tracking-wider rounded bg-black/80 text-white backdrop-blur-xs">
                      Groupe {memberData.preferredGroup || 'B'}
                    </span>
                  </div>
                </div>

                {/* Identity Information */}
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center rounded-full bg-brand/10 text-brand px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider">
                      {roles}
                    </span>
                    <span className="inline-flex items-center rounded-full bg-paper dark:bg-night text-ink-3 dark:text-snow-3 border border-line dark:border-night-line px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider">
                      Chastre / Blanmont
                    </span>
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-ink dark:text-snow truncate">
                    {memberData.name}
                  </h2>

                  <p className="text-xs text-ink-3 dark:text-snow-3 truncate">
                    {memberData.email || 'Email non renseigné'}
                  </p>

                  <div className="pt-1 flex items-center gap-2 text-xs font-mono font-medium text-ink-2 dark:text-snow-2">
                    <span>ID Membre :</span>
                    <span className="text-ink dark:text-snow tabular-nums font-semibold">
                      {memberData.id.slice(0, 8)}...
                    </span>
                  </div>
                </div>
              </div>

              {/* Status Row: Cotisation 2026 & FFBC License */}
              <div className="mt-6 pt-5 border-t border-paper-2 dark:border-night-line grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {/* Cotisation 2026 */}
                <div className="p-3.5 rounded-md bg-paper dark:bg-night border border-line dark:border-night-line space-y-1.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-ink-3 dark:text-snow-3">
                    Cotisation 2026
                  </span>
                  <div>
                    {cotisationStatus === 'paid' ? (
                      <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300 font-bold">
                        <CheckCircleIcon className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                        <span>En règle pour la saison</span>
                      </div>
                    ) : cotisationStatus === 'exempt' ? (
                      <div className="flex items-center gap-1.5 text-ink-2 dark:text-snow-2 font-bold">
                        <CheckCircleIcon className="h-4 w-4 shrink-0 text-ink-3" />
                        <span>Statut : Exempté</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-amber-800 dark:text-amber-300 font-bold">
                        <ClockIcon className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
                        <span>Cotisation en attente</span>
                      </div>
                    )}
                  </div>
                  {memberData.cotisation2026PaidAt && (
                    <p className="text-xs text-ink-3 dark:text-snow-3 tabular-nums">
                      Enregistrée le {memberData.cotisation2026PaidAt}
                    </p>
                  )}
                </div>

                {/* FFBC License */}
                <div className="p-3.5 rounded-md bg-paper dark:bg-night border border-line dark:border-night-line space-y-1.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-ink-3 dark:text-snow-3">
                    Licence Fédérale FFBC
                  </span>
                  <div>
                    {hasLicense ? (
                      <span className="font-mono font-bold text-sm text-ink dark:text-snow tracking-wider select-all">
                        {memberData.ffbcLicenseNumber}
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setIsEditingData(true)}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-brand hover:underline"
                      >
                        <PencilSquareIcon className="h-3.5 w-3.5" />
                        <span>Renseigner mon n° de licence</span>
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-ink-3 dark:text-snow-3">
                    Fédération Francophone Belge du Cyclisme
                  </p>
                </div>
              </div>

              {/* Official Card Footer Security Stamp */}
              <div className="mt-5 pt-4 border-t border-paper-2 dark:border-night-line flex flex-wrap items-center justify-between text-xs text-ink-3 dark:text-snow-3 gap-2">
                <span className="inline-flex items-center gap-1 font-medium">
                  <IdentificationIcon className="h-4 w-4 text-brand" />
                  Carte Numérique d&apos;Adhérent
                </span>
                <span className="font-mono tabular-nums">Valide au 31/12/2026</span>
              </div>
            </div>

            {/* In Case of Emergency (ICE) Safety Card */}
            <div className="rounded-lg border border-line dark:border-night-line bg-white dark:bg-night-2 p-6 shadow-xs space-y-5">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <ShieldCheckIcon className="h-5 w-5 text-brand" />
                    <h3 className="text-base font-bold text-ink dark:text-snow">
                      Sécurité Peloton &amp; Contact d&apos;Urgence (ICE)
                    </h3>
                  </div>
                  <p className="text-xs text-ink-3 dark:text-snow-3 leading-relaxed">
                    Accessible aux capitaines de route, secouristes et membres du peloton en cas
                    d&apos;incident ou chute.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsEditingData(true)}
                  className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-line dark:border-night-line text-xs font-semibold text-ink dark:text-snow hover:bg-paper dark:hover:bg-night-3 transition-colors min-h-[44px]"
                >
                  <PencilSquareIcon className="h-3.5 w-3.5 text-brand" />
                  <span>Modifier</span>
                </button>
              </div>

              {hasIce ? (
                <div className="space-y-4">
                  {/* ICE Contact Details */}
                  <div className="rounded-md bg-paper dark:bg-night border border-line dark:border-night-line p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-ink-3 dark:text-snow-3">
                        Personne à contacter (ICE)
                      </span>
                      <p className="text-sm font-bold text-ink dark:text-snow mt-0.5">
                        {memberData.iceContactName}
                      </p>
                      {memberData.iceRelationship && (
                        <p className="text-ink-3 dark:text-snow-3 mt-0.5">
                          Lien : {memberData.iceRelationship}
                        </p>
                      )}
                    </div>

                    <div className="text-left sm:text-right">
                      <span className="text-xs font-bold uppercase tracking-wider text-ink-3 dark:text-snow-3">
                        Numéro de téléphone
                      </span>
                      <p className="text-sm font-mono font-bold text-ink dark:text-snow mt-0.5 tabular-nums select-all">
                        {memberData.iceContactPhone}
                      </p>
                    </div>
                  </div>

                  {/* 1-TAP DIRECT CALL BUTTON */}
                  <a
                    href={`tel:${memberData.iceContactPhone}`}
                    className="w-full inline-flex items-center justify-center gap-3 px-6 py-3.5 rounded-md bg-brand hover:bg-brand-strong active:scale-[0.99] text-white text-sm font-bold uppercase tracking-wider shadow-sm transition-all min-h-[48px]"
                  >
                    <PhoneIcon className="h-5 w-5 animate-pulse" />
                    <span>Appel Direct ICE : {memberData.iceContactPhone}</span>
                  </a>

                  {/* Emergency Services 112 Quick Button */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                    <a
                      href="tel:112"
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-md border border-line dark:border-night-line text-xs font-semibold text-ink dark:text-snow hover:bg-paper dark:hover:bg-night-3 transition-colors min-h-[44px]"
                    >
                      <ShieldCheckIcon className="h-4 w-4 text-brand" />
                      <span>Appeler le 112 (Secours Européens)</span>
                    </a>

                    <span className="text-xs text-ink-3 dark:text-snow-3 text-center sm:text-right">
                      Protocole : Protéger &bull; Alerter &bull; Secourir
                    </span>
                  </div>
                </div>
              ) : (
                <div className="rounded-lg border border-amber-200 bg-amber-50/80 dark:border-amber-800/60 dark:bg-amber-950/30 p-4 text-xs text-amber-900 dark:text-amber-200 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-amber-900 dark:text-amber-100">
                    <ExclamationTriangleIcon className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
                    <span>Aucun contact ICE renseigné</span>
                  </div>
                  <p className="text-amber-800 dark:text-amber-300 leading-relaxed">
                    Pour rouler en toute sérénité au sein des pelotons de Blanmont, renseignez une
                    personne de confiance à prévenir en cas de pépin mécanique ou d&apos;accident.
                  </p>
                  <button
                    type="button"
                    onClick={() => setIsEditingData(true)}
                    className="mt-2 inline-flex items-center justify-center px-4 py-2 rounded-md bg-brand hover:bg-brand-strong text-white text-xs font-semibold uppercase tracking-wider transition-colors min-h-[44px]"
                  >
                    Renseigner mon contact d&apos;urgence maintenant
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: Pointage Express QR Code & Rapid Check-in */}
          <div className="lg:col-span-5 space-y-6">
            <div className="rounded-lg border border-line dark:border-night-line bg-white dark:bg-night-2 p-6 shadow-xs space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center justify-center h-7 w-7 rounded-md bg-brand/10 text-brand">
                    <BoltIcon className="h-4 w-4" />
                  </span>
                  <h3 className="text-base font-bold text-ink dark:text-snow">
                    Pointage Express Départ
                  </h3>
                </div>

                <span className="text-xs font-mono font-semibold text-ink-3 dark:text-snow-3 uppercase">
                  Scan Rapide
                </span>
              </div>

              <p className="text-xs text-ink-3 dark:text-snow-3 leading-relaxed">
                Présentez ce QR code aux capitaines de route ou organisateurs à Blanmont le samedi /
                dimanche matin pour enregistrer instantanément votre présence au peloton.
              </p>

              {/* QR Mode Selector Tabs */}
              <div className="grid grid-cols-2 gap-1 rounded-md bg-paper dark:bg-night p-1 border border-line dark:border-night-line">
                <button
                  type="button"
                  onClick={() => setQrMode('pointage')}
                  className={`px-3 py-2 text-xs font-semibold uppercase tracking-wider rounded transition-colors min-h-[40px] ${
                    qrMode === 'pointage'
                      ? 'bg-white dark:bg-night-2 text-brand shadow-2xs font-bold'
                      : 'text-ink-3 dark:text-snow-3 hover:text-ink dark:hover:text-snow'
                  }`}
                >
                  Pointage Départ
                </button>
                <button
                  type="button"
                  onClick={() => setQrMode('ice')}
                  className={`px-3 py-2 text-xs font-semibold uppercase tracking-wider rounded transition-colors min-h-[40px] ${
                    qrMode === 'ice'
                      ? 'bg-white dark:bg-night-2 text-brand shadow-2xs font-bold'
                      : 'text-ink-3 dark:text-snow-3 hover:text-ink dark:hover:text-snow'
                  }`}
                >
                  Fiche Secours ICE
                </button>
              </div>

              {/* The QR Code Container */}
              <div className="relative flex flex-col items-center justify-center p-6 rounded-lg bg-white border border-line text-center">
                {qrSvg ? (
                  <div
                    className="w-52 h-52 sm:w-60 sm:h-60 flex items-center justify-center cursor-pointer select-none transition-transform hover:scale-[1.02]"
                    onClick={() => setIsFullscreenQr(true)}
                    title="Cliquer pour afficher en plein écran au départ"
                    dangerouslySetInnerHTML={{ __html: qrSvg }}
                  />
                ) : (
                  <div className="w-52 h-52 flex items-center justify-center text-xs text-ink-3">
                    Génération du QR Code...
                  </div>
                )}

                <div className="mt-3 text-center">
                  <span className="text-xs font-mono font-bold text-ink tracking-wider uppercase">
                    {qrMode === 'pointage'
                      ? 'Embarquement Sortie Club'
                      : 'Carte Secours vCard Numérique'}
                  </span>
                  <p className="text-xs text-ink-3 mt-0.5">
                    {qrMode === 'pointage'
                      ? 'Scannable avec tout smartphone ou lecteur club'
                      : 'Compose automatiquement le contact ICE'}
                  </p>
                </div>
              </div>

              {/* QR Actions: Fullscreen & Download */}
              <div className="grid grid-cols-2 gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => setIsFullscreenQr(true)}
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-md border border-line dark:border-night-line text-xs font-semibold text-ink dark:text-snow hover:bg-paper dark:hover:bg-night-3 transition-colors min-h-[44px]"
                >
                  <ArrowsPointingOutIcon className="h-4 w-4 text-brand" />
                  <span>Plein Écran</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadQr}
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-md border border-line dark:border-night-line text-xs font-semibold text-ink dark:text-snow hover:bg-paper dark:hover:bg-night-3 transition-colors min-h-[44px]"
                >
                  <ArrowDownTrayIcon className="h-4 w-4 text-brand" />
                  <span>Télécharger</span>
                </button>
              </div>

              {/* Offline usage hint */}
              <div className="rounded-md bg-paper dark:bg-night border border-line dark:border-night-line p-3 text-xs text-ink-3 dark:text-snow-3 leading-relaxed">
                <strong>Conseil Cyclo :</strong> Ajoutez cette page à l&apos;écran d&apos;accueil de
                votre téléphone (PWA). Le pass et le QR code restent disponibles même sans réseau
                4G/5G en pleine campagne brabançonne.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fullscreen QR Modal for Easy Scanning at Departure */}
      {isFullscreenQr && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xs p-4 animate-in fade-in duration-200"
          onClick={() => setIsFullscreenQr(false)}
        >
          <div
            className="bg-white rounded-lg p-6 sm:p-8 max-w-sm w-full text-center space-y-4 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setIsFullscreenQr(false)}
              aria-label="Fermer le plein écran"
              className="absolute top-3 right-3 p-2 rounded-md text-ink-3 hover:text-ink hover:bg-paper transition-colors min-h-[44px] min-w-[44px] inline-flex items-center justify-center"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>

            <div>
              <span className="text-xs font-bold uppercase tracking-[0.1em] text-brand">
                CC Saint-Martin Blanmont
              </span>
              <h2 className="text-lg font-bold text-ink mt-0.5">
                {qrMode === 'pointage' ? 'Pointage Express Départ' : 'Fiche Urgence ICE'}
              </h2>
              <p className="text-xs text-ink-3 mt-1">{memberData.name}</p>
            </div>

            <div className="p-4 bg-white rounded-md border border-line flex items-center justify-center">
              <div
                className="w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center"
                dangerouslySetInnerHTML={{ __html: qrSvg }}
              />
            </div>

            <p className="text-xs text-ink-3">
              Luminosité maximale recommandée pour le scan en extérieur.
            </p>

            <button
              type="button"
              onClick={() => setIsFullscreenQr(false)}
              className="w-full py-2.5 bg-ink text-white text-xs font-bold uppercase tracking-wider rounded-md hover:bg-night-line transition-colors min-h-[44px]"
            >
              Fermer
            </button>
          </div>
        </div>
      )}

      {/* Edit Data Modal */}
      {isEditingData && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 animate-in fade-in duration-200"
        >
          <div className="bg-white dark:bg-night-2 rounded-lg border border-line dark:border-night-line max-w-lg w-full p-6 space-y-5 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-paper-2 dark:border-night-line pb-3">
              <h2 className="text-base font-bold text-ink dark:text-snow">
                Mettre à jour ma Carte &amp; Coordonnées
              </h2>
              <button
                type="button"
                onClick={() => setIsEditingData(false)}
                aria-label="Fermer la fenêtre d'édition"
                className="p-1.5 rounded-md text-ink-3 hover:text-ink dark:hover:text-white transition-colors min-h-[44px] min-w-[44px] inline-flex items-center justify-center"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveData} className="space-y-4 text-xs">
              {/* Phone and FFBC License */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-ink-2 dark:text-snow-2 mb-1">
                    Mon GSM Personnel
                  </label>
                  <input
                    type="tel"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    placeholder="+32 470 12 34 56"
                    className="w-full rounded-md border border-line dark:border-night-line dark:bg-night px-3 py-2 text-ink dark:text-snow focus:border-brand focus:outline-hidden min-h-[44px]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-ink-2 dark:text-snow-2 mb-1">
                    N° de Licence FFBC
                  </label>
                  <input
                    type="text"
                    value={editForm.ffbcLicenseNumber}
                    onChange={(e) =>
                      setEditForm({ ...editForm, ffbcLicenseNumber: e.target.value })
                    }
                    placeholder="ex: 2026-B-12345"
                    className="w-full rounded-md border border-line dark:border-night-line dark:bg-night px-3 py-2 text-ink dark:text-snow focus:border-brand focus:outline-hidden min-h-[44px]"
                  />
                </div>
              </div>

              {/* Speed Group */}
              <div>
                <label className="block font-bold text-ink-2 dark:text-snow-2 mb-1">
                  Allure de peloton préférée
                </label>
                <select
                  value={editForm.preferredGroup}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      preferredGroup: e.target.value as 'A' | 'B' | 'C' | 'VTT',
                    })
                  }
                  className="w-full rounded-md border border-line dark:border-night-line bg-white dark:bg-night px-3 py-2 text-ink dark:text-snow focus:border-brand focus:outline-hidden min-h-[44px]"
                >
                  <option value="A">Groupe A (30-32 km/h)</option>
                  <option value="B">Groupe B (27-29 km/h)</option>
                  <option value="C">Groupe C (24-26 km/h)</option>
                  <option value="VTT">Groupe VTT / Gravel</option>
                </select>
              </div>

              {/* ICE Contact Info */}
              <div className="pt-2 border-t border-paper-2 dark:border-night-line space-y-3">
                <span className="block font-bold uppercase tracking-wider text-brand">
                  Contact d&apos;Urgence (ICE)
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-ink-2 dark:text-snow-2 mb-1">
                      Nom du contact ICE *
                    </label>
                    <input
                      type="text"
                      required
                      value={editForm.iceContactName}
                      onChange={(e) =>
                        setEditForm({ ...editForm, iceContactName: e.target.value })
                      }
                      placeholder="ex: Marie Dupont"
                      className="w-full rounded-md border border-line dark:border-night-line dark:bg-night px-3 py-2 text-ink dark:text-snow focus:border-brand focus:outline-hidden min-h-[44px]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-ink-2 dark:text-snow-2 mb-1">
                      Téléphone ICE *
                    </label>
                    <input
                      type="tel"
                      required
                      value={editForm.iceContactPhone}
                      onChange={(e) =>
                        setEditForm({ ...editForm, iceContactPhone: e.target.value })
                      }
                      placeholder="+32 470 98 76 54"
                      className="w-full rounded-md border border-line dark:border-night-line dark:bg-night px-3 py-2 text-ink dark:text-snow focus:border-brand focus:outline-hidden min-h-[44px]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-ink-2 dark:text-snow-2 mb-1">
                    Lien de parenté / relation
                  </label>
                  <input
                    type="text"
                    value={editForm.iceRelationship}
                    onChange={(e) =>
                      setEditForm({ ...editForm, iceRelationship: e.target.value })
                    }
                    placeholder="Conjoint(e), Parent, Ami(e), etc."
                    className="w-full rounded-md border border-line dark:border-night-line dark:bg-night px-3 py-2 text-ink dark:text-snow focus:border-brand focus:outline-hidden min-h-[44px]"
                  />
                </div>
              </div>

              {/* Form Buttons */}
              <div className="flex justify-end gap-2.5 pt-4 border-t border-paper-2 dark:border-night-line">
                <button
                  type="button"
                  onClick={() => setIsEditingData(false)}
                  disabled={isSaving}
                  className="px-4 py-2 min-h-[44px] inline-flex items-center justify-center font-semibold text-ink-2 dark:text-snow-2 hover:bg-paper dark:hover:bg-night-3 rounded-md transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2 min-h-[44px] bg-brand hover:bg-brand-strong text-white font-bold uppercase tracking-wider rounded-md shadow-xs transition-colors disabled:opacity-50"
                >
                  {isSaving && <ArrowPathIcon className="h-4 w-4 animate-spin" />}
                  <span>{isSaving ? 'Enregistrement...' : 'Enregistrer'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
