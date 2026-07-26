// ─────────────────────────────────────────────────────────────────────────────
// ExamIntro — the moment before the timer starts.
//
// Its whole job is to remove surprises: how many questions, how long, what
// happens when you press the button. The hearth is dark here — the candidate
// hasn't made any light yet — which is the first half of the metaphor the
// question screen pays off.
// ─────────────────────────────────────────────────────────────────────────────

import { motion as Motion, useReducedMotion } from 'motion/react'
import { IconArrowRight } from '@tabler/icons-react'
import ExamButton from './ExamButton'

const EASE = [0.16, 1, 0.3, 1]

function Stat({ value, unit, label }) {
  return (
    <div className="flex-1 rounded-xl border border-border bg-surface px-4 py-3.5">
      <p className="flex items-baseline gap-1">
        <span className="text-[24px] font-semibold leading-none tracking-[-0.02em] text-text-primary">
          {value}
        </span>
        {unit && <span className="text-[13px] text-text-muted">{unit}</span>}
      </p>
      <p className="mt-1.5 text-[12px] text-text-muted">{label}</p>
    </div>
  )
}

export default function ExamIntro({
  eyebrow,
  title,
  stats = [],
  rules = [],
  error,
  actionLabel = 'Start section',
  onStart,
  starting = false,
}) {
  const reduceMotion = useReducedMotion()

  const rise = (delay) => ({
    initial: { opacity: 0, y: reduceMotion ? 0 : 14 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: reduceMotion ? 0 : 0.5, delay: reduceMotion ? 0 : delay, ease: EASE },
  })

  return (
    <div className="mx-auto flex max-w-[520px] flex-col gap-6 py-4 lg:py-10">
      <Motion.div {...rise(0)} className="flex flex-col gap-3">
        {eyebrow && <p className="text-[13px] font-medium text-brand">{eyebrow}</p>}
        <h1 className="text-[26px] font-semibold leading-[1.15] tracking-[-0.025em] text-text-primary lg:text-[30px]">
          {title}
        </h1>
      </Motion.div>

      {stats.length > 0 && (
        <Motion.div {...rise(0.08)} className="flex gap-3">
          {stats.map((stat) => <Stat key={stat.label} {...stat} />)}
        </Motion.div>
      )}

      {rules.length > 0 && (
        <Motion.ul {...rise(0.16)} className="flex flex-col divide-y divide-border-subtle overflow-hidden rounded-2xl border border-border bg-surface">
          {rules.map((rule) => (
            <li key={rule} className="flex items-start gap-3 px-4 py-3">
              <span aria-hidden="true" className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-ember" />
              <span className="text-[13px] leading-relaxed text-text-secondary">{rule}</span>
            </li>
          ))}
        </Motion.ul>
      )}

      {error && (
        <div className="rounded-xl border border-error-border bg-error-bg px-4 py-3 text-[13px] text-error">
          {error}
        </div>
      )}

      <Motion.div {...rise(0.24)}>
        <ExamButton size="lg" className="w-full" onClick={onStart} loading={starting}>
          {actionLabel}
          <IconArrowRight size={17} />
        </ExamButton>
      </Motion.div>
    </div>
  )
}
