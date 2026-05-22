import { IconCoin, IconClock, IconCopy, IconTrash } from '@tabler/icons-react';

/**
 * Shared question card footer — points, override timer, duplicate, delete.
 * Extra children can be passed for type-specific toggles (shuffle, partial credit, etc.)
 */
export function QuestionFooter({
  points, onPointsChange,
  overrideTimer, onOverrideTimerChange,
  onDuplicate, onDelete,
  disabled = false,
  children,
}) {
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-3 bg-surface-muted border-t border-border-default rounded-b-xl">
      {/* Left: pts + timer + extra slots */}
      <div className="flex items-center gap-4 flex-wrap">
        <label className="flex items-center gap-1.5 text-[12px] text-text-secondary">
          <IconCoin size={13} className="text-text-muted" />
          <span>Pts</span>
          <input
            type="number"
            min={0}
            max={9999}
            value={points ?? ''}
            onChange={e => onPointsChange(e.target.value !== '' ? Number(e.target.value) : null)}
            disabled={disabled}
            className="w-14 px-2 py-1 bg-surface border border-border-default rounded text-[12px] text-text-primary focus:outline-none focus:border-brand disabled:opacity-50"
          />
        </label>
        <label className="flex items-center gap-1.5 text-[12px] text-text-secondary">
          <IconClock size={13} className="text-text-muted" />
          <span>Override timer</span>
          <input
            type="number"
            min={1}
            max={480}
            value={overrideTimer ?? ''}
            onChange={e => onOverrideTimerChange(e.target.value ? Number(e.target.value) : null)}
            disabled={disabled}
            placeholder="—"
            className="w-16 px-2 py-1 bg-surface border border-border-default rounded text-[12px] text-text-primary focus:outline-none focus:border-brand disabled:opacity-50"
          />
          <span className="text-text-muted">min</span>
        </label>
        {children}
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-1">
        <button
          onClick={onDuplicate}
          disabled={disabled}
          title="Duplicate"
          className="p-1.5 text-text-muted hover:text-text-primary hover:bg-surface rounded transition-colors disabled:opacity-40"
        >
          <IconCopy size={14} />
        </button>
        <button
          onClick={onDelete}
          title="Delete"
          className="p-1.5 text-text-muted hover:text-error hover:bg-error-bg rounded transition-colors"
        >
          <IconTrash size={14} />
        </button>
      </div>
    </div>
  );
}
