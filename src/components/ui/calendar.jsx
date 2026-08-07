import * as React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { DayPicker } from 'react-day-picker';
import { cn } from '../../lib/utils';

function Calendar({ className, classNames, showOutsideDays = true, ...props }) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn('p-3', className)}
      classNames={{
        months: 'flex flex-col sm:flex-row gap-2',
        month: 'flex flex-col gap-3',
        month_caption: 'flex justify-center pt-1 relative items-center h-8',
        caption_label: 'text-[13px] font-semibold text-text-primary',
        nav: 'flex items-center justify-between absolute inset-x-1 top-1 z-10',
        button_previous: cn(
          'h-7 w-7 inline-flex items-center justify-center rounded-md border border-border-strong bg-surface text-text-secondary hover:bg-surface-hover hover:text-text-primary transition-colors disabled:opacity-30 disabled:pointer-events-none',
        ),
        button_next: cn(
          'h-7 w-7 inline-flex items-center justify-center rounded-md border border-border-strong bg-surface text-text-secondary hover:bg-surface-hover hover:text-text-primary transition-colors disabled:opacity-30 disabled:pointer-events-none',
        ),
        month_grid: 'w-full border-collapse',
        weekdays: 'flex',
        weekday: 'text-text-muted w-8 text-[11px] font-medium uppercase',
        week: 'flex w-full mt-1',
        day: 'p-0 text-center text-[13px] relative [&:has([data-selected])]:bg-brand/10 first:[&:has([data-selected])]:rounded-l-md last:[&:has([data-selected])]:rounded-r-md',
        day_button: cn(
          'h-8 w-8 p-0 font-normal rounded-md text-text-primary inline-flex items-center justify-center transition-colors hover:bg-surface-hover aria-selected:opacity-100',
        ),
        selected:
          '[&>button]:bg-[var(--color-assessment-accent)] [&>button]:text-surface [&>button]:hover:bg-[var(--color-assessment-accent)] [&>button]:font-semibold',
        today: '[&>button]:border [&>button]:border-brand',
        outside: '[&>button]:text-text-muted [&>button]:opacity-50',
        disabled: '[&>button]:text-text-muted [&>button]:opacity-30 [&>button]:pointer-events-none [&>button]:hover:bg-transparent',
        hidden: 'invisible',
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation, ...rest }) =>
          orientation === 'left' ? (
            <ChevronLeft className="h-4 w-4" strokeWidth={2} {...rest} />
          ) : (
            <ChevronRight className="h-4 w-4" strokeWidth={2} {...rest} />
          ),
      }}
      {...props}
    />
  );
}
Calendar.displayName = 'Calendar';

export { Calendar };
