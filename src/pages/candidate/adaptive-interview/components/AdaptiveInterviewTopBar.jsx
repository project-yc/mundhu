import { ExamTopBar } from '../../../../components/candidate/exam/ExamShell'
import { ExamBrand, ConnectionStatus } from '../../../../components/candidate/exam/ExamStatus'
import ExamTimer from '../../../../components/candidate/exam/ExamTimer'

export default function AdaptiveInterviewTopBar({
  branding,
  sectionName,
  sectionOrder,
  sectionCount,
  questionNumber,
  questionTotal,
  remainingSeconds,
  elapsedSeconds,
}) {
  // Progress alongside the countdown. Without a denominator the timer is just
  // pressure: a candidate cannot tell whether they have two questions left or
  // six, so they over-invest in the first one and get cut off.
  const showProgress = Number.isFinite(questionNumber) && Number.isFinite(questionTotal) && questionTotal > 0
  // Deliberately no "Finish interview" button: the interview ends itself after
  // the last question, and an early-exit button let a candidate answer one
  // strong question and bank full section credit for it.
  return (
    <ExamTopBar brand={<ExamBrand branding={branding} fallback={sectionName} />}>
      {sectionOrder && sectionCount && (
        <span className="hidden text-[13px] text-text-muted md:inline">
          Section {sectionOrder} of {sectionCount}
        </span>
      )}
      {showProgress && (
        <span className="text-[13px] font-medium text-text-secondary">
          Question {Math.min(questionNumber, questionTotal)} of {questionTotal}
        </span>
      )}
      <ExamTimer remainingSeconds={remainingSeconds} elapsedSeconds={elapsedSeconds} />
      <ConnectionStatus />
    </ExamTopBar>
  )
}
