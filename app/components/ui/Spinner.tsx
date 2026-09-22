import React from 'react';
import { cn } from '@/app/utils/cn';

export interface SpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'brand' | 'white' | 'muted' | 'current';
  className?: string;
  label?: string;
}

const sizeClasses = {
  xs: 'h-3 w-3 border-[1.5px]',
  sm: 'h-4 w-4 border-2',
  md: 'h-6 w-6 border-2',
  lg: 'h-8 w-8 border-2',
  xl: 'h-12 w-12 border-3',
};

const variantClasses = {
  brand: 'border-[#e03e3e] border-t-transparent',
  white: 'border-white border-t-transparent',
  muted: 'border-[#5c6370] dark:border-[#a7adbb] border-t-transparent',
  current: 'border-current border-t-transparent',
};

export default function Spinner({
  size = 'md',
  variant = 'brand',
  className = '',
  label = 'Chargement en cours...',
}: SpinnerProps): React.ReactElement {
  return (
    <div
      role="status"
      aria-label={label}
      className={cn(
        'inline-block animate-spin rounded-full shrink-0',
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
    >
      <span className="sr-only">{label}</span>
    </div>
  );
}

export { Spinner };
