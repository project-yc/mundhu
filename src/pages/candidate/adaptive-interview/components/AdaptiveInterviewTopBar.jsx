import { ExamTopBar } from '../../../../components/candidate/exam/ExamShell'
import ExamButton from '../../../../components/candidate/exam/ExamButton'
import { ExamBrand, ConnectionStatus } from '../../../../components/candidate/exam/ExamStatus'
import ExamTimer from '../../../../components/candidate/exam/ExamTimer'

export default function AdaptiveInterviewTopBar({
  branding,
  sectionName,
  sectionOrder,
  sectionCount,
  remainingSeconds,
  elapsedSeconds,
  onFinish,
}) {
  return (
    <ExamTopBar brand={<ExamBrand branding={branding} fallback={sectionName} />}>
      {sectionOrder && sectionCount && (
        <span className="hidden text-[13px] text-text-muted md:inline">
          Section {sectionOrder} of {sectionCount}
        </span>
      )}
      <ExamTimer remainingSeconds={remainingSeconds} elapsedSeconds={elapsedSeconds} />
      <ConnectionStatus />
      {/* Only shown once there is a real way to end the interview server-side;
          a local-only finish would leave the run open and unscored. */}
      {onFinish && (
        <ExamButton variant="outline" size="md" onClick={onFinish}>
          Finish interview
        </ExamButton>
      )}
    </ExamTopBar>
  )
}
