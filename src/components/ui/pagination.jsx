import * as React from 'react';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { cn } from '../../lib/utils';

const Pagination = ({ className, ...props }) => (
  <nav
    role="navigation"
    aria-label="pagination"
    className={cn('mx-auto flex w-full justify-center', className)}
    {...props}
  />
);
Pagination.displayName = 'Pagination';

const PaginationContent = React.forwardRef(({ className, ...props }, ref) => (
  <ul
    ref={ref}
    className={cn('flex flex-row items-center gap-1', className)}
    {...props}
  />
));
PaginationContent.displayName = 'PaginationContent';

const PaginationItem = React.forwardRef(({ className, ...props }, ref) => (
  <li ref={ref} className={cn('', className)} {...props} />
));
PaginationItem.displayName = 'PaginationItem';

const PaginationLink = React.forwardRef(({ className, isActive, size = 'icon', ...props }, ref) => (
  <button
    ref={ref}
    type="button"
    aria-current={isActive ? 'page' : undefined}
    className={cn(
      'flex items-center justify-center gap-1 rounded-lg border border-border-default bg-surface text-sm font-medium text-text-primary transition-colors hover:bg-surface-hover disabled:pointer-events-none disabled:opacity-50',
      isActive && 'border-brand bg-brand text-on-brand hover:bg-brand-hover',
      size === 'default' && 'h-9 px-4',
      size === 'sm' && 'h-8 px-3',
      size === 'lg' && 'h-10 px-5',
      size === 'icon' && 'h-9 w-9',
      className,
    )}
    {...props}
  />
));
PaginationLink.displayName = 'PaginationLink';

const PaginationPrevious = ({ className, ...props }) => (
  <PaginationLink
    aria-label="Go to previous page"
    size="default"
    className={cn('gap-1 px-2.5', className)}
    {...props}
  >
    <ChevronLeft className="h-4 w-4" />
    <span>Previous</span>
  </PaginationLink>
);
PaginationPrevious.displayName = 'PaginationPrevious';

const PaginationNext = ({ className, ...props }) => (
  <PaginationLink
    aria-label="Go to next page"
    size="default"
    className={cn('gap-1 px-2.5', className)}
    {...props}
  >
    <span>Next</span>
    <ChevronRight className="h-4 w-4" />
  </PaginationLink>
);
PaginationNext.displayName = 'PaginationNext';

const PaginationEllipsis = ({ className, ...props }) => (
  <span
    aria-hidden
    className={cn('flex h-9 w-9 items-center justify-center text-text-muted', className)}
    {...props}
  >
    <MoreHorizontal className="h-4 w-4" />
    <span className="sr-only">More pages</span>
  </span>
);
PaginationEllipsis.displayName = 'PaginationEllipsis';

export {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
};
