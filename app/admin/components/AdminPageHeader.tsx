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
          'flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-[#e4e0d8] dark:border-[#262b38]',
          className
        )}
      >
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#101216] dark:text-white">
              {title}
            </h1>
            {badge && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#101216] dark:bg-[#1d2128] px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-white">
                <badge.icon className="h-3.5 w-3.5 text-[#e03e3e]" />
                <span>{badge.label}</span>
              </span>
            )}
          </div>
          {description && (
            <div className="mt-1 text-xs sm:text-sm text-[#5c6370] dark:text-[#a7adbb]">
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
              className="inline-flex items-center gap-2 rounded-md border border-[#e4e0d8] dark:border-[#262b38] bg-white dark:bg-[#161922] px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#101216] dark:text-white hover:bg-[#f2efe9] dark:hover:bg-[#1f242d] transition-colors shadow-xs cursor-pointer"
              title="Ouvrir le guide et tutoriel"
            >
              <AcademicCapIcon className="h-4 w-4 text-[#e03e3e]" />
              <span>{tutorialLabel}</span>
            </button>
          )}

          {/* Action Buttons */}
          {actions.map((action, idx) => {
            const isPrimary = action.variant !== 'secondary';
            const buttonClasses = cn(
              'inline-flex items-center gap-2 rounded-md px-4 py-2.5 text-xs font-semibold uppercase tracking-wider transition-colors shadow-xs cursor-pointer shrink-0',
              isPrimary
                ? 'bg-[#e03e3e] hover:bg-[#c93434] text-white'
                : 'border border-[#e4e0d8] dark:border-[#262b38] bg-white dark:bg-[#161922] text-[#101216] dark:text-white hover:bg-[#f2efe9] dark:hover:bg-[#1f242d]'
            );

            if (action.href) {
              return (
                <Link key={idx} id={action.id} href={action.href} className={buttonClasses}>
                  {action.icon && (
                    <action.icon
                      className={cn('h-4 w-4', isPrimary ? 'text-white' : 'text-[#5c6370]')}
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
                    className={cn('h-4 w-4', isPrimary ? 'text-white' : 'text-[#5c6370]')}
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
