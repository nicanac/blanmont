import { describe, it, expect } from 'vitest';
import { cn } from '@/app/utils/cn';

describe('cn utility', () => {
  it('combines class names correctly', () => {
    expect(cn('btn', 'btn-primary')).toBe('btn btn-primary');
  });

  it('handles conditional class names', () => {
    const isActive = true;
    const isDisabled = false;
    expect(cn('btn', isActive && 'active', isDisabled && 'disabled')).toBe('btn active');
  });

  it('resolves conflicting Tailwind classes via tailwind-merge', () => {
    expect(cn('p-2', 'p-4')).toBe('p-4');
    expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500');
    expect(cn('bg-red-500', 'hover:bg-red-600', 'bg-blue-500')).toBe('hover:bg-red-600 bg-blue-500');
  });

  it('handles empty, null, and undefined values cleanly', () => {
    expect(cn('', null, undefined, false)).toBe('');
    expect(cn('base', null, undefined)).toBe('base');
  });

  it('supports array inputs and nested objects', () => {
    expect(cn(['foo', 'bar'])).toBe('foo bar');
    expect(cn({ hidden: true, block: false })).toBe('hidden');
  });
});
