// ─────────────────────────────────────────────────────────────────────────────
// OptionCard — one answer choice.
//
// A generous hit target with the control on the left, the way a paper exam
// reads. Single-answer questions get a radio, multi-answer a checkbox, so the
// rule is legible from the control alone before anything is clicked.
// ─────────────────────────────────────────────────────────────────────────────

import { IconCheck } from '@tabler/icons-react'
import { cn } from '../../../lib/utils'

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I']

export default function OptionCard({ index, text, selected, multi, onSelect, disabled }) {
  return (
    <button
      type="button"
      role={multi ? 'checkbox' : 'radio'}
      aria-checked={selected}
      disabled={disabled}
      onClick={onSelect}
      className={cn(
        'group flex w-full items-start gap-3 rounded-[10px] border px-4 py-3.5 text-left',
        'transition-[background-color,border-color] duration-200 ease-out',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-page',
        'disabled:cursor-not-allowed disabled:opacity-50',
        selected
          ? 'border-brand bg-brand-tint'
          : 'border-border bg-surface hover:border-border-strong hover:bg-surface-hover',
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          'mt-[3px] flex h-4 w-4 shrink-0 items-center justify-center border-2',
          'transition-all duration-200 ease-out',
          multi ? 'rounded-[4px]' : 'rounded-full',
          selected
            ? 'border-brand bg-brand text-on-brand'
            : 'border-border-strong bg-transparent text-transparent group-hover:border-text-muted',
        )}
      >
        {multi
          ? <IconCheck size={10} strokeWidth={3.5} />
          : <span className={cn('h-[5px] w-[5px] rounded-full transition-colors', selected ? 'bg-on-brand' : 'bg-transparent')} />}
      </span>

      <span
        className={cn(
          'flex-1 text-[14px] leading-[1.6] transition-colors',
          selected ? 'text-text-primary' : 'text-text-secondary group-hover:text-text-primary',
        )}
      >
        <span className={cn('font-medium', selected ? 'text-brand' : 'text-text-muted')}>
          {LETTERS[index] ?? index + 1})
        </span>{' '}
        {text}
      </span>
    </button>
  )
}
