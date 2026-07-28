import { Pencil, Trash2 } from 'lucide-react';

/**
 * Per-row delete/edit, matching the Figma action column.
 * No backend endpoints exist for either yet.
 */
export function RowActions() {
  return (
    <div className="flex items-center gap-[8px] pl-[12px] text-[var(--color-assessment-step-active)]">
      <button
        type="button"
        aria-label="Delete report"
        className="transition-opacity hover:opacity-70"
      >
        <Trash2 className="h-[18px] w-[18px]" strokeWidth={1.8} />
      </button>
      <button
        type="button"
        aria-label="Edit report"
        className="transition-opacity hover:opacity-70"
      >
        <Pencil className="h-[17px] w-[17px]" strokeWidth={1.8} />
      </button>
    </div>
  );
}
