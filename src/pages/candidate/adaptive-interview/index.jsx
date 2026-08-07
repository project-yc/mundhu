// ─────────────────────────────────────────────────────────────────────────────
// CandidateAdaptiveInterviewExperience — the chat screen for an adaptive
// interview section.
//
// Reuses the same flat `screen`-string state-machine idiom as
// CandidateMcqSectionExperience.jsx rather than a new pattern. The genuinely
// new pieces versus that sibling:
//   1. The chat log itself (append-only, built by replaying answered questions
//      on hydration, then grown turn by turn).
//   2. The nudge flow — a thin answer can earn one follow-up nudge on the SAME
//      question (engine_run.nudge). The composer stays on that question until
//      the reply is submitted; MAX one nudge round is enforced server-side.
//   3. The side panel is data-driven: it renders the active question's
//      `scenario` (pre-vetted, attached at blueprint time) or a nudge's
//      `memory_aid` (the candidate's own code excerpt). No data, no panel.
// ─────────────────────────────────────────────────────────────────────────────

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { IconLayoutSidebarRight } from '@tabler/icons-react'
import {
  getAdaptiveInterviewQuestions,
  getAdaptiveInterviewRun,
  requestNextAdaptiveInterviewQuestion,
  startAdaptiveInterview,
  finishAdaptiveInterview,
  submitAdaptiveInterviewAnswers,
} from '../../../api/candidate/adaptiveInterview'
import { loadCandidateBranding } from '../../../theme/CandidateThemeProvider'
import ExamShell, { ExamActionBar } from '../../../components/candidate/exam/ExamShell'
import ExamButton from '../../../components/candidate/exam/ExamButton'
import AdaptiveInterviewTopBar from './components/AdaptiveInterviewTopBar'
import InterviewStatusPanel from './components/InterviewStatusPanel'
import ScenarioPanel from './components/ScenarioPanel'
import ScenarioPanelSheet from './components/ScenarioPanelSheet'
import ChatMessageList from './components/ChatMessageList'
import Composer from './components/Composer'

const NEXT_QUESTION_POLL_MS = 2000
const NEXT_QUESTION_POLL_TIMEOUT_MS = 60000

const makeId = () => (
  typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`
)

const questionToMessages = (question) => {
  const messages = [{ id: `q-${question.id}`, role: 'ai', text: question.question_text }]
  // Only the FINAL answer text is stored (nudge replies overwrite), so the
  // exchange hydrates as question → nudge(s) → final answer.
  ;(question.nudge_history || []).forEach((nudge, index) => {
    if (nudge?.text) {
      messages.push({ id: `n-${question.id}-${index}`, role: 'ai', text: nudge.text, isNudge: true })
    }
  })
  if (question.answer?.answer_text) {
    messages.push({ id: `a-${question.id}`, role: 'candidate', text: question.answer.answer_text })
  }
  return messages
}

// A nudge memory aid is the candidate's own code excerpt — render it in the
// same panel contract as a pre-vetted scenario.
const memoryAidToScenario = (memoryAid) => {
  if (!memoryAid?.content) return null
  return {
    title: 'From your solution',
    sections: [
      {
        type: 'log',
        // Neutral, not error-toned — this is the candidate's own working code
        // shown because they're stuck, not something that failed.
        tone: 'neutral',
        label: 'Your code (excerpt)',
        lines: String(memoryAid.content).split('\n'),
        defaultExpanded: true,
      },
    ],
  }
}

export default function CandidateAdaptiveInterviewExperience({
  sectionToken,
  sectionName,
  itemAttemptId,
  sectionOrder,
  sectionCount,
  sectionTimerMinutes,
  onSubmitResult,
  onRequestNextAction,
}) {
  const [screen, setScreen] = useState('preparing')
  const [statusMessage, setStatusMessage] = useState('')
  const [engineRun, setEngineRun] = useState(null)
  const [messages, setMessages] = useState([])
  const [activeQuestion, setActiveQuestion] = useState(null)
  const [pendingNudge, setPendingNudge] = useState(null)
  const [composerValue, setComposerValue] = useState('')
  const [turnState, setTurnState] = useState('idle') // 'idle' | 'sending' | 'thinking'
  const [thinkingLabel, setThinkingLabel] = useState('')
  const [scenarioSheetOpen, setScenarioSheetOpen] = useState(false)

  const composerRef = useRef(null)
  const pollTimeoutRef = useRef(null)
  const pollStartedAtRef = useRef(0)
  const idempotencyKeyRef = useRef(null)

  const branding = useMemo(() => loadCandidateBranding(), [])

  useEffect(() => () => clearTimeout(pollTimeoutRef.current), [])

  const handleFailure = useCallback((err) => {
    if (err?.status === 409) {
      setStatusMessage(err.message || 'Section timer has expired.')
      setScreen('expired')
      return
    }
    if (err?.status === 503) {
      setStatusMessage(err.message || 'The interviewer service is temporarily unavailable.')
      setScreen('unavailable')
      return
    }
    setStatusMessage(err?.message || 'Something went wrong. Please try again.')
    setScreen('unavailable')
  }, [])

  // ── Bootstrap ──────────────────────────────────────────────────────
  const bootstrap = useCallback(async () => {
    setScreen('preparing')
    setStatusMessage('Preparing your interview...')
    try {
      const { engine_run: run } = await getAdaptiveInterviewRun(itemAttemptId, sectionToken)
      let currentRun = run

      if (currentRun.status === 'pending_generation') {
        setStatusMessage('Starting your interview...')
        const startResult = await startAdaptiveInterview(itemAttemptId, sectionToken)
        currentRun = startResult.engine_run
      }

      setStatusMessage('Loading your conversation...')
      const { engine_run: hydratedRun, questions: existingQuestions } = await getAdaptiveInterviewQuestions(
        itemAttemptId, sectionToken,
      )
      currentRun = hydratedRun

      setEngineRun(currentRun)
      setMessages(existingQuestions.flatMap(questionToMessages))

      const lastQuestion = existingQuestions[existingQuestions.length - 1] || null

      // A nudge was issued and never replied to (e.g. page refresh mid-exchange):
      // resume with the nudge visible and the composer on the same question.
      if (currentRun.nudge && lastQuestion && currentRun.nudge.question_id === lastQuestion.id) {
        setPendingNudge(currentRun.nudge)
        setActiveQuestion(lastQuestion)
        setMessages((prev) => [...prev, { id: makeId(), role: 'ai', text: currentRun.nudge.text, isNudge: true }])
        setTurnState('idle')
        setScreen('chat')
        return
      }
      setPendingNudge(null)

      const lastIsUnanswered = lastQuestion && !lastQuestion.answer

      if (lastIsUnanswered) {
        setActiveQuestion(lastQuestion)
        setTurnState('idle')
        setScreen('chat')
        return
      }

      if (['submitted', 'pending_scoring', 'scoring'].includes(currentRun.status)) {
        // Finished in a previous visit (refresh, or the tab was closed mid-run).
        // There is no next_action on this payload, so ask the parent to resolve
        // one — otherwise the candidate is stranded on a completion screen with
        // no way into the next section.
        setScreen('complete')
        if (onRequestNextAction) {
          await onRequestNextAction()
        }
        return
      }

      // Every existing question is answered and the run is still open — fetch
      // the next one before showing the chat screen.
      setScreen('chat')
      setTurnState('thinking')
      await pollNextQuestion()
    } catch (err) {
      handleFailure(err)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemAttemptId, sectionToken])

  useEffect(() => {
    bootstrap()
  }, [bootstrap])

  // ── Next-question polling (Celery-backed, async) ──────────────────
  const pollNextQuestion = useCallback(async () => {
    pollStartedAtRef.current = pollStartedAtRef.current || Date.now()
    setTurnState('thinking')
    setThinkingLabel('')

    try {
      const { engine_run: run, next_question: nextQuestion, question } = await requestNextAdaptiveInterviewQuestion(
        itemAttemptId, sectionToken,
      )
      setEngineRun(run)

      if (nextQuestion?.error) {
        pollStartedAtRef.current = 0
        setStatusMessage(nextQuestion.error)
        setScreen('unavailable')
        return
      }

      if (question) {
        pollStartedAtRef.current = 0
        setMessages((prev) => [...prev, { id: `q-${question.id}`, role: 'ai', text: question.question_text }])
        setActiveQuestion(question)
        setTurnState('idle')
        return
      }

      // Still queued — poll again, with a soft-degrade message past the cap.
      const elapsed = Date.now() - pollStartedAtRef.current
      if (elapsed > NEXT_QUESTION_POLL_TIMEOUT_MS) {
        setThinkingLabel('Still preparing your next question...')
      }
      pollTimeoutRef.current = setTimeout(pollNextQuestion, NEXT_QUESTION_POLL_MS)
    } catch (err) {
      pollStartedAtRef.current = 0
      handleFailure(err)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemAttemptId, sectionToken])

  // ── Sending an answer ──────────────────────────────────────────────
  const handleSend = useCallback(async () => {
    const text = composerValue.trim()
    if (!text || !activeQuestion || turnState !== 'idle') return

    setTurnState('sending')
    setMessages((prev) => [...prev, { id: makeId(), role: 'candidate', text }])
    setComposerValue('')

    if (!idempotencyKeyRef.current) idempotencyKeyRef.current = makeId()

    try {
      const result = await submitAdaptiveInterviewAnswers(itemAttemptId, sectionToken, {
        answers: [{ question_id: activeQuestion.id, answer_text: text, response_mode: 'text' }],
        idempotencyKey: idempotencyKeyRef.current,
        expectedStateVersion: engineRun?.state_version,
      })
      idempotencyKeyRef.current = null
      setEngineRun(result.engine_run)

      // Nudge flow: the interviewer follows up on the SAME question. The
      // composer stays put; the next send is the nudge reply.
      const nudge = result.engine_run?.nudge
      if (nudge && nudge.question_id === activeQuestion.id) {
        setPendingNudge(nudge)
        setMessages((prev) => [...prev, { id: makeId(), role: 'ai', text: nudge.text, isNudge: true }])
        setTurnState('idle')
        composerRef.current?.focus()
        return
      }
      setPendingNudge(null)

      if (result.engine_run?.closing_message) {
        setMessages((prev) => [...prev, { id: makeId(), role: 'ai', text: result.engine_run.closing_message }])
      }

      setActiveQuestion(null)

      if (result.next_action) {
        setScreen('complete')
        onSubmitResult?.(result)
        return
      }

      if (['submitted', 'pending_scoring', 'scoring'].includes(result.engine_run?.status)) {
        setScreen('complete')
        onSubmitResult?.(result)
        return
      }

      await pollNextQuestion()
    } catch (err) {
      handleFailure(err)
    }
  }, [
    activeQuestion, composerValue, engineRun, itemAttemptId, onSubmitResult,
    pollNextQuestion, sectionToken, turnState, handleFailure,
  ])

  // Ends the interview server-side and scores whatever was answered. This used
  // to be local-only, which left the run open and unscored — the candidate's
  // answers were discarded entirely.
  const handleFinishInterview = useCallback(async () => {
    if (turnState !== 'idle') return
    const remaining = activeQuestion ? ' Your current answer will not be submitted.' : ''
    if (!window.confirm(`End the interview now?${remaining}`)) return

    setTurnState('sending')
    try {
      const result = await finishAdaptiveInterview(itemAttemptId, sectionToken)
      setEngineRun(result.engine_run)
      setActiveQuestion(null)
      setPendingNudge(null)
      setScreen('complete')
      if (result.next_action) {
        onSubmitResult?.(result)
      } else if (onRequestNextAction) {
        await onRequestNextAction()
      }
    } catch (err) {
      handleFailure(err)
    } finally {
      setTurnState('idle')
    }
  }, [
    activeQuestion, handleFailure, itemAttemptId, onRequestNextAction,
    onSubmitResult, sectionToken, turnState,
  ])

  // The panel is data-driven: a pending nudge's memory aid outranks the
  // question's attached scenario; no data means no panel.
  const activeScenario = useMemo(() => {
    const fromNudge = memoryAidToScenario(pendingNudge?.memory_aid)
    if (fromNudge) return fromNudge
    return activeQuestion?.scenario || null
  }, [pendingNudge, activeQuestion])

  // Derived from the run's own started_at plus the section timer, ticking each
  // second. Both are real values off the launch payload and the engine run —
  // when either is missing the timer stays hidden rather than guessing.
  const [nowMs, setNowMs] = useState(() => Date.now())

  useEffect(() => {
    if (screen !== 'chat' || !engineRun?.started_at || !sectionTimerMinutes) return undefined
    const interval = setInterval(() => setNowMs(Date.now()), 1000)
    return () => clearInterval(interval)
  }, [screen, engineRun?.started_at, sectionTimerMinutes])

  const { remainingSeconds, elapsedSeconds } = useMemo(() => {
    if (!engineRun?.started_at || !sectionTimerMinutes) {
      return { remainingSeconds: null, elapsedSeconds: null }
    }
    const startedMs = new Date(engineRun.started_at).getTime()
    if (Number.isNaN(startedMs)) return { remainingSeconds: null, elapsedSeconds: null }

    const elapsed = Math.max(0, Math.floor((nowMs - startedMs) / 1000))
    return {
      elapsedSeconds: elapsed,
      remainingSeconds: Math.max(0, sectionTimerMinutes * 60 - elapsed),
    }
  }, [engineRun?.started_at, sectionTimerMinutes, nowMs])

  const topBar = (
    <AdaptiveInterviewTopBar
      branding={branding}
      sectionName={sectionName}
      sectionOrder={sectionOrder}
      sectionCount={sectionCount}
      remainingSeconds={remainingSeconds}
      elapsedSeconds={elapsedSeconds}
      onFinish={handleFinishInterview}
    />
  )

  if (screen === 'preparing') {
    return (
      <ExamShell branding={branding} topBar={topBar}>
        <InterviewStatusPanel variant="loading" message={statusMessage} />
      </ExamShell>
    )
  }

  if (screen === 'expired') {
    return (
      <ExamShell branding={branding} topBar={topBar}>
        <InterviewStatusPanel variant="expired" message={statusMessage} />
      </ExamShell>
    )
  }

  if (screen === 'unavailable') {
    return (
      <ExamShell branding={branding} topBar={topBar}>
        <InterviewStatusPanel variant="unavailable" message={statusMessage} onRetry={bootstrap} />
      </ExamShell>
    )
  }

  if (screen === 'complete') {
    return (
      <ExamShell branding={branding} topBar={topBar}>
        <InterviewStatusPanel
          variant="unavailable"
          message="Your interview has been submitted."
          onRetry={null}
        />
      </ExamShell>
    )
  }

  // screen === 'chat'
  return (
    <ExamShell
      branding={branding}
      topBar={topBar}
      sidebar={activeScenario ? <ScenarioPanel scenario={activeScenario} /> : null}
      actionBar={(
        <ExamActionBar>
          {activeScenario && (
            <ExamButton
              variant="quiet"
              size="icon"
              className="lg:hidden"
              onClick={() => setScenarioSheetOpen(true)}
              aria-label="Open interview scenario"
            >
              <IconLayoutSidebarRight size={18} />
            </ExamButton>
          )}
          <span className="flex-1" />
        </ExamActionBar>
      )}
    >
      <div className="flex flex-col gap-5">
        <ChatMessageList
          messages={messages}
          thinking={turnState === 'thinking'}
          thinkingLabel={thinkingLabel}
          avatarUrl={branding?.logo_url}
        />

        <Composer
          inputRef={composerRef}
          value={composerValue}
          onChange={setComposerValue}
          onSend={handleSend}
          disabled={turnState !== 'idle' || !activeQuestion}
        />
      </div>

      <ScenarioPanelSheet
        open={scenarioSheetOpen && Boolean(activeScenario)}
        onOpenChange={setScenarioSheetOpen}
        scenario={activeScenario}
      />
    </ExamShell>
  )
}
