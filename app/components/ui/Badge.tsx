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
  brand:
    'bg-[#e03e3e]/15 text-[#e03e3e] dark:text-red-400 border border-[#e03e3e]/30',
  'brand-solid':
    'bg-[#e03e3e] text-white shadow-2xs font-bold uppercase tracking-wider',
  neutral:
    'bg-[#101216] dark:bg-[#1d2128] text-white',
  paper:
    'bg-[#f2efe9] dark:bg-white/5 text-[#101216] dark:text-white border border-[#e4e0d8] dark:border-[#262b38]',
  success:
    'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20',
  warning:
    'bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20',
  danger:
    'bg-red-500/10 text-red-700 dark:text-red-400 border border-red-500/20',
  outline:
    'border border-[#e4e0d8] dark:border-[#262b38] bg-transparent text-[#101216] dark:text-white',
  'pill-active':
    'bg-[#101216] dark:bg-white text-white dark:text-[#101216] shadow-xs cursor-pointer',
  'pill-inactive':
    'bg-[#faf8f5] dark:bg-[#161922] text-[#5c6370] dark:text-[#a7adbb] border border-[#e4e0d8] dark:border-[#262b38] hover:border-[#101216]/30 dark:hover:border-white/30 cursor-pointer',
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
        'inline-flex items-center rounded-full font-bold uppercase tracking-wider transition-colors shrink-0',
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
