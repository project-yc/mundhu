import { useCallback, useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
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

const BOOT_STAGES = [
  { id: 0, label: 'Authenticating session', detail: 'Validating token & permissions', startAt: 0, endAt: 1500 },
  { id: 1, label: 'Fetching task bundle', detail: 'Retrieving assessment artifacts', startAt: 1500, endAt: 4500 },
  { id: 2, label: 'Unpacking resources', detail: 'Decompressing project files', startAt: 4500, endAt: 8000 },
  { id: 3, label: 'Initializing container', detail: 'Spinning up the isolated runtime', startAt: 8000, endAt: 12000 },
  { id: 4, label: 'Configuring environment', detail: 'Installing dependencies and settings', startAt: 12000, endAt: 16000 },
  { id: 5, label: 'Launching workspace', detail: 'Connecting Theia and finalizing startup', startAt: 16000, endAt: 19500 },
]

const TOTAL_BOOT_MS = 19500

const SECTION_LABELS = {
  mcq: 'MCQ',
  free_text: 'Free Text',
  ranking: 'Ranking',
  technical_task: 'Coding',
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
      const nextRuntime = saveCandidateRuntimeState(actionPayload)
      if (actionPayload.frontend_route || actionPayload.section_id) {
        setRuntimeState(nextRuntime)
        navigate(
          actionPayload.frontend_route || buildCandidateSectionRoute(actionPayload.assessment_instance_id, actionPayload.section_id),
          { replace: true, state: { runtime: nextRuntime } },
        )
        return
      }

      if (!actionPayload.workspace_url) {
        throw new Error('launch_coding did not include workspace_url')
      }

      window.location.href = actionPayload.workspace_url
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

    const timeoutId = window.setTimeout(() => {
      window.location.href = runtimeState.workspaceUrl
    }, TOTAL_BOOT_MS + 500)

    return () => window.clearTimeout(timeoutId)
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
    } finally {
      setSubmitting(false)
    }
  }

  if (screen === 'preparing') {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 p-6 font-mono">
        Loading candidate section runtime...
      </div>
    )
  }

  if (screen === 'error') {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 p-6">
        <div className="max-w-3xl mx-auto border border-red-900 bg-slate-900 p-6 rounded">
          <h1 className="text-lg font-semibold">Candidate Section Runtime Error</h1>
          <p className="mt-4 text-sm text-red-300">{error}</p>
        </div>
      </div>
    )
  }

  const question = content?.question || {}
  const selectionMode = question.selection_mode || 'single'
  const sectionLabel = SECTION_LABELS[runtimeState?.contentType] || 'Section'
  const bootProgress = screen === 'booting' ? 100 : 0
  const activeStage = BOOT_STAGES[BOOT_STAGES.length - 1]

  if (screen === 'overview') {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6">
        <div className="w-full max-w-lg space-y-6 animate-slideInUp">
          <div className="text-center space-y-2">
            <p className="text-zinc-600 text-xs font-semibold uppercase tracking-widest">{sectionLabel} Section</p>
            <h1 className="text-zinc-50 text-2xl font-bold tracking-tight">
              {runtimeState?.sectionName || 'Next Section'}
            </h1>
            <p className="text-zinc-400 text-sm">
              {runtimeState?.assessmentName || 'Assessment progression'}
            </p>
          </div>

          <div className="flex items-center justify-center gap-3 text-sm text-zinc-400">
            <span className="px-3 py-1 rounded-full border border-zinc-800 bg-zinc-900/70">{sectionLabel}</span>
            {runtimeState?.sectionTimerMinutes ? (
              <span className="px-3 py-1 rounded-full border border-zinc-800 bg-zinc-900/70">
                {runtimeState.sectionTimerMinutes} min
              </span>
            ) : null}
          </div>

          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl px-5 py-4 text-sm text-zinc-400 space-y-2">
            {runtimeState?.contentType === 'technical_task' ? (
              <>
                <p>This is a coding section. Clicking Start Section will begin the workspace boot sequence.</p>
                <p>Your workspace will open automatically when initialization completes.</p>
              </>
            ) : (
              <>
                <p>Click Start Section when you are ready to begin.</p>
                <p>Your next section will be available immediately after submission while grading continues in the background where supported.</p>
              </>
            )}
          </div>

          {error ? (
            <div className="rounded-xl border border-rose/20 bg-rose/10 px-4 py-3 text-sm text-rose">{error}</div>
          ) : null}

          <button
            type="button"
            onClick={beginSection}
            className="w-full flex items-center justify-center gap-2 py-3.5 bg-cyan hover:bg-cyan-hover text-zinc-950 font-semibold rounded-xl text-sm transition-colors"
          >
            Start Section
          </button>
        </div>
      </div>
    )
  }

  if (screen === 'booting') {
    return (
      <div className="min-h-screen bg-[#040914] flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md rounded-2xl border border-[#0e1f38] bg-[#070f20] overflow-hidden shadow-2xl">
          <div className="h-0.5 bg-[#0a1628]">
            <div
              className="h-full bg-gradient-to-r from-[#18d3ff] to-[#4ade80] transition-all duration-100 ease-linear"
              style={{ width: `${bootProgress}%` }}
            />
          </div>
          <div className="p-6 space-y-3">
            {BOOT_STAGES.map((stage) => (
              <div key={stage.id} className="flex items-center gap-3.5">
                <div className="w-5 h-5 rounded-full border-2 border-[#18d3ff] border-t-transparent animate-spin" />
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-[#edf4ff]">{stage.label}</p>
                  <p className="text-[11px] text-[#4a6a8a] mt-0.5">{stage.detail}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="px-6 py-4 border-t border-[#0a1628] flex items-center justify-between">
            <span className="text-[11px] text-[#2a4a6a]">{activeStage.label}…</span>
            <span className="text-[11px] font-mono text-[#18d3ff]">Booting</span>
          </div>
        </div>
      </div>
    )
  }

  if (screen === 'loading') {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 p-6 font-mono">
        Loading section content...
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="border border-slate-800 bg-slate-900 rounded p-4 text-sm font-mono space-y-1">
          <div>assessment_instance_id: {runtimeState?.assessmentInstanceId}</div>
          <div>section_id: {runtimeState?.sectionId}</div>
          <div>item_attempt_id: {runtimeState?.currentItemAttemptId}</div>
          <div>content_type: {runtimeState?.contentType}</div>
        </div>

        <div className="border border-slate-800 bg-slate-900 rounded p-6 space-y-4">
          <h1 className="text-lg font-semibold">{runtimeState?.sectionName || 'Candidate Section Runtime'}</h1>
          <p className="text-sm text-slate-300 whitespace-pre-wrap">{question.prompt || 'No prompt returned by backend.'}</p>

          {runtimeState?.contentType === 'mcq' && (
            <div className="space-y-3">
              {(question.options || []).map((option) => {
                const checked = selectedOptionIds.includes(String(option.id))
                return (
                  <label key={option.id} className="flex items-start gap-3 border border-slate-800 rounded p-3 cursor-pointer">
                    <input
                      type={selectionMode === 'single' ? 'radio' : 'checkbox'}
                      name="mcq-option"
                      checked={checked}
                      onChange={() => handleMcqToggle(String(option.id), selectionMode)}
                    />
                    <span className="text-sm text-slate-200">{option.text}</span>
                  </label>
                )
              })}
            </div>
          )}

          {runtimeState?.contentType === 'free_text' && (
            <textarea
              className="w-full min-h-48 bg-slate-950 border border-slate-700 rounded p-3 text-sm"
              value={freeTextValue}
              onChange={(event) => setFreeTextValue(event.target.value)}
            />
          )}

          {runtimeState?.contentType === 'ranking' && (
            <div className="space-y-3">
              {rankingOptions.map((option, index) => (
                <div key={option.id} className="border border-slate-800 rounded p-3 flex items-center justify-between gap-4">
                  <div className="text-sm">
                    <div className="font-mono text-xs text-slate-400">rank {index + 1}</div>
                    <div>{option.text}</div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className="px-2 py-1 border border-slate-700 rounded text-xs"
                      onClick={() => moveRankingOption(index, -1)}
                      disabled={index === 0}
                    >
                      Up
                    </button>
                    <button
                      type="button"
                      className="px-2 py-1 border border-slate-700 rounded text-xs"
                      onClick={() => moveRankingOption(index, 1)}
                      disabled={index === rankingOptions.length - 1}
                    >
                      Down
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              className="px-4 py-2 border border-slate-700 rounded text-sm"
              onClick={saveDraft}
              disabled={saving || submitting}
            >
              {saving ? 'Saving…' : 'Save Draft'}
            </button>
            <button
              type="button"
              className="px-4 py-2 bg-slate-100 text-slate-950 rounded text-sm font-medium"
              onClick={submitSection}
              disabled={submitting}
            >
              {submitting ? 'Submitting…' : 'Submit Section'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}