import { Copy, Eye, Loader, Pencil } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '../../../../components/ui/tooltip';

/**
 * View / Edit(draft-only) / Duplicate — per recruiter scope for this build.
 * Edit resumes the existing draft in the builder (`/recruiter/assessments/:id/edit`).
 *
 * Rendered in neutral text colors rather than brand orange: three equally
 * orange icons read as three primary actions, which none of them are.
 */

const ICON_BUTTON =
  'flex h-[30px] w-[30px] items-center justify-center rounded-[6px] text-text-secondary transition-colors hover:bg-surface-muted hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30 disabled:pointer-events-none disabled:opacity-40';

export function RowActions({ row, onView, onEdit, onDuplicate, duplicating }) {
  const isDraft = row.status === 'draft';

  return (
    <div className="flex items-center gap-[2px]">
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            aria-label="View assessment"
            className={ICON_BUTTON}
            onClick={() => onView(row)}
          >
            <Eye className="h-[17px] w-[17px]" strokeWidth={1.8} />
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
              className={ICON_BUTTON}
              onClick={() => onEdit(row)}
            >
              <Pencil className="h-[16px] w-[16px]" strokeWidth={1.8} />
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
            className={ICON_BUTTON}
            onClick={() => onDuplicate(row)}
            disabled={duplicating}
          >
            {duplicating ? (
              <Loader className="h-[16px] w-[16px] animate-spin" />
            ) : (
              <Copy className="h-[16px] w-[16px]" strokeWidth={1.8} />
            )}
          </button>
        </TooltipTrigger>
        <TooltipContent>Duplicate (assessment details only, task not copied)</TooltipContent>
      </Tooltip>
    </div>
  );
}
