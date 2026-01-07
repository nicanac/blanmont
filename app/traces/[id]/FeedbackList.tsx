'use client';

import { useRouter } from 'next/navigation';
import { Feedback, Member } from '../../types';
import { StarIcon, PencilSquareIcon } from '@heroicons/react/20/solid';

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
            <p className="text-gray-500 italic text-center py-4">
                Aucun commentaire pour l'instant. Soyez le premier !
            </p>
        );
    }

    return (
        <div className="space-y-4">
            {feedbackList.map((fb) => {
                const authorMember = members.find(m => m.id === fb.memberId);
                const authorName = authorMember?.name || 'Unknown Rider';
                const avatarUrl = authorMember?.photoUrl;

                return (
                    <div key={fb.id} className="bg-gray-50 rounded-xl p-4 border border-gray-100 hover:border-gray-200 transition-colors">
                        <div className="flex gap-4">
                            {/* Avatar */}
                            <div className="flex-shrink-0">
                                {avatarUrl ? (
                                    <img
                                        src={avatarUrl}
                                        alt={authorName}
                                        className="h-10 w-10 rounded-full object-cover border border-white shadow-sm"
                                    />
                                ) : (
                                    <div className="h-10 w-10 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary font-bold">
                                        {authorName.charAt(0)}
                                    </div>
                                )}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start mb-1">
                                    <h4 className="text-sm font-bold text-gray-900 truncate">
                                        {authorName}
                                    </h4>
                                    <div className="flex items-center gap-2">
                                        <div className="flex text-yellow-400">
                                            {[...Array(5)].map((_, i) => (
                                                <StarIcon
                                                    key={i}
                                                    className={`h-4 w-4 ${i < fb.rating ? 'text-yellow-400' : 'text-gray-200'}`}
                                                />
                                            ))}
                                        </div>
                                        {fb.memberId && (
                                            <button
                                                onClick={() => fb.memberId && handleEdit(fb.memberId)}
                                                className="text-gray-400 hover:text-brand-primary transition-colors p-1"
                                                title="Modifier mon avis"
                                            >
                                                <PencilSquareIcon className="h-4 w-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
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

