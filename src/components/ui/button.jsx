import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[8px] text-[14px] font-semibold leading-none transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/25 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-[var(--color-assessment-step-active)] text-surface hover:bg-[var(--color-sidebar-control-hover)]',
        secondary: 'border border-border-default bg-surface text-text-primary shadow-card hover:bg-surface-hover',
        outline: 'border border-border-default bg-surface text-text-primary hover:bg-surface-hover',
        ghost: 'text-text-secondary hover:bg-surface-hover hover:text-text-primary',
        cta: 'bg-[var(--color-assessment-cta)] text-[var(--color-assessment-cta-text)] hover:bg-[var(--color-assessment-cta-hover)]',
      },
      size: {
        default: 'h-[40px] px-4',
        sm: 'h-[30px] px-3 text-[12px]',
        lg: 'h-[44px] px-6 text-[15px]',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

const Button = React.forwardRef(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      />
    );
  },
);
Button.displayName = 'Button';

export { Button };
