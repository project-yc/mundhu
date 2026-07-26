// ─────────────────────────────────────────────────────────────────────────────
// QuestionStage — one question, given the whole stage.
//
// Heading, rule, prompt, answer: the reading order of an exam paper, identical
// for every question type. Only the answer body changes — MCQ options, a
// written response, or a ranking list — so moving between section types never
// feels like moving between products.
//
// The stage slides in from the direction the candidate navigated, which is what
// makes the flow read as movement rather than replacement. It is a keyed
// remount rather than an AnimatePresence pair on purpose: `mode="wait"` gates
// the incoming question on the outgoing one's exit finishing, and a dropped
// exit leaves the candidate staring at the previous question. An enter-only
// transition cannot strand them.
// ─────────────────────────────────────────────────────────────────────────────

import { motion as Motion, useReducedMotion } from 'motion/react'
import {
  IconArrowsSort,
  IconAward,
  IconCircleDot,
  IconPencil,
  IconSquareCheck,
} from '@tabler/icons-react'
import FreeTextAnswer from './FreeTextAnswer'
import OptionCard from './OptionCard'
import RankingAnswer from './RankingAnswer'

const EASE = [0.22, 1, 0.36, 1]

// One pill treatment for every question attribute. The icon carries the
// difference between answer types, not a second colour scheme — two competing
// pill styles side by side read as an error state.
function Badge({ icon, children }) {
  return (
    <span className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-border-strong bg-surface-muted px-2.5 py-1 text-[12px] font-medium text-text-secondary">
      {icon}
      {children}
    </span>
  )
}

function TypeBadge({ contentType, multi }) {
  if (contentType === 'free_text') {
    return <Badge icon={<IconPencil size={13} />}>Written answer</Badge>
  }
  if (contentType === 'ranking') {
    return <Badge icon={<IconArrowsSort size={13} />}>Drag to rank</Badge>
  }
  return (
    <Badge icon={multi ? <IconSquareCheck size={13} /> : <IconCircleDot size={13} />}>
      {multi ? 'Select all that apply' : 'Select one'}
    </Badge>
  )
}

export default function QuestionStage({
  question,
  index,
  contentType = 'mcq',
  answer,
  onAnswerChange,
  direction = 1,
}) {
  const reduceMotion = useReducedMotion()
  const q = question?.question
  const multi = q?.selection_mode === 'multi'
  const offset = reduceMotion ? 0 : 20

  const toggleOption = (optionId) => {
    const current = Array.isArray(answer) ? answer : []
    if (!multi) {
      onAnswerChange([optionId])
      return
    }
    onAnswerChange(
      current.includes(optionId)
        ? current.filter((id) => id !== optionId)
        : [...current, optionId],
    )
  }

  const renderAnswer = () => {
    if (contentType === 'free_text') {
      return (
        <FreeTextAnswer
          value={typeof answer === 'string' ? answer : ''}
          onChange={onAnswerChange}
          wordLimit={q.word_limit}
        />
      )
    }

    if (contentType === 'ranking') {
      return (
        <RankingAnswer
          options={q.options || []}
          order={Array.isArray(answer) ? answer : []}
          onChange={onAnswerChange}
        />
      )
    }

    const selected = Array.isArray(answer) ? answer : []
    return (
      <div
        role={multi ? 'group' : 'radiogroup'}
        aria-label={`Answer options for question ${index + 1}`}
        className="flex flex-col gap-2.5"
      >
        {(q.options || []).map((opt, optIndex) => (
          <OptionCard
            key={opt.id}
            index={optIndex}
            text={opt.text}
            multi={multi}
            selected={selected.includes(String(opt.id))}
            onSelect={() => toggleOption(String(opt.id))}
          />
        ))}
      </div>
    )
  }

  return (
    <Motion.div
      key={question?.item_attempt_id ?? index}
      initial={{ opacity: 0, x: direction * offset }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: reduceMotion ? 0 : 0.26, ease: EASE }}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-[21px] font-semibold tracking-[-0.02em] text-text-primary">
          Question {index + 1}
        </h1>

        <div className="flex items-center gap-2">
          <TypeBadge contentType={contentType} multi={multi} />
          {question?.points > 0 && (
            <Badge icon={<IconAward size={13} />}>
              {question.points} point{question.points !== 1 ? 's' : ''}
            </Badge>
          )}
        </div>
      </div>

      <div className="mt-4 h-px w-full bg-border-subtle" />

      {q ? (
        <>
          <p className="mt-6 whitespace-pre-line text-[14px] leading-[1.7] text-text-secondary">
            {q.prompt}
          </p>
          <div className="mt-6">{renderAnswer()}</div>
        </>
      ) : (
        <div className="mt-6 rounded-xl border border-error-border bg-error-bg px-4 py-4 text-[13px] text-error">
          This question didn&apos;t load. Move on to the next one — you can come back to it from
          the navigator before you finish.
        </div>
      )}
    </Motion.div>
  )
}
