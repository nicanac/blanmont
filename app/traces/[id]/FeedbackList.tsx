'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Feedback, Member } from '../../types';
import { PencilSquareIcon, StarIcon, UserCircleIcon } from '@heroicons/react/20/solid';

interface FeedbackListProps {
  feedbackList: Feedback[];
  members: Member[];
}

export default function FeedbackList({ feedbackList, members }: FeedbackListProps) {
  const router = useRouter();

  const handleEdit = (memberId: string) => {
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
      <div className="rounded-md border border-[#e4e0d8] bg-[#f2efe9]/50 p-8 text-center text-sm italic text-[#5c6370]">
        Aucun commentaire pour l&apos;instant. Soyez le premier à donner votre avis !
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {feedbackList.map((fb) => {
        const authorMember = members.find((m) => m.id === fb.memberId);
        const authorName = authorMember?.name || 'Cycliste du club';
        const avatarUrl = authorMember?.photoUrl;

        return (
          <div
            key={fb.id}
            className="rounded-md border border-[#e4e0d8] bg-white p-4 sm:p-5 shadow-xs hover:border-slate-300 transition-all"
          >
            <div className="flex items-start gap-4">
              <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-red-100 flex items-center justify-center text-[#e03e3e] font-bold">
                {avatarUrl ? (
                  <Image
                    src={avatarUrl}
                    alt={authorName}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <span>{authorName.charAt(0)}</span>
                )}
              </div>

              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-sm font-bold text-[#101216]">{authorName}</h4>
                  <div className="flex items-center gap-1.5">
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
                        className="rounded-lg p-1 text-slate-400 hover:text-[#e03e3e] hover:bg-[#f2efe9] transition-colors"
                        title="Modifier mon avis"
                      >
                        <PencilSquareIcon className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>

                <p className="text-sm text-[#3a3f4a] leading-relaxed whitespace-pre-line">
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
