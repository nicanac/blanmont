'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  PhotoIcon,
  PlusIcon,
  TrashIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ArrowPathIcon,
  CheckIcon,
  MapPinIcon,
  CalendarDaysIcon,
  UserGroupIcon,
  ClockIcon,
  TrophyIcon,
  SparklesIcon,
  ArrowUpTrayIcon,
  AdjustmentsHorizontalIcon,
  XMarkIcon,
  MagnifyingGlassPlusIcon,
  MagnifyingGlassMinusIcon,
  ArrowsUpDownIcon,
} from '@heroicons/react/24/outline';
import Cropper from 'react-easy-crop';
import getCroppedImg from '@/app/lib/canvasUtils';
import { toast } from 'sonner';
import { HeroSettings, HeroSlide, HeroTelemetryCard, HeroIconType } from '@/app/types';
import { DEFAULT_HERO_SETTINGS } from '@/app/constants/hero';
import { sanitizeUrl } from '@/app/lib/urlUtils';
import { useImageUpload } from '@/app/hooks/useImageUpload';
import HeroTelemetryFrame from '@/app/components/HeroTelemetryFrame';

const AVAILABLE_ICONS: { type: HeroIconType; label: string; icon: React.ElementType }[] = [
  { type: 'pin', label: 'Lieu / Épingle', icon: MapPinIcon },
  { type: 'calendar', label: 'Calendrier', icon: CalendarDaysIcon },
  { type: 'group', label: 'Peloton / Groupe', icon: UserGroupIcon },
  { type: 'clock', label: 'Horloge', icon: ClockIcon },
  { type: 'trophy', label: 'Trophée', icon: TrophyIcon },
  { type: 'sparkles', label: 'Étoile', icon: SparklesIcon },
];

const readFile = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener('load', () => resolve(reader.result as string), false);
    reader.addEventListener('error', (err) => reject(err));
    reader.readAsDataURL(file);
  });
};

function parseVerticalPosition(position?: string): number {
  if (!position) return 50;
  if (position.includes('top')) return 15;
  if (position.includes('bottom')) return 85;
  if (position === 'center' || position === 'center center') return 50;
  const match = position.match(/(\d+)%/);
  if (match) return parseInt(match[1], 10);
  return 50;
}

export default function AdminHeroPage(): React.ReactElement {
  const [formData, setFormData] = useState<HeroSettings>(DEFAULT_HERO_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [failedThumbnails, setFailedThumbnails] = useState<Record<string, boolean>>({});

  // Upload Hook & file input
  const { uploadImage, isUploading, progress } = useImageUpload();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Direct URL input state
  const [newSlideUrl, setNewSlideUrl] = useState('');
  const [newSlideAlt, setNewSlideAlt] = useState('');

  // Expandable position adjustment panels for each slide
  const [expandedPositionIndex, setExpandedPositionIndex] = useState<number | null>(null);

  // ── Cropper State ──
  const [isCropperOpen, setIsCropperOpen] = useState(false);
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);
  const [cropFileName, setCropFileName] = useState('hero-slide.jpg');
  const [cropTargetIndex, setCropTargetIndex] = useState<number | null>(null); // null = new slide, number = edit existing
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);
  const [isProcessingCrop, setIsProcessingCrop] = useState(false);

  // Fetch current hero settings
  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch('/api/admin/hero');
        if (res.ok) {
          const data = await res.json();
          setFormData(data);
        } else {
          toast.error('Impossible de charger la configuration du hero');
        }
      } catch (err) {
        console.error('Error loading hero settings:', err);
        toast.error('Erreur réseau lors du chargement');
      } finally {
        setIsLoading(false);
      }
    }
    loadSettings();
  }, []);

  // Track modification
  const updateSettings = (updater: (prev: HeroSettings) => HeroSettings) => {
    setFormData((prev) => {
      const next = updater(prev);
      return next;
    });
    setHasChanges(true);
  };

  // Card update handler
  const handleCardChange = (
    index: number,
    field: keyof HeroTelemetryCard,
    value: string
  ) => {
    updateSettings((prev) => {
      const newCards = [...prev.cards];
      newCards[index] = {
        ...newCards[index],
        [field]: value,
      };
      return { ...prev, cards: newCards };
    });
  };

  // Slide reordering
  const moveSlide = (index: number, direction: 'up' | 'down') => {
    updateSettings((prev) => {
      const newSlides = [...prev.slides];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= newSlides.length) return prev;

      const temp = newSlides[index];
      newSlides[index] = newSlides[targetIndex];
      newSlides[targetIndex] = temp;

      return { ...prev, slides: newSlides };
    });
  };

  // Remove slide
  const removeSlide = (index: number) => {
    if (formData.slides.length <= 1) {
      toast.error('Il faut conserver au moins une photo pour le slider.');
      return;
    }
    updateSettings((prev) => {
      const newSlides = prev.slides.filter((_, i) => i !== index);
      return { ...prev, slides: newSlides };
    });
    if (expandedPositionIndex === index) {
      setExpandedPositionIndex(null);
    }
    toast.info('Photo retirée');
  };

  // Add slide by URL
  const handleAddSlideByUrl = () => {
    const cleanUrl = sanitizeUrl(newSlideUrl);
    if (!cleanUrl) {
      toast.error('Veuillez saisir une URL valide.');
      return;
    }
    const newSlide: HeroSlide = {
      id: `slide_${Date.now()}`,
      url: cleanUrl,
      alt: newSlideAlt.trim() || 'Club de Blanmont – peloton cycliste',
      position: 'center center',
    };
    updateSettings((prev) => ({
      ...prev,
      slides: [...prev.slides, newSlide],
    }));
    setNewSlideUrl('');
    setNewSlideAlt('');
    toast.success('Nouvelle image ajoutée au slider');
  };

  // ── Step 1 of Upload: Open Cropper Modal ──
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const dataUrl = await readFile(file);
      setCropImageSrc(dataUrl);
      setCropFileName(file.name);
      setCropTargetIndex(null);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setIsCropperOpen(true);
    } catch {
      toast.error('Impossible de lire le fichier image sélectionné.');
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // ── Re-crop existing slide ──
  const handleOpenRecrop = (index: number) => {
    const targetSlide = formData.slides[index];
    if (!targetSlide) return;

    setCropImageSrc(targetSlide.url);
    setCropFileName(`slide-${index + 1}.jpg`);
    setCropTargetIndex(index);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setIsCropperOpen(true);
  };

  const onCropComplete = useCallback(
    (_croppedArea: unknown, pixelCrop: { x: number; y: number; width: number; height: number }) => {
      setCroppedAreaPixels(pixelCrop);
    },
    []
  );

  // ── Step 2 of Upload: Save Cropped Image & Upload to Cloudinary ──
  const handleConfirmCrop = async () => {
    if (!cropImageSrc || !croppedAreaPixels) return;

    setIsProcessingCrop(true);
    const toastId = toast.loading('Recadrage et téléversement vers le serveur...');

    try {
      const croppedBlob = await getCroppedImg(cropImageSrc, croppedAreaPixels);
      if (!croppedBlob) {
        throw new Error('Échec de la génération du recadrage');
      }

      const date = new Date().toISOString().split('T')[0];
      const cleanBaseName = cropFileName.replace(/[^a-zA-Z0-9.-]/g, '_').replace(/\.[^/.]+$/, '');
      const finalFileName = `${cleanBaseName}-crop.jpg`;
      const uploadPath = `hero/uploads/${date}-${finalFileName}`;

      const file = new File([croppedBlob], finalFileName, { type: 'image/jpeg' });
      const uploadedUrl = await uploadImage(file, uploadPath);

      if (cropTargetIndex === null) {
        // Adding a new slide
        const newSlide: HeroSlide = {
          id: `slide_${Date.now()}`,
          url: uploadedUrl,
          alt: 'Club de Blanmont – peloton cycliste',
          position: 'center center',
        };

        updateSettings((prev) => ({
          ...prev,
          slides: [...prev.slides, newSlide],
        }));
        toast.success('Nouvelle photo recadrée et ajoutée au slider !', { id: toastId });
      } else {
        // Updating existing slide
        updateSettings((prev) => {
          const newSlides = [...prev.slides];
          newSlides[cropTargetIndex] = {
            ...newSlides[cropTargetIndex],
            url: uploadedUrl,
          };
          return { ...prev, slides: newSlides };
        });
        toast.success('Photo recadrée et mise à jour avec succès !', { id: toastId });
      }

      setIsCropperOpen(false);
      setCropImageSrc(null);
    } catch (err: any) {
      console.error('Crop / upload error:', err);
      toast.error(`Erreur: ${err.message || 'Impossible de téléverser'}`, { id: toastId });
    } finally {
      setIsProcessingCrop(false);
    }
  };

  // Adjust slide position preset or slider
  const handleSetSlidePosition = (index: number, newPosition: string) => {
    updateSettings((prev) => {
      const newSlides = [...prev.slides];
      newSlides[index] = {
        ...newSlides[index],
        position: newPosition,
      };
      return { ...prev, slides: newSlides };
    });
  };

  // Reset to default settings
  const handleResetDefaults = () => {
    if (confirm('Voulez-vous rétablir les valeurs et photos initiales d\'origine ?')) {
      setFormData(DEFAULT_HERO_SETTINGS);
      setHasChanges(true);
      toast.info('Paramètres d\'origine restaurés (pensez à enregistrer).');
    }
  };

  // Save changes to server & Firebase
  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/admin/hero', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Erreur lors de la sauvegarde');
      }

      const result = await res.json();
      setFormData(result.settings);
      setHasChanges(false);
      toast.success('Bannière d\'accueil mise à jour avec succès !');
    } catch (err: any) {
      console.error('Save error:', err);
      toast.error(`Erreur: ${err.message || 'Impossible d\'enregistrer'}`);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center space-y-4">
        <ArrowPathIcon className="h-8 w-8 text-[#e03e3e] animate-spin" />
        <p className="text-xs uppercase tracking-widest text-[#7d8493] font-bold">
          Chargement des paramètres du Hero...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-16">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-[#e4e0d8]">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-[#101216] px-3 py-1 text-xs font-bold uppercase tracking-wider text-white mb-2">
            <PhotoIcon className="h-3.5 w-3.5 text-[#e03e3e]" />
            <span>Page d&apos;Accueil</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#101216]">
            Bannière Hero &amp; Télémétrie
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-[#5c6370]">
            Gérez les photos du slider, ajustez précisément leur cadrage et configurez les 4 cartes d&apos;informations sous l&apos;image.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={handleResetDefaults}
            disabled={isSaving}
            className="inline-flex items-center gap-1.5 rounded-md border border-[#e4e0d8] bg-white px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#7d8493] hover:text-[#101216] hover:bg-[#f2efe9] transition-colors"
          >
            <ArrowPathIcon className="h-3.5 w-3.5" />
            <span>Rétablir défaut</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className={`inline-flex items-center gap-2 rounded-md px-6 py-2.5 text-xs font-semibold uppercase tracking-wider text-white transition-all shadow-xs ${
              hasChanges
                ? 'bg-[#e03e3e] hover:bg-[#c93434] ring-2 ring-[#e03e3e]/30'
                : 'bg-[#101216] hover:bg-[#262b38]'
            }`}
          >
            {isSaving ? (
              <>
                <ArrowPathIcon className="h-4 w-4 animate-spin" />
                <span>Enregistrement...</span>
              </>
            ) : (
              <>
                <CheckIcon className="h-4 w-4" />
                <span>{hasChanges ? 'Enregistrer les modifications *' : 'Enregistré'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ── Section 1 : Aperçu en direct ── */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#101216]">
              Aperçu en direct (Rendu public)
            </h2>
          </div>
          <span className="text-xs text-[#7d8493]">
            Le cadrage et les positions s&apos;ajustent en temps réel ci-dessous
          </span>
        </div>

        <div className="rounded-xl border border-[#e4e0d8] bg-[#0a0c10] p-4 sm:p-6 shadow-sm">
          <HeroTelemetryFrame settings={formData} isPreview />
        </div>
      </section>

      {/* ── Section 2 : Gestion du Slider Photo & Cadrage ── */}
      <section className="space-y-6 rounded-lg border border-[#e4e0d8] bg-white p-6 shadow-xs">
        <div className="border-b border-[#e4e0d8] pb-4">
          <h2 className="text-lg font-bold text-[#101216] flex items-center gap-2">
            <PhotoIcon className="h-5 w-5 text-[#e03e3e]" />
            <span>Photos du Slider &amp; Cadrage Panoramique</span>
          </h2>
          <p className="mt-1 text-xs text-[#5c6370]">
            Vous pouvez ajuster l&apos;alignement vertical de chaque photo (pour bien voir les visages ou les vélos) ou utiliser l&apos;outil de recadrage panoramique 21:9.
          </p>
        </div>

        {/* Badge sur la photo */}
        <div className="space-y-1.5 max-w-lg">
          <label className="block text-xs font-bold uppercase tracking-wider text-[#101216]">
            Texte du badge sur l&apos;image
          </label>
          <input
            type="text"
            value={formData.badge}
            onChange={(e) => updateSettings((prev) => ({ ...prev, badge: e.target.value }))}
            placeholder="Peloton CC Saint-Martin · Blanmont"
            className="w-full rounded-md border border-[#e4e0d8] bg-[#faf8f5] px-3.5 py-2 text-xs sm:text-sm text-[#101216] focus:border-[#e03e3e] focus:outline-none transition-colors"
          />
        </div>

        {/* Liste des photos actuelles */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#101216]">
              Photos enregistrées ({formData.slides.length})
            </label>
          </div>

          <div className="space-y-3">
            {formData.slides.map((slide, index) => {
              const currentY = parseVerticalPosition(slide.position);
              const isPanelOpen = expandedPositionIndex === index;

              return (
                <div
                  key={slide.id || index}
                  className="rounded-lg border border-[#e4e0d8] bg-[#faf8f5] overflow-hidden transition-all shadow-xs"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-3.5">
                    {/* Visual thumbnail with current position */}
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="relative h-16 w-28 shrink-0 overflow-hidden rounded-md border border-[#262b38] bg-[#101216]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={failedThumbnails[slide.id || index] ? '/images/home-hero.jpg' : slide.url}
                          alt={slide.alt || 'Slide miniature'}
                          style={{ objectPosition: slide.position || 'center center' }}
                          referrerPolicy="no-referrer"
                          onError={() => {
                            setFailedThumbnails((prev) => ({ ...prev, [slide.id || index]: true }));
                          }}
                          className="h-full w-full object-cover"
                        />
                        <span className="absolute bottom-1 left-1 rounded bg-black/80 px-1.5 py-0.5 text-[9px] font-bold text-white">
                          #{index + 1}
                        </span>
                        <span className="absolute top-1 right-1 rounded bg-[#e03e3e]/90 px-1 py-0.2 text-[8px] font-mono font-bold text-white">
                          {currentY}%
                        </span>
                      </div>

                      <div className="min-w-0 flex-1 space-y-1">
                        <p className="text-xs font-mono text-[#5c6370] truncate max-w-sm sm:max-w-md">
                          {slide.url}
                        </p>
                        <input
                          type="text"
                          value={slide.alt || ''}
                          onChange={(e) => {
                            const newAlt = e.target.value;
                            updateSettings((prev) => {
                              const newSlides = [...prev.slides];
                              newSlides[index] = { ...newSlides[index], alt: newAlt };
                              return { ...prev, slides: newSlides };
                            });
                          }}
                          placeholder="Texte descriptif (alt)..."
                          className="w-full text-xs bg-white border border-[#e4e0d8] rounded px-2 py-1 text-[#101216] focus:border-[#e03e3e] focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Actions: Cadrage / Move Up / Down / Remove */}
                    <div className="flex flex-wrap items-center gap-2 shrink-0 self-end sm:self-center">
                      <button
                        type="button"
                        onClick={() => setExpandedPositionIndex(isPanelOpen ? null : index)}
                        className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors border ${
                          isPanelOpen
                            ? 'bg-[#101216] text-white border-[#101216]'
                            : 'bg-white text-[#101216] border-[#e4e0d8] hover:bg-[#f2efe9]'
                        }`}
                        title="Ajuster l'alignement et le cadrage"
                      >
                        <AdjustmentsHorizontalIcon className="h-4 w-4 text-[#e03e3e]" />
                        <span>Ajuster cadrage</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => moveSlide(index, 'up')}
                        disabled={index === 0}
                        className="rounded p-1.5 text-[#7d8493] hover:bg-white hover:text-[#101216] disabled:opacity-30 disabled:pointer-events-none transition-colors border border-transparent hover:border-[#e4e0d8]"
                        title="Monter"
                      >
                        <ArrowUpIcon className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveSlide(index, 'down')}
                        disabled={index === formData.slides.length - 1}
                        className="rounded p-1.5 text-[#7d8493] hover:bg-white hover:text-[#101216] disabled:opacity-30 disabled:pointer-events-none transition-colors border border-transparent hover:border-[#e4e0d8]"
                        title="Descendre"
                      >
                        <ArrowDownIcon className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeSlide(index)}
                        className="rounded p-1.5 text-[#7d8493] hover:bg-rose-50 hover:text-rose-600 transition-colors border border-transparent hover:border-rose-200"
                        title="Supprimer cette photo"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* ── Slide Framing & Alignment Adjustment Panel ── */}
                  {isPanelOpen && (
                    <div className="border-t border-[#e4e0d8] bg-white p-4 space-y-4 animate-in slide-in-from-top-2">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="space-y-0.5">
                          <p className="text-xs font-bold uppercase tracking-wider text-[#101216] flex items-center gap-1.5">
                            <ArrowsUpDownIcon className="h-3.5 w-3.5 text-[#e03e3e]" />
                            <span>Alignement vertical dans le slider</span>
                          </p>
                          <p className="text-[11px] text-[#7d8493]">
                            Choisissez une zone de focalisation rapide ou déplacez le curseur pour centrer au millimètre.
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleOpenRecrop(index)}
                          className="inline-flex items-center gap-1.5 rounded-md bg-[#faf8f5] hover:bg-[#efece5] border border-[#e4e0d8] px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-[#101216] transition-colors"
                        >
                          <PhotoIcon className="h-3.5 w-3.5 text-[#e03e3e]" />
                          <span>Ouvrir l&apos;outil de recadrage visuel 21:9</span>
                        </button>
                      </div>

                      {/* Presets Row */}
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-semibold text-[#5c6370]">Préréglages :</span>
                        <button
                          type="button"
                          onClick={() => handleSetSlidePosition(index, 'center 15%')}
                          className={`rounded px-3 py-1 text-xs font-semibold uppercase tracking-wider border transition-colors ${
                            currentY <= 25
                              ? 'bg-[#e03e3e] text-white border-[#e03e3e]'
                              : 'bg-white text-[#101216] border-[#e4e0d8] hover:bg-[#f2efe9]'
                          }`}
                        >
                          Haut (Têtes / Visages)
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSetSlidePosition(index, 'center center')}
                          className={`rounded px-3 py-1 text-xs font-semibold uppercase tracking-wider border transition-colors ${
                            currentY > 25 && currentY < 75
                              ? 'bg-[#101216] text-white border-[#101216]'
                              : 'bg-white text-[#101216] border-[#e4e0d8] hover:bg-[#f2efe9]'
                          }`}
                        >
                          Centre (Standard)
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSetSlidePosition(index, 'center 85%')}
                          className={`rounded px-3 py-1 text-xs font-semibold uppercase tracking-wider border transition-colors ${
                            currentY >= 75
                              ? 'bg-[#e03e3e] text-white border-[#e03e3e]'
                              : 'bg-white text-[#101216] border-[#e4e0d8] hover:bg-[#f2efe9]'
                          }`}
                        >
                          Bas (Vélos / Route)
                        </button>
                      </div>

                      {/* Slider Control */}
                      <div className="space-y-1.5 pt-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-[#101216]">
                            Ajustement fin de la hauteur : <strong className="text-[#e03e3e]">{currentY}%</strong>
                          </span>
                          <span className="text-[11px] text-[#7d8493]">
                            0% = Haut extrême · 100% = Bas extrême
                          </span>
                        </div>
                        <input
                          type="range"
                          min={0}
                          max={100}
                          step={1}
                          value={currentY}
                          onChange={(e) => handleSetSlidePosition(index, `center ${e.target.value}%`)}
                          className="w-full accent-[#e03e3e] cursor-pointer"
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Ajouter une nouvelle photo */}
        <div className="pt-4 border-t border-[#e4e0d8] grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Option A: Téléversement avec Cadrage Assisté */}
          <div className="p-4 rounded-lg border border-dashed border-[#e03e3e]/40 bg-[#e03e3e]/[0.02] flex flex-col justify-between space-y-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[#101216] flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-[#e03e3e]" />
                Option 1 : Téléverser avec cadrage interactif
              </p>
              <p className="text-xs text-[#7d8493] mt-1">
                Choisissez une photo : une fenêtre de recadrage au ratio panoramique 21:9 s&apos;ouvrira pour vous permettre de zoomer et positionner idéalement l&apos;image avant l&apos;envoi.
              </p>
            </div>

            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                disabled={isUploading}
                className="hidden"
                id="hero-file-upload"
              />
              <label
                htmlFor="hero-file-upload"
                className={`inline-flex items-center justify-center gap-2 rounded-md bg-[#e03e3e] hover:bg-[#c93434] text-white px-4 py-2.5 text-xs font-semibold uppercase tracking-wider cursor-pointer transition-colors w-full shadow-xs ${
                  isUploading ? 'opacity-60 pointer-events-none' : ''
                }`}
              >
                {isUploading ? (
                  <>
                    <ArrowPathIcon className="h-4 w-4 animate-spin text-white" />
                    <span>Téléversement en cours ({progress}%)...</span>
                  </>
                ) : (
                  <>
                    <ArrowUpTrayIcon className="h-4 w-4 text-white" />
                    <span>Choisir une image &amp; Ajuster le cadrage</span>
                  </>
                )}
              </label>
            </div>
          </div>

          {/* Option B: Lien URL direct */}
          <div className="p-4 rounded-lg border border-[#e4e0d8] bg-[#faf8f5] flex flex-col justify-between space-y-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[#101216]">
                Option 2 : Ajouter via une URL d&apos;image
              </p>
              <p className="text-xs text-[#7d8493] mt-1">
                Collez l&apos;adresse web directe d&apos;une image (ex. https://... ou /images/...).
              </p>
            </div>

            <div className="space-y-2">
              <input
                type="text"
                placeholder="https://mon-image.jpg ou /images/photo.jpg"
                value={newSlideUrl}
                onChange={(e) => setNewSlideUrl(e.target.value)}
                className="w-full rounded border border-[#e4e0d8] bg-white px-3 py-1.5 text-xs text-[#101216] focus:border-[#e03e3e] focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddSlideByUrl}
                className="inline-flex items-center justify-center gap-2 rounded-md bg-white border border-[#e4e0d8] hover:bg-[#f2efe9] text-[#101216] px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-colors w-full"
              >
                <PlusIcon className="h-4 w-4 text-[#e03e3e]" />
                <span>Ajouter cette URL</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Section 3 : Les 4 Cartes d'Information Télémétriques ── */}
      <section className="space-y-6 rounded-lg border border-[#e4e0d8] bg-white p-6 shadow-xs">
        <div className="border-b border-[#e4e0d8] pb-4">
          <h2 className="text-lg font-bold text-[#101216] flex items-center gap-2">
            <CalendarDaysIcon className="h-5 w-5 text-[#e03e3e]" />
            <span>Informations sous l&apos;image (4 Blocs Télémétriques)</span>
          </h2>
          <p className="mt-1 text-xs text-[#5c6370]">
            Modifiez le lieu de rassemblement, les horaires du samedi et dimanche, ainsi que les allures.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {formData.cards.map((card, index) => (
            <div
              key={card.id || index}
              className="rounded-lg border border-[#e4e0d8] bg-[#faf8f5] p-4 flex flex-col justify-between space-y-4 shadow-xs"
            >
              {/* Header card indicator */}
              <div className="flex items-center justify-between border-b border-[#e4e0d8] pb-2.5">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#7d8493]">
                  <span className="h-2 w-2 rounded-full bg-[#e03e3e]" />
                  Bloc #{index + 1}
                </span>

                {/* Selected icon badge */}
                <div className="flex items-center gap-1 text-xs text-[#101216]">
                  {renderCardIcon(card.icon)}
                </div>
              </div>

              {/* Icon Selector */}
              <div className="space-y-1">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#5c6370]">
                  Icône
                </label>
                <select
                  value={card.icon}
                  onChange={(e) => handleCardChange(index, 'icon', e.target.value as HeroIconType)}
                  className="w-full rounded border border-[#e4e0d8] bg-white px-2.5 py-1.5 text-xs text-[#101216] focus:border-[#e03e3e] focus:outline-none"
                >
                  {AVAILABLE_ICONS.map((item) => (
                    <option key={item.type} value={item.type}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Label Field */}
              <div className="space-y-1">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#5c6370]">
                  Titre / Libellé
                </label>
                <input
                  type="text"
                  value={card.label}
                  onChange={(e) => handleCardChange(index, 'label', e.target.value)}
                  placeholder="ex: Rassemblement, Samedi..."
                  className="w-full rounded border border-[#e4e0d8] bg-white px-2.5 py-1.5 text-xs font-semibold uppercase text-[#101216] focus:border-[#e03e3e] focus:outline-none"
                />
              </div>

              {/* Main Value Field */}
              <div className="space-y-1">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#5c6370]">
                  Valeur Principale (Heure ou Lieu)
                </label>
                <input
                  type="text"
                  value={card.value}
                  onChange={(e) => handleCardChange(index, 'value', e.target.value)}
                  placeholder="ex: Place de Blanmont, 8h30..."
                  className="w-full rounded border border-[#e4e0d8] bg-white px-2.5 py-1.5 text-xs font-bold text-[#101216] focus:border-[#e03e3e] focus:outline-none"
                />
              </div>

              {/* Detail / Suffix Field */}
              <div className="space-y-1">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#5c6370]">
                  Détail additionnel (optionnel)
                </label>
                <input
                  type="text"
                  value={card.detail || ''}
                  onChange={(e) => handleCardChange(index, 'detail', e.target.value)}
                  placeholder="ex: · Route, · Route & VTT..."
                  className="w-full rounded border border-[#e4e0d8] bg-white px-2.5 py-1.5 text-xs text-[#5c6370] focus:border-[#e03e3e] focus:outline-none"
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Visual 21:9 Pan & Crop Modal ── */}
      {isCropperOpen && cropImageSrc && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 sm:p-6"
        >
          <div className="bg-[#101216] border border-[#262b38] rounded-xl overflow-hidden w-full max-w-4xl shadow-2xl animate-in zoom-in-95 flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-[#262b38] flex items-center justify-between bg-[#0a0c10]">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-md bg-[#e03e3e]/20 border border-[#e03e3e]/40 flex items-center justify-center text-[#e03e3e]">
                  <AdjustmentsHorizontalIcon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-white uppercase tracking-wider">
                    Ajuster le cadrage de la photo
                  </h3>
                  <p className="text-xs text-[#a7adbb]">
                    Format panoramique bannière (21:9) · Déplacez et zoomez pour placer le sujet
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsCropperOpen(false);
                  setCropImageSrc(null);
                }}
                disabled={isProcessingCrop}
                className="rounded-md p-1.5 text-[#7d8493] hover:text-white hover:bg-white/10 transition-colors"
                title="Fermer"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            {/* Cropper Viewport */}
            <div className="relative h-[340px] sm:h-[420px] w-full bg-[#050608]">
              <Cropper
                image={cropImageSrc}
                crop={crop}
                zoom={zoom}
                aspect={21 / 9}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
              />
            </div>

            {/* Modal Controls & Actions */}
            <div className="p-4 sm:p-5 bg-[#161922] border-t border-[#262b38] space-y-4">
              {/* Zoom Control Bar */}
              <div className="flex items-center gap-4">
                <span className="text-xs font-bold uppercase tracking-wider text-[#a7adbb] shrink-0">
                  Niveau de Zoom :
                </span>
                <button
                  type="button"
                  onClick={() => setZoom((z) => Math.max(1, z - 0.1))}
                  className="p-1 rounded text-[#a7adbb] hover:text-white hover:bg-white/10 transition-colors"
                  title="Zoom arrière"
                >
                  <MagnifyingGlassMinusIcon className="h-4 w-4" />
                </button>
                <input
                  type="range"
                  min={1}
                  max={3}
                  step={0.05}
                  value={zoom}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="w-full accent-[#e03e3e] cursor-pointer"
                />
                <button
                  type="button"
                  onClick={() => setZoom((z) => Math.min(3, z + 0.1))}
                  className="p-1 rounded text-[#a7adbb] hover:text-white hover:bg-white/10 transition-colors"
                  title="Zoom avant"
                >
                  <MagnifyingGlassPlusIcon className="h-4 w-4" />
                </button>
                <span className="text-xs font-mono text-white shrink-0 w-12 text-right">
                  {zoom.toFixed(1)}x
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#262b38]">
                <p className="text-[11px] text-[#7d8493]">
                  Astuce : Vous pouvez également glisser directement l&apos;image à la souris ou au doigt.
                </p>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setIsCropperOpen(false);
                      setCropImageSrc(null);
                    }}
                    disabled={isProcessingCrop}
                    className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-[#a7adbb] hover:text-white hover:bg-white/5 rounded-md transition-colors min-h-[40px]"
                  >
                    Annuler
                  </button>

                  <button
                    type="button"
                    onClick={handleConfirmCrop}
                    disabled={isProcessingCrop}
                    className="inline-flex items-center gap-2 px-6 py-2 bg-[#e03e3e] hover:bg-[#c93434] text-white text-xs font-bold uppercase tracking-wider rounded-md shadow-lg shadow-[#e03e3e]/25 transition-colors disabled:opacity-50 min-h-[40px]"
                  >
                    {isProcessingCrop && <ArrowPathIcon className="h-4 w-4 animate-spin" />}
                    <span>{isProcessingCrop ? 'Envoi...' : 'Valider ce cadrage & Importer'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Save Bar if changes exist */}
      {hasChanges && (
        <div className="fixed bottom-6 right-6 z-40 flex items-center gap-3 rounded-lg border border-[#e03e3e] bg-[#101216] p-4 text-white shadow-2xl animate-bounce-short">
          <div className="space-y-0.5">
            <p className="text-xs font-bold uppercase tracking-wider text-white">
              Modifications non enregistrées
            </p>
            <p className="text-[11px] text-[#a7adbb]">
              Cliquez pour publier instantanément sur le site.
            </p>
          </div>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="rounded-md bg-[#e03e3e] hover:bg-[#c93434] px-4 py-2 text-xs font-bold uppercase tracking-wider text-white transition-colors"
          >
            {isSaving ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>
      )}
    </div>
  );
}

function renderCardIcon(type: HeroIconType) {
  const iconClass = 'h-4 w-4';
  switch (type) {
    case 'pin':
      return <MapPinIcon className={`${iconClass} text-[#e03e3e]`} />;
    case 'calendar':
      return <CalendarDaysIcon className={`${iconClass} text-[#e03e3e]`} />;
    case 'group':
      return <UserGroupIcon className={`${iconClass} text-[#e03e3e]`} />;
    case 'clock':
      return <ClockIcon className={`${iconClass} text-[#e03e3e]`} />;
    case 'trophy':
      return <TrophyIcon className={`${iconClass} text-[#e03e3e]`} />;
    case 'sparkles':
      return <SparklesIcon className={`${iconClass} text-[#e03e3e]`} />;
    default:
      return <MapPinIcon className={`${iconClass} text-[#e03e3e]`} />;
  }
}
