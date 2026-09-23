/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeAll } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import HomeCover from '@/app/components/home/HomeCover';
import type { ScheduledRideInfo } from '@/app/lib/firebase/calendar';
import type { RideWeather } from '@/app/lib/weather';
import type { HeroSettings, WeekendPoll } from '@/app/types';

const sampleRide: ScheduledRideInfo = {
  isoDate: '2026-09-27',
  dateFormatted: 'Dimanche 27 Septembre 2026',
  location: 'Blanmont',
  departure: '09h00',
  distances: '85 km',
  address: 'Place de la Féchère, 1450 Chastre',
  remarks: '',
  gpxUrl: 'https://www.strava.com/routes/12345',
  isCustomEvent: false,
};

const sampleWeather: RideWeather = {
  isAvailable: true,
  temperature: 18,
  condition: 'Éclaircies',
  weatherCode: 2,
  precipitationProb: 10,
  windSpeed: 15,
  windDirection: 225,
  windCardinal: 'SO',
};

const sampleSettings: HeroSettings = {
  badge: 'Peloton CC Saint-Martin · Blanmont',
  slides: [{ id: 's1', url: '/images/slide-1.jpg', alt: 'Peloton' }],
  cards: [
    { id: 'c1', icon: 'calendar', label: 'Sorties', value: 'Samedi & Dimanche' },
    { id: 'c2', icon: 'pin', label: 'Rassemblement', value: 'Place de la Féchère' },
  ],
};

const samplePoll: WeekendPoll = {
  id: 'poll-1',
  title: 'Sortie du 27 Septembre',
  weekendIsoDate: '2026-09-27',
  status: 'active',
  createdAt: '2026-09-21T08:00:00Z',
  createdBy: 'admin',
};

describe('HomeCover Component (app/components/home/HomeCover.tsx)', () => {
  beforeAll(() => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  });

  it('renders the cartouche header with geodetic coordinates and next departure indicator', () => {
    render(
      <HomeCover
        nextRide={sampleRide}
        weather={sampleWeather}
        heroSettings={sampleSettings}
        activePoll={samplePoll}
        ridersAnnounced={12}
      />
    );

    // Coordinates strip
    expect(screen.getByText(/50°37′23″ N/i)).toBeInTheDocument();
    expect(screen.getByText('Prochain départ')).toBeInTheDocument();

    // Title and departure time
    expect(screen.getByText(/Départ 09h00/i)).toBeInTheDocument();
    expect(screen.getByText(/Place de Blanmont/i)).toBeInTheDocument();
  });

  it('renders weather and wind telemetry in the cartouche', () => {
    render(
      <HomeCover
        nextRide={sampleRide}
        weather={sampleWeather}
        heroSettings={sampleSettings}
        activePoll={samplePoll}
        ridersAnnounced={12}
      />
    );

    expect(screen.getByText(/Météo au départ/i)).toBeInTheDocument();
    expect(screen.getByText(/18 °C/i)).toBeInTheDocument();
    expect(screen.getByText('Vent', { selector: 'dt' })).toBeInTheDocument();
    expect(screen.getByText(/15 km\/h/i)).toBeInTheDocument();
  });

  it('renders the action buttons and announced riders count', () => {
    render(
      <HomeCover
        nextRide={sampleRide}
        weather={sampleWeather}
        heroSettings={sampleSettings}
        activePoll={samplePoll}
        ridersAnnounced={12}
      />
    );

    expect(screen.getByRole('link', { name: /Je roule ce week-end/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Trace sur Strava/i })).toBeInTheDocument();
    expect(screen.getByText(/12/i)).toBeInTheDocument();
    expect(screen.getByText(/déjà annoncés/i)).toBeInTheDocument();
  });

  it('renders calendar CTA when poll is inactive', () => {
    render(
      <HomeCover
        nextRide={sampleRide}
        weather={null}
        heroSettings={sampleSettings}
        activePoll={null}
        ridersAnnounced={0}
      />
    );

    expect(screen.getByRole('link', { name: /Voir le calendrier/i })).toBeInTheDocument();
  });

  it('renders lower sheet margin with cards and scale bar', () => {
    render(
      <HomeCover
        nextRide={sampleRide}
        weather={sampleWeather}
        heroSettings={sampleSettings}
        activePoll={samplePoll}
        ridersAnnounced={12}
      />
    );

    expect(screen.getByText('Sorties')).toBeInTheDocument();
    expect(screen.getByText('Samedi & Dimanche')).toBeInTheDocument();
    expect(screen.getByText('Rassemblement')).toBeInTheDocument();
  });
});
