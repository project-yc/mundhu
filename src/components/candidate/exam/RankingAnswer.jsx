// ─────────────────────────────────────────────────────────────────────────────
// RankingAnswer — the drag-to-order body.
//
// Every item always holds a position, so the rank chip is the state: it stays
// neutral while the list is still the order it arrived in, and turns ember once
// the candidate has actually placed things — the same "you did this" signal the
// navigator uses.
//
// Dragging is the primary interaction, but it is never the only one. The move
// buttons do the same job for keyboard, touch, and anyone who would rather not
// drag, which also means the control works before the candidate discovers that
// the row is draggable at all.
// ─────────────────────────────────────────────────────────────────────────────

import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  IconChevronDown,
  IconChevronUp,
  IconGripVertical,
} from '@tabler/icons-react'
import { cn } from '../../../lib/utils'

function MoveButton({ direction, disabled, onClick, label }) {
  const Icon = direction === 'up' ? IconChevronUp : IconChevronDown
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={cn(
        'flex h-6 w-6 items-center justify-center rounded-md border border-border text-text-muted',
        'transition-colors duration-150',
        'hover:border-border-strong hover:bg-surface-hover hover:text-text-primary',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand',
        'disabled:pointer-events-none disabled:opacity-30',
      )}
    >
      <Icon size={13} />
    </button>
  )
}

function SortableRow({ option, rank, total, placed, onMove, disabled }) {
  const {
    attributes, listeners, setNodeRef, setActivatorNodeRef,
    transform, transition, isDragging,
  } = useSortable({ id: String(option.id), disabled })

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      // No colour transitions on the row or the chip: these nodes get moved in
      // the DOM on every reorder, and a transition that starts while the node
      // is being re-inserted can stall, leaving the old colour painted.
      className={cn(
        'flex items-center gap-3 rounded-[10px] border bg-surface px-3 py-3',
        isDragging
          ? 'relative z-10 border-brand shadow-lift'
          : 'border-border hover:border-border-strong',
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          'flex h-7 w-7 shrink-0 items-center justify-center rounded-md border font-mono text-[12.5px] font-semibold tabular-nums',
          placed
            ? 'border-transparent bg-ember-pale text-[#3A1D07]'
            : 'border-border-strong bg-surface-muted text-text-secondary',
        )}
      >
        {rank}
      </span>

      <span className="min-w-0 flex-1 text-[14px] leading-[1.6] text-text-primary">
        {option.text}
      </span>

      <div className="flex shrink-0 items-center gap-1">
        <MoveButton
          direction="up"
          disabled={disabled || rank === 1}
          onClick={() => onMove(rank - 1, rank - 2)}
          label={`Move "${option.text}" up to position ${rank - 1}`}
        />
        <MoveButton
          direction="down"
          disabled={disabled || rank === total}
          onClick={() => onMove(rank - 1, rank)}
          label={`Move "${option.text}" down to position ${rank + 1}`}
        />
        <button
          ref={setActivatorNodeRef}
          type="button"
          {...attributes}
          {...listeners}
          disabled={disabled}
          aria-label={`Reorder "${option.text}", currently position ${rank} of ${total}`}
          className={cn(
            'ml-0.5 flex h-6 w-6 cursor-grab items-center justify-center rounded-md text-text-faint',
            'transition-colors duration-150 hover:text-text-secondary active:cursor-grabbing',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand',
            'disabled:pointer-events-none disabled:opacity-30',
          )}
        >
          <IconGripVertical size={15} />
        </button>
      </div>
    </li>
  )
}

/**
 * `order` is the candidate's answer — an array of option ids. It is empty until
 * they place something, which is what lets an untouched list read as
 * unanswered even though every item visibly has a position.
 */
export default function RankingAnswer({ options = [], order = [], onChange, disabled }) {
  const placed = order.length > 0

  const byId = new Map(options.map((option) => [String(option.id), option]))
  const ordered = placed
    ? [
        ...order.map((id) => byId.get(String(id))).filter(Boolean),
        ...options.filter((option) => !order.includes(String(option.id))),
      ]
    : options

  const ids = ordered.map((option) => String(option.id))

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const move = (from, to) => {
    if (to < 0 || to >= ids.length) return
    onChange(arrayMove(ids, from, to))
  }

  const handleDragEnd = ({ active, over }) => {
    if (!over || active.id === over.id) return
    move(ids.indexOf(String(active.id)), ids.indexOf(String(over.id)))
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={ids} strategy={verticalListSortingStrategy}>
        <ol className="flex flex-col gap-2">
          {ordered.map((option, index) => (
            <SortableRow
              key={option.id}
              option={option}
              rank={index + 1}
              total={ordered.length}
              placed={placed}
              onMove={move}
              disabled={disabled}
            />
          ))}
        </ol>
      </SortableContext>
    </DndContext>
  )
}
