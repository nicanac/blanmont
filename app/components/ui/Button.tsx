import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/app/utils/cn';
import Spinner from './Spinner';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-white dark:ring-offset-[#0a0c10] cursor-pointer',
  {
    variants: {
      variant: {
        default: 'bg-brand-primary text-white hover:bg-brand-primary/90',
        destructive: 'bg-red-500 text-white hover:bg-red-600',
        outline:
          'border border-[#e4e0d8] dark:border-[#262b38] hover:bg-[#f2efe9] dark:hover:bg-[#1e222d] text-[#101216] dark:text-[#f5f6f8]',
        secondary: 'bg-brand-secondary text-white hover:bg-brand-secondary/80',
        ghost:
          'hover:bg-[#f2efe9] dark:hover:bg-[#1e222d] text-[#101216] dark:text-[#f5f6f8]',
        link: 'underline-offset-4 hover:underline text-brand-primary',
        'admin-primary':
          'bg-[#e03e3e] hover:bg-[#c93434] text-white shadow-xs font-semibold uppercase tracking-wider',
        'admin-secondary':
          'border border-[#e4e0d8] bg-white hover:bg-[#f2efe9] text-[#101216] font-semibold uppercase tracking-wider shadow-xs',
        'admin-danger':
          'border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 font-semibold',
      },
      size: {
        default: 'min-h-[44px] sm:min-h-0 h-11 sm:h-10 py-2 px-4 text-sm',
        sm: 'min-h-[44px] sm:min-h-[36px] h-11 sm:h-9 px-3 rounded-md text-xs',
        lg: 'min-h-[44px] h-11 px-8 rounded-md text-base',
        icon: 'h-9 w-9 p-0 min-h-[36px] min-w-[36px]',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
  leftIcon?: React.ComponentType<{ className?: string }>;
  rightIcon?: React.ComponentType<{ className?: string }>;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      isLoading = false,
      leftIcon: LeftIcon,
      rightIcon: RightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && <Spinner size="xs" variant="current" />}
        {!isLoading && LeftIcon && <LeftIcon className="h-4 w-4 shrink-0" />}
        {children}
        {!isLoading && RightIcon && <RightIcon className="h-4 w-4 shrink-0" />}
      </button>
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
