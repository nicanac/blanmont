import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/app/utils/cn';
import Spinner from './Spinner';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-md font-narrow font-bold uppercase tracking-[0.07em] transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:opacity-50 disabled:pointer-events-none cursor-pointer active:translate-y-px',
  {
    variants: {
      variant: {
        default: 'bg-brand text-white hover:bg-brand-strong shadow-[inset_0_-2px_0_rgb(0_0_0/0.16)]',
        destructive: 'bg-brand-strong text-white hover:bg-ink',
        outline:
          'border border-ink text-ink hover:bg-ink hover:text-white dark:border-snow-2 dark:text-snow dark:hover:bg-snow dark:hover:text-night',
        secondary: 'bg-ink text-white hover:bg-ink-2 dark:bg-snow dark:text-night dark:hover:bg-snow-2',
        ghost: 'hover:bg-paper-2 dark:hover:bg-night-3 text-ink dark:text-snow',
        link: 'normal-case tracking-normal font-semibold underline-offset-4 hover:underline text-brand dark:text-brand-soft',
        'admin-primary': 'bg-brand hover:bg-brand-strong text-white',
        'admin-secondary':
          'border border-line bg-white hover:bg-paper-2 text-ink dark:border-night-line dark:bg-night-2 dark:text-snow dark:hover:bg-night-3',
        'admin-danger': 'border border-brand/30 bg-brand-tint text-brand-strong hover:bg-brand hover:text-white',
      },
      size: {
        default: 'min-h-[44px] sm:min-h-0 h-11 sm:h-10 py-2 px-4 text-[0.8125rem]',
        sm: 'min-h-[44px] sm:min-h-[36px] h-11 sm:h-9 px-3 text-xs',
        lg: 'min-h-[44px] h-12 px-7 text-sm',
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
