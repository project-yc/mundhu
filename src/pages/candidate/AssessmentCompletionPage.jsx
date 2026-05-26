import { useLocation, useParams } from 'react-router-dom'
import { loadMcqSession } from '../../api/candidate/assessmentSession'
import { CandidateCompletionScreen } from '../../components/candidate/CandidateSectionScaffold'

export default function AssessmentCompletionPage() {
  const location = useLocation()
  useParams() // keep token in scope in case needed

  // Prefer router state (passed on navigate), fall back to session storage
  const session = loadMcqSession()
  const candidateName =
    location.state?.candidateName ?? session?.candidateName ?? 'Candidate'
  const assessmentName =
    location.state?.assessmentName ?? session?.assessmentName ?? 'Assessment'

  return (
    <CandidateCompletionScreen
      message={(
        <>
          Thank you,{' '}
          <span className="text-zinc-200 font-medium">{candidateName}</span>.{' '}
          Your responses for{' '}
          <span className="text-zinc-200">{assessmentName}</span> have been submitted successfully.
        </>
      )}
      details={(
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl px-6 py-5 text-zinc-400 text-sm leading-relaxed">
          The hiring team will review your results and reach out soon. You may close this tab.
        </div>
      )}
    />
  )
}
