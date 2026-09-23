'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Feedback, Member } from '../../types';
import { PencilSquareIcon, StarIcon } from '@heroicons/react/20/solid';

interface FeedbackListProps {
  feedbackList: Feedback[];
  members: Member[];
}

function getInitials(name: string): string {
  if (!name) return 'CC';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function FeedbackList({
  feedbackList,
  members,
}: FeedbackListProps): React.ReactElement {
  const router = useRouter();
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});

  const handleEdit = (memberId: string): void => {
    const params = new URLSearchParams(window.location.search);
    params.set('editMemberId', memberId);
    router.replace(`?${params.toString()}`, { scroll: false });

    const form = document.getElementById('feedback-form');
    if (form) {
      form.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (feedbackList.length === 0) {
    return (
      <div className="rounded-md border border-line dark:border-night-line bg-white dark:bg-night-2 p-8 text-center text-xs text-ink-3 dark:text-snow-3">
        Aucun retour d&apos;expérience pour le moment sur ce parcours.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {feedbackList.map((fb) => {
        const authorMember = members.find((m) => m.id === fb.memberId);
        const authorName = authorMember?.name || 'Cycliste du club';
        const avatarUrl = authorMember?.photoUrl;
        const hasPhoto = Boolean(avatarUrl) && !imgErrors[fb.id];
        const initials = getInitials(authorName);

        return (
          <div
            key={fb.id}
            className="rounded-md border border-line dark:border-night-line bg-white dark:bg-night-2 p-4 sm:p-5 shadow-xs hover:border-line-strong dark:hover:border-night-line-strong transition-all duration-150 ease-out"
          >
            <div className="flex items-start gap-3.5">
              <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-night-2 dark:bg-night-line border border-line dark:border-night-line flex items-center justify-center text-xs font-bold text-white">
                {hasPhoto ? (
                  <Image
                    src={avatarUrl!}
                    alt={authorName}
                    fill
                    unoptimized
                    sizes="40px"
                    onError={() => setImgErrors((prev) => ({ ...prev, [fb.id]: true }))}
                    className="object-cover"
                  />
                ) : (
                  <span>{initials}</span>
                )}
              </div>

              <div className="flex-1 space-y-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-sm font-bold text-ink dark:text-white truncate">{authorName}</h4>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <div className="flex text-amber-400">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <StarIcon
                          key={star}
                          className={`h-4 w-4 ${
                            star <= fb.rating ? 'text-amber-400' : 'text-line dark:text-night-line'
                          }`}
                        />
                      ))}
                    </div>
                    {fb.memberId && (
                      <button
                        type="button"
                        onClick={() => handleEdit(fb.memberId!)}
                        className="rounded-md p-1 min-h-[44px] min-w-[44px] inline-flex items-center justify-center text-ink-3 dark:text-snow-3 hover:text-brand hover:bg-paper-2 dark:hover:bg-night-3 transition-colors duration-150 cursor-pointer"
                        title="Modifier mon avis"
                      >
                        <PencilSquareIcon className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-ink-2 dark:text-snow-2 leading-relaxed whitespace-pre-line break-words">
                  {fb.comment}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
