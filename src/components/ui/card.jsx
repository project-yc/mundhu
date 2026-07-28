import * as React from 'react';
import { cn } from '../../lib/utils';

const Card = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('rounded-[10px] border border-border-default bg-surface text-text-primary', className)}
    {...props}
  />
));
Card.displayName = 'Card';

const CardHeader = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('flex items-start gap-3 p-4', className)} {...props} />
));
CardHeader.displayName = 'CardHeader';

const CardTitle = React.forwardRef(({ className, ...props }, ref) => (
  <p ref={ref} className={cn('truncate text-[16px] font-bold leading-[20px]', className)} {...props} />
));
CardTitle.displayName = 'CardTitle';

const CardDescription = React.forwardRef(({ className, ...props }, ref) => (
  <p ref={ref} className={cn('truncate text-[10px] leading-none text-text-faint', className)} {...props} />
));
CardDescription.displayName = 'CardDescription';

const CardContent = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('px-4 pb-4', className)} {...props} />
));
CardContent.displayName = 'CardContent';

const CardFooter = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center justify-between border-t border-border-subtle px-4 py-2', className)}
    {...props}
  />
));
CardFooter.displayName = 'CardFooter';

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };
