import { useCallback, useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { Check, Terminal, Zap } from 'lucide-react'
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
    { id: 1, label: 'Fetching task bundle', detail: 'Retrieving assessment artifacts from S3', startAt: 1500, endAt: 4500 },
    { id: 2, label: 'Unpacking resources', detail: 'Decompressing task files & fixtures', startAt: 4500, endAt: 8000 },
    { id: 3, label: 'Initializing container', detail: 'Spinning up isolated runtime environment', startAt: 8000, endAt: 12000 },
    { id: 4, label: 'Configuring environment', detail: 'Installing deps & applying settings', startAt: 12000, endAt: 16000 },
    { id: 5, label: 'Launching workspace', detail: 'Connecting IDE & finalizing setup', startAt: 16000, endAt: 19500 },
  ]

  const TOTAL_BOOT_MS = 19500
  const MAX_BOOT_WAIT_MS = 45000
  const BOOT_POLL_INTERVAL_MS = 1500

  const SECTION_LABELS = {
    mcq: 'MCQ',
    free_text: 'Free Text',
    ranking: 'Ranking',
    technical_task: 'Coding',
  }

  const delay = (ms) => new Promise((resolve) => window.setTimeout(resolve, ms))

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

  function BootScreen() {
    const [elapsed, setElapsed] = useState(0)
    const [logLines, setLogLines] = useState([])
    const logRef = useRef(null)
    const startTime = useRef(0)

    useEffect(() => {
      startTime.current = Date.now()
      const intervalId = window.setInterval(() => {
        const nextElapsed = Date.now() - startTime.current
        setElapsed(Math.min(nextElapsed, TOTAL_BOOT_MS))
      }, 80)
      return () => window.clearInterval(intervalId)
    }, [])

    useEffect(() => {
      const lines = [
        '[boot]   Validating JWT signature... ok',
        '[auth]   Session granted for candidate',
        '[s3]     HEAD bundle.zip → 200',
        '[zip]    Extracting project files...',
        '[docker] Spinning up runtime container',
        '[env]    Applying workspace config',
        '[theia]  Starting IDE services',
        '[theia]  Waiting for workspace readiness',
      ]

      const timers = lines.map((line, index) => window.setTimeout(() => {
        setLogLines((current) => [...current, line])
      }, 600 + index * 1050))

      return () => timers.forEach((timerId) => window.clearTimeout(timerId))
    }, [])

    useEffect(() => {
      if (logRef.current) {
        logRef.current.scrollTop = logRef.current.scrollHeight
      }
    }, [logLines])

    const progress = Math.min((elapsed / TOTAL_BOOT_MS) * 100, 100)
    const currentStageIndex = BOOT_STAGES.findLastIndex((stage) => elapsed >= stage.startAt)
    const activeStage = BOOT_STAGES[currentStageIndex] ?? BOOT_STAGES[0]

    return (
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0a1628] border border-[#0e2a4a] mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-[#18d3ff] animate-pulse" />
            <span className="text-[10px] font-bold tracking-[0.2em] text-[#18d3ff] uppercase">Initializing Environment</span>
          </div>
          <h1 className="text-xl font-bold text-[#edf4ff] tracking-tight mb-1">Preparing your workspace</h1>
          <p className="text-sm text-[#4a5f7a]">This takes about 15 seconds. Hang tight.</p>
        </div>

        <div className="rounded-2xl border border-[#0e1f38] bg-[#070f20] overflow-hidden shadow-2xl">
          <div className="h-0.5 bg-[#0a1628]">
            <div
              className="h-full bg-gradient-to-r from-[#18d3ff] to-[#4ade80] transition-all duration-100 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="p-6 space-y-3">
            {BOOT_STAGES.map((stage) => {
              const isDone = elapsed > stage.endAt
              const isActive = elapsed >= stage.startAt && elapsed <= stage.endAt
              const isPending = elapsed < stage.startAt

              return (
                <div
                  key={stage.id}
                  className={`flex items-center gap-3.5 transition-all duration-300 ${isPending ? 'opacity-25' : 'opacity-100'}`}
                >
                  <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center">
                    {isDone ? (
                      <div className="w-5 h-5 rounded-full bg-[#041a10] border border-[#1a4a28] flex items-center justify-center">
                        <Check className="w-3 h-3 text-[#4ade80]" strokeWidth={3} />
                      </div>
                    ) : isActive ? (
                      <div className="w-5 h-5 rounded-full border-2 border-[#18d3ff] border-t-transparent animate-spin" />
                    ) : (
                      <div className="w-5 h-5 rounded-full border border-[#1a2f4a]" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className={`text-[13px] font-semibold leading-tight transition-colors duration-200 ${
                      isDone ? 'text-[#4ade80]' : isActive ? 'text-[#edf4ff]' : 'text-[#2a3f5a]'
                    }`}>
                      {stage.label}
                    </p>
                    {isActive && (
                      <p className="text-[11px] text-[#4a6a8a] mt-0.5 animate-fadeIn">{stage.detail}</p>
                    )}
                  </div>

                  {isDone ? <span className="text-[10px] text-[#1a4a28] font-mono flex-shrink-0">done</span> : null}
                </div>
              )
            })}
          </div>

          <div className="border-t border-[#0a1628] bg-[#040914]">
            <div className="flex items-center gap-2 px-4 py-2 border-b border-[#0a1628]">
              <Terminal className="w-3 h-3 text-[#2a4a6a]" />
              <span className="text-[10px] font-mono text-[#2a4a6a] tracking-wider">system log</span>
              <div className="ml-auto flex gap-1">
                <span className="w-2 h-2 rounded-full bg-[#1a2f3a]" />
                <span className="w-2 h-2 rounded-full bg-[#1a2f3a]" />
                <span className="w-2 h-2 rounded-full bg-[#1a3a2a]" />
              </div>
            </div>
            <div
              ref={logRef}
              className="h-28 overflow-y-auto px-4 py-3 space-y-0.5"
              style={{ scrollbarWidth: 'none' }}
            >
              {logLines.map((line, index) => (
                <p key={index} className="text-[11px] font-mono text-[#2a6a5a] leading-relaxed animate-fadeIn">
                  {line}
                </p>
              ))}
              {logLines.length > 0 ? <span className="inline-block w-1.5 h-3.5 bg-[#18d3ff] opacity-70 animate-pulse align-text-bottom" /> : null}
            </div>
          </div>

          <div className="px-6 py-4 border-t border-[#0a1628] flex items-center justify-between">
            <span className="text-[11px] text-[#2a4a6a]">{activeStage.label}…</span>
            <span className="text-[11px] font-mono text-[#18d3ff]">{Math.round(progress)}%</span>
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
      } finally {
        setSubmitting(false)
      }
    }

    if (screen === 'preparing') {
      return (
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center gap-3 text-zinc-400 text-sm">
          <div className="w-4 h-4 border-2 border-zinc-700 border-t-cyan rounded-full animate-spin" />
          Loading section runtime...
        </div>
      )
    }

    if (screen === 'error') {
      return (
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6">
          <div className="w-full max-w-md space-y-6 animate-slideInUp text-center">
            <div className="w-14 h-14 rounded-full bg-rose/10 border border-rose/20 flex items-center justify-center mx-auto">
              <span className="text-rose text-2xl">!</span>
            </div>
            <div className="space-y-2">
              <h1 className="text-zinc-50 text-xl font-bold">Section unavailable</h1>
              <p className="text-zinc-400 text-sm">{error}</p>
            </div>
          </div>
        </div>
      )
    }

    const question = content?.question || {}
    const selectionMode = question.selection_mode || 'single'
    const sectionLabel = SECTION_LABELS[runtimeState?.contentType] || 'Section'

    if (screen === 'overview') {
      return (
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6">
          <div className="w-full max-w-lg space-y-7 animate-slideInUp">
            <div className="text-center space-y-2">
              <p className="text-zinc-600 text-xs font-semibold uppercase tracking-widest">{sectionLabel} Section</p>
              <h1 className="text-zinc-50 text-2xl font-bold tracking-tight">{runtimeState?.sectionName || 'Next Section'}</h1>
              <p className="text-zinc-400 text-sm">{runtimeState?.assessmentName || 'Assessment progression'}</p>
            </div>

            <div className="flex items-center justify-center gap-3 text-sm text-zinc-400">
              <span className="px-3 py-1 rounded-full border border-zinc-800 bg-zinc-900/70">{sectionLabel}</span>
              {runtimeState?.sectionTimerMinutes ? (
                <span className="px-3 py-1 rounded-full border border-zinc-800 bg-zinc-900/70">{runtimeState.sectionTimerMinutes} min</span>
              ) : null}
            </div>

            <div className="bg-zinc-900/40 border border-zinc-800/50 rounded-xl px-4 py-4 space-y-2.5">
              <p className="text-zinc-500 text-xs font-semibold uppercase tracking-wide">Before you begin</p>
              {runtimeState?.contentType === 'technical_task' ? (
                <>
                  <p className="flex items-start gap-2.5 text-zinc-500 text-sm"><span className="w-1 h-1 rounded-full bg-zinc-600 shrink-0 mt-2" />Click Start Section to begin the workspace boot sequence.</p>
                  <p className="flex items-start gap-2.5 text-zinc-500 text-sm"><span className="w-1 h-1 rounded-full bg-zinc-600 shrink-0 mt-2" />You will only be redirected once the workspace is reachable.</p>
                </>
              ) : (
                <>
                  <p className="flex items-start gap-2.5 text-zinc-500 text-sm"><span className="w-1 h-1 rounded-full bg-zinc-600 shrink-0 mt-2" />Click Start Section when you are ready to begin.</p>
                  <p className="flex items-start gap-2.5 text-zinc-500 text-sm"><span className="w-1 h-1 rounded-full bg-zinc-600 shrink-0 mt-2" />The next section becomes available immediately after submission while grading continues in the background.</p>
                </>
              )}
            </div>

            {error ? <div className="rounded-xl border border-rose/20 bg-rose/10 px-4 py-3 text-sm text-rose">{error}</div> : null}

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
          <div className="flex items-center gap-2 mb-10">
            <Zap className="w-4 h-4 text-[#18d3ff]" strokeWidth={2.5} />
            <span className="text-sm font-bold tracking-[0.08em] text-[#edf4ff]">TruDev</span>
          </div>
          <BootScreen />
          <p className="text-center text-[11px] text-[#354e68] mt-6">Powered by TruDev Assessment Platform</p>
        </div>
      )
    }

    if (screen === 'loading') {
      return (
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center gap-3 text-zinc-400 text-sm">
          <div className="w-4 h-4 border-2 border-zinc-700 border-t-cyan rounded-full animate-spin" />
          Loading section content...
        </div>
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

          {error ? <div className="rounded-xl border border-rose/20 bg-rose/10 px-4 py-3 text-sm text-rose">{error}</div> : null}

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
              <button
                type="button"
                className="px-4 py-2 border border-zinc-700 rounded-xl text-sm text-zinc-300"
                onClick={saveDraft}
                disabled={saving || submitting}
              >
                {saving ? 'Saving…' : 'Save Draft'}
              </button>
              <button
                type="button"
                className="px-4 py-2 bg-cyan hover:bg-cyan-hover text-zinc-950 rounded-xl text-sm font-semibold transition-colors"
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