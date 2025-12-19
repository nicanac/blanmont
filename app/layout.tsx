import type { Metadata } from 'next';
import './globals.css';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import Link from 'next/link';




/**
 * Root Layout component that wraps the entire application.
 * Provides the HTML structure, global styles, navigation bar, and footer.
 * 
 * @param children - The page content to render.
 */
import ThemeRegistry from './ThemeRegistry';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Navbar from './components/Navbar';


export const metadata: Metadata = {
  title: 'Blanmont Cycling Club',
  description: 'Premium Road Cycling Club',
};

/**
 * Root Layout component that wraps the entire application.
 * Provides the HTML structure, global styles, navigation bar, and footer.
 * 
 * @param children - The page content to render.
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeRegistry>
          <Navbar />

          <Box component="main" sx={{ minHeight: '80vh' }}>
            {children}
          </Box>

          <Box component="footer" sx={{ py: 3, borderTop: '1px solid rgba(255,255,255,0.1)', mt: 'auto' }}>
            <Container maxWidth="lg">
              <Typography variant="body2" color="text.secondary" align="center">
                © {new Date().getFullYear()} Blanmont Cycling Club. Ride On.
              </Typography>
            </Container>
          </Box>
        </ThemeRegistry>
      </body>
    </html>
  );
}
