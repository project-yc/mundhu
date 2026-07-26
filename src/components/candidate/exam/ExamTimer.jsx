// ─────────────────────────────────────────────────────────────────────────────
// ExamTimer — the clock, always present.
//
// Two modes, one shape:
//   • limited   — counts down, labelled "left"
//   • untimed   — counts up, labelled "elapsed"
//
// A candidate should never have to wonder whether the section is timed, so the
// untimed case shows elapsed time rather than showing nothing at all.
//
// It stays a quiet instrument for most of a section and only changes register
// in the last five minutes. Orange is the brand here, so it can't carry
// urgency — that goes to yellow, then to rose with a slow pulse on the digits.
// ─────────────────────────────────────────────────────────────────────────────

import { IconClockHour4 } from '@tabler/icons-react'
import { cn } from '../../../lib/utils'

export function formatTime(secs) {
  if (secs == null || secs < 0) return '--:--'
  const h = Math.floor(secs / 3600)
  const m = Math.floor((secs % 3600) / 60)
  const s = secs % 60
  const pad = (n) => String(n).padStart(2, '0')
  return h > 0 ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`
}

export default function ExamTimer({ remainingSeconds, elapsedSeconds }) {
  const counting = remainingSeconds != null
  const value = counting ? remainingSeconds : elapsedSeconds

  if (value == null) return null

  const isCritical = counting && remainingSeconds < 60
  const isLow = counting && remainingSeconds < 300

  return (
    <div
      role="timer"
      aria-live="off"
      aria-label={counting
        ? `${formatTime(remainingSeconds)} remaining`
        : `${formatTime(elapsedSeconds)} elapsed`}
      className={cn(
        'flex items-center gap-2 rounded-lg border px-3 py-[7px] transition-colors duration-500',
        isCritical
          ? 'border-error bg-error-bg'
          : isLow
            ? 'border-warning-border bg-warning-bg'
            : 'border-border-strong bg-surface-muted',
      )}
    >
      <IconClockHour4
        size={15}
        className={isCritical ? 'text-error' : isLow ? 'text-warning' : 'text-ember'}
      />

      <span
        className={cn(
          'font-mono text-[15px] font-bold leading-none tabular-nums tracking-tight',
          isCritical ? 'timer-urgent text-error' : isLow ? 'text-warning' : 'text-text-primary',
        )}
      >
        {formatTime(value)}
      </span>

      <span
        className={cn(
          'text-[11px] leading-none',
          isCritical ? 'text-error' : isLow ? 'text-warning' : 'text-text-muted',
        )}
      >
        {counting ? 'left' : 'elapsed'}
      </span>
    </div>
  )
}
