import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  IconBrain,
  IconChevronRight,
  IconClock,
  IconCode,
  IconListCheck,
} from '@tabler/icons-react'
import {
  getAssessmentOverview,
  saveMcqSession,
  startMcqAssessment,
} from '../../api/candidate/assessmentSession'
import {
  buildCandidateCompletionRoute,
  buildCandidateSectionRoute,
  clearCandidateRuntimeState,
  saveCandidateRuntimeState,
} from '../../api/candidate/runtime'
import {
  applyCandidateBranding,
  saveCandidateBranding,
} from '../../theme/CandidateThemeProvider.jsx'
import {
  CandidateCenteredErrorState,
  CandidateCenteredLoadingState,
  CandidateErrorBanner,
  CandidatePageShell,
  CandidatePrimaryButton,
} from '../../components/candidate/CandidateSectionScaffold'

const AI_LEVEL_LABELS = {
  full: 'Full AI access',
  chat: 'AI chat only',
  none: 'No AI assistance',
}

const SECTION_CONFIG = {
  mcq: {
    label: 'MCQ',
    Icon: IconListCheck,
    badgeClass: 'bg-amber-400/10 text-amber-400',
  },
  technical_task: {
    label: 'Coding',
    Icon: IconCode,
    badgeClass: 'bg-sky-400/10 text-sky-400',
  },
}

export default function AssessmentLandingPage() {
  const { token } = useParams()
  const navigate = useNavigate()

  const [overview, setOverview] = useState(null)
  const [loading, setLoading] = useState(true)
  const [starting, setStarting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    getAssessmentOverview(token)
      .then((data) => {
        if (data?.org_branding) {
          saveCandidateBranding(data.org_branding)
          applyCandidateBranding(data.org_branding)
        }
        setOverview(data)
      })
      .catch((e) => setError(e.message || 'Failed to load assessment'))
      .finally(() => setLoading(false))
  }, [token])

  const handleStart = async () => {
    setStarting(true)
    setError('')
    try {
      const data = await startMcqAssessment(token)
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
    } catch (e) {
      setError(e.message || 'Failed to start assessment')
      setStarting(false)
    }
  }

  if (loading) {
    return <CandidateCenteredLoadingState label="Loading assessment..." />
  }

  if (!overview) {
    return <CandidateCenteredErrorState title="Unable to load assessment" message={error || 'This link may be invalid or expired.'} />
  }

  const sections = overview.sections || []
  const totalMins = overview.total_duration_minutes

  return (
    <CandidatePageShell>

      <div className="text-center space-y-2">
        <p className="text-brand-deep text-xs font-semibold uppercase tracking-widest">
          Assessment
        </p>
        <h1 className="text-text-primary text-2xl font-bold tracking-tight leading-tight">
          {overview.assessment_name}
        </h1>
        {overview.candidate_name && (
          <p className="text-text-secondary text-sm">
            Good luck,{' '}
            <span className="text-text-primary font-medium">{overview.candidate_name}</span>
          </p>
        )}
      </div>

        {/* Meta pills */}
        <div className="flex flex-wrap items-center justify-center gap-2.5">
          {totalMins && (
            <span className="inline-flex items-center gap-1.5 text-xs text-text-secondary bg-surface-muted border border-border-default px-2.5 py-1 rounded-full">
              <IconClock size={12} />
              {totalMins} min total
            </span>
          )}
          {overview.ai_level && (
            <span className="inline-flex items-center gap-1.5 text-xs text-text-secondary bg-surface-muted border border-border-default px-2.5 py-1 rounded-full">
              <IconBrain size={12} />
              {AI_LEVEL_LABELS[overview.ai_level] || overview.ai_level}
            </span>
          )}
        </div>

        {/* Section list */}
        {sections.length > 0 && (
          <div className="border border-border-default rounded-xl overflow-hidden">
            <div className="px-4 py-2.5 bg-surface-muted border-b border-border-default">
              <p className="text-text-muted text-xs font-semibold uppercase tracking-widest">
                {sections.length} {sections.length === 1 ? 'Section' : 'Sections'}
              </p>
            </div>
            <ul className="bg-surface divide-y divide-border-default cand-section-list">
              {sections.map((sec, i) => {
                const cfg = SECTION_CONFIG[sec.content_type] || SECTION_CONFIG.mcq
                const Icon = cfg.Icon
                return (
                  <li
                    key={sec.id}
                    className="flex items-center gap-3 px-4 py-3 cand-section-item"
                    style={{ animationDelay: `${i * 55}ms` }}
                  >
                    <span className="text-text-faint text-xs font-mono w-4 shrink-0 text-center">
                      {i + 1}
                    </span>
                    <span className="flex-1 text-text-primary text-sm font-medium truncate">
                      {sec.name}
                    </span>
                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${cfg.badgeClass}`}
                      >
                        <Icon size={10} />
                        {cfg.label}
                      </span>
                      {sec.timer_minutes && (
                        <span className="text-text-muted text-xs flex items-center gap-1">
                          <IconClock size={10} />
                          {sec.timer_minutes}m
                        </span>
                      )}
                    </div>
                  </li>
                )
              })}
            </ul>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-surface-muted border border-border-default rounded-xl px-4 py-4 space-y-2.5">
          <p className="text-text-muted text-xs font-semibold uppercase tracking-wide">
            Before you begin
          </p>
          <ul className="space-y-2">
            {[
              'Ensure a stable internet connection',
              'Each section is timed — you cannot pause once started',
              'Your answers are saved when you submit each section',
            ].map((tip) => (
              <li key={tip} className="flex items-start gap-2.5 text-text-secondary text-sm">
                <span className="w-1 h-1 rounded-full bg-text-muted shrink-0 mt-2" />
                {tip}
              </li>
            ))}
          </ul>
        </div>

      {error ? <CandidateErrorBanner>{error}</CandidateErrorBanner> : null}

      <CandidatePrimaryButton onClick={handleStart} disabled={starting}>
        {starting ? (
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin opacity-60" />
        ) : (
          <>
            Begin Assessment
            <IconChevronRight size={16} />
          </>
        )}
      </CandidatePrimaryButton>

    </CandidatePageShell>
  )
}
