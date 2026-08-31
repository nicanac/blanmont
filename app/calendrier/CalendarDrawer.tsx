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
import EditIcon from '@mui/icons-material/Edit';
import PeopleIcon from '@mui/icons-material/People';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import RouteIcon from '@mui/icons-material/Route';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import RideWeatherBadge from '../components/ui/RideWeatherBadge';

type AttendeeInfo = { name: string; group: string };

interface CalendarDrawerProps {
  event: CalendarEvent | null;
  open: boolean;
  onClose: () => void;
  attendees?: AttendeeInfo[];
}

export default function CalendarDrawer({
  event,
  open,
  onClose,
  attendees = [],
}: CalendarDrawerProps) {
  const { isAdmin } = useAuth();
  if (!event) return null;

  // Format Date
  const dateObj = new Date(event.isoDate);
  const dateStr = dateObj.toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
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
        sx: { width: { xs: '100%', sm: 400 }, p: 0 },
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* Header */}
        <Box sx={{ p: 3, bgcolor: 'grey.50', borderBottom: 1, borderColor: 'divider' }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Chip label="Sortie Club" size="small" color="primary" />
              {isAdmin && (
                <Chip
                  component={Link}
                  href={`/admin/events/${event.id}/edit`}
                  clickable
                  label="Modifier"
                  size="small"
                  color="error"
                  variant="outlined"
                  icon={<EditIcon sx={{ fontSize: '0.9rem !important' }} />}
                  sx={{ fontWeight: 600 }}
                />
              )}
            </Stack>
            <IconButton onClick={onClose} size="small">
              <CloseIcon />
            </IconButton>
          </Stack>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            {event.location}
          </Typography>
          <Typography
            variant="subtitle1"
            color="text.secondary"
            sx={{ textTransform: 'capitalize' }}
          >
            {dateStr}
          </Typography>
        </Box>

        {/* Content */}
        <Box sx={{ p: 3, flexGrow: 1, overflowY: 'auto' }}>
          <Stack spacing={2.5}>
            {/* Weather & Wind forecast badge */}
            <Box>
              <RideWeatherBadge isoDate={event.isoDate} departure={event.departure} />
            </Box>

            {/* GPX / Garmin / Strava Trace Section (Top Priority) */}
            {event.gpxUrl && (
              <Box
                sx={{
                  p: 2.5,
                  bgcolor: '#fff5f5',
                  borderRadius: 2.5,
                  border: '1px solid',
                  borderColor: '#fecaca',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                }}
              >
                <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1}>
                  <Stack direction="row" alignItems="center" gap={1}>
                    <RouteIcon fontSize="small" sx={{ color: '#e03e3e' }} />
                    <Typography variant="subtitle2" fontWeight="bold" sx={{ color: '#1e293b' }}>
                      Trace GPS du parcours
                    </Typography>
                  </Stack>
                  <Chip
                    label={
                      event.gpxUrl.includes('strava.com')
                        ? 'Strava'
                        : event.gpxUrl.includes('garmin.com')
                          ? 'Garmin Connect'
                          : event.gpxUrl.includes('komoot')
                            ? 'Komoot'
                            : 'GPX'
                    }
                    size="small"
                    sx={{
                      fontWeight: 700,
                      fontSize: '0.7rem',
                      bgcolor: '#fee2e2',
                      color: '#b91c1c',
                      height: 22,
                    }}
                  />
                </Stack>

                <Typography
                  variant="caption"
                  color="text.secondary"
                  display="block"
                  sx={{ mb: 1.5, lineHeight: 1.4 }}
                >
                  {event.gpxUrl.includes('strava.com')
                    ? 'Consulter l’itinéraire et télécharger la trace sur Strava.'
                    : event.gpxUrl.includes('garmin.com')
                      ? 'Consulter et envoyer le parcours directement sur votre GPS Garmin.'
                      : event.gpxUrl.includes('komoot')
                        ? 'Consulter et télécharger la trace sur Komoot.'
                        : 'Télécharger le fichier GPX pour votre GPS de vélo.'}
                </Typography>

                <Button
                  component="a"
                  href={event.gpxUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="contained"
                  fullWidth
                  startIcon={<FileDownloadIcon />}
                  sx={{
                    bgcolor: '#e03e3e',
                    '&:hover': { bgcolor: '#c53030' },
                    textTransform: 'none',
                    fontWeight: 700,
                    py: 1.25,
                    fontSize: '0.875rem',
                    borderRadius: 2,
                    boxShadow: '0 2px 4px rgba(224, 62, 62, 0.2)',
                  }}
                >
                  {event.gpxUrl.includes('strava.com')
                    ? 'Ouvrir la trace sur Strava'
                    : event.gpxUrl.includes('garmin.com')
                      ? 'Ouvrir sur Garmin Connect'
                      : event.gpxUrl.includes('komoot')
                        ? 'Ouvrir la trace sur Komoot'
                        : event.gpxUrl.endsWith('.gpx')
                          ? 'Télécharger le fichier GPX'
                          : 'Télécharger / Ouvrir le GPX'}
                </Button>
              </Box>
            )}

            {/* Map Preview / Google Maps Link Card */}
            <a
              href={mapsLink}
              target="_blank"
              rel="noopener noreferrer"
              style={{ textDecoration: 'none' }}
              className="block group relative w-full h-36 bg-gray-100 rounded-lg overflow-hidden border border-gray-200 hover:border-brand-primary transition-colors cursor-pointer"
            >
              {/* Decorative Background (Abstract Map Pattern) */}
              <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/map.png')] bg-repeat" />

              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 group-hover:scale-105 transition-transform">
                <div className="p-2.5 bg-white rounded-full shadow-sm text-brand-primary">
                  <PlaceIcon fontSize="medium" color="error" />
                </div>
                <Typography
                  variant="body2"
                  fontWeight="medium"
                  color="text.secondary"
                  sx={{ bgcolor: 'white', px: 1.5, py: 0.5, borderRadius: 1 }}
                >
                  Lieu de départ sur Google Maps
                </Typography>
              </div>
            </a>

            <Divider />

            {/* Details Grid */}
            <Stack spacing={2}>
              <Box display="flex" alignItems="center" gap={2}>
                <AccessTimeIcon color="action" />
                <Box>
                  <Typography variant="caption" display="block" color="text.secondary">
                    Départ
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {event.departure}
                  </Typography>
                </Box>
              </Box>

              <Box display="flex" alignItems="center" gap={2}>
                <StraightenIcon color="action" />
                <Box>
                  <Typography variant="caption" display="block" color="text.secondary">
                    Distances
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {event.distances || 'Non spécifié'} km
                  </Typography>
                </Box>
              </Box>

              {event.group && (
                <Box display="flex" alignItems="center" gap={2}>
                  <GroupsIcon color="action" />
                  <Box>
                    <Typography variant="caption" display="block" color="text.secondary">
                      Groupe
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {event.group}
                    </Typography>
                  </Box>
                </Box>
              )}

              {event.address && (
                <Box display="flex" alignItems="start" gap={2}>
                  <PlaceIcon color="action" sx={{ mt: 0.5 }} />
                  <Box>
                    <Typography variant="caption" display="block" color="text.secondary">
                      Adresse
                    </Typography>
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
                        <Typography variant="subtitle2" fontWeight="bold">
                          Remarques
                        </Typography>
                      </Stack>
                      <Typography variant="body2" color="text.secondary">
                        {event.remarks}
                      </Typography>
                    </Box>
                  )}

                  {event.alternative && (
                    <Box
                      sx={{
                        bgcolor: 'orange.50',
                        p: 2,
                        borderRadius: 2,
                        border: '1px solid',
                        borderColor: 'orange.200',
                      }}
                    >
                      <Typography
                        variant="subtitle2"
                        color="orange.800"
                        fontWeight="bold"
                        gutterBottom
                      >
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

            {/* Attendance Section - show for past events */}
            {attendees.length > 0 && (
              <>
                <Divider />
                <Box>
                  <Stack direction="row" alignItems="center" gap={1} mb={1.5}>
                    <PeopleIcon fontSize="small" color="success" />
                    <Typography variant="subtitle2" fontWeight="bold">
                      Présents ({attendees.length})
                    </Typography>
                  </Stack>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                    {attendees
                      .sort((a, b) => a.name.localeCompare(b.name))
                      .map((att, idx) => (
                        <Chip
                          key={idx}
                          label={att.name}
                          size="small"
                          variant="outlined"
                          color="success"
                          sx={{ fontSize: '0.75rem' }}
                        />
                      ))}
                  </Box>
                </Box>
              </>
            )}

            {/* Admin Action Button */}
            {isAdmin && (
              <>
                <Divider />
                <Button
                  component={Link}
                  href={`/admin/events/${event.id}/edit`}
                  variant="contained"
                  fullWidth
                  startIcon={<EditIcon />}
                  sx={{
                    bgcolor: '#e03e3e',
                    '&:hover': { bgcolor: '#c53030' },
                    textTransform: 'none',
                    fontWeight: 600,
                    py: 1,
                  }}
                >
                  Modifier dans l&apos;administration
                </Button>
              </>
            )}
          </Stack>
        </Box>
      </Box>
    </Drawer>
  );
}
