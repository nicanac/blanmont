'use client';

import { CalendarEvent } from '../types';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import CloseIcon from '@mui/icons-material/Close';
import PlaceIcon from '@mui/icons-material/Place';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import StraightenIcon from '@mui/icons-material/Straighten';
import GroupsIcon from '@mui/icons-material/Groups';
import AnnouncementIcon from '@mui/icons-material/Announcement';

interface CalendarDrawerProps {
    event: CalendarEvent | null;
    open: boolean;
    onClose: () => void;
}

export default function CalendarDrawer({ event, open, onClose }: CalendarDrawerProps) {
    if (!event) return null;

    // Format Date
    const dateObj = new Date(event.isoDate);
    const dateStr = dateObj.toLocaleDateString('fr-FR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    // Create Google Maps link
    const mapsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${event.location} ${event.address}`)}`;
    // Simple Embed fallback (might be restricted without API key but worth a try or just use the link)
    const mapSrc = `https://maps.google.com/maps?q=${encodeURIComponent(`${event.location} ${event.address}`)}&t=&z=15&ie=UTF8&iwloc=&output=embed`;

    return (
        <Drawer
            anchor="right"
            open={open}
            onClose={onClose}
            PaperProps={{
                sx: { width: { xs: '100%', sm: 400 }, p: 0 }
            }}
        >
            <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                {/* Header */}
                <Box sx={{ p: 3, bgcolor: 'grey.50', borderBottom: 1, borderColor: 'divider' }}>
                    <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1}>
                        <Chip label="Sortie Club" size="small" color="primary" />
                        <IconButton onClick={onClose} size="small">
                            <CloseIcon />
                        </IconButton>
                    </Stack>
                    <Typography variant="h5" fontWeight="bold" gutterBottom>
                        {event.location}
                    </Typography>
                    <Typography variant="subtitle1" color="text.secondary" sx={{ textTransform: 'capitalize' }}>
                        {dateStr}
                    </Typography>
                </Box>

                {/* Content */}
                <Box sx={{ p: 3, flexGrow: 1, overflowY: 'auto' }}>
                    <Stack spacing={3}>
                        {/* Map Preview */}
                        <Box
                            sx={{
                                width: '100%',
                                height: 200,
                                bgcolor: 'grey.200',
                                borderRadius: 2,
                                overflow: 'hidden',
                                position: 'relative'
                            }}
                        >
                            <iframe
                                width="100%"
                                height="100%"
                                src={mapSrc}
                                style={{ border: 0 }}
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                            ></iframe>
                        </Box>

                        <Button
                            variant="outlined"
                            startIcon={<PlaceIcon />}
                            href={mapsLink}
                            target="_blank"
                            fullWidth
                        >
                            Ouvrir dans Google Maps
                        </Button>

                        <Divider />

                        {/* Details Grid */}
                        <Stack spacing={2}>
                            <Box display="flex" alignItems="center" gap={2}>
                                <AccessTimeIcon color="action" />
                                <Box>
                                    <Typography variant="caption" display="block" color="text.secondary">Départ</Typography>
                                    <Typography variant="body1" fontWeight="medium">{event.departure}</Typography>
                                </Box>
                            </Box>

                            <Box display="flex" alignItems="center" gap={2}>
                                <StraightenIcon color="action" />
                                <Box>
                                    <Typography variant="caption" display="block" color="text.secondary">Distances</Typography>
                                    <Typography variant="body1" fontWeight="medium">{event.distances || 'Non spécifié'} km</Typography>
                                </Box>
                            </Box>

                            {event.group && (
                                <Box display="flex" alignItems="center" gap={2}>
                                    <GroupsIcon color="action" />
                                    <Box>
                                        <Typography variant="caption" display="block" color="text.secondary">Groupe</Typography>
                                        <Typography variant="body1" fontWeight="medium">{event.group}</Typography>
                                    </Box>
                                </Box>
                            )}

                            {event.address && (
                                <Box display="flex" alignItems="start" gap={2}>
                                    <PlaceIcon color="action" sx={{ mt: 0.5 }} />
                                    <Box>
                                        <Typography variant="caption" display="block" color="text.secondary">Adresse</Typography>
                                        <Typography variant="body2">{event.address}</Typography>
                                    </Box>
                                </Box>
                            )}
                        </Stack>

                        {/* Remarks & Alternatives */}
                        {(event.remarks || event.alternative) && (
                            <>
                                <Divider />
                                <Stack spacing={2}>
                                    {event.remarks && (
                                        <Box>
                                            <Stack direction="row" alignItems="center" gap={1} mb={0.5}>
                                                <AnnouncementIcon fontSize="small" color="info" />
                                                <Typography variant="subtitle2" fontWeight="bold">Remarques</Typography>
                                            </Stack>
                                            <Typography variant="body2" color="text.secondary">
                                                {event.remarks}
                                            </Typography>
                                        </Box>
                                    )}

                                    {event.alternative && (
                                        <Box sx={{ bgcolor: 'orange.50', p: 2, borderRadius: 2, border: '1px solid', borderColor: 'orange.200' }}>
                                            <Typography variant="subtitle2" color="orange.800" fontWeight="bold" gutterBottom>
                                                Alternative
                                            </Typography>
                                            <Typography variant="body2" color="orange.900">
                                                {event.alternative}
                                            </Typography>
                                        </Box>
                                    )}
                                </Stack>
                            </>
                        )}
                    </Stack>
                </Box>
            </Box>
        </Drawer>
    );
}
