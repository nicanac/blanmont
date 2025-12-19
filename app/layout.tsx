import type { Metadata } from 'next';
import './globals.css';
import Link from 'next/link';
import { Poppins } from 'next/font/google';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-poppins',
});




/**
 * Root Layout component that wraps the entire application.
 * Provides the HTML structure, global styles, navigation bar, and footer.
 * 
 * @param children - The page content to render.
 */
import ThemeRegistry from './ThemeRegistry';
import { AuthProvider } from './context/AuthContext';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Navbar from './components/Navbar';
import Footer from './components/Footer';


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
      <body className={`h-full bg-white ${poppins.variable} font-sans`}>
        <ThemeRegistry>
          <AuthProvider>
            <Navbar />

            <Box component="main" sx={{ minHeight: '80vh' }}>
              {children}
            </Box>

            <div className="mt-auto">
              <Footer />
            </div>
          </AuthProvider>
        </ThemeRegistry>
      </body>
    </html>
  );
}
