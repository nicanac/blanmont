/**
 * @vitest-environment jsdom
 */
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useFocusTrap } from '@/app/hooks/useFocusTrap';

describe('useFocusTrap', () => {
  let container: HTMLDivElement;
  let btn1: HTMLButtonElement;
  let btn2: HTMLButtonElement;
  let btn3: HTMLButtonElement;

  beforeEach(() => {
    vi.useFakeTimers();
    container = document.createElement('div');
    btn1 = document.createElement('button');
    btn1.textContent = 'Button 1';
    btn2 = document.createElement('button');
    btn2.textContent = 'Button 2';
    btn3 = document.createElement('button');
    btn3.textContent = 'Button 3';

    container.appendChild(btn1);
    container.appendChild(btn2);
    container.appendChild(btn3);
    document.body.appendChild(container);
    document.body.style.overflow = 'visible';
  });

  afterEach(() => {
    vi.useRealTimers();
    document.body.removeChild(container);
    document.body.style.overflow = '';
  });

  it('does not lock scroll or focus when isOpen is false', () => {
    const onClose = vi.fn();
    const { result } = renderHook(() =>
      useFocusTrap({ isOpen: false, onClose })
    );

    // Assign ref
    (result.current as any).current = container;

    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(document.body.style.overflow).toBe('visible');
    expect(document.activeElement).not.toBe(btn1);
  });

  it('locks body scroll to hidden when isOpen is true and focuses first element', () => {
    const onClose = vi.fn();
    const { result } = renderHook(() =>
      useFocusTrap({ isOpen: true, onClose })
    );

    (result.current as any).current = container;

    expect(document.body.style.overflow).toBe('hidden');

    act(() => {
      vi.advanceTimersByTime(60);
    });

    expect(document.activeElement).toBe(btn1);
  });

  it('focuses initialFocusRef when provided', () => {
    const initialRef = { current: btn2 };
    const { result } = renderHook(() =>
      useFocusTrap({ isOpen: true, initialFocusRef: initialRef })
    );

    (result.current as any).current = container;

    act(() => {
      vi.advanceTimersByTime(60);
    });

    expect(document.activeElement).toBe(btn2);
  });

  it('calls onClose when Escape key is pressed', () => {
    const onClose = vi.fn();
    const { result } = renderHook(() =>
      useFocusTrap({ isOpen: true, onClose })
    );

    (result.current as any).current = container;

    const event = new KeyboardEvent('keydown', { key: 'Escape', cancelable: true });
    act(() => {
      window.dispatchEvent(event);
    });

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('wraps focus with Tab and Shift+Tab', () => {
    const { result } = renderHook(() =>
      useFocusTrap({ isOpen: true })
    );

    (result.current as any).current = container;

    // Focus last button, press Tab -> should wrap to btn1
    btn3.focus();
    expect(document.activeElement).toBe(btn3);

    const tabEvent = new KeyboardEvent('keydown', { key: 'Tab', shiftKey: false, cancelable: true });
    act(() => {
      window.dispatchEvent(tabEvent);
    });
    expect(document.activeElement).toBe(btn1);

    // Focus first button, press Shift+Tab -> should wrap to btn3
    btn1.focus();
    expect(document.activeElement).toBe(btn1);

    const shiftTabEvent = new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, cancelable: true });
    act(() => {
      window.dispatchEvent(shiftTabEvent);
    });
    expect(document.activeElement).toBe(btn3);
  });

  it('restores original body overflow and removes listeners upon unmount', () => {
    const onClose = vi.fn();
    const { result, unmount } = renderHook(() =>
      useFocusTrap({ isOpen: true, onClose })
    );

    (result.current as any).current = container;
    expect(document.body.style.overflow).toBe('hidden');

    unmount();
    expect(document.body.style.overflow).toBe('visible');

    // Escape after unmount should do nothing
    const event = new KeyboardEvent('keydown', { key: 'Escape', cancelable: true });
    act(() => {
      window.dispatchEvent(event);
    });
    expect(onClose).not.toHaveBeenCalled();
  });
});
