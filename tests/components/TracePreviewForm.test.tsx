/**
 * @vitest-environment jsdom
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import TracePreviewForm from '@/app/features/import/components/TracePreviewForm';

// Leaflet needs a real browser: the map is not under test here.
vi.mock('next/dynamic', () => ({
  default: () =>
    function MapStub() {
      return <div data-testid="map-preview" />;
    },
}));

const gpxPreview = {
  name: 'NordEst_Tirlemont_105km',
  distance: 104501.5948720771, // metres, as summed from the GPX points
  total_elevation_gain: 796,
  map: { summary_polyline: '_p~iF~ps|U_ulLnnqC' },
  total_photo_count: 0,
};

describe('TracePreviewForm (#254)', () => {
  it('creates the trace in the club database, never "in Notion"', () => {
    render(<TracePreviewForm data={gpxPreview} onImport={vi.fn()} isLoading={false} />);

    expect(screen.getByRole('button', { name: 'Créer le parcours' })).toBeTruthy();
    expect(document.body.textContent).not.toMatch(/notion/i);
  });

  it('rounds the GPX distance to 0.1 km and sends the reviewed values', () => {
    const onImport = vi.fn().mockResolvedValue(undefined);
    render(<TracePreviewForm data={gpxPreview} onImport={onImport} isLoading={false} />);

    expect((screen.getByDisplayValue('104.5') as HTMLInputElement).type).toBe('number');

    fireEvent.click(screen.getByRole('button', { name: 'Créer le parcours' }));

    expect(onImport).toHaveBeenCalledWith({
      name: 'NordEst_Tirlemont_105km',
      direction: 'North',
      surface: 'Road',
      rating: '⭐⭐⭐',
      distance: 104.5,
      elevation: 796,
      description: '',
    });
  });

  it('shows the pending state while the trace is saved', () => {
    render(<TracePreviewForm data={gpxPreview} onImport={vi.fn()} isLoading />);
    const button = screen.getByRole('button', { name: 'Création en cours...' }) as HTMLButtonElement;
    expect(button.disabled).toBe(true);
  });
});
