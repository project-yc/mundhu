import { LayoutTemplate, SearchX } from 'lucide-react';

const SKELETON_CARDS = 6;

export function TemplateGridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-[14px] md:grid-cols-2 2xl:grid-cols-3">
      {Array.from({ length: SKELETON_CARDS }).map((_, index) => (
        <div
          key={index}
          className="h-[212px] animate-pulse rounded-[10px] border border-border-subtle bg-surface p-[18px]"
        >
          <div className="h-[16px] w-3/5 rounded bg-page" />
          <div className="mt-[12px] h-[12px] w-2/5 rounded bg-page" />
          <div className="mt-[18px] h-[12px] w-full rounded bg-page" />
          <div className="mt-[8px] h-[12px] w-4/5 rounded bg-page" />
          <div className="mt-[24px] flex gap-[8px]">
            <div className="h-[20px] w-[58px] rounded bg-page" />
            <div className="h-[20px] w-[58px] rounded bg-page" />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Two empty states, not one. "No templates exist yet" and "your filters matched
 * nothing" need different words and different exits — offering "clear filters"
 * when there was never anything to filter is a dead end.
 */
export function TemplatesEmptyState({ filtersActive, onClear, onStartFromScratch }) {
  const Icon = filtersActive ? SearchX : LayoutTemplate;

  return (
    <div className="flex flex-col items-center justify-center rounded-[10px] border border-dashed border-border-strong bg-surface px-6 py-[64px] text-center">
      <Icon className="h-[28px] w-[28px] text-text-muted" strokeWidth={1.6} />
      <p className="mt-[14px] text-[15px] font-bold text-text-primary">
        {filtersActive ? 'No templates match these filters' : 'No templates yet'}
      </p>
      <p className="mt-[6px] max-w-[380px] text-[13px] leading-[18px] text-text-secondary">
        {filtersActive
          ? 'Try widening the discipline or seniority, or clear the filters to see everything.'
          : 'Prebuilt assessments will appear here once they are published. In the meantime you can build one from scratch.'}
      </p>
      <div className="mt-[18px] flex items-center gap-[10px]">
        {filtersActive ? (
          <button
            type="button"
            onClick={onClear}
            className="h-[38px] rounded-[8px] border border-border-default bg-surface px-[18px] text-[14px] font-medium leading-none text-text-primary transition-colors hover:bg-surface-hover"
          >
            Clear filters
          </button>
        ) : (
          <button
            type="button"
            onClick={onStartFromScratch}
            className="h-[38px] rounded-[8px] bg-[var(--color-assessment-cta)] px-[20px] text-[14px] font-bold leading-none text-[var(--color-assessment-cta-text)] transition-colors hover:bg-[var(--color-assessment-cta-hover)]"
          >
            Start from scratch
          </button>
        )}
      </div>
    </div>
  );
}
