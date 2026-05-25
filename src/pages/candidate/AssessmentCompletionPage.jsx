import { useLocation, useParams } from 'react-router-dom'
import { IconCheck } from '@tabler/icons-react'
import { loadMcqSession } from '../../api/candidate/assessmentSession'

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
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6">
      <div className="w-full max-w-md text-center space-y-7 animate-slideInUp">

        {/* Icon */}
        <div className="w-16 h-16 rounded-full bg-emerald/10 border border-emerald/20 flex items-center justify-center mx-auto">
          <IconCheck size={28} className="text-emerald" />
        </div>

        {/* Copy */}
        <div className="space-y-2">
          <h1 className="text-zinc-50 text-2xl font-bold tracking-tight">
            Assessment Complete
          </h1>
          <p className="text-zinc-400 text-sm leading-relaxed">
            Thank you,{' '}
            <span className="text-zinc-200 font-medium">{candidateName}</span>.{' '}
            Your responses for{' '}
            <span className="text-zinc-200">{assessmentName}</span> have been
            submitted successfully.
          </p>
        </div>

        {/* Card */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl px-6 py-5 text-zinc-400 text-sm leading-relaxed">
          The hiring team will review your results and reach out soon.
          You may close this tab.
        </div>

        {/* Footer */}
        <p className="text-zinc-700 text-xs">
          Powered by <span className="text-zinc-500">TruDev</span>
        </p>
      </div>
    </div>
  )
}
