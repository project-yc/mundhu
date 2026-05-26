import { useLocation, useParams } from 'react-router-dom'
import { IconCheck } from '@tabler/icons-react'

export default function CandidateAssessmentCompletePage() {
  const { instanceId } = useParams()
  const location = useLocation()
  const completionState = location.state || {}

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6">
      <div className="w-full max-w-md text-center space-y-7 animate-slideInUp">
        <div className="w-16 h-16 rounded-full bg-emerald/10 border border-emerald/20 flex items-center justify-center mx-auto">
          <IconCheck size={28} className="text-emerald" />
        </div>

        <div className="space-y-2">
          <h1 className="text-zinc-50 text-2xl font-bold tracking-tight">Assessment Complete</h1>
          <p className="text-zinc-400 text-sm leading-relaxed">
            Your responses have been submitted successfully. The hiring team can continue reviewing your progress while grading finishes in the background.
          </p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl px-6 py-5 text-zinc-400 text-sm leading-relaxed text-left space-y-1">
          <p>Assessment instance: <span className="text-zinc-200 font-mono">{completionState.assessmentInstanceId || instanceId}</span></p>
          <p>Last section: <span className="text-zinc-200 font-mono">{completionState.sectionId || 'n/a'}</span></p>
        </div>

        <p className="text-zinc-700 text-xs">
          Powered by <span className="text-zinc-500">TruDev</span>
        </p>
      </div>
    </div>
  )
}