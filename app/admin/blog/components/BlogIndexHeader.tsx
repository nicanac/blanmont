'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  PlusIcon,
  AcademicCapIcon,
  BookOpenIcon,
} from '@heroicons/react/24/outline';
import BlogTutorialModal from './BlogTutorialModal';
import { useBlogTour } from './BlogTour';

interface BlogIndexHeaderProps {
  postCount: number;
}

export default function BlogIndexHeader({
  postCount,
}: BlogIndexHeaderProps): React.ReactElement {
  const [modalOpen, setModalOpen] = useState(false);
  const { startDashboardTour } = useBlogTour();

  return (
    <>
      <div id="blog-header-section" className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-[#e4e0d8]">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-[#101216] px-3 py-1 text-xs font-bold uppercase tracking-wider text-white mb-2">
            <BookOpenIcon className="h-3.5 w-3.5 text-[#e03e3e]" />
            <span>Gestion des Articles</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#101216]">
            Les News du Club
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-[#5c6370]">
            {postCount} article{postCount !== 1 ? 's' : ''} au total dans la base de données.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Tuto Button */}
          <button
            id="blog-tutorial-btn"
            type="button"
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-md border border-[#e4e0d8] bg-white px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#101216] hover:bg-[#f2efe9] transition-colors shadow-xs"
            title="Ouvrir le guide et tutoriel de rédaction"
          >
            <AcademicCapIcon className="h-4 w-4 text-[#e03e3e]" />
            <span>Tutoriel &amp; Guide</span>
          </button>

          {/* New Post Button */}
          <Link
            id="blog-new-btn"
            href="/admin/blog/new"
            className="inline-flex items-center gap-2 rounded-md bg-[#e03e3e] hover:bg-[#c93434] px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-white transition-colors shadow-xs shrink-0"
          >
            <PlusIcon className="h-4 w-4" />
            <span>Nouvel Article</span>
          </Link>
        </div>
      </div>

      {/* Tutorial & Best Practices Modal */}
      <BlogTutorialModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onStartTour={() => {
          // Short delay to ensure modal close animation finishes before starting driver tour
          setTimeout(() => {
            startDashboardTour();
          }, 200);
        }}
      />
    </>
  );
}
