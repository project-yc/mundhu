import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  IconAlertCircle,
  IconArrowLeft,
  IconCheck,
  IconChevronRight,
  IconClock,
  IconListCheck,
  IconX,
} from '@tabler/icons-react'
import { getMcqRuntime } from '../../api/candidate/runtime'
import {
  clearMcqSession,
  clearSectionAnswers,
  loadMcqSession,
  loadSectionAnswers,
  saveSectionAnswers,
  submitSectionAll,
  syncTimer,
} from '../../api/candidate/assessmentSession'
import {
  CandidateCenteredLoadingState,
  CandidateErrorBanner,
  CandidateSectionIntroScreen,
} from '../../components/candidate/CandidateSectionScaffold'

// ─── Timer helpers ────────────────────────────────────────────────

const formatTime = (secs) => {
  if (secs == null || secs < 0) return '--:--'
  const m = Math.floor(secs / 60)
  const s = secs % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

const timerColorClass = (secs) => {
  if (secs == null) return 'text-zinc-300'
  if (secs < 60) return 'text-rose animate-pulse'
  if (secs < 300) return 'text-amber'
  return 'text-zinc-300'
}

// ─── Top bar (fixed) ──────────────────────────────────────────────

function TopBar({ sectionName, answeredCount, totalCount, remainingSeconds, hasTimer }) {
  return (
    <div className="fixed top-0 left-0 right-0 z-40 h-14 bg-zinc-950/95 backdrop-blur-sm border-b border-zinc-800/60 flex items-center px-5 gap-4">
      <p className="flex-1 text-zinc-100 text-sm font-semibold truncate">{sectionName}</p>
      {totalCount > 0 && (
        <span className="text-zinc-500 text-xs shrink-0">
          {answeredCount} / {totalCount} answered
        </span>
      )}
      {hasTimer && (
        <span className={`font-mono text-sm font-bold shrink-0 tabular-nums ${timerColorClass(remainingSeconds)}`}>
          <IconClock size={13} className="inline mr-1 -mt-0.5" />
          {formatTime(remainingSeconds)}
        </span>
      )}
    </div>
  )
}

// ─── Question card ────────────────────────────────────────────────

function QuestionCard({ question, index, answer, onToggle }) {
  const { question: q, item_attempt_id, points } = question
  if (!q) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 text-zinc-500 text-sm">
        Question {index + 1} could not be loaded.
      </div>
    )
  }

  const selected = answer || []
  const isMulti = q.selection_mode === 'multi'

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4">
      <div className="flex items-start gap-3">
        <span className="w-7 h-7 rounded-full bg-zinc-800 text-zinc-400 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
          {index + 1}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-zinc-100 text-sm leading-relaxed">{q.prompt}</p>
          {isMulti && (
            <p className="text-zinc-600 text-xs mt-1 italic">Select all that apply</p>
          )}
        </div>
        {points > 0 && (
          <span className="text-zinc-600 text-xs shrink-0">
            {points} pt{points !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      <div className="space-y-2 pl-10">
        {(q.options || []).map((opt) => {
          const isSelected = selected.includes(String(opt.id))
          return (
            <button
              key={opt.id}
              onClick={() => onToggle(item_attempt_id, String(opt.id), q.selection_mode)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-left transition-all ${
                isSelected
                  ? 'bg-cyan/10 border border-cyan/40 text-zinc-100'
                  : 'bg-zinc-800/40 border border-zinc-700/40 text-zinc-300 hover:border-zinc-600/80 hover:bg-zinc-800/70'
              }`}
            >
              <span
                className={`w-4 h-4 rounded-${isMulti ? 'sm' : 'full'} border-2 shrink-0 flex items-center justify-center transition-colors ${
                  isSelected ? 'border-cyan bg-cyan' : 'border-zinc-600'
                }`}
              >
                {isSelected && <IconCheck size={10} className="text-zinc-950 shrink-0" />}
              </span>
              <span>{opt.text}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ─── Review row ───────────────────────────────────────────────────

function ReviewRow({ question, index, answer }) {
  const { question: q } = question
  const selected = answer || []
  const isAnswered = selected.length > 0

  const answerText = isAnswered && q?.options
    ? selected
        .map((id) => q.options.find((o) => String(o.id) === id)?.text)
        .filter(Boolean)
        .join(', ')
    : null

  return (
    <div
      className={`flex items-start gap-3 px-4 py-3 rounded-lg border ${
        isAnswered ? 'border-emerald/20 bg-emerald/5' : 'border-zinc-800 bg-zinc-900/50'
      }`}
    >
      <span
        className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
          isAnswered ? 'bg-emerald/20 text-emerald' : 'bg-zinc-800 text-zinc-500'
        }`}
      >
        {isAnswered ? <IconCheck size={11} /> : index + 1}
      </span>
      <div className="flex-1 min-w-0">
        <p className={`text-sm truncate ${isAnswered ? 'text-zinc-200' : 'text-zinc-400'}`}>
          {q?.prompt || `Question ${index + 1}`}
        </p>
        {answerText && (
          <p className="text-xs text-zinc-500 mt-0.5 truncate">{answerText}</p>
        )}
      </div>
      {!isAnswered && (
        <span className="text-zinc-600 text-xs shrink-0 mt-0.5">Unanswered</span>
      )}
    </div>
  )
}

// ─── Time-up overlay ──────────────────────────────────────────────

function TimeUpOverlay({ onSubmit, submitting }) {
  return (
    <div className="fixed inset-0 bg-zinc-950/97 z-50 flex items-center justify-center p-6 animate-fadeIn">
      <div className="max-w-sm w-full text-center space-y-6 animate-slideInUp">
        <div className="w-16 h-16 rounded-full bg-rose/10 border border-rose/20 flex items-center justify-center mx-auto">
          <IconClock size={28} className="text-rose" />
        </div>
        <div className="space-y-1">
          <h2 className="text-zinc-50 text-xl font-bold">Time&apos;s Up</h2>
          <p className="text-zinc-400 text-sm">Your section is being submitted automatically.</p>
        </div>
        <button
          onClick={onSubmit}
          disabled={submitting}
          className="w-full flex items-center justify-center gap-2 py-3 bg-rose/90 hover:bg-rose text-white font-semibold rounded-xl text-sm transition-colors disabled:opacity-50"
        >
          {submitting
            ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            : 'Submit Now'
          }
        </button>
      </div>
    </div>
  )
}

// ─── Confirm modal ────────────────────────────────────────────────

function ConfirmModal({ unansweredCount, onConfirm, onCancel, submitting }) {
  return (
    <div className="fixed inset-0 bg-zinc-950/80 z-50 flex items-end sm:items-center justify-center p-4 animate-fadeIn">
      <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 w-full max-w-sm space-y-5 animate-slideInUp">
        <div className="flex items-start justify-between">
          <h3 className="text-zinc-100 font-semibold">Submit Section?</h3>
          <button
            onClick={onCancel}
            className="text-zinc-500 hover:text-zinc-300 transition-colors -mt-0.5"
          >
            <IconX size={18} />
          </button>
        </div>

        {unansweredCount > 0 && (
          <div className="bg-amber/10 border border-amber/20 rounded-xl px-4 py-3">
            <p className="text-amber text-sm">
              {unansweredCount} question{unansweredCount !== 1 ? 's' : ''} left unanswered.
            </p>
          </div>
        )}

        <p className="text-zinc-400 text-sm">
          Once submitted, you cannot change your answers for this section.
        </p>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={submitting}
            className="flex-1 py-2.5 border border-zinc-700 text-zinc-300 hover:text-zinc-100 rounded-xl text-sm transition-colors disabled:opacity-50"
          >
            Go Back
          </button>
          <button
            onClick={onConfirm}
            disabled={submitting}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-cyan hover:bg-cyan-hover text-zinc-950 font-semibold rounded-xl text-sm transition-colors disabled:opacity-50"
          >
            {submitting
              ? <div className="w-4 h-4 border-2 border-zinc-800/30 border-t-zinc-800 rounded-full animate-spin" />
              : 'Submit'
            }
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Main page component ──────────────────────────────────────────

export default function McqSectionPage() {
  const { token, sectionIndex: sectionIndexStr } = useParams()
  const navigate = useNavigate()
  const sectionIndex = parseInt(sectionIndexStr, 10)

  // Stable session reference — loaded once from sessionStorage
  const [session] = useState(() => loadMcqSession())
  const section = useMemo(
    () => session?.sections?.[sectionIndex] ?? null,
    [session, sectionIndex],
  )

  // Screen: 'transition' | 'loading' | 'questions' | 'review' | 'timeup' | 'submitting'
  const [screen, setScreen] = useState('transition')
  const [questions, setQuestions] = useState([])
  const [answers, setAnswers] = useState({})
  const [remainingSeconds, setRemainingSeconds] = useState(null)
  const [error, setError] = useState('')
  const [showConfirm, setShowConfirm] = useState(false)

  const timerRef = useRef(null)
  const syncTimerRef = useRef(null)
  const elapsedRef = useRef(0)
  // Store cleanup fn (visibility listener) to call on unmount
  const cleanupRef = useRef(null)

  // Guard: redirect if no session or bad index
  useEffect(() => {
    if (!session || !section || Number.isNaN(sectionIndex)) {
      navigate(`/assessment/${token}`, { replace: true })
    }
  }, []) // intentionally run only once on mount

  // Persist answers to sessionStorage on every change
  useEffect(() => {
    if (section && Object.keys(answers).length > 0) {
      saveSectionAnswers(section.section_id, answers)
    }
  }, [answers, section])

  // Cleanup intervals and event listeners on unmount
  useEffect(() => {
    return () => {
      clearInterval(timerRef.current)
      clearInterval(syncTimerRef.current)
      if (cleanupRef.current) cleanupRef.current()
    }
  }, [])

  // ─── Timer management ─────────────────────────────────────────

  const doTimerSync = useCallback(() => {
    if (!session || !section) return
    syncTimer(session.instanceId, session.instanceToken, {
      section_id: section.section_id,
      elapsed_seconds: elapsedRef.current,
    }).catch(() => { /* silent — timer sync is best-effort */ })
  }, [section, session])

  const startCountdown = useCallback(
    (seconds) => {
      clearInterval(timerRef.current)
      clearInterval(syncTimerRef.current)
      if (cleanupRef.current) cleanupRef.current()

      elapsedRef.current = 0
      setRemainingSeconds(seconds)

      timerRef.current = setInterval(() => {
        elapsedRef.current += 1
        setRemainingSeconds((prev) => {
          const next = (prev ?? 0) - 1
          if (next <= 0) {
            clearInterval(timerRef.current)
            clearInterval(syncTimerRef.current)
            setScreen('timeup')
            return 0
          }
          return next
        })
      }, 1000)

      // Heartbeat sync every 30 s
      syncTimerRef.current = setInterval(doTimerSync, 30_000)

      // Sync immediately on tab hide
      const handleVisibility = () => {
        if (document.hidden) doTimerSync()
      }
      document.addEventListener('visibilitychange', handleVisibility)
      cleanupRef.current = () =>
        document.removeEventListener('visibilitychange', handleVisibility)
    },
    [doTimerSync],
  )

  // ─── Begin section ────────────────────────────────────────────

  const handleBegin = async () => {
    setScreen('loading')
    setError('')

    try {
      let initialSeconds = section.timer_minutes ? section.timer_minutes * 60 : null

      // Sync timer with backend to get authoritative remaining_seconds
      if (section.timer_minutes && session?.instanceId) {
        try {
          const timerData = await syncTimer(
            session.instanceId,
            session.instanceToken,
            { section_id: section.section_id, elapsed_seconds: 0 },
          )
          if (timerData?.remaining_seconds != null) {
            initialSeconds = timerData.remaining_seconds
          }
        } catch {
          // Use client-calculated fallback — continue
        }
      }

      // Load all question data in parallel
      const items = section.items || []
      const loaded = await Promise.all(
        items.map((item) =>
          getMcqRuntime(item.item_attempt_id, session.instanceToken)
            .then((data) => ({ ...item, ...data }))
            .catch(() => ({ ...item, question: null, response: { selected_option_ids: [] } }))
        ),
      )
      setQuestions(loaded)

      // Restore persisted answers (priority: sessionStorage > backend response)
      const saved = loadSectionAnswers(section.section_id)
      const initialAnswers = {}
      loaded.forEach((q) => {
        const persisted = saved[q.item_attempt_id]
        const backendSelected = q.response?.selected_option_ids || []
        initialAnswers[q.item_attempt_id] = persisted?.length ? persisted : backendSelected
      })
      setAnswers(initialAnswers)

      setScreen('questions')
      if (initialSeconds) startCountdown(initialSeconds)
    } catch (e) {
      setError(e.message || 'Failed to load section')
      setScreen('transition')
    }
  }

  // ─── Answer toggle ────────────────────────────────────────────

  const handleToggle = useCallback((itemAttemptId, optionId, selectionMode) => {
    setAnswers((prev) => {
      const current = prev[itemAttemptId] || []
      if (selectionMode === 'single') {
        return { ...prev, [itemAttemptId]: [optionId] }
      }
      const next = current.includes(optionId)
        ? current.filter((id) => id !== optionId)
        : [...current, optionId]
      return { ...prev, [itemAttemptId]: next }
    })
  }, [])

  // ─── Submit section ───────────────────────────────────────────

  const doSubmit = useCallback(async () => {
    clearInterval(timerRef.current)
    clearInterval(syncTimerRef.current)
    if (cleanupRef.current) cleanupRef.current()

    setScreen('submitting')
    setShowConfirm(false)

    const answerPayload = questions.map((q) => ({
      item_attempt_id: q.item_attempt_id,
      selected_option_ids: answers[q.item_attempt_id] || [],
    }))

    try {
      const result = await submitSectionAll(
        section.section_id,
        session.instanceToken,
        answerPayload,
      )

      // Clean up persisted answers for this section
      clearSectionAnswers(section.section_id)

      if (result.next_action === 'assessment_complete') {
        clearMcqSession()
        navigate(`/assessment/${token}/complete`, {
          replace: true,
          state: {
            candidateName: session.candidateName,
            assessmentName: session.assessmentName,
          },
        })
        return
      }

      if (result.next_action === 'launch_coding' && result.workspace_url) {
        window.location.href = result.workspace_url
        return
      }

      if (result.next_action === 'open_section') {
        // Find next section index by section_id in our sessions array
        const sections = session.sections || []
        const nextIdx = result.section_id
          ? sections.findIndex((s) => s.section_id === result.section_id)
          : sectionIndex + 1

        const target = nextIdx >= 0 ? nextIdx : sectionIndex + 1
        if (target < sections.length) {
          navigate(`/assessment/${token}/mcq/${target}`, { replace: true })
          return
        }
      }

      // Fallback: mark complete
      clearMcqSession()
      navigate(`/assessment/${token}/complete`, {
        replace: true,
        state: {
          candidateName: session.candidateName,
          assessmentName: session.assessmentName,
        },
      })
    } catch (e) {
      setError(e.message || 'Submission failed. Please try again.')
      setScreen('review')
    }
  }, [answers, navigate, questions, section, sectionIndex, session, token])

  // ─── Derived values ───────────────────────────────────────────

  if (!session || !section) return null

  const totalCount = questions.length
  const answeredCount = questions.filter(
    (q) => (answers[q.item_attempt_id] || []).length > 0,
  ).length
  const unansweredCount = totalCount - answeredCount
  const hasTimer = !!section.timer_minutes

  // ─── Render screens ───────────────────────────────────────────

  // Section transition (landing for this section)
  if (screen === 'transition') {
    const sectionCount = session.sections?.length ?? 1
    return (
      <CandidateSectionIntroScreen
        maxWidth="max-w-md"
        eyebrow={`Section ${sectionIndex + 1} of ${sectionCount}`}
        title={section.name}
        metaItems={[
          <>
            <IconListCheck size={12} />
            {(section.items || []).length} question{(section.items || []).length !== 1 ? 's' : ''}
          </>,
          ...(hasTimer ? [
            <>
              <IconClock size={12} />
              {section.timer_minutes} min
            </>,
          ] : []),
        ]}
        tips={hasTimer
          ? ['The timer starts when you click Begin.']
          : ['Click Begin when you are ready to start this section.']}
        error={error}
        actionContent={(
          <>
            Begin Section
            <IconChevronRight size={16} />
          </>
        )}
        onAction={handleBegin}
      />
    )
  }

  // Loading questions
  if (screen === 'loading') {
    return <CandidateCenteredLoadingState label="Loading questions..." />
  }

  // Submitting
  if (screen === 'submitting') {
    return <CandidateCenteredLoadingState label="Submitting answers..." />
  }

  // Time up
  if (screen === 'timeup') {
    return (
      <div className="min-h-screen bg-zinc-950">
        <TimeUpOverlay onSubmit={doSubmit} submitting={false} />
      </div>
    )
  }

  // Questions screen
  if (screen === 'questions') {
    return (
      <div className="min-h-screen bg-zinc-950">
        <TopBar
          sectionName={section.name}
          answeredCount={answeredCount}
          totalCount={totalCount}
          remainingSeconds={remainingSeconds}
          hasTimer={hasTimer}
        />
        <div className="pt-14 pb-28">
          <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
            {questions.map((q, i) => (
              <QuestionCard
                key={q.item_attempt_id}
                question={q}
                index={i}
                answer={answers[q.item_attempt_id]}
                onToggle={handleToggle}
              />
            ))}
          </div>
        </div>
        <div className="fixed bottom-0 left-0 right-0 bg-zinc-950/95 backdrop-blur-sm border-t border-zinc-800/60 px-5 py-4 flex items-center justify-between">
          <p className="text-zinc-500 text-sm">
            {answeredCount} of {totalCount} answered
          </p>
          <button
            onClick={() => setScreen('review')}
            className="flex items-center gap-2 px-5 py-2.5 bg-cyan hover:bg-cyan-hover text-zinc-950 font-semibold rounded-xl text-sm transition-colors"
          >
            Review &amp; Submit
            <IconChevronRight size={15} />
          </button>
        </div>
      </div>
    )
  }

  // Review screen
  if (screen === 'review') {
    return (
      <div className="min-h-screen bg-zinc-950">
        <TopBar
          sectionName={section.name}
          answeredCount={answeredCount}
          totalCount={totalCount}
          remainingSeconds={remainingSeconds}
          hasTimer={hasTimer}
        />

        {showConfirm && (
          <ConfirmModal
            unansweredCount={unansweredCount}
            onConfirm={doSubmit}
            onCancel={() => setShowConfirm(false)}
            submitting={false}
          />
        )}

        <div className="pt-14 pb-28">
          <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
            <div>
              <button
                onClick={() => setScreen('questions')}
                className="flex items-center gap-1.5 text-zinc-400 hover:text-zinc-200 text-sm transition-colors mb-4"
              >
                <IconArrowLeft size={15} />
                Back to questions
              </button>
              <h2 className="text-zinc-100 font-semibold text-lg">Review Answers</h2>
              <p className="text-zinc-500 text-sm mt-1">
                {answeredCount === totalCount
                  ? 'All questions answered.'
                  : `${unansweredCount} question${unansweredCount !== 1 ? 's' : ''} unanswered.`}
              </p>
            </div>

            <div className="space-y-2">
              {questions.map((q, i) => (
                <ReviewRow
                  key={q.item_attempt_id}
                  question={q}
                  index={i}
                  answer={answers[q.item_attempt_id]}
                />
              ))}
            </div>

            {error && (
              <CandidateErrorBanner>{error}</CandidateErrorBanner>
            )}
          </div>
        </div>

        <div className="fixed bottom-0 left-0 right-0 bg-zinc-950/95 backdrop-blur-sm border-t border-zinc-800/60 px-5 py-4 flex items-center justify-end gap-3">
          <button
            onClick={() => setScreen('questions')}
            className="px-4 py-2.5 border border-zinc-700 text-zinc-300 hover:text-zinc-100 rounded-xl text-sm transition-colors"
          >
            Edit Answers
          </button>
          <button
            onClick={() => setShowConfirm(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-cyan hover:bg-cyan-hover text-zinc-950 font-semibold rounded-xl text-sm transition-colors"
          >
            Submit Section
            <IconChevronRight size={15} />
          </button>
        </div>
      </div>
    )
  }

  return null
}
