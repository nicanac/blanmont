/**
 * @vitest-environment jsdom
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

vi.mock('leaflet/dist/leaflet.css', () => ({}));
vi.mock('leaflet', () => {
  const L = {
    Icon: { Default: { prototype: {}, mergeOptions: vi.fn() } },
    geoJSON: vi.fn(() => ({ getBounds: vi.fn() })),
    latLngBounds: vi.fn(),
  };
  return { default: L, ...L };
});
// The map container exposes the Leaflet options it receives.
vi.mock('react-leaflet', () => ({
  MapContainer: ({
    children,
    ...options
  }: Record<string, unknown> & { children: React.ReactNode }) => (
    <div
      data-testid="map"
      data-options={JSON.stringify(
        Object.fromEntries(
          Object.entries(options).filter(([, v]) => ['boolean', 'number'].includes(typeof v))
        )
      )}
    >
      {children}
    </div>
  ),
  TileLayer: () => null,
  Polyline: () => <div data-testid="polyline" />,
  GeoJSON: () => null,
  useMap: () => ({ fitBounds: vi.fn() }),
}));

import MapPreview from '@/app/components/ui/MapPreview';

const POLYLINE = '_p~iF~ps|U_ulLnnqC';
const options = (): Record<string, boolean> =>
  JSON.parse(screen.getByTestId('map').getAttribute('data-options')!);

describe('MapPreview', () => {
  it('stays pannable and zoomable by default (wheel zoom off)', () => {
    render(<MapPreview summaryPolyline={POLYLINE} />);
    expect(options()).toEqual({
      scrollWheelZoom: false,
      dragging: true,
      touchZoom: true,
      doubleClickZoom: true,
      boxZoom: true,
      keyboard: true,
      zoomControl: true,
      zoom: 12,
      zoomSnap: 1,
    });
    expect(screen.getByTestId('polyline')).toBeInTheDocument();
  });

  it('is a static preview when interactive is false (no touch scroll trap, no focus stop)', () => {
    render(<MapPreview summaryPolyline={POLYLINE} interactive={false} />);
    expect(options()).toEqual({
      scrollWheelZoom: false,
      dragging: false,
      touchZoom: false,
      doubleClickZoom: false,
      boxZoom: false,
      keyboard: false,
      zoomControl: false,
      zoom: 12,
      zoomSnap: 0.25,
    });
  });
});
