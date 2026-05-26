import { useCallback, useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { Zap } from 'lucide-react'
import {
  autosaveFreeTextRuntime,
  autosaveMcqRuntime,
  autosaveRankingRuntime,
  buildCandidateCompletionRoute,
  buildCandidateSectionRoute,
  clearCandidateRuntimeState,
  getCandidateNextAction,
  getFreeTextRuntime,
  getMcqRuntime,
  getRankingRuntime,
  loadCandidateRuntimeState,
  normalizeCandidateRuntimeState,
  saveCandidateRuntimeState,
  submitFreeTextRuntime,
  submitMcqRuntime,
  submitRankingRuntime,
} from '../../api/candidate/runtime'
import { CandidateBootScreen, TOTAL_BOOT_MS } from '../../components/candidate/CandidateBootScreen'
import {
  CandidateCenteredErrorState,
  CandidateCenteredLoadingState,
  CandidateErrorBanner,
  CandidateFooter,
  CandidatePrimaryButton,
  CandidateSecondaryButton,
  CandidateSectionIntroScreen,
} from '../../components/candidate/CandidateSectionScaffold'
import CandidateMcqSectionExperience from '../../components/candidate/CandidateMcqSectionExperience'

const MAX_BOOT_WAIT_MS = 45000
const BOOT_POLL_INTERVAL_MS = 1500
const POST_SUBMIT_TRANSITION_MS = 1200

const SECTION_LABELS = {
  mcq: 'MCQ',
  free_text: 'Free Text',
  ranking: 'Ranking',
  technical_task: 'Coding',
}

const delay = (ms) => new Promise((resolve) => window.setTimeout(resolve, ms))

const clearSubmissionTransitionParams = () => {
  const url = new URL(window.location.href)
  if (!url.searchParams.has('submission_status') && !url.searchParams.has('submitted_section_type')) {
    return
  }
  url.searchParams.delete('submission_status')
  url.searchParams.delete('submitted_section_type')
  window.history.replaceState(window.history.state, '', `${url.pathname}${url.search}${url.hash}`)
}

const getBootstrapRuntime = (locationState, searchParams, params) => {
  const stateRuntime = locationState?.runtime ? normalizeCandidateRuntimeState(locationState.runtime) : null
  const queryRuntime = searchParams.get('section_token')
    ? normalizeCandidateRuntimeState({
        assessment_instance_id: params.instanceId,
        section_id: params.sectionId,
        current_item_attempt_id: searchParams.get('current_item_attempt_id'),
        content_type: searchParams.get('content_type'),
        section_token: searchParams.get('section_token'),
      })
    : null
  const storedRuntime = loadCandidateRuntimeState()

  return stateRuntime || queryRuntime || storedRuntime
}

const reorderRankingOptions = (options, rankedOptionIds) => {
  if (!Array.isArray(options) || !Array.isArray(rankedOptionIds) || rankedOptionIds.length === 0) {
    return options || []
  }

  const byId = new Map(options.map((option) => [String(option.id), option]))
  const ranked = rankedOptionIds.map((id) => byId.get(String(id))).filter(Boolean)
  const remaining = options.filter((option) => !rankedOptionIds.includes(String(option.id)))
  return [...ranked, ...remaining]
}

async function probeWorkspaceReady(workspaceUrl) {
  const normalizedUrl = workspaceUrl?.endsWith('/') ? workspaceUrl : `${workspaceUrl}/`
  try {
    await fetch(`${normalizedUrl}?boot_probe=${Date.now()}`, {
      method: 'GET',
      mode: 'no-cors',
      cache: 'no-store',
    })
    return true
  } catch {
    return false
  }
}

function CandidateSectionReviewScreen({
  sectionLabel,
  sectionName,
  assessmentName,
  prompt,
  answerPreview,
  error,
  onBack,
  onSubmit,
  submitting,
}) {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-6">
      <div className="max-w-3xl mx-auto space-y-6 animate-slideInUp">
        <div className="text-center space-y-2">
          <p className="text-zinc-600 text-xs font-semibold uppercase tracking-widest">{sectionLabel} Review</p>
          <h1 className="text-zinc-50 text-2xl font-bold tracking-tight">Review Your Answer</h1>
          <p className="text-zinc-400 text-sm">{sectionName || assessmentName || 'Assessment progression'}</p>
        </div>

        {error ? <CandidateErrorBanner>{error}</CandidateErrorBanner> : null}

        <div className="border border-zinc-800 bg-zinc-900 rounded-xl p-6 space-y-4">
          <div className="space-y-2">
            <p className="text-zinc-500 text-xs font-semibold uppercase tracking-wide">Prompt</p>
            <p className="text-sm text-zinc-300 whitespace-pre-wrap">{prompt || 'No prompt returned by backend.'}</p>
          </div>

          <div className="space-y-2">
            <p className="text-zinc-500 text-xs font-semibold uppercase tracking-wide">Answer Preview</p>
            {answerPreview}
          </div>
        </div>

        <div className="flex gap-3 justify-end">
          <CandidateSecondaryButton onClick={onBack} disabled={submitting}>
            Edit Answer
          </CandidateSecondaryButton>
          <CandidatePrimaryButton className="w-auto px-4 py-2" onClick={onSubmit} disabled={submitting}>
            {submitting ? 'Submitting…' : 'Submit Section'}
          </CandidatePrimaryButton>
        </div>
      </div>
    </div>
  )
}

export default function CandidateSectionRuntimePage() {
    const { instanceId, sectionId } = useParams()
    const location = useLocation()
    const navigate = useNavigate()

    const [runtimeState, setRuntimeState] = useState(() => getBootstrapRuntime(location.state, new URLSearchParams(location.search), { instanceId, sectionId }))
    const [content, setContent] = useState(null)
    const [screen, setScreen] = useState('preparing')
    const [error, setError] = useState('')
    const [saving, setSaving] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [selectedOptionIds, setSelectedOptionIds] = useState([])
    const [freeTextValue, setFreeTextValue] = useState('')
    const [rankingOptions, setRankingOptions] = useState([])

    const handleNextAction = useCallback((actionPayload) => {
      if (!actionPayload?.next_action) {
        throw new Error('Backend did not return next_action')
      }

      if (actionPayload.next_action === 'launch_coding') {
        if (!actionPayload.section_id || !actionPayload.assessment_instance_id) {
          throw new Error('Coding section response is missing section route metadata')
        }
        const nextRuntime = saveCandidateRuntimeState(actionPayload)
        setRuntimeState(nextRuntime)
        navigate(
          actionPayload.frontend_route || buildCandidateSectionRoute(actionPayload.assessment_instance_id, actionPayload.section_id),
          { replace: true, state: { runtime: nextRuntime } },
        )
        return
      }

      if (actionPayload.next_action === 'open_section') {
        const nextRuntime = saveCandidateRuntimeState(actionPayload)
        setRuntimeState(nextRuntime)
        navigate(
          actionPayload.frontend_route || buildCandidateSectionRoute(actionPayload.assessment_instance_id, actionPayload.section_id),
          { replace: true, state: { runtime: nextRuntime } },
        )
        return
      }

      if (actionPayload.next_action === 'assessment_complete') {
        clearCandidateRuntimeState()
        navigate(
          actionPayload.frontend_route || actionPayload.completion_route || buildCandidateCompletionRoute(actionPayload.assessment_instance_id || instanceId),
          {
            replace: true,
            state: {
              assessmentInstanceId: actionPayload.assessment_instance_id || instanceId,
              sectionId: actionPayload.section_id || sectionId,
            },
          },
        )
        return
      }

      throw new Error(`Unsupported next_action: ${actionPayload.next_action}`)
    }, [instanceId, navigate, sectionId])

    useEffect(() => {
      const prepareRuntime = async () => {
        setError('')
        const searchParams = new URLSearchParams(location.search)
        const returningFromCodingSubmit = (
          searchParams.get('submission_status') === 'submitted'
          && searchParams.get('submitted_section_type') === 'technical_task'
        )

        if (returningFromCodingSubmit) {
          setScreen('submitting')
        }

        try {
          const currentSearchParams = new URLSearchParams(location.search)
          let nextRuntime = getBootstrapRuntime(location.state, currentSearchParams, { instanceId, sectionId })

          if (!nextRuntime?.sectionToken) {
            throw new Error('Missing section token for candidate runtime')
          }

          const needsRuntimeRefresh = (
            !nextRuntime.currentItemAttemptId
            || !nextRuntime.contentType
            || !nextRuntime.sectionName
            || !nextRuntime.assessmentName
            || (nextRuntime.contentType === 'mcq' && (!Array.isArray(nextRuntime.sectionItems) || nextRuntime.sectionItems.length === 0))
            || (nextRuntime.contentType === 'technical_task' && !nextRuntime.workspaceUrl)
          )

          if (needsRuntimeRefresh) {
            const nextAction = await getCandidateNextAction(instanceId, nextRuntime.sectionToken)
            if (nextAction.next_action !== 'open_section' && nextAction.next_action !== 'launch_coding') {
              handleNextAction(nextAction)
              return
            }
            nextRuntime = saveCandidateRuntimeState(nextAction)
          } else {
            nextRuntime = saveCandidateRuntimeState(nextRuntime)
          }

          setRuntimeState(nextRuntime)
          setContent(null)
          if (returningFromCodingSubmit) {
            await delay(POST_SUBMIT_TRANSITION_MS)
            clearSubmissionTransitionParams()
          }
          setScreen('overview')
        } catch (hydrateError) {
          setError(hydrateError.message || 'Failed to load candidate section runtime')
          setScreen('error')
        }
      }

      prepareRuntime()
    }, [handleNextAction, instanceId, sectionId, location.key, location.search, location.state])

    useEffect(() => {
      if (screen !== 'booting' || !runtimeState?.workspaceUrl) {
        return undefined
      }

      let cancelled = false

      const waitForWorkspace = async () => {
        const bootStartedAt = Date.now()
        await delay(TOTAL_BOOT_MS)

        while (!cancelled) {
          const isReady = await probeWorkspaceReady(runtimeState.workspaceUrl)
          if (cancelled) {
            return
          }
          if (isReady || (Date.now() - bootStartedAt) >= MAX_BOOT_WAIT_MS) {
            window.location.href = runtimeState.workspaceUrl
            return
          }
          await delay(BOOT_POLL_INTERVAL_MS)
        }
      }

      waitForWorkspace()

      return () => {
        cancelled = true
      }
    }, [runtimeState?.workspaceUrl, screen])

    const loadSectionContent = useCallback(async (nextRuntime) => {
      let payload = null

      if (nextRuntime.contentType === 'mcq') {
        payload = await getMcqRuntime(nextRuntime.currentItemAttemptId, nextRuntime.sectionToken)
        setSelectedOptionIds(payload?.response?.selected_option_ids || [])
      } else if (nextRuntime.contentType === 'free_text') {
        payload = await getFreeTextRuntime(nextRuntime.currentItemAttemptId, nextRuntime.sectionToken)
        setFreeTextValue(payload?.response?.response_text || '')
      } else if (nextRuntime.contentType === 'ranking') {
        payload = await getRankingRuntime(nextRuntime.currentItemAttemptId, nextRuntime.sectionToken)
        const options = payload?.question?.options || []
        setRankingOptions(reorderRankingOptions(options, payload?.response?.ranked_option_ids || []))
      } else {
        throw new Error(`Unsupported content_type: ${nextRuntime.contentType}`)
      }

      setContent(payload)
    }, [])

    const beginSection = useCallback(async () => {
      if (!runtimeState) {
        return
      }

      setError('')

      if (runtimeState.contentType === 'technical_task') {
        if (!runtimeState.workspaceUrl) {
          setError('Workspace URL is missing for this coding section')
          return
        }
        setScreen('booting')
        return
      }

      setScreen('loading')
      try {
        await loadSectionContent(runtimeState)
        setScreen('runtime')
      } catch (loadError) {
        setError(loadError.message || 'Failed to load section content')
        setScreen('overview')
      }
    }, [loadSectionContent, runtimeState])

    const handleMcqToggle = (optionId, selectionMode) => {
      if (selectionMode === 'single') {
        setSelectedOptionIds([optionId])
        return
      }

      setSelectedOptionIds((current) => (
        current.includes(optionId)
          ? current.filter((id) => id !== optionId)
          : [...current, optionId]
      ))
    }

    const moveRankingOption = (index, direction) => {
      setRankingOptions((current) => {
        const next = [...current]
        const targetIndex = index + direction
        if (targetIndex < 0 || targetIndex >= next.length) {
          return current
        }
        const [moved] = next.splice(index, 1)
        next.splice(targetIndex, 0, moved)
        return next
      })
    }

    const saveDraft = async () => {
      if (!runtimeState) {
        return
      }

      setSaving(true)
      setError('')
      try {
        if (runtimeState.contentType === 'mcq') {
          await autosaveMcqRuntime(runtimeState.currentItemAttemptId, runtimeState.sectionToken, selectedOptionIds)
        } else if (runtimeState.contentType === 'free_text') {
          await autosaveFreeTextRuntime(runtimeState.currentItemAttemptId, runtimeState.sectionToken, freeTextValue)
        } else if (runtimeState.contentType === 'ranking') {
          await autosaveRankingRuntime(
            runtimeState.currentItemAttemptId,
            runtimeState.sectionToken,
            rankingOptions.map((option) => String(option.id)),
          )
        }
      } catch (saveError) {
        setError(saveError.message || 'Draft save failed')
      } finally {
        setSaving(false)
      }
    }

    const submitSection = async () => {
      if (!runtimeState) {
        return
      }

      setSubmitting(true)
      setError('')
      try {
        let payload = null
        if (runtimeState.contentType === 'mcq') {
          payload = await submitMcqRuntime(runtimeState.currentItemAttemptId, runtimeState.sectionToken, selectedOptionIds)
        } else if (runtimeState.contentType === 'free_text') {
          payload = await submitFreeTextRuntime(runtimeState.currentItemAttemptId, runtimeState.sectionToken, freeTextValue)
        } else if (runtimeState.contentType === 'ranking') {
          payload = await submitRankingRuntime(
            runtimeState.currentItemAttemptId,
            runtimeState.sectionToken,
            rankingOptions.map((option) => String(option.id)),
          )
        }

        handleNextAction(payload)
      } catch (submitError) {
        setError(submitError.message || 'Submit failed')
        if (runtimeState.contentType === 'free_text' || runtimeState.contentType === 'ranking') {
          setScreen('review')
        }
      } finally {
        setSubmitting(false)
      }
    }

  const getReviewAnswerPreview = () => {
    if (runtimeState?.contentType === 'free_text') {
      return freeTextValue?.trim()
        ? <div className="rounded-xl border border-zinc-800 bg-zinc-950/70 px-4 py-4 text-sm text-zinc-300 whitespace-pre-wrap">{freeTextValue}</div>
        : <p className="text-sm text-zinc-500">No response entered yet.</p>
    }

    if (runtimeState?.contentType === 'ranking') {
      return rankingOptions.length > 0 ? (
        <div className="space-y-2">
          {rankingOptions.map((option, index) => (
            <div key={option.id} className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-950/70 px-4 py-3 text-sm text-zinc-300">
              <span className="w-6 h-6 rounded-full bg-zinc-800 text-zinc-400 text-xs font-semibold flex items-center justify-center shrink-0">{index + 1}</span>
              <span>{option.text}</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-zinc-500">No ranking order available.</p>
      )
    }

    return null
  }

  if (screen === 'preparing') {
    return <CandidateCenteredLoadingState label="Loading section runtime..." />
  }

  if (screen === 'error') {
    return <CandidateCenteredErrorState title="Section unavailable" message={error} />
  }

  const question = content?.question || {}
  const selectionMode = question.selection_mode || 'single'
  const sectionLabel = SECTION_LABELS[runtimeState?.contentType] || 'Section'

  if (screen === 'overview') {
    if (runtimeState?.contentType === 'mcq') {
      return (
        <CandidateMcqSectionExperience
          assessmentInstanceId={runtimeState.assessmentInstanceId}
          sectionToken={runtimeState.sectionToken}
          sectionId={runtimeState.sectionId}
          sectionName={runtimeState.sectionName || 'MCQ Section'}
          sectionItems={runtimeState.sectionItems || []}
          sectionTimerMinutes={runtimeState.sectionTimerMinutes}
          sectionOrder={runtimeState.sectionOrder}
          sectionCount={runtimeState.sectionCount}
          onSubmitResult={async (result) => handleNextAction(result)}
        />
      )
    }

    return (
      <CandidateSectionIntroScreen
        eyebrow={`${sectionLabel} Section`}
        title={runtimeState?.sectionName || 'Next Section'}
        subtitle={runtimeState?.assessmentName || 'Assessment progression'}
        metaItems={[
          sectionLabel,
          ...(runtimeState?.sectionTimerMinutes ? [`${runtimeState.sectionTimerMinutes} min`] : []),
        ]}
        tips={runtimeState?.contentType === 'technical_task'
          ? [
              'Click Start Section to begin the workspace boot sequence.',
              'You will only be redirected once the workspace is reachable.',
            ]
          : [
              'Click Start Section when you are ready to begin.',
              'The next section becomes available immediately after submission while grading continues in the background.',
            ]}
        error={error}
        actionContent="Start Section"
        onAction={beginSection}
      />
    )
  }

    if (screen === 'booting') {
      return (
        <div className="min-h-screen bg-[#040914] flex flex-col items-center justify-center p-4">
          <div className="flex items-center gap-2 mb-10">
            <Zap className="w-4 h-4 text-[#18d3ff]" strokeWidth={2.5} />
            <span className="text-sm font-bold tracking-[0.08em] text-[#edf4ff]">TruDev</span>
          </div>
          <CandidateBootScreen />
          <div className="mt-6">
            <CandidateFooter brand="TruDev Assessment Platform" />
          </div>
        </div>
      )
    }

  if (screen === 'loading') {
    return <CandidateCenteredLoadingState label="Loading section content..." />
  }

  if (screen === 'submitting') {
    return <CandidateCenteredLoadingState label="Submitting answers..." />
  }

  if (screen === 'review') {
    return (
      <CandidateSectionReviewScreen
        sectionLabel={sectionLabel}
        sectionName={runtimeState?.sectionName}
        assessmentName={runtimeState?.assessmentName}
        prompt={question.prompt}
        answerPreview={getReviewAnswerPreview()}
        error={error}
        onBack={() => setScreen('runtime')}
        onSubmit={submitSection}
        submitting={submitting}
      />
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-6">
      <div className="max-w-3xl mx-auto space-y-6 animate-slideInUp">
        <div className="text-center space-y-2">
          <p className="text-zinc-600 text-xs font-semibold uppercase tracking-widest">{sectionLabel} Section</p>
          <h1 className="text-zinc-50 text-2xl font-bold tracking-tight">{runtimeState?.sectionName || 'Section'}</h1>
          <p className="text-zinc-400 text-sm">{runtimeState?.assessmentName || 'Assessment progression'}</p>
        </div>

        {error ? <CandidateErrorBanner>{error}</CandidateErrorBanner> : null}

        <div className="border border-zinc-800 bg-zinc-900 rounded-xl p-6 space-y-4">
          <p className="text-sm text-zinc-300 whitespace-pre-wrap">{question.prompt || 'No prompt returned by backend.'}</p>

            {runtimeState?.contentType === 'mcq' ? (
              <div className="space-y-3">
                {(question.options || []).map((option) => {
                  const checked = selectedOptionIds.includes(String(option.id))
                  return (
                    <label key={option.id} className={`flex items-start gap-3 rounded-lg px-4 py-3 cursor-pointer border transition-all ${checked ? 'bg-cyan/10 border-cyan/40 text-zinc-100' : 'bg-zinc-800/40 border-zinc-700/40 text-zinc-300 hover:border-zinc-600/80 hover:bg-zinc-800/70'}`}>
                      <input
                        type={selectionMode === 'single' ? 'radio' : 'checkbox'}
                        name="mcq-option"
                        checked={checked}
                        onChange={() => handleMcqToggle(String(option.id), selectionMode)}
                      />
                      <span className="text-sm">{option.text}</span>
                    </label>
                  )
                })}
              </div>
            ) : null}

            {runtimeState?.contentType === 'free_text' ? (
              <textarea
                className="w-full min-h-48 bg-zinc-950 border border-zinc-700 rounded-xl p-3 text-sm"
                value={freeTextValue}
                onChange={(event) => setFreeTextValue(event.target.value)}
              />
            ) : null}

            {runtimeState?.contentType === 'ranking' ? (
              <div className="space-y-3">
                {rankingOptions.map((option, index) => (
                  <div key={option.id} className="border border-zinc-800 rounded-xl p-3 flex items-center justify-between gap-4 bg-zinc-950/60">
                    <div className="text-sm">
                      <div className="font-mono text-xs text-zinc-500">rank {index + 1}</div>
                      <div>{option.text}</div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        className="px-2 py-1 border border-zinc-700 rounded text-xs text-zinc-300"
                        onClick={() => moveRankingOption(index, -1)}
                        disabled={index === 0}
                      >
                        Up
                      </button>
                      <button
                        type="button"
                        className="px-2 py-1 border border-zinc-700 rounded text-xs text-zinc-300"
                        onClick={() => moveRankingOption(index, 1)}
                        disabled={index === rankingOptions.length - 1}
                      >
                        Down
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}

          <div className="flex gap-3">
            <CandidateSecondaryButton onClick={saveDraft} disabled={saving || submitting}>
              {saving ? 'Saving…' : 'Save Draft'}
            </CandidateSecondaryButton>
            <CandidatePrimaryButton
              className="w-auto px-4 py-2"
              onClick={runtimeState?.contentType === 'free_text' || runtimeState?.contentType === 'ranking' ? () => setScreen('review') : submitSection}
              disabled={submitting}
            >
              {runtimeState?.contentType === 'free_text' || runtimeState?.contentType === 'ranking'
                ? 'Review & Submit'
                : (submitting ? 'Submitting…' : 'Submit Section')}
            </CandidatePrimaryButton>
          </div>
        </div>
      </div>
    </div>
  )
}