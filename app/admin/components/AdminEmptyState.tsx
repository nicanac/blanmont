import React from 'react';
import Link from 'next/link';
import { LightBulbIcon } from '@heroicons/react/24/outline';

export interface AdminEmptyStateProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  primaryAction?: {
    label: string;
    href?: string;
    onClick?: () => void;
    icon?: React.ComponentType<{ className?: string }>;
  };
  secondaryAction?: {
    label: string;
    href?: string;
    onClick?: () => void;
    icon?: React.ComponentType<{ className?: string }>;
  };
  tip?: string;
  className?: string;
}

export default function AdminEmptyState({
  icon: Icon,
  title,
  description,
  primaryAction,
  secondaryAction,
  tip,
  className = '',
}: AdminEmptyStateProps): React.ReactElement {
  return (
    <div
      className={`rounded-lg border border-[#e4e0d8] bg-white p-8 sm:p-12 text-center shadow-xs space-y-6 ${className}`}
    >
      {/* Icon */}
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-[#e03e3e]/10 border border-[#e03e3e]/20 text-[#e03e3e]">
        <Icon className="h-7 w-7" />
      </div>

      {/* Content */}
      <div className="space-y-2 max-w-md mx-auto">
        <h3 className="text-lg font-bold text-[#101216] tracking-tight">{title}</h3>
        <p className="text-xs sm:text-sm text-[#5c6370] leading-relaxed">{description}</p>
      </div>

      {/* Actions */}
      {(primaryAction || secondaryAction) && (
        <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
          {primaryAction &&
            (primaryAction.href ? (
              <Link
                href={primaryAction.href}
                className="inline-flex items-center gap-2 rounded-md bg-[#e03e3e] hover:bg-[#c93434] px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-white transition-colors shadow-xs"
              >
                {primaryAction.icon && <primaryAction.icon className="h-4 w-4" />}
                <span>{primaryAction.label}</span>
              </Link>
            ) : (
              <button
                type="button"
                onClick={primaryAction.onClick}
                className="inline-flex items-center gap-2 rounded-md bg-[#e03e3e] hover:bg-[#c93434] px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-white transition-colors shadow-xs"
              >
                {primaryAction.icon && <primaryAction.icon className="h-4 w-4" />}
                <span>{primaryAction.label}</span>
              </button>
            ))}

          {secondaryAction &&
            (secondaryAction.href ? (
              <Link
                href={secondaryAction.href}
                className="inline-flex items-center gap-2 rounded-md border border-[#e4e0d8] bg-white hover:bg-[#f2efe9] px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#101216] transition-colors"
              >
                {secondaryAction.icon && <secondaryAction.icon className="h-4 w-4 text-[#7d8493]" />}
                <span>{secondaryAction.label}</span>
              </Link>
            ) : (
              <button
                type="button"
                onClick={secondaryAction.onClick}
                className="inline-flex items-center gap-2 rounded-md border border-[#e4e0d8] bg-white hover:bg-[#f2efe9] px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#101216] transition-colors"
              >
                {secondaryAction.icon && <secondaryAction.icon className="h-4 w-4 text-[#7d8493]" />}
                <span>{secondaryAction.label}</span>
              </button>
            ))}
        </div>
      )}

      {/* Contextual Tip */}
      {tip && (
        <div className="mx-auto max-w-lg rounded-md border border-[#e4e0d8] bg-[#faf8f5] p-3 text-left flex items-start gap-2.5 text-xs text-[#5c6370]">
          <LightBulbIcon className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-[#101216]">Conseil pratique : </span>
            {tip}
          </div>
        </div>
      )}
    </div>
  );
}
