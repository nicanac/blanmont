import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/app/utils/cn'; // Assuming we have or will create a cn utility

const buttonVariants = cva(
    'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-white dark:ring-offset-[#0a0c10]',
    {
        variants: {
            variant: {
                default: 'bg-brand-primary text-white hover:bg-brand-primary/90',
                destructive: 'bg-red-500 text-white hover:bg-red-600',
                outline: 'border border-[#e4e0d8] dark:border-[#262b38] hover:bg-[#f2efe9] dark:hover:bg-[#1e222d] text-[#101216] dark:text-[#f5f6f8] hover:text-[#101216] dark:hover:text-[#f5f6f8]',
                secondary: 'bg-brand-secondary text-white hover:bg-brand-secondary/80',
                ghost: 'hover:bg-[#f2efe9] dark:hover:bg-[#1e222d] text-[#101216] dark:text-[#f5f6f8] hover:text-[#101216] dark:hover:text-[#f5f6f8]',
                link: 'underline-offset-4 hover:underline text-brand-primary',
            },
            size: {
                default: 'min-h-[44px] sm:min-h-0 h-11 sm:h-10 py-2 px-4',
                sm: 'min-h-[44px] sm:min-h-[36px] h-11 sm:h-9 px-3 rounded-md',
                lg: 'min-h-[44px] h-11 px-8 rounded-md',
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
    VariantProps<typeof buttonVariants> { }

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, ...props }, ref) => {
        return (
            <button
                className={cn(buttonVariants({ variant, size, className }))}
                ref={ref}
                {...props}
            />
        );
    }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
