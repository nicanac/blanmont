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


describe('NextRideCard component', () => {
  const sampleRide: ScheduledRideInfo = {
    isoDate: '2026-05-16',
    dateFormatted: 'Samedi 16 Mai 2026',
    location: 'Blanmont',
    departure: '8h30',
    distances: '75-95 km',
    address: 'Place de Blanmont',
    remarks: 'Port du casque obligatoire',
    gpxUrl: '/api/trace/evt-1',
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
    expect(screen.getByText(/Télécharger la trace GPX/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /voir le calendrier complet/i })).toBeInTheDocument();

    // Click to collapse
    fireEvent.click(toggleButton);
    expect(toggleButton).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByText(/Lieu de RDV/i)).not.toBeInTheDocument();
  });

  it('links the trace through its member link, in the same tab (#252)', () => {
    render(
      <NextRideCard nextRide={{ ...sampleRide, gpxUrl: '/api/trace/evt-1' }} defaultExpanded={true} />
    );
    const link = screen.getByRole('link', { name: /Télécharger la trace GPX/i });
    expect(link.getAttribute('href')).toBe('/api/trace/evt-1');
    expect(link.getAttribute('target')).toBeNull();
  });
});
