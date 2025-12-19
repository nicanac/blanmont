'use client';

import { useRouter } from 'next/navigation';
import { Feedback, Member } from '../../types';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';

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
            <Typography variant="body1" color="text.secondary" fontStyle="italic">
                Aucun commentaire pour l'instant. Soyez le premier !
            </Typography>
        );
    }

    return (
        <Stack spacing={2}>
            {feedbackList.map((fb) => {
                const authorMember = members.find(m => m.id === fb.memberId);
                const authorName = authorMember?.name || 'Unknown Rider';
                const avatarUrl = authorMember?.photoUrl;

                return (
                    <Paper key={fb.id} sx={{ p: 2, borderRadius: 2 }} variant="outlined">
                        <Stack direction="row" spacing={2} alignItems="flex-start">
                            <Avatar alt={authorName} src={avatarUrl} sx={{ bgcolor: 'primary.main' }}>
                                {authorName.charAt(0)}
                            </Avatar>
                            <Box sx={{ flexGrow: 1 }}>
                                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                                    <Typography variant="subtitle1" fontWeight="bold">
                                        {authorName}
                                    </Typography>
                                    <Stack direction="row" spacing={1} alignItems="center">
                                        <Typography variant="body2" sx={{ color: 'warning.main' }}>
                                            {'★'.repeat(fb.rating)}
                                        </Typography>
                                        <Button
                                            size="small"
                                            onClick={() => fb.memberId && handleEdit(fb.memberId)}
                                            sx={{ minWidth: 0, p: 0.5, fontSize: '1.2rem' }}
                                        >
                                            ✏️
                                        </Button>
                                    </Stack>
                                </Stack>
                                <Typography variant="body2" color="text.primary">
                                    {fb.comment}
                                </Typography>
                            </Box>
                        </Stack>
                    </Paper>
                );
            })}
        </Stack>
    );
}
