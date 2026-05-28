import { useEffect, useState } from 'react'
import { useLocation, useParams } from 'react-router-dom'
import { CandidateCenteredLoadingState, CandidateCompletionScreen } from '../../components/candidate/CandidateSectionScaffold'

const POST_SUBMIT_TRANSITION_MS = 1200

export default function CandidateAssessmentCompletePage() {
  const { instanceId } = useParams()
  const location = useLocation()
  const completionState = location.state || {}
  const [showSubmittingTransition, setShowSubmittingTransition] = useState(() => {
    const searchParams = new URLSearchParams(location.search)
    return (
      searchParams.get('submission_status') === 'submitted'
      && searchParams.get('submitted_section_type') === 'technical_task'
    )
  })

  useEffect(() => {
    if (!showSubmittingTransition) {
      return undefined
    }

    const timeoutId = window.setTimeout(() => {
      const url = new URL(window.location.href)
      url.searchParams.delete('submission_status')
      url.searchParams.delete('submitted_section_type')
      window.history.replaceState(window.history.state, '', `${url.pathname}${url.search}${url.hash}`)
      setShowSubmittingTransition(false)
    }, POST_SUBMIT_TRANSITION_MS)

    return () => window.clearTimeout(timeoutId)
  }, [showSubmittingTransition])

  if (showSubmittingTransition) {
    return <CandidateCenteredLoadingState label="Submitting answers..." />
  }

  return (
    <CandidateCompletionScreen
      message="Your responses have been submitted successfully. The hiring team can continue reviewing your progress while grading finishes in the background."
      details={(
        <div className="bg-surface-muted border border-border-default rounded-xl px-6 py-5 text-text-muted text-sm leading-relaxed text-left space-y-1">
          <p>Assessment instance: <span className="text-text-primary font-mono">{completionState.assessmentInstanceId || instanceId}</span></p>
          <p>Last section: <span className="text-text-primary font-mono">{completionState.sectionId || 'n/a'}</span></p>
        </div>
      )}
    />
  )
}