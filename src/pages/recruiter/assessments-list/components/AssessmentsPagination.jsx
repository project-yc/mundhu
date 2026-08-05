import { ArrowLeft, ArrowRight } from 'lucide-react';
import { cn } from '../../../../lib/utils';
import { getPaginationItems } from '../../../../utils/pagination';

function PageButton({ active, children, ...props }) {
  return (
    <button
      type="button"
      aria-current={active ? 'page' : undefined}
      className={cn(
        'h-[40px] w-[40px] rounded-[8px] text-[14px] font-medium transition-colors',
        active
          ? 'bg-surface-hover text-text-primary'
          : 'text-text-secondary hover:bg-surface-hover',
      )}
      {...props}
    >
      {children}
    </button>
  );
}

function EdgeButton({ className, ...props }) {
  return (
    <button
      type="button"
      className={cn(
        'inline-flex h-[36px] items-center justify-center gap-[8px] rounded-[8px] border border-border-default bg-surface px-[12px] text-[14px] font-medium text-text-primary shadow-card transition-colors hover:bg-surface-hover disabled:pointer-events-none disabled:opacity-40',
        className,
      )}
      {...props}
    />
  );
}

export function AssessmentsPagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;
  const items = getPaginationItems(page, totalPages);

  return (
    <nav
      aria-label="Assessments pagination"
      className="flex h-[64px] items-center justify-between border-t border-border-subtle px-[12px]"
    >
      <EdgeButton
        onClick={() => onPageChange(Math.max(1, page - 1))}
        disabled={page === 1}
        className="w-[111px]"
      >
        <ArrowLeft aria-hidden="true" className="h-[20px] w-[20px]" strokeWidth={1.8} />
        Previous
      </EdgeButton>

      <div className="flex items-center gap-[2px]">
        {items.map((item, index) => (
          item === 'ellipsis' ? (
            <span
              key={`ellipsis-${index}`}
              aria-hidden="true"
              className="flex h-[40px] w-[40px] items-center justify-center text-text-muted"
            >
              ...
            </span>
          ) : (
            <PageButton
              key={item}
              active={item === page}
              onClick={() => onPageChange(item)}
            >
              {item}
            </PageButton>
          )
        ))}
      </div>

      <EdgeButton
        onClick={() => onPageChange(Math.min(totalPages, page + 1))}
        disabled={page === totalPages}
        className="w-[84px]"
      >
        Next
        <ArrowRight aria-hidden="true" className="h-[20px] w-[20px]" strokeWidth={1.8} />
      </EdgeButton>
    </nav>
  );
}
