'use client';

import React from 'react';
import { AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline';
import { triggerOpenConsentModal } from '@/app/lib/consent/cookieConsent';

interface Props {
  className?: string;
  children?: React.ReactNode;
  variant?: 'button' | 'link';
}

export default function OpenCookiePreferencesButton({
  className,
  children,
  variant = 'button',
}: Props): React.JSX.Element {
  if (variant === 'link') {
    return (
      <button
        type="button"
        onClick={triggerOpenConsentModal}
        className={
          className ||
          'cursor-pointer text-left font-narrow text-xs text-ink-3 underline-offset-4 hover:text-brand hover:underline dark:text-snow-3 dark:hover:text-brand-soft'
        }
      >
        {children || 'Gérer mes cookies'}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={triggerOpenConsentModal}
      className={
        className ||
        'inline-flex min-h-[40px] cursor-pointer items-center gap-2 rounded-sm border border-line bg-paper px-4 py-2 font-narrow text-xs font-bold uppercase tracking-wider text-ink shadow-xs transition-colors hover:bg-paper-2 dark:border-night-line dark:bg-night dark:text-snow dark:hover:bg-night-2'
      }
    >
      <AdjustmentsHorizontalIcon className="size-4 text-brand dark:text-brand-soft" aria-hidden="true" />
      <span>{children || 'Modifier mes préférences de cookies'}</span>
    </button>
  );
}
