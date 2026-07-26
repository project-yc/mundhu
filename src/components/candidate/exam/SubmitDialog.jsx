// ─────────────────────────────────────────────────────────────────────────────
// SubmitDialog — the last gate before a section is final.
//
// It states the facts (answered, marked, what submitting means) without
// scolding. Unanswered questions are shown as a route back to them, not as a
// warning the candidate has to dismiss.
// ─────────────────────────────────────────────────────────────────────────────

import { IconArrowRight, IconAlertTriangle } from '@tabler/icons-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../ui/dialog'
import { useCandidateThemeContainer } from '../../../theme/CandidateThemeProvider'
import ExamButton from './ExamButton'

function Stat({ label, value, tone = 'default' }) {
  return (
    <div className="flex-1 rounded-xl border border-border bg-surface-muted px-3.5 py-3">
      <p className="text-[12px] text-text-muted">{label}</p>
      <p
        className={`mt-1.5 text-[20px] font-semibold leading-none tracking-[-0.02em] ${
          tone === 'warning' ? 'text-warning' : tone === 'ember' ? 'text-brand' : 'text-text-primary'
        }`}
      >
        {value}
      </p>
    </div>
  )
}

export default function SubmitDialog({
  open,
  onOpenChange,
  answeredCount,
  totalCount,
  submitting,
  onConfirm,
  onReviewUnanswered,
}) {
  const container = useCandidateThemeContainer()
  const unansweredCount = totalCount - answeredCount

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent container={container} className="max-w-[420px]">
        <DialogHeader>
          <DialogTitle>Submit this section?</DialogTitle>
          <DialogDescription>
            Your answers are final once this section is submitted. The rest of the assessment
            continues after.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-5 flex gap-2.5">
          <Stat label="Answered" value={`${answeredCount}/${totalCount}`} tone="ember" />
          {unansweredCount > 0 && (
            <Stat label="Blank" value={unansweredCount} tone="warning" />
          )}
        </div>

        {unansweredCount > 0 && (
          <button
            type="button"
            onClick={onReviewUnanswered}
            className="mt-3 flex w-full items-center gap-2.5 rounded-xl border border-warning-border bg-warning-bg px-3.5 py-3 text-left transition-colors hover:brightness-125"
          >
            <IconAlertTriangle size={15} className="shrink-0 text-warning" />
            <span className="flex-1 text-[13px] text-warning">
              {unansweredCount} question{unansweredCount !== 1 ? 's' : ''} still blank
            </span>
            <span className="flex items-center gap-1 text-[12px] font-medium text-warning">
              Go there
              <IconArrowRight size={13} />
            </span>
          </button>
        )}

        <DialogFooter className="mt-6">
          <ExamButton
            variant="quiet"
            className="flex-1"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
          >
            Keep working
          </ExamButton>
          <ExamButton
            variant="primary"
            className="flex-1"
            sweep
            loading={submitting}
            onClick={onConfirm}
          >
            Submit section
          </ExamButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
