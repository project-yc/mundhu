import { Copy, Eye, Loader, Pencil } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '../../../../components/ui/tooltip';

/**
 * View / Edit(draft-only) / Duplicate — per recruiter scope for this build.
 * Edit routes into the assessment builder, which does not yet load an
 * existing draft's data (no resume flow); it opens a fresh builder for now.
 */
export function RowActions({ row, onView, onEdit, onDuplicate, duplicating }) {
  const isDraft = row.status === 'draft';

  return (
    <div className="flex items-center gap-[10px] text-[var(--color-assessment-step-active)]">
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            aria-label="View assessment"
            className="transition-opacity hover:opacity-70"
            onClick={() => onView(row)}
          >
            <Eye className="h-[18px] w-[18px]" strokeWidth={1.8} />
          </button>
        </TooltipTrigger>
        <TooltipContent>View</TooltipContent>
      </Tooltip>

      {isDraft && (
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              aria-label="Edit assessment"
              className="transition-opacity hover:opacity-70"
              onClick={() => onEdit(row)}
            >
              <Pencil className="h-[17px] w-[17px]" strokeWidth={1.8} />
            </button>
          </TooltipTrigger>
          <TooltipContent>Edit (draft only)</TooltipContent>
        </Tooltip>
      )}

      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            aria-label="Duplicate assessment"
            className="transition-opacity hover:opacity-70 disabled:opacity-40"
            onClick={() => onDuplicate(row)}
            disabled={duplicating}
          >
            {duplicating ? (
              <Loader className="h-[17px] w-[17px] animate-spin" />
            ) : (
              <Copy className="h-[17px] w-[17px]" strokeWidth={1.8} />
            )}
          </button>
        </TooltipTrigger>
        <TooltipContent>Duplicate (assessment details only, task not copied)</TooltipContent>
      </Tooltip>
    </div>
  );
}
