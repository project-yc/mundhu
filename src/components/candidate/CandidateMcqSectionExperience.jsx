import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  IconArrowLeft,
  IconCheck,
  IconChevronRight,
  IconClock,
  IconListCheck,
  IconX,
} from '@tabler/icons-react'
import { getMcqRuntime } from '../../api/candidate/runtime'
import {
  clearSectionAnswers,
  loadSectionAnswers,
  saveSectionAnswers,
  submitSectionAll,
  syncTimer,
} from '../../api/candidate/assessmentSession'
import {
  CandidateCenteredLoadingState,
  CandidateErrorBanner,
  CandidateSectionIntroScreen,
} from './CandidateSectionScaffold'

const formatTime = (secs) => {
  if (secs == null || secs < 0) return '--:--'
  const m = Math.floor(secs / 60)
  const s = secs % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

const timerColorClass = (secs) => {
  if (secs == null) return 'text-text-secondary'
  if (secs < 60) return 'text-error animate-pulse'
  if (secs < 300) return 'text-warning'
  return 'text-text-secondary'
}

function TopBar({ sectionName, answeredCount, totalCount, remainingSeconds, hasTimer }) {
  return (
    <div className="fixed top-0 left-0 right-0 z-40 h-14 bg-surface/95 backdrop-blur-sm border-b border-border-default flex items-center px-5 gap-4">
      <p className="flex-1 text-text-primary text-sm font-semibold truncate">{sectionName}</p>
      {totalCount > 0 && (
        <span className="text-text-muted text-xs shrink-0">
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

function QuestionCard({ question, index, answer, onToggle }) {
  const { question: q, item_attempt_id, points } = question
  if (!q) {
    return (
      <div className="bg-surface-muted border border-border-default rounded-xl p-5 text-text-muted text-sm">
        Question {index + 1} could not be loaded.
      </div>
    )
  }

  const selected = answer || []
  const isMulti = q.selection_mode === 'multi'

  return (
    <div className="bg-surface border border-border-default rounded-xl p-5 space-y-4 shadow-sm">
      <div className="flex items-start gap-3">
        <span className="w-7 h-7 rounded-full bg-surface-muted text-text-muted text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
          {index + 1}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-text-primary text-sm leading-relaxed">{q.prompt}</p>
          {isMulti && (
            <p className="text-text-muted text-xs mt-1 italic">Select all that apply</p>
          )}
        </div>
        {points > 0 && (
          <span className="text-text-muted text-xs shrink-0">
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
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-left transition-all duration-100 ${
                isSelected
                  ? 'bg-brand-tint border border-brand-border text-text-primary'
                  : 'bg-surface-muted border border-border-default text-text-secondary hover:border-border-strong hover:bg-surface'
              }`}
            >
              <span
                className={`w-4 h-4 rounded-${isMulti ? 'sm' : 'full'} border-2 shrink-0 flex items-center justify-center transition-colors ${
                  isSelected
                    ? 'border-brand bg-brand'
                    : 'border-border-strong bg-surface'
                }`}
              >
                {isSelected && <IconCheck size={10} className="text-on-brand shrink-0" />}
              </span>
              <span>{opt.text}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

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
        isAnswered ? 'border-success-border bg-success-bg' : 'border-border-default bg-surface-muted'
      }`}
    >
      <span
        className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
          isAnswered ? 'bg-success-bg text-success border border-success-border' : 'bg-surface text-text-muted border border-border-default'
        }`}
      >
        {isAnswered ? <IconCheck size={11} /> : index + 1}
      </span>
      <div className="flex-1 min-w-0">
        <p className={`text-sm truncate ${isAnswered ? 'text-text-primary' : 'text-text-secondary'}`}>
          {q?.prompt || `Question ${index + 1}`}
        </p>
        {answerText && (
          <p className="text-xs text-text-muted mt-0.5 truncate">{answerText}</p>
        )}
      </div>
      {!isAnswered && (
        <span className="text-text-muted text-xs shrink-0 mt-0.5">Unanswered</span>
      )}
    </div>
  )
}

function TimeUpOverlay({ onSubmit, submitting }) {
  return (
    <div className="fixed inset-0 bg-page/90 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-fadeIn">
      <div className="bg-surface border border-border-default rounded-2xl shadow-modal max-w-sm w-full p-8 text-center space-y-6 animate-slideInUp">
        <div className="w-16 h-16 rounded-full bg-error-bg border border-error-border flex items-center justify-center mx-auto">
          <IconClock size={28} className="text-error" />
        </div>
        <div className="space-y-1">
          <h2 className="text-text-primary text-xl font-bold">Time&apos;s Up</h2>
          <p className="text-text-secondary text-sm">Your section is being submitted automatically.</p>
        </div>
        <button
          onClick={onSubmit}
          disabled={submitting}
          className="w-full flex items-center justify-center py-3 bg-error text-white font-semibold rounded-xl text-sm transition-all duration-150 active:scale-[0.97] disabled:opacity-50"
        >
          {submitting
            ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            : 'Submit Now'}
        </button>
      </div>
    </div>
  )
}

function ConfirmModal({ unansweredCount, onConfirm, onCancel, submitting }) {
  return (
    <div className="fixed inset-0 bg-page/80 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4 animate-fadeIn">
      <div className="bg-surface border border-border-default rounded-2xl shadow-modal p-6 w-full max-w-sm space-y-5 animate-slideInUp">
        <div className="flex items-start justify-between">
          <h3 className="text-text-primary font-semibold">Submit Section?</h3>
          <button
            onClick={onCancel}
            className="text-text-muted hover:text-text-primary transition-colors -mt-0.5"
          >
            <IconX size={18} />
          </button>
        </div>

        {unansweredCount > 0 && (
          <div className="bg-warning-bg border border-warning-border rounded-xl px-4 py-3">
            <p className="text-warning text-sm">
              {unansweredCount} question{unansweredCount !== 1 ? 's' : ''} left unanswered.
            </p>
          </div>
        )}

        <p className="text-text-secondary text-sm">
          Once submitted, you cannot change your answers for this section.
        </p>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={submitting}
            className="flex-1 py-2.5 border border-border-default text-text-secondary hover:text-text-primary hover:border-border-strong rounded-xl text-sm transition-all duration-150 active:scale-[0.97] disabled:opacity-50"
          >
            Go Back
          </button>
          <button
            onClick={onConfirm}
            disabled={submitting}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-brand hover:bg-brand-hover text-on-brand font-semibold rounded-xl text-sm transition-all duration-150 ease-out active:scale-[0.97] disabled:opacity-40"
          >
            {submitting
              ? <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin opacity-60" />
              : 'Submit'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function CandidateMcqSectionExperience({
  assessmentInstanceId,
  sectionToken,
  sectionId,
  sectionName,
  sectionItems = [],
  sectionTimerMinutes,
  sectionOrder,
  sectionCount,
  onSubmitResult,
}) {
  const [screen, setScreen] = useState('transition')
  const [questions, setQuestions] = useState([])
  const [answers, setAnswers] = useState({})
  const [remainingSeconds, setRemainingSeconds] = useState(null)
  const [error, setError] = useState('')
  const [showConfirm, setShowConfirm] = useState(false)

  const timerRef = useRef(null)
  const syncTimerRef = useRef(null)
  const elapsedRef = useRef(0)
  const cleanupRef = useRef(null)

  const orderedSectionItems = useMemo(
    () => [...sectionItems].sort((left, right) => left.order - right.order),
    [sectionItems],
  )

  useEffect(() => {
    return () => {
      clearInterval(timerRef.current)
      clearInterval(syncTimerRef.current)
      if (cleanupRef.current) cleanupRef.current()
    }
  }, [])

  useEffect(() => {
    if (sectionId && Object.keys(answers).length > 0) {
      saveSectionAnswers(sectionId, answers)
    }
  }, [answers, sectionId])

  const doTimerSync = useCallback(() => {
    if (!assessmentInstanceId || !sectionToken || !sectionId) return
    syncTimer(assessmentInstanceId, sectionToken, {
      section_id: sectionId,
      elapsed_seconds: elapsedRef.current,
    }).catch(() => {})
  }, [assessmentInstanceId, sectionId, sectionToken])

  const startCountdown = useCallback((seconds) => {
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

    syncTimerRef.current = setInterval(doTimerSync, 30_000)

    const handleVisibility = () => {
      if (document.hidden) doTimerSync()
    }
    document.addEventListener('visibilitychange', handleVisibility)
    cleanupRef.current = () => document.removeEventListener('visibilitychange', handleVisibility)
  }, [doTimerSync])

  const handleBegin = async () => {
    setScreen('loading')
    setError('')

    try {
      let initialSeconds = sectionTimerMinutes ? sectionTimerMinutes * 60 : null

      if (sectionTimerMinutes && assessmentInstanceId) {
        try {
          const timerData = await syncTimer(assessmentInstanceId, sectionToken, {
            section_id: sectionId,
            elapsed_seconds: 0,
          })
          if (timerData?.remaining_seconds != null) {
            initialSeconds = timerData.remaining_seconds
          }
        } catch {
          // continue with local fallback
        }
      }

      const loaded = await Promise.all(
        orderedSectionItems.map((item) => (
          getMcqRuntime(item.item_attempt_id, sectionToken)
            .then((data) => ({ ...item, ...data }))
            .catch(() => ({ ...item, question: null, response: { selected_option_ids: [] } }))
        )),
      )
      setQuestions(loaded)

      const saved = loadSectionAnswers(sectionId)
      const initialAnswers = {}
      loaded.forEach((question) => {
        const persisted = saved[question.item_attempt_id]
        const backendSelected = question.response?.selected_option_ids || []
        initialAnswers[question.item_attempt_id] = persisted?.length ? persisted : backendSelected
      })
      setAnswers(initialAnswers)

      setScreen('questions')
      if (initialSeconds) startCountdown(initialSeconds)
    } catch (loadError) {
      setError(loadError.message || 'Failed to load section')
      setScreen('transition')
    }
  }

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

  const doSubmit = useCallback(async () => {
    clearInterval(timerRef.current)
    clearInterval(syncTimerRef.current)
    if (cleanupRef.current) cleanupRef.current()

    setScreen('submitting')
    setShowConfirm(false)

    const answerPayload = questions.map((question) => ({
      item_attempt_id: question.item_attempt_id,
      selected_option_ids: answers[question.item_attempt_id] || [],
    }))

    try {
      const result = await submitSectionAll(sectionId, sectionToken, answerPayload)
      clearSectionAnswers(sectionId)
      await onSubmitResult(result)
    } catch (submitError) {
      setError(submitError.message || 'Submission failed. Please try again.')
      setScreen('review')
    }
  }, [answers, onSubmitResult, questions, sectionId, sectionToken])

  const totalCount = questions.length
  const answeredCount = questions.filter((question) => (answers[question.item_attempt_id] || []).length > 0).length
  const unansweredCount = totalCount - answeredCount
  const hasTimer = !!sectionTimerMinutes

  if (screen === 'transition') {
    return (
      <CandidateSectionIntroScreen
        maxWidth="max-w-md"
        eyebrow={sectionOrder && sectionCount ? `Section ${sectionOrder} of ${sectionCount}` : 'MCQ Section'}
        title={sectionName}
        metaItems={[
          <>
            <IconListCheck size={12} />
            {orderedSectionItems.length} question{orderedSectionItems.length !== 1 ? 's' : ''}
          </>,
          ...(hasTimer ? [
            <>
              <IconClock size={12} />
              {sectionTimerMinutes} min
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

  if (screen === 'loading') {
    return <CandidateCenteredLoadingState label="Loading questions..." />
  }

  if (screen === 'submitting') {
    return <CandidateCenteredLoadingState label="Submitting answers..." />
  }

  if (screen === 'timeup') {
    return (
      <div className="min-h-screen bg-page">
        <TimeUpOverlay onSubmit={doSubmit} submitting={false} />
      </div>
    )
  }

  if (screen === 'questions') {
    return (
      <div className="min-h-screen bg-page">
        <TopBar
          sectionName={sectionName}
          answeredCount={answeredCount}
          totalCount={totalCount}
          remainingSeconds={remainingSeconds}
          hasTimer={hasTimer}
        />
        <div className="pt-14 pb-28">
          <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
            {questions.map((question, index) => (
              <QuestionCard
                key={question.item_attempt_id}
                question={question}
                index={index}
                answer={answers[question.item_attempt_id]}
                onToggle={handleToggle}
              />
            ))}
          </div>
        </div>
        <div className="fixed bottom-0 left-0 right-0 bg-surface/95 backdrop-blur-sm border-t border-border-default px-5 py-4 flex items-center justify-between">
          <p className="text-text-muted text-sm">
            {answeredCount} of {totalCount} answered
          </p>
          <button
            onClick={() => setScreen('review')}
            className="flex items-center gap-2 px-5 py-2.5 bg-brand hover:bg-brand-hover text-on-brand font-semibold rounded-xl text-sm transition-all duration-150 ease-out active:scale-[0.97]"
          >
            Review &amp; Submit
            <IconChevronRight size={15} />
          </button>
        </div>
      </div>
    )
  }

  if (screen === 'review') {
    return (
      <div className="min-h-screen bg-page">
        <TopBar
          sectionName={sectionName}
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
                className="flex items-center gap-1.5 text-text-muted hover:text-text-primary text-sm transition-colors mb-4"
              >
                <IconArrowLeft size={15} />
                Back to questions
              </button>
              <h2 className="text-text-primary font-semibold text-lg">Review Answers</h2>
              <p className="text-text-muted text-sm mt-1">
                {answeredCount === totalCount
                  ? 'All questions answered.'
                  : `${unansweredCount} question${unansweredCount !== 1 ? 's' : ''} unanswered.`}
              </p>
            </div>

            <div className="space-y-2">
              {questions.map((question, index) => (
                <ReviewRow
                  key={question.item_attempt_id}
                  question={question}
                  index={index}
                  answer={answers[question.item_attempt_id]}
                />
              ))}
            </div>

            {error ? <CandidateErrorBanner>{error}</CandidateErrorBanner> : null}
          </div>
        </div>

        <div className="fixed bottom-0 left-0 right-0 bg-surface/95 backdrop-blur-sm border-t border-border-default px-5 py-4 flex items-center justify-end gap-3">
          <button
            onClick={() => setScreen('questions')}
            className="px-4 py-2.5 border border-border-default text-text-secondary hover:text-text-primary hover:border-border-strong rounded-xl text-sm transition-all duration-150 active:scale-[0.97]"
          >
            Edit Answers
          </button>
          <button
            onClick={() => setShowConfirm(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-brand hover:bg-brand-hover text-on-brand font-semibold rounded-xl text-sm transition-all duration-150 ease-out active:scale-[0.97]"
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