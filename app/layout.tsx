import type { Metadata } from 'next';
import './globals.css';
import { Poppins } from 'next/font/google';
import ThemeRegistry from './ThemeRegistry';
import { AuthProvider } from './context/AuthContext';
import Box from '@mui/material/Box';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-poppins',
});

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
