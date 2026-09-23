'use client';

import React from 'react';
import Link from 'next/link';
import { AcademicCapIcon } from '@heroicons/react/24/outline';
import { cn } from '@/app/utils/cn';

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
  title: string;
  badge?: {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
  };
  description?: string | React.ReactNode;
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
  title,
  badge,
  description,
  onOpenTutorial,
  tutorialLabel = 'Tutoriel & Guide',
  tutorialButtonId,
  actions = [],
  rightExtra,
  children,
  className = '',
}: AdminPageHeaderProps): React.ReactElement {
  return (
    <>
      <div
        id={id}
        className={cn(
          'flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-line dark:border-night-line',
          className
        )}
      >
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-ink dark:text-white">
              {title}
            </h1>
            {badge && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-ink dark:bg-night-3 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-white">
                <badge.icon className="h-3.5 w-3.5 text-brand" />
                <span>{badge.label}</span>
              </span>
            )}
          </div>
          {description && (
            <div className="mt-1 text-xs sm:text-sm text-ink-3 dark:text-snow-3">
              {description}
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
          {rightExtra}
          {/* Tutorial Button */}
          {onOpenTutorial && (
            <button
              id={tutorialButtonId}
              type="button"
              onClick={onOpenTutorial}
              className="inline-flex items-center gap-2 rounded-md border border-line dark:border-night-line bg-white dark:bg-night-2 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-ink dark:text-white hover:bg-paper-2 dark:hover:bg-night-3 transition-colors shadow-xs cursor-pointer"
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
              'inline-flex items-center gap-2 rounded-md px-4 py-2.5 text-xs font-semibold uppercase tracking-wider transition-colors shadow-xs cursor-pointer shrink-0',
              isPrimary
                ? 'bg-brand hover:bg-brand-strong text-white'
                : 'border border-line dark:border-night-line bg-white dark:bg-night-2 text-ink dark:text-white hover:bg-paper-2 dark:hover:bg-night-3'
            );

            if (action.href) {
              return (
                <Link key={idx} id={action.id} href={action.href} className={buttonClasses}>
                  {action.icon && (
                    <action.icon
                      className={cn('h-4 w-4', isPrimary ? 'text-white' : 'text-ink-3')}
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
                    className={cn('h-4 w-4', isPrimary ? 'text-white' : 'text-ink-3')}
                  />
                )}
                <span>{action.label}</span>
              </button>
            );
          })}
        </div>
      </div>
      {children}
    </>
  );
}
