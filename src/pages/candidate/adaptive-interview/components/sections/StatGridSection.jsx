import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { cn } from '../../../../../lib/utils'
import SectionLabel from './SectionLabel'

const TONE_CLASS = {
  success: 'text-success',
  warning: 'text-warning',
  error: 'text-error',
}

const GAP_PX = 8
// Enough for the longest single WORD in a label plus the card's padding —
// labels wrap rather than ellipse, so this does not have to clear the longest
// whole label ("Checkout Success" needs ~123px of card, which would force every
// four-stat block down to two columns on any rail narrower than the Figma's).
const MIN_CARD_PX = 112

/**
 * How many columns to use, given the width the grid actually got.
 *
 * Two constraints, and the column count was originally hardcoded to 3 and so
 * satisfied neither. Cards must be wide enough to read — the reason for
 * `MIN_CARD_PX` — and the last row must not be a lone orphan beside empty
 * cells, which is what a four-stat block did in a three-column grid. So take
 * the widest layout that fits, then step down to the nearest count that divides
 * the set evenly.
 */
const fitColumns = (width, count) => {
  if (!width || count <= 1) return Math.max(count, 1)
  const fits = Math.max(1, Math.floor((width + GAP_PX) / (MIN_CARD_PX + GAP_PX)))
  const cap = Math.min(fits, count)
  for (let c = cap; c > 1; c -= 1) if (count % c === 0) return c
  return cap
}

export default function StatGridSection({ section }) {
  const stats = Array.isArray(section.stats) ? section.stats : []
  const gridRef = useRef(null)
  // Starts at the full set so the first paint is the widest sensible layout;
  // the measure below narrows it before the frame is shown.
  const [columns, setColumns] = useState(() => Math.min(stats.length || 1, 4))

  const measure = () => {
    const el = gridRef.current
    if (el) setColumns(fitColumns(el.clientWidth, stats.length))
  }

  useLayoutEffect(measure)

  // The rail is `clamp()`-sized and the sheet is a different width again, so
  // the grid cannot assume a width — it has to watch its own.
  useEffect(() => {
    const el = gridRef.current
    if (!el || typeof ResizeObserver === 'undefined') return undefined
    const observer = new ResizeObserver(measure)
    observer.observe(el)
    return () => observer.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stats.length])

  if (!stats.length) return null

  return (
    <section className="flex flex-col gap-2">
      <SectionLabel>{section.label}</SectionLabel>
      <div
        ref={gridRef}
        className="grid gap-2"
        // Inline rather than a `grid-cols-N` class: Tailwind only ships the
        // classes it can see in the source, and this count is measured.
        // `minmax(0, 1fr)` is what lets `truncate` below actually work.
        style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
      >
        {stats.map((stat, i) => (
          <div
            key={stat?.label ?? i}
            className="flex min-w-0 flex-col gap-1 rounded-xl border border-border-subtle bg-surface px-3 py-2.5"
          >
            {/* Wraps, where the value below truncates. A clipped label is a
                stat the candidate cannot identify at all; two short lines cost
                a few pixels of height that the grid row absorbs anyway. */}
            <span className="text-[11.5px] leading-[1.3] text-text-muted">
              {stat?.label}
            </span>
            <span
              className={cn(
                'truncate text-[13px] font-medium leading-[1.3]',
                TONE_CLASS[stat?.tone] || 'text-text-primary',
              )}
              title={String(stat?.value ?? '')}
            >
              {stat?.value}
            </span>
          </div>
        ))}
      </div>
    </section>
  )
}
