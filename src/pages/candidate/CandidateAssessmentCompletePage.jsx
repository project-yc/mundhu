import { useLocation, useParams } from 'react-router-dom'

export default function CandidateAssessmentCompletePage() {
  const { instanceId } = useParams()
  const location = useLocation()
  const completionState = location.state || {}

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6">
      <div className="max-w-2xl mx-auto border border-slate-800 bg-slate-900 p-6 rounded">
        <h1 className="text-xl font-semibold">Assessment Complete</h1>
        <p className="mt-3 text-sm text-slate-300">
          The backend progression contract reported <span className="font-mono">assessment_complete</span>.
        </p>
        <div className="mt-6 space-y-2 text-sm font-mono">
          <div>assessment_instance_id: {completionState.assessmentInstanceId || instanceId}</div>
          <div>section_id: {completionState.sectionId || 'n/a'}</div>
          <div>next_action: assessment_complete</div>
        </div>
      </div>
    </div>
  )
}