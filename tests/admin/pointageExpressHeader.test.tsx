/**
 * @vitest-environment jsdom
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import PointageExpressHeader from '@/app/admin/pointage-express/components/PointageExpressHeader';

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe('PointageExpressHeader component', () => {
  it('renders IGN sheet cartouche title, badge, description and legend facts', () => {
    render(<PointageExpressHeader eventCount={24} memberCount={118} />);

    // Title and badge
    expect(screen.getByText('Pointage Express')).toBeInTheDocument();
    expect(screen.getByText('Départ Peloton')).toBeInTheDocument();

    // Topographic cartouche legend facts
    expect(screen.getByText('Tablette & Smartphone')).toBeInTheDocument();
    expect(screen.getByText('1-Tap & Scan QR')).toBeInTheDocument();
    expect(screen.getByText('118 membres')).toBeInTheDocument();
    expect(screen.getByText('24 sorties au calendrier')).toBeInTheDocument();

    // Action button linking to Carré Vert
    const link = screen.getByRole('link', { name: /pointage carré vert/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/admin/carre-vert');

    // Guide & Secours button
    const guideBtn = screen.getByRole('button', { name: /guide/i });
    expect(guideBtn).toBeInTheDocument();
  });

  it('opens tutorial modal when clicking Guide & Secours ICE', () => {
    render(<PointageExpressHeader eventCount={24} memberCount={118} />);

    const guideBtn = screen.getByRole('button', { name: /guide/i });
    fireEvent.click(guideBtn);

    // Modal should now be open with tutorial tabs
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Guide du Pointage Express')).toBeInTheDocument();
    expect(screen.getByText(/1\. Émargement Tactile/i)).toBeInTheDocument();
  });
});
