import * as React from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-brand/25 focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-brand-border/40 bg-brand-tint text-brand',
        secondary: 'border-border-default bg-surface-muted text-text-secondary',
        outline: 'border-border-default text-text-secondary',
        success: 'border-success-border bg-success-bg text-success',
        warning: 'border-warning-border bg-warning-bg text-warning',
        error: 'border-error-border bg-error-bg text-error',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

function Badge({ className, variant, ...props }) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge };
