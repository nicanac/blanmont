/**
 * @vitest-environment jsdom
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Button } from '@/app/components/ui/Button';

describe('Button component', () => {
  it('renders children correctly', () => {
    render(<Button>Rejoindre le club</Button>);
    expect(screen.getByRole('button', { name: /rejoindre le club/i })).toBeInTheDocument();
  });

  it('handles click events', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Cliquer ici</Button>);

    const button = screen.getByRole('button', { name: /cliquer ici/i });
    fireEvent.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('respects disabled state', () => {
    const handleClick = vi.fn();
    render(<Button disabled onClick={handleClick}>Désactivé</Button>);

    const button = screen.getByRole('button', { name: /désactivé/i });
    expect(button).toBeDisabled();
    fireEvent.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('applies variant classes accurately', () => {
    const { rerender } = render(<Button variant="destructive">Supprimer</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-red-500');

    rerender(<Button variant="outline">Contour</Button>);
    expect(screen.getByRole('button')).toHaveClass('border');

    rerender(<Button variant="ghost">Fantôme</Button>);
    expect(screen.getByRole('button')).toHaveClass('hover:bg-[#f2efe9]');
  });

  it('applies size classes accurately', () => {
    const { rerender } = render(<Button size="sm">Petit</Button>);
    expect(screen.getByRole('button')).toHaveClass('sm:h-9');

    rerender(<Button size="lg">Grand</Button>);
    expect(screen.getByRole('button')).toHaveClass('h-11');
  });
});
