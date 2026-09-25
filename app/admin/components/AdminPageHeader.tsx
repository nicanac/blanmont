'use client';

import React from 'react';
import Link from 'next/link';
import { AcademicCapIcon } from '@heroicons/react/24/outline';
import { cn } from '@/app/utils/cn';
import { SheetHeader, SheetLegendRow } from '@/app/components/carte/SheetHeader';

export interface AdminHeaderAction {
  label: string;
  href?: string;
  onClick?: () => void;
  icon?: React.ComponentType<{ className?: string }>;
  variant?: 'primary' | 'secondary';
  id?: string;
}

export interface AdminPageHeaderProps {
  id?: string;
  sheet?: string;
  title: string;
  badge?: {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
  };
  description?: string | React.ReactNode;
  legend?: SheetLegendRow[];
  onOpenTutorial?: () => void;
  tutorialLabel?: string;
  tutorialButtonId?: string;
  actions?: AdminHeaderAction[];
  rightExtra?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

export default function AdminPageHeader({
  id,
  sheet,
  title,
  badge,
  description,
  legend,
  onOpenTutorial,
  tutorialLabel = 'Tutoriel & Guide',
  tutorialButtonId,
  actions = [],
  rightExtra,
  children,
  className = '',
}: AdminPageHeaderProps): React.ReactElement {
  const sheetName =
    sheet || (badge?.label ? `Feuille · ${badge.label}` : 'Feuille · Administration');

  const renderedTitle = (
    <div className="flex items-center gap-2.5 flex-wrap">
      <span className="font-wide font-extrabold tracking-tight">{title}</span>
      {badge && (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-paper-2 dark:bg-night-2 border border-line dark:border-night-line px-2.5 py-0.5 text-xs font-narrow font-bold uppercase tracking-wider text-ink dark:text-snow">
          <badge.icon className="h-3.5 w-3.5 text-brand" />
          <span>{badge.label}</span>
        </span>
      )}
    </div>
  );

  const renderedActions = (
    <div className="flex flex-wrap items-center gap-2.5">
      {rightExtra}
      {/* Tutorial Button */}
      {onOpenTutorial && (
        <button
          id={tutorialButtonId}
          type="button"
          onClick={onOpenTutorial}
          className="inline-flex items-center gap-1.5 rounded-md border border-line dark:border-night-line bg-paper-2 dark:bg-night-2 px-3 py-1.5 text-xs font-narrow font-semibold uppercase tracking-wider text-ink dark:text-snow hover:bg-line dark:hover:bg-night-3 transition-colors cursor-pointer active:translate-y-px"
          title="Ouvrir le guide et tutoriel"
        >
          <AcademicCapIcon className="h-4 w-4 text-brand" />
          <span>{tutorialLabel}</span>
        </button>
      )}

      {/* Action Buttons */}
      {actions.map((action, idx) => {
        const isPrimary = action.variant !== 'secondary';
        const buttonClasses = cn(
          'inline-flex items-center gap-1.5 rounded-md px-3.5 py-1.5 text-xs font-narrow font-semibold uppercase tracking-wider transition-colors cursor-pointer shrink-0 active:translate-y-px',
          isPrimary
            ? 'bg-brand hover:bg-brand-strong text-white font-bold tracking-[0.07em]'
            : 'border border-line dark:border-night-line bg-paper-2 dark:bg-night-2 text-ink dark:text-snow hover:bg-line dark:hover:bg-night-3'
        );

        if (action.href) {
          return (
            <Link key={idx} id={action.id} href={action.href} className={buttonClasses}>
              {action.icon && (
                <action.icon
                  className={cn('h-4 w-4', isPrimary ? 'text-white' : 'text-brand')}
                />
              )}
              <span>{action.label}</span>
            </Link>
          );
        }

        return (
          <button
            key={idx}
            id={action.id}
            type="button"
            onClick={action.onClick}
            className={buttonClasses}
          >
            {action.icon && (
              <action.icon
                className={cn('h-4 w-4', isPrimary ? 'text-white' : 'text-brand')}
              />
            )}
            <span>{action.label}</span>
          </button>
        );
      })}
    </div>
  );

  return (
    <div id={id} className={className}>
      <SheetHeader
        sheet={sheetName}
        title={renderedTitle}
        description={description}
        legend={legend}
        actions={renderedActions}
      >
        {children}
      </SheetHeader>
    </div>
  );
}
