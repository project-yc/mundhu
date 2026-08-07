import { motion as Motion, useReducedMotion } from 'motion/react'

export default function ChatBubbleCandidate({ text }) {
  const reduceMotion = useReducedMotion()

  return (
    <Motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      className="flex justify-end"
    >
      <div className="max-w-[85%] rounded-xl bg-brand px-3.5 py-2.5 text-[14px] leading-[1.6] text-on-brand">
        {text}
      </div>
    </Motion.div>
  )
}
