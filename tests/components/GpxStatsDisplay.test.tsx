/**
 * @vitest-environment jsdom
 */
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import GpxStatsDisplay, { isWebUiLink } from '@/app/components/ui/GpxStatsDisplay';

describe('GpxStatsDisplay component', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('isWebUiLink helper', () => {
    it('identifies web UI links correctly', () => {
      expect(isWebUiLink('https://www.strava.com/activities/12345')).toBe(true);
      expect(isWebUiLink('https://connect.garmin.com/modern/activity/123')).toBe(true);
      expect(isWebUiLink('https://www.komoot.com/tour/456')).toBe(true);
      expect(isWebUiLink('https://blanmont.be/traces/circuit.gpx')).toBe(false);
      expect(isWebUiLink('')).toBe(false);
    });
  });

  it('returns null directly for web UI links (Strava/Komoot)', () => {
    const { container } = render(
      <GpxStatsDisplay url="https://www.strava.com/activities/12345" />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders loading state while fetching stats', () => {
    global.fetch = vi.fn().mockImplementation(() => new Promise(() => {}));

    render(<GpxStatsDisplay url="https://example.com/tour.gpx" />);
    expect(screen.getByText(/analyse de la trace/i)).toBeInTheDocument();
  });

  it('renders calculated distance, elevation, and estimated time upon successful fetch', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        distance: '78.5',
        elevation: 640,
        estimatedTime: '3h15',
      }),
    } as any);

    render(<GpxStatsDisplay url="https://example.com/tour.gpx" />);

    await waitFor(() => {
      expect(screen.getByText(/78\.5 km/i)).toBeInTheDocument();
      expect(screen.getByText(/D\+ 640m/i)).toBeInTheDocument();
      expect(screen.getByText(/~ 3h15/i)).toBeInTheDocument();
    });
  });

  it('renders null when fetch fails', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

    const { container } = render(<GpxStatsDisplay url="https://example.com/tour.gpx" />);

    await waitFor(() => {
      expect(screen.queryByText(/analyse de la trace/i)).not.toBeInTheDocument();
    });
    expect(container.firstChild).toBeNull();
  });
});
