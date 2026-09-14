import type { Metadata } from 'next';
import './globals.css';
import { Poppins } from 'next/font/google';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import ConditionalFooter from './components/layout/ConditionalFooter';
import { Toaster } from 'sonner';

import LocalClubJsonLd from './components/seo/LocalClubJsonLd';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-poppins',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://cc-blanmont.be'),
  title: {
    default: 'Cyclo Club Saint-Martin Blanmont | Cyclisme sur route & VTT en Brabant Wallon',
    template: '%s | CC Saint-Martin Blanmont',
  },
  description:
    'Club cycliste cyclo sur route et VTT à Blanmont (Chastre, Brabant Wallon). Sorties encadrées le samedi et dimanche matin en 3 groupes de niveau (A, B, C). Affilié FFBC.',
  keywords: [
    'club cycliste brabant wallon',
    'cyclo club blanmont',
    'cyclisme chastre',
    'groupe velo ottignies',
    'sortie cyclo brabant wallon',
    'club velo gembloux',
    'cyclo saint-martin blanmont',
    'ffbc velo brabant wallon',
  ],
  authors: [{ name: 'CC Saint-Martin Blanmont' }],
  creator: 'CC Saint-Martin Blanmont',
  openGraph: {
    type: 'website',
    locale: 'fr_BE',
    url: 'https://cc-blanmont.be',
    siteName: 'CC Saint-Martin Blanmont',
    title: 'Cyclo Club Saint-Martin Blanmont | Cyclisme en Brabant Wallon',
    description:
      'Club cycliste sur route et VTT à Blanmont (Chastre). Sorties encadrées le week-end en 3 groupes de niveau. 3 sorties d’essai gratuites offertes !',
  },
  other: {
    'geo.region': 'BE-WBR',
    'geo.placename': 'Blanmont, Chastre',
    'geo.position': '50.6087;4.6738',
    'ICBM': '50.6087, 4.6738',
  },
};

const themeInitScript = `
  (function() {
    try {
      if (window.location.pathname.indexOf('/admin') === 0) {
        document.documentElement.classList.remove('dark');
        document.documentElement.classList.add('light');
        document.documentElement.setAttribute('data-theme', 'light');
        document.documentElement.style.colorScheme = 'light';
        return;
      }
      var stored = localStorage.getItem('cc_blanmont_theme');
      var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      var isDark = stored === 'dark' || (stored === 'system' && prefersDark);
      // Default to light if no preference set, unless stored as dark
      if (isDark) {
        document.documentElement.classList.add('dark');
        document.documentElement.classList.remove('light');
        document.documentElement.setAttribute('data-theme', 'dark');
        document.documentElement.style.colorScheme = 'dark';
      } else {
        document.documentElement.classList.remove('dark');
        document.documentElement.classList.add('light');
        document.documentElement.setAttribute('data-theme', 'light');
        document.documentElement.style.colorScheme = 'light';
      }
    } catch (e) {}
  })();
`;

/**
 * Root Layout component that wraps the entire application.
 * Provides the HTML structure, global styles, navigation bar, and footer.
 *
 * @param children - The page content to render.
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <LocalClubJsonLd />
      </head>
      <body className={`h-full bg-[#faf8f5] dark:bg-[#0a0c10] text-[#101216] dark:text-[#f5f6f8] transition-colors duration-200 ${poppins.variable} font-sans`}>
        <ThemeProvider>
          <AuthProvider>
            <Navbar />

            <main className="min-h-[80vh] flex-grow">
              {children}
            </main>

            <ConditionalFooter>
              <Footer />
            </ConditionalFooter>

            <Toaster position="top-right" richColors closeButton />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

