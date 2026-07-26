// ─────────────────────────────────────────────────────────────────────────────
// QuestionMap — the question navigator grid.
//
// Three states, each with its own fill so the grid is readable at a glance
// without going back to the legend:
//
//   answered  solid ember, dark numeral   — done, and it looks done
//   current   ember outline               — you are here
//   unvisited dark cell, muted numeral    — not opened yet
//
// "Visited" is tracked rather than inferred, so a question the candidate opened
// and chose to skip doesn't read the same as one they never saw.
// ─────────────────────────────────────────────────────────────────────────────

import { IconCircle, IconCircleCheck, IconCircleDot } from '@tabler/icons-react'
import { cn } from '../../../lib/utils'

function MapCell({ index, answered, visited, current, onJump }) {
  const label = [
    `Question ${index + 1}`,
    answered ? 'answered' : visited ? 'visited, no answer' : 'not opened',
  ].join(', ')

  return (
    <button
      type="button"
      onClick={() => onJump(index)}
      aria-label={label}
      aria-current={current ? 'true' : undefined}
      className={cn(
        'flex h-[34px] w-full items-center justify-center rounded-lg border text-[12.5px] font-semibold tabular-nums',
        'transition-colors duration-200 ease-out',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-chrome',
        answered
          ? 'border-transparent bg-ember-pale text-[#3A1D07] hover:brightness-105'
          : visited
            ? 'border-border-strong bg-surface-muted text-text-secondary hover:border-brand-border hover:text-text-primary'
            : 'border-border bg-surface-muted text-text-muted hover:border-border-strong hover:text-text-secondary',
        current && 'border-brand bg-transparent text-brand',
      )}
    >
      {index + 1}
    </button>
  )
}

const LEGEND = [
  { key: 'current',   Icon: IconCircleDot,   label: 'Current',   className: 'text-brand' },
  { key: 'answered',  Icon: IconCircleCheck, label: 'Answered',  className: 'text-ember-pale' },
  { key: 'unvisited', Icon: IconCircle,      label: 'Unvisited', className: 'text-text-faint' },
]

export function QuestionMapLegend() {
  return (
    <ul className="flex flex-col gap-2">
      {LEGEND.map((entry) => {
        const Icon = entry.Icon
        return (
          <li key={entry.key} className="flex items-center gap-2">
            <Icon size={13} className={entry.className} />
            <span className="text-[12px] text-text-secondary">{entry.label}</span>
          </li>
        )
      })}
    </ul>
  )
}

export default function QuestionMap({
  statuses = [],
  currentIndex,
  onJump,
  columns = 5,
  className = '',
}) {
  return (
    <div
      className={cn('grid gap-1.5', className)}
      style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
    >
      {statuses.map((status, index) => (
        <MapCell
          key={index}
          index={index}
          answered={status.answered}
          visited={status.visited}
          current={index === currentIndex}
          onJump={onJump}
        />
      ))}
    </div>
  )
}
