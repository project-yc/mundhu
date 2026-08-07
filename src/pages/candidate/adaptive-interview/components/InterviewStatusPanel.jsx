import { motion as Motion } from 'motion/react'
import { IconAlertTriangle, IconClockPause } from '@tabler/icons-react'
import ExamButton from '../../../../components/candidate/exam/ExamButton'

// Shared centered state for the non-chat screens: loading, section-expired
// (terminal, server already marked it skipped — no submit action), and
// service-unavailable (with a manual retry). Mirrors the loading/timeup
// treatment in CandidateMcqSectionExperience.jsx.
export default function InterviewStatusPanel({ variant, message, onRetry }) {
  if (variant === 'loading') {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-5 text-center">
        <span className="h-8 w-8 animate-spin rounded-full border-2 border-border-strong border-t-brand" />
        <p className="text-[14px] text-text-muted">{message || 'Loading interview...'}</p>
      </div>
    )
  }

  const isExpired = variant === 'expired'

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-[420px] flex-col items-center justify-center gap-7 text-center">
      <Motion.div
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="flex h-16 w-16 items-center justify-center rounded-2xl border border-error-border bg-error-bg"
      >
        {isExpired ? (
          <IconClockPause size={28} className="text-error" />
        ) : (
          <IconAlertTriangle size={28} className="text-error" />
        )}
      </Motion.div>
      <div className="flex flex-col gap-2">
        <h1 className="text-[24px] font-bold tracking-[-0.025em] text-text-primary">
          {isExpired ? 'Section timer expired' : 'Interview unavailable'}
        </h1>
        <p className="text-[14px] leading-relaxed text-text-secondary">
          {message || (isExpired
            ? 'This section has already been marked complete.'
            : 'The interviewer service is temporarily unavailable.')}
        </p>
      </div>
      {!isExpired && onRetry && (
        <ExamButton size="lg" className="w-full" onClick={onRetry}>
          Try again
        </ExamButton>
      )}
    </div>
  )
}
