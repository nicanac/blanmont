import type { Metadata } from 'next';
import './globals.css';
import { Poppins } from 'next/font/google';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import FirstArrivalLoader from './components/ui/FirstArrivalLoader';
import { Toaster } from 'sonner';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-poppins',
});

export const metadata: Metadata = {
  title: 'Club de Blanmont',
  description: 'Cyclo Club Saint-Martin Blanmont - Club de cyclisme sur route et VTT',
};

/**
 * Root Layout component that wraps the entire application.
 * Provides the HTML structure, global styles, navigation bar, and footer.
 *
 * @param children - The page content to render.
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={`h-full bg-white ${poppins.variable} font-sans`}>
        <FirstArrivalLoader />
        <AuthProvider>
          <Navbar />

          <main className="min-h-[80vh] flex-grow">
            {children}
          </main>

          <div className="mt-auto">
            <Footer />
          </div>

          <Toaster position="top-right" richColors closeButton />
        </AuthProvider>
      </body>
    </html>
  );
}
