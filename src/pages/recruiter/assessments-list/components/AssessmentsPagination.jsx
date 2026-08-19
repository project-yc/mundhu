import { ArrowRight } from 'lucide-react';
import { cn } from '../../../../lib/utils';
import { getPaginationItems } from '../../../../utils/pagination';

function PageButton({ active, children, ...props }) {
  return (
    <button
      type="button"
      aria-current={active ? 'page' : undefined}
      className={cn(
        'h-[34px] min-w-[34px] rounded-[8px] px-[10px] text-[13px] font-medium transition-colors',
        active
          ? 'bg-brand text-on-brand'
          : 'text-text-secondary hover:bg-surface-hover hover:text-text-primary',
      )}
      {...props}
    >
      {children}
    </button>
  );
}

/**
 * Numbered-step pagination — page buttons followed by a single Next control.
 * No "Previous" button and no result-count label: with a fixed 6-per-page and
 * the full page range always reachable via `getPaginationItems` (it keeps
 * page 1 visible even when windowed), a plain forward step is enough.
 */
export function AssessmentsPagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;
  const items = getPaginationItems(page, totalPages);

  return (
    <nav
      aria-label="Assessments pagination"
      className="flex items-center justify-center gap-[6px] border-t border-border-subtle px-[14px] py-[12px]"
    >
      {items.map((item, index) =>
        item === 'ellipsis' ? (
          <span
            key={`ellipsis-${index}`}
            aria-hidden="true"
            className="flex h-[34px] w-[26px] items-center justify-center text-text-muted"
          >
            ...
          </span>
        ) : (
          <PageButton key={item} active={item === page} onClick={() => onPageChange(item)}>
            {item}
          </PageButton>
        ),
      )}

      <button
        type="button"
        onClick={() => onPageChange(Math.min(totalPages, page + 1))}
        disabled={page === totalPages}
        className="ml-[4px] inline-flex h-[34px] items-center justify-center gap-[6px] rounded-[8px] border border-border-default bg-surface px-[12px] text-[13px] font-medium text-text-primary transition-colors hover:bg-surface-hover disabled:pointer-events-none disabled:opacity-40"
      >
        Next
        <ArrowRight aria-hidden="true" className="h-[15px] w-[15px]" strokeWidth={2} />
      </button>
    </nav>
  );
}
