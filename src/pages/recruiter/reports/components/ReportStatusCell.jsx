import { Loader } from 'lucide-react';
import { Button } from '../../../../components/ui/button';
import { Badge } from '../../../../components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '../../../../components/ui/tooltip';
import { REPORT_STATE } from '../../../../api/recruiter/reports';

const PENDING_STATES = {
  [REPORT_STATE.ANALYZING]: {
    label: 'Analyzing',
    variant: 'warning',
    hint: 'All sections are scored — the AI coding review is still running.',
    spinner: true,
  },
  [REPORT_STATE.FAILED]: {
    label: 'Failed',
    variant: 'error',
    hint: 'Report generation failed. Re-queue it from the session tools.',
  },
  [REPORT_STATE.PENDING]: {
    label: 'Pending',
    variant: 'secondary',
    hint: 'Waiting for the candidate to finish and the report to generate.',
  },
};

/**
 * "View report" once the assessment report is finalized, otherwise a status
 * pill. `Analyzing` is deliberately distinct from `Pending` — it means every
 * section is scored and only the AI coding review is outstanding, which the
 * collapsed two-state `report_status` used to hide.
 */
export function ReportStatusCell({ row, onViewReport }) {
  if (row.state === REPORT_STATE.READY) {
    return (
      <Button
        variant="secondary"
        onClick={onViewReport}
        className="h-[30px] min-w-[96px] rounded-[8px] px-[12px] text-[14px] font-medium"
      >
        View report
      </Button>
    );
  }

  const config = PENDING_STATES[row.state] || PENDING_STATES[REPORT_STATE.PENDING];

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Badge
          variant={config.variant}
          className="inline-flex h-[30px] min-w-[96px] items-center justify-center gap-1.5 rounded-[8px] text-[14px] font-medium"
        >
          {config.spinner && <Loader aria-hidden="true" className="h-[13px] w-[13px] animate-spin" />}
          {config.label}
        </Badge>
      </TooltipTrigger>
      <TooltipContent>{config.hint}</TooltipContent>
    </Tooltip>
  );
}
