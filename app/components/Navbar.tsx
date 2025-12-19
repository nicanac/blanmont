'use client';

import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Link from 'next/link';
import PeopleIcon from '@mui/icons-material/People';
import MapIcon from '@mui/icons-material/Map';
import DirectionsBikeIcon from '@mui/icons-material/DirectionsBike';
import PedalBikeIcon from '@mui/icons-material/PedalBike';

export default function Navbar() {
    return (
        <AppBar position="static" color="transparent" elevation={0} sx={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            <Container maxWidth="lg">
                <Toolbar disableGutters>
                    <Typography
                        variant="h6"
                        noWrap
                        component={Link}
                        href="/"
                        sx={{
                            mr: 2,
                            display: 'flex',
                            fontWeight: 700,
                            letterSpacing: '.1rem',
                            color: 'primary.main',
                            textDecoration: 'none',
                            flexGrow: 1,
                            alignItems: 'center',
                            gap: 1,
                        }}
                    >
                        <PedalBikeIcon sx={{ display: { xs: 'none', md: 'flex' }, mr: 1 }} />
                        BLANMONT
                    </Typography>

                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <Button component={Link} href="/members" startIcon={<PeopleIcon />} sx={{ color: 'white' }}>Members</Button>
                        <Button component={Link} href="/traces" startIcon={<MapIcon />} sx={{ color: 'white' }}>Traces</Button>
                        <Button component={Link} href="/saturday-ride" startIcon={<DirectionsBikeIcon />} sx={{ color: 'white' }}>Saturday Ride</Button>
                    </Box>
                </Toolbar>
            </Container>
        </AppBar>
    );
}
