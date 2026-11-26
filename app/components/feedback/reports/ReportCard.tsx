import React from 'react';
import { ChatBubbleLeftIcon, PhotoIcon } from '@heroicons/react/24/outline';
import { cn } from '@/app/utils/cn';
import type { FeedbackReport } from '@/app/lib/feedback/reports';
import { CategoryChip, PriorityChip, StatusChip } from './chips';
import { relativeDate } from './filters';

interface ReportCardProps {
  report: FeedbackReport;
  onOpen: (number: number) => void;
}

/** One report as a clickable card: screenshot first, then what/where/who/when. */
export default function ReportCard({ report, onOpen }: ReportCardProps): React.ReactElement {
  return (
    <li>
      <button
        type="button"
        onClick={() => onOpen(report.number)}
        className={cn(
          'group flex h-full w-full flex-col overflow-hidden rounded-sm border border-line bg-white text-left transition-colors hover:border-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand dark:border-night-line dark:bg-night-2',
          report.priority === 'critical' && report.status === 'open' && 'border-l-4 border-l-brand'
        )}
      >
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-paper-2 dark:bg-night">
          {report.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- remote GitHub asset, no next/image loader configured
            <img
              src={report.imageUrl}
              alt=""
              loading="lazy"
              className="h-full w-full object-cover object-top transition-transform duration-300 group-hover:scale-[1.02]"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-ink-3 dark:text-snow-3">
              <PhotoIcon className="h-8 w-8" aria-hidden="true" />
              <span className="sr-only">Pas de capture</span>
            </div>
          )}
          <div className="absolute left-2 top-2 flex gap-1.5">
            <StatusChip status={report.status} />
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-2 p-4">
          <div className="flex flex-wrap items-center gap-1.5">
            <PriorityChip priority={report.priority} />
            <CategoryChip category={report.category} />
          </div>
          <h3 className="line-clamp-2 text-sm font-bold text-ink dark:text-white">{report.title}</h3>
          <p className="line-clamp-2 text-xs text-ink-2 dark:text-snow-2">{report.comment}</p>
          <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1 pt-2 text-[11px] text-ink-3 dark:text-snow-3">
            <span className="font-mono">{report.routePath}</span>
            <span>{report.author}</span>
            <span>{relativeDate(report.createdAt)}</span>
            {report.commentsCount > 0 && (
              <span className="inline-flex items-center gap-1">
                <ChatBubbleLeftIcon className="h-3.5 w-3.5" aria-hidden="true" />
                {report.commentsCount}
                <span className="sr-only"> réponses</span>
              </span>
            )}
          </div>
        </div>
      </button>
    </li>
  );
}
