/**
 * @vitest-environment jsdom
 */
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useImageUpload } from '@/app/hooks/useImageUpload';

describe('useImageUpload', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('should initialize with correct default state', () => {
    const { result } = renderHook(() => useImageUpload());

    expect(result.current.progress).toBe(0);
    expect(result.current.error).toBeNull();
    expect(result.current.isUploading).toBe(false);
    expect(typeof result.current.uploadImage).toBe('function');
  });

  it('should handle successful upload and update progress', async () => {
    const mockUrl = 'https://example.com/image.jpg';
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ url: mockUrl }),
    });

    const { result } = renderHook(() => useImageUpload());
    const file = new File(['dummy content'], 'test.png', { type: 'image/png' });

    let uploadPromise: Promise<string>;

    act(() => {
      uploadPromise = result.current.uploadImage(file, 'test-path');
    });

    // Check immediate state change
    expect(result.current.isUploading).toBe(true);
    expect(result.current.error).toBeNull();
    expect(result.current.progress).toBe(0);

    // Fast-forward time to simulate progress
    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(result.current.progress).toBe(10);

    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(result.current.progress).toBe(30);

    // Resolve the fetch promise
    const url = await act(async () => {
      return await uploadPromise;
    });

    expect(url).toBe(mockUrl);
    expect(result.current.isUploading).toBe(false);
    expect(result.current.progress).toBe(100);

    // Verify fetch was called correctly
    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith('/api/upload', expect.objectContaining({
      method: 'POST',
      body: expect.any(FormData),
    }));
  });

  it('should handle API error gracefully', async () => {
    const errorMessage = 'Custom upload error';
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: errorMessage }),
    });

    const { result } = renderHook(() => useImageUpload());
    const file = new File(['dummy content'], 'test.png', { type: 'image/png' });

    let uploadPromise: Promise<string>;

    act(() => {
      uploadPromise = result.current.uploadImage(file, 'test-path');
    });

    expect(result.current.isUploading).toBe(true);

    await act(async () => {
      await expect(uploadPromise).rejects.toThrow(errorMessage);
    });

    expect(result.current.isUploading).toBe(false);
    expect(result.current.error).toBe(errorMessage);
  });

  it('should handle default API error message when none is provided', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      json: async () => ({}),
    });

    const { result } = renderHook(() => useImageUpload());
    const file = new File(['dummy content'], 'test.png', { type: 'image/png' });

    let uploadPromise: Promise<string>;

    act(() => {
      uploadPromise = result.current.uploadImage(file, 'test-path');
    });

    await act(async () => {
      await expect(uploadPromise).rejects.toThrow('Upload failed');
    });

    expect(result.current.error).toBe('Upload failed');
  });

  it('should handle network error gracefully', async () => {
    const networkError = new Error('Network error');
    (global.fetch as any).mockRejectedValueOnce(networkError);

    const { result } = renderHook(() => useImageUpload());
    const file = new File(['dummy content'], 'test.png', { type: 'image/png' });

    let uploadPromise: Promise<string>;

    act(() => {
      uploadPromise = result.current.uploadImage(file, 'test-path');
    });

    expect(result.current.isUploading).toBe(true);

    await act(async () => {
      await expect(uploadPromise).rejects.toThrow('Network error');
    });

    expect(result.current.isUploading).toBe(false);
    expect(result.current.error).toBe('Network error');
  });
});
