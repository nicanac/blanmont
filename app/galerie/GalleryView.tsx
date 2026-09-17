'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import type { PhotoAlbum } from '../types';
import {
  CameraIcon,
  ArrowTopRightOnSquareIcon,
  SparklesIcon,
  XMarkIcon,
  CalendarDaysIcon,
} from '@heroicons/react/24/outline';

interface GalleryViewProps {
  initialAlbums: PhotoAlbum[];
}

export default function GalleryView({ initialAlbums }: GalleryViewProps): React.ReactElement {
  const [selectedYear, setSelectedYear] = useState<number | 'all'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeModalAlbum, setActiveModalAlbum] = useState<PhotoAlbum | null>(null);

  // Extract unique years present in albums
  const years = useMemo(() => {
    const set = new Set<number>();
    initialAlbums.forEach((a) => set.add(a.year));
    return Array.from(set).sort((a, b) => b - a);
  }, [initialAlbums]);

  const categories = ['all', 'Sorties', 'Ardennes & Stages', 'Événements', 'Équipements'] as const;

  const filteredAlbums = useMemo(() => {
    return initialAlbums.filter((album) => {
      if (selectedYear !== 'all' && album.year !== selectedYear) return false;
      if (selectedCategory !== 'all' && album.category !== selectedCategory) return false;
      return true;
    });
  }, [initialAlbums, selectedYear, selectedCategory]);

  return (
    <div className="space-y-10">
      {/* Filter Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-white rounded-[10px] border border-[#e4e0d8] shadow-xs">
        {/* Year Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <span className="text-xs font-bold uppercase tracking-wider text-[#5c6370] mr-2 shrink-0">
            Saison :
          </span>
          <button
            type="button"
            onClick={() => setSelectedYear('all')}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-colors ${
              selectedYear === 'all'
                ? 'bg-[#101216] text-white'
                : 'bg-[#faf8f5] text-[#5c6370] hover:text-[#101216] border border-[#e4e0d8]'
            }`}
          >
            Toutes les saisons
          </button>
          {years.map((yr) => (
            <button
              key={yr}
              type="button"
              onClick={() => setSelectedYear(yr)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-colors ${
                selectedYear === yr
                  ? 'bg-[#e03e3e] text-white'
                  : 'bg-[#faf8f5] text-[#5c6370] hover:text-[#101216] border border-[#e4e0d8]'
              }`}
            >
              {yr}
            </button>
          ))}
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold shrink-0 transition-colors ${
                selectedCategory === cat
                  ? 'bg-[#f2efe9] text-[#101216] border border-[#cfc9be]'
                  : 'text-[#5c6370] hover:text-[#101216]'
              }`}
            >
              {cat === 'all' ? 'Tous les thèmes' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Albums Grid */}
      {filteredAlbums.length === 0 ? (
        <div className="bg-white rounded-[10px] border border-[#e4e0d8] p-12 text-center space-y-3">
          <CameraIcon className="h-8 w-8 text-[#a7adbb] mx-auto" />
          <p className="text-sm font-semibold text-[#101216]">Aucun album photo ne correspond aux critères.</p>
          <p className="text-xs text-[#5c6370]">
            Essayez de sélectionner une autre saison ou un autre thème.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAlbums.map((album) => (
            <article
              key={album.id}
              className="group bg-white rounded-[10px] border border-[#e4e0d8] overflow-hidden flex flex-col shadow-xs hover:border-[#cfc9be] hover:shadow-md transition-all duration-300"
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

                {/* Overlays: Year & Category badge */}
                <div className="absolute top-3 left-3 flex items-center gap-1.5 z-10">
                  <span className="px-2 py-0.5 rounded-xs bg-[#101216]/90 backdrop-blur-xs text-white text-xs font-bold tracking-wider uppercase">
                    {album.year}
                  </span>
                  <span className="px-2 py-0.5 rounded-xs bg-white/90 backdrop-blur-xs text-[#101216] text-xs font-bold tracking-wider">
                    {album.category}
                  </span>
                </div>

                {/* Photo Count badge */}
                <div className="absolute top-3 right-3">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-xs bg-black/70 backdrop-blur-xs text-white text-xs font-semibold tabular-nums">
                    <CameraIcon className="h-3 w-3" />
                    {album.photoCount} photos
                  </span>
                </div>

                {album.featured && (
                  <div className="absolute bottom-3 left-3">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-xs bg-[#e03e3e] text-white text-xs font-bold uppercase tracking-wider">
                      <SparklesIcon className="h-3 w-3" />
                      À la Une
                    </span>
                  </div>
                )}
              </div>

              {/* Text Info */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <h2
                    className="text-base font-bold text-[#101216] leading-snug cursor-pointer group-hover:text-[#e03e3e] transition-colors"
                    onClick={() => setActiveModalAlbum(album)}
                  >
                    {album.title}
                  </h2>
                  <p className="text-xs text-[#5c6370] line-clamp-2 leading-relaxed">
                    {album.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#efece5] flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setActiveModalAlbum(album)}
                    className="text-xs font-semibold text-[#101216] hover:text-[#e03e3e] transition-colors"
                  >
                    Voir l&apos;aperçu
                  </button>

                  {album.externalAlbumUrl && (
                    <a
                      href={album.externalAlbumUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-bold text-[#e03e3e] hover:underline"
                    >
                      <span>Album HD</span>
                      <ArrowTopRightOnSquareIcon className="h-3.5 w-3.5" />
                    </a>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Community Contribution Box */}
      <div className="rounded-[10px] border border-[#e4e0d8] bg-white p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-1">
          <h3 className="text-base font-bold text-[#101216]">
            Vous avez immortalisé une sortie du peloton ?
          </h3>
          <p className="text-xs text-[#5c6370] leading-relaxed max-w-2xl">
            Partagez vos photos avec le club. Les clichés sélectionnés seront ajoutés aux chroniques de la saison
            et mis à l&apos;honneur sur les réseaux du CC Saint-Martin Blanmont.
          </p>
        </div>
        <a
          href="mailto:contact@cc-blanmont.be?subject=Photos%20Sortie%20CC%20Blanmont"
          className="inline-flex items-center justify-center px-5 py-2.5 rounded-md bg-[#101216] hover:bg-[#242938] text-white text-xs font-bold uppercase tracking-wider transition-colors shrink-0 shadow-xs min-h-[44px]"
        >
          Transmettre des photos
        </a>
      </div>

      {/* Album Preview Modal */}
      {activeModalAlbum && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4"
        >
          <div className="bg-white rounded-[10px] border border-[#e4e0d8] overflow-hidden w-full max-w-2xl shadow-2xl animate-in zoom-in-95">
            <div className="relative aspect-16/9 w-full bg-[#0a0c10]">
              <Image
                src={activeModalAlbum.coverUrl}
                alt={activeModalAlbum.title}
                fill
                unoptimized
                sizes="(max-width: 768px) 100vw, 672px"
                className="object-cover"
              />
              <button
                type="button"
                onClick={() => setActiveModalAlbum(null)}
                className="absolute top-3 right-3 p-1.5 rounded-full bg-black/60 text-white hover:bg-black transition-colors"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-[#e03e3e]/10 text-[#e03e3e] text-xs font-bold uppercase tracking-wider">
                  Saison {activeModalAlbum.year}
                </span>
                <span className="text-xs font-medium text-[#5c6370] flex items-center gap-1">
                  <CalendarDaysIcon className="h-3.5 w-3.5" />
                  {activeModalAlbum.category}
                </span>
                <span className="text-xs font-medium text-[#5c6370] ml-auto tabular-nums">
                  {activeModalAlbum.photoCount} photos
                </span>
              </div>

              <h3 className="text-xl font-bold text-[#101216]">{activeModalAlbum.title}</h3>
              <p className="text-xs sm:text-sm text-[#5c6370] leading-relaxed">
                {activeModalAlbum.description}
              </p>

              <div className="pt-4 border-t border-[#efece5] flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setActiveModalAlbum(null)}
                  className="px-4 py-2 text-xs font-semibold text-[#5c6370] hover:text-[#101216]"
                >
                  Fermer
                </button>

                {activeModalAlbum.externalAlbumUrl && (
                  <a
                    href={activeModalAlbum.externalAlbumUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-[#e03e3e] hover:bg-[#c93434] text-white text-xs font-bold uppercase tracking-wider shadow-md transition-colors min-h-[44px]"
                  >
                    <span>Consulter l&apos;album photo complet</span>
                    <ArrowTopRightOnSquareIcon className="h-4 w-4" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
