import { useLocation, useParams } from 'react-router-dom'
import { CandidateCompletionScreen } from '../../components/candidate/CandidateSectionScaffold'

export default function CandidateAssessmentCompletePage() {
  const { instanceId } = useParams()
  const location = useLocation()
  const completionState = location.state || {}

  return (
    <CandidateCompletionScreen
      message="Your responses have been submitted successfully. The hiring team can continue reviewing your progress while grading finishes in the background."
      details={(
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl px-6 py-5 text-zinc-400 text-sm leading-relaxed text-left space-y-1">
          <p>Assessment instance: <span className="text-zinc-200 font-mono">{completionState.assessmentInstanceId || instanceId}</span></p>
          <p>Last section: <span className="text-zinc-200 font-mono">{completionState.sectionId || 'n/a'}</span></p>
        </div>
      )}
    />
  )
}