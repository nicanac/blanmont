'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import Image from 'next/image';
import type { PhotoAlbum } from '../types';
import {
  CameraIcon,
  ArrowTopRightOnSquareIcon,
  SparklesIcon,
  XMarkIcon,
  CalendarDaysIcon,
  MagnifyingGlassIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  FunnelIcon,
  TagIcon,
  ArrowsUpDownIcon,
  PhotoIcon,
} from '@heroicons/react/24/outline';

interface GalleryViewProps {
  initialAlbums: PhotoAlbum[];
}

const PAGE_SIZE = 18;

export default function GalleryView({ initialAlbums }: GalleryViewProps): React.ReactElement {
  const [selectedYear, setSelectedYear] = useState<number | 'all'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'recent' | 'oldest' | 'photos'>('recent');
  const [visibleCount, setVisibleCount] = useState<number>(PAGE_SIZE);

  // Active album for detail modal (planche contact)
  const [activeModalAlbum, setActiveModalAlbum] = useState<PhotoAlbum | null>(null);

  // Fullscreen lightbox state: index inside activeModalAlbum.images
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Handlers that reset pagination on filter change
  const handleSelectYear = (yr: number | 'all'): void => {
    setSelectedYear(yr);
    setVisibleCount(PAGE_SIZE);
  };

  const handleSelectCategory = (cat: string): void => {
    setSelectedCategory(cat);
    setVisibleCount(PAGE_SIZE);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setSearchQuery(e.target.value);
    setVisibleCount(PAGE_SIZE);
  };

  const handleResetFilters = (): void => {
    setSelectedYear('all');
    setSelectedCategory('all');
    setSearchQuery('');
    setVisibleCount(PAGE_SIZE);
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    setSortBy(e.target.value as 'recent' | 'oldest' | 'photos');
    setVisibleCount(PAGE_SIZE);
  };

  // Unique seasons present in albums
  const years = useMemo(() => {
    const set = new Set<number>();
    initialAlbums.forEach((a) => set.add(a.year));
    return Array.from(set).sort((a, b) => b - a);
  }, [initialAlbums]);

  // Overall statistics
  const stats = useMemo(() => {
    const totalPhotos = initialAlbums.reduce((acc, a) => acc + (a.photoCount || 0), 0);
    const featuredCount = initialAlbums.filter((a) => a.featured).length;
    return {
      totalAlbums: initialAlbums.length,
      totalPhotos,
      seasonsCount: years.length,
      featuredCount,
    };
  }, [initialAlbums, years]);

  const categories = ['all', 'Sorties', 'Ardennes & Stages', 'Événements', 'Équipements'] as const;

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {
      all: initialAlbums.length,
      Sorties: 0,
      'Ardennes & Stages': 0,
      'Événements': 0,
      'Équipements': 0,
    };
    initialAlbums.forEach((a) => {
      if (counts[a.category] !== undefined) {
        counts[a.category]++;
      }
    });
    return counts;
  }, [initialAlbums]);

  // Filter and sort albums
  const filteredAlbums = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    const filtered = initialAlbums.filter((album) => {
      if (selectedYear !== 'all' && album.year !== selectedYear) return false;
      if (selectedCategory !== 'all' && album.category !== selectedCategory) return false;

      if (query) {
        const titleMatch = album.title.toLowerCase().includes(query);
        const descMatch = album.description?.toLowerCase().includes(query);
        const yearMatch = album.year.toString().includes(query);
        const catMatch = album.category.toLowerCase().includes(query);
        if (!titleMatch && !descMatch && !yearMatch && !catMatch) return false;
      }

      return true;
    });

    return filtered.sort((a, b) => {
      if (sortBy === 'recent') {
        return b.createdAt.localeCompare(a.createdAt);
      }
      if (sortBy === 'oldest') {
        return a.createdAt.localeCompare(b.createdAt);
      }
      if (sortBy === 'photos') {
        return (b.photoCount || 0) - (a.photoCount || 0);
      }
      return 0;
    });
  }, [initialAlbums, selectedYear, selectedCategory, searchQuery, sortBy]);

  // Visible subset for progressive rendering
  const visibleAlbums = useMemo(() => {
    return filteredAlbums.slice(0, visibleCount);
  }, [filteredAlbums, visibleCount]);

  const hasMore = visibleCount < filteredAlbums.length;

  const handleLoadMore = (): void => {
    setVisibleCount((prev) => Math.min(prev + PAGE_SIZE, filteredAlbums.length));
  };

  // Keyboard navigation for Lightbox
  const handlePrevPhoto = useCallback((): void => {
    if (!activeModalAlbum?.images?.length || lightboxIndex === null) return;
    setLightboxIndex((prev) =>
      prev! > 0 ? prev! - 1 : activeModalAlbum.images!.length - 1
    );
  }, [activeModalAlbum, lightboxIndex]);

  const handleNextPhoto = useCallback((): void => {
    if (!activeModalAlbum?.images?.length || lightboxIndex === null) return;
    setLightboxIndex((prev) =>
      prev! < activeModalAlbum.images!.length - 1 ? prev! + 1 : 0
    );
  }, [activeModalAlbum, lightboxIndex]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent): void => {
      if (lightboxIndex !== null) {
        if (e.key === 'Escape') {
          setLightboxIndex(null);
        } else if (e.key === 'ArrowLeft') {
          handlePrevPhoto();
        } else if (e.key === 'ArrowRight') {
          handleNextPhoto();
        }
      } else if (activeModalAlbum !== null && e.key === 'Escape') {
        setActiveModalAlbum(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxIndex, activeModalAlbum, handlePrevPhoto, handleNextPhoto]);

  // Lock body scroll when modal or lightbox is open
  useEffect(() => {
    if (activeModalAlbum || lightboxIndex !== null) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [activeModalAlbum, lightboxIndex]);

  const activeImages = activeModalAlbum?.images || (activeModalAlbum?.coverUrl ? [activeModalAlbum.coverUrl] : []);

  return (
    <div className="space-y-8">
      {/* ── Cadre Géodésique & Télémétrie de la Feuille ── */}
      <section
        aria-label="Télémétrie photographique"
        className="relative corner-ticks rounded-sm border border-line bg-white dark:border-night-line dark:bg-night-2 p-5 sm:p-6 dark:[--tick:var(--color-snow-3)]"
      >
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 divide-y sm:divide-y-0 sm:divide-x divide-line dark:divide-night-line">
          <div className="space-y-1">
            <span className="font-narrow text-xs font-bold uppercase tracking-[0.08em] text-ink-3 dark:text-snow-3 flex items-center gap-1.5">
              <CameraIcon className="size-3.5 text-brand-vif shrink-0" aria-hidden="true" />
              Clichés numérisés
            </span>
            <p className="font-narrow text-2xl sm:text-3xl font-extrabold tabular-nums text-ink dark:text-snow">
              {stats.totalPhotos.toLocaleString('fr-BE')}
            </p>
            <p className="font-narrow text-[11px] font-bold uppercase tracking-wider text-ink-3 dark:text-snow-3">
              Fonds photographique
            </p>
          </div>

          <div className="space-y-1 sm:pl-6 pt-4 sm:pt-0">
            <span className="font-narrow text-xs font-bold uppercase tracking-[0.08em] text-ink-3 dark:text-snow-3 flex items-center gap-1.5">
              <PhotoIcon className="size-3.5 text-ink-2 dark:text-snow-2 shrink-0" aria-hidden="true" />
              Chroniques &amp; albums
            </span>
            <p className="font-narrow text-2xl sm:text-3xl font-extrabold tabular-nums text-ink dark:text-snow">
              {stats.totalAlbums}
            </p>
            <p className="font-narrow text-[11px] font-bold uppercase tracking-wider text-ink-3 dark:text-snow-3">
              Recueils officiels
            </p>
          </div>

          <div className="space-y-1 sm:pl-6 pt-4 sm:pt-0">
            <span className="font-narrow text-xs font-bold uppercase tracking-[0.08em] text-ink-3 dark:text-snow-3 flex items-center gap-1.5">
              <CalendarDaysIcon className="size-3.5 text-brand-vif shrink-0" aria-hidden="true" />
              Saisons archivées
            </span>
            <p className="font-narrow text-2xl sm:text-3xl font-extrabold tabular-nums text-brand-vif">
              {stats.seasonsCount}
            </p>
            <p className="font-narrow text-[11px] font-bold uppercase tracking-wider text-ink-3 dark:text-snow-3">
              {years.length > 0 ? `${years[years.length - 1]} — ${years[0]}` : 'Toutes saisons'}
            </p>
          </div>

          <div className="space-y-1 sm:pl-6 pt-4 sm:pt-0">
            <span className="font-narrow text-xs font-bold uppercase tracking-[0.08em] text-ink-3 dark:text-snow-3 flex items-center gap-1.5">
              <SparklesIcon className="size-3.5 text-vert dark:text-vert-vif shrink-0" aria-hidden="true" />
              Événements clés
            </span>
            <p className="font-narrow text-2xl sm:text-3xl font-extrabold tabular-nums text-ink dark:text-snow">
              {stats.featuredCount}
            </p>
            <p className="font-narrow text-[11px] font-bold uppercase tracking-wider text-vert dark:text-vert-vif">
              À la une du club
            </p>
          </div>
        </div>
      </section>

      {/* ── Multi-Filter & Search Toolbar (Tableau de repérage) ── */}
      <section
        aria-label="Filtres et recherche des archives"
        className="rounded-sm border border-line bg-white dark:border-night-line dark:bg-night-2 p-5 sm:p-6 space-y-5 shadow-2xs"
      >
        {/* Row 1: Search & Sort */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 w-full">
          <div className="relative flex-1 w-full">
            <MagnifyingGlassIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-ink-3 dark:text-snow-3 pointer-events-none" aria-hidden="true" />
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Rechercher une sortie, un col, un lieu, un mot-clé (ex. Riccione, Blanmontoise, Bastogne)..."
              aria-label="Rechercher dans les chroniques"
              className="w-full pl-10 pr-10 py-2.5 min-h-[44px] rounded-sm bg-paper dark:bg-night-3 border border-line dark:border-night-line font-sans text-xs sm:text-sm text-ink dark:text-snow placeholder:text-ink-3 dark:placeholder:text-snow-3 focus:outline-hidden focus:border-brand focus:ring-1 focus:ring-brand transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setVisibleCount(PAGE_SIZE);
                }}
                aria-label="Effacer la recherche"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 min-h-[44px] min-w-[44px] flex items-center justify-center text-ink-3 hover:text-ink dark:text-snow-3 dark:hover:text-snow transition-colors cursor-pointer"
              >
                <XMarkIcon className="size-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center gap-2 px-3 py-1 bg-paper dark:bg-night-3 border border-line dark:border-night-line rounded-sm min-h-[44px] w-full sm:w-auto">
              <ArrowsUpDownIcon className="size-4 text-ink-3 dark:text-snow-3 shrink-0" aria-hidden="true" />
              <span className="font-narrow text-xs font-bold uppercase tracking-[0.06em] text-ink-3 dark:text-snow-3 shrink-0">
                Trier :
              </span>
              <select
                value={sortBy}
                onChange={handleSortChange}
                aria-label="Trier les albums"
                className="py-1.5 pr-2 font-narrow text-xs font-bold uppercase tracking-[0.04em] bg-transparent text-ink dark:text-snow focus:outline-hidden cursor-pointer"
              >
                <option value="recent" className="bg-paper dark:bg-night-2 text-ink dark:text-snow">Plus récents d&apos;abord</option>
                <option value="oldest" className="bg-paper dark:bg-night-2 text-ink dark:text-snow">Plus anciens d&apos;abord</option>
                <option value="photos" className="bg-paper dark:bg-night-2 text-ink dark:text-snow">Nombre de clichés</option>
              </select>
            </div>
          </div>
        </div>

        {/* Row 2: Seasons */}
        <div className="pt-4 border-t border-line dark:border-night-line space-y-2.5">
          <div className="flex items-center gap-2 font-narrow text-xs font-bold uppercase tracking-[0.08em] text-ink-3 dark:text-snow-3">
            <CalendarDaysIcon className="size-4 text-brand-vif" aria-hidden="true" />
            <span>Saison :</span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <button
              type="button"
              onClick={() => handleSelectYear('all')}
              className={`min-h-[44px] inline-flex items-center justify-center gap-2 rounded-sm px-3.5 py-1.5 font-narrow text-xs font-bold uppercase tracking-[0.06em] shrink-0 transition-colors cursor-pointer ${
                selectedYear === 'all'
                  ? 'bg-ink text-white dark:bg-white dark:text-ink shadow-2xs'
                  : 'bg-paper-2 text-ink-2 hover:text-ink hover:bg-line border border-line dark:bg-night-3 dark:text-snow-2 dark:hover:text-white dark:border-night-line'
              }`}
            >
              <span>Toutes les saisons</span>
              <span
                className={`px-1.5 py-0.5 rounded-xs font-narrow text-[10px] font-bold tabular-nums ${
                  selectedYear === 'all'
                    ? 'bg-white/20 text-white dark:bg-black/20 dark:text-ink'
                    : 'bg-line/70 dark:bg-night-line text-ink-3 dark:text-snow-3'
                }`}
              >
                {stats.totalAlbums}
              </span>
            </button>

            {years.map((yr) => {
              const yrCount = initialAlbums.filter((a) => a.year === yr).length;
              const isSelected = selectedYear === yr;
              return (
                <button
                  key={yr}
                  type="button"
                  onClick={() => handleSelectYear(yr)}
                  className={`min-h-[44px] inline-flex items-center justify-center gap-2 rounded-sm px-3.5 py-1.5 font-narrow text-xs font-bold uppercase tracking-[0.06em] shrink-0 transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-brand text-white shadow-2xs'
                      : 'bg-paper-2 text-ink-2 hover:text-ink hover:bg-line border border-line dark:bg-night-3 dark:text-snow-2 dark:hover:text-white dark:border-night-line'
                  }`}
                >
                  <span>{yr}</span>
                  <span
                    className={`px-1.5 py-0.5 rounded-xs font-narrow text-[10px] font-bold tabular-nums ${
                      isSelected
                        ? 'bg-black/25 text-white'
                        : 'bg-line/70 dark:bg-night-line text-ink-3 dark:text-snow-3'
                    }`}
                  >
                    {yrCount}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Row 3: Categories */}
        <div className="pt-4 border-t border-line dark:border-night-line space-y-2.5">
          <div className="flex items-center gap-2 font-narrow text-xs font-bold uppercase tracking-[0.08em] text-ink-3 dark:text-snow-3">
            <TagIcon className="size-4 text-brand-vif" aria-hidden="true" />
            <span>Thème :</span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat) => {
              const count = categoryCounts[cat] || 0;
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => handleSelectCategory(cat)}
                  className={`min-h-[44px] inline-flex items-center justify-center gap-2 rounded-sm px-3.5 py-1.5 font-narrow text-xs font-bold uppercase tracking-[0.06em] shrink-0 transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-ink text-white dark:bg-white dark:text-ink shadow-2xs'
                      : 'bg-paper-2 text-ink-2 hover:text-ink hover:bg-line border border-line dark:bg-night-3 dark:text-snow-2 dark:hover:text-white dark:border-night-line'
                  }`}
                >
                  <span>{cat === 'all' ? 'Tous les thèmes' : cat}</span>
                  <span
                    className={`px-1.5 py-0.5 rounded-xs font-narrow text-[10px] font-bold tabular-nums ${
                      isSelected
                        ? 'bg-white/20 text-white dark:bg-black/20 dark:text-ink'
                        : 'bg-line/70 dark:bg-night-line text-ink-3 dark:text-snow-3'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Filters Pill Bar */}
        {(selectedYear !== 'all' || selectedCategory !== 'all' || searchQuery) && (
          <div className="pt-4 border-t border-line dark:border-night-line flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-narrow text-xs font-bold uppercase tracking-[0.08em] text-ink-3 dark:text-snow-3">
                Filtres actifs :
              </span>

              {selectedYear !== 'all' && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm bg-brand-tint border border-brand/25 text-brand dark:bg-brand/15 dark:border-brand/40 dark:text-brand-soft font-narrow text-xs font-bold uppercase tracking-[0.06em]">
                  <span>Saison {selectedYear}</span>
                  <button
                    type="button"
                    onClick={() => handleSelectYear('all')}
                    className="hover:text-brand-strong dark:hover:text-white p-0.5 cursor-pointer"
                    aria-label="Retirer le filtre de saison"
                  >
                    <XMarkIcon className="size-3.5" />
                  </button>
                </span>
              )}

              {selectedCategory !== 'all' && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm bg-paper-2 dark:bg-night-3 border border-line dark:border-night-line text-ink dark:text-snow font-narrow text-xs font-bold uppercase tracking-[0.06em]">
                  <span>{selectedCategory}</span>
                  <button
                    type="button"
                    onClick={() => handleSelectCategory('all')}
                    className="hover:text-brand p-0.5 cursor-pointer"
                    aria-label="Retirer le filtre de thème"
                  >
                    <XMarkIcon className="size-3.5" />
                  </button>
                </span>
              )}

              {searchQuery && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm bg-paper-2 dark:bg-night-3 border border-line dark:border-night-line text-ink dark:text-snow font-narrow text-xs font-bold uppercase tracking-[0.06em]">
                  <span>&ldquo;{searchQuery}&rdquo;</span>
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setVisibleCount(PAGE_SIZE);
                    }}
                    className="hover:text-brand p-0.5 cursor-pointer"
                    aria-label="Effacer la recherche"
                  >
                    <XMarkIcon className="size-3.5" />
                  </button>
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={handleResetFilters}
              className="font-narrow text-xs font-bold uppercase tracking-[0.08em] text-brand hover:text-brand-strong dark:text-brand-soft hover:underline cursor-pointer min-h-[44px] inline-flex items-center"
            >
              Réinitialiser tous les filtres
            </button>
          </div>
        )}
      </section>

      {/* ── Active Filters Summary Strip ── */}
      <div className="flex items-center justify-between font-narrow text-xs uppercase tracking-[0.06em] text-ink-3 dark:text-snow-3 px-1">
        <p>
          Affichage de <span className="font-bold text-ink dark:text-snow tabular-nums">{visibleAlbums.length}</span> sur{' '}
          <span className="font-bold text-ink dark:text-snow tabular-nums">{filteredAlbums.length}</span> chroniques
          {selectedYear !== 'all' && <> · Saison <strong className="text-brand-vif">{selectedYear}</strong></>}
          {selectedCategory !== 'all' && <> · Thème <strong className="text-ink dark:text-snow">{selectedCategory}</strong></>}
          {searchQuery && <> · Recherche : &ldquo;<strong className="text-ink dark:text-snow">{searchQuery}</strong>&rdquo;</>}
        </p>

        {(selectedYear !== 'all' || selectedCategory !== 'all' || searchQuery) && (
          <button
            type="button"
            onClick={handleResetFilters}
            className="font-bold text-brand hover:underline dark:text-brand-soft cursor-pointer min-h-[44px] inline-flex items-center"
          >
            Réinitialiser les filtres
          </button>
        )}
      </div>

      {/* ── Albums Grid ── */}
      {filteredAlbums.length === 0 ? (
        <div className="relative corner-ticks border border-line bg-paper-2/40 dark:border-night-line dark:bg-night-2 rounded-sm p-10 sm:p-14 text-center space-y-4 dark:[--tick:var(--color-snow-3)]">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-sm border border-ink text-ink dark:border-snow-3 dark:text-snow">
            <FunnelIcon className="size-6" aria-hidden="true" />
          </div>
          <div className="space-y-1.5 max-w-md mx-auto">
            <h3 className="font-semiwide text-lg font-extrabold uppercase text-ink dark:text-snow tracking-tight">
              Aucun album ne correspond à votre recherche
            </h3>
            <p className="text-sm text-ink-2 dark:text-snow-2 leading-relaxed">
              Modifiez vos mots-clés ou sélectionnez une autre saison pour explorer les chroniques et recueils du club.
            </p>
          </div>
          <button
            type="button"
            onClick={handleResetFilters}
            className="inline-flex min-h-[44px] items-center justify-center rounded-sm bg-brand hover:bg-brand-strong px-5 font-narrow text-xs font-bold uppercase tracking-[0.08em] text-white transition-colors cursor-pointer shadow-2xs"
          >
            Voir tous les albums
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {visibleAlbums.map((album) => (
            <article
              key={album.id}
              className="group relative flex flex-col overflow-hidden border border-line bg-white transition-colors duration-200 hover:border-ink dark:border-night-line dark:bg-night-2 dark:hover:border-snow-3 rounded-sm shadow-2xs"
            >
              {/* Cover Image Container */}
              <div
                className="relative aspect-16/10 w-full overflow-hidden border-b border-line bg-paper-2 dark:border-night-line dark:bg-night-3 cursor-pointer"
                onClick={() => setActiveModalAlbum(album)}
              >
                <Image
                  src={album.coverUrl}
                  alt={album.title}
                  fill
                  unoptimized
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover object-center transition-transform duration-700 ease-(--ease-plot) group-hover:scale-[1.04]"
                />

                {/* Overlays: Year & Category (Crisp Cartographic Badges) */}
                <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 z-10">
                  <span className="rounded-sm bg-ink/90 px-2 py-0.5 font-narrow text-[11px] font-bold uppercase tracking-[0.06em] text-white tabular-nums">
                    {album.year}
                  </span>
                  <span className="rounded-sm bg-paper/95 px-2 py-0.5 font-narrow text-[11px] font-bold uppercase tracking-[0.06em] text-ink dark:bg-night-2/95 dark:text-snow border border-line dark:border-night-line">
                    {album.category}
                  </span>
                </div>

                {/* Photo Count badge */}
                <div className="absolute top-2.5 right-2.5 z-10">
                  <span className="rounded-sm bg-ink/85 px-2 py-1 font-narrow text-xs font-bold tabular-nums text-white flex items-center gap-1.5">
                    <CameraIcon className="size-3.5 text-white/90" aria-hidden="true" />
                    <span>{album.photoCount} photos</span>
                  </span>
                </div>

                {album.featured && (
                  <div className="absolute bottom-2.5 left-2.5 z-10">
                    <span className="rounded-sm bg-brand px-2 py-0.5 font-narrow text-[11px] font-bold uppercase tracking-[0.07em] text-white flex items-center gap-1 shadow-2xs">
                      <SparklesIcon className="size-3" aria-hidden="true" />
                      <span>À la Une</span>
                    </span>
                  </div>
                )}
              </div>

              {/* Text Information */}
              <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-1.5">
                  <h2
                    className="font-semiwide text-base font-extrabold text-ink transition-colors duration-150 group-hover:text-brand dark:text-white dark:group-hover:text-brand-soft leading-snug cursor-pointer"
                    onClick={() => setActiveModalAlbum(album)}
                  >
                    {album.title}
                  </h2>
                  <p className="text-sm leading-relaxed text-ink-2 dark:text-snow-2 line-clamp-2">
                    {album.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-line dark:border-night-line flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveModalAlbum(album)}
                    className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 min-h-[44px] rounded-sm bg-paper-2 hover:bg-line dark:bg-night-3 dark:hover:bg-night-line-strong text-ink dark:text-snow border border-line dark:border-night-line font-narrow text-xs font-bold uppercase tracking-[0.06em] transition-colors cursor-pointer"
                  >
                    <span>Explorer ({album.photoCount})</span>
                  </button>

                  {album.externalAlbumUrl && (
                    <a
                      href={album.externalAlbumUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 font-narrow text-xs font-bold uppercase tracking-[0.06em] text-brand hover:text-brand-strong dark:text-brand-soft px-2 py-2 min-h-[44px] transition-colors"
                    >
                      <span>Google Photos</span>
                      <ArrowTopRightOnSquareIcon className="size-3.5" aria-hidden="true" />
                    </a>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* ── Progressive Pagination Button ── */}
      {hasMore && (
        <div className="pt-4 text-center">
          <button
            type="button"
            onClick={handleLoadMore}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 min-h-[44px] rounded-sm bg-white hover:bg-paper-2 dark:bg-night-2 dark:hover:bg-night-3 text-ink dark:text-snow border border-line dark:border-night-line hover:border-ink dark:hover:border-snow font-narrow text-xs font-bold uppercase tracking-[0.07em] transition-colors cursor-pointer shadow-2xs"
          >
            <span>Afficher plus d&apos;albums ({filteredAlbums.length - visibleCount} restants)</span>
            <ChevronDownIcon className="size-4" aria-hidden="true" />
          </button>
        </div>
      )}

      {/* ── Community Contribution Callout (Fiche de transmission) ── */}
      <section
        aria-label="Transmettre des photographies"
        className="relative corner-ticks rounded-sm border border-line bg-paper-2/60 dark:border-night-line dark:bg-night-2 p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 dark:[--tick:var(--color-snow-3)]"
      >
        <div className="space-y-1.5">
          <h3 className="font-semiwide text-lg font-extrabold uppercase tracking-tight text-ink dark:text-snow">
            Vous avez immortalisé une sortie du peloton ?
          </h3>
          <p className="text-sm text-ink-2 dark:text-snow-2 leading-relaxed max-w-2xl">
            Partagez vos photos avec le club. Les clichés sélectionnés enrichiront les archives officielles de la saison
            et seront mis à l&apos;honneur sur les chroniques du CC Saint-Martin Blanmont.
          </p>
        </div>
        <a
          href="mailto:contact@cc-blanmont.be?subject=Photos%20Sortie%20CC%20Blanmont"
          className="inline-flex items-center justify-center px-5 py-2.5 min-h-[44px] rounded-sm bg-brand hover:bg-brand-strong text-white font-narrow text-xs font-bold uppercase tracking-[0.07em] transition-colors shrink-0 shadow-2xs"
        >
          Transmettre des photos
        </a>
      </section>

      {/* ── Interactive In-App Album Modal / Planche Contact ── */}
      {activeModalAlbum && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-album-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 sm:p-6"
        >
          <div className="bg-paper dark:bg-night-2 rounded-md border-2 border-ink dark:border-snow-3 overflow-hidden w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl animate-in zoom-in-95">
            {/* Modal Header */}
            <div className="p-4 sm:p-6 border-b border-line dark:border-night-line bg-white dark:bg-night-3 flex items-start justify-between gap-4">
              <div className="space-y-1.5 max-w-3xl">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-sm bg-brand/10 border border-brand/20 text-brand px-2.5 py-0.5 font-narrow text-xs font-bold uppercase tracking-[0.06em]">
                    Saison {activeModalAlbum.year}
                  </span>
                  <span className="rounded-sm bg-paper-2 dark:bg-night-line border border-line dark:border-night-line text-ink-2 dark:text-snow-2 px-2.5 py-0.5 font-narrow text-xs font-bold uppercase tracking-[0.06em] flex items-center gap-1.5">
                    <CalendarDaysIcon className="size-3.5 text-brand-vif" aria-hidden="true" />
                    {activeModalAlbum.category}
                  </span>
                  <span className="font-narrow text-xs font-bold text-ink-3 dark:text-snow-3 tabular-nums">
                    · {activeImages.length} clichés
                  </span>
                </div>
                <h3 id="modal-album-title" className="font-semiwide text-lg sm:text-2xl font-extrabold text-ink dark:text-snow leading-tight uppercase tracking-tight">
                  {activeModalAlbum.title}
                </h3>
                {activeModalAlbum.description && (
                  <p className="text-xs sm:text-sm text-ink-2 dark:text-snow-2 leading-relaxed line-clamp-2">
                    {activeModalAlbum.description}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={() => setActiveModalAlbum(null)}
                aria-label="Fermer l'album"
                className="p-2.5 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-sm bg-paper-2 hover:bg-line dark:bg-night dark:hover:bg-night-line text-ink dark:text-white border border-line dark:border-night-line transition-colors cursor-pointer shrink-0"
              >
                <XMarkIcon className="size-5" />
              </button>
            </div>

            {/* Modal Body: Responsive Photo Contact Sheet */}
            <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
              {activeImages.length > 0 ? (
                <div>
                  <p className="font-narrow text-xs font-bold uppercase tracking-[0.06em] text-ink-3 dark:text-snow-3 mb-3">
                    Cliquez sur une photo pour l&apos;agrandir en plein écran :
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 sm:gap-3">
                    {activeImages.map((imgUrl, idx) => (
                      <div
                        key={imgUrl + idx}
                        onClick={() => setLightboxIndex(idx)}
                        className="group relative aspect-4/3 rounded-sm overflow-hidden bg-night-3 border border-line dark:border-night-line cursor-pointer hover:border-brand transition-colors"
                      >
                        <Image
                          src={imgUrl}
                          alt={`${activeModalAlbum.title} - Photo ${idx + 1}`}
                          fill
                          unoptimized
                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-colors flex items-end justify-end p-1.5">
                          <span className="opacity-0 group-hover:opacity-100 px-1.5 py-0.5 rounded-xs bg-ink/90 text-white font-narrow text-[10px] tabular-nums font-bold transition-opacity">
                            #{idx + 1}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 font-narrow text-xs font-bold uppercase tracking-[0.06em] text-ink-3 dark:text-snow-3">
                  Aucune photo supplémentaire dans cet album.
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-5 border-t border-line dark:border-night-line flex flex-col sm:flex-row items-center justify-between gap-3 bg-paper-2 dark:bg-night-3">
              <span className="font-narrow text-xs font-bold uppercase tracking-[0.06em] text-ink-3 dark:text-snow-3 order-2 sm:order-1">
                Archives officielles du CC Saint-Martin Blanmont
              </span>

              <div className="flex items-center gap-3 w-full sm:w-auto justify-end order-1 sm:order-2">
                <button
                  type="button"
                  onClick={() => setActiveModalAlbum(null)}
                  className="px-4 py-2 min-h-[44px] inline-flex items-center justify-center font-narrow text-xs font-bold uppercase tracking-[0.06em] text-ink-2 hover:text-ink dark:text-snow-3 dark:hover:text-white cursor-pointer"
                >
                  Fermer
                </button>

                {activeModalAlbum.externalAlbumUrl && (
                  <a
                    href={activeModalAlbum.externalAlbumUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-sm bg-brand hover:bg-brand-strong text-white font-narrow text-xs font-bold uppercase tracking-[0.07em] shadow-2xs transition-colors min-h-[44px]"
                  >
                    <span>Ouvrir sur Google Photos HD</span>
                    <ArrowTopRightOnSquareIcon className="size-4" aria-hidden="true" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Fullscreen Lightbox (Visionneuse Nocturne IGN) ── */}
      {lightboxIndex !== null && activeModalAlbum && activeImages.length > 0 && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Visionneuse plein écran"
          className="fixed inset-0 z-[60] bg-black/95 flex flex-col justify-between select-none"
        >
          {/* Lightbox Top Header */}
          <div className="p-4 sm:px-6 flex items-center justify-between gap-4 z-10 bg-night-2 border-b border-night-line">
            <div className="space-y-0.5 text-snow max-w-xl truncate">
              <p className="font-semiwide text-sm font-bold text-snow truncate uppercase tracking-tight">
                {activeModalAlbum.title}
              </p>
              <p className="font-narrow text-xs font-bold uppercase tracking-[0.06em] text-snow-3 tabular-nums">
                Photo {lightboxIndex + 1} sur {activeImages.length}
              </p>
            </div>

            <div className="flex items-center gap-2">
              {activeModalAlbum.externalAlbumUrl && (
                <a
                  href={activeModalAlbum.externalAlbumUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-sm bg-night-3 hover:bg-night-line text-snow border border-night-line px-3 py-2 min-h-[44px] font-narrow text-xs font-bold uppercase tracking-[0.06em] inline-flex items-center gap-1.5 transition-colors"
                >
                  <span className="hidden sm:inline">Google Photos</span>
                  <ArrowTopRightOnSquareIcon className="size-4" aria-hidden="true" />
                </a>
              )}

              <button
                type="button"
                onClick={() => setLightboxIndex(null)}
                aria-label="Fermer la visionneuse"
                className="p-2.5 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-sm bg-night-3 hover:bg-night-line text-snow border border-night-line transition-colors cursor-pointer"
              >
                <XMarkIcon className="size-6" />
              </button>
            </div>
          </div>

          {/* Lightbox Main Stage */}
          <div className="relative flex-1 flex items-center justify-center p-4 sm:p-10 overflow-hidden">
            {/* Previous Photo Button */}
            {activeImages.length > 1 && (
              <button
                type="button"
                onClick={handlePrevPhoto}
                aria-label="Photo précédente"
                className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 z-20 p-3 min-h-[48px] min-w-[48px] flex items-center justify-center rounded-sm bg-night-2/90 hover:bg-night-3 text-white border border-night-line transition-colors cursor-pointer"
              >
                <ChevronLeftIcon className="size-6" />
              </button>
            )}

            {/* Main Current Photo */}
            <div className="relative w-full h-full max-h-[78vh] flex items-center justify-center">
              <Image
                src={activeImages[lightboxIndex]}
                alt={`${activeModalAlbum.title} - Photo ${lightboxIndex + 1}`}
                fill
                unoptimized
                priority
                sizes="100vw"
                className="object-contain"
              />
            </div>

            {/* Next Photo Button */}
            {activeImages.length > 1 && (
              <button
                type="button"
                onClick={handleNextPhoto}
                aria-label="Photo suivante"
                className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 z-20 p-3 min-h-[48px] min-w-[48px] flex items-center justify-center rounded-sm bg-night-2/90 hover:bg-night-3 text-white border border-night-line transition-colors cursor-pointer"
              >
                <ChevronRightIcon className="size-6" />
              </button>
            )}
          </div>

          {/* Lightbox Bottom Filmstrip */}
          {activeImages.length > 1 && (
            <div className="p-3 bg-night-2 border-t border-night-line flex items-center justify-center z-10">
              <div className="flex items-center gap-2 overflow-x-auto max-w-4xl py-1 scrollbar-none px-2">
                {activeImages.map((img, i) => (
                  <button
                    key={img + i}
                    type="button"
                    onClick={() => setLightboxIndex(i)}
                    aria-label={`Aller à la photo ${i + 1}`}
                    className={`relative w-12 h-9 sm:w-16 sm:h-11 rounded-sm overflow-hidden shrink-0 transition-all cursor-pointer min-h-[36px] ${
                      lightboxIndex === i
                        ? 'border-2 border-brand scale-105 opacity-100'
                        : 'border border-night-line opacity-40 hover:opacity-80'
                    }`}
                  >
                    <Image
                      src={img}
                      alt={`Miniature ${i + 1}`}
                      fill
                      unoptimized
                      sizes="64px"
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
