import { motion as Motion, useReducedMotion } from 'motion/react'
import ChatAvatar from './ChatAvatar'

// AI-bubble shell shown while the next question is generating (Celery-backed,
// asynchronous — see requestNextAdaptiveInterviewQuestion). Swaps to a short
// caption if generation is taking unusually long, so it never looks frozen.
export default function ThinkingBubble({ label }) {
  const reduceMotion = useReducedMotion()

  return (
    <Motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      className="flex items-start gap-3"
    >
      <ChatAvatar role="ai" />

      <div className="flex items-center gap-2 rounded-2xl rounded-tl-md bg-surface-raised px-4 py-3.5 shadow-[0_1px_2px_rgba(0,0,0,0.28)]">
        {label ? (
          <span className="text-[13px] text-text-secondary">{label}</span>
        ) : (
          <span className="flex items-center gap-1.5" aria-label="Interviewer is thinking">
            {[0, 1, 2].map((i) => (
              <Motion.span
                key={i}
                className="h-1.5 w-1.5 rounded-full bg-text-muted"
                // Staggered rise rather than three synchronised pulses: in sync
                // they read as one blinking block, which looks like a stall.
                animate={reduceMotion ? undefined : { opacity: [0.3, 1, 0.3], y: [0, -2, 0] }}
                transition={{ duration: 1.1, repeat: Infinity, ease: 'easeInOut', delay: i * 0.15 }}
              />
            ))}
          </span>
        )}
      </div>
    </Motion.div>
  )
}
