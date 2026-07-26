// ─────────────────────────────────────────────────────────────────────────────
// ExamButton — the candidate action vocabulary.
//
// Three registers only: `primary` for the action that moves you forward,
// `quiet` for the one that moves you back, `ghost` for everything incidental.
// The ember sweep on `primary` is opt-in via `sweep`, reserved for the single
// terminal action of a screen (submit) so it never becomes ambient noise.
// ─────────────────────────────────────────────────────────────────────────────

import { forwardRef } from 'react'
import { cva } from 'class-variance-authority'
import { cn } from '../../../lib/utils'

const examButtonVariants = cva(
  [
    'relative inline-flex items-center justify-center gap-1.5 overflow-hidden whitespace-nowrap',
    'rounded-lg font-semibold transition-all duration-150 ease-out',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-page',
    'active:scale-[0.97] disabled:pointer-events-none disabled:opacity-40',
  ].join(' '),
  {
    variants: {
      variant: {
        primary: 'bg-brand text-on-brand shadow-ember-tight hover:bg-brand-hover',
        quiet:   'border border-border-strong bg-surface text-text-secondary hover:border-brand-border hover:bg-surface-hover hover:text-text-primary',
        outline: 'border border-border-strong bg-surface-muted text-text-primary hover:border-brand-border hover:bg-surface-hover',
        ghost:   'text-text-muted hover:bg-surface-muted hover:text-text-primary',
        danger:  'bg-error text-white hover:brightness-110',
      },
      size: {
        sm:  'h-8 px-3 text-[12.5px]',
        md:  'h-9 px-4 text-[13px]',
        lg:  'h-10 px-5 text-[13.5px]',
        icon:'h-9 w-9',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  },
)

const ExamButton = forwardRef(
  ({ className, variant, size, sweep = false, loading = false, children, disabled, ...props }, ref) => (
    <button
      ref={ref}
      type="button"
      disabled={disabled || loading}
      className={cn(examButtonVariants({ variant, size }), className)}
      {...props}
    >
      {sweep && !disabled && !loading && (
        <span aria-hidden="true" className="ember-sweep pointer-events-none absolute inset-0" />
      )}
      {loading ? (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent opacity-70" />
      ) : (
        children
      )}
    </button>
  ),
)
ExamButton.displayName = 'ExamButton'

export { ExamButton, examButtonVariants }
export default ExamButton
