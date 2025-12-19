import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import HeroActions from './components/HeroActions';

/**
 * The Landing Page (Home).
 * Displays a hero section with call-to-action buttons for Traces and Members.
 */
export default function Home() {
  return (
    <Box
      sx={{
        bgcolor: 'background.default',
        pt: 15,
        pb: 6,
        background: 'radial-gradient(circle at 50% 20%, rgba(224, 62, 62, 0.15) 0%, rgba(0,0,0,0) 50%)',
      }}
    >
      <Container maxWidth="md">
        <Typography
          component="h1"
          variant="h2"
          align="center"
          color="text.primary"
          gutterBottom
          sx={{ fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.1 }}
        >
          RIDE BEYOND<br />
          <Typography component="span" variant="inherit" color="primary">
            THE HORIZON
          </Typography>
        </Typography>
        <Typography variant="h5" align="center" color="text.secondary" paragraph sx={{ mt: 3, mb: 5, maxWidth: '600px', mx: 'auto' }}>
          Join the premier road cycling community. Explore curated traces, connect with riders, and push your limits.
        </Typography>
        <HeroActions />
      </Container>
    </Box>
  );
}
