/**
 * @vitest-environment jsdom
 */
import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useIsMounted } from '@/app/utils/useIsMounted';

describe('useIsMounted', () => {
  it('returns true when component has mounted on client', () => {
    const { result } = renderHook(() => useIsMounted());
    expect(result.current).toBe(true);
  });
});
