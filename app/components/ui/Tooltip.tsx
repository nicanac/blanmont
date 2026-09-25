'use client';

import React, {
  useState,
  useRef,
  useEffect,
  useId,
  useCallback,
  cloneElement,
  isValidElement,
} from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/app/utils/cn';
import { useIsMounted } from '@/app/utils/useIsMounted';

export interface TooltipProps {
  /** The text or custom node to display in the tooltip */
  content?: React.ReactNode;
  /** Optional badge displayed next to the text (e.g. "Départ", "Google Sheet") */
  badge?: string;
  /** Preferred placement relative to the trigger element */
  side?: 'top' | 'bottom' | 'left' | 'right';
  /** Delay in milliseconds before showing tooltip (default: 120ms) */
  delayMs?: number;
  /** Disable tooltip display */
  disabled?: boolean;
  /** Adapt position and arrow to mouse pointer location */
  followPointer?: boolean;
  /** Additional classes for tooltip container */
  className?: string;
  /** Target trigger element */
  children: React.ReactElement<{
    onMouseEnter?: (e: React.MouseEvent) => void;
    onMouseMove?: (e: React.MouseEvent) => void;
    onMouseLeave?: (e: React.MouseEvent) => void;
    onFocus?: (e: React.FocusEvent) => void;
    onBlur?: (e: React.FocusEvent) => void;
    'aria-describedby'?: string;
    title?: string;
  }>;
}

interface PositionCoords {
  top: number;
  left: number;
  transform?: string;
  actualSide: 'top' | 'bottom' | 'left' | 'right';
  arrowLeft?: number;
}

export default function Tooltip({
  content,
  badge,
  side = 'top',
  delayMs = 120,
  disabled = false,
  followPointer = false,
  className,
  children,
}: TooltipProps): React.ReactElement {
  const isMounted = useIsMounted();
  const tooltipId = useId();
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState<PositionCoords | null>(null);

  const activeElementRef = useRef<HTMLElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const pointerPosRef = useRef<{ x: number; y: number } | null>(null);
  const showTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const calculatePosition = useCallback(
    (element: HTMLElement): PositionCoords | null => {
      if (typeof window === 'undefined') return null;

      const rect = element.getBoundingClientRect();
      const margin = 8;
      let actualSide = side;

      const spaceAbove = rect.top;
      const spaceBelow = window.innerHeight - rect.bottom;

      // Smart flip if preferred side has insufficient clearance
      if (actualSide === 'top' && spaceAbove < 48 && spaceBelow > spaceAbove) {
        actualSide = 'bottom';
      } else if (actualSide === 'bottom' && spaceBelow < 48 && spaceAbove > spaceBelow) {
        actualSide = 'top';
      }

      // Determine horizontal target anchor: pointer position if available, else element center
      let targetX = rect.left + rect.width / 2;
      if (followPointer && pointerPosRef.current) {
        targetX = Math.max(rect.left + 8, Math.min(rect.right - 8, pointerPosRef.current.x));
      }

      const tooltipWidth = tooltipRef.current?.offsetWidth || 240;
      let left = targetX - tooltipWidth / 2;

      // Keep within screen boundaries
      const padding = 16;
      const minLeft = padding;
      const maxLeft = Math.max(padding, window.innerWidth - tooltipWidth - padding);
      left = Math.max(minLeft, Math.min(maxLeft, left));

      // Calculate arrow offset relative to the tooltip box
      const arrowLeft = Math.max(12, Math.min(tooltipWidth - 12, targetX - left));

      let top = 0;
      let transform: string | undefined = undefined;

      switch (actualSide) {
        case 'bottom':
          top = rect.bottom + margin;
          break;
        case 'left':
          top = rect.top + rect.height / 2;
          left = rect.left - tooltipWidth - margin;
          transform = 'translateY(-50%)';
          break;
        case 'right':
          top = rect.top + rect.height / 2;
          left = rect.right + margin;
          transform = 'translateY(-50%)';
          break;
        case 'top':
        default:
          top = rect.top - margin;
          transform = 'translateY(-100%)';
          break;
      }

      return { top, left, transform, actualSide, arrowLeft };
    },
    [side, followPointer]
  );

  const showTooltip = useCallback(
    (targetEl: HTMLElement) => {
      if (disabled || !content) return;
      activeElementRef.current = targetEl;
      if (showTimeoutRef.current) clearTimeout(showTimeoutRef.current);

      showTimeoutRef.current = setTimeout(() => {
        if (!activeElementRef.current) return;
        const pos = calculatePosition(activeElementRef.current);
        if (pos) {
          setCoords(pos);
          setIsOpen(true);
        }
      }, delayMs);
    },
    [calculatePosition, content, delayMs, disabled]
  );

  const hideTooltip = useCallback(() => {
    if (showTimeoutRef.current) clearTimeout(showTimeoutRef.current);
    activeElementRef.current = null;
    pointerPosRef.current = null;
    setIsOpen(false);
  }, []);

  // Close on window scroll, resize, or escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleScrollOrResize = () => hideTooltip();
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') hideTooltip();
    };

    window.addEventListener('scroll', handleScrollOrResize, true);
    window.addEventListener('resize', handleScrollOrResize);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('scroll', handleScrollOrResize, true);
      window.removeEventListener('resize', handleScrollOrResize);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, hideTooltip]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (showTimeoutRef.current) clearTimeout(showTimeoutRef.current);
    };
  }, []);

  if (!isValidElement(children)) {
    return children;
  }

  // Clone child to attach handlers while preserving original handlers
  const triggerElement = cloneElement(children, {
    onMouseEnter: (e: React.MouseEvent) => {
      pointerPosRef.current = { x: e.clientX, y: e.clientY };
      children.props.onMouseEnter?.(e);
      showTooltip(e.currentTarget as HTMLElement);
    },
    onMouseMove: (e: React.MouseEvent) => {
      pointerPosRef.current = { x: e.clientX, y: e.clientY };
      children.props.onMouseMove?.(e);
      if (isOpen && followPointer && activeElementRef.current) {
        const pos = calculatePosition(activeElementRef.current);
        if (pos) setCoords(pos);
      }
    },
    onMouseLeave: (e: React.MouseEvent) => {
      children.props.onMouseLeave?.(e);
      hideTooltip();
    },
    onFocus: (e: React.FocusEvent) => {
      pointerPosRef.current = null;
      children.props.onFocus?.(e);
      showTooltip(e.currentTarget as HTMLElement);
    },
    onBlur: (e: React.FocusEvent) => {
      children.props.onBlur?.(e);
      hideTooltip();
    },
    title: undefined,
    'aria-describedby': isOpen ? tooltipId : children.props?.['aria-describedby'],
  });

  return (
    <>
      {triggerElement}
      {isMounted &&
        isOpen &&
        coords &&
        createPortal(
          <div
            ref={tooltipRef}
            id={tooltipId}
            role="tooltip"
            style={{
              top: `${coords.top}px`,
              left: `${coords.left}px`,
              transform: coords.transform,
            }}
            className={cn(
              'fixed z-50 pointer-events-none whitespace-nowrap rounded-md px-2.5 py-1 text-xs font-semibold shadow-xl',
              'bg-ink dark:bg-white text-white dark:text-ink',
              'border border-line/20 dark:border-night-line',
              'transition-all duration-150 animate-in fade-in zoom-in-95',
              className
            )}
          >
            <span>{content}</span>
            {badge && (
              <span className="ml-1.5 px-1.5 py-0.5 rounded-xs bg-brand text-white text-[10px] font-bold tracking-wide uppercase font-mono">
                {badge}
              </span>
            )}

            {/* Visual Pointer Arrow */}
            {coords.actualSide === 'top' && (
              <svg
                aria-hidden="true"
                className="absolute -bottom-[5px] h-[5px] w-[10px] text-ink dark:text-white pointer-events-none"
                style={{
                  left: coords.arrowLeft !== undefined ? `${coords.arrowLeft}px` : '50%',
                  transform: 'translateX(-50%)',
                }}
                viewBox="0 0 10 5"
                fill="currentColor"
              >
                <path d="M0 0L5 5L10 0Z" />
              </svg>
            )}
            {coords.actualSide === 'bottom' && (
              <svg
                aria-hidden="true"
                className="absolute -top-[5px] h-[5px] w-[10px] text-ink dark:text-white pointer-events-none"
                style={{
                  left: coords.arrowLeft !== undefined ? `${coords.arrowLeft}px` : '50%',
                  transform: 'translateX(-50%)',
                }}
                viewBox="0 0 10 5"
                fill="currentColor"
              >
                <path d="M0 5L5 0L10 5Z" />
              </svg>
            )}
          </div>,
          document.body
        )}
    </>
  );
}
export { Tooltip };
