/**
 * @vitest-environment jsdom
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import GobikSizeGuide, { MEN_SIZE_CHART, WOMEN_SIZE_CHART } from '@/app/components/equipment/GobikSizeGuide';

describe('GobikSizeGuide component', () => {
  it('returns null when isOpen is false', () => {
    const { container } = render(
      <GobikSizeGuide isOpen={false} onClose={vi.fn()} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders modal with men fit chart by default', () => {
    render(<GobikSizeGuide isOpen={true} onClose={vi.fn()} />);

    expect(screen.getByText(/guide des tailles & mensurations/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /coupe homme/i })).toBeInTheDocument();

    // Check men size chart rows exist
    for (const item of MEN_SIZE_CHART) {
      expect(screen.getAllByText(item.size).length).toBeGreaterThanOrEqual(1);
    }
  });

  it('switches between Men Fit and Women Fit charts', () => {
    render(<GobikSizeGuide isOpen={true} onClose={vi.fn()} defaultGender="men" />);

    // Click women fit
    const womenBtn = screen.getByRole('button', { name: /coupe femme/i });
    fireEvent.click(womenBtn);

    // Women XS chest measurement is 78 - 82
    expect(screen.getByText('78 - 82')).toBeInTheDocument();

    // Click men fit again
    const menBtn = screen.getByRole('button', { name: /coupe homme/i });
    fireEvent.click(menBtn);

    // Men XS chest measurement is 88 - 92
    expect(screen.getByText('88 - 92')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    const handleClose = vi.fn();
    render(<GobikSizeGuide isOpen={true} onClose={handleClose} />);

    const closeBtn = screen.getByRole('button', { name: /fermer le guide des tailles/i });
    fireEvent.click(closeBtn);

    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
