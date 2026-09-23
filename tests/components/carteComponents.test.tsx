/**
 * @vitest-environment jsdom
 */
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { GeodeticMark } from '@/app/components/carte/GeodeticMark';
import { ScaleBar, NorthArrow } from '@/app/components/carte/ScaleBar';
import { RoadSwatch } from '@/app/components/carte/RoadSwatch';
import { Wordmark } from '@/app/components/brand/Wordmark';

describe('Carte Components Suite', () => {
  describe('GeodeticMark', () => {
    it('renders the SVG geodetic benchmark symbol', () => {
      const { container } = render(<GeodeticMark className="custom-mark" title="Point géodésique" />);
      const svg = container.querySelector('svg');
      expect(svg).toBeDefined();
      expect(svg?.getAttribute('role')).toBe('img');
      expect(screen.getByText('Point géodésique')).toBeDefined();
    });
  });

  describe('ScaleBar & NorthArrow', () => {
    it('renders graphic scale bar with alternating segments and label', () => {
      const { container } = render(<ScaleBar km={5} label={true} />);
      expect(container.textContent).toContain('0');
      expect(container.textContent).toContain('5 km');
      expect(container.querySelectorAll('.h-full.flex-1').length).toBe(5);
    });

    it('renders the NorthArrow with cardinal N', () => {
      const { container } = render(<NorthArrow />);
      expect(container.querySelector('svg')).toBeDefined();
      expect(container.textContent).toBe('N');
    });
  });

  describe('RoadSwatch', () => {
    it('renders distinct road class markings for groups A, B, C, VTT', () => {
      const { container: aContainer } = render(<RoadSwatch group="A" />);
      expect(aContainer.querySelector('.stroke-brand-vif')).not.toBeNull();

      const { container: bContainer } = render(<RoadSwatch group="B" />);
      expect(bContainer.querySelector('.stroke-ambre')).not.toBeNull();

      const { container: cContainer } = render(<RoadSwatch group="C" />);
      expect(cContainer.querySelector('line')).not.toBeNull();

      const { container: vttContainer } = render(<RoadSwatch group="VTT" />);
      expect(vttContainer.querySelector('.fill-bois')).not.toBeNull();
    });
  });

  describe('Wordmark', () => {
    it('renders the club wordmark linking to home', () => {
      render(<Wordmark size="md" withSubline={true} />);
      const link = screen.getByRole('link', { name: /CC Saint-Martin Blanmont/i });
      expect(link).toBeDefined();
      expect(link.getAttribute('href')).toBe('/');
      expect(screen.getByText(/Blanmont/i)).toBeDefined();
      expect(screen.getByText(/Cyclo Club/i)).toBeDefined();
    });
  });
});
