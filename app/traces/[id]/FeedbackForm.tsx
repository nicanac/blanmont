'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Feedback, Member } from '../../types';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Rating from '@mui/material/Rating';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import { useAuth } from '../../context/AuthContext';
import Link from 'next/link';

interface FeedbackFormProps {
    traceId: string;
    members?: Member[]; // Made optional, as we might not need it anymore
    feedbackList: Feedback[];
    onSubmit: (formData: FormData) => Promise<void>;
}

export default function FeedbackForm({ traceId, feedbackList, onSubmit }: FeedbackFormProps) {
    const { user, isAuthenticated } = useAuth();
    const [existingFeedback, setExistingFeedback] = useState<Feedback | null>(null);
    const [rating, setRating] = useState<number | null>(5);

    // Initial check for existing feedback
    useEffect(() => {
        if (isAuthenticated && user?.id) {
            const found = feedbackList.find(f => f.memberId === user.id && f.traceId === traceId);
            setExistingFeedback(found || null);
            if (found) {
                setRating(found.rating);
            }
        }
    }, [isAuthenticated, user?.id, feedbackList, traceId]);


    if (!isAuthenticated) {
        return (
            <Box sx={{ py: 4, textAlign: 'center', bgcolor: 'background.paper', borderRadius: 2 }}>
                <Typography variant="body1" gutterBottom sx={{ fontWeight: 500 }}>
                    Connexion Requise
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Veuillez vous connecter pour laisser un commentaire.
                </Typography>
                <Link href="/login" style={{ textDecoration: 'none' }}>
                    <Button variant="contained" color="primary" sx={{ bgcolor: '#e03e3e', '&:hover': { bgcolor: '#c92a2a' } }}>
                        Se connecter
                    </Button>
                </Link>
            </Box>
        );
    }

    return (
        <form action={onSubmit} id="feedback-form">
            <input type="hidden" name="traceId" value={traceId} />
            {/* Automatically include the logged-in user's ID */}
            <input type="hidden" name="memberId" value={user?.id || ''} />

            {existingFeedback && <input type="hidden" name="feedbackId" value={existingFeedback.id} />}

            <Stack spacing={2}>
                {/* Display friendly greeting instead of selector */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                        Publié en tant que :
                    </Typography>
                    <Typography variant="subtitle2" fontWeight="bold">
                        {user?.name}
                    </Typography>
                </Box>

                <Box>
                    <Typography component="legend">Note</Typography>
                    <Rating
                        name="rating"
                        value={rating}
                        onChange={(event, newValue) => {
                            setRating(newValue);
                        }}
                    />
                </Box>

                <TextField
                    label="Commentaire"
                    name="comment"
                    multiline
                    rows={4}
                    defaultValue={existingFeedback?.comment || ''}
                    key={existingFeedback ? existingFeedback.id : 'new'}
                    required
                    fullWidth
                    variant="outlined"
                    size="small"
                />

                {existingFeedback && (
                    <Alert severity="info" sx={{ '& .MuiAlert-message': { width: '100%' } }}>
                        Vous avez déjà noté ce parcours. Soumettre à nouveau mettra à jour votre avis.
                    </Alert>
                )}

                <Button type="submit" variant="contained" fullWidth sx={{ bgcolor: '#e03e3e', '&:hover': { bgcolor: '#c92a2a' } }}>
                    {existingFeedback ? 'Mettre à jour l\'avis' : 'Envoyer l\'avis'}
                </Button>
            </Stack>
        </form>
    );
}
