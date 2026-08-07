import { motion as Motion, useReducedMotion } from 'motion/react'

// AI-bubble shell shown while the next question is generating (Celery-backed,
// asynchronous — see requestNextAdaptiveInterviewQuestion). Swaps to a short
// caption if generation is taking unusually long, so it never looks frozen.
export default function ThinkingBubble({ label }) {
  const reduceMotion = useReducedMotion()

  return (
    <Motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      className="flex items-start gap-2.5"
    >
      <div className="h-9 w-9 shrink-0 rounded-full bg-surface-muted" aria-hidden="true" />
      <div className="flex items-center gap-2 rounded-xl border border-border-default bg-surface px-3.5 py-3">
        {label ? (
          <span className="text-[13px] text-text-muted">{label}</span>
        ) : (
          <span className="flex items-center gap-1" aria-label="Interviewer is thinking">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="h-1.5 w-1.5 animate-pulse rounded-full bg-text-muted"
                style={{ animationDelay: `${i * 150}ms` }}
              />
            ))}
          </span>
        )}
      </div>
    </Motion.div>
  )
}
