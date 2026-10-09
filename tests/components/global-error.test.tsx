/**
 * @vitest-environment jsdom
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import * as Sentry from '@sentry/nextjs';
import GlobalError from '@/app/global-error';

vi.mock('@sentry/nextjs', () => ({
  captureException: vi.fn(),
  init: vi.fn(),
  replayIntegration: vi.fn(),
}));

describe('GlobalError component', () => {
  it('renders critical error message and triggers Sentry captureException', () => {
    const mockReset = vi.fn();
    const mockError = new Error('Test fatal crash');

    render(<GlobalError error={mockError} reset={mockReset} />);

    expect(screen.getByText(/Erreur Critique/i)).toBeInTheDocument();
    expect(Sentry.captureException).toHaveBeenCalledWith(mockError);

    const reloadButton = screen.getByRole('button', { name: /Recharger l'application/i });
    expect(reloadButton).toBeInTheDocument();

    fireEvent.click(reloadButton);
    expect(mockReset).toHaveBeenCalledTimes(1);
  });
});
