// Shared "what do we do with the response of start-mcq" branching, used by
// both the terms page (the only place that now calls startMcqAssessment) and
// the legacy McqSectionPage resume path. Keeping this in one place means a
// new next_action only needs to be taught to navigate once.
import {
  buildCandidateCompletionRoute,
  buildCandidateSectionRoute,
  clearCandidateRuntimeState,
  saveCandidateRuntimeState,
} from '../../api/candidate/runtime'
import { saveMcqSession } from '../../api/candidate/assessmentSession'

export function handleAssessmentStartResponse(data, { token, overview, navigate }) {
  saveMcqSession({
    token,
    instanceToken: data.instance_token,
    instanceId: data.instance_id,
    sections: data.sections || [],
    candidateName: overview?.candidate_name,
    assessmentName: overview?.assessment_name,
  })

  if (data.next_action === 'assessment_complete') {
    clearCandidateRuntimeState()
    navigate(
      data.frontend_route || data.completion_route || buildCandidateCompletionRoute(data.assessment_instance_id || data.instance_id),
      { replace: true },
    )
    return
  }

  if (data.next_action === 'open_section' || data.next_action === 'launch_coding') {
    const runtime = saveCandidateRuntimeState(data)
    navigate(
      data.frontend_route || buildCandidateSectionRoute(data.assessment_instance_id || data.instance_id, data.section_id),
      { replace: true, state: { runtime } },
    )
    return
  }

  navigate(`/assessment/${token}/mcq/0`, { replace: true })
}
