import { useState } from 'react'
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react'
import { cn } from '../../../../lib/utils'

// ─────────────────────────────────────────────────────────────────────────────
// PARKED — intentionally not wired to anything.
//
// Suggested-reply chips shown above the composer. Clicking a chip FILLS the
// composer rather than sending, so the candidate can edit before replying.
//
// Nothing drives this today: neither the engine nor Django emits any
// options/choices/quick_replies field, and the candidate question projection in
// `assessments/views/adaptive_interview.py` is a closed whitelist. It was
// originally built against mock data and briefly rendered from a mock set.
//
// Kept because it is the natural home for scaffolding a stuck candidate — e.g.
// angle prompts on a nudge ("talk about tradeoffs", "walk through your
// testing") that suggest a DIRECTION without writing the answer. Note the
// tension to resolve before wiring it: pre-written replies risk anchoring the
// response, which is the signal the interview is trying to score.
//
// To use it: add a field to the engine question schema, promote it through the
// Django whitelist, then render this above <Composer /> in index.jsx.
// ─────────────────────────────────────────────────────────────────────────────
export default function SuggestedRepliesStrip({ sets, onPick }) {
  const [setIndex, setSetIndex] = useState(0)

  if (!sets?.length) return null

  const current = sets[setIndex]

  return (
    <div className="flex flex-col gap-2 rounded-xl bg-surface-raised p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[13px] font-medium text-text-secondary">
          {current.label || 'Suggested replies'}
        </p>
        {sets.length > 1 && (
          <div className="flex items-center gap-1 text-[12px] text-text-faint">
            <button
              type="button"
              onClick={() => setSetIndex((i) => Math.max(0, i - 1))}
              disabled={setIndex === 0}
              className="rounded p-0.5 hover:bg-surface-hover disabled:opacity-30"
              aria-label="Previous suggestions"
            >
              <IconChevronLeft size={14} />
            </button>
            <span>{setIndex + 1} of {sets.length}</span>
            <button
              type="button"
              onClick={() => setSetIndex((i) => Math.min(sets.length - 1, i + 1))}
              disabled={setIndex === sets.length - 1}
              className="rounded p-0.5 hover:bg-surface-hover disabled:opacity-30"
              aria-label="Next suggestions"
            >
              <IconChevronRight size={14} />
            </button>
          </div>
        )}
      </div>
      <div className="flex flex-col gap-1">
        {current.replies.map((reply, i) => (
          <button
            key={i}
            type="button"
            onClick={() => onPick(reply)}
            className={cn(
              'flex items-start gap-2 rounded-md px-2 py-1.5 text-left text-[13px] text-text-primary',
              'transition-colors hover:bg-surface-hover',
            )}
          >
            <span className="mt-0.5 flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded bg-surface-muted text-[11px] font-medium text-text-muted">
              {i + 1}
            </span>
            {reply}
          </button>
        ))}
      </div>
    </div>
  )
}
