import { cn } from '../../../../lib/utils';
import { STATUS_DOT_CONFIG } from '../constants/assessmentsConfig';

/**
 * Status indicator for the assessments table.
 *
 * A dot + label rather than a filled pill (the previous `Badge` treatment) —
 * a soft-tinted rounded pill on every row reads as generic dashboard
 * boilerplate at a glance; a small coloured dot next to plain text is the
 * quieter, more deliberate version of the same information.
 */
export function StatusBadge({ status }) {
  const config = STATUS_DOT_CONFIG[status] || STATUS_DOT_CONFIG.draft;
  return (
    <span className="inline-flex items-center gap-[7px] text-[13px] font-medium text-text-primary">
      <span className={cn('h-[7px] w-[7px] flex-shrink-0 rounded-full', config.dot)} />
      {config.label}
    </span>
  );
}
