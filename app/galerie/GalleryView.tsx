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

  // Active album for detail modal
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
      {/* ── Editorial Telemetry Strip ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 sm:p-6 bg-white dark:bg-[#161922] rounded-[10px] border border-[#e4e0d8] dark:border-[#262b38] shadow-xs">
        <div className="space-y-1">
          <span className="text-[0.75rem] font-bold uppercase tracking-wider text-[#5c6370] dark:text-[#a7adbb]">
            Clichés Numérisés
          </span>
          <p className="text-2xl sm:text-3xl font-extrabold text-[#101216] dark:text-white tabular-nums">
            {stats.totalPhotos.toLocaleString('fr-FR')}
          </p>
        </div>

        <div className="space-y-1 md:border-l md:border-[#e4e0d8] dark:md:border-[#262b38] md:pl-6">
          <span className="text-[0.75rem] font-bold uppercase tracking-wider text-[#5c6370] dark:text-[#a7adbb]">
            Chroniques &amp; Albums
          </span>
          <p className="text-2xl sm:text-3xl font-extrabold text-[#101216] dark:text-white tabular-nums">
            {stats.totalAlbums}
          </p>
        </div>

        <div className="space-y-1 border-t border-[#e4e0d8] pt-3 sm:pt-0 sm:border-t-0 md:border-l md:border-[#e4e0d8] dark:border-[#262b38] dark:md:border-[#262b38] md:pl-6">
          <span className="text-[0.75rem] font-bold uppercase tracking-wider text-[#5c6370] dark:text-[#a7adbb]">
            Saisons Archivées
          </span>
          <p className="text-2xl sm:text-3xl font-extrabold text-[#e03e3e] tabular-nums">
            {stats.seasonsCount} <span className="text-xs font-semibold text-[#5c6370] dark:text-[#a7adbb] uppercase">saisons</span>
          </p>
        </div>

        <div className="space-y-1 border-t border-[#e4e0d8] pt-3 sm:pt-0 sm:border-t-0 md:border-l md:border-[#e4e0d8] dark:border-[#262b38] dark:md:border-[#262b38] md:pl-6">
          <span className="text-[0.75rem] font-bold uppercase tracking-wider text-[#5c6370] dark:text-[#a7adbb]">
            Événements Clés
          </span>
          <p className="text-2xl sm:text-3xl font-extrabold text-[#101216] dark:text-white tabular-nums">
            {stats.featuredCount} <span className="text-xs font-semibold text-[#5c6370] dark:text-[#a7adbb] uppercase">à la une</span>
          </p>
        </div>
      </div>

      {/* ── Multi-Filter & Search Toolbar ── */}
      <div className="p-5 sm:p-6 bg-white dark:bg-[#161922] rounded-[10px] border border-[#e4e0d8] dark:border-[#262b38] shadow-xs space-y-5">
        {/* Row 1: Search & Sort */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 w-full">
          <div className="relative flex-1 w-full">
            <MagnifyingGlassIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#5c6370] dark:text-[#a7adbb] pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Rechercher une sortie, un col, un lieu, un mot-clé (ex. Riccione, Blanmontoise, Bastogne)..."
              className="w-full pl-10 pr-10 py-2.5 min-h-[44px] text-xs sm:text-sm bg-[#faf8f5] dark:bg-[#0a0c10] border border-[#e4e0d8] dark:border-[#262b38] rounded-md text-[#101216] dark:text-white placeholder-[#5c6370] dark:placeholder-[#a7adbb] focus:outline-none focus:ring-2 focus:ring-[#e03e3e]/20 focus:border-[#e03e3e] transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setVisibleCount(PAGE_SIZE);
                }}
                aria-label="Effacer la recherche"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 min-h-[44px] min-w-[44px] flex items-center justify-center text-[#5c6370] hover:text-[#101216] dark:text-[#a7adbb] dark:hover:text-white transition-colors cursor-pointer"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center gap-2 px-3 py-1 bg-[#faf8f5] dark:bg-[#0a0c10] border border-[#e4e0d8] dark:border-[#262b38] rounded-md min-h-[44px] w-full sm:w-auto">
              <ArrowsUpDownIcon className="h-4 w-4 text-[#5c6370] dark:text-[#a7adbb] shrink-0" />
              <span className="text-xs font-semibold text-[#5c6370] dark:text-[#a7adbb] shrink-0">
                Trier :
              </span>
              <select
                value={sortBy}
                onChange={handleSortChange}
                className="py-1.5 pr-2 text-xs font-semibold bg-transparent text-[#101216] dark:text-white focus:outline-none cursor-pointer"
              >
                <option value="recent">Plus récents d&apos;abord</option>
                <option value="oldest">Plus anciens d&apos;abord</option>
                <option value="photos">Nombre de clichés</option>
              </select>
            </div>
          </div>
        </div>

        {/* Row 2: Seasons */}
        <div className="pt-4 border-t border-[#e4e0d8] dark:border-[#262b38] space-y-2.5">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#5c6370] dark:text-[#a7adbb]">
            <CalendarDaysIcon className="h-4 w-4 text-[#e03e3e]" />
            <span>Saison :</span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <button
              type="button"
              onClick={() => handleSelectYear('all')}
              className={`px-3 py-1.5 min-h-[44px] inline-flex items-center justify-center gap-1.5 rounded-md text-xs font-semibold shrink-0 transition-all cursor-pointer ${
                selectedYear === 'all'
                  ? 'bg-[#101216] text-white dark:bg-white dark:text-[#101216] shadow-xs'
                  : 'bg-[#faf8f5] text-[#5c6370] hover:text-[#101216] border border-[#e4e0d8] dark:bg-[#0a0c10] dark:text-[#a7adbb] dark:hover:text-white dark:border-[#262b38]'
              }`}
            >
              <span>Toutes les saisons</span>
              <span
                className={`px-1.5 py-0.5 rounded-xs text-[0.65rem] tabular-nums font-bold ${
                  selectedYear === 'all'
                    ? 'bg-white/20 text-white dark:bg-black/10 dark:text-[#101216]'
                    : 'bg-[#efece5] dark:bg-[#1e222d] text-[#5c6370] dark:text-[#a7adbb]'
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
                  className={`px-3 py-1.5 min-h-[44px] inline-flex items-center justify-center gap-1.5 rounded-md text-xs font-semibold shrink-0 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#e03e3e] text-white shadow-xs'
                      : 'bg-[#faf8f5] text-[#5c6370] hover:text-[#101216] border border-[#e4e0d8] dark:bg-[#0a0c10] dark:text-[#a7adbb] dark:hover:text-white dark:border-[#262b38]'
                  }`}
                >
                  <span>{yr}</span>
                  <span
                    className={`px-1.5 py-0.5 rounded-xs text-[0.65rem] tabular-nums font-bold ${
                      isSelected
                        ? 'bg-black/20 text-white'
                        : 'bg-[#efece5] dark:bg-[#1e222d] text-[#5c6370] dark:text-[#a7adbb]'
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
        <div className="pt-4 border-t border-[#e4e0d8] dark:border-[#262b38] space-y-2.5">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#5c6370] dark:text-[#a7adbb]">
            <TagIcon className="h-4 w-4 text-[#e03e3e]" />
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
                  className={`px-3 py-1.5 min-h-[44px] inline-flex items-center justify-center gap-1.5 rounded-md text-xs font-semibold shrink-0 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#101216] text-white dark:bg-white dark:text-[#101216] shadow-xs'
                      : 'bg-[#faf8f5] text-[#5c6370] hover:text-[#101216] border border-[#e4e0d8] dark:bg-[#0a0c10] dark:text-[#a7adbb] dark:hover:text-white dark:border-[#262b38]'
                  }`}
                >
                  <span>{cat === 'all' ? 'Tous les thèmes' : cat}</span>
                  <span
                    className={`px-1.5 py-0.5 rounded-xs text-[0.65rem] tabular-nums font-bold ${
                      isSelected
                        ? 'bg-white/20 text-white dark:bg-black/10 dark:text-[#101216]'
                        : 'bg-[#efece5] dark:bg-[#1e222d] text-[#5c6370] dark:text-[#a7adbb]'
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
          <div className="pt-4 border-t border-[#e4e0d8] dark:border-[#262b38] flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-bold text-[#5c6370] dark:text-[#a7adbb] uppercase tracking-wider text-[0.7rem]">
                Filtres actifs :
              </span>

              {selectedYear !== 'all' && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#e03e3e]/10 text-[#e03e3e] font-semibold border border-[#e03e3e]/20">
                  <span>Saison {selectedYear}</span>
                  <button
                    type="button"
                    onClick={() => handleSelectYear('all')}
                    className="hover:text-[#c93434] p-0.5 cursor-pointer"
                    aria-label="Retirer le filtre de saison"
                  >
                    <XMarkIcon className="h-3.5 w-3.5" />
                  </button>
                </span>
              )}

              {selectedCategory !== 'all' && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#101216]/10 dark:bg-white/10 text-[#101216] dark:text-white font-semibold border border-[#101216]/20 dark:border-white/20">
                  <span>{selectedCategory}</span>
                  <button
                    type="button"
                    onClick={() => handleSelectCategory('all')}
                    className="p-0.5 cursor-pointer"
                    aria-label="Retirer le filtre de thème"
                  >
                    <XMarkIcon className="h-3.5 w-3.5" />
                  </button>
                </span>
              )}

              {searchQuery && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#101216]/10 dark:bg-white/10 text-[#101216] dark:text-white font-semibold border border-[#101216]/20 dark:border-white/20">
                  <span>&ldquo;{searchQuery}&rdquo;</span>
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setVisibleCount(PAGE_SIZE);
                    }}
                    className="p-0.5 cursor-pointer"
                    aria-label="Effacer la recherche"
                  >
                    <XMarkIcon className="h-3.5 w-3.5" />
                  </button>
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={handleResetFilters}
              className="text-xs font-bold uppercase tracking-wider text-[#e03e3e] hover:text-[#c93434] hover:underline cursor-pointer min-h-[44px] inline-flex items-center"
            >
              Réinitialiser tous les filtres
            </button>
          </div>
        )}
      </div>

      {/* ── Active Filters Summary ── */}
      <div className="flex items-center justify-between text-xs text-[#5c6370] dark:text-[#a7adbb] px-1">
        <p>
          Affichage de <span className="font-bold text-[#101216] dark:text-white tabular-nums">{visibleAlbums.length}</span> sur{' '}
          <span className="font-bold text-[#101216] dark:text-white tabular-nums">{filteredAlbums.length}</span> chroniques
          {selectedYear !== 'all' && <> · Saison <strong className="text-[#e03e3e]">{selectedYear}</strong></>}
          {selectedCategory !== 'all' && <> · Thème <strong className="text-[#101216] dark:text-white">{selectedCategory}</strong></>}
          {searchQuery && <> · Recherche : &ldquo;<strong className="text-[#101216] dark:text-white">{searchQuery}</strong>&rdquo;</>}
        </p>

        {(selectedYear !== 'all' || selectedCategory !== 'all' || searchQuery) && (
          <button
            type="button"
            onClick={handleResetFilters}
            className="font-semibold text-[#e03e3e] hover:underline cursor-pointer min-h-[44px] inline-flex items-center"
          >
            Réinitialiser les filtres
          </button>
        )}
      </div>

      {/* ── Albums Grid ── */}
      {filteredAlbums.length === 0 ? (
        <div className="bg-white dark:bg-[#161922] rounded-[10px] border border-[#e4e0d8] dark:border-[#262b38] p-12 text-center space-y-4">
          <FunnelIcon className="h-10 w-10 text-[#a7adbb] dark:text-[#5c6370] mx-auto" />
          <div className="space-y-1">
            <p className="text-base font-bold text-[#101216] dark:text-[#f5f6f8]">
              Aucun album ne correspond à votre recherche.
            </p>
            <p className="text-xs text-[#5c6370] dark:text-[#a7adbb] max-w-md mx-auto">
              Modifiez vos mots-clés ou sélectionnez une autre saison pour explorer les 149 chroniques du club.
            </p>
          </div>
          <button
            type="button"
            onClick={handleResetFilters}
            className="inline-flex items-center justify-center px-4 py-2 min-h-[44px] rounded-md bg-[#101216] hover:bg-[#242938] dark:bg-[#e03e3e] dark:hover:bg-[#c93434] text-white text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
          >
            Voir tous les albums
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {visibleAlbums.map((album) => (
            <article
              key={album.id}
              className="group bg-white dark:bg-[#161922] rounded-[10px] border border-[#e4e0d8] dark:border-[#262b38] overflow-hidden flex flex-col shadow-xs hover:border-[#cfc9be] dark:hover:border-[#3a3f4a] hover:shadow-md transition-all duration-300"
            >
              {/* Cover Image Container */}
              <div
                className="relative aspect-16/10 w-full bg-[#161922] overflow-hidden cursor-pointer"
                onClick={() => setActiveModalAlbum(album)}
              >
                <Image
                  src={album.coverUrl}
                  alt={album.title}
                  fill
                  unoptimized
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
                />

                {/* Overlays: Year & Category */}
                <div className="absolute top-3 left-3 flex items-center gap-1.5 z-10">
                  <span className="px-2 py-0.5 rounded-full bg-[#101216]/90 backdrop-blur-xs text-white text-[0.7rem] font-bold tracking-wider uppercase">
                    {album.year}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-white/90 dark:bg-[#161922]/90 backdrop-blur-xs text-[#101216] dark:text-white text-[0.7rem] font-bold tracking-wider">
                    {album.category}
                  </span>
                </div>

                {/* Photo Count badge */}
                <div className="absolute top-3 right-3 z-10">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-black/75 backdrop-blur-xs text-white text-[0.75rem] font-semibold tabular-nums">
                    <CameraIcon className="h-3.5 w-3.5" />
                    {album.photoCount} photos
                  </span>
                </div>

                {album.featured && (
                  <div className="absolute bottom-3 left-3 z-10">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#e03e3e] text-white text-[0.7rem] font-bold uppercase tracking-wider shadow-sm">
                      <SparklesIcon className="h-3 w-3" />
                      À la Une
                    </span>
                  </div>
                )}
              </div>

              {/* Text Information */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <h2
                    className="text-base font-bold text-[#101216] dark:text-[#f5f6f8] leading-snug cursor-pointer group-hover:text-[#e03e3e] transition-colors"
                    onClick={() => setActiveModalAlbum(album)}
                  >
                    {album.title}
                  </h2>
                  <p className="text-xs text-[#5c6370] dark:text-[#a7adbb] line-clamp-2 leading-relaxed">
                    {album.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#efece5] dark:border-[#262b38] flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveModalAlbum(album)}
                    className="inline-flex items-center justify-center px-3.5 py-2 min-h-[44px] rounded-md bg-[#faf8f5] hover:bg-[#f2efe9] dark:bg-[#1e222d] dark:hover:bg-[#262b38] text-xs font-semibold text-[#101216] dark:text-[#f5f6f8] border border-[#e4e0d8] dark:border-[#262b38] transition-colors cursor-pointer"
                  >
                    Explorer ({album.photoCount})
                  </button>

                  {album.externalAlbumUrl && (
                    <a
                      href={album.externalAlbumUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-bold text-[#e03e3e] hover:underline px-2 py-2 min-h-[44px]"
                    >
                      <span>Google Photos</span>
                      <ArrowTopRightOnSquareIcon className="h-3.5 w-3.5" />
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
            className="inline-flex items-center justify-center gap-2 px-6 py-3 min-h-[44px] rounded-md bg-white dark:bg-[#161922] hover:bg-[#faf8f5] dark:hover:bg-[#1e222d] text-[#101216] dark:text-white border border-[#e4e0d8] dark:border-[#262b38] text-xs font-bold uppercase tracking-wider shadow-xs hover:border-[#cfc9be] dark:hover:border-[#3a3f4a] transition-all cursor-pointer"
          >
            <span>Afficher plus d&apos;albums ({filteredAlbums.length - visibleCount} restants)</span>
            <ChevronDownIcon className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* ── Community Contribution Callout ── */}
      <div className="rounded-[10px] border border-[#e4e0d8] bg-white dark:border-[#262b38] dark:bg-[#161922] p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-1">
          <h3 className="text-base font-bold text-[#101216] dark:text-[#f5f6f8]">
            Vous avez immortalisé une sortie du peloton ?
          </h3>
          <p className="text-xs text-[#5c6370] dark:text-[#a7adbb] leading-relaxed max-w-2xl">
            Partagez vos photos avec le club. Les clichés sélectionnés enrichiront les archives officielles de la saison
            et seront mis à l&apos;honneur sur les réseaux du CC Saint-Martin Blanmont.
          </p>
        </div>
        <a
          href="mailto:contact@cc-blanmont.be?subject=Photos%20Sortie%20CC%20Blanmont"
          className="inline-flex items-center justify-center px-5 py-2.5 rounded-md bg-[#101216] hover:bg-[#242938] dark:bg-[#e03e3e] dark:hover:bg-[#c93434] text-white text-xs font-bold uppercase tracking-wider transition-colors shrink-0 shadow-xs min-h-[44px]"
        >
          Transmettre des photos
        </a>
      </div>

      {/* ── Interactive In-App Album Modal / Contact Sheet ── */}
      {activeModalAlbum && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-3 sm:p-6"
        >
          <div className="bg-white dark:bg-[#161922] rounded-[10px] border border-[#e4e0d8] dark:border-[#262b38] overflow-hidden w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl animate-in zoom-in-95">
            {/* Modal Header */}
            <div className="p-4 sm:p-6 border-b border-[#e4e0d8] dark:border-[#262b38] flex items-start justify-between gap-4">
              <div className="space-y-1.5 max-w-3xl">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#e03e3e]/10 text-[#e03e3e] text-xs font-bold uppercase tracking-wider">
                    Saison {activeModalAlbum.year}
                  </span>
                  <span className="text-xs font-medium text-[#5c6370] dark:text-[#a7adbb] flex items-center gap-1">
                    <CalendarDaysIcon className="h-3.5 w-3.5" />
                    {activeModalAlbum.category}
                  </span>
                  <span className="text-xs font-medium text-[#5c6370] dark:text-[#a7adbb] tabular-nums">
                    · {activeImages.length} clichés
                  </span>
                </div>
                <h3 className="text-lg sm:text-2xl font-bold text-[#101216] dark:text-[#f5f6f8] leading-tight">
                  {activeModalAlbum.title}
                </h3>
                {activeModalAlbum.description && (
                  <p className="text-xs sm:text-sm text-[#5c6370] dark:text-[#a7adbb] leading-relaxed line-clamp-2">
                    {activeModalAlbum.description}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={() => setActiveModalAlbum(null)}
                aria-label="Fermer l'album"
                className="p-2.5 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-md bg-[#faf8f5] hover:bg-[#f2efe9] dark:bg-[#1e222d] dark:hover:bg-[#262b38] text-[#101216] dark:text-white border border-[#e4e0d8] dark:border-[#262b38] transition-colors cursor-pointer shrink-0"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body: Responsive Photo Contact Sheet */}
            <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
              {activeImages.length > 0 ? (
                <div>
                  <p className="text-xs font-semibold text-[#5c6370] dark:text-[#a7adbb] mb-3">
                    Cliquez sur une photo pour l&apos;agrandir en plein écran :
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 sm:gap-3">
                    {activeImages.map((imgUrl, idx) => (
                      <div
                        key={imgUrl + idx}
                        onClick={() => setLightboxIndex(idx)}
                        className="group relative aspect-4/3 rounded-md overflow-hidden bg-[#0a0c10] border border-[#e4e0d8] dark:border-[#262b38] cursor-pointer hover:border-[#e03e3e] transition-colors"
                      >
                        <Image
                          src={imgUrl}
                          alt={`${activeModalAlbum.title} - Photo ${idx + 1}`}
                          fill
                          unoptimized
                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-end justify-end p-1.5">
                          <span className="opacity-0 group-hover:opacity-100 px-1.5 py-0.5 rounded-xs bg-black/70 text-white text-[0.65rem] tabular-nums font-semibold transition-opacity">
                            #{idx + 1}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-sm text-[#5c6370]">
                  Aucune photo supplémentaire dans cet album.
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-6 border-t border-[#e4e0d8] dark:border-[#262b38] flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#faf8f5] dark:bg-[#101216]">
              <span className="text-xs text-[#5c6370] dark:text-[#a7adbb] order-2 sm:order-1">
                Archives officielles du CC Saint-Martin Blanmont
              </span>

              <div className="flex items-center gap-3 w-full sm:w-auto justify-end order-1 sm:order-2">
                <button
                  type="button"
                  onClick={() => setActiveModalAlbum(null)}
                  className="px-4 py-2 min-h-[44px] inline-flex items-center justify-center text-xs font-semibold text-[#5c6370] hover:text-[#101216] dark:text-[#a7adbb] dark:hover:text-white cursor-pointer"
                >
                  Fermer
                </button>

                {activeModalAlbum.externalAlbumUrl && (
                  <a
                    href={activeModalAlbum.externalAlbumUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-[#e03e3e] hover:bg-[#c93434] text-white text-xs font-bold uppercase tracking-wider shadow-sm transition-colors min-h-[44px]"
                  >
                    <span>Ouvrir sur Google Photos HD</span>
                    <ArrowTopRightOnSquareIcon className="h-4 w-4" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Fullscreen Lightbox ── */}
      {lightboxIndex !== null && activeModalAlbum && activeImages.length > 0 && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Visionneuse plein écran"
          className="fixed inset-0 z-[60] bg-black/95 flex flex-col justify-between select-none"
        >
          {/* Lightbox Top Header */}
          <div className="p-4 sm:px-6 flex items-center justify-between gap-4 z-10 bg-gradient-to-b from-black/80 to-transparent">
            <div className="space-y-0.5 text-white max-w-xl truncate">
              <p className="text-sm font-bold truncate">{activeModalAlbum.title}</p>
              <p className="text-xs text-white/70 tabular-nums">
                Photo {lightboxIndex + 1} sur {activeImages.length}
              </p>
            </div>

            <div className="flex items-center gap-2">
              {activeModalAlbum.externalAlbumUrl && (
                <a
                  href={activeModalAlbum.externalAlbumUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-2 min-h-[44px] rounded-md bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors"
                >
                  <span className="hidden sm:inline">Google Photos</span>
                  <ArrowTopRightOnSquareIcon className="h-4 w-4" />
                </a>
              )}

              <button
                type="button"
                onClick={() => setLightboxIndex(null)}
                aria-label="Fermer la visionneuse"
                className="p-2.5 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              >
                <XMarkIcon className="h-6 w-6" />
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
                className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 z-20 p-3 min-h-[48px] min-w-[48px] flex items-center justify-center rounded-full bg-black/60 hover:bg-black/90 text-white transition-colors cursor-pointer"
              >
                <ChevronLeftIcon className="h-6 w-6" />
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
                className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 z-20 p-3 min-h-[48px] min-w-[48px] flex items-center justify-center rounded-full bg-black/60 hover:bg-black/90 text-white transition-colors cursor-pointer"
              >
                <ChevronRightIcon className="h-6 w-6" />
              </button>
            )}
          </div>

          {/* Lightbox Bottom Filmstrip */}
          {activeImages.length > 1 && (
            <div className="p-3 bg-black/80 backdrop-blur-xs flex items-center justify-center z-10">
              <div className="flex items-center gap-1.5 overflow-x-auto max-w-4xl py-1 scrollbar-none px-2">
                {activeImages.map((img, i) => (
                  <button
                    key={img + i}
                    type="button"
                    onClick={() => setLightboxIndex(i)}
                    aria-label={`Aller à la photo ${i + 1}`}
                    className={`relative w-12 h-9 sm:w-16 sm:h-11 rounded-xs overflow-hidden shrink-0 transition-all cursor-pointer min-h-[36px] ${
                      lightboxIndex === i
                        ? 'ring-2 ring-[#e03e3e] scale-105 opacity-100'
                        : 'opacity-40 hover:opacity-80'
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
