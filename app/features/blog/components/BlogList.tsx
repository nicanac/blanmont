'use client';

import React, { useState, useMemo } from 'react';
import { BlogPost } from '../../../types';
import BlogCard from './BlogCard';
import { MagnifyingGlassIcon, NewspaperIcon } from '@heroicons/react/24/outline';

interface BlogListProps {
  posts: BlogPost[];
}

export default function BlogList({ posts }: BlogListProps): React.ReactElement {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tous');

  // Derive unique categories from posts
  const categories = useMemo(() => {
    const set = new Set<string>();
    posts.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return ['Tous', ...Array.from(set)];
  }, [posts]);

  // Normalize string for diacritic and case-insensitive search
  const normalizeText = (text: string) =>
    text
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();

  // Filtered posts
  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const searchNormalized = normalizeText(search);
      const matchesSearch =
        !searchNormalized ||
        normalizeText(post.title).includes(searchNormalized) ||
        normalizeText(post.excerpt).includes(searchNormalized) ||
        normalizeText(post.author).includes(searchNormalized) ||
        (post.category && normalizeText(post.category).includes(searchNormalized));

      if (!matchesSearch) return false;

      if (selectedCategory !== 'Tous' && post.category !== selectedCategory) {
        return false;
      }

      return true;
    });
  }, [posts, search, selectedCategory]);

  if (posts.length === 0) {
    return (
      <div className="rounded-lg border border-[#e4e0d8] bg-white p-12 sm:p-16 text-center space-y-3">
        <NewspaperIcon className="mx-auto h-12 w-12 text-[#5c6370]" aria-hidden="true" />
        <h3 className="text-base font-bold text-[#101216]">Aucun article publié</h3>
        <p className="text-xs sm:text-sm text-[#5c6370]">
          Les prochaines actualités et récits du club seront publiés ici prochainement.
        </p>
      </div>
    );
  }

  const isDefaultView = selectedCategory === 'Tous' && !search;
  const featuredPost = isDefaultView ? filteredPosts[0] : null;
  const gridPosts = isDefaultView ? filteredPosts.slice(1) : filteredPosts;

  return (
    <div className="space-y-8">
      {/* ──── Filter & Search Bar ──── */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-4 sm:p-5 rounded-lg border border-[#e4e0d8] bg-white shadow-xs">
        {/* Search input */}
        <div className="relative flex-1 max-w-md">
          <MagnifyingGlassIcon className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#5c6370]" aria-hidden="true" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un article, un auteur..."
            aria-label="Rechercher un article ou un auteur"
            className="w-full min-h-[44px] rounded-md border border-[#e4e0d8] bg-[#faf8f5] pl-10 pr-12 py-2.5 text-xs sm:text-sm text-[#101216] placeholder:text-[#5c6370] focus:border-[#e03e3e] focus:bg-white focus:outline-hidden focus-visible:ring-2 focus-visible:ring-[#e03e3e] transition-colors"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              aria-label="Effacer la recherche"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 min-h-[40px] min-w-[40px] flex items-center justify-center text-xs font-semibold text-[#5c6370] hover:text-[#101216] rounded-md transition-colors"
            >
              Effacer
            </button>
          )}
        </div>

        {/* Category Pills (Touch Target >= 44px) */}
        <div className="flex flex-wrap items-center gap-2">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              aria-pressed={selectedCategory === category}
              onClick={() => setSelectedCategory(category)}
              className={`min-h-[44px] inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors focus-visible:ring-2 focus-visible:ring-[#e03e3e] focus:outline-hidden ${
                selectedCategory === category
                  ? 'bg-[#101216] text-white'
                  : 'bg-[#f2efe9] text-[#5c6370] hover:bg-[#e4e0d8] hover:text-[#101216]'
              }`}
            >
              <span>{category}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ──── Articles Grid ──── */}
      {filteredPosts.length > 0 ? (
        <div className="space-y-8">
          {/* Featured Post (if default view) */}
          {featuredPost && (
            <div>
              <BlogCard post={featuredPost} featured />
            </div>
          )}

          {/* Grid of Remaining Posts */}
          {gridPosts.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {gridPosts.map((post) => (
                <BlogCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Empty State */
        <div className="rounded-lg border border-[#e4e0d8] bg-white p-12 text-center space-y-4">
          <NewspaperIcon className="mx-auto h-12 w-12 text-[#5c6370]" aria-hidden="true" />
          <h3 className="text-base font-bold text-[#101216]">Aucun article trouvé</h3>
          <p className="text-xs sm:text-sm text-[#5c6370] max-w-sm mx-auto">
            Aucun article ne correspond à votre recherche « {search} ».
          </p>
          <div>
            <button
              type="button"
              onClick={() => {
                setSearch('');
                setSelectedCategory('Tous');
              }}
              className="min-h-[44px] inline-flex items-center gap-2 rounded-md bg-[#e03e3e] text-white px-5 py-2.5 text-xs font-bold uppercase tracking-wider hover:bg-[#c93434] transition-colors shadow-xs"
            >
              Réinitialiser la recherche
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
