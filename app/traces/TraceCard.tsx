'use client';

import Link from 'next/link';
import { Trace } from '../types';
import { stripSuffix } from '../utils/string.utils';
import Card from '@mui/material/Card';
import CardMedia from '@mui/material/CardMedia';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import TerrainIcon from '@mui/icons-material/Terrain';
import PlaceIcon from '@mui/icons-material/Place';
import StarIcon from '@mui/icons-material/Star';
import StraightenIcon from '@mui/icons-material/Straighten';
import VerticalAlignTopIcon from '@mui/icons-material/VerticalAlignTop';
import DownloadIcon from '@mui/icons-material/Download';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ExploreIcon from '@mui/icons-material/Explore';

interface TraceCardProps {
    trace: Trace;
}

export default function TraceCard({ trace }: TraceCardProps) {
    const getKomootEmbedUrl = (url?: string) => {
        if (!url) return null;
        const match = url.match(/komoot\.[a-z]+(\/[a-z]{2})?\/tour\/(\d+)/);
        const matchSimple = url.match(/komoot\.[a-z]+\/tour\/(\d+)/);
        const tourId = match ? match[2] : (matchSimple ? matchSimple[1] : null);
        if (tourId) {
            return `https://www.komoot.com/tour/${tourId}/embed?profile=1`;
        }
        return null;
    };

    // Get rating color based on quality score
    const getRatingColor = (quality: number): string => {
        if (quality > 4) {
            return '#22c55e'; // Green for excellent ratings (5 stars)
        } else if (quality === 4) {
            return '#84cc16'; // Yellow-green for good ratings (4 stars)
        } else if (quality === 3) {
            return '#eab308'; // Yellow for average ratings (3 stars)
        } else if (quality === 2) {
            return '#f97316'; // Orange for below average (2 stars)
        } else {
            return '#ef4444'; // Red for poor ratings (1 star)
        }
    };

    const embedUrl = getKomootEmbedUrl(trace.mapUrl);
    const ratingColor = getRatingColor(trace.quality);

    return (

        <Card
            sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                border: '1px solid',
                borderColor: 'transparent',
                transition: 'all 0.3s ease',
                '&:hover': {
                    borderColor: 'primary.main',
                    boxShadow: 8,
                    transform: 'translateY(-4px)'
                }
            }}
        >
            <Box sx={{ position: 'relative' }}>
                {trace.photoUrl ? (
                    <CardMedia
                        component="img"
                        height="200"
                        image={trace.photoUrl}
                        alt={trace.name}
                        sx={{ objectFit: 'cover' }}
                    />
                ) : embedUrl ? (
                    <CardMedia
                        component="iframe"
                        src={embedUrl || ''}
                        height="200"
                        title={`Map of ${trace.name}`}
                        sx={{ border: 'none' }}
                    />
                ) : (
                    <CardMedia
                        component="div"
                        sx={{ height: 200, bgcolor: '#2a2a2a' }}
                    />
                )}
                <Box
                    sx={{
                        position: 'absolute',
                        bottom: 8,
                        right: 8,
                        bgcolor: 'rgba(0,0,0,0.8)',
                        borderRadius: 4,
                        px: 1,
                        py: 0.5,
                        display: 'flex',
                        alignItems: 'center',
                        color: ratingColor,
                        backdropFilter: 'blur(4px)'
                    }}
                >
                    {Array.from({ length: trace.quality }).map((_, i) => (
                        <StarIcon key={i} fontSize="small" sx={{ fontSize: '1rem' }} />
                    ))}
                </Box>
            </Box>

            <CardContent sx={{ flexGrow: 1, pt: 2 }}>
                <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mb: 1.5 }}>
                    <Chip
                        icon={<TerrainIcon sx={{ '&&': { color: 'white' }, fontSize: '1rem' }} />}
                        label={trace.surface}
                        size="small"
                        sx={{
                            bgcolor: ratingColor,
                            color: 'white',
                            fontWeight: 600,
                            height: 24,
                            '& .MuiChip-icon': { ml: 0.5 }
                        }}
                    />
                    {trace.start && (
                        <Chip
                            icon={<PlaceIcon sx={{ fontSize: '1rem' }} />}
                            label={trace.start}
                            size="small"
                            variant="outlined"
                            sx={{ height: 24 }}
                        />
                    )}
                    {trace.direction && (
                        <Chip
                            icon={<ExploreIcon sx={{ fontSize: '1rem' }} />}
                            label={trace.direction}
                            size="small"
                            variant="outlined"
                            sx={{ height: 24 }}
                        />
                    )}
                </Stack>

                <Typography
                    component={Link}
                    href={`/traces/${trace.id}`}
                    gutterBottom
                    variant="h6"
                    sx={{
                        textDecoration: 'none',
                        color: 'text.primary',
                        fontWeight: 700,
                        display: 'block',
                        '&:hover': { color: 'primary.main' }
                    }}
                >
                    {stripSuffix(trace.name, '#')}
                </Typography>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {trace.description || "No description provided."}
                </Typography>

                <Stack direction="row" spacing={3} sx={{ py: 1, borderTop: 1, borderColor: 'divider' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <StraightenIcon color="action" fontSize="small" />
                        <Typography variant="h6" component="span" sx={{ fontWeight: 700 }}>
                            {trace.distance}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>
                            km
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <VerticalAlignTopIcon color="action" fontSize="small" />
                        <Typography variant="h6" component="span" sx={{ fontWeight: 700 }}>
                            {trace.elevation || '-'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>
                            m
                        </Typography>
                    </Box>
                </Stack>
            </CardContent>

            <CardActions sx={{ p: 2, pt: 0 }}>
                <Button
                    component={Link}
                    href={`/traces/${trace.id}`}
                    size="small"
                    fullWidth
                    variant="contained"
                    endIcon={<ArrowForwardIcon />}
                    sx={{
                        bgcolor: ratingColor,
                        '&:hover': { bgcolor: ratingColor, filter: 'brightness(0.9)' }
                    }}
                >
                    Details
                </Button>
                {trace.gpxUrl && (
                    <Button
                        size="small"
                        fullWidth
                        variant="outlined"
                        component="a"
                        href={trace.gpxUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        startIcon={<DownloadIcon />}
                        sx={{
                            borderColor: 'divider',
                            color: 'text.primary',
                            '&:hover': { borderColor: 'text.primary', bgcolor: 'transparent' }
                        }}
                    >
                        GPX
                    </Button>
                )}
            </CardActions>
        </Card>
    );
}
