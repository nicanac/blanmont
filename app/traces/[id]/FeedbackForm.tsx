'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Feedback, Member } from '../../types';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Rating from '@mui/material/Rating';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';

interface FeedbackFormProps {
    traceId: string;
    members: Member[];
    feedbackList: Feedback[];
    onSubmit: (formData: FormData) => Promise<void>;
}

export default function FeedbackForm({ traceId, members, feedbackList, onSubmit }: FeedbackFormProps) {
    const [selectedMemberId, setSelectedMemberId] = useState<string>('');
    const [existingFeedback, setExistingFeedback] = useState<Feedback | null>(null);
    const [rating, setRating] = useState<number | null>(5);

    const searchParams = useSearchParams();
    const router = useRouter();
    const editMemberId = searchParams.get('editMemberId');

    const handleMemberChange = (memberId: string) => {
        setSelectedMemberId(memberId);
        const found = feedbackList.find(f => f.memberId === memberId && f.traceId === traceId);
        setExistingFeedback(found || null);
        if (found) {
            setRating(found.rating);
        } else {
            setRating(5); // Default
        }
    };

    // Check for edit params
    useEffect(() => {
        if (editMemberId && feedbackList.length > 0) {
            // Logic moved inline to avoid dependency cycle
            const found = feedbackList.find(f => f.memberId === editMemberId && f.traceId === traceId);
            setSelectedMemberId(editMemberId);
            setExistingFeedback(found || null);
            if (found) {
                setRating(found.rating);
            } else {
                setRating(5);
            }

            // Clean up URL
            const params = new URLSearchParams(window.location.search);
            params.delete('editMemberId');
            router.replace(`?${params.toString()}`, { scroll: false });
        }
    }, [editMemberId, feedbackList, router, traceId]);


    return (
        <form action={onSubmit} id="feedback-form">
            <input type="hidden" name="traceId" value={traceId} />
            {existingFeedback && <input type="hidden" name="feedbackId" value={existingFeedback.id} />}

            <Stack spacing={2}>
                <TextField
                    select
                    label="Select Member"
                    name="memberId"
                    value={selectedMemberId}
                    onChange={(e) => handleMemberChange(e.target.value)}
                    required
                    fullWidth
                    size="small"
                >
                    <MenuItem value=""><em>Select...</em></MenuItem>
                    {members.map(m => (
                        <MenuItem key={m.id} value={m.id}>{m.name}</MenuItem>
                    ))}
                </TextField>

                <Box>
                    <Typography component="legend">Rating</Typography>
                    <Rating
                        name="rating"
                        value={rating}
                        onChange={(event, newValue) => {
                            setRating(newValue);
                        }}
                    />
                </Box>

                <TextField
                    label="Comment"
                    name="comment"
                    multiline
                    rows={4}
                    defaultValue={existingFeedback?.comment || ''}
                    key={existingFeedback ? existingFeedback.id : 'new'} // Force re-render on switch
                    required
                    fullWidth
                    variant="outlined"
                    size="small"
                />

                {existingFeedback && (
                    <Alert severity="info" sx={{ '& .MuiAlert-message': { width: '100%' } }}>
                        You have already reviewed this trace. Submitting again will update your feedback.
                    </Alert>
                )}

                <Button type="submit" variant="contained" fullWidth>
                    {existingFeedback ? 'Update Feedback' : 'Submit Feedback'}
                </Button>
            </Stack>
        </form>
    );
}
