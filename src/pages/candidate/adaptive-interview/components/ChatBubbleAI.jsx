import { motion as Motion, useReducedMotion } from 'motion/react'

export default function ChatBubbleAI({ text, avatarUrl }) {
  const reduceMotion = useReducedMotion()

  return (
    <Motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      className="flex items-start gap-2.5"
    >
      {avatarUrl ? (
        <img src={avatarUrl} alt="" className="h-9 w-9 shrink-0 rounded-full object-cover" />
      ) : (
        <div className="h-9 w-9 shrink-0 rounded-full bg-surface-muted" aria-hidden="true" />
      )}
      <div className="max-w-[85%] rounded-xl border border-border-default bg-surface px-3.5 py-2.5 text-[14px] leading-[1.6] text-text-secondary">
        {text}
      </div>
    </Motion.div>
  )
}
