import React from 'react';
import { cn } from '@/app/utils/cn';
import {
  CATEGORY_LABELS,
  PRIORITY_LABELS,
  STATUS_LABELS,
  type FeedbackCategory,
  type FeedbackPriority,
  type ReportStatus,
} from '@/app/lib/feedback/labels';

const chip = 'inline-flex items-center rounded-full border px-2 py-0.5 font-narrow text-[11px] font-bold uppercase tracking-wider';

const PRIORITY_STYLE: Record<FeedbackPriority, string> = {
  critical: 'border-brand/40 bg-brand/10 text-brand',
  important: 'border-ambre/60 bg-ambre/15 text-ink dark:text-snow',
  suggestion: 'border-hydro/40 bg-hydro/10 text-hydro',
};

const STATUS_STYLE: Record<ReportStatus, string> = {
  open: 'border-brand bg-brand text-white',
  resolved: 'border-vert/40 bg-vert/10 text-vert',
  dismissed: 'border-line bg-paper-2 text-ink-3 dark:border-night-line dark:bg-night dark:text-snow-3',
};

export function PriorityChip({ priority }: { priority: FeedbackPriority }): React.ReactElement {
  return <span className={cn(chip, PRIORITY_STYLE[priority])}>{PRIORITY_LABELS[priority]}</span>;
}

export function StatusChip({ status }: { status: ReportStatus }): React.ReactElement {
  return <span className={cn(chip, STATUS_STYLE[status])}>{STATUS_LABELS[status]}</span>;
}

export function CategoryChip({ category }: { category: FeedbackCategory }): React.ReactElement {
  return (
    <span className={cn(chip, 'border-line bg-paper text-ink-2 dark:border-night-line dark:bg-night dark:text-snow-2')}>
      {CATEGORY_LABELS[category]}
    </span>
  );
}
