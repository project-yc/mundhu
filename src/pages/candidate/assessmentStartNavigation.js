// Shared "what do we do with the start response" branching, used by both the
// terms page (the only place that now calls startAssessment) and the legacy
// McqSectionPage resume path. Keeping this in one place means a new
// next_action only needs to be taught to navigate once.
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

  // Every action that opens a section routes the same way — through the section
  // runtime, which dispatches on `content_type`.
  //
  // `launch_adaptive_interview` was missing, so an adaptive section fell through
  // to the MCQ carousel below and the candidate hit "Session expired" — an
  // adaptive-only assessment could not be started at all. The backend has
  // exactly four actions (`assessment_run_service.get_next_action`); keep this
  // list in step with it rather than defaulting unknown ones to MCQ.
  const SECTION_ACTIONS = ['open_section', 'launch_coding', 'launch_adaptive_interview']
  if (SECTION_ACTIONS.includes(data.next_action)) {
    const runtime = saveCandidateRuntimeState(data)
    navigate(
      data.frontend_route || buildCandidateSectionRoute(data.assessment_instance_id || data.instance_id, data.section_id),
      { replace: true, state: { runtime } },
    )
    return
  }

  // Legacy MCQ carousel. Only correct when the backend genuinely returned MCQ
  // sections — an unrecognised action lands here otherwise and dead-ends.
  if (data.sections?.length) {
    navigate(`/assessment/${token}/mcq/0`, { replace: true })
    return
  }

  // Nothing we know how to open, and no MCQ carousel to fall back on. Send the
  // candidate somewhere truthful instead of a screen that says their session
  // expired when it did not.
  const runtime = saveCandidateRuntimeState(data)
  navigate(
    data.frontend_route || buildCandidateSectionRoute(data.assessment_instance_id || data.instance_id, data.section_id),
    { replace: true, state: { runtime } },
  )
}
