import React from 'react';
import Link from 'next/link';
import { LightBulbIcon } from '@heroicons/react/24/outline';
import { cn } from '@/app/utils/cn';

export interface EmptyStateAction {
  label: string;
  href?: string;
  onClick?: () => void;
  icon?: React.ComponentType<{ className?: string }>;
}

export interface EmptyStateProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  primaryAction?: EmptyStateAction;
  secondaryAction?: EmptyStateAction;
  tip?: string;
  className?: string;
}

export default function EmptyState({
  icon: Icon,
  title,
  description,
  primaryAction,
  secondaryAction,
  tip,
  className = '',
}: EmptyStateProps): React.ReactElement {
  return (
    <div
      className={cn(
        'corner-ticks border border-line dark:border-night-line bg-white dark:bg-night-2 p-8 sm:p-12 text-center space-y-6 dark:[--tick:var(--color-snow-3)]',
        className
      )}
    >
      {/* Icon */}
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-sm border border-ink text-ink dark:border-snow-3 dark:text-snow">
        <Icon className="h-7 w-7" />
      </div>

      {/* Content */}
      <div className="space-y-2 max-w-md mx-auto">
        <h3 className="font-semiwide text-lg font-extrabold uppercase text-ink dark:text-white">{title}</h3>
        <p className="text-sm text-ink-2 dark:text-snow-2 leading-relaxed">
          {description}
        </p>
      </div>

      {/* Actions */}
      {(primaryAction || secondaryAction) && (
        <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
          {primaryAction &&
            (primaryAction.href ? (
              <Link
                href={primaryAction.href}
                className="inline-flex min-h-[44px] items-center gap-2 rounded-md bg-brand hover:bg-brand-strong px-5 font-narrow text-xs font-bold uppercase tracking-[0.08em] text-white transition-colors"
              >
                {primaryAction.icon && <primaryAction.icon className="h-4 w-4" />}
                <span>{primaryAction.label}</span>
              </Link>
            ) : (
              <button
                type="button"
                onClick={primaryAction.onClick}
                className="inline-flex min-h-[44px] items-center gap-2 rounded-md bg-brand hover:bg-brand-strong px-5 font-narrow text-xs font-bold uppercase tracking-[0.08em] text-white transition-colors"
              >
                {primaryAction.icon && <primaryAction.icon className="h-4 w-4" />}
                <span>{primaryAction.label}</span>
              </button>
            ))}

          {secondaryAction &&
            (secondaryAction.href ? (
              <Link
                href={secondaryAction.href}
                className="inline-flex min-h-[44px] items-center gap-2 rounded-md border border-ink dark:border-snow-2 px-4 font-narrow text-xs font-bold uppercase tracking-[0.08em] text-ink dark:text-white transition-colors hover:bg-ink hover:text-white dark:hover:bg-snow dark:hover:text-night"
              >
                {secondaryAction.icon && (
                  <secondaryAction.icon className="h-4 w-4 text-ink-3 dark:text-snow-3" />
                )}
                <span>{secondaryAction.label}</span>
              </Link>
            ) : (
              <button
                type="button"
                onClick={secondaryAction.onClick}
                className="inline-flex min-h-[44px] items-center gap-2 rounded-md border border-ink dark:border-snow-2 px-4 font-narrow text-xs font-bold uppercase tracking-[0.08em] text-ink dark:text-white transition-colors hover:bg-ink hover:text-white dark:hover:bg-snow dark:hover:text-night"
              >
                {secondaryAction.icon && (
                  <secondaryAction.icon className="h-4 w-4 text-ink-3 dark:text-snow-3" />
                )}
                <span>{secondaryAction.label}</span>
              </button>
            ))}
        </div>
      )}

      {/* Contextual Tip */}
      {tip && (
        <div className="mx-auto flex max-w-lg items-start gap-2.5 rounded-sm border border-line bg-paper p-3 text-left text-xs text-ink-2 dark:border-night-line dark:bg-night dark:text-snow-2">
          <LightBulbIcon className="h-4 w-4 text-ambre shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-ink dark:text-white">Conseil pratique : </span>
            {tip}
          </div>
        </div>
      )}
    </div>
  );
}
