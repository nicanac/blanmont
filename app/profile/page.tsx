'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { updateProfilePhotoAction } from '../actions';
import Cropper from 'react-easy-crop';
import getCroppedImg from '../lib/canvasUtils';
import { PageHero } from '../components/ui/PageHero';
import { UserCircleIcon, CameraIcon, EnvelopeIcon, PhoneIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { toast } from 'sonner';

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

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-[#faf8f5] flex items-center justify-center p-8">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#e4e0d8] border-t-[#e03e3e]" />
      </div>
    );
  }

  const nameParts = user.name.split(' ');
  const firstName = nameParts[0];
  const lastName = nameParts.slice(1).join(' ');
  const initials = getInitials(user.name);
  const hasPhoto = Boolean(user.avatarUrl) && !imgError;

  return (
    <main className="min-h-screen bg-[#faf8f5]">
      <PageHero
        title={
          <>
            Mon Profil <span className="text-[#e03e3e] italic">Membre</span>
          </>
        }
        description="Gérez vos coordonnées personnelles, votre photo de profil et vos accès au Club."
        badge="Espace Peloton"
        badgeIcon={<UserCircleIcon className="h-4 w-4" />}
        variant="red"
        size="md"
        watermark="MEMBRE"
      />
      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:grid lg:max-w-7xl lg:grid-cols-12 lg:gap-x-12 lg:px-8">
        {/* User Avatar Card */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-lg border border-[#e4e0d8] bg-white p-6 shadow-xs space-y-4">
            <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-[#161922] group border border-[#e4e0d8]">
              {hasPhoto ? (
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  onError={() => setImgError(true)}
                  className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="h-full w-full bg-gradient-to-br from-[#161922] via-[#242938] to-[#0a0c10] flex flex-col items-center justify-center text-center p-6 select-none">
                  <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white/10 border border-white/20 text-3xl font-extrabold text-white">
                    {initials}
                  </div>
                  <span className="mt-3 text-xs font-semibold uppercase tracking-wider text-[#a7adbb]">
                    CC Saint-Martin Blanmont
                  </span>
                </div>
              )}

              {/* Photo Change Action Overlay */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-4">
                <label className="inline-flex items-center gap-2 rounded-md bg-white px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#101216] hover:bg-[#f2efe9] cursor-pointer transition-colors shadow-md">
                  <CameraIcon className="h-4 w-4 text-[#e03e3e]" />
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

            <div className="text-center space-y-1">
              <span className="inline-flex items-center rounded-full bg-[#e03e3e]/10 text-[#e03e3e] px-3 py-0.5 text-xs font-bold uppercase tracking-wider">
                {user.role ? (Array.isArray(user.role) ? user.role.join(', ') : user.role) : 'Membre actif'}
              </span>
              <p className="text-xs text-[#7d8493]">
                Membre du Club Cyclo Saint-Martin de Blanmont
              </p>
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
            <div className="bg-white rounded-lg border border-[#e4e0d8] overflow-hidden w-full max-w-md shadow-2xl animate-in zoom-in-95">
              <div className="p-4 border-b border-[#efece5] flex items-center justify-between">
                <h3 className="text-sm font-bold text-[#101216] uppercase tracking-wider">
                  Recadrer votre photo
                </h3>
                <span className="text-xs text-[#5c6370]">Format carré 1:1</span>
              </div>

              <div className="relative h-80 w-full bg-[#0a0c10]">
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

              <div className="p-5 flex flex-col gap-4 bg-white">
                <div className="space-y-1">
                  <label htmlFor="zoom-range" className="text-xs font-bold uppercase tracking-wider text-[#3a3f4a]">
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
                    className="w-full accent-[#e03e3e]"
                  />
                </div>

                <div className="flex justify-end gap-2.5 pt-2 border-t border-[#efece5]">
                  <button
                    type="button"
                    onClick={handleCancel}
                    disabled={isSavingPhoto}
                    className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-[#3a3f4a] hover:bg-[#f2efe9] rounded-md transition-colors min-h-[44px]"
                  >
                    Annuler
                  </button>
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={isSavingPhoto}
                    className="inline-flex items-center gap-2 px-5 py-2 bg-[#e03e3e] hover:bg-[#c93434] text-white text-xs font-semibold uppercase tracking-wider rounded-md shadow-md transition-colors disabled:opacity-50 min-h-[44px]"
                  >
                    {isSavingPhoto && <ArrowPathIcon className="h-4 w-4 animate-spin" />}
                    <span>{isSavingPhoto ? 'Enregistrement...' : 'Enregistrer la photo'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Product Info / User Details */}
        <div className="lg:col-span-7 mt-8 lg:mt-0 space-y-6">
          <div className="rounded-lg border border-[#e4e0d8] bg-white p-6 sm:p-8 shadow-xs space-y-6">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#101216]">
                {firstName} <span className="text-[#e03e3e]">{lastName}</span>
              </h2>
              <p className="mt-1 text-xs sm:text-sm text-[#5c6370]">
                Fiche individuelle du coureur et coordonnées de contact.
              </p>
            </div>

            <div className="divide-y divide-[#efece5] text-xs sm:text-sm">
              <div className="flex items-center justify-between py-3.5">
                <span className="flex items-center gap-2 font-medium text-[#3a3f4a]">
                  <EnvelopeIcon className="h-4 w-4 text-[#7d8493]" />
                  <span>Adresse Email</span>
                </span>
                <span className="font-semibold text-[#101216] select-all">{user.email}</span>
              </div>

              {user.phone && (
                <div className="flex items-center justify-between py-3.5">
                  <span className="flex items-center gap-2 font-medium text-[#3a3f4a]">
                    <PhoneIcon className="h-4 w-4 text-[#7d8493]" />
                    <span>Téléphone Mobile</span>
                  </span>
                  <span className="font-semibold text-[#101216] tabular-nums select-all">{user.phone}</span>
                </div>
              )}
            </div>

            <div className="rounded-md bg-[#f2efe9] p-4 text-xs text-[#5c6370] leading-relaxed">
              Pour modifier votre adresse email ou vos informations d&apos;adhésion, veuillez contacter le secrétariat du club ou un membre du comité.
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
