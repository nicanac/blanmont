/**
 * @vitest-environment jsdom
 */
import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import LocalClubJsonLd from '@/app/components/seo/LocalClubJsonLd';

describe('LocalClubJsonLd component', () => {
  it('renders a script tag with application/ld+json and valid schema properties', () => {
    const { container } = render(<LocalClubJsonLd />);
    const scriptTag = container.querySelector('script[type="application/ld+json"]');

    expect(scriptTag).not.toBeNull();
    const jsonContent = JSON.parse(scriptTag!.innerHTML);

    expect(jsonContent['@context']).toBe('https://schema.org');
    expect(Array.isArray(jsonContent['@graph'])).toBe(true);

    const club = jsonContent['@graph'][0];
    expect(club.name).toBe('Cyclo Club Saint-Martin Blanmont');
    expect(club.address.addressLocality).toBe('Chastre');
    expect(club.address.postalCode).toBe('1450');
    expect(club.geo.latitude).toBeCloseTo(50.6087);
    expect(club.geo.longitude).toBeCloseTo(4.6738);
    expect(club.sport).toContain('Road Cycling');
  });
});
