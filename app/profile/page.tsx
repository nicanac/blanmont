'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '../context/AuthContext';
import { updateProfilePhotoAction, getMemberProfileAction, updateMemberEmergencyAction } from '../actions';
import Cropper from 'react-easy-crop';
import getCroppedImg from '../lib/canvasUtils';
import { SheetHeader } from '../components/carte/SheetHeader';
import Link from 'next/link';
import {
  UserCircleIcon,
  CameraIcon,
  EnvelopeIcon,
  PhoneIcon,
  ArrowPathIcon,
  ShieldCheckIcon,
  CheckCircleIcon,
  ClockIcon,
  QrCodeIcon,
} from '@heroicons/react/24/outline';
import { toast } from 'sonner';
import { Spinner } from '../components/ui/Spinner';

// Helper function to read file as Data URL
const readFile = (file: File): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.addEventListener('load', () => resolve(reader.result as string), false);
    reader.readAsDataURL(file);
  });
};

function getInitials(name: string): string {
  if (!name) return 'CC';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function ProfilePage(): React.ReactElement | null {
  const { user, isAuthenticated, updateUser } = useAuth();
  const router = useRouter();
  const [isEditingPhoto, setIsEditingPhoto] = useState(false);
  const [isSavingPhoto, setIsSavingPhoto] = useState(false);
  const [imgError, setImgError] = useState(false);

  // Cropper State
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);

  const onCropComplete = useCallback((_croppedArea: unknown, pixelCrop: { x: number; y: number; width: number; height: number }) => {
    setCroppedAreaPixels(pixelCrop);
  }, []);

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      try {
        const imageDataUrl = await readFile(file);
        setImageSrc(imageDataUrl);
        setIsEditingPhoto(true);
      } catch {
        toast.error('Impossible de lire le fichier image sélectionné.');
      }
    }
  };

  const handleSave = async (): Promise<void> => {
    if (!imageSrc || !croppedAreaPixels || !user) return;

    setIsSavingPhoto(true);
    const toastId = toast.loading('Recadrage et téléversement de votre photo...');

    try {
      const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
      if (croppedBlob) {
        const formData = new FormData();
        formData.append('file', croppedBlob, 'profile.jpg');
        formData.append('memberId', user.id);

        const newUrl = await updateProfilePhotoAction(formData);

        if (newUrl) {
          updateUser({ avatarUrl: newUrl });
          setImgError(false);
          toast.success('Photo de profil mise à jour avec succès !', { id: toastId });
        } else {
          toast.error('Erreur lors de la mise à jour de la photo.', { id: toastId });
        }

        setIsEditingPhoto(false);
        setImageSrc(null);
      }
    } catch (e) {
      console.error(e);
      toast.error('Une erreur est survenue lors de l’enregistrement.', { id: toastId });
    } finally {
      setIsSavingPhoto(false);
    }
  };

  const handleCancel = (): void => {
    setIsEditingPhoto(false);
    setImageSrc(null);
  };

  const [profileData, setProfileData] = useState<{
    cotisation2026Status?: 'paid' | 'pending' | 'exempt';
    ffbcLicenseNumber?: string;
    iceContactName?: string;
    iceContactPhone?: string;
    iceRelationship?: string;
    preferredGroup?: 'A' | 'B' | 'C' | 'VTT';
    phone?: string;
  } | null>(null);
  const [isEditingEmergency, setIsEditingEmergency] = useState(false);
  const [isSavingEmergency, setIsSavingEmergency] = useState(false);
  const [emergencyForm, setEmergencyForm] = useState({
    phone: '',
    ffbcLicenseNumber: '',
    iceContactName: '',
    iceContactPhone: '',
    iceRelationship: '',
    preferredGroup: 'B' as 'A' | 'B' | 'C' | 'VTT',
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (user) {
      getMemberProfileAction()
        .then((data) => {
          if (data) {
            setProfileData(data);
            setEmergencyForm({
              phone: data.phone || user.phone || '',
              ffbcLicenseNumber: data.ffbcLicenseNumber || '',
              iceContactName: data.iceContactName || '',
              iceContactPhone: data.iceContactPhone || '',
              iceRelationship: data.iceRelationship || '',
              preferredGroup: (data.preferredGroup as 'A' | 'B' | 'C' | 'VTT') || 'B',
            });
          }
        })
        .catch(console.error);
    }
  }, [user]);

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-paper dark:bg-night flex items-center justify-center p-8">
        <Spinner size="lg" />
      </div>
    );
  }

  const nameParts = user.name.split(' ');
  const firstName = nameParts[0];
  const lastName = nameParts.slice(1).join(' ');
  const initials = getInitials(user.name);

  const handleSaveEmergency = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setIsSavingEmergency(true);
    try {
      await updateMemberEmergencyAction(emergencyForm);
      setProfileData((prev) => ({ ...prev, ...emergencyForm }));
      setIsEditingEmergency(false);
      toast.success('Coordonnées d’urgence mises à jour avec succès !');
    } catch (err: unknown) {
      const error = err as Error;
      toast.error(error.message || 'Erreur lors de l’enregistrement');
    } finally {
      setIsSavingEmergency(false);
    }
  };

  const hasPhoto = Boolean(user.avatarUrl) && !imgError;
  const cotisationStatus = profileData?.cotisation2026Status || 'pending';
  const hasIce = Boolean(profileData?.iceContactName && profileData?.iceContactPhone);

  return (
    <main className="min-h-screen bg-paper dark:bg-night transition-colors duration-200">
      <SheetHeader
        sheet="Espace Membre"
        focus={{ x: 50, y: 50 }}
        title="Mon profil membre"
        description="Gérez vos coordonnées personnelles, votre contact d'urgence ICE et vos accès au Club."
        legend={[
          { term: 'Membre', value: user.name || 'Membre du club' },
          {
            term: 'Rôle',
            value: user.role
              ? Array.isArray(user.role)
                ? user.role.join(', ')
                : user.role
              : 'Membre actif',
          },
          { term: 'Club', value: 'CC Saint-Martin Blanmont' },
        ]}
      />
      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:grid lg:max-w-7xl lg:grid-cols-12 lg:gap-x-12 lg:px-8">
        {/* User Avatar Card & Status */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-[10px] border border-line bg-white dark:border-night-line dark:bg-night-2 p-6 shadow-xs space-y-5">
            <div className="relative aspect-square w-full overflow-hidden rounded-[8px] bg-night-2 group border border-line dark:border-night-line">
              {hasPhoto ? (
                <Image
                  src={user.avatarUrl!}
                  alt={user.name}
                  fill
                  unoptimized
                  onError={() => setImgError(true)}
                  sizes="(max-width: 1024px) 100vw, 400px"
                  className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="h-full w-full bg-gradient-to-br from-night-2 via-night-3 to-night flex flex-col items-center justify-center text-center p-6 select-none">
                  <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white/10 border border-white/20 text-3xl font-extrabold text-white">
                    {initials}
                  </div>
                  <span className="mt-3 text-xs font-semibold uppercase tracking-wider text-snow-3">
                    CC Saint-Martin Blanmont
                  </span>
                </div>
              )}

              {/* Photo Change Action Overlay */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-4">
                <label className="inline-flex items-center gap-2 rounded-md bg-white dark:bg-night-2 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-ink dark:text-snow hover:bg-paper-2 dark:hover:bg-night-3 cursor-pointer transition-colors shadow-md">
                  <CameraIcon className="h-4 w-4 text-brand" />
                  <span>Modifier la photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={onFileChange}
                    disabled={isSavingPhoto}
                  />
                </label>
              </div>
            </div>

            <div className="text-center space-y-2">
              <span className="inline-flex items-center rounded-full bg-brand/10 text-brand px-3 py-0.5 text-xs font-bold uppercase tracking-wider">
                {user.role ? (Array.isArray(user.role) ? user.role.join(', ') : user.role) : 'Membre actif'}
              </span>
              <p className="text-xs text-ink-3 dark:text-snow-3">
                Membre du Club Cyclo Saint-Martin de Blanmont
              </p>
            </div>

            {/* Cotisation 2026 & FFBC Status Pill */}
            <div className="pt-4 border-t border-paper-2 dark:border-night-line space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-ink-3 dark:text-snow-3">Cotisation 2026</span>
                {cotisationStatus === 'paid' ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800">
                    <CheckCircleIcon className="h-3.5 w-3.5" /> En règle
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800">
                    <ClockIcon className="h-3.5 w-3.5" /> En attente
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-ink-3 dark:text-snow-3">Licence FFBC</span>
                <span className="font-mono font-medium text-ink dark:text-snow">
                  {profileData?.ffbcLicenseNumber || 'Non renseignée'}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-ink-3 dark:text-snow-3">Allure de référence</span>
                <span className="font-bold text-ink dark:text-snow">
                  Groupe {profileData?.preferredGroup || 'B'}
                </span>
              </div>

              {/* Link to Official Digital Pass */}
              <div className="pt-2">
                <Link
                  href="/profile/pass"
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-md bg-ink hover:bg-night-line dark:bg-white dark:hover:bg-paper-2 text-white dark:text-ink text-xs font-bold uppercase tracking-wider transition-colors shadow-2xs min-h-[44px]"
                >
                  <QrCodeIcon className="h-4 w-4 text-brand" />
                  <span>Pass Sécurité &amp; Carte Digitale</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Cropper Modal */}
        {isEditingPhoto && imageSrc && (
          <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4"
          >
            <div className="bg-white dark:bg-night-2 rounded-lg border border-line dark:border-night-line overflow-hidden w-full max-w-md shadow-2xl animate-in zoom-in-95">
              <div className="p-4 border-b border-paper-2 dark:border-night-line flex items-center justify-between">
                <h3 className="text-sm font-bold text-ink dark:text-snow uppercase tracking-wider">
                  Recadrer votre photo
                </h3>
                <span className="text-xs text-ink-3 dark:text-snow-3">Format carré 1:1</span>
              </div>

              <div className="relative h-80 w-full bg-night">
                <Cropper
                  image={imageSrc}
                  crop={crop}
                  zoom={zoom}
                  aspect={1}
                  onCropChange={setCrop}
                  onCropComplete={onCropComplete}
                  onZoomChange={setZoom}
                />
              </div>

              <div className="p-5 flex flex-col gap-4 bg-white dark:bg-night-2">
                <div className="space-y-1">
                  <label htmlFor="zoom-range" className="text-xs font-bold uppercase tracking-wider text-ink-2 dark:text-snow-2">
                    Zoom
                  </label>
                  <input
                    id="zoom-range"
                    type="range"
                    value={zoom}
                    min={1}
                    max={3}
                    step={0.05}
                    onChange={(e) => setZoom(Number(e.target.value))}
                    className="w-full accent-brand"
                  />
                </div>

                <div className="flex justify-end gap-2.5 pt-2 border-t border-paper-2 dark:border-night-line">
                  <button
                    type="button"
                    onClick={handleCancel}
                    disabled={isSavingPhoto}
                    className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-ink-2 dark:text-snow-2 hover:bg-paper-2 dark:hover:bg-night-3 rounded-md transition-colors min-h-[44px]"
                  >
                    Annuler
                  </button>
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={isSavingPhoto}
                    className="inline-flex items-center gap-2 px-5 py-2 bg-brand hover:bg-brand-strong text-white text-xs font-semibold uppercase tracking-wider rounded-md shadow-md transition-colors disabled:opacity-50 min-h-[44px]"
                  >
                    {isSavingPhoto && <ArrowPathIcon className="h-4 w-4 animate-spin" />}
                    <span>{isSavingPhoto ? 'Enregistrement...' : 'Enregistrer la photo'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Member Details & Emergency Contact Section */}
        <div className="lg:col-span-7 mt-8 lg:mt-0 space-y-6">
          {/* Identity Card */}
          <div className="rounded-[10px] border border-line bg-white dark:border-night-line dark:bg-night-2 p-6 sm:p-8 shadow-xs space-y-6">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink dark:text-snow">
                {firstName} <span className="text-brand">{lastName}</span>
              </h2>
              <p className="mt-1 text-xs sm:text-sm text-ink-3 dark:text-snow-3">
                Fiche individuelle du coureur et coordonnées de contact.
              </p>
            </div>

            <div className="divide-y divide-paper-2 dark:divide-night-line text-xs sm:text-sm">
              <div className="flex items-center justify-between py-3.5">
                <span className="flex items-center gap-2 font-medium text-ink-2 dark:text-snow-2">
                  <EnvelopeIcon className="h-4 w-4 text-ink-3 dark:text-snow-3" />
                  <span>Adresse Email</span>
                </span>
                <span className="font-semibold text-ink dark:text-snow select-all">{user.email}</span>
              </div>

              <div className="flex items-center justify-between py-3.5">
                <span className="flex items-center gap-2 font-medium text-ink-2 dark:text-snow-2">
                  <PhoneIcon className="h-4 w-4 text-ink-3 dark:text-snow-3" />
                  <span>Téléphone Mobile</span>
                </span>
                <span className="font-semibold text-ink dark:text-snow tabular-nums select-all">
                  {emergencyForm.phone || user.phone || 'Non renseigné'}
                </span>
              </div>
            </div>
          </div>

          {/* ICE Emergency Contact Card */}
          <div className="rounded-[10px] border border-line bg-white dark:border-night-line dark:bg-night-2 p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <ShieldCheckIcon className="h-5 w-5 text-brand" />
                  <h3 className="text-lg font-bold text-ink dark:text-snow">
                    Sécurité Peloton & Contact d&apos;Urgence (ICE)
                  </h3>
                </div>
                <p className="mt-1 text-xs text-ink-3 dark:text-snow-3 leading-relaxed">
                  En cas d&apos;incident sur la route, ces informations permettent aux capitaines de route
                  d&apos;avertir immédiatement vos proches et les services de secours.
                </p>
              </div>
              {!isEditingEmergency && (
                <button
                  type="button"
                  onClick={() => setIsEditingEmergency(true)}
                  className="shrink-0 px-3.5 py-1.5 min-h-[44px] inline-flex items-center justify-center rounded-md border border-line text-xs font-semibold text-ink hover:bg-paper dark:border-night-line dark:text-snow dark:hover:bg-night-3 transition-colors"
                >
                  Modifier
                </button>
              )}
            </div>

            {!hasIce && !isEditingEmergency && (
              <div className="rounded-lg border border-amber-200 bg-amber-50/70 dark:border-amber-800/60 dark:bg-amber-950/30 p-4 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-3">
                <ClockIcon className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-semibold">Aucun contact ICE renseigné</p>
                  <p className="text-amber-800 dark:text-amber-300 leading-relaxed">
                    Pour la sécurité de tous lors des sorties club, merci de renseigner une personne à contacter
                    en cas d&apos;urgence ainsi que votre numéro de GSM.
                  </p>
                  <button
                    type="button"
                    onClick={() => setIsEditingEmergency(true)}
                    className="mt-2 inline-flex items-center text-xs font-bold text-brand underline hover:text-brand-strong"
                  >
                    Renseigner mes coordonnées d&apos;urgence maintenant &rarr;
                  </button>
                </div>
              </div>
            )}

            {isEditingEmergency ? (
              <form onSubmit={handleSaveEmergency} className="space-y-4 pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-ink-2 dark:text-snow-2 mb-1">
                      Votre GSM personnel
                    </label>
                    <input
                      type="tel"
                      value={emergencyForm.phone}
                      onChange={(e) => setEmergencyForm({ ...emergencyForm, phone: e.target.value })}
                      placeholder="+32 470 12 34 56"
                      className="w-full rounded-md border border-line dark:border-night-line dark:bg-night px-3 py-2 text-xs text-ink dark:text-snow placeholder:text-snow-3 dark:placeholder:text-ink-3 focus:border-brand focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-ink-2 dark:text-snow-2 mb-1">
                      Licence FFBC
                    </label>
                    <input
                      type="text"
                      value={emergencyForm.ffbcLicenseNumber}
                      onChange={(e) => setEmergencyForm({ ...emergencyForm, ffbcLicenseNumber: e.target.value })}
                      placeholder="ex: 2026-B-12345"
                      className="w-full rounded-md border border-line dark:border-night-line dark:bg-night px-3 py-2 text-xs text-ink dark:text-snow placeholder:text-snow-3 dark:placeholder:text-ink-3 focus:border-brand focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-ink-2 dark:text-snow-2 mb-1">
                      Allure de peloton préférée
                    </label>
                    <select
                      value={emergencyForm.preferredGroup}
                      onChange={(e) =>
                        setEmergencyForm({
                          ...emergencyForm,
                          preferredGroup: e.target.value as 'A' | 'B' | 'C' | 'VTT',
                        })
                      }
                      className="w-full rounded-md border border-line dark:border-night-line bg-white dark:bg-night px-3 py-2 text-xs text-ink dark:text-snow focus:border-brand focus:outline-hidden"
                    >
                      <option value="A">Groupe A (30-32 km/h)</option>
                      <option value="B">Groupe B (27-29 km/h)</option>
                      <option value="C">Groupe C (24-26 km/h)</option>
                      <option value="VTT">Groupe VTT / Gravel</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                  <div className="sm:col-span-1">
                    <label className="block text-xs font-semibold text-ink-2 dark:text-snow-2 mb-1">
                      Nom du contact ICE *
                    </label>
                    <input
                      type="text"
                      required
                      value={emergencyForm.iceContactName}
                      onChange={(e) => setEmergencyForm({ ...emergencyForm, iceContactName: e.target.value })}
                      placeholder="ex: Marie Dupont"
                      className="w-full rounded-md border border-line dark:border-night-line dark:bg-night px-3 py-2 text-xs text-ink dark:text-snow placeholder:text-snow-3 dark:placeholder:text-ink-3 focus:border-brand focus:outline-hidden"
                    />
                  </div>
                  <div className="sm:col-span-1">
                    <label className="block text-xs font-semibold text-ink-2 dark:text-snow-2 mb-1">
                      Téléphone ICE *
                    </label>
                    <input
                      type="tel"
                      required
                      value={emergencyForm.iceContactPhone}
                      onChange={(e) => setEmergencyForm({ ...emergencyForm, iceContactPhone: e.target.value })}
                      placeholder="+32 470 98 76 54"
                      className="w-full rounded-md border border-line dark:border-night-line dark:bg-night px-3 py-2 text-xs text-ink dark:text-snow placeholder:text-snow-3 dark:placeholder:text-ink-3 focus:border-brand focus:outline-hidden"
                    />
                  </div>
                  <div className="sm:col-span-1">
                    <label className="block text-xs font-semibold text-ink-2 dark:text-snow-2 mb-1">
                      Lien de parenté
                    </label>
                    <input
                      type="text"
                      value={emergencyForm.iceRelationship}
                      onChange={(e) => setEmergencyForm({ ...emergencyForm, iceRelationship: e.target.value })}
                      placeholder="Conjointe, Parent, etc."
                      className="w-full rounded-md border border-line dark:border-night-line dark:bg-night px-3 py-2 text-xs text-ink dark:text-snow placeholder:text-snow-3 dark:placeholder:text-ink-3 focus:border-brand focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2.5 pt-4 border-t border-paper-2 dark:border-night-line">
                  <button
                    type="button"
                    onClick={() => setIsEditingEmergency(false)}
                    disabled={isSavingEmergency}
                    className="px-4 py-2 min-h-[44px] inline-flex items-center justify-center text-xs font-semibold uppercase tracking-wider text-ink-2 dark:text-snow-2 hover:bg-paper-2 dark:hover:bg-night-3 rounded-md transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingEmergency}
                    className="inline-flex items-center justify-center gap-2 px-5 py-2 min-h-[44px] bg-brand hover:bg-brand-strong text-white text-xs font-semibold uppercase tracking-wider rounded-md shadow-xs transition-colors disabled:opacity-50"
                  >
                    {isSavingEmergency && <ArrowPathIcon className="h-4 w-4 animate-spin" />}
                    <span>{isSavingEmergency ? 'Enregistrement...' : 'Valider'}</span>
                  </button>
                </div>
              </form>
            ) : (
              <div className="divide-y divide-paper-2 dark:divide-night-line text-xs sm:text-sm">
                <div className="flex items-center justify-between py-3">
                  <span className="text-ink-3 dark:text-snow-3">Contact ICE</span>
                  <span className="font-semibold text-ink dark:text-snow">
                    {profileData?.iceContactName || '—'}
                  </span>
                </div>
                <div className="flex items-center justify-between py-3">
                  <span className="text-ink-3 dark:text-snow-3">Téléphone d&apos;urgence</span>
                  <span className="font-mono font-semibold text-ink dark:text-snow tabular-nums">
                    {profileData?.iceContactPhone ? (
                      <a href={`tel:${profileData.iceContactPhone}`} className="text-brand hover:underline">
                        {profileData.iceContactPhone}
                      </a>
                    ) : (
                      '—'
                    )}
                  </span>
                </div>
                <div className="flex items-center justify-between py-3">
                  <span className="text-ink-3 dark:text-snow-3">Lien de parenté</span>
                  <span className="text-ink dark:text-snow">{profileData?.iceRelationship || '—'}</span>
                </div>
              </div>
            )}
          </div>

          <div className="rounded-md bg-paper-2 dark:bg-night-3 p-4 text-xs text-ink-3 dark:text-snow-3 leading-relaxed">
            Pour modifier votre adresse email ou vos informations d&apos;adhésion au comité, veuillez contacter le secrétariat du CC Saint-Martin Blanmont.
          </div>
        </div>
      </div>
    </main>
  );
}

