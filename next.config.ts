import type { NextConfig } from 'next';

// Dev-only allowance so impeccable live mode can load.
const IMPECCABLE_LIVE_DEV =
  process.env.NODE_ENV === 'development' ? ' http://localhost:8400' : '';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'photos.app.goo.gl',
      },
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'www.komoot.com',
      },
      {
        protocol: 'https',
        hostname: 'www.komoot.fr',
      },
      {
        protocol: 'https',
        hostname: 'www.komoot.de',
      },
      {
        protocol: 'https',
        hostname: 'photos.komoot.de',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value:
              `default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'${IMPECCABLE_LIVE_DEV}; style-src 'self' 'unsafe-inline'; img-src 'self' blob: data: https:; font-src 'self' data:; connect-src 'self' https:${IMPECCABLE_LIVE_DEV}; frame-src 'self' https://www.komoot.com https://www.komoot.fr https://account.komoot.com;`,
          },
        ],
      },
    ];
  },
};

export default nextConfig;
