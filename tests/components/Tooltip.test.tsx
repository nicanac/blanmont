/**
 * @vitest-environment jsdom
 */
import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import Tooltip from '@/app/components/ui/Tooltip';

describe('Tooltip Component', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it('renders trigger child and does not show tooltip content initially', () => {
    render(
      <Tooltip content="Synchroniser Google Sheet" badge="Sync">
        <button type="button">Bouton Test</button>
      </Tooltip>
    );

    expect(screen.getByText('Bouton Test')).toBeInTheDocument();
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('shows tooltip content and badge on mouseEnter after delay', () => {
    render(
      <Tooltip content="Synchroniser les présences" badge="Google Sheet" delayMs={100}>
        <button type="button">Synchroniser</button>
      </Tooltip>
    );

    const button = screen.getByRole('button', { name: 'Synchroniser' });

    // Hover
    fireEvent.mouseEnter(button);

    // Before timer, not yet visible
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();

    // Advance timers
    act(() => {
      vi.advanceTimersByTime(110);
    });

    const tooltip = screen.getByRole('tooltip');
    expect(tooltip).toBeInTheDocument();
    expect(tooltip).toHaveTextContent('Synchroniser les présences');
    expect(tooltip).toHaveTextContent('Google Sheet');
  });

  it('hides tooltip immediately on mouseLeave', () => {
    render(
      <Tooltip content="Informations supplémentaires" delayMs={50}>
        <button type="button">Survolez-moi</button>
      </Tooltip>
    );

    const button = screen.getByRole('button', { name: 'Survolez-moi' });

    fireEvent.mouseEnter(button);
    act(() => {
      vi.advanceTimersByTime(60);
    });

    expect(screen.getByRole('tooltip')).toBeInTheDocument();

    // Leave
    fireEvent.mouseLeave(button);

    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('shows tooltip on focus and hides on blur for keyboard accessibility', () => {
    render(
      <Tooltip content="Action accessible" badge="Clavier" delayMs={50}>
        <button type="button">Focus me</button>
      </Tooltip>
    );

    const button = screen.getByRole('button', { name: 'Focus me' });

    fireEvent.focus(button);
    act(() => {
      vi.advanceTimersByTime(60);
    });

    expect(screen.getByRole('tooltip')).toBeInTheDocument();
    expect(screen.getByRole('tooltip')).toHaveTextContent('Action accessible');

    fireEvent.blur(button);
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('closes tooltip when Escape key is pressed', () => {
    render(
      <Tooltip content="Fermer avec Escape" delayMs={50}>
        <button type="button">Escape test</button>
      </Tooltip>
    );

    const button = screen.getByRole('button', { name: 'Escape test' });

    fireEvent.mouseEnter(button);
    act(() => {
      vi.advanceTimersByTime(60);
    });

    expect(screen.getByRole('tooltip')).toBeInTheDocument();

    // Press Escape
    fireEvent.keyDown(window, { key: 'Escape' });

    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('does not display tooltip when disabled is true', () => {
    render(
      <Tooltip content="Contenu masqué" disabled delayMs={50}>
        <button type="button">Bouton Désactivé</button>
      </Tooltip>
    );

    const button = screen.getByRole('button', { name: 'Bouton Désactivé' });
    fireEvent.mouseEnter(button);
    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('renders visual pointer arrow and adapts position when followPointer is true', () => {
    render(
      <Tooltip content="Embarquement rapide" badge="Départ" side="top" followPointer delayMs={50}>
        <button type="button">Pointage Mobile</button>
      </Tooltip>
    );

    const button = screen.getByRole('button', { name: 'Pointage Mobile' });

    // Mock getBoundingClientRect
    vi.spyOn(button, 'getBoundingClientRect').mockReturnValue({
      top: 200,
      bottom: 240,
      left: 100,
      right: 300,
      width: 200,
      height: 40,
      x: 100,
      y: 200,
      toJSON: () => {},
    });

    // Enter with pointer coordinates at clientX = 180
    fireEvent.mouseEnter(button, { clientX: 180, clientY: 220 });
    act(() => {
      vi.advanceTimersByTime(60);
    });

    const tooltip = screen.getByRole('tooltip');
    expect(tooltip).toBeInTheDocument();
    expect(tooltip).toHaveTextContent('Embarquement rapide');
    expect(tooltip).toHaveTextContent('Départ');

    // Visual pointer arrow should be present
    const arrow = tooltip.querySelector('svg');
    expect(arrow).toBeInTheDocument();
  });
});
