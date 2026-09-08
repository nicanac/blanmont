import type { Metadata } from 'next';
import './globals.css';
import { Poppins } from 'next/font/google';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import { Toaster } from 'sonner';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-poppins',
});

export const metadata: Metadata = {
  title: 'Club de Blanmont',
  description: 'Cyclo Club Saint-Martin Blanmont - Club de cyclisme sur route et VTT',
};

const themeInitScript = `
  (function() {
    try {
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
      </head>
      <body className={`h-full bg-[#faf8f5] dark:bg-[#0a0c10] text-[#101216] dark:text-[#f5f6f8] transition-colors duration-200 ${poppins.variable} font-sans`}>
        <ThemeProvider>
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
        </ThemeProvider>
      </body>
    </html>
  );
}

