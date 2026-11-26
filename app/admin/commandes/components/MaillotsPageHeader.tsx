'use client';

import React, { useState } from 'react';
import AdminPageHeader, { type AdminPageHeaderProps } from '@/app/admin/components/AdminPageHeader';
import MaillotsTutorialModal, { type MaillotsTutorialTab } from './MaillotsTutorialModal';

/** AdminPageHeader + treasurer tutorial, opened at the step matching the page. */
export default function MaillotsPageHeader({
  initialTab,
  ...props
}: AdminPageHeaderProps & { initialTab: MaillotsTutorialTab }): React.ReactElement {
  const [open, setOpen] = useState(false);
  return (
    <>
      <AdminPageHeader {...props} onOpenTutorial={() => setOpen(true)} tutorialButtonId="maillots-tutorial-btn" />
      <MaillotsTutorialModal isOpen={open} onClose={() => setOpen(false)} initialTab={initialTab} />
    </>
  );
}
