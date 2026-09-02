'use client';

import React, { useState } from 'react';
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
      <div className="rounded-md border border-[#e4e0d8] bg-[#f2efe9]/50 p-8 text-center text-xs sm:text-sm italic text-[#5c6370]">
        Aucun commentaire pour l&apos;instant. Soyez le premier à donner votre avis sur ce parcours !
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
            className="rounded-md border border-[#e4e0d8] bg-white p-4 sm:p-5 shadow-xs hover:border-slate-300 transition-all"
          >
            <div className="flex items-start gap-3.5">
              <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-[#161922] border border-[#e4e0d8] flex items-center justify-center text-xs font-bold text-white">
                {hasPhoto ? (
                  <img
                    src={avatarUrl}
                    alt={authorName}
                    onError={() => setImgErrors((prev) => ({ ...prev, [fb.id]: true }))}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <span>{initials}</span>
                )}
              </div>

              <div className="flex-1 space-y-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-sm font-bold text-[#101216] truncate">{authorName}</h4>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <div className="flex text-amber-400">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <StarIcon
                          key={star}
                          className={`h-4 w-4 ${
                            star <= fb.rating ? 'text-amber-400' : 'text-slate-200'
                          }`}
                        />
                      ))}
                    </div>
                    {fb.memberId && (
                      <button
                        type="button"
                        onClick={() => handleEdit(fb.memberId!)}
                        className="rounded-md p-1 text-slate-400 hover:text-[#e03e3e] hover:bg-[#f2efe9] transition-colors"
                        title="Modifier mon avis"
                      >
                        <PencilSquareIcon className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-[#3a3f4a] leading-relaxed whitespace-pre-line break-words">
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
