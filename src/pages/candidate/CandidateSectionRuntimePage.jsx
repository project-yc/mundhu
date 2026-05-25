import { useCallback, useEffect, useState } from 'react'
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
  const [loading, setLoading] = useState(true)
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
      saveCandidateRuntimeState(actionPayload)
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
    const hydrate = async () => {
      setLoading(true)
      setError('')

      try {
        const currentSearchParams = new URLSearchParams(location.search)
        let nextRuntime = getBootstrapRuntime(location.state, currentSearchParams, { instanceId, sectionId })

        if (!nextRuntime?.sectionToken) {
          throw new Error('Missing section token for candidate runtime')
        }

        if (!nextRuntime.currentItemAttemptId || !nextRuntime.contentType) {
          const nextAction = await getCandidateNextAction(instanceId, nextRuntime.sectionToken)
          if (nextAction.next_action !== 'open_section') {
            handleNextAction(nextAction)
            return
          }
          nextRuntime = saveCandidateRuntimeState(nextAction)
        } else {
          nextRuntime = saveCandidateRuntimeState(nextRuntime)
        }

        setRuntimeState(nextRuntime)

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
      } catch (hydrateError) {
        setError(hydrateError.message || 'Failed to load candidate section runtime')
      } finally {
        setLoading(false)
      }
    }

    hydrate()
  }, [handleNextAction, instanceId, sectionId, location.key, location.search, location.state])

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

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 p-6 font-mono">
        Loading candidate section runtime...
      </div>
    )
  }

  if (error) {
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
          <h1 className="text-lg font-semibold">Candidate Section Runtime</h1>
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