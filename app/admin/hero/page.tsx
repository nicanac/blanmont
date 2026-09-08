'use client';

import React, { useState, useEffect, useRef } from 'react';
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
} from '@heroicons/react/24/outline';
import { toast } from 'sonner';
import { HeroSettings, HeroSlide, HeroTelemetryCard, HeroIconType } from '@/app/types';
import { DEFAULT_HERO_SETTINGS } from '@/app/constants/hero';
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

export default function AdminHeroPage(): React.ReactElement {
  const [formData, setFormData] = useState<HeroSettings>(DEFAULT_HERO_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Image Upload Hook
  const { uploadImage, isUploading, progress } = useImageUpload();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Direct URL input state for adding a slide
  const [newSlideUrl, setNewSlideUrl] = useState('');
  const [newSlideAlt, setNewSlideAlt] = useState('');

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
    toast.info('Photo retirée');
  };

  // Add slide by URL
  const handleAddSlideByUrl = () => {
    if (!newSlideUrl.trim()) {
      toast.error('Veuillez saisir une URL valide.');
      return;
    }
    const newSlide: HeroSlide = {
      id: `slide_${Date.now()}`,
      url: newSlideUrl.trim(),
      alt: newSlideAlt.trim() || 'Club de Blanmont – peloton cycliste',
    };
    updateSettings((prev) => ({
      ...prev,
      slides: [...prev.slides, newSlide],
    }));
    setNewSlideUrl('');
    setNewSlideAlt('');
    toast.success('Nouvelle image ajoutée au slider');
  };

  // Upload image handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const date = new Date().toISOString().split('T')[0];
      const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const uploadPath = `hero/uploads/${date}-${cleanName}`;

      const uploadedUrl = await uploadImage(file, uploadPath);

      const newSlide: HeroSlide = {
        id: `slide_${Date.now()}`,
        url: uploadedUrl,
        alt: 'Club de Blanmont – peloton cycliste',
      };

      updateSettings((prev) => ({
        ...prev,
        slides: [...prev.slides, newSlide],
      }));

      toast.success('Image importée et ajoutée au slider avec succès !');
    } catch (err: any) {
      console.error('Upload failed:', err);
      toast.error(`Échec du téléversement: ${err.message || err}`);
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
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
            Gérez les photos du slider principal et les 4 cartes d&apos;informations affichées sous l&apos;image.
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
            Exactement comme les visiteurs le voient sur blanmont.vercel.app
          </span>
        </div>

        <div className="rounded-xl border border-[#e4e0d8] bg-[#0a0c10] p-4 sm:p-6 shadow-sm">
          <HeroTelemetryFrame settings={formData} isPreview />
        </div>
      </section>

      {/* ── Section 2 : Gestion du Slider Photo & Badge ── */}
      <section className="space-y-6 rounded-lg border border-[#e4e0d8] bg-white p-6 shadow-xs">
        <div className="border-b border-[#e4e0d8] pb-4">
          <h2 className="text-lg font-bold text-[#101216] flex items-center gap-2">
            <PhotoIcon className="h-5 w-5 text-[#e03e3e]" />
            <span>Photos du Slider &amp; Badge</span>
          </h2>
          <p className="mt-1 text-xs text-[#5c6370]">
            Si une seule photo est présente, elle s&apos;affiche de façon fixe. Si plusieurs photos sont ajoutées, elles alternent automatiquement toutes les 6 secondes avec une transition douce.
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
            {formData.slides.map((slide, index) => (
              <div
                key={slide.id || index}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-3.5 rounded-lg border border-[#e4e0d8] bg-[#faf8f5]"
              >
                {/* Visual thumbnail */}
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="relative h-14 w-24 shrink-0 overflow-hidden rounded-md border border-[#262b38] bg-[#101216]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={slide.url}
                      alt={slide.alt || 'Slide miniature'}
                      className="h-full w-full object-cover"
                    />
                    <span className="absolute bottom-1 left-1 rounded bg-black/80 px-1.5 py-0.5 text-[9px] font-bold text-white">
                      #{index + 1}
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

                {/* Actions: Move Up / Down / Remove */}
                <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                  <button
                    type="button"
                    onClick={() => moveSlide(index, 'up')}
                    disabled={index === 0}
                    className="rounded p-1.5 text-[#7d8493] hover:bg-white hover:text-[#101216] disabled:opacity-30 disabled:pointer-events-none transition-colors"
                    title="Monter"
                  >
                    <ArrowUpIcon className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveSlide(index, 'down')}
                    disabled={index === formData.slides.length - 1}
                    className="rounded p-1.5 text-[#7d8493] hover:bg-white hover:text-[#101216] disabled:opacity-30 disabled:pointer-events-none transition-colors"
                    title="Descendre"
                  >
                    <ArrowDownIcon className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeSlide(index)}
                    className="rounded p-1.5 text-[#7d8493] hover:bg-rose-50 hover:text-rose-600 transition-colors"
                    title="Supprimer cette photo"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Ajouter une nouvelle photo */}
        <div className="pt-4 border-t border-[#e4e0d8] grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Option A: Téléversement Cloudinary */}
          <div className="p-4 rounded-lg border border-dashed border-[#e03e3e]/40 bg-[#e03e3e]/[0.02] flex flex-col justify-between space-y-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[#101216]">
                Option 1 : Téléverser une nouvelle photo
              </p>
              <p className="text-xs text-[#7d8493] mt-1">
                Optimisé pour le format paysage (ex. 16:9 ou 21:9). Téléchargement automatique vers Cloudinary.
              </p>
            </div>

            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                disabled={isUploading}
                className="hidden"
                id="hero-file-upload"
              />
              <label
                htmlFor="hero-file-upload"
                className={`inline-flex items-center justify-center gap-2 rounded-md bg-[#101216] hover:bg-[#262b38] text-white px-4 py-2.5 text-xs font-semibold uppercase tracking-wider cursor-pointer transition-colors w-full ${
                  isUploading ? 'opacity-60 pointer-events-none' : ''
                }`}
              >
                {isUploading ? (
                  <>
                    <ArrowPathIcon className="h-4 w-4 animate-spin text-[#e03e3e]" />
                    <span>Téléversement en cours ({progress}%)...</span>
                  </>
                ) : (
                  <>
                    <ArrowUpTrayIcon className="h-4 w-4 text-[#e03e3e]" />
                    <span>Choisir une image sur mon appareil</span>
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
