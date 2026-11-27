'use client';

import React, { useState } from 'react';
import { BuildingLibraryIcon, ShoppingBagIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import AdminPageHeader, {
  type AdminHeaderAction,
  type AdminPageHeaderProps,
} from '@/app/admin/components/AdminPageHeader';
import MaillotsTutorialModal, { type MaillotsTutorialTab } from './MaillotsTutorialModal';

/**
 * Icons the server pages (banque, campagnes) name by key: a server component cannot pass a
 * component function to this client component ("Functions cannot be passed directly to Client
 * Components"), so the page sends a string and the icon is resolved here.
 */
export const MAILLOTS_ICONS = {
  orders: ShoppingBagIcon,
  campaigns: UserGroupIcon,
  bank: BuildingLibraryIcon,
} as const;

export type MaillotsIconName = keyof typeof MAILLOTS_ICONS;
type IconProp = React.ComponentType<{ className?: string }> | MaillotsIconName;

export type MaillotsPageHeaderProps = Omit<AdminPageHeaderProps, 'badge' | 'actions'> & {
  initialTab: MaillotsTutorialTab;
  badge?: Omit<NonNullable<AdminPageHeaderProps['badge']>, 'icon'> & { icon: IconProp };
  actions?: (Omit<AdminHeaderAction, 'icon'> & { icon?: IconProp })[];
};

function resolveIcon(icon: IconProp): React.ComponentType<{ className?: string }>;
function resolveIcon(icon: IconProp | undefined): React.ComponentType<{ className?: string }> | undefined;
function resolveIcon(icon: IconProp | undefined): React.ComponentType<{ className?: string }> | undefined {
  return typeof icon === 'string' ? MAILLOTS_ICONS[icon] : icon;
}

/** AdminPageHeader + treasurer tutorial, opened at the step matching the page. */
export default function MaillotsPageHeader({
  initialTab,
  badge,
  actions,
  ...props
}: MaillotsPageHeaderProps): React.ReactElement {
  const [open, setOpen] = useState(false);
  return (
    <>
      <AdminPageHeader
        {...props}
        badge={badge && { ...badge, icon: resolveIcon(badge.icon) }}
        actions={actions?.map((action) => ({ ...action, icon: resolveIcon(action.icon) }))}
        onOpenTutorial={() => setOpen(true)}
        tutorialButtonId="maillots-tutorial-btn"
      />
      <MaillotsTutorialModal isOpen={open} onClose={() => setOpen(false)} initialTab={initialTab} />
    </>
  );
}
