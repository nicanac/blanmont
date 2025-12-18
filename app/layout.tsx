import type { Metadata } from 'next';
import './globals.css';
import Link from 'next/link';
import styles from './layout.module.css';

export const metadata: Metadata = {
  title: 'Blanmont Cycling Club',
  description: 'Premium Road Cycling Club',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <nav className={styles.navbar}>
          <div className={`container ${styles.navContainer}`}>
            <Link href="/" className={styles.logo}>
              BLANMONT
            </Link>
            <div className={styles.links}>
              <Link href="/members">Members</Link>
              <Link href="/traces">Traces</Link>
              <Link href="/saturday-ride">Saturday Ride</Link>
            </div>
          </div>
        </nav>
        <main>{children}</main>
        <footer className={styles.footer}>
          <div className="container">
            © {new Date().getFullYear()} Blanmont Cycling Club. Ride On.
          </div>
        </footer>
      </body>
    </html>
  );
}
