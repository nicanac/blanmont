/**
 * @vitest-environment jsdom
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import NextRideCard, { ScheduledRideInfo } from '@/app/components/layout/NextRideCard';
import { usePathname } from 'next/navigation';

vi.mock('next/navigation', () => ({
  usePathname: vi.fn(),
}));

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock('@/app/context/ThemeContext', () => ({
  useTheme: () => ({ resolvedTheme: 'light' }),
}));

vi.mock('@/app/components/ui/RideWeatherBadge', () => ({
  default: () => <div data-testid="weather-badge">Weather Mock</div>,
}));

vi.mock('@/app/components/ui/GpxStatsDisplay', () => ({
  default: () => <div data-testid="gpx-stats">GPX Stats Mock</div>,
}));

describe('NextRideCard component', () => {
  const sampleRide: ScheduledRideInfo = {
    isoDate: '2026-05-16',
    dateFormatted: 'Samedi 16 Mai 2026',
    location: 'Blanmont',
    departure: '8h30',
    distances: '75-95 km',
    address: 'Place de Blanmont',
    remarks: 'Port du casque obligatoire',
    gpxUrl: 'https://www.komoot.com/tour/12345',
    isCustomEvent: false,
  };

  beforeEach(() => {
    vi.restoreAllMocks();
    vi.mocked(usePathname).mockReturnValue('/blog');
  });

  it('renders null when on the homepage (pathname === "/")', () => {
    vi.mocked(usePathname).mockReturnValue('/');
    const { container } = render(<NextRideCard nextRide={sampleRide} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders summary information when collapsed', () => {
    render(<NextRideCard nextRide={sampleRide} />);

    expect(screen.getByText(/Prochain Rendez-vous/i)).toBeInTheDocument();
    expect(screen.getByText('Samedi 16 Mai 2026')).toBeInTheDocument();
    expect(screen.getByText('Blanmont')).toBeInTheDocument();
    expect(screen.getByText('8h30')).toBeInTheDocument();
    expect(screen.getByText(/75-95 km/)).toBeInTheDocument();

    // Expanded details should not be present initially
    expect(screen.queryByText(/Lieu de RDV/i)).not.toBeInTheDocument();
  });

  it('expands on header button click to show full ride details, weather, and GPX link', () => {
    render(<NextRideCard nextRide={sampleRide} />);

    const toggleButton = screen.getByRole('button', { name: /prochain rendez-vous/i });
    expect(toggleButton).toHaveAttribute('aria-expanded', 'false');

    // Click to expand
    fireEvent.click(toggleButton);
    expect(toggleButton).toHaveAttribute('aria-expanded', 'true');

    // Verify expanded content
    expect(screen.getByText(/Lieu de RDV/i)).toBeInTheDocument();
    expect(screen.getByText('Place de Blanmont')).toBeInTheDocument();
    expect(screen.getByText(/Port du casque obligatoire/)).toBeInTheDocument();
    expect(screen.getByTestId('weather-badge')).toBeInTheDocument();
    expect(screen.getByText(/Trace GPS \(Komoot\)/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /voir le calendrier complet/i })).toBeInTheDocument();

    // Click to collapse
    fireEvent.click(toggleButton);
    expect(toggleButton).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByText(/Lieu de RDV/i)).not.toBeInTheDocument();
  });

  it('formats GPX button labels according to provider URL', () => {
    const stravaRide = { ...sampleRide, gpxUrl: 'https://www.strava.com/routes/999' };
    const { rerender } = render(<NextRideCard nextRide={stravaRide} defaultExpanded={true} />);
    expect(screen.getByText(/Trace GPS \(Strava\)/i)).toBeInTheDocument();

    const garminRide = { ...sampleRide, gpxUrl: 'https://connect.garmin.com/modern/course/888' };
    rerender(<NextRideCard nextRide={garminRide} defaultExpanded={true} />);
    expect(screen.getByText(/Trace GPS \(Garmin Connect\)/i)).toBeInTheDocument();

    const genericRide = { ...sampleRide, gpxUrl: 'https://example.com/ride.gpx' };
    rerender(<NextRideCard nextRide={genericRide} defaultExpanded={true} />);
    expect(screen.getByText(/Télécharger la trace GPX/i)).toBeInTheDocument();
  });
});
