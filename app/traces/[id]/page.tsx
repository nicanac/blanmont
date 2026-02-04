import { getTrace, getTraces, submitFeedback, getMembers, getFeedbackForTrace } from '../../lib/firebase';
import { uploadMapPreview, generateMapPreview } from '../../actions';
import DownloadGPXButton from '../../features/traces/components/DownloadGPXButton';
import { notFound } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { Suspense } from 'react';
import FeedbackForm from './FeedbackForm';
import FeedbackList from './FeedbackList';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid'; // Stable Grid v1
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';

// Revalidate every minute
export const revalidate = 60;

// Enable static generation for known paths (optional, but good for performance)
export async function generateStaticParams() {
    const traces = await getTraces();
    return traces.map((trace) => ({
        id: trace.id,
    }));
}

/**
 * Trace Detail Page.
 * Displays comprehensive information about a specific trace (Map, Stats, Photos, Feedback).
 * Includes forms for submitting feedback and admin tools for updating map previews.
 * 
 * @param props.params - Route parameters containing the trace `id`.
 */
export default async function TraceDetailPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const trace = await getTrace(params.id);

    if (!trace) {
        notFound();
    }

    // Fetch additional data
    const members = await getMembers();
    const feedbackList = await getFeedbackForTrace(trace.id);

    async function addFeedback(formData: FormData) {
        'use server'

        const rating = Number(formData.get('rating'));
        const comment = formData.get('comment') as string;
        const memberId = formData.get('memberId') as string;
        const feedbackId = formData.get('feedbackId') as string; // Capture ID for update

        if (trace && rating && comment && memberId) {
            await submitFeedback(trace.id, memberId, rating, comment, feedbackId || undefined);
            revalidatePath(`/traces/${trace.id}`);
        }
    }

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            {/* Hero Section */}
            <Paper
                elevation={0}
                sx={{
                    position: 'relative',
                    mb: 4,
                    borderRadius: 4,
                    overflow: 'hidden',
                    height: { xs: 300, md: 400 },
                    bgcolor: 'grey.900',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-end'
                }}
            >
                {trace.photoUrl && (
                    <Box
                        sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            backgroundImage: `url(${trace.photoUrl})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            opacity: 0.6
                        }}
                    />
                )}
                <Box
                    sx={{
                        position: 'relative',
                        zIndex: 1,
                        p: 4,
                        background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0) 100%)'
                    }}
                >
                    <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                        <Chip label={trace.surface} color="primary" size="small" />
                        {trace.start && <Chip label={`Départ : ${trace.start}`} size="small" variant="outlined" sx={{ color: 'white', borderColor: 'white' }} />}
                        {trace.end && <Chip label={`Arrivée : ${trace.end}`} size="small" variant="outlined" sx={{ color: 'white', borderColor: 'white' }} />}
                        {trace.direction && <Chip label={`Dir : ${trace.direction}`} size="small" variant="outlined" sx={{ color: 'white', borderColor: 'white' }} />}
                    </Stack>
                    <Typography variant="h3" component="h1" fontWeight="800" color="white" gutterBottom>
                        {trace.name}
                    </Typography>
                    <Stack direction="row" alignItems="center" spacing={2} sx={{ color: 'white' }}>
                        <Typography variant="h6" fontWeight="bold">{trace.distance}km</Typography>
                        <Divider orientation="vertical" flexItem sx={{ bgcolor: 'rgba(255,255,255,0.3)' }} />
                        <Typography variant="h6" sx={{ color: 'warning.main', fontWeight: 'bold' }}>
                            {'★'.repeat(trace.quality)}
                        </Typography>
                    </Stack>
                </Box>
            </Paper>

            <Grid container spacing={4}>
                {/* Main Content */}
                <Grid size={{ xs: 12, md: 8 }}>
                    <Box sx={{ mb: 4 }}>
                        <Typography variant="body1" paragraph color="text.secondary" sx={{ fontSize: '1.1rem', whiteSpace: 'pre-line' }}>
                            {trace.description}
                        </Typography>

                        <Stack direction="row" spacing={2} sx={{ my: 3 }}>
                            {trace.mapUrl && (
                                <Button
                                    variant="contained"
                                    size="large"
                                    href={trace.mapUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    Voir la carte interactive
                                </Button>
                            )}

                            <DownloadGPXButton polyline={trace.polyline} traceName={trace.name} />

                            {trace.photoAlbumUrl && (
                                <Button
                                    variant="contained"
                                    size="large"
                                    href={trace.photoAlbumUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    sx={{ bgcolor: '#4285f4', '&:hover': { bgcolor: '#3367d6' } }}
                                    startIcon={<span>📸</span>}
                                >
                                    Voir l'album photo
                                </Button>
                            )}
                        </Stack>

                        {/* Photo Previews */}
                        {trace.photoPreviews && trace.photoPreviews.length > 0 && (
                            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 2, mb: 4 }}>
                                {trace.photoPreviews.map((url, i) => (
                                    <Box
                                        key={i}
                                        component="a"
                                        href={trace.photoAlbumUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        sx={{
                                            borderRadius: 2,
                                            overflow: 'hidden',
                                            aspectRatio: '1',
                                            display: 'block',
                                            '&:hover': { opacity: 0.9 }
                                        }}
                                    >
                                        <img
                                            src={url}
                                            alt={`Ride preview ${i + 1}`}
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                            loading="lazy"
                                        />
                                    </Box>
                                ))}
                            </Box>
                        )}
                    </Box>

                    {/* Feedback List */}
                    <Box sx={{ mt: 6 }}>
                        <Typography variant="h5" gutterBottom fontWeight="bold">Commentaires de la communauté</Typography>
                        <FeedbackList feedbackList={feedbackList} members={members} />
                    </Box>
                </Grid>

                {/* Sidebar */}
                <Grid size={{ xs: 12, md: 4 }}>
                    <Stack spacing={3}>
                        <Paper sx={{ p: 3, borderRadius: 2 }} variant="outlined">
                            <Typography variant="h6" gutterBottom>Donnez votre avis</Typography>
                            <Typography variant="body2" color="text.secondary" paragraph>
                                Vous avez roulé ce parcours ? Partagez votre expérience avec le club.
                            </Typography>
                            <Suspense fallback={<div>Loading form...</div>}>
                                <FeedbackForm
                                    traceId={trace.id}
                                    members={members}
                                    feedbackList={feedbackList}
                                    onSubmit={addFeedback}
                                />
                            </Suspense>
                        </Paper>

                        {/* Admin Tools */}
                        <Paper sx={{ p: 3, borderRadius: 2, bgcolor: 'action.hover' }} variant="outlined">
                            <Typography variant="h6" gutterBottom>Outils Admin</Typography>

                            {/* Edit Trace Button */}
                            <Button
                                href={`/traces/${trace.id}/edit`}
                                variant="contained"
                                size="small"
                                fullWidth
                                sx={{ mb: 3 }}
                                startIcon={<span>✏️</span>}
                            >
                                Modifier le parcours
                            </Button>

                            <Divider sx={{ mb: 2 }} />

                            <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                                Mettre à jour l&apos;aperçu de la carte (url jpg)
                            </Typography>

                            <form action={uploadMapPreview}>
                                <input type="hidden" name="traceId" value={trace.id} />
                                <Stack spacing={2}>
                                    <TextField
                                        size="small"
                                        name="imageUrl"
                                        placeholder="https://example.com/map.jpg"
                                        fullWidth
                                        required
                                        variant="outlined"
                                        InputProps={{ sx: { bgcolor: 'background.paper' } }}
                                    />
                                    <Button type="submit" variant="outlined" size="small" fullWidth>
                                        Mettre à jour l'image de couverture
                                    </Button>
                                </Stack>
                            </form>

                            <Divider sx={{ my: 2 }}>Or</Divider>

                            <form action={generateMapPreview}>
                                <input type="hidden" name="traceId" value={trace.id} />
                                <Button type="submit" variant="outlined" size="small" fullWidth startIcon={<span>✨</span>}>
                                    Générer depuis Komoot
                                </Button>
                            </form>
                        </Paper>
                    </Stack>
                </Grid>
            </Grid>
        </Container>
    );
}
