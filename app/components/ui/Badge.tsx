import React from 'react';
import { cn } from '@/app/utils/cn';

export type BadgeVariant =
  | 'brand'
  | 'brand-solid'
  | 'neutral'
  | 'paper'
  | 'success'
  | 'warning'
  | 'danger'
  | 'outline'
  | 'pill-active'
  | 'pill-inactive';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ComponentType<{ className?: string }>;
  iconPosition?: 'left' | 'right';
  interactive?: boolean;
}

const variantStyles: Record<BadgeVariant, string> = {
  brand: 'bg-brand-tint text-brand-strong border border-brand/30 dark:bg-brand/15 dark:text-brand-soft',
  'brand-solid': 'bg-brand text-white font-bold',
  neutral: 'bg-ink dark:bg-night-3 text-white',
  paper: 'bg-paper-2 dark:bg-night-3 text-ink dark:text-snow border border-line dark:border-night-line',
  success: 'bg-vert-tint text-vert-strong border border-vert/25 dark:bg-vert/15 dark:text-vert-vif dark:border-vert-vif/25',
  warning: 'bg-ambre/15 text-ambre-ink border border-ambre/30 dark:text-ambre',
  danger: 'bg-brand-tint text-brand-strong border border-brand/30 dark:bg-brand/15 dark:text-brand-soft',
  outline: 'border border-ink dark:border-snow-3 bg-transparent text-ink dark:text-snow',
  'pill-active': 'bg-ink dark:bg-snow text-white dark:text-night cursor-pointer',
  'pill-inactive':
    'bg-white dark:bg-night-2 text-ink-2 dark:text-snow-2 border border-line dark:border-night-line hover:border-ink dark:hover:border-snow-3 cursor-pointer',
};

const sizeStyles = {
  sm: 'px-2 py-0.5 text-[11px] gap-1',
  md: 'px-2.5 py-1 text-xs gap-1.5',
  lg: 'px-4 py-2 text-xs gap-2 min-h-[44px]',
};

export default function Badge({
  variant = 'neutral',
  size = 'md',
  icon: Icon,
  iconPosition = 'left',
  interactive = false,
  className = '',
  children,
  ...props
}: BadgeProps): React.ReactElement {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-narrow font-bold uppercase tracking-[0.08em] transition-colors shrink-0',
        variantStyles[variant],
        sizeStyles[size],
        interactive && 'cursor-pointer select-none',
        className
      )}
      {...props}
    >
      {Icon && iconPosition === 'left' && <Icon className="h-3.5 w-3.5 shrink-0" />}
      <span>{children}</span>
      {Icon && iconPosition === 'right' && <Icon className="h-3.5 w-3.5 shrink-0" />}
    </span>
  );
}
