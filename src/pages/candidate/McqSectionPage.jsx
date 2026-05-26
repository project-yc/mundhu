import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { buildCandidateCompletionRoute, buildCandidateSectionRoute, clearCandidateRuntimeState, saveCandidateRuntimeState } from '../../api/candidate/runtime'
import {
  clearMcqSession,
  loadMcqSession,
} from '../../api/candidate/assessmentSession'
import CandidateMcqSectionExperience from '../../components/candidate/CandidateMcqSectionExperience'

// ─── Main page component ──────────────────────────────────────────

export default function McqSectionPage() {
  const { token, sectionIndex: sectionIndexStr } = useParams()
  const navigate = useNavigate()
  const sectionIndex = parseInt(sectionIndexStr, 10)

  const [session] = useState(() => loadMcqSession())
  const section = useMemo(
    () => session?.sections?.[sectionIndex] ?? null,
    [session, sectionIndex],
  )
  if (!session || !section || Number.isNaN(sectionIndex)) {
    return null
  }

  const handleSubmitResult = async (result) => {
    if (result.next_action === 'assessment_complete') {
      clearCandidateRuntimeState()
      clearMcqSession()
      navigate(result.frontend_route || buildCandidateCompletionRoute(result.assessment_instance_id || session.instanceId), {
        replace: true,
        state: {
          candidateName: session.candidateName,
          assessmentName: session.assessmentName,
          assessmentInstanceId: result.assessment_instance_id || session.instanceId,
          sectionId: result.section_id || section.section_id,
        },
      })
      return
    }

    if (result.next_action === 'launch_coding' || result.next_action === 'open_section') {
      const runtime = saveCandidateRuntimeState(result)
      navigate(
        result.frontend_route || buildCandidateSectionRoute(result.assessment_instance_id || session.instanceId, result.section_id),
        { replace: true, state: { runtime } },
      )
      return
    }

    clearCandidateRuntimeState()
    clearMcqSession()
    navigate(buildCandidateCompletionRoute(session.instanceId), { replace: true })
  }

  return (
    <CandidateMcqSectionExperience
      assessmentInstanceId={session.instanceId}
      sectionToken={session.instanceToken}
      sectionId={section.section_id}
      sectionName={section.name}
      sectionItems={section.items || []}
      sectionTimerMinutes={section.timer_minutes}
      sectionOrder={sectionIndex + 1}
      sectionCount={session.sections?.length ?? 1}
      onSubmitResult={handleSubmitResult}
    />
  )
}
