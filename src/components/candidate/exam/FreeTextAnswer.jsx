// ─────────────────────────────────────────────────────────────────────────────
// FreeTextAnswer — the written-response body.
//
// The field is the whole answer, so it gets real room: a tall surface the
// candidate can grow, with the count sitting under it rather than floating
// over the text. A word limit is stated as a budget ("124 / 300 words"), and
// only turns red once it's actually exceeded — counting down at someone while
// they write is the fastest way to make a written question feel hostile.
// ─────────────────────────────────────────────────────────────────────────────

import { cn } from '../../../lib/utils'

export function countWords(text) {
  const trimmed = (text || '').trim()
  return trimmed ? trimmed.split(/\s+/).length : 0
}

export default function FreeTextAnswer({ value = '', onChange, wordLimit, disabled }) {
  const words = countWords(value)
  const overLimit = wordLimit > 0 && words > wordLimit

  return (
    <div className="flex flex-col gap-2.5">
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        rows={10}
        spellCheck
        placeholder="Type your answer here."
        aria-label="Your answer"
        className={cn(
          'w-full resize-y rounded-[10px] border bg-surface px-4 py-3.5',
          'text-[14px] leading-[1.7] text-text-primary placeholder:text-text-faint',
          'transition-colors duration-200',
          'focus:outline-none focus-visible:border-brand focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-page',
          'disabled:cursor-not-allowed disabled:opacity-50',
          overLimit ? 'border-error' : 'border-border hover:border-border-strong',
        )}
      />

      <div className="flex items-center justify-between gap-3">
        <p className={cn('text-[12px]', overLimit ? 'text-error' : 'text-text-muted')}>
          {wordLimit > 0 ? (
            <>
              <span className="font-mono tabular-nums">{words}</span>
              <span className="text-text-faint"> / </span>
              <span className="font-mono tabular-nums">{wordLimit}</span>
              {' words'}
            </>
          ) : (
            <>
              <span className="font-mono tabular-nums">{words}</span>
              {` word${words === 1 ? '' : 's'}`}
            </>
          )}
        </p>

        {overLimit && (
          <p className="text-[12px] text-error">
            {words - wordLimit} over the limit
          </p>
        )}
      </div>
    </div>
  )
}
