'use client';

import React, { useState } from 'react';
import { PlusIcon, BookOpenIcon } from '@heroicons/react/24/outline';
import BlogTutorialModal from './BlogTutorialModal';
import { useBlogTour } from './BlogTour';
import AdminPageHeader from '@/app/admin/components/AdminPageHeader';

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
      <AdminPageHeader
        id="blog-header-section"
        title="Les News du Club"
        badge={{ icon: BookOpenIcon, label: 'Gestion des Articles' }}
        description={`${postCount} article${postCount !== 1 ? 's' : ''} au total dans la base de données.`}
        onOpenTutorial={() => setModalOpen(true)}
        tutorialButtonId="blog-tutorial-btn"
        actions={[
          {
            id: 'blog-new-btn',
            label: 'Nouvel Article',
            href: '/admin/blog/new',
            icon: PlusIcon,
            variant: 'primary',
          },
        ]}
      />

      <BlogTutorialModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onStartTour={() => {
          setTimeout(() => {
            startDashboardTour();
          }, 200);
        }}
      />
    </>
  );
}
