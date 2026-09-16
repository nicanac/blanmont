/**
 * @vitest-environment jsdom
 */
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import RideWeatherBadge from '@/app/components/ui/RideWeatherBadge';
import * as weatherLib from '@/app/lib/weather';

describe('RideWeatherBadge component', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders loading state initially', () => {
    vi.spyOn(weatherLib, 'getRideWeather').mockImplementation(() => new Promise(() => {}));

    render(<RideWeatherBadge isoDate="2026-05-16" departure="8h30" />);
    expect(screen.getByText(/météo\.\.\./i)).toBeInTheDocument();
  });

  it('renders fallback badge when weather is not yet available (> J-14)', async () => {
    vi.spyOn(weatherLib, 'getRideWeather').mockResolvedValue({
      isAvailable: false,
      temperature: 0,
      condition: '',
      icon: '',
      windSpeed: 0,
      windDirection: 0,
      windCardinal: 'N',
      windDescription: '',
      precipitationProb: 0,
    });

    render(<RideWeatherBadge isoDate="2026-09-30" />);

    await waitFor(() => {
      expect(screen.getByText(/météo disponible j-14/i)).toBeInTheDocument();
    });
  });

  it('renders weather forecast details when data is available', async () => {
    vi.spyOn(weatherLib, 'getRideWeather').mockResolvedValue({
      isAvailable: true,
      temperature: 19,
      condition: 'Éclaircies agréables',
      icon: '⛅',
      windSpeed: 14,
      windDirection: 210,
      windCardinal: 'SO',
      windDescription: 'Vent modéré',
      precipitationProb: 25,
    });

    render(<RideWeatherBadge isoDate="2026-05-16" departure="8h30" />);

    await waitFor(() => {
      expect(screen.getByText(/éclaircies agréables/i)).toBeInTheDocument();
      expect(screen.getByText('19°C')).toBeInTheDocument();
      expect(screen.getByText(/14 km\/h/i)).toBeInTheDocument();
      expect(screen.getByText(/25% pluie/i)).toBeInTheDocument();
      expect(screen.getByText(/vent faible/i)).toBeInTheDocument();
    });
  });

  it('renders compact mode when compact prop is true', async () => {
    vi.spyOn(weatherLib, 'getRideWeather').mockResolvedValue({
      isAvailable: true,
      temperature: 22,
      condition: 'Ensoleillé',
      icon: '☀️',
      windSpeed: 18,
      windDirection: 90,
      windCardinal: 'E',
      windDescription: 'Brise légère',
      precipitationProb: 0,
    });

    render(<RideWeatherBadge isoDate="2026-05-16" compact={true} />);

    await waitFor(() => {
      expect(screen.getByText('22°C')).toBeInTheDocument();
      expect(screen.getByText(/18 km\/h/i)).toBeInTheDocument();
    });
  });
});
