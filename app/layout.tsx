import type { Metadata } from 'next';
import './globals.css';
import { Archivo } from 'next/font/google';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import ConditionalFooter from './components/layout/ConditionalFooter';
import { Toaster } from 'sonner';

import LocalClubJsonLd from './components/seo/LocalClubJsonLd';

const archivo = Archivo({
  subsets: ['latin'],
  axes: ['wdth'],
  style: ['normal', 'italic'],
  variable: '--font-archivo',
  display: 'swap',
});

const DIRECTION_CONTRACT = `<!--
THESIS: The club's hub printed as a topographic sheet of its own territory (real relief, rivers and roads around the Place de la Féchère), refusing the cycling-club default of a full-bleed peloton photo, stat cards and a news grid.
OWN-WORLD: White map paper, black Archivo lettering whose width carries hierarchy, the map's spot inks (route red #e03e3e, relief bistre, hydro blue, woodland green, amber), neat-line frames, graduated scale strips, legend swatches, 2-6px sheet corners.
STORY: A member reads Saturday's departure and the wind over the real terrain, then answers the weekend poll; a newcomer sees where the club rides and books a free trial ride.
FIRST VIEWPORT: Full-bleed territory sheet with wind streaming from the forecast bearing; cartouche at left with the date and departure time as display, meeting place, weather and wind legend, groups as road classes, red "Je roule ce week-end" action.
FORM: Carte IGN, candidate 6 of 7; seed e34bd4a0.
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
-->`;

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
    ICBM: '50.6087, 4.6738',
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
    <html lang="fr" className={archivo.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <LocalClubJsonLd />
      </head>
      <body
        className={`h-full bg-paper dark:bg-night text-ink dark:text-snow transition-colors duration-200 ${archivo.variable} font-sans`}
      >
        <div hidden aria-hidden="true" dangerouslySetInnerHTML={{ __html: DIRECTION_CONTRACT }} />
        <ThemeProvider>
          <AuthProvider>
            <Navbar />

            <main id="contenu" className="min-h-[80vh] flex-grow">
              {children}
            </main>

            <ConditionalFooter>
              <Footer />
            </ConditionalFooter>

            <Toaster
              position="top-right"
              richColors
              closeButton
              toastOptions={{ className: 'font-sans' }}
            />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
